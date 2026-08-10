// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchAdvanced — the UI-side vocabulary of the advanced filter builder and the sort picker
// (CONTRACT §2). No JSX, no MUI: this is the one place the operator numbers, the type→operator
// families and the coverage arithmetic are written down, so the builder, the chips and the sort
// picker cannot drift from each other.
//
// TARGET PATH: ReactCode\src\screens\SendSearch\components\SendSearchAdvanced.ts
//
// ── WHY THESE TYPES LIVE HERE AND NOT IN Models/DataSources/SendSearch.ts ────────────────────
// That file belongs to B4 and this one to B5 (CONTRACT §3). A single file may have exactly one
// owner, so B5 cannot add to it, and B5 must still compile while B4 is mid-flight. The shapes below
// are therefore a UI-LOCAL MIRROR of the wire contract, written to be STRUCTURALLY assignable to
// B4's types the moment they land — at which point this module's `SendSearchFilterRule` can become
// a re-export and nothing else changes. Recorded as a binding decision in LEDGER.md.
//
// ── OPERATORS ARE CONTRACT §2, FROZEN AND APPEND-ONLY ────────────────────────────────────────
//   1=EQUALS  2=STARTS_WITH  3=CONTAINS  5=GT  6=LT  7=GTE  8=LTE  9=BETWEEN
// 4 and 10 are RESERVED and unused in v1: `NOT_EQUALS` / `NOT_CONTAINS` are not expressible,
// because `DataSourceRowSearchValues` does not index empty values (`UpdateColumnMeta:176`) — so
// "has no value" and "is not indexed" are the same row, and a NOT operator would silently answer a
// different question than the one asked. They are absent from this file entirely rather than
// present-and-hidden: a constant that exists is a constant someone wires up.
// ═══════════════════════════════════════════════════════════════════════════════════════════

// ── the column data types, as `DataSourceColumns.DataType` emits them ────────────────────────
// Mirrors the families CONTRACT §2 freezes. Kept as plain numbers, not an enum with gaps invented
// by this file: the numbers are the SERVER's and this module only groups them.
export const DT_TEXT = 1;
export const DT_NUMBER = 2;
export const DT_DATE = 3;
export const DT_EMAIL = 4;
export const DT_PHONE = 5;

export const OP_EQUALS = 1;
export const OP_STARTS_WITH = 2;
export const OP_CONTAINS = 3;
export const OP_GT = 5;
export const OP_LT = 6;
export const OP_GTE = 7;
export const OP_LTE = 8;
export const OP_BETWEEN = 9;

// CONTRACT §2 "משפחות טיפוס", verbatim:
//   NUMBER(2) → 1,5,6,7,8,9 · DATE(3) → 1,5,6,9 · TEXT(1)/EMAIL(4)/PHONE(5) → 1,2,3
// DATE deliberately has NO 7/8 (GTE/LTE) — the contract's list stops at 6 — and this file does not
// "improve" on it. A UI that offers an operator the SP does not implement produces a filter that
// silently matches nothing, which is worse than an operator the user cannot reach.
const OPS_NUMBER: number[] = [OP_EQUALS, OP_GT, OP_LT, OP_GTE, OP_LTE, OP_BETWEEN];
const OPS_DATE: number[] = [OP_EQUALS, OP_GT, OP_LT, OP_BETWEEN];
const OPS_TEXT: number[] = [OP_EQUALS, OP_STARTS_WITH, OP_CONTAINS];

// A DataType this client has never heard of degrades to the TEXT family — the narrowest, safest
// set — instead of throwing or rendering an empty operator list. An empty operator select is a dead
// end the user cannot diagnose; three text operators against an unknown type at worst return no
// rows, which the empty state already explains.
export const operatorsFor = (dataType: number | null | undefined): number[] => {
    if (dataType === DT_NUMBER) return OPS_NUMBER;
    if (dataType === DT_DATE) return OPS_DATE;
    return OPS_TEXT;
};

// Which value control the row must render. Derived from (dataType, operator) TOGETHER, because
// BETWEEN is the only operator that needs a second box and it exists in two families.
export type ValueKind = 'text' | 'number' | 'numberRange' | 'date' | 'dateRange';

export const valueKindFor = (dataType: number | null | undefined, operator: number): ValueKind => {
    if (dataType === DT_NUMBER) return operator === OP_BETWEEN ? 'numberRange' : 'number';
    if (dataType === DT_DATE) return operator === OP_BETWEEN ? 'dateRange' : 'date';
    return 'text';
};

export const isRangeKind = (k: ValueKind): boolean => k === 'numberRange' || k === 'dateRange';

// ── one searchable field, as the server offers it ────────────────────────────────────────────
// IDENTITY IS `FieldKey` = `DataSourceColumns.SourceHeader` (CONTRACT §2). Never ColumnID (an
// IDENTITY that changes on every upload, and an IDOR), never ColumnKey (`c1`,`c2` — positional).
//
// `CampaignCount` / `TotalCampaigns` are the COVERAGE pair and they are not decoration. The search
// spans several campaigns; a column named "מספר פוליסה" may exist in two of the four data sources
// behind them. Filtering on it silently drops every row from the other two — the user asked to
// narrow by a field and got a narrower POPULATION instead, with nothing on screen saying so. The
// builder therefore prints "חל על 2 מתוך 4 קמפיינים" on the field itself.
export interface SendSearchField {
    FieldKey: string;
    DisplayName: string;
    DataType: number;
    CampaignCount: number;
    TotalCampaigns: number;
}

export const isPartialCoverage = (f: SendSearchField | null | undefined): boolean =>
    !!f && f.TotalCampaigns > 0 && f.CampaignCount > 0 && f.CampaignCount < f.TotalCampaigns;

// ── one rule in the builder ──────────────────────────────────────────────────────────────────
// Structurally the TVP row minus `FilterGroupID`, which CONTRACT §2 says the SERVER assigns by
// order — the client neither sends nor invents it. `Id` is a client-only React key: two rules on
// the same field with the same operator are legal, so the field key cannot be the list key.
// Values travel as STRINGS because the TVP columns are `nvarchar(400)`; the server owns the
// TRY_CONVERT (§2), and parsing them here would be a second, weaker parser disagreeing with it.
export interface SendSearchFilterRule {
    Id: string;
    FieldKey: string;
    Operator: number;
    Value1: string;
    Value2: string;
}

let ruleSeq = 0;
export const newFilterRule = (fieldKey: string, operator: number): SendSearchFilterRule => {
    ruleSeq += 1;
    return { Id: `r${ruleSeq}`, FieldKey: fieldKey, Operator: operator, Value1: '', Value2: '' };
};

// A rule is COMPLETE when it can be sent. Incomplete rules stay in the builder and are excluded
// from the request rather than sent with an empty value: an empty `Value1` against a CONTAINS is
// "match everything", which would silently widen the result set the user believes they narrowed.
export const isRuleComplete = (r: SendSearchFilterRule, f: SendSearchField | null | undefined): boolean => {
    if (!r.FieldKey || !f) return false;
    const kind = valueKindFor(f.DataType, r.Operator);
    if ((r.Value1 || '').trim() === '') return false;
    if (isRangeKind(kind) && (r.Value2 || '').trim() === '') return false;
    return true;
};

export const fieldByKey = (
    fields: SendSearchField[], key: string,
): SendSearchField | null => fields.filter((f) => f.FieldKey === key)[0] ?? null;

export const completeRules = (
    rules: SendSearchFilterRule[], fields: SendSearchField[],
): SendSearchFilterRule[] => rules.filter((r) => isRuleComplete(r, fieldByKey(fields, r.FieldKey)));

// ── sort ─────────────────────────────────────────────────────────────────────────────────────
// `FieldKey` empty = the server's default order. CONTRACT §2 requires a unique tie-breaker
// (`CampaignID, RecipientID`) and that is the SERVER's job — the client only names the field and
// the direction.
export type SortDir = 'asc' | 'desc';

export interface SendSearchSort {
    FieldKey: string;
    Dir: SortDir;
}

export const defaultSendSearchSort = (): SendSearchSort => ({ FieldKey: '', Dir: 'desc' });

// ── structural readers for the two NEW row fields ────────────────────────────────────────────
// B4 owns `SendSearchRow`, so B5 cannot declare `PreviewUrl` / `SortValueDisplay` on it. These two
// readers take a STRUCTURAL parameter instead of `SendSearchRow`: they accept today's row (field
// absent ⇒ `undefined`) and tomorrow's row (`string | null`) with no cast at either call site, and
// with no `as any` that would also swallow a genuine typo.
//
// `previewUrlOf` returns null for anything that is not a usable absolute URL. That is the single
// gate in front of the iframe, and it is deliberately strict: CONTRACT §1.1 — an id that carries a
// CampaignID without a clientid does NOT throw, it renders a GENERIC campaign that looks entirely
// plausible and is not this agent's mail. The server is what prevents that (it emits null); this
// reader prevents the other half — an iframe whose src is '' loads the HOSTING PAGE inside itself.
export const previewUrlOf = (row: { PreviewUrl?: string | null }): string | null => {
    const u = (row.PreviewUrl ?? '').trim();
    if (u === '') return null;
    // Only http(s). A relative or `javascript:` src is never something the server contract emits,
    // so anything else is either a bug or an injection and is treated as "no preview".
    if (u.indexOf('http://') !== 0 && u.indexOf('https://') !== 0) return null;
    return u;
};

export const sortValueDisplayOf = (row: { SortValueDisplay?: string | null }): string | null => {
    const v = (row.SortValueDisplay ?? '').trim();
    return v === '' ? null : v;
};
