// Data model for the Pulseem Service "AI Assistant" feature (PR-2457).

export type KnowledgeItemType = 'text' | 'faq' | 'url';

export type ResponseStyle = 'professional' | 'friendly' | 'concise';

export type AiAssistantStatus = 'ready' | 'notReady';

// Server never returns a split Question/Answer or a dedicated Url field — there is
// only ever `Content` (a single string) plus `ItemType` to say how to interpret it.
export interface IKnowledgeItem {
  id: number;
  title: string;
  type: KnowledgeItemType;
  content: string;
  tags: string[];
  isActive: boolean;
  wordCount: number; // server-computed; never sent by the client
  createdDate: string;
  modifiedDate: string | null;
  lastReferencedDate: string | null;
}

export interface IKnowledgeItemInput {
  title: string;
  type: KnowledgeItemType;
  content: string;
  tags: string[];
}

export interface IAiAssistantSettings {
  responseStyle: ResponseStyle;
  defaultLanguage: string; // required, <=10 chars per contract; no fixed enum given
  confidenceThreshold: number; // 0-100 inclusive
  autoEscalate: boolean;
  escalationMessage: string | null;
  maxContextWords: number; // 100-10,000 inclusive; may come back clamped by the server
  includeConversationHistory: boolean;
  createdDate?: string;
  modifiedDate?: string | null;
}

export interface IAiAssistantStats {
  activeKnowledgeItems: number;
  totalKnowledgeItems: number;
  totalWordCount: number;
  status: AiAssistantStatus;
}

export const KNOWLEDGE_ITEM_TYPES: KnowledgeItemType[] = ['text', 'faq', 'url'];
export const RESPONSE_STYLES: ResponseStyle[] = ['professional', 'friendly', 'concise'];

export const MAX_KNOWLEDGE_ITEMS = 500;
export const MAX_TAGS_PER_ITEM = 10;
export const MAX_TAG_LENGTH = 50;
export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 20000;
export const MAX_ESCALATION_MESSAGE_LENGTH = 1000;
export const MIN_CONFIDENCE_THRESHOLD = 0;
export const MAX_CONFIDENCE_THRESHOLD = 100;
export const MIN_MAX_CONTEXT_WORDS = 100;
export const MAX_MAX_CONTEXT_WORDS = 10000;
export const DEFAULT_CONFIDENCE_THRESHOLD = 70;
export const DEFAULT_MAX_CONTEXT_WORDS = 2000;

// Test Chat (Slice 3). Contract confirmed by backend (Phase 0, PR-2457 Group B).
// TestAIMessage's success body is camelCase, unlike the rest of ServiceAI's PascalCase
// convention (SaveKnowledgeItem, GetAISettings, etc.) — do not assume the two share a
// casing convention when writing the server<->client mapper.
export type TestChatMessageStatus = 'pending' | 'succeeded' | 'failed' | 'rateLimited';

export interface IKnowledgeSourceRef {
  id: number;
  title: string;
}

export interface ITestChatResponse {
  responseLogId: number; // required by SaveTestFeedback (Slice 3 feedback buttons)
  reply: string;
  confidenceScore: number; // 0-100, compare against IAiAssistantSettings.confidenceThreshold
  escalated: boolean;
  knowledgeSources: IKnowledgeSourceRef[];
  responseTimeMs: number;
}

// Client-side conversation entry — the server has no concept of a Test Chat
// "conversation," each message is a standalone TestAIMessage call.
export interface ITestChatExchange {
  id: string;
  question: string;
  status: TestChatMessageStatus;
  response: ITestChatResponse | null;
  errorMessage: string | null;
  // TestAIMessage's 429 body has no RetryAfterSeconds field (confirmed absent) — it
  // returns a daily cap instead.
  maxRequestsPerDay?: number;
  feedback?: 'helpful' | 'needsImprovement' | null;
}

export const MAX_TEST_MESSAGE_LENGTH = 2000;

// Analytics (Slice 5). Contract confirmed by backend (Phase 0, PR-2457 Group B): POST
// only (the GET variant has a different, non-date-ranged shape with no
// testModeCount/liveModeCount and must not be used). Response body is camelCase, like
// TestAIMessage's, unlike the rest of ServiceAI. liveModeCount/testModeCount are
// server-verified ground truth (backed by a NOT NULL IsTestMode column), not a
// heuristic — safe to key the test-mode banner off directly.
//
// The wire arrays use `knowledgeItemId`, NOT `id` — different from TestAIMessage's
// `knowledgeSources`, which uses `id`. Don't assume the two endpoints share a field
// name; see fromServerAnalytics vs fromServerTestChatResponse in aiAssistantSlice.ts.
export interface IAnalyticsReferencedItem extends IKnowledgeSourceRef {
  referenceCount: number;
}

export interface IAiAssistantAnalytics {
  liveModeCount: number;
  testModeCount: number;
  // {id, title} only — confirmed the wire has no itemType or lastReferencedDate today
  // (a possible future backend addition, not built here). Do not fabricate either
  // client-side; the Unused Content card only renders what's actually returned.
  unusedContentItems: IKnowledgeSourceRef[];
  mostReferencedItems: IAnalyticsReferencedItem[];
}

export interface IAnalyticsDateRange {
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
}

export const DEFAULT_ANALYTICS_RANGE_DAYS = 30;

export const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Best-effort split of a FAQ item's combined `Content` back into Question/Answer for
// editing. The server only ever stores one combined string (see SaveKnowledgeItem),
// so this is purely a form convenience, not a server-known shape. Falls back to
// putting the whole content in `answer` if it wasn't saved in the "Q: ...\nA: ..."
// shape this app writes (e.g. content edited by some other client).
export const splitFaqContent = (content: string): { question: string; answer: string } => {
  const match = /^Q:\s*([\s\S]*?)\nA:\s*([\s\S]*)$/.exec(content || '');
  if (match) {
    return { question: match[1], answer: match[2] };
  }
  return { question: '', answer: content || '' };
};

export const combineFaqContent = (question: string, answer: string): string => `Q: ${question}\nA: ${answer}`;

export const computeStats = (items: IKnowledgeItem[]): IAiAssistantStats => {
  const activeKnowledgeItems = items.filter((item) => item.isActive).length;
  const totalWordCount = items.reduce((sum, item) => sum + (item.wordCount || 0), 0);
  return {
    activeKnowledgeItems,
    totalKnowledgeItems: items.length,
    totalWordCount,
    status: activeKnowledgeItems >= 1 ? 'ready' : 'notReady',
  };
};
