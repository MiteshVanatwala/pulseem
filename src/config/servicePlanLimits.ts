export type PlanTier = 'starter' | 'standard' | 'pro' | 'scale';

export interface IServicePlanLimits {
  maxAgents: number; // max users with Service permission
  maxChatbots: number;
  aiAssistantEnabled: boolean;
  maxAIContextLength: number; // words
  monthlyMessageVolume: number; // -1 = unlimited
}

// Placeholder values — to be filled in by product team
export const SERVICE_PLAN_LIMITS: Record<PlanTier, IServicePlanLimits> = {
  starter: { maxAgents: 1, maxChatbots: 1, aiAssistantEnabled: false, maxAIContextLength: 0, monthlyMessageVolume: 500 },
  standard: { maxAgents: 3, maxChatbots: 3, aiAssistantEnabled: false, maxAIContextLength: 0, monthlyMessageVolume: 2000 },
  pro: { maxAgents: 10, maxChatbots: 10, aiAssistantEnabled: true, maxAIContextLength: 2000, monthlyMessageVolume: 10000 },
  scale: { maxAgents: -1, maxChatbots: -1, aiAssistantEnabled: true, maxAIContextLength: 5000, monthlyMessageVolume: -1 },
  // -1 = unlimited
};

// Note: Store limits in a config that can be fetched from the backoffice API for
// enterprise overrides. The hardcoded object above is the default fallback.
