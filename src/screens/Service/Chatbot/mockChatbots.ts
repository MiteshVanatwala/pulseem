// Shared helpers for the Chatbot builder. MOCK_WA_TEMPLATES remains a stand-in
// until there's a real "approved WhatsApp templates" endpoint to call - every
// other fixture here was removed once the real ChatbotFlows backend went live.
import { IChatbotFlow, IChatbotListItem, IWhatsAppTemplate } from '../../../Models/Service/Chatbot';

export const MOCK_WA_TEMPLATES: IWhatsAppTemplate[] = [
  { id: 'pricing_info_v2', name: 'pricing_info_v2', variables: ['plan_name'] },
  { id: 'business_hours', name: 'business_hours', variables: [] },
  { id: 'order_status_update', name: 'order_status_update', variables: ['order_id', 'eta'] },
];

const countSteps = (steps: IChatbotFlow['steps']): number =>
  steps.reduce((total, step) => {
    if (step.type === 'condition') {
      const branchSteps = step.branches.reduce((sum, branch) => sum + countSteps(branch.steps), 0);
      return total + 1 + branchSteps + countSteps(step.elseBranch);
    }
    return total + 1;
  }, 0);

export const toListItem = (flow: IChatbotFlow): IChatbotListItem => ({
  id: flow.id,
  name: flow.name,
  trigger: flow.trigger,
  enabled: flow.enabled,
  stepCount: countSteps(flow.steps),
  cooldownEnabled: flow.cooldownEnabled,
  cooldownHours: flow.cooldownHours,
  updatedAt: flow.updatedAt,
});

// New chatbots default to enabled — matches ChatbotLogic.SaveChatbot, which
// enforces this server-side on create regardless of what the client sends.
export const emptyFlow = (): IChatbotFlow => ({
  id: `cb_${Date.now()}`,
  name: '',
  trigger: 'any',
  cooldownEnabled: false,
  cooldownHours: 24,
  enabled: true,
  updatedAt: new Date().toISOString(),
  steps: [],
});
