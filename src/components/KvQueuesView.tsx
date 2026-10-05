import React, { useState } from 'react';
import {
  Server,
  Layers,
  Zap,
  Plus,
  Trash2,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { KvEntry, QueuedWebhook } from '../types';

interface KvQueuesViewProps {
  kvEntries: KvEntry[];
  setKvEntries: React.Dispatch<React.SetStateAction<KvEntry[]>>;
  queuedWebhooks: QueuedWebhook[];
  setQueuedWebhooks: React.Dispatch<React.SetStateAction<QueuedWebhook[]>>;
}

export const KvQueuesView: React.FC<KvQueuesViewProps> = ({
  kvEntries,
  setKvEntries,
  queuedWebhooks,
  setQueuedWebhooks
}) => {
  const [activeNamespace, setActiveNamespace] = useState<'CACHE' | 'SESSIONS'>('CACHE');
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTtl, setNewTtl] = useState(300);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Trigger webhook simulation state
  const [webhookProvider, setWebhookProvider] = useState<'stripe' | 'whatsapp'>('stripe');
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);

  const filteredEntries = kvEntries.filter((e) => e.namespace === activeNamespace);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const entry: KvEntry = {
      key: newKey.trim(),
      namespace: activeNamespace,
      value: newValue.trim() || 'true',
      ttlSeconds: newTtl,
      expiresAt: new Date(Date.now() + newTtl * 1000).toISOString(),
      hits: 0,
      createdAt: new Date().toISOString()
    };

    setKvEntries((prev) => [entry, ...prev]);
    setIsAddingKey(false);
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteKey = (key: string) => {
    setKvEntries((prev) => prev.filter((e) => e.key !== key));
  };

  const handlePurgeNamespace = () => {
    setKvEntries((prev) => prev.filter((e) => e.namespace !== activeNamespace));
  };

  const handleTriggerWebhook = () => {
    setIsProcessingWebhook(true);

    const newWh: QueuedWebhook = {
      id: `wh_do_${Math.random().toString(36).substring(2, 8)}`,
      provider: webhookProvider,
      event_type:
        webhookProvider === 'stripe'
          ? 'customer.subscription.updated'
          : 'whatsapp.message.received',
      status: 'queued',
      attempts: 0,
      payload:
        webhookProvider === 'stripe'
          ? {
              subscription_id: 'sub_live_94821',
              status: 'active',
              plan: 'free_starter',
              customer: 'cus_89410'
            }
          : {
              from: '+5511999887766',
              text: 'Novo lead inbound para cerebrocentral.com',
              timestamp: new Date().toISOString()
            },
      received_at: new Date().toISOString()
    };

    setQueuedWebhooks((prev) => [newWh, ...prev]);

    // Simulate Durable Object processing step
    setTimeout(() => {
      setQueuedWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === newWh.id ? { ...wh, status: 'processing', attempts: 1 } : wh
        )
      );
    }, 700);

    setTimeout(() => {
      setQueuedWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === newWh.id
            ? { ...wh, status: 'completed', processed_at: new Date().toISOString() }
            : wh
        )
      );
      setIsProcessingWebhook(false);
    }, 1500);
  };

  const handleRetryWebhook = (id: string) => {
    setQueuedWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id ? { ...wh, status: 'processing', attempts: wh.attempts + 1 } : wh
      )
    );
    setTimeout(() => {
      setQueuedWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === id ? { ...wh, status: 'completed', processed_at: new Date().toISOString() } : wh
        )
      );
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Cloudflare KV & Durable Objects Queue</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
              Low-Latency State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global key-value cache with TTL expiration alongside stateful Durable Objects for asynchronous webhook processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingKey(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add KV Key</span>
          </button>
        </div>
      </div>

      {/* Grid: KV on Left, Durable Objects on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KV Section */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                KV Namespaces
              </h3>
            </div>

            {/* Namespace Switcher */}
            <div className="flex items-center p-0.5 bg-slate-950 rounded-md border border-slate-800 text-xs">
              <button
                onClick={() => setActiveNamespace('CACHE')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  activeNamespace === 'CACHE'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CACHE (env.CACHE)
              </button>
              <button
                onClick={() => setActiveNamespace('SESSIONS')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  activeNamespace === 'SESSIONS'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SESSIONS (env.SESSIONS)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{filteredEntries.length} Keys stored</span>
            <button
              onClick={handlePurgeNamespace}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Purge {activeNamespace}
            </button>
          </div>

          {/* Key Value Items */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                No keys present in {activeNamespace} namespace. Click "Add KV Key" to create one.
              </div>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-orange-400 truncate max-w-[240px]">
                      {item.key}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {item.hits} hits
                      </span>
                      <button
                        onClick={() => handleDeleteKey(item.key)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300 text-[11px] truncate">
                    {item.value}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>TTL: {item.ttlSeconds || 'Permanent'}s</span>
                    <span>Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Durable Objects Queue Section */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Durable Objects WebhookQueue
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
              Stateful Actor
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Webhook payloads from Stripe and WhatsApp are ingested instantly and queued inside a
            Cloudflare Durable Object for sequential background processing with retry capability.
          </p>

          {/* Trigger Simulator */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Simulate:</span>
              <select
                value={webhookProvider}
                onChange={(e) => setWebhookProvider(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono"
              >
                <option value="stripe">Stripe (Subscription)</option>
                <option value="whatsapp">WhatsApp (Inbound Msg)</option>
              </select>
            </div>

            <button
              onClick={handleTriggerWebhook}
              disabled={isProcessingWebhook}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {isProcessingWebhook ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Enqueue Webhook</span>
            </button>
          </div>

          {/* Queued Webhook Events */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {queuedWebhooks.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 uppercase text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {item.provider}
                    </span>
                    <span className="text-slate-300">{item.event_type}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      item.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : item.status === 'processing'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/40 animate-pulse'
                        : 'bg-blue-950 text-blue-400 border border-blue-800/40'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <pre className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto whitespace-pre">
                  {JSON.stringify(item.payload, null, 2)}
                </pre>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Attempts: {item.attempts}</span>
                  <span>Received: {new Date(item.received_at).toLocaleTimeString()}</span>
                  {item.status === 'failed' && (
                    <button
                      onClick={() => handleRetryWebhook(item.id)}
                      className="text-amber-400 hover:text-amber-300 underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Key Modal */}
      {isAddingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddKey}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4"
          >
            <h3 className="text-base font-semibold text-white">Add KV Pair to {activeNamespace}</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. cache:stats:daily"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Value (JSON or String)</label>
                <textarea
                  rows={3}
                  placeholder='{"active": true}'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">TTL (Seconds)</label>
                <input
                  type="number"
                  value={newTtl}
                  onChange={(e) => setNewTtl(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono"
                  min={60}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingKey(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save KV Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
