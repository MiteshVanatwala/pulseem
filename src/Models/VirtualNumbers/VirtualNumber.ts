
export interface VirtualNumber {
    accounts: Account2VirtualNumber[];
    log: Account2VirtualNumber[];
    ID: number;
    Number: string;
    IsActive: boolean;
    IsUnique: boolean;
    ProviderID: number;
    Log: Account2VirtualNumber[];
    Accounts: Account2VirtualNumber[];
    Notes: string;
    CreatedDate: Date | string;
    LastUpdated: Date | string;
    ProviderName: string;
    IsFreezed: boolean;
    FreezeEndDate: Date | string;
    FreezeDaysLeft: number;
}

export interface Account2VirtualNumber {
    ID: number;
    AccountID: number;
    AccountName: string;
    SubAccountId: number;
    DirectAccountID: number;
    SubAccountName: string;
    AccountType: string;
    Number: string;
    NumberID: number;
    IsUnique: boolean;
    RemovalKey: string;
    UserName: string;
    IsDeleted: boolean;
    CreatedDate: Date | string;
    LastUpdated: Date | string;
    DisplayAccountID: number;
    DisplayAccountType: string;
}
