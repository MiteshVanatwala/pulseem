// Data model for the Service "Chatbot" builder (PR-3179, Phase 3).
// Steps are stored as a nested tree client-side, persisted verbatim as JSON by
// the backend (dbo.ChatbotFlows.StepsJson) - see chatbotSlice.ts / ChatbotLogic.cs.
import { ConversationChannel } from './Conversation';

export type ChatbotTrigger = 'any' | ConversationChannel; // 'any' | 'widget' | 'whatsapp'
export type ConditionOperator = 'contains' | 'equals';
export type ChatbotActionType = 'send_wa_template' | 'send_wa_chat' | 'send_widget' | 'send_webhook';

export interface IWhatsAppTemplate {
  id: string;
  name: string;
  variables: string[]; // placeholder names, e.g. ['plan_name']
}

export interface ISendWaTemplatePayload {
  templateId: string;
  variables: Record<string, string>;
}

export interface ISendTextPayload {
  text: string;
}

export interface ISendWebhookPayload {
  url: string;
}

export interface IActionStep {
  id: string;
  type: 'action';
  actionType: ChatbotActionType;
  payload: ISendWaTemplatePayload | ISendTextPayload | ISendWebhookPayload | Record<string, any>;
}

// One keyword outcome path off a condition step. A step can carry more than one of
// these (multi-branch), plus the always-present elseBranch on IConditionStep below.
export interface IConditionBranch {
  id: string;
  keyword: string;
  steps: IFlowStep[];
}

export interface IConditionStep {
  id: string;
  type: 'condition';
  operator: ConditionOperator;
  branches: IConditionBranch[]; // evaluated in order, first match wins
  elseBranch: IFlowStep[]; // fallback when no branch's keyword matches
}

// A step is either a condition (which fans out into match branches + an else branch,
// each holding their own nested steps) or a terminal-looking action that can still be
// followed by another step in the same sequence — see IChatbotFlow.steps.
export type IFlowStep = IConditionStep | IActionStep;

export interface IChatbotFlow {
  id: string;
  name: string;
  trigger: ChatbotTrigger;
  cooldownEnabled: boolean;
  cooldownHours: number;
  enabled: boolean;
  steps: IFlowStep[];
  updatedAt: string;
}

// Lightweight shape for the list screen — avoids shipping every flow's full step tree.
export interface IChatbotListItem {
  id: string;
  name: string;
  trigger: ChatbotTrigger;
  enabled: boolean;
  stepCount: number;
  cooldownEnabled: boolean;
  cooldownHours: number;
  updatedAt: string;
}

export interface IChatbotTierLimit {
  planName: string;
}
