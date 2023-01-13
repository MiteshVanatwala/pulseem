import { ClassNamesProps } from "@emotion/react";
import React from "react";

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

export type CompanyDetailsType = {
  CompanyName: string;
  ContactName: string;
  BirthDate: null | string;
  Telephone: string;
  Mobile: string;
  Email: string;
  Address: string;
  City: string;
  Zip: string;
  TwoFactorAuth: boolean;
  SendCodeMethod: string;
};

export type CompDtlPropTypes = {
  setToastMessage: React.Dispatch<React.SetStateAction<null>>;
  ToastMessages: {
    [key: string]: any;
  };
};
