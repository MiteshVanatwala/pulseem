export interface SurveysResult {
    ID: number;
    SurveyDataID: number;
    ClientID: number | null;
    Result: string;
    ResultDate: Date | string;
}