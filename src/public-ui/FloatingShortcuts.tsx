import React, { useEffect, useState } from 'react';
import { Lock, MessageCircle } from 'lucide-react';

interface FloatingShortcutsProps {
  onNavigate: (path: string) => void;
}

interface PublicShortcuts {
  phone: string;
  show_whatsapp_button: boolean;
  show_live_chat_button: boolean;
}

export const FloatingShortcuts: React.FC<FloatingShortcutsProps> = ({ onNavigate }) => {
  const [shortcuts, setShortcuts] = useState<PublicShortcuts | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/public/profile', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os atalhos públicos.');
        if (
          typeof data.profile?.phone !== 'string' ||
          typeof data.profile?.show_whatsapp_button !== 'boolean' ||
          typeof data.profile?.show_live_chat_button !== 'boolean'
        ) {
          throw new Error('A resposta dos atalhos públicos possui formato inválido.');
        }
        setShortcuts(data.profile as PublicShortcuts);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Falha ao carregar os atalhos públicos:', error);
          setShortcuts({
            phone: import.meta.env.VITE_WHATSAPP_NUMBER || '',
            show_whatsapp_button: true,
            show_live_chat_button: false
          });
        }
      });
    return () => controller.abort();
  }, []);

  if (!shortcuts) return null;
  const whatsappNumber = (shortcuts.phone || import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const showWhatsApp = shortcuts.show_whatsapp_button && !!whatsappNumber;
  const showSecretChat = shortcuts.show_live_chat_button;
  if (!showWhatsApp && !showSecretChat) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {showSecretChat && (
        <button
          type="button"
          onClick={() => onNavigate('/auth/face')}
          aria-label="Acessar o chat secreto"
          className="flex h-13 items-center gap-2 rounded-full border border-white/15 bg-[#7C3AED] px-4 text-sm font-medium text-white shadow-2xl transition-all duration-200 hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
        >
          <Lock className="h-5 w-5" />
          <span>Chat Secreto</span>
        </button>
      )}
      {showWhatsApp && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-200 hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
};
