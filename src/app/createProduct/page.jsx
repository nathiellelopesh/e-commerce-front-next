"use client"; 

import Button from '../../components/button/button.jsx'
import { useState, useRef, useCallback } from 'react';
import { Send, Upload } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const CreateProduct = ({fetchDashboardData}) => {
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: ''
    });
    
    // Upload de CSV
    const [csvFile, setCsvFile] = useState(null);
    const [csvUploadMessage, setCsvUploadMessage] = useState('');
    const [manualMessage, setManualMessage] = useState('');

    const csvFileInputRef = useRef(null);

    const handleManualSubmit = useCallback(async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setManualMessage('Erro: Não autorizado. Por favor, faça login novamente.');
            return;
        }
        
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({...newProduct, price: parseFloat(newProduct.price)}),
        });
        if (response.ok) {
            setManualMessage('Sucesso: Produto cadastrado com sucesso!');
            setNewProduct({
                name: '',
                price: '',
                description: '',
                image: '',
                stock: 0
            });
        } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const errorMessage = errorData.message || 'Falha desconhecida. Verifique o console ou o servidor.';
            setManualMessage(`Erro: Falha ao cadastrar o produto. Detalhe: ${errorMessage}`);
        }

        if (fetchDashboardData) { 
            fetchDashboardData();
        }

    }, [newProduct, fetchDashboardData]);

    const handleCsvUpload = useCallback(async (e) => {
        e.preventDefault();
        setCsvUploadMessage('Processando upload do arquivo CSV...');

        const token = localStorage.getItem('accessToken');

        if (!token) {
            setCsvUploadMessage('Erro: Não autorizado. Por favor, faça login novamente.');
            return;
        }

        if (!csvFile) {
            setCsvUploadMessage('Erro: Por favor, selecione um arquivo CSV para upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile); 

        try {
            const response = await fetch('/api/products/upload-csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            let responseData = {};
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json().catch(() => ({}));
            }
            
            if (response.ok) {
                const successMessage = responseData.message || 'Produtos do CSV carregados com sucesso!';
                setCsvUploadMessage(`Sucesso: ${successMessage}`);
                
                setCsvFile(null);
                if (csvFileInputRef.current) {
                    csvFileInputRef.current.value = "";
                }

                if (fetchDashboardData) {
                    setTimeout(fetchDashboardData, 500); 
                }
            } else {
                const errorMessage = responseData.message || `Erro ${response.status} (${response.statusText}). Verifique o formato do arquivo.`;
                setCsvUploadMessage(`Erro: Falha no upload: ${errorMessage}`);
            }

        } catch (error) {
           setCsvUploadMessage(`Erro de conexão: ${error.message}. Verifique sua rede e tente novamente.`);
        }

    }, [csvFile, fetchDashboardData]);
    
    const handleInputChange = (e) => {
        setNewProduct({
            ...newProduct,
            [e.target.name]: e.target.value,
        });
    };

      return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
          <Link 
            href="/sellerDashboard"
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Link>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-indigo-500" />
              Cadastro Manual de Produto
            </h2>
            
            {manualMessage && (
              <div className={`p-3 text-sm rounded-lg mb-4 ${manualMessage.startsWith('Erro') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {manualMessage}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input 
                type="text" 
                name="name"
                placeholder="Nome do Produto"
                value={newProduct.name}
                onChange={handleInputChange}
                className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              
              <input 
                type="number" 
                name="price"
                placeholder="Preço (R$)"
                value={newProduct.price}
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
                value={newProduct.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />

              <textarea
                name="description"
                placeholder="Descrição detalhada do produto"
                value={newProduct.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>

              <input 
                type="url" 
                name="image"
                placeholder="URL da Imagem (Ex: https://...)"
                value={newProduct.image}
                onChange={handleInputChange}
                className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />

              <Button
                  content={"Cadastrar Produto"}
                  className={'w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200'}
              />
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-purple-500" />
              Upload em Massa (CSV)
            </h2>
            
            {csvUploadMessage && (
              <div className={`p-3 text-sm rounded-lg mb-4 ${csvUploadMessage.startsWith('Erro') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {csvUploadMessage}
              </div>
            )}

            <form onSubmit={handleCsvUpload} className="space-y-4">
              <p className="text-sm text-gray-600 mb-3">
                  O arquivo deve conter as informações: nome, descrição, preço, estoque e url da imagem (sem cabeçalho).
              </p>
              <label className="block">
                <span className="sr-only">Escolher arquivo CSV</span>
                <input 
                  type="file" 
                  accept=".csv"
                  ref={csvFileInputRef}
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100
                  "
                  required
                />
              </label>

              <Button
                  content={"Carregar produtos por arquivo CSV"}
                  className={"w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200 disabled:bg-purple-400"}
                  disabled={!csvFile}
              />
            </form>
          </div>
          </section>
        </div>
      )
}

export default CreateProduct;