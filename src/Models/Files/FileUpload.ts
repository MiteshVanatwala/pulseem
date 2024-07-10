import { Client } from "../Clients/Client";

export interface PulseemFile {
    ID: number;
    UploadType: eUploadType;
    FileSize: number;
    SubAccountID: number;
    Status: eFileStatus;
    UploadedBy: string;
    FileName: string;
    Results: string;
    ErrorData: string;
    FieldsMapping: string;
    CreatedDate: Date | string;
    LastUpdated: Date | string;
    RunDateStart: Date | string;
    RunDateEnd: Date | string;
    UploadResultsData?: never | any;

    fieldsMappingData: FieldsMapper;
    resultsData: UploadResults;
}
// export enum UploadFileStatus { Pending, Uploading, Success, Fail, Cancel }

export enum eFileStatus {
    WAITTING_FOR_UPLOAD = 0,
    ERROR_OCCURED = 1,
    SUCCESSFULLY_COMPLETED = 2,
    GENERIC_ERROR = 3,
    CANCELLED = 4
}

export interface UploadGroup {
    ID: number;
    Title: string;
}
export interface Columns {
    Index: number;
    Title: string;
}
export interface FieldsMapper {
    new(): FieldsMapper;
    Mapping: Columns[];
}
export interface UploadResults {
    new(): UploadResults;

    groups: UploadGroup[];

    emailInvalids: Client[];
    cellInvalids: Client[];
    allEmailDuplicates: Client[];
    allCellphoneDuplicates: Client[];
    allExistingMatchedEmails: Client[];
    allExistingMatchedCells: Client[];
    bothInvalids: Client[];
    SelectedSheet: number;
    TotalRecords: number;
    TotalUploaded: number;
    TotalErrors: number;
    TotalDuplicates: number;
    EmailSuccess: number;
    EmailInvalid: number;
    EmailDuplicates: number;
    EmailExists: number;
    PhoneSuccess: number;
    PhoneInvalid: number;
    PhoneDuplicates: number;
    PhoneExists: number;
}

export enum eUploadType {
    Direct = 0,
    System = 1
}