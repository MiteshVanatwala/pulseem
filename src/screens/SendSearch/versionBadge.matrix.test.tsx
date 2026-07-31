// ═══════════════════════════════════════════════════════════════════════════════════════════
// VersionBadge — the 3 × 3 matrix. CONTRACT §4.2 / D8, RESUME.md §3 A3.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\versionBadge.matrix.test.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\versionBadge.matrix.test.tsx
//
// THE PROPERTY UNDER TEST: for every one of the 9 ProvenanceSource × VersionState combinations —
// and for a NULL version number, and for values outside both domains — the cell renders visible,
// non-empty text.
//
// This is not a completeness ritual. A blank version cell reads as "nothing was sent" (CONTRACT D8,
// stated verbatim there). A purged version, a scrubbed version and an unverifiable provenance are
// all cases where something WAS sent and only the version row is no longer intact. Rendering an
// empty cell for them is the invisible failure the entire feature exists to prevent — so the empty
// cell is asserted against EXPLICITLY, not implied by an equality check that a future edit could
// weaken.
//
// A3 note (RESUME.md §3): `Scrubbed` is NOT emitted by any SP in V1. It stays in the domain, in the
// types and in this matrix on purpose — the day the scrub SP grows a flag column, the renderer must
// already be correct, and a matrix that only covered what the server happens to send today would
// have to be rediscovered then.
//
// Rendered with `react-dom` + `react-dom/test-utils` and nothing else: no @testing-library, no
// store, no network, no browser API beyond jsdom. The only mock is `react-i18next`, replaced by a
// resolver over the SHIPPED he JSON (see sendSearchTestI18n.ts for why an echoing `t` would make
// every assertion here vacuous).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

jest.mock('react-i18next', () => ({
    // `require` inside the factory, not a closure variable: jest hoists jest.mock above the imports,
    // so a top-level `import { tHe }` would be in the temporal dead zone when the factory runs.
    useTranslation: () => require('./sendSearchTestI18n').useTranslationStub(),
}));

import VersionBadge from './components/VersionBadge';
import { PROVENANCE_SOURCES, VERSION_STATES } from '../../Models/DataSources/SendSearch';
import { heStrings } from './sendSearchTestI18n';

// ── minimal render harness ──────────────────────────────────────────────────────────────────
const renderText = (element: React.ReactElement): string => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => { ReactDOM.render(element, container); });
    const text = container.textContent || '';
    act(() => { ReactDOM.unmountComponentAtNode(container); });
    document.body.removeChild(container);
    return text;
};

// The four ways a cell can be "non-empty but broken". Every case runs all four, because each one has
// shipped somewhere in this codebase before: a whitespace-only cell looks blank; the literal strings
// "undefined"/"null" are what React prints when a helper returns nothing and it is concatenated;
// "{{n}}" is what i18next leaves behind when the interpolation variable name does not match the
// JSON's (the VersionBadge header documents exactly that near-miss: `{ number: … }` vs `V{{n}}`).
const assertVisible = (text: string, label: string) => {
    expect(`${label} :: ${text.replace(/\s+/g, '')}`).not.toBe(`${label} :: `);
    expect(text.trim().length).toBeGreaterThan(0);
    expect(text).not.toMatch(/undefined/);
    expect(text).not.toMatch(/\bnull\b/);
    expect(text).not.toMatch(/\{\{/);
};

describe('VersionBadge — no combination can produce an empty cell (CONTRACT D8)', () => {
    // Guard the guard: if the domains ever shrink, the "9 combinations" claim below stops being true
    // and this suite would quietly test fewer cases while still passing.
    test('the domains are still 3 × 3, so the matrix below really is all 9 combinations', () => {
        expect(PROVENANCE_SOURCES.slice()).toEqual(['Recorded', 'Inferred', 'Unverifiable']);
        expect(VERSION_STATES.slice()).toEqual(['Available', 'Purged', 'Scrubbed']);
        expect(PROVENANCE_SOURCES.length * VERSION_STATES.length).toBe(9);
    });

    // Table-driven over the real domain arrays, not a transcription of them — adding a domain member
    // adds rows here automatically instead of leaving a silent hole.
    const matrix: Array<[string, string]> = [];
    PROVENANCE_SOURCES.forEach((s) => VERSION_STATES.forEach((v) => matrix.push([s, v])));

    test.each(matrix)('%s × %s renders visible text (version number present)', (source, state) => {
        const text = renderText(
            <VersionBadge VersionNumber={7} ProvenanceSource={source} VersionState={state} />
        );
        assertVisible(text, `${source}/${state}`);
        // The number is always present when it is known, whatever the state.
        expect(text).toContain('V7');
        // A version whose rows are gone must SAY so in the CELL, not only in a tooltip: a tooltip is
        // invisible on a printout, in an Excel export and on touch. The Hebrew comes from the shipped
        // JSON, so this also proves the key the component constructs actually exists.
        if (state === 'Purged' || state === 'Scrubbed') {
            const word = state === 'Purged' ? heStrings.version.state.purged : heStrings.version.state.scrubbed;
            expect(typeof word).toBe('string');
            expect(word.length).toBeGreaterThan(0);
            expect(text).toContain(word);
        }
    });

    test.each(matrix)('%s × %s renders visible text when VersionNumber is NULL', (source, state) => {
        // NULL version columns are the CONTRACT §2.2 precedence step 3 case: no mapping row at all.
        // The cell must still say something — this is the combination most likely to render blank,
        // because there is no number to fall back on.
        const text = renderText(
            <VersionBadge VersionNumber={null} ProvenanceSource={source} VersionState={state} />
        );
        assertVisible(text, `${source}/${state}/null`);
        expect(text).not.toContain('V');   // no orphan "V" with nothing after it
    });

    test('an out-of-domain ProvenanceSource still renders, and degrades to the CONSERVATIVE end', () => {
        const text = renderText(
            <VersionBadge VersionNumber={null} ProvenanceSource={'RecordedIsh' as any} VersionState={'Available'} />
        );
        assertVisible(text, 'out-of-domain source');
        // It must NOT claim 'Recorded' or 'Inferred' — those are assertions of confidence the server
        // never made, the same over-claim shape as the WhatsApp status bug (D10).
        expect(text).toContain(heStrings.version.source.unverifiable);
        expect(text).not.toContain(heStrings.version.source.recorded);
        expect(text).not.toContain(heStrings.version.source.inferred);
    });

    test('an out-of-domain VersionState is not substituted with a plausible state word', () => {
        const text = renderText(
            <VersionBadge VersionNumber={7} ProvenanceSource={'Recorded'} VersionState={'Archived' as any} />
        );
        assertVisible(text, 'out-of-domain state');
        expect(text).toContain('V7');
        // No invented availability, and no plausible substitute for the unknown state.
        expect(text).not.toContain(heStrings.version.state.available);
        expect(text).not.toContain(heStrings.version.state.purged);
        expect(text).not.toContain(heStrings.version.state.scrubbed);
    });

    test('the worst case — everything unknown at once — still renders visible text', () => {
        const text = renderText(
            <VersionBadge VersionNumber={null} ProvenanceSource={'' as any} VersionState={'' as any} />
        );
        assertVisible(text, 'all-unknown');
    });

    test('IsOutdated adds the amber word without erasing the version', () => {
        const text = renderText(
            <VersionBadge
                VersionNumber={7}
                ProvenanceSource={'Recorded'}
                VersionState={'Available'}
                IsOutdated
                LatestVersionNumber={9}
            />
        );
        assertVisible(text, 'outdated');
        expect(text).toContain('V7');
        expect(text).toContain(heStrings.version.outdated);
    });

    test('A1 — a NULL LatestVersionNumber next to IsOutdated never prints NaN or an empty tail', () => {
        // RESUME.md §3 A1: LatestVersionNumber is nullable and must NOT be COALESCEd to VersionNumber.
        // So `IsOutdated` can arrive with `LatestVersionNumber: null`. The badge must not do arithmetic
        // or interpolation on it — tsc is not a gate in this repo, so nothing else catches this.
        const text = renderText(
            <VersionBadge
                VersionNumber={7}
                ProvenanceSource={'Recorded'}
                VersionState={'Available'}
                IsOutdated
                LatestVersionNumber={null}
            />
        );
        assertVisible(text, 'outdated/null-latest');
        expect(text).not.toMatch(/NaN/);
        expect(text).toContain('V7');
    });
});
