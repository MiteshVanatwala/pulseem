export interface SubUserModel {
    AspnetUserId: string;
    FirstName: string;
    LastName: string;
    Cellphone: string;
    Email: string;
    UserName: string;
    Password: string;
    IsDeleted: boolean;
    IsApproved: boolean;
    UpdatedDate: string | null;
    CreationDate: string | null;
    SubUserPermissions: string;
    UserPermissionsList: eSubUserPermissions[];
}

export enum eSubUserPermissions {
    AllowSend = 1,
    AllowExport = 2,
    AllowDelete = 3,
    AllowSubUsers = 4,
    HideRecipietns = 5
}

export interface SubUserChangeLog {
    ID: number;
    UserId: number;
    OldPermssions: string;
    NewPermssions: string;
    CreatedDate: string;
    IpAddress: string;
}

export interface SubUserToPermissions {
    SubIserId: number;
    SubUserPermission: number[];
}

export interface PermissionsHistoryInterface {
    HistoryID: number;
    PermissionType: string;
    Permissions: string;
    Date: Date | string;
}
