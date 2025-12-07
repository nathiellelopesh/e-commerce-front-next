"use client";
import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../components/productCard/productCard';
import { useFavorites } from '../../context/favoriteContext';
import { CartProvider } from '../../context/cartContext';
import { Heart } from 'lucide-react';
import Button from '../../components/button/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const API_BASE_URL = '/api';
const API_PRODUCTS_URL = `${API_BASE_URL}/products`;

const FavoritesPage = () => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [authActionMessage, setAuthActionMessage] = useState('');
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const { favoriteProductIds, loading: loadingFavoritesContext } = useFavorites();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedAccessToken = localStorage.getItem('accessToken');
            
        if (storedUserId && storedAccessToken) {
            setUserId(storedUserId);
            setAccessToken(storedAccessToken);
        }
    }, []);

    const fetchFavoriteProducts = useCallback(async () => {
        if (!accessToken) {
            setLoadingProducts(false);
            return;
        }

        if (loadingFavoritesContext) return
        setLoadingProducts(true);

        if (favoriteProductIds == null || favoriteProductIds.length === 0) {
            setProducts([]);
            setLoadingProducts(false);
            return;
        }

        try {
            const response_details = await fetch(API_PRODUCTS_URL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}` 
                }
            });
            
            if (!response_details.ok) {
                throw new Error('Falha ao carregar detalhes dos produtos.');
            }
            
            const product_details = await response_details.json();
            console.log(product_details)
            const favoriteIdSet = new Set(favoriteProductIds);
            
            const filteredProducts = product_details.filter(product => 
                favoriteIdSet.has(product.id)
            );

            console.log(filteredProducts)
            setProducts(filteredProducts);

        } catch (error) {
            setAuthActionMessage(`Erro ao carregar produtos: ${error.message}.`);
        } finally {
            setLoadingProducts(false);
        }
    }, [accessToken, favoriteProductIds, loadingFavoritesContext]);

    useEffect(() => {
        if (accessToken) {
            fetchFavoriteProducts();
        } else {
            setLoadingProducts(false);
        }
    }, [fetchFavoriteProducts, accessToken]);

    if (loadingProducts || loadingFavoritesContext) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Carregando seus Favoritos...</div>;
    }

    return (
        <CartProvider>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
                
                <Link 
                    href="/customerDashboard"
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar
                </Link>

                <div className="flex items-center space-x-4 mb-8 pt-4">
                    <Heart className="w-8 h-8 text-red-500" />
                    <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-2">
                        Meus Produtos Favoritos
                    </h1>
                </div>

                {authActionMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                        <p>{authActionMessage}</p>
                    </div>
                )}
                
                {products.length === 0 ? (
                    <div className="text-center mt-10 p-10 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-lg">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 font-semibold mb-4">
                            Você ainda não tem produtos favoritos.
                        </p>
                        <p className="text-gray-500 mb-6">
                            Adicione itens ao seu coração na página de produtos para vê-los aqui!
                        </p>
                        <Button
                            content="Explorar Produtos"
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200"
                        />
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            /> 
                        ))}
                    </div>
                )}
                
                
            </div>
        </CartProvider>
    );
};

export default FavoritesPage;