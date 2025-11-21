export type ReportStateType = {
    showContent: Boolean;
    productsReportDetails: Array<any>;
    productCategories: Array<any>;
    exportPRData: Array<any>;
    responsesReportDetails: Array<any>;
    TotalResponses: number;
};

export type CoreStateType = {
    language: "he" | "en";
    isRTL: boolean;
    windowSize: "xs" | "sm" | "md" | "lg" | "xl";
    basename: String;
    email: String;
    phone: String;
    imageURL: String;
    isWhiteLabel: false;
    companyName: String;
    rowsPerPage: number;
    isClal: Boolean;
    accountFeatures: any;
    cameFromSubAccount: boolean | null;
    isAdmin: boolean | null;
    isAllowSwitchAccount: boolean | null;
    billingTypeId: String | null;
    accountSettings: any;
    userRoles: any;
};

export interface Message {
    MessageID: string;
    MessageText: string;
    MessageHTML?: string;
    MessageTimestamp: string;
    MessageTypeID: number;
  }

export interface AiChatState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    totalMessagesForUserCount: number;
    aiIconStatus: number;
}

export type StateType = {
    core: CoreStateType;
    user: any;
    newsletter: any;
    landingPages: any;
    mms: any;
    automations: any;
    notification: any;
    sms: any;
    dashboard: any;
    recipientReports: any;
    shortcuts: any;
    payment: any;
    common: any;
    client: any;
    campaignEditor: any;
    siteTracking: any;
    group: any;
    report: ReportStateType;
    gallery: any;
    connectors: any;
    accountSettings: any;
    whatsapp: any;
    product: any;
    extraFields: any;
    affiliates: any;
    amp: any;
    companyName?: string;
    billing: any;
    linksClicksReportSlice: any;
    aiChat: AiChatState;
    Ai: any;
};
