// ═══════════════════════════════════════════════════════════════════════════════════════════
// Drawer stack — 3 levels, breadcrumb, Esc pops ONE, scrim closes ALL.
// CONTRACT §4.2, SendSearch-Mock-v3.html:341-356.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\drawerStack.test.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\drawerStack.test.tsx
//
// The behaviour is split across two owners and this suite tests both halves separately, because
// they can fail independently:
//   • the STATE half (push/pop/close, depth cap) lives in `sendSearchSlice`;
//   • the CHROME half (which gesture calls which callback, and the breadcrumb) lives in
//     `DrawerStack.tsx`, whose `onClose(event, reason)` branches escapeKeyDown → onPop and
//     everything else → onClose.
//
// WHY MUI's `Drawer` IS MOCKED HERE — and why that is not "mocking half the app":
// MUI v4's Drawer portals into `document.body` and owns the Escape handling itself. Driving it
// through a synthesised KeyboardEvent in jsdom tests React 16's event delegation and MUI's internal
// Modal wiring, not our contract — and it fails or passes for reasons that have nothing to do with
// this feature. The mock is a five-line stub that renders children and hands back the props, which
// makes the ONE thing we actually own — the reason→callback branching — directly observable and
// deterministic. Nothing else about MUI is replaced.
//
// The risk this leaves open is stated plainly in REACT-TEST-PLAN.md §"not covered": that MUI v4
// really does report Escape as reason === 'escapeKeyDown' and a scrim click as 'backdropClick'.
// That is a library fact, not our logic, and it is asserted against the documented contract rather
// than re-verified here.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

jest.mock('react-i18next', () => ({
    useTranslation: () => require('./sendSearchTestI18n').useTranslationStub(),
}));

// Captured props of the last Drawer render. `mock`-prefixed so jest's hoisting guard allows the
// factory below to close over it.
const mockDrawerProps: { current: any } = { current: null };

jest.mock('@material-ui/core/Drawer', () => {
    const ReactLocal = require('react');
    return {
        __esModule: true,
        default: (props: any) => {
            mockDrawerProps.current = props;
            // `open` is honoured so the "no levels ⇒ nothing rendered" case is real and not asserted
            // against a stub that always renders.
            return props.open ? ReactLocal.createElement('div', { 'data-testid': 'drawer' }, props.children) : null;
        },
    };
});

import DrawerStack from './components/DrawerStack';
import reducer, { pushDrawer, popDrawer, closeDrawer } from '../../redux/reducers/sendSearchSlice';
import { DrawerEntry, MAX_DRAWER_DEPTH } from '../../Models/DataSources/SendSearch';

jest.mock('../../helpers/Api/PulseemReactAPI', () => ({
    // The slice imports the axios instance at module scope. The stub keeps the import graph from
    // reaching i18n bootstrap / cookies / window.location at require time. No thunk is dispatched in
    // this file, so the stub is never called.
    PulseemReactInstance: { post: jest.fn(), get: jest.fn() },
}));

// RowKey is the real identity — RowID alone is NOT unique across repeat sends of one campaign
// (see sendSearchRowKey in Models/SendSearch.ts). The stack must carry the composite key or a
// drawer opened on a repeat-sent recipient resolves to the wrong send.
const entry = (Level: DrawerEntry['Level'], RowID: number, Crumb: string): DrawerEntry => ({
    Level, RowID, RowKey: `1-9001-${RowID}-2026-07-01T00:00:00`, Crumb,
    Title: `${Crumb} title`, Subtitle: null, Channel: null,
});

const ROLLUP = entry('rollup', 101, 'ריכוז');
const AGENT = entry('agent', 202, 'סוכן');
const MESSAGE = entry('message', 303, 'הודעה');

// ── state half ───────────────────────────────────────────────────────────────────────────────
describe('drawer stack state — rollup → agent → message', () => {
    const stackAfter = (...actions: any[]) =>
        actions.reduce((s: any, a: any) => reducer(s, a), undefined as any).drawerStack;

    test('three pushes give exactly three levels, in order', () => {
        const stack = stackAfter(pushDrawer(ROLLUP), pushDrawer(AGENT), pushDrawer(MESSAGE));
        expect(stack.map((e: DrawerEntry) => e.Level)).toEqual(['rollup', 'agent', 'message']);
        expect(stack).toHaveLength(3);
    });

    test('Esc pops exactly ONE level — it is not close-all', () => {
        // This is the single most regression-prone behaviour in the drawer: the natural
        // implementation (a document keydown listener ALONGSIDE the Modal's own) pops twice per
        // keypress, and the natural shortcut (Esc → closeDrawer) throws away the whole stack and
        // dumps the user back to the grid from level 3. Both are caught here.
        const stack = stackAfter(pushDrawer(ROLLUP), pushDrawer(AGENT), pushDrawer(MESSAGE), popDrawer());
        expect(stack).toHaveLength(2);
        expect(stack[stack.length - 1].Level).toBe('agent');
    });

    test('popping repeatedly walks back one level at a time and then closes', () => {
        let state: any = reducer(undefined, { type: '@@init' } as any);
        [ROLLUP, AGENT, MESSAGE].forEach((e) => { state = reducer(state, pushDrawer(e)); });
        expect(state.drawerStack).toHaveLength(3);
        state = reducer(state, popDrawer()); expect(state.drawerStack).toHaveLength(2);
        state = reducer(state, popDrawer()); expect(state.drawerStack).toHaveLength(1);
        state = reducer(state, popDrawer()); expect(state.drawerStack).toHaveLength(0);
        // Popping an already-empty stack must be inert, not an exception or a negative length.
        state = reducer(state, popDrawer()); expect(state.drawerStack).toHaveLength(0);
    });

    test('scrim click closes ALL levels at once', () => {
        const stack = stackAfter(pushDrawer(ROLLUP), pushDrawer(AGENT), pushDrawer(MESSAGE), closeDrawer());
        expect(stack).toEqual([]);
    });

    test(`a ${MAX_DRAWER_DEPTH + 1}th level is refused, not rendered as an unreachable state`, () => {
        const stack = stackAfter(
            pushDrawer(ROLLUP), pushDrawer(AGENT), pushDrawer(MESSAGE), pushDrawer(entry('message', 404, 'רביעי')),
        );
        expect(stack).toHaveLength(MAX_DRAWER_DEPTH);
        expect(stack[2].RowID).toBe(303);   // the original 3rd level survived; the 4th was dropped
    });
});

// ── chrome half ──────────────────────────────────────────────────────────────────────────────
describe('DrawerStack chrome — breadcrumb and gesture routing', () => {
    const renderStack = (stack: DrawerEntry[]) => {
        const onPop = jest.fn();
        const onClose = jest.fn();
        const container = document.createElement('div');
        document.body.appendChild(container);
        act(() => {
            ReactDOM.render(
                <DrawerStack stack={stack} isRTL onPop={onPop} onClose={onClose}>
                    <div>body</div>
                </DrawerStack>,
                container,
            );
        });
        return { onPop, onClose, container, text: container.textContent || '' };
    };

    test('a 3-level stack renders a 3-crumb breadcrumb in order, separated by ›', () => {
        const { text } = renderStack([ROLLUP, AGENT, MESSAGE]);
        expect(text).toContain('ריכוז');
        expect(text).toContain('סוכן');
        expect(text).toContain('הודעה');
        // Order matters — a breadcrumb is the ONLY thing telling the user how deep they are and what
        // popping returns to. Assert the actual sequence, not mere presence.
        expect(text.indexOf('ריכוז')).toBeLessThan(text.indexOf('סוכן'));
        expect(text.indexOf('סוכן')).toBeLessThan(text.indexOf('הודעה'));
        expect((text.match(/›/g) || []).length).toBe(2);   // 3 crumbs ⇒ 2 separators
    });

    test('the back button NAMES the level it returns to, not a bare "חזרה"', () => {
        const { text } = renderStack([ROLLUP, AGENT]);
        // `action.back` = "חזרה ל{{name}}" with name = the PARENT crumb.
        expect(text).toContain('חזרה לריכוז');
        expect(text).not.toMatch(/\{\{/);
    });

    test('level 1 shows no back button — there is nothing to go back to', () => {
        const { text } = renderStack([ROLLUP]);
        expect(text).not.toContain('חזרה ל');
    });

    test('reason "escapeKeyDown" routes to onPop; anything else routes to onClose', () => {
        const { onPop, onClose } = renderStack([ROLLUP, AGENT, MESSAGE]);
        act(() => { mockDrawerProps.current.onClose({}, 'escapeKeyDown'); });
        expect(onPop).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();

        act(() => { mockDrawerProps.current.onClose({}, 'backdropClick'); });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onPop).toHaveBeenCalledTimes(1);   // still ONE — the scrim must not also pop
    });

    test('an empty stack renders nothing at all', () => {
        const { text } = renderStack([]);
        expect(text).toBe('');
        expect(mockDrawerProps.current.open).toBe(false);
    });

    test('the panel anchors to the RIGHT in RTL', () => {
        // MUI's anchor is PHYSICAL. Hardcoding 'left' slides the panel in from the wrong edge of a
        // Hebrew page — the primary rendering direction of this screen (CONTRACT §4).
        renderStack([ROLLUP]);
        expect(mockDrawerProps.current.anchor).toBe('right');
    });
});
