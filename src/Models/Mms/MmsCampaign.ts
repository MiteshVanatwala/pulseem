import { MmsLog, MmsLogFuture } from "./MmsLog";


export interface MmsCampaign {
    MmsCampaignID: number;
    SubAccountID: number;
    Status: number;
    Name: string;
    SendingMethod: number | null;
    SendPlanID: number | null;
    AutoSendDelay: number | null;
    AutoSendTime: Date | string | null;
    FromNumber: string;
    UpdateDate: Date | string;
    SendDate: Date | string | null;
    Text: string;
    NavigateUrl: string;
    Links: string;
    LogicalDeleted: boolean;
    IsTestCampaign: boolean;
    TotalSendPlan: number | null;
    CreditsPerMms: number;
    IsUnsubscribe: boolean | null;
    MmsCampaignNotToGroups: MmsCampaignGroup[];
    MmsCampaignsToGroups: MmsCampaignGroup[];
    MmsCampaignsNotToSends: MmsCampaignsNotToSend[];
    MmsLogs: MmsLog[];
    MmsLogFutures: MmsLogFuture[];
}
export interface MMSPreview {
    MmsCampaignID: number;
    Name: string;
    FromNumber: string;
    Text: string;
    NavigateUrl: string;
    Links: string;
    IsTestCampaign: boolean;
}

export interface MmsCampaignsNotToSend {
    MainMmsCampaignId: number;
    MmsCampaignId: number;
}


export interface MmsCampaignGroup {
    MmsCampaignId: number;
    GroupId: number;
}
