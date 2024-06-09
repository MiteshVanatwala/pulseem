
export interface DynamicGroupModel {
    MyActivities: MyActivities;
    MyConditions: CondGroup[];
    MyGroups: number[];
}
export enum CondType {
    Undefined = '0',
    Equal = '1',
    Like = '2',
    NotEqual = '3',
    StartsWith = '4',
    NoValue = '5'
}
export enum ActivtyTimeInterval {
    LastWeek = '0',
    Last2Weeks = '1',
    LastMonth = '2',
    Last3Months = '3',
    Last6Months = '4',
    LastYear = '5',
    SpecificDates = '6',
    Ever = '7',
    DaysBack = '8'
}

export enum ActivityEvent {
    Any = '0',
    MoreThan = '1',
    LessThan = '2',
    Range = '3'
}

export interface MyActivities {
    IsOpened: boolean | null;
    IsOpenedInterval: ActivtyTimeInterval;
    IsOpenedFromDate: Date | string | null;
    IsOpenedToDate: Date | string | null;

    IsNotOpened: boolean | null;
    IsNotOpenedInterval: ActivtyTimeInterval;
    IsNotOpenedFromDate: Date | string | null;
    IsNotOpenedToDate: Date | string | null;

    IsClicked: boolean | null;
    IsClickedInterval: ActivtyTimeInterval;
    IsClickedFromDate: Date | string | null;
    IsClickedToDate: Date | string | null;

    IsNotClicked: boolean | null;
    IsNotClickedInterval: ActivtyTimeInterval;
    IsNotClickedFromDate: Date | string | null;
    IsNotClickedToDate: Date | string | null;

    IsPurchased: boolean | null;
    IsPurchasedComparingType: ActivityEvent;
    IsPurchasedMinPrice: number | string | null;
    IsPurchasedMaxPrice: number | string | null;
    IsPurchasedInterval: ActivtyTimeInterval;
    IsPurchasedFromDate: Date | string | null;
    IsPurchasedToDate: Date | string | null;
    PurchasedPrice: number | string | null;

    IsNotPurchased: boolean | null;
    IsNotPurchasedComparingType: ActivityEvent;
    IsNotPurchasedMinPrice: number | string | null;
    IsNotPurchasedMaxPrice: number | string | null;
    IsNotPurchasedInterval: ActivtyTimeInterval;
    IsNotPurchasedFromDate: Date | string | null;
    IsNotPurchasedToDate: Date | string | null;
    NotPurchasedPrice: number | string | null;

    IsAbandoned: boolean | null;
    IsAbandonedComparingType: ActivityEvent;
    IsAbandonedMinPrice: number | string | null;
    IsAbandonedMaxPrice: number | string | null;
    IsAbandonedInterval: ActivtyTimeInterval;
    IsAbandonedFromDate: Date | string | null;
    IsAbandonedToDate: Date | string | null;
    AbandonedPrice: number | string | null;

    IsPageViewed: boolean | null;
    IsPageViewedComparingType: ActivityEvent;
    IsPageViewedMinPrice: number | string | null;
    IsPageViewedMaxPrice: number | string | null;
    IsPageViewedInterval: ActivtyTimeInterval;
    IsPageViewedFromDate: Date | string | null;
    IsPageViewedToDate: Date | string | null;
    PageViewedPrice: number | string | null;

}
export interface CondGroup {
    FirstName: string;
    FirstNameCond: CondType;
    LastName: string;
    LastNameCond: CondType;
    Email: string;
    EmailCond: CondType;
    Cellphone: string;
    CellphoneCond: CondType;
    City: string;
    CityCond: CondType;
    Country: string;
    CountryCond: CondType;
    State: string;
    StateCond: CondType;
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
