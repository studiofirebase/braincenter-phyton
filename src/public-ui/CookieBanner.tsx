import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  onNavigate: (path: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [decision, setDecision] = useState<'pending' | 'accepted' | 'declined'>('accepted'); // default until checked

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cerebrocentral_cookie_consent');
      if (stored === 'accepted' || stored === 'declined') {
        setDecision(stored);
      } else {
        setDecision('pending');
      }
    } catch {
      setDecision('pending');
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cerebrocentral_cookie_consent', 'accepted');
    } catch {}
    setDecision('accepted');
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('cerebrocentral_cookie_consent', 'declined');
    } catch {}
    setDecision('declined');
  };

  if (decision !== 'pending') {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-[#12141A]/95 backdrop-blur-md border-t border-white/[0.10] shadow-2xl font-serif text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Explanation text */}
        <p className="text-[#D4D9E2] text-xs sm:text-sm leading-relaxed text-center sm:text-left">
          Utilizamos cookies essenciais para autenticação biométrica, segurança da sessão e métricas
          anônimas de desempenho da plataforma. Para detalhes completos, consulte nossa{' '}
          <button
            onClick={() => onNavigate('/politica-de-privacidade')}
            className="text-[#38BDF8] underline hover:text-white transition-colors"
          >
            Política de Privacidade
          </button>
          .
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-black/60 border border-white/[0.12] text-[#D4D9E2] hover:bg-white/[0.08] hover:text-white transition-colors font-sans text-xs font-medium"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-[#D5D9E2] hover:bg-white text-[#090A0C] font-semibold transition-colors font-sans text-xs shadow-md"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};
