"use client";

import { useState, useEffect, useCallback } from 'react';
import { Shield, Mail, Lock, User, Store } from 'lucide-react';

const API_REGISTER_URL = '/api/users/register';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('')
  const [role, setRole] = useState('client'); // 'client' || 'seller'
  
  const [isAuthReady, setIsAuthReady] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (message) {
        const timer = setTimeout(() => {
            setMessage('');
            setIsError(false);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [message]);

  const handleRegistration = useCallback(async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    if (password.length < 6) {
        setMessage('A senha deve ter no mínimo 6 caracteres.');
        setIsError(true);
        setLoading(false);
        return;
    }

    const isSeller = role === 'seller';

    try {
        const response = await fetch(API_REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password,
                name,
                is_seller: isSeller
            }),
        });

        const responseData = await response.json();

        if (response.ok) {
            setMessage(responseData.message || 'Registro realizado com sucesso!');
            setEmail('');
            setPassword('');
            setRole('client');
            if (role === 'seller') {
              window.location.href = '/sellerDashboard';
            } else {
              window.location.href = '/customerDashboard';
            }
        } else {
            setMessage(responseData.message || 'Falha no registro. Tente novamente.');
            setIsError(true);
        }

    } catch (error) {
        console.error('Erro de rede/conexão:', error);
        setMessage('Erro de conexão com o servidor. Tente novamente mais tarde.');
        setIsError(true);
    } finally {
        setLoading(false);
    }
  }, [email, password, role]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 space-y-6">
        
        <div className="flex flex-col items-center">
          <Shield className="w-12 h-12 text-indigo-600 mb-2" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Criar Nova Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Registre-se como Cliente ou Vendedor.
          </p>
        </div>

        {message && (
          <div className={`p-3 text-sm rounded-lg ${isError ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
            {message}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleRegistration}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha (mín. 6 caracteres)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block text-gray-900 w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Maria"
              />
            </div>
          </div>

          <fieldset className="pt-2">
            <legend className="block text-sm font-medium text-gray-700">
              Você está se registrando como:
            </legend>
            <div className="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
              
              <div className="flex items-center">
                <input
                  id="role-client"
                  name="role"
                  type="radio"
                  value="client"
                  checked={role === 'client'}
                  onChange={() => setRole('client')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="role-client" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <User className="h-4 w-4 mr-2" /> Cliente
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="role-seller"
                  name="role"
                  type="radio"
                  value="seller"
                  checked={role === 'seller'}
                  onChange={() => setRole('seller')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="role-seller" className="ml-3 flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                  <Store className="h-4 w-4 mr-2" /> Vendedor
                </label>
              </div>
            </div>
          </fieldset>
          
          <div>
            <button
              type="submit"
              disabled={loading || !isAuthReady}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Registrar'}
            </button>
          </div>
          
        </form>
        
      </div>
    </div>
  );
};

export default Register;