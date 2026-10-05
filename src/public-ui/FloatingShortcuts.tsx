import React, { useState } from 'react';
import { MessageCircle, MessageSquare, X, Send } from 'lucide-react';

export const FloatingShortcuts: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    {
      sender: 'bot',
      text: 'Olá! Bem-vindo ao Cérebro Central. Como podemos ajudar você hoje?'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Obrigado pelo seu contato! Nossa equipe de atendimento ou o sistema automático responderá em instantes. Para atendimento rápido, você também pode nos contatar pelo WhatsApp.'
        }
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-3">
        {/* WhatsApp Link button */}
        <a
          href="https://wa.me/5511999998888?text=Ola%20Cerebro%20Central"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>

      {/* Centered Bottom Live Chat Opener */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="px-4 py-2.5 rounded-full bg-[#12141A]/90 hover:bg-[#12141A] text-[#F5F7FA] border border-white/[0.12] shadow-2xl backdrop-blur-md text-xs font-serif flex items-center gap-2 transition-all hover:scale-102 focus-visible:outline-hidden"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Abrir live chat</span>
        </button>
      </div>

      {/* Live Chat Drawer Modal */}
      {isChatOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 w-84 sm:w-96 max-w-[92vw] h-[480px] bg-[#12141A] border border-[#343944] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-serif">
          {/* Header */}
          <div className="p-4 bg-[#090A0C] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-semibold text-[#F5F7FA]">Atendimento Cérebro Central</h4>
                <p className="text-[11px] text-[#D4D9E2]/60 font-sans">Suporte Oficial</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-md hover:bg-white/[0.06] text-[#D4D9E2]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#F5F7FA]'
                      : 'bg-white/[0.05] border border-white/[0.08] text-[#D4D9E2]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#090A0C] border-t border-white/[0.08] flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-xs text-[#F5F7FA] focus:outline-hidden focus:border-[#38BDF8]"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-[#D5D9E2] hover:bg-white text-[#090A0C] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
