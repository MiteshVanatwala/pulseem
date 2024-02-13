import { CampaignLinkClickedLog } from "./CampaignLinkClickedLog";
export interface CampaignLink {
    LinkID: number;
    CampaingID: number;
    Url: string;
    SmartLinkData: string;
    SmartLinkStatus: number | null;
    CampaignLinkClickedLogs: CampaignLinkClickedLog[];
}