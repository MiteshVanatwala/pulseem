/* ============================================================================
 * suggestMapping.selftest.test.ts — the evidence gate for suggestMapping.ts.
 *
 * Follows the precedent set by
 * `src/screens/HtmlCampaign/components/TierGraph/tierGraphCore.selftest.test.js`:
 * a co-located `*.selftest.test.*` file so CRA's testMatch
 * (`src/**\/__tests__/**` | `src/**\/*.{spec,test}.{js,jsx,ts,tsx}`) actually picks it up.
 * Unlike that one the suite is NOT split into a separate script half — suggestMapping has no
 * `__dirname`/config-resolution problem to work around, so a plain jest file is the whole thing.
 *
 * WHY THE JEST GLOBALS ARE PULLED OFF `globalThis` INSTEAD OF JUST BEING USED:
 * this repo has NO `@types/jest` (checked: node_modules/@types has no jest entry). Test files
 * written in .js dodge that — tsc does not check them (`checkJs` is off). A .ts test does not:
 * tsconfig `include` is `["src"]`, so `react-scripts build` type-checks THIS FILE, and a bare
 * `describe(...)` would fail the production build with "cannot find name 'describe'".
 * REJECTED: `declare const describe: ...` ambient declarations — they work today but collide
 * with a duplicate-identifier error the day someone installs @types/jest. Reading the globals
 * through a locally declared shape is correct in both worlds and costs three lines.
 *
 * ── WHAT THIS SUITE NO LONGER TESTS, AND WHY (2026-08-03) ───────────────────────────────────
 * `suggestMapping` used to also return `autoApplicable`, the subset an "auto-map" button was
 * allowed to bulk-WRITE. That path and its three gates are DELETED — see the header block of
 * suggestMapping.ts for the five wrong pairs the final review still reproduced through them,
 * three at confidence 1.0000, and for why the signal cannot support the decision at all.
 * Every assertion that only pinned a gate went with it. Every assertion that pinned a SUGGESTION
 * outcome was kept and retargeted at `suggestions`, because the shape those fixtures capture —
 * an insurer's column set where one qualifier word changes WHOSE data it is — is exactly the
 * shape a chip still has to render correctly. The direction of those assertions is now POSITIVE:
 * the chip IS offered, on a NAMED column, at a confidence the user can weigh. That is the whole
 * safety argument for chips-only, so it is what gets tested.
 * ========================================================================== */
import { SmartSendColumn, SmartSendTokenInfo } from '../../Models/DataSources/SmartSend';
import { suggestMapping, SUGGEST_MIN_CONFIDENCE } from './suggestMapping';

interface JestGlobals {
    describe: (name: string, fn: () => void) => void;
    test: (name: string, fn: () => void) => void;
    expect: (actual: any) => any;
}
const { describe, test, expect } = (globalThis as unknown) as JestGlobals;

// ── fixture builders ─────────────────────────────────────────────────────────
// SourceHeader defaults to DisplayName because that is the overwhelmingly common shape of a
// real source (nothing renamed) — and it is the shape that would silently break the trigram
// component if normalizedColumnVariants did not fold the duplicate half away.
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

const tok = (Token: string, over?: Partial<SmartSendTokenInfo>): SmartSendTokenInfo => ({
    Token,
    IsSystemField: false,
    IsGraphToken: false,
    MappedColumnID: null,
    ...over,
});

const idOf = (r: { suggestions: { [k: string]: { columnId: number } } }, token: string): number | null =>
    (r.suggestions[token] ? r.suggestions[token].columnId : null);

const confOf = (r: { suggestions: { [k: string]: { confidence: number } } }, token: string): number =>
    (r.suggestions[token] ? r.suggestions[token].confidence : 0);

/**
 * The POSITIVE CONTROL every negative assertion in this file is paired with.
 * A test that only says "X is not Y" passes just as happily when the module returns NOTHING,
 * which is the state a broken matcher produces — so nine such assertions in the previous
 * revision were structurally unable to fail. This asserts the chip is really there: an own key,
 * a real column id, and a confidence inside the displayable band.
 */
const expectChip = (r: { suggestions: any }, token: string, columnId?: number): void => {
    expect(Object.prototype.hasOwnProperty.call(r.suggestions, token)).toBe(true);
    expect(r.suggestions[token].columnId).toBeGreaterThan(0);
    expect(r.suggestions[token].confidence).toBeGreaterThanOrEqual(SUGGEST_MIN_CONFIDENCE);
    expect(r.suggestions[token].confidence).toBeLessThanOrEqual(1);
    if (columnId !== undefined) expect(r.suggestions[token].columnId).toBe(columnId);
};

describe('suggestMapping — the display floor', () => {
    test('SUGGEST_MIN_CONFIDENCE is the only threshold, and it is inside 0..1', () => {
        expect(SUGGEST_MIN_CONFIDENCE).toBeGreaterThan(0);
        expect(SUGGEST_MIN_CONFIDENCE).toBeLessThan(1);
    });

    test('the result is an object carrying `suggestions`, and nothing else is promised', () => {
        // The shape is `{ suggestions }` rather than a bare map so it stays extensible; it has
        // already lost one field (`autoApplicable`) and callers destructure it.
        const r = suggestMapping([tok('alpha')], [col(1, 1, 'alpha')], {});
        expect(Object.keys(r)).toEqual(['suggestions']);
        expect((r as any).autoApplicable).toBe(undefined);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// THE REGRESSION FIXTURE (contract-mandated).
//
// businessColumnDefaults.ts:18-38 records the exact failure this whole module exists to avoid:
// a name-guesser that scanned in Ordinal order and matched ANY word picked "יעד רבעוני"
// (Ordinal 4 — a TARGET column) for the SHORTFALL control, over "פער מהיעד" (Ordinal 7 — the
// actual shortfall). Both ordinals are reproduced here, and "יעד" is deliberately made a
// FREQUENT word across the column set (two columns carry it) while "פער" is rare — which is the
// signal IDF is supposed to read.
// ─────────────────────────────────────────────────────────────────────────────
const REGRESSION_COLUMNS: SmartSendColumn[] = [
    col(101, 1, 'שם הסוכן'),
    col(102, 2, 'אימייל', { DataType: 4, SemanticRole: 1 }),
    col(104, 4, 'יעד רבעוני'),
    col(105, 5, 'יעד שנתי'),
    col(107, 7, 'פער מהיעד'),
    col(109, 9, 'סכום מכירות'),
];

describe('suggestMapping — the documented regression (businessColumnDefaults.ts:18-38)', () => {
    test('a shortfall token does NOT resolve to the target column', () => {
        const r = suggestMapping([tok('פער יעד')], REGRESSION_COLUMNS, {});
        expectChip(r, 'פער יעד', 107);
        expect(idOf(r, 'פער יעד')).not.toBe(104);   // the column the old guesser wrongly picked
    });

    test('the target token still resolves to the target column', () => {
        const r = suggestMapping([tok('יעד רבעוני')], REGRESSION_COLUMNS, {});
        expect(idOf(r, 'יעד רבעוני')).toBe(104);
        expect(confOf(r, 'יעד רבעוני')).toBe(1);    // exact normalized equality
    });

    test('both tokens together still land on their own columns (one-to-one, no swap)', () => {
        const r = suggestMapping([tok('יעד רבעוני'), tok('פער יעד')], REGRESSION_COLUMNS, {});
        expect(idOf(r, 'יעד רבעוני')).toBe(104);
        expect(idOf(r, 'פער יעד')).toBe(107);
    });

    test('a token unrelated to every column produces no suggestion at all (noise floor)', () => {
        const r = suggestMapping([tok('zzzzqqq')], REGRESSION_COLUMNS, {});
        expect(Object.keys(r.suggestions)).toEqual([]);
        // POSITIVE CONTROL: the same call shape DOES produce a chip for a token that belongs,
        // so an empty map above is the floor doing its job and not the matcher being dead.
        const live = suggestMapping([tok('סכום מכירות')], REGRESSION_COLUMNS, {});
        expectChip(live, 'סכום מכירות', 109);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// IDF ISOLATED. Placeholder words only — no customer vocabulary, in either direction.
//
// This fixture is built so the TRIGRAM component is EXACTLY equal for the two candidates and
// therefore cannot be what decides:
//     token " aaa bbb "  → " aa","aaa","aa ","a b"," bb","bbb","bb "   (7)
//     cA    " aaa ccc "  → " aa","aaa","aa ","a c"," cc","ccc","cc "   (7, shares 3)
//     cB    " bbb ccc "  → " bb","bbb","bb ","b c"," cc","ccc","cc "   (7, shares 3)
// Both trigram Dice = 2·3/14. cA also has the LOWER Ordinal and the LOWER ColumnID, so every
// documented tie-break favours it. The only thing that can pull cB ahead is that "bbb" is rare
// (df 1) while "aaa" is crowded (df 4). If IDF is ever removed or neutered, this test flips to
// cA — which is precisely the failure businessColumnDefaults.ts:18-38 describes, reproduced
// with no Hebrew and no business terms.
// ─────────────────────────────────────────────────────────────────────────────
const IDF_COLUMNS: SmartSendColumn[] = [
    col(204, 4, 'aaa ccc'),
    col(207, 7, 'bbb ccc'),
    col(211, 11, 'aaa ddd'),
    col(212, 12, 'aaa eee'),
    col(213, 13, 'aaa fff'),
];

describe('suggestMapping — IDF is what breaks the tie', () => {
    test('the rare shared word wins over the crowded one, against every other tie-break', () => {
        const r = suggestMapping([tok('aaa bbb')], IDF_COLUMNS, {});
        expectChip(r, 'aaa bbb', 207);
    });

    test('with "bbb" made just as crowded as "aaa", the ordinal tie-break takes over again', () => {
        // Same shapes, but now BOTH words are frequent, so IDF has nothing to say and the
        // documented tie-break (lower Ordinal) decides. This is the control for the test above:
        // it proves the previous result came from word RARITY and not from some quirk of "bbb".
        const balanced = IDF_COLUMNS.concat([
            col(214, 14, 'bbb ggg'),
            col(215, 15, 'bbb hhh'),
            col(216, 16, 'bbb iii'),
        ]);
        const r = suggestMapping([tok('aaa bbb')], balanced, {});
        expectChip(r, 'aaa bbb', 204);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — normalization', () => {
    const NORM_COLUMNS: SmartSendColumn[] = [
        col(301, 1, 'First Name'),
        col(302, 2, 'Customer ID Number'),
        col(303, 3, 'תשלומ'),          // medial mem — some exports never write the final form
        col(304, 4, 'סכום מכירות'),
        col(305, 5, 'order-date'),
    ];

    test('camelCase token meets a spaced header exactly', () => {
        const r = suggestMapping([tok('FirstName')], NORM_COLUMNS, {});
        expect(idOf(r, 'FirstName')).toBe(301);
        expect(confOf(r, 'FirstName')).toBe(1);
    });

    test('an embedded acronym splits correctly (IDNumber → ID Number)', () => {
        const r = suggestMapping([tok('CustomerIDNumber')], NORM_COLUMNS, {});
        expect(idOf(r, 'CustomerIDNumber')).toBe(302);
        expect(confOf(r, 'CustomerIDNumber')).toBe(1);
    });

    test('case and surrounding whitespace are irrelevant, and ## is stripped', () => {
        const r = suggestMapping([tok('  ##FIRST_NAME##  ')], NORM_COLUMNS, {});
        expect(idOf(r, '  ##FIRST_NAME##  ')).toBe(301);
        expect(confOf(r, '  ##FIRST_NAME##  ')).toBe(1);
    });

    test('underscore, hyphen and punctuation all normalize to the same word break', () => {
        const r = suggestMapping([tok('order_date'), tok('Order.Date')], NORM_COLUMNS, {});
        // Both are the same normalized string, so they compete for 305; one-to-one gives it to
        // exactly one of them (the first token, by the documented last-resort tie-break).
        expect(idOf(r, 'order_date')).toBe(305);
        expect(idOf(r, 'Order.Date')).not.toBe(305);
    });

    test('Hebrew final letters are unified (ם ≡ מ)', () => {
        const r = suggestMapping([tok('תשלום')], NORM_COLUMNS, {});
        expect(idOf(r, 'תשלום')).toBe(303);
        expect(confOf(r, 'תשלום')).toBe(1);
    });

    test('Hebrew niqqud is stripped', () => {
        const r = suggestMapping([tok('סְכוּם מְכִירוֹת')], NORM_COLUMNS, {});
        expect(idOf(r, 'סְכוּם מְכִירוֹת')).toBe(304);
        expect(confOf(r, 'סְכוּם מְכִירוֹת')).toBe(1);
    });

    test('an identical SourceHeader does not dilute a perfect match', () => {
        // The regression guard for normalizedColumnVariants: raw "DisplayName + SourceHeader"
        // concatenation would make this 0.67 on the trigram half and never reach 1.
        const r = suggestMapping([tok('First Name')], [col(301, 1, 'First Name')], {});
        expect(confOf(r, 'First Name')).toBe(1);
    });

    test('a DIFFERENT SourceHeader is still matchable (the renamed-column case)', () => {
        const cols = [col(401, 1, 'עמודה א', { SourceHeader: 'InvoiceTotal' }), col(402, 2, 'zzz qqq')];
        const r = suggestMapping([tok('InvoiceTotal')], cols, {});
        expectChip(r, 'InvoiceTotal', 401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — one-to-one', () => {
    test('two similar tokens cannot take the same column', () => {
        const cols = [col(501, 1, 'amount'), col(502, 2, 'amount total')];
        const r = suggestMapping([tok('Amount'), tok('Amounts')], cols, {});
        const ids = Object.keys(r.suggestions).map((k) => r.suggestions[k].columnId);
        expect(ids.length).toBeGreaterThan(0);      // positive control: the greedy really ran
        expect(ids.length).toBe(new (Set as any)(ids).size);
        expect(idOf(r, 'Amount')).toBe(501);        // exact match wins the greedy round
        expect(idOf(r, 'Amounts')).not.toBe(501);
    });

    test('more tokens than columns — every suggested column is still unique', () => {
        const cols = [col(601, 1, 'alpha')];
        const r = suggestMapping([tok('alpha'), tok('alphaa'), tok('alphaaa')], cols, {});
        const ids = Object.keys(r.suggestions).map((k) => r.suggestions[k].columnId);
        expect(ids.length).toBe(new (Set as any)(ids).size);
        expect(ids.length).toBe(1);                 // exactly one, not "at most one" (was ≤)
        expect(idOf(r, 'alpha')).toBe(601);         // and it is the exact match that got it
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — already-mapped tokens', () => {
    const cols = [col(701, 1, 'amount'), col(702, 2, 'total amount'), col(703, 3, 'zzz qqq')];

    test('a mapped token gets no suggestion and its column is reserved for nobody else', () => {
        const r = suggestMapping([tok('Amount'), tok('TotalAmount')], cols, { Amount: 701 });
        expect(r.suggestions.Amount).toBe(undefined);
        const ids = Object.keys(r.suggestions).map((k) => r.suggestions[k].columnId);
        expect(ids.indexOf(701)).toBe(-1);
        expect(idOf(r, 'TotalAmount')).toBe(702);
    });

    test('reservation holds even when the reserved column is another token\'s best match', () => {
        const r = suggestMapping([tok('AmountX'), tok('Amount')], cols, { Amount: 701 });
        const ids = Object.keys(r.suggestions).map((k) => r.suggestions[k].columnId);
        expect(ids.indexOf(701)).toBe(-1);          // 701 is "amount" — AmountX's obvious pick
        // POSITIVE CONTROL: without the reservation, 701 IS what AmountX takes. So the -1 above
        // is the reservation rule biting, not the token failing to score.
        const free = suggestMapping([tok('AmountX')], cols, {});
        expectChip(free, 'AmountX', 701);
    });

    test('null / 0 / negative entries in currentMap mean UNMAPPED, not mapped', () => {
        const r = suggestMapping([tok('Amount')], cols, { Amount: null });
        expect(idOf(r, 'Amount')).toBe(701);
        const r0 = suggestMapping([tok('Amount')], cols, { Amount: 0 });
        expect(idOf(r0, 'Amount')).toBe(701);
        const rNeg = suggestMapping([tok('Amount')], cols, { Amount: -701 });
        expect(idOf(rNeg, 'Amount')).toBe(701);
    });

    test('a stored id that no longer exists (vanished column) counts as unmapped', () => {
        // TokenMappingTable already flags this state (its `vanishedColumn` tooltip); the useful
        // behaviour after a re-upload renamed things is to suggest a replacement rather than
        // leave the row stranded.
        const r = suggestMapping([tok('Amount')], cols, { Amount: 99999 });
        expect(idOf(r, 'Amount')).toBe(701);
    });

    test('every token mapped → empty result', () => {
        const r = suggestMapping([tok('Amount')], cols, { Amount: 701 });
        expect(Object.keys(r.suggestions)).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — exact match on EITHER name half', () => {
    // The scorer used to compare the token only against the MERGED "DisplayName + SourceHeader"
    // text. So for every column whose two halves DIFFER — the shape EditColumnDialog.tsx creates
    // whenever a user renames a column, and the one businessColumnDefaults.ts:55-59 documents the
    // upload wizard creating by itself — an exact DisplayName match could never short-circuit and
    // was diluted by its own raw header.
    test('an exact DisplayName beats a fuzzy neighbour instead of losing to it', () => {
        // BEFORE THE FIX: returned columnId 2 at 0.609 — the wrong column.
        const cols = [
            col(1, 1, 'Email', { SourceHeader: 'RCPT_EMAIL_ADDRESS_PRIMARY_2024' }),
            col(2, 2, 'Email Notes'),
        ];
        const r = suggestMapping([tok('Email')], cols, {});
        expect(idOf(r, 'Email')).toBe(1);
        expect(confOf(r, 'Email')).toBe(1);
    });

    test('an opaque machine SourceHeader does not hide an exact DisplayName', () => {
        // BEFORE THE FIX: {} — a silent miss, no chip at all.
        const cols = [col(1, 1, 'Email', { SourceHeader: 'f3a9c0b2_col_00017_raw_import' })];
        const r = suggestMapping([tok('Email')], cols, {});
        expect(idOf(r, 'Email')).toBe(1);
        expect(confOf(r, 'Email')).toBe(1);
    });

    test('an exact SourceHeader survives a long renamed DisplayName', () => {
        // BEFORE THE FIX: {} — a silent miss. The other direction of the same defect.
        const cols = [col(1, 1, 'Primary Recipient Electronic Mail Contact', { SourceHeader: 'Email' })];
        const r = suggestMapping([tok('Email')], cols, {});
        expect(idOf(r, 'Email')).toBe(1);
        expect(confOf(r, 'Email')).toBe(1);
    });

    test('the merged text still carries the FUZZY path (both halves stay searchable)', () => {
        // Guard against "fix the short-circuit, lose the merged text": neither half is exact
        // here, so the score has to come from the merged string as before.
        const cols = [col(1, 1, 'עמודה א', { SourceHeader: 'InvoiceTotalAmount' }), col(2, 2, 'zzz qqq')];
        const r = suggestMapping([tok('InvoiceTotals')], cols, {});
        expectChip(r, 'InvoiceTotals', 1);
        expect(confOf(r, 'InvoiceTotals')).toBeLessThan(1);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// THE QUALIFIER SET — the fixtures that ended the bulk-apply path (2026-08-03).
//
// Every pair below is an insurer's column set: a correct-looking name plus ONE qualifier that
// changes WHOSE data it is (spouse / blocked / cancelled / previous / inactive), or a pair of
// names that differ by a single meaning-reversing word (end/start, annual/monthly, סיום/תחילת).
// Three review rounds tried to teach a gate to tell them apart from a genuine match and could
// not: nothing in a NAME distinguishes `Email`→`Email Notes` from `PolicyStart`→`Policy Start
// Date`, and in this deployment (Hebrew DisplayName, Latin SourceHeader) a cross-half word veto
// cannot fire at all. The bulk-write path is therefore gone.
//
// These fixtures are KEPT, retargeted, and their direction REVERSED. Under chips-only the
// correct behaviour for all of them is the SAME behaviour: show a chip, on a NAMED column, at a
// confidence the user can weigh, and let the human read the name before clicking. That is the
// safety argument for chips-only stated as executable assertions, so if the chip ever stops
// being offered — or starts being offered on nothing — these fail.
// ═════════════════════════════════════════════════════════════════════════════
describe('suggestMapping — qualifier-suffixed columns still get a named chip', () => {
    test('a one-extra-word qualifier is offered as a chip on the qualified column', () => {
        const cases: [string, string][] = [
            ['Email', 'Email Notes'],
            ['Address', 'Address Previous'],
            ['BirthDate', 'Birth Date Of Spouse'],
            ['Amount', 'Amount Refunded'],
            ['Date', 'Date Cancelled'],
            ['MobilePhone', 'Mobile Phone Blocked'],
            ['PolicyStart', 'Policy Start Date'],
            ['סכום פרמיה', 'סכום פרמיה שבוטלה'],
            ['טלפון נייד', 'טלפון נייד חסום'],
        ];
        for (let i = 0; i < cases.length; i++) {
            const r = suggestMapping([tok(cases[i][0])], [col(1, 1, cases[i][1])], {});
            // The chip carries the column id, so TokenMappingTable prints `Email Notes` /
            // `טלפון נייד חסום` next to the row and the user sees the qualifier before clicking.
            expectChip(r, cases[i][0], 1);
        }
    });

    test('a three-extra-word column falls under the display floor and gets NO chip', () => {
        // `Name` → `Name Of Beneficiary` measured 0.4315 on the old blend; the assertion here is
        // only that the floor still separates it from the one-word cases above, so a later change
        // to the floor cannot quietly flip either side without a red test.
        const r = suggestMapping([tok('Name')], [col(1, 1, 'Name Of Beneficiary')], {});
        const buried = suggestMapping([tok('Name')], [col(1, 1, 'Contract Renewal Reference Code')], {});
        expect(Object.keys(buried.suggestions)).toEqual([]);
        expect(confOf(r, 'Name')).toBeLessThan(confOf(
            suggestMapping([tok('Name')], [col(1, 1, 'Name Of Spouse')], {}), 'Name',
        ));
    });

    test('a meaning-reversing word does not stop the chip, and does not become an exact match', () => {
        const cases: [string, string][] = [
            ['PolicyEndDate', 'Policy Start Date'],
            ['AnnualPremiumAmount', 'Monthly Premium Amount'],
            ['תאריך סיום פוליסה', 'תאריך תחילת פוליסה'],
            ['PolicyActive', 'Policy Inactive'],
            ['InsuredAmount', 'Uninsured Amount'],
            ['PolicyValid', 'Policy Invalid'],
            ['AmountPaid', 'Amount Unpaid'],
        ];
        for (let i = 0; i < cases.length; i++) {
            const r = suggestMapping([tok(cases[i][0])], [col(1, 1, cases[i][1])], {});
            expectChip(r, cases[i][0], 1);
            // Never 1.0: only exact normalized equality reaches 1, and these are not equal. The
            // chip therefore reads as a guess, which is what it is.
            expect(confOf(r, cases[i][0])).toBeLessThan(1);
        }
    });

    test('an exact SourceHeader under a SPOUSE DisplayName: chip on the SPOUSE column, at 1.0', () => {
        // The pair that closed the argument. The header genuinely IS the token, so confidence is
        // 1.0 and nothing about a NAME can say otherwise — but the chip prints the DisplayName,
        // so the user reads `Spouse Email` before clicking. That is why a chip is safe here and a
        // silent write was not: BEFORE, this bulk-applied the spouse's address at 1.0000.
        const cols = [
            col(1, 1, 'Spouse Email', { SourceHeader: 'Email' }),
            col(2, 2, 'Client Email', { SourceHeader: 'PRIMARY_MAIL_ADDR' }),
        ];
        const r = suggestMapping([tok('Email')], cols, {});
        expectChip(r, 'Email', 1);
        expect(confOf(r, 'Email')).toBe(1);
    });

    test('the same thing in Hebrew, and the cross-script shape the last gate could not see', () => {
        // DisplayName Hebrew, SourceHeader Latin — the actual Clal deployment. The retired gate
        // compared WORDS between the two halves, which across scripts share nothing by
        // construction, so it could never fire. Both of these bulk-applied at 1.0000.
        const heb = [
            col(1, 1, 'טלפון של בן/בת הזוג', { SourceHeader: 'טלפון' }),
            col(2, 2, 'טלפון מבוטח', { SourceHeader: 'PHONE_MAIN' }),
        ];
        const rHeb = suggestMapping([tok('טלפון')], heb, {});
        expectChip(rHeb, 'טלפון', 1);
        expect(confOf(rHeb, 'טלפון')).toBe(1);

        const cross = [col(1, 1, 'האימייל של בן הזוג', { SourceHeader: 'EmailAddress' })];
        const rCross = suggestMapping([tok('EmailAddress')], cross, {});
        expectChip(rCross, 'EmailAddress', 1);
        expect(confOf(rCross, 'EmailAddress')).toBe(1);
    });

    test('a CANCELLED policy amount is chipped on its own column, not on a neighbour', () => {
        const cols = [
            col(1, 1, 'Cancelled Policy Amount', { SourceHeader: 'Amount' }),
            col(2, 2, 'Client Name'),
            col(3, 3, 'Policy Number'),
        ];
        const r = suggestMapping([tok('Amount')], cols, {});
        expectChip(r, 'Amount', 1);
        expect(confOf(r, 'Amount')).toBe(1);
    });

    test('near-miss LOOKALIKES are chipped, and rank below a genuine match in the same source', () => {
        // `CarNumber`→`Card Number` and `ClientAge`→`Client Agent`: one letter apart, and two of
        // the five pairs the final review reproduced. A chip is the right answer; the point of
        // this assertion is that the genuine column, when present, still outranks the lookalike.
        const cols = [col(1, 1, 'Card Number'), col(2, 2, 'Car Number')];
        const r = suggestMapping([tok('CarNumber')], cols, {});
        expectChip(r, 'CarNumber', 2);
        expect(confOf(r, 'CarNumber')).toBe(1);

        const lone = suggestMapping([tok('ClientAge')], [col(1, 1, 'Client Agent')], {});
        expectChip(lone, 'ClientAge', 1);
        expect(confOf(lone, 'ClientAge')).toBeLessThan(1);
    });

    test('the sweep: confidence RISES with the agreeing prefix, and the chip keeps up', () => {
        // The reviewer's sweep, kept as the measurement it always was. One disagreeing word,
        // N agreeing ones: confidence measured 0.346 · 0.532 · 0.636 · 0.702 · 0.748 for N=1..5,
        // i.e. it tends to 1 as the prefix grows. That monotonic climb is why no FLOOR could ever
        // separate a wrong column from a right one, and therefore why the bulk path is gone. It
        // is asserted here rather than described, so the claim stays true of the code.
        const seen: number[] = [];
        for (let n = 1; n <= 6; n++) {
            const shared: string[] = [];
            for (let i = 0; i < n; i++) shared.push(`w${i}`);
            const r = suggestMapping(
                [tok(shared.concat(['omega']).join(' '))],
                [col(1, 1, shared.concat(['alpha']).join(' '))],
                {},
            );
            seen.push(confOf(r, shared.concat(['omega']).join(' ')));
        }
        expect(seen.length).toBe(6);
        for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThan(seen[i - 1]);
        expect(seen[0]).toBeGreaterThan(0);          // a chip from the very first step
        expect(seen[5]).toBeGreaterThan(0.7);        // and it climbs into exact-match territory
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — an inflected form still matches (morphology, no word list)', () => {
    test('an English suffixal plural matches its base', () => {
        const r = suggestMapping([tok('PremiumAmounts')], [col(1, 1, 'Premium Amount')], {});
        expectChip(r, 'PremiumAmounts', 1);
    });

    test('the Hebrew prefix particle matches its base (פער יעד → פער מהיעד)', () => {
        // The module's own documented regression answer. Hebrew "מהיעד" is "יעד" with two prefix
        // letters glued on and shares NO WORD with it — this is the case TRIGRAM_WEIGHT exists to
        // carry, and the reason the word component alone was never enough.
        const r = suggestMapping([tok('פער יעד')], REGRESSION_COLUMNS, {});
        expectChip(r, 'פער יעד', 107);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — the correct column is ABSENT', () => {
    // A realistic source that simply does not contain what the template asks for.
    const PARTIAL_SOURCE: SmartSendColumn[] = [
        col(11, 1, 'Policy Start Date'),
        col(12, 2, 'Policy Number'),
        col(13, 3, 'Monthly Premium Amount'),
        col(14, 4, 'Agent First Name'),
        col(15, 5, 'Email', { SemanticRole: 1 }),
    ];

    test('tokens whose real columns are missing still get chips, one column each', () => {
        const tokens = [tok('PolicyEndDate'), tok('AnnualPremiumAmount'), tok('AgentLastName')];
        const r = suggestMapping(tokens, PARTIAL_SOURCE, {});
        const ids = Object.keys(r.suggestions).map((k) => r.suggestions[k].columnId);
        expect(ids.length).toBeGreaterThan(0);
        expect(ids.length).toBe(new (Set as any)(ids).size);   // still one-to-one
    });

    test('a token whose column IS present is unaffected by the ones that are not', () => {
        const tokens = [tok('PolicyEndDate'), tok('PolicyNumber'), tok('AnnualPremiumAmount')];
        const r = suggestMapping(tokens, PARTIAL_SOURCE, {});
        expect(idOf(r, 'PolicyNumber')).toBe(12);
        expect(confOf(r, 'PolicyNumber')).toBe(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — the returned map has no prototype', () => {
    test('a token named __proto__ becomes an OWN key, not a prototype assignment', () => {
        const cols = [col(1001, 1, '__proto__'), col(1002, 2, 'zzz qqq')];
        const r = suggestMapping([tok('__proto__')], cols, {});
        // BEFORE THE FIX `suggestions['__proto__'] = {...}` on a plain {} invoked the prototype
        // SETTER: the read still answered (through the prototype chain, which is why the older
        // test passed) but there was no own key, so Object.keys missed it and any consumer
        // iterating the map skipped the row entirely.
        expect(Object.prototype.hasOwnProperty.call(r.suggestions, '__proto__')).toBe(true);
        expect(Object.keys(r.suggestions).indexOf('__proto__')).toBeGreaterThanOrEqual(0);
        expect(idOf(r, '__proto__')).toBe(1001);
    });

    test('the empty result is not a plain object either', () => {
        const r = suggestMapping(null, null);
        expect((r.suggestions as any).__proto__).toBe(undefined);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — SemanticRole tie-break, and DataType being ignored', () => {
    test('a system-field token prefers the column carrying a SemanticRole, on a tie', () => {
        const cols = [col(901, 1, 'contact'), col(902, 2, 'contact', { SemanticRole: 1 })];
        const r = suggestMapping([tok('Contact', { IsSystemField: true })], cols, {});
        expect(idOf(r, 'Contact')).toBe(902);       // beats the lower Ordinal AND the lower id
    });

    test('a NON system-field token does not get that tie-break', () => {
        const cols = [col(901, 1, 'contact'), col(902, 2, 'contact', { SemanticRole: 1 })];
        const r = suggestMapping([tok('Contact', { IsSystemField: false })], cols, {});
        expect(idOf(r, 'Contact')).toBe(901);       // plain Ordinal tie-break
    });

    test('the tie-break never changes the reported confidence', () => {
        const cols = [col(901, 1, 'contact'), col(902, 2, 'contact', { SemanticRole: 1 })];
        const sys = suggestMapping([tok('Contact', { IsSystemField: true })], cols, {});
        const plain = suggestMapping([tok('Contact', { IsSystemField: false })], cols, {});
        expect(confOf(sys, 'Contact')).toBe(confOf(plain, 'Contact'));
        expect(confOf(sys, 'Contact')).toBe(1);     // positive control: both really matched
    });

    test('DataType is NOT a signal (businessColumnDefaults.ts:61-69 — documented unreliable)', () => {
        const cols = [col(911, 1, 'contact'), col(912, 2, 'contact', { DataType: 4 })];
        const r = suggestMapping([tok('Contact', { IsSystemField: true })], cols, {});
        expect(idOf(r, 'Contact')).toBe(911);       // DataType=EMAIL pulled nothing
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — the feature still earns its place', () => {
    test('a plain realistic source where the names differ only trivially', () => {
        // The bread-and-butter case that justifies the whole feature: spacing, case and camelCase
        // are the ONLY differences. Every one of these must chip its own column at 1.0, or the
        // suggestions are theatre.
        const cols = [
            col(1, 1, 'Policy Number'),
            col(2, 2, 'First Name'),
            col(3, 3, 'Last Name'),
            col(4, 4, 'Email', { SemanticRole: 1 }),
            col(5, 5, 'Mobile Phone', { SemanticRole: 2 }),
        ];
        const tokens = [tok('policyNumber'), tok('FIRST_NAME'), tok('Last-Name'), tok('  email  '), tok('MobilePhone')];
        const r = suggestMapping(tokens, cols, {});
        const expected: [string, number][] = [
            ['policyNumber', 1], ['FIRST_NAME', 2], ['Last-Name', 3], ['  email  ', 4], ['MobilePhone', 5],
        ];
        expect(Object.keys(r.suggestions).sort()).toEqual(expected.map((e) => e[0]).sort());
        for (let i = 0; i < expected.length; i++) {
            expectChip(r, expected[i][0], expected[i][1]);
            expect(confOf(r, expected[i][0])).toBe(1);
        }
    });

    test('every reported confidence is a finite number in [floor..1] on a real fixture', () => {
        const r = suggestMapping(
            [tok('פער יעד'), tok('יעד רבעוני'), tok('סכום מכירות'), tok('שם הסוכן'), tok('אימייל')],
            REGRESSION_COLUMNS,
            {},
        );
        const names = Object.keys(r.suggestions);
        // Pin the set, not just its size, so the loop below cannot pass on a subset.
        expect(names.sort()).toEqual(['אימייל', 'יעד רבעוני', 'סכום מכירות', 'פער יעד', 'שם הסוכן'].sort());
        for (let i = 0; i < names.length; i++) {
            const c = r.suggestions[names[i]].confidence;
            expect(isFinite(c)).toBe(true);
            expect(c).toBeGreaterThanOrEqual(SUGGEST_MIN_CONFIDENCE);
            expect(c).toBeLessThanOrEqual(1);
            expect(r.suggestions[names[i]].columnId).toBeGreaterThan(0);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('suggestMapping — total and deterministic', () => {
    const isEmpty = (r: { suggestions: any }): boolean => Object.keys(r.suggestions).length === 0;

    test('null / undefined / empty inputs', () => {
        expect(isEmpty(suggestMapping(null, null))).toBe(true);
        expect(isEmpty(suggestMapping(undefined, undefined))).toBe(true);
        expect(isEmpty(suggestMapping([], []))).toBe(true);
        expect(isEmpty(suggestMapping([tok('a')], []))).toBe(true);
        expect(isEmpty(suggestMapping([], [col(1, 1, 'a')]))).toBe(true);
        expect(isEmpty(suggestMapping(null, [col(1, 1, 'a')]))).toBe(true);
        expect(isEmpty(suggestMapping([tok('a')], null))).toBe(true);
        // POSITIVE CONTROL: the same builders, wired up properly, are NOT empty — so the seven
        // assertions above are the guards firing and not the fixtures being broken.
        expect(isEmpty(suggestMapping([tok('a')], [col(1, 1, 'a')]))).toBe(false);
    });

    test('a fresh result object every call (no shared mutable state)', () => {
        const a = suggestMapping(null, null);
        const b = suggestMapping(null, null);
        expect(a.suggestions === b.suggestions).toBe(false);
        expect(a === b).toBe(false);
    });

    test('garbage entries never throw', () => {
        const dirty: any[] = [null, undefined, {}, { Token: '' }, { Token: 42 }, tok('first name')];
        const dirtyCols: any[] = [
            null, undefined, {}, { ColumnID: 0, DisplayName: 'x' }, { ColumnID: -3, DisplayName: 'y' },
            { ColumnID: 5 }, col(6, 1, 'first name'),
        ];
        const r = suggestMapping(dirty, dirtyCols, { 'first name': NaN } as any);
        expect(idOf(r, 'first name')).toBe(6);
        expect(suggestMapping(dirty as any, dirtyCols as any, undefined)).toBeTruthy();
        expect(isEmpty(suggestMapping({} as any, {} as any))).toBe(true);
        expect(isEmpty(suggestMapping('nope' as any, 'nope' as any))).toBe(true);
    });

    test('a column literally named "constructor" or "__proto__" does not poison anything', () => {
        const cols = [col(1001, 1, 'constructor'), col(1002, 2, '__proto__'), col(1003, 3, 'toString')];
        const r = suggestMapping([tok('constructor'), tok('__proto__')], cols, {});
        expect(idOf(r, 'constructor')).toBe(1001);
        expect(idOf(r, '__proto__')).toBe(1002);
    });

    test('duplicate ColumnIDs — first wins, and it is still one-to-one', () => {
        const cols = [col(1101, 1, 'alpha'), col(1101, 2, 'alpha'), col(1102, 3, 'beta')];
        const r = suggestMapping([tok('alpha'), tok('beta')], cols, {});
        expect(idOf(r, 'alpha')).toBe(1101);
        expect(idOf(r, 'beta')).toBe(1102);
    });

    test('duplicate token names — first occurrence only, no crash', () => {
        const cols = [col(1201, 1, 'alpha'), col(1202, 2, 'beta')];
        const r = suggestMapping([tok('alpha'), tok('alpha')], cols, {});
        expect(Object.keys(r.suggestions).length).toBe(1);
        expect(idOf(r, 'alpha')).toBe(1201);
    });

    test('same input → identical output, twice', () => {
        const tokens = [tok('פער יעד'), tok('יעד רבעוני'), tok('FirstName')];
        const a = suggestMapping(tokens, REGRESSION_COLUMNS, {});
        const b = suggestMapping(tokens, REGRESSION_COLUMNS, {});
        expect(a).toEqual(b);
        expect(Object.keys(a.suggestions).length).toBeGreaterThan(0);   // not two empty maps
    });

    test('the inputs are never mutated', () => {
        const tokens = [tok('פער יעד')];
        const before = JSON.stringify({ tokens, cols: REGRESSION_COLUMNS });
        const r = suggestMapping(tokens, REGRESSION_COLUMNS, {});
        expect(JSON.stringify({ tokens, cols: REGRESSION_COLUMNS })).toBe(before);
        expect(Object.keys(r.suggestions).length).toBeGreaterThan(0);   // the call really ran
    });
});
