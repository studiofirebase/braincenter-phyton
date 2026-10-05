import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Menu,
  X,
  LayoutDashboard,
  DollarSign,
  Users,
  Image as ImageIcon,
  Video,
  MessageCircle,
  Star,
  Activity,
  Settings,
  Shield,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Lock,
  Zap,
  Key,
  Globe,
  Home,
  LoaderCircle,
  QrCode
} from 'lucide-react';
import {
  ADMIN_ROUTES,
  AdminRoute,
  AdminSectionId,
  getAdminSectionFromPath
} from '../config/adminRoutes';

export type AdminSection = AdminSectionId;

const INTEGRATION_PROVIDERS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'onedrive', name: 'OneDrive' },
  { id: 'apple', name: 'Apple' },
  { id: 'google', name: 'Google Drive' },
  { id: 'google-photos', name: 'Google Fotos' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitter', name: 'X (Twitter)' },
  { id: 'stripe', name: 'Stripe' },
  { id: 'mercado-pago', name: 'Mercado Pago' },
  { id: 'paypal', name: 'PayPal' }
] as const;

type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number]['id'];

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  created_at: string | null;
}

const MAIN_SETTINGS_TABS = [
  { id: 'contato', label: 'Contato' },
  { id: 'geral', label: 'Geral' },
  { id: 'imagens', label: 'Imagens' },
  { id: 'pagamento', label: 'Pagamento' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'personalizacao', label: 'Personalização' },
  { id: 'seguranca', label: 'Segurança' }
] as const;

const SETTINGS_SELECTOR_TABS = [
  ...MAIN_SETTINGS_TABS,
  { id: 'privacidade', label: 'Privacidade' }
] as const;

type SettingsTabId = (typeof SETTINGS_SELECTOR_TABS)[number]['id'];

const CEREBRO_SERVICES = [
  { id: 'createAdminAccount', label: 'Criar conta de admin', description: 'Cria uma conta administrativa no Cloudflare. Exclusivo para SuperAdmin; exige confirmação e não substitui contas conflitantes sem autorização.' },
  { id: 'manageContentMenu', label: 'Gerenciar menu de conteúdo', description: 'Lista e gerencia temas e itens do menu público. Alterações exigem confirmação explícita.' },
  { id: 'manageFeedPosts', label: 'Gerenciar feed', description: 'Lista e gerencia publicações do feed deste admin. Publicar, ocultar, editar ou remover exige confirmação.' },
  { id: 'manageAdminSettings', label: 'Gerenciar configurações do admin', description: 'Lê e atualiza configurações do perfil e da conversa. Alterações exigem confirmação.' },
  { id: 'getUserInfo', label: 'Buscar informações do usuário', description: 'Consulta informações de usuário por ID ou e-mail.' },
  { id: 'checkSubscription', label: 'Verificar assinatura', description: 'Consulta o status de assinatura de um usuário.' },
  { id: 'giftSubscriptionDays', label: 'Presentear dias de assinatura', description: 'Concede dias extras de assinatura por e-mail; exige confirmação.' },
  { id: 'sendSecretChatTextMessage', label: 'Mensagem no chat secreto', description: 'Envia texto como administrador no chat secreto; exige confirmação.' },
  { id: 'deleteSubscriber', label: 'Cancelar/remover assinante', description: 'Remove o assinante e encerra a assinatura; ação destrutiva que exige confirmação.' },
  { id: 'cleanupExpiredSubscribers', label: 'Limpar assinantes expirados', description: 'Marca assinaturas expiradas em lote; exige confirmação.' },
  { id: 'purgeExpiredSubscribers', label: 'Remover expirados antigos', description: 'Exclui registros antigos de assinaturas expiradas; exige confirmação.' },
  { id: 'resendAccountConfirmationEmail', label: 'Reenviar confirmação de conta', description: 'Reenvia o e-mail de confirmação; envio externo exige confirmação.' },
  { id: 'resendMfaOtp', label: 'Reenviar MFA (OTP)', description: 'Reenvia o código MFA apenas ao telefone cadastrado do admin; exige confirmação.' },
  { id: 'sendMessage', label: 'Enviar mensagem', description: 'Envia mensagens em canais sociais; exige confirmar destinatário, canal e conteúdo.' },
  { id: 'broadcastMessage', label: 'Enviar mensagem em massa', description: 'Enfileira mensagens para grupos ou usuários; exige confirmar público, canal e conteúdo.' },
  { id: 'scheduleTask', label: 'Agendar tarefas', description: 'Agenda mensagens ou tarefas futuras; ações externas exigem confirmação.' },
  { id: 'schedulePublication', label: 'Agendar publicação', description: 'Agenda publicações de fotos ou vídeos; exige confirmação.' },
  { id: 'sendEmail', label: 'Enviar e-mail', description: 'Envia e-mails transacionais ou comunicados; exige confirmar destinatário, assunto e conteúdo.' },
  { id: 'createPixPayment', label: 'Criar pagamento PIX', description: 'Gera cobrança PIX; exige confirmar pagador e valor.' },
  { id: 'createPayPalPayment', label: 'Criar pagamento PayPal', description: 'Cria checkout PayPal sem capturar o pagamento; exige confirmar pagador e valor.' },
  { id: 'getExclusiveContent', label: 'Listar conteúdo exclusivo', description: 'Consulta conteúdo exclusivo disponível.' },
  { id: 'getReviews', label: 'Buscar avaliações', description: 'Consulta avaliações e reviews da plataforma.' },
  { id: 'getPlatformStats', label: 'Estatísticas da plataforma', description: 'Consulta estatísticas e indicadores disponíveis.' },
  { id: 'getSystemStatus', label: 'Status dos serviços', description: 'Consulta o estado dos serviços e microsserviços.' },
  { id: 'sendPasswordReset', label: 'Reset de senha', description: 'Envia link de redefinição; envio externo exige confirmação.' },
  { id: 'verifyAdminIdentityMedia', label: 'Verificar admin por foto/vídeo', description: 'Registra mídia para revisão manual; não aprova identidade automaticamente e exige confirmação.' }
] as const;

const RESPONSE_STYLES = [
  { id: 'balanced', label: 'Equilibrado', description: 'Tom claro e natural, com detalhes na medida.' },
  { id: 'friendly', label: 'Acolhedor', description: 'Tom cordial, próximo e receptivo.' },
  { id: 'objective', label: 'Objetivo', description: 'Respostas curtas e diretas ao ponto.' },
  { id: 'formal', label: 'Formal', description: 'Tom profissional, sem informalidade.' }
] as const;

interface CerebroAdminSettings {
  services: Record<string, boolean>;
  conversation: {
    autoReplyEnabled: boolean;
    defaultVoiceEnabled: boolean;
    responseStyle: string;
  };
}

interface WhatsAppWebSessionStatus {
  status: 'disconnected' | 'connecting' | 'waiting_for_scan' | 'connected' | 'error';
  qr: string | null;
  phone_number: string | null;
  name: string | null;
  error: string | null;
}

interface WhatsAppSignupConfig {
  app_id: string;
  config_id: string;
  state: string;
  graph_version: string;
  expires_at: number;
}

interface FacebookSdk {
  init(options: { appId: string; xfbml: boolean; version: string }): void;
  login(
    callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
    options: Record<string, unknown>
  ): void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let facebookSdkPromise: Promise<FacebookSdk> | null = null;
let facebookSdkConfig = '';

function loadFacebookSdk(appId: string, version: string) {
  if (window.FB) {
    const config = `${appId}:${version}`;
    if (facebookSdkConfig !== config) {
      window.FB.init({ appId, xfbml: false, version });
      facebookSdkConfig = config;
    }
    return Promise.resolve(window.FB);
  }
  if (facebookSdkPromise) return facebookSdkPromise;

  facebookSdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
    let initialized = false;
    const initialize = () => {
      if (initialized) return;
      initialized = true;
      if (!window.FB) {
        reject(new Error('O SDK da Meta não foi carregado.'));
        return;
      }
      const config = `${appId}:${version}`;
      if (facebookSdkConfig !== config) {
        window.FB.init({ appId, xfbml: false, version });
        facebookSdkConfig = config;
      }
      resolve(window.FB);
    };
    window.fbAsyncInit = initialize;
    const script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    if (script) {
      script.addEventListener('load', initialize, { once: true });
      script.addEventListener('error', () => reject(new Error('Não foi possível carregar o SDK da Meta.')), { once: true });
      return;
    }
    const sdk = document.createElement('script');
    sdk.id = 'facebook-jssdk';
    sdk.async = true;
    sdk.src = 'https://connect.facebook.net/en_US/sdk.js';
    sdk.addEventListener('load', initialize, { once: true });
    sdk.onerror = () => reject(new Error('Não foi possível carregar o SDK da Meta.'));
    document.head.appendChild(sdk);
  }).catch((error) => {
    facebookSdkPromise = null;
    throw error;
  });
  return facebookSdkPromise;
}

function launchWhatsAppSignup(sdk: FacebookSdk, config: WhatsAppSignupConfig) {
  return new Promise<{ code: string; wabaId: string; phoneNumberId: string }>((resolve, reject) => {
    let code = '';
    let wabaId = '';
    let phoneNumberId = '';
    const timeout = window.setTimeout(() => finish(new Error('O cadastro do WhatsApp expirou.')), 180_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
    };
    const finish = (error?: Error) => {
      cleanup();
      if (error) reject(error);
      else resolve({ code, wabaId, phoneNumberId });
    };
    const completeWhenReady = () => {
      if (code && wabaId && phoneNumberId) finish();
    };
    const handleMessage = (event: MessageEvent) => {
      if (!/^https:\/\/([a-z0-9-]+\.)*facebook\.com$/i.test(event.origin) || typeof event.data !== 'string') return;
      let payload: { type?: string; event?: string; data?: Record<string, string> };
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload.type !== 'WA_EMBEDDED_SIGNUP') return;
      if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
        finish(new Error('O cadastro do WhatsApp foi cancelado ou falhou.'));
        return;
      }
      if (payload.event === 'FINISH') {
        wabaId = payload.data?.waba_id || '';
        phoneNumberId = payload.data?.phone_number_id || '';
        completeWhenReady();
      }
    };
    window.addEventListener('message', handleMessage);
    sdk.login((response) => {
      const authorizationCode = response.authResponse?.code;
      if (!authorizationCode) {
        finish(new Error('A Meta não retornou o código de autorização do WhatsApp.'));
        return;
      }
      code = authorizationCode;
      completeWhenReady();
    }, {
      config_id: config.config_id,
      response_type: 'code',
      override_default_response_type: true,
      display: 'popup',
      extras: { setup: {} }
    });
  });
}

async function fetchIntegrationStatuses() {
  const token = localStorage.getItem('cc_auth_token');
  const response = await fetch('/api/v1/integrations', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as integrações.');
  const statuses: Partial<Record<IntegrationProvider, IntegrationInfo>> = {};
  for (const integration of data.integrations ?? []) {
    if (INTEGRATION_PROVIDERS.some(({ id }) => id === integration.provider)) {
      statuses[integration.provider as IntegrationProvider] = {
        status: integration.status,
        auth_source: integration.auth_source ?? null,
        missing_env: integration.missing_env ?? [],
        account: integration.account ?? null,
        connected_at: integration.connected_at ?? null
      };
    }
  }
  return statuses;
}

async function fetchWhatsAppWebStatus(): Promise<WhatsAppWebSessionStatus> {
  const token = localStorage.getItem('cc_auth_token');
  const response = await fetch('/api/v1/integrations/whatsapp/web-session', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível consultar o status do WhatsApp Web.');
  return data as WhatsAppWebSessionStatus;
}
type IntegrationStatus = 'connected' | 'disconnected' | 'not_configured';

interface IntegrationInfo {
  status: IntegrationStatus;
  auth_source?: 'oauth' | 'environment' | null;
  missing_env: string[];
  account?: Record<string, unknown> | null;
  connected_at?: string | null;
}

interface ImportedMessage {
  id: string;
  provider: string;
  contact: string;
  conversationId?: string;
  text: string;
  timestamp: string;
  fromMe?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

type ReviewStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

interface AdminMediaItem {
  id: string;
  name: string;
  category: string;
  size: string;
  access: string;
  resolution: string;
  downloads: number;
  thumb: string;
  url?: string;
  provider?: string;
}

interface AdminFeedItem {
  id: string;
  provider: string;
  caption: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
  timestamp: string;
}

interface AdminShellPageProps {
  currentPath?: string;
  onNavigateAdmin?: (path: string) => void;
  onNavigatePublic: (path: string) => void;
}

function getApiBaseUrl(): string {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return 'http://localhost:3000';
  }

  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');

  return 'https://api.cerebrocentral.com';
}

function isSettingsRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const AdminShellPage: React.FC<AdminShellPageProps> = ({
  currentPath = '/admin',
  onNavigateAdmin,
  onNavigatePublic
}) => {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const apiBaseUrl = getApiBaseUrl();

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        return originalFetch(new URL(input, apiBaseUrl).toString(), init);
      }

      if (input instanceof URL && input.origin === window.location.origin && input.pathname.startsWith('/api/')) {
        return originalFetch(new URL(input.pathname + input.search, apiBaseUrl).toString(), init);
      }

      return originalFetch(input, init);
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSectionId>(getAdminSectionFromPath(currentPath));
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>(
    currentPath.toLowerCase().includes('/settings/privacidade') ? 'privacidade' : 'contato'
  );
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [adminListLoading, setAdminListLoading] = useState(false);
  const [adminListError, setAdminListError] = useState('');
  const [adminListRevision, setAdminListRevision] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('resetToken')) {
      return 'reset';
    }
    return 'login';
  });
  const [authNotice, setAuthNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [registrationName, setRegistrationName] = useState('');
  const [registrationUsername, setRegistrationUsername] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationPasswordConfirm, setRegistrationPasswordConfirm] = useState('');
  const [registrationInviteCode, setRegistrationInviteCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [contactSettings, setContactSettings] = useState({
    displayName: '',
    email: '',
    phone: '',
    profession: '',
    relationship: '',
    sign: '',
    address: '',
    description: ''
  });
  const [generalSettings, setGeneralSettings] = useState({
    socials: [
      { id: 'instagram', label: 'Instagram', placeholder: '@usuario', url: '', enabled: false },
      { id: 'twitter', label: 'Twitter / X', placeholder: '@usuario', url: '', enabled: false },
      { id: 'youtube', label: 'YouTube', placeholder: '@canal', url: '', enabled: false },
      { id: 'whatsapp', label: 'WhatsApp', placeholder: '+55 11 99999-9999', url: '', enabled: false },
      { id: 'telegram', label: 'Telegram', placeholder: '@usuario', url: '', enabled: false },
      { id: 'facebook', label: 'Facebook', placeholder: 'facebook.com/pagina', url: '', enabled: false }
    ]
  });
  const [imageSettings, setImageSettings] = useState({
    profilePhoto: '',
    coverPhoto: '',
    galleries: [
      { id: 'gallery-1', name: 'Galeria 1', url: '', preview: '', configured: false },
      { id: 'gallery-2', name: 'Galeria 2', url: '', preview: '', configured: false },
      { id: 'gallery-3', name: 'Galeria 3', url: '', preview: '', configured: false },
      { id: 'gallery-4', name: 'Galeria 4', url: '', preview: '', configured: false },
      { id: 'gallery-5', name: 'Galeria 5', url: '', preview: '', configured: false },
      { id: 'gallery-6', name: 'Galeria 6', url: '', preview: '', configured: false },
      { id: 'gallery-7', name: 'Galeria 7', url: '', preview: '', configured: false }
    ]
  });
  const [paymentSettings, setPaymentSettings] = useState({
    pixValue: 99,
    autoExchangeEnabled: true,
    fallbackCurrency: 'BRL',
    exchangeMargin: 4.5,
    enabledCurrencies: ['BRL', 'USD', 'EUR']
  });
  const [servicesSettings, setServicesSettings] = useState({
    enabled: true,
    provider: 'google',
    mode: 'automatic',
    nativeLanguage: 'pt',
    targetLanguage: 'en',
    autoTranslateIncoming: false,
    autoTranslateOutgoing: false,
    deliveryFormat: 'text',
    audioTranslationEnabled: false,
    transcriptionEnabled: true,
    keepOriginalAudio: true,
    copilotModel: ''
  });
  const [personalizationSettings, setPersonalizationSettings] = useState({
    template: 'feminino',
    profileMode: 'profissional',
    secretChatEnabled: true,
    whatsappBubbleEnabled: true,
    bannerTexts: ['Cultura', 'Conteúdo', 'Comunidade'],
    colors: {
      text: '#F3F6FF',
      numbers: '#8BD8FF',
      buttons: '#3B82F6',
      buttonText: '#FFFFFF',
      lines: '#2A2F3A',
      neon: '#7DD3FC',
      containers: '#12141A',
      background: '#090A0C',
      icons: '#38BDF8',
      cerebro: '#8B5CF6',
      sidebarUser: '#1F2937',
      sidebarAdmin: '#111827',
      secretChat: '#c084fc',
      whatsappBubble: '#25D366',
      headerBackground: '#090A0C',
      headerBorder: '#2F3640'
    },
    fontFamily: 'Inter, sans-serif',
    baseFontSize: 16
  });
  const [securitySettings, setSecuritySettings] = useState({
    email: '',
    newEmail: '',
    currentPassword: '',
    phone: '',
    newPhone: '',
    phonePassword: '',
    currentPasswordAlt: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [privacySettings, setPrivacySettings] = useState({
    sections: [
      { key: 'profile', label: 'Perfil', value: 'Público' },
      { key: 'feed', label: 'Feed', value: 'Seguidores' },
      { key: 'messages', label: 'Mensagens', value: 'Assinantes' },
      { key: 'likes', label: 'Quem curtiu', value: 'Público' },
      { key: 'shares', label: 'Quem compartilhou', value: 'Seguidores' },
      { key: 'followersCount', label: 'Quantidade de seguidores', value: 'Público' },
      { key: 'friendsCount', label: 'Quantidade de amigos', value: 'Público' },
      { key: 'subscribersCount', label: 'Quantidade de assinantes', value: 'Público' },
      { key: 'friends', label: 'Gerenciador de amizades', value: 'Público' }
    ],
    messagesVisibility: 'Seguidores',
    autoReplyMode: 'Humanizada',
    voiceReplyEnabled: true,
    reviewsVisible: true,
    moderateReviews: false,
    sendReviewToSecretChat: false
  });
  const [profileSettingsLoading, setProfileSettingsLoading] = useState(false);
  const [profileSettingsSaving, setProfileSettingsSaving] = useState(false);
  const [profileSettingsError, setProfileSettingsError] = useState('');
  const [profileSettingsMessage, setProfileSettingsMessage] = useState('');
  const [integrationStatuses, setIntegrationStatuses] = useState<Partial<Record<IntegrationProvider, IntegrationInfo>>>({});
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState('');
  const [integrationMessage, setIntegrationMessage] = useState('');
  const [integrationBusy, setIntegrationBusy] = useState<IntegrationProvider | null>(null);
  const [whatsappSignup, setWhatsappSignup] = useState<WhatsAppSignupConfig | null>(null);
  const [whatsappRegistrationPin, setWhatsappRegistrationPin] = useState('');
  const [whatsappWebStatus, setWhatsappWebStatus] = useState<WhatsAppWebSessionStatus | null>(null);
  const [whatsappWebQrImage, setWhatsappWebQrImage] = useState('');
  const [whatsappWebBusy, setWhatsappWebBusy] = useState(false);
  const oauthPopupCheck = useRef<number | null>(null);
  const oauthCallbackOrigins = useRef<Partial<Record<IntegrationProvider, string>>>({});
  const [isImportingMessages, setIsImportingMessages] = useState(false);
  const [isImportingMedia, setIsImportingMedia] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [googlePhotosPickerUrl, setGooglePhotosPickerUrl] = useState('');
  const [adminFeedItems, setAdminFeedItems] = useState<AdminFeedItem[]>([]);
  const [adminFeedError, setAdminFeedError] = useState('');
  const [adminFeedLoading, setAdminFeedLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<Record<string, unknown> | null>(null);
  const [systemHealthError, setSystemHealthError] = useState('');
  const [cerebroSettings, setCerebroSettings] = useState<CerebroAdminSettings | null>(null);
  const [cerebroSettingsLoading, setCerebroSettingsLoading] = useState(false);
  const [cerebroSettingsSaving, setCerebroSettingsSaving] = useState(false);
  const [cerebroSettingsError, setCerebroSettingsError] = useState('');
  const [cerebroSettingsMessage, setCerebroSettingsMessage] = useState('');
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const importedObjectUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => importedObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => () => {
    if (oauthPopupCheck.current !== null) window.clearInterval(oauthPopupCheck.current);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const emailChangeToken = url.searchParams.get('emailChangeToken');
    if (!emailChangeToken) return;
    url.searchParams.delete('emailChangeToken');
    window.history.replaceState(null, '', url.toString());
    fetch('/api/v1/auth/confirm-admin-email-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: emailChangeToken })
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível confirmar o novo e-mail.');
        if (typeof data.email === 'string') {
          setAdminEmail(data.email);
          setSecuritySettings((current) => ({ ...current, email: data.email }));
        }
        setProfileSettingsMessage('Novo e-mail administrativo confirmado.');
      })
      .catch((error: unknown) => {
        setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível confirmar o novo e-mail.');
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('cc_auth_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }

    fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Sessão expirada.');
        const data = await response.json();
        if (typeof data.user?.email === 'string') {
          setAdminEmail(data.user.email);
          setSecuritySettings((current) => ({ ...current, email: data.user.email }));
        }
        setIsSuperadmin(data.user?.role === 'superadmin');
        if (!cancelled) setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('cc_auth_token');
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeSection !== 'admins' || !isAuthenticated || !isSuperadmin) return;
    const controller = new AbortController();
    const token = localStorage.getItem('cc_auth_token');
    setAdminListLoading(true);
    setAdminListError('');
    fetch('/api/v1/admin/admins', {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar a lista de administradores.');
        if (!Array.isArray(data.admins)) throw new Error('A resposta da lista de administradores possui formato inválido.');
        setAdminAccounts(data.admins as AdminAccount[]);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAdminListError(error instanceof Error ? error.message : 'Não foi possível carregar a lista de administradores.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAdminListLoading(false);
      });
    return () => controller.abort();
  }, [activeSection, isAuthenticated, isSuperadmin, adminListRevision]);

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await response.json();
      if (!response.ok || !data.access_token) {
        throw new Error(
          response.status === 401
            ? 'Credenciais não reconhecidas. Use o e-mail ou usuário e a senha da conta administradora cadastrada no D1.'
            : data.error || 'Não foi possível iniciar a sessão.'
        );
      }
      localStorage.setItem('cc_auth_token', data.access_token);
      if (typeof data.user?.email === 'string') {
        setAdminEmail(data.user.email);
        setSecuritySettings((current) => ({ ...current, email: data.user.email }));
      }
      setIsSuperadmin(data.user?.role === 'superadmin');
      setAdminPassword('');
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Falha ao iniciar sessão.');
    }
  };

  const handleAdminRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    if (registrationPassword !== registrationPasswordConfirm) {
      setAuthError('As senhas não coincidem.');
      return;
    }
    setAuthBusy(true);
    try {
      const response = await fetch('/api/v1/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registrationName,
          email: adminEmail,
          username: registrationUsername,
          password: registrationPassword,
          inviteCode: registrationInviteCode
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar a conta.');
      setAdminEmail(adminEmail.trim());
      setAdminPassword('');
      setRegistrationPassword('');
      setRegistrationPasswordConfirm('');
      setRegistrationInviteCode('');
      setAuthNotice('Conta administrativa criada. Entre com seu e-mail ou usuário e a senha cadastrada.');
      setAuthMode('login');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível solicitar a recuperação.');
      setAuthNotice(data.message || 'Se o e-mail corresponder a uma conta administrativa, enviaremos instruções.');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível solicitar a recuperação.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    if (resetPassword !== resetPasswordConfirm) {
      setAuthError('As senhas não coincidem.');
      return;
    }
    const token = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('resetToken')
      : null;
    if (!token) {
      setAuthError('Link de redefinição inválido. Solicite um novo e-mail.');
      return;
    }
    setAuthBusy(true);
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: resetPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível redefinir a senha.');
      window.history.replaceState({}, '', '/admin');
      setResetPassword('');
      setResetPasswordConfirm('');
      setAuthNotice(data.message || 'Senha redefinida. Entre com sua nova senha.');
      setAuthMode('login');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível redefinir a senha.');
    } finally {
      setAuthBusy(false);
    }
  };

  useEffect(() => {
    setActiveSection(getAdminSectionFromPath(currentPath));
    if (getAdminSectionFromPath(currentPath) === 'settings') {
      setSettingsTab(currentPath.toLowerCase().includes('/settings/privacidade') ? 'privacidade' : 'contato');
    }
  }, [currentPath]);

  useEffect(() => {
    if (activeSection !== 'settings' || !isAuthenticated) return;
    const controller = new AbortController();
    const token = localStorage.getItem('cc_auth_token');
    setProfileSettingsLoading(true);
    setProfileSettingsError('');
    fetch('/api/v1/admin/profile-settings', {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as configurações.');
        const stored = isSettingsRecord(data.settings) ? data.settings : {};

        if (isSettingsRecord(stored.contactSettings)) {
          const contact = stored.contactSettings;
          setContactSettings((current) => ({
            ...current,
            ...contact,
            displayName: typeof contact.displayName === 'string' ? contact.displayName : typeof stored.name === 'string' ? stored.name : current.displayName,
            email: typeof contact.email === 'string' ? contact.email : typeof stored.email === 'string' ? stored.email : current.email,
            phone: typeof contact.phone === 'string' ? contact.phone : typeof stored.phone === 'string' ? stored.phone : current.phone,
            profession: typeof contact.profession === 'string' ? contact.profession : typeof stored.profession === 'string' ? stored.profession : current.profession,
            relationship: typeof contact.relationship === 'string' ? contact.relationship : typeof stored.relationship === 'string' ? stored.relationship : current.relationship,
            sign: typeof contact.sign === 'string' ? contact.sign : typeof stored.sign === 'string' ? stored.sign : current.sign,
            address: typeof contact.address === 'string' ? contact.address : typeof stored.publicAddress === 'string' ? stored.publicAddress : current.address,
            description: typeof contact.description === 'string' ? contact.description : typeof stored.about_text === 'string' ? stored.about_text : current.description
          }));
        } else {
          setContactSettings((current) => ({
            ...current,
            displayName: typeof stored.name === 'string' ? stored.name : current.displayName,
            email: typeof stored.email === 'string' ? stored.email : current.email,
            phone: typeof stored.phone === 'string' ? stored.phone : current.phone,
            profession: typeof stored.profession === 'string' ? stored.profession : current.profession,
            relationship: typeof stored.relationship === 'string' ? stored.relationship : current.relationship,
            sign: typeof stored.sign === 'string' ? stored.sign : current.sign,
            address: typeof stored.publicAddress === 'string' ? stored.publicAddress : current.address,
            description: typeof stored.about_text === 'string' ? stored.about_text : current.description
          }));
        }

        if (isSettingsRecord(stored.generalSettings) || isSettingsRecord(stored.socialMedia)) {
          const general = isSettingsRecord(stored.generalSettings) ? stored.generalSettings : {};
          const savedSocials = Array.isArray(general.socials) ? general.socials : [];
          const legacySocials = isSettingsRecord(stored.socialMedia) ? stored.socialMedia : {};
          const footerSettings = isSettingsRecord(stored.footerSocials) ? stored.footerSocials : {};
          setGeneralSettings((current) => ({
            ...current,
            socials: current.socials.map((network) => {
              const savedNetwork = savedSocials.find((item: unknown) =>
                isSettingsRecord(item) && item.id === network.id
              );
              const footerNetwork = footerSettings[network.id];
              const legacyUrl = legacySocials[network.id];
              const hasLegacyUrl = typeof legacyUrl === 'string';
              return {
                ...network,
                url: isSettingsRecord(savedNetwork) && typeof savedNetwork.url === 'string'
                  ? savedNetwork.url
                  : isSettingsRecord(footerNetwork) && typeof footerNetwork.url === 'string'
                    ? footerNetwork.url
                    : hasLegacyUrl ? legacyUrl : network.url,
                enabled: isSettingsRecord(savedNetwork) && typeof savedNetwork.enabled === 'boolean'
                  ? savedNetwork.enabled
                  : isSettingsRecord(footerNetwork) && typeof footerNetwork.enabled === 'boolean'
                    ? footerNetwork.enabled
                    : hasLegacyUrl ? Boolean(legacyUrl) : network.enabled
              };
            })
          }));
        }

        if (isSettingsRecord(stored.imageSettings) || Array.isArray(stored.galleries) ||
          typeof stored.profile_picture_url === 'string' || typeof stored.cover_photo_url === 'string') {
          const images = isSettingsRecord(stored.imageSettings) ? stored.imageSettings : {};
          const savedGalleries = Array.isArray(images.galleries)
            ? images.galleries
            : Array.isArray(stored.galleries) ? stored.galleries : [];
          setImageSettings((current) => ({
            ...current,
            profilePhoto: typeof images.profilePhoto === 'string' ? images.profilePhoto : typeof stored.profile_picture_url === 'string' ? stored.profile_picture_url : current.profilePhoto,
            coverPhoto: typeof images.coverPhoto === 'string' ? images.coverPhoto : typeof stored.cover_photo_url === 'string' ? stored.cover_photo_url : current.coverPhoto,
            galleries: current.galleries.map((gallery) => {
              const savedGallery = savedGalleries.find((item: unknown) =>
                isSettingsRecord(item) && item.id === gallery.id
              );
              if (!isSettingsRecord(savedGallery)) return gallery;
              const url = typeof savedGallery.url === 'string' ? savedGallery.url : gallery.url;
              return {
                ...gallery,
                name: typeof savedGallery.name === 'string' ? savedGallery.name : gallery.name,
                url,
                preview: url,
                configured: Boolean(url)
              };
            })
          }));
        }

        if (isSettingsRecord(stored.paymentSettings) || isSettingsRecord(stored.payment_settings)) {
          const payment = {
            ...(isSettingsRecord(stored.paymentSettings) ? stored.paymentSettings : {}),
            ...(isSettingsRecord(stored.payment_settings) ? stored.payment_settings : {})
          };
          const currencies = Array.isArray(payment.enabledCurrencies)
            ? payment.enabledCurrencies
            : Array.isArray(payment.supportedCurrencies) ? payment.supportedCurrencies : null;
          setPaymentSettings((current) => ({
            ...current,
            pixValue: typeof payment.pixValue === 'number' ? payment.pixValue : current.pixValue,
            autoExchangeEnabled: typeof payment.autoExchangeEnabled === 'boolean'
              ? payment.autoExchangeEnabled
              : typeof payment.multiCurrencyEnabled === 'boolean' ? payment.multiCurrencyEnabled : current.autoExchangeEnabled,
            exchangeMargin: typeof payment.exchangeMargin === 'number'
              ? payment.exchangeMargin
              : typeof payment.exchangeMarkupPercent === 'number' ? payment.exchangeMarkupPercent : current.exchangeMargin,
            fallbackCurrency: typeof payment.fallbackCurrency === 'string'
              ? payment.fallbackCurrency
              : typeof payment.defaultCurrency === 'string' ? payment.defaultCurrency : current.fallbackCurrency,
            enabledCurrencies: currencies &&
              currencies.every((currency: unknown) => typeof currency === 'string')
              ? currencies
              : current.enabledCurrencies
          }));
        }

        if (isSettingsRecord(stored.servicesSettings) || isSettingsRecord(stored.translation_settings)) {
          const savedServices = isSettingsRecord(stored.servicesSettings)
            ? stored.servicesSettings
            : stored.translation_settings as Record<string, unknown>;
          setServicesSettings((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.entries(current).filter(([key]) =>
                typeof savedServices[key as keyof typeof current] === typeof current[key as keyof typeof current]
              ).map(([key]) => [key, savedServices[key as keyof typeof current]])
            )
          }));
        }

        if (isSettingsRecord(stored.personalizationSettings) || isSettingsRecord(stored.appearance_settings)) {
          const customization = isSettingsRecord(stored.personalizationSettings)
            ? stored.personalizationSettings
            : {};
          const legacyAppearance = isSettingsRecord(stored.appearance_settings) ? stored.appearance_settings : {};
          const appearanceColorKeys: Record<string, string> = {
            text: 'textColor',
            numbers: 'numberColor',
            buttons: 'buttonColor',
            buttonText: 'buttonTextColor',
            lines: 'lineColor',
            neon: 'neonGlowColor',
            containers: 'containerColor',
            background: 'backgroundColor',
            icons: 'iconColor',
            cerebro: 'cerebroCentralColor',
            sidebarUser: 'userSidebarIconColor',
            sidebarAdmin: 'adminSidebarIconColor',
            secretChat: 'secretChatColor',
            whatsappBubble: 'whatsappBubbleColor',
            headerBackground: 'iosHeaderBg',
            headerBorder: 'iosHeaderBorder'
          };
          setPersonalizationSettings((current) => {
            const colors = { ...current.colors };
            if (isSettingsRecord(customization.colors)) {
              Object.entries(customization.colors).forEach(([key, value]) => {
                if (key in colors && typeof value === 'string') {
                  colors[key as keyof typeof colors] = value;
                }
              });
            }
            Object.entries(appearanceColorKeys).forEach(([color, legacyKey]) => {
              if (typeof legacyAppearance[legacyKey] === 'string') {
                colors[color as keyof typeof colors] = legacyAppearance[legacyKey] as string;
              }
            });
            return {
              ...current,
              ...customization,
              colors,
              template: typeof customization.template === 'string'
                ? customization.template
                : typeof stored.template === 'string' ? stored.template : current.template,
              profileMode: typeof customization.profileMode === 'string'
                ? customization.profileMode
                : typeof stored.profile_mode === 'string' ? stored.profile_mode : current.profileMode,
              secretChatEnabled: typeof customization.secretChatEnabled === 'boolean'
                ? customization.secretChatEnabled
                : typeof stored.show_live_chat_button === 'boolean'
                  ? stored.show_live_chat_button
                  : current.secretChatEnabled,
              whatsappBubbleEnabled: typeof customization.whatsappBubbleEnabled === 'boolean'
                ? customization.whatsappBubbleEnabled
                : typeof stored.show_whatsapp_button === 'boolean'
                  ? stored.show_whatsapp_button
                  : current.whatsappBubbleEnabled,
              bannerTexts: Array.isArray(customization.bannerTexts) &&
                customization.bannerTexts.every((text: unknown) => typeof text === 'string')
                ? customization.bannerTexts
                : Array.isArray(stored.marquee_texts) &&
                  stored.marquee_texts.every((text: unknown) => typeof text === 'string')
                  ? stored.marquee_texts
                  : current.bannerTexts,
              fontFamily: typeof customization.fontFamily === 'string'
                ? customization.fontFamily
                : typeof legacyAppearance.fontFamily === 'string' ? legacyAppearance.fontFamily : current.fontFamily,
              baseFontSize: typeof customization.baseFontSize === 'number'
                ? customization.baseFontSize
                : typeof legacyAppearance.fontSizePx === 'number' ? legacyAppearance.fontSizePx : current.baseFontSize,
            };
          });
        }

        if (isSettingsRecord(stored.securitySettings) || typeof stored.email === 'string' || typeof stored.phone === 'string') {
          const security = isSettingsRecord(stored.securitySettings) ? stored.securitySettings : {};
          setSecuritySettings((current) => ({
            ...current,
            email: typeof security.email === 'string' ? security.email : typeof stored.email === 'string' ? stored.email : current.email,
            phone: typeof security.phone === 'string' ? security.phone : typeof stored.phone === 'string' ? stored.phone : current.phone
          }));
        }

        if (isSettingsRecord(stored.privacySettings) || isSettingsRecord(stored.privacy_settings)) {
          const privacy = isSettingsRecord(stored.privacySettings) ? stored.privacySettings : {};
          const legacyPrivacy = isSettingsRecord(stored.privacy_settings) ? stored.privacy_settings : {};
          const visibilityKeys: Record<string, string> = {
            profile: 'profileVisibility',
            feed: 'feedVisibility',
            messages: 'messageVisibility',
            likes: 'likedByVisibility',
            shares: 'sharedByVisibility',
            followersCount: 'followersCountVisibility',
            friendsCount: 'friendsCountVisibility',
            subscribersCount: 'subscribersCountVisibility',
            friends: 'friendManagerVisibility'
          };
          const visibilityLabel = (value: unknown, fallback: string) => {
            if (typeof value !== 'string') return fallback;
            const normalized = value.toLowerCase();
            if (['public', 'publico', 'público'].includes(normalized)) return 'Público';
            if (['followers', 'seguidores'].includes(normalized)) return 'Seguidores';
            if (['subscribers', 'assinantes'].includes(normalized)) return 'Assinantes';
            return fallback;
          };
          setPrivacySettings((current) => ({
            ...current,
            ...privacy,
            sections: current.sections.map((section) => {
              const savedSection = Array.isArray(privacy.sections)
                ? privacy.sections.find((item: unknown) => isSettingsRecord(item) && item.key === section.key)
                : undefined;
              const legacyValue = legacyPrivacy[visibilityKeys[section.key]];
              return {
                ...section,
                value: isSettingsRecord(savedSection)
                  ? visibilityLabel(savedSection.value, section.value)
                  : visibilityLabel(legacyValue, section.value)
              };
            }),
            messagesVisibility: typeof privacy.messagesVisibility === 'string'
              ? visibilityLabel(privacy.messagesVisibility, current.messagesVisibility)
              : visibilityLabel(legacyPrivacy.messageVisibility, current.messagesVisibility),
            autoReplyMode: typeof privacy.autoReplyMode === 'string'
              ? privacy.autoReplyMode
              : typeof stored.cerebroCentralConversationSettings === 'object' &&
                stored.cerebroCentralConversationSettings !== null &&
                (stored.cerebroCentralConversationSettings as Record<string, unknown>).autoReplyEnabled === false
                ? 'Manual'
                : typeof stored.cerebroCentralConversationSettings === 'object' &&
                  stored.cerebroCentralConversationSettings !== null &&
                  (stored.cerebroCentralConversationSettings as Record<string, unknown>).responseStyle === 'formal'
                  ? 'Robótica'
                  : current.autoReplyMode,
            voiceReplyEnabled: typeof privacy.voiceReplyEnabled === 'boolean'
              ? privacy.voiceReplyEnabled
              : typeof stored.cerebroCentralConversationSettings === 'object' &&
                stored.cerebroCentralConversationSettings !== null &&
                typeof (stored.cerebroCentralConversationSettings as Record<string, unknown>).defaultVoiceEnabled === 'boolean'
                ? (stored.cerebroCentralConversationSettings as Record<string, unknown>).defaultVoiceEnabled as boolean
                : current.voiceReplyEnabled,
            reviewsVisible: typeof privacy.reviewsVisible === 'boolean'
              ? privacy.reviewsVisible
              : typeof stored.review_settings === 'object' && stored.review_settings !== null
                ? (stored.review_settings as Record<string, unknown>).showReviews !== false
                : current.reviewsVisible,
            moderateReviews: typeof privacy.moderateReviews === 'boolean'
              ? privacy.moderateReviews
              : typeof stored.review_settings === 'object' && stored.review_settings !== null
                ? (stored.review_settings as Record<string, unknown>).moderateReviews === true
                : current.moderateReviews,
            sendReviewToSecretChat: typeof privacy.sendReviewToSecretChat === 'boolean'
              ? privacy.sendReviewToSecretChat
              : typeof stored.review_settings === 'object' && stored.review_settings !== null
                ? (stored.review_settings as Record<string, unknown>).sendReviewToSecretChat === true
                : current.sendReviewToSecretChat
          }));
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível carregar as configurações.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileSettingsLoading(false);
      });
    return () => controller.abort();
  }, [activeSection, isAuthenticated]);

  const saveProfileSettings = async (tab: SettingsTabId) => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token) {
      setProfileSettingsError('Sua sessão administrativa expirou. Entre novamente.');
      return;
    }
    const patch: Record<string, unknown> = {};
    if (tab === 'contato') {
      patch.contactSettings = contactSettings;
      patch.name = contactSettings.displayName;
      patch.email = contactSettings.email;
      patch.phone = contactSettings.phone;
      patch.profession = contactSettings.profession;
      patch.relationship = contactSettings.relationship;
      patch.sign = contactSettings.sign;
      patch.publicAddress = contactSettings.address;
      patch.about_text = contactSettings.description;
    } else if (tab === 'geral') {
      patch.generalSettings = generalSettings;
      patch.socialMedia = Object.fromEntries(
        generalSettings.socials.map(({ id, url }) => [id, url])
      );
      patch.footerSocials = Object.fromEntries(
        generalSettings.socials.map(({ id, url, enabled }) => [id, { url, enabled }])
      );
    } else if (tab === 'imagens') {
      patch.imageSettings = imageSettings;
      patch.profile_picture_url = imageSettings.profilePhoto;
      patch.cover_photo_url = imageSettings.coverPhoto;
      patch.galleries = imageSettings.galleries.map(({ id, name, url }) => ({ id, name, url }));
    } else if (tab === 'pagamento') {
      patch.paymentSettings = paymentSettings;
      patch.payment_settings = {
        pixValue: paymentSettings.pixValue,
        subscriptionMonthlyPrice: paymentSettings.pixValue,
        autoExchangeEnabled: paymentSettings.autoExchangeEnabled,
        multiCurrencyEnabled: paymentSettings.autoExchangeEnabled,
        defaultCurrency: paymentSettings.fallbackCurrency,
        exchangeMargin: paymentSettings.exchangeMargin,
        exchangeMarkupPercent: paymentSettings.exchangeMargin,
        enabledCurrencies: paymentSettings.enabledCurrencies,
        supportedCurrencies: paymentSettings.enabledCurrencies
      };
    } else if (tab === 'servicos') {
      patch.servicesSettings = servicesSettings;
      patch.translation_settings = servicesSettings;
    } else if (tab === 'personalizacao') {
      patch.personalizationSettings = personalizationSettings;
      patch.marquee_texts = personalizationSettings.bannerTexts;
      patch.template = personalizationSettings.template;
      patch.profile_mode = personalizationSettings.profileMode;
      patch.show_live_chat_button = personalizationSettings.secretChatEnabled;
      patch.show_whatsapp_button = personalizationSettings.whatsappBubbleEnabled;
      patch.appearance_settings = {
        textColor: personalizationSettings.colors.text,
        numberColor: personalizationSettings.colors.numbers,
        buttonColor: personalizationSettings.colors.buttons,
        buttonTextColor: personalizationSettings.colors.buttonText,
        lineColor: personalizationSettings.colors.lines,
        neonGlowColor: personalizationSettings.colors.neon,
        containerColor: personalizationSettings.colors.containers,
        backgroundColor: personalizationSettings.colors.background,
        iconColor: personalizationSettings.colors.icons,
        cerebroCentralColor: personalizationSettings.colors.cerebro,
        userSidebarIconColor: personalizationSettings.colors.sidebarUser,
        adminSidebarIconColor: personalizationSettings.colors.sidebarAdmin,
        secretChatColor: personalizationSettings.colors.secretChat,
        whatsappBubbleColor: personalizationSettings.colors.whatsappBubble,
        iosHeaderBg: personalizationSettings.colors.headerBackground,
        iosHeaderBorder: personalizationSettings.colors.headerBorder,
        fontFamily: personalizationSettings.fontFamily,
        fontSizePx: personalizationSettings.baseFontSize
      };
    } else if (tab === 'seguranca') {
      patch.securitySettings = {
        email: securitySettings.email,
        phone: securitySettings.phone
      };
    } else {
      patch.privacySettings = privacySettings;
      const privacyValues: Record<string, string> = {
        profileVisibility: privacySettings.sections.find((item) => item.key === 'profile')?.value || 'Público',
        feedVisibility: privacySettings.sections.find((item) => item.key === 'feed')?.value || 'Público',
        messageVisibility: privacySettings.messagesVisibility,
        likedByVisibility: privacySettings.sections.find((item) => item.key === 'likes')?.value || 'Público',
        sharedByVisibility: privacySettings.sections.find((item) => item.key === 'shares')?.value || 'Público',
        followersCountVisibility: privacySettings.sections.find((item) => item.key === 'followersCount')?.value || 'Público',
        friendsCountVisibility: privacySettings.sections.find((item) => item.key === 'friendsCount')?.value || 'Público',
        subscribersCountVisibility: privacySettings.sections.find((item) => item.key === 'subscribersCount')?.value || 'Público',
        friendManagerVisibility: privacySettings.sections.find((item) => item.key === 'friends')?.value || 'Público'
      };
      patch.privacy_settings = privacyValues;
      patch.review_settings = {
        showReviews: privacySettings.reviewsVisible,
        moderateReviews: privacySettings.moderateReviews,
        sendReviewToSecretChat: privacySettings.sendReviewToSecretChat
      };
      patch.cerebroCentralConversationSettings = {
        autoReplyEnabled: privacySettings.autoReplyMode !== 'Manual',
        defaultVoiceEnabled: privacySettings.voiceReplyEnabled,
        responseStyle: privacySettings.autoReplyMode === 'Robótica' ? 'formal' : 'friendly'
      };
    }

    setProfileSettingsSaving(true);
    setProfileSettingsError('');
    setProfileSettingsMessage('');
    try {
      const response = await fetch('/api/v1/admin/profile-settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: patch })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar as configurações.');
      setProfileSettingsMessage(`${SETTINGS_SELECTOR_TABS.find((item) => item.id === tab)?.label || 'Configurações'} salvas no servidor.`);
    } catch (error) {
      setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível salvar as configurações.');
    } finally {
      setProfileSettingsSaving(false);
    }
  };

  const updateAdminEmail = async () => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token || !securitySettings.newEmail.trim() || !securitySettings.currentPassword) {
      setProfileSettingsError('Informe o novo e-mail e a senha atual.');
      return;
    }
    setProfileSettingsSaving(true);
    setProfileSettingsError('');
    setProfileSettingsMessage('');
    try {
      const response = await fetch('/api/v1/admin/account/email-change', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: securitySettings.newEmail,
          currentPassword: securitySettings.currentPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível solicitar a alteração de e-mail.');
      setSecuritySettings((current) => ({ ...current, newEmail: '', currentPassword: '' }));
      setProfileSettingsMessage(data.message || 'Confirme o novo e-mail pelo link enviado.');
    } catch (error) {
      setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível solicitar a alteração de e-mail.');
    } finally {
      setProfileSettingsSaving(false);
    }
  };

  const updateAdminPhone = async () => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token || !securitySettings.newPhone.trim() || !securitySettings.phonePassword) {
      setProfileSettingsError('Informe o novo telefone e a senha atual.');
      return;
    }
    setProfileSettingsSaving(true);
    setProfileSettingsError('');
    setProfileSettingsMessage('');
    try {
      const response = await fetch('/api/v1/admin/account/phone', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: securitySettings.newPhone, currentPassword: securitySettings.phonePassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o telefone.');
      setSecuritySettings((current) => ({
        ...current,
        phone: data.phone,
        newPhone: '',
        phonePassword: ''
      }));
      setProfileSettingsMessage('Telefone administrativo atualizado no servidor.');
    } catch (error) {
      setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível atualizar o telefone.');
    } finally {
      setProfileSettingsSaving(false);
    }
  };

  const updateAdminPassword = async () => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token || !securitySettings.currentPasswordAlt || !securitySettings.newPassword) {
      setProfileSettingsError('Informe a senha atual e a nova senha.');
      return;
    }
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setProfileSettingsError('A confirmação da nova senha não confere.');
      return;
    }
    if (securitySettings.newPassword.length < 12) {
      setProfileSettingsError('A nova senha deve ter pelo menos 12 caracteres.');
      return;
    }
    setProfileSettingsSaving(true);
    setProfileSettingsError('');
    setProfileSettingsMessage('');
    try {
      const response = await fetch('/api/v1/admin/account/password', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securitySettings.currentPasswordAlt,
          newPassword: securitySettings.newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a senha.');
      setSecuritySettings((current) => ({
        ...current,
        currentPasswordAlt: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setProfileSettingsMessage(data.message || 'Senha atualizada.');
    } catch (error) {
      setProfileSettingsError(error instanceof Error ? error.message : 'Não foi possível atualizar a senha.');
    } finally {
      setProfileSettingsSaving(false);
    }
  };

  const handleSelectSettingsTab = (tab: SettingsTabId) => {
    setSettingsTab(tab);
    const targetPath = tab === 'privacidade' ? '/admin/settings/privacidade' : '/admin/settings';
    if (currentPath !== targetPath) onNavigateAdmin?.(targetPath);
  };

  useEffect(() => {
    if (activeSection !== 'feed') return;
    const controller = new AbortController();
    setAdminFeedLoading(true);
    setAdminFeedError('');
    fetch('/api/v1/public/home', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar o feed publicado.');
        setAdminFeedItems(Array.isArray(data.feed) ? data.feed : []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setAdminFeedError(error instanceof Error ? error.message : 'Não foi possível carregar o feed publicado.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setAdminFeedLoading(false);
      });
    return () => controller.abort();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'cerebro') return;
    const controller = new AbortController();
    setSystemHealthError('');
    fetch('/health', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error('Não foi possível consultar o status dos serviços.');
        setSystemHealth(data as Record<string, unknown>);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSystemHealth(null);
          setSystemHealthError(error instanceof Error ? error.message : 'Não foi possível consultar o status dos serviços.');
        }
      });
    return () => controller.abort();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'cerebro' || !isAuthenticated) return;
    const controller = new AbortController();
    let cancelled = false;
    setCerebroSettingsLoading(true);
    setCerebroSettingsError('');
    const token = localStorage.getItem('cc_auth_token');
    fetch('/api/v1/admin/cerebro-settings', {
      signal: controller.signal,
      headers: token ? { Authorization: 'Bearer '.concat(token) } : undefined
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as permissões do Cérebro Central.');
        if (cancelled) return;
        const defaultServices = Object.fromEntries(CEREBRO_SERVICES.map(({ id }) => [id, true]));
        const nextSettings: CerebroAdminSettings = {
          services: { ...defaultServices, ...(data.services || {}) },
          conversation: {
            autoReplyEnabled: data.conversation?.autoReplyEnabled === true,
            defaultVoiceEnabled: data.conversation?.defaultVoiceEnabled === true,
            responseStyle: typeof data.conversation?.responseStyle === 'string' && RESPONSE_STYLES.some((style) => style.id === data.conversation.responseStyle)
              ? data.conversation.responseStyle
              : 'balanced'
          }
        };
        setCerebroSettings(nextSettings);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && !cancelled) {
          setCerebroSettings(null);
          setCerebroSettingsError(error instanceof Error ? error.message : 'Não foi possível carregar as permissões do Cérebro Central.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && !cancelled) setCerebroSettingsLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeSection, isAuthenticated]);

  const saveCerebroSettings = async () => {
    if (!cerebroSettings) return;
    setCerebroSettingsSaving(true);
    setCerebroSettingsError('');
    setCerebroSettingsMessage('');
    const token = localStorage.getItem('cc_auth_token');
    try {
      const response = await fetch('/api/v1/admin/cerebro-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer '.concat(token) } : {})
        },
        body: JSON.stringify(cerebroSettings)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar as permissões do Cérebro Central.');
      setCerebroSettings({
        services: { ...Object.fromEntries(CEREBRO_SERVICES.map(({ id }) => [id, true])), ...(data.services || {}) },
        conversation: {
          autoReplyEnabled: data.conversation?.autoReplyEnabled === true,
          defaultVoiceEnabled: data.conversation?.defaultVoiceEnabled === true,
          responseStyle: typeof data.conversation?.responseStyle === 'string' && RESPONSE_STYLES.some((style) => style.id === data.conversation.responseStyle)
            ? data.conversation.responseStyle
            : 'balanced'
        }
      });
      setCerebroSettingsMessage('Configurações do Cérebro Central salvas com sucesso.');
    } catch (error) {
      setCerebroSettingsError(error instanceof Error ? error.message : 'Não foi possível salvar as configurações.');
    } finally {
      setCerebroSettingsSaving(false);
    }
  };

  const toggleCerebroService = (serviceId: string) => {
    setCerebroSettings((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        services: {
          ...previous.services,
          [serviceId]: !previous.services[serviceId]
        }
      };
    });
  };

  useEffect(() => {
    if (activeSection !== 'reviews' || !isAuthenticated) return;
    let cancelled = false;
    setReviewsLoading(true);
    setReviewError('');
    const token = localStorage.getItem('cc_auth_token');
    fetch('/api/v1/reviews', { headers: token ? { Authorization: 'Bearer '.concat(token) } : undefined })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível carregar avaliações.');
        if (cancelled) return;
        setReviews((data.reviews || []).map((review: {
          id: string; name: string; rating: number; comment: string; status: string; created_at: string;
        }) => ({
          id: review.id,
          name: review.name,
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.created_at).toLocaleString('pt-BR'),
          status: review.status === 'approved'
            ? 'Aprovado'
            : review.status === 'rejected'
              ? 'Rejeitado'
              : 'Pendente'
        })));
      })
      .catch((error: unknown) => {
        if (!cancelled) setReviewError(error instanceof Error ? error.message : 'Falha ao carregar avaliações.');
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSection, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || (activeSection !== 'integrations' && activeSection !== 'conversations')) return;

    let cancelled = false;
    setIntegrationsLoading(true);
    setIntegrationError('');
    void fetchIntegrationStatuses()
      .then(async (statuses) => {
        if (!cancelled) setIntegrationStatuses(statuses);
        if (statuses.whatsapp?.status !== 'disconnected') {
          setWhatsappSignup(null);
          return;
        }
        const token = localStorage.getItem('cc_auth_token');
        const response = await fetch('/api/v1/integrations/whatsapp/connect', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível preparar a conexão do WhatsApp.');
        const config = data.embedded_signup as WhatsAppSignupConfig;
        await loadFacebookSdk(config.app_id, config.graph_version);
        if (!cancelled) setWhatsappSignup(config);
      })
      .catch((error: unknown) => {
        if (!cancelled) setIntegrationError(error instanceof Error ? error.message : 'Falha ao carregar integrações.');
      })
      .finally(() => {
        if (!cancelled) setIntegrationsLoading(false);
      });

    void fetchWhatsAppWebStatus()
      .then((status) => {
        if (!cancelled) setWhatsappWebStatus(status);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setWhatsappWebStatus({
            status: 'error',
            qr: null,
            phone_number: null,
            name: null,
            error: error instanceof Error ? error.message : 'Não foi possível consultar o WhatsApp Web.'
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeSection, isAuthenticated]);

  useEffect(() => {
    if (activeSection !== 'integrations' || !whatsappWebStatus ||
      !['connecting', 'waiting_for_scan'].includes(whatsappWebStatus.status)) return;

    let cancelled = false;
    const pollStatus = async () => {
      try {
        const status = await fetchWhatsAppWebStatus();
        if (!cancelled) setWhatsappWebStatus(status);
      } catch (error) {
        if (!cancelled) {
          setIntegrationError(error instanceof Error ? error.message : 'Não foi possível consultar o pareamento WhatsApp Web.');
        }
      }
    };
    const timer = window.setInterval(() => void pollStatus(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeSection, whatsappWebStatus?.status]);

  useEffect(() => {
    let cancelled = false;
    if (!whatsappWebStatus?.qr) {
      setWhatsappWebQrImage('');
      return;
    }
    QRCode.toDataURL(whatsappWebStatus.qr, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280
    }).then((image) => {
      if (!cancelled) setWhatsappWebQrImage(image);
    }).catch((error: unknown) => {
      if (!cancelled) {
        setWhatsappWebQrImage('');
        setIntegrationError(error instanceof Error ? error.message : 'Não foi possível gerar o QR de pareamento.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [whatsappWebStatus?.qr]);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const provider = event.data?.provider as IntegrationProvider | undefined;
      if (
        event.data?.type !== 'integration-oauth-result' ||
        !provider ||
        event.origin !== oauthCallbackOrigins.current[provider]
      ) return;
      delete oauthCallbackOrigins.current[provider];
      if (oauthPopupCheck.current !== null) {
        window.clearInterval(oauthPopupCheck.current);
        oauthPopupCheck.current = null;
      }
      setIntegrationBusy(null);
      if (typeof event.data.error === 'string' && event.data.error) {
        setIntegrationError(event.data.error);
        return;
      }
      setIntegrationMessage('Conta autorizada pelo provedor.');
      fetchIntegrationStatuses()
        .then(setIntegrationStatuses)
        .catch((error: unknown) => setIntegrationError(error instanceof Error ? error.message : 'Falha ao atualizar integrações.'));
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleIntegrationAction = async (provider: IntegrationProvider, action: 'connect' | 'disconnect') => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token) {
      setIntegrationError('Sua sessão administrativa expirou. Entre novamente.');
      return;
    }

    if (provider === 'whatsapp' && action === 'connect') {
      setIntegrationError('');
      setIntegrationMessage('');
      let config = whatsappSignup;
      if (!config || config.expires_at <= Date.now()) {
        try {
          const response = await fetch('/api/v1/integrations/whatsapp/connect', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Não foi possível preparar o cadastro WhatsApp.');
          config = data.embedded_signup as WhatsAppSignupConfig;
          await loadFacebookSdk(config.app_id, config.graph_version);
          setWhatsappSignup(config);
          setIntegrationMessage('Conexão preparada. Informe o PIN de registro de 6 dígitos e clique novamente para abrir a Meta.');
        } catch (error) {
          setIntegrationError(error instanceof Error ? error.message : 'Falha ao preparar WhatsApp.');
        }
        return;
      }
      if (!/^\d{6}$/.test(whatsappRegistrationPin)) {
        setIntegrationError('Informe o PIN de registro de 6 dígitos do WhatsApp Business.');
        return;
      }
      const sdk = window.FB;
      if (!sdk) {
        setWhatsappSignup(null);
        setIntegrationError('O SDK da Meta não está pronto. Tente novamente.');
        return;
      }

      setIntegrationBusy(provider);
      try {
        const signup = await launchWhatsAppSignup(sdk, config);
        const response = await fetch('/api/v1/integrations/whatsapp/callback', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: config.state,
            code: signup.code,
            waba_id: signup.wabaId,
            phone_number_id: signup.phoneNumberId,
            registration_pin: whatsappRegistrationPin
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível concluir o cadastro WhatsApp.');
        setWhatsappSignup(null);
        setWhatsappRegistrationPin('');
        setIntegrationStatuses(await fetchIntegrationStatuses());
        setIntegrationMessage('WhatsApp Business conectado.');
      } catch (error) {
        setWhatsappSignup(null);
        setIntegrationError(error instanceof Error ? error.message : 'Falha no cadastro WhatsApp.');
      } finally {
        setIntegrationBusy(null);
      }
      return;
    }

    const directConnection = false;
    const popup = action === 'connect' && !directConnection
      ? window.open('about:blank', `oauth-${provider}`, 'popup=yes,width=620,height=760,left=200,top=100')
      : null;
    if (action === 'connect' && !directConnection && !popup) {
      setIntegrationError('Permita pop-ups para concluir a autorização do provedor.');
      return;
    }

    setIntegrationBusy(provider);
    setIntegrationError('');
    setIntegrationMessage('');
    try {
      const response = await fetch(`/api/v1/integrations/${provider}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a integração.');
      if (data.authorization_url) {
        oauthCallbackOrigins.current[provider] = data.callback_origin;
        popup!.location.assign(data.authorization_url);
        oauthPopupCheck.current = window.setInterval(() => {
          if (popup!.closed) {
            if (oauthPopupCheck.current !== null) {
              window.clearInterval(oauthPopupCheck.current);
              oauthPopupCheck.current = null;
            }
            setIntegrationBusy(null);
          }
        }, 500);
        return;
      }
      popup?.close();
      setIntegrationStatuses(await fetchIntegrationStatuses());
      setIntegrationMessage(action === 'connect' ? 'Credenciais validadas no provedor.' : 'Vínculo removido.');
    } catch (error) {
      popup?.close();
      setIntegrationError(error instanceof Error ? error.message : 'Falha na integração.');
      setIntegrationBusy(null);
    }
  };

  const handleWhatsAppWebAction = async (action: 'connect' | 'disconnect') => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token) {
      setIntegrationError('Sua sessão administrativa expirou. Entre novamente.');
      return;
    }
    setWhatsappWebBusy(true);
    setIntegrationError('');
    try {
      const response = await fetch(
        `/api/v1/integrations/whatsapp/web-session${action === 'connect' ? '/connect' : '/disconnect'}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a sessão do WhatsApp Web.');
      setWhatsappWebStatus(data as WhatsAppWebSessionStatus);
      if (action === 'connect') {
        setIntegrationMessage('Sessão iniciada. Escaneie o QR com o WhatsApp no celular.');
      } else {
        setIntegrationMessage('Sessão do WhatsApp Web desconectada.');
      }
    } catch (error) {
      setIntegrationError(error instanceof Error ? error.message : 'Falha ao atualizar a sessão WhatsApp Web.');
    } finally {
      setWhatsappWebBusy(false);
    }
  };

  const handleSelectSection = (section: AdminSectionId) => {
    setActiveSection(section);
    setIsAdminDrawerOpen(false);
    const targetRoute = ADMIN_ROUTES.find((r) => r.id === section);
    if (onNavigateAdmin && targetRoute) {
      onNavigateAdmin(targetRoute.path);
    }
  };

  const handleSelectRoute = (route: (typeof ADMIN_ROUTES)[number]) => {
    setActiveSection(route.id);
    setIsAdminDrawerOpen(false);
    onNavigateAdmin?.(route.path);
  };

  const isRouteActive = (route: (typeof ADMIN_ROUTES)[number]) => {
    const pathname = currentPath.toLowerCase().split(/[?#]/, 1)[0];
    const routePath = route.path.toLowerCase().split(/[?#]/, 1)[0];
    if (routePath === '/admin') return pathname === '/admin';
    return [route.path, ...(route.aliases || [])].some((path) =>
      pathname === path.toLowerCase().split(/[?#]/, 1)[0] ||
      pathname.startsWith(`${path.toLowerCase().split(/[?#]/, 1)[0]}/`)
    );
  };

  // Only provider-imported media is shown here.
  const [mediaItems, setMediaItems] = useState<AdminMediaItem[]>([]);

  const [activeChatUser, setActiveChatUser] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, {
    sender: 'admin' | 'user';
    text: string;
    time: string;
    externalId?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
  }[]>>({});
  const [chatContacts, setChatContacts] = useState<Record<string, { name: string; provider: string }>>({});

  const [reviews, setReviews] = useState<
    { id: string; name: string; rating: number; comment: string; date: string; status: ReviewStatus }[]
  >([]);

  const getRouteBadge = (route: AdminRoute) => {
    if (route.path === '/admin/uploads') return `${mediaItems.length}`;
    if (route.id === 'reviews') return `${reviews.filter((r) => r.status === 'Pendente').length} pendente`;
    return route.badge;
  };

  const importFromProviders = async (
    providers: IntegrationProvider[],
    resource: 'messages' | 'media',
    allowNoConnectedProviders = false
  ): Promise<Record<string, any[]>> => {
    const token = localStorage.getItem('cc_auth_token');
    if (!token) throw new Error('Faça login no painel antes de importar dados.');

    const authHeaders = { Authorization: `Bearer ${token}` };
    const statusResponse = await fetch('/api/v1/integrations', { headers: authHeaders });
    const statusData = await statusResponse.json();
    if (!statusResponse.ok) throw new Error(statusData.error || 'Não foi possível verificar as integrações.');

    const statuses: Partial<Record<IntegrationProvider, IntegrationInfo>> = {};
    for (const integration of statusData.integrations ?? []) {
      if (INTEGRATION_PROVIDERS.some(({ id }) => id === integration.provider)) {
        statuses[integration.provider as IntegrationProvider] = {
          status: integration.status,
          auth_source: integration.auth_source ?? null,
          missing_env: integration.missing_env ?? []
        };
      }
    }
    setIntegrationStatuses(statuses);

    const availableProviders = providers.filter(
      (provider) => statuses[provider]?.status === 'connected'
    );
    if (!availableProviders.length) {
      if (allowNoConnectedProviders) return {};
      throw new Error('Nenhum provedor conectado e configurado para este tipo de importação.');
    }

    const imported: Record<string, any[]> = {};
    const failures: string[] = [];
    await Promise.all(availableProviders.map(async (provider) => {
      try {
        const response = await fetch(`/api/v1/integrations/${provider}/import`, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Falha na importação de ${provider}.`);
        imported[provider] = data.items || [];
      } catch (error) {
        failures.push(error instanceof Error ? `${provider}: ${error.message}` : `${provider}: falha na importação.`);
      }
    }));

    if (failures.length && !Object.keys(imported).length) throw new Error(failures.join(' · '));
    if (failures.length) setImportError(failures.join(' · '));
    return imported;
  };

  const hydrateProviderUrl = async (url: string, token: string): Promise<string> => {
    if (!url.startsWith('/api/')) return url;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Não foi possível carregar a mídia protegida.');
    }
    const objectUrl = URL.createObjectURL(await response.blob());
    importedObjectUrls.current.push(objectUrl);
    return objectUrl;
  };

  const handleImportMessages = async () => {
    setIsImportingMessages(true);
    setImportError('');
    setImportMessage('');
    try {
      const token = localStorage.getItem('cc_auth_token') || '';
      const d1HistoryResponse = await fetch('/api/v1/admin/chat-history', {
        headers: { Authorization: 'Bearer '.concat(token) }
      });
      const d1History = await d1HistoryResponse.json();
      if (!d1HistoryResponse.ok) {
        throw new Error(d1History.error || 'Não foi possível carregar o histórico salvo no D1.');
      }
      const imported: Record<string, any[]> = {};
      imported.whatsapp_history = (d1History.messages || []).map((message: ImportedMessage) => ({
        ...message,
        contact: message.contact || message.conversationId || 'WhatsApp'
      }));
      imported.secret_chat_history = (d1History.secretMessages || []).map((message: ImportedMessage) => ({
        ...message,
        contact: message.contact || message.conversationId || 'Chat Secreto'
      }));
      try {
        Object.assign(imported, await importFromProviders(['whatsapp', 'instagram', 'facebook'], 'messages', true));
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Não foi possível importar mensagens dos provedores.');
      }
      let webHistoryError = '';
      try {
        const webHistoryResponse = await fetch('/api/v1/integrations/whatsapp/web-history', {
          headers: { Authorization: 'Bearer '.concat(token) }
        });
        const webHistoryData = await webHistoryResponse.json();
        if (!webHistoryResponse.ok) {
          throw new Error(webHistoryData.error || 'Não foi possível carregar o histórico do WhatsApp Web.');
        }
        imported.whatsapp_web = (webHistoryData.messages || []).map((message: {
          id: string;
          conversationId: string;
          contactName: string;
          fromMe: boolean;
          text: string;
          timestamp: string;
        }) => ({
          id: message.id,
          contact: message.contactName,
          conversationId: message.conversationId,
          fromMe: message.fromMe,
          text: message.text,
          timestamp: message.timestamp
        }));
      } catch (error) {
        webHistoryError = error instanceof Error
          ? `WhatsApp Web: ${error.message}`
          : 'WhatsApp Web: não foi possível carregar o histórico.';
      }
      const mediaImportWarnings: string[] = [];
      const hydrateAttachment = async (url?: string) => {
        if (!url) return undefined;
        try {
          return await hydrateProviderUrl(url, token);
        } catch {
          mediaImportWarnings.push('Um anexo de mensagem não pôde ser carregado.');
          return undefined;
        }
      };
      const contacts: Record<string, { name: string; provider: string }> = {};
      const messages = (await Promise.all(Object.entries(imported).flatMap(([provider, items]) =>
        (items as ImportedMessage[]).map(async (item) => {
          const contactKey = `${provider}_${item.conversationId || item.contact}`;
          contacts[contactKey] = {
            name: item.contact,
            provider: item.provider ||
              (provider === 'whatsapp_web' ? 'WhatsApp Web' :
                provider === 'secret_chat_history' ? 'Chat Secreto' :
                  provider === 'whatsapp_history' ? 'WhatsApp (Histórico D1)' : provider)
          };
          const parsedTime = new Date(item.timestamp);
          return {
            contactKey,
            message: {
              sender: item.fromMe ? 'admin' as const : 'user' as const,
              text: item.text,
              time: Number.isNaN(parsedTime.getTime())
                ? ''
                : parsedTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              externalId: item.id,
              imageUrl: await hydrateAttachment(item.imageUrl),
              videoUrl: await hydrateAttachment(item.videoUrl),
              audioUrl: await hydrateAttachment(item.audioUrl)
            }
          };
        })
      )));
      let count = 0;
      const nextMessages = { ...chatMessages };
      for (const { contactKey, message } of messages) {
        const conversation = nextMessages[contactKey] || [];
        if (conversation.some((existing) => existing.externalId === message.externalId)) continue;
        nextMessages[contactKey] = [...conversation, message];
        count += 1;
      }
      setChatMessages(nextMessages);
      setChatContacts((previous) => ({ ...previous, ...contacts }));
      const firstSecretChat = Object.keys(contacts).find((key) => contacts[key].provider === 'Chat Secreto');
      const firstContact = firstSecretChat || Object.keys(contacts)[0];
      if (firstContact) setActiveChatUser(firstContact);
      setImportMessage(
        `${count} mensagem(ns) carregada(s) do histórico conectado.` +
        (webHistoryError ? ` ${webHistoryError}; o histórico do D1 foi mantido.` : '') +
        (mediaImportWarnings.length ? ` ${mediaImportWarnings[0]}` : '')
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Não foi possível importar as mensagens.');
    } finally {
      setIsImportingMessages(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'chat' && isAuthenticated) void handleImportMessages();
  }, [activeSection, isAuthenticated]);

  const handleImportMedia = async () => {
    const pickerWindow = integrationStatuses['google-photos']?.status === 'connected'
      ? window.open('about:blank', 'google-photos-picker', 'popup,width=900,height=760')
      : null;
    setIsImportingMedia(true);
    setImportError('');
    setImportMessage('');
    setGooglePhotosPickerUrl('');
    try {
      const imported = await importFromProviders(
        ['whatsapp', 'instagram', 'facebook', 'google', 'youtube', 'twitter', 'onedrive'],
        'media',
        true
      );
      const token = localStorage.getItem('cc_auth_token') || '';
      const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const statusResponse = await fetch('/api/v1/integrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statusData = await statusResponse.json();
      if (!statusResponse.ok) throw new Error(statusData.error || 'Não foi possível verificar as integrações.');
      const photosConnected = (statusData.integrations || []).some(
        (integration: { provider: string; status: string }) =>
          integration.provider === 'google-photos' && integration.status === 'connected'
      );
      if (photosConnected) {
        const createResponse = await fetch('/api/v1/integrations/google-photos/import', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ resource: 'media' })
        });
        const pickerSession = await createResponse.json();
        if (!createResponse.ok) throw new Error(pickerSession.error || 'Não foi possível abrir o Google Fotos.');
        const selectionUrl = String(pickerSession.selection_url || '');
        const sessionId = String(pickerSession.session_id || '');
        if (!selectionUrl || !sessionId) throw new Error('O Google Fotos não retornou uma sessão de seleção válida.');
        setGooglePhotosPickerUrl(selectionUrl);
        if (pickerWindow) pickerWindow.location.assign(selectionUrl);
        setImportMessage('Selecione fotos ou vídeos na janela do Google Fotos para concluir a importação.');

        const deadline = Date.now() + 10 * 60 * 1000;
        let selectionComplete = false;
        while (Date.now() < deadline) {
          if (pickerWindow?.closed) throw new Error('A seleção do Google Fotos foi cancelada.');
          await new Promise((resolve) => window.setTimeout(resolve, 4000));
          const pollResponse = await fetch('/api/v1/integrations/google-photos/import', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ resource: 'media', session_id: sessionId })
          });
          const pollData = await pollResponse.json();
          if (!pollResponse.ok) throw new Error(pollData.error || 'Não foi possível consultar a seleção do Google Fotos.');
          if (!pollData.selection_pending) {
            imported['google-photos'] = pollData.items || [];
            selectionComplete = true;
            break;
          }
        }
        if (!selectionComplete) throw new Error('A seleção do Google Fotos expirou. Inicie a importação novamente.');
        pickerWindow?.close();
        setGooglePhotosPickerUrl('');
      } else {
        pickerWindow?.close();
      }
      const importedItems = Object.values(imported).flat() as AdminMediaItem[];
      const currentIds = new Set(mediaItems.map((item) => item.id));
      const items = await Promise.all(importedItems.map(async (item) => {
        if (currentIds.has(item.id)) return item;
        const url = item.url ? await hydrateProviderUrl(item.url, token) : undefined;
        const thumb = item.thumb === item.url
          ? url || ''
          : item.thumb ? await hydrateProviderUrl(item.thumb, token) : '';
        return {
          ...item,
          url,
          thumb
        };
      }));
      setMediaItems((previous) => {
        const existingIds = new Set(previous.map((item) => item.id));
        return [...items.filter((item) => !existingIds.has(item.id)), ...previous];
      });
      setImportMessage(`${items.length} mídia(s) encontrada(s); itens existentes não foram duplicados.`);
    } catch (error) {
      pickerWindow?.close();
      setImportError(error instanceof Error ? error.message : 'Não foi possível importar as mídias.');
    } finally {
      setIsImportingMedia(false);
    }
  };

  const handleReviewStatus = async (id: string, newStatus: 'Aprovado' | 'Rejeitado') => {
    setReviewError('');
    try {
      const token = localStorage.getItem('cc_auth_token');
      const response = await fetch(`/api/v1/reviews/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer '.concat(token) } : {}) },
        body: JSON.stringify({ status: newStatus === 'Aprovado' ? 'approved' : 'rejected' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar a avaliação.');
      setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, status: newStatus } : review)));
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Não foi possível atualizar a avaliação.');
    }
  };

  const activeChatContact = chatContacts[activeChatUser];
  const activeChatName = activeChatContact?.name || 'Selecione uma conversa real';

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white flex items-center justify-center p-6">
        <p className="text-sm text-[#D4D9E2]/70">Verificando sessão administrativa...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#12141A] p-8">
          <div>
            <h1 className="text-2xl font-serif">
              {authMode === 'register' ? 'Cadastro de administrador' :
                authMode === 'forgot' ? 'Recuperar senha' :
                  authMode === 'reset' ? 'Redefinir senha' : 'Acesso administrativo'}
            </h1>
            <p className="mt-2 text-sm text-[#D4D9E2]/65">
              {authMode === 'register'
                ? 'Crie sua conta para acessar o painel administrativo.'
                : authMode === 'forgot'
                  ? 'Informe o e-mail da sua conta para receber um link de recuperação.'
                  : authMode === 'reset'
                    ? 'Escolha uma nova senha para sua conta administrativa.'
                    : 'Entre para acessar conversas, mídias e provedores conectados.'}
            </p>
          </div>
          {authError && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{authError}</p>}
          {authNotice && <p role="status" className="rounded-lg border border-emerald-400/30 bg-emerald-950/30 p-3 text-sm text-emerald-200">{authNotice}</p>}

          {authMode === 'register' ? (
            <form onSubmit={handleAdminRegistration} className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span>Nome</span>
                <input autoComplete="name" type="text" required maxLength={100} value={registrationName} onChange={(event) => setRegistrationName(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>E-mail</span>
                <input autoComplete="email" type="email" required maxLength={254} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Nome de usuário</span>
                <input autoComplete="username" type="text" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_-]{3,30}" value={registrationUsername} onChange={(event) => setRegistrationUsername(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Senha (mínimo 12 caracteres)</span>
                <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={registrationPassword} onChange={(event) => setRegistrationPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Confirme a senha</span>
                <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={registrationPasswordConfirm} onChange={(event) => setRegistrationPasswordConfirm(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Código de convite</span>
                <input autoComplete="off" type="password" required value={registrationInviteCode} onChange={(event) => setRegistrationInviteCode(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <button disabled={authBusy} type="submit" className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                {authBusy ? 'Criando conta...' : 'Cadastrar como admin'}
              </button>
              <button type="button" onClick={() => { setAuthError(''); setAuthNotice(''); setAuthMode('login'); }} className="w-full text-sm text-sky-300 hover:underline">
                Voltar para entrar
              </button>
            </form>
          ) : authMode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span>E-mail da conta administrativa</span>
                <input autoComplete="email" type="email" required maxLength={254} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <button disabled={authBusy} type="submit" className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                {authBusy ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
              <button type="button" onClick={() => { setAuthError(''); setAuthNotice(''); setAuthMode('login'); }} className="w-full text-sm text-sky-300 hover:underline">
                Voltar para entrar
              </button>
            </form>
          ) : authMode === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span>Nova senha (mínimo 12 caracteres)</span>
                <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Confirme a nova senha</span>
                <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={resetPasswordConfirm} onChange={(event) => setResetPasswordConfirm(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <button disabled={authBusy} type="submit" className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60">
                {authBusy ? 'Redefinindo...' : 'Salvar nova senha'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <label className="block space-y-1 text-sm">
                <span>E-mail ou usuário do D1</span>
                <input autoComplete="username" type="text" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <label className="block space-y-1 text-sm">
                <span>Senha</span>
                <input autoComplete="current-password" type="password" required value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#090A0C] px-3 py-2" />
              </label>
              <button type="submit" className="w-full rounded-lg bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400">Entrar</button>
              <div className="flex flex-wrap justify-between gap-3 text-sm">
                <button type="button" onClick={() => { setAuthError(''); setAuthNotice(''); setAuthMode('register'); }} className="text-sky-300 hover:underline">
                  Cadastre-se como admin
                </button>
                <button type="button" onClick={() => { setAuthError(''); setAuthNotice(''); setAuthMode('forgot'); }} className="text-sky-300 hover:underline">
                  Esqueci minha senha
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

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
            title="Sessão administrativa ativa"
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
          {ADMIN_ROUTES.filter((route) => route.visible !== false && (route.id !== 'admins' || isSuperadmin)).map((route) => {
            const isActive = isRouteActive(route);
            const Icon = route.icon;
            return (
              <button
                key={route.path}
                onClick={() => handleSelectRoute(route)}
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
          {ADMIN_ROUTES.filter((route) => route.visible !== false && (route.id !== 'admins' || isSuperadmin)).map((route) => {
            const badge = getRouteBadge(route);
            const isActive = isRouteActive(route);
            return (
              <button
                key={route.path}
                onClick={() => handleSelectRoute(route)}
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
                {ADMIN_ROUTES.filter((route) => route.visible !== false && (route.id !== 'admins' || isSuperadmin)).map((route) => {
                  const isActive = isRouteActive(route);
                  const badge = getRouteBadge(route);
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.path}
                      onClick={() => handleSelectRoute(route)}
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
                <span>Conta autenticada</span>
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
        {activeSection === 'feed' && (
          <section className="space-y-5">
            <header className="border-b border-white/[0.08] pb-4">
              <h1 className="text-2xl sm:text-3xl text-white">Feed de publicações</h1>
              <p className="mt-1 text-xs text-[#D4D9E2]/65">
                Publicações públicas carregadas do D1 e das contas sociais conectadas.
              </p>
            </header>
            {adminFeedError && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{adminFeedError}</p>}
            {adminFeedLoading && <p role="status" className="text-sm text-[#D4D9E2]/65">Carregando publicações…</p>}
            {!adminFeedLoading && !adminFeedError && adminFeedItems.length === 0 && (
              <p className="rounded-xl border border-white/[0.08] bg-[#12141A] p-8 text-center text-sm text-[#D4D9E2]/65">
                Nenhuma publicação pública disponível. Conecte os provedores ou publique conteúdo no D1.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminFeedItems.map((item) => (
                <article key={`${item.provider}:${item.id}`} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#12141A]">
                  {item.media_url && item.media_type.toUpperCase().includes('VIDEO')
                    ? <video src={item.media_url} poster={item.thumbnail_url} controls className="aspect-video w-full object-cover" />
                    : item.media_url || item.thumbnail_url
                      ? <img src={item.thumbnail_url || item.media_url} alt={item.caption || 'Mídia da publicação'} className="aspect-video w-full object-cover" loading="lazy" />
                      : null}
                  <div className="space-y-2 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-sky-300">{item.provider}</p>
                    <p className="line-clamp-4 whitespace-pre-wrap text-sm text-[#F5F7FA]">{item.caption || 'Publicação sem legenda'}</p>
                    {item.timestamp && <time className="block text-[10px] text-[#D4D9E2]/45">{new Date(item.timestamp).toLocaleString('pt-BR')}</time>}
                    {item.permalink && <a href={item.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-300 underline">Abrir no provedor <ExternalLink className="h-3 w-3" /></a>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'calendar' && (
          <section className="space-y-4">
            <header className="border-b border-white/[0.08] pb-4">
              <h1 className="text-2xl sm:text-3xl text-white">Calendário</h1>
              <p className="mt-1 text-xs text-[#D4D9E2]/65">Eventos e sincronização com calendários externos.</p>
            </header>
            <div className="rounded-xl border border-amber-300/20 bg-[#12141A] p-6">
              <p className="text-sm text-amber-200">A sincronização de eventos ainda não está conectada a uma API de calendário neste painel.</p>
              <p className="mt-2 text-xs text-[#D4D9E2]/60">As integrações Google/Apple não serão apresentadas como calendário sincronizado sem uma fonte real de eventos.</p>
              <button type="button" onClick={() => handleSelectSection('integrations')} className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs text-sky-200 hover:bg-white/[0.06]">Ver integrações</button>
            </div>
          </section>
        )}

        {activeSection === 'cerebro' && (
          <section className="flex flex-col space-y-6">
            <header className="order-0 border-b border-white/[0.08] pb-4">
              <h1 className="text-2xl sm:text-3xl text-white">Cérebro Central IA</h1>
              <p className="mt-1 text-xs text-[#D4D9E2]/65">Controle os serviços disponíveis e as opções de automação.</p>
            </header>
            {systemHealthError && <p role="alert" className="order-2 text-sm text-red-200">{systemHealthError}</p>}
            <div className="order-2 grid gap-3 sm:grid-cols-2">
              {([
                ['Backend', String(systemHealth?.status || 'Indisponível')],
                ['D1', String(systemHealth?.d1_database || 'Indisponível')],
                ['R2', String(systemHealth?.r2_storage || 'Indisponível')],
                ['Runtime', String(systemHealth?.runtime || 'Indisponível')]
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.08] bg-[#12141A] p-5">
                  <p className="text-xs text-[#D4D9E2]/55">{label}</p>
                  <p className="mt-1 text-base text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="order-1 rounded-2xl border border-white/[0.08] bg-[#12141A] p-5 sm:p-6">
              <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl text-white">Serviços ativos</h2>
                  <p className="mt-1 text-xs text-[#D4D9E2]/60">Use o switch para ativar ou bloquear cada serviço com uma dica do efeito atual.</p>
                </div>
                <button
                  type="button"
                  onClick={saveCerebroSettings}
                  disabled={cerebroSettingsSaving || !cerebroSettings}
                  className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cerebroSettingsSaving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>

              {cerebroSettingsError && <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{cerebroSettingsError}</p>}
              {cerebroSettingsMessage && <p role="status" className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-950/20 p-3 text-sm text-emerald-200">{cerebroSettingsMessage}</p>}
              {cerebroSettingsLoading && <p className="mt-4 text-sm text-[#D4D9E2]/65">Carregando serviços e opções do Cérebro Central...</p>}

              {!cerebroSettingsLoading && cerebroSettings && (
                <div className="mt-5 space-y-5">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {([
                      ['autoReplyEnabled', 'Auto resposta'],
                      ['defaultVoiceEnabled', 'Voz padrão'],
                    ] as const).map(([field, label]) => (
                      <label key={field} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div>
                          <p className="text-sm text-white">{label}</p>
                          <p className="mt-1 text-[11px] text-[#D4D9E2]/55">
                            {field === 'autoReplyEnabled'
                              ? 'Define se o Cérebro Central responde automaticamente.'
                              : 'Define se novas conversas herdam resposta automática também em áudio.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCerebroSettings((prev) => prev ? {
                            ...prev,
                            conversation: {
                              ...prev.conversation,
                              [field]: !prev.conversation[field as keyof typeof prev.conversation]
                            }
                          } : prev)}
                          aria-pressed={field === 'autoReplyEnabled' ? cerebroSettings.conversation.autoReplyEnabled : cerebroSettings.conversation.defaultVoiceEnabled}
                          className={`relative h-7 w-12 rounded-full transition ${
                            (field === 'autoReplyEnabled' ? cerebroSettings.conversation.autoReplyEnabled : cerebroSettings.conversation.defaultVoiceEnabled)
                              ? 'bg-sky-500'
                              : 'bg-white/10'
                          }`}
                        >
                          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            (field === 'autoReplyEnabled' ? cerebroSettings.conversation.autoReplyEnabled : cerebroSettings.conversation.defaultVoiceEnabled)
                              ? 'left-6'
                              : 'left-1'
                          }`} />
                        </button>
                      </label>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">Estilo da Resposta</p>
                        <p className="mt-1 text-[11px] text-[#D4D9E2]/55">Escolha o comportamento da automação para este admin.</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {RESPONSE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setCerebroSettings((prev) => prev ? {
                            ...prev,
                            conversation: { ...prev.conversation, responseStyle: style.id }
                          } : prev)}
                          className={`rounded-xl border p-3 text-left transition ${
                            cerebroSettings.conversation.responseStyle === style.id
                              ? 'border-sky-400/40 bg-sky-400/10'
                              : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-white">{style.label}</span>
                            {cerebroSettings.conversation.responseStyle === style.id && <span className="text-[10px] uppercase tracking-[0.2em] text-sky-300">Ativo</span>}
                          </div>
                          <p className="mt-2 text-[11px] text-[#D4D9E2]/60">{style.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#D4D9E2]/50">
                      <span>Serviços permitidos</span>
                      <span>
                        {CEREBRO_SERVICES.filter(({ id }) => cerebroSettings.services[id]).length} de {CEREBRO_SERVICES.length} ativos
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {CEREBRO_SERVICES.map((service) => {
                        const enabled = !!cerebroSettings.services[service.id];
                        return (
                          <div key={service.id} className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white">{service.label}</p>
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${enabled ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/[0.02] text-[#D4D9E2]/45'}`}>
                                    {enabled ? 'Ativo' : 'Bloqueado'}
                                  </span>
                                </div>
                                <p className="mt-2 text-[11px] leading-relaxed text-[#D4D9E2]/60">{service.description}</p>
                                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-sky-300">ID: {service.id}</p>
                              </div>
                              <button
                                type="button"
                                aria-pressed={enabled}
                                onClick={() => toggleCerebroService(service.id)}
                                className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition ${enabled ? 'bg-sky-500' : 'bg-white/10'}`}
                              >
                                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'admins' && (
          <section className="space-y-4">
            <header className="border-b border-white/[0.08] pb-4">
              <h1 className="text-2xl sm:text-3xl text-white">Gerenciador de administradores</h1>
              <p className="mt-1 text-xs text-[#D4D9E2]/65">Área reservada à conta superadmin.</p>
            </header>
            {isSuperadmin ? (
              <div className="rounded-xl border border-white/[0.08] bg-[#12141A] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#D4D9E2]/70">Contas administrativas, sem contas superadmin.</p>
                  <button
                    type="button"
                    onClick={() => setAdminListRevision((revision) => revision + 1)}
                    disabled={adminListLoading}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-sky-200 hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    {adminListLoading ? 'Carregando...' : 'Atualizar'}
                  </button>
                </div>
                {adminListError && (
                  <p role="alert" className="mb-4 rounded-lg border border-red-400/25 bg-red-950/20 px-4 py-3 text-sm text-red-200">
                    {adminListError}
                  </p>
                )}
                {adminListLoading && adminAccounts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#D4D9E2]/55">Carregando administradores...</p>
                ) : adminAccounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="border-b border-white/[0.08] text-[10px] uppercase tracking-wider text-[#D4D9E2]/45">
                        <tr>
                          <th className="px-3 py-3 font-medium">Nome</th>
                          <th className="px-3 py-3 font-medium">E-mail</th>
                          <th className="px-3 py-3 font-medium">Cadastro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {adminAccounts.map((admin) => (
                          <tr key={admin.id}>
                            <td className="px-3 py-3 text-white">{admin.name}</td>
                            <td className="px-3 py-3 text-[#D4D9E2]/75">{admin.email}</td>
                            <td className="px-3 py-3 text-[#D4D9E2]/55">
                              {admin.created_at && Number.isFinite(Date.parse(admin.created_at))
                                ? new Date(admin.created_at).toLocaleDateString('pt-BR')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !adminListError ? (
                  <p className="py-8 text-center text-sm text-[#D4D9E2]/55">
                    Nenhuma conta admin não-superadmin foi encontrada.
                  </p>
                ) : null}
              </div>
            ) : (
              <p role="alert" className="rounded-xl border border-red-400/30 bg-red-950/30 p-5 text-sm text-red-200">Acesso permitido somente para superadmin.</p>
            )}
          </section>
        )}

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
                  Indicadores serão exibidos quando as fontes de dados estiverem conectadas.
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
                <div className="text-2xl sm:text-3xl font-serif text-emerald-400">—</div>
                <div className="text-[11px] font-sans text-[#D4D9E2]/60">Dados não conectados</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Assinantes Ativos</span>
                  <Users className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-white">—</div>
                <div className="text-[11px] font-sans text-[#D4D9E2]/60">Dados não conectados</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Tráfego Edge</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-[#38BDF8]">—</div>
                <div className="text-[11px] font-sans text-[#D4D9E2]/60">Dados não conectados</div>
              </div>

              <div className="bg-[#12141A] border border-white/[0.08] rounded-xl p-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#D4D9E2]/70">
                  <span>Custo Servidores</span>
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif text-purple-400">—</div>
                <div className="text-[11px] font-sans text-[#D4D9E2]/60">Dados não conectados</div>
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
                    <tr>
                      <td colSpan={6} className="py-8 px-3 text-center text-[#D4D9E2]/55">
                        Nenhuma transação real está conectada.
                      </td>
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
            <div className="pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Assinantes & Membros
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Os dados de assinaturas ainda não estão conectados ao banco.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#12141A] px-6 py-12 text-center">
              <p className="text-sm text-[#D4D9E2]/70">Nenhum dado real de assinantes disponível.</p>
              <p className="mt-2 text-xs text-[#D4D9E2]/45">
                O D1 conectado não possui uma fonte de assinaturas. Nenhum membro ou plano fictício será mostrado.
              </p>
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
                  Biblioteca local e mídias importadas dos provedores conectados.
                </p>
              </div>

              <button
                type="button"
                onClick={handleImportMedia}
                disabled={isImportingMedia}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs text-sky-200 hover:bg-sky-400/20 disabled:opacity-50"
              >
                {isImportingMedia ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {isImportingMedia ? 'Importando...' : 'Importar mídias conectadas'}
              </button>
            </div>
            {importError && <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-xs text-red-200">{importError}</div>}
            {importMessage && <p role="status" className="text-xs text-emerald-300">{importMessage}</p>}
            {googlePhotosPickerUrl && (
              <a
                href={googlePhotosPickerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-sky-400/30 px-3 py-2 text-xs text-sky-200 underline"
              >
                Abrir seleção do Google Fotos
              </a>
            )}

            {/* Media Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="bg-[#12141A] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative h-40 overflow-hidden bg-black/40">
                    {item.category === 'Vídeos' && item.url &&
                      item.provider !== 'YouTube' && item.provider !== 'X (Twitter)' ? (
                      <video src={item.url} controls className="h-full w-full object-cover" aria-label={item.name} />
                    ) : item.thumb || item.url ? (
                      <img
                        src={item.thumb || item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#D4D9E2]/45">
                        Prévia indisponível
                      </div>
                    )}
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
                    {item.provider && <div className="text-[10px] text-sky-300">Importado de {item.provider}</div>}
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-sky-300 underline">Abrir no provedor</a>}

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
              {mediaItems.length === 0 && (
                <p className="col-span-full rounded-xl border border-white/[0.08] bg-[#12141A] px-6 py-10 text-center text-xs text-[#D4D9E2]/55">
                  Nenhuma mídia real importada. A galeria permanecerá vazia até conectar um provedor.
                </p>
              )}
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
                  Conversas importadas
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Mensagens reais importadas de provedores autorizados.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleImportMessages}
                  disabled={isImportingMessages}
                  className="inline-flex items-center gap-2 rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs text-sky-200 hover:bg-sky-400/20 disabled:opacity-50"
                >
                  {isImportingMessages ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  {isImportingMessages ? 'Importando...' : 'Importar mensagens'}
                </button>
              </div>
            </div>
            {importError && <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-xs text-red-200">{importError}</div>}
            {importMessage && <p role="status" className="text-xs text-emerald-300">{importMessage}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px] bg-[#12141A] border border-white/[0.08] rounded-xl overflow-hidden">
              {/* Member Thread List */}
              <div className="border-r border-white/[0.08] bg-[#090A0C]/50 flex flex-col">
                <div className="p-3.5 border-b border-white/[0.08] text-xs font-serif uppercase tracking-wider text-[#D4D9E2]/70">
                  Conversas Recentes
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                  {Object.keys(chatMessages).map((userId) => {
                    const lastMsg = chatMessages[userId]?.[chatMessages[userId].length - 1];
                    const contact = chatContacts[userId];
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
                          <div className="text-xs font-semibold text-white font-serif">{contact?.name || 'Contato importado'}</div>
                          {contact && <div className="text-[9px] uppercase text-sky-300">{contact.provider}</div>}
                          <div className="text-[11px] text-[#D4D9E2]/60 truncate max-w-[160px] font-sans">
                            {lastMsg?.text || 'Sem mensagens'}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#D4D9E2]/40 font-mono">{lastMsg?.time || ''}</span>
                      </button>
                    );
                  })}
                  {Object.keys(chatMessages).length === 0 && (
                    <p className="p-5 text-xs text-[#D4D9E2]/55">
                      Nenhuma conversa real importada. Conecte um provedor e importe mensagens.
                    </p>
                  )}
                </div>
              </div>

              {/* Chat Viewport (Estilo idêntico ao floating chat drawer) */}
              <div className="col-span-2 flex flex-col h-full bg-[#12141A]">
                <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-bold text-xs font-serif">
                      {activeChatName[0] || 'M'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white font-serif">
                        {activeChatName}
                      </div>
                      <div className="text-[10px] text-[#D4D9E2]/50 font-sans">
                        {activeChatContact ? `Importado de ${activeChatContact.provider}` : 'Nenhuma conversa selecionada'}
                      </div>
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
                        {msg.imageUrl && <img src={msg.imageUrl} alt="Imagem enviada na conversa" className="mt-2 max-h-48 rounded-lg" />}
                        {msg.videoUrl && <video src={msg.videoUrl} controls preload="metadata" className="mt-2 max-h-48 rounded-lg" />}
                        {msg.audioUrl && <audio src={msg.audioUrl} controls preload="metadata" className="mt-2 max-w-full" />}
                      </div>
                      <span className="text-[9px] font-mono text-[#D4D9E2]/40 mt-1 px-1">
                        {msg.sender === 'admin' ? 'Você' : 'Membro'} · {msg.time}
                      </span>
                    </div>
                  ))}
                  {!activeChatUser && (
                    <p className="text-center text-xs text-[#D4D9E2]/50">
                      Selecione uma conversa importada para visualizar mensagens.
                    </p>
                  )}
                </div>

                <p className="border-t border-white/[0.08] bg-[#090A0C] p-3 text-center text-[11px] text-[#D4D9E2]/45">
                  Respostas não estão habilitadas; nenhuma mensagem será simulada ou enviada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SEÇÃO 5: WHATSAPP & CONVERSAS
           ============================================================ */}
        {activeSection === 'conversations' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/[0.08]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">
                  Conversas & Canais
                </h1>
                <p className="text-xs font-serif text-[#D4D9E2]/70 mt-1">
                  Apenas conexões e mensagens verificadas dos provedores são exibidas.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateAdmin?.('/admin/chat')}
                  className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-sky-200 hover:bg-white/[0.06]"
                >
                  Abrir histórico do Chat
                </button>
              </div>
            </div>

            {integrationError && (
              <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-xs text-red-200">
                {integrationError}
              </div>
            )}

            {integrationsLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-[#D4D9E2]/70">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Verificando conexões...
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.08] bg-[#12141A] p-5">
                <h2 className="text-sm font-semibold text-white">WhatsApp</h2>
                <p className="mt-2 text-xs text-[#D4D9E2]/65">
                  {integrationError
                    ? 'Status indisponível até que a conexão possa ser verificada.'
                    : integrationStatuses.whatsapp?.status === 'connected'
                    ? integrationStatuses.whatsapp.auth_source === 'environment'
                      ? 'Token de acesso definido no ambiente do servidor. O histórico disponível no D1 pode ser carregado na seção Chat.'
                      : 'Conexão autorizada. Importe mensagens reais na seção Chat.'
                    : integrationStatuses.whatsapp?.status === 'not_configured'
                      ? `Configuração pendente${integrationStatuses.whatsapp.missing_env.length ? `: ${integrationStatuses.whatsapp.missing_env.join(', ')}` : '.'}`
                      : integrationStatuses.whatsapp
                        ? 'Não conectado. Nenhum número, conversa ou mensagem será inventado.'
                        : 'Nenhum status real de conexão disponível.'}
                </p>
                {typeof integrationStatuses.whatsapp?.account?.display_phone_number === 'string' && (
                  <p className="mt-2 text-xs text-[#D4D9E2]/50">
                    Número conectado: {integrationStatuses.whatsapp.account.display_phone_number}
                  </p>
                )}
              </div>
            )}
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
              {reviewError && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-xs text-red-200">{reviewError}</p>}
              {reviewsLoading && <p role="status" className="text-xs text-[#D4D9E2]/60">Carregando avaliações do banco...</p>}
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
              {!reviewsLoading && reviews.length === 0 && (
                <p className="rounded-xl border border-white/[0.08] bg-[#12141A] px-6 py-10 text-center text-xs text-[#D4D9E2]/55">
                  Nenhuma avaliação registrada no banco.
                </p>
              )}
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

              <span className="text-xs font-mono text-sky-300 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-[8px]">
                Status do ambiente
              </span>
            </div>

            <p className="text-xs text-[#D4D9E2]/60">
              Conecte os provedores pelos respectivos fluxos de autorização. WhatsApp Business Cloud API (Meta Embedded Signup) e WhatsApp Web (QR de dispositivo) são conexões separadas; a sessão Web é criptografada no D1.
            </p>

            {integrationError && (
              <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {integrationError}
              </div>
            )}
            {integrationMessage && <p role="status" className="text-xs text-emerald-300">{integrationMessage}</p>}

            {integrationsLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-[#D4D9E2]/70">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Carregando integrações...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {INTEGRATION_PROVIDERS.map(({ id, name }) => {
                  const integration = integrationStatuses[id];
                  const isConnected = integration?.status === 'connected';
                  const isNotConfigured = integration?.status === 'not_configured';
                  const isBusy = integrationBusy === id;
                  const account = integration?.account ?? {};
                  const accountLabel = [
                    account.email,
                    account.name,
                    account.username,
                    account.display_phone_number,
                    account.verified_name,
                    account.stripe_user_id,
                    account.user_id,
                    account.connection_type
                  ].find((value): value is string => typeof value === 'string');
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#12141A] p-4"
                    >
                      <div className="min-w-0">
                        <div className="font-serif text-sm text-white">{name}</div>
                        {id === 'whatsapp' && (
                          <div className="mt-1 text-[10px] leading-relaxed text-[#D4D9E2]/55">
                            WhatsApp Business via Embedded Signup da Meta em popup; pareamento Web por QR separado.
                          </div>
                        )}
                        <div className={`mt-1 text-[11px] ${isConnected ? 'text-emerald-400' : isNotConfigured ? 'text-amber-300' : 'text-[#D4D9E2]/50'}`}>
                          {isConnected
                            ? integration?.auth_source === 'environment'
                              ? 'Token configurado no servidor'
                              : 'Autorizado pelo provedor'
                            : isNotConfigured
                              ? 'Configuração ausente'
                              : integration ? 'Não conectado' : 'Status indisponível'}
                        </div>
                        {accountLabel && <div className="mt-1 break-words text-[10px] text-[#D4D9E2]/60">{accountLabel}</div>}
                        {integration?.connected_at && (
                          <div className="mt-1 text-[10px] text-[#D4D9E2]/40">
                            Conectado em {new Date(integration.connected_at).toLocaleString('pt-BR')}
                          </div>
                        )}
                        {integration?.missing_env.length ? (
                          <div className="mt-1 break-words font-mono text-[10px] text-[#D4D9E2]/45">
                            Faltando: {integration.missing_env.join(', ')}
                          </div>
                        ) : null}
                        {id === 'whatsapp' && !isConnected && (
                          <label className="mt-2 block max-w-64">
                            <span className="sr-only">PIN de registro do WhatsApp Business, 6 dígitos</span>
                            <input
                              type="password"
                              inputMode="numeric"
                              autoComplete="off"
                              maxLength={6}
                              pattern="[0-9]{6}"
                              value={whatsappRegistrationPin}
                              onChange={(event) => setWhatsappRegistrationPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="PIN do WhatsApp Business (6 dígitos)"
                              className="w-full rounded border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white placeholder:text-white/40"
                            />
                          </label>
                        )}
                        {id === 'whatsapp' && (
                          <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs font-medium text-white">WhatsApp Web</div>
                                <div className="mt-1 text-[10px] text-[#D4D9E2]/60" role="status" aria-live="polite">
                                  {whatsappWebStatus?.status === 'connected'
                                    ? `Conectado${whatsappWebStatus.phone_number ? ` · +${whatsappWebStatus.phone_number}` : ''}`
                                    : whatsappWebStatus?.status === 'waiting_for_scan'
                                      ? 'Aguardando leitura do QR no celular'
                                      : whatsappWebStatus?.status === 'connecting'
                                        ? 'Conectando ao WhatsApp...'
                                        : whatsappWebStatus?.status === 'error'
                                          ? whatsappWebStatus.error || 'A conexão falhou.'
                                          : 'Desconectado'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void handleWhatsAppWebAction(
                                  whatsappWebStatus?.status === 'connected' ||
                                    whatsappWebStatus?.status === 'connecting' ||
                                    whatsappWebStatus?.status === 'waiting_for_scan'
                                    ? 'disconnect'
                                    : 'connect'
                                )}
                                disabled={whatsappWebBusy}
                                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-medium text-[#D4D9E2] transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {whatsappWebBusy
                                  ? 'Aguarde...'
                                  : whatsappWebStatus?.status === 'connected'
                                    ? 'Desconectar Web'
                                    : whatsappWebStatus?.status === 'waiting_for_scan'
                                      ? 'Cancelar pareamento'
                                      : whatsappWebStatus?.status === 'connecting'
                                        ? 'Cancelar conexão'
                                        : 'Conectar WhatsApp Web'}
                              </button>
                            </div>
                            {whatsappWebStatus?.status === 'waiting_for_scan' && whatsappWebQrImage && (
                              <div className="rounded-lg bg-white p-2">
                                <img
                                  src={whatsappWebQrImage}
                                  alt="QR real para vincular esta sessão ao WhatsApp Web"
                                  className="mx-auto h-56 w-56"
                                  width="224"
                                  height="224"
                                />
                                <p className="mt-2 text-center text-[10px] text-slate-700">
                                  No celular: WhatsApp → Dispositivos conectados → Conectar dispositivo
                                </p>
                              </div>
                            )}
                            <p className="text-[10px] leading-relaxed text-[#D4D9E2]/45">
                              Pareamento de dispositivo WhatsApp Web com sessão persistida criptografada no D1. Usa protocolo de terceiros, não a API oficial da Meta.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleIntegrationAction(id, isConnected ? 'disconnect' : 'connect')}
                          disabled={
                            isBusy ||
                            integrationBusy !== null ||
                            integrationsLoading ||
                            isNotConfigured ||
                            (isConnected && integration?.auth_source === 'environment')
                          }
                          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            isConnected
                              ? 'border border-white/10 text-[#D4D9E2] hover:bg-white/[0.08]'
                              : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                          }`}
                        >
                          {isBusy
                            ? 'Aguarde...'
                            : isConnected
                              ? integration?.auth_source === 'environment' ? 'Gerenciado pelo servidor' : 'Desconectar'
                              : id === 'whatsapp'
                                ? 'Conectar Business via Meta'
                                : 'Conectar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                Sessão autenticada
              </span>
            </div>

            <div className="relative min-h-16 max-w-[720px] rounded-xl border border-white/[0.10] bg-[#12141A] transition-colors hover:border-[#38BDF8]/40 hover:bg-white/[0.04]">
              <div className="pointer-events-none flex min-h-16 items-center gap-3 px-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
                  <Settings className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base text-white">Gerenciador</span>
                  <span className="block text-[11px] text-[#D4D9E2]/60">
                    {SETTINGS_SELECTOR_TABS.find((tab) => tab.id === settingsTab)?.label} · Escolha uma seção
                  </span>
                </span>
                <span aria-hidden="true" className="text-[#D4D9E2]/60">⌄</span>
              </div>
              <select
                aria-label="Gerenciador de configurações"
                value={settingsTab}
                onChange={(event) => handleSelectSettingsTab(event.target.value as SettingsTabId)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                {SETTINGS_SELECTOR_TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>

            {(profileSettingsLoading || profileSettingsError || profileSettingsMessage) && (
              <div className="max-w-[720px] text-xs" role={profileSettingsError ? 'alert' : 'status'} aria-live="polite">
                {profileSettingsLoading && <span className="text-[#D4D9E2]/65">Sincronizando configurações com o servidor...</span>}
                {profileSettingsError && <span className="text-red-300">{profileSettingsError}</span>}
                {!profileSettingsError && profileSettingsMessage && <span className="text-emerald-300">{profileSettingsMessage}</span>}
              </div>
            )}

            <div className="min-h-40 space-y-6">
              {settingsTab === 'contato' && (
                <div className="max-w-4xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Contato público</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Informações que aparecem no perfil e no site público.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('contato')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">Nome de exibição</span>
                      <input value={contactSettings.displayName} onChange={(event) => setContactSettings({ ...contactSettings, displayName: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">E-mail de contato</span>
                      <input type="email" value={contactSettings.email} onChange={(event) => setContactSettings({ ...contactSettings, email: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">Telefone / WhatsApp</span>
                      <input value={contactSettings.phone} onChange={(event) => setContactSettings({ ...contactSettings, phone: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">Profissão</span>
                      <input value={contactSettings.profession} onChange={(event) => setContactSettings({ ...contactSettings, profession: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">Relacionamento</span>
                      <input value={contactSettings.relationship} onChange={(event) => setContactSettings({ ...contactSettings, relationship: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                    <label className="block text-xs text-[#D4D9E2]/70">
                      <span className="mb-1.5 block">Signo</span>
                      <input value={contactSettings.sign} onChange={(event) => setContactSettings({ ...contactSettings, sign: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    </label>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-[#D4D9E2]/70">Endereço</label>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">Configurado</span>
                      </div>
                    </div>
                    <input value={contactSettings.address} onChange={(event) => setContactSettings({ ...contactSettings, address: event.target.value })} placeholder="Digite o endereço para sugestões de localização" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#D4D9E2]/60">
                      <span>O endereço pode aparecer no mapa e em “Sobre”.</span>
                      <button type="button" className="text-sky-300 underline">Ver locais populares</button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs text-[#D4D9E2]/70">Descrição</label>
                    <textarea value={contactSettings.description} onChange={(event) => setContactSettings({ ...contactSettings, description: event.target.value })} rows={6} className="w-full rounded-[10px] border border-white/[0.10] bg-[#090A0C] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                  </div>
                </div>
              )}

              {settingsTab === 'geral' && (
                <div className="max-w-5xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Redes sociais e rodapé</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Configure os perfis públicos e as opções exibidas no rodapé.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('geral')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {generalSettings.socials.map((network) => (
                      <div key={network.id} className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] text-sm font-bold">
                              {network.label.slice(0, 1)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-white">{network.label}</div>
                              <div className="text-[10px] text-[#D4D9E2]/55">{network.placeholder}</div>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-[11px] text-[#D4D9E2]/70">
                            <input type="checkbox" checked={network.enabled} onChange={(event) => setGeneralSettings({
                              ...generalSettings,
                              socials: generalSettings.socials.map((item) => item.id === network.id ? { ...item, enabled: event.target.checked } : item)
                            })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                            Mostrar no footer
                          </label>
                        </div>
                        <input
                          disabled={!network.enabled}
                          value={network.url}
                          onChange={(event) => setGeneralSettings({
                            ...generalSettings,
                            socials: generalSettings.socials.map((item) => item.id === network.id ? { ...item, url: event.target.value } : item)
                          })}
                          placeholder={network.placeholder}
                          className="mt-3 w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40 focus:border-[#38BDF8]/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'imagens' && (
                <div className="max-w-5xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Perfil e galerias</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Atualize as fotos públicas e as galerias da página inicial.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('imagens')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <label className="mb-1.5 block text-xs text-[#D4D9E2]/70">Foto de perfil</label>
                      <input value={imageSettings.profilePhoto} onChange={(event) => setImageSettings({ ...imageSettings, profilePhoto: event.target.value })} placeholder="URL pública da imagem" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <div className="mt-3 text-[11px] text-[#D4D9E2]/55">Links do Google Drive são rejeitados neste campo.</div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <label className="mb-1.5 block text-xs text-[#D4D9E2]/70">Foto de capa</label>
                      <input value={imageSettings.coverPhoto} onChange={(event) => setImageSettings({ ...imageSettings, coverPhoto: event.target.value })} placeholder="URL pública da imagem" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <div className="mt-3 text-[11px] text-[#D4D9E2]/55">Links do Google Drive também são bloqueados aqui.</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {imageSettings.galleries.map((gallery) => (
                      <div key={gallery.id} className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-white/[0.06] bg-[#12141A]">
                              {gallery.preview ? <img src={gallery.preview} alt={gallery.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-[#D4D9E2]/45">Prévia</div>}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white">{gallery.name}</div>
                              <div className="truncate text-[11px] text-[#D4D9E2]/60">{gallery.url || 'URL vazia'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full border px-2 py-1 text-[10px] ${gallery.configured ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-[#D4D9E2]/55'}`}>
                              {gallery.configured ? 'Configurada' : 'Vazia'}
                            </span>
                            <button type="button" className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-sky-200 hover:bg-white/[0.05]">Prévia</button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 md:flex-row">
                          <input value={gallery.name} onChange={(event) => setImageSettings({
                            ...imageSettings,
                            galleries: imageSettings.galleries.map((item) => item.id === gallery.id ? { ...item, name: event.target.value } : item)
                          })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                          <input value={gallery.url} onChange={(event) => setImageSettings({
                            ...imageSettings,
                            galleries: imageSettings.galleries.map((item) => item.id === gallery.id ? { ...item, url: event.target.value, preview: event.target.value || '', configured: Boolean(event.target.value) } : item)
                          })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'pagamento' && (
                <div className="max-w-4xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">PIX e câmbio</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Ajuste o valor de referência e as conversões internacionais.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('pagamento')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <label className="mb-1.5 block text-xs text-[#D4D9E2]/70">Valor do PIX em BRL</label>
                      <input type="number" min={0.01} max={10000} step={0.01} value={paymentSettings.pixValue} onChange={(event) => setPaymentSettings({ ...paymentSettings, pixValue: Number(event.target.value) || 99 })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <div className="mt-3 flex gap-2">
                        {[49.9, 99, 199].map((amount) => (
                          <button key={amount} type="button" onClick={() => setPaymentSettings({ ...paymentSettings, pixValue: amount })} className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] text-[#D4D9E2] hover:bg-white/[0.06]">R$ {amount.toFixed(2).replace('.', ',')}</button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <label className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                        <span>Conversão internacional automática</span>
                        <input type="checkbox" checked={paymentSettings.autoExchangeEnabled} onChange={(event) => setPaymentSettings({ ...paymentSettings, autoExchangeEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                      </label>
                      <label className="mt-3 block text-xs text-[#D4D9E2]/70">
                        <span className="mb-1.5 block">Moeda de fallback</span>
                        <select value={paymentSettings.fallbackCurrency} onChange={(event) => setPaymentSettings({ ...paymentSettings, fallbackCurrency: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          {['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((currency) => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </select>
                      </label>
                      <label className="mt-3 block text-xs text-[#D4D9E2]/70">
                        <span className="mb-1.5 block">Margem de câmbio (%)</span>
                        <input type="number" min={0} step={0.1} value={paymentSettings.exchangeMargin} onChange={(event) => setPaymentSettings({ ...paymentSettings, exchangeMargin: Number(event.target.value) })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="mb-3 text-xs font-medium text-[#D4D9E2]/70">Moedas habilitadas</div>
                    <div className="flex flex-wrap gap-2">
                      {['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((currency) => (
                        <button key={currency} type="button" onClick={() => setPaymentSettings({ ...paymentSettings, enabledCurrencies: paymentSettings.enabledCurrencies.includes(currency) ? paymentSettings.enabledCurrencies.filter((item) => item !== currency) : [...paymentSettings.enabledCurrencies, currency] })} className={`rounded-full border px-3 py-1.5 text-[11px] ${paymentSettings.enabledCurrencies.includes(currency) ? 'border-sky-400/40 bg-sky-400/10 text-sky-200' : 'border-white/10 bg-white/[0.02] text-[#D4D9E2]'}`}>
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'servicos' && (
                <div className="max-w-4xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Serviços e tradução</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Ative traduções, configurações automáticas e modelos de IA.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('servicos')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <label className="block text-xs text-[#D4D9E2]/70">
                        <span className="mb-1.5 block">Provedor</span>
                        <select value={servicesSettings.provider} onChange={(event) => setServicesSettings({ ...servicesSettings, provider: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          <option value="google">Google Translate</option>
                          <option value="deepl">DeepL</option>
                          <option value="genkit">Genkit</option>
                          <option value="copilot">GitHub Copilot</option>
                        </select>
                      </label>
                      {servicesSettings.provider === 'copilot' && (
                        <label className="mt-3 block text-xs text-[#D4D9E2]/70">
                          <span className="mb-1.5 block">Modelo do GitHub Copilot</span>
                          <input value={servicesSettings.copilotModel} onChange={(event) => setServicesSettings({ ...servicesSettings, copilotModel: event.target.value })} placeholder="Modelo disponível na conta conectada" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                        </label>
                      )}
                      <label className="mt-3 block text-xs text-[#D4D9E2]/70">
                        <span className="mb-1.5 block">Modo</span>
                        <select value={servicesSettings.mode} onChange={(event) => setServicesSettings({ ...servicesSettings, mode: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          <option value="manual">Manual</option>
                          <option value="automatic">Automático</option>
                        </select>
                      </label>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                        <span>Ativar tradução</span>
                        <input type="checkbox" checked={servicesSettings.enabled} onChange={(event) => setServicesSettings({ ...servicesSettings, enabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="block text-xs text-[#D4D9E2]/70">
                          <span className="mb-1.5 block">Idioma nativo</span>
                          <select value={servicesSettings.nativeLanguage} onChange={(event) => setServicesSettings({ ...servicesSettings, nativeLanguage: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                          </select>
                        </label>
                        <label className="block text-xs text-[#D4D9E2]/70">
                          <span className="mb-1.5 block">Idioma alvo</span>
                          <select value={servicesSettings.targetLanguage} onChange={(event) => setServicesSettings({ ...servicesSettings, targetLanguage: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                            <option value="en">Inglês</option>
                            <option value="pt">Português</option>
                          </select>
                        </label>
                      </div>
                      <div className="mt-4 space-y-3 border-t border-white/[0.08] pt-4">
                        <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                          <span>Tradução automática de mensagens recebidas</span>
                          <input type="checkbox" checked={servicesSettings.autoTranslateIncoming} disabled={!servicesSettings.enabled} onChange={(event) => setServicesSettings({ ...servicesSettings, autoTranslateIncoming: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                          <span>Tradução automática de mensagens enviadas</span>
                          <input type="checkbox" checked={servicesSettings.autoTranslateOutgoing} disabled={!servicesSettings.enabled} onChange={(event) => setServicesSettings({ ...servicesSettings, autoTranslateOutgoing: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                        </div>
                        <label className="block text-xs text-[#D4D9E2]/70">
                          <span className="mb-1.5 block">Formato de entrega</span>
                          <select value={servicesSettings.deliveryFormat} disabled={!servicesSettings.enabled} onChange={(event) => setServicesSettings({ ...servicesSettings, deliveryFormat: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none disabled:opacity-40 focus:border-[#38BDF8]/50">
                            <option value="text">Texto traduzido</option>
                            <option value="audio">Áudio traduzido</option>
                            <option value="both">Texto e áudio</option>
                          </select>
                        </label>
                        <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                          <span>Traduzir áudio</span>
                          <input type="checkbox" checked={servicesSettings.audioTranslationEnabled} disabled={!servicesSettings.enabled} onChange={(event) => setServicesSettings({ ...servicesSettings, audioTranslationEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                          <span>Transcrever áudio</span>
                          <input type="checkbox" checked={servicesSettings.transcriptionEnabled} disabled={!servicesSettings.enabled || !servicesSettings.audioTranslationEnabled} onChange={(event) => setServicesSettings({ ...servicesSettings, transcriptionEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-[#D4D9E2]/70">
                          <span>Manter áudio original</span>
                          <input type="checkbox" checked={servicesSettings.keepOriginalAudio} disabled={!servicesSettings.enabled || !servicesSettings.audioTranslationEnabled} onChange={(event) => setServicesSettings({ ...servicesSettings, keepOriginalAudio: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="mb-3 text-xs font-medium text-[#D4D9E2]/70">Cenários prontos</div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setServicesSettings({ ...servicesSettings, enabled: true, nativeLanguage: 'pt', targetLanguage: 'en', audioTranslationEnabled: true, transcriptionEnabled: true, deliveryFormat: 'text' })} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#D4D9E2] hover:bg-white/[0.06]">Áudio PT → texto EN</button>
                      <button type="button" onClick={() => setServicesSettings({ ...servicesSettings, enabled: true, nativeLanguage: 'pt', targetLanguage: 'en', audioTranslationEnabled: false, deliveryFormat: 'text' })} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#D4D9E2] hover:bg-white/[0.06]">Texto PT → texto EN</button>
                      <button type="button" onClick={() => setServicesSettings({ ...servicesSettings, enabled: true, nativeLanguage: 'en', targetLanguage: 'pt', audioTranslationEnabled: true, transcriptionEnabled: false, deliveryFormat: 'audio' })} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#D4D9E2] hover:bg-white/[0.06]">Texto EN → áudio PT</button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'personalizacao' && (
                <div className="max-w-5xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Personalização visual</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Modelos, botões flutuantes, textos do banner e paleta.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('personalizacao')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-5">
                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Templates</div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'feminino', label: 'Feminino' },
                            { id: 'masculino', label: 'Masculino' },
                            { id: 'ios', label: 'iOS' },
                            { id: 'default', label: 'Restaurar padrão' }
                          ].map((template) => (
                            <button key={template.id} type="button" onClick={() => setPersonalizationSettings({ ...personalizationSettings, template: template.id })} className={`rounded-full border px-3 py-1.5 text-[11px] ${personalizationSettings.template === template.id ? 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-sky-200' : 'border-white/10 bg-white/[0.02] text-[#D4D9E2]'}`}>
                              {template.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Modo do perfil</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'profissional', label: 'Profissional' },
                            { id: 'pessoal', label: 'Pessoal' }
                          ].map((mode) => (
                            <button key={mode.id} type="button" onClick={() => setPersonalizationSettings({ ...personalizationSettings, profileMode: mode.id })} className={`rounded-xl border px-3 py-3 text-left text-xs ${personalizationSettings.profileMode === mode.id ? 'border-[#38BDF8]/45 bg-[#38BDF8]/10 text-sky-100' : 'border-white/10 bg-white/[0.02] text-[#D4D9E2]/70'}`}>
                              <span className="block font-medium">{mode.label}</span>
                              {personalizationSettings.profileMode === mode.id && <span className="mt-1 block text-[10px] text-sky-300">Ativo</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Botões flutuantes</div>
                        <div className="space-y-3 text-sm text-[#D4D9E2]/80">
                          <label className="flex items-center justify-between gap-3">
                            <span>Chat secreto</span>
                            <input type="checkbox" checked={personalizationSettings.secretChatEnabled} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, secretChatEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                          </label>
                          <label className="flex items-center justify-between gap-3">
                            <span>Balão do WhatsApp</span>
                            <input type="checkbox" checked={personalizationSettings.whatsappBubbleEnabled} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, whatsappBubbleEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                          </label>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Texto do banner</div>
                        <div className="space-y-2">
                          {personalizationSettings.bannerTexts.map((text, index) => (
                            <div key={index} className="flex gap-2">
                              <input value={text} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, bannerTexts: personalizationSettings.bannerTexts.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                              <button type="button" onClick={() => setPersonalizationSettings({ ...personalizationSettings, bannerTexts: personalizationSettings.bannerTexts.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-[11px] text-red-300 hover:bg-red-500/15">Remover</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setPersonalizationSettings({ ...personalizationSettings, bannerTexts: [...personalizationSettings.bannerTexts, ''] })} className="mt-2 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-sky-200 hover:bg-white/[0.05]">Adicionar texto</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Cores principais</div>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(personalizationSettings.colors).map(([name, hex]) => (
                            <label key={name} className="flex items-center justify-between gap-3 rounded-[10px] border border-white/[0.08] bg-[#12141A] px-3 py-2">
                              <span className="text-[11px] text-[#D4D9E2]/70">{name}</span>
                              <div className="flex items-center gap-2">
                                <input type="color" value={hex} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, colors: { ...personalizationSettings.colors, [name]: event.target.value } })} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" />
                                <span className="min-w-[52px] text-right text-[10px] font-mono text-white">{hex}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Fonte e tamanho</div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block text-xs text-[#D4D9E2]/70">
                            <span className="mb-1.5 block">Stack</span>
                            <input value={personalizationSettings.fontFamily} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, fontFamily: event.target.value })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                          </label>
                          <label className="block text-xs text-[#D4D9E2]/70">
                            <span className="mb-1.5 block">Tamanho base</span>
                            <input type="number" min={12} max={24} value={personalizationSettings.baseFontSize} onChange={(event) => setPersonalizationSettings({ ...personalizationSettings, baseFontSize: Number(event.target.value) })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'seguranca' && (
                <div className="max-w-4xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Credenciais e proteção</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">E-mail, telefone, senha e chaves de acesso.</p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">E-mail atual</div>
                      <input value={adminEmail || securitySettings.email} readOnly className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white/60 outline-none" />
                      <input type="email" value={securitySettings.newEmail} onChange={(event) => setSecuritySettings({ ...securitySettings, newEmail: event.target.value })} placeholder="Novo e-mail" className="mt-3 w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <input value={securitySettings.currentPassword} onChange={(event) => setSecuritySettings({ ...securitySettings, currentPassword: event.target.value })} placeholder="Senha atual" type="password" className="mt-3 w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <button type="button" onClick={() => void updateAdminEmail()} disabled={profileSettingsSaving} className="mt-3 h-10 rounded-lg border border-white/10 px-3 text-xs text-[#D4D9E2] hover:bg-white/[0.05] disabled:opacity-50">
                        {profileSettingsSaving ? 'Aguarde...' : 'Atualizar e-mail'}
                      </button>
                      <p className="mt-2 text-[10px] text-[#D4D9E2]/50">A troca só é concluída após confirmar o link enviado para o novo endereço.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Telefone atual</div>
                      <input value={securitySettings.phone} readOnly className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white/60 outline-none" />
                      <input value={securitySettings.newPhone} onChange={(event) => setSecuritySettings({ ...securitySettings, newPhone: event.target.value })} placeholder="Novo telefone" className="mt-3 w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <input value={securitySettings.phonePassword} onChange={(event) => setSecuritySettings({ ...securitySettings, phonePassword: event.target.value })} placeholder="Senha atual" type="password" className="mt-3 w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                      <button type="button" onClick={() => void updateAdminPhone()} disabled={profileSettingsSaving} className="mt-3 h-10 rounded-lg border border-white/10 px-3 text-xs text-[#D4D9E2] hover:bg-white/[0.05] disabled:opacity-50">
                        {profileSettingsSaving ? 'Aguarde...' : 'Atualizar telefone'}
                      </button>
                    </div>
                    <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <div className="mb-2 text-xs font-medium text-[#D4D9E2]/70">Alterar senha administrativa</div>
                      <div className="grid gap-3 md:grid-cols-[1fr,1fr,1fr,auto]">
                        <input value={securitySettings.currentPasswordAlt} onChange={(event) => setSecuritySettings({ ...securitySettings, currentPasswordAlt: event.target.value })} placeholder="Senha atual" type="password" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                        <input value={securitySettings.newPassword} onChange={(event) => setSecuritySettings({ ...securitySettings, newPassword: event.target.value })} placeholder="Nova senha" type="password" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                        <input value={securitySettings.confirmPassword} onChange={(event) => setSecuritySettings({ ...securitySettings, confirmPassword: event.target.value })} placeholder="Confirmar senha" type="password" className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50" />
                        <button type="button" onClick={() => void updateAdminPassword()} disabled={profileSettingsSaving} className="h-10 rounded-lg border border-white/10 px-3 text-xs text-[#D4D9E2] hover:bg-white/[0.05] disabled:opacity-50">
                          {profileSettingsSaving ? 'Aguarde...' : 'Atualizar senha'}
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-[#D4D9E2]/50">A nova senha precisa ter pelo menos 12 caracteres. Senhas nunca são gravadas nas configurações do perfil.</p>
                    </div>
                    <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-[#D4D9E2]/70">
                        <span>Chaves de acesso (Passkeys)</span>
                        <button type="button" className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[11px] text-sky-200 hover:bg-sky-500/15">Cadastrar chave</button>
                      </div>
                      <div className="rounded-[10px] border border-white/[0.08] bg-[#12141A] p-3 text-xs text-[#D4D9E2]/70">
                        Seu navegador não oferece suporte para passkeys neste momento.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'privacidade' && (
                <div className="max-w-4xl rounded-xl border border-white/[0.08] bg-[#12141A] p-6">
                  <div className="mb-6 flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <h2 className="text-base font-serif text-white">Privacidade</h2>
                      <p className="mt-1 text-xs text-[#D4D9E2]/60">Controle de visibilidade, mensagens e avaliação pública.</p>
                    </div>
                    <button type="button" onClick={() => void saveProfileSettings('privacidade')} disabled={profileSettingsSaving || profileSettingsLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50">
                      {profileSettingsSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {privacySettings.sections.map((section) => (
                      <div key={section.key} className="rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <span className="text-[#38BDF8]">●</span>
                            <span>{section.label}</span>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-[#D4D9E2]/60">{section.value}</span>
                        </div>
                        <select value={section.value} onChange={(event) => setPrivacySettings({ ...privacySettings, sections: privacySettings.sections.map((item) => item.key === section.key ? { ...item, value: event.target.value } : item) })} className="w-full rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          <option value="Público">Público</option>
                          <option value="Seguidores">Seguidores</option>
                          <option value="Assinantes">Assinantes</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="mb-3 text-xs font-medium text-[#D4D9E2]/70">Mensagens e automação</div>
                    <div className="space-y-3 text-sm text-[#D4D9E2]/80">
                      <label className="flex items-center justify-between gap-3">
                        <span>Visibilidade de mensagens</span>
                        <select value={privacySettings.messagesVisibility} onChange={(event) => setPrivacySettings({ ...privacySettings, messagesVisibility: event.target.value })} className="rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          <option value="Público">Público</option>
                          <option value="Seguidores">Seguidores</option>
                          <option value="Assinantes">Assinantes</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Resposta automática</span>
                        <select value={privacySettings.autoReplyMode} onChange={(event) => setPrivacySettings({ ...privacySettings, autoReplyMode: event.target.value })} className="rounded-[10px] border border-white/[0.10] bg-[#12141A] px-3 py-2 text-sm text-white outline-none focus:border-[#38BDF8]/50">
                          <option value="Manual">Manual</option>
                          <option value="Humanizada">Humanizada</option>
                          <option value="Robótica">Robótica</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Ativar resposta em voz por padrão</span>
                        <input type="checkbox" checked={privacySettings.voiceReplyEnabled} onChange={(event) => setPrivacySettings({ ...privacySettings, voiceReplyEnabled: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#090A0C] p-4">
                    <div className="mb-3 text-xs font-medium text-[#D4D9E2]/70">Avaliações e reputação</div>
                    <div className="space-y-3 text-sm text-[#D4D9E2]/80">
                      <label className="flex items-center justify-between gap-3">
                        <span>Exibir avaliações no perfil</span>
                        <input type="checkbox" checked={privacySettings.reviewsVisible} onChange={(event) => setPrivacySettings({ ...privacySettings, reviewsVisible: event.target.checked, moderateReviews: event.target.checked && privacySettings.moderateReviews, sendReviewToSecretChat: event.target.checked && privacySettings.sendReviewToSecretChat })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8]" />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Moderar antes de publicar</span>
                        <input type="checkbox" checked={privacySettings.moderateReviews} disabled={!privacySettings.reviewsVisible} onChange={(event) => setPrivacySettings({ ...privacySettings, moderateReviews: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>Enviar avaliação para o chat secreto</span>
                        <input type="checkbox" checked={privacySettings.sendReviewToSecretChat} disabled={!privacySettings.reviewsVisible} onChange={(event) => setPrivacySettings({ ...privacySettings, sendReviewToSecretChat: event.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38BDF8] disabled:opacity-40" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
