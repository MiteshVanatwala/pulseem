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

// Matching roles ONLY. 1 and 2 are the identity columns the resolve procedure joins on.
//
// 3 and 4 are LEGACY and are no longer offered by the wizard: they were the two hard-coded
// name-enrichment roles, superseded by ClientFieldTarget below, which expresses the same idea for
// every writable field instead of two. They stay in the enum because they are seeded rows in
// dbo.LU_DataSourceSemanticRole behind an enforced FK — removing them would break that constraint.
// Verified 2026-08-05 against the live DB: roles 3/4 have ZERO rows in dbo.DataSourceColumns, so
// nothing in production ever used them and no back-compatibility path is required.
export enum eSemanticRole {
    NONE = 0,
    RECIPIENT_EMAIL = 1,
    RECIPIENT_CELLPHONE = 2,
    /** @deprecated superseded by eClientField.FIRST_NAME — never used in production. */
    FIRST_NAME = 3,
    /** @deprecated superseded by eClientField.LAST_NAME — never used in production. */
    LAST_NAME = 4
}

/**
 * WRITE-BACK TARGETS — "this column also updates the recipient's own record".
 *
 * Orthogonal to eSemanticRole on purpose: a column keeps whatever it already is (a plain info
 * field, or an identity column) and MAY ALSO carry one of these. That is why this is a separate
 * nullable property rather than more eSemanticRole values — ~26 new roles would each have needed a
 * seeded lookup row behind an FK and a filtered unique index on dbo.DataSourceColumns.
 *
 * Numbering is blocked so the origin of every id is readable at a glance and the blocks can grow
 * independently. These values are persisted, so they are append-only — never renumber.
 *   1..99    columns of dbo.clients
 *   101..113 dbo.ClientExtraData.ExtraField1..13
 *   201..204 dbo.ClientExtraData.ExtraDate1..4
 *
 * NEVER offered, deliberately: Email and Cellphone (the identity keys the run matches on — writing
 * them mid-run would mutate what the run is matching against), Status and SmsStatus (consent, not
 * profile data), and every behavioural/system column.
 */
export enum eClientField {
    FIRST_NAME = 1,
    LAST_NAME = 2,
    TELEPHONE = 3,
    ADDRESS = 4,
    CITY = 5,
    STATE = 6,
    COUNTRY = 7,
    ZIP = 8,
    BIRTH_DATE = 9,
    COMPANY = 10,

    EXTRA_FIELD_1 = 101, EXTRA_FIELD_2 = 102, EXTRA_FIELD_3 = 103, EXTRA_FIELD_4 = 104,
    EXTRA_FIELD_5 = 105, EXTRA_FIELD_6 = 106, EXTRA_FIELD_7 = 107, EXTRA_FIELD_8 = 108,
    EXTRA_FIELD_9 = 109, EXTRA_FIELD_10 = 110, EXTRA_FIELD_11 = 111, EXTRA_FIELD_12 = 112,
    EXTRA_FIELD_13 = 113,

    EXTRA_DATE_1 = 201, EXTRA_DATE_2 = 202, EXTRA_DATE_3 = 203, EXTRA_DATE_4 = 204
}

/** Highest id the server accepts. Mirrored in C# (DataSourcesController) — keep both in step. */
export const CLIENT_FIELD_MAX_ID = 204;

export interface ClientFieldOption {
    Id: eClientField;
    /** i18n key, for the fixed profile fields only. */
    LabelKey?: string;
    /** The account's own name for an extra field (dbo.AccountExtraFields). Blank => not offered. */
    AccountLabel?: string;
    /** Target column width. Longer source values are truncated to fit. Null for dates. */
    MaxLength: number | null;
    IsDate: boolean;
    Group: 'recipient' | 'extraField' | 'extraDate';
}

/**
 * The fixed half of the catalogue. Lengths mirror dbo.clients exactly (verified 2026-08-05):
 * every text target is nvarchar(100) except Zip, which is nvarchar(50).
 * The extra-field half is per-account and comes from the server — only the account knows what it
 * calls ExtraField7.
 */
export const CLIENT_FIELD_CATALOGUE: ClientFieldOption[] = [
    { Id: eClientField.FIRST_NAME, LabelKey: 'firstName', MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.LAST_NAME,  LabelKey: 'lastName',  MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.TELEPHONE,  LabelKey: 'telephone', MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.ADDRESS,    LabelKey: 'address',   MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.CITY,       LabelKey: 'city',      MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.STATE,      LabelKey: 'state',     MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.COUNTRY,    LabelKey: 'country',   MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.ZIP,        LabelKey: 'zip',       MaxLength: 50,   IsDate: false, Group: 'recipient' },
    { Id: eClientField.COMPANY,    LabelKey: 'company',   MaxLength: 100,  IsDate: false, Group: 'recipient' },
    { Id: eClientField.BIRTH_DATE, LabelKey: 'birthDate', MaxLength: null, IsDate: true,  Group: 'recipient' }
];

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
    /**
     * Optional write-back target on the recipient's own record. null / absent = this column only
     * lives in the source, which is the default and what every existing version reads back as.
     * Appended LAST on purpose: dbo.DataSourceColumnType binds by column ORDER, so a new member
     * may only ever be added at the end and existing members may never be reordered or removed.
     */
    ClientFieldTarget?: eClientField | null;
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
