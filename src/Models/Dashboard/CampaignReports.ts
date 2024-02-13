import { eReportSection } from './RecipientsReport';

export interface CampaignReports {
    CampaignID: number;
    ReportSection: eReportSection;
    CampaignName: string;
    Opens: number;
    Clicks: number;
    Errors: number;
    Removed: number;
    DLR: number;
    TotalSendPlan: number;
    Quality: number;
    SendDate: Date | string;
    UpdatedDate: Date | string;
}
