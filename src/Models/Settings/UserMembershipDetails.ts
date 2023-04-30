export interface UserMembershipDetais {
    LastPasswordChangedDate: Date | string;
    PasswordExpired: boolean;
    PasswordExpirationDate: Date | string;
    NextRequiredChange: Number | null;
}