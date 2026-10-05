import React, { useState } from 'react';
import {
  Globe,
  LayoutDashboard,
  Home,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Folder,
  FileText,
  Building2,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react';
import { D1User, D1Organization, D1Media } from '../types';

interface NextJsDashboardPreviewProps {
  currentUser: D1User | null;
  setCurrentUser: (user: D1User | null) => void;
  token: string | null;
  setToken: (t: string | null) => void;
  organizations: D1Organization[];
  mediaList: D1Media[];
  onNavigateToTab: (t: any) => void;
}

export const NextJsDashboardPreview: React.FC<NextJsDashboardPreviewProps> = ({
  currentUser,
  setCurrentUser,
  token,
  setToken,
  organizations,
  mediaList,
  onNavigateToTab
}) => {
  const [activeRoute, setActiveRoute] = useState<'home' | 'dashboard'>('dashboard');
  const [apiStatus, setApiStatus] = useState<'connected' | 'checking'>('connected');

  const handleSimulateLogout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  const handleSimulateLogin = () => {
    setToken('fake_token_123');
    setCurrentUser({
      id: 'user_123',
      email: 'oradanigrindr@gmail.com',
      name: 'Dani Grindr',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      password_hash: '***',
      created_at: '2024-01-15',
      updated_at: '2024-01-15'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Next.js 15 App Router Preview</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40">
              Cloudflare Pages Simulation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated client-side execution of <code className="text-orange-400">packages/frontend/app/page.tsx</code> and{' '}
            <code className="text-orange-400">packages/frontend/app/dashboard/page.tsx</code>.
          </p>
        </div>

        {/* Route Switcher & Auth Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono">
            <button
              onClick={() => setActiveRoute('dashboard')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeRoute === 'dashboard'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>/dashboard</span>
            </button>
            <button
              onClick={() => setActiveRoute('home')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeRoute === 'home'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>/</span>
            </button>
          </div>

          {token ? (
            <button
              onClick={handleSimulateLogout}
              className="px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateLogin}
              className="px-3 py-1.5 rounded text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Sign In as Dani</span>
            </button>
          )}
        </div>
      </div>

      {/* Browser Canvas Mockup */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
        {/* Browser Top bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-slate-400">
              https://cerebrocentral.com{activeRoute === 'dashboard' ? '/dashboard' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CF Pages CDN (Hit)
            </span>
            <button
              onClick={() => {
                setApiStatus('checking');
                setTimeout(() => setApiStatus('connected'), 400);
              }}
              className="hover:text-slate-200 transition-colors"
              title="Refresh simulated view"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeRoute === 'home' ? (
          /* Landing Page: packages/frontend/app/page.tsx */
          <div className="p-8 sm:p-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 min-h-[500px] flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/40 border border-orange-500/30 text-xs text-orange-400 font-mono">
                Next.js 15 + Python FastAPI on Cloudflare Edge
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Cerebrocentral
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Your high-throughput serverless platform running on Cloudflare Workers, Pages, and D1 Database.
              </p>
              <div className="text-xs font-mono text-slate-400">
                API Status:{' '}
                <span className={apiStatus === 'connected' ? 'text-emerald-400 font-semibold' : 'text-orange-400'}>
                  {apiStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveRoute('dashboard')}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => onNavigateToTab('api_console')}
                className="px-6 py-2.5 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Test FastAPI Backend
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl w-full pt-8 text-left">
              <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-orange-500/10 text-orange-400 mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Sub-15ms Edge Latency</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Served instantly across 300+ global Cloudflare data centers without cold starts.
                </p>
              </div>

              <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Automated WAF & DDoS</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enterprise security with SSL/TLS wildcard certificate and rate-limiting built in.
                </p>
              </div>

              <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-400 mb-3">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">100% Free Forever</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generous 100k requests/day and 10 GB R2 zero-egress storage at zero cost.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Page: packages/frontend/app/dashboard/page.tsx */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged in as <span className="text-slate-200 font-mono">{currentUser?.email || 'oradanigrindr@gmail.com'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">
                  Plan: Free Tier ($0/mo)
                </span>
              </div>
            </div>

            {/* Dashboard Stat Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Connected Organizations</span>
                  <Building2 className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">
                  {organizations.length}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Primary: {organizations[0]?.name || 'Cerebrocentral HQ'}
                </div>
              </div>

              <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Media Files in R2</span>
                  <Folder className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">
                  {mediaList.length}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Bucket: r2://cerebrocentral
                </div>
              </div>

              <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Active Plan</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400 font-mono">Free</div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Cloudflare Free Tier Tier-0
                </div>
              </div>
            </div>

            {/* Organizations & Media quick preview */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Workspaces
                  </h3>
                  <button
                    onClick={() => onNavigateToTab('d1_database')}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    Manage in D1 →
                  </button>
                </div>

                <div className="space-y-2">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{org.name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{org.slug}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-900/60">
                        {org.plan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Recent Uploads
                  </h3>
                  <button
                    onClick={() => onNavigateToTab('r2_storage')}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Manage in R2 →
                  </button>
                </div>

                <div className="space-y-2">
                  {mediaList.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-mono text-slate-200 truncate">{m.filename}</div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          {(m.size / 1024).toFixed(1)} KB · {m.visibility}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
