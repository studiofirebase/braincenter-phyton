import React, { useState } from 'react';
import {
  Database,
  Play,
  RotateCw,
  Plus,
  Table as TableIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  D1User,
  D1Organization,
  D1Membership,
  D1Media,
  D1Integration,
  D1WebhookLog
} from '../types';

interface DatabaseStudioViewProps {
  users: D1User[];
  setUsers: React.Dispatch<React.SetStateAction<D1User[]>>;
  organizations: D1Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<D1Organization[]>>;
  memberships: D1Membership[];
  setMemberships: React.Dispatch<React.SetStateAction<D1Membership[]>>;
  mediaList: D1Media[];
  setMediaList: React.Dispatch<React.SetStateAction<D1Media[]>>;
  integrations: D1Integration[];
  webhookLogs: D1WebhookLog[];
}

export const DatabaseStudioView: React.FC<DatabaseStudioViewProps> = ({
  users,
  setUsers,
  organizations,
  setOrganizations,
  memberships,
  setMemberships,
  mediaList,
  setMediaList,
  integrations,
  webhookLogs
}) => {
  const [activeTable, setActiveTable] = useState<
    'users' | 'organizations' | 'memberships' | 'media' | 'integrations' | 'webhook_logs'
  >('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);
  const [isApplyingMigration, setIsApplyingMigration] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Record Modal
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');

  const tableList = [
    { name: 'users', count: users.length, description: 'User accounts & auth credentials' },
    { name: 'organizations', count: organizations.length, description: 'Tenants & workspaces' },
    { name: 'memberships', count: memberships.length, description: 'User-to-Organization RBAC roles' },
    { name: 'media', count: mediaList.length, description: 'R2 bucket file metadata records' },
    { name: 'integrations', count: integrations.length, description: 'Stripe, WhatsApp & API keys' },
    { name: 'webhook_logs', count: webhookLogs.length, description: 'Inbound webhook event receipts' }
  ];

  const presets = [
    { label: 'All Users', query: 'SELECT id, email, name, created_at FROM users;' },
    { label: 'All Organizations', query: 'SELECT id, name, slug, plan FROM organizations;' },
    {
      label: 'Memberships & Roles',
      query: 'SELECT u.email, o.name as org, m.role FROM memberships m JOIN users u ON m.user_id = u.id JOIN organizations o ON m.organization_id = o.id;'
    },
    { label: 'Public Media in R2', query: "SELECT filename, mime_type, size, r2_key FROM media WHERE visibility = 'public';" },
    { label: 'Recent Webhook Logs', query: 'SELECT provider, event_type, response_status, created_at FROM webhook_logs ORDER BY created_at DESC;' }
  ];

  const handleRunQuery = () => {
    setQueryError(null);
    const start = performance.now();

    setTimeout(() => {
      const q = sqlQuery.trim().toLowerCase();

      try {
        if (q.includes('from users')) {
          setQueryResult(users);
        } else if (q.includes('from organizations')) {
          setQueryResult(organizations);
        } else if (q.includes('from memberships')) {
          const joined = memberships.map((m) => {
            const u = users.find((user) => user.id === m.user_id);
            const o = organizations.find((org) => org.id === m.organization_id);
            return {
              email: u?.email || m.user_id,
              org: o?.name || m.organization_id,
              role: m.role,
              created_at: m.created_at
            };
          });
          setQueryResult(joined);
        } else if (q.includes('from media')) {
          if (q.includes("visibility = 'public'")) {
            setQueryResult(mediaList.filter((m) => m.visibility === 'public'));
          } else {
            setQueryResult(mediaList);
          }
        } else if (q.includes('from integrations')) {
          setQueryResult(integrations);
        } else if (q.includes('from webhook_logs')) {
          setQueryResult(webhookLogs);
        } else {
          setQueryResult(users);
        }
        setQueryExecutionTime(Math.round(performance.now() - start + 2)); // D1 edge simulation
      } catch (err: any) {
        setQueryError(err.message);
        setQueryResult(null);
      }
    }, 120);
  };

  const handleApplyMigration = () => {
    setIsApplyingMigration(true);
    setMigrationStatus(null);
    setTimeout(() => {
      setIsApplyingMigration(false);
      setMigrationStatus(
        'Migration 001_init.sql successfully applied to Cloudflare D1 (cerebrocentral). 6 tables and 6 indexes verified.'
      );
    }, 800);
  };

  const handleAddUser = () => {
    if (!newUserEmail.trim()) return;
    const newUser: D1User = {
      id: `user_${Math.random().toString(36).substring(2, 7)}`,
      email: newUserEmail,
      name: newUserName || 'Team Member',
      avatar_url: '',
      password_hash: '$2b$12$simulatedhash...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsAddingRecord(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleAddOrg = () => {
    if (!newOrgName.trim()) return;
    const newOrg: D1Organization = {
      id: `org_${Math.random().toString(36).substring(2, 7)}`,
      name: newOrgName,
      slug: newOrgSlug || newOrgName.toLowerCase().replace(/\s+/g, '-'),
      owner_id: users[0]?.id || '',
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setOrganizations((prev) => [newOrg, ...prev]);
    setIsAddingRecord(false);
    setNewOrgName('');
    setNewOrgSlug('');
  };

  const currentTableData = () => {
    switch (activeTable) {
      case 'users':
        return users.filter(
          (u) =>
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'organizations':
        return organizations.filter(
          (o) =>
            o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'memberships':
        return memberships;
      case 'media':
        return mediaList.filter((m) => m.filename.toLowerCase().includes(searchQuery.toLowerCase()));
      case 'integrations':
        return integrations;
      case 'webhook_logs':
        return webhookLogs.filter((w) => w.provider.toLowerCase().includes(searchQuery.toLowerCase()));
      default:
        return [];
    }
  };

  const rows = currentTableData();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Cloudflare D1 Database Studio</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">
              d1_cerebrocentral
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Serverless relational SQLite engine replicated globally across the Cloudflare edge network.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleApplyMigration}
            disabled={isApplyingMigration}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isApplyingMigration ? 'animate-spin text-orange-400' : ''}`} />
            <span>Apply 001_init.sql</span>
          </button>

          <button
            onClick={() => setIsAddingRecord(true)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert Row</span>
          </button>
        </div>
      </div>

      {migrationStatus && (
        <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{migrationStatus}</span>
        </div>
      )}

      {/* SQL Runner & Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Interactive SQL Console
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSqlQuery(p.query);
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            rows={2}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-orange-500"
          />
          <button
            onClick={handleRunQuery}
            className="px-4 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Execute</span>
          </button>
        </div>

        {/* Query execution timing or error */}
        {queryExecutionTime !== null && (
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Query returned {queryResult?.length || 0} rows in {queryExecutionTime}ms on D1 edge
            </span>
          </div>
        )}
        {queryError && (
          <div className="text-xs font-mono text-red-400 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{queryError}</span>
          </div>
        )}
      </div>

      {/* Main Table Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector List */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block px-1">
            D1 Tables
          </span>

          <div className="space-y-1">
            {tableList.map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => {
                  setActiveTable(tbl.name as any);
                  setSqlQuery(`SELECT * FROM ${tbl.name};`);
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between border ${
                  activeTable === tbl.name
                    ? 'bg-slate-800 border-orange-500/80 text-white shadow-xs'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-mono font-medium">{tbl.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{tbl.description}</div>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 tabular-nums">
                  {tbl.count}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">Active Indexes:</span>
            <ul className="space-y-1 font-mono text-[10px] text-slate-400">
              <li>· idx_users_email</li>
              <li>· idx_organizations_owner</li>
              <li>· idx_memberships_user</li>
              <li>· idx_memberships_org</li>
              <li>· idx_media_org</li>
              <li>· idx_integrations_org</li>
            </ul>
          </div>
        </div>

        {/* Table Records Grid */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold font-mono text-white">{activeTable}</span>
              <span className="text-xs text-slate-400 font-mono">({rows.length} records)</span>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                {activeTable === 'users' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Created At</th>
                  </tr>
                )}
                {activeTable === 'organizations' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Owner</th>
                    <th className="py-2.5 px-3">Plan</th>
                  </tr>
                )}
                {activeTable === 'memberships' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Organization ID</th>
                    <th className="py-2.5 px-3">Role</th>
                  </tr>
                )}
                {activeTable === 'media' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">MIME</th>
                    <th className="py-2.5 px-3">Size (KB)</th>
                    <th className="py-2.5 px-3">Visibility</th>
                    <th className="py-2.5 px-3">R2 Key</th>
                  </tr>
                )}
                {activeTable === 'integrations' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Access Token</th>
                    <th className="py-2.5 px-3">Expires At</th>
                  </tr>
                )}
                {activeTable === 'webhook_logs' && (
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Received At</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                      No records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  rows.map((row: any, i) => (
                    <tr key={row.id || i} className="hover:bg-slate-800/40 transition-colors font-mono">
                      {activeTable === 'users' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200">{row.email}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.name}</td>
                          <td className="py-2.5 px-3 text-slate-400 tabular-nums">{row.created_at}</td>
                        </>
                      )}
                      {activeTable === 'organizations' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200">{row.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.slug}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.owner_id}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                              {row.plan}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTable === 'memberships' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200">{row.user_id}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.organization_id}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                              {row.role}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTable === 'media' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200">{row.filename}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.mime_type}</td>
                          <td className="py-2.5 px-3 text-slate-300 tabular-nums">
                            {(row.size / 1024).toFixed(1)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[11px] px-1.5 py-0.5 rounded ${
                                row.visibility === 'public'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {row.visibility}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-[150px]">{row.r2_key}</td>
                        </>
                      )}
                      {activeTable === 'integrations' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200 uppercase">{row.provider}</td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-[200px]">{row.access_token}</td>
                          <td className="py-2.5 px-3 text-slate-400 tabular-nums">{row.expires_at}</td>
                        </>
                      )}
                      {activeTable === 'webhook_logs' && (
                        <>
                          <td className="py-2.5 px-3 text-orange-400">{row.id}</td>
                          <td className="py-2.5 px-3 text-slate-200">{row.provider}</td>
                          <td className="py-2.5 px-3 text-slate-300">{row.event_type}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                              {row.response_status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 tabular-nums">{row.created_at}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insert Record Modal */}
      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-white">Insert Record into D1</h3>
            <p className="text-xs text-slate-400">
              Select the target table and enter the values to commit directly to D1 SQLite database.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Table</label>
                <select
                  value={activeTable}
                  onChange={(e) => setActiveTable(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="users">users</option>
                  <option value="organizations">organizations</option>
                </select>
              </div>

              {activeTable === 'users' ? (
                <>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Maria Silva"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@cerebrocentral.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="e.g. Edge Enterprise"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Slug</label>
                    <input
                      type="text"
                      value={newOrgSlug}
                      onChange={(e) => setNewOrgSlug(e.target.value)}
                      placeholder="edge-enterprise"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAddingRecord(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={activeTable === 'users' ? handleAddUser : handleAddOrg}
                className="px-4 py-1.5 rounded text-xs font-medium bg-orange-600 hover:bg-orange-500 text-white"
              >
                Commit Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
