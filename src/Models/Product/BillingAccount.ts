export interface BillingAccount {
    SubAccountID?: number | null | never;
    AccountID?: number | null | never;
    SubAccountName?: string | null | never;
    IsPaying?: boolean | null | never;
    CompanyName: string;
    ContactName: string;
    City: string;
    ZipCode: string;
    Country: string;
    StreetAndNumber: string;
    OfficePhoneNumber: string;
    CellPhone: string;
    TokenNumber?: string | null | never;
    Email: string;
    CorporationNumber: string;
    PaymentType?: number | null | never;
    InvoiceRecieptType?: number | null | never;
    AutomaticBilling?: boolean | null | never;
    CreditDaysID?: number | null | never;
    Refund?: number | null | never;
    BillingLanguage: string;
    CompanyNameForInvoice: string;
    CurrencyID?: number | null | never;
}