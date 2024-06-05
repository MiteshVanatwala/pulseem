export enum E_direction {
    ltr = 1,
    rtl = 2
}
export enum NotificationStatus {
    Created = 0,
    Deleted = 1,
    Pending = 2,
    Sending = 3,
    Sent = 4,
    Scheduled = 5,
    Received = 6,
    Failed = 7,
    UnSubscribed = 8,
    Subscribed = 9,
    Click = 10,
    Canceled = 11
}

export enum TimeType {
    Minutes = 1,
    Hours = 2
}
export enum SendType {
    Immediate = 1,
    Future = 2,
    Special = 3
}
export enum PulseType {
    Percentage = 1,
    Recipients = 2
}

export enum TypeTable {
    Type_SubscriberEventReceived,
    Type_SubscriberEventClick
}
export enum eSaveResponse {
    ERROR = -1,
    SUCCESS = 0
}
export enum eResponseType {
    ERROR = -1,
    SUCCESS = 0,
    UNAUTHORIZED = 401
}

export enum EmailTemplateType {
    PULSEEM_TEMPLATES = 0,
    MY_TEMPLATES = 1
}

export enum DynamicProductLink {
    LATEST_PURCHASE = 'https://dynamicProduct.com?Purchase',
    LATEST_ABANDONMENT = 'https://dynamicProduct.com?Abandonment',
}