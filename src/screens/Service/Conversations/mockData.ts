// Preview mock data for the Service inbox. Used only while conversationsSlice's
// USE_MOCK flag is true (flip it to false once the Service backend is deployed).
import { IConversation, IMessage, IVisitorInfo, IPageVisit, IAgentOption } from '../../../Models/Service/Conversation';

export const MOCK_AGENTS: IAgentOption[] = [
  { id: 101, name: 'Dana Levi' },
  { id: 102, name: 'Omer Cohen' },
  { id: 103, name: 'Rina Katz' },
];

export const MOCK_DOMAINS: string[] = ['shop.example.com', 'acme.io'];

export const MOCK_CONVERSATIONS: IConversation[] = [
  {
    id: 'c-1001', visitorId: 'v-9f3a2b7c41', visitorName: 'John Carter', visitorEmail: 'john@example.com', visitorPhone: '+15551234567',
    assignedAgentId: 101, assignedAgentName: 'Dana Levi', status: 'open', channel: 'widget',
    lastMessage: 'Do you ship internationally?', lastMessageSender: 'visitor',
    lastActivityAt: '2026-07-28T09:12:00Z', startedAt: '2026-07-28T08:55:00Z',
    pageUrl: 'https://shop.example.com/products/headphones', messageCount: 6,
  },
  {
    id: 'c-1002', visitorId: 'v-2c8d1e5a90', visitorName: 'Maria Gomez', visitorEmail: undefined, visitorPhone: '+15559876543',
    assignedAgentId: null, assignedAgentName: null, status: 'new', channel: 'whatsapp',
    lastMessage: 'Hi, I need help with my order #4821', lastMessageSender: 'visitor',
    lastActivityAt: '2026-07-28T09:40:00Z', startedAt: '2026-07-28T09:40:00Z',
    pageUrl: '', messageCount: 1,
  },
  {
    id: 'c-1003', visitorId: 'v-77aa11bb22', visitorName: 'Sarah Kim', visitorEmail: 'sarah.kim@example.com', visitorPhone: undefined,
    assignedAgentId: 102, assignedAgentName: 'Omer Cohen', status: 'resolved', channel: 'widget',
    lastMessage: 'Thanks, that solved it!', lastMessageSender: 'visitor',
    lastActivityAt: '2026-07-27T16:20:00Z', startedAt: '2026-07-27T15:58:00Z',
    pageUrl: 'https://shop.example.com/support', messageCount: 9,
  },
  {
    id: 'c-1005', visitorId: 'v-5511aa77cd', visitorName: 'David Chen', visitorEmail: 'david@acme.io', visitorPhone: undefined,
    assignedAgentId: 103, assignedAgentName: 'Rina Katz', status: 'open', channel: 'widget',
    lastMessage: 'Can you send me the invoice again?', lastMessageSender: 'visitor',
    lastActivityAt: '2026-07-28T08:05:00Z', startedAt: '2026-07-28T07:40:00Z',
    pageUrl: 'https://shop.example.com/account/billing', messageCount: 4,
  },
  {
    id: 'c-1004', visitorId: 'v-abcdef0099', visitorName: undefined, visitorEmail: undefined, visitorPhone: undefined,
    assignedAgentId: null, assignedAgentName: null, status: 'archived', channel: 'widget',
    lastMessage: 'Never mind, figured it out.', lastMessageSender: 'visitor',
    lastActivityAt: '2026-07-26T11:05:00Z', startedAt: '2026-07-26T10:50:00Z',
    pageUrl: 'https://shop.example.com/pricing', messageCount: 4,
  },
];

export const MOCK_MESSAGES: Record<string, IMessage[]> = {
  'c-1001': [
    { id: 'm1', conversationId: 'c-1001', sender: 'visitor', senderName: 'Visitor', content: 'Hi there!', sentAt: '2026-07-28T08:55:00Z' },
    { id: 'm2', conversationId: 'c-1001', sender: 'ai', senderName: 'Pulsy AI', content: 'Hello! How can we help you today?', sentAt: '2026-07-28T08:55:20Z' },
    { id: 'm3', conversationId: 'c-1001', sender: 'visitor', senderName: 'John Carter', content: 'Looking at the wireless headphones.', sentAt: '2026-07-28T08:56:00Z' },
    { id: 'm4', conversationId: 'c-1001', sender: 'agent', senderName: 'Dana Levi', content: 'Great choice! Anything I can help with?', sentAt: '2026-07-28T09:00:00Z' },
    { id: 'm5', conversationId: 'c-1001', sender: 'visitor', senderName: 'John Carter', content: 'Do you ship internationally?', sentAt: '2026-07-28T09:12:00Z' },
  ],
  'c-1002': [
    { id: 'm6', conversationId: 'c-1002', sender: 'visitor', senderName: 'Maria Gomez', content: 'Hi, I need help with my order #4821', sentAt: '2026-07-28T09:40:00Z' },
  ],
  'c-1003': [
    { id: 'm7', conversationId: 'c-1003', sender: 'visitor', senderName: 'Sarah Kim', content: 'My download link is broken.', sentAt: '2026-07-27T15:58:00Z' },
    { id: 'm8', conversationId: 'c-1003', sender: 'agent', senderName: 'Omer Cohen', content: 'Sorry about that — here is a fresh link.', fileUrl: 'https://example.com/files/download.pdf', sentAt: '2026-07-27T16:05:00Z' },
    { id: 'm9', conversationId: 'c-1003', sender: 'visitor', senderName: 'Sarah Kim', content: 'Thanks, that solved it!', sentAt: '2026-07-27T16:20:00Z' },
  ],
  'c-1005': [
    { id: 'm12', conversationId: 'c-1005', sender: 'visitor', senderName: 'David Chen', content: 'Can you send me the invoice again?', sentAt: '2026-07-28T08:05:00Z' },
  ],
  'c-1004': [
    { id: 'm10', conversationId: 'c-1004', sender: 'visitor', senderName: 'Visitor', content: 'How much is the pro plan?', sentAt: '2026-07-26T10:50:00Z' },
    { id: 'm11', conversationId: 'c-1004', sender: 'visitor', senderName: 'Visitor', content: 'Never mind, figured it out.', sentAt: '2026-07-26T11:05:00Z' },
  ],
};

export const MOCK_VISITOR_INFO: Record<string, IVisitorInfo> = {
  'c-1001': { browser: 'Chrome 148 / macOS', location: 'Berlin, Germany', referrerUrl: 'https://google.com' },
  'c-1002': { browser: 'WhatsApp', location: 'Unknown', referrerUrl: '' },
  'c-1003': { browser: 'Safari / iOS', location: 'Tel Aviv, Israel', referrerUrl: 'https://shop.example.com' },
  'c-1005': { browser: 'Edge / Windows', location: 'Austin, USA', referrerUrl: 'https://acme.io' },
  'c-1004': { browser: 'Firefox / Windows', location: 'Austin, USA', referrerUrl: 'https://bing.com' },
};

export const MOCK_PAGE_TRAIL: Record<string, IPageVisit[]> = {
  'c-1001': [
    { url: '/', visitedAt: '2026-07-28T08:50:00Z' },
    { url: '/products', visitedAt: '2026-07-28T08:52:00Z' },
    { url: '/products/headphones', visitedAt: '2026-07-28T08:54:00Z' },
  ],
  'c-1003': [{ url: '/support', visitedAt: '2026-07-27T15:57:00Z' }],
  'c-1005': [{ url: '/account/billing', visitedAt: '2026-07-28T07:39:00Z' }],
};
