export type commonProps = {
    verifiedEmails: VerifiedEmail[];
};

export interface VerifiedEmail {
    ID: number | never,
    Number?: string | any,
    IsOptIn: boolean,
    IsVerified: boolean,
    IsRestricted: boolean
}