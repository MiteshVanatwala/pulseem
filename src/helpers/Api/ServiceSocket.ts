import { io, Socket } from 'socket.io-client';
import { IConversation, IMessage } from '../../Models/Service/Conversation';

// Thin wrapper over one shared socket.io connection to pulseem-communication.
//
// A module singleton rather than a per-component connection: the inbox mounts and
// unmounts as the agent moves between channels, and reconnecting each time would
// drop the account room subscription and lose messages in the gap.

export interface ServiceSocketEvents {
  'message:new': (payload: { conversationId: string; message: IMessage }) => void;
  'conversation:created': (conversation: IConversation) => void;
  'conversation:updated': (conversation: IConversation) => void;
  'agent:typing': (payload: { agentName: string }) => void;
  'visitor:typing': (payload: { conversationId: string }) => void;
}

export type ServiceSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'unavailable';

// Resolves a fresh token. Called for the first connect and again before every
// reconnect, because the token is short-lived and a reconnect after expiry would
// otherwise loop on "Authentication failed" until the page is reloaded.
type TokenResolver = () => Promise<{ token: string; url: string } | null>;

let socket: Socket | null = null;
let resolveToken: TokenResolver | null = null;
let connecting: Promise<void> | null = null;
let status: ServiceSocketStatus = 'idle';
const statusListeners = new Set<(s: ServiceSocketStatus) => void>();

// Subscriptions are held here rather than only on the socket, because connect() is
// async (it fetches a token first) while callers subscribe synchronously right after
// calling it. Binding straight to the socket would silently drop every handler
// registered before the connection opened. Keeping the registry also means handlers
// survive a reconnect without the caller re-subscribing.
const handlers = new Map<string, Set<(...args: any[]) => void>>();

const bindAll = (target: Socket): void => {
  handlers.forEach((fns, event) => fns.forEach((fn) => target.on(event, fn)));
};

const setStatus = (next: ServiceSocketStatus): void => {
  if (status === next) return;
  status = next;
  statusListeners.forEach((fn) => fn(next));
};

export const getStatus = (): ServiceSocketStatus => status;

export const onStatusChange = (fn: (s: ServiceSocketStatus) => void): (() => void) => {
  statusListeners.add(fn);
  return () => { statusListeners.delete(fn); };
};

/**
 * Opens the shared connection, or does nothing if one is already open.
 * Never throws — real-time is an enhancement, and the inbox has to keep working
 * when the socket service is down or not yet deployed.
 */
export const connect = async (getToken: TokenResolver): Promise<void> => {
  resolveToken = getToken;
  if (socket) return;
  // The guard above cannot stand alone: this function awaits before assigning
  // `socket`, so two callers mounting together would both pass it and open two
  // connections. Sharing the in-flight promise makes the second caller wait.
  if (connecting) return connecting;

  connecting = (async () => {
  setStatus('connecting');
  let credentials: { token: string; url: string } | null = null;
  try {
    credentials = await getToken();
  } catch {
    credentials = null;
  }

  if (!credentials || !credentials.token || !credentials.url) {
    // Not configured (or the backend said real-time is off) — stay on polling.
    setStatus('unavailable');
    return;
  }

  socket = io(credentials.url, {
    auth: { token: credentials.token },
    // Try WebSocket first, fall back to polling. Behind an IIS/ARR reverse proxy a
    // misconfigured upgrade leaves polling as the only working transport, and a
    // degraded inbox beats no inbox.
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => setStatus('connected'));
  socket.on('disconnect', () => setStatus('disconnected'));

  // The token is short-lived, so mint a new one before each retry rather than
  // replaying the expired one.
  socket.io.on('reconnect_attempt', () => {
    if (!resolveToken || !socket) return;
    resolveToken()
      .then((fresh) => {
        if (fresh && fresh.token && socket) socket.auth = { token: fresh.token };
      })
      .catch(() => { /* keep the old token; the next attempt tries again */ });
  });

  socket.on('connect_error', (err: Error) => {
    setStatus('disconnected');
    // eslint-disable-next-line no-console
    console.warn('[service-socket] connect_error:', err?.message);
  });

    // Attach everything subscribed while the token was in flight.
    bindAll(socket);
  })();

  try {
    await connecting;
  } finally {
    connecting = null;
  }
};

export const disconnect = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  resolveToken = null;
  // handlers is deliberately left intact — the caller's unsubscribe functions own
  // those entries, and a later connect() re-binds them.
  setStatus('idle');
};

/** Subscribes to a server event and returns an unsubscribe function. */
export const on = <K extends keyof ServiceSocketEvents>(
  event: K,
  handler: ServiceSocketEvents[K],
): (() => void) => {
  const key = event as string;
  const fn = handler as unknown as (...args: any[]) => void;

  // Registered unconditionally. Callers subscribe immediately after kicking off the
  // async connect, so at this point there is usually no socket yet — bindAll() picks
  // these up the moment one exists.
  if (!handlers.has(key)) handlers.set(key, new Set());
  handlers.get(key)!.add(fn);
  if (socket) socket.on(key, fn);

  return () => {
    handlers.get(key)?.delete(fn);
    if (socket) socket.off(key, fn);
  };
};

// ── Outbound ────────────────────────────────────────────────────────────────
// The server checks that the conversation belongs to the caller's account before
// putting the socket in the room, so a rejected join is silent by design: nothing
// arrives for that conversation and the UI keeps using its fetched messages.

export const joinConversation = (conversationId: string): void => {
  if (socket && conversationId) socket.emit('agent:join-conversation', { conversationId });
};

export const leaveConversation = (conversationId: string): void => {
  if (socket && conversationId) socket.emit('agent:leave-conversation', { conversationId });
};

export const sendTyping = (conversationId: string): void => {
  if (socket && conversationId) socket.emit('agent:typing', { conversationId });
};
