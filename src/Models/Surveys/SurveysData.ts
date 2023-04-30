import { SurveysResult } from "./SurveysResult";
export interface SurveysData {
    ID: number;
    SurveyID: number;
    Question: string;
    Answers: string;
    IsRequired: boolean;
    OrderPosition: number;
    SurveysResults: SurveysResult[];
}