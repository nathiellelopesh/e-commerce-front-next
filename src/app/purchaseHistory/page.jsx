"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShoppingBag } from 'lucide-react';

const API_BASE_URL = '/api';
const API_ORDERS_URL = `${API_BASE_URL}/sales`;

const PurchaseHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedAccessToken = localStorage.getItem('accessToken');
            
        if (storedUserId && storedAccessToken) {
            setUserId(storedUserId);
            setAccessToken(storedAccessToken);
        } else {
            setLoading(false);
            setError("Usuário não autenticado. Por favor, faça login.");
        }
    }, []);

    const fetchPurchaseHistory = useCallback(async () => {
        if (!accessToken) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_ORDERS_URL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha ao carregar histórico: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(data)
            const mappedOrders = data.map(sale => ({
                id: sale.id || '',
                total: sale.totalAmount || 0, 
                date: sale.saleDate || '', 
                status: sale.status || '',
                items: sale.sale_items.map(item => {
                    
                    return {
                        name: item.product.name || 'Produto Desconhecido', 
                        price: item.unit_price_at_sale || 0,
                        quantity: item.quantity || 0
                    };
    })
            }));

            setOrders(mappedOrders);

        } catch (err) {
            console.error("Erro ao buscar histórico:", err);
            setError(`Erro ao carregar o histórico de compras: ${err.message}.`);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [accessToken, userId]);

    useEffect(() => {
        if (accessToken) {
            fetchPurchaseHistory();
        }
    }, [fetchPurchaseHistory, accessToken]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Carregando Histórico de Compras...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 sm:p-8">
                <div className="mt-10 p-6 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p className="font-bold">Erro ao Acessar Histórico:</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8"> 
            <Link 
                href="/customerDashboard"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar
            </Link>

            <div className="flex items-center space-x-4 mb-8 pt-4 border-b border-gray-300 pb-4">
                <ShoppingBag className="w-8 h-8 text-indigo-600" />
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Histórico de Compras
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center mt-10 p-10 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-lg">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 font-semibold mb-4">
                        Você ainda não realizou nenhuma compra.
                    </p>
                    <p className="text-gray-500">
                        Explore nossos produtos e faça seu primeiro pedido!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <OrderCard key={order.id || index} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchaseHistoryPage;

const OrderCard = ({ order }) => {
    const formattedDate = new Date(order.date).toLocaleDateString('pt-BR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL' 
    }).format(order.total);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
            <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Pedido #{order.id}</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${order.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                </span>
            </div>
            
            <p className="text-gray-600 mb-2">
                <span className="font-medium">Data da Compra:</span> {formattedDate}
            </p>
            <p className="text-gray-700 text-lg font-bold mb-4">
                <span className="font-medium">Total:</span> {formattedTotal}
            </p>

            <h3 className="text-md font-semibold text-gray-700 mt-4 mb-2">Itens:</h3>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                {order.items && order.items.map((item, index) => (
                    <li key={index} className="text-gray-500">
                        
                        {item.quantity}x {item.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)})
                    </li>
                ))}
            </ul>
        </div>
    );
};