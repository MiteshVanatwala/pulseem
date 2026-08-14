// Data model for the Pulseem Service "Conversations" inbox (PR-2455).
// Shared by the widget and WhatsApp channels via the `channel` field.

export type ConversationStatus = 'new' | 'open' | 'resolved' | 'archived';
export type MessageSender = 'visitor' | 'agent' | 'ai';
export type ConversationChannel = 'widget' | 'whatsapp';

export interface IConversation {
  id: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  assignedAgentId: number | null;
  assignedAgentName: string | null;
  status: ConversationStatus;
  channel: ConversationChannel;
  domain?: string;           // widget domain this conversation belongs to (widget channel)
  lastMessage: string;
  lastMessageSender: MessageSender;
  lastActivityAt: string;
  startedAt: string;
  pageUrl: string;
  messageCount: number;
}

export interface IMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  content: string;
  fileUrl?: string;
  sentAt: string;
}

export interface IVisitorInfo {
  browser: string;
  location: string;
  referrerUrl: string;
}

export interface IPageVisit {
  url: string;
  visitedAt: string;
}

export interface IAgentOption {
  id: number;
  name: string;
}

export interface IConversationListFilter {
  status: ConversationStatus | 'all';
  search: string;
  agentId: number | null;
}

// new = blue, open = orange, resolved = green, archived = gray
export const STATUS_COLORS: Record<ConversationStatus, string> = {
  new: '#3b82f6',
  open: '#f97316',
  resolved: '#16a34a',
  archived: '#9ca3af',
};

export const STATUS_ORDER: ConversationStatus[] = ['new', 'open', 'resolved', 'archived'];

// Avatar helpers (WhatsApp-style colored initials).
const AVATAR_COLORS = ['#f4511e', '#0ea5e9', '#8b5cf6', '#16a34a', '#e11d48', '#f59e0b', '#0891b2', '#6366f1'];
export const avatarColor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < (seed || '').length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};
export const avatarInitial = (name?: string, fallback = 'V'): string =>
  name && name.trim() ? name.trim().charAt(0) : fallback;
