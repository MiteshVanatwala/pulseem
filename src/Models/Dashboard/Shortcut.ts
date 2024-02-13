
export interface Shortcut {
    ID: number;
    SubAccountID: number;
    CategoryName: string;
    ShortcutName: string;
    ShortcutUrl: string;
    IsDeleted: boolean;
    CreationDate: Date | string;
    ModifiedDate: Date | string;
}
