export interface CampaignsReportSendPlan {
    CampaignId: number;
    ReportSendDate: Date | string;
    ReportActualSentDate: Date | string | null;
    Status: number;
}