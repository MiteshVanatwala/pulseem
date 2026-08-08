// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearch (חיפוש שליחות) models — V1.
//
// DELIVERY PATH:  _delivery\SendSearch-V1\react\Models\SendSearch.ts
// TARGET PATH:    ReactCode\src\Models\DataSources\SendSearch.ts   (CONTRACT §4.3)
//
// Mirrors C# `DAL.Models.DataSources.SendSearchModels` (CONTRACT §3.2) and
// `SendProvenanceModels` (§3.1) FIELD-FOR-FIELD: same PascalCase names, same nullability.
// PascalCase = server JSON keys (PulseemResponse.Data shapes) — no client renaming, exactly as
// Models/DataSources/SmartSend.ts:4 states for the SmartSend contract.
//
// C#→TS nullability mapping used throughout (same as SmartSend.ts):
//   int?        → number | null
//   string      → string          (reference type; the SPs project '' rather than NULL for names,
//                                  but a nullable string is still tolerated by every consumer here)
//   DateTime?   → string | null   (JSON.NET serialises DateTime as an ISO-8601 STRING; there is no
//                                  Date object on the wire — moment() parses it at render time)
//   bool        → boolean
//   byte/tinyint→ number (eSendChannel)
// ═══════════════════════════════════════════════════════════════════════════════════════════

import { eSendChannel } from './SmartSend';
// From the NEUTRAL leaf module, never from './DataSource': DataSource.ts consumes `eFilterOperator`
// (RowsFilter.Operator), so importing from it here would close a direct cycle.
import { eDataType, eFilterOperator } from './DataSourceEnums';

// i18n namespace prefix. The repo convention is one JSON namespace per file whose NAME prefixes
// every key — `dataSourcesSlice.ts:175` uses 'DataSources.errors.generalError' for the file
// `translations/he/DataSources.he.json`. CONTRACT §4.1 names the new namespace `SendSearch` and
// lists the keys WITHOUT that prefix (`title`, `col.recipient`, …), so the runtime key is
// `SendSearch.` + the contract key. Declared once, here, so eight components cannot drift.
export const SS = 'SendSearch.';

// ── filter enums (mirror the tinyint params of dbo.DataSources_SearchSends, CONTRACT §2.2) ──
// Values are the WIRE values. Never reorder — 0/1/2 are the SP's contract.
export enum eRoleFilter { All = 0, Agent = 1, Supervisor = 2 }
export enum eRowKind { All = 0, Agents = 1, Rollup = 2 }

// ── provenance / version domains (CONTRACT D7, D8) ──────────────────────────────────────────
// String unions, NOT booleans: V2 (§9) slots a per-recipient snapshot in at position 0 of the
// precedence ladder, which a bool could not express.
export type ProvenanceSource = 'Recorded' | 'Inferred' | 'Unverifiable';
export type VersionState = 'Available' | 'Purged' | 'Scrubbed';

// Runtime membership sets. These exist so that a value arriving from the server that is NOT in the
// domain can be DETECTED (and rendered as the honest fallback) instead of being interpolated into
// a missing i18n key. They are not translation tables — they map nothing.
export const PROVENANCE_SOURCES: readonly ProvenanceSource[] = ['Recorded', 'Inferred', 'Unverifiable'];
export const VERSION_STATES: readonly VersionState[] = ['Available', 'Purged', 'Scrubbed'];

export const isProvenanceSource = (v: string | null | undefined): v is ProvenanceSource =>
    !!v && PROVENANCE_SOURCES.indexOf(v as ProvenanceSource) > -1;
export const isVersionState = (v: string | null | undefined): v is VersionState =>
    !!v && VERSION_STATES.indexOf(v as VersionState) > -1;

// ── per-channel status vocabulary — TYPES that document a SERVER expectation ────────────────
// `SendSearch-Mock-v3.html:92-96` / `:229-238` state the rule in prose:
//   "Vocabulary is per-channel and never borrows: email cannot say 'נמסר' (it has no delivery
//    confirmation), SMS cannot say 'נפתח' (no such concept)."
//
// READ THAT RULE CAREFULLY: it says what the SERVER may EMIT for a channel. It is not a licence for
// the CLIENT to delete a value it was handed. CONTRACT §2.2 froze ONE flat domain per field, and
// neither §2.2/§4.2 nor RESUME.md §3 narrows it per channel — so these unions are documentation and
// authoring-time typing only, and the runtime gate is the flat `DELIVERY_STATES`/`ENGAGEMENT_STATES`
// below. A value that is wrong for its channel is a server bug; suppressing it on screen would hide
// the only evidence of that bug, and would look identical to the server having sent nothing.
//
// The union members are the subset of the CONTRACT §2.2 server-normalised domain that each channel
// can actually prove:
//   • Email    has NO delivery receipt      → 'Delivered' is absent from EmailDeliveryState.
//   • SMS      has NO open/read metric      → SmsEngagementState carries no 'Opened'/'Read'/'Clicked'.
//   • 'NoSession'     is a WhatsApp-only failure (no open 24h session window).
//   • 'InvalidNumber' is cell-side only     → absent from Email.
//   • 'Read'/'Replied' are WhatsApp-only    → absent from Email ('Opened'/'Clicked' instead).
// Hand-written code that assigns an SMS state into an email slot therefore does not compile — which
// is where the mock's rule belongs, at authoring time. The live production bug this feature exists
// to prevent (a per-message WhatsApp code decoded by a transcription of the global campaign-lifecycle
// enum, exporting failed messages as "נשלח" — RecipientReport.tsx:510-522) was a CLIENT deciding what
// a code means. Silently discarding a state because it is unexpected for its channel is the same
// class of client-side judgement, so it is not done: see the runtime gate below.
export type EmailDeliveryState =
    'Pending' | 'Sent' | 'Failed' | 'Unsubscribed' | 'Canceled' | 'Stopped' | 'Unknown';
export type SmsDeliveryState =
    'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Unsubscribed' | 'Canceled' | 'Stopped' | 'InvalidNumber' | 'Unknown';
export type WhatsAppDeliveryState =
    'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Unsubscribed' | 'Canceled' | 'Stopped' | 'InvalidNumber' | 'NoSession' | 'Unknown';

export type EmailEngagementState = 'None' | 'Opened' | 'Clicked' | 'Unknown';
export type SmsEngagementState = 'None' | 'Unknown';
export type WhatsAppEngagementState = 'None' | 'Read' | 'Replied' | 'Unknown';

// The full server domains (CONTRACT §2.2). Used ONLY as the union of the per-channel unions —
// never as the vocabulary a single channel is allowed to speak.
export type AnyDeliveryState = EmailDeliveryState | SmsDeliveryState | WhatsAppDeliveryState;
export type AnyEngagementState = EmailEngagementState | SmsEngagementState | WhatsAppEngagementState;

export type DeliveryStateOf<C extends eSendChannel> =
    C extends eSendChannel.EMAIL ? EmailDeliveryState :
    C extends eSendChannel.SMS ? SmsDeliveryState :
    C extends eSendChannel.WHATSAPP ? WhatsAppDeliveryState :
    never;

export type EngagementStateOf<C extends eSendChannel> =
    C extends eSendChannel.EMAIL ? EmailEngagementState :
    C extends eSendChannel.SMS ? SmsEngagementState :
    C extends eSendChannel.WHATSAPP ? WhatsAppEngagementState :
    never;

// ── the RUNTIME domain is the CONTRACT §2.2 domain, FLAT — not the per-channel subset ───────
// CONTRACT §2.2 freezes ONE domain for each field and says of it: "Never emit a raw provider code.
// An unmapped code maps to `Unknown` and MUST NOT be silently coerced to a plausible value." That
// is a rule about what the SERVER emits. Neither §2.2/§4.2 nor RESUME.md §3 authorises the CLIENT
// to drop a value the server did send because of the channel it arrived on — and dropping one is
// indistinguishable, on screen, from the server having sent nothing.
//
// So these two lists are the ONLY runtime gate: in-domain → rendered as itself; anything else
// (including NULL, which the server can return although the C# DTO's `string` does not say so)
// → 'Unknown', which has a visible i18n key. Nothing is ever suppressed for being unexpected on
// its channel; an unexpected-for-channel value is a SERVER defect and must be visible to be fixed.
export const DELIVERY_STATES: readonly AnyDeliveryState[] = [
    'Pending', 'Sent', 'Delivered', 'Failed', 'Unsubscribed',
    'Canceled', 'Stopped', 'InvalidNumber', 'NoSession', 'Unknown',
];
export const ENGAGEMENT_STATES: readonly AnyEngagementState[] = [
    'None', 'Opened', 'Clicked', 'Read', 'Replied', 'Unknown',
];

// Per-channel EXPECTATION, kept as documentation and as the twin of the union types above — it
// records which members of the flat domain each channel can actually prove, which is what the mock
// (`:92-96`, `:229-238`) asks the SERVER to honour. It is deliberately NOT consulted at render
// time any more: doing so made the client silently delete server data (see the note above).
export const DELIVERY_VOCABULARY: { [c: number]: readonly string[] } = {
    [eSendChannel.EMAIL]: ['Pending', 'Sent', 'Failed', 'Unsubscribed', 'Canceled', 'Stopped', 'Unknown'],
    [eSendChannel.SMS]: ['Pending', 'Sent', 'Delivered', 'Failed', 'Unsubscribed', 'Canceled', 'Stopped', 'InvalidNumber', 'Unknown'],
    [eSendChannel.WHATSAPP]: ['Pending', 'Sent', 'Delivered', 'Failed', 'Unsubscribed', 'Canceled', 'Stopped', 'InvalidNumber', 'NoSession', 'Unknown'],
};

export const ENGAGEMENT_VOCABULARY: { [c: number]: readonly string[] } = {
    [eSendChannel.EMAIL]: ['None', 'Opened', 'Clicked', 'Unknown'],
    [eSendChannel.SMS]: ['None', 'Unknown'],
    [eSendChannel.WHATSAPP]: ['None', 'Read', 'Replied', 'Unknown'],
};

// A channel line as rendered by SendStatusCell — one entry per channel ACTUALLY attempted
// (`Mock-v3:233-238`: "A channel never tried simply has no line — no dash matrix is ever created").
// The states are the FLAT §2.2 domain, not the per-channel subset: the renderer shows whatever the
// server sent (see DELIVERY_STATES above). `Channel` stays on the line because the line is LABELLED
// with its channel — it is no longer a discriminant that restricts the vocabulary.
export interface ChannelAttempt {
    Channel: eSendChannel;
    DeliveryState: AnyDeliveryState;
    EngagementState: AnyEngagementState;
    EvidenceAt: string | null;
}

// The wire shape of one channel line, exactly as the server sends it.
// NULLABLE on purpose: the C# DTO declares `public string DeliveryState` — a REFERENCE type, so
// `null` is a legal value of it — and the SP projects NULL whenever the cell-side row is absent.
// Declaring these non-nullable made `null` a compile-time impossibility and a run-time crash
// (`null.charAt(0)`), and tsc is not a gate in this repo (CONTRACT §4). The type now matches reality.
export interface RawChannelAttempt {
    Channel: eSendChannel;
    DeliveryState: string | null;
    EngagementState: string | null;
    EvidenceAt: string | null;
}

// camelCase of a PascalCase domain member: 'InvalidNumber' → 'invalidNumber', 'Sent' → 'sent'.
// Every §2.2 domain member is a single PascalCase token, so lower-casing the first character is the
// whole transformation — no word splitting, no acronym special-casing, nothing to get wrong.
//
// NULL-SAFE, and that is load-bearing rather than defensive: this function is called to BUILD an
// i18n key, its argument comes straight off the wire, and the wire can carry NULL. `null.charAt(0)`
// is a TypeError that unmounts the whole grid — the single worst failure this screen can have, and
// one tsc could never catch while the DTO declared the field non-nullable. Null/empty resolves to
// the same 'unknown' every other unrecognised value resolves to, so the key always exists (§4.1
// defines `delivery.unknown` and `engagement.unknown`) and the cell is never blank.
export const camelCaseState = (s: string | null | undefined): string =>
    (s ? s.charAt(0).toLowerCase() + s.slice(1) : 'unknown');

// ── the ONE narrowing point: wire strings → the frozen §2.2 domain ──────────────────────────
// Lives here, in the contract module, and NOT in a component: no component may contain a dictionary,
// map, switch or lookup of its own (CONTRACT §4.2 / D10). This function maps NOTHING — it answers
// one question, "is this string a member of the frozen domain", and everything outside it (an
// unmapped provider code, a typo, NULL, '') becomes 'Unknown', which has a visible i18n key. It
// never substitutes a plausible value and it never DROPS a value that is inside the domain.
//
// EVERY component that renders a state must call this. Four call sites used to bypass it and build
// `delivery.*` / `engagement.*` keys straight from the raw row — so a value like 'Bounced' produced
// "סטטוס לא מזוהה" in one cell and the literal untranslated key `SendSearch.delivery.bounced` in the
// cell beside it. That split is the D10 failure mode, one component away from `renderSMSStatus`.
export const toChannelAttempt = (raw: RawChannelAttempt): ChannelAttempt => {
    const dOk = !!raw.DeliveryState && DELIVERY_STATES.indexOf(raw.DeliveryState as AnyDeliveryState) > -1;
    const eOk = !!raw.EngagementState && ENGAGEMENT_STATES.indexOf(raw.EngagementState as AnyEngagementState) > -1;
    return {
        Channel: raw.Channel,
        // The casts are safe by construction: each value was just proven to be a member of the list
        // that is the runtime twin of the union it is cast to.
        DeliveryState: (dOk ? raw.DeliveryState : 'Unknown') as AnyDeliveryState,
        EngagementState: (eOk ? raw.EngagementState : 'Unknown') as AnyEngagementState,
        EvidenceAt: raw.EvidenceAt,
    };
};

// Severity of a delivery state, for colour only. Deliberately NOT keyed by provider code and
// deliberately NOT exhaustive-by-lookup: it answers a visual question ("is this bad news?"),
// never "what does this code mean". It is defined here, once, rather than inside a component.
export type StateTone = 'ok' | 'bad' | 'warn' | 'muted';

// Visual severity of a state. This is NOT a status decoder: it does not translate a code into a
// meaning, it answers "is this good news, bad news or neither" about a value whose meaning the
// SERVER already decided (§2.2). It lives here rather than in a component so there is exactly one
// copy — a per-component copy is precisely how `renderSMSStatus` (RecipientReport.tsx:510-522) came
// to exist. Anything not listed — including 'Unknown' — is 'muted': never green, because "we do not
// know" must never look like success.
const BAD_DELIVERY: readonly string[] = ['Failed', 'InvalidNumber', 'NoSession'];
const WARN_DELIVERY: readonly string[] = ['Unsubscribed', 'Canceled', 'Stopped'];
const OK_DELIVERY: readonly string[] = ['Delivered'];

// `string | null | undefined`, for the same reason `camelCaseState` is: the wire can carry NULL.
// An unlisted value — including NULL and 'Unknown' — is 'muted'. Never green: "we do not know"
// must never look like success.
export const deliveryTone = (state: string | null | undefined): StateTone => {
    if (!state) return 'muted';
    if (BAD_DELIVERY.indexOf(state) > -1) return 'bad';
    if (WARN_DELIVERY.indexOf(state) > -1) return 'warn';
    if (OK_DELIVERY.indexOf(state) > -1) return 'ok';
    // 'Sent' is deliberately NOT 'ok'. Email has no delivery receipt (Mock-v3:211,442), so "נשלח"
    // is a statement about US, not about the recipient's mailbox — colouring it green is the
    // over-claim the mock's copy warns against.
    return 'muted';
};

// Engagement is the strongest available evidence, so a real engagement is the only 'ok' in the
// screen. 'None' is 'muted', never red: absence of an open record is not proof of non-reading
// (Mock-v3:210 — open tracking is image-load based).
const OK_ENGAGEMENT: readonly string[] = ['Opened', 'Clicked', 'Read', 'Replied'];

export const engagementTone = (state: string | null | undefined): StateTone =>
    (!!state && OK_ENGAGEMENT.indexOf(state) > -1) ? 'ok' : 'muted';

// ═══════════════════════════════════════════════════════════════════════════════════════════
// COLUMN FILTERS + SORT — the single home of the filter vocabulary (CONTRACT §2)
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Same rule as the status vocabulary above (D10): NO component may carry its own map, switch or
// lookup of "which operators does this data type allow" / "does this operator need a second value".
// The moment two components each own a copy, one of them acquires an operator the SP will reject —
// and the user finds out as a red error on a filter the UI itself offered them.
//
// `eFilterOperator` itself is NOT declared here any more — it lives in `./DataSourceEnums`, the
// neutral leaf module, together with the reserved-value rationale for 4 and 10. It moved because
// `DataSource.ts` declared a rival THREE-value copy of the same enum: identical wire values, so
// nothing on the wire disagreed, but no file could import both and the old DataSources filter bar
// imported the short one. It is re-exported from here unchanged, so every `from
// '.../Models/DataSources/SendSearch'` import of it keeps working.
export { eFilterOperator } from './DataSourceEnums';

// Which operators a column of each type may offer, per CONTRACT §2 ("משפחות טיפוס"):
//   NUMBER(2) → 1,5,6,7,8,9 · DATE(3) → 1,5,6,9 · TEXT(1)/EMAIL(4)/PHONE(5) → 1,2,3
// DATE has no GTE/LTE on purpose: comparison is on `CAST(... AS date)` and `BETWEEN` is INCLUSIVE of
// both ends (§2), so "on or after X" is already what `>= X` means at date granularity — offering a
// second spelling of the same predicate is two ways to ask one question, and they must never differ.
// TEXT/EMAIL/PHONE get no ordering operators: the indexed value is a string, and `>` on a string is
// a collation question the user did not think they were asking.
export const OPERATORS_BY_TYPE: { [dt: number]: readonly eFilterOperator[] } = {
    [eDataType.TEXT]: [eFilterOperator.EQUALS, eFilterOperator.STARTS_WITH, eFilterOperator.CONTAINS],
    [eDataType.NUMBER]: [eFilterOperator.EQUALS, eFilterOperator.GT, eFilterOperator.LT,
        eFilterOperator.GTE, eFilterOperator.LTE, eFilterOperator.BETWEEN],
    [eDataType.DATE]: [eFilterOperator.EQUALS, eFilterOperator.GT, eFilterOperator.LT, eFilterOperator.BETWEEN],
    [eDataType.EMAIL]: [eFilterOperator.EQUALS, eFilterOperator.STARTS_WITH, eFilterOperator.CONTAINS],
    [eDataType.PHONE]: [eFilterOperator.EQUALS, eFilterOperator.STARTS_WITH, eFilterOperator.CONTAINS],
};

// The lookup every component must use. Returns the TEXT family for an unknown/absent type rather
// than an empty list: an unrecognised tinyint from the server is a server defect, and answering it
// with "no operators at all" renders a filter row that cannot be completed and cannot be explained.
// EQUALS/STARTS_WITH/CONTAINS are safe against any indexed value, so the degraded answer is still a
// working filter. Never returns undefined — a caller holding `undefined.map` unmounts the bar.
export const operatorsForType = (dt: eDataType | number | null | undefined): readonly eFilterOperator[] =>
    OPERATORS_BY_TYPE[dt as number] ?? OPERATORS_BY_TYPE[eDataType.TEXT];

// BETWEEN is the ONLY operator with a second value (`dbo.SendSearchFilterType.Value2` — "BETWEEN
// בלבד", §2). Asked here rather than compared inline, so no component grows its own copy of the rule.
export const operatorNeedsValue2 = (op: eFilterOperator): boolean => op === eFilterOperator.BETWEEN;

// i18n key SUFFIX for an operator — the twin of `camelCaseState` above, and here for the same
// reason: building `filter.op.` + a hand-written string in a component is how one cell renders a
// translated label and the cell beside it renders the raw key. Namespace is `SS` (= 'SendSearch.'),
// so the runtime key is `SendSearch.filter.op.between`.
// An unknown operator resolves to 'unknown', which HAS a key — never to a blank chip.
const OPERATOR_KEYS: { [op: number]: string } = {
    [eFilterOperator.EQUALS]: 'equals',
    [eFilterOperator.STARTS_WITH]: 'startsWith',
    [eFilterOperator.CONTAINS]: 'contains',
    [eFilterOperator.GT]: 'gt',
    [eFilterOperator.LT]: 'lt',
    [eFilterOperator.GTE]: 'gte',
    [eFilterOperator.LTE]: 'lte',
    [eFilterOperator.BETWEEN]: 'between',
};
export const operatorKey = (op: eFilterOperator | number | null | undefined): string =>
    `${SS}filter.op.${OPERATOR_KEYS[op as number] ?? 'unknown'}`;

// One filter clause, exactly the client-supplied columns of `dbo.SendSearchFilterType` (§2).
// `FilterGroupID` is ABSENT on purpose: §2 says it is "מוקצה בשרת לפי סדר, לא ע\"י הלקוח" — the
// server numbers the rows by their order in the list. A client-side group id would be a second
// authority over grouping, and the two would disagree the first time a clause is removed.
//
// FIELD IDENTITY IS `SourceHeader`, never `ColumnID` (IDENTITY — changes on every upload, and an
// IDOR handle) and never `ColumnKey` (`c1`,`c2` — POSITIONAL, so it silently re-points at a
// different column when a source is re-uploaded with a different column order). §2.
export interface SendSearchFilterClause {
    FieldKey: string;            // = DataSourceColumns.SourceHeader
    Operator: eFilterOperator;
    Value1: string | null;
    Value2: string | null;       // BETWEEN only; null for every other operator
}

// A field the user may filter or sort on — one entry per filterable `DataSourceColumns` row.
// `DataType` drives `operatorsForType`; `DisplayName` is the operator-facing label (the SourceHeader
// is the identity and can be a raw spreadsheet header, so it is NOT what gets rendered).
export interface SendSearchFilterField {
    FieldKey: string;            // = SourceHeader — the identity, sent back verbatim in the clause
    DisplayName: string;
    DataType: eDataType;
}

// Blank clause for a field. Value2 starts null even for BETWEEN: an empty second bound is not the
// same claim as "no upper bound", and `isClauseComplete` below refuses to send a half-built range.
export const newFilterClause = (f: SendSearchFilterField): SendSearchFilterClause => ({
    FieldKey: f.FieldKey,
    Operator: operatorsForType(f.DataType)[0],
    Value1: null,
    Value2: null,
});

// Is this clause safe to send? A clause with an empty Value1 would reach the SP as an empty-string
// comparison, and `DataSourceRowSearchValues` does not index empty values (§2 / LEDGER #7) — so it
// would silently match NOTHING and look exactly like "no recipient meets your filter". Half-built
// clauses are therefore DROPPED at the projection boundary rather than sent, and the bar renders
// them as incomplete instead. BETWEEN additionally requires both bounds, for the same reason.
export const isClauseComplete = (c: SendSearchFilterClause): boolean => {
    const v1 = (c.Value1 ?? '').trim();
    if (v1.length === 0) return false;
    if (!operatorNeedsValue2(c.Operator)) return true;
    return (c.Value2 ?? '').trim().length > 0;
};

// ── sort (CONTRACT §2 "מיון") ────────────────────────────────────────────────────────────────
// Direction is a BOOLEAN, not a 'ASC'|'DESC' string, and that is deliberate: it binds to a SQL `bit`
// and therefore CANNOT carry an invalid value, so the SP needs no whitelist and there is no string
// that could ever reach an ORDER BY. The sort FIELD is `SourceHeader` for the same reason the filter
// field is (§2) — never ColumnID, never ColumnKey, never a column ordinal.
//
// `null` field = "no user sort" ⇒ the SP's default order. It is a third state, not `''`: an empty
// string is a FieldKey that matches no column, which the server would have to reject.
//
// i18n suffix for the direction, so no component writes `desc ? 'יורד' : 'עולה'` inline.
export const sortDirectionKey = (desc: boolean): string => `${SS}sort.${desc ? 'desc' : 'asc'}`;

// ── DataSources_SearchSends → SendSearchRequest (mirror of CONTRACT §3.2) ────────────────────
export interface SendSearchRequest {
    Channel: eSendChannel;          // default 1 (EMAIL) — the only wired channel in V1
    SearchText: string | null;
    RoleFilter: eRoleFilter;        // 0=all, 1=agent, 2=supervisor
    RowKind: eRowKind;              // 0=all, 1=agents, 2=rollup
    CampaignID: number | null;
    DateFrom: string | null;        // ISO-8601; C# DateTime?
    DateTo: string | null;          // ISO-8601; C# DateTime?
    IncludeOverOneYear: boolean;
    PageIndex: number;
    PageSize: number;               // the SERVER clamps to 1..200 (§3.2) — the client must not rely on that
    // Column filters — becomes the `dbo.SendSearchFilterType` TVP server-side, ONE ROW PER CLAUSE, in
    // THIS ORDER: the server assigns `FilterGroupID` by position (§2). Always an array, never null:
    // a missing property and an empty list must not be two ways to say "no filters".
    Filters: SendSearchFilterClause[];
    // null = no user sort ⇒ the SP's default order. Never '' (see the sort note above).
    // ⚠️ WIRE NAMES ARE FROZEN: `SortField` / `SortDescending` (ORCHESTRATOR AMENDMENT 2026-08-06).
    // They must match the C# DTO member names EXACTLY — Newtonsoft drops an unknown JSON key in
    // SILENCE, so a misspelling here binds nothing server-side: the grid renders the SP's default
    // order while the UI header shows a sort that is not happening. No 400, no exception, no log.
    SortField: string | null;
    SortDescending: boolean;        // binds to a SQL bit — cannot carry an out-of-domain value
}

// ── one report row (mirror of CONTRACT §3.2 SendSearchRow, field-for-field) ──────────────────
// NOTE the wire types of the two state fields: `string | null`, NOT one of the unions above.
//  • not a union, because typing them as the domain would be a lie about the wire and would make an
//    unrecognised value a compile-time impossibility instead of a run-time visible 'unknown';
//  • NULLABLE, because the C# DTO declares them as `string` — a reference type whose values include
//    null — and the SP projects NULL for a recipient with no cell-side row. Declaring them
//    non-nullable did not make null impossible, it only made it invisible: the render guard
//    `EngagementState !== 'None' && EngagementState !== ''` is SATISFIED by null, so null reached
//    `camelCaseState` and `null.charAt(0)` threw, unmounting the grid. tsc could not see it (the
//    declaration said non-null) and tsc is not a gate here anyway (CONTRACT §4).
// They are narrowed at the render boundary by `toChannelAttempt`, which is the ONLY place allowed
// to decide what an out-of-domain or missing value looks like.
export interface SendSearchRow {
    RowID: number;                       // C# long — JS number is exact to 2^53, and RowID is an int-range identity
    DataSourceVersionID: number | null;
    VersionNumber: number | null;
    ProvenanceSource: string;            // Recorded | Inferred | Unverifiable
    VersionState: string;                // Available | Purged | Scrubbed
    Channel: eSendChannel;
    ChannelCampaignID: number;
    CampaignName: string;
    RecipientName: string;
    RecipientEmail: string;
    RecipientCellphone: string;
    IsSupervisor: boolean;
    IsSynthetic: boolean;
    SupervisorName: string;
    SentAt: string | null;
    DeliveryState: string | null;
    EngagementState: string | null;
    EngagementAt: string | null;
    RollupValue: string;
    HasRow: boolean;
    // The recipient's `dbo.clients.ClientID` (`csl.RecipientID` in dbo.DataSources_SearchSends).
    // Added so the drawer can ask GET api/SendSearch/RowValues what this person actually received —
    // without it the row identifies a PERSON on screen but nothing the server can key on.
    ClientID: number;
    // The value this row was SORTED BY, already formatted for display by the server (§2: "SortValueDisplay
    // חובה ב-RS1 + MapRow + שני מודלי השורה + ה-stub של ערוץ≠1").
    //
    // Server-formatted rather than client-formatted on purpose: the sort ORDER was decided by
    // `SortNum`/`SortDate` on the server, so a client that re-derived the label from the raw text
    // could print a value that disagrees with the position the row is in — a number rendered with a
    // thousands separator the sort did not use, or a date parsed in the wrong locale. One authority.
    //
    // `string | null` because the C# member is a `string` (reference type) and the row may genuinely
    // have no value in the sorted column — which is what `SortIsUnknown` marks server-side (§2).
    // null must stay distinguishable from '' : "no value in this column" is not "the empty string".
    SortValueDisplay: string | null;
    // ── §1: the email preview. NOT an endpoint and NOT a thunk — the whole preview contract is this
    // ONE field. The server builds an encrypted `PreviewCampaign.aspx?id=…&noTrack=1` URL and the
    // client drops it into an iframe; there is nothing for the client to compute or decide.
    //
    // `null` is a FIRST-CLASS value and means "the button is DISABLED", not "we failed to build it".
    // The server returns null whenever the preview would be a lie: a non-email channel, a missing
    // ChannelCampaignID, and — critically — `ClientID <= 0` (§1.1: an id carrying CampaignID WITHOUT
    // clientid does not throw, it renders a plausible-looking GENERIC campaign that is not this
    // agent's data). Until script 23 runs, `ClientID` is 0 for every row, so this is null for every
    // row and every preview button is disabled. THAT IS THE CORRECT BEHAVIOUR, not a bug (§1.1).
    // The client must therefore never synthesise a URL of its own when this is null.
    //
    // LAST member, with SortValueDisplay immediately before it — the same order as the C# model
    // (LEDGER #22, B1). TS interface order is not load-bearing, but a reader diffing the two shapes
    // must not have to decide whether a difference in order means a difference in contract.
    PreviewUrl: string | null;
}

export interface SendSearchResponse {
    Items: SendSearchRow[];
    TotalCount: number;
}

// ── provenance history row (mirror of CONTRACT §3.1 SendProvenanceRow, field-for-field) ─────
export interface SendProvenanceRow {
    SendProvenanceID: number;            // C# long
    CampaignID: number;
    Channel: eSendChannel;
    DataSourceID: number;
    DataSourceName: string;
    DataSourceVersionID: number;
    VersionNumber: number;
    // RESUME.md §3 A1: NULLABLE. The OUTER APPLY that computes it (the DataSources_GetSmartSendList
    // definition, 10_:121-129) returns NULL when the DataSource has no Status=2 version at all, and
    // A1 forbids COALESCEing it to VersionNumber — that would invent the claim "a Ready version
    // exists and it equals what was sent". C# side is `int?`. A `number` here would let a consumer
    // do arithmetic on null and print "NaN" with no compile error, because tsc is not a gate.
    LatestVersionNumber: number | null;
    IsOutdated: boolean;
    VersionState: string;                // Available | Purged | Scrubbed
    SentAt: string;
    TotalRows: number | null;
    SkippedNoIdentity: number | null;
    SkippedDuplicates: number | null;
    FinalClients: number | null;
    SkippedRemovedOrMissing: number | null;
    CreatedBy: string;
}

// ── per-recipient sent values (mirror of the C# `SendRowValue`, B.3) ────────────────────────
// One row per mapped token, ALREADY ORDERED by the SP (tm.DisplayOrder, tm.TokenMapID) — the client
// must not re-sort: the order is the order the operator sees in the mapping screen.
//
// `HasRow` is the honesty flag and the reason this shape has three fields instead of two. It is
// FALSE when the client had no source row in the sent version, which means the sender emitted empty
// strings for every token. `Value` is `ISNULL(...,'')` server-side, so a HasRow=false payload is a
// list of tokens with blank values — and rendering those blanks would read as "this recipient was
// deliberately sent empty text". It is not the same claim, so the renderer must branch on HasRow
// and say so in words instead (AgentDrawer, `drawer.noRowValues`).
export interface SendRowValue {
    Token: string;
    Value: string;
    HasRow: boolean;
}

// ── screen state types ──────────────────────────────────────────────────────────────────────

// The slice's filter object (CONTRACT §4.3 names this type `SendSearchFilters`). Paging lives here
// too, so ONE object is the complete description of "what is on screen" and `toSendSearchRequest`
// is a pure projection of it — there is no second source of truth for the page index.
export interface SendSearchFilters {
    Channel: eSendChannel;
    SearchText: string;
    RoleFilter: eRoleFilter;
    RowKind: eRowKind;
    CampaignID: number | null;
    DateFrom: string | null;
    DateTo: string | null;
    IncludeOverOneYear: boolean;
    PageIndex: number;
    PageSize: number;
    // The clauses AS EDITED, including half-built ones — this object is "what is on screen", and a
    // clause the user is still typing into is on screen. `toSendSearchRequest` is what drops the
    // incomplete ones; storing only complete clauses here would make the bar unable to render a row
    // being edited, which is the only reason a filter bar has rows at all.
    Filters: SendSearchFilterClause[];
    // Same two names as the wire request (ORCHESTRATOR AMENDMENT 2026-08-06). The state shape and the
    // wire shape deliberately share one spelling per concept so a reader never has to ask which
    // spelling a given site wants.
    SortField: string | null;
    SortDescending: boolean;
}

export const DEFAULT_PAGE_SIZE = 50;          // CONTRACT §2.2 @prm_PageSize default
export const MAX_PAGE_SIZE = 200;             // server clamp (§3.2) — mirrored so the UI cannot ask for more
export const PAGE_SIZE_OPTIONS: number[] = [20, 50, 100];

export const defaultSendSearchFilters = (): SendSearchFilters => ({
    Channel: eSendChannel.EMAIL,
    SearchText: '',
    RoleFilter: eRoleFilter.All,
    RowKind: eRowKind.All,
    CampaignID: null,
    DateFrom: null,
    DateTo: null,
    IncludeOverOneYear: false,
    PageIndex: 0,                              // the SP is 0-based (§2.2 @prm_PageIndex int = 0)
    PageSize: DEFAULT_PAGE_SIZE,
    Filters: [],
    SortField: null,                           // no user sort ⇒ the SP's own default order
    SortDescending: false,
});

// Pure projection filters → wire request. Empty text is sent as NULL, not '' — the SP's
// @prm_SearchText default is NULL and '' would make it search for the empty string.
export const toSendSearchRequest = (f: SendSearchFilters): SendSearchRequest => {
    const text = (f.SearchText || '').trim();
    const size = Math.min(Math.max(f.PageSize, 1), MAX_PAGE_SIZE);
    // Only COMPLETE clauses cross the wire (see `isClauseComplete`): an empty Value1 would reach the
    // SP as a comparison against '', which `DataSourceRowSearchValues` never indexes, so it would
    // match nothing and be indistinguishable on screen from "no recipient meets your filter".
    // Values are trimmed and non-BETWEEN clauses have Value2 forced to null, so the TVP never carries
    // a stale second bound left behind by switching an operator away from BETWEEN.
    const clauses: SendSearchFilterClause[] = (f.Filters || []).filter(isClauseComplete).map(c => ({
        FieldKey: c.FieldKey,
        Operator: c.Operator,
        Value1: (c.Value1 ?? '').trim(),
        Value2: operatorNeedsValue2(c.Operator) ? (c.Value2 ?? '').trim() : null,
    }));
    // '' is normalised to null for the same reason SearchText is: '' is a FieldKey that matches no
    // column, and the server would have to reject it; null is the legitimate "no sort" state.
    const sortKey = (f.SortField ?? '').trim();
    return {
        Channel: f.Channel,
        SearchText: text.length > 0 ? text : null,
        RoleFilter: f.RoleFilter,
        RowKind: f.RowKind,
        CampaignID: f.CampaignID,
        DateFrom: f.DateFrom,
        DateTo: f.DateTo,
        IncludeOverOneYear: f.IncludeOverOneYear,
        PageIndex: Math.max(f.PageIndex, 0),
        PageSize: size,
        Filters: clauses,
        SortField: sortKey.length > 0 ? sortKey : null,
        // A direction with no field is meaningless; forced false so two "no sort" requests are
        // byte-identical and cannot look like two different sorts to a cache or a log.
        SortDescending: sortKey.length > 0 ? !!f.SortDescending : false,
    };
};

// ── drawer stack (Mock-v3:341-356) ──────────────────────────────────────────────────────────
// Up to THREE levels: rollup → agent → message. `Esc` pops ONE level; the scrim closes all.
export type DrawerLevel = 'rollup' | 'agent' | 'message';
export const MAX_DRAWER_DEPTH = 3;

export interface DrawerEntry {
    Level: DrawerLevel;
    // The row this level was opened from, identified by the COMPOSITE key — see `sendSearchRowKey`
    // below. The entry deliberately carries a key rather than a copy of the row, so a refetch while
    // the drawer is open cannot leave stale data on screen; it must be the composite key and not
    // `RowID`, because `RowID` is NOT unique — a repeat send of the same campaign produces a second
    // row with the same RowID (CONTRACT §7: "a RowID already implies a version", and §9 fixes the
    // report's row key at `(Channel, ChannelCampaignID, RowID, SentAt)` precisely because repeat
    // sends are legal). Resolving the drawer by RowID alone showed the FIRST matching send, which
    // for a repeat-sent recipient is the wrong one — a confidently wrong version and timestamp in
    // the one drawer this feature exists to make trustworthy.
    RowKey: string;
    // Kept alongside, for logging/telemetry and because a level is still "about" a source row. It is
    // NOT the lookup key. Never resolve a row from it.
    RowID: number;
    // Breadcrumb label for this level, already resolved to display text (`Mock-v3:344`).
    Crumb: string;
    Title: string;
    Subtitle: string | null;
    // Only meaningful for Level === 'message': WHICH channel's message is being shown. A message
    // level with no channel is not representable in the UI, so this is required for that level and
    // null for the others.
    Channel: eSendChannel | null;
}

// ── "which channels were ACTUALLY attempted for this row" ───────────────────────────────────
// The mock's rule (`:233-238`): only an attempted channel produces a line; a channel never tried has
// NO line and no dash. A V1 row describes ONE channel (`SendSearchRow.Channel`), so this returns 0
// or 1 entries — and stays the single place to extend when a row starts carrying several channels.
//
// "Attempted" = there is a send timestamp OR there is engagement evidence. The second half is not
// redundant: the mock's `shir` case (`:280-286`) has an OPEN record and NO send record — the row was
// created at the moment of the open, most likely because someone forwarded the mail. Dropping it for
// lack of a SentAt would delete the only trace of the thing the operator most needs to see, and
// would render "לא נשלח בשום ערוץ" next to a recorded open.
export const rowAttempts = (r: SendSearchRow): RawChannelAttempt[] => {
    const attempted = r.SentAt != null || r.EngagementAt != null;
    if (!attempted) return [];
    return [{
        Channel: r.Channel,
        DeliveryState: r.DeliveryState,
        EngagementState: r.EngagementState,
        // The line's timestamp is the strongest evidence's timestamp, falling back to the send time.
        EvidenceAt: r.EngagementAt ?? r.SentAt,
    }];
};

// The row's states, NARROWED — the one call every component must make before it builds a
// `delivery.*` / `engagement.*` i18n key or asks for a tone.
//
// It exists because `rowAttempts` returns the WIRE shape, and four components used to read
// `r.DeliveryState` / `r.EngagementState` off the raw row instead, bypassing `toChannelAttempt`
// entirely. An out-of-domain 'Bounced' then rendered "סטטוס לא מזוהה" in the channels cell (which
// narrowed) and the literal key `SendSearch.delivery.bounced` in the evidence cell beside it
// (which did not) — the same value contradicting itself in two adjacent columns of one row.
// Unlike `rowAttempts` this ALWAYS returns a value: "was anything attempted" is a separate question
// (that is what `rowAttempts().length` answers), and a component that needs a label must never be
// left holding `undefined`.
export const rowChannelAttempt = (r: SendSearchRow): ChannelAttempt => toChannelAttempt({
    Channel: r.Channel,
    DeliveryState: r.DeliveryState,
    EngagementState: r.EngagementState,
    EvidenceAt: r.EngagementAt ?? r.SentAt,
});

// Row identity per CONTRACT §9: "the report's row key is (Channel, ChannelCampaignID, RowID, SentAt)".
// Used as the React key AND as `DrawerEntry.RowKey` — RowID alone is NOT unique across repeat sends
// of the same campaign, so it can identify neither a list item nor an open drawer level.
export const sendSearchRowKey = (r: SendSearchRow): string =>
    `${r.Channel}-${r.ChannelCampaignID}-${r.RowID}-${r.SentAt ?? 'never'}`;
