import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Database,
  HardDrive,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  category: 'Frontend' | 'Compute' | 'Database' | 'Storage' | 'Cache' | 'Queue' | 'Network';
  cost: 'FREE' | 'Included';
  icon: React.ReactNode;
  summary: string;
  limits: string;
  configBinding: string;
  wranglerSnippet: string;
  sampleEndpoint: string;
  features: string[];
}

export const ArchitectureView: React.FC<{
  onNavigateToTab: (tab: any) => void;
}> = ({ onNavigateToTab }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('workers');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [simulatedFlow, setSimulatedFlow] = useState<string | null>(null);

  const nodes: ArchNode[] = [
    {
      id: 'pages',
      name: 'Cloudflare Pages',
      category: 'Frontend',
      cost: 'FREE',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
      summary: 'Hosts Next.js 15 application via static export (output: "export") with global CDN caching and atomic deployments.',
      limits: '500 builds / month · Unlimited requests & bandwidth',
      configBinding: 'packages/frontend/wrangler.toml',
      wranglerSnippet: `name = "cerebrocentral-web"
type = "javascript"
compatibility_date = "2024-01-15"
build = { command = "npm run build" }
main = "build/index.js"
routes = [{ pattern = "cerebrocentral.com/*" }]

[env.production.vars]
NEXT_PUBLIC_API_URL = "https://api.cerebrocentral.com"`,
      sampleEndpoint: 'https://cerebrocentral.com',
      features: [
        'Next.js 15 App Router SSG/ISR support',
        'Automatic SSL/TLS wildcard certificate',
        'Atomic zero-downtime rollbacks',
        'Direct connection to backend worker via internal edge routing'
      ]
    },
    {
      id: 'workers',
      name: 'Python Workers (FastAPI)',
      category: 'Compute',
      cost: 'FREE',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      summary: 'Executes Python 3.11 FastAPI backend directly on Cloudflare V8/Python Workers runtime via Wrangler.',
      limits: '100,000 requests / day · 10ms CPU time/request',
      configBinding: 'packages/backend/wrangler.toml',
      wranglerSnippet: `name = "cerebrocentral-api"
main = "src/index.py"
compatibility_date = "2024-01-15"
compatibility_flags = ["python_workers"]

routes = [
  { pattern = "api.cerebrocentral.com/*", zone_name = "cerebrocentral.com" }
]

[[d1_databases]]
binding = "DB"
database_name = "cerebrocentral"`,
      sampleEndpoint: 'https://api.cerebrocentral.com/api/v1/',
      features: [
        'Native FastAPI OpenAPI/Swagger documentation generation',
        'Pydantic v2 data serialization & validation',
        'Sub-15ms edge invocation latency globally',
        'Zero cold-starts compared to traditional container platforms'
      ]
    },
    {
      id: 'd1',
      name: 'Cloudflare D1 Database',
      category: 'Database',
      cost: 'FREE',
      icon: <Database className="w-5 h-5 text-orange-400" />,
      summary: 'Relational SQLite engine with PostgreSQL SQL compatibility, edge replication, and migration versioning.',
      limits: '5 GB total storage · 5 Million rows read / day · 100k rows written / day',
      configBinding: 'env.DB in Worker',
      wranglerSnippet: `[[d1_databases]]
binding = "DB"
database_name = "cerebrocentral"
database_id = "0b58e9f2-cerebro-central-d1"

# Migration execution:
# wrangler d1 execute cerebrocentral --file=infra/cloudflare/d1-schema.sql`,
      sampleEndpoint: 'SELECT * FROM users WHERE email = ?',
      features: [
        'ACID transactions at the edge',
        'PostgreSQL-style relational schema with Foreign Keys',
        'Automated daily snapshots and point-in-time recovery',
        'Integrated schema migration engine via Wrangler'
      ]
    },
    {
      id: 'r2',
      name: 'Cloudflare R2 Storage',
      category: 'Storage',
      cost: 'FREE',
      icon: <HardDrive className="w-5 h-5 text-purple-400" />,
      summary: 'S3-compatible object storage for user media, avatars, and assets with ZERO egress bandwidth fees.',
      limits: '10 GB storage / month · 1M Class A operations · 10M Class B operations',
      configBinding: 'env.BUCKET in Worker',
      wranglerSnippet: `[[r2_buckets]]
binding = "BUCKET"
bucket_name = "cerebrocentral"

# In Worker code:
# await env.BUCKET.put(file_key, file_bytes)
# url = f"https://r2.cerebrocentral.com/{file_key}"`,
      sampleEndpoint: 'https://r2.cerebrocentral.com/uploads/photo.jpg',
      features: [
        'Zero egress pricing (no surprise AWS data transfer bills)',
        'Signed URL generation for secure direct client uploads',
        'Custom domain binding (r2.cerebrocentral.com)',
        'Automatic edge caching via Cloudflare CDN'
      ]
    },
    {
      id: 'kv',
      name: 'KV Namespaces',
      category: 'Cache',
      cost: 'FREE',
      icon: <Server className="w-5 h-5 text-blue-400" />,
      summary: 'High-throughput, ultra-low latency key-value store for caching API responses, rate limits, and auth sessions.',
      limits: '1 GB storage · 100,000 reads / day · 1,000 writes / day',
      configBinding: 'env.CACHE & env.SESSIONS',
      wranglerSnippet: `[[kv_namespaces]]
binding = "CACHE"
id = "kv_cache_cerebrocentral"

[[kv_namespaces]]
binding = "SESSIONS"
id = "kv_sessions_cerebrocentral"`,
      sampleEndpoint: 'GET /api/v1/auth/me (KV session verification in <2ms)',
      features: [
        'Sub-millisecond global key-value lookups',
        'Time-To-Live (TTL) automatic key expiration for temporary tokens',
        'Decoupled session management independent of database locks',
        'Edge rate-limiting state synchronization'
      ]
    },
    {
      id: 'durable_objects',
      name: 'Durable Objects Queue',
      category: 'Queue',
      cost: 'FREE',
      icon: <Cloud className="w-5 h-5 text-amber-400" />,
      summary: 'Stateful actor instances coordinating asynchronous background webhook processing for Stripe and WhatsApp.',
      limits: 'Included in Free tier worker invocations',
      configBinding: 'env.WEBHOOK_QUEUE',
      wranglerSnippet: `[durable_objects]
bindings = [
  { name = "WEBHOOK_QUEUE", class_name = "WebhookQueue" }
]

[[migrations]]
tag = "v1"
new_classes = ["WebhookQueue"]`,
      sampleEndpoint: 'POST /api/v1/webhooks/stripe -> WebhookQueue.enqueue()',
      features: [
        'Guaranteed single-thread ordering per webhook channel',
        'Persistent storage inside the actor instance',
        'Automatic retry on transient 3rd party API failures',
        'Zero external queue infrastructure needed (no SQS or RabbitMQ)'
      ]
    },
    {
      id: 'security',
      name: 'Edge Network, DNS & WAF',
      category: 'Network',
      cost: 'FREE',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      summary: 'Global Anycast DNS, DDoS mitigation, Web Application Firewall, and HTTP/3 support on every edge location.',
      limits: 'Unlimited DDoS protection · Unlimited DNS queries · Free SSL',
      configBinding: 'Cloudflare Edge Zone',
      wranglerSnippet: `# Managed automatically by Cloudflare DNS & WAF
# Domains:
# - cerebrocentral.com (Pages)
# - api.cerebrocentral.com (Workers)
# - r2.cerebrocentral.com (R2 Bucket)`,
      sampleEndpoint: 'Anycast DNS with <10ms resolution worldwide',
      features: [
        'Automatic Layer 3, 4 and 7 DDoS protection',
        'Built-in Bot fight mode and OWASP rate limiting',
        'Automated TLS 1.3 / HTTP/3 protocol negotiation',
        'Global edge cache with instant purge support'
      ]
    }
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const runFlowSimulation = (flowType: 'api' | 'upload' | 'webhook') => {
    setSimulatedFlow(flowType);
    setTimeout(() => {
      setSimulatedFlow(null);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-orange-400 mb-2 font-mono">
            <span>CLOUDFLARE EDGE FREE TIER</span>
            <span>·</span>
            <span>MONOREPO STACK</span>
            <span>·</span>
            <span>$0/MONTH BUDGET</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cerebrocentral Serverless Edge Architecture
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
            Full-stack serverless deployment uniting Next.js 15 on Cloudflare Pages, Python FastAPI
            on Cloudflare Workers, relational D1 database, R2 media storage, and Durable Objects queues.
            Zero cloud cost with enterprise-grade edge scale.
          </p>

          {/* Quick Simulation Triggers */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => runFlowSimulation('api')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                simulatedFlow === 'api'
                  ? 'bg-orange-500 text-white border-orange-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Simulate API Query Flow
            </button>
            <button
              onClick={() => runFlowSimulation('upload')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                simulatedFlow === 'upload'
                  ? 'bg-purple-500 text-white border-purple-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Simulate R2 Media Upload
            </button>
            <button
              onClick={() => runFlowSimulation('webhook')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                simulatedFlow === 'webhook'
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              Simulate Durable Webhook Flow
            </button>
          </div>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Edge Topology Map</h2>
            <p className="text-xs text-slate-400">
              Click any component to inspect bindings, limits, and runtime configuration
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Free Tier
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Active Node
            </span>
          </div>
        </div>

        {/* Dynamic Topology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isFlowActive =
              (simulatedFlow === 'api' && ['pages', 'workers', 'd1', 'kv'].includes(node.id)) ||
              (simulatedFlow === 'upload' && ['pages', 'workers', 'r2'].includes(node.id)) ||
              (simulatedFlow === 'webhook' && ['workers', 'durable_objects', 'd1'].includes(node.id));

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-4 rounded-lg text-left transition-all relative border ${
                  isSelected
                    ? 'bg-slate-800/90 border-orange-500 shadow-md shadow-orange-500/10'
                    : isFlowActive
                    ? 'bg-slate-800/60 border-emerald-500/80 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-md bg-slate-900 border border-slate-800">
                    {node.icon}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                    {node.cost}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{node.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {node.summary}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{node.category}</span>
                  <span className="text-orange-400/90 font-medium">Inspect →</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Simulated Flow Trace */}
        {simulatedFlow && (
          <div className="mt-4 p-3 rounded-lg bg-orange-950/20 border border-orange-500/30 text-xs text-orange-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
              <span>
                Active Flow Trace:{' '}
                {simulatedFlow === 'api'
                  ? 'Browser -> CF Pages -> Worker (Python FastAPI) -> KV Cache Hit/Miss -> D1 Relational Engine'
                  : simulatedFlow === 'upload'
                  ? 'Browser -> Client Multipart Form -> Worker Stream -> R2 Object Bucket (Zero Egress)'
                  : '3rd Party Provider -> Worker Webhook Route -> Durable Object Queue Actor -> Async Worker Ingestion'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-orange-400">Latency: ~12ms</span>
          </div>
        )}
      </div>

      {/* Selected Node Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Features */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                {selectedNode.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{selectedNode.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {selectedNode.cost} TIER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Binding: {selectedNode.configBinding}
                </p>
              </div>
            </div>

            {/* Quick Action to relevant tab */}
            {selectedNode.id === 'workers' && (
              <button
                onClick={() => onNavigateToTab('api_console')}
                className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Open FastAPI Console
              </button>
            )}
            {selectedNode.id === 'd1' && (
              <button
                onClick={() => onNavigateToTab('d1_database')}
                className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Open D1 Database Studio
              </button>
            )}
            {selectedNode.id === 'r2' && (
              <button
                onClick={() => onNavigateToTab('r2_storage')}
                className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Open R2 Storage Bucket
              </button>
            )}
            {selectedNode.id === 'kv' && (
              <button
                onClick={() => onNavigateToTab('kv_queues')}
                className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Open KV & Queues Manager
              </button>
            )}
            {selectedNode.id === 'pages' && (
              <button
                onClick={() => onNavigateToTab('dashboard_preview')}
                className="px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Preview Next.js App
              </button>
            )}
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Architecture Overview
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedNode.summary}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-1">Free Tier Allocation & Limits</h4>
            <p className="text-xs text-emerald-400 font-mono">{selectedNode.limits}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Capabilities & Edge Invariants
            </h4>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {selectedNode.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded bg-slate-950/40 border border-slate-800 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Binding & Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Configuration Snippet
              </h4>
              <button
                onClick={() => handleCopy(selectedNode.wranglerSnippet)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Copy configuration snippet"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
              {selectedNode.wranglerSnippet}
            </pre>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 block mb-1">Production URL Target</span>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-orange-400 break-all">
              {selectedNode.sampleEndpoint}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
