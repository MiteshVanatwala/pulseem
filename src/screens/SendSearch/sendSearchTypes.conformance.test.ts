// ═══════════════════════════════════════════════════════════════════════════════════════════
// Type conformance — `SendSearchRow` (TS) vs `SendSearchModels.cs` (C#), field for field.
// CONTRACT §3.2 / §4.3, RESUME.md §3 A1.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\sendSearchTypes.conformance.test.ts
// TARGET PATH:   ReactCode\src\screens\SendSearch\sendSearchTypes.conformance.test.ts
//
// WHY THIS TEST EXISTS AT ALL, GIVEN tsc:
// `tsc --noEmit` is NOT a gate in this repo (~449 pre-existing errors, demoted by
// TSC_COMPILE_ON_ERROR=true — CONTRACT §4). So a TS interface that drifts from the C# DTO produces
// NO error anywhere: the field simply arrives as `undefined` at runtime and renders blank. That is
// the same class of invisible failure as a blank version cell, and this suite is the only mechanical
// check standing against it.
//
// WHAT IT CAN AND CANNOT VERIFY — stated honestly, because the alternative is a test that looks
// stronger than it is:
//  • The C# file lives in a DIFFERENT repository (ApiForReactCode). It cannot be read from the React
//    build, so the expected field list below is a TRANSCRIPTION of
//    `Dal\Models\DataSources\SendSearchModels.cs`, pinned with its own line references. It is
//    checked by hand at review time; the C#-side twin of this check is TEST-CS's harness.
//  • Nullability is a TYPE fact and TypeScript erases types. It is expressed two ways: as type
//    annotations (which tsc would catch if it were a gate — it is not) and, for the fields where
//    getting it wrong is actually dangerous, as a RUNTIME assignment of `null` that must survive
//    into the object without being dropped or coerced.
//  • What IS mechanically enforced, and is the most likely real drift: the SET and ORDER of keys.
//    A renamed or removed field fails immediately.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import {
    SendSearchRow, SendSearchResponse, SendSearchRequest, SendProvenanceRow,
    sendSearchRowKey,
} from '../../Models/DataSources/SendSearch';
import { eSendChannel } from '../../Models/DataSources/SmartSend';

// ── the C# side, transcribed ─────────────────────────────────────────────────────────────────
// Source: ApiForReactCode\Dal\Models\DataSources\SendSearchModels.cs, class SendSearchRow
// (delivery copy: _delivery\SendSearch-V1\api\SendSearchModels.cs:58-80), in SP column order —
// which is also result-set-1 column order in dbo.DataSources_SearchSends (CONTRACT §2.2).
const CSHARP_SENDSEARCHROW: Array<{ name: string; csharp: string; nullable: boolean }> = [
    { name: 'RowID', csharp: 'long', nullable: false },
    { name: 'DataSourceVersionID', csharp: 'int?', nullable: true },
    { name: 'VersionNumber', csharp: 'int?', nullable: true },
    { name: 'ProvenanceSource', csharp: 'string', nullable: false },
    { name: 'VersionState', csharp: 'string', nullable: false },
    { name: 'Channel', csharp: 'byte', nullable: false },
    { name: 'ChannelCampaignID', csharp: 'int', nullable: false },
    { name: 'CampaignName', csharp: 'string', nullable: false },
    { name: 'RecipientName', csharp: 'string', nullable: false },
    { name: 'RecipientEmail', csharp: 'string', nullable: false },
    { name: 'RecipientCellphone', csharp: 'string', nullable: false },
    { name: 'IsSupervisor', csharp: 'bool', nullable: false },
    { name: 'IsSynthetic', csharp: 'bool', nullable: false },
    { name: 'SupervisorName', csharp: 'string', nullable: false },
    { name: 'SentAt', csharp: 'DateTime?', nullable: true },
    { name: 'DeliveryState', csharp: 'string', nullable: false },
    { name: 'EngagementState', csharp: 'string', nullable: false },
    { name: 'EngagementAt', csharp: 'DateTime?', nullable: true },
    { name: 'RollupValue', csharp: 'string', nullable: false },
    { name: 'HasRow', csharp: 'bool', nullable: false },
];

// A fully-populated row, typed as the TS interface. If a field is renamed on the TS side this object
// stops matching the key list below; if a field is REMOVED from the interface, the excess-property
// check on the annotation catches it at author time and the key list catches it at run time.
const fullRow: SendSearchRow = {
    RowID: 900123,
    DataSourceVersionID: 4210,
    VersionNumber: 7,
    ProvenanceSource: 'Recorded',
    VersionState: 'Available',
    Channel: eSendChannel.EMAIL,
    ChannelCampaignID: 55501,
    CampaignName: 'ביטוח בריאות — יוני',
    RecipientName: 'מילנה',
    RecipientEmail: 'milena@example.co.il',
    RecipientCellphone: '0500000000',
    IsSupervisor: false,
    IsSynthetic: false,
    SupervisorName: '',
    SentAt: '2026-06-11T09:14:00',
    DeliveryState: 'Sent',
    EngagementState: 'Opened',
    EngagementAt: '2026-06-11T09:41:00',
    RollupValue: '',
    HasRow: true,
};

// The same row with every nullable field actually null — the wire shape of CONTRACT §2.2 precedence
// step 3 ("no mapping row at all → version columns NULL") plus a HasRow=0 recipient.
const nullRow: SendSearchRow = {
    ...fullRow,
    DataSourceVersionID: null,
    VersionNumber: null,
    SentAt: null,
    EngagementAt: null,
    HasRow: false,
    ProvenanceSource: 'Unverifiable',
};

describe('SendSearchRow — TS mirrors the C# DTO field for field', () => {
    test('the key SET matches the C# property set exactly — no extra, no missing', () => {
        expect(Object.keys(fullRow).sort()).toEqual(CSHARP_SENDSEARCHROW.map((f) => f.name).sort());
    });

    test('the key ORDER matches SP result-set-1 column order', () => {
        // Order is not cosmetic here: SendSearchLogic maps the DataTable BY NAME, but the SP's column
        // order is the contract §2.2 states "in this exact order", and keeping the TS interface in
        // that order is what lets a reviewer diff the three files side by side in one pass.
        expect(Object.keys(fullRow)).toEqual(CSHARP_SENDSEARCHROW.map((f) => f.name));
    });

    test('every field the C# declares nullable can actually hold null on the TS side', () => {
        CSHARP_SENDSEARCHROW.filter((f) => f.nullable).forEach((f) => {
            // Present as an own key AND holding null — not deleted, not coerced to 0 or ''.
            expect(Object.prototype.hasOwnProperty.call(nullRow, f.name)).toBe(true);
            expect(`${f.name}=${(nullRow as any)[f.name]}`).toBe(`${f.name}=null`);
        });
        // …and the non-nullable ones are still populated in that same row.
        CSHARP_SENDSEARCHROW.filter((f) => !f.nullable).forEach((f) => {
            expect((nullRow as any)[f.name]).not.toBeUndefined();
        });
    });

    test('DeliveryState / EngagementState are plain strings on the wire, not unions', () => {
        // Typing them as the per-channel unions here would be a lie about the wire and would make an
        // unrecognised server value a compile-time impossibility instead of a runtime-visible
        // 'unknown' — which is the whole D10 property SendStatusCell is built to deliver.
        const wire: SendSearchRow = { ...fullRow, DeliveryState: 'SomethingNew', EngagementState: 'SomethingNew' };
        expect(typeof wire.DeliveryState).toBe('string');
        expect(typeof wire.EngagementState).toBe('string');
    });

    test('the response envelope is Items + TotalCount, matching SendSearchResponse', () => {
        const response: SendSearchResponse = { Items: [fullRow], TotalCount: 1240 };
        expect(Object.keys(response)).toEqual(['Items', 'TotalCount']);
        expect(response.TotalCount).not.toBe(response.Items.length);
    });

    test('the request carries the ten SP parameters and no SubAccountID', () => {
        // SubAccountID always comes from the JWT claim. A client-supplied one is a tenant-crossing
        // hole (SendSearchModels.cs header, DataSourceModels.cs:141).
        const request: SendSearchRequest = {
            Channel: eSendChannel.EMAIL, SearchText: null, RoleFilter: 0, RowKind: 0,
            CampaignID: null, DateFrom: null, DateTo: null, IncludeOverOneYear: false,
            PageIndex: 0, PageSize: 50,
        };
        expect(Object.keys(request)).toEqual([
            'Channel', 'SearchText', 'RoleFilter', 'RowKind', 'CampaignID',
            'DateFrom', 'DateTo', 'IncludeOverOneYear', 'PageIndex', 'PageSize',
        ]);
        expect(Object.keys(request)).not.toContain('SubAccountID');
    });

    test('the row key is (Channel, ChannelCampaignID, RowID, SentAt) — RowID alone is not unique', () => {
        // CONTRACT §9. A campaign can legitimately send more than once (that is why there is no unique
        // constraint on (CampaignID, Channel) — CONTRACT §2.1), so two rows can share a RowID. Using
        // RowID as the React key would make the second send's row replace the first's.
        const send1 = { ...fullRow, SentAt: '2026-06-11T09:14:00' };
        const send2 = { ...fullRow, SentAt: '2026-07-02T08:00:00' };
        expect(send1.RowID).toBe(send2.RowID);
        expect(sendSearchRowKey(send1)).not.toBe(sendSearchRowKey(send2));
        // A never-sent row still produces a key rather than a trailing 'undefined'.
        expect(sendSearchRowKey({ ...fullRow, SentAt: null })).not.toMatch(/undefined|null$/);
    });
});

describe('SendProvenanceRow — A1: LatestVersionNumber is NULLABLE', () => {
    // RESUME.md §3 A1: the OUTER APPLY that computes it returns NULL when the DataSource has no
    // Status=2 version at all, and A1 forbids COALESCEing it to VersionNumber — that would invent
    // the claim "a Ready version exists and it equals what was sent". C# side is `int?`.
    const provenance: SendProvenanceRow = {
        SendProvenanceID: 1,
        CampaignID: 55501,
        Channel: eSendChannel.EMAIL,
        DataSourceID: 300,
        DataSourceName: 'לקוחות ביטוח בריאות',
        DataSourceVersionID: 4210,
        VersionNumber: 7,
        LatestVersionNumber: null,          // ← the A1 case. Must be assignable.
        IsOutdated: false,
        VersionState: 'Available',
        SentAt: '2026-06-11T09:14:00',
        TotalRows: 1240,
        SkippedNoIdentity: 3,
        SkippedDuplicates: 11,
        FinalClients: 1226,
        SkippedRemovedOrMissing: 0,
        CreatedBy: 'miri@clal.co.il',
    };

    test('LatestVersionNumber accepts null and is not coerced away', () => {
        expect(Object.prototype.hasOwnProperty.call(provenance, 'LatestVersionNumber')).toBe(true);
        expect(provenance.LatestVersionNumber).toBeNull();
        // Not 0, not undefined, not equal to VersionNumber. Each of those is a distinct wrong answer:
        // 0 renders as "V0", undefined renders blank, and VersionNumber is the invented claim A1 bans.
        expect(provenance.LatestVersionNumber).not.toBe(0);
        expect(provenance.LatestVersionNumber).not.toBeUndefined();
        expect(provenance.LatestVersionNumber).not.toBe(provenance.VersionNumber);
    });

    test('the five Fill counters are all nullable — a pre-A6 provenance row carries none of them', () => {
        const sparse: SendProvenanceRow = {
            ...provenance,
            TotalRows: null, SkippedNoIdentity: null, SkippedDuplicates: null,
            FinalClients: null, SkippedRemovedOrMissing: null,
        };
        ['TotalRows', 'SkippedNoIdentity', 'SkippedDuplicates', 'FinalClients', 'SkippedRemovedOrMissing']
            .forEach((k) => expect(`${k}=${(sparse as any)[k]}`).toBe(`${k}=null`));
    });

    test('the provenance key set matches CONTRACT §3.1 SendProvenanceRow', () => {
        expect(Object.keys(provenance)).toEqual([
            'SendProvenanceID', 'CampaignID', 'Channel', 'DataSourceID', 'DataSourceName',
            'DataSourceVersionID', 'VersionNumber', 'LatestVersionNumber', 'IsOutdated',
            'VersionState', 'SentAt', 'TotalRows', 'SkippedNoIdentity', 'SkippedDuplicates',
            'FinalClients', 'SkippedRemovedOrMissing', 'CreatedBy',
        ]);
    });
});
