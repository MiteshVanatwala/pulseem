export interface FileGallery extends FolderGallery {
    ID: string
    Base64: string;
    FileName: string;
    CreatedDate: Date | string;
    IsIcon: boolean;
    Path: string;
    Extension: string;
    FileURL: string;
    Properties: FileProperties;
}
export interface FolderGallery {
    SubAccountId: number;
    FolderType: EFolderType;
    FolderId: number;
    FolderName: string;
    Files: FileGallery[];
}
export interface FileProperties {
    Width: number;
    Height: number;
    ContentType: string;
}

export enum EFolderType {
    ClientImages = 0,
    Documents
}