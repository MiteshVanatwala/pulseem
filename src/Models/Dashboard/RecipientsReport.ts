
export interface RecipientsReport {
    ReportSection: eReportSection;
    Active: number;
    Error: number;
    Removed: number;
    Total: number;
    Quality: number;
    PendingEmails: number;
    PendingSms: number;

}

export enum eReportSection {
    NEWSLETTER = 0,
    SMS = 1,
    NOTIFICATIONS = 2
}
