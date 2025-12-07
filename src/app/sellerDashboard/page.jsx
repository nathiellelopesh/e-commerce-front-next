"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Package, DollarSign, BarChart2, TrendingUp, CirclePlus } from 'lucide-react';
import Button from '../../components/button/button.jsx'
import Header from '../../components/header/header.jsx'
import MetricCard from '../../components/metricCard/metricCard.jsx';
import ConfirmationModal from '../../components/confirmationModel/confirmationModel.jsx';
import ProductsList from '../../components/productsSeller/productsSeller.jsx';

const API_BASE_URL = '/api';
const API_PRODUCTS_URL = `${API_BASE_URL}/products`;
const API_LOGOUT_URL = `${API_BASE_URL}/users/logout`;
const API_DEACTIVATE_URL = `${API_BASE_URL}/users/deactivate`;
const API_METRICS_URL = `${API_BASE_URL}/metrics`;

const initialModalState = {
    isOpen: false,
    action: null, // 'logout', 'deactivate' ou 'deleteProduct'
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    productId: null
};

const SellerDashboard = () => {
  const [userId, setUserId] = useState(''); 
  const [accessToken, setAccessToken] = useState('');
  const [authActionMessage, setAuthActionMessage] = useState('');
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: null, // 'logout', 'deactivate' ou  'deleteProduct'
    message: '',
    confirmText: '',
    productId: null
  });

  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    bestSellingProduct: '',
  });

  const [products, setProducts] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

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
    } else if (action === 'deleteProduct' && productId) {
      const productToDelete = products.find(p => p.id === productId);
      const productName = productToDelete ? productToDelete.name : 'este produto';

      setModalState({
        isOpen: true,
        action: 'deleteProduct',
        title: 'Excluir Produto',
        message: `Tem certeza que deseja excluir permanentemente o produto "${productName}"?`,
        confirmText: 'Excluir',
        isDestructive: true,
        productId: productId
        });
    }
  }, [products]);

  const fetchMetrics = useCallback(async () => {
          if (!accessToken) return;
          try {
              const response = await fetch(API_METRICS_URL, {
                  headers: {
                      'Authorization': `Bearer ${accessToken}` 
                  }
              });
              if (!response.ok) {
                  throw new Error('Falha ao carregar dados. Token inválido ou expirado.');
              }
      
              const data = await response.json();
              console.log(data)
              
              setDashboardData({
                  totalSales: data.productsBySeller.reduce((sum, seller) => sum + seller.total_sold, 0),
                  totalRevenue: data.totalRevenue,
                  totalProducts: products.length,
                  bestSellingProduct: data.bestSeller ? data.bestSeller.product_name : 'N/A',
              });
              console.log(dashboardData)

          } catch (error) {
              setAuthActionMessage(`Erro ao carregar dados: ${error.message}. Faça login novamente.`);
          }
  }, [accessToken])

  const fetchDashboardData = useCallback(async () => {
    setLoadingMetrics(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/inventory`, {
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
    } finally {
        setLoadingMetrics(false);
    }
  }, [accessToken]);

  const handleConfirmDeleteProduct = useCallback(async (productId) => {
          setModalState(initialModalState);
          setAuthActionMessage('Excluindo produto...');
  
          try {
              const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${accessToken}`
                  },
              });
  
              if (response.status === 204) {
                  setAuthActionMessage('Produto excluído com sucesso!');
                  setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
              } else if (response.status === 403) {
                  throw new Error('Acesso negado. Apenas o vendedor criador pode excluir este produto.');
              } else {
                  throw new Error(`Falha ao excluir produto. Status: ${response.status}`);
              }
              
          } catch (error) {
              setAuthActionMessage(`Erro ao excluir produto: ${error.message}`);
          }
      }, [accessToken]);
  
      const handleDeleteProduct = useCallback((productId) => {
          openModal('deleteProduct', productId);
      }, [openModal]);

    const handleEditProduct = useCallback((productId) => {
        window.location.href = `/updateProduct/${productId}`;
    }, []);

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
    } else if (modalState.action === 'deleteProduct' && modalState.productId) {
      handleConfirmDeleteProduct(modalState.productId);
    }
  };

  useEffect(() => {
    if (!userId) {
      return; 
    }
    fetchDashboardData();
    fetchMetrics();
  }, [fetchDashboardData, fetchMetrics, userId]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
  }, []);


  if (!isClient) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Carregando...</p></div>;
  }

  if (!userId && window.location.pathname !== '/login') { 
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                 <div className="text-center p-8">
                      <h1 className="text-xl font-bold">Acesso Negado</h1>
                      <p>Por favor, <a href="/login" className="text-indigo-600 underline">faça login</a> para acessar o Dashboard.</p>
                 </div>
            </div>
        );
    }

  return (
    <>
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <Header
            userId={userId} 
            onOpenModal={openModal} 
        />

      {authActionMessage && (
            <div className={`p-4 mb-4 text-sm rounded-lg ${authActionMessage.startsWith('Erro') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {authActionMessage}
            </div>
      )}
      <div className="flex justify-end space-x-4 mb-8">
        <Button
          onClick={() => window.location.href = '/createProduct'}
          className="cursor-pointer flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-md"
          content={
            <>
              <CirclePlus/>
              <span>Adicionar Produto</span>
            </>
          }
        />

      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Métricas Principais</h2>
        {!dashboardData ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">Carregando métricas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              icon={DollarSign} 
              title="Faturamento Total" 
              value={`R$ ${dashboardData.totalRevenue ? dashboardData.totalRevenue.toFixed(2) : '0.00'}`} 
              color="green" 
            />
            <MetricCard 
              icon={BarChart2} 
              title="Total de Vendas" 
              value={dashboardData.totalSales} 
              color="blue" 
            />
            <MetricCard 
              icon={Package} 
              title="Produtos Cadastrados" 
              value={products.length.toString()} 
              color="indigo" 
            />
            <MetricCard 
              icon={TrendingUp} 
              title="Produto Mais Vendido" 
              value={dashboardData.bestSellingProduct} 
              color="yellow" 
            />
          </div>
        )}
      </section>

      <section>
        <ProductsList
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </section>

      {modalState.isOpen && (
        <ConfirmationModal
            isOpen={modalState.isOpen}
            onClose={() => setModalState(initialModalState)}
            //onClose={() => setModalState({ ...prev, isOpen: false, action: null, productId: null })}
            onConfirm={handleModalConfirm}
            title={modalState.title}
            message={modalState.message}
            confirmText={modalState.confirmText}
            isDestructive={modalState.isDestructive}
            onCancel={() => setModalState(initialModalState)}
            //onCancel={() => setModalState({ ...prev, isOpen: false, action: null, productId: null })}
        />
      )}

      <footer className="mt-12 text-center text-xs text-gray-500">
        <p>A interface de gerenciamento de produtos (rotas protegidas) deve ser implementada no seu backend Node.js.</p>
      </footer>
    </div>
    </>
  );
};

export default SellerDashboard;