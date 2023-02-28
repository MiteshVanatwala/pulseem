import { FileGallery } from '../Files/FileGallery';

export interface NewsletterInfo extends CampaignsAttachments {
    IsViaAutomation: boolean | null;
    AutomationNodeToEdit: string;
    CampaignID: number | null;
    SubAccountID: number;
    Name: string;
    Subject: string;
    PreviewText: string;
    FromName: string;
    FromEmail: string;
    WebViewLocation: number;
    PrintLocation: number;
    UnsubscribeLocation: number;
    UpdateClient: number;
    LanguageCode: number;
    FacebookShare: boolean;
    TwitterShare: boolean;
    GoogleAnalytics: boolean;
    IsResponsive: boolean;
    HtmlToEdit: string;
    HtmlToSend: string;
    IsTemplate: boolean;
    IsConversion: boolean;
    IsFirstCampaign: boolean;
    IsAutoResponder: boolean;
    AutomationID: number | null;
    DomainAddress: string;
    EmailUnalyer: boolean;
    new(): NewsletterInfo;
    FilesProperties: FileGallery[];
}
export interface CampaignsAttachments {
    Files: string[];
    FileNames: string;
    TotalBytes: number;
    TotalCost: number;
}

export enum Language {
    Hebrew = 0,
    English,
    French,
    Spanish,
    German,
    Russian,
    Japanese,
    Romanian,
    Arabic,
    Hungary,
    Slovak,
    Portuguese,
    Dutch
}