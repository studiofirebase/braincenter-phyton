import React from 'react';
import { Instagram, Twitter, Youtube, Send, ShieldCheck } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#090A0C] border-t border-white/[0.08] py-12 px-4 sm:px-8 text-center font-serif text-[#D4D9E2]/70 text-sm">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Social Icons row (4 icons, 20-25px, gap ~20px) */}
        <div className="flex items-center justify-center gap-5">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Cérebro Central"
            className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D4D9E2] hover:text-[#38BDF8] hover:bg-white/[0.08] transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X / Twitter Cérebro Central"
            className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D4D9E2] hover:text-[#38BDF8] hover:bg-white/[0.08] transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube Cérebro Central"
            className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D4D9E2] hover:text-[#38BDF8] hover:bg-white/[0.08] transition-colors"
          >
            <Youtube className="w-5 h-5" />
          </a>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram Cérebro Central"
            className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#D4D9E2] hover:text-[#38BDF8] hover:bg-white/[0.08] transition-colors"
          >
            <Send className="w-5 h-5" />
          </a>
        </div>

        {/* Legal Links separated by vertical bars */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs tracking-wider text-[#D4D9E2]">
          <button
            onClick={() => onNavigate('/termos-condicoes')}
            className="hover:text-white hover:underline transition-colors focus-visible:outline-hidden"
          >
            Termos & Condições
          </button>
          <span className="text-white/20 select-none">|</span>
          <button
            onClick={() => onNavigate('/politica-de-privacidade')}
            className="hover:text-white hover:underline transition-colors focus-visible:outline-hidden"
          >
            Política de Privacidade
          </button>
          <span className="text-white/20 select-none">|</span>
          <button
            onClick={() => onNavigate('/politica-de-transparencia')}
            className="hover:text-white hover:underline transition-colors focus-visible:outline-hidden"
          >
            Política de Transparência
          </button>
          <span className="text-white/20 select-none">|</span>
          <button
            onClick={() => onNavigate('/admin')}
            className="hover:text-[#38BDF8] transition-colors flex items-center gap-1 focus-visible:outline-hidden text-white/80"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Painel Admin</span>
          </button>
        </div>

        {/* Copyright notice & Disclaimer */}
        <div className="space-y-1.5 text-xs text-[#D4D9E2]/50 font-sans">
          <p>© 2026 Cérebro Central. Todos os direitos reservados.</p>
          <p className="max-w-2xl mx-auto leading-relaxed text-[11px]">
            Plataforma pública e independente de perfil, comunidade e conteúdo digital exclusivo.
            Transações e dados protegidos por criptografia de ponta a ponta.
          </p>
        </div>
      </div>
    </footer>
  );
};
