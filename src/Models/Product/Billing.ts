export enum MasterProduct {
    Survey = 1,
    Email,//2
    Sms,//3
    LandingPage,//4
    Mms//5
}
export enum BillingType {
    SpecialProduct = 1,
    Recipients,//2       // isTimeBased
    ProductQuantity,//3
    PayAsYouGo,//4       // isTimeBased
    Bulk,//5
    PerUsage = 8,        // isTimeBased
    RecipientsValid = 13 // isTimeBased
}
export enum PaymentMethod {
    CreditCard = 1,
    Cheque,
    BankTransfer,
    Cash
}
export enum PaymentType {
    TaxInvoice = 5, //חשבונית מס
    Deal = 2, //חשבונית עסקה
    None = 6 //ללא חשבוניות
}
export enum DocumentType {
    Invoice = 1,
    TaxInvoice,
    Reciept,
    TaxReciept,
    CreditInvoice
}
export enum BillingLanguage {
    Hebrew = 1,
    English = 2
}
export interface InvoiceRequest {
    TotalPrice: number;
    Date: string;
    NumberOfPayments: string;
    FirstPayment: number;
    CardType: string;
    LastDigits: string;
    HolderName: string;
    ConfirmationCode: string;
    Cid: string;
    User: string;
    Pass: string;
    Debug: string;
    SendEmail: string;
    EmailTo: string;
    SendEmailToClient: string;
    ClientEmail: string;
    ClientCCEmail: string;
    VatID: string;
    ClientName: string;
    VatPercent: number;
    Description: string;
    UnitPrice: number;
    Quantity: number;
    TotalSum: number;
    TotalVat: number;
    TotalWithVat: number;
    TotalPaid: number;
}