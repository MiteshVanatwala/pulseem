// Data model for the Service Dashboard (PR-2453, Phase 2).
// One aggregate DTO mirrors a future single `GET /api/Service/Dashboard` endpoint.
import { IConversation } from './Conversation';

export interface IDashboardStats {
  newConversations: number;
  openConversations: number;
  totalConversations: number;
  marketingConsent: number;
}

export type WidgetStatus = 'active' | 'paused' | 'not_configured';
export type ActiveHours = 'custom' | '24_7';
export type AIStatus = 'enabled' | 'disabled';

export interface IPerformanceInsights {
  avgResponseMinutes: number; // placeholder (ticket: hardcoded 2.3 until timestamp data exists)
  resolutionRate: number; // resolved / total * 100
  widgetStatus: WidgetStatus;
  activeHours: ActiveHours;
  aiStatus: AIStatus;
}

export interface IMarketingInsights {
  totalContacts: number;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number; // marketing contacts / total conversations * 100
}

export interface IFeedbackItem {
  id: string;
  rating: number; // 1..5
  text: string;
  author?: string;
  createdAt: string;
}

export interface IUserFeedback {
  enabled: boolean; // feedback collection enabled on the widget
  avgRating: number;
  totalReviews: number;
  positive: number; // ratings >= 4
  neutral: number; // rating 3
  negative: number; // ratings <= 2
  recent: IFeedbackItem[]; // latest 2
}

export interface IDashboardData {
  stats: IDashboardStats;
  recentConversations: IConversation[]; // latest 5, sorted by last activity desc
  performance: IPerformanceInsights;
  marketing: IMarketingInsights;
  feedback: IUserFeedback;
}
