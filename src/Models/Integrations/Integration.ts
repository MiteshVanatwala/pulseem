export interface IntegrationRequest {
    SubAccountID?: number;
    IntegrationSource: LU_Plugin;
    JsonData: string;
}

export enum LU_Plugin {
    CashCow = 1,
    Shopify = 2
}
export enum LU_PluginGroupType {
    PURCHASED = 1,
    REGISTERED = 2,
    ABANDONED = 3
}