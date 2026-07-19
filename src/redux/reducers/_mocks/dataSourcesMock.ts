// ─────────────────────────────────────────────────────────────────────────────
// RICH SIMULATION LAYER for the Data Sources feature (USE_DS_MOCK=true).
// Purpose: exercise EVERY screen / column type / source state / error path VISUALLY,
// without a live DB. Field names match DB §7½ exactly. The real API code
// (Controller/Logic/DTOs) is complete and correct against §7½ — flipping USE_DS_MOCK
// to false (a future product-owner step) swaps this layer for the real calls.
//
// Coverage:
//  • Column types: text (he/en) / number / currency (₪) / percent (%) / date / email / phone,
//    with edited display names (Phase 1).
//  • Source states: PENDING (spinner) / PROCESSING (partial %) / PROCESSING-DELAYED (>2h) /
//    READY / READY-view-only (no identity) / READY-dual-identity / FAIL (ErrorData) / CANCELLED.
//  • Per-channel ResultsJson (email & cell separate): matched/created/notFound/duplicates/noValue.
//  • Varied RowJson: numbers, currency, dates, long+truncated Hebrew text, empty values;
//    per-channel resolve states incl. duplicates and two different ClientIDs on one row.
//  • Error responses (machine tokens) via "magic" inputs — see MAGIC below.
//  • CheckQuota: full Limits incl. MaxSearchableColumnsPerVersion + near-quota current usage.
//
// MAGIC inputs (so error UI/toasts/helperText are testable):
//  • Upload a source named "כפול"  → 409 UPLOAD_IN_PROGRESS
//  • Upload a source named "ענק"   → 405 quota (file size)  ;  "מכסה" → 409 QUOTA_EXCEEDED (SP source/row cap)
//  • Rename a source to "תפוס"     → 409 NAME_EXISTS
//  • Delete source id 12           → 409 LOCKED_BY_CAMPAIGNS (+ campaigns list)
//  • Edit column "הערות" (id 508) → -7 TOO_MANY_SEARCHABLE ; "תאריך הצטרפות" (id 507) → -8 COLUMN_LOCKED_BY_CAMPAIGN
//  • Export with a NotifyEmail     → 202 RunningInBackground (else 201 ready)
// ─────────────────────────────────────────────────────────────────────────────

import {
    eDataSourceStatus,
    eDataType,
    eFormatHint,
    eMatchType,
    eSemanticRole
} from '../../../Models/DataSources/DataSource';

// ── columns: one of every type + format, edited display names, he/en headers ──
const richColumns = [
    { ColumnID: 501, Ordinal: 1, SourceHeader: 'email', DisplayName: 'אימייל', ColumnKey: 'c1', DataType: eDataType.EMAIL, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.RECIPIENT_EMAIL, IsSearchable: true },
    { ColumnID: 502, Ordinal: 2, SourceHeader: 'phone', DisplayName: 'סלולרי', ColumnKey: 'c2', DataType: eDataType.PHONE, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.RECIPIENT_CELLPHONE, IsSearchable: true },
    { ColumnID: 503, Ordinal: 3, SourceHeader: 'full name', DisplayName: 'שם מלא', ColumnKey: 'c3', DataType: eDataType.TEXT, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.NONE, IsSearchable: true },
    { ColumnID: 504, Ordinal: 4, SourceHeader: 'city', DisplayName: 'עיר', ColumnKey: 'c4', DataType: eDataType.TEXT, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.NONE, IsSearchable: true },
    { ColumnID: 505, Ordinal: 5, SourceHeader: 'total', DisplayName: 'סכום רכישה', ColumnKey: 'c5', DataType: eDataType.NUMBER, FormatHint: eFormatHint.CURRENCY, SemanticRole: eSemanticRole.NONE, IsSearchable: false },
    { ColumnID: 506, Ordinal: 6, SourceHeader: 'discount', DisplayName: 'אחוז הנחה', ColumnKey: 'c6', DataType: eDataType.NUMBER, FormatHint: eFormatHint.PERCENT, SemanticRole: eSemanticRole.NONE, IsSearchable: false },
    { ColumnID: 507, Ordinal: 7, SourceHeader: 'join date', DisplayName: 'תאריך הצטרפות', ColumnKey: 'c7', DataType: eDataType.DATE, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.NONE, IsSearchable: true },
    { ColumnID: 508, Ordinal: 8, SourceHeader: 'notes', DisplayName: 'הערות', ColumnKey: 'c8', DataType: eDataType.TEXT, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.NONE, IsSearchable: false }
];

// view-only source columns (no identity)
const viewOnlyColumns = [
    { ColumnID: 601, Ordinal: 1, SourceHeader: 'company', DisplayName: 'חברה', ColumnKey: 'c1', DataType: eDataType.TEXT, FormatHint: eFormatHint.NONE, SemanticRole: eSemanticRole.NONE, IsSearchable: true },
    { ColumnID: 602, Ordinal: 2, SourceHeader: 'revenue', DisplayName: 'מחזור', ColumnKey: 'c2', DataType: eDataType.NUMBER, FormatHint: eFormatHint.CURRENCY, SemanticRole: eSemanticRole.NONE, IsSearchable: true }
];

const twoHoursAgoIso = '2020-01-01T00:00:00'; // safely > 2h in the past → StatusChip shows "delayed"

const allItems = [
    { DataSourceID: 12, Name: 'לקוחות Q3', Description: 'ייצוא CRM רבעוני', CreatedBy: 'idan@leadfeed.io', CreatedDate: '2026-07-13T09:12:00', DataSourceVersionID: 31, VersionNumber: 2, Status: eDataSourceStatus.PROCESSING, TotalRows: 120000, ProcessedRows: 50400, ProgressPercent: 42, ResolvedRowsEmail: 40000, ResolvedRowsCell: 0, NoIdentityRows: 1800, DuplicateRows: 950, UploadedBy: 'idan@leadfeed.io', LastUploadDate: '2026-07-13T09:12:00', RunDateStart: '2026-07-13T09:13:20', HasEmailIdentity: true, HasCellIdentity: false },
    { DataSourceID: 13, Name: 'ספקים', Description: 'רשימת ספקים לצפייה', CreatedBy: 'idan@leadfeed.io', CreatedDate: '2026-07-12T11:00:00', DataSourceVersionID: 33, VersionNumber: 1, Status: eDataSourceStatus.READY, TotalRows: 540, ProcessedRows: 540, ProgressPercent: 100, ResolvedRowsEmail: 0, ResolvedRowsCell: 0, NoIdentityRows: 540, DuplicateRows: 0, UploadedBy: 'idan@leadfeed.io', LastUploadDate: '2026-07-12T11:00:00', RunDateStart: '2026-07-12T11:01:00', HasEmailIdentity: false, HasCellIdentity: false },
    { DataSourceID: 14, Name: 'אירועים', Description: 'קובץ שנכשל בעיבוד', CreatedBy: 'idan@leadfeed.io', CreatedDate: '2026-07-11T08:00:00', DataSourceVersionID: 34, VersionNumber: 1, Status: eDataSourceStatus.FAIL, TotalRows: null, ProcessedRows: null, ProgressPercent: null, ResolvedRowsEmail: 0, ResolvedRowsCell: 0, NoIdentityRows: 0, DuplicateRows: 0, UploadedBy: 'idan@leadfeed.io', LastUploadDate: '2026-07-11T08:00:00', RunDateStart: null, HasEmailIdentity: true, HasCellIdentity: true },
    { DataSourceID: 15, Name: 'מנויים 2026', Description: 'אימייל + סלולרי, כל סוגי העמודות', CreatedBy: 'dana@leadfeed.io', CreatedDate: '2026-07-10T14:30:00', DataSourceVersionID: 40, VersionNumber: 3, Status: eDataSourceStatus.READY, TotalRows: 8500, ProcessedRows: 8500, ProgressPercent: 100, ResolvedRowsEmail: 7200, ResolvedRowsCell: 6100, NoIdentityRows: 300, DuplicateRows: 210, UploadedBy: 'dana@leadfeed.io', LastUploadDate: '2026-07-10T14:30:00', RunDateStart: '2026-07-10T14:31:00', HasEmailIdentity: true, HasCellIdentity: true },
    { DataSourceID: 16, Name: 'רשימת המתנה', Description: 'ממתין בתור לעיבוד', CreatedBy: 'idan@leadfeed.io', CreatedDate: '2026-07-14T07:55:00', DataSourceVersionID: 41, VersionNumber: 1, Status: eDataSourceStatus.PENDING, TotalRows: null, ProcessedRows: null, ProgressPercent: null, ResolvedRowsEmail: 0, ResolvedRowsCell: 0, NoIdentityRows: 0, DuplicateRows: 0, UploadedBy: 'idan@leadfeed.io', LastUploadDate: '2026-07-14T07:55:00', RunDateStart: null, HasEmailIdentity: true, HasCellIdentity: false },
    { DataSourceID: 17, Name: 'לקוחות VIP', Description: 'עיבוד שנתקע (מתעכב)', CreatedBy: 'idan@leadfeed.io', CreatedDate: twoHoursAgoIso, DataSourceVersionID: 42, VersionNumber: 1, Status: eDataSourceStatus.PROCESSING, TotalRows: 50000, ProcessedRows: 12000, ProgressPercent: 24, ResolvedRowsEmail: 9000, ResolvedRowsCell: 3000, NoIdentityRows: 100, DuplicateRows: 50, UploadedBy: 'idan@leadfeed.io', LastUploadDate: twoHoursAgoIso, RunDateStart: twoHoursAgoIso, HasEmailIdentity: true, HasCellIdentity: true },
    { DataSourceID: 18, Name: 'קמפיין ישן', Description: 'גרסה שבוטלה', CreatedBy: 'idan@leadfeed.io', CreatedDate: '2026-06-01T10:00:00', DataSourceVersionID: 43, VersionNumber: 1, Status: eDataSourceStatus.CANCELLED, TotalRows: 0, ProcessedRows: 0, ProgressPercent: 0, ResolvedRowsEmail: 0, ResolvedRowsCell: 0, NoIdentityRows: 0, DuplicateRows: 0, UploadedBy: 'idan@leadfeed.io', LastUploadDate: '2026-06-01T10:00:00', RunDateStart: null, HasEmailIdentity: true, HasCellIdentity: false }
];

const RICH_RESULTS_JSON = JSON.stringify({
    email: { matched: 6000, created: 1200, notFound: 800, duplicates: 210, noValue: 300 },
    cell: { matched: 4500, created: 1600, notFound: 900, duplicates: 180, noValue: 2400 },
    rows: { total: 8500, columns: 8 },
    truncatedCells: 27,
    invalidEmails: 140
});

const versionsFor = (dsId: number) => {
    const it = allItems.find(i => i.DataSourceID === dsId);
    const active = it ? it.DataSourceVersionID : 40;
    const vn = it ? it.VersionNumber : 1;
    const out = [];
    for (let v = vn; v >= 1; v--) {
        out.push({
            DataSourceVersionID: active - (vn - v), VersionNumber: v,
            Status: eDataSourceStatus.READY, TotalRows: 8500 - (vn - v) * 500,
            ResolvedRowsEmail: 7200 - (vn - v) * 400, ResolvedRowsCell: 6100 - (vn - v) * 350,
            CreatedDate: '2026-07-10T14:30:00', UploadedBy: 'dana@leadfeed.io',
            PurgedDate: v === 1 && vn > 2 ? '2026-07-11T00:00:00' : null,
            FileName: `subscribers_v${v}.xlsx`
        });
    }
    return out;
};

// ── GET GetMany (with search filter + paging so the list controls are testable) ──
export const mockGetMany = (req: any) => {
    const term = (req?.SearchTerm || '').trim().toLowerCase();
    const filtered = term
        ? allItems.filter(i => i.Name.toLowerCase().includes(term) || (i.Description || '').toLowerCase().includes(term))
        : allItems;
    const page = req?.PageIndex ?? 1;
    const size = req?.PageSize ?? 6;
    const start = (page - 1) * size;
    return {
        StatusCode: 200, Message: '',
        Data: { items: filtered.slice(start, start + size), total: filtered.length, page, pageSize: size }
    };
};

// ── GET Get/{id} — details + columns + versions, varied by state ──
export const mockGet = (id: number) => {
    const it = allItems.find(i => i.DataSourceID === id) || allItems[3];
    const viewOnly = !it.HasEmailIdentity && !it.HasCellIdentity;
    const cols = viewOnly ? viewOnlyColumns : richColumns;
    return {
        StatusCode: 200, Message: '',
        Data: {
            details: {
                DataSourceID: it.DataSourceID, Name: it.Name, Description: it.Description,
                ActiveVersionID: it.DataSourceVersionID, Status: it.Status, TotalRows: it.TotalRows,
                ResolvedRowsEmail: it.ResolvedRowsEmail, ResolvedRowsCell: it.ResolvedRowsCell,
                NoIdentityRows: it.NoIdentityRows, DuplicateRows: it.DuplicateRows,
                HasEmailIdentity: it.HasEmailIdentity, HasCellIdentity: it.HasCellIdentity,
                CreatedBy: it.CreatedBy, CreatedDate: it.CreatedDate,
                ResultsJson: it.Status === eDataSourceStatus.READY ? RICH_RESULTS_JSON : null,
                VersionNumber: it.VersionNumber,
                FileName: viewOnly ? 'suppliers.csv' : 'subscribers.xlsx',
                FileSizeKB: viewOnly ? 220 : 8300,
                ErrorData: it.Status === eDataSourceStatus.FAIL ? 'שורה 4120: קידוד לא נתמך בעמודת האימייל (ISO-8859-8 → UTF-8 נכשל)' : null,
                RunDateStart: it.RunDateStart, RunDateEnd: it.Status === eDataSourceStatus.READY ? '2026-07-10T15:05:00' : null
            },
            columns: cols,
            versions: versionsFor(it.DataSourceID)
        }
    };
};

// ── POST GetRows — varied RowJson + per-channel resolve; basic filter/paging ──
const richRows = [
    { RowID: 9001, RowOrdinal: 1, Email: 'dana@b.com', CellphoneNormalized: '972501234567', EmailClientID: 444, CellClientID: 444, EmailMatchType: eMatchType.MATCHED, CellMatchType: eMatchType.MATCHED, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"dana@b.com","c2":"972501234567","c3":"דנה כהן","c4":"תל אביב","c5":"1200","c6":"15","c7":"2026-01-04","c8":"לקוחה ותיקה"}' },
    { RowID: 9002, RowOrdinal: 2, Email: 'ron@d.com', CellphoneNormalized: null, EmailClientID: 888, CellClientID: null, EmailMatchType: eMatchType.CREATED, CellMatchType: eMatchType.NO_VALUE, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"ron@d.com","c3":"רון לוי","c4":"חיפה","c5":"90","c6":"0","c7":"2025-11-20","c8":""}' },
    { RowID: 9003, RowOrdinal: 3, Email: 'sara@x.com', CellphoneNormalized: '972529998877', EmailClientID: 555, CellClientID: 777, EmailMatchType: eMatchType.MATCHED, CellMatchType: eMatchType.CREATED, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"sara@x.com","c2":"972529998877","c3":"שרה אברהם עם שם ארוך במיוחד שנחתך בתצוגה","c4":"ירושלים","c5":"45000","c6":"22.5","c7":"2024-03-15","c8":"הערה ארוכה מאוד שאמורה להיחתך אחרי מספר תווים כדי לבדוק את גלישת הטקסט בתא"}' },
    { RowID: 9004, RowOrdinal: 4, Email: 'dana@b.com', CellphoneNormalized: '972501234567', EmailClientID: 444, CellClientID: 444, EmailMatchType: eMatchType.MATCHED, CellMatchType: eMatchType.MATCHED, IsEmailDuplicate: true, IsCellDuplicate: true, RowJson: '{"c1":"dana@b.com","c2":"972501234567","c3":"דנה כהן (כפולה)","c4":"תל אביב","c5":"0","c6":"","c7":"","c8":"שורה כפולה"}' },
    { RowID: 9005, RowOrdinal: 5, Email: 'noemail', CellphoneNormalized: '9725500', EmailClientID: null, CellClientID: null, EmailMatchType: eMatchType.NOT_FOUND, CellMatchType: eMatchType.NOT_FOUND, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"","c2":"","c3":"","c4":"","c5":"","c6":"","c7":"","c8":"שורה ללא זהות"}' }
];

const viewOnlyRows = [
    { RowID: 8001, RowOrdinal: 1, Email: null, CellphoneNormalized: null, EmailClientID: null, CellClientID: null, EmailMatchType: eMatchType.NO_VALUE, CellMatchType: eMatchType.NO_VALUE, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"אלפא בעמ","c2":"1500000"}' },
    { RowID: 8002, RowOrdinal: 2, Email: null, CellphoneNormalized: null, EmailClientID: null, CellClientID: null, EmailMatchType: eMatchType.NO_VALUE, CellMatchType: eMatchType.NO_VALUE, IsEmailDuplicate: false, IsCellDuplicate: false, RowJson: '{"c1":"בטא שירותים","c2":"90000"}' }
];

export const mockGetRows = (req: any) => {
    // Match mockGet: a view-only source (no identity) returns its own columns + no-identity rows.
    const src = allItems.find(i => i.DataSourceID === req?.DataSourceID);
    const viewOnly = !!src && !src.HasEmailIdentity && !src.HasCellIdentity;
    const columns = viewOnly ? viewOnlyColumns : richColumns;
    let rows: any[] = viewOnly ? viewOnlyRows : richRows;
    const ft = (req?.FreeText || '').trim().toLowerCase();
    if (ft) rows = rows.filter(r => (r.RowJson || '').toLowerCase().includes(ft) || (r.Email || '').toLowerCase().includes(ft));
    const page = req?.PageNumber ?? 1;
    const size = req?.PageSize ?? 50;
    return {
        StatusCode: 200, Message: '',
        Data: { columns, rows: rows.slice((page - 1) * size, (page - 1) * size + size), total: rows.length, page, pageSize: size }
    };
};

// ── POST Insert — magic names trigger error responses ──
export const mockInsert = (formData?: any) => {
    let name = '';
    try { name = (formData && typeof formData.get === 'function' ? formData.get('name') : '') || ''; } catch { name = ''; }
    if (name === 'כפול') return { StatusCode: 409, Message: 'UPLOAD_IN_PROGRESS', Data: null };
    if (name === 'ענק') return { StatusCode: 405, Message: 'QUOTA_EXCEEDED', Data: null };   // file-size quota (controller)
    if (name === 'מכסה') return { StatusCode: 409, Message: 'QUOTA_EXCEEDED', Data: null };  // SP source/row-cap quota (-3)
    return { StatusCode: 202, Message: 'RunningInBackground', Data: { DataSourceID: 12, DataSourceVersionID: 32 } };
};

// ── PUT Update — magic name → NAME_EXISTS ──
export const mockUpdate = (req?: any) => {
    if (req && (req.Name || '').trim() === 'תפוס') return { StatusCode: 409, Message: 'NAME_EXISTS', Data: null };
    return { StatusCode: 200, Message: '', Data: true };
};

// ── PUT UpdateColumnMeta — magic ColumnIDs → -7 / -8 ──
export const mockUpdateColumnMeta = (req?: any) => {
    // Real seeded column IDs so the error UIs are reachable: 508 "הערות" → -7, 507 "תאריך הצטרפות" → -8.
    if (req && req.ColumnID === 508) return { StatusCode: 409, Message: 'TOO_MANY_SEARCHABLE', Data: null };
    if (req && req.ColumnID === 507) return { StatusCode: 409, Message: 'COLUMN_LOCKED_BY_CAMPAIGN', Data: null };
    return { StatusCode: 200, Message: '', Data: true };
};

// ── DELETE — id 12 is locked by active campaigns ──
export const mockDelete = (id?: number) => {
    if (id === 12) {
        return { StatusCode: 409, Message: 'LOCKED_BY_CAMPAIGNS', Data: { campaigns: [{ CampaignID: 701, CampaignName: 'ניוזלטר יולי' }, { CampaignID: 702, CampaignName: 'מבצע קיץ' }] } };
    }
    return { StatusCode: 200, Message: '', Data: true };
};

// ── POST Export — NotifyEmail → background(202), else ready(201) ──
export const mockExport = (req?: any) => {
    if (req && req.NotifyEmail) return { StatusCode: 202, Message: 'RunningInBackground', Data: { FileName: 'DataSource-export.csv', Rows: 8500 } };
    return { StatusCode: 201, Message: '', Data: { FileName: 'DataSource-export.csv', Rows: 3120 } };
};

// ── GET CheckQuota — full Limits, current usage near the searchable cap ──
export const mockCheckQuota = () => ({
    StatusCode: 200, Message: '',
    Data: {
        IsAllowed: true, Message: '',
        Limits: {
            MaxDataSources: 50, MaxVersions: 24, MaxRows: 500000, MaxColumns: 100,
            MaxCellChars: 1000, MaxFileSizeKB: 51200, MaxSearchableColumnsPerVersion: 10,
            CurrentDataSources: allItems.length, CurrentSearchableColumnsInVersion: 8
        }
    }
});
