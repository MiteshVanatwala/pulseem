export interface SendPlanFuture {
    CampaignID: number;
    ClientID: number;
    AccountID: number;
    Schedule: Date | string;
    Status: number;
    SenderID: number | null;
    AttemptsMade: number | null;
}