export interface SubUserModel extends LoginPassword {
    ID: number | null | any;
    AspnetUserId?: string | null | any;
    FirstName?: string | null | any;
    LastName?: string | null | any;
    Cellphone: string | null | any;
    Email: string | null | any;
    UserName?: string | null | any;
    Password?: string | null | any;
    ConfirmPassword?: string | null | any;
    IsDeleted?: boolean | null | any;
    IsApproved?: boolean | null | any;
    UpdatedDate?: string | null | any;
    CreationDate?: string | null | any;
    SubUserPermissions?: string | null | any;
    UserPermissionsList?: eSubUserPermissions[] | null | any;
    ActionType?: eSubUserAction | null | any;
}

export interface LoginPassword {
    OldPassword: string | null | any;
    NewPassword: string | null | any;
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


export enum eSubUserAction {
    NewUser = 1,
    Update = 2,
    Delete = 3,
    ChangePassword = 4
}

export const UserRoles = {
    Admin: {
        AllowSend: true,
        AllowExport: true,
        AllowDelete: true,
        AllowSubUsers: true,
    },
    Restricted: {
        AllowSend: false,
        AllowExport: true,
        AllowDelete: false,
        AllowSubUsers: false,
    },
    ReadOnly: {
        canSendCampaigns: false,
        canExportFiles: false,
        canDeleteCampaigns: false,
        canAddSubUsers: false,
    },
};