import { Client } from "../Clients/Client";

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
    Client: Client;
    data: ItemAnswers;
}
export interface ItemAnswers {
    new(): ItemAnswers;
    Answers: string[];
}