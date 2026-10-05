import React from 'react';
import { Cloud, Zap, Shield, Play, Globe } from 'lucide-react';

export type ActiveTab =
  | 'architecture'
  | 'api_console'
  | 'dashboard_preview'
  | 'd1_database'
  | 'r2_storage'
  | 'kv_queues'
  | 'migration_wizard'
  | 'monorepo_files'
  | 'cost_calculator';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  envMode: 'production' | 'local';
  setEnvMode: (env: 'production' | 'local') => void;
  onRunHealthCheck: () => void;
  healthStatus: 'idle' | 'checking' | 'ok' | 'error';
  onSwitchToPublicSite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  envMode,
  setEnvMode,
  onRunHealthCheck,
  healthStatus,
  onSwitchToPublicSite
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'architecture', label: 'Architecture' },
    { id: 'api_console', label: 'FastAPI Runner' },
    { id: 'dashboard_preview', label: 'Next.js App' },
    { id: 'd1_database', label: 'D1 Database' },
    { id: 'r2_storage', label: 'R2 Storage' },
    { id: 'kv_queues', label: 'KV & Queues' },
    { id: 'migration_wizard', label: 'Migration Playbook' },
    { id: 'monorepo_files', label: 'Code Explorer' },
    { id: 'cost_calculator', label: 'Free Tier Matrix' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('architecture')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-colors">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                Cerebrocentral
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-1.5 font-mono">
                edge.free
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean single-line nav tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-orange-400 shadow-xs border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Return to Public UI */}
          {onSwitchToPublicSite && (
            <button
              onClick={onSwitchToPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/40 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Site Público</span>
            </button>
          )}

          {/* Environment Switcher */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs">
            <button
              onClick={() => setEnvMode('production')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                envMode === 'production'
                  ? 'bg-orange-600/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cloudflare Edge: api.cerebrocentral.com"
            >
              CF Edge
            </button>
            <button
              onClick={() => setEnvMode('local')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                envMode === 'local'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Local Docker: localhost:8000"
            >
              Local :8000
            </button>
          </div>

          {/* Live Edge Health Probe */}
          <button
            onClick={onRunHealthCheck}
            disabled={healthStatus === 'checking'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
            title="Probe GET /health on active environment"
          >
            {healthStatus === 'checking' ? (
              <Zap className="w-3.5 h-3.5 text-orange-400 animate-spin" />
            ) : healthStatus === 'ok' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            ) : healthStatus === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            ) : (
              <Play className="w-3 h-3 text-slate-400" />
            )}
            <span className="hidden sm:inline">Probe Edge</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950 px-4 py-2 overflow-x-auto flex gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-slate-800 text-orange-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
