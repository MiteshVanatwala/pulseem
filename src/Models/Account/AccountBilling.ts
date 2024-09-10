export interface BillingAccount {
  iD: number;
  subAccountName: string;
  isPaying: boolean;
  companyName: string;
  contactName: string;
  city: string;
  zipCode: string;
  country: string;
  streetAndNumber: string;
  officePhoneNumber: string;
  cellPhone: string;
  tokenNumber: string;
  email: string;
  corporationNumber: string;
  paymentType: number;
  invoiceRecieptType: number;
  automaticBilling: boolean;
  creditDaysID: number;
  refund: number;
  billingLanguage: number;
  companyNameForInvoice: string;
}

export interface PurchaseHistoryModel {
  OperationID: number | any;
  ProdctDesciption: string;
  NumberOfProducts: number | any;
  BillingPeriod: string;
  BillingType: string;
  OperationDate: string;
  AmountToPay: number | any;
  PaidAmount: number | any;
  ReceiptID: number | any;
  InvoiceID: number | any;
  InvoiceRecieptName: string;
  CreditInvoiceID: number | any;
  AccountPurchaseID: number | any;
  InvoiceCreatedDate?: any | never;
  CreditDays?: any | Date | never;
  OpenDate: string;
  AmountWithVat: number | any;
  ReceiptCreateDate?: any | Date | never;
  BillingTypeID: number | any;
  InvoiceRecipientTypeID: number | any;
  InvoiceURL: any;
}