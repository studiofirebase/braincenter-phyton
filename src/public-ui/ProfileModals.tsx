import React, { useState } from 'react';
import { X, Search, Users, History } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchPeopleModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-serif">
      <div className="w-full max-w-lg bg-[#12141A] border border-[#343944] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-semibold text-[#F5F7FA]">Buscar Pessoas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#D4D9E2] hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Digite um nome ou @perfil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090A0C] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#F5F7FA] focus:outline-hidden focus:border-[#38BDF8]"
            autoFocus
          />
        </div>

        <div className="py-8 text-center text-[#D4D9E2]/60 text-xs space-y-1">
          {searchTerm ? (
            <p>A busca por "{searchTerm}" não está conectada a uma fonte real de perfis.</p>
          ) : (
            <p>A busca de perfis estará disponível quando houver dados reais conectados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const FriendshipsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-serif">
      <div className="w-full max-w-lg bg-[#12141A] border border-[#343944] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-semibold text-[#F5F7FA]">Amizades & Conexões</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#D4D9E2] hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-8 text-center text-xs text-[#D4D9E2]/60">
          <p>As conexões reais ainda não estão disponíveis.</p>
          <p className="mt-1 text-[11px] text-[#D4D9E2]/40">
            Nenhum amigo ou contagem fictícia é exibido.
          </p>
        </div>
      </div>
    </div>
  );
};

export const VisitedProfilesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-serif">
      <div className="w-full max-w-lg bg-[#12141A] border border-[#343944] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-semibold text-[#F5F7FA]">Perfis Visitados Recentemente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#D4D9E2] hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center text-[#D4D9E2]/60 text-xs font-sans space-y-1">
          <p>O histórico de visitas não está conectado.</p>
          <p className="text-[11px] text-[#D4D9E2]/40">
            Não há dados de visitas para exibir.
          </p>
        </div>
      </div>
    </div>
  );
};
