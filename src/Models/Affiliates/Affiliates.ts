export interface Affiliate {

}

export interface AffiliateDetails {
  AccountID: number;
  CompanyName: string;
  Payments: number;
  AffiliateFee: number;
  ToPay: number;
  Paid: number;
}

export enum eTimeFrame {
  ALL_TIME = 0,
  LAST_QUARTER = 1,
  LAST_MONTH = 2
}