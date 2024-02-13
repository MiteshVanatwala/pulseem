export interface SmsCampaignSettings {
    SmsCampaignID: number;
    SendTypeID: SendType;
    RandomSettings: RandomSettings;
    PulseSettings: PulseSettings;
    SpecialSettings: SpecialSettings;
    SendExeptional: SendExeptionalSettings;
    Groups: number[];
    FutureDateTime: Date | string | null;
    SourceTimeZone: string;
}
// Objects
export interface RandomSettings {
    ID: number;
    RandomAmount: number;
}
export interface PulseSettings {
    PulseSettingsID: number;
    PulseType: PulseType;
    TimeType: TimeType;
    PulseAmount: number;
    TimeInterval: number;
}
export interface SpecialSettings {
    Day: number;
    DateFieldID: DateFields;
    SendHour: Date | string | null;
    SendDate: Date | string | null;
    IntervalTypeID: number;
}
export interface SendExeptionalSettings {
    ExceptionalID: number;
    ExceptionalDays: number;
    IsExceptionalGroups: boolean;
    IsExceptionSmsCampaigns: boolean;
    Groups: number[];
    Campaigns: number[];
}
// Enums
export enum TimeType {
    Minutes = 1,
    Hours = 2
}
export enum SendType {
    Immediate = 1,
    Future = 2,
    Special = 3
}
export enum PulseType {
    Percentage = 1,
    Recipients = 2
}
export enum DateFields {
    Null = -1,
    Birthday = 1,
    CreatedDate = 2,
    ExtraDate1 = 3,
    ExtraDate2 = 4,
    ExtraDate3 = 5,
    ExtraDate4 = 6
}