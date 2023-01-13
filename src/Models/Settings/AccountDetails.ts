import React from "react";

export type AccountDetailsType = {
  FromEmail: string;
  FromName: string;
  FromPhoneNumber: string;
  UnsubType: string;
  SmsUnsubLinkType: string;
};

export type AccDtlPropTypes = {
  setToastMessage: React.Dispatch<React.SetStateAction<null>>;
  ToastMessages: {
    [key: string]: any;
  };
};

// type AccDtlErrorsType={
//   [key:string]:string;
//   FromEmail: string;
//   FromName: string;
//   FromPhoneNumber: string;
//   UnsubType: string;
//   SmsUnsubLinkType: string;
// }
