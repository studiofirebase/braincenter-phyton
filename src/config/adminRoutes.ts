import type { ComponentType } from 'react';
import {
  Activity,
  Users,
  Image as ImageIcon,
  Video,
  FolderOpen,
  ShoppingBag,
  Lock,
  CalendarDays,
  ShieldCheck,
  MessageCircle,
  Zap,
  Smartphone,
  Star,
  Settings,
  LucideProps,
  CreditCard
} from 'lucide-react';

export type AdminSectionId =
  | 'dashboard'
  | 'subscribers'
  | 'content'
  | 'feed'
  | 'chat'
  | 'integrations'
  | 'conversations'
  | 'calendar'
  | 'cerebro'
  | 'admins'
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
  visible?: boolean;
}

/** Primary sidebar destinations follow the source admin inventory order. */
export const ADMIN_ROUTES: AdminRoute[] = [
  {
    id: 'dashboard',
    label: 'Faturamento',
    path: '/admin',
    icon: CreditCard,
    description: 'Resumo financeiro e indicadores administrativos.'
  },
  {
    id: 'dashboard',
    label: 'Dash Board',
    path: '/admin/dashboard',
    icon: Activity,
    description: 'Métricas de perfis, páginas e conteúdo.'
  },
  {
    id: 'feed',
    label: 'Feed',
    path: '/admin/feed',
    icon: ImageIcon,
    description: 'Publicações reais carregadas das fontes conectadas.',
    aliases: ['/admin/updates']
  },
  {
    id: 'conversations',
    label: 'Conversas',
    path: '/admin/conversations',
    icon: Smartphone,
    description: 'Caixa de conversas conectadas.',
    aliases: ['/admin/whatsapp']
  },
  {
    id: 'content',
    label: 'Conteúdo',
    path: '/admin/conteudo',
    icon: ImageIcon,
    description: 'Biblioteca de mídia e conteúdo.',
    aliases: ['/admin/content', '/admin/media', '/admin/fotos-videos', '/admin/r2']
  },
  {
    id: 'content',
    label: 'Fotos',
    path: '/admin/fotos',
    icon: ImageIcon,
    description: 'Fotos importadas das fontes conectadas.',
    aliases: ['/admin/photos']
  },
  {
    id: 'content',
    label: 'Vídeos',
    path: '/admin/videos',
    icon: Video,
    description: 'Vídeos importados das fontes conectadas.'
  },
  {
    id: 'content',
    label: 'Uploads',
    path: '/admin/uploads',
    icon: FolderOpen,
    description: 'Biblioteca de arquivos e mídia.'
  },
  {
    id: 'content',
    label: 'Loja',
    path: '/admin/products',
    icon: ShoppingBag,
    description: 'Conteúdo e produtos disponíveis na biblioteca.'
  },
  {
    id: 'subscribers',
    label: 'Assinaturas & Assinantes',
    path: '/admin/assinantes?tab=subscribers',
    icon: Users,
    description: 'Dados de assinantes disponíveis no painel.',
    aliases: ['/admin/subscribers', '/admin/subscriptions', '/admin/membros']
  },
  {
    id: 'content',
    label: 'Conteúdo Exclusivo',
    path: '/admin/exclusive-content',
    icon: Lock,
    description: 'Mídias exclusivas conectadas.'
  },
  {
    id: 'calendar',
    label: 'Calendário',
    path: '/admin/calendar',
    icon: CalendarDays,
    description: 'Sincronização de calendário Google ou Apple.',
    aliases: ['/admin/calendarios']
  },
  {
    id: 'reviews',
    label: 'Avaliações',
    path: '/admin/reviews',
    icon: Star,
    description: 'Moderação de avaliações públicas.',
    aliases: ['/admin/avaliacoes', '/admin/depoimentos']
  },
  {
    id: 'cerebro',
    label: 'Cérebro Central IA',
    path: '/admin/cerebro-central',
    icon: Zap,
    description: 'Status dos serviços de IA.',
    aliases: ['/admin/cerebro-central-ia']
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/admin/settings',
    icon: Settings,
    description: 'Perfil e configurações da sessão administrativa.',
    aliases: ['/admin/configuracoes', '/admin/settings/privacidade']
  },
  {
    id: 'admins',
    label: 'Gerenciador de Admins',
    path: '/admin/admins',
    icon: ShieldCheck,
    description: 'Acesso administrativo restrito ao superadmin.',
    aliases: ['/admin/italo']
  },
  {
    id: 'integrations',
    label: 'Integrações',
    path: '/admin/integrations',
    icon: Zap,
    description: 'Conexões OAuth e provedores externos.',
    aliases: ['/admin/integracoes', '/admin/provedores', '/admin/webhooks']
  },
  {
    id: 'chat',
    label: 'Chat',
    path: '/admin/chat',
    icon: MessageCircle,
    description: 'Histórico de conversas importadas.',
    aliases: ['/admin/live-chat', '/admin/mensagens', '/admin/chat-management', '/admin/chat-test'],
    visible: false
  }
];

// Alias export for lowercase convention
export const adminRoutes = ADMIN_ROUTES;

/**
 * Resolves the active AdminSectionId from a given browser route path
 */
export function getAdminSectionFromPath(path: string): AdminSectionId {
  const normalizedPath = path.toLowerCase().trim().split(/[?#]/, 1)[0];

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
  if (normalizedPath.includes('/feed') || normalizedPath.includes('/updates')) return 'feed';
  if (normalizedPath.includes('/media') || normalizedPath.includes('/content') || normalizedPath.includes('/foto') ||
    normalizedPath.includes('/video') || normalizedPath.includes('/upload') || normalizedPath.includes('/product')) return 'content';
  if (normalizedPath.includes('/chat')) return 'chat';
  if (normalizedPath.includes('/integration') || normalizedPath.includes('/provedor')) return 'integrations';
  if (normalizedPath.includes('/conversation') || normalizedPath.includes('/whatsapp')) return 'conversations';
  if (normalizedPath.includes('/calendar') || normalizedPath.includes('/calendario')) return 'calendar';
  if (normalizedPath.includes('/cerebro-central')) return 'cerebro';
  if (normalizedPath.includes('/admin/admins') || normalizedPath.includes('/admin/italo')) return 'admins';
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
