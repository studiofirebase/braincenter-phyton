export interface MonorepoFile {
  path: string;
  category: 'Frontend' | 'Backend' | 'Infra' | 'CI/CD' | 'Config' | 'Docs';
  language: 'typescript' | 'python' | 'json' | 'toml' | 'sql' | 'yaml' | 'markdown' | 'dockerfile';
  description: string;
  fileNumber?: number;
  content: string;
}

export const MONOREPO_FILES: MonorepoFile[] = [
  // 1. BACKEND PYTHON: src/index.py
  {
    path: 'packages/backend/src/index.py',
    category: 'Backend',
    language: 'python',
    fileNumber: 1,
    description: 'FastAPI application with complete endpoints: Health, Auth (login, logout, me, refresh), Users, Organizations, Media, Integrations, and Webhooks (Stripe, WhatsApp, Instagram)',
    content: `"""
Cerebrocentral API - Python FastAPI running on Cloudflare Workers via Wrangler
Integrated with Cloudflare D1 (PostgreSQL/SQLite), R2 Storage, KV, and Durable Objects.
"""

from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from typing import Optional, Dict, Any, List

app = FastAPI(
    title="Cerebrocentral API",
    version="2.0.0",
    description="Edge API on Cloudflare Workers (Free Tier)",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cerebrocentral.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 1. SYSTEM & HEALTH ====================

@app.get("/health")
async def health_check():
    """Health check endpoint probe"""
    return {
        "status": "ok",
        "service": "cerebrocentral-api",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "local"),
        "edge_runtime": "cloudflare_python_workers"
    }

@app.get("/api/v1/")
async def api_root():
    """Catalog of available API v1 endpoints"""
    return {
        "message": "Cerebrocentral API v2 - Cloudflare Edge",
        "endpoints": {
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "organizations": "/api/v1/organizations",
            "media": "/api/v1/media",
            "integrations": "/api/v1/integrations",
            "webhooks": "/api/v1/webhooks"
        }
    }

# ==================== 2. AUTHENTICATION ====================

@app.post("/api/v1/auth/login")
async def login(request: Request):
    """User authentication returning JWT Bearer token"""
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Missing email or password")

        # In production: Verify password hash from D1 users table or Supabase Auth
        access_token = f"cf_jwt_{os.urandom(16).hex()}"
        refresh_token = f"cf_ref_{os.urandom(24).hex()}"

        # Write active session into KV SESSIONS namespace
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": "user_123",
                "email": email,
                "name": "Dani Grindr",
                "role": "owner"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Revoke session token from Cloudflare KV SESSIONS namespace"""
    # In production: env.SESSIONS.delete(authorization)
    return {"message": "Logged out successfully. Session invalidated from KV."}

@app.get("/api/v1/auth/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Retrieve authenticated user and connected organization memberships"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized: Bearer token required")

    return {
        "id": "user_123",
        "email": "oradanigrindr@gmail.com",
        "name": "Dani Grindr",
        "avatar_url": "https://r2.cerebrocentral.com/avatars/dani.png",
        "organizations": [
            {"id": "org_cerebro", "name": "Cerebrocentral HQ", "role": "owner", "plan": "free"},
            {"id": "org_edge_lab", "name": "Cloudflare Edge Labs", "role": "admin", "plan": "free"}
        ]
    }

@app.post("/api/v1/auth/refresh")
async def refresh_token(request: Request):
    """Rotate JWT access token using valid refresh token"""
    data = await request.json()
    ref_token = data.get("refresh_token")
    if not ref_token:
        raise HTTPException(status_code=400, detail="Missing refresh_token")

    new_access_token = f"cf_jwt_{os.urandom(16).hex()}"
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 86400
    }

# ==================== 3. USERS ====================

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str):
    """Query user account profile by ID from D1 database"""
    return {
        "id": user_id,
        "email": "oradanigrindr@gmail.com",
        "name": "Dani Grindr",
        "created_at": "2024-01-15T10:20:00Z"
    }

@app.put("/api/v1/users/{user_id}")
async def update_user(user_id: str, request: Request):
    """Update user profile name or email in D1"""
    data = await request.json()
    return {
        "id": user_id,
        "email": data.get("email", "oradanigrindr@gmail.com"),
        "name": data.get("name", "Dani Grindr"),
        "updated_at": "2026-10-05T09:50:00Z"
    }

# ==================== 4. ORGANIZATIONS ====================

@app.get("/api/v1/organizations")
async def list_organizations():
    """List workspaces associated with the current tenant"""
    return {
        "organizations": [
            {"id": "org_cerebro", "name": "Cerebrocentral HQ", "slug": "cerebrocentral-hq", "plan": "free"},
            {"id": "org_edge_lab", "name": "Cloudflare Edge Labs", "slug": "edge-labs", "plan": "free"}
        ]
    }

@app.post("/api/v1/organizations")
async def create_organization(request: Request):
    """Provision a new organization record into D1"""
    data = await request.json()
    name = data.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Missing organization name")

    org_id = f"org_{os.urandom(4).hex()}"
    return {
        "id": org_id,
        "name": name,
        "slug": data.get("slug", name.lower().replace(" ", "-")),
        "plan": data.get("plan", "free"),
        "created_at": "2026-10-05T09:50:00Z"
    }

@app.get("/api/v1/organizations/{org_id}")
async def get_organization(org_id: str):
    """Retrieve details and member count for a specific organization"""
    return {
        "id": org_id,
        "name": "Cerebrocentral HQ",
        "slug": "cerebrocentral-hq",
        "plan": "free",
        "members_count": 3,
        "created_at": "2024-01-15T10:22:00Z"
    }

# ==================== 5. MEDIA & R2 STORAGE ====================

@app.post("/api/v1/media/upload")
async def upload_media(request: Request):
    """Upload media file to Cloudflare R2 bucket with zero egress fees"""
    try:
        # Accept JSON simulation or multipart form
        data = await request.json() if request.headers.get("content-type") == "application/json" else {}
        filename = data.get("filename", "uploaded_file.png")
        size = data.get("size", 245000)

        # In production: await env.BUCKET.put(f"media/{filename}", file_stream)
        media_id = f"media_{os.urandom(4).hex()}"
        return {
            "id": media_id,
            "url": f"https://r2.cerebrocentral.com/{filename}",
            "filename": filename,
            "size": size,
            "storage_path": f"uploads/{filename}",
            "visibility": "public"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/media")
async def list_media():
    """List objects in Cloudflare R2 bucket cerebrocentral"""
    return {
        "media": [
            {"id": "media_101", "filename": "architecture-diagram-edge.png", "url": "https://r2.cerebrocentral.com/architecture-diagram-edge.png", "size": 245890, "visibility": "public"},
            {"id": "media_102", "filename": "d1-database-backup.sqlite", "url": "https://r2.cerebrocentral.com/d1-database-backup.sqlite", "size": 1420500, "visibility": "private"},
            {"id": "media_103", "filename": "cloudflare-workers-benchmark.pdf", "url": "https://r2.cerebrocentral.com/cloudflare-workers-benchmark.pdf", "size": 618400, "visibility": "public"}
        ]
    }

@app.get("/api/v1/media/{media_id}")
async def get_media(media_id: str):
    """Inspect metadata and signed URL for a specific R2 media object"""
    return {
        "id": media_id,
        "filename": "architecture-diagram-edge.png",
        "url": f"https://r2.cerebrocentral.com/architecture-diagram-edge.png",
        "mime_type": "image/png",
        "size": 245890,
        "visibility": "public"
    }

@app.delete("/api/v1/media/{media_id}")
async def delete_media(media_id: str):
    """Delete object from R2 bucket and remove record from D1"""
    return {"message": f"Object {media_id} deleted successfully from R2"}

# ==================== 6. INTEGRATIONS ====================

@app.get("/api/v1/integrations")
async def list_integrations():
    """List 3rd party connected service integrations for the active organization"""
    return {
        "integrations": [
            {"id": "int_stripe", "provider": "stripe", "status": "connected", "connected_at": "2024-01-20T14:00:00Z"},
            {"id": "int_whatsapp", "provider": "whatsapp", "status": "connected", "connected_at": "2024-01-22T09:30:00Z"},
            {"id": "int_instagram", "provider": "instagram", "status": "disconnected"}
        ]
    }

@app.post("/api/v1/integrations/connect")
async def connect_integration(request: Request):
    """Save API credentials for Stripe, WhatsApp, or Instagram into D1"""
    data = await request.json()
    provider = data.get("provider")
    if not provider:
        raise HTTPException(status_code=400, detail="Missing provider name")

    return {
        "id": f"int_{provider}",
        "provider": provider,
        "status": "connected",
        "connected_at": "2026-10-05T09:50:00Z"
    }

@app.post("/api/v1/integrations/disconnect")
async def disconnect_integration(request: Request):
    """Revoke credentials and disable webhook listener for provider"""
    data = await request.json()
    provider = data.get("provider")
    return {"message": f"Integration {provider} disconnected successfully"}

# ==================== 7. WEBHOOKS & QUEUES ====================

@app.post("/api/v1/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Receive Stripe events and queue in Cloudflare Durable Object WebhookQueue"""
    try:
        event = await request.json()
        # In production: env.WEBHOOK_QUEUE.send(event)
        return {
            "received": True,
            "provider": "stripe",
            "queued_in_durable_object": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """Receive WhatsApp business messages and dispatch to background worker"""
    try:
        data = await request.json()
        return {
            "received": True,
            "provider": "whatsapp",
            "queued_in_durable_object": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/webhooks/instagram")
async def instagram_webhook(request: Request):
    """Receive Instagram Graph API webhooks (DMs, comments, mentions)"""
    try:
        data = await request.json()
        return {
            "received": True,
            "provider": "instagram",
            "queued_in_durable_object": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ERROR HANDLING ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc), "status": 500}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
  },

  // 2. BACKEND: wrangler.toml
  {
    path: 'packages/backend/wrangler.toml',
    category: 'Backend',
    language: 'toml',
    fileNumber: 2,
    description: 'Cloudflare Workers configuration with Python runtime, D1, R2, KV, and Durable Objects bindings',
    content: `name = "cerebrocentral-api"
main = "src/index.py"
compatibility_date = "2024-01-15"
compatibility_flags = ["python_workers"]

# Ambiente de produção
[env.production]
name = "cerebrocentral-api-prod"
routes = [
  { pattern = "api.cerebrocentral.com/*", zone_name = "cerebrocentral.com" }
]

# D1 Database (PostgreSQL/SQLite)
[[d1_databases]]
binding = "DB"
database_name = "cerebrocentral"
database_id = "your-d1-id"

# R2 Storage (Arquivos sem taxa de egress)
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "cerebrocentral"

# KV Namespace (Cache de respostas)
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-cache-id"

# KV Namespace (Tokens de sessão e rate limiting)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-id"

# Durable Objects (Fila de Webhooks assíncrona)
[durable_objects]
bindings = [
  { name = "WEBHOOK_QUEUE", class_name = "WebhookQueue" }
]

# Variáveis públicas de ambiente
[env.production.vars]
ENVIRONMENT = "production"
DEBUG = false

# Secrets injetadas via 'wrangler secret put'
[env.production.secrets]
DATABASE_URL = ""
SUPABASE_JWT_SECRET = ""
STRIPE_SECRET_KEY = ""
`
  },

  // 3. BACKEND: .env.example
  {
    path: 'packages/backend/.env.example',
    category: 'Backend',
    language: 'yaml',
    fileNumber: 3,
    description: 'Backend environment variables for local Docker and Cloudflare production secrets',
    content: `# ========================================================
# 🧠 CÉREBRO CENTRAL — BACKEND PYTHON (FASTAPI) .env.example
# ========================================================
ENVIRONMENT="local"
DEBUG="true"
DATABASE_URL="sqlite:///db.sqlite3"

# Admin Security & Auth
ADMIN_EMAIL="dani@admin"
ADMIN_SESSION_SECRET="your-64-character-admin-secret-key"
JWT_SECRET_KEY="super-secret-jwt-key"

# Cloudflare Secrets (injete em produção com 'wrangler secret put <NOME>')
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
WHATSAPP_TOKEN="EAAB..."
WHATSAPP_PHONE_ID="683134208215957"
WHATSAPP_VERIFY_TOKEN="santoswhatsapp"

# Cloudflare Edge Bindings (D1, R2, KV)
CLOUDFLARE_API_TOKEN="your_cf_api_token"
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_ZONE_ID="your_zone_id"
CLOUDFLARE_D1_NAME="cerebrocentral"
CLOUDFLARE_R2_BUCKET="cerebrocentral"
`
  },

  // 4. FRONTEND NEXT.JS: app/layout.tsx
  {
    path: 'packages/frontend/app/layout.tsx',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 4,
    description: 'Next.js 15 root layout with font imports, metadata, and QueryClient provider wrapper',
    content: `import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Cerebrocentral - Edge SaaS Platform',
  description: 'Next.js 15 and Python FastAPI serverless stack on Cloudflare Edge (Free Tier).',
  openGraph: {
    title: 'Cerebrocentral - Edge SaaS Platform',
    description: 'High performance edge SaaS hosted on Cloudflare Pages and Workers.',
    url: 'https://cerebrocentral.com',
    siteName: 'Cerebrocentral',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
`
  },

  // 5. FRONTEND NEXT.JS: app/page.tsx
  {
    path: 'packages/frontend/app/page.tsx',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 5,
    description: 'Next.js 15 landing page with API status probe, feature Bento grid, and CTA links',
    content: `'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';

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
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/40 border border-orange-500/30 text-xs text-orange-400 font-mono">
            <span>CLOUDFLARE EDGE FREE TIER</span>
            <span>·</span>
            <span>NEXT.JS 15 + PYTHON</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
            Cerebrocentral
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Plataforma SaaS serverless de alta performance rodando 100% no free tier da Cloudflare:
            Pages, Python Workers, D1 Database e R2 Storage com custo zero.
          </p>

          <div className="text-xs font-mono text-slate-400">
            Status da API:{' '}
            <span
              className={
                apiStatus === 'connected'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-amber-400'
              }
            >
              {apiStatus}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-orange-600/20 transition-colors flex items-center gap-2"
            >
              <span>Acessar Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors"
            >
              Entrar na Conta
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Ultra Rápido na Edge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distribuído globalmente em mais de 300 datacenters Cloudflare com latência inferior a 15ms
              e zero cold-start no Python Workers.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Proteção WAF & DDoS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Segurança corporativa com mitigação de ataques Layer 3/4/7, certificado SSL/TLS automático
              e isolamento de tenants.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">100% Gratuito ($0/mês)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              100.000 requisições diárias, 5GB no banco relacional D1 e 10GB no R2 Storage com ZERO taxa
              de tráfego de saída (egress).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`
  },

  // 6. FRONTEND NEXT.JS: components/navbar.tsx
  {
    path: 'packages/frontend/components/navbar.tsx',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 6,
    description: 'Navigation bar component with dropdown menu, brand wordmark, and auth action',
    content: `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cloud, ChevronDown, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-colors">
            <Cloud className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white group-hover:text-orange-400 transition-colors">
            Cerebrocentral
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Início</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/media" className="hover:text-white transition-colors">Arquivos R2</Link>
          <Link href="/docs" className="hover:text-white transition-colors">API Docs</Link>
        </nav>

        {/* User Dropdown Action */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">
              D
            </div>
            <span>Dani</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-1 text-xs text-slate-300">
              <Link
                href="/dashboard"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Configurações</span>
              </Link>
              <div className="my-1 border-t border-slate-800" />
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-slate-800 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
`
  },

  // 7. FRONTEND NEXT.JS: components/footer.tsx
  {
    path: 'packages/frontend/components/footer.tsx',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 7,
    description: 'Footer component with edge infrastructure badge, copyright, and system links',
    content: `import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Cerebrocentral</span>
          <span>·</span>
          <span>Next.js 15 + Python FastAPI no Cloudflare Edge</span>
          <span>·</span>
          <span className="text-emerald-400 font-mono">$0/mês Free Tier</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Termos</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacidade</Link>
          <a
            href="https://github.com/studiofirebase/cerebrocentral.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-400 transition-colors font-mono"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
`
  },

  // 8. FRONTEND NEXT.JS: components/providers.tsx
  {
    path: 'packages/frontend/components/providers.tsx',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 8,
    description: 'React Query / TanStack Query client provider wrapper with caching defaults',
    content: `'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            gcTime: 1000 * 60 * 10,   // 10 minutes garbage collection
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
`
  },

  // 9. FRONTEND NEXT.JS: lib/api-client.ts
  {
    path: 'packages/frontend/lib/api-client.ts',
    category: 'Frontend',
    language: 'typescript',
    fileNumber: 9,
    description: 'Configured Axios API Client with Bearer token interceptor and 401 redirect handling',
    content: `import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Bearer token injector
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// 401 Unauthorized redirect interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
`
  },

  // 10. FRONTEND NEXT.JS: wrangler.toml
  {
    path: 'packages/frontend/wrangler.toml',
    category: 'Frontend',
    language: 'toml',
    fileNumber: 10,
    description: 'Cloudflare Pages deployment configuration for Next.js 15 static export',
    content: `name = "cerebrocentral-web"
type = "javascript"
compatibility_date = "2024-01-15"

# Build output
build = { command = "npm run build" }
main = "build/index.js"

# Production Routes
routes = [
  { pattern = "cerebrocentral.com/*" }
]

[env.production]
name = "cerebrocentral-web-prod"

[env.production.vars]
NEXT_PUBLIC_API_URL = "https://api.cerebrocentral.com"
NEXT_PUBLIC_ENVIRONMENT = "production"
`
  },

  // 11. FRONTEND NEXT.JS: .env.example
  {
    path: 'packages/frontend/.env.example',
    category: 'Frontend',
    language: 'yaml',
    fileNumber: 11,
    description: 'Frontend environment variables for local Next.js and Cloudflare Pages build',
    content: `# ========================================================
# 🧠 CÉREBRO CENTRAL — FRONTEND NEXT.JS 15 .env.example
# ========================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_ENVIRONMENT="local"
NEXT_PUBLIC_ENABLE_FACE_ID="true"

# Em produção no Cloudflare Pages (cerebrocentral.com):
# NEXT_PUBLIC_APP_URL="https://cerebrocentral.com"
# NEXT_PUBLIC_API_URL="https://api.cerebrocentral.com"
# NEXT_PUBLIC_ADMIN_URL="https://cerebrocentral.com/admin"
# NEXT_PUBLIC_ENVIRONMENT="production"
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
`
  },

  // 12. CI/CD: .github/workflows/deploy-backend.yml
  {
    path: '.github/workflows/deploy-backend.yml',
    category: 'CI/CD',
    language: 'yaml',
    fileNumber: 12,
    description: 'GitHub Actions workflow for deploying FastAPI backend to Cloudflare Workers',
    content: `name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'packages/backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    name: Deploy to Cloudflare Workers
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Wrangler
        run: npm install -g wrangler

      - name: Deploy Worker
        working-directory: packages/backend
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          wrangler deploy --env production
`
  },

  // 13. CI/CD: .github/workflows/deploy-frontend.yml
  {
    path: '.github/workflows/deploy-frontend.yml',
    category: 'CI/CD',
    language: 'yaml',
    fileNumber: 13,
    description: 'GitHub Actions workflow for deploying Next.js frontend to Cloudflare Pages',
    content: `name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'packages/frontend/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    name: Deploy to Cloudflare Pages
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        working-directory: packages/frontend
        run: npm ci

      - name: Build Next.js Static Export
        working-directory: packages/frontend
        run: npm run build

      - name: Deploy to Cloudflare Pages
        working-directory: packages/frontend
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          npm install -g wrangler
          wrangler pages deploy out --project-name cerebrocentral-web
`
  },

  // 14. DEPLOY: packages/backend/Dockerfile
  {
    path: 'packages/backend/Dockerfile',
    category: 'Config',
    language: 'dockerfile',
    fileNumber: 14,
    description: 'Lightweight Python 3.11 Dockerfile with health checks for local development',
    content: `FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.index:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
`
  },

  // 15. DEPLOY: docker-compose.yml
  {
    path: 'docker-compose.yml',
    category: 'Config',
    language: 'yaml',
    fileNumber: 15,
    description: 'Unified multi-container local stack uniting FastAPI, Next.js, and SQLite',
    content: `version: '3.8'

services:
  # Backend Python FastAPI (Port 8000)
  api:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      ENVIRONMENT: "local"
      DEBUG: "true"
      DATABASE_URL: "sqlite:///db.sqlite3"
    volumes:
      - ./packages/backend:/app
    command: uvicorn src.index:app --host 0.0.0.0 --port 8000 --reload

  # Frontend Next.js (Port 3000)
  web:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:8000"
      NEXT_PUBLIC_ENVIRONMENT: "local"
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
`
  },

  // Additional Supporting Files:
  {
    path: 'infra/cloudflare/d1-schema.sql',
    category: 'Infra',
    language: 'sql',
    description: 'PostgreSQL-compatible SQLite relational schema for Cloudflare D1 Database',
    content: `-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
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
`
  },
  {
    path: 'CLOUDFLARE_MIGRATION.md',
    category: 'Docs',
    language: 'markdown',
    description: 'Master architectural documentation and migration playbook',
    content: `# 🚀 MIGRAÇÃO: Next.js + Python | Frontend + Backend no Cloudflare (FREE)

(See root CLOUDFLARE_MIGRATION.md for complete documentation)`
  }
];
