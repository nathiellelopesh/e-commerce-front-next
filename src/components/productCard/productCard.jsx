import Image from 'next/image';
import Button from '../button/button';
import { useCart } from '../../context/cartContext';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/favoriteContext';

const ProductCard = ({ product, setManualMessage }) => {
  const { addToCart } = useCart();
  const { toggleFavorite, checkIsFavorite } = useFavorites();
  const isFavorite = checkIsFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setManualMessage(`Sucesso: "${product.name}" foi adicionado ao carrinho.`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
  };

  return (
    <div className="border rounded-lg shadow-md p-4 w-64 m-4 transition transform hover:scale-105">
      <div className="flex justify-end">
        <Heart 
          className={`
            w-6 h-6 cursor-pointer transition-colors 
            ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          `}
          onClick={handleToggleFavorite}
        />
      </div>
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
          onClick={handleAddToCart}
          className={"cursor-pointer w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200 disabled:bg-purple-400"}
        />
      </div>
    </div>
  );
};

export default ProductCard;