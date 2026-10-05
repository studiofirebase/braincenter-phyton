import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface AuthFacePageProps {
  onNavigate: (path: string) => void;
}

export const AuthFacePage: React.FC<AuthFacePageProps> = ({ onNavigate }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cameraState, setCameraState] = useState<'unavailable' | 'requesting' | 'active'>('unavailable');
  const [antiBotVerified, setAntiBotVerified] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraState]);

  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      streamRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleRequestCamera = async () => {
    setCameraState('requesting');
    setCameraError('');
    setVerificationMessage('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador não oferece acesso à câmera. Use uma conexão HTTPS e tente novamente.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' }
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (streamRef.current === stream) {
            streamRef.current = null;
            stream.getTracks().forEach((activeTrack) => activeTrack.stop());
            setCameraState('unavailable');
            setCameraError('O acesso à câmera foi encerrado. Tente novamente.');
          }
        });
      });
      setCameraState('active');
    } catch (error) {
      const cameraError = error as DOMException;
      if (cameraError.name === 'NotAllowedError' || cameraError.name === 'SecurityError') {
        setCameraError('A permissão da câmera foi negada. Autorize o acesso nas configurações do navegador.');
      } else if (cameraError.name === 'NotFoundError' || cameraError.name === 'OverconstrainedError') {
        setCameraError('Nenhuma câmera compatível foi encontrada neste dispositivo.');
      } else if (cameraError.name === 'NotReadableError') {
        setCameraError('A câmera está em uso por outro aplicativo. Feche-o e tente novamente.');
      } else {
        setCameraError(cameraError.message || 'Não foi possível acessar a câmera.');
      }
      setCameraState('unavailable');
    }
  };

  const handleVerifyFace = () => {
    setVerificationMessage(
      'A câmera foi acessada, mas o reconhecimento biométrico ainda não está configurado. Nenhuma identidade foi verificada.'
    );
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
                  {cameraError || 'Permita o acesso à câmera no navegador e confirme que ela não está sendo usada por outro aplicativo.'}
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
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Pré-visualização da câmera"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-4 rounded-full bg-black/70 px-3 py-1 text-xs text-emerald-300 font-sans">
                  Câmera ativa
                </span>
              </>
            )}
          </div>
          {verificationMessage && (
            <p role="status" className="flex items-start gap-2 text-xs font-sans text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {verificationMessage}
            </p>
          )}

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
            onClick={handleVerifyFace}
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
