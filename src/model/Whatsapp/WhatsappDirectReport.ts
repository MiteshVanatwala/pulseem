export interface WhatsappDirectReportRequest {
    SubAccountId: number | null;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    Text: string;
    FromNumber: string;
    ToNumber: string;
    Status: number | null;
    ExternalRef: string;
    IsDirectSendAPI: boolean | null;
    PageIndex: number | null;
    PageSize: number | null;
    IsExport: boolean | null;
}