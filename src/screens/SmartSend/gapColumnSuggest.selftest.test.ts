/* ============================================================================
 * gapColumnSuggest.selftest.test.ts — the evidence gate for gapColumnSuggest.ts.
 *
 * WHAT THE MODULE UNDER TEST IS ALLOWED TO BE
 * `pickGapColumnCandidate` produces the column offered on the SHORTFALL picker's suggest CHIP.
 * It is a CANDIDATE, never a value. Nothing in the app may write its result without a click:
 *  · businessColumnDefaults.ts:18-38 records why a silent gap PRE-FILL stays forbidden — a
 *    non-null GapColumnID makes CampaignsToDataSources_Set run the OPENJSON SearchValues build
 *    and flip IsSearchable = 1 on the shared production version, and
 *    DataSources_UpdateColumnMeta then answers -8 for turning IsSearchable back off while the
 *    reference exists. Expensive for a guess, and awkward to undo.
 *  · unlike the supervisor id — posted as NULL for as long as it is only a guess,
 *    SmartSendScreen.tsx:266-268 reading smartSendSlice's `supervisorColumnIsGuess` — the gap id
 *    at SmartSendScreen.tsx:272 has no guess flag at all, and :269-271 says so in as many words:
 *    "nothing ever fills them in without a click". So the first 750ms autosave after a pre-fill
 *    would persist the guess as a decision. A CLICK is a confirmation and carries none of that,
 *    and it keeps that comment true.
 * That asymmetry is the whole reason this module returns a suggestion and touches no state, and
 * it is why the assertions below are about WHICH column is offered and never about anything
 * being applied. The chip that consumes it is modelled on TokenMappingTable.tsx:273-285.
 *
 * WHY THE JEST GLOBALS ARE PULLED OFF `globalThis` INSTEAD OF JUST BEING USED:
 * this repo has NO `@types/jest` (node_modules/@types has no jest entry). A .js test dodges the
 * problem — tsc does not check it (`checkJs` is off). A .ts test does not: tsconfig `include` is
 * `["src"]`, so `react-scripts build` TYPE-CHECKS THIS FILE, and a bare `describe(...)` would
 * fail the production build with "cannot find name 'describe'".
 * REJECTED: `declare const describe: ...` ambient declarations — they work today but collide
 * with a duplicate-identifier error the day someone installs @types/jest. Reading the globals
 * through a locally declared shape is correct in both worlds and costs three lines. This is the
 * same shim, for the same reason, as suggestMapping.selftest.test.ts:35-40 — kept structurally
 * identical on purpose so a future @types/jest install is one mechanical deletion in both files.
 *
 * WHY EVERY NEGATIVE ASSERTION HERE IS PAIRED WITH A POSITIVE ONE:
 * a test that only says "X is not offered" passes just as happily when the module returns
 * NOTHING — which is exactly the state a broken matcher produces. Nine such structurally
 * unfailable assertions were removed from suggestMapping.selftest.test.ts for that reason
 * (see its :78-84), and the rule is treated as binding here: each `toBe(null)` /
 * `not.toBe(...)` below is followed by a call on the SAME fixture shape that DOES return a
 * column, so a dead module cannot make this file green.
 * ========================================================================== */
import { SmartSendColumn } from '../../Models/DataSources/SmartSend';
import { pickGapColumnCandidate, GAP_WORDS_RANKED } from './gapColumnSuggest';

interface JestGlobals {
    describe: (name: string, fn: () => void) => void;
    test: (name: string, fn: () => void) => void;
    expect: (actual: any) => any;
}
const { describe, test, expect } = (globalThis as unknown) as JestGlobals;

// ── fixture builder ──────────────────────────────────────────────────────────
// Identical in shape to suggestMapping.selftest.test.ts:46-62, including the
// `SourceHeader defaults to DisplayName` default: that is the overwhelmingly common shape of a
// real source (nothing renamed), so it is the shape the matcher meets in production. The
// SourceHeader-only cases below override it explicitly, which is the point of that group.
const col = (
    ColumnID: number,
    Ordinal: number,
    DisplayName: string,
    over?: Partial<SmartSendColumn>,
): SmartSendColumn => ({
    ColumnID,
    Ordinal,
    DisplayName,
    SourceHeader: DisplayName,
    ColumnKey: `k${ColumnID}`,
    DataType: 1,
    FormatHint: 0,
    SemanticRole: 0,
    IsSearchable: false,
    ...over,
});

// ═════════════════════════════════════════════════════════════════════════════
// THE WORD LIST ITSELF. gapColumnSuggest.ts:86-94 exports GAP_WORDS_RANKED specifically so a test
// can pin the ORDER and the ABSENCE of יעד, "a property to assert in a test, not merely to promise
// in a comment" (:53-54). These four assertions are that promise made executable, and they fail on
// an edit to the list rather than waiting for a fixture to happen to cover it.
// ═════════════════════════════════════════════════════════════════════════════
describe('GAP_WORDS_RANKED — the list is the fix, so the list is pinned', () => {
    const tierOf = (word: string): number => {
        for (let i = 0; i < GAP_WORDS_RANKED.length; i += 1) {
            if (GAP_WORDS_RANKED[i].indexOf(word) > -1) return i;
        }
        return -1;
    };
    const allWords: string[] = ([] as string[]).concat(...GAP_WORDS_RANKED.map((t) => t.slice()));

    test('יעד is on no tier at all — not even the last one', () => {
        expect(tierOf('יעד')).toBe(-1);
        // POSITIVE CONTROL: tierOf really can find a word, so the -1 above is absence and not a
        // broken helper. חוסר is the owner's own proposal and V2's first alternative.
        expect(tierOf('חוסר')).toBe(0);
    });

    test('חוסר outranks פער — the ranking, stated as the two words that decided it', () => {
        expect(tierOf('חוסר')).toBeLessThan(tierOf('פער'));
        expect(tierOf('פער')).toBeGreaterThan(-1);   // פער is present, just last
    });

    test('every word is a real non-empty token', () => {
        // The sharp one. Matching is `text.indexOf(w) > -1`, and indexOf('') is 0 for EVERY string —
        // so one stray empty entry would make its whole tier match the FIRST column of every source,
        // silently, and the chip would start pointing at "שם הסוכן". No fixture would catch it
        // unless it happened to use that tier.
        expect(allWords.length).toBeGreaterThan(0);
        for (let i = 0; i < allWords.length; i += 1) {
            expect(allWords[i].length).toBeGreaterThan(0);
            expect(allWords[i]).toBe(allWords[i].trim());
        }
    });

    test('no word is repeated across tiers', () => {
        // A word on two tiers means the lower copy is unreachable — the higher tier always claims
        // the column first — so the list would describe a ranking it does not have.
        expect(allWords.length).toBeGreaterThan(1);   // a one-word list cannot fail this vacuously
        for (let i = 0; i < allWords.length; i += 1) {
            expect(allWords.indexOf(allWords[i])).toBe(i);
        }
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// THE RECORDED REGRESSION (contract-mandated).
//
// businessColumnDefaults.ts:18-38 records the exact failure that killed the FIRST attempt at a
// gap default: a matcher that scanned in Ordinal order and accepted ANY word from its list gave
// no priority between words, so "יעד רבעוני" (Ordinal 4 — a TARGET column) beat "פער מהיעד"
// (Ordinal 7 — the actual shortfall). The control labelled "עמודת החוסר ליעד" would then have
// pre-selected the TARGET, and — per the header above — the next save would have persisted it
// and paid the IsSearchable build for a wrong guess.
//
// The same two ordinals are reproduced here, deliberately, so the fixture IS the incident. This
// is also the fixture suggestMapping.selftest.test.ts:118-125 pins, so both matchers are held to
// the same recorded facts and neither can be "fixed" into disagreeing with the other.
//
// The ColumnIDs (101/102/104/105/107/109) are deliberately NOT equal to the Ordinals and NOT
// equal to the array indexes, so an assertion on 107 cannot be satisfied by a module that
// accidentally returns an Ordinal or a position.
// ═════════════════════════════════════════════════════════════════════════════
const REGRESSION_COLUMNS: SmartSendColumn[] = [
    col(101, 1, 'שם הסוכן'),
    col(102, 2, 'אימייל', { DataType: 4, SemanticRole: 1 }),
    col(104, 4, 'יעד רבעוני'),
    col(105, 5, 'יעד שנתי'),
    col(107, 7, 'פער מהיעד'),
    col(109, 9, 'סכום מכירות'),
];

describe('pickGapColumnCandidate — the recorded regression (businessColumnDefaults.ts:18-38)', () => {
    test('the SHORTFALL column is offered, and the TARGET column never is', () => {
        const hit = pickGapColumnCandidate(REGRESSION_COLUMNS);
        expect(hit).toBe(107);          // "פער מהיעד" — the actual shortfall
        expect(hit).not.toBe(104);      // "יעד רבעוני" — what the killed matcher picked
    });

    test('a LOWER Ordinal does not buy the target column the suggestion', () => {
        // The killed matcher lost precisely here: it walked Ordinal-ascending and stopped on the
        // first hit, so Ordinal 4 shadowed Ordinal 7. Order of scan must not outrank strength of
        // evidence — that is the property this asserts, using the real ordinals.
        expect(REGRESSION_COLUMNS[2].Ordinal).toBeLessThan(REGRESSION_COLUMNS[4].Ordinal);
        expect(pickGapColumnCandidate(REGRESSION_COLUMNS)).toBe(107);
    });

    test('the returned value is a ColumnID — not an Ordinal, not an index', () => {
        // Cheap, but it is the one thing a caller cannot recover from: the chip dispatches
        // setBusinessColumn with whatever comes back, and 7 is a perfectly plausible ColumnID in
        // another source, so a units mix-up would not throw anywhere — it would silently order a
        // customer-facing email by the wrong column.
        const hit = pickGapColumnCandidate(REGRESSION_COLUMNS);
        const ids = REGRESSION_COLUMNS.map((c) => c.ColumnID);
        expect(ids.indexOf(hit as number)).toBeGreaterThanOrEqual(0);
        expect(hit).not.toBe(7);        // the shortfall column's Ordinal
        expect(hit).not.toBe(4);        // the shortfall column's array index
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TIER ORDER. "חוסר" is the word the DEPLOYED supervisor job looks for —
// dbo.CampaignSupervisorJob_ProcessRequest_V2.StoredProcedure.sql:353-357 sets @IsGap from
// N'%חוסר%' OR N'%נשאר%' OR N'%חסר%'. It is therefore the strongest evidence available, and it
// must outrank anything weaker REGARDLESS of where the column sits in the file. Position is the
// signal the killed matcher trusted; this is the assertion that it no longer decides.
// ═════════════════════════════════════════════════════════════════════════════
describe('pickGapColumnCandidate — evidence outranks position', () => {
    test('a "חוסר" column beats a "פער" column even when it comes LATER', () => {
        const cols: SmartSendColumn[] = [
            col(201, 1, 'שם הסוכן'),
            col(207, 7, 'פער מהיעד'),        // weaker tier, EARLIER
            col(211, 11, 'חוסר ליעד אורי'),  // stronger tier, LATER
        ];
        const hit = pickGapColumnCandidate(cols);
        expect(hit).toBe(211);
        expect(hit).not.toBe(207);

        // POSITIVE CONTROL for the `not.toBe` above: with the strong column REMOVED, 207 is
        // exactly what the module offers. So the rejection above is the tier order biting, and
        // not "פער" having quietly stopped matching altogether.
        expect(pickGapColumnCandidate([cols[0], cols[1]])).toBe(207);
    });

    test('with only the weaker evidence present, the weaker column is still offered', () => {
        // The reason the tier test above cannot pass vacuously, stated on its own: the module is
        // not "חוסר-only with everything else dead" — it has a real second answer.
        expect(pickGapColumnCandidate([col(301, 1, 'שם'), col(307, 7, 'פער מהיעד')])).toBe(307);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// THE SILENCE THAT MATTERS. "יעד" — target — is NOT evidence of a shortfall column, and adding
// it to the word list is the single change that reproduces the killed matcher's wrong answer.
// A chip that offers the TARGET column is worse than no chip: the user reads a plausible name
// on a control labelled "עמודת החוסר ליעד", clicks, and the send is ordered by the wrong number.
// NO CHIP is the correct output here.
// ═════════════════════════════════════════════════════════════════════════════
describe('pickGapColumnCandidate — a target column alone earns no suggestion', () => {
    test('a source whose only near-miss is "יעד רבעוני" returns null', () => {
        const targetsOnly: SmartSendColumn[] = [
            col(401, 1, 'שם הסוכן'),
            col(404, 4, 'יעד רבעוני'),
            col(405, 5, 'יעד שנתי'),
            col(409, 9, 'סכום מכירות'),
        ];
        expect(pickGapColumnCandidate(targetsOnly)).toBe(null);

        // POSITIVE CONTROL: the identical list with ONE real shortfall column appended does
        // produce a suggestion — and produces THAT column, not one of the targets. Without this
        // the assertion above would pass against a module that returns null for everything.
        const withShortfall = targetsOnly.concat([col(412, 12, 'חוסר ליעד')]);
        expect(pickGapColumnCandidate(withShortfall)).toBe(412);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// THE BLANK-DisplayName SOURCE. This is not a hypothetical: an empty or whitespace DisplayName
// is what rendered the supervisor picker of campaign 1514933 as a nameless MenuItem, which is
// the defect resolveColumnLabel exists to close (columnLabel.ts:46-50 — DisplayName →
// SourceHeader → String(ColumnID), non-empty BY CONSTRUCTION, whitespace-only folded into the
// empty case). The matcher has to read the SAME two halves the label does,
// or a source will show a correctly-named chip target it can never match, or match a column it
// cannot name. Both halves, one rule, both surfaces.
// ═════════════════════════════════════════════════════════════════════════════
describe('pickGapColumnCandidate — the name may live in either half', () => {
    test('an EMPTY DisplayName still matches through SourceHeader', () => {
        const cols: SmartSendColumn[] = [
            col(501, 1, 'שם הסוכן'),
            col(502, 2, '', { SourceHeader: 'חוסר ליעד' }),
        ];
        expect(pickGapColumnCandidate(cols)).toBe(502);
    });

    test('a WHITESPACE-only DisplayName is treated the same as an empty one', () => {
        const cols: SmartSendColumn[] = [
            col(511, 1, 'שם הסוכן'),
            col(512, 2, '   ', { SourceHeader: 'חוסר ליעד' }),
        ];
        expect(pickGapColumnCandidate(cols)).toBe(512);
    });

    test('a renamed column matches on its DisplayName while its SourceHeader is opaque', () => {
        // The mirror image, and the ordinary case after EditColumnDialog: the human-readable name
        // is the only half that carries meaning.
        const cols: SmartSendColumn[] = [
            col(521, 1, 'שם הסוכן'),
            col(522, 2, 'חוסר ליעד', { SourceHeader: 'f3a9c0b2_col_00017_raw_import' }),
        ];
        expect(pickGapColumnCandidate(cols)).toBe(522);
    });

    test('a column with NOTHING readable in either half is not offered', () => {
        const cols: SmartSendColumn[] = [
            col(531, 1, '', { SourceHeader: '' }),
            col(532, 2, '   ', { SourceHeader: '   ' }),
        ];
        expect(pickGapColumnCandidate(cols)).toBe(null);
        // POSITIVE CONTROL: give the second column a readable header and the same list answers.
        expect(pickGapColumnCandidate([cols[0], col(532, 2, '   ', { SourceHeader: 'חוסר ליעד' })])).toBe(532);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TIES. Both server paths return columns ordered by Ordinal — CampaignsToDataSources_Get RS2 and
// DataSources_Get RS2 both end in ORDER BY c.Ordinal ASC (businessColumnDefaults.ts:106-108) —
// so array order IS document order and the product rule "the first one in the file" is simply
// the first match in array order. That is what `pickDefaultSupervisorColumn` does with its
// `.find()` chain (businessColumnDefaults.ts:115-118) and what this module must do too: one
// tie-break rule for both business pickers, so the two chips can never explain themselves
// differently to the same user.
// ═════════════════════════════════════════════════════════════════════════════
describe('pickGapColumnCandidate — two equally strong columns', () => {
    test('the FIRST one in the list wins', () => {
        const cols: SmartSendColumn[] = [
            col(601, 1, 'חוסר ליעד'),
            col(602, 2, 'חוסר מצטבר'),
        ];
        expect(pickGapColumnCandidate(cols)).toBe(601);
    });

    test('it is list POSITION that decides, not the smaller ColumnID', () => {
        // Same two columns, same Ordinal order, but the first one now carries the HIGHER
        // ColumnID. A `Math.min` over ids, or a sort by id, would flip this and nothing else in
        // the suite would notice — the ids in every other fixture happen to ascend with position.
        const cols: SmartSendColumn[] = [
            col(699, 1, 'חוסר ליעד'),
            col(602, 2, 'חוסר מצטבר'),
        ];
        const hit = pickGapColumnCandidate(cols);
        expect(hit).toBe(699);
        expect(hit).not.toBe(602);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// TOTAL AND PURE. The chip is recomputed on every render of BusinessColumnsPicker, against
// whatever `columns` the slice currently holds — including the empty array that selectSource
// leaves behind between a source pick and the columns arriving. It must be safe and stable
// there, and it must never edit the list it was handed: that array is redux state.
// ═════════════════════════════════════════════════════════════════════════════
describe('pickGapColumnCandidate — total, pure and deterministic', () => {
    test('null / undefined / empty all return null', () => {
        expect(pickGapColumnCandidate(null)).toBe(null);
        expect(pickGapColumnCandidate(undefined)).toBe(null);
        expect(pickGapColumnCandidate([])).toBe(null);
        // POSITIVE CONTROL: the same call on a populated list is NOT null, so the three guards
        // above are the guards firing and not the function being unconditionally empty.
        expect(pickGapColumnCandidate([col(701, 1, 'חוסר ליעד')])).toBe(701);
    });

    test('the same input answers the same twice', () => {
        const a = pickGapColumnCandidate(REGRESSION_COLUMNS);
        const b = pickGapColumnCandidate(REGRESSION_COLUMNS);
        expect(a).toBe(b);
        expect(a).not.toBe(null);       // not two nulls agreeing with each other
    });

    test('the input list is never mutated', () => {
        const before = JSON.stringify(REGRESSION_COLUMNS);
        const hit = pickGapColumnCandidate(REGRESSION_COLUMNS);
        expect(JSON.stringify(REGRESSION_COLUMNS)).toBe(before);
        expect(hit).toBe(107);          // the call really ran
    });
});
