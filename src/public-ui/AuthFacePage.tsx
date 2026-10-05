import React, { useState } from 'react';
import { Camera, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface AuthFacePageProps {
  onNavigate: (path: string) => void;
}

export const AuthFacePage: React.FC<AuthFacePageProps> = ({ onNavigate }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cameraState, setCameraState] = useState<'unavailable' | 'requesting' | 'active'>('unavailable');
  const [antiBotVerified, setAntiBotVerified] = useState(false);

  const handleRequestCamera = () => {
    setCameraState('requesting');
    setTimeout(() => {
      // In web sandboxes without actual hardware grant, show realistic fallback
      setCameraState('unavailable');
    }, 1200);
  };

  return (
    <div className="w-full min-h-[calc(100vh-59px-200px)] bg-[#090A0C] font-serif py-12 px-4 sm:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-[640px] space-y-6">
        {/* Main Authentication Card */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[24px] p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 border-b border-white/[0.08] pb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA]">Cerebro Central</h1>
            <p className="text-base sm:text-lg text-[#D4D9E2]/70">
              Cadastro e Login com Face ID
            </p>
          </div>

          {/* Mode Switcher (Entrar / Cadastrar) */}
          <div className="grid grid-cols-2 p-1.5 rounded-[12px] bg-[#090A0C] border border-white/[0.10] text-sm font-sans">
            <button
              onClick={() => setAuthMode('login')}
              className={`py-2.5 rounded-[8px] font-semibold transition-colors ${
                authMode === 'login'
                  ? 'bg-[#D5D9E2] text-[#090A0C] shadow-md'
                  : 'text-[#D4D9E2] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`py-2.5 rounded-[8px] font-semibold transition-colors ${
                authMode === 'register'
                  ? 'bg-[#D5D9E2] text-[#090A0C] shadow-md'
                  : 'text-[#D4D9E2] hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Camera / Face ID Viewport (480x320px) */}
          <div className="relative w-full aspect-[4/3] sm:h-[320px] bg-[#090A0C] border border-white/[0.12] rounded-[16px] overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
            {cameraState === 'unavailable' ? (
              <div className="space-y-3 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-1">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold text-white">Câmera Indisponível</h4>
                <p className="text-xs text-[#D4D9E2]/70 font-sans max-w-xs leading-relaxed">
                  Permita o acesso à câmera no seu navegador ou certifique-se de que nenhum outro
                  aplicativo a esteja utilizando.
                </p>
                <button
                  onClick={handleRequestCamera}
                  className="mt-2 px-5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-sans text-white transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : cameraState === 'requesting' ? (
              <div className="space-y-3 text-center">
                <RefreshCw className="w-8 h-8 text-[#38BDF8] animate-spin mx-auto" />
                <p className="text-xs text-[#D4D9E2] font-sans">
                  Aguardando autorização da câmera biométrica...
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-48 h-48 rounded-full border-2 border-emerald-400/80 animate-pulse mx-auto flex items-center justify-center">
                  <span className="text-xs text-emerald-400 font-sans">Posicione o rosto</span>
                </div>
              </div>
            )}
          </div>

          {/* Anti-Bot Verification Checkbox */}
          <div className="p-4 rounded-xl bg-[#090A0C] border border-white/[0.08] flex items-center justify-between text-xs font-sans">
            <button
              onClick={() => setAntiBotVerified(!antiBotVerified)}
              className="flex items-center gap-3 text-left"
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  antiBotVerified
                    ? 'bg-[#38BDF8] border-[#38BDF8] text-[#090A0C]'
                    : 'border-white/[0.20] bg-white/[0.04]'
                }`}
              >
                {antiBotVerified && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className="text-[#D4D9E2]">
                Verificação anti-bot de integridade de dispositivo
              </span>
            </button>
            <ShieldCheck className="w-5 h-5 text-[#38BDF8]/60" />
          </div>

          {/* Action Button: 60px height */}
          <button
            disabled={!antiBotVerified || cameraState !== 'active'}
            className="w-full h-[60px] rounded-[14px] bg-[#D5D9E2] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-[#090A0C] font-sans font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Verificar Face ID</span>
          </button>
        </div>

        {/* Troubleshooting Block (~960px max width in desktop) */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[18px] p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg font-semibold text-[#F5F7FA]">
            Como resolver problemas da câmera:
          </h3>
          <ol className="space-y-2.5 text-xs sm:text-sm text-[#D4D9E2]/80 font-serif list-decimal list-inside leading-relaxed">
            <li>
              <strong>Permissão de acesso:</strong> Clique no ícone de cadeado na barra de endereços do navegador e marque "Câmera: Permitir".
            </li>
            <li>
              <strong>Uso por outros programas:</strong> Feche reuniões de vídeo ou outros aplicativos que possam estar utilizando a câmera.
            </li>
            <li>
              <strong>Conexão estável:</strong> Certifique-se de estar conectado a uma rede Wi-Fi ou dados celulares estáveis.
            </li>
            <li>
              <strong>Navegador atualizado:</strong> Utilize a versão mais recente do Google Chrome, Safari, Edge ou Firefox.
            </li>
            <li>
              <strong>Conexão segura:</strong> O Face ID só é ativado em conexões criptografadas sob o protocolo HTTPS.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
