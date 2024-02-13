import { CampaignNotToSendTo } from './CampaignNotToSendTo';
import { CampaignToGroup } from './CampaignToGroup';
import { CampaignSendingLog } from './CampaignSendingLog';
import { CampaignsToAbTesting } from './AbTesting';
import { CampaignToPage } from './CampaignToPage';
import { CampaignFeature } from './CampaignFeature';
import { CampaignLinkClickedLog } from './CampaignLinkClickedLog';
import { SendPlan } from '../SendPlans/SendPlan';
import { SendPlanFuture } from '../SendPlans/SendPlanFuture';
import { CampaignsReportSendPlan } from '../SendPlans/CampaignsReportSendPlan';
import { TotalSmsMarketing } from '../Sms/TotalSmsMarketing';
import { UnsubscribeReason } from '../Unsubscribers/UnsubscribeReason';
import { ClientEmailStatus } from '../Clients/Client';

export enum Feature {
    Facebook = 1,
    GooglePlus,
    LinkedIn,
    Twitter,
    GoogleAnalytics,
    Responsive
}
export interface Campaign {
    CampaignLinks: string[];
    CampaignID: number;
    SubAccountID: number;
    Name: string;
    Status: number;
    SendTimingMethod: number | null;
    FixedSendingDate: Date | string | null;
    AutoSendingByUserField: number | null;
    TotalSendPlan: number | null;
    TotalSendCompleted: number | null;
    LastEditDate: Date | string | null;
    AutoSendDelay: number | null;
    AutoSendTime: Date | string | null;
    SendPlanID: number | null;
    HTML: string;
    HTMLtoSend: string;
    FromEmail: string;
    FromName: string;
    Subject: string;
    CampaignToClientNotSentFor: number | null;
    SendDate: Date | string | null;
    LanguageCode: number | null;
    PrintLinkPosition: number | null;
    ClickHereToSeeLinkPosition: number | null;
    RemoveClientLinkPosition: number | null;
    UpdateClientInfoPosition: number | null;
    IsTestCampaign: boolean | null;
    IsTemplate: boolean | null;
    CategoryID: number | null;
    LogicalDeleted: boolean | null;
    RemovedClients: number | null;
    IsShared: boolean | null;
    PreviewText: string;
    IsBestTime: boolean | null;
    BestTimeLastEmail: Date | string | null;
    IsConversion: boolean | null;
    CampaignNotToSendTos: CampaignNotToSendTo[];
    CampaignsNotToGroups: CampaignToGroup[];
    CampaignsToGroups: CampaignToGroup[];
    SendPlans: SendPlan[];
    CampaignSendingLogs: CampaignSendingLog[];
    SendPlanFutures: SendPlanFuture[];
    CampaignsToAbTestings: CampaignsToAbTesting[];
    CampaignToPages: CampaignToPage[];
    CampaignFeatures: CampaignFeature[];
    TotalSmsMarketings: TotalSmsMarketing[];
    CampaignsReportSendPlans: CampaignsReportSendPlan[];
    UnsubscribeReasons: UnsubscribeReason[];
    CampaignLinkClickedLogs: CampaignLinkClickedLog[];
    EncryptURL: string;
}

export interface CampaignHtml {
    HTML: string;
    HTMLtoSend: string;
    LanguageCode: number;
    Name: string;
}

export interface CampaignEditorData extends Campaign {
    JsonData: string;
    HtmlData: string;
    Blocks: string[];
}
export interface TestSendRequest {
    SubAccountID: number;
    CampaignID: number;
    Language: string;
    Emails: string;
    GroupIds: number[];
}
export interface TestSendResponse {
    StatusCode: number;
    Message: string;
    Summary: ClientEmailStatus[];
}