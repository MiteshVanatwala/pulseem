export interface UserMembershipDetais {
    LastPasswordChangedDate: Date | string;
    PasswordExpired: boolean;
    PasswordExpirationDate: Date | string;
    NextRequiredChange: D_Time | null;
}

export interface D_Time {
    Days: Number | string;
    Hours: Number | string;
    Minutes: Number | string;
    Seconds: Number | string;
}