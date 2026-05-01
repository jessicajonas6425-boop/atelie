import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Product } from '../types';
import { Check } from 'lucide-react';

interface SimplePersonalizerProps {
  product: Product;
  onSave: (name: string, hasComplement: boolean, complementDescription?: string) => void;
  onCancel: () => void;
}

export const SimplePersonalizer: React.FC<SimplePersonalizerProps> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [hasComplement, setHasComplement] = useState(false);
  const [complementDescription, setComplementDescription] = useState('');

  return (
    <div className="bg-white p-8 md:p-12 border border-slate-900/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E30613]"></div>
      
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-[3/4] bg-slate-50 relative overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl font-serif font-black italic text-black/20 uppercase rotate-[-20deg]">
              {name || 'Seu Nome'}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-12">
          <div>
            <div className="vlm-label">Personalização.</div>
            <h2 className="text-5xl font-serif italic font-black text-black leading-none mt-4">{product.name}</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-4">Nome para Gravação</label>
              <input 
                type="text"
                placeholder="EX: JOÃO SILVA"
                className="vlm-input w-full text-2xl font-serif italic text-black"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
              <p className="text-[10px] text-slate-400 mt-3 italic font-medium uppercase tracking-widest">Incluso no valor base da peça.</p>
            </div>

            <div className="bg-slate-50 p-6 border border-slate-900/5 space-y-6">
              <button 
                type="button"
                onClick={() => setHasComplement(!hasComplement)}
                className="flex items-center gap-6 w-full text-left group"
              >
                <div className={`w-8 h-8 border-2 flex items-center justify-center transition-all ${hasComplement ? 'bg-red-600 border-red-600' : 'bg-white border-slate-200'}`}>
                  {hasComplement && <Check className="text-white" size={16} strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Adicionar Complemento Extra</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">+ R$ 15,00</p>
                </div>
              </button>

              {hasComplement && (
                <div className="pt-4 border-t border-slate-900/5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">O que será colocado? (Ex: Bandeira do Brasil)</label>
                  <input 
                    type="text"
                    placeholder="DESCREVA O COMPLEMENTO..."
                    className="vlm-input w-full text-sm font-sans italic"
                    value={complementDescription}
                    onChange={(e) => setComplementDescription(e.target.value.toUpperCase())}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900/5">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Subtotal</p>
                <p className="text-4xl font-serif font-black italic text-black">R$ {(product.price + (hasComplement ? 15 : 0)).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 bg-red-600 hover:bg-black h-20" 
                onClick={() => onSave(name, hasComplement, hasComplement ? complementDescription : undefined)}
                disabled={!name.trim() || (hasComplement && !complementDescription.trim())}
              >
                ADICIONAR AO PEDIDO
              </Button>
              <Button 
                variant="ghost" 
                className="px-8 text-slate-300 hover:text-black uppercase font-black text-[10px] tracking-widest"
                onClick={onCancel}
              >
                CANCELAR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
