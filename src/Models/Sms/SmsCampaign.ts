import { SMSLog } from './SmsLog';
import { Client } from '../Clients/Client';
import { SMSLogFuture, SendLogData } from './SmsLog';
import { TotalSmsMarketing } from './TotalSmsMarketing';
import { SmsCampaignToGroup } from './SmsCampaignToGroup';
import { SmsCampaignsToAbTesting } from './SmsCampaignsToAbTesting';
import { AutomationNodesSMSCampaignMapper } from './AutomationNodesSMSCampaignMapper';

export interface SmsCampaign {
    SMSCampaignID: number;
    SubAccountID: number;
    Status: number;
    Name: string;
    Type: number | null;
    SendingMethod: number | null;
    SendPlanID: number | null;
    AutoSendDelay: number | null;
    AutoSendTime: Date | string | null;
    FromNumber: string;
    UpdateDate: Date | string | null;
    SendDate: Date | string | null;
    Text: string;
    Link: string;
    Parts: number | null;
    LogicalDeleted: boolean | null;
    IsTestCampaign: boolean | null;
    TotalSendPlan: number | null;
    CreditsPerSms: number | null;
    IsResponse: boolean;
    Encoding: string;
    ClicksCount: number | null;
    UniqueClicksCount: number | null;
    IsLinksStatistics: boolean | null;
    ResponseToEmail: string;
    SMSCampaignsToGroups: SmsCampaignToGroup[];
    SMSLogFutures: SMSLogFuture[];
    SMSLogs: SMSLog[];
    TotalSmsMarketings: TotalSmsMarketing[];
    SMSCampaignsToAbTestings: SmsCampaignsToAbTesting[];
    AutomationNodesSMSCampaignMappers: AutomationNodesSMSCampaignMapper[];
}
export interface QuickSendObject extends SmsCampaign {
    PhoneNumber: string;
    SmsCount: number;
    MessageLength: number;
    IsTest: boolean;
    TestGroupsIds: number[];
    LogData: SendLogData;
}
export interface CheckSmsCredit {
    Text: string;
    SmsLength: number | null;
}
export interface SmsResponse extends Client {
    ReplyDate: Date | string | null;
    ReplyText: string;
}
export enum eSendResult {
    ALREADY_SENT = -2,
    ERROR = -1,
    SUCCESS = 0,
    PROVISION = 1,
    NO_CREDITS = 2,
    INVALID_NUMBER = 3,
    OTP_NEEDED = 4,
    ACCEPTED = 5
}
export enum SmsCountry {
    Global = 0,
    Israel = 1,
    Mexico = 2
}