export interface UsersAndPermissionsInterface {
  ID: number;
  UserName: string;
  Email: string;
  Cellphone: string;
  Permissions: string;
  Date: Date | string;
}

export interface PermissionsHistoryInterface {
  HistoryID: number;
  PermissionType: string;
  Permissions: string;
  Date: Date | string;
}
