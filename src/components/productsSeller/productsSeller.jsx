'use client';

import { Edit, Trash2 } from 'lucide-react';

export default function ProductsList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="text-gray-500 p-8 border border-dashed rounded-lg text-center">
        Você ainda não cadastrou nenhum produto. Clique em "Adicionar Produto" para começar!
      </div>
    );
  }

  return (
      <div className="space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="p-4 border rounded-xl bg-white shadow-md flex items-center justify-between transition hover:shadow-lg"
          >
            <div className="flex items-center space-x-4 flex-grow">
              
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={`Imagem de ${product.name}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem Foto
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg text-gray-800 font-semibold truncate max-w-xs">{product.name}</h3>
                <p className="text-indigo-600 font-bold">R$ {product.price ? product.price.toFixed(2) : '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {product.id}</p>
              </div>
            </div>

            <div className="flex space-x-3 flex-shrink-0 ml-4">
              <button
                onClick={() => onEdit(product.id)}
                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Editar ${product.name}`}
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDelete(product.id)}
                className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Excluir ${product.name}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

          </div>
        ))}
      </div>
    
  );
}