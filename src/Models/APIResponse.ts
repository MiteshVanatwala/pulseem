import { LandingPageModel } from "./LandingPage/LandingPage";

export interface PulseemResponse {
    StatusCode: number;
    Message: string;
    Data: LandingPageModel;
}