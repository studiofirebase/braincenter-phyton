import {
  D1User,
  D1Organization,
  D1Membership,
  D1Media,
  D1Integration,
  D1WebhookLog,
  KvEntry,
  QueuedWebhook,
  ApiEndpointDef,
  MigrationPhase,
  SprintStep
} from '../types';

export const INITIAL_USERS: D1User[] = [
  {
    id: 'user_123',
    email: 'oradanigrindr@gmail.com',
    name: 'Dani Grindr',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    password_hash: '$2b$12$e6nB4...hashed',
    created_at: '2024-01-15 10:20:00',
    updated_at: '2024-02-01 14:15:00',
  },
  {
    id: 'user_studio',
    email: 'studiofirebase@cerebrocentral.com',
    name: 'Studio Firebase Admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    password_hash: '$2b$12$k92mQ...hashed',
    created_at: '2024-01-10 08:00:00',
    updated_at: '2024-02-10 11:30:00',
  },
  {
    id: 'user_analyst',
    email: 'dev@cerebrocentral.com',
    name: 'Cloud Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60',
    password_hash: '$2b$12$x43gZ...hashed',
    created_at: '2024-02-12 09:45:00',
    updated_at: '2024-02-12 09:45:00',
  }
];

export const INITIAL_ORGANIZATIONS: D1Organization[] = [
  {
    id: 'org_cerebro',
    name: 'Cerebrocentral HQ',
    slug: 'cerebrocentral-hq',
    owner_id: 'user_123',
    plan: 'free',
    created_at: '2024-01-15 10:22:00',
    updated_at: '2024-01-15 10:22:00',
  },
  {
    id: 'org_edge_lab',
    name: 'Cloudflare Edge Labs',
    slug: 'edge-labs',
    owner_id: 'user_studio',
    plan: 'free',
    created_at: '2024-02-01 15:30:00',
    updated_at: '2024-02-01 15:30:00',
  }
];

export const INITIAL_MEMBERSHIPS: D1Membership[] = [
  {
    id: 'mem_1',
    user_id: 'user_123',
    organization_id: 'org_cerebro',
    role: 'owner',
    created_at: '2024-01-15 10:22:00',
  },
  {
    id: 'mem_2',
    user_id: 'user_studio',
    organization_id: 'org_cerebro',
    role: 'admin',
    created_at: '2024-01-16 11:00:00',
  },
  {
    id: 'mem_3',
    user_id: 'user_studio',
    organization_id: 'org_edge_lab',
    role: 'owner',
    created_at: '2024-02-01 15:30:00',
  }
];

export const INITIAL_MEDIA: D1Media[] = [
  {
    id: 'media_101',
    organization_id: 'org_cerebro',
    uploaded_by: 'user_123',
    filename: 'architecture-diagram-edge.png',
    mime_type: 'image/png',
    size: 245890,
    storage_path: 'uploads/2024/02/architecture-diagram-edge.png',
    r2_key: 'cerebrocentral/media/architecture-diagram-edge.png',
    visibility: 'public',
    created_at: '2024-02-14 18:20:00',
  },
  {
    id: 'media_102',
    organization_id: 'org_cerebro',
    uploaded_by: 'user_123',
    filename: 'd1-database-backup.sqlite',
    mime_type: 'application/x-sqlite3',
    size: 1420500,
    storage_path: 'backups/d1-database-backup.sqlite',
    r2_key: 'cerebrocentral/backups/d1-database-backup.sqlite',
    visibility: 'private',
    created_at: '2024-02-15 03:00:00',
  },
  {
    id: 'media_103',
    organization_id: 'org_edge_lab',
    uploaded_by: 'user_studio',
    filename: 'cloudflare-workers-benchmark.pdf',
    mime_type: 'application/pdf',
    size: 618400,
    storage_path: 'reports/cloudflare-workers-benchmark.pdf',
    r2_key: 'cerebrocentral/reports/cloudflare-workers-benchmark.pdf',
    visibility: 'public',
    created_at: '2024-02-18 12:10:00',
  }
];

export const INITIAL_INTEGRATIONS: D1Integration[] = [
  {
    id: 'int_stripe',
    organization_id: 'org_cerebro',
    provider: 'stripe',
    access_token: 'rk_live_cf_stripe_51290382901...',
    refresh_token: '',
    expires_at: '2028-12-31 23:59:59',
    metadata: '{"webhook_endpoint": "https://api.cerebrocentral.com/api/v1/webhooks/stripe", "events": ["checkout.session.completed"]}',
    connected_at: '2024-01-20 14:00:00',
    created_at: '2024-01-20 14:00:00',
  },
  {
    id: 'int_whatsapp',
    organization_id: 'org_cerebro',
    provider: 'whatsapp',
    access_token: 'EAAB...meta_wa_token',
    refresh_token: '',
    expires_at: '2025-06-30 00:00:00',
    metadata: '{"phone_number_id": "10492849102", "webhook_url": "https://api.cerebrocentral.com/api/v1/webhooks/whatsapp"}',
    connected_at: '2024-01-22 09:30:00',
    created_at: '2024-01-22 09:30:00',
  }
];

export const INITIAL_WEBHOOK_LOGS: D1WebhookLog[] = [
  {
    id: 'wh_log_001',
    provider: 'stripe',
    event_type: 'checkout.session.completed',
    payload: '{"id": "cs_test_a1b2c3d4", "amount_total": 0, "currency": "usd", "customer_email": "user@example.com"}',
    response_status: 200,
    created_at: '2024-02-19 14:22:10',
  },
  {
    id: 'wh_log_002',
    provider: 'whatsapp',
    event_type: 'messages.incoming',
    payload: '{"from": "5511999998888", "text": {"body": "Verificacao de status da API Cerebrocentral"}}',
    response_status: 200,
    created_at: '2024-02-19 15:10:05',
  }
];

export const INITIAL_KV_ENTRIES: KvEntry[] = [
  {
    key: 'api:v1:organizations',
    namespace: 'CACHE',
    value: '{"count": 2, "cached_at": "2024-02-20T12:00:00Z", "ttl": 300}',
    ttlSeconds: 300,
    expiresAt: '2026-10-05T10:05:00Z',
    hits: 142,
    createdAt: '2026-10-05T09:55:00Z',
  },
  {
    key: 'user:user_123:profile',
    namespace: 'CACHE',
    value: '{"id": "user_123", "role": "owner", "plan": "free"}',
    ttlSeconds: 600,
    expiresAt: '2026-10-05T10:10:00Z',
    hits: 89,
    createdAt: '2026-10-05T09:50:00Z',
  },
  {
    key: 'sess_fake_token_123',
    namespace: 'SESSIONS',
    value: '{"user_id": "user_123", "email": "oradanigrindr@gmail.com", "authenticated": true}',
    ttlSeconds: 86400,
    expiresAt: '2026-10-06T09:50:00Z',
    hits: 37,
    createdAt: '2026-10-05T09:50:00Z',
  }
];

export const INITIAL_QUEUED_WEBHOOKS: QueuedWebhook[] = [
  {
    id: 'wh_q_901',
    provider: 'stripe',
    event_type: 'customer.subscription.created',
    status: 'completed',
    attempts: 1,
    payload: { id: 'sub_123', plan: 'free_starter', customer: 'cus_89410' },
    received_at: '2026-10-05T09:30:12Z',
    processed_at: '2026-10-05T09:30:13Z',
  },
  {
    id: 'wh_q_902',
    provider: 'whatsapp',
    event_type: 'message.received',
    status: 'completed',
    attempts: 1,
    payload: { from: '+5511999887766', text: 'Healthcheck query' },
    received_at: '2026-10-05T09:35:40Z',
    processed_at: '2026-10-05T09:35:41Z',
  }
];

export const API_ENDPOINTS: ApiEndpointDef[] = [
  {
    method: 'GET',
    path: '/health',
    summary: 'Cloudflare Worker health and execution environment status',
    category: 'System'
  },
  {
    method: 'GET',
    path: '/api/v1/',
    summary: 'API root catalog listing available v1 resources',
    category: 'System'
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'User login returning Bearer token and profile',
    category: 'Auth',
    defaultBody: {
      email: 'oradanigrindr@gmail.com',
      password: 'password123'
    }
  },
  {
    method: 'POST',
    path: '/api/v1/auth/logout',
    summary: 'Invalidates session token from KV SESSIONS namespace',
    category: 'Auth',
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/v1/auth/me',
    summary: 'Inspect currently authenticated user session',
    category: 'Auth',
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/v1/users/{user_id}',
    summary: 'Retrieve user account details by ID from D1',
    category: 'Users',
    defaultParams: { user_id: 'user_123' }
  },
  {
    method: 'PUT',
    path: '/api/v1/users/{user_id}',
    summary: 'Update user name or email record in D1',
    category: 'Users',
    defaultParams: { user_id: 'user_123' },
    defaultBody: {
      name: 'Dani Grindr (Updated)',
      email: 'oradanigrindr@gmail.com'
    }
  },
  {
    method: 'GET',
    path: '/api/v1/organizations',
    summary: 'Query all organizations connected to the account',
    category: 'Organizations'
  },
  {
    method: 'POST',
    path: '/api/v1/organizations',
    summary: 'Provision a new organization record in D1',
    category: 'Organizations',
    defaultBody: {
      name: 'Acme Edge Global',
      slug: 'acme-edge',
      plan: 'free'
    }
  },
  {
    method: 'POST',
    path: '/api/v1/media/upload',
    summary: 'Stream file upload to Cloudflare R2 bucket with key generation',
    category: 'Media',
    defaultBody: {
      filename: 'dashboard-preview.png',
      size: 420800,
      mime_type: 'image/png'
    }
  },
  {
    method: 'GET',
    path: '/api/v1/media',
    summary: 'List files stored in Cloudflare R2 bucket',
    category: 'Media'
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks/stripe',
    summary: 'Receive and queue Stripe payment webhook in Durable Object',
    category: 'Webhooks',
    defaultBody: {
      id: 'evt_stripe_sim_01',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer_email: 'customer@domain.com',
          amount: 0,
          currency: 'usd'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/auth/refresh',
    summary: 'Rotate JWT access token using valid refresh token',
    category: 'Auth',
    defaultBody: {
      refresh_token: 'cf_ref_sample_token_abc123'
    }
  },
  {
    method: 'GET',
    path: '/api/v1/organizations/{org_id}',
    summary: 'Inspect single organization and active team quota',
    category: 'Organizations',
    defaultParams: { org_id: 'org_cerebro' }
  },
  {
    method: 'GET',
    path: '/api/v1/media/{media_id}',
    summary: 'Retrieve metadata and signed URL for single R2 media file',
    category: 'Media',
    defaultParams: { media_id: 'media_101' }
  },
  {
    method: 'DELETE',
    path: '/api/v1/media/{media_id}',
    summary: 'Delete media object from Cloudflare R2 bucket and D1',
    category: 'Media',
    defaultParams: { media_id: 'media_101' }
  },
  {
    method: 'GET',
    path: '/api/v1/integrations',
    summary: 'Query all third-party integrations (Stripe, WhatsApp, Instagram)',
    category: 'Integrations'
  },
  {
    method: 'POST',
    path: '/api/v1/integrations/connect',
    summary: 'Authenticate and store API credentials for a third-party service',
    category: 'Integrations',
    defaultBody: {
      provider: 'instagram',
      access_token: 'IGQVJ...token'
    }
  },
  {
    method: 'POST',
    path: '/api/v1/integrations/disconnect',
    summary: 'Revoke external provider integration and purge cached keys',
    category: 'Integrations',
    defaultBody: {
      provider: 'instagram'
    }
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks/instagram',
    summary: 'Ingest Instagram Graph API webhooks and queue in Durable Object',
    category: 'Webhooks',
    defaultBody: {
      object: 'instagram',
      entry: [
        {
          id: 'ig_entry_01',
          time: 1718901234,
          messaging: [{ sender: { id: 'user_ig_01' }, message: { text: 'Inquiry via Instagram' } }]
        }
      ]
    }
  }
];

export const SPRINT_STEPS: SprintStep[] = [
  // FASE 1: SETUP BASE (1 dia)
  {
    id: 'sprint_1',
    stepNumber: 1,
    phaseId: 1,
    phaseName: 'Fase 1: Setup Base',
    phaseDuration: '1 dia',
    title: 'Instalar Wrangler CLI e autenticar na Cloudflare',
    command: 'npm install -g wrangler && wrangler login',
    description: 'Instala o CLI oficial da Cloudflare e autentica com o plano gratuito.',
    deliverable: 'Wrangler configurado com token de acesso ativo.'
  },
  {
    id: 'sprint_2',
    stepNumber: 2,
    phaseId: 1,
    phaseName: 'Fase 1: Setup Base',
    phaseDuration: '1 dia',
    title: 'Inicializar estrutura Monorepo com packages frontend e backend',
    command: 'mkdir -p packages/{frontend,backend,shared} infra/cloudflare .github/workflows',
    description: 'Organiza a separação de código entre Next.js 15, FastAPI e infraestrutura.',
    deliverable: 'Árvore de diretórios inicial criada.'
  },
  {
    id: 'sprint_3',
    stepNumber: 3,
    phaseId: 1,
    phaseName: 'Fase 1: Setup Base',
    phaseDuration: '1 dia',
    title: 'Configurar Docker Compose unificado e Dockerfile',
    filePath: 'docker-compose.yml',
    command: 'docker-compose up -d',
    description: 'Permite desenvolvimento local unindo FastAPI (porta 8000) e Next.js (porta 3000).',
    deliverable: 'Containers de dev rodando localmente com hot-reload.'
  },
  {
    id: 'sprint_4',
    stepNumber: 4,
    phaseId: 1,
    phaseName: 'Fase 1: Setup Base',
    phaseDuration: '1 dia',
    title: 'Definir arquivos de variáveis de ambiente base (.env.example)',
    filePath: 'packages/backend/.env.example',
    description: 'Configura templates para dev local e produção sem expor segredos.',
    deliverable: 'Arquivos .env.example para frontend e backend.'
  },

  // FASE 2: AUTENTICAÇÃO (2 dias)
  {
    id: 'sprint_5',
    stepNumber: 5,
    phaseId: 2,
    phaseName: 'Fase 2: Autenticação',
    phaseDuration: '2 dias',
    title: 'Implementar endpoint POST /api/v1/auth/login',
    filePath: 'packages/backend/src/index.py',
    description: 'Valida credenciais do usuário e retorna JWT Bearer token.',
    deliverable: 'Fluxo de login funcionando com resposta tokenizada.'
  },
  {
    id: 'sprint_6',
    stepNumber: 6,
    phaseId: 2,
    phaseName: 'Fase 2: Autenticação',
    phaseDuration: '2 dias',
    title: 'Implementar endpoint POST /api/v1/auth/logout',
    filePath: 'packages/backend/src/index.py',
    description: 'Invalida a sessão ativa diretamente no namespace KV SESSIONS.',
    deliverable: 'Revogação de token na edge.'
  },
  {
    id: 'sprint_7',
    stepNumber: 7,
    phaseId: 2,
    phaseName: 'Fase 2: Autenticação',
    phaseDuration: '2 dias',
    title: 'Implementar endpoint GET /api/v1/auth/me',
    filePath: 'packages/backend/src/index.py',
    description: 'Recupera o perfil do usuário logado e suas organizações vinculadas.',
    deliverable: 'Sessão do usuário validada em menos de 5ms.'
  },
  {
    id: 'sprint_8',
    stepNumber: 8,
    phaseId: 2,
    phaseName: 'Fase 2: Autenticação',
    phaseDuration: '2 dias',
    title: 'Implementar endpoint POST /api/v1/auth/refresh com interceptor Axios',
    filePath: 'packages/frontend/lib/api-client.ts',
    description: 'Renova access token automaticamente quando a API retorna status 401.',
    deliverable: 'Interceptor no cliente frontend com renovação transparente.'
  },

  // FASE 3: CORE FEATURES (5 dias)
  {
    id: 'sprint_9',
    stepNumber: 9,
    phaseId: 3,
    phaseName: 'Fase 3: Core Features',
    phaseDuration: '5 dias',
    title: 'Implementar CRUD de Usuários (GET e PUT /api/v1/users/{id})',
    filePath: 'packages/backend/src/index.py',
    description: 'Permite consulta e edição de perfil, nome e email com persistência no D1.',
    deliverable: 'Rotas de usuário ativas e testadas.'
  },
  {
    id: 'sprint_10',
    stepNumber: 10,
    phaseId: 3,
    phaseName: 'Fase 3: Core Features',
    phaseDuration: '5 dias',
    title: 'Implementar Multi-Tenancy com Organizations (GET, POST, GET /{id})',
    filePath: 'packages/backend/src/index.py',
    description: 'Criação de novos workspaces e segregação de tenants com slugs únicos.',
    deliverable: 'Isolamento de tenants por organização.'
  },
  {
    id: 'sprint_11',
    stepNumber: 11,
    phaseId: 3,
    phaseName: 'Fase 3: Core Features',
    phaseDuration: '5 dias',
    title: 'Vincular tabela Memberships com controle de roles (RBAC)',
    filePath: 'infra/cloudflare/d1-schema.sql',
    description: 'Suporte a papéis owner, admin e member por organização.',
    deliverable: 'Regras de acesso validadas por membership.'
  },
  {
    id: 'sprint_12',
    stepNumber: 12,
    phaseId: 3,
    phaseName: 'Fase 3: Core Features',
    phaseDuration: '5 dias',
    title: 'Implementar streaming de upload para Cloudflare R2 (/api/v1/media/upload)',
    filePath: 'packages/backend/src/index.py',
    description: 'Envia streams de arquivos diretamente para o bucket BUCKET sem custo de egress.',
    deliverable: 'Upload de imagens e PDFs integrado com R2.'
  },
  {
    id: 'sprint_13',
    stepNumber: 13,
    phaseId: 3,
    phaseName: 'Fase 3: Core Features',
    phaseDuration: '5 dias',
    title: 'Gestão de mídia pública vs privada e URLs assinadas (presigned)',
    filePath: 'packages/backend/src/index.py',
    description: 'Controle de visibilidade e geração de links seguros com expiração.',
    deliverable: 'Proteção de arquivos sensíveis com links assinados.'
  },

  // FASE 4: BANCO DE DADOS D1 (3 dias)
  {
    id: 'sprint_14',
    stepNumber: 14,
    phaseId: 4,
    phaseName: 'Fase 4: Banco de Dados D1',
    phaseDuration: '3 dias',
    title: 'Definir schema relacional SQLite em infra/cloudflare/d1-schema.sql',
    filePath: 'infra/cloudflare/d1-schema.sql',
    description: 'Tabelas users, organizations, memberships, media, integrations e webhook_logs.',
    deliverable: 'DDL relacional com integridade referencial.'
  },
  {
    id: 'sprint_15',
    stepNumber: 15,
    phaseId: 4,
    phaseName: 'Fase 4: Banco de Dados D1',
    phaseDuration: '3 dias',
    title: 'Criar banco serverless com wrangler d1 create cerebrocentral',
    command: 'wrangler d1 create cerebrocentral',
    description: 'Provisiona a instância de banco distribuído na Cloudflare com 5GB gratuitos.',
    deliverable: 'Database ID gerado e configurado no wrangler.toml.'
  },
  {
    id: 'sprint_16',
    stepNumber: 16,
    phaseId: 4,
    phaseName: 'Fase 4: Banco de Dados D1',
    phaseDuration: '3 dias',
    title: 'Executar migrações iniciais no D1 com wrangler d1 execute',
    command: 'wrangler d1 execute cerebrocentral --file=infra/cloudflare/d1-schema.sql',
    description: 'Aplica a estrutura de tabelas na edge de produção.',
    deliverable: 'Tabelas criadas com sucesso no D1.'
  },
  {
    id: 'sprint_17',
    stepNumber: 17,
    phaseId: 4,
    phaseName: 'Fase 4: Banco de Dados D1',
    phaseDuration: '3 dias',
    title: 'Validar 6 índices de performance (idx_users_email, etc.)',
    filePath: 'infra/cloudflare/d1-schema.sql',
    description: 'Garante consultas O(log N) em chaves de busca frequentes.',
    deliverable: 'Consultas D1 otimizadas com índices edge.'
  },

  // FASE 5: DEPLOY CLOUDFLARE (2 dias)
  {
    id: 'sprint_18',
    stepNumber: 18,
    phaseId: 5,
    phaseName: 'Fase 5: Deploy Cloudflare',
    phaseDuration: '2 dias',
    title: 'Criar bucket R2 cerebrocentral com zero taxas de tráfego',
    command: 'wrangler r2 bucket create cerebrocentral',
    description: 'Cria o storage compatível com S3 com 10GB/mês gratuitos.',
    deliverable: 'Bucket R2 pronto para uploads.'
  },
  {
    id: 'sprint_19',
    stepNumber: 19,
    phaseId: 5,
    phaseName: 'Fase 5: Deploy Cloudflare',
    phaseDuration: '2 dias',
    title: 'Criar namespaces KV para CACHE e SESSIONS',
    command: 'wrangler kv:namespace create "CACHE" && wrangler kv:namespace create "SESSIONS"',
    description: 'Cria os namespaces de cache ultra-rápido para a API.',
    deliverable: 'IDs de namespace vinculados no wrangler.toml.'
  },
  {
    id: 'sprint_20',
    stepNumber: 20,
    phaseId: 5,
    phaseName: 'Fase 5: Deploy Cloudflare',
    phaseDuration: '2 dias',
    title: 'Injetar secrets seguras via wrangler secret put',
    command: 'wrangler secret put DATABASE_URL && wrangler secret put STRIPE_SECRET_KEY',
    description: 'Criptografa chaves sensíveis diretamente no runtime do Worker.',
    deliverable: 'Segredos operacionais armazenados com segurança.'
  },
  {
    id: 'sprint_21',
    stepNumber: 21,
    phaseId: 5,
    phaseName: 'Fase 5: Deploy Cloudflare',
    phaseDuration: '2 dias',
    title: 'Deploy em produção do Backend e Frontend',
    command: 'cd packages/backend && wrangler deploy --env production\ncd ../frontend && wrangler pages deploy out --project-name cerebrocentral-web',
    description: 'Publica a API em api.cerebrocentral.com e a interface em cerebrocentral.com.',
    deliverable: 'Ambiente completo de produção no ar a $0/mês.'
  },

  // FASE 6: FEATURES EXTRAS (5 dias)
  {
    id: 'sprint_22',
    stepNumber: 22,
    phaseId: 6,
    phaseName: 'Fase 6: Features Extras',
    phaseDuration: '5 dias',
    title: 'Integrar Webhooks do Stripe com fila Durable Objects',
    filePath: 'packages/backend/src/index.py',
    description: 'Recebe eventos de checkout e assinatura com processamento assíncrono garantido.',
    deliverable: 'Fila WebhookQueue ativa com retentativas.'
  },
  {
    id: 'sprint_23',
    stepNumber: 23,
    phaseId: 6,
    phaseName: 'Fase 6: Features Extras',
    phaseDuration: '5 dias',
    title: 'Integrar Webhooks do WhatsApp Business API',
    filePath: 'packages/backend/src/index.py',
    description: 'Captura mensagens de leads e suporte com registro imediato no D1.',
    deliverable: 'Tratamento de eventos WhatsApp.'
  },
  {
    id: 'sprint_24',
    stepNumber: 24,
    phaseId: 6,
    phaseName: 'Fase 6: Features Extras',
    phaseDuration: '5 dias',
    title: 'Integrar Webhooks do Instagram Graph API (/api/v1/webhooks/instagram)',
    filePath: 'packages/backend/src/index.py',
    description: 'Recepção de notificações de menções, DMs e comentários em tempo real.',
    deliverable: 'Listener de eventos Instagram ativo.'
  },
  {
    id: 'sprint_25',
    stepNumber: 25,
    phaseId: 6,
    phaseName: 'Fase 6: Features Extras',
    phaseDuration: '5 dias',
    title: 'Implementar gerenciamento de conexões (/api/v1/integrations)',
    filePath: 'packages/backend/src/index.py',
    description: 'Listagem e conexão de serviços terceiros por organização.',
    deliverable: 'Painel de integrações operando.'
  },
  {
    id: 'sprint_26',
    stepNumber: 26,
    phaseId: 6,
    phaseName: 'Fase 6: Features Extras',
    phaseDuration: '5 dias',
    title: 'Fluxo de desconexão e revogação de tokens (/api/v1/integrations/disconnect)',
    filePath: 'packages/backend/src/index.py',
    description: 'Desconecta provedores e limpa tokens expirados com segurança.',
    deliverable: 'Ciclo completo de vida de integrações.'
  },

  // FASE 7: POLISHING & SEGURANÇA (3 dias)
  {
    id: 'sprint_27',
    stepNumber: 27,
    phaseId: 7,
    phaseName: 'Fase 7: Polishing & Segurança',
    phaseDuration: '3 dias',
    title: 'Configurar CORS restrito e políticas de segurança na Cloudflare',
    filePath: 'packages/backend/src/index.py',
    description: 'Permitir apenas origens autorizadas (cerebrocentral.com e localhost).',
    deliverable: 'CORS restrito e cabeçalhos de segurança HTTP.'
  },
  {
    id: 'sprint_28',
    stepNumber: 28,
    phaseId: 7,
    phaseName: 'Fase 7: Polishing & Segurança',
    phaseDuration: '3 dias',
    title: 'Ativar Rate Limiting na edge via KV para endpoints sensíveis',
    filePath: 'packages/backend/src/index.py',
    description: 'Protege /api/v1/auth/login e webhooks contra abuso e força bruta.',
    deliverable: 'Proteção contra abuso sem custo adicional.'
  },
  {
    id: 'sprint_29',
    stepNumber: 29,
    phaseId: 7,
    phaseName: 'Fase 7: Polishing & Segurança',
    phaseDuration: '3 dias',
    title: 'Automatizar CI/CD completo com GitHub Actions',
    filePath: '.github/workflows/deploy-backend.yml',
    description: 'Deploys automáticos a cada push na branch main com testes de lint.',
    deliverable: 'Pipeline de entrega contínua 100% automatizada.'
  },
  {
    id: 'sprint_30',
    stepNumber: 30,
    phaseId: 7,
    phaseName: 'Fase 7: Polishing & Segurança',
    phaseDuration: '3 dias',
    title: 'Teste de carga final e validação de limites do plano gratuito',
    command: 'curl -i https://api.cerebrocentral.com/health',
    description: 'Validação de SLAs de latência sub-15ms e monitoramento no Cloudflare Analytics.',
    deliverable: 'Plataforma Cerebrocentral validada e pronta para escala.'
  }
];

export const MIGRATION_PHASES: MigrationPhase[] = [
  {
    id: 1,
    title: 'Fase 1: Setup Cloudflare + Monorepo',
    summary: 'Criar conta Cloudflare gratuita, instalar Wrangler CLI e estruturar monorepo com packages frontend, backend e shared.',
    tasks: [
      {
        id: 'p1_1',
        phaseId: 1,
        title: 'Instalar Wrangler CLI globalmente',
        command: 'npm install -g wrangler',
        description: 'Instala o utilitário oficial de linha de comando da Cloudflare para gerenciar Workers, Pages, D1 e R2.'
      },
      {
        id: 'p1_2',
        phaseId: 1,
        title: 'Autenticar com a conta Cloudflare',
        command: 'wrangler login',
        description: 'Abre o navegador para autenticar o Wrangler com sua conta Cloudflare gratuita.'
      },
      {
        id: 'p1_3',
        phaseId: 1,
        title: 'Clonar repositório e criar diretórios',
        command: 'git clone https://github.com/studiofirebase/cerebrocentral.com\ncd cerebrocentral.com\nmkdir -p packages/{frontend,backend,shared} infra/cloudflare .github/workflows',
        description: 'Organiza a estrutura de monorepo separando frontend Next.js, backend Python FastAPI e infraestrutura.'
      }
    ]
  },
  {
    id: 2,
    title: 'Fase 2: Backend Python em Cloudflare Workers',
    summary: 'Configurar FastAPI com runtime Python Workers via Wrangler, definir rotas e schema relacional D1.',
    tasks: [
      {
        id: 'p2_1',
        phaseId: 2,
        title: 'Criar packages/backend/pyproject.toml',
        filePath: 'packages/backend/pyproject.toml',
        description: 'Define as dependências de produção: FastAPI, Pydantic, SQLAlchemy, psycopg2 e httpx.'
      },
      {
        id: 'p2_2',
        phaseId: 2,
        title: 'Criar packages/backend/wrangler.toml',
        filePath: 'packages/backend/wrangler.toml',
        description: 'Configura o worker com compatibility_flags=["python_workers"] e vincula DB (D1), BUCKET (R2) e CACHE/SESSIONS (KV).'
      },
      {
        id: 'p2_3',
        phaseId: 2,
        title: 'Implementar rotas FastAPI em packages/backend/src/index.py',
        filePath: 'packages/backend/src/index.py',
        description: 'Cria os endpoints /health, /api/v1/auth, /api/v1/users, /api/v1/organizations, /api/v1/media e webhooks.'
      },
      {
        id: 'p2_4',
        phaseId: 2,
        title: 'Criar schema D1 em infra/cloudflare/d1-schema.sql',
        filePath: 'infra/cloudflare/d1-schema.sql',
        description: 'DDL com tabelas users, organizations, memberships, media, integrations e webhook_logs com índices.'
      }
    ]
  },
  {
    id: 3,
    title: 'Fase 3: Frontend Next.js em Cloudflare Pages',
    summary: 'Configurar Next.js 15 para exportação estática/edge, TanStack Query e cliente Axios com Bearer tokens.',
    tasks: [
      {
        id: 'p3_1',
        phaseId: 3,
        title: 'Configurar next.config.js para output: "export"',
        filePath: 'packages/frontend/next.config.js',
        description: 'Habilita SSG compatível com Cloudflare Pages e configura domínios de imagens R2 sem custo adicional.'
      },
      {
        id: 'p3_2',
        phaseId: 3,
        title: 'Criar cliente de API em packages/frontend/lib/api-client.ts',
        filePath: 'packages/frontend/lib/api-client.ts',
        description: 'Axios com interceptors para injeção automática de Bearer token e redirecionamento 401.'
      },
      {
        id: 'p3_3',
        phaseId: 3,
        title: 'Implementar Dashboard em packages/frontend/app/dashboard/page.tsx',
        filePath: 'packages/frontend/app/dashboard/page.tsx',
        description: 'Interface consumindo endpoints do FastAPI com TanStack Query para renderização veloz.'
      }
    ]
  },
  {
    id: 4,
    title: 'Fase 4: Deploy de Recursos Cloudflare (D1, R2, KV)',
    summary: 'Provisionar banco de dados D1, bucket de arquivos R2, namespaces KV e injetar secrets com Wrangler.',
    tasks: [
      {
        id: 'p4_1',
        phaseId: 4,
        title: 'Criar Cloudflare D1 Database',
        command: 'wrangler d1 create cerebrocentral',
        description: 'Provisiona banco de dados serverless SQLite na edge com até 5GB no plano gratuito.'
      },
      {
        id: 'p4_2',
        phaseId: 4,
        title: 'Criar Cloudflare R2 Storage Bucket',
        command: 'wrangler r2 bucket create cerebrocentral',
        description: 'Bucket compatível com S3 com 10GB/mês grátis e ZERO taxas de tráfego de saída (egress).'
      },
      {
        id: 'p4_3',
        phaseId: 4,
        title: 'Criar Namespaces KV para Cache e Sessões',
        command: 'wrangler kv:namespace create "CACHE"\nwrangler kv:namespace create "SESSIONS"',
        description: 'Armazenamento chave-valor ultra-rápido global para cache de endpoints e tokens de sessão.'
      },
      {
        id: 'p4_4',
        phaseId: 4,
        title: 'Adicionar Secrets via Wrangler',
        command: 'wrangler secret put DATABASE_URL\nwrangler secret put SUPABASE_JWT_SECRET\nwrangler secret put STRIPE_SECRET_KEY',
        description: 'Criptografa chaves sensíveis diretamente no ambiente do Worker sem expor em repositórios.'
      }
    ]
  },
  {
    id: 5,
    title: 'Fase 5: Setup Local + Desenvolvimento',
    summary: 'Executar ambiente local de desenvolvimento com Docker Compose unindo FastAPI, Next.js e SQLite.',
    tasks: [
      {
        id: 'p5_1',
        phaseId: 5,
        title: 'Criar Dockerfile para Backend e Frontend',
        filePath: 'packages/backend/Dockerfile',
        description: 'Containers leves baseados em python:3.11-slim e node:20-alpine com hot-reload.'
      },
      {
        id: 'p5_2',
        phaseId: 5,
        title: 'Iniciar ambiente unificado',
        command: 'docker-compose up',
        description: 'Inicia FastAPI na porta 8000 (com docs em /api/docs) e Next.js na porta 3000.'
      }
    ]
  },
  {
    id: 6,
    title: 'Fase 6: Variáveis de Ambiente',
    summary: 'Configurar .env.local para desenvolvimento e variáveis de produção em Cloudflare Pages e Workers.',
    tasks: [
      {
        id: 'p6_1',
        phaseId: 6,
        title: 'Configurar .env.local',
        filePath: '.env.local',
        description: 'Define NEXT_PUBLIC_API_URL=http://localhost:8000 e DATABASE_URL=sqlite:///db.sqlite3.'
      },
      {
        id: 'p6_2',
        phaseId: 6,
        title: 'Configurar variáveis no painel Cloudflare',
        description: 'Definir NEXT_PUBLIC_API_URL=https://api.cerebrocentral.com no Cloudflare Pages.'
      }
    ]
  },
  {
    id: 7,
    title: 'Fase 7: Infraestrutura, Segurança e Migrações',
    summary: 'Aplicar DDL inicial no D1, ativar proteção DDoS e WAF automática da Cloudflare e CORS.',
    tasks: [
      {
        id: 'p7_1',
        phaseId: 7,
        title: 'Executar migrações SQL no Cloudflare D1',
        command: 'wrangler d1 execute cerebrocentral --file=infra/cloudflare/d1-schema.sql',
        description: 'Cria as 6 tabelas com foreign keys e 6 índices de performance na edge.'
      },
      {
        id: 'p7_2',
        phaseId: 7,
        title: 'Validar regras de CORS e WAF',
        description: 'FastAPI CORS middleware configurado para permitir requisições de cerebrocentral.com e localhost:3000.'
      }
    ]
  },
  {
    id: 8,
    title: 'Fase 8: Observabilidade, Monitoramento e CI/CD',
    summary: 'Configurar logs em formato JSON estruturado, Cloudflare Analytics gratuito e pipelines GitHub Actions.',
    tasks: [
      {
        id: 'p8_1',
        phaseId: 8,
        title: 'Criar pipeline GitHub Actions para Backend',
        filePath: '.github/workflows/deploy-backend.yml',
        description: 'Deploy automático a cada push na branch main usando CLOUDFLARE_API_TOKEN.'
      },
      {
        id: 'p8_2',
        phaseId: 8,
        title: 'Criar pipeline GitHub Actions para Frontend',
        filePath: '.github/workflows/deploy-frontend.yml',
        description: 'Build Next.js estático e deploy para Cloudflare Pages via wrangler pages deploy out.'
      },
      {
        id: 'p8_3',
        phaseId: 8,
        title: 'Acompanhar Cloudflare Analytics',
        description: 'Acessar painel Cloudflare para ver requisições, latência P99, taxa de cache e erros HTTP em tempo real.'
      }
    ]
  }
];
