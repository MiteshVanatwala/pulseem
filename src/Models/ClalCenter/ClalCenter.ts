// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLAL CENTER — DTOs and codes.
//
// SHAPES ARE THE CONTRACT. Property names are 1:1 case-sensitive aliases of the wire shapes in
// 11-CONTRACTS v12 §C2 (PascalCase — verified: there is no camelCase resolver in WebApiConfig /
// Global.asax, so the API serialises the C# property names verbatim). Do NOT rename, do NOT
// "fix" the casing, and do NOT add fields the contract does not carry.
//
// ⚠️ `GroupKind` DOES NOT EXIST HERE, in any form. v12 removed it: the tree is fully editable
// content, a category is `ParentGroupID === null` and nothing else. Two sources of truth for one
// fact is a bug generator (11-CONTRACTS v12 §C7, LEDGER 2026-08-25).
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * i18n namespace prefix. Every string in the screen goes through `t(`${CC}...`)` — zero hardcoded
 * copy (14-W3 "מוסכמות"). Same idiom as `SS` in Models/DataSources/SendSearch.ts.
 */
export const CC = 'ClalCenter.';

/** ClalCenter_Items.ItemType — 11-CONTRACTS §C7. */
export enum eClalItemType {
    LINK = 1,
    FILE = 2,
    INFO = 3
}

/**
 * ClalCenter_Items.Status — 11-CONTRACTS §C7.
 *
 * ⚠️ This is NOT `eDataSourceStatus`, and `StatusChip` (which takes that enum) must never be
 * reused for these values: TypeScript happily accepts a numeric literal for a numeric enum, so
 * a mistaken reuse COMPILES and then silently paints "פורסם" as "בעיבוד". `ClalStatusChip` is
 * the only chip that may render these (C6 v12 §4).
 */
export enum eClalItemStatus {
    DRAFT = 0,
    PUBLISHED = 1,
    HIDDEN = 2
}

/** ClalCenter_ChangeLog.EntityType — 11-CONTRACTS §C7. */
export enum eClalEntityType {
    ITEM = 1,
    GROUP = 2
}

export interface GroupDto {
    GroupID: number;
    /** null ⇒ this row IS a category. The single source of truth for "category vs sub-group". */
    ParentGroupID?: number | null;
    Title: string;
    SortOrder: number;
    IsHidden: boolean;
    UpdatedBy?: string | null;
    UpdatedDate?: string | null;
}

export interface ItemDto {
    ItemID: number;
    GroupID: number;
    ItemType: eClalItemType;
    Title: string;
    Description?: string | null;
    /** CSV in the DB, array on the wire — the Logic layer converts both ways (§C2 DTOs). */
    Keywords: string[];
    /**
     * file ⇒ ABSOLUTE display url, composed by the server from `ClalCenter.PublicBaseUrl`.
     * link ⇒ the external target itself.  info ⇒ null.
     */
    Url?: string | null;
    /** "files/{guid}.{ext}" — what is actually stored in the DB. null when there is no file. */
    FileRelativePath?: string | null;
    FileName?: string | null;
    Mime?: string | null;
    SizeBytes?: number | null;
    InfoText?: string | null;
    SortOrder: number;
    Status: eClalItemStatus;
    /** What the status was before it was hidden (0/1), so "החזרה" is reliable. */
    PrevStatus?: eClalItemStatus | null;
    UpdatedBy?: string | null;
    UpdatedDate?: string | null;
}

export interface ChangeRowDto {
    FieldName: string;
    OldValue?: string | null;
    NewValue?: string | null;
    ChangedBy?: string | null;
    OnDate: string;
}

export interface ClalCenterConfig {
    /** No trailing slash. Used in the admin only to compose display URLs from FileRelativePath. */
    PublicBaseUrl: string;
    /** Where "צפייה בפורטל ↗" points. Derived server-side from PublicBaseUrl. */
    PortalUrl: string;
    /**
     * `Publications.CreatedDate` of the active publication — deliberately NOT CompletedDate
     * (§C2: an edit landing between snapshot and completion would make the badge lie).
     * Server clock, no trailing Z; client comparisons are clock-vs-clock.
     */
    LastPublishedOn?: string | null;
    /** Result of SP14 — site-affecting changes only. Draft work never lights this. */
    PendingSiteUpdate: boolean;
}

export interface GetTreeResponse {
    Groups: GroupDto[];
    Items: ItemDto[];
    Config: ClalCenterConfig;
}

/** What `UploadFile` hands back, and what `SaveItem.FileRef` carries onward. */
export interface FileRefDto {
    StorageName: string;
    RelativePath: string;
    OriginalName: string;
    Mime: string;
    SizeBytes: number;
}

export interface UploadFileResponse extends FileRefDto {
    /** Absolute, for immediate preview in the drawer before anything is saved. */
    Url: string;
}

// ── Requests ────────────────────────────────────────────────────────────────────────────────

export interface SaveGroupRequest {
    GroupID?: number;
    /** Only on insert. null/absent ⇒ new category. */
    ParentGroupID?: number | null;
    /**
     * The ONLY way to move a sub-group to another category. A rename must never carry it —
     * SP2 branch (א) leaves ParentGroupID untouched precisely so rename can never reparent.
     */
    NewParentGroupID?: number;
    Title: string;
}

export interface ReorderGroupsRequest {
    /** null ⇒ the root list (categories). */
    ParentGroupID?: number | null;
    OrderedGroupIds: number[];
}

export interface ReorderItemsRequest {
    GroupID: number;
    OrderedItemIds: number[];
}

export interface SaveItemRequest {
    ItemID?: number;
    GroupID: number;
    ItemType: eClalItemType;
    Title: string;
    Description?: string | null;
    Keywords: string[];
    Url?: string | null;
    /** Absent ⇒ the server keeps whatever file the item already has (COALESCE, §C1 SP5). */
    FileRef?: FileRefDto | null;
    InfoText?: string | null;
    /** Applied on CREATE only. On update the server ignores it — status moves through SetStatus. */
    Status: eClalItemStatus;
}

/** Empty / missing ItemIds ⇒ rebuild-only: applies hides/deletes without promoting any draft. */
export interface PublishRequest {
    ItemIds?: number[];
}

export interface PublishResult {
    PublicationID: number;
    ItemCount: number;
    PublishedUrl: string;
}

export interface UpdatedResult {
    Updated: number;
}

export interface SaveGroupResult {
    GroupID: number;
}

// ── Error keys (§C2 table + the two added in v12) ────────────────────────────────────────────
// W2 returns KEYS ONLY; the Hebrew lives in ClalCenter.he.json. `publish_partial` must never be
// rendered with "האתר לא השתנה" copy — the file IS already live at that point.
export type ClalErrorKey =
    | 'title_required'
    | 'url_required'
    | 'url_invalid'
    | 'infotext_required'
    | 'file_required'
    | 'ext_not_allowed'
    | 'file_too_large'
    | 'keywords_too_long'
    | 'group_not_empty'
    | 'publish_failed'
    | 'publish_partial'
    | 'depth_exceeded'
    | 'tenant_forbidden'
    | 'server_error';

/**
 * The house response envelope (`PulseemResponse`). StatusCode carries the semantic code:
 * 0 OK · 400 validation (Message = an error key) · 403 tenant_forbidden · 500 server_error.
 */
export interface PulseemResponse<T = any> {
    StatusCode: number;
    Message?: string | null;
    Data?: T;
}
