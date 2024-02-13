export interface SurveyItem {
    ID: number;
    WebFormID: number;
    CampaignID: number;
    SurveyClientID: number;
    CampaignName: string;
    SurveyFirstName: string;
    SurveyLastName: string;
    SurveyEmail: string;
    SurveyPhone: string;
    Answers: string;
    SurveyCreatedDate: Date | string;

}