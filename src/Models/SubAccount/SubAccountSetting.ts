export interface SubAccountSetting {
    SubAccountID: number | null;
    GeneralAutoReportIsActive: boolean | null;
    GeneralAutoReportSendingPeriod: number | null;
    GeneralAutoReportSendingDay: number | null;
    GeneralAutoReportPermanentSendingHour: number | null;
    GeneralAutoReportNextSendDAte: Date | string | null;
    GeneralAutoReportEmailsToSend: string;
    EmailAutoReportIsActive: boolean | null;
    EmailAutoReportFirstDayTrigger: number | null;
    EmailAutoReportSecondDayTrigger: number | null;
    EmailAutoReportThirdDayTrigger: number | null;
    EmailAutoReportPermanentSendingHour: number | null;
    EmailAutoReportEmailsToSend: string;
    UnsubscribeType: boolean | null;
    UnsubscribePageID: number | null;
    IsSmsImmediateUnsubscribeLink: boolean | null;
    SmsDeliveryPushUrl: string;
    SmsDeliveryPushSmpp: boolean | null;
    IsDirectAccount: boolean | null;
    DomainAddress: string;
    TwoFactorAuthEnabled: boolean | null;
    UnlayerUniqueID: string;
}