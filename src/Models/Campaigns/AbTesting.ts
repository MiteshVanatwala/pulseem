export interface CampaignAbTesting {
    ID: number;
    CreationDate: Date | string;
    Name: string;
    ByClicks: boolean | null;
    ByOpens: boolean | null;
    FutureSendDate: Date | string | null;
    Status: number;
    BestSendDate: Date | string | null;
    Groups: string;
    SubAccountID: number | null;
    LogicalDeleted: boolean | null;
    CampaignsToAbTestings: CampaignsToAbTesting[];
}

export interface CampaignsToAbTesting {
    CampaignAbTestID: number;
    CampaignID: number;
    SendPercents: number | null;
}