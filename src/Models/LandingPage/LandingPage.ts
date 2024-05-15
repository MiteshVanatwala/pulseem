import { WebformsToReportLeadByApi } from "./WebformsToReportLeadByApi";

export interface LandingPageManagement {
    ID: number;
    Name: string;
    Type: number;
    GroupNames: string;
    IsPayment: boolean;
    SurveyCount: number;
    IsDeleted: boolean;
    PageUrl: string;
    PageLink: string;
    Views: number;
    Submits: number;
    IsSurvey: boolean;
}

export interface LandingPageModel {
    ID: number;
    GroupID: number;
    GroupIDs: string[];
    IsClientScript: boolean;
    CmbSelection: string;
    HtmlFileName: string;
    ButtonText: string;
    PageName: string;
    AnswerOption: string;
    AnswerData: string;
    SubmitCounter: number;
    ViewCounter: number;
    ConfirmationText: string;
    Status: number;
    PageHtml: string;
    HasPrefunpage: boolean;
    PrefunImage: string;
    HasComments: boolean;
    PageUrl: string;
    PageType: number;
    AnswerType: number;
    IsResponsive: boolean;
    DownloadUrl: string;
    OfflineDate: string | null;
    OfflineUrl: string;
    HtmlToEdit: string;
    HtmlFile: string;
    BaseLanguage: number;
    IsTemplate: boolean | null;
    CategoryID: number | null;
    IsUpdate: boolean;
    IsAccessibility: boolean;
    TerminalNumber: string;
    APIUserName: string;
    DepartmentId: number | null;
    LinkPreviewTitle: string;
    LinkPreviewIcon: any;
    LinkPreviewIconName: string;
    LinkPreviewDescription: string;
    LinkPreviewIconExtrnalURL: string;
    IsPreviewIconFromExtrnalURL: boolean;
    EmailsToReport: string[] | never | null | any;
    SplitRegistrations: boolean;
    DoubleOptin: boolean;
    SubscriptionsLimit: number | null;
    Systems: string[] | null | any;
    FacebookPageID: string;
    FacebookPrefunPage: boolean;
    FacebookPrefunImage: string;
    FacebookComments: boolean;
    ClientJavaScript: string;
    ClientBodyScript: string;
    ClientHtmlCode: string;
    ClientCssStyle: string;
    PageTitle: string;
    MetaDescription: string;
    MetaKeywords: string;
    GoogleAnalyticsCode: string;
    GoogleConvertionCode: string;
    GoogleTagManagerCode: string;
    FacebookPixelCode: string;
    IsNewEditor: boolean | any | never;
    WebformsToReportLeadByApi: WebformsToReportLeadByApi[] | any | never;
}

export interface BeeEditorModel {
    classes: any;
}

export interface BeeEditorStoreModel {
    landingPage: any;
    landingPageUserBlocks: LandingPageUserBlocks[];
    ToastMessages: [];
    LPBeeToken: any;
    publicTemplates: [];
    templatesBySubAccount: []
}

export interface LPBeeTokenModel {

}

export interface LandingPageUserBlocks {
    uuid: string;
    category: string;
    data: string;
    tags: string[];
}

export interface LandingPageRow {
    name: string;
    value: string;
    handle: string;
    isLocal: boolean;
    behaviors: LandingPageRowBehaviour;
}

export interface LandingPageRowBehaviour {
    canEdit: boolean;
    canDelete: boolean;
}

export interface SaveLandingPageArguments {
    HtmlData: string;
    JsonData: string;
    campaignId: number;
    isPublish: boolean;
}

export interface LandingPageTemplate {
    Category: string;
    CreationDate: string;
    Html: string;
    ID: number;
    IsDeleted: boolean;
    JsonData?: string;
    Name: string;
    SubAccountId: number;
    Thumbnail?: string;
}

export enum FormTypes {
    WebForm = 1,
    StaticPage = 2,
    HtmlPage = 3,
    Popup = 4
}

export enum PageStatus {
    Hidden = 1,
    Active = 2,
    Deleted = 3,
    Pending = 4
}

export enum AnswerOption {
    SystemDefault = 1,
    PopupMessage = 2,
    Redirect = 3,
    Download = 4,
    None = 5
}

export enum PageLanguage {
    Hebrew = 0,
    English = 1,
    French = 2,
    Spanish = 3,
    German = 4,
    Russian = 5,
    Japanese = 6,
    Romanian = 7,
    Arabic = 8,
    Hungary = 9,
    Slovak = 10,
    Portuguese = 11,
    Dutch = 12,
    Unicode = 13
}