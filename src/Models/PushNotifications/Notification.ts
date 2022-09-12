import { NotificationStatus, E_direction, eSaveResponse, SendType } from "./Enums";
export interface NotificationSendSettings {
    StatusID: NotificationStatus;
    NotificationId: number;
    NotificationGroupId: number;
    SendDate: Date | string | null;
}
export interface NotificationSettings {
    SubAccountId: number;
    PublicKey: string;
    PrivateKey: string;
    ScriptPath: string;
}
export interface NotificationGroups {
    Id: number;
    GroupName: string;
    SubAccountId: number;
    CreatedDate: Date | string;
    UpdateDate: Date | string;
    Members: number;
}
export interface NotificationToGroup {
    NotificationId: number;
    NotificationGroups: number[];
    ScheduleTime: Date | string | null;
    SendType: SendType;
}
export interface Notification extends NotificationSettings {
    ID: number | null;
    TemplateID: number;
    Name: string;
    Title: string;
    Body: string;
    Icon: string;
    Image: string;
    RedirectURL: string;
    Tag: string;
    Direction: E_direction;
    IsRenotify: boolean;
    SendDate: Date | string | null;
    SentCount: number;
    StatusID: NotificationStatus;
    NotificationGroups: NotificationGroups[];
    RedirectButtonText: string;
}
export interface RestoreNotifications {
    IdList: number[];
    SubAccountId: number;
}
export interface NotificationStat {
    ID: number;
    SubAccountId: number;
    Title: string;
    Name: string;
    IsSent: boolean;
    SendDate: Date | string | null;
    IsDeleted: boolean;
    SentCount: number;
    ReceivedCount: number;
    ClickCount: number;
    FailedCount: number | null;
    UnSubscribed: number | null;
    SentDate: Date | string;
    StatusID: NotificationStatus;
    CreatedDate: Date | string;
    UpdatedDate: Date | string;
    HasGroups: boolean;
}
export interface NotificationDesign {
    SubAccountId: number;
    AllowButtonText: string;
    BackgroundColor: string;
    NotAllowButtonText: string;
    Badge: string;
    Icon: string;
    Message: string;
    Position: string;
    OptInShown: boolean;
    OptInExpirationDays: number;
    TextAlign: string;
    TextColor: string;
    Html: string;
}
export interface NotificationEvent {
    ID: number;
    NotificationID: number;
    SubscriberId: number;
    StatusID: NotificationStatus;
    CreatedDate: Date | string;
    IsProcessed: boolean;
    ProcessedDateTime: number;

}
export interface NotificationLog {
    NotificationId: number | null;
    ClientID: number;
    StatusID: number;
    SentDate: Date | string;
    RetryCount: number;
    EndPoint: string;
    ExpirationTime: string;
    P256DH: string;
    Auth: string;
    TTL: number;
}
export interface NotificationForSending {
    NotificationId: number | null;
    ClientID: number;
    StatusID: number;
    SentDate: Date | string;
    RetryCount: number;
    EndPoint: string;
    P256DH: string;
    Auth: string;
    expirationTime: string;
    SubAccountId: number;
    Name: string;
    Title: string;
    Body: string;
    Icon: string;
    Image: string;
    RedirectURL: string;
    Tag: string;
    Direction: E_direction;
    IsRenotify: boolean;
    RedirectButtonText: string;
    PublicKey: string;
    PrivateKey: string;
    TTL: number;
}
export interface CountResponse {
    Count: number;
}
export interface SaveResponse {
    NotifictionId: number;
    ResponseType: eSaveResponse;
    ErrorList: string[];

}