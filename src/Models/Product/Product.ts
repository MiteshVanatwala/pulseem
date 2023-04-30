export interface ProductsModel {
    ID: number;
    Name: string;
    UniqueName: string;
    TotalProducts: number;
    SoldProducts: number;
    QuantityInStock: number;
    Price: number;
    IsDiscount: boolean;
    SKU: string;
}

export interface PurchasedProducts {
    ID: number | null;
    ProductID: number;
    Discount: number | null;
    Amount: number;
    Price: number;
    UniqueName: string;
    ProductName: string;
    Email: string;
}

export interface DiscountSettings {
    WebFormID: number | null;
    DiscountTypeID: number | null;
    FieldName: string;
    FilterType: number | null;
    ProductID: number | null;
}

export interface Discounts extends DiscountSettings {
    Discount: number | null;
    Email: string;
    ClientID: number | null;
    DiscountType: number;
    PriceAfterDiscount: number | null;
}
export interface DiscountModel extends DiscountSettings {
    ID: number;
    FieldValue: string;
    Discount: number | null; // For the futue - price decrease by percentage
    PriceAfterDiscount: number | null;
    DiscountPricingTypeID: number | null;
}
export enum PurchaseStatus {
    AddToCart = 1,
    PaymentInProcess = 2,
    Purchased = 3,
    Fail = 4
}