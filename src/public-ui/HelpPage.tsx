import React from 'react';
import { HelpCircle, Mail, Shield, Info } from 'lucide-react';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  const supportEmail = import.meta.env.VITE_PUBLIC_SUPPORT_EMAIL?.trim();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '');

  return (
    <div className="w-full min-h-[calc(100vh-59px-200px)] bg-[#090A0C] font-serif py-12 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* Header Block */}
        <div className="border-b border-white/[0.08] pb-6">
          <h1 className="text-3xl sm:text-[45px] font-bold text-[#F5F7FA]">
            Ajuda e Suporte
          </h1>
          <p className="text-lg sm:text-[20px] text-[#D4D9E2]/70 mt-2 font-serif">
            Orientações gerais, funcionamento do sistema e canais de contato com a equipe.
          </p>
        </div>

        {/* Card 1: Atendimento (~167px desktop) */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[20px] p-6 sm:p-8 space-y-3 shadow-xl">
          <h2 className="text-2xl sm:text-[35px] font-semibold text-[#F5F7FA]">Atendimento</h2>
          <p className="text-base sm:text-[20px] text-[#D4D9E2]/80 leading-relaxed font-serif">
            {supportEmail || whatsappNumber
              ? 'Use somente os canais de contato configurados e exibidos abaixo.'
              : 'Nenhum canal de atendimento está configurado neste ambiente. Não há chat simulado.'}
          </p>
        </div>

        {/* Card 2: Como funciona a plataforma (~342px desktop, 6 concises items) */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[20px] p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-2xl sm:text-[35px] font-semibold text-[#F5F7FA]">
            Como funciona a plataforma
          </h2>
          <p className="text-base sm:text-[20px] text-[#D4D9E2]/80 font-serif">
            Guia rápido das principais funções do ecossistema Cérebro Central:
          </p>

          <ul className="space-y-3.5 text-sm sm:text-base text-[#D4D9E2] font-serif pl-2">
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Cadastro e Login:</strong> Autenticação biométrica avançada com Face ID garantindo máxima segurança e login sem senhas vulneráveis.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Assinatura Digital:</strong> Planos mensal e anual com acesso instantâneo a todas as galerias exclusivas e ensaios fotográficos.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Pagamentos Seguros:</strong> Processamento criptografado via Google Pay, Apple Pay e PIX com confirmação em tempo real.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Conteúdo Exclusivo:</strong> Mídias de alta resolução transmitidas diretamente pela rede de borda Cloudflare sem compressão degradante.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Avaliações e Comunidade:</strong> Feedbacks submetidos pelos membros passam por moderação ativa para preservar um ambiente respeitoso.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#38BDF8] select-none font-bold">·</span>
              <span><strong>Suporte Direto:</strong> Canais de contato serão exibidos somente quando configurados.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Contato (~137px desktop) */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[20px] p-6 sm:p-8 space-y-3 shadow-xl">
          <h2 className="text-2xl sm:text-[35px] font-semibold text-[#F5F7FA]">Contato</h2>
          <p className="text-base sm:text-[20px] text-[#D4D9E2]/80 leading-relaxed font-serif">
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 text-[#38BDF8] hover:underline">
                <Mail className="h-4 w-4" /> {supportEmail}
              </a>
            )}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-[#38BDF8] hover:underline"
              >
                <Info className="h-4 w-4" /> WhatsApp configurado
              </a>
            )}
            {!supportEmail && !whatsappNumber && 'Nenhum contato público foi conectado.'}
          </p>
        </div>
      </div>
    </div>
  );
};
