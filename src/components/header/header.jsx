import { LogOut, Trash2 } from 'lucide-react';

const DashboardHeader = ({ userId, onOpenModal }) => {

  return (
    <header className="w-full bg-white shadow-lg p-4 mb-8 sticky top-0 z-10 rounded-b-xl">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-indigo-700 hidden sm:block">
            Dashboard
          </h1>
          {userId && (
              <span className="text-sm text-gray-500 truncate">
                  <span className="font-mono text-gray-700 text-xs">{userId.substring(0, 8)}...</span>
              </span>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onOpenModal('deactivate')} 
            type="button" 
            className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition duration-150"
            title="Desativar Conta"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className='hidden sm:inline'>Desativar conta</span>
          </button>
          
          <button
            onClick={() => onOpenModal('logout')} 
            type="button"
            className="cursor-pointer flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4 mr-1" />
            <span className='hidden sm:inline'>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
};

export default DashboardHeader;