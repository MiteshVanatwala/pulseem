export interface CampaignLinkClickedLog {
    LinkID: number;
    ClientID: number;
    CampaingID: number;
    ClickCount: number | null;
    ClickDate: Date | string | null;
}