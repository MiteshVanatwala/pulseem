export interface SurveysStatistic {
    ID: number;
    SurveyID: number;
    ClientID: number | null;
    Opens: number;
    Submits: number;
}