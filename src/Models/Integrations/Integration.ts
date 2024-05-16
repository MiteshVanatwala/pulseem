export interface IntegrationRequest {
    SubAccountID?: number;
    IntegrationSource: LU_Plugin;
    JsonData: string;
}

export enum LU_Plugin {
    CashCow = 1,
    Shopify = 2,
    Isracard = 3,
    EShop = 5
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
    Groups?: IntegrationGroups;
    IntegrationSource?: LU_Plugin
}
export interface IntegrationGroups {
    RegisterGroups?: number[];
    PurchaseGroups?: number[];
    AbandonedGroups?: number[];
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
}
