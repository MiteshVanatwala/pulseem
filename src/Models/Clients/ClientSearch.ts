
export interface ClientSearchModel {
    MyActivities: ActivityGroup;
    MyConditions: Conditions[];
    MyGroups: number[];
    ShowOpened: boolean;
    ShowNotOpened: boolean;
    ShowClicked: boolean;
    ShowNotClicked: boolean;
    PageIndex: number;
    PageSize: number;
    IsExport: boolean;
}
export enum CondType {
    Undefined = 0,
    Equal = 1,
    Like = 2,
    NotEqual = 3,
    StartsWith = 4,
    NoValue = 5
}
export enum ActivtyInterval {
    LastWeek = 0,
    Last2Weeks = 1,
    LastMonth = 2,
    Last3Months = 3,
    Last6Months = 4,
    LastYear = 5,
    SpecificDates = 6
}
export interface ActivityGroup {
    IsOpened: boolean | null;
    IsOpenedInterval: ActivtyInterval;
    IsOpenedFromDate: Date | string | null;
    IsOpenedToDate: Date | string | null;
    IsNotOpened: boolean | null;
    IsNotOpenedInterval: ActivtyInterval;
    IsNotOpenedFromDate: Date | string | null;
    IsNotOpenedToDate: Date | string | null;
}
export interface Conditions {
    FirstName: string;
    FirstNameCond: CondType;
    LastName: string;
    LastNameCond: CondType;
    Email: string;
    EmailCond: CondType;
    Address: string;
    AddressCond: CondType;
    City: string;
    CityCond: CondType;
    Country: string;
    CountryCond: CondType;
    State: string;
    StateCond: CondType;
    Zip: string;
    ZipCond: CondType;
    Telephone: string;
    TelephoneCond: CondType;
    Cellphone: string;
    CellphoneCond: CondType;
    Company: string;
    ComapnyCond: CondType;
    BirthDateFrom: Date | string | null;
    BirthDateTo: Date | string | null;
    BirthDateFromWithoutYear: Date | string | null;
    BirthDateToWithoutYear: Date | string | null;
    ReminderFrom: Date | string | null;
    ReminderTo: Date | string | null;
    CreatedFrom: Date | string | null;
    CreatedTo: Date | string | null;
    ExtraField1: string;
    ExtraField1Cond: CondType;
    Status: number;
    StatusCond: CondType;
    SmsStatus: number;
    SmsStatusCond: CondType;
    ExtraField2: string;
    ExtraField2Cond: CondType;
    ExtraField3: string;
    ExtraField3Cond: CondType;
    ExtraField4: string;
    ExtraField4Cond: CondType;
    ExtraField5: string;
    ExtraField5Cond: CondType;
    ExtraField6: string;
    ExtraField6Cond: CondType;
    ExtraField7: string;
    ExtraField7Cond: CondType;
    ExtraField8: string;
    ExtraField8Cond: CondType;
    ExtraField9: string;
    ExtraField9Cond: CondType;
    ExtraField10: string;
    ExtraField10Cond: CondType;
    ExtraField11: string;
    ExtraField11Cond: CondType;
    ExtraField12: string;
    ExtraField12Cond: CondType;
    ExtraField13: string;
    ExtraField13Cond: CondType;
    ExtraDate1From: Date | string | null;
    ExtraDate1To: Date | string | null;
    ExtraDate2From: Date | string | null;
    ExtraDate2To: Date | string | null;
    ExtraDate3From: Date | string | null;
    ExtraDate3To: Date | string | null;
    ExtraDate4From: Date | string | null;
    ExtraDate4To: Date | string | null;
}
