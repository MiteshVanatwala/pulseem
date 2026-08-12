// Preview mock for the Chatbot builder. Used only while chatbotSlice's USE_MOCK
// flag is true — re-added so front-end work can continue while the real
// ChatbotFlows backend deploy (CORS fix in ChatbotController.cs) is pending.
// Flip USE_MOCK back to false once that's confirmed live.
import {
  IChatbotFlow,
  IChatbotListItem,
  IChatbotTierLimit,
  IWhatsAppTemplate,
} from '../../../Models/Service/Chatbot';

export const MOCK_WA_TEMPLATES: IWhatsAppTemplate[] = [
  { id: 'pricing_info_v2', name: 'pricing_info_v2', variables: ['plan_name'] },
  { id: 'business_hours', name: 'business_hours', variables: [] },
  { id: 'order_status_update', name: 'order_status_update', variables: ['order_id', 'eta'] },
];

export const MOCK_TIER_LIMIT: IChatbotTierLimit = {
  limit: 5,
  used: 3,
  planName: 'Standard',
};

const businessHoursGreeting: IChatbotFlow = {
  id: 'cb_business_hours',
  name: 'Business hours greeting',
  trigger: 'any',
  cooldownEnabled: false,
  cooldownHours: 24,
  enabled: true,
  updatedAt: '2026-08-04T09:12:00.000Z',
  steps: [
    {
      id: 'step_1',
      type: 'condition',
      operator: 'contains',
      branches: [
        {
          id: 'step_1_b1',
          keyword: 'hours',
          steps: [
            {
              id: 'step_1a',
              type: 'action',
              actionType: 'send_widget',
              payload: { text: "We're open Mon-Fri, 9am-6pm. A team member will reply as soon as we're back online." },
            },
          ],
        },
      ],
      elseBranch: [
        {
          id: 'step_1b',
          type: 'action',
          actionType: 'send_widget',
          payload: { text: 'Thanks for reaching out — a team member will be with you shortly.' },
        },
      ],
    },
  ],
};

const pricingFaq: IChatbotFlow = {
  id: 'cb_pricing_faq',
  name: 'Pricing FAQ',
  trigger: 'whatsapp',
  cooldownEnabled: true,
  cooldownHours: 24,
  enabled: true,
  updatedAt: '2026-07-30T14:40:00.000Z',
  steps: [
    {
      id: 'step_1',
      type: 'condition',
      operator: 'contains',
      branches: [
        {
          id: 'step_1_b1',
          keyword: 'price',
          steps: [
            {
              id: 'step_1a',
              type: 'action',
              actionType: 'send_wa_template',
              payload: { templateId: 'pricing_info_v2', variables: { plan_name: 'Standard' } },
            },
          ],
        },
        {
          id: 'step_1_b2',
          keyword: 'cancel',
          steps: [
            {
              id: 'step_1b',
              type: 'action',
              actionType: 'send_wa_chat',
              payload: { text: "Sorry to see you go — I'm connecting you with a team member to help with cancellation." },
            },
          ],
        },
      ],
      elseBranch: [
        {
          id: 'step_1c',
          type: 'action',
          actionType: 'send_widget',
          payload: { text: 'Let me connect you with a team member who can help.' },
        },
      ],
    },
  ],
};

const websiteWelcome: IChatbotFlow = {
  id: 'cb_website_welcome',
  name: 'Website welcome',
  trigger: 'widget',
  cooldownEnabled: false,
  cooldownHours: 24,
  enabled: false,
  updatedAt: '2026-07-12T11:05:00.000Z',
  steps: [
    {
      id: 'step_1',
      type: 'action',
      actionType: 'send_widget',
      payload: { text: 'Hi! Welcome to Pulseem — how can we help today?' },
    },
  ],
};

export const MOCK_CHATBOT_FLOWS: Record<string, IChatbotFlow> = {
  [businessHoursGreeting.id]: businessHoursGreeting,
  [pricingFaq.id]: pricingFaq,
  [websiteWelcome.id]: websiteWelcome,
};

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

export const MOCK_CHATBOTS: IChatbotListItem[] = Object.values(MOCK_CHATBOT_FLOWS).map(toListItem);

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
