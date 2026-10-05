import React, { useState } from 'react';
import { X, Search, Users, History, Check, UserCheck, Play } from 'lucide-react';

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
            <p>Nenhum perfil público encontrado para "{searchTerm}".</p>
          ) : (
            <p>Digite para buscar assinantes e membros da comunidade Cérebro Central.</p>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70 px-1">
            <span>Conexões Ativas (312)</span>
            <span className="text-[#38BDF8]">Todas</span>
          </div>

          <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl overflow-hidden bg-[#090A0C]">
            <div className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center">
                  CC
                </div>
                <div>
                  <div className="font-semibold text-[#F5F7FA]">Cérebro Central Oficial</div>
                  <div className="text-[11px] text-[#D4D9E2]/50 font-sans">@cerebrocentral</div>
                </div>
              </div>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                Amigo
              </span>
            </div>

            <div className="p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-[#38BDF8] font-bold flex items-center justify-center">
                  DG
                </div>
                <div>
                  <div className="font-semibold text-[#F5F7FA]">Dani Grindr</div>
                  <div className="text-[11px] text-[#D4D9E2]/50 font-sans">@danigrindr</div>
                </div>
              </div>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                Amigo
              </span>
            </div>
          </div>
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
          <p>Seu histórico de visitas de perfil está limpo.</p>
          <p className="text-[11px] text-[#D4D9E2]/40">
            A navegação anônima protege a sua privacidade em todas as sessões.
          </p>
        </div>
      </div>
    </div>
  );
};

export const StoriesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-serif">
      <div className="relative w-full max-w-sm h-[600px] bg-[#12141A] border border-[#343944] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-white animate-[marquee_5s_linear_infinite]" style={{ width: '100%' }} />
        </div>

        {/* Story Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Cérebro Central</div>
              <div className="text-[10px] text-[#D4D9E2]/70 font-sans">Há 2 horas</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Media Artwork */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
            alt="Status Cérebro Central"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        {/* Story Caption */}
        <div className="z-10 p-2 text-center text-sm text-white font-serif drop-shadow-md">
          "Novos ensaios e produções exclusivas disponíveis esta semana no Cérebro Central."
        </div>
      </div>
    </div>
  );
};
