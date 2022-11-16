import { CampaignToPage } from "../Campaigns/CampaignToPage";
export interface UserSocialToken {
    SubAccountID: number;
    NetworkID: number;
    IsGlobal: boolean;
    CreationDate: Date | string;
    TokenValue: string;
    TokenValidTime: number | null;
    TokenSecret: string;
    Status: number;
}

export interface UserSocialPage {
    ID: number;
    NetworkPageID: string;
    SubAccountID: number;
    NetworkID: number;
    Name: string;
    Token: string;
    IsGlobalShare: boolean;
    CampaignToPages: CampaignToPage[];
}

export interface AccountSocialSetting {
    SubAccountID: number;
    NetworkID: number;
    Url: string;
}