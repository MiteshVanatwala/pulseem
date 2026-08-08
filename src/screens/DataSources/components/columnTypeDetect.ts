// Per-COLUMN type detection for the ingestion wizard.
//
// WHY PER-COLUMN AND NOT PER-CELL: a column is one thing. If 998 of 1000 cells are numbers and two
// are "n/a", the column is a NUMBER column with two dirty cells — it is NOT two text cells living
// inside a number column. Per-cell typing produced grids where the same column rendered right
// aligned with separators on some rows and raw on others, which reads as a rendering bug. So the
// decision is taken ONCE per column, over the sampled values, and every cell of that column is then
// rendered by that one decision (see formatValue.ts).
//
// The old wizard rule was `vals.every(isNumberVal)` — a single stray cell demoted the whole column
// to text with no explanation anywhere in the UI. This module keeps the same candidate order but
// (a) votes instead of requiring unanimity, and (b) reports the EVIDENCE it voted on so the user can
// see why, and override (see TypeEvidencePopover.tsx).

import { ColumnDetection } from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';

/** A column is typed when at least this share of its NON-EMPTY sampled cells fit the candidate. */
export const DETECT_THRESHOLD = 0.9;

// ── small-sample rule (review R2-02, 2026-08-08) ─────────────────────────────────────────────
// DETECT_THRESHOLD alone is meaningless on a tiny sample: with the five rows the upload wizard
// supplies, "≥ 90%" rounds up to 5 of 5 — unanimity, which is precisely the behaviour the ratio was
// introduced to replace. At or below SMALL_SAMPLE_MAX the decision therefore switches from a ratio
// to a bounded miss count. SMALL_SAMPLE_MIN_HITS keeps the degenerate cases out: 1-of-2 and 0-of-1
// are not evidence of anything.
/** At or below this many non-empty sampled values, judge by miss count rather than by ratio. */
export const SMALL_SAMPLE_MAX = 10;
/** How many non-matching cells a small sample may contain and still be typed. */
export const SMALL_SAMPLE_MAX_MISSES = 1;
/** A small sample must still show at least this many real matches. */
export const SMALL_SAMPLE_MIN_HITS = 2;

/** Max number of real values from the user's own file kept as evidence. */
export const MAX_SAMPLES = 3;

// ── value-level predicates (internal: the exported unit of work is a COLUMN) ──

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/* Strip only formatting a human types around a phone number. NCHAR(8206)/(8207) (LRM/RLM) are
   stripped too: Excel injects them into RTL sheets and they are invisible, so a column of perfectly
   good phone numbers would otherwise score 0%. */
const cleanDigits = (v: any) => String(v).replace(/[\s\-()+‎‏]/g, '');

export const isEmailValue = (v: any) => EMAIL_RE.test(String(v).trim());

/* The three shapes the product recognises, and only those:
     05 + 8 more  = 10 digits (local mobile)
     9725 + 8 more = 12 digits (international, no plus)
     5 + 8 more   =  9 digits (mobile with the leading zero already eaten by Excel)
   The third is the whole reason a leading zero must never be treated as a number: Excel turns
   0521234567 into 521234567, and if a "5" + 9 digits column were then read as a number the value
   would be re-formatted as 521,234,567 in the grid. */
export const isPhoneValue = (v: any) => {
    const c = cleanDigits(v);
    return /^05\d{8}$/.test(c) || /^9725\d{8}$/.test(c) || /^5\d{8}$/.test(c);
};

/* Three digit groups separated by / - or . , with an OPTIONAL time part. Carried over verbatim from
   the wizard's own isDateVal: deliberately NOT a real date parser (99/99/9999 matches). It only
   decides a display LABEL — the cell is stored and sent as the raw string either way. Do not
   "improve" this without first deciding day-first vs month-first: 05/04/1956 is ambiguous and today
   nobody has to resolve it. */
export const isDateValue = (v: any) =>
    /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}(?:(?:\s+|T)\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp]\.?[Mm]\.?)?)?$/
        .test(String(v).trim());

/* A comma is a thousands separator ONLY when it groups exactly three digits. "1,234,567" is a
   number; "1,23" and "12,3456" are not — in he/pl those are decimal commas or free text, and
   guessing wrong turns 1,23 into 123. */
const NUM_GROUPED = /^[-+]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
const NUM_PLAIN = /^[-+]?\d+(?:\.\d+)?$/;

/* LEADING ZERO ⇒ NEVER A NUMBER. Landline numbers (03-6110000), Israeli IDs, zip codes, account
   numbers and SKUs all carry meaningful leading zeros; typing such a column as NUMBER drops them on
   the way to the grid and the user cannot get them back.
   The guard is `0` followed by ANOTHER DIGIT, not "starts with 0": "0" is a number and so is "0.5".
   Every value the rule protects has a digit after the zero, so nothing is lost, while a real
   fractional column (0.35, 0.7) still types as NUMBER instead of collapsing to text. */
const hasLeadingZero = (digits: string) => /^0\d/.test(digits);

export const isNumberValue = (v: any) => {
    const s = String(v).trim();
    if (s === '') return false;
    if (!NUM_PLAIN.test(s) && !NUM_GROUPED.test(s)) return false;
    const intPart = s.replace(/^[-+]/, '').split('.')[0].replace(/,/g, '');
    return !hasLeadingZero(intPart);
};

// ── the column-level decision ──

type Predicate = (v: any) => boolean;

/* Candidate order matters and is the wizard's original order: email → phone (phones are all-digits
   too) → date → number. Text is not a candidate, it is the fallback: everything is valid text. */
const CANDIDATES: { type: eDataType; test: Predicate }[] = [
    { type: eDataType.EMAIL, test: isEmailValue },
    { type: eDataType.PHONE, test: isPhoneValue },
    { type: eDataType.DATE, test: isDateValue },
    { type: eDataType.NUMBER, test: isNumberValue }
];

const nonEmpty = (values: any[]) =>
    (values || []).filter(v => v !== undefined && v !== null && String(v).trim() !== '').map(v => String(v));

/**
 * Decide the type of ONE column from a sample of its values.
 *
 * `samples` are REAL values taken from the user's own file — never invented, never a generic
 * example — because the popover has to answer "why did you think this?" and only the user's own
 * data can answer that. They are the values that MATCHED the chosen type (at 100% confidence any
 * value matches, so the first three are taken).
 *
 * A column with no non-empty sampled values returns TEXT with total 0 and confidence 0: "I have no
 * evidence" is a different statement from "I am sure it is text", and the popover renders it as
 * such.
 */
export const detectColumnType = (values: any[]): ColumnDetection => {
    const vals = nonEmpty(values);
    const total = vals.length;
    if (total === 0) {
        return { type: eDataType.TEXT, confidence: 0, matched: 0, total: 0, samples: [] };
    }
    for (let i = 0; i < CANDIDATES.length; i++) {
        const c = CANDIDATES[i];
        const hits = vals.filter(c.test);
        // 🔴 FIXED 2026-08-08 (review R2-02). The condition was `hits.length / total >= 0.9` alone,
        // and the wizard hands this function a FIVE-ROW sample (UploadWizardDialog header, line 43).
        // 4/5 = 0.8 < 0.9, so the "≥90% of non-empty cells" vote was ARITHMETICALLY IDENTICAL to the
        // `vals.every(...)` unanimity it was written to replace: one "n/a" in a five-row sample still
        // demoted a whole amount column to TEXT — the exact case named in that header comment and in
        // LEDGER #36 as the reason for the change.
        //
        // Two consequences, both silent: the column lost its NUMBER operators, so "who sold above X"
        // was simply not offered on it; and because the TEXT fallback below reports confidence 100,
        // the evidence popover said "100% טקסט" and the amber 85-95% state Idan asked for (§4.2c)
        // was unreachable by construction.
        //
        // A ratio needs a denominator big enough to express it. Below SMALL_SAMPLE_MAX the ratio is
        // too coarse, so a bounded MISS COUNT is used instead: one dirty cell is tolerated, provided
        // at least two cells actually matched (which rejects the degenerate 1-of-2 and 0-of-1 cases).
        // A column typed this way reports its true percentage — 4/5 renders as 80%, which lands in
        // the amber band and tells the user exactly what to look at.
        const misses = total - hits.length;
        const ratioOk = hits.length / total >= DETECT_THRESHOLD;
        const smallSampleOk = total <= SMALL_SAMPLE_MAX
            && misses <= SMALL_SAMPLE_MAX_MISSES
            && hits.length >= SMALL_SAMPLE_MIN_HITS;
        if (ratioOk || smallSampleOk) {
            return {
                type: c.type,
                confidence: Math.round((hits.length / total) * 100),
                matched: hits.length,
                total,
                samples: hits.slice(0, MAX_SAMPLES)
            };
        }
    }
    // Fallback. Every value IS valid text, so the honest confidence is 100 — the popover renders
    // that as the quiet grey state, which is exactly right: text is never a risky guess.
    return { type: eDataType.TEXT, confidence: 100, matched: total, total, samples: vals.slice(0, MAX_SAMPLES) };
};

/** True where the guess is most likely wrong and the UI must draw attention to it (amber). */
export const isDetectionUncertain = (d: ColumnDetection | null | undefined) =>
    !!d && d.total > 0 && d.confidence < 95;

// ── self-tests ─────────────────────────────────────────────────────────────
// Not run on import (this file is in the app bundle). Call from a console or a test runner:
//   import { runColumnTypeDetectSelfTests } from './columnTypeDetect';
//   console.table(runColumnTypeDetectSelfTests());

export interface SelfTestResult { name: string; ok: boolean; detail: string; }

export const runColumnTypeDetectSelfTests = (): SelfTestResult[] => {
    const out: SelfTestResult[] = [];
    const check = (name: string, ok: boolean, detail: string) => out.push({ name, ok, detail });
    const eq = (name: string, actual: any, expected: any) =>
        check(name, actual === expected, `expected ${String(expected)}, got ${String(actual)}`);

    // phones — the three accepted shapes
    eq('phone 05+8', detectColumnType(['0521234567', '0541111111']).type, eDataType.PHONE);
    eq('phone 9725+8', detectColumnType(['972521234567', '972541111111']).type, eDataType.PHONE);
    eq('phone 5+8 (Excel ate the zero)', detectColumnType(['521234567', '541111111']).type, eDataType.PHONE);
    eq('phone with dashes/spaces', detectColumnType(['052-123-4567', '054 111 1111']).type, eDataType.PHONE);
    eq('9 digits not starting with 5 is not a phone', detectColumnType(['421234567', '431234567']).type, eDataType.NUMBER);

    // leading zero is never a number
    eq('landline stays text', detectColumnType(['03-6110000', '046220000', '025551234']).type, eDataType.TEXT);
    eq('zip with leading zero stays text', detectColumnType(['01234', '05678', '09999']).type, eDataType.TEXT);
    eq('"0" is a number', isNumberValue('0'), true);
    eq('"0.5" is a number', isNumberValue('0.5'), true);
    eq('"05" is not a number', isNumberValue('05'), false);
    eq('sub-1 decimals type as NUMBER', detectColumnType(['0.35', '0.7', '0.125']).type, eDataType.NUMBER);

    // comma = thousands separator only when it groups exactly 3
    eq('1,234,567 is a number', isNumberValue('1,234,567'), true);
    eq('1,23 is not a number', isNumberValue('1,23'), false);
    eq('12,3456 is not a number', isNumberValue('12,3456'), false);
    eq('grouped column types as NUMBER', detectColumnType(['1,234', '12,345', '999']).type, eDataType.NUMBER);

    // sampling, not unanimity
    const dirty = detectColumnType(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'n/a']);
    eq('9/10 numbers -> NUMBER', dirty.type, eDataType.NUMBER);
    eq('9/10 confidence is 90', dirty.confidence, 90);
    const tooDirty = detectColumnType(['1', '2', '3', '4', '5', '6', '7', '8', 'n/a', 'x']);
    eq('8/10 numbers -> TEXT', tooDirty.type, eDataType.TEXT);

    // ── small-sample rule (review R2-02) ──────────────────────────────────────────────────────
    // THE CASE THE WHOLE MODULE EXISTS FOR, and the one the ratio alone silently failed: the upload
    // wizard hands this function FIVE rows, and 4/5 = 0.8 falls under DETECT_THRESHOLD, so before
    // this rule a single "n/a" still demoted an amount column to TEXT — the exact behaviour of the
    // `vals.every(...)` unanimity the vote replaced. These four assertions pin the rule so a future
    // edit to DETECT_THRESHOLD or the constants cannot quietly restore unanimity.
    const fiveRowDirty = detectColumnType(['153000', '102094', 'n/a', '167000', '116094']);
    eq('4/5 numbers -> NUMBER (was TEXT before R2-02)', fiveRowDirty.type, eDataType.NUMBER);
    eq('4/5 reports its real 80, not 100', fiveRowDirty.confidence, 80);
    // …and the degenerate cases the miss-count rule must NOT let through.
    eq('1/2 numbers -> TEXT', detectColumnType(['7', 'n/a']).type, eDataType.TEXT);
    eq('0/1 -> TEXT', detectColumnType(['n/a']).type, eDataType.TEXT);
    eq('2/3 numbers -> NUMBER', detectColumnType(['7', '8', 'n/a']).type, eDataType.NUMBER);
    // two dirty cells in a small sample is still too many — one miss is the budget
    eq('3/5 numbers -> TEXT', detectColumnType(['7', '8', '9', 'n/a', 'x']).type, eDataType.TEXT);

    // empties are excluded from the denominator, not counted as misses
    const withBlanks = detectColumnType(['1', '', '   ', null, undefined, '2']);
    eq('blanks excluded from total', withBlanks.total, 2);
    eq('blanks do not lower confidence', withBlanks.confidence, 100);

    // no evidence at all
    const empty = detectColumnType(['', '  ', null]);
    eq('all-empty -> TEXT', empty.type, eDataType.TEXT);
    eq('all-empty -> total 0', empty.total, 0);
    eq('all-empty -> confidence 0 (no evidence, not certainty)', empty.confidence, 0);

    // samples are real values from the input, capped at 3
    const s = detectColumnType(['a@b.com', 'c@d.com', 'e@f.com', 'g@h.com']);
    eq('samples capped at 3', s.samples.length, MAX_SAMPLES);
    check('samples are real input values', s.samples.every(x => ['a@b.com', 'c@d.com', 'e@f.com', 'g@h.com'].indexOf(x) !== -1),
        JSON.stringify(s.samples));

    // candidate order: email wins over text, phone wins over number
    eq('emails -> EMAIL', detectColumnType(['a@b.com', 'c@d.co.il']).type, eDataType.EMAIL);
    eq('dates -> DATE', detectColumnType(['14/12/2017', '01-02-2020', '14/12/2017 12:47 PM']).type, eDataType.DATE);

    // uncertainty band
    check('90% is uncertain (amber)', isDetectionUncertain(dirty) === true, String(dirty.confidence));
    check('100% is not uncertain', isDetectionUncertain(s) === false, String(s.confidence));

    return out;
};
