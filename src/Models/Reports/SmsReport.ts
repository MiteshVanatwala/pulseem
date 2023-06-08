import { eSmsStatus } from '../Enums/Sms';
export interface SmsReport {
    SMSCampaignID: number;
    Status: number;
    Name: string;
    Type: number;
    UpdateDate: Date | string | null;
    SendDate: Date | string | null;
    ClicksCount: number | null;
    UniqueClicksCount: number;
    TotalSendPlan: number;
    CreditsPerSms: number;
    IsResponse: boolean;
    totalSent: number;
    success: number;
    failure: number;
    removed: number;
    replies: number;
    futureSends: number;
    Revenue: number;
}
export interface SmsDirectQueryReport {
    UserId: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    Status: number | null;
    FromNumber: string;
    ToNumber: string;
    ToName: string;
    Text: string;
    Reference: string;
    ErrorType: number;
    ResponseType: number | null;
    PageIndex: number;
    PageSize: number;
    ShowContent: boolean;
}
export interface SmsDirectReportPage {

    TotalSent: number;
    TotalCredits: number;
    SMSCredits: number | null;
    BulkEmails: number | null;
    MmsCredits: number | null;
    DirectReport: SmsDirectReport[];
}
export interface SmsDirectReport {
    PID: number;
    SMSCampaignID: number;
    DATE: Date | string;
    FROM: string;
    TO: string;
    REFERENCE: string;
    STATUS: eSmsStatus;
    MESSAGE: string;
    ERRORCODE: number;
    RESPONSEENABLE: number;
    TOTALRESPONSES: number;
    CHARSCOUNT: number;
    ERRORTYPE: number;
    Credits: number;
    ClientStatus: number;
}

export interface SmsReportQuery {
    SubAccountId: number;
    SerachTxt: string;
    From: Date | string | null;
    To: Date | string | null;
    ShowTestCampaigns: boolean;
    SmsCampaignID: number | null;
}