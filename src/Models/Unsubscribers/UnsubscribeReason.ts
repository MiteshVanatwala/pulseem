export interface UnsubscribeReason {
    ClientID: number;
    CampaignID: number;
    ReasonID: number;
    ReasonText: string;
    UnsubscribeDate: Date | string;
}