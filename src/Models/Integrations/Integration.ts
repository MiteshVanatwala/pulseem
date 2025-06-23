export interface IntegrationRequest {
    SubAccountID?: number;
    IntegrationSource: LU_Plugin;
    JsonData: string;
}

export enum LU_Plugin {
    CashCow = 1,
    Shopify = 2,
    Isracard = 3,
    EShop = 5,
    Klaviyo = 10
}
export enum LU_PluginGroupType {
    PURCHASED = 1,
    REGISTERED = 2,
    ABANDONED = 3
}

export interface IsracardModel {
    ID?: string;
    SubAccountID?: number;
    api_key: string;
    StoreID: string;
    RegisterEventActive?: boolean;
    PurchaseEventActive: boolean;
    AbandonedEventActive: boolean;
    StatusChangedEventActive?: boolean;
    Groups?: IntegrationGroups;
    IntegrationSource?: LU_Plugin
}
export interface IntegrationGroups {
    RegisterGroups?: number[];
    PurchaseGroups?: number[];
    AbandonedGroups?: number[];
    StatusChangedGroups?: number[];
}

export interface EShopModel {
    ApiKey: string;
    UiApi_ApiKey?: string;
    IntervalToRunService: string;
    IntervalToProccessingAbandoned: string;
    DaysBackwards: number;
    RegisterEventActive?: boolean;
    PurchaseEventActive: boolean;
    AbandonedEventActive: boolean;
    Groups?: IntegrationGroups;
    IsDeleted?: boolean;
    SubAccountID?: string;
    AutomaticDailyEmailsUnsubscribesAndActiveTypeID?: eAutomaticDailyEmailsUnsubscribesAndActiveTypeID;
    AutomaticDailyEmailsGroups?: never | number[];
}

export interface KlaviyoModel {
    ApiKey: string;
    DaysBackwards: number | null;
    IsDeleted: boolean;
    IntervalToRunService: string;
    UnsubscribePreferenceTypeID: UnsubscribePreferenceType;
    EcommerceSyncOptionsID: number | null;
    isSyncRecipients?: boolean;
    IsInsertAsActive: boolean;
}

export enum UnsubscribePreferenceType {
    None = 0,
    Email = 1,
    Sms = 2,
    Both = 3
}

export enum eAutomaticDailyEmailsUnsubscribesAndActiveTypeID {
    None = 0,
    Subaccount = 1,
    GroupID = 2
}