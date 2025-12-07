
import Image from 'next/image';
import Button from '../button/button';

const ProductCard = ({ product, onDelete }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 w-64 m-4 transition transform hover:scale-105">
      {product.image && (
          <img 
            src={product.image} 
            alt={product.name} 
            width={250} 
            height={250} 
            className="rounded-t-lg object-cover"
        />
      )}
      <div className="mt-2">
        <h3 className="text-lg text-gray-900 font-semibold truncate">{product.name}</h3>
        <p className="text-gray-700 font-bold mt-1">
          R$ {product.price?.toFixed(2) ?? '0.00'}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        
        <Button
          content={"Adicionar ao carrinho"}
          className={"w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200 disabled:bg-purple-400"}
        />
      </div>
    </div>
  );
};

export default ProductCard;