import { MmsDirectLog } from '../Mms/MmsDirectLog';
import { SMSDirectLog } from '../Sms/SMSDirectLog';
import { SMSDirectRemoval } from '../Sms/SMSDirectRemoval';

export interface DirectAccountModel {
    ID: number;
    ReferrerID: number;
    AccountID: number | null;
    SMSPriceListID: number | null;
    CompanyName: string;
    ContactName: string;
    Telephone: string;
    Email: string;
    UserID: string;
    Password: string;
    ShowDeliveredBy: boolean;
    ShowRemoveLink: boolean;
    SMSCredits: number | null;
    BulkEmails: number | null;
    FixedSMSPrice: number;
    Provider: number | null;
    StatisticsType: number;
    LastSMSBulkBought: number | null;
    LastEmailBulkBought: number | null;
    TotalSMSCredits: number | null;
    PaymentPerKB: number | null;
    SmsLength: number | null;
    MmsCredits: number | null;
    MmsProvider: number | null;
    LastMMSBulkBought: number | null;
    SmsDeliveryPushUrl: string;
    SmsDeliveryPushSmpp: boolean;
    SubAccountId: number | null;
    SenderId: number | null;
    MmsDirectLogs: MmsDirectLog[];
    SMSDirectLogs: SMSDirectLog[];
    SMSDirectRemovals: SMSDirectRemoval[];
}