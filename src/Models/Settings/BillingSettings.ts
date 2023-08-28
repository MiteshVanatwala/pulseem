export type BillingErrorTypes = {
  [key: string]: string;
  CompanyName: string;
  ContactName: string;
  Cellphone: string;
  Phone: string;
  EmailForInvoices: string;
  Address: string;
  City: string;
  Zip: string;
  Country: string;
  CompRegNumber: string;
  InvoiceLang: string;
  CardNumber: string;
  ExpMonth: string;
  ExpYear: string;
  SecurityCode: string;
  Id: string;
};

export type BillingInfoValuesTypes = {
  CompanyName: string;
  ContactName: string;
  Cellphone: string;
  Phone: string;
  EmailForInvoices: string;
  Address: string;
  City: string;
  Zip: string;
  Country: string;
  CompRegNumber: string;
  InvoiceLang: string;
};

export type CardDetailsTypes = {
  CardNumber: string;
  ExpMonth: string;
  ExpYear: string;
  SecurityCode: string;
  Id: string;
};
