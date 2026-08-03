// Data Sources — types + enums.
// Property names are 1:1 case-sensitive aliases of the SP resultset columns
// (see DataSources-DB-MasterPlan §7½ and the Implementation Plan §4).

export enum eDataSourceStatus {
    PENDING = 0,
    PROCESSING = 1,
    READY = 2,
    FAIL = 3,
    CANCELLED = 4
}

export enum eMatchType {
    NO_VALUE = 0,
    MATCHED = 1,
    CREATED = 2,
    NOT_FOUND = 3
}

export enum eDataType {
    TEXT = 1,
    NUMBER = 2,
    DATE = 3,
    EMAIL = 4,
    PHONE = 5
}

export enum eFormatHint {
    NONE = 0,
    CURRENCY = 1,
    PERCENT = 2
}

// All five values are emitted by the upload wizard. 3/4 drive the client FirstName/LastName
// enrichment on match (DataSourceVersions.UpdateClientNames / OverwriteClientNames) — they are NOT
// identity/matching roles, matching still happens on email (1) and cellphone (2) only.
export enum eSemanticRole {
    NONE = 0,
    RECIPIENT_EMAIL = 1,
    RECIPIENT_CELLPHONE = 2,
    FIRST_NAME = 3,
    LAST_NAME = 4
}

// Free-text filter operator (whitelist enforced server-side): equals / startsWith / contains.
export enum eFilterOperator {
    EQUALS = 1,
    STARTS_WITH = 2,
    CONTAINS = 3
}

// Aligned to DB §7½ GetMany resultset (dual per-channel resolve). `DataSourceVersionID` is the
// active version's id (Get RS1 calls the same concept `ActiveVersionID`).
export interface DataSourceListItem {
    DataSourceID: number;
    Name: string;
    Description: string;
    CreatedBy: string;
    CreatedDate: string;
    DataSourceVersionID: number;
    VersionNumber: number;
    Status: eDataSourceStatus;
    TotalRows: number | null;
    ProcessedRows: number | null;
    ProgressPercent: number | null;
    ResolvedRowsEmail: number;
    ResolvedRowsCell: number;
    NoIdentityRows: number;
    DuplicateRows: number;
    UploadedBy: string;
    LastUploadDate: string | null;
    // Start of the active version's processing — the source for the "processing delayed" threshold.
    RunDateStart: string | null;
    HasEmailIdentity: boolean;
    HasCellIdentity: boolean;
    // Number of columns in the active version, projected from DataSourceVersions.ColumnCount by
    // DataSources_GetMany. 0 while the SP script (DataSourcesDB/15_GetMany_ColumnCount.sql) is not
    // deployed — GInt returns 0 for a column the resultset does not carry — so callers must treat
    // 0 as "unknown" and render nothing rather than "0 columns".
    ColumnsCount: number;
}

// Aligned to DB §7½ Get RS1. Fields after ResultsJson are UI-needed "§7½ gaps" (may be null if the
// SP does not return them) — see DataSourceModels.cs.
export interface DataSourceDetails {
    DataSourceID: number;
    Name: string;
    Description: string;
    ActiveVersionID: number | null;
    Status: eDataSourceStatus;
    TotalRows: number | null;
    ResolvedRowsEmail: number;
    ResolvedRowsCell: number;
    NoIdentityRows: number;
    DuplicateRows: number;
    HasEmailIdentity: boolean;
    HasCellIdentity: boolean;
    CreatedBy: string;
    CreatedDate: string;
    ResultsJson: string | null;
    VersionNumber?: number | null;
    FileName?: string | null;
    FileSizeKB?: number | null;
    ErrorData?: string | null;
    RunDateStart?: string | null;
    RunDateEnd?: string | null;
}

export interface DataSourceColumn {
    ColumnID: number;
    Ordinal: number;
    SourceHeader: string;
    DisplayName: string;
    ColumnKey: string;
    DataType: eDataType;
    FormatHint: eFormatHint;
    SemanticRole: eSemanticRole;
    IsSearchable: boolean;
}

// Aligned to DB §7½ Get RS3 (version history).
export interface DataSourceVersion {
    DataSourceVersionID: number;
    VersionNumber: number;
    Status: eDataSourceStatus;
    TotalRows: number | null;
    ResolvedRowsEmail: number;
    ResolvedRowsCell: number;
    CreatedDate: string;
    UploadedBy: string;
    PurgedDate: string | null;
    FileName?: string | null; // §7½ gap
}

export interface DataSourceRow {
    RowID: number;
    RowOrdinal: number;
    Email: string | null;
    CellphoneNormalized: string | null;
    EmailClientID: number | null;
    CellClientID: number | null;
    EmailMatchType: eMatchType;
    CellMatchType: eMatchType;
    IsEmailDuplicate: boolean;
    IsCellDuplicate: boolean;
    RowJson: string;
}

// Column definition sent to the server as the DataSourceColumnType TVP on upload.
export interface UploadColumnDef {
    Ordinal: number;
    SourceHeader: string;
    DisplayName: string;
    DataType: eDataType;
    FormatHint: eFormatHint;
    SemanticRole: eSemanticRole;
    IsSearchable: boolean;
}

export interface RowsFilter {
    DataSourceColumnID: number;
    Operator: eFilterOperator;
    FilterValue: string;
}

// ---- request shapes ----

export interface GetManyRequest {
    PageIndex: number;
    PageSize: number;
    SearchTerm: string;
    silent?: boolean;
}

export interface GetRowsRequest {
    DataSourceID: number;
    VersionID: number | null;
    Filters: RowsFilter[];
    FreeText: string;
    PageNumber: number;
    PageSize: number;
}

export interface UpdateDataSourceRequest {
    DataSourceID: number;
    Name: string;
    Description: string;
}

export interface UpdateColumnMetaRequest {
    ColumnID: number;
    DisplayName: string;
    DataType: eDataType;
    FormatHint: eFormatHint;
    IsSearchable: boolean;
}

export interface ExportRequest {
    DataSourceID: number;
    VersionID: number | null;
    FileType: 'csv' | 'xlsx';
    NotifyEmail?: string;
}

export interface DataSourceLimits {
    MaxDataSources: number;
    MaxVersions: number;
    MaxRows: number;
    MaxColumns: number;
    MaxCellChars: number;
    MaxFileSizeKB: number;
    MaxSearchableColumnsPerVersion: number;
    CurrentDataSources: number;
    CurrentSearchableColumnsInVersion: number | null;
}

// Shape of DataSourceDetails.ResultsJson (parsed defensively in the summary dialog) — DB §7½.
export interface ResultsJsonChannel {
    matched: number;
    created: number;
    notFound: number;
    duplicates: number;
    noValue: number;
}
export interface ResultsJson {
    email?: ResultsJsonChannel;
    cell?: ResultsJsonChannel;
    rows?: { total: number; columns: number };
    truncatedCells?: number;
    invalidEmails?: number;
}
