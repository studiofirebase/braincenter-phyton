# 🚀 MIGRAÇÃO: Next.js + Python | Frontend + Backend no Cloudflare (FREE)

## ARQUITETURA FINAL

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE EDGE (FREE)                      │
├─────────────────────────────────────────────────────────────────┤
│  • Wrangler Workers (Backend API Python via Durable Objects)    │
│  • D1 Database (PostgreSQL)                                     │
│  • R2 Storage (arquivos públicos/privados)                      │
│  • KV Namespace (cache, sessions, rate limit)                   │
│  • Email Routing (para webhooks de email)                       │
│  • Pages (Frontend Next.js estático/SSR)                        │
└─────────────────────────────────────────────────────────────────┘
         ↑                                    ↑
         │                                    │
    Frontend (Pages)                    Backend (Workers)
    Next.js SSG/ISR                     Python FastAPI
    Vercel OR CF Pages                  Durable Objects
```

## STACK FINAL

| Componente | Tecnologia | Host | Custo |
|-----------|-----------|------|--------|
| Frontend | Next.js 15 | Cloudflare Pages | FREE |
| Backend | Python FastAPI via Wrangler | Cloudflare Workers | FREE |
| DB | PostgreSQL | Cloudflare D1 | FREE |
| Storage | Arquivos | Cloudflare R2 | FREE |
| Cache/Fila | KV + Durable Objects | Cloudflare | FREE |
| Autenticação | Supabase Auth (opcional) | Supabase | FREE |
| DNS/CDN | Cloudflare | Cloudflare | FREE |
| **TOTAL/MÊS** | | | **$0** |

---

## FASE 1: SETUP CLOUDFLARE + MONOREPO

### 1.1 Criar conta Cloudflare

```bash
# 1. Criar conta (grátis)
# https://dash.cloudflare.com/sign-up

# 2. Instalar Wrangler CLI
npm install -g wrangler

# 3. Autenticar
wrangler login
```

### 1.2 Estrutura do Monorepo

```bash
git clone https://github.com/studiofirebase/cerebrocentral.com
cd cerebrocentral.com

# Criar estrutura
mkdir -p packages/{frontend,backend,shared}
mkdir -p .github/workflows

# Estrutura final
cerebrocentral.com/
├── packages/
│   ├── frontend/           # Next.js App
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── wrangler.toml   # Deploy em CF Pages
│   │
│   ├── backend/            # Python FastAPI (como Worker)
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── index.py
│   │   ├── pyproject.toml
│   │   ├── requirements.txt
│   │   ├── wrangler.toml   # Deploy em CF Workers
│   │   └── Dockerfile     # Para dev local
│   │
│   └── shared/             # Types compartilhados
│       ├── types.ts
│       └── schemas.ts
│
├── infra/
│   ├── cloudflare/
│   │   ├── d1-schema.sql
│   │   ├── wrangler-config.json
│   │   └── env.example
│   ├── migrations/
│   └── scripts/
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── docker-compose.yml      # Dev local
├── pnpm-workspace.yaml     # Monorepo
└── MIGRATION_PLAN.md       # Este arquivo
```

---

## FASE 2: BACKEND PYTHON EM CLOUDFLARE WORKERS

### 2.1 Setup FastAPI for Cloudflare Workers

**Create: `packages/backend/pyproject.toml`**

```toml
[build-system]
requires = ["setuptools>=65.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "cerebrocentral-api"
version = "2.0.0"
description = "Cerebrocentral API - Python on Cloudflare Workers"
requires-python = ">=3.9"
dependencies = [
    "fastapi==0.104.1",
    "pydantic==2.5.0",
    "pydantic-settings==2.1.0",
    "pydantic-extra-types==2.3.0",
    "httpx==0.25.2",
    "psycopg2-binary==2.9.9",
    "sqlalchemy==2.0.23",
    "alembic==1.13.0",
    "cryptography==41.0.7",
    "python-multipart==0.0.6",
    "python-dotenv==1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest==7.4.3",
    "pytest-asyncio==0.21.1",
    "black==23.12.0",
    "ruff==0.1.8",
    "mypy==1.7.1",
]
```

**Create: `packages/backend/wrangler.toml`**

```toml
name = "cerebrocentral-api"
main = "src/index.py"
compatibility_date = "2024-01-15"
compatibility_flags = ["python_workers"]

# Ambiente de produção
[env.production]
name = "cerebrocentral-api-prod"
routes = [
  { pattern = "api.cerebrocentral.com/*", zone_name = "cerebrocentral.com" }
]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "cerebrocentral"
database_id = "your-d1-id"

# R2 Storage
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "cerebrocentral"

# KV Namespace (Cache)
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

# KV Namespace (Sessions)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-namespace-id"

# Durable Objects
[durable_objects]
bindings = [
  { name = "WEBHOOK_QUEUE", class_name = "WebhookQueue" }
]

# Environment Variables
[env.production.vars]
ENVIRONMENT = "production"
DEBUG = false

[env.production.secrets]
# Estas são injetadas via wrangler secret put
DATABASE_URL = ""
SUPABASE_JWT_SECRET = ""
STRIPE_SECRET_KEY = ""
```

### 2.2 FastAPI Backend

**Create: `packages/backend/src/index.py`**

```python
"""
FastAPI aplicação rodando em Cloudflare Workers via Wrangler
Compatível com @planetscale/database para D1
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional
import json

app = FastAPI(
    title="Cerebrocentral API",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cerebrocentral.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== ENDPOINTS ==============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "local")
    }

@app.get("/api/v1/")
async def api_root():
    """API root"""
    return {
        "message": "Cerebrocentral API v2",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "media": "/api/v1/media",
            "organizations": "/api/v1/organizations"
        }
    }

# ============== AUTH ==============

@app.post("/api/v1/auth/login")
async def login(request: Request):
    """Login user"""
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Missing email or password")
        
        # TODO: Integrar com Supabase Auth ou DB
        return {
            "access_token": "fake_token_123",
            "token_type": "bearer",
            "user": {
                "id": "user_123",
                "email": email,
                "name": "Test User"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/auth/logout")
async def logout(request: Request):
    """Logout user"""
    return {"message": "Logged out"}

@app.get("/api/v1/auth/me")
async def get_current_user(request: Request):
    """Get current user"""
    # TODO: Validar token
    return {
        "id": "user_123",
        "email": "user@example.com",
        "name": "Test User",
        "organizations": []
    }

# ============== USERS ==============

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str, request: Request):
    """Get user by ID"""
    return {
        "id": user_id,
        "email": "user@example.com",
        "name": "Test User"
    }

@app.put("/api/v1/users/{user_id}")
async def update_user(user_id: str, request: Request):
    """Update user"""
    data = await request.json()
    return {
        "id": user_id,
        "email": data.get("email"),
        "name": data.get("name")
    }

# ============== ORGANIZATIONS ==============

@app.get("/api/v1/organizations")
async def list_organizations(request: Request):
    """List organizations"""
    return {
        "organizations": [
            {
                "id": "org_1",
                "name": "My Org",
                "plan": "free"
            }
        ]
    }

@app.post("/api/v1/organizations")
async def create_organization(request: Request):
    """Create organization"""
    data = await request.json()
    return {
        "id": "org_new",
        "name": data.get("name"),
        "plan": "free",
        "created_at": "2024-01-01T00:00:00Z"
    }

# ============== MEDIA ==============

@app.post("/api/v1/media/upload")
async def upload_media(request: Request):
    """Upload media to R2"""
    try:
        form = await request.form()
        file = form.get("file")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # TODO: Upload para R2 via env.BUCKET
        return {
            "id": "media_123",
            "url": f"https://r2.cerebrocentral.com/{file.filename}",
            "filename": file.filename,
            "size": file.size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/media")
async def list_media(request: Request):
    """List media files"""
    return {
        "media": [
            {
                "id": "media_1",
                "url": "https://r2.cerebrocentral.com/file1.jpg",
                "filename": "file1.jpg"
            }
        ]
    }

# ============== WEBHOOKS ==============

@app.post("/api/v1/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        event = await request.json()
        event_type = event.get("type")
        
        # TODO: Queue webhook para processamento
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle WhatsApp webhooks"""
    try:
        data = await request.json()
        
        # TODO: Queue webhook para processamento
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== ERROR HANDLING ==============

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status": 500
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2.3 Database Schema (D1)

**Create: `infra/cloudflare/d1-schema.sql`**

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (\n  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE(user_id, organization_id)
);

-- Media/Uploads
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  storage_path TEXT NOT NULL,
  r2_key TEXT,
  visibility TEXT DEFAULT 'private',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  metadata TEXT,
  connected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  UNIQUE(organization_id, provider)
);

-- Webhooks Log
CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  provider TEXT,
  event_type TEXT,
  payload TEXT,
  response_status INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_org ON media(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
```

---

## FASE 3: FRONTEND NEXT.JS EM CLOUDFLARE PAGES

### 3.1 Next.js Setup

**Create: `packages/frontend/wrangler.toml`**

```toml
name = "cerebrocentral-web"
type = "javascript"
compatibility_date = "2024-01-15"

# Build command
build = { command = "npm run build" }
main = "build/index.js"

# Routes
routes = [
  { pattern = "cerebrocentral.com/*" }
]

# Environment
[env.production]
name = "cerebrocentral-web-prod"

[env.production.vars]
NEXT_PUBLIC_API_URL = "https://api.cerebrocentral.com"
NEXT_PUBLIC_ENVIRONMENT = "production"
```

**Create: `packages/frontend/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output static para CF Pages
  output: 'export',
  
  // Images
  images: {
    unoptimized: true,
    domains: [
      'r2.cerebrocentral.com',
      'cdn.cerebrocentral.com'
    ]
  },
  
  // Environment
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // Experimental
  experimental: {
    optimizePackageImports: ["@radix-ui/react-dialog"],
  },
};

module.exports = nextConfig;
```

**Create: `packages/frontend/package.json`**

```json
{
  "name": "cerebrocentral-web",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.500.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-slot": "^2.0.2",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

### 3.2 Frontend Structure

**Create: `packages/frontend/app/layout.tsx`**

```typescript
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Cerebrocentral',
  description: 'Your SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Create: `packages/frontend/app/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('checking...');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('/api/v1/');
        setApiStatus(res.ok ? 'connected' : 'error');
      } catch {
        setApiStatus('offline');
      }
    };
    checkApi();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Cerebrocentral</h1>
          <p className="text-xl text-gray-400">Next.js + Python on Cloudflare</p>
          <div className="text-sm">
            API Status: <span className={apiStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
              {apiStatus}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-slate-700"
          >
            Sign Up
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-2">⚡ Fast</h3>
            <p className="text-gray-400">Hosted on Cloudflare Edge Network</p>
          </div>
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-2">🔐 Secure</h3>
            <p className="text-gray-400">Built-in Cloudflare DDoS protection</p>
          </div>
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-2">💰 Free</h3>
            <p className="text-gray-400">100% free tier with generous limits</p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

**Create: `packages/frontend/app/dashboard/page.tsx`**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';

export default function Dashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.get('/api/v1/auth/me'),
  });

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiClient.get('/api/v1/organizations'),
  });

  const { data: media } = useQuery({
    queryKey: ['media'],
    queryFn: () => apiClient.get('/api/v1/media'),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-2">Organizations</h3>
          <p className="text-3xl font-bold">{orgs?.data?.organizations?.length || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-2">Media Files</h3>
          <p className="text-3xl font-bold">{media?.data?.media?.length || 0}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm text-gray-600 mb-2">Plan</h3>
          <p className="text-3xl font-bold">Free</p>
        </Card>
      </div>
    </div>
  );
}
```

**Create: `packages/frontend/lib/api-client.ts`**

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Create: `packages/frontend/components/providers.tsx`**

```typescript
'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## FASE 4: DEPLOY EM CLOUDFLARE

### 4.1 Preparar Cloudflare

```bash
# 1. Criar D1 Database
wrangler d1 create cerebrocentral

# Output:
# ✔ Successfully created DB 'd1_cerebrocentral'
# Database ID: xxx-xxx-xxx

# 2. Criar R2 Bucket
wrangler r2 bucket create cerebrocentral

# 3. Criar KV Namespaces
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "SESSIONS"

# 4. Adicionar secrets
wrangler secret put DATABASE_URL
wrangler secret put SUPABASE_JWT_SECRET
wrangler secret put STRIPE_SECRET_KEY

# 5. Criar Durable Object para fila de webhooks
# (será feito via wrangler.toml)
```

### 4.2 Deploy Backend

**Create: `.github/workflows/deploy-backend.yml`**

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'packages/backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Wrangler
        run: npm install -g wrangler

      - name: Deploy to Cloudflare Workers
        working-directory: packages/backend
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          wrangler deploy --env production
```

### 4.3 Deploy Frontend

**Create: `.github/workflows/deploy-frontend.yml`**

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'packages/frontend/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: packages/frontend
        run: npm ci

      - name: Build
        working-directory: packages/frontend
        run: npm run build

      - name: Deploy to Cloudflare Pages
        working-directory: packages/frontend
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          npm install -g wrangler
          wrangler pages deploy out --project-name cerebrocentral-web
```

---

## FASE 5: SETUP LOCAL + DEVELOPMENT

### 5.1 Docker Compose (Desenvolvimento Local)

**Create: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  # Backend Python
  api:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DEBUG: "true"
      DATABASE_URL: "sqlite:///db.sqlite3"
    volumes:
      - ./packages/backend:/app
    command: uvicorn src.index:app --host 0.0.0.0 --port 8000 --reload

  # Frontend Next.js
  web:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:8000"
    volumes:
      - ./packages/frontend:/app
      - /app/node_modules
    command: npm run dev

  # SQLite (Dev Database)
  db:
    image: nouchka/sqlite3:latest
    volumes:
      - ./data/db.sqlite3:/root/db.sqlite3
    ports:
      - "5432:5432"
```

**Create: `packages/backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.index:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create: `packages/frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### 5.2 Start Local Development

```bash
# 1. Clone + setup
git clone https://github.com/studiofirebase/cerebrocentral.com
cd cerebrocentral.com

# 2. Install dependencies
cd packages/backend
pip install -r requirements.txt

cd ../frontend
npm install

# 3. Run com Docker Compose
cd ../..
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

---

## FASE 6: ENVIRONMENT VARIABLES

**Create: `.env.local` (Development)**

```env
# Backend
ENVIRONMENT=local
DEBUG=true
DATABASE_URL=sqlite:///db.sqlite3

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=local

# Cloudflare (quando conectar)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
```

**Create: `.env.production` (Cloudflare)**

```env
# Backend
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=d1://cerebrocentral

# Frontend
NEXT_PUBLIC_API_URL=https://api.cerebrocentral.com
NEXT_PUBLIC_ENVIRONMENT=production

# Cloudflare Secrets (via wrangler secret put)
# STRIPE_SECRET_KEY=
# SUPABASE_JWT_SECRET=
```

---

## FASE 7: INFRAESTRUTURA + SEGURANÇA

### 7.1 Cloudflare Security (FREE)

```bash
# 1. DDoS Protection - AUTOMÁTICO (FREE)
# 2. WAF Rules - AUTOMÁTICO (FREE)
# 3. Rate Limiting - wrangler.toml

# 4. CORS Protection - código no FastAPI
# 5. HTTPS - AUTOMÁTICO (FREE)
# 6. DNS - GRÁTIS no Cloudflare
```

### 7.2 Database Migrations

**Create: `packages/backend/src/migrations/001_init.sql`**

```sql
-- Execute via: wrangler d1 execute cerebrocentral < migration.sql

-- Create tables (use o schema do arquivo anterior)
```

```bash
# Deploy migrations
wrangler d1 execute cerebrocentral < infra/cloudflare/d1-schema.sql
```

---

## FASE 8: OBSERVABILIDADE + MONITORAMENTO (FREE)

### 8.1 Cloudflare Analytics (FREE)

```bash
# Já incluído no plano free:
# - Page Views
# - Requests
# - Bandwidth
# - Errors
# - Performance Metrics
```

### 8.2 Logging

**Create: `packages/backend/src/utils/logger.py`**

```python
import json
import logging
from datetime import datetime

class CloudflareLogHandler(logging.Handler):
    def emit(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        print(json.dumps(log_data))

logger = logging.getLogger(__name__)
logger.addHandler(CloudflareLogHandler())
logger.setLevel(logging.INFO)
```

---

## CHECKLIST FINAL

### Setup Cloudflare
- [ ] Conta criada e domínio apontando
- [ ] D1 Database criado
- [ ] R2 Bucket criado
- [ ] KV Namespaces criado
- [ ] Wrangler configurado localmente

### Backend Python
- [ ] FastAPI setup
- [ ] Endpoints básicos implementados
- [ ] D1 Schema criado
- [ ] Migrations aplicadas
- [ ] Docker Compose funcionando

### Frontend Next.js
- [ ] Estrutura de pastas criada
- [ ] Layout + Pages setup
- [ ] TanStack Query configurado
- [ ] API Client criado
- [ ] Docker Compose funcionando

### CI/CD
- [ ] GitHub Actions workflow criado
- [ ] Secrets adicionados no GitHub
- [ ] Deploy automático configurado
- [ ] Produção testada

### Segurança
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Secrets protegidos
- [ ] HTTPS ativo

---

## CUSTOS FINAIS (FREE TIER)

| Serviço | Limite | Custo |
|---------|--------|-------|
| Cloudflare Pages | 500 build/mês | FREE |
| Cloudflare Workers | 100k request/dia | FREE |
| D1 Database | 5GB storage | FREE |
| R2 Storage | 10GB/mês | FREE |
| KV Namespace | 100k r/d | FREE |
| Durable Objects | Limitado | FREE* |
| DNS | Unlimited | FREE |
| CDN/WAF | Unlimited | FREE |
| **TOTAL/MÊS** | | **$0** |

*Durable Objects com limite de free tier, mas suficiente para começar

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar setup local** com `docker-compose up`
2. **Testar endpoints** em http://localhost:8000/api/docs
3. **Push para GitHub** e conectar ao Cloudflare
4. **Configurar GitHub Secrets** para deploy automático
5. **Deploy em produção** no Cloudflare

**Está pronto para começar?** 🎯
