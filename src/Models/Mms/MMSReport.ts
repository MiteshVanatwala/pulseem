
export interface MMSReport {
    MmsCampaignID: number;
    Status: number;
    Name: string;
    UpdateDate: Date | string | null;
    SendDate: Date | string | null;
    TotalSendPlan: number;
    CreditsPerMms: number;
    TotalSent: number;
    Success: number;
    Failure: number;
    Removed: number;
    FutureSends: number;
    TotalCredits: number;
}
