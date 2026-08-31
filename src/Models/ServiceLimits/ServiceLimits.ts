export interface IServiceLimits {
    maxServiceAgents: number;
    maxChatbots: number;
    aiAssistantEnabled: boolean;
    maxAiContextWords: number;
    monthlyMessageVolume: number;
}

export interface IServiceUsage {
    serviceAgents: number;
}

export interface IAccountLimitsData {
    planId: number;
    limits: IServiceLimits;
    usage: IServiceUsage;
    source: string;
}

export interface IServiceLimitRejectionData {
    Reason: string;
    Limit: number;
    Current: number;
}
