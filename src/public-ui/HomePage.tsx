import React, { useEffect, useState } from 'react';
import {
  Search,
  Users,
  History,
  ShieldCheck,
  CreditCard,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  SearchPeopleModal,
  FriendshipsModal,
  VisitedProfilesModal
} from './ProfileModals';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

interface HomePost {
  id: string;
  provider: string;
  caption: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
  timestamp: string;
}

interface HomeReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface HomeData {
  profile: {
    name: string;
    photo_url: string;
    phone?: string;
    profession?: string;
    relationship?: string;
    sign?: string;
    cover_photo_url?: string;
    address?: string | null;
    about_text?: string;
    marquee_texts?: string[];
    show_whatsapp_button?: boolean;
    show_live_chat_button?: boolean;
    monthly_price?: number | null;
    currency?: string;
    payment_description?: string;
  };
  feed: HomePost[];
  reviews: HomeReview[];
  warnings: string[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [homeError, setHomeError] = useState('');
  const [homeLoading, setHomeLoading] = useState(true);
  const [unavailableMedia, setUnavailableMedia] = useState<Set<string>>(() => new Set());
  // Modal states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isVisitedOpen, setIsVisitedOpen] = useState(false);

  // Subscription plan selection
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Feedback form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const monthlyPrice = homeData?.profile.monthly_price;
  const currency = homeData?.profile.currency || 'BRL';
  const formatPrice = (amount: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(amount);
  const monthlyPriceLabel = typeof monthlyPrice === 'number'
    ? formatPrice(monthlyPrice)
    : 'Preço indisponível';
  const annualPriceLabel = typeof monthlyPrice === 'number'
    ? formatPrice(monthlyPrice * 12 * 0.8)
    : 'Preço indisponível';
  const aboutItems = homeData?.profile.marquee_texts || [];

  const loadHomeData = async (signal?: AbortSignal) => {
    setHomeLoading(true);
    setHomeError('');
    try {
      const response = await fetch('/api/v1/public/home', { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os dados públicos.');
      setHomeData(data as HomeData);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setHomeError(error instanceof Error ? error.message : 'Não foi possível carregar os dados públicos.');
    } finally {
      if (!signal?.aborted) setHomeLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadHomeData(controller.signal);
    return () => controller.abort();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim() || !reviewRating) return;

    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const response = await fetch('/api/v1/public/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName,
          comment: reviewComment,
          rating: reviewRating
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível registrar a avaliação.');
      setReviewSubmitted(true);
      setReviewerName('');
      setReviewComment('');
      setReviewRating(0);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Não foi possível registrar a avaliação.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="w-full bg-[#090A0C] text-[#F5F7FA] font-serif overflow-x-hidden">
      {/* 1. Profile Action Bar (3 square buttons: 50x50px, gap 15px, centered) */}
      <div className="pt-4 pb-2 flex items-center justify-center gap-[15px]">
        <button
          onClick={() => setIsSearchOpen(true)}
          aria-label="Buscar pessoas"
          title="Buscar pessoas"
          className="w-[50px] h-[50px] rounded-full bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-[#D4D9E2] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsFriendsOpen(true)}
          aria-label="Abrir amizades"
          title="Abrir amizades"
          className="w-[50px] h-[50px] rounded-full bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-[#D4D9E2] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsVisitedOpen(true)}
          aria-label="Perfis visitados recentemente"
          title="Perfis visitados recentemente"
          className="w-[50px] h-[50px] rounded-full bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-[#D4D9E2] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
        >
          <History className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Cover & Profile Header Area (~500px desktop, ~295px mobile) */}
      <section className="relative w-full h-[320px] sm:h-[460px] md:h-[500px] overflow-hidden border-b border-white/[0.08]">
        {homeData?.profile.cover_photo_url && (
          <img
            src={homeData.profile.cover_photo_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_35%,rgba(56,189,248,0.16),transparent_55%),linear-gradient(135deg,rgba(18,20,26,0.2),rgba(9,10,12,0.12)_65%)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0C]/85 via-[#090A0C]/15 to-black/10" />
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-full border border-white/20 bg-[#12141A]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center">
            {homeData?.profile.photo_url ? (
              <img
                src={homeData.profile.photo_url}
                alt={homeData.profile.name ? `Foto de ${homeData.profile.name}` : 'Foto de perfil'}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-5xl sm:text-7xl md:text-8xl font-serif tracking-[0.12em] text-[#D4D9E2]/80">CC</span>
            )}
          </div>
        </div>
        {homeError && (
          <p role="alert" className="absolute left-4 top-4 max-w-sm rounded-lg border border-red-400/30 bg-black/70 px-3 py-2 text-xs text-red-200">
            {homeError}
          </p>
        )}

        {/* 3 Compact Counter Boxes (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 text-right sm:bottom-6 sm:right-8 sm:gap-3">
          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#F5F7FA] font-sans">—</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Seguidores</div>
          </div>

          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#F5F7FA] font-sans">—</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Amigos</div>
          </div>

          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#38BDF8] font-sans">—</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Assinantes</div>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-8 -mt-2 pb-4 text-center">
        {homeData?.profile.name && <h1 className="text-xl font-semibold text-white">{homeData.profile.name}</h1>}
        <p className="mt-1 text-[10px] text-[#D4D9E2]/45 font-sans">
          Seguidores, amigos e assinantes serão exibidos quando houver dados reais conectados.
        </p>
      </div>

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 3. Payment & Subscription Block (Max ~1120px centered) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10">
        <div className="bg-[#12141A] border border-[#343944] rounded-[16px] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl">
          {/* Left Column: Payment Methods */}
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4D9E2]/60 font-sans block mb-1">
                Formas de Pagamento
              </span>
              <h3 className="text-2xl font-semibold text-[#F5F7FA]">
                Acesso Imediato à Comunidade
              </h3>
            </div>

            {/* Payment Tiles (258x60px desktop, grid in mobile) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onNavigate('/galeria-assinantes')}
                className="h-[60px] rounded-[10px] bg-black/80 hover:bg-black border border-white/[0.12] flex items-center justify-center gap-2 text-xs font-sans text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-semibold">Google Pay</span>
              </button>

              <button
                onClick={() => onNavigate('/galeria-assinantes')}
                className="h-[60px] rounded-[10px] bg-black/80 hover:bg-black border border-white/[0.12] flex items-center justify-center gap-2 text-xs font-sans text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 text-[#D4D9E2]" />
                <span className="font-semibold">Apple Pay</span>
              </button>

              <button
                onClick={() => onNavigate('/galeria-assinantes')}
                className="col-span-2 sm:col-span-1 h-[60px] rounded-[10px] bg-black/80 hover:bg-black border border-white/[0.12] flex items-center justify-center gap-2 text-xs font-sans text-white transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-semibold">PIX / Mercado Pago</span>
              </button>
            </div>
          </div>

          {/* Right Column: Price & Segmented Control */}
          <div className="bg-[#090A0C] border border-white/[0.08] rounded-[12px] p-6 space-y-5 text-center sm:text-right">
            {/* Segmented Control (Mensal / Anual) */}
            <div className="inline-flex items-center p-1 rounded-[8px] bg-[#12141A] border border-white/[0.10] text-xs font-sans">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-[6px] font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[#D5D9E2] text-[#090A0C] shadow-sm font-semibold'
                    : 'text-[#D4D9E2]/70 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-[6px] font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#D5D9E2] text-[#090A0C] shadow-sm font-semibold'
                    : 'text-[#D4D9E2]/70 hover:text-white'
                }`}
              >
                Anual (20% OFF)
              </button>
            </div>

            {/* Price Presentation */}
            <div>
              <div className="text-3xl sm:text-4xl font-bold font-sans text-[#F5F7FA] tracking-tight">
                {billingCycle === 'monthly' ? monthlyPriceLabel : annualPriceLabel}
                <span className="text-sm font-normal text-[#D4D9E2]/60 ml-1.5 font-serif">
                  {billingCycle === 'monthly' ? '/ mês' : '/ ano'}
                </span>
              </div>
              <p className="text-xs text-[#D4D9E2]/60 mt-1 font-sans">
                {homeData?.profile.payment_description ||
                  (typeof monthlyPrice === 'number'
                    ? `Plano calculado com base no preço e na moeda configurados (${currency}).`
                    : 'Configure o preço do plano nas configurações do perfil.')}
              </p>
            </div>

            {/* CTA Subscribe Button */}
            <button
              onClick={() => onNavigate('/galeria-assinantes')}
              className="w-full py-3.5 px-6 rounded-[10px] bg-[#D5D9E2] hover:bg-white text-[#090A0C] font-sans font-bold text-sm shadow-xl transition-all hover:scale-101"
            >
              Assinar Agora com Face ID
            </button>
          </div>
        </div>
      </section>

      {/* 4. Benefits Marquee Strip (Continuous 30px height) */}
      {aboutItems.length > 0 && (
        <section className="w-full bg-[#12141A]/60 border-y border-white/[0.08] py-2 overflow-hidden select-none">
          <div className="animate-marquee whitespace-nowrap text-xs font-serif text-[#D4D9E2] tracking-wider uppercase flex items-center gap-8">
            {[...aboutItems, ...aboutItems].map((item, index) => (
              <React.Fragment key={`${index}:${item}`}>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{item}</span>
                </span>
                <span className="text-white/20">·</span>
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 6. SOBRE Section (Title: 60px desktop / 37.5px mobile, color #D5D9E2) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-16">
        <div className="bg-[#12141A] border border-[#343944] rounded-[24px] p-8 sm:p-14 space-y-8 shadow-2xl">
          <div className="border-b border-white/[0.08] pb-6">
            <h2 className="text-[37.5px] sm:text-[60px] font-bold tracking-[0.18em] text-[#D5D9E2] uppercase leading-none">
              SOBRE
            </h2>
            <p className="text-sm text-[#D4D9E2]/60 mt-3 font-sans">
              {homeData?.profile.name || 'Apresentação pública do perfil principal.'}
            </p>
          </div>

          <div className="space-y-6 text-[#F5F7FA] text-base sm:text-lg leading-relaxed font-serif">
            {homeData?.profile.about_text ? (
              <p className="whitespace-pre-wrap">{homeData.profile.about_text}</p>
            ) : (
              <div>
                <p className="text-[#D4D9E2]/80">
                  {homeData?.profile.name
                    ? `Perfil público de ${homeData.profile.name}.`
                    : 'Apresentação pública do perfil principal.'}
                </p>
                {aboutItems.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {aboutItems.map((item, index) => (
                      <li key={`${index}:${item}`} className="flex items-start gap-2 text-[#D4D9E2]/80">
                        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#38BDF8]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {(homeData?.profile.profession || homeData?.profile.relationship ||
              homeData?.profile.sign || homeData?.profile.address) && (
              <dl className="grid gap-4 border-t border-white/[0.08] pt-6 sm:grid-cols-2">
                {homeData.profile.profession && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[#D4D9E2]/50">Profissão</dt>
                    <dd className="mt-1 text-sm text-[#D4D9E2]/85">{homeData.profile.profession}</dd>
                  </div>
                )}
                {homeData.profile.relationship && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[#D4D9E2]/50">Relacionamento</dt>
                    <dd className="mt-1 text-sm text-[#D4D9E2]/85">{homeData.profile.relationship}</dd>
                  </div>
                )}
                {homeData.profile.sign && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[#D4D9E2]/50">Signo</dt>
                    <dd className="mt-1 text-sm text-[#D4D9E2]/85">{homeData.profile.sign}</dd>
                  </div>
                )}
                {homeData.profile.address && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[#D4D9E2]/50">Endereço</dt>
                    <dd className="mt-1 text-sm text-[#D4D9E2]/85">{homeData.profile.address}</dd>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(homeData.profile.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-sky-300 hover:underline"
                    >
                      Ver no mapa <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 7. Publicações Sociais (Asymmetric Instagram Grid: Main Post ~790px + Stack ~425px) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-sans">
                Feed Público
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA]">Publicações Recentes</h3>
            </div>
          </div>

          {homeData?.warnings.map((warning) => (
            <p key={warning} role="status" className="rounded-lg border border-amber-400/25 bg-amber-950/20 px-4 py-2 text-xs text-amber-100/80">
              {warning}
            </p>
          ))}
          {homeLoading ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#12141A] px-6 py-12 text-center text-sm text-[#D4D9E2]/70">
              Carregando publicações conectadas...
            </div>
          ) : homeData?.feed.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {homeData.feed.map((post) => (
                <article key={`${post.provider}:${post.id}`} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12141A]">
                  {post.media_url && !unavailableMedia.has(post.id) ? (
                    post.media_type === 'VIDEO' || post.media_type.toLowerCase().includes('video') ? (
                      <video
                        src={post.media_url}
                        poster={post.thumbnail_url}
                        controls
                        preload="metadata"
                        onError={() => setUnavailableMedia((current) => new Set(current).add(post.id))}
                        className="aspect-square w-full bg-black object-cover"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt={post.caption || `Publicação de ${post.provider}`}
                        loading="lazy"
                        onError={() => setUnavailableMedia((current) => new Set(current).add(post.id))}
                        className="aspect-square w-full bg-black object-cover"
                      />
                    )
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-black/40 text-xs text-[#D4D9E2]/60">
                      <span>Prévia de mídia indisponível</span>
                      {post.media_url && (
                        <a href={post.media_url} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                          Abrir mídia original
                        </a>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-sky-300">{post.provider}</p>
                    {post.caption && <p className="whitespace-pre-wrap text-sm text-[#D4D9E2]">{post.caption}</p>}
                    {post.timestamp && Number.isFinite(Date.parse(post.timestamp)) && (
                      <time className="block text-[10px] text-[#D4D9E2]/45">
                        {new Date(post.timestamp).toLocaleString('pt-BR')}
                      </time>
                    )}
                    {post.permalink && <a href={post.permalink} target="_blank" rel="noreferrer" className="text-xs text-sky-300 hover:underline">Ver publicação original</a>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-[#12141A] px-6 py-12 text-center">
              <p className="text-sm text-[#D4D9E2]/70">Nenhuma publicação foi retornada pelas contas sociais conectadas.</p>
            </div>
          )}
      </section>

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 8. Public contact number */}
      {homeData?.profile.phone && (
        <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-12">
          <div className="rounded-2xl border border-white/[0.08] bg-[#12141A] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 mt-0.5 text-[#38BDF8] shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Telefone / WhatsApp</h3>
                  <a href={`tel:${homeData.profile.phone}`} className="mt-1 block text-sm text-[#D4D9E2]/75 hover:text-white">
                    {homeData.profile.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 9. Avaliações / Community Feedback (Heading: 45px desktop / 37.5px mobile) */}
      <section className="max-w-[993px] mx-auto px-4 sm:px-8 py-16 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-sans">
            Feedback da comunidade
          </span>
          <h2 className="text-[37.5px] sm:text-[45px] font-bold text-[#F5F7FA]">
            Deixe sua avaliação
          </h2>
          <p className="text-sm text-[#D4D9E2]/70 font-sans max-w-md mx-auto">
            Sua opinião é fundamental para a constante evolução dos conteúdos e serviços.
          </p>
        </div>

        {/* Feedback Form Card (radius 15px, padding ~30px) */}
        <div className="bg-[#12141A] border border-[#343944] rounded-[15px] p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-xs uppercase tracking-wider font-sans font-semibold text-[#D4D9E2]">
              Seu comentário
            </span>
            <span className="text-[11px] font-sans text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Moderação ativa
            </span>
          </div>

          {reviewSubmitted ? (
            <div className="py-8 text-center space-y-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-base font-semibold text-white">Comentário Enviado!</h4>
              <p className="text-xs text-[#D4D9E2]/70 font-sans">
                Sua avaliação foi registrada com sucesso e aguarda moderação da equipe antes de ser
                exibida publicamente.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label htmlFor="review-rating" className="text-xs text-[#D4D9E2] block mb-1 font-sans">Sua nota</label>
                <select
                  id="review-rating"
                  value={reviewRating}
                  onChange={(event) => setReviewRating(Number(event.target.value))}
                  required
                  className="w-full h-[45px] rounded-lg bg-black/60 border border-white/[0.10] px-4 text-xs font-sans text-white"
                >
                  <option value={0} disabled>Selecione de 1 a 5 estrelas</option>
                  {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? 'estrela' : 'estrelas'}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#D4D9E2] block mb-1 font-sans">Seu nome</label>
                <input
                  type="text"
                  placeholder="Nome público para exibição"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full h-[50px] rounded-lg bg-black/60 border border-white/[0.10] px-4 text-xs font-sans text-white focus:outline-hidden focus:border-[#38BDF8]"
                  required
                />
              </div>

              {reviewError && <p role="alert" className="text-xs text-red-300">{reviewError}</p>}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#D4D9E2] font-sans">Comentário</label>
                  <span className="text-[11px] text-[#D4D9E2]/50 font-sans">
                    {reviewComment.length} / 600 caracteres
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={600}
                  placeholder="Escreva sua experiência com a plataforma..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-lg bg-black/60 border border-white/[0.10] p-4 text-xs font-sans text-white focus:outline-hidden focus:border-[#38BDF8]"
                  required
                />
              </div>

              {/* Submit button: 60px height, silver bg, dark text */}
              <button
                type="submit"
                disabled={isSubmittingReview || !reviewerName || !reviewComment || !reviewRating}
                className="w-full h-[60px] rounded-[15px] bg-[#D5D9E2] hover:bg-white disabled:opacity-50 text-[#090A0C] font-sans font-bold text-sm transition-all shadow-md"
              >
                {isSubmittingReview ? 'Gravando avaliação...' : 'Enviar comentário'}
              </button>
            </form>
          )}

          <div className="pt-6 border-t border-white/[0.08] text-center py-6 space-y-1">
            <h4 className="text-sm font-semibold text-[#D4D9E2]">Avaliações</h4>
            <span className="text-[11px] font-sans text-[#D4D9E2]/50 block">Feedback moderado</span>
            {homeLoading ? (
              <p className="text-xs text-[#D4D9E2]/60 pt-2">Carregando avaliações...</p>
            ) : homeData?.reviews.length ? (
              <div className="mt-4 space-y-3 text-left">
                {homeData.reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm text-white">{review.name}</strong>
                      <span aria-label={`${review.rating} de 5 estrelas`} className="text-amber-300">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#D4D9E2]/80">{review.comment}</p>
                    {Number.isFinite(Date.parse(review.created_at)) && (
                      <time className="mt-2 block text-[10px] text-[#D4D9E2]/45">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </time>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#D4D9E2]/60 pt-2 italic">Nenhuma avaliação aprovada disponível.</p>
            )}
          </div>
        </div>
      </section>

      {/* 10. Selo de Segurança (Compact Card ~504x112px desktop) */}
      <section className="max-w-[504px] mx-auto px-4 py-8">
        <div className="bg-[#13151B] border border-white/[0.10] rounded-[10px] p-5 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F5F7FA] font-sans">
              100% Seguro & Protegido
            </h4>
            <p className="text-xs text-[#D4D9E2]/70 font-sans mt-0.5">
              SSL Certificado • Dados Criptografados
            </p>
          </div>
        </div>
      </section>

      {/* Profile Modals */}
      <SearchPeopleModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FriendshipsModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />
      <VisitedProfilesModal isOpen={isVisitedOpen} onClose={() => setIsVisitedOpen(false)} />
    </div>
  );
};
