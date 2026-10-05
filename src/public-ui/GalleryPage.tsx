import React from 'react';
import { Image as ImageIcon, Video, ShoppingBag, FolderOpen } from 'lucide-react';

interface GalleryPageProps {
  type: 'fotos' | 'videos' | 'loja';
  onNavigate: (path: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ type, onNavigate }) => {
  const config = {
    fotos: {
      title: 'Galeria de Fotos',
      subtitle: 'Fotos de uploads e redes conectadas',
      emptyMessage: 'Nenhuma foto foi enviada ainda.',
      icon: <ImageIcon className="w-10 h-10 text-[#D4D9E2]/40" />
    },
    videos: {
      title: 'Galeria de Vídeos',
      subtitle: 'Vídeos de uploads e redes conectadas',
      emptyMessage: 'Nenhum vídeo foi enviado ainda.',
      icon: <Video className="w-10 h-10 text-[#D4D9E2]/40" />
    },
    loja: {
      title: 'Loja',
      subtitle: 'Vídeos disponíveis para compra e desbloqueio avulso',
      emptyMessage: 'Nenhum produto disponível.',
      icon: <ShoppingBag className="w-10 h-10 text-[#D4D9E2]/40" />
    }
  }[type];

  return (
    <div className="w-full min-h-[calc(100vh-59px-200px)] bg-[#090A0C] font-serif p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Panel */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[20px] p-6 sm:p-10 min-h-[560px] flex flex-col justify-between shadow-2xl">
          {/* Header Block */}
          <div className="border-b border-white/[0.08] pb-6">
            <h1 className="text-3xl sm:text-[40px] font-bold text-[#F5F7FA] tracking-tight">
              {config.title}
            </h1>
            <p className="text-lg sm:text-[25px] text-[#D4D9E2]/70 mt-2 font-serif">
              {config.subtitle}
            </p>
          </div>

          {/* Centered Generous Empty State */}
          <div className="my-auto py-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-2">
              {config.icon}
            </div>
            <p className="text-xl sm:text-[22px] text-[#D4D9E2]/80 font-serif">
              {config.emptyMessage}
            </p>
            <p className="text-xs sm:text-sm text-[#D4D9E2]/50 font-sans max-w-md">
              Os conteúdos públicos e atualizações autorizadas aparecerão automaticamente nesta área
              assim que forem indexados pelo sistema.
            </p>
          </div>

          {/* Bottom Bar Info */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#D4D9E2]/50 font-sans">
            <span>Cérebro Central · Galeria Pública</span>
            <button
              onClick={() => onNavigate('/')}
              className="text-[#38BDF8] hover:underline"
            >
              ← Voltar ao perfil principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
