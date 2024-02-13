import { Moment } from "moment";

export type SmsRepDefaultFilterType = {
  FromDate: Moment | string;
  ToDate: Moment | string;
  FromNumber?: string;
  ToNumber?: string;
  Text?: string;
  CampaignID?: string | null;
  PageIndex: number;
  PageSize: number;
  IsExport: boolean;
};

export type SmsRepRowType = {
  ClientID: string;
  FirstName: string;
  LastName: string;
  CellPhone: string;
  SmsStatus: number;
  ReplyDate: Moment | string;
  ReplyText: string;
  VirtualNumber: string;
};
