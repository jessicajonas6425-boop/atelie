import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MessageSquare, Instagram, Heart } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const whatsappNumber = "5511940288573";

  const messages = [
    "Olá! Sou a assistente do Ateliê VLM. Posso te ajudar com seu brinde personalizado?",
    "Sabia que temos condições especiais para grandes volumes? Me chama no WhatsApp!",
    "Siga nosso Instagram para conferir as artes exclusivas que acabamos de postar!",
    "Tire suas dúvidas em tempo real! Clique abaixo para falar direto com nossa equipe."
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 3000);
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <div className="fixed bottom-36 right-10 z-[90] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-900/5 max-w-[320px] mb-6 pointer-events-auto relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black"></div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-red-600">
                <Sparkles size={18} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Assistente Ateliê</p>
                <p className="text-[11px] font-bold text-red-600 uppercase">ONLINE AGORA</p>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-800 leading-relaxed mb-8 italic">
              "{messages[messageIndex]}"
            </p>

            <div className="space-y-3">
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-4 bg-slate-900 text-white rounded-xl hover:bg-black transition-all group/btn"
              >
                <span className="text-[10px] font-extrabold tracking-widest uppercase">Falar no WhatsApp</span>
                <MessageSquare size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-900 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                >
                  <Instagram size={14} />
                  <span className="text-[9px] font-black uppercase">Instagram</span>
                </a>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 bg-white text-slate-300 rounded-xl hover:text-black transition-all border border-slate-100"
                >
                  <Heart size={14} />
                  <span className="text-[9px] font-black uppercase">Fechar</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
