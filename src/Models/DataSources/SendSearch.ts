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
});

// Pure projection filters → wire request. Empty text is sent as NULL, not '' — the SP's
// @prm_SearchText default is NULL and '' would make it search for the empty string.
export const toSendSearchRequest = (f: SendSearchFilters): SendSearchRequest => {
    const text = (f.SearchText || '').trim();
    const size = Math.min(Math.max(f.PageSize, 1), MAX_PAGE_SIZE);
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
