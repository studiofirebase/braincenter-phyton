import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('cerebrocentral_welcome_seen');
      if (!seen) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem('cerebrocentral_welcome_seen', 'true');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-serif animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#12141A] border border-[#343944] rounded-[24px] p-8 sm:p-10 shadow-2xl space-y-6 text-center">
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#D4D9E2] hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mx-auto text-[#38BDF8]">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tight">
            Cérebro Central
          </h2>
          <p className="text-sm sm:text-base text-[#D4D9E2]/80 leading-relaxed font-serif">
            Bem-vindo à plataforma exclusiva de perfil público, ensaios digitais e comunidade
            fechada operada sob tecnologia de ponta na borda.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleClose}
            className="w-full py-4 px-6 rounded-[14px] bg-[#D5D9E2] hover:bg-white text-[#090A0C] font-sans font-bold text-sm shadow-xl transition-all hover:scale-102 flex items-center justify-center gap-2"
          >
            <span>Conhecer a Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
