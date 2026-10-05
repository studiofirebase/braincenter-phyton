import { randomBytes } from 'node:crypto';
import nodemailer from 'nodemailer';
import {
  createD1AdminEmailConfirmation,
  createD1AdminPasswordReset,
  getCerebroAdminSettings,
  getIntegrationAccessToken,
  initializeCerebroActionSchema,
  listAdminChatHistory,
  listSiteReviews,
  queryCerebroD1,
  registerD1Admin,
  updateCerebroAdminSettings,
  updateSiteReviewStatus
} from './integrationAuth';
import type { IntegrationProvider } from './integrationAuth';

const SERVICE_IDS = [
  'createAdminAccount',
  'manageContentMenu',
  'manageFeedPosts',
  'manageAdminSettings',
  'getUserInfo',
  'checkSubscription',
  'giftSubscriptionDays',
  'sendSecretChatTextMessage',
  'deleteSubscriber',
  'cleanupExpiredSubscribers',
  'purgeExpiredSubscribers',
  'resendAccountConfirmationEmail',
  'resendMfaOtp',
  'sendMessage',
  'broadcastMessage',
  'scheduleTask',
  'schedulePublication',
  'sendEmail',
  'createPixPayment',
  'createPayPalPayment',
  'getExclusiveContent',
  'getReviews',
  'getPlatformStats',
  'getSystemStatus',
  'sendPasswordReset',
  'verifyAdminIdentityMedia'
] as const;

export type CerebroServiceId = (typeof SERVICE_IDS)[number];

export class CerebroActionError extends Error {
  constructor(message: string, readonly statusCode = 400) {
    super(message);
    this.name = 'CerebroActionError';
  }
}

type ActionArgs = Record<string, unknown>;
type AdminRole = 'admin' | 'superadmin';

function requireString(args: ActionArgs, field: string, maxLength = 500) {
  const value = args[field];
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new CerebroActionError(`O campo "${field}" é obrigatório e deve ter até ${maxLength} caracteres.`);
  }
  return value.trim();
}

function requireEmail(args: ActionArgs, field = 'email') {
  const value = requireString(args, field, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new CerebroActionError(`O campo "${field}" deve conter um e-mail válido.`);
  }
  return value;
}

function requireConfirmation(confirmed: boolean) {
  if (!confirmed) {
    throw new CerebroActionError('Esta ação altera dados ou executa uma operação externa. Solicite confirmação explícita e repita com confirm=true.', 409);
  }
}

function requireObject(value: unknown, field: string): ActionArgs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CerebroActionError(`O campo "${field}" deve ser um objeto.`);
  }
  return value as ActionArgs;
}

function parseJsonPayload(payload: string) {
  try {
    const value: unknown = JSON.parse(payload);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

async function getAdminPayload(adminUid: string) {
  const rows = await queryCerebroD1<{ id: string; payload: string }>(
    `SELECT id, payload FROM profile_settings
     WHERE target_type = 'admin' AND target_id = ? AND json_valid(payload)
     ORDER BY updated_at DESC LIMIT 1`,
    [adminUid]
  );
  return rows[0] ? { ...rows[0], payload: parseJsonPayload(rows[0].payload) } : null;
}

async function saveAdminPayload(adminUid: string, payload: Record<string, unknown>) {
  const current = await getAdminPayload(adminUid);
  const serialized = JSON.stringify(payload);
  if (current) {
    await queryCerebroD1(
      `UPDATE profile_settings SET payload = ?, updated_at = CAST(unixepoch() AS TEXT)
       WHERE id = ? AND target_type = 'admin' AND target_id = ?`,
      [serialized, current.id, adminUid]
    );
  } else {
    await queryCerebroD1(
      `INSERT INTO profile_settings (id, target_type, target_id, payload, updated_at)
       VALUES (?, 'admin', ?, ?, CAST(unixepoch() AS TEXT))`,
      [`profileSettings:admin:${adminUid}`, adminUid, serialized]
    );
  }
}

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim() || user;
  if (!host || !user || !password || !from) {
    throw new CerebroActionError('O envio de e-mails não está configurado (SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM).', 503);
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false',
    auth: { user, pass: password },
    tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTH !== 'false' }
  });
  await transporter.sendMail({ from, to, subject, text, ...(html ? { html } : {}) });
}

async function sendSocialText(
  adminUid: string,
  channel: string,
  recipient: string,
  text: string
) {
  if (!['whatsapp', 'facebook', 'instagram'].includes(channel)) {
    throw new CerebroActionError('Canal de envio não suportado. Canais executáveis: WhatsApp, Facebook Messenger e Instagram Messaging.', 422);
  }
  const provider = channel as IntegrationProvider;
  const accessToken = await getIntegrationAccessToken(adminUid, provider);
  if (!accessToken) throw new CerebroActionError(`A integração ${channel} não está conectada ou não possui token válido.`, 503);

  let endpoint: string;
  let payload: Record<string, unknown>;
  if (channel === 'whatsapp') {
    const accountPhoneId = process.env.WHATSAPP_PHONE_ID?.trim();
    if (!accountPhoneId) throw new CerebroActionError('WHATSAPP_PHONE_ID não está configurado.', 503);
    endpoint = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v23.0'}/${encodeURIComponent(accountPhoneId)}/messages`;
    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { body: text }
    };
  } else {
    const accountId = channel === 'facebook'
      ? process.env.FACEBOOK_PAGE_ID?.trim()
      : process.env.INSTAGRAM_ACCOUNT_NUMBER?.trim();
    if (!accountId) throw new CerebroActionError(`${channel === 'facebook' ? 'FACEBOOK_PAGE_ID' : 'INSTAGRAM_ACCOUNT_NUMBER'} não está configurado.`, 503);
    endpoint = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v23.0'}/${encodeURIComponent(accountId)}/messages`;
    payload = { recipient: { id: recipient }, message: { text } };
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000)
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || data.error) {
    throw new CerebroActionError(`O provedor ${channel} recusou o envio (HTTP ${response.status}).`, 502);
  }
  return { channel, recipient, providerResult: data };
}

async function getPaypalAccessToken(adminUid: string) {
  const connectedToken = await getIntegrationAccessToken(adminUid, 'paypal');
  if (connectedToken) return connectedToken;
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || process.env.PAYPAL_SECRET_KEY?.trim();
  const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
  if (!clientId || !clientSecret || !['sandbox', 'test', 'live', 'production'].includes(environment || '')) {
    throw new CerebroActionError('PayPal não está conectado nem configurado para pagamentos.', 503);
  }
  const base = environment === 'live' || environment === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
    signal: AbortSignal.timeout(20_000)
  });
  const data = await response.json() as { access_token?: string };
  if (!response.ok || !data.access_token) throw new CerebroActionError('Não foi possível autenticar no PayPal.', 502);
  return data.access_token;
}

function requireAmount(args: ActionArgs) {
  const amount = Number(args.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    throw new CerebroActionError('Informe um valor maior que zero e até 1.000.000.');
  }
  return amount;
}

function requireIdempotencyKey(args: ActionArgs) {
  const key = requireString(args, 'idempotencyKey', 64);
  if (!/^[a-zA-Z0-9._:-]{16,64}$/.test(key)) {
    throw new CerebroActionError('idempotencyKey deve ter de 16 a 64 caracteres seguros.');
  }
  return key;
}

export async function executeCerebroAction(input: {
  adminUid: string;
  role: AdminRole;
  serviceId: string;
  args: ActionArgs;
  confirmed: boolean;
}) {
  const { adminUid, role, serviceId, args, confirmed } = input;
  if (!(SERVICE_IDS as readonly string[]).includes(serviceId)) {
    throw new CerebroActionError('Serviço Cérebro Central desconhecido.', 404);
  }
  await initializeCerebroActionSchema();
  const id = serviceId as CerebroServiceId;

  switch (id) {
    case 'createAdminAccount': {
      if (role !== 'superadmin') throw new CerebroActionError('Somente superadmin pode criar contas administrativas.', 403);
      requireConfirmation(confirmed);
      const name = requireString(args, 'name', 100);
      const email = requireEmail(args);
      const username = requireString(args, 'username', 30);
      const password = requireString(args, 'password', 128);
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
        throw new CerebroActionError('username deve conter 3 a 30 caracteres alfanuméricos, hífen ou sublinhado.');
      }
      if (password.length < 12) throw new CerebroActionError('A senha deve ter pelo menos 12 caracteres.');
      try {
        const account = await registerD1Admin({ name, email, username, password });
        return { account };
      } catch (error) {
        if (error instanceof Error && error.message === 'ADMIN_ACCOUNT_EXISTS') {
          throw new CerebroActionError('Já existe uma conta com esse e-mail ou usuário.', 409);
        }
        throw error;
      }
    }

    case 'manageContentMenu': {
      const action = requireString(args, 'action', 40);
      const record = await getAdminPayload(adminUid);
      const menu = record?.payload.cerebroContentMenu && typeof record.payload.cerebroContentMenu === 'object'
        ? record.payload.cerebroContentMenu as { themes?: unknown[]; items?: unknown[] }
        : { themes: [], items: [] };
      const themes = Array.isArray(menu.themes) ? menu.themes as Record<string, unknown>[] : [];
      const items = Array.isArray(menu.items) ? menu.items as Record<string, unknown>[] : [];
      if (action === 'list') return { themes, items };
      requireConfirmation(confirmed);
      const type = action.endsWith('_theme') ? 'theme' : 'item';
      const collection = type === 'theme' ? themes : items;
      const op = action.split('_')[0];
      if (op === 'create') {
        const title = requireString(args, 'title', 120);
        if (type === 'item') {
          const themeId = requireString(args, 'themeId', 100);
          if (!themes.some((theme) => theme.id === themeId)) {
            throw new CerebroActionError('Tema do item não encontrado.', 404);
          }
        }
        const created = {
          id: randomBytes(12).toString('hex'),
          title,
          ...(type === 'item' ? { themeId: String(args.themeId) } : {}),
          ...(args.published === true ? { published: true } : {})
        };
        collection.push(created);
        await saveAdminPayload(adminUid, { ...(record?.payload || {}), cerebroContentMenu: { themes, items } });
        return { created };
      }
      const targetId = requireString(args, 'id', 100);
      const target = collection.findIndex((entry) => entry.id === targetId);
      if (target < 0) throw new CerebroActionError(`${type === 'theme' ? 'Tema' : 'Item'} não encontrado.`, 404);
      if (op === 'delete') {
        collection.splice(target, 1);
        if (type === 'theme') {
          for (let index = items.length - 1; index >= 0; index -= 1) {
            if (items[index].themeId === targetId) items.splice(index, 1);
          }
        }

      } else if (op === 'update') {
        const patch = requireObject(args.patch, 'patch');
        const allowed = type === 'theme' ? ['title', 'description', 'order'] : ['title', 'description', 'themeId', 'published', 'order'];
        if (Object.keys(patch).some((key) => !allowed.includes(key))) throw new CerebroActionError('O patch contém campos não permitidos.');
        Object.assign(collection[target], patch);
      } else {
        throw new CerebroActionError('Ação de menu inválida.');
      }
      await saveAdminPayload(adminUid, { ...(record?.payload || {}), cerebroContentMenu: { themes, items } });
      return { updated: true, themes, items };
    }
    case 'manageFeedPosts': {
      const action = requireString(args, 'action', 30);
      if (action === 'list') {
        const rows = await queryCerebroD1<{ document_id: string; payload: string; created_at: string }>(
          `SELECT document_id, payload, created_at FROM media_collection
           WHERE collection = 'posts' AND admin_uid = ? AND json_valid(payload)
           ORDER BY created_at DESC LIMIT 100`,
          [adminUid]
        );
        return { posts: rows.map((row) => ({ id: row.document_id, ...parseJsonPayload(row.payload), created_at: row.created_at })) };
      }
      requireConfirmation(confirmed);
      if (action === 'create') {
        const caption = requireString(args, 'caption', 5000);
        const mediaUrl = args.mediaUrl === undefined ? '' : requireString(args, 'mediaUrl', 2048);
        if (mediaUrl) {
          const url = new URL(mediaUrl);
          if (url.protocol !== 'https:') throw new CerebroActionError('A mídia precisa usar HTTPS.');
        }
        const postId = randomBytes(16).toString('hex');
        const now = new Date().toISOString();
        const payload = JSON.stringify({
          id: postId,
          title: typeof args.title === 'string' ? args.title.slice(0, 200) : '',
          text: caption,
          mediaUrl,
          visibility: args.visibility === 'private' ? 'private' : 'public',
          published: false,
          createdAt: now
        });
        await queryCerebroD1(
          `INSERT INTO media_collection
           (id, collection, document_id, admin_uid, payload, storage_type, storage_path, media_url, created_at, updated_at)
           VALUES (?, 'posts', ?, ?, ?, 'external', NULL, ?, ?, ?)`,
          [postId, postId, adminUid, payload, mediaUrl, now, now]
        );
        return { created: true, id: postId, published: false };
      }
      const postId = requireString(args, 'id', 100);
      if (action === 'delete') {
        await queryCerebroD1(
          `DELETE FROM media_collection WHERE collection = 'posts' AND document_id = ? AND admin_uid = ?`,
          [postId, adminUid]
        );
        return { deleted: true, id: postId };
      }
      if (!['publish', 'unpublish', 'update'].includes(action)) throw new CerebroActionError('Ação de feed inválida.');
      const patch = action === 'update' ? requireObject(args.patch, 'patch') : {};
      const allowed = ['title', 'text', 'mediaUrl', 'visibility'];
      if (Object.keys(patch).some((key) => !allowed.includes(key))) throw new CerebroActionError('O patch de publicação contém campos não permitidos.');
      const rows = await queryCerebroD1<{ payload: string }>(
        `SELECT payload FROM media_collection WHERE collection = 'posts' AND document_id = ? AND admin_uid = ? AND json_valid(payload)`,
        [postId, adminUid]
      );
      if (!rows[0]) throw new CerebroActionError('Publicação não encontrada.', 404);
      const payload = parseJsonPayload(rows[0].payload);
      if (action === 'publish') {
        payload.published = true;
        payload.visibility = 'public';
      } else if (action === 'unpublish') {
        payload.published = false;
      } else {
        Object.assign(payload, patch);
      }
      const mediaUrl = typeof payload.mediaUrl === 'string' ? payload.mediaUrl : '';
      if (mediaUrl && new URL(mediaUrl).protocol !== 'https:') throw new CerebroActionError('A mídia precisa usar HTTPS.');
      await queryCerebroD1(
        `UPDATE media_collection SET payload = ?, media_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE collection = 'posts' AND document_id = ? AND admin_uid = ?`,
        [JSON.stringify(payload), mediaUrl, postId, adminUid]
      );
      return { updated: true, id: postId, published: payload.published === true };
    }
    case 'manageAdminSettings': {
      const action = typeof args.action === 'string' ? args.action : 'get';
      if (action === 'get') {
        const settings = await getCerebroAdminSettings(adminUid);
        const profile = await getAdminPayload(adminUid);
        return { conversation: settings.conversation, profile: profile?.payload || {} };
      }
      if (action !== 'update') throw new CerebroActionError('Use action=get ou action=update.');
      requireConfirmation(confirmed);
      const profilePatch = args.profilePatch === undefined ? {} : requireObject(args.profilePatch, 'profilePatch');
      const allowedProfileKeys = ['name', 'about_text', 'marquee_texts', 'cover_photo_url', 'profile_picture_url'];
      if (Object.keys(profilePatch).some((key) => !allowedProfileKeys.includes(key))) {
        throw new CerebroActionError('O profilePatch contém campos não permitidos.');
      }
      const conversationPatch = args.conversationPatch === undefined
        ? undefined
        : requireObject(args.conversationPatch, 'conversationPatch');
      for (const [key, value] of Object.entries(profilePatch)) {
        if (key === 'name' && (typeof value !== 'string' || value.trim().length < 1 || value.length > 120)) {
          throw new CerebroActionError('name deve conter de 1 a 120 caracteres.');
        }
        if (key === 'about_text' && (typeof value !== 'string' || value.length > 5000)) {
          throw new CerebroActionError('about_text deve ser um texto de até 5000 caracteres.');
        }
        if (key === 'marquee_texts' && (!Array.isArray(value) || value.length > 12 ||
          value.some((item) => typeof item !== 'string' || item.length > 180))) {
          throw new CerebroActionError('marquee_texts deve ser uma lista de até 12 textos curtos.');
        }
        if (key === 'cover_photo_url' || key === 'profile_picture_url') {
          if (typeof value !== 'string' || value.length > 2048) throw new CerebroActionError(`${key} deve ser uma URL HTTPS.`);
          if (value) {
            let parsed: URL;
            try {
              parsed = new URL(value);
            } catch {
              throw new CerebroActionError(`${key} deve ser uma URL HTTPS válida.`);
            }
            if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
              throw new CerebroActionError(`${key} deve ser uma URL HTTPS válida.`);
            }
          }
        }
      }
      if (conversationPatch) {
        const allowed = ['autoReplyEnabled', 'defaultVoiceEnabled', 'responseStyle'];
        if (Object.keys(conversationPatch).some((key) => !allowed.includes(key))) {
          throw new CerebroActionError('O conversationPatch contém campos não permitidos.');
        }
        await updateCerebroAdminSettings(adminUid, { conversation: conversationPatch as never });
      }
      if (Object.keys(profilePatch).length) {
        const record = await getAdminPayload(adminUid);
        await saveAdminPayload(adminUid, { ...(record?.payload || {}), ...profilePatch });
      }
      return { updated: true, settings: await getCerebroAdminSettings(adminUid) };
    }
    case 'getUserInfo': {
      const id = typeof args.userId === 'string' ? args.userId.trim() : '';
      const email = typeof args.email === 'string' ? args.email.trim().toLowerCase() : '';
      if (!id && !email) throw new CerebroActionError('Informe userId ou email.');
      const rows = await queryCerebroD1<{
        id: string; email: string; display_name: string | null; phone: string | null;
        role: string | null; email_verified: number | null; created_at: number | string | null;
      }>(
        `SELECT id, email, display_name, phone, role, email_verified, created_at
         FROM users WHERE ${id ? 'id = ?' : 'LOWER(email) = ?'} LIMIT 1`,
        [id || email]
      );
      if (!rows[0]) throw new CerebroActionError('Usuário não encontrado.', 404);
      return { user: rows[0] };
    }
    case 'checkSubscription': {
      const id = typeof args.userId === 'string' ? args.userId.trim() : '';
      const email = typeof args.email === 'string' ? args.email.trim().toLowerCase() : '';
      if (!id && !email) throw new CerebroActionError('Informe userId ou email.');
      const rows = await queryCerebroD1(
        `SELECT id, user_uid, user_email, status, expires_at, gifted_days
         FROM cerebro_subscriptions WHERE admin_uid = ? AND ${id ? 'user_uid = ?' : 'LOWER(user_email) = ?'}
         ORDER BY expires_at DESC LIMIT 20`,
        [adminUid, id || email]
      );
      return { subscriptions: rows, active: rows.some((entry) => entry.status === 'active' && Date.parse(String(entry.expires_at)) > Date.now()) };
    }
    case 'giftSubscriptionDays': {
      requireConfirmation(confirmed);
      const email = requireEmail(args);
      const days = Number(args.days);
      if (!Number.isInteger(days) || days < 1 || days > 365) throw new CerebroActionError('days deve ser inteiro entre 1 e 365.');
      const users = await queryCerebroD1<{ id: string; email: string }>(
        'SELECT id, email FROM users WHERE lower(email) = ? LIMIT 1',
        [email]
      );
      if (!users[0]) throw new CerebroActionError('Não existe usuário com esse e-mail.', 404);
      const existing = await queryCerebroD1<{ id: string; expires_at: string; gifted_days: number }>(
        `SELECT id, expires_at, gifted_days FROM cerebro_subscriptions
         WHERE admin_uid = ? AND user_uid = ? AND status = 'active'
         ORDER BY expires_at DESC LIMIT 1`,
        [adminUid, users[0].id]
      );
      const now = new Date();
      const previousExpiry = existing[0] ? Date.parse(existing[0].expires_at) : NaN;
      const start = Number.isFinite(previousExpiry) && previousExpiry > now.getTime() ? previousExpiry : now.getTime();
      const expiresAt = new Date(start + days * 86_400_000).toISOString();
      const timestamp = now.toISOString();
      if (existing[0]) {
        await queryCerebroD1(
          `UPDATE cerebro_subscriptions SET expires_at = ?, gifted_days = gifted_days + ?, updated_at = ?
           WHERE id = ? AND admin_uid = ?`,
          [expiresAt, String(days), timestamp, existing[0].id, adminUid]
        );
      } else {
        await queryCerebroD1(
          `INSERT INTO cerebro_subscriptions
           (id, admin_uid, user_uid, user_email, status, expires_at, gifted_days, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
          [randomBytes(16).toString('hex'), adminUid, users[0].id, email, expiresAt, String(days), timestamp, timestamp]
        );
      }
      return { giftedDays: days, expiresAt };
    }
    case 'sendSecretChatTextMessage': {
      requireConfirmation(confirmed);
      const chatId = requireString(args, 'chatId', 100);
      const text = requireString(args, 'text', 4000);
      const chat = await queryCerebroD1<{ id: string; user_uid: string; user_email: string; user_display_name: string }>(
        'SELECT id, user_uid, user_email, user_display_name FROM secret_chats WHERE id = ? AND admin_uid = ? LIMIT 1',
        [chatId, adminUid]
      );
      if (!chat[0]) throw new CerebroActionError('Conversa secreta não encontrada para este admin.', 404);
      const messageId = randomBytes(16).toString('hex');
      const timestamp = new Date().toISOString();
      await queryCerebroD1(
        `INSERT INTO secret_chat_messages
         (id, chat_id, sender_id, recipient_id, text, timestamp, read, admin_uid, user_uid, user_email, user_display_name, metadata)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, '{}')`,
        [messageId, chatId, adminUid, chat[0].user_uid, text, timestamp, adminUid, chat[0].user_uid, chat[0].user_email, chat[0].user_display_name]
      );
      await queryCerebroD1(
        `UPDATE secret_chats SET last_activity = ?, last_message = ?, user_unread_count = user_unread_count + 1
         WHERE id = ? AND admin_uid = ?`,
        [timestamp, text.slice(0, 500), chatId, adminUid]
      );
      return { sent: true, messageId, chatId };
    }
    case 'deleteSubscriber': {
      requireConfirmation(confirmed);
      const subscriptionId = requireString(args, 'subscriptionId', 100);
      const existing = await queryCerebroD1<{ id: string }>(
        `SELECT id FROM cerebro_subscriptions WHERE id = ? AND admin_uid = ? AND status = 'active' LIMIT 1`,
        [subscriptionId, adminUid]
      );
      if (!existing[0]) throw new CerebroActionError('Assinatura ativa não encontrada.', 404);
      await queryCerebroD1(
        `UPDATE cerebro_subscriptions SET status = 'cancelled', updated_at = ?
         WHERE id = ? AND admin_uid = ?`,
        [new Date().toISOString(), subscriptionId, adminUid]
      );
      return { cancelled: true, subscriptionId };
    }
    case 'cleanupExpiredSubscribers': {
      requireConfirmation(confirmed);
      const now = new Date().toISOString();
      const expired = await queryCerebroD1<{ id: string }>(
        `SELECT id FROM cerebro_subscriptions
         WHERE admin_uid = ? AND status = 'active' AND expires_at <= ?`,
        [adminUid, now]
      );
      await queryCerebroD1(
        `UPDATE cerebro_subscriptions SET status = 'expired', updated_at = ?
         WHERE admin_uid = ? AND status = 'active' AND expires_at <= ?`,
        [now, adminUid, now]
      );
      return { cleaned: true, affected: expired.length };
    }
    case 'purgeExpiredSubscribers': {
      requireConfirmation(confirmed);
      const days = args.olderThanDays === undefined ? 90 : Number(args.olderThanDays);
      if (!Number.isInteger(days) || days < 30 || days > 3650) throw new CerebroActionError('olderThanDays deve estar entre 30 e 3650.');
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const expired = await queryCerebroD1<{ id: string }>(
        `SELECT id FROM cerebro_subscriptions WHERE admin_uid = ? AND status = 'expired' AND updated_at <= ?`,
        [adminUid, cutoff]
      );
      await queryCerebroD1(
        `DELETE FROM cerebro_subscriptions WHERE admin_uid = ? AND status = 'expired' AND updated_at <= ?`,
        [adminUid, cutoff]
      );
      return { purged: true, affected: expired.length, cutoff };
    }
    case 'resendAccountConfirmationEmail': {
      requireConfirmation(confirmed);
      const email = requireEmail(args);
      const confirmation = await createD1AdminEmailConfirmation(email);
      if (!confirmation) return { sent: false, alreadyVerifiedOrNotFound: true };
      const baseUrl = process.env.ADMIN_EMAIL_CONFIRMATION_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
      if (!baseUrl) throw new CerebroActionError('ADMIN_EMAIL_CONFIRMATION_URL não está configurado.', 503);
      const url = new URL(baseUrl);
      url.searchParams.set('confirmAdminEmail', confirmation.token);
      await sendEmail(
        confirmation.email,
        'Confirme seu e-mail administrativo',
        `Confirme seu endereço de e-mail neste link (válido por 24 horas):\n\n${url.toString()}`
      );
      return { sent: true, expiresInSeconds: 86_400 };
    }
    case 'resendMfaOtp': {
      requireConfirmation(confirmed);
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
        throw new CerebroActionError('Reenvio MFA indisponível: configure Twilio Verify (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) e conecte o desafio MFA ao login.', 503);
      }
      const rows = await queryCerebroD1<{ phone: string | null }>(
        'SELECT phone FROM users WHERE id = ? LIMIT 1',
        [adminUid]
      );
      if (!rows[0]?.phone) throw new CerebroActionError('Telefone do admin não cadastrado.', 404);
      const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(process.env.TWILIO_VERIFY_SERVICE_SID)}/Verifications`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ To: rows[0].phone, Channel: 'sms' }),
        signal: AbortSignal.timeout(20_000)
      });
      if (!response.ok) throw new CerebroActionError(`Twilio Verify recusou o envio (HTTP ${response.status}).`, 502);
      return { sent: true, channel: 'sms', destination: `${rows[0].phone.slice(0, 3)}••••${rows[0].phone.slice(-2)}` };
    }
    case 'sendMessage': {
      requireConfirmation(confirmed);
      const channel = requireString(args, 'channel', 30).toLowerCase();
      const recipient = requireString(args, 'recipient', 200);
      const text = requireString(args, 'text', 4096);
      return await sendSocialText(adminUid, channel, recipient, text);
    }
    case 'broadcastMessage': {
      requireConfirmation(confirmed);
      const channel = requireString(args, 'channel', 30).toLowerCase();
      const text = requireString(args, 'text', 4096);
      if (!Array.isArray(args.recipients) || args.recipients.length < 1 || args.recipients.length > 50 ||
        args.recipients.some((recipient) => typeof recipient !== 'string' || !recipient.trim() || recipient.length > 200)) {
        throw new CerebroActionError('Informe uma lista explícita de 1 a 50 destinatários.');
      }
      const results: { recipient: string; sent: boolean; error?: string }[] = [];
      for (const recipientValue of args.recipients) {
        const recipient = String(recipientValue).trim();
        try {
          await sendSocialText(adminUid, channel, recipient, text);
          results.push({ recipient, sent: true });
        } catch (error) {
          results.push({ recipient, sent: false, error: error instanceof Error ? error.message : 'Falha de envio.' });
        }
      }
      return { results, sent: results.filter((result) => result.sent).length, failed: results.filter((result) => !result.sent).length };
    }
    case 'scheduleTask':
    case 'schedulePublication': {
      requireConfirmation(confirmed);
      const runAt = requireString(args, 'runAt', 80);
      const runTime = Date.parse(runAt);
      if (!Number.isFinite(runTime) || runTime <= Date.now()) throw new CerebroActionError('runAt deve ser uma data futura em formato ISO.');
      let payload: ActionArgs;
      if (id === 'scheduleTask') {
        const taskType = requireString(args, 'taskType', 30);
        if (taskType !== 'sendMessage') throw new CerebroActionError('Tarefas agendadas suportam taskType=sendMessage.');
        payload = {
          taskType,
          channel: requireString(args, 'channel', 30),
          recipient: requireString(args, 'recipient', 200),
          text: requireString(args, 'text', 4096)
        };
      } else {
        payload = {
          postId: requireString(args, 'postId', 100)
        };
        const posts = await queryCerebroD1<{ document_id: string }>(
          `SELECT document_id FROM media_collection WHERE collection = 'posts' AND document_id = ? AND admin_uid = ?`,
          [String(payload.postId), adminUid]
        );
        if (!posts[0]) throw new CerebroActionError('Publicação não encontrada para agendamento.', 404);
      }
      const taskId = randomBytes(16).toString('hex');
      const now = new Date().toISOString();
      await queryCerebroD1(
        `INSERT INTO cerebro_scheduled_actions
         (id, admin_uid, service_id, payload, run_at, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [taskId, adminUid, id, JSON.stringify(payload), new Date(runTime).toISOString(), now, now]
      );
      return { scheduled: true, taskId, runAt: new Date(runTime).toISOString(), status: 'pending' };
    }
    case 'sendEmail': {
      requireConfirmation(confirmed);
      const to = requireEmail(args, 'recipient');
      const subject = requireString(args, 'subject', 200);
      const text = requireString(args, 'text', 20_000);
      await sendEmail(to, subject, text);
      return { sent: true, recipient: to, subject };
    }
    case 'createPixPayment': {
      requireConfirmation(confirmed);
      const email = requireEmail(args, 'payerEmail');
      const amount = requireAmount(args);
      const idempotencyKey = requireIdempotencyKey(args);
      const currency = typeof args.currency === 'string' ? args.currency.toUpperCase() : 'BRL';
      if (currency !== 'BRL') throw new CerebroActionError('PIX só pode ser cobrado em BRL.');
      const token = await getIntegrationAccessToken(adminUid, 'mercado-pago');
      if (!token) throw new CerebroActionError('Conecte a integração Mercado Pago antes de criar cobranças PIX.', 503);
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          transaction_amount: Number(amount.toFixed(2)),
          description: typeof args.description === 'string' ? args.description.slice(0, 250) : 'Assinatura',
          payment_method_id: 'pix',
          payer: { email }
        }),
        signal: AbortSignal.timeout(20_000)
      });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) throw new CerebroActionError(`Mercado Pago recusou a cobrança (HTTP ${response.status}).`, 502);
      return { paymentId: data.id, status: data.status, statusDetail: data.status_detail, payment: data.point_of_interaction };
    }
    case 'createPayPalPayment': {
      requireConfirmation(confirmed);
      const amount = requireAmount(args);
      const idempotencyKey = requireIdempotencyKey(args);
      const currency = typeof args.currency === 'string' ? args.currency.toUpperCase() : 'BRL';
      if (!/^[A-Z]{3}$/.test(currency)) throw new CerebroActionError('Código de moeda inválido.');
      const token = await getPaypalAccessToken(adminUid);
      const environment = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase();
      const base = environment === 'live' || environment === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
      const response = await fetch(`${base}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': idempotencyKey
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: { currency_code: currency, value: amount.toFixed(2) },
            description: typeof args.description === 'string' ? args.description.slice(0, 127) : 'Assinatura'
          }],
          application_context: {
            return_url: process.env.PAYPAL_RETURN_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            cancel_url: process.env.PAYPAL_CANCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          }
        }),
        signal: AbortSignal.timeout(20_000)
      });
      const data = await response.json() as { id?: string; status?: string; links?: { rel?: string; href?: string }[] };
      if (!response.ok || !data.id) throw new CerebroActionError(`PayPal recusou o pedido (HTTP ${response.status}).`, 502);
      return { orderId: data.id, status: data.status, approvalUrl: data.links?.find((link) => link.rel === 'approve')?.href };
    }
    case 'getExclusiveContent': {
      const rows = await queryCerebroD1<{ document_id: string; payload: string; media_url: string | null; created_at: string }>(
        `SELECT document_id, payload, media_url, created_at FROM media_collection
         WHERE admin_uid = ? AND collection IN ('exclusive-content', 'exclusive', 'posts')
           AND json_valid(payload)
           AND (lower(COALESCE(json_extract(payload, '$.visibility'), '')) IN ('exclusive', 'private')
             OR json_extract(payload, '$.exclusive') = 1)
         ORDER BY created_at DESC LIMIT 100`,
        [adminUid]
      );
      return { items: rows.map((row) => ({ id: row.document_id, ...parseJsonPayload(row.payload), media_url: row.media_url, created_at: row.created_at })) };
    }
    case 'getReviews': {
      const status = args.status;
      if (status !== undefined && !['pending', 'approved', 'rejected'].includes(String(status))) {
        throw new CerebroActionError('status deve ser pending, approved ou rejected.');
      }
      return { reviews: await listSiteReviews(status as 'pending' | 'approved' | 'rejected' | undefined, adminUid) };
    }
    case 'getPlatformStats': {
      const [users, posts, reviews, subscriptions, messages] = await Promise.all([
        queryCerebroD1<{ total: number }>('SELECT COUNT(*) AS total FROM users'),
        queryCerebroD1<{ total: number }>(`SELECT COUNT(*) AS total FROM media_collection WHERE collection = 'posts' AND admin_uid = ?`, [adminUid]),
        queryCerebroD1<{ total: number }>('SELECT COUNT(*) AS total FROM site_reviews'),
        queryCerebroD1<{ total: number }>('SELECT COUNT(*) AS total FROM cerebro_subscriptions WHERE admin_uid = ?', [adminUid]),
        queryCerebroD1<{ total: number }>('SELECT COUNT(*) AS total FROM channel_messages WHERE admin_uid = ?', [adminUid])
      ]);
      return {
        users: Number(users[0]?.total || 0),
        posts: Number(posts[0]?.total || 0),
        reviews: Number(reviews[0]?.total || 0),
        subscriptions: Number(subscriptions[0]?.total || 0),
        importedMessages: Number(messages[0]?.total || 0)
      };
    }
    case 'getSystemStatus': {
      const [settings, oauth, queue] = await Promise.all([
        getCerebroAdminSettings(adminUid),
        queryCerebroD1<{ total: number }>('SELECT COUNT(*) AS total FROM oauth_integrations WHERE user_id = ?', [adminUid]),
        queryCerebroD1<{ pending: number }>(
          `SELECT COUNT(*) AS pending FROM cerebro_scheduled_actions WHERE admin_uid = ? AND status = 'pending'`,
          [adminUid]
        )
      ]);
      return {
        status: 'ok',
        runtime: 'node_express',
        database: 'D1',
        connectedIntegrations: Number(oauth[0]?.total || 0),
        pendingScheduledActions: Number(queue[0]?.pending || 0),
        autoReplyEnabled: settings.conversation.autoReplyEnabled
      };
    }
    case 'sendPasswordReset': {
      requireConfirmation(confirmed);
      const email = requireEmail(args);
      const host = process.env.SMTP_HOST?.trim();
      if (!host) throw new CerebroActionError('SMTP não está configurado para envio do link de recuperação.', 503);
      const token = await createD1AdminPasswordReset(email);
      if (!token) return { sent: false, message: 'Se a conta existir, as instruções serão enviadas.' };
      const resetUrlValue = process.env.ADMIN_PASSWORD_RESET_URL ||
        (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000/admin');
      if (!resetUrlValue) throw new CerebroActionError('ADMIN_PASSWORD_RESET_URL não configurado.', 503);
      const url = new URL(resetUrlValue);
      url.searchParams.set('resetToken', token);
      await sendEmail(email, 'Redefinição de senha administrativa', `Use este link para redefinir a senha. Expira em 30 minutos:\n\n${url.toString()}`);
      return { sent: true };
    }
    case 'verifyAdminIdentityMedia': {
      requireConfirmation(confirmed);
      const subjectUserId = requireString(args, 'userId', 100);
      const mediaUrl = requireString(args, 'mediaUrl', 2048);
      const parsedUrl = new URL(mediaUrl);
      if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
        throw new CerebroActionError('mediaUrl precisa ser uma URL HTTPS pública válida.');
      }
      const user = await queryCerebroD1<{ id: string }>(
        `SELECT id FROM users WHERE id = ? AND EXISTS
         (SELECT 1 FROM admins WHERE admins.user_id = users.id) LIMIT 1`,
        [subjectUserId]
      );
      if (!user[0]) throw new CerebroActionError('Admin a verificar não encontrado.', 404);
      const mediaType = args.mediaType === 'video' ? 'video' : 'photo';
      const id = randomBytes(16).toString('hex');
      await queryCerebroD1(
        `INSERT INTO cerebro_identity_reviews
         (id, admin_uid, subject_user_id, media_url, media_type, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [id, adminUid, subjectUserId, mediaUrl, mediaType, new Date().toISOString()]
      );
      return { queuedForManualReview: true, reviewId: id, status: 'pending' };
    }
  }
}

export async function processDueCerebroScheduledActions() {
  await initializeCerebroActionSchema();
  const now = new Date().toISOString();
  const due = await queryCerebroD1<{
    id: string;
    admin_uid: string;
    service_id: string;
    payload: string;
  }>(
    `SELECT id, admin_uid, service_id, payload
     FROM cerebro_scheduled_actions
     WHERE status = 'pending' AND run_at <= ?
     ORDER BY run_at
     LIMIT 10`,
    [now]
  );
  let processed = 0;
  for (const action of due) {
    const [claimed] = await queryCerebroD1<{ id: string }>(
      `UPDATE cerebro_scheduled_actions SET status = 'processing', updated_at = ?
       WHERE id = ? AND status = 'pending' RETURNING id`,
      [now, action.id]
    );
    if (!claimed) continue;
    try {
      const settings = await getCerebroAdminSettings(action.admin_uid);
      const payload = parseJsonPayload(action.payload);
      if (settings.services[action.service_id] === false) {
        throw new Error(`O serviço ${action.service_id} foi desativado antes da execução agendada.`);
      }
      if (action.service_id === 'scheduleTask') {
        if (payload.taskType !== 'sendMessage') throw new Error('Tipo de tarefa agendada não suportado.');
        await sendSocialText(
          action.admin_uid,
          String(payload.channel),
          String(payload.recipient),
          String(payload.text)
        );
      } else if (action.service_id === 'schedulePublication') {
        const postId = String(payload.postId || '');
        const posts = await queryCerebroD1<{ payload: string }>(
          `SELECT payload FROM media_collection
           WHERE collection = 'posts' AND document_id = ? AND admin_uid = ? AND json_valid(payload)`,
          [postId, action.admin_uid]
        );
        if (!posts[0]) throw new Error('Publicação agendada não encontrada.');
        const post = parseJsonPayload(posts[0].payload);
        post.published = true;
        post.visibility = 'public';
        await queryCerebroD1(
          `UPDATE media_collection SET payload = ?, updated_at = CURRENT_TIMESTAMP
           WHERE collection = 'posts' AND document_id = ? AND admin_uid = ?`,
          [JSON.stringify(post), postId, action.admin_uid]
        );
      } else {
        throw new Error(`Tipo de ação agendada não suportado: ${action.service_id}.`);
      }
      await queryCerebroD1(
        `UPDATE cerebro_scheduled_actions SET status = 'completed', updated_at = ?
         WHERE id = ?`,
        [new Date().toISOString(), action.id]
      );
    } catch (error) {
      await queryCerebroD1(
        `UPDATE cerebro_scheduled_actions SET status = 'failed', payload = ?, updated_at = ?
         WHERE id = ?`,
        [
          JSON.stringify({
            ...parseJsonPayload(action.payload),
            executionError: error instanceof Error ? error.message : 'Falha desconhecida.'
          }),
          new Date().toISOString(),
          action.id
        ]
      );
      console.error(`Falha ao executar ação agendada ${action.id}:`, error);
    }
    processed += 1;
  }
  return processed;
}
