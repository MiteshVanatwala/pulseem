import { useSelector } from 'react-redux';
import { PlanTier, IServicePlanLimits, SERVICE_PLAN_LIMITS } from '../config/servicePlanLimits';

// currentPlan (from TiersSlice.getCurrentPlan) is the raw AccountCategoryFeatureTier
// shape - Id/Name/Price/etc, no .tier string field - so tier is derived from planId
// instead. Same 4-tier ID mapping already used elsewhere in the app (TIER_PLANS,
// FeatureTier_GetAvailablePlans): 1 Starter, 2 Flow/Standard, 3 Engage/Pro, 4 Scale.
const PLAN_ID_TO_TIER: Record<number, PlanTier> = {
  1: 'starter',
  2: 'standard',
  3: 'pro',
  4: 'scale',
};

export const useServicePlanLimits = () => {
  const { currentPlan, serviceLimits } = useSelector((state: any) => state.tiers);

  const planId: number | null = serviceLimits?.planId ?? currentPlan?.Id ?? null;
  const tier: PlanTier = (planId != null && PLAN_ID_TO_TIER[planId]) || 'starter';
  const fallback = SERVICE_PLAN_LIMITS[tier];

  // Real backend-resolved limits (GetAccountLimits, includes enterprise overrides)
  // win once loaded - the hardcoded SERVICE_PLAN_LIMITS is only ever the fallback
  // while that hasn't loaded/failed, per servicePlanLimits.ts's own note.
  const backendLimits = serviceLimits?.limits;
  const limits: IServicePlanLimits = backendLimits
    ? {
        maxAgents: backendLimits.maxServiceAgents,
        maxChatbots: backendLimits.maxChatbots,
        aiAssistantEnabled: backendLimits.aiAssistantEnabled,
        maxAIContextLength: backendLimits.maxAiContextWords,
        monthlyMessageVolume: backendLimits.monthlyMessageVolume,
      }
    : fallback;

  const isAtLimit = (type: keyof IServicePlanLimits, currentCount: number): boolean => {
    const max = limits[type] as number;
    return max !== -1 && currentCount >= max;
  };

  return { limits, tier, isAtLimit };
};
