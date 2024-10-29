export type BillingErrorTypes = {
  [key: string]: string;
  CompanyName: string;
  ContactName?: string | never | any;
  Cellphone?: string | never | any;
  Phone?: string | never | any;
  EmailForInvoices?: string | any;
  Address?: string | never | any;
  City?: string | never | any;
  Zip?: string | never | any;
  Country?: string | never | any;
  CompRegNumber: string;
  InvoiceLang?: string | never | any;
  CardNumber?: string | never | any;
  ExpMonth?: string | never | any;
  ExpYear?: string | never | any;
  SecurityCode?: string | never | any;
  Id?: string | never | any;
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
