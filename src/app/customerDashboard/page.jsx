"use client";
import ProductCard from '../../components/productCard/productCard.jsx';
import Header from '../../components/header/header.jsx'
import ConfirmationModal from '../../components/confirmationModel/confirmationModel.jsx';
import { useState, useEffect, useCallback, useMemo } from 'react';
import PaginationControls from '../../components/renderPaginationControls/renderPaginationControls.jsx'
import { CartProvider } from '../../context/cartContext.jsx';
import { ShoppingCart, Heart, ShoppingBag } from 'lucide-react';
import Button from '../../components/button/button.jsx';

const API_BASE_URL = '/api';
const API_PRODUCTS_URL = `${API_BASE_URL}/products`;
const API_LOGOUT_URL = `${API_BASE_URL}/users/logout`;
const API_DEACTIVATE_URL = `${API_BASE_URL}/users/deactivate`;

const initialModalState = {
    isOpen: false,
    action: null,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
};

const customerDashboard = () => {
    const [userId, setUserId] = useState(''); 
    const [accessToken, setAccessToken] = useState('');
    const [authActionMessage, setAuthActionMessage] = useState('');
    const [products, setProducts] = useState([]);
    const [modalState, setModalState] = useState(initialModalState);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const PRODUCTS_PER_PAGE = 12;

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedAccessToken = localStorage.getItem('accessToken');
            
        if (storedUserId && storedAccessToken) {
            setUserId(storedUserId);
            setAccessToken(storedAccessToken);
        } else {
            window.location.href = '/login'; 
        }
    }, []);

    const openModal = useCallback((action, productId = null) => {
        if (action === 'logout') {
          setModalState({
            isOpen: true,
            action: 'logout',
            title: 'Confirmar Logout',
            message: 'Tem certeza de que deseja encerrar sua sessão?',
            confirmText: 'Sair',
            isDestructive: false
          });
        } else if (action === 'deactivate') {
          setModalState({
            isOpen: true,
            action: 'deactivate',
            title: 'Desativar Conta',
            message: 'ATENÇÃO: Deseja prosseguir? Essa ação é irreversível.',
            confirmText: 'Desativar',
            isDestructive: true
          });
        }
    }, []);

    const fetchDashboardData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const response = await fetch(API_PRODUCTS_URL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}` 
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha ao carregar dados. Token inválido ou expirado.');
            }
    
            const data = await response.json(); 
            
            if (data) {
              setProducts(data);
            }
    
        } catch (error) {
            setAuthActionMessage(`Erro ao carregar dados: ${error.message}. Faça login novamente.`);
        }
    }, [accessToken]);

    const handleLogout = useCallback(async () => {
        setModalState({ isOpen: false, action: null });
        setAuthActionMessage('Desconectando...');
    
        try {
            const response = await fetch(API_LOGOUT_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}` 
                }
            });
                
            if (!response.ok) {
                console.error("Falha no logout via API (Pode ser ignorado se o token não for invalidado no servidor).");
            }
        } catch (error) {
            console.error(`Erro ao tentar logout na API: ${error.message}`);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
                
            setAuthActionMessage('Logout bem-sucedido. Redirecionando...');
            setUserId('');
            setAccessToken('');
                
            window.location.href = '/login'; 
        }
    }, [accessToken]);
    
      const handleDeactivate = useCallback(async () => {
        setModalState({ isOpen: false, action: null });
        setAuthActionMessage('Desativando conta...');
    
        try {
          const response = await fetch(API_DEACTIVATE_URL, {
              method: 'DELETE', 
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ userId }), 
          });
          
          if (!response.ok) {
            throw new Error("Falha ao desativar a conta.");
          }
    
          setAuthActionMessage('Conta desativada com sucesso. Sessão encerrada.');
          setUserId(null); 
          setAccessToken(null);
          window.location.href = '/login';
    
        } catch (error) {
          setAuthActionMessage(`Erro na Desativação: ${error.message}`);
        } finally {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
    
                setUserId(''); 
                setAccessToken('');
                
                window.location.href = '/login'; 
        }
      }, [userId, accessToken]);
    
    const handleModalConfirm = () => {
        if (modalState.action === 'logout') {
          handleLogout();
        } else if (modalState.action === 'deactivate') {
          handleDeactivate();
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchDashboardData();
        }
    }, [fetchDashboardData, accessToken]);

    const filteredProducts = useMemo(() => {
        if (searchTerm && currentPage !== 1) {
            setCurrentPage(1); 
        }

        if (!searchTerm) {
            return products;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();

        return products.filter(product => 
            product.name && product.name.toLowerCase().includes(lowerCaseSearch)
        );
    }, [products, searchTerm]);

    const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
    const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;

    const displayProducts = filteredProducts;

    const currentProducts = useMemo(() => {
        return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }, [filteredProducts, indexOfFirstProduct, indexOfLastProduct]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo(0, 0);
        }
    };

    if (!accessToken) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Carregando dados do Dashboard...</div>;
    }
    
    if (products.length === 0) {
        return (
            <div className="min-h-screen p-8 pt-20">
                <Header userId={userId} onOpenModal={openModal}/>
                <div className="text-center mt-10">
                    <h1 className="text-3xl font-bold mb-4">Produtos</h1>
                    <p className="text-lg text-gray-600">Nenhum produto cadastrado no momento.</p>
                </div>
            </div>
        );
    }

    const isFilteredListEmpty = filteredProducts.length === 0;

    return (
        <CartProvider>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
                <Header userId={userId} onOpenModal={openModal} /> 
                
                {authActionMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                        <p>{authActionMessage}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-4 mb-8">
                    <Button
                        onClick={() => window.location.href = '/cart'}
                        className="cursor-pointer flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-md"

                        content={
                            <>
                            <ShoppingCart/>
                            <span>Ver Carrinho</span>
                            </>
                        }
                    />

                    <Button
                        onClick={() => window.location.href = '/favorites'}
                        className="cursor-pointer flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-150 shadow-md"

                        content={
                            <>
                            <Heart/>
                            <span>Ver Favoritos</span>
                            </>
                        }
                    />

                    <Button
                        onClick={() => window.location.href = '/purchaseHistory'}
                        className="cursor-pointer flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-150 shadow-md"

                        content={
                            <>
                            <ShoppingBag/>
                            <span>Ver Histórico de compras</span>
                            </>
                        }
                    />
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-2">
                    Descubra Todos os Produtos
                </h1>

                <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
                    <label htmlFor="search" className="block text-lg font-medium text-gray-700 mb-2">
                        Buscar Produtos por Nome
                    </label>
                    <input
                        type="text"
                        id="search"
                        className="w-full text-gray-900 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="Digite o nome do produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {isFilteredListEmpty ? (
                    <div className="text-center mt-10 p-4 border border-gray-300 rounded-lg bg-white shadow">
                        <p className="text-xl text-gray-600">
                            {searchTerm 
                                ? `Nenhum produto encontrado com o nome "${searchTerm}".` 
                                : 'Nenhum produto cadastrado no momento.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6">
                        {currentProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            /> 
                        ))}
                    </div>
                )}
                <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                />

                <ConfirmationModal
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState(initialModalState)}
                    onConfirm={handleModalConfirm}
                    title={modalState.title}
                    message={modalState.message}
                    confirmText={modalState.confirmText}
                    isDestructive={modalState.isDestructive}
                />
            </div>
        </CartProvider>
    );
};

export default customerDashboard;