export interface AccountSettings extends DoubleOptInSettings {
    LoginUserName: string;
    CompanyAdmin: boolean;
    CompanyName: string;
    ContactName: string;
    Email: string;
    CellPhone: string;
    Telephone: string;
    City: string;
    Address: string;
    ZipCode: number | null;
    BirthDate: Date | string | null;
    DefaultFromMail: string;
    DefaultFromName: string;
    DefaultCellNumber: string;
    UnsubscribeType: boolean;
    IsSmsImmediateUnsubscribeLink: boolean;
    TwoFactorAuthEnabled: boolean | null;
    TwoFactorAuthOptionID: number | null;
    TwoFactorAuthTestMethodID: number | null;
    TwoFactorAuthRetries: number | null;
    TwoFactorAuthOverrideDateTime: Date | string | null;
    ExpiryDate: Date | string | null;
    DisablePluginOTP: boolean;
    RevenueCurrencyId?: number | null;
}
export interface DoubleOptInSettings {
    OptInActive?: boolean | never | any | null;
    OptInFromEmail?: string | any | null;
    OptInFromName?: string | any | null;
    OptInSubject?: string | any | null;
    CreationDate?: Date | any | null;
}