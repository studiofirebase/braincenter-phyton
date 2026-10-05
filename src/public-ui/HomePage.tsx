import React, { useState } from 'react';
import {
  Search,
  Users,
  History,
  ShieldCheck,
  CreditCard,
  Check,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  Play
} from 'lucide-react';
import {
  SearchPeopleModal,
  FriendshipsModal,
  VisitedProfilesModal,
  StoriesModal
} from './ProfileModals';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Modal states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isVisitedOpen, setIsVisitedOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);

  // Subscription plan selection
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Feedback form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Social interactions likes
  const [postLikes, setPostLikes] = useState<Record<number, number>>({
    1: 1420,
    2: 890,
    3: 654,
    4: 1120,
    5: 780,
    6: 940
  });

  const handleLike = (id: number) => {
    setPostLikes((prev) => ({
      ...prev,
      [id]: prev[id] + 1
    }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setReviewSubmitted(true);
      setReviewerName('');
      setReviewComment('');
    }, 700);
  };

  const stories = [
    {
      id: 1,
      title: 'Ensaio Alpha',
      thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Backstage',
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Studio Tech',
      thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Preview 4K',
      thumb: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Comunidade',
      thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80'
    }
  ];

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
        {/* Cover Image with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
            alt="Capa Cérebro Central"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0C] via-[#090A0C]/40 to-black/20" />
        </div>

        {/* Central Circular Avatar (~280x280px desktop, ~160x160px mobile, 4px white border) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={() => setIsStoriesOpen(true)}
            aria-label="Ver stories e status do perfil"
            className="pointer-events-auto w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] rounded-full border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden hover:scale-102 transition-transform duration-300 relative group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
              alt="Avatar Cérebro Central"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1 rounded-full font-sans">
                Ver Status
              </span>
            </div>
          </button>
        </div>

        {/* 3 Compact Counter Boxes (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 flex items-center gap-2 sm:gap-3 text-right">
          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#F5F7FA] font-sans">142.8K</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Seguidores</div>
          </div>

          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#F5F7FA] font-sans">312</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Amigos</div>
          </div>

          <div className="bg-[#12141A]/90 backdrop-blur-md border border-white/[0.10] rounded-[8px] px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-lg">
            <div className="text-sm sm:text-base font-bold text-[#38BDF8] font-sans">1.2K</div>
            <div className="text-[10px] sm:text-xs text-[#D4D9E2]/70">Assinantes</div>
          </div>
        </div>
      </section>

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
                {billingCycle === 'monthly' ? 'R$ 39,90' : 'R$ 380,00'}
                <span className="text-sm font-normal text-[#D4D9E2]/60 ml-1.5 font-serif">
                  {billingCycle === 'monthly' ? '/ mês' : '/ ano'}
                </span>
              </div>
              <p className="text-xs text-[#D4D9E2]/60 mt-1 font-sans">
                Cobrança automática com cancelamento fácil a qualquer momento.
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
      <section className="w-full bg-[#12141A]/60 border-y border-white/[0.08] py-2 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap text-xs font-serif text-[#D4D9E2] tracking-wider uppercase flex items-center gap-8">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Atualizações semanais</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Comunidade & interação</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Conteúdo exclusivo</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Acesso a vídeos e ensaios completos</span>
          </span>
          <span className="text-white/20">·</span>

          {/* Repeat for seamless loop */}
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Atualizações semanais</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Comunidade & interação</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Conteúdo exclusivo</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Acesso a vídeos e ensaios completos</span>
          </span>
        </div>
      </section>

      {/* 5. Stories / Status Carousel Row (~202px desktop, ~174px mobile) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setIsStoriesOpen(true)}
              className="flex flex-col items-center gap-2 shrink-0 snap-start group"
            >
              <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-full p-[3px] bg-gradient-to-tr from-[#38BDF8] to-orange-400 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-full border-2 border-[#090A0C] overflow-hidden bg-black">
                  <img
                    src={story.thumb}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-[#D4D9E2] group-hover:text-white font-sans truncate max-w-[110px]">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

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
              Perfil oficial, identidade e apresentação pública da plataforma Cérebro Central.
            </p>
          </div>

          <div className="space-y-6 text-[#F5F7FA] text-base sm:text-lg leading-relaxed font-serif">
            <p>
              O <strong className="text-white font-semibold">Cérebro Central</strong> é um ecossistema
              dedicado à produção criativa independente, comunidade de assinantes e difusão de
              conteúdos digitais exclusivos.
            </p>

            <p className="text-[#D4D9E2]/80">
              Desenvolvido com tecnologia de borda serverless e criptografia biométrica Face ID,
              o ambiente proporciona velocidade global, privacidade absoluta e interação direta
              entre criadores e comunidade verificada.
            </p>

            {/* Development notice badge */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-sans text-[#D4D9E2]/70 space-y-1">
              <span className="text-[#38BDF8] font-semibold block">Aviso Institucional</span>
              <p>
                Esta é a reprodução pública oficial observada em 2026. Todos os acessos a áreas
                restritas exigem autenticação ativa. Não compartilhe suas credenciais pessoais.
              </p>
            </div>
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
          <span className="text-xs text-[#D4D9E2]/60 font-sans">Origem: Instagram</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Featured Post (col-span-8 / ~790px, radius 30px) */}
          <div className="lg:col-span-8 bg-[#12141A] border border-[#343944] rounded-[30px] overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Post Header */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] rounded-full border border-white/20 overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Author"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#F5F7FA]">Cérebro Central</h4>
                  <p className="text-[11px] text-[#D4D9E2]/60 font-sans">Publicado há 1 dia · Instagram</p>
                </div>
              </div>
              <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-white/[0.06] text-[#D4D9E2]">
                Destaque
              </span>
            </div>

            {/* Post Media */}
            <div className="relative aspect-[16/10] bg-black overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80"
                alt="Post mídia destaque"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Caption & Actions */}
            <div className="p-6 space-y-4">
              <p className="text-base text-[#F5F7FA] leading-relaxed">
                Nova série de ensaios fotográficos e produções cinematográficas já liberadas para todos
                os assinantes com biometria ativa. Confira a prévia completa no feed.
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs font-sans text-[#D4D9E2]">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => handleLike(1)}
                    className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-400 fill-red-400/30" />
                    <span>{postLikes[1]}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>184 comentários</span>
                  </button>
                </div>

                <button className="hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Posts Vertical Stack (col-span-4 / ~425px, radius 26px) */}
          <div className="lg:col-span-4 space-y-6">
            {[2, 3].map((postId) => (
              <div
                key={postId}
                className="bg-[#12141A] border border-[#343944] rounded-[26px] overflow-hidden shadow-xl"
              >
                <div className="p-4 flex items-center gap-3 border-b border-white/[0.08]">
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                      alt="Author"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-white">Cérebro Central</div>
                    <div className="text-[10px] text-[#D4D9E2]/60 font-sans">Instagram</div>
                  </div>
                </div>

                <div className="aspect-video bg-black overflow-hidden">
                  <img
                    src={
                      postId === 2
                        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'
                    }
                    alt="Post secundário"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#D4D9E2] leading-relaxed line-clamp-2">
                    {postId === 2
                      ? 'Bastidores da última gravação em estúdio com iluminação anamórfica.'
                      : 'Prévia de áudio e masterização sonora para os assinantes exclusivos.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-sans text-[#D4D9E2]/70 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => handleLike(postId)}
                      className="flex items-center gap-1 hover:text-red-400"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{postLikes[postId]}</span>
                    </button>
                    <span>Instagram</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fine Gradient Divider */}
      <div className="hairline-gradient-divider" />

      {/* 8. Mapa Preview Section (~1120px max, 320-400px height) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-16 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#38BDF8] font-sans">
            Localização Oficial
          </span>
          <h3 className="text-3xl font-bold text-[#F5F7FA]">PRÉVIA DO MAPA</h3>
        </div>

        <div className="bg-[#12141A] border border-[#343944] rounded-[20px] overflow-hidden shadow-2xl">
          {/* Simulated Interactive Map Frame */}
          <div className="relative w-full h-[320px] sm:h-[400px] bg-[#090A0C] overflow-hidden flex items-center justify-center">
            {/* Visual map texture */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#343944_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141A] via-transparent to-transparent" />

            <div className="z-10 text-center space-y-3 p-4">
              <div className="w-14 h-14 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] flex items-center justify-center mx-auto shadow-xl animate-pulse">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-white">São Paulo · Brasil</h4>
              <p className="text-xs text-[#D4D9E2]/60 font-sans max-w-sm">
                Hub criativo e operacional Cérebro Central. Atendimento presencial apenas com
                agendamento verificado.
              </p>
            </div>
          </div>

          {/* Map Link Card */}
          <div className="p-4 sm:p-6 bg-[#090A0C] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#38BDF8] shrink-0" />
              <div className="text-xs text-[#D4D9E2]">
                <span className="font-semibold text-white block">São Paulo, SP - Brasil</span>
                <span className="font-sans text-[11px] text-[#D4D9E2]/60">Localização pública configurada</span>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Sao+Paulo+SP+Brazil"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-xs font-sans text-white flex items-center gap-2 transition-colors"
            >
              <span>ABRIR EM GOOGLE MAPS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

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
                disabled={isSubmittingReview || !reviewerName || !reviewComment}
                className="w-full h-[60px] rounded-[15px] bg-[#D5D9E2] hover:bg-white disabled:opacity-50 text-[#090A0C] font-sans font-bold text-sm transition-all shadow-md"
              >
                {isSubmittingReview ? 'Gravando avaliação...' : 'Enviar comentário'}
              </button>
            </form>
          )}

          {/* Empty state for reviews */}
          <div className="pt-6 border-t border-white/[0.08] text-center py-6 space-y-1">
            <h4 className="text-sm font-semibold text-[#D4D9E2]">Avaliações</h4>
            <span className="text-[11px] font-sans text-[#D4D9E2]/50 block">Feedback moderado</span>
            <p className="text-xs text-[#D4D9E2]/60 pt-2 italic">Nenhuma avaliação encontrada.</p>
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
      <StoriesModal isOpen={isStoriesOpen} onClose={() => setIsStoriesOpen(false)} />
    </div>
  );
};
