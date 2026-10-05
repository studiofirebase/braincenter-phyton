import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  DollarSign,
  Users,
  Image as ImageIcon,
  Video,
  Upload,
  MessageSquare,
  MessageCircle,
  Star,
  Activity,
  Settings,
  Shield,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Send,
  Lock,
  Smartphone,
  Zap,
  Key,
  Globe,
  Home,
  Check
} from 'lucide-react';
import {
  ADMIN_ROUTES,
  AdminRoute,
  AdminSectionId,
  getAdminSectionFromPath
} from '../config/adminRoutes';

export type AdminSection = AdminSectionId;

interface AdminShellPageProps {
  currentPath?: string;
  onNavigateAdmin?: (path: string) => void;
  onNavigatePublic: (path: string) => void;
}

export const AdminShellPage: React.FC<AdminShellPageProps> = ({
  currentPath = '/admin',
  onNavigateAdmin,
  onNavigatePublic
}) => {
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  const [activeSection, setActiveSection] = useState<AdminSectionId>(getAdminSectionFromPath(currentPath));

  useEffect(() => {
    setActiveSection(getAdminSectionFromPath(currentPath));
  }, [currentPath]);

  const handleSelectSection = (section: AdminSectionId) => {
    setActiveSection(section);
    setIsAdminDrawerOpen(false);
    const targetRoute = ADMIN_ROUTES.find((r) => r.id === section);
    if (onNavigateAdmin && targetRoute) {
      onNavigateAdmin(targetRoute.path);
    }
  };

  // Mock Subscribers State
  const [subscribers, setSubscribers] = useState([
    {
      id: 'sub_1',
      name: 'Lucas Santos',
      email: 'lucas.santos@gmail.com',
      plan: 'Anual VIP',
      value: 'R$ 380,00',
      status: 'Ativo',
      faceVerified: true,
      joinedAt: '12/01/2026',
      city: 'São Paulo, SP'
    },
    {
      id: 'sub_2',
      name: 'Amanda Pinheiro',
      email: 'amanda.p@yahoo.com',
      plan: 'Mensal',
      value: 'R$ 39,90',
      status: 'Ativo',
      faceVerified: true,
      joinedAt: '03/02/2026',
      city: 'Rio de Janeiro, RJ'
    },
    {
      id: 'sub_3',
      name: 'Marcos Vinicius',
      email: 'marcos.vini@outlook.com',
      plan: 'Vitalício',
      value: 'R$ 890,00',
      status: 'Ativo',
      faceVerified: true,
      joinedAt: '18/12/2025',
      city: 'Belo Horizonte, MG'
    },
    {
      id: 'sub_4',
      name: 'Carolina Mendes',
      email: 'carol.mendes@gmail.com',
      plan: 'Mensal',
      value: 'R$ 39,90',
      status: 'Pendente',
      faceVerified: false,
      joinedAt: '04/10/2026',
      city: 'Curitiba, PR'
    },
    {
      id: 'sub_5',
      name: 'Rodrigo Alencar',
      email: 'rodrigo.a@gmail.com',
      plan: 'Anual VIP',
      value: 'R$ 380,00',
      status: 'Cancelado',
      faceVerified: true,
      joinedAt: '15/07/2025',
      city: 'Salvador, BA'
    }
  ]);
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'Ativo' | 'Pendente' | 'Cancelado'>('all');

  // Mock Content / R2 Storage State
  const [mediaItems, setMediaItems] = useState([
    {
      id: 'med_1',
      name: 'ensaio_fotografico_noturno_sp_4k.jpg',
      category: 'Fotos',
      size: '8.4 MB',
      access: 'Exclusivo VIP',
      resolution: '3840x2160',
      downloads: 420,
      thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'med_2',
      name: 'making_of_bastidores_ensaio_rio.mp4',
      category: 'Vídeos',
      size: '142 MB',
      access: 'Exclusivo VIP',
      resolution: '4K 60fps',
      downloads: 890,
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'med_3',
      name: 'preview_teaser_colecao_inverno.mp4',
      category: 'Vídeos',
      size: '24 MB',
      access: 'Público',
      resolution: '1080p',
      downloads: 3410,
      thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'med_4',
      name: 'lookbook_editorial_alta_costura.jpg',
      category: 'Fotos',
      size: '6.2 MB',
      access: 'Exclusivo VIP',
      resolution: '4000x3000',
      downloads: 610,
      thumb: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
    }
  ]);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<'Fotos' | 'Vídeos'>('Fotos');
  const [newMediaAccess, setNewMediaAccess] = useState<'Exclusivo VIP' | 'Público'>('Exclusivo VIP');

  // Mock Live Chat State
  const [activeChatUser, setActiveChatUser] = useState('sub_1');
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: 'admin' | 'user'; text: string; time: string }[]>>({
    sub_1: [
      { sender: 'user', text: 'Olá! Consegui ativar o Face ID, mas onde baixo o ensaio 4K completo?', time: '14:20' },
      { sender: 'admin', text: 'Boa tarde Lucas! Os arquivos 4K sem compressão ficam liberados na aba Galeria Exclusiva.', time: '14:22' },
      { sender: 'user', text: 'Perfeito, acabei de acessar! Qualidade impecável!', time: '14:25' }
    ],
    sub_2: [
      { sender: 'user', text: 'Boa tarde, a assinatura anual tem desconto na renovação?', time: '13:10' },
      { sender: 'admin', text: 'Olá Amanda! Sim, membros ativos têm 15% de bônus na renovação automática.', time: '13:15' }
    ],
    sub_4: [
      { sender: 'user', text: 'Oi, fiz o pagamento via PIX, quanto tempo leva para liberar o Face ID?', time: '11:05' },
      { sender: 'admin', text: 'Olá Carolina! A liberação é imediata assim que o webhook da Stripe/PIX confirma.', time: '11:06' }
    ]
  });
  const [newChatText, setNewChatText] = useState('');

  // Mock Reviews Moderation State
  const [reviews, setReviews] = useState([
    {
      id: 'rev_1',
      name: 'Gabriel Ribeiro',
      rating: 5,
      comment: 'O acesso com biometria facial e o carregamento instantâneo via Cloudflare Edge deixam a experiência de outro nível!',
      date: 'Hoje, 09:30',
      status: 'Pendente'
    },
    {
      id: 'rev_2',
      name: 'Mariana Duarte',
      rating: 5,
      comment: 'Fotos e vídeos em 4K reais sem travar. O suporte no WhatsApp respondeu em menos de 2 minutos.',
      date: 'Ontem, 16:45',
      status: 'Aprovado'
    },
    {
      id: 'rev_3',
      name: 'Felipe Rocha',
      rating: 4,
      comment: 'Plataforma fantástica. Adoraria ter opção de download em lote de fotos.',
      date: '02/10/2026',
      status: 'Aprovado'
    }
  ]);

  const getRouteBadge = (route: AdminRoute) => {
    if (route.id === 'content') return `${mediaItems.length}`;
    if (route.id === 'reviews') return `${reviews.filter((r) => r.status === 'Pendente').length} pendente`;
    return route.badge;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => ({
      ...prev,
      [activeChatUser]: [
        ...(prev[activeChatUser] || []),
        { sender: 'admin', text: newChatText.trim(), time }
      ]
    }));
    setNewChatText('');
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim()) return;

    const newItem = {
      id: `med_${Date.now()}`,
      name: newMediaTitle.trim().toLowerCase().replace(/\s+/g, '_') + (newMediaCategory === 'Fotos' ? '.jpg' : '.mp4'),
      category: newMediaCategory,
      size: newMediaCategory === 'Fotos' ? '7.8 MB' : '85 MB',
      access: newMediaAccess,
      resolution: newMediaCategory === 'Fotos' ? '4000x3000' : '4K 60fps',
      downloads: 0,
      thumb: newMediaCategory === 'Fotos'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    };

    setMediaItems([newItem, ...mediaItems]);
    setNewMediaTitle('');
  };

  const handleReviewStatus = (id: string, newStatus: 'Aprovado' | 'Rejeitado') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesFilter = subFilter === 'all' || sub.status === subFilter;
    const matchesSearch =
      sub.name.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.city.toLowerCase().includes(subSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#090A0C] text-[#F5F7FA] font-serif flex flex-col selection:bg-[#38BDF8]/30 selection:text-white">
      {/* =========================================================================
          1. HEADER ADMINISTRATIVO (Identidade visual idêntica à página pública)
         ========================================================================= */}
      <header className="sticky top-0 z-40 h-[59px] bg-[#090A0C]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Menu button (45x45px, 8px radius) & Return to Public Home */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminDrawerOpen(true)}
            aria-label="Abrir menu administrativo"
            title="Menu Administrativo"
            className="w-[45px] h-[45px] rounded-[8px] bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] flex items-center justify-center text-[#F5F7FA] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
          >
            <Menu className="w-5 h-5 text-[#D4D9E2]" />
          </button>

          <button
            onClick={() => onNavigatePublic('/')}
            aria-label="Voltar à Página Pública"
            title="Voltar ao Site Público"
            className="w-[45px] h-[45px] rounded-[8px] hover:bg-white/[0.04] flex items-center justify-center text-[#D4D9E2] transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Title "Cerebro Central" in serif with Admin Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-serif tracking-wide text-[#F5F7FA]">
            Cerebro Central
          </span>
          <span className="text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.10] text-[#38BDF8]">
            Admin
          </span>
        </div>

        {/* Right: Superadmin Profile Indicator (45x45px) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectSection('settings')}
            title="Sessão Superadmin ativa: dani@admin"
            className="w-[45px] h-[45px] rounded-[8px] bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] flex items-center justify-center text-[#38BDF8] transition-colors"
          >
            <Shield className="w-4 h-4 text-[#38BDF8]" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. ACTION BAR SUPERIOR (Estilo editorial idêntico ao da Home pública)
         ========================================================================= */}
      <div className="pt-4 pb-3 border-b border-white/[0.08] bg-[#090A0C]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3 sm:gap-4 overflow-x-auto py-1 scrollbar-none">
          {/* Quick Action Circular Buttons (50x50px, idênticos à Home) */}
          {ADMIN_ROUTES.map((route) => {
            const isActive = activeSection === route.id;
            const Icon = route.icon;
            return (
              <button
                key={route.id}
                onClick={() => handleSelectSection(route.id)}
                title={route.label}
                className={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#38BDF8]/20 border-2 border-[#38BDF8] text-[#38BDF8]'
                    : 'bg-white/[0.04] border border-white/[0.10] text-[#D4D9E2] hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Horizontal Navigation Pills (Labels) */}
        <div className="max-w-6xl mx-auto px-4 mt-3 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 text-xs tracking-wider">
          {ADMIN_ROUTES.map((route) => {
            const badge = getRouteBadge(route);
            const isActive = activeSection === route.id;
            return (
              <button
                key={route.id}
                onClick={() => handleSelectSection(route.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/[0.10] text-[#38BDF8] font-semibold border border-white/[0.15]'
                    : 'text-[#D4D9E2]/70 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span>{route.label}</span>
                {badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.08] text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. SLIDEBAR EXCLUSIVO DO ADMIN (Aberto pelo Menu 45x45px)
         ========================================================================= */}
      {isAdminDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAdminDrawerOpen(false)}
          />

          {/* Drawer Panel (Idêntico ao da página pública) */}
          <div className="relative w-72 sm:w-80 max-w-full bg-[#12141A] border-r border-[#343944] h-full p-6 flex flex-col justify-between z-10 font-serif overflow-y-auto">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div>
                  <span className="text-xl tracking-wide text-[#F5F7FA] block">Cérebro Central</span>
                  <span className="text-[11px] font-sans uppercase tracking-widest text-[#38BDF8]">
                    Painel Administrativo
                  </span>
                </div>
                <button
                  onClick={() => setIsAdminDrawerOpen(false)}
                  aria-label="Fechar menu"
                  className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.10] flex items-center justify-center text-[#D4D9E2] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items (Uppercase Serif) */}
              <nav className="mt-6 space-y-2 text-sm tracking-wider">
                {ADMIN_ROUTES.map((route) => {
                  const isActive = activeSection === route.id;
                  const badge = getRouteBadge(route);
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.id}
                      onClick={() => handleSelectSection(route.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-lg flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-white/[0.08] text-[#38BDF8] font-semibold border border-[#38BDF8]/30'
                          : 'text-[#F5F7FA] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-[#D4D9E2]'}`} />
                        <span>{route.label}</span>
                      </div>
                      {badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#D4D9E2]/80">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3 font-sans">
              <button
                onClick={() => {
                  setIsAdminDrawerOpen(false);
                  onNavigatePublic('/');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs text-[#D4D9E2] flex items-center justify-between transition-colors"
              >
                <span>Voltar ao Site Público</span>
                <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#D4D9E2]/50 px-2">
                <span>Superadmin: dani@admin</span>
                <span>v2.0 Edge</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. CONTEÚDO PRINCIPAL (Editorial, elegante, no mesmo tom da página pública)
         ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* ============================================================
            SEÇÃO 1: DASHBOARD & FATURAMENTO
           ============================================================ */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Visão Geral & Faturamento
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Métricas consolidadas de receita, assinantes VIP e infraestrutura edge.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                  ● Cloudflare Edge Online
                </span>
              </div>
            </div>

            {/* KPI Cards (Estilo editorial de luxo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Receita Mensal (MRR)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-emerald-400">R$ 47.880,00</div>
                <div className="text-[11px] font-sans text-emerald-400/80">+18.4% vs mês anterior</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Assinantes Ativos</span>
                  <Users className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-white">1.200</div>
                <div className="text-[11px] font-sans text-[#D4D9E2]/60">94.2% renovação mensal</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Tráfego Edge</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-[#38BDF8]">482.4K</div>
                <div className="text-[11px] font-sans text-[#38BDF8]/80">Latência P99: 14ms</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Custo Servidores</span>
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-purple-400">$0.00</div>
                <div className="text-[11px] font-sans text-purple-400/80">100% Free Tier</div>
              </div>
            </div>

            {/* Recent Subscriptions (Tabela editorial em serif) */}
            <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-serif text-white tracking-wide">Últimas Transações Autorizadas</h3>
                <button
                  onClick={() => handleSelectSection('subscribers')}
                  className="text-xs text-[#38BDF8] hover:underline"
                >
                  Ver todos os assinantes →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#D4D9E2]/60 text-[11px] uppercase tracking-wider font-sans border-b border-white/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3">Transação</th>
                      <th className="py-2.5 px-3">Membro</th>
                      <th className="py-2.5 px-3">Plano</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Valor</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-[#38BDF8]">tx_94820</td>
                      <td className="py-3 px-3 text-white font-medium">lucas.santos@gmail.com</td>
                      <td className="py-3 px-3">Anual VIP</td>
                      <td className="py-3 px-3">PIX</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold font-mono">R$ 380,00</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">Aprovado</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-[#38BDF8]">tx_94819</td>
                      <td className="py-3 px-3 text-white font-medium">amanda.p@yahoo.com</td>
                      <td className="py-3 px-3">Mensal</td>
                      <td className="py-3 px-3">Apple Pay</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold font-mono">R$ 39,90</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">Aprovado</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono text-[#38BDF8]">tx_94818</td>
                      <td className="py-3 px-3 text-white font-medium">marcos.vini@outlook.com</td>
                      <td className="py-3 px-3">Vitalício</td>
                      <td className="py-3 px-3">Cartão de Crédito</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold font-mono">R$ 890,00</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">Aprovado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 2: ASSINANTES & MEMBROS
           ============================================================ */}
        {activeSection === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Assinantes & Membros
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Gerenciamento de comunidade exclusiva, planos e permissões biométricas Face ID.
                </p>
              </div>

              <button
                onClick={() => {
                  const newName = prompt('Nome do novo assinante:');
                  if (newName) {
                    setSubscribers([
                      {
                        id: `sub_${Date.now()}`,
                        name: newName,
                        email: `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                        plan: 'Mensal',
                        value: 'R$ 39,90',
                        status: 'Ativo',
                        faceVerified: true,
                        joinedAt: 'Hoje',
                        city: 'São Paulo, SP'
                      },
                      ...subscribers
                    ]);
                  }
                }}
                className="px-4 py-2 rounded-[8px] bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] text-[#F5F7FA] text-xs font-serif flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#38BDF8]" />
                <span>Adicionar Membro VIP</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#D4D9E2]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar membros por nome, email ou cidade..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.10] rounded-[8px] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#D4D9E2]/40 focus:outline-hidden focus:border-[#38BDF8] font-serif"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#12141A] border border-white/[0.10] p-1 rounded-[8px] text-xs w-full sm:w-auto">
                {(['all', 'Ativo', 'Pendente', 'Cancelado'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSubFilter(filter)}
                    className={`px-3 py-1 rounded text-xs transition-colors font-serif ${
                      subFilter === filter
                        ? 'bg-white/[0.10] text-[#38BDF8] font-semibold'
                        : 'text-[#D4D9E2]/70 hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'Todos' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-[#12141A] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090A0C] border-b border-white/[0.08] text-[#D4D9E2]/60 text-[11px] uppercase tracking-wider font-sans">
                  <tr>
                    <th className="py-3.5 px-4">Membro</th>
                    <th className="py-3.5 px-4">Plano</th>
                    <th className="py-3.5 px-4">Face ID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Valor</th>
                    <th className="py-3.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white font-serif">{sub.name}</div>
                        <div className="text-[11px] text-[#D4D9E2]/60 font-sans">{sub.email} · {sub.city}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#D4D9E2] font-serif">
                        {sub.plan}
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.faceVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-sans">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            sub.status === 'Ativo'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : sub.status === 'Pendente'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-mono font-semibold">
                        {sub.value}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSubscribers((prev) =>
                              prev.map((s) =>
                                s.id === sub.id
                                  ? { ...s, status: s.status === 'Ativo' ? 'Cancelado' : 'Ativo' }
                                  : s
                              )
                            );
                          }}
                          className="text-[11px] text-[#38BDF8] hover:underline font-serif"
                        >
                          {sub.status === 'Ativo' ? 'Suspender' : 'Reativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 3: FOTOS, VÍDEOS & R2
           ============================================================ */}
        {activeSection === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Fotos, Vídeos & R2 Storage
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Galeria de ensaios em alta resolução hospedados no Cloudflare R2 com zero custo de tráfego.
                </p>
              </div>

              <span className="text-xs font-mono text-[#38BDF8] bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                Bucket: cerebrocentral (10GB Free)
              </span>
            </div>

            {/* Upload Box (Design refinado) */}
            <form onSubmit={handleAddMedia} className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-serif text-white tracking-wide flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#38BDF8]" />
                <span>Enviar Novo Arquivo 4K para o R2</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-serif text-[#D4D9E2]/70 mb-1">Título da Foto ou Vídeo</label>
                  <input
                    type="text"
                    placeholder="Ex: ensaio_editorial_inverno_4k"
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#38BDF8] font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif text-[#D4D9E2]/70 mb-1">Categoria de Mídia</label>
                  <select
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value as any)}
                    className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#38BDF8] font-serif"
                  >
                    <option value="Fotos">Foto Editorial (Alta Resolução)</option>
                    <option value="Vídeos">Vídeo Master (4K 60fps)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif text-[#D4D9E2]/70 mb-1">Nível de Acesso</label>
                  <select
                    value={newMediaAccess}
                    onChange={(e) => setNewMediaAccess(e.target.value as any)}
                    className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#38BDF8] font-serif"
                  >
                    <option value="Exclusivo VIP">Exclusivo VIP (Face ID)</option>
                    <option value="Público">Público (Teaser)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.10] text-white text-xs font-serif flex items-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Realizar Upload</span>
                </button>
              </div>
            </form>

            {/* Media Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="bg-[#12141A] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative h-40 overflow-hidden bg-black/40">
                    <img
                      src={item.thumb}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#38BDF8]/90 text-black font-semibold">
                        {item.access}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="font-serif text-sm text-white truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#D4D9E2]/60">
                      {item.size} · {item.resolution}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-sans text-[#D4D9E2]/50">{item.downloads} downloads</span>
                      <button
                        onClick={() => setMediaItems(mediaItems.filter((m) => m.id !== item.id))}
                        className="p-1 rounded text-red-400 hover:bg-white/[0.06] transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 4: CHAT AO VIVO
           ============================================================ */}
        {activeSection === 'chat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Chat ao Vivo com Assinantes
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Atendimento oficial e suporte direto com membros verificados.
                </p>
              </div>

              <span className="text-xs font-serif text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operador Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] bg-[#12141A] border border-white/[0.08] rounded-xl overflow-hidden">
              {/* Member Thread List */}
              <div className="border-r border-white/[0.08] bg-[#090A0C]/50 flex flex-col">
                <div className="p-3.5 border-b border-white/[0.08] text-xs font-serif uppercase tracking-wider text-[#D4D9E2]/70">
                  Conversas Recentes
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                  {Object.keys(chatMessages).map((userId) => {
                    const sub = subscribers.find((s) => s.id === userId) || { name: 'Membro', email: '' };
                    const lastMsg = chatMessages[userId]?.[chatMessages[userId].length - 1];
                    const isSelected = activeChatUser === userId;
                    return (
                      <button
                        key={userId}
                        onClick={() => setActiveChatUser(userId)}
                        className={`w-full p-3.5 text-left transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-white/[0.08] border-l-2 border-[#38BDF8]' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white font-serif">{sub.name}</div>
                          <div className="text-[11px] text-[#D4D9E2]/60 truncate max-w-[160px] font-sans">
                            {lastMsg?.text || 'Sem mensagens'}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#D4D9E2]/40 font-mono">{lastMsg?.time || ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Viewport (Estilo idêntico ao floating chat drawer) */}
              <div className="col-span-2 flex flex-col h-full bg-[#12141A]">
                <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-bold text-xs font-serif">
                      {subscribers.find((s) => s.id === activeChatUser)?.name[0] || 'M'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white font-serif">
                        {subscribers.find((s) => s.id === activeChatUser)?.name}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-sans">Membro VIP Verificado</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 font-serif">
                  {(chatMessages[activeChatUser] || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'admin'
                            ? 'bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-white rounded-br-none'
                            : 'bg-white/[0.05] border border-white/[0.08] text-[#D4D9E2] rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-mono text-[#D4D9E2]/40 mt-1 px-1">
                        {msg.sender === 'admin' ? 'Você' : 'Membro'} · {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.08] flex items-center gap-2 bg-[#090A0C]">
                  <input
                    type="text"
                    placeholder="Escreva sua mensagem oficial..."
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    className="flex-1 bg-[#12141A] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white placeholder-[#D4D9E2]/40 focus:outline-hidden focus:border-[#38BDF8] font-serif"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-[#38BDF8] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 5: WHATSAPP & CONVERSAS
           ============================================================ */}
        {activeSection === 'conversations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  WhatsApp & Automação
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Canal de comunicação instantânea e atendimento automatizado.
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                API Conectada · +55 11 99999-8888
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-serif text-white tracking-wide flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Canal Oficial WhatsApp</span>
                </h3>

                <div className="space-y-3 text-xs font-serif">
                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#090A0C] border border-white/[0.06]">
                    <span className="text-[#D4D9E2]/70">Número Vinculado</span>
                    <span className="font-mono text-white">+55 (11) 99999-8888</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#090A0C] border border-white/[0.06]">
                    <span className="text-[#D4D9E2]/70">Webhook Edge</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK Ativo
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-[8px] bg-[#090A0C] border border-white/[0.06]">
                    <span className="text-[#D4D9E2]/70">Onboarding Automático</span>
                    <span className="font-mono text-[#38BDF8]">welcome_vip_approved</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Simulação: Mensagem de teste enviada com sucesso para o WhatsApp!')}
                  className="w-full py-2.5 rounded-[8px] bg-[#25D366] text-black font-semibold text-xs font-sans hover:bg-[#25D366]/90 transition-colors"
                >
                  Disparar Mensagem de Teste no WhatsApp
                </button>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-serif text-white tracking-wide">Templates Automáticos Ativos</h3>
                <div className="space-y-3 text-xs font-serif">
                  <div className="p-3.5 bg-[#090A0C] border border-white/[0.06] rounded-[8px] space-y-1">
                    <span className="font-semibold text-white block">Acesso VIP Liberado</span>
                    <p className="text-[11px] text-[#D4D9E2]/60 italic">
                      {'Olá {{nome}}! Seu pagamento foi confirmado e seu acesso Face ID no cerebrocentral.com está ativo.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#090A0C] border border-white/[0.06] rounded-[8px] space-y-1">
                    <span className="font-semibold text-white block">Lembrete de Renovação</span>
                    <p className="text-[11px] text-[#D4D9E2]/60 italic">
                      {'Olá! Sua assinatura VIP vence em 3 dias. Clique no link para manter seu acesso sem interrupções.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 6: MODERAÇÃO DE AVALIAÇÕES
           ============================================================ */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Moderação de Avaliações
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Depoimentos enviados pelo público na home page para aprovação editorial.
                </p>
              </div>

              <span className="text-xs font-serif text-[#38BDF8]">
                {reviews.filter((r) => r.status === 'Pendente').length} pendente de moderação
              </span>
            </div>

            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif text-sm text-white">{rev.name}</div>
                      <div className="text-[11px] text-[#D4D9E2]/50 font-sans">{rev.date}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>

                      <span
                        className={`text-[10px] font-sans px-2 py-0.5 rounded font-semibold ${
                          rev.status === 'Aprovado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : rev.status === 'Rejeitado'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-serif text-[#D4D9E2]/80 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2 text-xs font-serif">
                    <button
                      onClick={() => handleReviewStatus(rev.id, 'Rejeitado')}
                      className="px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-red-400 transition-colors"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleReviewStatus(rev.id, 'Aprovado')}
                      className="px-3 py-1.5 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-emerald-400 transition-colors font-semibold"
                    >
                      Aprovar para Exibição
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 7: INTEGRAÇÕES & PROVEDORES
           ============================================================ */}
        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Integrações & Provedores
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Conectores de pagamento, cloud storage e automação edge.
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                Todos os Provedores Ativos
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-[#12141A] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm text-white">Stripe & PIX Payments</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-sans text-[10px]">
                      Conectado
                    </span>
                  </div>
                  <div className="text-[11px] text-[#D4D9E2]/60 font-mono">
                    Endpoint: https://cerebrocentral.com/api/v1/webhooks/stripe
                  </div>
                </div>
                <button
                  onClick={() => alert('Ping enviado com sucesso para a Stripe! Código 200 OK')}
                  className="px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-[#D4D9E2] text-xs font-serif"
                >
                  Testar Ping
                </button>
              </div>

              <div className="p-5 bg-[#12141A] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm text-white">WhatsApp Cloud API</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-sans text-[10px]">
                      Conectado
                    </span>
                  </div>
                  <div className="text-[11px] text-[#D4D9E2]/60 font-mono">
                    Endpoint: https://cerebrocentral.com/api/v1/webhooks/whatsapp
                  </div>
                </div>
                <button
                  onClick={() => alert('Webhook WhatsApp validado!')}
                  className="px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-[#D4D9E2] text-xs font-serif"
                >
                  Testar Ping
                </button>
              </div>

              <div className="p-5 bg-[#12141A] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm text-white">Cloudflare D1 & R2 Storage</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-sans text-[10px]">
                      Edge Bindings
                    </span>
                  </div>
                  <div className="text-[11px] text-[#D4D9E2]/60 font-mono">
                    Bindings: env.DB (D1 SQLite) · env.BUCKET (R2 Storage 10GB)
                  </div>
                </div>
                <button
                  onClick={() => alert('Bindings Edge D1 e R2 operacionais!')}
                  className="px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-[#D4D9E2] text-xs font-serif"
                >
                  Testar Bindings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 8: CONFIGURAÇÕES & PERFIL
           ============================================================ */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Configurações & Perfil
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Credenciais de superadministrador, domínio e parâmetros de segurança.
                </p>
              </div>

              <span className="text-xs font-mono text-emerald-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                Superadmin Ativo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-serif text-white tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#38BDF8]" />
                  <span>Perfil Oficial do Administrador</span>
                </h3>

                <div className="space-y-3 text-xs font-serif">
                  <div>
                    <label className="block text-[11px] text-[#D4D9E2]/70 mb-1">E-mail Administrativo</label>
                    <input
                      type="text"
                      disabled
                      value="dani@admin"
                      className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white opacity-80 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#D4D9E2]/70 mb-1">Nível de Acesso</label>
                    <input
                      type="text"
                      disabled
                      value="Superadmin (Controle Total da Plataforma)"
                      className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white opacity-80"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#D4D9E2]/70 mb-1">Domínio Oficial</label>
                    <input
                      type="text"
                      disabled
                      value="cerebrocentral.com"
                      className="w-full bg-[#090A0C] border border-white/[0.10] rounded-[8px] px-3 py-2 text-xs text-white opacity-80 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-serif text-white tracking-wide flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Segurança & Chaves Criptográficas</span>
                </h3>

                <div className="space-y-3 text-xs font-serif">
                  <div className="p-3.5 bg-[#090A0C] border border-white/[0.06] rounded-[8px] space-y-1">
                    <span className="font-semibold text-white block">JWT Secret Key (Cloudflare Workers)</span>
                    <span className="text-[11px] font-mono text-[#D4D9E2]/60">•••••••••••••••••••••••• (Ativo)</span>
                  </div>

                  <div className="p-3.5 bg-[#090A0C] border border-white/[0.06] rounded-[8px] space-y-1">
                    <span className="font-semibold text-white block">Stripe Webhook Secret</span>
                    <span className="text-[11px] font-mono text-[#D4D9E2]/60">whsec_•••••••••••••••••••• (Ativo)</span>
                  </div>

                  <div className="p-3.5 bg-[#090A0C] border border-white/[0.06] rounded-[8px] space-y-1">
                    <span className="font-semibold text-white block">Biometria Facial (Face ID)</span>
                    <span className="text-[11px] font-sans text-emerald-400">Ativa e obrigatória para galeria VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
