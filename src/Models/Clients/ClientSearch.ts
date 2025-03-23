
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
    IsSearchByFilter?: boolean | null | never;
    IsAdvanced?: boolean | null | never;
    SearchTerm?: string | null | never;
    Status?: any | null | never;
    PageType?: any | null | never;
    ReportType?: any | null | never;
    TestStatusOfEmailElseSms?: any | null | never;
    Switch?: any | null | never;
    CountryOrRegion?: any | null | never;
    GroupIds?: any | null | never;
    NodeID?: any | null | never;
    OrderBy: any | null | never;
}
export enum CondType {
    null = 0,
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
    FirstName: string | null;
    FirstNameCond: CondType | null;
    LastName: string | null;
    LastNameCond: CondType | null;
    Email: string | null;
    EmailCond: CondType | null;
    Address: string | null;
    AddressCond: CondType | null;
    City: string | null;
    CityCond: CondType | null;
    Country: string | null;
    CountryCond: CondType | null;
    State: string | null;
    StateCond: CondType | null;
    Zip: string | null;
    ZipCond: CondType | null;
    Telephone: string | null;
    TelephoneCond: CondType | null;
    Cellphone: string | null;
    CellphoneCond: CondType | null;
    Company: string | null;
    ComapnyCond: CondType | null;
    BirthDateFrom: Date | string | null;
    BirthDateTo: Date | string | null;
    BirthDateFromWithoutYear: Date | string | null;
    BirthDateToWithoutYear: Date | string | null;
    ReminderFrom: Date | string | null;
    ReminderTo: Date | string | null;
    CreatedFrom: Date | string | null;
    CreatedTo: Date | string | null;
    ExtraField1: string | null;
    ExtraField1Cond: CondType | null;
    Status: number | null;
    StatusCond: CondType | null;
    SmsStatus: number | null;
    SmsStatusCond: CondType | null;
    ExtraField2: string | null;
    ExtraField2Cond: CondType | null;
    ExtraField3: string | null;
    ExtraField3Cond: CondType | null;
    ExtraField4: string | null;
    ExtraField4Cond: CondType | null;
    ExtraField5: string | null;
    ExtraField5Cond: CondType | null;
    ExtraField6: string | null;
    ExtraField6Cond: CondType | null;
    ExtraField7: string | null;
    ExtraField7Cond: CondType | null;
    ExtraField8: string | null;
    ExtraField8Cond: CondType | null;
    ExtraField9: string | null;
    ExtraField9Cond: CondType | null;
    ExtraField10: string | null;
    ExtraField10Cond: CondType | null;
    ExtraField11: string | null;
    ExtraField11Cond: CondType | null;
    ExtraField12: string | null;
    ExtraField12Cond: CondType | null;
    ExtraField13: string | null;
    ExtraField13Cond: CondType | null;
    ExtraDate1From: Date | string | null;
    ExtraDate1To: Date | string | null;
    ExtraDate2From: Date | string | null;
    ExtraDate2To: Date | string | null;
    ExtraDate3From: Date | string | null;
    ExtraDate3To: Date | string | null;
    ExtraDate4From: Date | string | null;
    ExtraDate4To: Date | string | null;
}
