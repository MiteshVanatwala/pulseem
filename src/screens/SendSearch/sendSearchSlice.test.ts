// ═══════════════════════════════════════════════════════════════════════════════════════════
// sendSearchSlice — filter/paging/loading/error transitions. CONTRACT §4.3, RESUME.md §4.2.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\sendSearchSlice.test.ts
// TARGET PATH:   ReactCode\src\screens\SendSearch\sendSearchSlice.test.ts
//
// Pure reducer tests: `reducer(state, action)` only. No store is configured, no thunk is dispatched,
// no HTTP happens — the async lifecycle is exercised by handing the reducer the SAME action objects
// `createAsyncThunk` produces (`searchSends.pending/fulfilled/rejected`, with the `meta.requestId`
// the slice's staleness guard reads). That is the real contract surface and it needs no store.
//
// The one mock is `helpers/Api/PulseemReactAPI`, because importing the slice pulls in the axios
// instance module, which at REQUIRE time reaches i18n bootstrap, cookies and `window.location`.
// Stubbing that single module boundary is what keeps this suite inside "jsdom and nothing else"
// (CONTRACT §5). No component, no store and no thunk internals are mocked.
// ═══════════════════════════════════════════════════════════════════════════════════════════

jest.mock('../../helpers/Api/PulseemReactAPI', () => ({
    PulseemReactInstance: { post: jest.fn(), get: jest.fn() },
}));

import reducer, {
    setFilters, setPageIndex, setPageSize, clearFilters,
    searchSends, getSendProvenance,
} from '../../redux/reducers/sendSearchSlice';
import {
    eRoleFilter, eRowKind, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE,
    toSendSearchRequest, defaultSendSearchFilters,
} from '../../Models/DataSources/SendSearch';
import { eSendChannel } from '../../Models/DataSources/SmartSend';

const init = () => reducer(undefined, { type: '@@INIT' } as any);

// The action shapes createAsyncThunk emits. Built by hand rather than by dispatching, so the suite
// never needs a store, and so `meta.requestId` — the staleness guard's input — is explicit.
const pending = (requestId: string) => ({ type: searchSends.pending.type, meta: { requestId }, payload: undefined });
const fulfilled = (requestId: string, payload: any) => ({ type: searchSends.fulfilled.type, meta: { requestId }, payload });
const rejected = (requestId: string, payload: any) => ({ type: searchSends.rejected.type, meta: { requestId }, payload, error: { message: 'boom' } });

describe('sendSearchSlice — filters and paging', () => {
    test('a filter change resets PageIndex to 0', () => {
        // A filter edit that kept the page index fetches page 4 of a 1-page result and renders an
        // empty grid that looks exactly like "no matches". Silent wrong answer, not a crash.
        let state = init();
        state = reducer(state, setPageIndex(4));
        expect(state.filters.PageIndex).toBe(4);
        state = reducer(state, setFilters({ SearchText: 'מילנה' }));
        expect(state.filters.PageIndex).toBe(0);
        expect(state.filters.SearchText).toBe('מילנה');
    });

    test('EVERY filter field resets the page, not just the text box', () => {
        const changes: Array<[string, any]> = [
            ['SearchText', 'x'],
            ['RoleFilter', eRoleFilter.Supervisor],
            ['RowKind', eRowKind.Rollup],
            ['CampaignID', 55],
            ['DateFrom', '2026-01-01T00:00:00'],
            ['DateTo', '2026-02-01T00:00:00'],
            ['IncludeOverOneYear', true],
        ];
        changes.forEach(([key, value]) => {
            let state = init();
            state = reducer(state, setPageIndex(3));
            state = reducer(state, setFilters({ [key]: value } as any));
            expect(`${key}:${state.filters.PageIndex}`).toBe(`${key}:0`);
            expect((state.filters as any)[key]).toEqual(value);
        });
    });

    test('paging PRESERVES the filters — it changes nothing but the index', () => {
        let state = init();
        state = reducer(state, setFilters({
            SearchText: 'מילנה', RoleFilter: eRoleFilter.Agent, RowKind: eRowKind.Agents,
            CampaignID: 77, IncludeOverOneYear: true,
        }));
        const before = { ...state.filters };
        state = reducer(state, setPageIndex(2));
        expect(state.filters.PageIndex).toBe(2);
        expect({ ...state.filters, PageIndex: 0 }).toEqual({ ...before, PageIndex: 0 });
    });

    test('a negative page index is clamped to 0, never sent as -1', () => {
        const state = reducer(init(), setPageIndex(-3));
        expect(state.filters.PageIndex).toBe(0);
    });

    test('changing the page SIZE resets the page index', () => {
        // Page 4 at size 20 is not page 4 at size 100 — keeping the index silently skips rows.
        let state = reducer(init(), setPageIndex(4));
        state = reducer(state, setPageSize(100));
        expect(state.filters.PageSize).toBe(100);
        expect(state.filters.PageIndex).toBe(0);
    });

    test('"נקה הכל" resets the filters but keeps Channel and PageSize', () => {
        let state = init();
        state = reducer(state, setPageSize(100));
        state = reducer(state, setFilters({ SearchText: 'x', CampaignID: 9, IncludeOverOneYear: true }));
        state = reducer(state, clearFilters());
        expect(state.filters.SearchText).toBe('');
        expect(state.filters.CampaignID).toBeNull();
        expect(state.filters.IncludeOverOneYear).toBe(false);
        expect(state.filters.PageSize).toBe(100);                    // the pager is not fought
        expect(state.filters.Channel).toBe(eSendChannel.EMAIL);      // §8: no channel facet in V1
    });

    test('the wire request sends Channel explicitly as 1 and empty text as NULL', () => {
        // RESUME.md §4.2: "the client must send Channel explicitly as 1". And the SP's
        // @prm_SearchText default is NULL — sending '' would make it search for the empty string.
        const req = toSendSearchRequest(defaultSendSearchFilters());
        expect(req.Channel).toBe(1);
        expect(req.SearchText).toBeNull();
        expect(req.PageIndex).toBe(0);
        expect(req.PageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    test('the client mirrors the server clamp instead of asking for 5000 rows', () => {
        expect(toSendSearchRequest({ ...defaultSendSearchFilters(), PageSize: 5000 }).PageSize).toBe(MAX_PAGE_SIZE);
        expect(toSendSearchRequest({ ...defaultSendSearchFilters(), PageSize: 0 }).PageSize).toBe(1);
        expect(toSendSearchRequest({ ...defaultSendSearchFilters(), SearchText: '   ' }).SearchText).toBeNull();
    });
});

describe('sendSearchSlice — loading and error lifecycle', () => {
    test('loading is true ONLY while in flight', () => {
        let state = init();
        expect(state.loading).toBe(false);
        state = reducer(state, pending('r1') as any);
        expect(state.loading).toBe(true);
        state = reducer(state, fulfilled('r1', { Data: { Items: [], TotalCount: 0 } }) as any);
        expect(state.loading).toBe(false);
    });

    test('a failed load sets error AND clears loading', () => {
        // A spinner that never stops is the failure mode that looks like "still working" forever —
        // the operator waits instead of retrying. Both halves are asserted together on purpose.
        let state = reducer(init(), pending('r1') as any);
        state = reducer(state, rejected('r1', { error: 'Network Error' }) as any);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network Error');
        expect(state.items).toEqual([]);
        expect(state.totalCount).toBe(0);
    });

    test('a new request clears the previous error', () => {
        let state = reducer(init(), pending('r1') as any);
        state = reducer(state, rejected('r1', { error: 'Network Error' }) as any);
        state = reducer(state, pending('r2') as any);
        expect(state.error).toBeNull();
        expect(state.loading).toBe(true);
    });

    test('a 200 carrying no Data is treated as an error, not as an empty result', () => {
        // Leaving the previous rows on screen under new filters is precisely the invisible failure
        // this feature exists to prevent.
        let state = reducer(init(), pending('r1') as any);
        state = reducer(state, fulfilled('r1', { StatusCode: 500, Message: 'SP failed', Data: null }) as any);
        expect(state.error).toBe('SP failed');
        expect(state.items).toEqual([]);
        expect(state.loading).toBe(false);
    });

    test('a stale response cannot overwrite the current one', () => {
        let state = reducer(init(), pending('r1') as any);
        state = reducer(state, pending('r2') as any);
        state = reducer(state, fulfilled('r1', { Data: { Items: [{ RowID: 1 }], TotalCount: 999 } }) as any);
        expect(state.items).toEqual([]);        // r1 is stale — ignored
        expect(state.loading).toBe(true);       // r2 is still in flight
        state = reducer(state, fulfilled('r2', { Data: { Items: [{ RowID: 2 }], TotalCount: 5 } }) as any);
        expect(state.totalCount).toBe(5);
        expect(state.loading).toBe(false);
    });
});

describe('sendSearchSlice — the pager reads TotalCount, never items.length', () => {
    test('TotalCount survives a short page', () => {
        // RESUME.md §4.2 and A8: the pager must read TotalCount. If it read items.length, a 50-row
        // page of a 1,240-row result would render a one-page pager and the operator would conclude
        // the other 1,190 sends do not exist — a silent wrong answer with no error anywhere.
        let state = reducer(init(), pending('r1') as any);
        const items = Array.from({ length: 50 }, (_, i) => ({ RowID: i }));
        state = reducer(state, fulfilled('r1', { Data: { Items: items, TotalCount: 1240 } }) as any);
        expect(state.items).toHaveLength(50);
        expect(state.totalCount).toBe(1240);
        expect(state.totalCount).not.toBe(state.items.length);
    });

    test('a missing TotalCount reads 0 rather than inheriting the previous page count', () => {
        // A8's failure mode from the other side: if `21_` stops emitting the column under the exact
        // name `TotalCount`, C# maps 0. The slice must not paper over that with the last known value.
        let state = reducer(init(), pending('r1') as any);
        state = reducer(state, fulfilled('r1', { Data: { Items: [{ RowID: 1 }], TotalCount: 1240 } }) as any);
        state = reducer(state, pending('r2') as any);
        state = reducer(state, fulfilled('r2', { Data: { Items: [{ RowID: 1 }] } }) as any);
        expect(state.totalCount).toBe(0);
    });
});

describe('sendSearchSlice — provenance: a failed fetch is not an empty history', () => {
    test('an empty ARRAY is the normal answer for a pre-provenance send and is not an error', () => {
        // This is what makes a row Inferred/Unverifiable (D7). Flagging it as an error would make
        // every legacy send look broken.
        let state = reducer(init(), { type: getSendProvenance.pending.type, meta: { arg: { campaignId: 12 } } } as any);
        expect(state.provenanceLoading).toBe(true);
        expect(state.provenanceCampaignId).toBe(12);
        state = reducer(state, { type: getSendProvenance.fulfilled.type, payload: { Data: [] } } as any);
        expect(state.provenanceLoading).toBe(false);
        expect(state.provenance).toEqual([]);
        expect(state.provenanceError).toBeNull();
    });

    test('a FAILED fetch is distinguishable from an empty history', () => {
        // Both land on `provenance: []`. Without the flag, the drawer's empty branch prints the
        // reassuring sentence "no send record, but the mapping was not touched, so this IS the
        // version that was sent" — a positive claim asserted from a request that never came back.
        let state = reducer(init(), { type: getSendProvenance.pending.type, meta: { arg: { campaignId: 12 } } } as any);
        state = reducer(state, { type: getSendProvenance.rejected.type, payload: { error: 'timeout' }, error: {} } as any);
        expect(state.provenance).toEqual([]);
        expect(state.provenanceError).toBe('timeout');
        expect(state.provenanceLoading).toBe(false);
    });
});
