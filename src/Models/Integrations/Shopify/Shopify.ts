import { LU_Plugin, IntegrationGroups } from "../Integration";

export interface ShopifyModel {
    ID?: number;
    SubAccountID?: number;
    store_name: string;
    api_key: string;
    api_access_token: string;
    api_password: string;
    api_version: string;
    RegisterEventActive: boolean;
    PurchaseEventActive: boolean;
    AbandonedEventActive: boolean;
    UiApi_ApiKey?: string;
    Groups?: IntegrationGroups;
    CreateDate?: Date | string;
    UpdateDate?: Date | string;
    IntegrationSource?: LU_Plugin
}
export interface ShopifyCustomerResponse {
    errors?: string;
    customers?: ShopifyCustomer[];
    IsAuth: boolean
}
export interface SettingsResponse {
    Code?: number;
    Message?: string;
}
export interface ShopifyCustomer {
    id?: number;
}