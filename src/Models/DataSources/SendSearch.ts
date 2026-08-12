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
    // ── COVERAGE PAIR — added 2026-08-08 (review R1-02). NOT decoration, and NOT optional. ──
    // `dbo.DataSources_SearchSendsFilterCatalog` has always projected these and `SendSearchFilterField`
    // in C# has always carried them; only this interface stopped at three members, so the numbers
    // arrived at runtime and were then unreachable to every consumer.
    //
    // WHY THEY MUST BE HERE: the search spans several campaigns, and a column such as "מספר פוליסה"
    // may exist in two of the four data sources behind them. Filtering on it drops EVERY row from the
    // other two — the operator asked to narrow by a value and narrowed the POPULATION instead. The
    // builder prints "חל על 2 מתוך 4 קמפיינים" from exactly this pair (`isPartialCoverage`,
    // SendSearchAdvanced.ts:91). Declaring them required is what makes this type assignable to
    // `SendSearchField`, which is the seam that was broken: the panel read a state key the slice
    // never wrote, and a rename alone would have handed the builder a field with no coverage numbers
    // — i.e. traded a visibly-dead feature for a silently-row-dropping one.
    CampaignCount: number;
    TotalCampaigns: number;
    // Optional: the SP degrades a header whose DataType differs across versions to TEXT and raises
    // this flag (B3 #57). Optional rather than required so a server deployed before the catalog SP
    // simply leaves it undefined instead of breaking the mapping.
    IsAmbiguousType?: boolean;
}

// One option in the multi-select campaign picker — result set [1] of
// `dbo.DataSources_SearchSendsFilterCatalog` (51-CatalogSP-Campaigns.sql).
//
// It comes from the SAME `#Camp` set the field catalog is built from, which is the whole point: the
// identical ownership predicate, the identical date window, and the identical "has actually sent"
// filter. Every checkbox therefore corresponds to a campaign the grid can genuinely return rows for.
//
// This REPLACES a list the screen used to accumulate from whatever result rows happened to be loaded
// (SendSearchPanel). That list could only ever hold campaigns from a page already fetched —
// survivable for a single select, actively misleading under a search box, where "not found" would
// mean "not loaded yet" and the user would conclude the campaign does not exist.
// 🔴 MIRRORS THE SERVER. `SendSearchLogic.CAMPAIGN_IDS_MAX = 500`, enforced by
// `SendSearchController` as a flat 400 DATA_INCORRECT — the controller REFUSES rather than
// truncating, on purpose, because silently dropping a campaign under-reports an audit screen.
//
// It is duplicated here only so the source-expansion action can refuse IN WORDS before the
// request is built; the server stays the authority and this number must never be the thing
// that decides what is sent. IF THE SERVER CONSTANT MOVES, THIS ONE MUST MOVE WITH IT — a
// client cap ABOVE the server's turns a worded refusal into a generic "load failed" banner,
// and a cap BELOW it refuses work the server would have accepted.
export const CAMPAIGN_IDS_MAX = 500;

export interface SendSearchCampaign {
    CampaignID: number;
    CampaignName: string;
}

// Response body of `GET api/SendSearch/FilterFields` — `PulseemResponse.Data`.
//
// 🔴 THIS SHAPE CHANGED. `Data` used to be a bare `SendSearchFilterField[]`. Both lists now ride on
// ONE call because the catalog SP's `#Camp` prologue aggregates over `dbo.CampaignSendingLog`
// (395,378,174 rows, verified on stage 2026-08-09) and a second endpoint would make every page load
// pay it twice.
//
// Both members are optional HERE and only here: the server always sends both, but a client deployed
// against an API that has not shipped yet would otherwise crash on `.map` of undefined. The slice
// normalises them to `[]` at the boundary, so nothing downstream ever sees undefined.
export interface SendSearchCatalogResult {
    Fields?: SendSearchFilterField[];
    Campaigns?: SendSearchCampaign[];
    // ── the source map (script 54) ──────────────────────────────────────────────────────
    // Feeds the "mark the campaigns that sent from source X" action beside the campaign
    // picker. NOTHING HERE EVER REACHES `SendSearchRequest`. The action expands one click
    // into CampaignIDs and the request stays an ordinary campaign multi-select — which is
    // why the search wire contract, the 22 export columns and `toSendSearchRequest` are all
    // untouched by this feature.
    //
    // 🔴 `SourceMapAvailable` is the deployment gate and the server derives it from TABLE
    // PRESENCE, not from these lists being non-empty. Read the flag, never `Sources.length`:
    // an empty list means "no source sent in this window", a false flag means "script 54 has
    // not run here". Hide the action on false; an empty menu on true is a legitimate answer.
    // Same discipline `sourcesAvailable` follows for the grid's source line.
    SourceMapAvailable?: boolean;
    Sources?: SendSearchCatalogSource[];
    SourceCampaigns?: SendSearchSourceCampaign[];
}

// One data source with at least one campaign in the current window.
export interface SendSearchCatalogSource {
    DataSourceID: number;
    // `''` is a source whose name really is blank — a real state, rendered as "שם לא נמצא"
    // but never coalesced with a missing entry. Same rule as SendSearchCampaignSource below.
    DataSourceName: string | null;
    // Reported, never filtered server-side: a send that went out from a source deleted
    // afterwards still went out from it. The menu marks it rather than hiding it.
    IsDeleted: boolean;
    // Campaigns attributable to this source in the window. Shown in the menu so the operator
    // sees the size of the expansion BEFORE committing, and used to refuse in words when the
    // resulting union would exceed the server's campaign cap.
    CampaignCount: number;
}

// A (source, campaign) pair, provenance-closed: it carries both what was RECORDED at send
// time and what the mapping says NOW. A campaign that once sent from source A and is mapped
// to B today appears under BOTH — over-inclusion is visible, because every grid row shows its
// own source, whereas a silent omission of historical sends would not be.
export interface SendSearchSourceCampaign {
    DataSourceID: number;
    CampaignID: number;
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
    // Multi-select campaign filter. Becomes the `dbo.ListOfIntegers` TVP server-side and is UNIONed
    // with `CampaignID` above inside the SP's #CampFilter — the two are not alternatives to keep in
    // sync. Always an array, never null, for the same reason `Filters` is: a missing property and an
    // empty list must not be two ways to say "no campaign filter".
    //
    // ⚠️ WIRE NAME IS FROZEN: `CampaignIDs`, matching the C# member EXACTLY. Newtonsoft drops an
    // unknown key on a REQUEST in SILENCE, so `CampaignIds` here would bind nothing: the server would
    // see an empty list, return EVERY campaign, and the bar would still show N checkboxes ticked.
    // No 400, no exception, no log — the same failure mode SortField/SortDescending documents below.
    CampaignIDs: number[];
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
    // The data source the send actually came FROM (RS1 column 21, 52-SearchSends-SourceColumn.sql).
    // Same COALESCE arm order as DataSourceVersionID above — provenance first, mapping as fallback —
    // so the source and the version can never come from two different provenance rows.
    //
    // NULL means the server has not shipped 52_ yet, or genuinely has no source for the row. The
    // client never renders a source line for it; see `SourcesAvailable` for which of the two it is.
    // Only the ID travels per row; the NAME arrives once in `Sources`.
    EffectiveDataSourceID: number | null;
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

// One data source referenced by the current result set — result set 3 of the search SP.
//
// 🔴 TWO SOURCES CAN SHARE A NAME. The uniqueness index is FILTERED:
// `IX_DataSources__SubAccountID_Name … WHERE ([IsDeleted]=(0))`, so a deleted "תיק סוכן" and a live
// "תיק סוכן" coexist legally in one account. That is why the grid prints `#id` on EVERY row and not
// only when a collision is visible: this map covers the filtered result, and a search that happens
// to return only the deleted twin contains no collision at all — a conditional id would be absent
// exactly when it is most needed, and its absence would read as a positive claim of uniqueness.
//
// `IsDeleted` is rendered, never used to filter. The send happened; a source deleted afterwards is
// still the source it came from, and hiding the row would delete evidence.
export interface SendSearchCampaignSource {
    DataSourceID: number;
    // `null` = no map entry. `''` = a source whose name really is blank. Different states, rendered
    // differently — never coalesce one into the other.
    DataSourceName: string | null;
    IsDeleted: boolean;
    DeletedDate: string | null;   // ISO-8601; drawer only — a second numeric token on 50 grid rows
    DeletedBy: string | null;     // competes with the id that is doing the actual disambiguating
}

export interface SendSearchResponse {
    Items: SendSearchRow[];
    TotalCount: number;
    // Present only from a server that has shipped 52_. Optional here so an older API cannot crash
    // the grid on `.map` of undefined; the slice normalises to [].
    Sources?: SendSearchCampaignSource[];
    // 🔴 THE FLAG, NOT THE LIST LENGTH, DECIDES WHETHER TO RENDER THE SOURCE LINE.
    // false ⇒ the server cannot tell us yet ⇒ render NO source line at all.
    // true + empty ⇒ the server told us, and this result references no source.
    // Those must never look alike, and `IsDeleted` is NEVER inferred from a missing map entry.
    SourcesAvailable?: boolean;
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
    // BOTH are kept, and that is not redundancy. `CampaignID` stays because it is part of the frozen
    // §3.2 body and the SP still honours it; `CampaignIDs` is what the checkbox picker writes. The SP
    // unions them, so a screen that sets only one behaves identically to before.
    CampaignID: number | null;
    CampaignIDs: number[];
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

/**
 * A date-only "to" value the user picked, turned into the EXCLUSIVE upper bound the SP expects.
 *
 * `dbo.DataSources_SearchSends` filters with `csl.[TimeStamp] < @prm_DateTo`, so an inclusive
 * calendar day has to travel as midnight of the NEXT day. Review R1-04.
 *
 * Returns the input unchanged when it is null/empty (the SP then defaults @prm_DateTo to GETDATE(),
 * which is already inclusive of everything sent so far) or when it is not a bare `yyyy-MM-dd` —
 * a value that already carries a time component is a caller that knows what it is doing, and
 * shifting it again would move the bound by a day for no reason.
 */
export const exclusiveUpperBound = (dateOnly: string | null): string | null => {
    if (!dateOnly || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;
    const parts = dateOnly.split('-');
    // UTC arithmetic on purpose: Date.UTC + toISOString never shifts the calendar day through the
    // browser's timezone, which a local-time Date would do for every user east or west of the server.
    const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
};

export const DEFAULT_PAGE_SIZE = 50;          // CONTRACT §2.2 @prm_PageSize default
export const MAX_PAGE_SIZE = 200;             // server clamp (§3.2) — mirrored so the UI cannot ask for more
export const PAGE_SIZE_OPTIONS: number[] = [20, 50, 100];

export const defaultSendSearchFilters = (): SendSearchFilters => ({
    Channel: eSendChannel.EMAIL,
    SearchText: '',
    RoleFilter: eRoleFilter.All,
    RowKind: eRowKind.All,
    CampaignID: null,
    CampaignIDs: [],                           // empty = all campaigns; never null (see the interface)
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
        // De-duplicated and stripped of anything <= 0 HERE, at the wire boundary, on top of the same
        // cleaning in SendSearchLogic and in the SP's #CampFilter. Three layers is deliberate: a
        // duplicate id reaching #Camp is a PRIMARY KEY violation, i.e. a 500 on every search — the
        // same failure class as the PK_Match incident, and this screen has a proven history of
        // double-dispatching. `filter(Boolean)`-style checks are avoided because 0 is a legal-looking
        // id that must be dropped, and `Boolean(0)` and `Boolean(null)` are indistinguishable.
        CampaignIDs: (f.CampaignIDs || [])
            .filter((id) => typeof id === 'number' && id > 0)
            .filter((id, i, arr) => arr.indexOf(id) === i),
        DateFrom: f.DateFrom,
        // 🔴 FIXED 2026-08-08 (review R1-04). The picker yields a DATE-ONLY ISO string ("2026-08-08",
        // SendSearchFilters.tsx:120-125), Newtonsoft binds it as 2026-08-08T00:00:00, and the SP's
        // predicate is HALF-OPEN: `AND csl.[TimeStamp] < @prm_DateTo` (DataSources_SearchSends:384).
        // So choosing "עד 08/08/2026" silently dropped EVERY send made on 8 August — out of the grid,
        // out of TotalCount and out of the export — while the chip still read "until 08/08/2026".
        // Picking today as the end date is the most natural thing an auditor does, so this fired
        // constantly and looked like nothing.
        //
        // Converted to an EXCLUSIVE upper bound here, at the wire boundary, rather than by changing
        // the SP to `<=`: the predicate is shared by every tenant on this platform and by the
        // catalog SP, and widening it there would silently change what every existing saved search
        // returns for everyone. The state keeps the date the user actually picked, so the input and
        // the chip still render it — only the value on the wire is shifted.
        DateTo: exclusiveUpperBound(f.DateTo),
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

// ═══════════════════════════════════════════════════════════════════════════════════════════
// EXPORT — the client half of the FROZEN `POST api/SendSearch/Export` contract
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Everything the export needs to SAY lives here and not in the dialog, for the same D10 reason the
// status vocabulary above does: the dialog renders the criteria table AND the same rows travel to
// the server as `Criteria` and are written verbatim into the file. One function, two uses — so the
// file physically cannot describe a different search from the one the operator was shown.
//
// 🔴 `toSendSearchRequest` and `exclusiveUpperBound` above are NOT touched by any of this. The
// export body INHERITS the search body field-for-field (that is what makes the export and the grid
// the same query), so the projection that builds the search body stays the single authority over
// what a filter looks like on the wire.

// The translate function, structurally. Same shape `StatusChip.tsx:10` already uses to receive `t`
// as a parameter — an interface, not an import of i18next's `TFunction`, so this module stays free
// of a react-i18next dependency and can be unit-called with a stub.
export type ExportT = (key: string, options?: any) => string;

// One display-ready row of the criteria block. `{Label, Value}` are the C# `ExportCriterion`
// member names EXACTLY — Newtonsoft drops an unknown key on a request in SILENCE (the same failure
// class `CampaignIDs` and `SortField` document above), so a lower-case `label` here would travel as
// two nulls and the file would carry a criteria block of empty rows with no error anywhere.
export interface ExportCriterion {
    Label: string;
    Value: string;
}

// The export body = the search body + four members. `extends SendSearchRequest` rather than a
// re-declaration, so a filter added to the search can never be missing from the export: the export
// would stop compiling at the call site instead of silently exporting an UNFILTERED superset of what
// the grid showed — the worst possible defect in an audit deliverable.
export interface SendSearchExportRequest extends SendSearchRequest {
    Criteria: ExportCriterion[];
    // EXACTLY 22 entries in EXPORT_COLUMN_KEYS order. The server answers 400 DATA_INCORRECT on any
    // other count rather than writing a file whose header row does not match its data rows.
    ColumnHeaders: string[];
    // token → display text. The server performs NO default substitution: a token missing from this
    // map is written RAW into the file (CONTRACT D10, SendSearchController.cs:44-46). That is the
    // whole point — a client-side dictionary that quietly renames a code it does not recognise is
    // the RecipientReport export bug (`renderSMSStatus`, RecipientReport.tsx:510-522), where failed
    // WhatsApp messages were exported as "נשלח".
    Labels: { [token: string]: string };
    // Optional. `null`, never '' — an empty string is an address the server would have to validate
    // and reject, whereas null is the legitimate "do not email me".
    NotifyEmail: string | null;
}

// `PulseemResponse.Data` of a 201 / 202.
export interface SendSearchExportResult {
    FileName: string;        // the BARE GUID, exactly as DataSources' export returns it
    Rows: number;
    Async: boolean;          // true ⇒ the 202 background path; the file is not on disk yet
    XlsxIncluded: boolean;   // false ⇒ CSV only (above SendSearchExportXlsxMaxRows)
}

// `PulseemResponse.Data` of the 409 TOO_MANY_ROWS. Both numbers are surfaced to the user verbatim:
// "too many rows" with neither the count nor the ceiling is an error the operator cannot act on.
export interface SendSearchExportLimits {
    MaxRows: number;
    Rows: number;
}

// ── the 22 export columns ───────────────────────────────────────────────────────────────────
// THIS EXACT ORDER, both sides. The array is the contract: the server projects its 22 values in
// this order and the client sends 22 headers in this order, so the two lists are positional and a
// reordering here without the matching server change puts every header over the wrong column —
// a file that is wrong in a way no error message would ever report.
export const EXPORT_COLUMN_KEYS: readonly string[] = [
    'CampaignName', 'Channel', 'RecipientName', 'RecipientEmail',
    'RecipientCellphone', 'ClientID', 'IsSupervisor', 'SupervisorName',
    'SentAt', 'DeliveryState', 'EngagementState', 'EngagementAt',
    'VersionNumber', 'ProvenanceSource', 'VersionState', 'HasRow',
    'IsSynthetic', 'RollupValue', 'SortValueDisplay', 'DataSourceVersionID',
    'ChannelCampaignID', 'RowID',
];

// The count the server validates against (400 DATA_INCORRECT when `ColumnHeaders.Count != 22`).
// DERIVED, never restated as a literal: a 23rd column added above without the server change must
// fail loudly at the boundary, and a hand-written `22` here would let it through to a file whose
// header row is one column short of its data.
export const EXPORT_COLUMN_COUNT = EXPORT_COLUMN_KEYS.length;

// Header text for the 22 columns, in order. The i18n suffix is `camelCaseState` of the column key
// — the SAME transformation the status keys use ('CampaignName' → 'campaignName', 'RowID' →
// 'rowID'), so there is no second naming convention and no hand-written key table to drift.
export const buildExportColumnHeaders = (t: ExportT): string[] =>
    EXPORT_COLUMN_KEYS.map((k) => t(`${SS}export.col.${camelCaseState(k)}`));

// ── Labels: the token → display-text map the server writes with ─────────────────────────────
// i18n key suffix per channel. Declared here rather than inside the dialog for the same D10 reason
// every other map in this file is: a component-local copy is a second place that must learn about
// channel 4, and the two always drift.
const CHANNEL_KEYS: { [c: number]: string } = {
    [eSendChannel.EMAIL]: 'email',
    [eSendChannel.SMS]: 'sms',
    [eSendChannel.WHATSAPP]: 'whatsapp',
};

// Display text for a channel. An out-of-domain channel resolves to a key that EXISTS
// (`export.channel.unknown`) rather than to a raw number or a missing-key string.
export const exportChannelLabel = (t: ExportT, c: eSendChannel | number): string =>
    t(`${SS}export.channel.${CHANNEL_KEYS[c as number] ?? 'unknown'}`);

export const exportBoolLabel = (t: ExportT, v: boolean): string =>
    t(`${SS}export.bool.${v ? 'true' : 'false'}`);

/**
 * The `Labels` dictionary. Every entry is a token the SERVER will look up while writing a cell;
 * a token that is absent is written RAW (CONTRACT D10) — which is why this map is built from the
 * frozen runtime domains above and not from a hand-written list: a state added to
 * `DELIVERY_STATES` is covered here automatically, and one that is NOT in the domain is supposed
 * to reach the file raw, because a raw 'Bounced' in an audit file is evidence of a server defect
 * and a silently substituted "לא ידוע" is the erasure of that evidence.
 *
 * Lookup keys are the contract's: `channel.1|2|3`, `bool.true`/`bool.false`, and the string states
 * under their OWN raw value ('Recorded', 'Available', 'Delivered', …).
 */
export const buildExportLabels = (t: ExportT): { [token: string]: string } => {
    const labels: { [token: string]: string } = {};

    // Channel → "channel.<tinyint>". Built from the enum values, so a fourth channel added to
    // `eSendChannel` + CHANNEL_KEYS lands here without touching this function.
    Object.keys(CHANNEL_KEYS).forEach((c) => {
        labels[`channel.${c}`] = t(`${SS}export.channel.${CHANNEL_KEYS[Number(c)]}`);
    });

    labels['bool.true'] = exportBoolLabel(t, true);
    labels['bool.false'] = exportBoolLabel(t, false);

    // The four string domains, each under its own raw token.
    DELIVERY_STATES.forEach((s) => { labels[s] = t(`${SS}delivery.${camelCaseState(s)}`); });
    ENGAGEMENT_STATES.forEach((s) => { labels[s] = t(`${SS}engagement.${camelCaseState(s)}`); });
    PROVENANCE_SOURCES.forEach((s) => { labels[s] = t(`${SS}version.source.${camelCaseState(s)}`); });
    VERSION_STATES.forEach((s) => { labels[s] = t(`${SS}version.state.${camelCaseState(s)}`); });

    // 🔴 THE ONE COLLISION, resolved deliberately and last. 'Unknown' is a member of BOTH
    // `DELIVERY_STATES` and `ENGAGEMENT_STATES`, and the contract keys the string states by their
    // RAW value — so one flat dictionary can hold only one text for it, and whichever loop ran last
    // would otherwise decide silently. The screen's two texts differ ("סטטוס לא מזוהה" vs "לא
    // מזוהה") and neither reads correctly in the other's column, so the file gets a third, neutral
    // one that is true in both: this is the only place in the export where the file's wording is
    // allowed to differ from the grid's, and it is recorded here so the difference is not read as
    // a bug.
    labels['Unknown'] = t(`${SS}export.unknownState`);

    // Not a cell value — the download NAME. The server builds "<N>-<this>" when several campaigns
    // are ticked (frozen contract, "the download name"), so this is the bare noun, never a
    // sentence and never a format string.
    labels['export.campaignsCount'] = t(`${SS}export.campaignsCount`);

    return labels;
};

// ── the criteria block ──────────────────────────────────────────────────────────────────────
// i18n suffixes for the two enum filters. Same rationale as CHANNEL_KEYS above.
// NOTE for whoever next opens `SendSearchFilters.tsx`: that file carries a private `KIND_KEY`
// (:88-92) predating this module's export section. It is the same three strings; collapse it onto
// `exportRowKindLabel` when you are in there for another reason. It is left alone here because the
// filter bar is outside this change's blast radius and a drive-by edit to a shared audit screen is
// how unrelated regressions arrive.
const ROLE_FILTER_KEYS: { [v: number]: string } = {
    [eRoleFilter.All]: 'all',
    [eRoleFilter.Agent]: 'agent',
    [eRoleFilter.Supervisor]: 'supervisor',
};
const ROW_KIND_KEYS: { [v: number]: string } = {
    [eRowKind.All]: 'all',
    [eRowKind.Agents]: 'agents',
    [eRowKind.Rollup]: 'rollup',
};

// An out-of-domain value falls back to the RAW NUMBER rather than to a plausible-looking label:
// the server rejects RoleFilter > 2 with a 400 (SendSearchController.cs), so seeing `7` in the
// criteria row is the honest description of a client bug, and "סוכן ומפקח" would hide it.
export const exportRoleFilterLabel = (t: ExportT, v: eRoleFilter | number): string =>
    (ROLE_FILTER_KEYS[v as number] ? t(`${SS}role.${ROLE_FILTER_KEYS[v as number]}`) : String(v));
export const exportRowKindLabel = (t: ExportT, v: eRowKind | number): string =>
    (ROW_KIND_KEYS[v as number] ? t(`${SS}kind.${ROW_KIND_KEYS[v as number]}`) : String(v));

/**
 * Display text for a filter operator, for the criteria block.
 *
 * 🔴 IT READS `adv.op.<NUMBER>`, NOT `operatorKey()` — and that is a correction, not a preference.
 * `operatorKey` (:301) builds `SendSearch.filter.op.<name>`, a key family that B4 registered in the
 * LEDGER (#48) and that was NEVER applied to any of the three translation files. Verified 2026-08-09:
 * `filter.op.*` appears in zero of he/en/pl, and before this line `operatorKey` had ZERO call sites
 * in the repo — it is dead code, so nothing had ever exposed the gap. The family that actually ships
 * is B5's `adv.op.<frozen number>` (he/SendSearch.he.json:150-159 and the same block in en/pl), and
 * it is what the filter chips and the advanced builder already render.
 *
 * Using `operatorKey` here would have written the literal string "SendSearch.filter.op.equals" into
 * the criteria block of an audit file — i18next returns the key when it cannot resolve it, silently.
 * Registering the missing family instead was rejected: LEDGER #48 leaves the choice of which family
 * survives to the orchestrator, and the export must not be the change that quietly decides it.
 *
 * An operator with no key resolves to its RAW NUMBER rather than to a leaked `SendSearch.…` path:
 * i18next hands the key back verbatim when it misses, so the comparison below is the only way to
 * tell "translated" from "not found". A bare `10` in the file is an honest, greppable description
 * of an operator this build does not know; an i18n path is noise that looks like a rendering bug.
 */
export const exportOperatorLabel = (t: ExportT, op: eFilterOperator | number): string => {
    const key = `${SS}adv.op.${op}`;
    const text = t(key);
    return text === key ? String(op) : text;
};

/**
 * `yyyy-MM-dd` → `dd/MM/yyyy`, by STRING SURGERY and never through a `Date`.
 *
 * A `new Date('2026-08-08')` is parsed as UTC midnight and printed in the browser's local zone, so
 * every user west of Greenwich would see the previous day in the criteria row while the grid showed
 * the right one — the identical class of off-by-one-day defect that `exclusiveUpperBound` above
 * exists to document. Anything that is not a bare date is returned VERBATIM: an unexpected shape is
 * a value we cannot claim to understand, and printing it unchanged is the honest answer.
 */
export const formatCriterionDate = (iso: string | null): string => {
    if (!iso) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const p = iso.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
};

/**
 * `yyyy-MM-dd` shifted back by whole months, in UTC — the same discipline as `exclusiveUpperBound`:
 * a local-time `Date` would move the calendar day for every user east or west of the server.
 *
 * Used ONLY to decide whether the SP's 12-month floor will bite (see the DateFrom renderer). It is
 * never printed, so the one edge where JS and `DATEADD(month, -12, …)` disagree — 29 February rolls
 * forward to 1 March here and clamps to 28 February there — can shift the decision by a single day
 * at the boundary, where the clamp it is detecting is itself a one-day clamp. Printing a computed
 * floor date would have put that discrepancy into an audit file; describing the narrowing in words
 * does not.
 */
const monthsBefore = (iso: string, months: number): string => {
    const p = iso.split('-');
    const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])));
    d.setUTCMonth(d.getUTCMonth() - months);
    return d.toISOString().slice(0, 10);
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * 🔴 THE BUDGET THAT KEEPS A 13-CAMPAIGN EXPORT FROM FAILING. Added after review (2026-08-09).
 *
 * The campaign criterion renders the ticked campaigns' NAMES, joined, and the picker permits 500 ids
 * (server `CAMPAIGN_IDS_MAX`). With real Clal names that single Value crossed the server's
 * per-criterion bound at THIRTEEN campaigns, and the export was answered 400 DATA_INCORRECT before
 * the search ever ran — deterministically, on the ordinary multi-campaign audit the picker exists
 * for, with nothing on screen naming the campaign count as the cause.
 *
 * `chunkJoined` SPLITS the list across rows and never truncates it: the campaign names are the audit
 * evidence, so dropping the tail would trade a visible failure for an invisible one. The budget sits
 * below the server's `CRITERIA_TEXT_MAX` (4000, SendSearchExportLogic.cs) so a chunk still clears it
 * after a row template wraps it in a count prefix. A single name longer than the budget — not
 * reachable through the picker, but a bound has to be total — is elided rather than allowed to blow
 * the row.
 */
const CRITERION_VALUE_SOFT_MAX = 3200;

const chunkJoined = (parts: string[], sep: string): string[] => {
    const out: string[] = [];
    let cur = '';
    parts.forEach((raw) => {
        const piece = raw.length > CRITERION_VALUE_SOFT_MAX
            ? `${raw.slice(0, CRITERION_VALUE_SOFT_MAX - 1)}…`
            : raw;
        if (cur.length === 0) { cur = piece; return; }
        if (cur.length + sep.length + piece.length > CRITERION_VALUE_SOFT_MAX) { out.push(cur); cur = piece; return; }
        cur += sep + piece;
    });
    if (cur.length > 0) out.push(cur);
    return out;
};

// What the criteria builder needs beyond the two filter objects.
export interface ExportCriteriaContext {
    t: ExportT;
    // Campaign id → name. From `sendSearch.campaigns`; may be missing ids (see campaignsError).
    campaigns: SendSearchCampaign[];
    // Set ⇒ the picker's option list could not be loaded, so some ticked ids have NO name available.
    // The row then SAYS so, instead of rendering bare numbers as if they were the whole truth.
    campaignsError: string | null;
    // For the advanced rules' display names. `FieldKey` is a `SourceHeader` and can be a raw
    // spreadsheet header, so it is the identity — not what a human should be shown.
    fields: SendSearchFilterField[];
    // Rules the user built but did NOT finish. They are dropped at the wire boundary
    // (`isClauseComplete`), so they filter nothing — and an audit file that silently omits them
    // would let the reader believe the search was narrower than it was.
    incompleteRuleCount?: number;
}

const crit = (Label: string, Value: string): ExportCriterion => ({ Label, Value });

// Structural equality, deep enough for the four shapes this state actually holds (scalar, array of
// numbers, array of clause objects, null). `JSON.stringify` is used only for the object leaf, where
// key order is fixed by `toSendSearchRequest`'s own object literal and therefore stable.
const sameCriterionValue = (a: any, b: any): boolean => {
    if (Array.isArray(a) || Array.isArray(b)) {
        const aa: any[] = Array.isArray(a) ? a : [];
        const bb: any[] = Array.isArray(b) ? b : [];
        if (aa.length !== bb.length) return false;
        return aa.every((v, i) => sameCriterionValue(v, bb[i]));
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
};

const campaignNameOf = (ctx: ExportCriteriaContext, id: number): string => {
    const hit = ctx.campaigns.filter((c) => c.CampaignID === id)[0];
    return hit && hit.CampaignName ? hit.CampaignName : '';
};

// Field DISPLAY name for an advanced rule. Falls back to the FieldKey — which is the SourceHeader,
// i.e. still a real, recognisable column header — rather than to "unknown field".
const fieldDisplayOf = (ctx: ExportCriteriaContext, fieldKey: string): string => {
    const hit = ctx.fields.filter((f) => f.FieldKey === fieldKey)[0];
    return hit && hit.DisplayName ? hit.DisplayName : fieldKey;
};

type CriterionRenderer = (
    f: SendSearchFilters,
    req: SendSearchRequest,
    ctx: ExportCriteriaContext,
) => ExportCriterion[];

// Keys whose DEFAULT is itself a substantive statement about the file's contents, and which are
// therefore listed even when untouched. Everything else obeys the omit-when-default rule.
//   • Channel — a file that does not say which channel it describes becomes ambiguous the day
//     channel 2 is wired, and it is unreadable as evidence a year from now.
//   • DateFrom — its renderer prints the whole RANGE, and "no dates picked" is NOT "all time":
//     dbo.DataSources_SearchSends floors the window at twelve months back unless
//     IncludeOverOneYear is set. Omitting the row would let the reader assume the file covers
//     everything ever sent.
const ALWAYS_LISTED: readonly string[] = ['Channel', 'DateFrom'];

// Per-key renderers. This table is NOT the list of criteria — the SCAN below is, and it walks the
// state object itself. A key with no entry here still produces a row, through `fallbackCriterion`.
// That is the whole design: adding a filter to `SendSearchFilters` can never silently drop it from
// the audit file, it can only make its row uglier until someone adds the renderer.
const CRITERION_RENDERERS: { [key: string]: CriterionRenderer } = {
    Channel: (f, req, ctx) => [crit(
        ctx.t(`${SS}export.criteria.channel`),
        exportChannelLabel(ctx.t, f.Channel),
    )],

    // The TRIMMED text, i.e. what actually travelled — `toSendSearchRequest` sends null for
    // whitespace-only input, and a criteria row reading `"   "` would claim a filter that is not
    // running.
    SearchText: (f, req, ctx) => {
        const text = (req.SearchText ?? '').trim();
        if (text.length === 0) return [];
        return [crit(ctx.t(`${SS}export.criteria.searchText`), text)];
    },

    RoleFilter: (f, req, ctx) => [crit(
        ctx.t(`${SS}export.criteria.role`),
        exportRoleFilterLabel(ctx.t, f.RoleFilter),
    )],

    RowKind: (f, req, ctx) => [crit(
        ctx.t(`${SS}export.criteria.rowKind`),
        exportRowKindLabel(ctx.t, f.RowKind),
    )],

    // The legacy SCALAR campaign filter. It is permanently null since the picker went multi-select,
    // but the SP still honours it and the field is still on the frozen body — so it is still
    // scanned. If it is ever non-null again, this row appears rather than the filter being invisible.
    CampaignID: (f, req, ctx) => {
        if (req.CampaignID == null) return [];
        const name = campaignNameOf(ctx, req.CampaignID);
        return [crit(
            ctx.t(`${SS}export.criteria.campaign`),
            name || `#${req.CampaignID}`,
        )];
    },

    // Read from the REQUEST, not from the state: `toSendSearchRequest` de-duplicates the ids and
    // drops anything <= 0, so the request is the set the server will actually filter by. A row
    // built from the raw state could list a campaign the wire never carried.
    CampaignIDs: (f, req, ctx) => {
        const ids = req.CampaignIDs ?? [];
        if (ids.length === 0) return [];
        const label = ctx.t(`${SS}export.criteria.campaigns`);
        const named: string[] = [];
        const unnamedIds: number[] = [];
        const parts: string[] = ids.map((id) => {
            const name = campaignNameOf(ctx, id);
            if (name) { named.push(name); return name; }
            unnamedIds.push(id);
            // `#4821` and not a bare `4821`: a bare number in a name list reads as a campaign
            // literally called "4821". The hash marks it as an identifier we could not resolve —
            // the same convention the picker's chips already use (SendSearchFilters.tsx:114-117).
            return `#${id}`;
        });
        // CHUNKED, not joined into one string — see `chunkJoined` for the 400 DATA_INCORRECT this
        // prevents. The FIRST chunk carries the count template; the rest continue under the same
        // label, which reads in the file exactly like a wrapped list and keeps the count stated once.
        const chunks = chunkJoined(parts, ', ');
        const list = chunks[0] ?? '';
        const continuation: ExportCriterion[] = chunks.slice(1).map((c) => crit(label, c));

        // Every id resolved. One campaign prints its name alone; several print a count first, so a
        // reader can check the file against the number of boxes that were ticked.
        if (unnamedIds.length === 0) {
            return [crit(label, ids.length === 1
                ? list
                : ctx.t(`${SS}export.criteria.campaignsValue`, { n: ids.length, list }))].concat(continuation);
        }
        // Some ids have no name. WHY matters, and the two reasons produce different sentences:
        //   • the whole list failed to load  ⇒ we cannot name ANY of them and must say so;
        //   • the list loaded and this id is not in it ⇒ the campaign is outside the picker's
        //     current date scope, the filter still applies to it, and the reader must not conclude
        //     the id is bogus.
        // Rendering the ids and nothing else would let the reader assume the names were simply
        // omitted for brevity; rendering nothing would hide an active filter outright.
        return [crit(label, ctx.t(
            ctx.campaignsError
                ? `${SS}export.criteria.campaignsNamesUnavailable`
                : `${SS}export.criteria.campaignsPartial`,
            { n: ids.length, list },
        ))].concat(continuation);
    },

    // ONE row for the whole window, rendered from the STATE — the state holds the inclusive date
    // the user picked and the chip shows, while `req.DateTo` is the exclusive bound
    // `exclusiveUpperBound` shifted for the SP's half-open predicate. Printing the wire value would
    // tell the operator the file covers a day it does not.
    DateFrom: (f, req, ctx) => {
        const from = formatCriterionDate(f.DateFrom);
        const to = formatCriterionDate(f.DateTo);
        const label = ctx.t(`${SS}export.criteria.dateRange`);
        const rows: ExportCriterion[] = [];
        if (from && to) rows.push(crit(label, ctx.t(`${SS}export.criteria.dateBoth`, { from, to })));
        else if (from) rows.push(crit(label, ctx.t(`${SS}export.criteria.dateFromOnly`, { from })));
        else if (to) rows.push(crit(label, ctx.t(`${SS}export.criteria.dateToOnly`, { to })));
        // No dates picked. NOT "all time" — the SP's own window applies, and which window that is
        // depends on the >1-year opt-in. This branch already NAMES the twelve-month default, so the
        // clamp notice below would be saying the same thing twice.
        else {
            return [crit(label, ctx.t(f.IncludeOverOneYear
                ? `${SS}export.criteria.dateNoLimit`
                : `${SS}export.criteria.dateDefaultWindow`))];
        }

        // 🔴 THE FILE MUST NOT CLAIM COVERAGE IT DOES NOT HAVE. Added after review (2026-08-09).
        //
        // The picked dates are printed above exactly as the operator chose them — and when
        // "כלול חיפוש שליחות מעל שנה" is OFF, the SP OVERWRITES the lower bound:
        //   50-SearchSends-MultiCampaign.sql:188-196 — @prm_DateTo defaults to GETDATE(),
        //   @OneYearFloor = DATEADD(month,-12,@prm_DateTo), and with @prm_IncludeOverOneYear = 0 a
        //   @prm_DateFrom that is NULL or older than the floor is SET TO the floor.
        // That floor is the cheap-path guarantee (a closed two-sided range on
        // NCI_CampaignSendingLog_TimeStamp) and is not something to fight. But it means an export
        // asked for 01/01/2023 → today returns only the last twelve months, while the criteria block
        // — the block that exists precisely to state what the file covers — read "מ-01/01/2023" and
        // nothing anywhere said otherwise. A reader would conclude that no matching sends occurred in
        // the years in between. The IncludeOverOneYear renderer below emits a row only when the flag
        // is TRUE, so the state that CAUSES the truncation was the one state invisible in the file.
        //
        // Three of the four branches above can be narrowed: from+to, from-only (upper bound is the
        // SP's "now"), and to-only (a NULL DateFrom is floored too, so "up to X" overstates just as
        // badly). The extra row states the narrowing and how to lift it; it is never a substitute for
        // the requested window, which stays printed above so the file records what was ASKED as well
        // as what was answered.
        if (!f.IncludeOverOneYear) {
            const floor = monthsBefore(f.DateTo ?? todayIso(), 12);
            if (f.DateFrom == null || f.DateFrom < floor) {
                rows.push(crit(
                    ctx.t(`${SS}export.criteria.dateClamped`),
                    ctx.t(`${SS}export.criteria.dateClampedValue`),
                ));
            }
        }
        return rows;
    },

    // Folded into the DateFrom row above. Returning [] is deliberate and is NOT the same as having
    // no renderer: no renderer would send it through `fallbackCriterion` and the file would carry
    // the shifted, exclusive wire date as a second, contradictory row.
    DateTo: () => [],

    IncludeOverOneYear: (f, req, ctx) => (req.IncludeOverOneYear
        ? [crit(ctx.t(`${SS}export.criteria.includeOverOneYear`), exportBoolLabel(ctx.t, true))]
        : []),

    // Paging is NOT a criterion, and this is the one place it has to be said out loud: the export
    // walks EVERY matching row (the server re-pages internally at 200), so the grid's page index and
    // page size describe the screen, never the file. A "page 3 of 50" row in an audit file would
    // invite exactly the wrong conclusion about what is missing from it.
    PageIndex: () => [],
    PageSize: () => [],

    // One row per COMPLETE clause, read from the request — which is where the panel's locally-held
    // advanced rules land (SendSearchPanel `buildRequest`), and which has already dropped the
    // half-built ones. The incomplete count is reported separately by the builder below.
    Filters: (f, req, ctx) => (req.Filters ?? []).map((c) => {
        const op = exportOperatorLabel(ctx.t, c.Operator);
        const v1 = c.Value1 ?? '';
        const value = operatorNeedsValue2(c.Operator)
            ? ctx.t(`${SS}export.criteria.filterRuleBetween`, { op, from: v1, to: c.Value2 ?? '' })
            : ctx.t(`${SS}export.criteria.filterRuleValue`, { op, value: v1 });
        return crit(
            ctx.t(`${SS}export.criteria.filterRule`, { field: fieldDisplayOf(ctx, c.FieldKey) }),
            value,
        );
    }),

    // Field AND direction in one row: a direction without its field is meaningless, and two rows
    // could be separated by a future insertion and read apart.
    SortField: (f, req, ctx) => {
        if (!req.SortField) return [];
        const rows: ExportCriterion[] = [crit(
            ctx.t(`${SS}export.criteria.sort`),
            ctx.t(`${SS}export.criteria.sortValue`, {
                field: fieldDisplayOf(ctx, req.SortField),
                dir: ctx.t(sortDirectionKey(!!req.SortDescending)),
            }),
        )];

        // 🔴 THE FILE MUST NOT ASSERT AN ORDER IT MAY NOT HAVE. Added after review (2026-08-09).
        // Same doctrine as the date clamp above: the row above records what was ASKED, this row
        // records what may have been ANSWERED — it never replaces the requested sort.
        //
        // A sort key here is always a data-source `SourceHeader` (the sort is picked in the advanced
        // panel, out of the searchable-field catalogue — SendSearchPanel `advSort`), and the SP
        // resolves it against the columns of the data-source versions IN SCOPE:
        //   50-SearchSends-MultiCampaign.sql:792-803 — #SCol = DataSourceColumns JOIN #Ver on
        //   `SourceHeader = @SortKey AND IsSearchable = 1`, then
        //   `IF NOT EXISTS (SELECT 1 FROM #SCol) SET @SortMode = 0;`
        // — and #Ver is built from #Camp (:577-585), i.e. from the campaigns that were TICKED. With
        // @SortMode = 0 every arm of the ORDER BY collapses to NULL (:876-882) and the rows come
        // back in the default order, `SentAt DESC, CampaignID DESC, RecipientID ASC` (:883).
        //
        // That degrade is SILENT: the SP emits no mode flag, no second result set and no return
        // code, so neither this client nor the server-side export can detect it. Without this row
        // the criteria block would state "מיון: סכום פרמיה (יורד)" at the head of a file ordered by
        // send time, and a regulator reading the top rows as the largest premiums would be reading
        // an ordering the file does not have. The only trace in the file is that the "ערך המיון"
        // column is empty on every row, and nothing connects a blank column to a dropped sort.
        //
        // UNCONDITIONAL, and that is the considered choice: no client-side state can rule the
        // degrade out. The field catalogue is fetched WITHOUT the campaign selection
        // (SendSearchPanel:208-218 — deliberately, it must never be narrowed by the picker), so a
        // field being present in it does not mean the ticked campaigns can resolve it. Asserting
        // "applied" or "not applied" off that catalogue would swap one wrong statement for another;
        // naming the condition, and how to check it in this very file, is the only honest row
        // available until the SP reports the mode it actually used.
        rows.push(crit(
            ctx.t(`${SS}export.criteria.sortNotGuaranteed`),
            ctx.t(`${SS}export.criteria.sortNotGuaranteedValue`),
        ));
        return rows;
    },
    // Folded into SortField, same reasoning as DateTo.
    SortDescending: () => [],
};

// A filter the scan found but no renderer knows about. It is printed with its RAW field name and a
// best-effort value — deliberately ugly, deliberately present. This is the function that makes the
// "never from a hand-written list" rule true rather than aspirational.
const stringifyCriterionValue = (ctx: ExportCriteriaContext, v: any): string => {
    if (v == null) return '';
    if (typeof v === 'boolean') return exportBoolLabel(ctx.t, v);
    if (Array.isArray(v)) {
        return v.map((x) => (x != null && typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ');
    }
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
};

/**
 * The criteria block: every filter currently in effect, one row each.
 *
 * IT IS BUILT BY SCANNING THE STATE, not from a list. `defaultSendSearchFilters()` and its wire
 * projection are walked key by key; a key still at its default is omitted, a key that moved is
 * rendered. A filter added to `SendSearchFilters` next month therefore appears in this table — and
 * in the exported file — on the day it is added, with no edit here. A hand-written list would have
 * gone stale at exactly that moment, and the failure would have been INVISIBLE: a file that looks
 * complete while omitting the one filter that explains why it is short.
 *
 * Two objects go in, and the distinction is load-bearing:
 *   • `f`   — screen state: the dates the user picked, shown inclusive, matching the chips.
 *   • `req` — the wire body: trimmed text, de-duplicated campaign ids, COMPLETE clauses only, the
 *             advanced rules the panel holds in local state, and the exclusive DateTo. This is what
 *             the server will actually run.
 * A key is "at default" only when BOTH are at default, so the advanced rules — which live in `req`
 * and never in `f` — are never mistaken for absent.
 */
export const buildExportCriteria = (
    f: SendSearchFilters,
    req: SendSearchRequest,
    ctx: ExportCriteriaContext,
): ExportCriterion[] => {
    const defF = defaultSendSearchFilters();
    const defR = toSendSearchRequest(defF);
    const out: ExportCriterion[] = [];
    const seen: { [k: string]: boolean } = {};

    // Key ORDER is the declaration order of `defaultSendSearchFilters()` — JS preserves insertion
    // order for string keys — so the criteria block reads in the same order every time and two files
    // of the same search are diffable. The request's keys come next (a member that exists only on
    // the WIRE, synthesised by the projection), and the LIVE objects come last.
    //
    // 🔴 THE LIVE OBJECTS ARE PART OF THE SCAN, and that is the whole anti-staleness guarantee, not
    // belt-and-braces. Caught by the smoke test 2026-08-09: scanning only the two DEFAULT objects
    // silently drops any key that is present on the actual filters/request but absent from
    // `defaultSendSearchFilters()` — a field spread in from elsewhere, or one added to the state
    // shape before its default. Such a key compares against `undefined`, is therefore never "at
    // default", and now renders through the fallback. Scanning defaults alone would have produced
    // the precise failure this design exists to prevent: an audit file that looks complete while
    // omitting an active filter.
    const keys: string[] = Object.keys(defF)
        .concat(Object.keys(defR))
        .concat(Object.keys(f ?? {}))
        .concat(Object.keys(req ?? {}));

    keys.forEach((key) => {
        if (seen[key]) return;
        seen[key] = true;

        const atDefault = sameCriterionValue((f as any)[key], (defF as any)[key])
            && sameCriterionValue((req as any)[key], (defR as any)[key]);
        if (atDefault && ALWAYS_LISTED.indexOf(key) < 0) return;

        const render = CRITERION_RENDERERS[key];
        if (render) {
            render(f, req, ctx).forEach((row) => out.push(row));
            return;
        }
        // No renderer: print it anyway, labelled as a field this dialog does not yet know how to
        // describe. Ugly and honest beats absent and tidy.
        out.push(crit(
            ctx.t(`${SS}export.criteria.unlisted`, { field: key }),
            stringifyCriterionValue(ctx, (req as any)[key] !== undefined ? (req as any)[key] : (f as any)[key]),
        ));
    });

    // Rules the user built but never finished. They are dropped by `isClauseComplete` before the
    // request is made, so they narrow nothing — and a reader of the file who saw the operator's
    // screen would otherwise expect them to have applied.
    const incomplete = ctx.incompleteRuleCount ?? 0;
    if (incomplete > 0) {
        out.push(crit(
            ctx.t(`${SS}export.criteria.incompleteRules`),
            ctx.t(`${SS}export.criteria.incompleteRulesValue`, { n: incomplete }),
        ));
    }

    return out;
};
