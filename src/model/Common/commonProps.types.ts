export type commonProps = {
    verifiedEmails: VerifiedEmail[];
    tokenAlive?:  any | never,
    accountSettings?: any | never,
    accountFeatures?:  any | never,
};

export interface VerifiedEmail {
    ID: number | never,
    Number?: string | any,
    IsOptIn: boolean,
    IsVerified: boolean,
    IsRestricted: boolean
}
