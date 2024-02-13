export interface SMSDirectLog {
    ID: number;
    CreateDateTime: Date | string;
    DirectAccountID: number;
    Text: string;
    FromNumber: string;
    ToNumber: string;
    Reference: string;
    Status: number;
    ErrorType: number;
    IsResponse: boolean;
    FromNumberResponse: string;
    ProviderID: number | null;
    IsDlrPushed: boolean | null;
    DlrPushLastUpdate: Date | string | null;
    Credits: number | null;
}