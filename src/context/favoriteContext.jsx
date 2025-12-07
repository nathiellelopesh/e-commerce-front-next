"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = '/api';
const API_FAVORITES_URL = `${API_BASE_URL}/favorites`;
const getAccessToken = () => localStorage.getItem('authToken') || localStorage.getItem('accessToken'); 

const FavoriteContext = createContext(null);

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
    const [favoriteProductIds, setFavoriteProductIds] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = useCallback(() => {
        const token = getAccessToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }, []);

    const fetchFavorites = useCallback(async () => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_FAVORITES_URL, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setFavoriteProductIds([]);
                }
                throw new Error(`Erro ${response.status}: Falha ao buscar favoritos.`);
            }

            const data = await response.json();
            
            const ids = data.map(item => item.product_id);
            setFavoriteProductIds(ids);

        } catch (error) {
            console.error("Erro ao buscar favoritos:", error);
            setFavoriteProductIds([]); 
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]); 

    const toggleFavorite = useCallback(async (productId) => {
        const isCurrentlyFavorite = favoriteProductIds.includes(productId);
        const accessToken = getAccessToken();
        
        if (!accessToken) {
            alert("Erro: Usuário não autenticado. Faça login para favoritar produtos.");
            return false;
        }
        
        try {
            let response;
            
            if (isCurrentlyFavorite) {
                response = await fetch(`${API_FAVORITES_URL}/${productId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                });
                
                if (response.status === 204) { 
                    setFavoriteProductIds(prevIds => prevIds.filter(id => id !== productId));
                } else if (response.status === 404) {
                    setFavoriteProductIds(prevIds => prevIds.filter(id => id !== productId));
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                    throw new Error(errorData.error || `Falha ao remover o produto.`);
                }

            } else {
                response = await fetch(API_FAVORITES_URL, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ product_id: productId }),
                });

                if (response.status === 201 || response.status === 200) { 
                    setFavoriteProductIds(prevIds => [...prevIds, productId]);
                } else {
                    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                    throw new Error(errorData.error || `Falha ao adicionar o produto.`);
                }
            }
            
            return true;
            
        } catch (error) {
            console.error(`Erro ao ${isCurrentlyFavorite ? 'remover' : 'adicionar'} favorito:`, error);
            alert(`Falha ao atualizar favoritos: ${error.message}`);
            return false; 
        }
    }, [favoriteProductIds, getAuthHeaders]);
    
    const checkIsFavorite = useCallback((productId) => favoriteProductIds.includes(productId), [favoriteProductIds]);

    return (
        <FavoriteContext.Provider value={{ favoriteProductIds, loading, toggleFavorite, checkIsFavorite, fetchFavorites }}>
            {children}
        </FavoriteContext.Provider>
    );
};