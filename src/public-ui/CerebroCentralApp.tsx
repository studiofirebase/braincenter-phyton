import React, { useState, useEffect } from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { CookieBanner } from './CookieBanner';
import { FloatingShortcuts } from './FloatingShortcuts';
import { WelcomeModal } from './WelcomeModal';
import { HomePage } from './HomePage';
import { GalleryPage } from './GalleryPage';
import { HelpPage } from './HelpPage';
import { AuthFacePage } from './AuthFacePage';
import { LegalPage } from './LegalPage';
import { AdminShellPage } from './AdminShellPage';

interface CerebroCentralAppProps {
  onOpenCloudConsole?: () => void;
}

export const CerebroCentralApp: React.FC<CerebroCentralAppProps> = ({ onOpenCloudConsole }) => {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    `${window.location.pathname}${window.location.search}`
  );
  const [selectedLang, setSelectedLang] = useState<string>('pt');

  useEffect(() => {
    const handlePopState = () => setCurrentPath(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle route navigation with browser scroll top
  const handleNavigate = (path: string) => {
    let targetPath = path;
    // If accessing exclusive gallery without session, redirect to Face ID auth
    if (path === '/galeria-assinantes') {
      targetPath = '/auth/face';
    }
    if (`${window.location.pathname}${window.location.search}` !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#F5F7FA] font-serif flex flex-col selection:bg-[#38BDF8]/30 selection:text-white">
      {/* Top Floating Engineering Bar to seamlessly toggle between Public UI and Cloudflare Edge Console */}
      <div className="bg-[#12141A] border-b border-white/[0.08] px-4 py-2 text-xs font-sans flex items-center justify-between text-[#D4D9E2]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Italo Santos</span>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="hidden sm:inline text-xs text-[#D4D9E2]/70 font-mono">
            italosantos.com{currentPath}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isAdminRoute && (
            <button
              onClick={() => handleNavigate('/admin')}
              className="px-2.5 py-1 rounded bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border border-[#38BDF8]/40 text-[#38BDF8] font-medium text-[11px] transition-colors"
            >
              Painel Admin (/admin) →
            </button>
          )}

          {onOpenCloudConsole && (
            <button
              onClick={onOpenCloudConsole}
              className="px-2.5 py-1 rounded bg-orange-600/90 hover:bg-orange-500 text-white font-medium text-[11px] transition-colors"
            >
              Console Cloudflare Edge & Deploy →
            </button>
          )}
        </div>
      </div>

      {/* Shared Public Header (shown on all public pages, omitted on full admin shell) */}
      {!isAdminRoute && (
        <PublicHeader
          currentPath={currentPath}
          onNavigate={handleNavigate}
          selectedLang={selectedLang}
          setSelectedLang={setSelectedLang}
        />
      )}

      {/* Main Page Viewport */}
      <main className="flex-1 w-full">
        {currentPath === '/' && <HomePage onNavigate={handleNavigate} />}

        {currentPath === '/fotos' && <GalleryPage type="fotos" onNavigate={handleNavigate} />}

        {currentPath === '/videos' && <GalleryPage type="videos" onNavigate={handleNavigate} />}

        {currentPath === '/loja' && <GalleryPage type="loja" onNavigate={handleNavigate} />}

        {currentPath === '/ajuda' && <HelpPage onNavigate={handleNavigate} />}

        {currentPath === '/auth/face' && <AuthFacePage onNavigate={handleNavigate} />}

        {currentPath === '/termos-condicoes' && (
          <LegalPage type="termos" onNavigate={handleNavigate} />
        )}

        {currentPath === '/politica-de-privacidade' && (
          <LegalPage type="privacidade" onNavigate={handleNavigate} />
        )}

        {currentPath === '/politica-de-transparencia' && (
          <LegalPage type="transparencia" onNavigate={handleNavigate} />
        )}

        {isAdminRoute && (
          <AdminShellPage
            currentPath={currentPath}
            onNavigateAdmin={(path) => handleNavigate(path)}
            onNavigatePublic={handleNavigate}
          />
        )}
      </main>

      {/* Shared Footer (omitted on admin shell) */}
      {!isAdminRoute && <PublicFooter onNavigate={handleNavigate} />}

      {/* Overlays */}
      {!isAdminRoute && (
        <>
          <CookieBanner onNavigate={handleNavigate} />
          <FloatingShortcuts onNavigate={handleNavigate} />
          <WelcomeModal />
        </>
      )}
    </div>
  );
};
