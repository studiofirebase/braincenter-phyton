import React, { useState } from 'react';
import {
  Menu,
  X,
  Globe,
  Home,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  HelpCircle,
  Lock,
  Shield,
  ChevronDown
} from 'lucide-react';

interface PublicHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPath,
  onNavigate,
  selectedLang,
  setSelectedLang
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'device', label: 'Idioma do Dispositivo' },
    { code: 'pt', label: 'Português (Original)' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' }
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMenuOpen(false);
  };

  const activeLangLabel = languages.find((l) => l.code === selectedLang)?.label || 'Português';

  return (
    <>
      <header className="sticky top-0 z-40 h-[59px] bg-[#090A0C]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Menu button (45x45px, 8px radius) & Home link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir menu"
            className="w-[45px] h-[45px] rounded-[8px] bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] flex items-center justify-center text-[#F5F7FA] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
          >
            <Menu className="w-5 h-5 text-[#D4D9E2]" />
          </button>

          <button
            onClick={() => handleNavClick('/')}
            aria-label="Página Inicial"
            className="w-[45px] h-[45px] rounded-[8px] hover:bg-white/[0.04] flex items-center justify-center text-[#D4D9E2] transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Title "Cerebro Central" in serif */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-xl sm:text-2xl font-serif tracking-wide text-[#F5F7FA] hover:text-[#D4D9E2] transition-colors focus-visible:outline-hidden"
        >
          Cerebro Central
        </button>

        {/* Right: Admin Button (45x45px) & Language/Currency Selector (45x45px) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('/admin')}
            aria-label="Acessar Painel Administrativo"
            title="Acessar Painel Administrativo"
            className="w-[45px] h-[45px] rounded-[8px] bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-[#38BDF8]/40 flex items-center justify-center text-[#D4D9E2] hover:text-[#38BDF8] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
          >
            <Shield className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Selecionar idioma e câmbio"
              className="w-[45px] h-[45px] rounded-[8px] bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] flex items-center justify-center text-[#D4D9E2] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
            >
              <Globe className="w-4 h-4" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-[10px] bg-[#12141A] border border-[#343944] shadow-2xl py-1 z-50 text-xs font-serif">
                <div className="px-3 py-1.5 border-b border-white/[0.08] text-[11px] text-[#D4D9E2]/60 uppercase tracking-wider font-sans">
                  Idioma & Câmbio
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors ${
                      selectedLang === lang.code ? 'text-[#38BDF8] font-semibold' : 'text-[#F5F7FA]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {selectedLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 sm:w-80 max-w-full bg-[#12141A] border-r border-[#343944] h-full p-5 sm:p-6 flex flex-col justify-between z-10 font-serif overflow-y-auto">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
                <span className="text-xl tracking-wide text-[#F5F7FA]">Cérebro Central</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.10] flex items-center justify-center text-[#D4D9E2] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items (Uppercase) */}
              <nav className="mt-5 space-y-1.5 text-sm tracking-wider">
                <button
                  onClick={() => handleNavClick('/')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/' ? 'bg-white/[0.08] text-[#38BDF8] font-semibold' : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#D4D9E2]" />
                  <span>INÍCIO</span>
                </button>

                <button
                  onClick={() => handleNavClick('/fotos')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/fotos' ? 'bg-white/[0.08] text-[#38BDF8] font-semibold' : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-[#D4D9E2]" />
                  <span>FOTOS</span>
                </button>

                <button
                  onClick={() => handleNavClick('/videos')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/videos' ? 'bg-white/[0.08] text-[#38BDF8] font-semibold' : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <Video className="w-4 h-4 text-[#D4D9E2]" />
                  <span>VÍDEOS</span>
                </button>

                <button
                  onClick={() => handleNavClick('/galeria-assinantes')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/galeria-assinantes' || currentPath === '/auth/face'
                      ? 'bg-white/[0.08] text-[#38BDF8] font-semibold'
                      : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <Lock className="w-4 h-4 text-[#38BDF8]" />
                  <span className="flex items-center justify-between w-full">
                    <span>GALERIA EXCLUSIVA</span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-white/[0.08] text-[#D4D9E2]">
                      Face ID
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('/loja')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/loja' ? 'bg-white/[0.08] text-[#38BDF8] font-semibold' : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4D9E2]" />
                  <span>LOJA ON-LINE</span>
                </button>

                <button
                  onClick={() => handleNavClick('/ajuda')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentPath === '/ajuda' ? 'bg-white/[0.08] text-[#38BDF8] font-semibold' : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-[#D4D9E2]" />
                  <span>AJUDA E SUPORTE</span>
                </button>
              </nav>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3 font-sans mt-auto">
              <button
                onClick={() => handleNavClick('/admin')}
                className="w-full text-left px-3.5 py-2.5 rounded-[8px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-[#38BDF8]/40 text-xs text-[#D4D9E2] hover:text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Painel Administrativo</span>
                </div>
                <span className="text-[10px] text-[#38BDF8] font-mono">Entrar →</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#D4D9E2]/50 px-1">
                <span>Cérebro Central © 2026</span>
                <span>v2.0 Edge</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
