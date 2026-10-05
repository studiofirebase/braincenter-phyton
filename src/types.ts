export interface D1User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface D1Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface D1Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface D1Media {
  id: string;
  organization_id: string;
  uploaded_by: string;
  filename: string;
  mime_type: string;
  size: number;
  storage_path: string;
  r2_key: string;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface D1Integration {
  id: string;
  organization_id: string;
  provider: 'stripe' | 'whatsapp' | 'supabase' | 'github';
  access_token: string;
  refresh_token: string;
  expires_at: string;
  metadata: string;
  connected_at: string;
  created_at: string;
}

export interface D1WebhookLog {
  id: string;
  provider: string;
  event_type: string;
  payload: string;
  response_status: number;
  created_at: string;
}

export interface KvEntry {
  key: string;
  namespace: 'CACHE' | 'SESSIONS';
  value: string;
  ttlSeconds?: number;
  expiresAt?: string;
  hits: number;
  createdAt: string;
}

export interface QueuedWebhook {
  id: string;
  provider: 'stripe' | 'whatsapp';
  event_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  payload: Record<string, unknown>;
  received_at: string;
  processed_at?: string;
}

export interface ApiEndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  category: 'System' | 'Auth' | 'Users' | 'Organizations' | 'Media' | 'Integrations' | 'Webhooks';
  defaultBody?: Record<string, unknown>;
  defaultParams?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ChecklistTask {
  id: string;
  phaseId: number;
  title: string;
  command?: string;
  filePath?: string;
  description: string;
}

export interface SprintStep {
  id: string;
  stepNumber: number;
  phaseId: number;
  phaseName: string;
  phaseDuration: string;
  title: string;
  command?: string;
  filePath?: string;
  description: string;
  deliverable: string;
}

export interface MigrationPhase {
  id: number;
  title: string;
  summary: string;
  tasks: ChecklistTask[];
}
