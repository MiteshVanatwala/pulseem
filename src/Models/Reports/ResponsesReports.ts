export type ResponsesRowType = {
  ResponseId: String;
  ClientName: String;
  ToNumber: String;
  ReplyDate: String;
  SmsStatus: String;
  MessageContent: String;
};

export type ResponsesFilter = {
  FromDate: String | null;
  ToDate: String | null;
  FromNumber: String;
  PageIndex: number;
  PageSize: number;
  IsExport: Boolean;
};
