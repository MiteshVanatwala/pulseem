export interface TwoFactorAuthAllowed {
    Id: number | null | undefined;
    SubAccountId: number | null | undefined;
    TwoFactorAuthTypeID: e_AuthType;
    AuthValue: string;
    CreatedDate: Date | string | null | undefined;
    IsDeleted: boolean | null | undefined;
    AddToFromValues: boolean | null | undefined;
}

export enum e_AuthType {
    Email = 1,
    SMS = 2
}