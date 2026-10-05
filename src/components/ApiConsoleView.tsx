import React, { useState } from 'react';
import {
  Play,
  Copy,
  Check,
  Zap,
  Globe,
  Lock,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ApiEndpointDef, D1User, D1Organization, D1Media, QueuedWebhook, D1WebhookLog } from '../types';
import { API_ENDPOINTS } from '../data/initialData';

interface ApiConsoleViewProps {
  envMode: 'production' | 'local';
  currentUser: D1User | null;
  setCurrentUser: (user: D1User | null) => void;
  token: string | null;
  setToken: (tok: string | null) => void;
  organizations: D1Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<D1Organization[]>>;
  mediaList: D1Media[];
  setMediaList: React.Dispatch<React.SetStateAction<D1Media[]>>;
  webhookLogs: D1WebhookLog[];
  setWebhookLogs: React.Dispatch<React.SetStateAction<D1WebhookLog[]>>;
  queuedWebhooks: QueuedWebhook[];
  setQueuedWebhooks: React.Dispatch<React.SetStateAction<QueuedWebhook[]>>;
}

export const ApiConsoleView: React.FC<ApiConsoleViewProps> = ({
  envMode,
  currentUser,
  setCurrentUser,
  token,
  setToken,
  organizations,
  setOrganizations,
  mediaList,
  setMediaList,
  webhookLogs,
  setWebhookLogs,
  queuedWebhooks,
  setQueuedWebhooks
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDef>(API_ENDPOINTS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(selectedEndpoint.defaultBody || {}, null, 2)
  );
  const [urlParamVal, setUrlParamVal] = useState<string>('user_123');

  // Response state
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const categories = ['All', 'System', 'Auth', 'Users', 'Organizations', 'Media', 'Integrations', 'Webhooks'];

  const filteredEndpoints = API_ENDPOINTS.filter((ep) =>
    selectedCategory === 'All' ? true : ep.category === selectedCategory
  );

  const handleSelectEndpoint = (ep: ApiEndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(JSON.stringify(ep.defaultBody || {}, null, 2));
    if (ep.defaultParams) {
      const firstVal = Object.values(ep.defaultParams)[0];
      setUrlParamVal(firstVal || 'user_123');
    }
    setResponseStatus(null);
    setResponseBody(null);
  };

  const executeRequest = () => {
    setIsExecuting(true);
    const startTime = performance.now();

    setTimeout(() => {
      let status = 200;
      let body: any = {};
      const rayId = `cf-ray-${Math.random().toString(36).substring(2, 10)}`;

      try {
        let parsedBody: any = {};
        if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
          parsedBody = JSON.parse(requestBodyText);
        }

        switch (selectedEndpoint.path) {
          case '/health':
            body = {
              status: 'ok',
              environment: envMode,
              runtime: 'python_workers_v2',
              edge_region: 'gru-sa-brazil',
              d1_connected: true,
              r2_connected: true
            };
            break;

          case '/api/v1/':
            body = {
              message: 'Cerebrocentral API v2',
              endpoints: {
                auth: '/api/v1/auth',
                users: '/api/v1/users',
                media: '/api/v1/media',
                organizations: '/api/v1/organizations',
                webhooks: '/api/v1/webhooks'
              }
            };
            break;

          case '/api/v1/auth/login':
            if (!parsedBody.email || !parsedBody.password) {
              status = 400;
              body = { error: 'Missing email or password', status: 400 };
            } else {
              const newToken = `cf_jwt_${Math.random().toString(36).substring(2, 14)}`;
              const loggedUser: D1User = {
                id: 'user_123',
                email: parsedBody.email,
                name: 'Dani Grindr',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
                password_hash: '***encrypted***',
                created_at: '2024-01-15 10:20:00',
                updated_at: new Date().toISOString()
              };
              setToken(newToken);
              setCurrentUser(loggedUser);
              body = {
                access_token: newToken,
                token_type: 'bearer',
                user: {
                  id: loggedUser.id,
                  email: loggedUser.email,
                  name: loggedUser.name
                }
              };
            }
            break;

          case '/api/v1/auth/logout':
            setToken(null);
            setCurrentUser(null);
            body = { message: 'Logged out successfully from KV sessions' };
            break;

          case '/api/v1/auth/me':
            if (!token) {
              status = 401;
              body = { error: 'Unauthorized: missing Bearer token', status: 401 };
            } else {
              body = {
                id: currentUser?.id || 'user_123',
                email: currentUser?.email || 'oradanigrindr@gmail.com',
                name: currentUser?.name || 'Dani Grindr',
                organizations: organizations.map((o) => ({ id: o.id, name: o.name, role: 'owner' }))
              };
            }
            break;

          case '/api/v1/users/{user_id}':
            if (selectedEndpoint.method === 'GET') {
              body = {
                id: urlParamVal,
                email: currentUser?.email || 'oradanigrindr@gmail.com',
                name: currentUser?.name || 'Dani Grindr',
                verified: true
              };
            } else if (selectedEndpoint.method === 'PUT') {
              if (currentUser) {
                const updated = {
                  ...currentUser,
                  name: parsedBody.name || currentUser.name,
                  email: parsedBody.email || currentUser.email
                };
                setCurrentUser(updated);
                body = {
                  id: updated.id,
                  email: updated.email,
                  name: updated.name,
                  updated_at: new Date().toISOString()
                };
              } else {
                body = {
                  id: urlParamVal,
                  email: parsedBody.email || 'updated@domain.com',
                  name: parsedBody.name || 'Updated User'
                };
              }
            }
            break;

          case '/api/v1/organizations':
            if (selectedEndpoint.method === 'GET') {
              body = {
                organizations: organizations.map((org) => ({
                  id: org.id,
                  name: org.name,
                  slug: org.slug,
                  plan: org.plan
                }))
              };
            } else if (selectedEndpoint.method === 'POST') {
              const newOrg: D1Organization = {
                id: `org_${Math.random().toString(36).substring(2, 7)}`,
                name: parsedBody.name || 'New Organization',
                slug: parsedBody.slug || 'new-org',
                owner_id: currentUser?.id || 'user_123',
                plan: (parsedBody.plan as any) || 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setOrganizations((prev) => [newOrg, ...prev]);
              body = {
                id: newOrg.id,
                name: newOrg.name,
                plan: newOrg.plan,
                created_at: newOrg.created_at
              };
            }
            break;

          case '/api/v1/media/upload':
            const newMedia: D1Media = {
              id: `media_${Math.random().toString(36).substring(2, 6)}`,
              organization_id: organizations[0]?.id || 'org_cerebro',
              uploaded_by: currentUser?.id || 'user_123',
              filename: parsedBody.filename || 'uploaded-asset.png',
              mime_type: parsedBody.mime_type || 'image/png',
              size: Number(parsedBody.size) || 124500,
              storage_path: `uploads/${parsedBody.filename || 'uploaded-asset.png'}`,
              r2_key: `cerebrocentral/media/${parsedBody.filename || 'uploaded-asset.png'}`,
              visibility: 'public',
              created_at: new Date().toISOString()
            };
            setMediaList((prev) => [newMedia, ...prev]);
            body = {
              id: newMedia.id,
              url: `https://r2.cerebrocentral.com/${newMedia.filename}`,
              filename: newMedia.filename,
              size: newMedia.size,
              r2_key: newMedia.r2_key
            };
            break;

          case '/api/v1/media':
            body = {
              media: mediaList.map((m) => ({
                id: m.id,
                url: `https://r2.cerebrocentral.com/${m.filename}`,
                filename: m.filename,
                size: m.size,
                visibility: m.visibility
              }))
            };
            break;

          case '/api/v1/webhooks/stripe':
            const stripeLog: D1WebhookLog = {
              id: `wh_log_${Date.now()}`,
              provider: 'stripe',
              event_type: parsedBody.type || 'payment.event',
              payload: JSON.stringify(parsedBody),
              response_status: 200,
              created_at: new Date().toISOString()
            };
            setWebhookLogs((prev) => [stripeLog, ...prev]);

            const queuedStripe: QueuedWebhook = {
              id: `do_wh_${Math.random().toString(36).substring(2, 7)}`,
              provider: 'stripe',
              event_type: parsedBody.type || 'payment.event',
              status: 'completed',
              attempts: 1,
              payload: parsedBody,
              received_at: new Date().toISOString(),
              processed_at: new Date().toISOString()
            };
            setQueuedWebhooks((prev) => [queuedStripe, ...prev]);

            body = {
              received: true,
              queued_in_durable_object: true,
              handler: 'WebhookQueue.enqueue'
            };
            break;

          case '/api/v1/webhooks/whatsapp':
            const waLog: D1WebhookLog = {
              id: `wh_wa_${Date.now()}`,
              provider: 'whatsapp',
              event_type: 'whatsapp.message',
              payload: JSON.stringify(parsedBody),
              response_status: 200,
              created_at: new Date().toISOString()
            };
            setWebhookLogs((prev) => [waLog, ...prev]);

            const queuedWa: QueuedWebhook = {
              id: `do_wa_${Math.random().toString(36).substring(2, 7)}`,
              provider: 'whatsapp',
              event_type: 'whatsapp.message',
              status: 'completed',
              attempts: 1,
              payload: parsedBody,
              received_at: new Date().toISOString(),
              processed_at: new Date().toISOString()
            };
            setQueuedWebhooks((prev) => [queuedWa, ...prev]);

            body = {
              received: true,
              queued_in_durable_object: true,
              handler: 'WebhookQueue.enqueue'
            };
            break;

          case '/api/v1/auth/refresh':
            body = {
              access_token: `cf_jwt_${Math.random().toString(36).substring(2, 14)}`,
              token_type: 'bearer',
              expires_in: 86400
            };
            break;

          case '/api/v1/organizations/{org_id}':
            const foundOrg = organizations.find((o) => o.id === urlParamVal) || organizations[0];
            body = {
              id: foundOrg?.id || 'org_cerebro',
              name: foundOrg?.name || 'Cerebrocentral HQ',
              slug: foundOrg?.slug || 'cerebrocentral-hq',
              plan: foundOrg?.plan || 'free',
              members_count: 3,
              created_at: foundOrg?.created_at || '2024-01-15T10:22:00Z'
            };
            break;

          case '/api/v1/media/{media_id}':
            if (selectedEndpoint.method === 'DELETE') {
              setMediaList((prev) => prev.filter((m) => m.id !== urlParamVal));
              body = { message: `Object ${urlParamVal} deleted successfully from R2` };
            } else {
              const foundMedia = mediaList.find((m) => m.id === urlParamVal) || mediaList[0];
              body = {
                id: foundMedia?.id || 'media_101',
                filename: foundMedia?.filename || 'architecture-diagram-edge.png',
                url: `https://r2.cerebrocentral.com/${foundMedia?.filename || 'file.png'}`,
                mime_type: foundMedia?.mime_type || 'image/png',
                size: foundMedia?.size || 245890,
                visibility: foundMedia?.visibility || 'public'
              };
            }
            break;

          case '/api/v1/integrations':
            body = {
              integrations: [
                { id: 'int_stripe', provider: 'stripe', status: 'connected', connected_at: '2024-01-20T14:00:00Z' },
                { id: 'int_whatsapp', provider: 'whatsapp', status: 'connected', connected_at: '2024-01-22T09:30:00Z' },
                { id: 'int_instagram', provider: 'instagram', status: 'disconnected' }
              ]
            };
            break;

          case '/api/v1/integrations/connect':
            body = {
              id: `int_${parsedBody.provider || 'service'}`,
              provider: parsedBody.provider || 'custom',
              status: 'connected',
              connected_at: new Date().toISOString()
            };
            break;

          case '/api/v1/integrations/disconnect':
            body = {
              message: `Integration ${parsedBody.provider || 'provider'} disconnected successfully`
            };
            break;

          case '/api/v1/webhooks/instagram':
            const igLog: D1WebhookLog = {
              id: `wh_ig_${Date.now()}`,
              provider: 'instagram',
              event_type: 'instagram.mention',
              payload: JSON.stringify(parsedBody),
              response_status: 200,
              created_at: new Date().toISOString()
            };
            setWebhookLogs((prev) => [igLog, ...prev]);

            body = {
              received: true,
              provider: 'instagram',
              queued_in_durable_object: true
            };
            break;
        }
      } catch (err: any) {
        status = 500;
        body = { error: 'Internal Server Error', detail: err.message, status: 500 };
      }

      const elapsed = Math.round(performance.now() - startTime + 8); // edge baseline

      setResponseStatus(status);
      setResponseBody(body);
      setExecutionTime(elapsed);
      setResponseHeaders({
        'content-type': 'application/json',
        'server': 'cloudflare',
        'cf-ray': rayId,
        'cf-cache-status': selectedEndpoint.method === 'GET' ? 'HIT' : 'DYNAMIC',
        'access-control-allow-origin': envMode === 'production' ? 'https://cerebrocentral.com' : 'http://localhost:3000'
      });
      setIsExecuting(false);
    }, 200);
  };

  const handleCopyResponse = () => {
    if (!responseBody) return;
    navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getFullUrl = () => {
    const base = envMode === 'production' ? 'https://api.cerebrocentral.com' : 'http://localhost:8000';
    let path = selectedEndpoint.path;
    if (path.includes('{user_id}')) {
      path = path.replace('{user_id}', urlParamVal);
    }
    if (path.includes('{org_id}')) {
      path = path.replace('{org_id}', urlParamVal);
    }
    if (path.includes('{media_id}')) {
      path = path.replace('{media_id}', urlParamVal);
    }
    return `${base}${path}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Description Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">FastAPI Interactive Runner</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              Python 3.11 on Workers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test real HTTP operations against the Python FastAPI backend with live state persistence
            into D1 and R2.
          </p>
        </div>

        {/* Current Auth Token preview */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-slate-400">Bearer Token:</span>
          {token ? (
            <span className="text-emerald-400 truncate max-w-[140px]">{token}</span>
          ) : (
            <span className="text-slate-500 italic">None (Execute /login)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Endpoint Directory */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-orange-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredEndpoints.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}-${idx}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full p-2.5 rounded-lg text-left transition-colors border text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-orange-500/80 shadow-xs'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/40'
                          : ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200 truncate">{ep.path}</span>
                  </div>
                  {ep.requiresAuth && (
                    <span title="Requires Auth">
                      <Lock className="w-3 h-3 text-slate-500 shrink-0 ml-1.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Request & Response Playground */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                HTTP Request
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedEndpoint.summary}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold text-xs px-2.5 py-1.5 rounded ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800/40'
                    : selectedEndpoint.method === 'POST'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                }`}
              >
                {selectedEndpoint.method}
              </span>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 truncate">
                {getFullUrl()}
              </div>

              <button
                onClick={executeRequest}
                disabled={isExecuting}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium text-xs rounded-md flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isExecuting ? (
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* URL Parameter Editor if applicable */}
            {selectedEndpoint.path.includes('{') && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs">
                <span className="text-slate-400 font-mono font-medium">
                  Param {selectedEndpoint.path.match(/\{([^}]+)\}/)?.[0] || 'ID'}:
                </span>
                <input
                  type="text"
                  value={urlParamVal}
                  onChange={(e) => setUrlParamVal(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono text-xs w-48 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            )}

            {/* Request Body Editor */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1 block">
                  JSON Payload
                </label>
                <textarea
                  rows={5}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  HTTP Response
                </span>
                {responseStatus !== null && (
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-red-950 text-red-400 border border-red-800/40'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : 'Error'}
                  </span>
                )}
                {executionTime !== null && (
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {executionTime} ms
                  </span>
                )}
              </div>

              {responseBody && (
                <button
                  onClick={handleCopyResponse}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {responseBody ? (
              <div className="space-y-3">
                {/* Headers bar */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  {Object.entries(responseHeaders).map(([k, v]) => (
                    <span key={k} className="bg-slate-900 px-1.5 py-0.5 rounded">
                      <span className="text-slate-500">{k}:</span> {v}
                    </span>
                  ))}
                </div>

                {/* Formatted JSON Body */}
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-h-[300px]">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click <span className="font-semibold text-slate-400">"Send"</span> above to dispatch request to {envMode === 'production' ? 'Cloudflare Workers Edge' : 'Local Uvicorn Container'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
