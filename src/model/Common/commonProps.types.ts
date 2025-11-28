export type commonProps = {
    verifiedEmails: VerifiedEmail[];
    tokenAlive?:  any | never,
    accountSettings?: any | never,
    accountFeatures?:  any | never,
    isPoland?: boolean,
    subAccount?: any
};

export interface VerifiedEmail {
    ID: number | never,
    Number?: string | any,
    IsOptIn: boolean,
    IsVerified: boolean,
    IsRestricted: boolean
}

export interface CountryCode {
    ID: number,
    SmsCountryName: string,
    SmsCountryPhoneCode: number
}
