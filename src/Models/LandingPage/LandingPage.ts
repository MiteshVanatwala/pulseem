
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
