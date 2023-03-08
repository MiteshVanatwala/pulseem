import { TOAST_TYPE, TYPE_KEY_VAL_OBJECT } from "../helpers/Types/common";
import { SmsRepRowType } from "./Sms/smsReplies";

export type ReportStateType = {
  showContent: Boolean;
  productsReportDetails: Array<any>;
  productCategories: Array<any>;
  exportPRData: Array<any>;
  responsesReportDetails: Array<any>;
  TotalResponses: number;
};

export type CoreStateType = {
  language: "he" | "en";
  isRTL: boolean;
  windowSize: "xs" | "sm" | "md" | "lg" | "xl";
  basename: String;
  email: String;
  phone: String;
  imageURL: String;
  isWhiteLabel: false;
  companyName: String;
  rowsPerPage: number;
  isClal: Boolean;
  accountFeatures: any;
  cameFromSubAccount: boolean | null;
  isAdmin: boolean | null;
  isAllowSwitchAccount: boolean | null;
  billingTypeId: String | null;
  accountSettings: any;
};

export type SmsStateType = {
  smsData: TYPE_KEY_VAL_OBJECT[];
  smsDeletedData: TYPE_KEY_VAL_OBJECT[];
  smsDataError: string;
  authorizationData: TYPE_KEY_VAL_OBJECT[];
  smsReport: TYPE_KEY_VAL_OBJECT[];
  smsGraph: any;
  previousLandingData: TYPE_KEY_VAL_OBJECT[];
  previousCampaignData: TYPE_KEY_VAL_OBJECT[];
  extraData: TYPE_KEY_VAL_OBJECT[];
  accountId: string[];
  subAccountGroups: TYPE_KEY_VAL_OBJECT[];
  getCampaignSum: TYPE_KEY_VAL_OBJECT[];
  finishedCampaigns: TYPE_KEY_VAL_OBJECT[];
  testGroups: TYPE_KEY_VAL_OBJECT[];
  commonSettings: TYPE_KEY_VAL_OBJECT;
  directSmsReport: TYPE_KEY_VAL_OBJECT;
  directSmsReportError: string;
  credits: TYPE_KEY_VAL_OBJECT[];
  smsCampaignSettings: TYPE_KEY_VAL_OBJECT[];
  smsSendResult: number;
  OTPPassed: any;
  smsReplies: {
    Data: SmsRepRowType[];
    Message: number;
  };
  ToastMessages: { [key: string]: TOAST_TYPE };
};

export type StateType = {
  core: CoreStateType;
  user: any;
  newsletter: any;
  landingPages: any;
  mms: any;
  automations: any;
  notification: any;
  sms: SmsStateType;
  dashboard: any;
  recipientReports: any;
  shortcuts: any;
  payment: any;
  common: any;
  client: any;
  campaignEditor: any;
  siteTracking: any;
  group: any;
  report: ReportStateType;
  gallery: any;
  connectors: any;
  accountSettings: any;
  whatsapp: any;
};
