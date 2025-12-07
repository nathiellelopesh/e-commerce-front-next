"use client";
import { ShoppingBag, LogIn, UserPlus } from 'lucide-react';

const animationStyle = {
    animation: 'float 6s ease-in-out infinite',
};

const globalStyle = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
`;

export default function Home() {
  return (
    <>
      <style>{globalStyle}</style> 
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-80 h-70 bg-indigo-600 rounded-full opacity-10 blur-3xl" style={{ transform: 'translate(40%, -40%)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-86 bg-pink-500 rounded-full opacity-10 blur-3xl" style={{ transform: 'translate(-40%, 40%)' }}></div>

        <div className="relative z-10 text-center max-w-4xl space-y-8">
            <ShoppingBag 
                className="mx-auto text-pink-500 w-28 h-28 drop-shadow-lg" 
                style={animationStyle}
                aria-hidden="true"
            />
            
            <h1 className="text-6xl md:text-6xl font-extrabold leading-tight tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">
                O Mundo de Produtos <span className="text-pink-500">Espera Por Você.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                Milhares de itens com a melhor qualidade. Clique e comece a sua jornada de compras agora mesmo!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out cursor-pointer
                  shadow-lg transform hover:scale-[1.03] active:scale-[0.98] 
                  bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 
                  flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                >
                  <UserPlus size={20} /> Criar Minha Conta
                </button>
                
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out cursor-pointer
                    shadow-lg transform hover:scale-[1.03] active:scale-[0.98] 
                    bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 
                    focus:ring-4 focus:ring-white/50 
                    flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                >
                  <LogIn size={20}/>
                  <span>Já Sou Cliente</span>
                </button>
            </div>
        </div>
      </div>
    </>
  );
}
