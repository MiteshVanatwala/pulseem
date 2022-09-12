export interface CampaignSendingLog {
    CampaignID: number;
    RecipientID: number;
    TimeStamp: Date | string | null;
    OpeningCount: number | null;
    OpeningDate: Date | string | null;
    ErrorType: number | null;
    ErrorData: string;
}