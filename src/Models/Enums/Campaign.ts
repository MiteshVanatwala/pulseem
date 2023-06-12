
export enum eCampaignType {
    Campaigns = 1, // Known as Email as well
    SMSCampaigns = 2,
    WebForms = 3,
    AbTest = 4,
    SendPlan = 5,
    Account = 6
}

export enum eCampaignStatus {
    Null = 0,
    Created = 1,
    Sending = 2,
    Stopped = 3,
    Finished = 4,
    Canceled = 5,
    OptinPending = 6,
    ApprovePending = 7,
}

export enum eWebFormStatus {
    Hidden = 1,
    Active = 2,
    Deleted = 3,
    Pending = 4
}
export enum eLanguageCodesEnum {
    Hebrew = 0,
    English = 1,
    French = 2,
    Spanish = 3,
    German = 4,
    Russian = 5,
    Japanese = 6,
    Romanian = 7,
    Arabic = 8,
    Hungary = 9,
    Slovak = 10,
    Portuguese = 11,
    Dutch = 12
}
