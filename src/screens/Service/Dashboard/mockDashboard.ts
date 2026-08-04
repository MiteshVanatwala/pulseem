// Preview mock for the Service Dashboard. Used only while serviceDashboardSlice's
// USE_MOCK flag is true (flip it to false once the Dashboard backend is deployed).
import { IDashboardData } from '../../../Models/Service/Dashboard';
import { MOCK_CONVERSATIONS } from '../Conversations/mockData';

const recent = [...MOCK_CONVERSATIONS]
  .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
  .slice(0, 5);

const total = MOCK_CONVERSATIONS.length;
const resolved = MOCK_CONVERSATIONS.filter((c) => c.status === 'resolved').length;

export const MOCK_DASHBOARD: IDashboardData = {
  stats: {
    newConversations: MOCK_CONVERSATIONS.filter((c) => c.status === 'new').length,
    openConversations: MOCK_CONVERSATIONS.filter((c) => c.status === 'open').length,
    totalConversations: total,
    marketingConsent: 128,
  },
  recentConversations: recent,
  performance: {
    avgResponseMinutes: 2.3,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    widgetStatus: 'active',
    activeHours: 'custom',
    aiStatus: 'enabled',
  },
  marketing: {
    totalContacts: 342,
    thisWeek: 18,
    thisMonth: 74,
    conversionRate: 32,
  },
  feedback: {
    enabled: true,
    avgRating: 4.3,
    totalReviews: 27,
    positive: 21,
    neutral: 3,
    negative: 3,
    recent: [
      { id: 'f1', rating: 5, text: 'Super quick help — solved my issue in a couple of minutes. Great support!', author: 'John C.', createdAt: '2026-07-28T10:05:00Z' },
      { id: 'f2', rating: 2, text: 'Had to wait a while before an agent picked up my chat.', author: 'Maria G.', createdAt: '2026-07-27T14:30:00Z' },
    ],
  },
};

// Empty-state variant for testing the zero-data panels (not wired by default).
export const MOCK_DASHBOARD_EMPTY: IDashboardData = {
  stats: { newConversations: 0, openConversations: 0, totalConversations: 0, marketingConsent: 0 },
  recentConversations: [],
  performance: { avgResponseMinutes: 0, resolutionRate: 0, widgetStatus: 'not_configured', activeHours: '24_7', aiStatus: 'disabled' },
  marketing: { totalContacts: 0, thisWeek: 0, thisMonth: 0, conversionRate: 0 },
  feedback: { enabled: false, avgRating: 0, totalReviews: 0, positive: 0, neutral: 0, negative: 0, recent: [] },
};
