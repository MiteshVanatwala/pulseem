// Smart-Send mock fixtures (§7 of the build plan — THE QA infrastructure, not decoration).
// Same convention as dataSourcesMock.ts: every function returns a PulseemResponse-shaped
// object { StatusCode, Message, Data } SYNCHRONOUSLY, with the EXACT field names the real
// API returns, so the single USE_SEND_MOCK flip is transparent.
//
// SCENARIO MAP (magic campaignId — §7.2 coverage):
//   601  unmapped, clean          — full token variety: Hebrew free token, system field,
//                                   graph tokens (p1/p2), case-sensitive pair Name/name
//   602  mapped, everything OK    — source 9 "לקוחות כלל", locked=active=41
//   603  mapped + IsStale         — a newer version (42) was published
//   604  mapped + Mismatch        — synthetic group dropped/merged
//   605  CLONE: unmapped + foreign PulseemDS_ group attached (PO decision #6 banner)
//   606  partial mapping          — unmapped token + token mapped to a VANISHED column
//   607  mapped + supervisor/gap  — business columns chosen (sort = effective gap)
//   608  mapped, source has NO resolved rows — GetSampleValues returns an empty dict
//   609  mapped + supervisor/gap + EXPLICIT sort column
//   610  COMBINED campaign (source + regular groups) — §16: Summary.Groups &
//        SendSettings.GroupIds carry the synthetic PulseemDS_ group AND regular
//        groups; a recipient from a regular group has no source row → mapped
//        token = empty string (the UI explanation the send screen must render)
//   660  SetMapping → -6  EDIT_BLOCKED_DURING_SEND (409)
//   990  every call  → 927 (feature off)         991  every call → 404 (foreign campaign)
//   Send pipeline codes: 620→423+links · 621→451 · 622→550 · 623→551 · 624→402 · 625→405 · 626→422
//   SetMapping by DataSourceID: 55→422 VIEW_ONLY · 66→409 GROUP_MERGE_LIMIT
//   Channel !== 1 anywhere → 400 CHANNEL_NOT_SUPPORTED (mirrors the controller gate)
import {
    GetMappingResult, SmartSendColumn, SmartSendTokenInfo, SaveMappingRequest,
    FillSummary, eSendChannel
} from '../../Models/DataSources/SmartSend';

// ── shared fixtures ──────────────────────────────────────────────────────────

// Columns of locked version 41 of source 9 (RS2 shape). Includes the identity
// column (SemanticRole=1) and number/currency columns for gap/sort realism.
const COLUMNS_V41: SmartSendColumn[] = [
    { ColumnID: 56, Ordinal: 1, SourceHeader: 'שם פרטי', DisplayName: 'שם פרטי', ColumnKey: 'c1', DataType: 1, FormatHint: 0, SemanticRole: 0, IsSearchable: false },
    { ColumnID: 60, Ordinal: 2, SourceHeader: 'אימייל', DisplayName: 'אימייל', ColumnKey: 'c2', DataType: 4, FormatHint: 0, SemanticRole: 1, IsSearchable: false },
    { ColumnID: 55, Ordinal: 3, SourceHeader: 'פרמיה חודשית', DisplayName: 'פרמיה חודשית', ColumnKey: 'c3', DataType: 2, FormatHint: 1, SemanticRole: 0, IsSearchable: false },
    { ColumnID: 57, Ordinal: 4, SourceHeader: 'יעד', DisplayName: 'יעד רבעוני', ColumnKey: 'c4', DataType: 2, FormatHint: 1, SemanticRole: 0, IsSearchable: false },
    { ColumnID: 58, Ordinal: 5, SourceHeader: 'עמלה', DisplayName: 'עמלה', ColumnKey: 'c5', DataType: 2, FormatHint: 2, SemanticRole: 0, IsSearchable: false },
    { ColumnID: 61, Ordinal: 6, SourceHeader: 'אימייל מפקח', DisplayName: 'אימייל מפקח', ColumnKey: 'c6', DataType: 4, FormatHint: 0, SemanticRole: 0, IsSearchable: true },
    { ColumnID: 62, Ordinal: 7, SourceHeader: 'פער', DisplayName: 'פער מהיעד', ColumnKey: 'c7', DataType: 2, FormatHint: 1, SemanticRole: 0, IsSearchable: true }
];

// Token variety (§7.2): Hebrew free, system field, graph pair, case-sensitive pair.
const TOKENS_BASE: SmartSendTokenInfo[] = [
    { Token: 'FirstName', IsSystemField: true, IsGraphToken: false, MappedColumnID: null },
    { Token: 'פרמיה', IsSystemField: false, IsGraphToken: false, MappedColumnID: null },
    { Token: 'שם סוכן', IsSystemField: false, IsGraphToken: false, MappedColumnID: null },
    { Token: 'TierAmount1', IsSystemField: false, IsGraphToken: true, MappedColumnID: null },
    { Token: 'TierAmount2', IsSystemField: false, IsGraphToken: true, MappedColumnID: null },
    { Token: 'Name', IsSystemField: false, IsGraphToken: false, MappedColumnID: null },
    { Token: 'name', IsSystemField: false, IsGraphToken: false, MappedColumnID: null }
];

const mapTokens = (map: { [token: string]: number | null }): SmartSendTokenInfo[] =>
    TOKENS_BASE.map(t => ({ ...t, MappedColumnID: map[t.Token] !== undefined ? map[t.Token] : null }));

const FULL_MAP: { [token: string]: number } = {
    'FirstName': 56, 'פרמיה': 55, 'שם סוכן': 56, 'TierAmount1': 57, 'TierAmount2': 58, 'Name': 56, 'name': 58
};

const ok = (data: any) => ({ StatusCode: 200, Message: '', Data: data });
const err = (code: number, message: string, data: any = null) => ({ StatusCode: code, Message: message, Data: data });

const gate = (campaignId: number) => {
    if (campaignId === 990) return err(927, 'DATA_SOURCES');
    if (campaignId === 991) return err(404, 'NOT_FOUND');
    return null;
};

const baseMapping = (campaignId: number): GetMappingResult => ({
    CampaignID: campaignId,
    IsMapped: true,
    IsStale: false,
    Mismatch: false,
    DataSource: { DataSourceID: 9, Name: 'לקוחות כלל — יולי', LockedVersionID: 41, ActiveVersionID: 41 },
    SupervisorColumnID: null,
    GapColumnID: null,
    SortColumnID: null,
    // Synthetic group id derived from the campaign (7000 + id) — coherent with
    // mockSetMapping's formula and with the Summary/SendSettings group ids (e.g.
    // 610 → 7610, matching PulseemDS_610 / GroupIds '7610,301,302').
    SyntheticGroupID: 7000 + (campaignId % 1000),
    ForeignSyntheticGroupID: null,
    ForeignSyntheticGroupName: null,
    Tokens: mapTokens(FULL_MAP),
    Columns: COLUMNS_V41
});

// ── GetMapping ───────────────────────────────────────────────────────────────
export const mockGetMapping = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    switch (campaignId) {
        case 601: // unmapped + clean
            return ok({
                CampaignID: 601, IsMapped: false, IsStale: false, Mismatch: false,
                DataSource: null, SupervisorColumnID: null, GapColumnID: null, SortColumnID: null,
                SyntheticGroupID: null, ForeignSyntheticGroupID: null, ForeignSyntheticGroupName: null,
                Tokens: TOKENS_BASE, Columns: []
            });
        case 603: return ok({ ...baseMapping(603), IsStale: true, DataSource: { DataSourceID: 9, Name: 'לקוחות כלל — יולי', LockedVersionID: 41, ActiveVersionID: 42 } });
        case 604: return ok({ ...baseMapping(604), Mismatch: true });
        case 605: // clone: foreign synthetic group, no mapping (PO decision #6).
            // Per the Gate-0 RS1 rule the unmapped-clone row populates ONLY the
            // Foreign* fields (Mismatch=false — the clone banner keys on
            // ForeignSyntheticGroupID, never on Mismatch; 604 covers Mismatch).
            return ok({
                CampaignID: 605, IsMapped: false, IsStale: false, Mismatch: false,
                DataSource: null, SupervisorColumnID: null, GapColumnID: null, SortColumnID: null,
                SyntheticGroupID: null, ForeignSyntheticGroupID: 777, ForeignSyntheticGroupName: 'PulseemDS_444',
                Tokens: TOKENS_BASE, Columns: []
            });
        case 606: // partial: 'פרמיה' unmapped; 'שם סוכן' mapped to a VANISHED column (999 ∉ Columns)
            return ok({
                ...baseMapping(606),
                Tokens: mapTokens({ 'FirstName': 56, 'פרמיה': null, 'שם סוכן': 999, 'TierAmount1': 57, 'TierAmount2': 58, 'Name': 56, 'name': 58 })
            });
        case 607: return ok({ ...baseMapping(607), SupervisorColumnID: 61, GapColumnID: 62, SortColumnID: null });
        case 609: // supervisor + gap + EXPLICIT sort (§7.2 "עם מיון" — 607 covers the ISNULL(Sort,Gap) direction)
            return ok({ ...baseMapping(609), SupervisorColumnID: 61, GapColumnID: 62, SortColumnID: 57 });
        case 660: return ok(baseMapping(660));
        default:  return ok(baseMapping(campaignId)); // 602, 608, 62x — mapped-full
    }
};

// ── SetMapping ───────────────────────────────────────────────────────────────
export const mockSetMapping = (req: SaveMappingRequest) => {
    const g = gate(req.CampaignID); if (g) return g;
    if (req.Channel !== eSendChannel.EMAIL) return err(400, 'CHANNEL_NOT_SUPPORTED');
    if (req.DataSourceID === 55) return err(422, 'VIEW_ONLY');                 // datalake, no identity
    if (req.DataSourceID === 66) return err(409, 'GROUP_MERGE_LIMIT');         // -10 (PO decision #1)
    if (req.CampaignID === 660) return err(409, 'EDIT_BLOCKED_DURING_SEND');   // -6
    if ((req.Mappings || []).some(m => !m || !m.Token || m.DataSourceColumnID <= 0)) return err(400, 'DATA_INCORRECT');
    if ((req.Mappings || []).some(m => m.DataSourceColumnID === 999)) return err(400, 'DATA_INCORRECT'); // -9 chain
    return ok({ SyntheticGroupID: 7000 + (req.CampaignID % 1000) });
};

// ── GetSampleValues ──────────────────────────────────────────────────────────
// NULL value in the sample row → empty string, NEVER a raw ##token## (§7.2).
export const mockGetSampleValues = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    if (campaignId === 601 || campaignId === 605) return err(404, 'NOT_FOUND'); // unmapped
    if (campaignId === 608) return ok({});                                      // no resolved rows
    if (campaignId === 606) return ok({
        // 606: 'פרמיה' is unmapped and 'שם סוכן'→vanished column 999. The real SP
        // (DataSources_GetSampleValuesForMapping) INNER-JOINs the token map to the locked
        // version's columns, so it returns NEITHER — they stay raw in the preview, matching
        // the UnmappedTokensWarning. Mock must mirror that (least-privilege, mapped-only).
        'FirstName': 'ישראל', 'TierAmount1': '5,000', 'TierAmount2': '7,500', 'Name': 'Israel', 'name': ''
    });
    return ok({
        'FirstName': 'ישראל',
        'פרמיה': '1,240 ₪',
        'שם סוכן': 'דנה לוי',
        'TierAmount1': '5,000',
        'TierAmount2': '7,500',
        'Name': 'Israel',
        'name': ''            // NULL in the row → empty string
    });
};

// ── FillAndSummarize ─────────────────────────────────────────────────────────
export const mockFillAndSummarize = (campaignId: number, channel: eSendChannel) => {
    const g = gate(campaignId); if (g) return g;
    if (channel !== eSendChannel.EMAIL) return err(400, 'CHANNEL_NOT_SUPPORTED');
    if (campaignId === 601 || campaignId === 605) return err(404, 'NOT_FOUND'); // unmapped
    const fill: FillSummary = campaignId === 608
        ? { TotalRows: 1200, FinalClients: 0, SkippedNoIdentity: 1200, SkippedDuplicates: 0, SkippedRemovedOrMissing: 0 }
        : { TotalRows: 1200, FinalClients: 1100, SkippedNoIdentity: 60, SkippedDuplicates: 25, SkippedRemovedOrMissing: 15 };
    return ok(fill);
};

// ── Send (the §10 envelope's pipeline codes — §7.2 fixtures) ─────────────────
export const mockSendSmart = (campaignId: number, sendToSupervisor: boolean, channel: eSendChannel) => {
    const g = gate(campaignId); if (g) return g;
    if (channel !== eSendChannel.EMAIL) return err(400, 'CHANNEL_NOT_SUPPORTED');
    switch (campaignId) {
        case 620: return err(423, 'PROBLEMATIC_LINKS_FOUND', ['http://bit.ly/x1', 'http://tinyurl.com/y2']);
        case 621: return err(451, 'SPF_DKIM');            // domain not verified
        case 622: return err(550, 'PENDING_APPROVAL');    // first campaign / thresholds
        case 623: return err(551, 'UNDER_REVIEW');
        case 624: return err(402, 'NO_CREDITS');
        case 625: return err(405, 'SEND_NOT_ALLOWED');
        case 626: return err(422, 'HTML_BODY_EMPTY');
        case 601:
        case 605: return err(404, 'NOT_FOUND');           // unmapped cannot send
        default:  return { StatusCode: 201, Message: '', Data: null };
    }
};

// ── Wrapped reused thunks (§7.1 — the reused pipeline must obey the switch) ──

// getSendSummary → the EXACT SendSummary wire shape (C# SendSettings.cs:85-132;
// §7.1 "same fields" rule — no invented fields, no omissions of consumed ones;
// SendDate is a non-nullable DateTime server-side, so always a concrete value).
export const mockGetSendSummary = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    return ok({
        CampaignID: campaignId,
        FromEmail: 'service@clal-demo.co.il',
        Subject: 'שלום ##FirstName##, עדכון הפרמיה שלך',
        CampaignName: 'קמפיין כלל — עדכון רבעוני',
        SendDate: '2026-07-19T10:00:00',
        SendingMethod: 1,                      // immediate (CampaignSendingMethod)
        IsBestTime: false,
        PulseAmount: 0,
        TimeInterval: 0,
        IsOpened: false,
        IsOpenedClicked: false,
        IsNotClicked: false,
        IsNotOpened: false,
        FromDate: null,
        ToDate: null,
        // 610 = combined campaign (§16): synthetic PulseemDS_ group + regular groups.
        // Otherwise just the synthetic group. Recipients from the regular groups have
        // no source row → their mapped tokens resolve to empty strings on send.
        Groups: campaignId === 610
            ? 'PulseemDS_610, קבוצה רגילה א, קבוצה רגילה ב'
            : 'PulseemDS_' + campaignId,
        TotalClients: 1185,
        ExceptionalOpensClicksClientsCount: 0,
        ExceptionalDays: 0,
        ExceptionalDaysClientsCount: 0,
        ExceptionalCampaigns: '',
        ExceptionalCampaignsClientsCount: 0,
        ExceptionalGroups: '',
        ExceptionalGroupsClientsCount: 0,
        NoEmailClients: 60,
        RemovedClients: 10,
        RestrictedClients: 3,
        InvalidClients: 2,
        PendingClients: 0,
        FinalClients: 1100,
        ClientStatus: 0,
        TotalNotToSend: 60,
        CreditPerClient: 1,
        SendPlanID: 88000 + (campaignId % 1000),
        AutoSendingByUserField: null,
        AutoSendDelay: 0,
        DuplicateClients: 25,
        ClientID: [],
        ExceptionalUserFieldClientCount: 0,
        ReplyTo: 'service@clal-demo.co.il',
        HasSupervisors: campaignId === 607 || campaignId === 609   // supervisor scenarios only
    });
};

// getEmailSendSettings → Data.Settings + Data.Info (newsletterSlice splits them).
export const mockGetEmailSendSettings = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    // 610 = combined campaign (§16): a non-empty GroupIds CSV that carries the
    // synthetic group (7610) AND regular groups (301,302). Other scenarios save the
    // synthetic group via the M9 flow, so the loaded settings start with an empty CSV.
    const groupIds = campaignId === 610 ? '7610,301,302' : '';
    return ok({
        Settings: {
            CampaignID: campaignId, SendingMethod: 1, SendDate: null,
            GroupIds: groupIds, ExeptionalCampaigns: '', ExeptionalGroups: '',
            PulseAmount: null, TimeInterval: null, AutoSendDelay: null,
            AutoSendingByUserField: null, IsBestTime: false,
            ExceptionalDays: null, ExceptionalDaysTimeframe: 2, Status: 1
        },
        Info: {
            CampaignID: campaignId, Name: 'קמפיין כלל — עדכון רבעוני',
            Subject: 'שלום ##FirstName##, עדכון הפרמיה שלך',
            FromName: 'כלל ביטוח', FromEmail: 'service@clal-demo.co.il', ReplyTo: 'service@clal-demo.co.il'
        }
    });
};

export const mockSetEmailSendSettings = (payload: any) => {
    const g = gate(payload?.CampaignID ?? 0); if (g) return g;
    return { StatusCode: 201, Message: '', Data: null };
};

// getNewsletterPreview → raw campaign HTML WITH ##tokens##. TEXT tokens are raw
// ##...##; the tier-graph <img> carries GRAPH tokens URL-ENCODED in its pN params
// (p1=%23%23TierAmount1%23%23 — the real buildLink output, tierGraphCore.js:160),
// so the M9 SmartSendPreview exercises the correct decode→replace→re-encode path
// (NEVER a raw HTML Replace for graph tokens). EmailPreviewComponent injects as-is.
export const mockGetNewsletterPreview = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    const html =
        '<div dir="rtl" style="font-family:Assistant,Arial"><h2>שלום ##FirstName##,</h2>' +
        '<p>הפרמיה החודשית שלך: <b>##פרמיה##</b> (סוכן: ##שם סוכן##)</p>' +
        '<img alt="graph" src="https://www.pulseem.co.il/Pulseem/pulseemmonitorgraph.png?gt=stairs&cfg=eyJ4IjoxfQ&p1=%23%23TierAmount1%23%23&p2=%23%23TierAmount2%23%23" />' +
        '<p>##Name## / ##name##</p></div>';
    return ok({ HTML: html, HTMLtoSend: html, AmpData: null });
};

export const mockTestSend = (payload: any) => {
    const g = gate(payload?.CampaignID ?? 0); if (g) return g;
    return { StatusCode: 200, Message: 'SUCCESS_SENT', Data: null };
};

export const mockSaveCampaignInfo = (info: any) => {
    const g = gate(info?.CampaignID ?? 0); if (g) return g;
    return { StatusCode: 201, Message: '', Data: null };
};

export const mockGetCampaignInfo = (campaignId: number) => {
    const g = gate(campaignId); if (g) return g;
    return ok({
        CampaignID: campaignId, Name: 'קמפיין כלל — עדכון רבעוני',
        Subject: 'שלום ##FirstName##, עדכון הפרמיה שלך',
        FromName: 'כלל ביטוח', FromEmail: 'service@clal-demo.co.il', ReplyTo: 'service@clal-demo.co.il'
    });
};
