import React from "react";
import { AccountSettings } from "../Account/AccountSettings";

export type CompDtlErrorsType = {
    [key: string]: string;
    CompanyName: string;
    ContactName: string;
    BirthDate: string;
    Telephone: string;
    Mobile: string;
    Email: string;
    Address: string;
    City: string;
    Zip: string;
    SendCodeMethod: string;
};

export type CompDtlPropTypes = {
  classes: any;
  setToastMessage: React.Dispatch<React.SetStateAction<null>>;
  ToastMessages: {
    [key: string]: any;
  };
  Settings: AccountSettings | null;
  OnUpdate: Function;
  onShowTwoFactorAuth: Function;
};
