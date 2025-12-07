"use client";

import { useState, useEffect, useCallback } from 'react';
import { LogIn, Mail, Lock, LogOut } from 'lucide-react';

const API_LOGIN_URL = '/api/users/login';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedAccessToken = localStorage.getItem('accessToken');
        
        if (storedUserId && storedAccessToken) {
            setUserId(storedUserId);
            setAccessToken(storedAccessToken);
            window.location.href = '/sellerDashboard';
        }
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(API_LOGIN_URL, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas ou erro no servidor.");
      }

      const { access_token, user_id, is_seller } = data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('userId', user_id);

      setUserId(user_id);
      setAccessToken(access_token);
      
      setMessage('Login realizado com sucesso! Redirecionando para o Dashboard...');
      setIsError(false);

      console.log(data)
      
      if (is_seller) {
        window.location.href = '/sellerDashboard';
      } else {
        window.location.href = '/customerDashboard';
      }
      

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : "Erro desconhecido no login.";
      setMessage(errorMessage);
      setIsError(true);
      setUserId(null); 
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleLogout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        
        setUserId(null);
        setAccessToken(null);
        setMessage('Logout realizado com sucesso.');
        setIsError(false);
        
        window.location.href = '/login';
  }, []);

  const isAuthReady = true;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 space-y-6">
        
        <div className="flex flex-col items-center">
          <LogIn className="w-12 h-12 text-green-600 mb-2" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Acessar Sua Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Use seu e-mail e senha cadastrados.
          </p>
        </div>

        {message && (
          <div className={`p-3 text-sm rounded-lg ${isError ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
            {message}
          </div>
        )}
        
        <form className="space-y-4" onSubmit={handleLogin}>
          
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
                className="block w-full text-gray-900 pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="seu.email@exemplo.com"
                disabled={!!userId}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full text-gray-900 pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="••••••••"
                disabled={!!userId}
              />
            </div>
          </div>
          
          <div className="pt-2">
            {!userId ? (
              <button
                type="submit"
                disabled={loading || !isAuthReady}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out disabled:bg-green-400"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Entrar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
              >
                Sair (Logout)
              </button>
            )}
            
          </div>
          
        </form>

        <p className="mt-4 text-center text-sm text-gray-900">
            Não tem uma conta? 
            <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                {' '}Registre-se aqui
            </span>
        </p>
        
      </div>
    </div>
  );
};

export default Login;