"use client";

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

const CartContext = createContext();

const API_BASE_URL = '/api';
const API_CART_URL = `${API_BASE_URL}/cart`;
const API_PRODUCTS_URL = `${API_BASE_URL}/products`;
const API_SALES_URL = `${API_BASE_URL}/sales`;
const getAccessToken = () => localStorage.getItem('accessToken');

const fetchProductDetails = async (productId) => {
    const token = getAccessToken();
    if (!token) return { name: 'Produto Desconhecido', price: 0, image: '' };

    try {
        const productResponse = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!productResponse.ok) {
            return { name: 'Produto Indisponível', price: 0, image: '' };
        }
        return productResponse.json();
    } catch (e) {
        console.error(`Falha ao buscar detalhes do produto ${productId}:`, e);
        return { name: 'Erro de Rede', price: 0, image: '' };
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]); 
    const [loadingCart, setLoadingCart] = useState(true);
    const [cartError, setCartError] = useState(null);
    
    const updateQuantity = useCallback(async (productId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (isNaN(quantity) || quantity < 1) return;

        const accessToken = getAccessToken();
        if (!accessToken) {
            alert("Erro: Usuário não autenticado. Faça login novamente.");
            return;
        }

        try {
            const response = await fetch(`${API_CART_URL}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) {
                 const data = await response.json();
                 throw new Error(data.message || "Falha ao atualizar a quantidade.");
            }

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.product_id === productId ? { ...item, quantity } : item
                )
            );
            
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
            alert(`Erro ao atualizar quantidade: ${error.message}`);
        }
    }, []);

    const fetchCart = useCallback(async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            setLoadingCart(false);
            return;
        }

        setLoadingCart(true);
        setCartError(null);

        try {
            const response = await fetch(API_CART_URL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar o carrinho do servidor.');
            }

            const cartData = await response.json();
            const rawItems = cartData.items || [];

            const detailedItemsPromises = rawItems.map(async (item) => {
                const productDetails = await fetchProductDetails(item.product_id);
                
                return {
                    ...item, // Mantém os ids
                    name: productDetails.name,
                    price: productDetails.price,
                    image: productDetails.image,
                };
            });

            const detailedItems = await Promise.all(detailedItemsPromises);
            setCartItems(detailedItems);

        } catch (error) {
            console.error("Erro ao buscar carrinho:", error);
            setCartError('Não foi possível carregar seu carrinho.');
        } finally {
            setLoadingCart(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = useCallback(async (product, quantity = 1) => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            alert("Erro: Usuário não autenticado. Faça login novamente.");
            return;
        }

        try {
            const response = await fetch(API_CART_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ 
                    product_id: product.id, 
                    quantity,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Falha ao adicionar o produto no servidor.");
            }
            
            setCartItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(item => item.product_id === product.id);

                if (existingItemIndex > -1) {
                    const newItems = [...prevItems];
                    newItems[existingItemIndex].quantity += quantity;
                    return newItems;
                } else {
                    return [...prevItems, { 
                        product_id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: quantity, 
                    }];
                }
            });

        } catch (error) {
            console.error("Erro ao adicionar ao carrinho:", error);
            alert(`Erro ao adicionar ao carrinho: ${error.message}`);
        }
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        if (!productId) {
            console.error("ID do produto é obrigatório para remover.");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error("Usuário não autenticado.");
            }

            const response = await fetch(`http://localhost:3000/api/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                fetchCart(); 
            } else if (response.status === 404) {
                console.warn("Item não encontrado no servidor, atualizando carrinho localmente.");
                fetchCart();
            } else {
                throw new Error('Falha ao remover o produto no servidor.');
            }
        } catch (error) {
            console.error("Erro ao remover do carrinho:", error);
        }
    }, [fetchCart]);

    const checkout = useCallback(async (customerId, items) => {
        const accessToken = getAccessToken();
        
        if (!accessToken || !customerId) {
            alert("Erro de autenticação para checkout.");
            return null;
        }

        if (items.length === 0) {
            alert("Carrinho vazio.");
            return null;
        }

        try {
            const response = await fetch(API_SALES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ items }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error("Erro do servidor no Checkout:", responseData);
                throw new Error(responseData.error || `Falha no checkout (Status: ${response.status}).`);
            }

            fetchCart(); 

            return responseData;

        } catch (error) {
            console.error("Erro durante a requisição de checkout:", error);
            throw error;
        }
    }, [fetchCart]);

    const value = useMemo(() => ({
        cartItems,
        isLoading: loadingCart, 
        error: cartError,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout
    }), [cartItems, loadingCart, cartError, fetchCart, addToCart, removeFromCart, updateQuantity, checkout]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};