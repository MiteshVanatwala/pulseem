export interface AuthorizeNumbers {
    ID: number;
    Number: string;
    IsOptIn: boolean;
}
export interface OTPResponse {
    Message: string;
    Status: OTPStatus;
}
export interface OTPObject {
    Cellphone: string;
    Code: string;
    UserIP: string;
}
export enum OTPStatus {
    Request = 1,
    Success = 2,
    Not_Authirized = 3,
    Failed = 4,
    NotMatch = 5,
    CellphoneNotProvided = 6,
    CodeNotProvided = 7
}
export enum AuthorizationTypes {
    Cookies = 1,
    TermAndConditions = 2,
    DPATerms = 3,
    ImagePopUp = 4,
    FakeSmsRegulation = 5,
    AllowedFromNumber = 6,
    AllowedFromMail = 7
}
export interface AuthorizationValues {
    ID: number;
    Value: string;
    AuthorizationDetailsId: number;
    IsOptIn: boolean;
    OptinCode: number;
    IsDeleted: boolean;
    CreateDate: Date | string;
}
export interface AuthorizationValues_EnterCodes_Log {
    ID: number;
    AuthorizationValueID: number;
    ValueCreatedDate: Date | string;
    EnterDate: Date | string;
    RealCode: number;
    CodeEntered: number;
    IsSendAlertSms: boolean | null;
}
export interface AuthorizationDetails {
    ID: number;
    AccountID: number;
    SubAccountID: number;
    DirectAccountID: number;
    UserName: string;
    IsDeleted: boolean;
    IPAddress: string;
    Date: Date | string;
    UpdateDate: Date | string | null;
    AuthorizationTypeID: AuthorizationTypes;
}
export interface AuthorizationDetailsLog {
    ID: number;
    AuthorizationDetailsId: number;
    SubAccountID: number;
    DirectAccountID: number;
    UserName: string;
    IsDeleted: boolean;
    IPAddress: string;
    Date: Date | string;
    CommandType: string;
    UpdateDate: Date | string | null;
    CreateDateTime: Date | string;
    AuthorizationTypeID: AuthorizationTypes;
}
export interface AuthorizationValuesLog {
    ID: number;
    AuthorizationValueID: number;
    AuthorizationDetailsId: number;
    Value: number;
    IsDeleted: boolean;
    IsOptin: boolean;
    CommandType: string;
    CreateDate: Date | string | null;
    CreatedDateTime: Date | string | null;
}

export enum OtpRequestFor {
    eDisablePendingOptIn = 0,
    eUnsubscribeType = 1
}