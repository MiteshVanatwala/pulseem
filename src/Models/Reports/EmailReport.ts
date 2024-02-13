export interface QueryEmailReport {
    Name: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    IncludeTestCampaign: boolean;
}
export interface EmailReport {
    CampaignID: number;
    Name: string;
    Names: string;
    SendDate: Date | string | null;
    FixedSendingDate: Date | string | null;
    TotalSendCompleted: number;
    TotalSendPlan: number;
    OpenCount: number | null;
    OpenCountUnique: number;
    ClickCount: number | null;
    ClickCountUnique: number;
    NotOpened: number | null;
    SendError: number;
    RemovedClients: number;
    GroupsNames: string;
    Status: number;
    Files: number;
    FileNames: string;
    PercentageOpens: number;
    PercetangeClicks: number;
    PercetangeRemovedClients: number;
    Attachments: string;
    TotalBytes: number;
    Subject: string;
    FromName: string;
    FromEmail: string;
    HTML: string;
    AttachCount: number;
    LastEditDate: Date | string | null;
    Revenue: number;
}
export interface EmailDirectReportPage {
    TotalCredits: number;
    TotalRecords: number;
    SMSCredits: number | null;
    BulkEmails: number | null;
    MmsCredits: number | null;
    DirectReport: EmailDirectReport[];
}
export interface EmailDirectReport {
    SendID: number;
    CreatedDate: Date | string | null;
    SendDate: Date | string | null;
    Status: number;
    ToEmail: string;
    ToName: string;
    FromEmail: string;
    FromName: string;
    Subject: string;
    LanguageCode: number;
    AttemptsMade: number;
    ExternalRef: string;
    OpenCount: number;
    ClickCount: number;
    Attachments: string;
    ClientStatus: number;
    StatusDescription: string;
    ErrorData: string;
}
export interface EmailDirectQueryReport {
    UserId: string;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    Status: number | null;
    ToEmail: string;
    ToName: string;
    FromName: string;
    FromEmail: string;
    Subject: string;
    LanguageCode: number | null;
    Reference: string;
    IsOpenCount: boolean | null;
    IsClickCount: boolean | null;
    IsUrlAttached: boolean | null;
    Recipient: string;
    PageIndex: number;
    PageSize: number;

}