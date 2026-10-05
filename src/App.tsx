import React, { useState } from 'react';
import { CerebroCentralApp } from './public-ui/CerebroCentralApp';
import { Navbar, ActiveTab } from './components/Navbar';
import { ArchitectureView } from './components/ArchitectureView';
import { ApiConsoleView } from './components/ApiConsoleView';
import { DatabaseStudioView } from './components/DatabaseStudioView';
import { R2StorageView } from './components/R2StorageView';
import { KvQueuesView } from './components/KvQueuesView';
import { MigrationWizardView } from './components/MigrationWizardView';
import { MonorepoExplorerView } from './components/MonorepoExplorerView';
import { CostCalculatorView } from './components/CostCalculatorView';
import { NextJsDashboardPreview } from './components/NextJsDashboardPreview';

import {
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_MEMBERSHIPS,
  INITIAL_MEDIA,
  INITIAL_INTEGRATIONS,
  INITIAL_WEBHOOK_LOGS,
  INITIAL_KV_ENTRIES,
  INITIAL_QUEUED_WEBHOOKS
} from './data/initialData';
import {
  D1User,
  D1Organization,
  D1Membership,
  D1Media,
  D1Integration,
  D1WebhookLog,
  KvEntry,
  QueuedWebhook
} from './types';

export default function App() {
  // Main view switcher: 'public' (Authentic Cérebro Central UI/UX) vs 'console' (Cloudflare Edge Architecture Console)
  const [viewMode, setViewMode] = useState<'public' | 'console'>('public');

  // Architecture Console State
  const [activeTab, setActiveTab] = useState<ActiveTab>('architecture');
  const [envMode, setEnvMode] = useState<'production' | 'local'>('production');
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('ok');

  // Shared database & cloud resources state
  const [users, setUsers] = useState<D1User[]>(INITIAL_USERS);
  const [organizations, setOrganizations] = useState<D1Organization[]>(INITIAL_ORGANIZATIONS);
  const [memberships, setMemberships] = useState<D1Membership[]>(INITIAL_MEMBERSHIPS);
  const [mediaList, setMediaList] = useState<D1Media[]>(INITIAL_MEDIA);
  const [integrations, setIntegrations] = useState<D1Integration[]>(INITIAL_INTEGRATIONS);
  const [webhookLogs, setWebhookLogs] = useState<D1WebhookLog[]>(INITIAL_WEBHOOK_LOGS);
  const [kvEntries, setKvEntries] = useState<KvEntry[]>(INITIAL_KV_ENTRIES);
  const [queuedWebhooks, setQueuedWebhooks] = useState<QueuedWebhook[]>(INITIAL_QUEUED_WEBHOOKS);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<D1User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Deep link file target for monorepo explorer
  const [selectedFileForExplorer, setSelectedFileForExplorer] = useState<string | undefined>(undefined);

  const handleRunHealthCheck = () => {
    setHealthStatus('checking');
    setTimeout(() => {
      setHealthStatus('ok');
    }, 400);
  };

  const handleOpenFileInExplorer = (filePath: string) => {
    setSelectedFileForExplorer(filePath);
    setActiveTab('monorepo_files');
    setViewMode('console');
  };

  // If in public UI mode, render the authentic Cérebro Central public application
  if (viewMode === 'public') {
    return (
      <CerebroCentralApp
        onOpenCloudConsole={() => setViewMode('console')}
      />
    );
  }

  // Cloudflare Edge Architecture & Engineering Console
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Bar adhering to 3-zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        envMode={envMode}
        setEnvMode={setEnvMode}
        onRunHealthCheck={handleRunHealthCheck}
        healthStatus={healthStatus}
        onSwitchToPublicSite={() => setViewMode('public')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'architecture' && (
          <ArchitectureView onNavigateToTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'api_console' && (
          <ApiConsoleView
            envMode={envMode}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            token={token}
            setToken={setToken}
            organizations={organizations}
            setOrganizations={setOrganizations}
            mediaList={mediaList}
            setMediaList={setMediaList}
            webhookLogs={webhookLogs}
            setWebhookLogs={setWebhookLogs}
            queuedWebhooks={queuedWebhooks}
            setQueuedWebhooks={setQueuedWebhooks}
          />
        )}

        {activeTab === 'dashboard_preview' && (
          <NextJsDashboardPreview
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            token={token}
            setToken={setToken}
            organizations={organizations}
            mediaList={mediaList}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'd1_database' && (
          <DatabaseStudioView
            users={users}
            setUsers={setUsers}
            organizations={organizations}
            setOrganizations={setOrganizations}
            memberships={memberships}
            setMemberships={setMemberships}
            mediaList={mediaList}
            setMediaList={setMediaList}
            integrations={integrations}
            webhookLogs={webhookLogs}
          />
        )}

        {activeTab === 'r2_storage' && (
          <R2StorageView mediaList={mediaList} setMediaList={setMediaList} />
        )}

        {activeTab === 'kv_queues' && (
          <KvQueuesView
            kvEntries={kvEntries}
            setKvEntries={setKvEntries}
            queuedWebhooks={queuedWebhooks}
            setQueuedWebhooks={setQueuedWebhooks}
          />
        )}

        {activeTab === 'migration_wizard' && (
          <MigrationWizardView onOpenFileInExplorer={handleOpenFileInExplorer} />
        )}

        {activeTab === 'monorepo_files' && (
          <MonorepoExplorerView initialSelectedPath={selectedFileForExplorer} />
        )}

        {activeTab === 'cost_calculator' && <CostCalculatorView />}
      </main>

      {/* Engineering Console Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Cerebrocentral</span>
            <span>·</span>
            <span>Cloudflare Edge (Free Tier)</span>
            <span>·</span>
            <button
              onClick={() => setViewMode('public')}
              className="text-[#38BDF8] hover:underline"
            >
              Ver UI/UX Pública
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('migration_wizard')}
              className="hover:text-slate-300 transition-colors"
            >
              Roadmap 30 Passos
            </button>
            <button
              onClick={() => setActiveTab('monorepo_files')}
              className="hover:text-slate-300 transition-colors"
            >
              15 Arquivos Base
            </button>
            <span className="font-mono text-slate-600">cerebrocentral.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
