
export interface LandingPage {
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
    GroupIDs: string;
    IsClientScript: boolean;
    cmbSelection: string;
    HtmlFileName: string;
    ButtonText: string;
    FromName: string;
    AnswerOption: string;
    AnswerData: string;
    SubmitCounter: number;
    ViewCounter: number;
    ConfirmationText: string;
    Status: boolean;
    EmailsToReport: string;
    PageHtml: string;
    FacebookPageID: string;
    HasPrefunpage: boolean;
    PrefunImage: string;
    HasComments: boolean;
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
    campaignId: number
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