export interface BillingAccount {
    SubAccountID: number | null;
    AccountID: number | null;
    SubAccountName: string;
    IsPaying: boolean;
    CompanyName: string;
    ContactName: string;
    City: string;
    ZipCode: string;
    Country: string;
    StreetAndNumber: string;
    OfficePhoneNumber: string;
    CellPhone: string;
    TokenNumber: string;
    Email: string;
    CorporationNumber: string;
    PaymentType: number;
    InvoiceRecieptType: number;
    AutomaticBilling: boolean;
    CreditDaysID: number;
    Refund: number;
    BillingLanguage: number;
    CompanyNameForInvoice: string;
}