import { NotificationStatus } from "./Enums";
export enum e_eventType {
    Received = 1,
    ClickUrl = 2
}
export interface NotificationClient {
    ID: number;
    endpoint: string;
    keys: ClientKeys;
    expirationTime: string;
    SubAccountId: number;
    TTL: number;
}
export interface ClientKeys {
    p256dh: string;
    auth: string;
}
export interface SendNotification {
    SubAccountId: number;
    NotificationId: number;
}
export interface NotificationClientAction {
    NotificationId: number;
    ClientId: number;
    EventType: NotificationStatus;
}
export interface RegisterClient {
    Subscriber: NotificationClient;
    SubAccountId: number;
    UserAgent: string;
    UserIp: string;
    GroupName: string;
    Unsubscribe: boolean;
    Token: string;
}