import { eResponseType } from "./Enums";
export interface NotificationResult {
    IsSent: boolean;
    SentCount: number;
}
export interface HttpResult {
    IsOk: boolean;
    Message: string;
}
export interface NotificationDesignResult {
    Html: string;
    OptInShown: boolean;
    OptInExpirationDays: number;
    Message: string;
    AllowButtonText: string;
    NotAllowButtonText: string;
}
export interface HttpResponse {
    Message: string;
    ResponseType: eResponseType;
}
export interface SubscriberStatus {
    SubAccountId: number;
    SubAccountName: string;
    LoginUserName: string;
    Subscribers: number;
    UnSubscribers: number;
}
export interface SubscribersSummary {
    TotalSubscribers: number;
    TotalUnSubscribers: number;
}