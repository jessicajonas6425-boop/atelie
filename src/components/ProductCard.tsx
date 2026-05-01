import React from 'react';
import { Product } from '../types';
import { Button } from './ui/Button';
import { ShoppingCart, Edit3 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onCustomize }) => {
  const isCustomizable = product.category.toLowerCase().includes('garrafa') || product.hasComplements;

  return (
    <div className="group vlm-card bg-white border border-slate-900/5 hover:border-slate-900/20 flex flex-col h-full relative overflow-hidden transition-all duration-700" id={`product-${product.id}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F1EE]">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {isCustomizable && (
          <div className="absolute top-6 left-6 bg-slate-900 text-white text-[9px] font-black px-5 py-2.5 uppercase tracking-[0.4em]">
            Personalizável
          </div>
        )}
      </div>
      
      <div className="p-10 flex flex-col flex-1">
        <div className="mb-6">
          <div className="vlm-label">#{product.category}</div>
          <h3 className="text-4xl font-serif text-black mt-4 leading-tight tracking-tight font-black italic">{product.name}</h3>
        </div>
        
        <p className="text-[12px] text-gray-700 mb-10 line-clamp-2 font-sans font-medium uppercase tracking-[0.2em] leading-relaxed italic">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-end pt-10 border-t border-slate-900/5">
          {isCustomizable ? (
            <Button 
              variant="outline" 
              onClick={() => onCustomize?.(product)}
              className="px-8 border-slate-900/10 text-black hover:bg-black hover:text-white"
              id={`customize-btn-${product.id}`}
            >
              COMPRAR
            </Button>
          ) : (
            <Button 
              onClick={() => onAddToCart(product)}
              className="px-10 bg-[#E30613] hover:bg-black"
              id={`add-to-cart-${product.id}`}
            >
              COMPRAR
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
