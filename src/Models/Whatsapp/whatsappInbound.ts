import { Moment } from "moment";

export type wpInbdDefaultFilterType = {
  FromDate: Moment | null | string;
  ToDate: Moment | null | string;
  FromNumber?: string;
  ToNumber?: string;
  TextMessage?: string;
  PageIndex: number;
  PageSize: number;
  IsExport: boolean;
};

export type wpInbdRowType = {
  Id: string;
  SendDate: Moment | null | string;
  FromNumber: string;
  ToNumber: string;
  TextMessage: string;
};
