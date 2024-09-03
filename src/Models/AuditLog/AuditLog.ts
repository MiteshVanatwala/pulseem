export interface AuditLog {
    ActionName: string;
    AuditActionType: eAuditActionType;
    RequestValue: string;
    ResponseValue: string;
    RequestSourceValue: string;
}

export enum eAuditActionType {
    Create = 1,
    Edit = 2,
    Delete = 3,
    Read = 4,
    Enable = 5,
    Disable = 6,
    Send = 7,
    Cancel = 8,
    Update = 9,
    OTPRequest = 10,
    OTPConfirmation = 11
}