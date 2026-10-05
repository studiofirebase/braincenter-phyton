import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  MessageCircle,
  Zap,
  Smartphone,
  Star,
  Settings,
  LucideProps
} from 'lucide-react';

export type AdminSectionId =
  | 'dashboard'
  | 'subscribers'
  | 'content'
  | 'chat'
  | 'integrations'
  | 'conversations'
  | 'reviews'
  | 'settings';

export interface AdminRoute {
  id: AdminSectionId;
  label: string;
  path: string;
  icon: ComponentType<LucideProps>;
  badge?: string;
  description?: string;
  aliases?: string[];
}

/**
 * Array of administrative routes mapping all core pages:
 * - Dashboard (/admin)
 * - Subscribers (/admin/subscribers)
 * - Media (/admin/media)
 * - Chat (/admin/chat)
 * - Integrations (/admin/integrations)
 * Plus auxiliary platform routes (conversations, reviews, settings).
 */
export const ADMIN_ROUTES: AdminRoute[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    description: 'Visão geral, métricas de faturamento e tráfego edge.',
    aliases: ['/admin/dashboard', '/admin/overview']
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    path: '/admin/subscribers',
    icon: Users,
    badge: '1.200',
    description: 'Gestão de membros VIP, assinaturas e biometria facial Face ID.',
    aliases: ['/admin/assinantes', '/admin/membros']
  },
  {
    id: 'content',
    label: 'Media',
    path: '/admin/media',
    icon: ImageIcon,
    description: 'Gerenciamento de fotos e vídeos no Cloudflare R2 sem taxa de egress.',
    aliases: ['/admin/content', '/admin/fotos-videos', '/admin/r2']
  },
  {
    id: 'chat',
    label: 'Chat',
    path: '/admin/chat',
    icon: MessageCircle,
    badge: '3',
    description: 'Atendimento direto ao vivo com membros VIP da comunidade.',
    aliases: ['/admin/live-chat', '/admin/mensagens']
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/admin/integrations',
    icon: Zap,
    description: 'Conectores Stripe, WhatsApp Cloud API, Cloudflare D1/R2 e Instagram.',
    aliases: ['/admin/integracoes', '/admin/provedores', '/admin/webhooks']
  },
  {
    id: 'conversations',
    label: 'WhatsApp',
    path: '/admin/conversations',
    icon: Smartphone,
    badge: 'Online',
    description: 'Canal oficial WhatsApp Business Cloud e fluxos de mensagens automáticas.',
    aliases: ['/admin/whatsapp', '/admin/bot']
  },
  {
    id: 'reviews',
    label: 'Reviews',
    path: '/admin/reviews',
    icon: Star,
    description: 'Fila editorial para moderação e aprovação de depoimentos da comunidade.',
    aliases: ['/admin/avaliacoes', '/admin/depoimentos']
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    description: 'Perfil de superadministrador, chave secreta JWT e parâmetros do domínio.',
    aliases: ['/admin/configuracoes', '/admin/perfil']
  }
];

// Alias export for lowercase convention
export const adminRoutes = ADMIN_ROUTES;

/**
 * Resolves the active AdminSectionId from a given browser route path
 */
export function getAdminSectionFromPath(path: string): AdminSectionId {
  const normalizedPath = path.toLowerCase().trim();

  // Exact matching against path or aliases
  for (const route of ADMIN_ROUTES) {
    if (normalizedPath === route.path.toLowerCase()) {
      return route.id;
    }
    if (route.aliases && route.aliases.some((alias) => normalizedPath === alias.toLowerCase())) {
      return route.id;
    }
  }

  // Segment/fragment matching
  if (normalizedPath.includes('/subscriber') || normalizedPath.includes('/assinante')) return 'subscribers';
  if (normalizedPath.includes('/media') || normalizedPath.includes('/content') || normalizedPath.includes('/foto')) return 'content';
  if (normalizedPath.includes('/chat')) return 'chat';
  if (normalizedPath.includes('/integration') || normalizedPath.includes('/provedor')) return 'integrations';
  if (normalizedPath.includes('/conversation') || normalizedPath.includes('/whatsapp')) return 'conversations';
  if (normalizedPath.includes('/review') || normalizedPath.includes('/avaliacao')) return 'reviews';
  if (normalizedPath.includes('/setting') || normalizedPath.includes('/config')) return 'settings';

  return 'dashboard';
}

/**
 * Resolves a route definition by its section ID
 */
export function getAdminRouteById(id: AdminSectionId): AdminRoute {
  return ADMIN_ROUTES.find((r) => r.id === id) || ADMIN_ROUTES[0];
}
