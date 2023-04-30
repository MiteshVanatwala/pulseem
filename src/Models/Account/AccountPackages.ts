
export interface PriceList {
    ID: number;
    AccountID: number;
    CampaignType: number;
    PackageType: number;
    Price: number;
    Quantity: number;
    IsDeleted: boolean;
    CreatedDate: Date | string;
    UpdatedDate: Date | string;
}
export interface PackagePurchaseLog {
    ID: number;
    Name: string;
    AccountID: number;
    Status: number;
    CampaignType: number;
    Quantity: number;
    Price: number;
    CreatedDate: Date | string;
}
