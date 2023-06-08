import { eSendResult } from "./SmsCampaign";
export interface SendLogData {
    SmsCampaignID: number;
    SubAccountID: number;
    AccountID: number;
    Credits: number;
    TotalRecipients: number;
    new(_credits: number, _recipients: number, _campaignId: number, _subAccountId: number, _accountId: number): SendLogData;
}

export interface SMSLog {
    SMSLogID: number;
    SMSCampaignID: number | null;
    ClientID: number | null;
    ToNumber: string;
    Schedule: Date | string | null;
    Status: number | null;
    ErrorType: number | null;
}
export interface SMSLogFuture {
    SMSLogFutureID: number;
    SMSCampaignID: number;
    ClientID: number;
    Schedule: Date | string;
}
export interface QuickSendResult {
    SmsCampaignId: number;
    Result: eSendResult;
}
