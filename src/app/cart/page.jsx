"use client";
import  { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useCart } from '../../context/cartContext.jsx';

const CartPage = ({ onOpenModal }) => {
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [authActionMessage, setAuthActionMessage] = useState('');
    const [manualMessage, setManualMessage] = useState('');

    const { 
        cartItems, 
        isLoading: loading,
        error, 
        fetchCart,
        removeFromCart,
        updateQuantity,
        checkout
    } = useCart();

    useEffect(() => {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedUserId = localStorage.getItem('userId');
            
        if (!storedAccessToken) {
            window.location.href = '/login'; 
            return;
        }
        setAccessToken(storedAccessToken);
        setUserId(storedUserId);
    }, []);

    const handleCheckout = useCallback(async () => {
        if (cartItems.length === 0) {
            setManualMessage('O carrinho está vazio. Adicione produtos antes de finalizar.');
            return;
        }

        setManualMessage('Processando compra...');
        
        const itemsToSell = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
        }));
        
        try {
            const result = await checkout(userId, itemsToSell);

            if (result) {
                setManualMessage('🎉 Compra finalizada com sucesso!');
                fetchCart(); 
            } else {
                setManualMessage('Falha ao finalizar a compra. Verifique o console.');
            }
        } catch (e) {
            setAuthActionMessage(`Erro crítico: ${e.message}`);
        }
    }, [cartItems, checkout, userId, fetchCart]);

    const cartTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cartItems]);

    if (!accessToken || loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Carregando Carrinho...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Erro: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <Link 
                href="/customerDashboard"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-2">
                Seu Carrinho de Compras
            </h1>

            {manualMessage && (
                <div className={`p-3 text-sm rounded-lg mb-4 ${manualMessage.startsWith('Erro') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {manualMessage}
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="text-center mt-16 p-6 bg-white rounded-lg shadow-md">
                    <p className="text-2xl text-gray-600">
                        Seu carrinho está vazio. Adicione alguns produtos!
                    </p>
                    <a href="/customerDashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-semibold">
                        Voltar para a Loja
                    </a>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-3/4 space-y-4">
                        {cartItems.map(item => (
                            <div key={item.product_id} className="flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                                
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-20 h-20 object-cover rounded-md mr-4"
                                />
                                
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-xl font-bold text-blue-600">R$ {(item.price || 0).toFixed(2)}</p>
                                </div>
                                
                                <div className="flex items-center space-x-3 mx-4">
                                    <label htmlFor={`qty-${item.product_id}`} className="sr-only ">Quantidade</label>
                                    <input
                                        id={`qty-${item.product_id}`}
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                        className="w-16 p-2 text-gray-600 border border-gray-300 rounded-lg text-center"
                                    />
                                </div>
                                
                                <div className="w-24 text-right">
                                    <p className="font-bold text-gray-600 text-lg">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.product_id)}
                                    className="ml-4 p-2 text-red-500 hover:text-red-700 transition duration-150"
                                    aria-label={`Remover ${item.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                
                            </div>
                        ))}
                    </div>

                    <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-xl sticky top-4">
                        <h2 className="text-2xl font-bold text-gray-600 mb-4 border-b pb-2">Resumo do Pedido</h2>
                        
                        <div className="flex text-gray-600 justify-between text-lg mb-2">
                            <span>Subtotal ({cartItems.length} itens)</span>
                            <span className="font-semibold text-gray-600">R$ {cartTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-gray-600 text-2xl font-extrabold pt-2 border-t border-dashed">
                            <span>Total</span>
                            <span className="text-green-600 text-gray-600">R$ {cartTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold text-xl hover:bg-blue-700 transition duration-300"
                        >
                            Finalizar Compra
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;