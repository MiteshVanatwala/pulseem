
export interface BillingProduct {
    AccountID: number;
    ID: number;
    ProductDescriptionID: number;
    MasterProductID: eMasterProduct;
    BillingType: eBillingType;
    BillingPeriod: eBillingPeriod;
    LevelLow: number;
    LevelHigh: number;
    MaxTimeToSend: number;
    IsActive: boolean;
    ProductDescription: ProductDescription;
}
export interface ProductDescription {
    ID: number;
    Name: string;
    Description: string;
}
export interface ProductOperation {
    OperationID: number | null;
    PurchaseID: number;
    PurchaseDate: Date | string;
}
export interface AccountPurchase {
    AccountID: number;
    SubAccountID: number;
    PurchaseDate: Date | string;
    StartDate: Date | string;
    PriceHistoryID: number;
    PriceReductionID: number | null;
    ProductID: number;
    IsActive: boolean;
}
export interface OperationHistory {
    ID: number;
    AccountPurchaseID: number;
    OperationMonth: Date | string;
    AmountToPay: number | null;
    PaidAmount: number | null;
    Counter: number | null;
    CreditDaysID: number | null;
    IsCreditInvoice: boolean | null;
    InvoiceID: number | null;
    InvoiceCreateDate: Date | string | null;
    ReceiptID: number | null;
    ReceiptCreateDate: Date | string | null;
    PaymentTypeID: number | null;
    InvoiceRecipientTypeID: number | null;
    CreditInvoiceID: number | null;
    CreditInvoiceCreateDate: Date | string | null;
    IsActive: boolean | null;
    Verified: boolean | null;
    FileAttachments: number | null;
}
export interface PriceHistory {
    ID: number;
    ProductID: number;
    FromDate: Date | string;
    ToDate: Date | string | null;
    Price: number;
}
export interface BulkHistory {
    BulkID: number;
    AccountID: number;
    SubAccountID: number;
    Date: Date | string;
    Amount: number;
    Type: BulkType;
}
export enum BulkType {
    NEWSLETTER = 0,
    SMS = 1,
    MMS = 2,
    HLR = 3,
    NOTIFICATIONS = 4
}
export enum eMasterProduct {
    Survey = 1,
    Email = 2,
    SMS = 3,
    LandingPage = 4,
    MMS = 5,
    Notification = 6
}
export enum eBillingType {
    SpecialProduct = 1,
    PerRecipients = 2,
    ProductQuantity = 3,
    PayAsYouGo = 4,
    Bulk = 5,
    PerUsage = 8,
    PerValidRecipients = 13
}
export enum eBillingPeriod {
    Instant = 0, // לא מוגבל בזמן
    OneTime = 1, // חד פעמי
    Daily = 2, // יומי
    Monthly = 3, // חודשי קבוע 
    Yearly = 4, // שנתי
    MonthlyByUse = 5 // חודשי לפי שימוש
}
