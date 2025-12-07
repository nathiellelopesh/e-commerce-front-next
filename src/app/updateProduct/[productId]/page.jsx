"use client"; 

import Button from '../../../components/button/button.jsx'
import { useState, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const API_BASE_URL = '/api';
const API_PRODUCTS_URL = `${API_BASE_URL}/products`;

const UpdateProduct = () => {
    const router = useRouter();
    const params = useParams();
    // Extrai o productId da URL
    const productId = params.productId;

    const [accessToken, setAccessToken] = useState('');
    
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: ''
    });

    const [manualMessage, setManualMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAccessToken = localStorage.getItem('accessToken');
        if (storedAccessToken) {
            setAccessToken(storedAccessToken);
        } else {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        if (!productId || !accessToken) return;

        console.log('ID do Produto Sendo Buscado:', productId);

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                console.log('Status da Resposta:', response.status);
                
                if (!response.ok) {
                    const errorData = response.status === 404 ? 
                        { message: 'Produto não encontrado (404).' } : 
                        await response.json(); 

                    throw new Error(errorData.message || `Falha ao carregar dados do produto. Status: ${response.status}`);
                }
                
                const data = await response.json();
                setProductData({
                    name: data.name || '',
                    price: data.price ? String(data.price) : '',
                    description: data.description || '',
                    image: data.image || '',
                    stock: data.stock ? String(data.stock) : ''
                });
            } catch (error) {
                setManualMessage(`Erro: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, accessToken]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUpdateSubmit = useCallback(async (e) => {
        e.preventDefault();
        setManualMessage('Atualizando produto...');

        try {
            const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: productData.name,
                    price: parseFloat(productData.price),
                    description: productData.description,
                    image: productData.image,
                    stock: parseInt(productData.stock)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o produto.');
            }

            setManualMessage('Produto atualizado com sucesso!');

        } catch (error) {
            setManualMessage(`Erro ao atualizar: ${error.message}`);
        }
    }, [productData, accessToken, productId]);

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Carregando dados do produto...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-xl md:max-w-2xl"> 
                <Link 
                    href="/sellerDashboard"
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar ao Dashboard
                </Link>

                <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <Send className="w-6 h-6 mr-3 text-indigo-500" />
                        Editar Produto (ID: {productId})
                    </h2>

                    {manualMessage && (
                        <div className={`p-3 text-sm rounded-lg mb-4 ${manualMessage.startsWith('Erro') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {manualMessage}
                        </div>
                    )}

                    <form onSubmit={handleUpdateSubmit} className="space-y-5">
                        <input 
                            type="text" 
                            name="name"
                            placeholder="Nome do Produto"
                            value={productData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />

                       <input 
                          type="number" 
                          name="price"
                          placeholder="Preço (R$)"
                          value={productData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full p-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                          required
                       />

                       <input 
                          type="number" 
                          name="stock"
                          placeholder="Estoque"
                          value={productData.stock}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full p-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                       />

                       <textarea
                          name="description"
                          placeholder="Descrição detalhada do produto"
                          value={productData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                       ></textarea>

                       <input 
                          type="url" 
                          name="image"
                          placeholder="URL da Imagem (Ex: https://...)"
                          value={productData.image}
                          onChange={handleInputChange}
                          className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                       />

                       <Button
                           content={"Atualizar Produto"}
                           className={'w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200'}
                       />
                    </form>
                 </div>
            </div>
        </div>
    );
};

export default UpdateProduct;