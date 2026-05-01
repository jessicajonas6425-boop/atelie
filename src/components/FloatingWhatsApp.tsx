import React from 'react';
import { Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = "5511940288573";
  const label = "PRECISA DE AJUDA? CHAME AGORA";

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-10 right-10 z-[100] flex items-center group"
      id="floating-whatsapp-btn"
    >
      <div className="mr-4 bg-white px-6 py-3 rounded-full shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 pointer-events-none">
        <p className="text-[10px] font-black tracking-widest text-slate-900 whitespace-nowrap">{label}</p>
      </div>
      <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(227,6,19,0.3)] hover:bg-black transition-colors duration-500 relative">
        <Smartphone size={32} />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-600 rounded-full flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg">1</span>
      </div>
    </motion.a>
  );
};
