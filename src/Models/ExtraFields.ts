export interface ExtraFieldList {
  ExtraField1: string;
  ExtraField2: string;
  ExtraField3: string;
  ExtraField4: string;
  ExtraField5: string;
  ExtraField6: string;
  ExtraField7: string;
  ExtraField8: string;
  ExtraField9: string;
  ExtraField10: string;
  ExtraField11: string;
  ExtraField12: string;
  ExtraField13: string;
  [key: string]: string;
}

export interface ExtraDateFieldList {
  ExtraDate1: string | null;
  ExtraDate2: string | null;
  ExtraDate3: string | null;
  ExtraDate4: string | null;
  [key: string]: string | null;
}

export interface ExtraFieldsPayload extends ExtraFieldList, ExtraDateFieldList {
}