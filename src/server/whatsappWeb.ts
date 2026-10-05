import makeWASocket, {
  BufferJSON,
  DisconnectReason,
  initAuthCreds,
  makeCacheableSignalKeyStore,
  proto,
  type AuthenticationState,
  type SignalDataSet,
  type SignalDataTypeMap,
  type WAMessage,
  type WASocket
} from '@whiskeysockets/baileys';
import pino from 'pino';
import {
  clearWhatsAppWebAuth,
  isD1AuthConfigured,
  listWhatsAppWebAuthUsers,
  loadWhatsAppWebAuth,
  saveWhatsAppWebAuth,
  saveWhatsAppWebMessages
} from './integrationAuth';

export type WhatsAppWebStatus = 'disconnected' | 'connecting' | 'waiting_for_scan' | 'connected' | 'error';

interface WhatsAppWebSession {
  userId: string;
  status: WhatsAppWebStatus;
  qr: string | null;
  phoneNumber: string | null;
  name: string | null;
  error: string | null;
  socket: WASocket | null;
  generation: number;
  reconnectAttempts: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
}

const sessions = new Map<string, WhatsAppWebSession>();
const logger = pino({ level: 'silent' });

function serialize(value: unknown) {
  return JSON.stringify(value, BufferJSON.replacer);
}

function deserialize<T>(value: string): T {
  return JSON.parse(value, BufferJSON.reviver) as T;
}

async function createAuthState(userId: string): Promise<AuthenticationState> {
  const saved = await loadWhatsAppWebAuth(userId);
  const credsEntry = saved.find((entry) => entry.keyType === 'creds' && entry.keyId === 'creds');
  const creds = credsEntry
    ? deserialize<AuthenticationState['creds']>(credsEntry.serialized)
    : initAuthCreds();
  const savedKeys = new Map(
    saved.filter((entry) => entry.keyType !== 'creds')
      .map((entry) => [`${entry.keyType}:${entry.keyId}`, deserialize<unknown>(entry.serialized)])
  );

  const keys: AuthenticationState['keys'] = {
    async get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]) {
      const result: Record<string, SignalDataTypeMap[T]> = {};
      for (const id of ids) {
        const value = savedKeys.get(`${type}:${id}`);
        if (value === undefined) continue;
        result[id] = (type === 'app-state-sync-key'
          ? proto.Message.AppStateSyncKeyData.fromObject(value as object)
          : value) as SignalDataTypeMap[T];
      }
      return result;
    },
    async set(data: SignalDataSet) {
      const writes: Promise<void>[] = [];
      for (const [type, entries] of Object.entries(data)) {
        if (!entries) continue;
        for (const [id, value] of Object.entries(entries)) {
          const key = `${type}:${id}`;
          if (value === null) {
            savedKeys.delete(key);
            writes.push(saveWhatsAppWebAuth(userId, type, id, null));
          } else {
            savedKeys.set(key, value);
            writes.push(saveWhatsAppWebAuth(userId, type, id, serialize(value)));
          }
        }
      }
      await Promise.all(writes);
    }
  };

  return { creds, keys: makeCacheableSignalKeyStore(keys, logger) };
}

function getOrCreateSession(userId: string): WhatsAppWebSession {
  let session = sessions.get(userId);
  if (!session) {
    session = {
      userId,
      status: 'disconnected',
      qr: null,
      phoneNumber: null,
      name: null,
      error: null,
      socket: null,
      generation: 0,
      reconnectAttempts: 0,
      reconnectTimer: null
    };
    sessions.set(userId, session);
  }
  return session;
}

function sessionView(session: WhatsAppWebSession) {
  return {
    status: session.status,
    qr: session.qr,
    phone_number: session.phoneNumber,
    name: session.name,
    error: session.error
  };
}

function startSocket(session: WhatsAppWebSession, generation: number, auth: AuthenticationState) {
  if (session.generation !== generation) return;
  const socket = makeWASocket({
    auth,
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: true,
    browser: ['Cerebro Central', 'Chrome', '120.0.0']
  });
  session.socket = socket;

  const persistMessages = (
    messages: WAMessage[],
    contacts: { id?: string | null; name?: string | null; notify?: string | null; verifiedName?: string | null }[] = []
  ) => {
    const normalized = messages.flatMap((entry) => {
      const conversationId = entry.key.remoteJid || '';
      const id = entry.key.id || '';
      const timestampSeconds = Number(entry.messageTimestamp || 0);
      if (!conversationId || !id || conversationId === 'status@broadcast' || !timestampSeconds) return [];
      const content = entry.message;
      const text = content?.conversation ||
        content?.extendedTextMessage?.text ||
        content?.imageMessage?.caption ||
        content?.videoMessage?.caption ||
        content?.documentMessage?.caption ||
        content?.buttonsResponseMessage?.selectedDisplayText ||
        content?.templateButtonReplyMessage?.selectedDisplayText ||
        (content?.imageMessage ? '[Imagem]' : '') ||
        (content?.videoMessage ? '[Vídeo]' : '') ||
        (content?.audioMessage ? '[Áudio]' : '') ||
        (content?.documentMessage ? '[Documento]' : '');
      if (!text) return [];
      const contact = contacts.find((item) => item.id === conversationId);
      return [{
        id: `${conversationId}:${id}`,
        conversationId,
        contactName: contact?.name || contact?.notify || contact?.verifiedName ||
          (entry.key.fromMe ? '' : entry.pushName) || conversationId,
        fromMe: Boolean(entry.key.fromMe),
        text,
        timestamp: new Date(timestampSeconds * 1000).toISOString()
      }];
    });
    if (normalized.length) {
      void saveWhatsAppWebMessages(session.userId, normalized).catch((error: unknown) => {
        if (session.generation !== generation) return;
        session.error = error instanceof Error ? error.message : 'Falha ao salvar histórico do WhatsApp.';
      });
    }
  };

  socket.ev.on('creds.update', () => {
    void saveWhatsAppWebAuth(session.userId, 'creds', 'creds', serialize(auth.creds))
      .catch((error: unknown) => {
        if (session.generation !== generation) return;
        session.status = 'error';
        session.error = error instanceof Error ? error.message : 'Falha ao salvar a sessão do WhatsApp.';
      });
  });

  socket.ev.on('connection.update', (update) => {
    if (session.generation !== generation) return;
    if (update.qr) {
      session.qr = update.qr;
      session.status = 'waiting_for_scan';
      session.error = null;
    }
    if (update.connection === 'open') {
      session.status = 'connected';
      session.qr = null;
      session.error = null;
      session.reconnectAttempts = 0;
      session.phoneNumber = socket.user?.id.split(':')[0].split('@')[0] || null;
      session.name = socket.user?.name || null;
    }
    if (update.connection === 'close') {
      session.socket = null;
      session.qr = null;
      const statusCode = (update.lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)
        ?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        session.status = 'disconnected';
        session.phoneNumber = null;
        session.name = null;
        void clearWhatsAppWebAuth(session.userId).catch((error: unknown) => {
          session.status = 'error';
          session.error = error instanceof Error ? error.message : 'Falha ao remover a sessão desconectada.';
        });
        return;
      }
      session.status = 'connecting';
      if (session.reconnectTimer) clearTimeout(session.reconnectTimer);
      const reconnectDelay = Math.min(30_000, 1000 * 2 ** Math.min(session.reconnectAttempts, 5));
      session.reconnectAttempts += 1;
      session.reconnectTimer = setTimeout(() => {
        session.reconnectTimer = null;
        void createAuthState(session.userId)
          .then((nextAuth) => startSocket(session, generation, nextAuth))
          .catch((error: unknown) => {
            if (session.generation !== generation) return;
            session.status = 'error';
            session.error = error instanceof Error ? error.message : 'Falha ao restaurar a sessão do WhatsApp.';
          });
      }, reconnectDelay);
    }
  });

  socket.ev.on('messaging-history.set', ({ messages, contacts }) => {
    if (session.generation === generation) persistMessages(messages, contacts);
  });
  socket.ev.on('messages.upsert', ({ messages }) => {
    if (session.generation === generation) persistMessages(messages);
  });
}

export async function connectWhatsAppWeb(userId: string) {
  if (!isD1AuthConfigured()) {
    throw new Error('Configure Cloudflare D1 e OAUTH_TOKEN_ENCRYPTION_KEY para armazenar a sessão WhatsApp Web com segurança.');
  }
  const session = getOrCreateSession(userId);
  if (session.status === 'connected' || session.status === 'waiting_for_scan' || session.status === 'connecting') {
    return sessionView(session);
  }

  session.generation += 1;
  session.status = 'connecting';
  session.qr = null;
  session.error = null;
  try {
    const auth = await createAuthState(userId);
    await saveWhatsAppWebAuth(userId, 'creds', 'creds', serialize(auth.creds));
    startSocket(session, session.generation, auth);
  } catch (error) {
    session.status = 'error';
    session.error = error instanceof Error ? error.message : 'Não foi possível iniciar o pareamento do WhatsApp.';
    throw error;
  }
  return sessionView(session);
}

export function getWhatsAppWebStatus(userId: string) {
  const session = sessions.get(userId);
  return session ? sessionView(session) : {
    status: 'disconnected' as const,
    qr: null,
    phone_number: null,
    name: null,
    error: null
  };
}

export async function disconnectWhatsAppWeb(userId: string) {
  const session = sessions.get(userId);
  if (session) {
    const wasConnected = session.status === 'connected';
    session.generation += 1;
    if (session.reconnectTimer) clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
    const socket = session.socket;
    session.socket = null;
    session.qr = null;
    session.status = 'disconnected';
    session.phoneNumber = null;
    session.name = null;
    try {
      if (socket) {
        if (wasConnected) await socket.logout();
        else socket.end(new Error('WhatsApp Web pairing cancelled.'));
      }
    } finally {
      sessions.delete(userId);
      await clearWhatsAppWebAuth(userId);
    }
    return getWhatsAppWebStatus(userId);
  }
  await clearWhatsAppWebAuth(userId);
  return getWhatsAppWebStatus(userId);
}

export async function restoreWhatsAppWebSessions() {
  if (!isD1AuthConfigured()) return;
  for (const userId of await listWhatsAppWebAuthUsers()) {
    const session = getOrCreateSession(userId);
    if (session.status !== 'disconnected') continue;
    session.generation += 1;
    session.status = 'connecting';
    try {
      const auth = await createAuthState(userId);
      await saveWhatsAppWebAuth(userId, 'creds', 'creds', serialize(auth.creds));
      startSocket(session, session.generation, auth);
    } catch (error) {
      session.status = 'error';
      session.error = error instanceof Error ? error.message : 'Falha ao restaurar a sessão do WhatsApp.';
    }
  }
}
