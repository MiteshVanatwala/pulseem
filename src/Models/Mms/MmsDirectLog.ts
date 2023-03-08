
    export interface MmsDirectLog {
        ID: number;
        CreateDateTime: Date | string;
        DirectAccountID: number;
        FromNumber: string;
        ToNumber: string;
        Text: string;
        NavigateUrl: string;
        Links: string;
        Reference: string;
        Status: number;
        ErrorType: number;
    }
