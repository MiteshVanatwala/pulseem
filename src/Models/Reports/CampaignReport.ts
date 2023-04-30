export interface CampaignReport {
    PageID: number;
    FormName: string;
    Views: number;
    Submits: number;
    Group: number;
    GroupNames: string;
    PageLink: string;
    PageUrl: string;
    EditLink: string;
    Status: number;
    Version: number;
    Type: number;
    TypeName: string;
    SurveyData: string;
    IsSurvey: boolean;
    UpdatedDate: string;
    IsPayment: boolean;
    SurveyCount: number;
    ContainDiscount: number;
    new(): CampaignReport;
}