export interface WhatsappInboundMessages {
    Id: number;
    SubAccountId: number;
    FromNumber: string;
    ToNumber: string;
    SendDate: Date | string | null;
    SendLogId: number;
    MediaUrl: string;
    TextMessage: string;
}

export interface WhatsappInboundRequest extends WhatsappInboundMessages {
    PageIndex: number | null;
    PageSize: number | null;
    FromDate: Date | string | null;
    ToDate: Date | string | null;
    IsExport: boolean;
}


export interface WhatsappDirectReportResponse {
    ID: number;
    Schedule: Date | string;
    FromNumber: string;
    ToNumber: string;
    Status: number;
    ErrorMessage: string;
    Credits: number;
    Text: string;
    TextObject: string;
    ReferenceId: string;
    TemplateTypeId: number;
    TemplateVariables: string;
    ContentTypeId: eWhatsappContentType;
}

export enum eWhatsappContentType {
    Default = 0,
    Text = 1,
    Media = 2,
    QuickReply = 3,
    CallToAction = 4,
    Card = 5
}