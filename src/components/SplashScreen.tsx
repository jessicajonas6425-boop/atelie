import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 6000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           initial={{ opacity: 1 }}
           exit={{ opacity: 0, y: -100, filter: 'blur(20px)' }}
           transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
           className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -top-40 -left-40 w-[60rem] h-[60rem] bg-red-500/5 rounded-full blur-[150px]"
          />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Elegant Icon Reveal */}
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="mb-12 w-24 h-24 bg-black rounded-full flex items-center justify-center text-red-600 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <Sparkles size={40} fill="currentColor" strokeWidth={1} />
            </motion.div>

            {/* Brand Name Reveal */}
            <div className="overflow-hidden mb-4">
              <motion.h1 
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 1 }}
                className="text-7xl md:text-[14rem] font-serif font-black italic tracking-tighter text-black leading-none"
              >
                VLM<span className="text-red-600">.</span>
              </motion.h1>
            </div>

            {/* Subtext Reveal */}
            <div className="overflow-hidden h-10">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 2.2 }}
                className="flex items-center gap-6"
              >
                <div className="h-[1px] w-12 bg-slate-200" />
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-slate-400">
                  L'Atelier de Brindes Exclusivos
                </p>
                <div className="h-[1px] w-12 bg-slate-200" />
              </motion.div>
            </div>

            {/* Quality Statement */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 3.5 }}
              className="mt-20 text-[9px] font-bold text-red-600 uppercase tracking-[0.4em] italic"
            >
              Artesania . Excelência . Personalização
            </motion.p>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-slate-100 overflow-hidden">
            <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ duration: 5, ease: "linear", delay: 0.5 }}
               className="w-full h-full bg-black/20"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
