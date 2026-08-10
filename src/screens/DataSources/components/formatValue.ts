// THE display formatter for a data-source cell. One function, used by every screen that renders a
// cell, so a value cannot look like one thing in the grid and another in the preview.
//
// Two rules that are easy to get wrong and that this file exists to pin down:
//
// 1. THOUSANDS SEPARATORS ARE ALWAYS ON for a NUMBER column (unless the column says otherwise).
//    1234567 in a table of amounts is unreadable; 1,234,567 is read at a glance.
//
// 2. DECIMALS ARE THE SOURCE'S, NOT OURS. As many as the file has — never added, never truncated.
//    `Number(v).toLocaleString()` was the obvious implementation and it is wrong in BOTH directions:
//    it rounds to 3 fraction digits (so 1.23456 silently became 1.235) and it drops trailing zeros
//    (so a price column of 10.00 / 10.50 rendered as 10 / 10.5 and stopped lining up). This
//    formatter never parses the value into a float at all — it groups the integer DIGITS as text and
//    re-attaches the fraction substring byte-for-byte.
//
// Anything this file cannot confidently format is returned UNCHANGED. A formatter that mangles an
// unexpected value is worse than one that leaves it alone: the user can always read the raw file.

import { eDataType } from '../../../Models/DataSources/DataSourceEnums';

export interface FormatValueOptions {
    /** The COLUMN's type (never a per-cell guess) — see columnTypeDetect.ts. */
    type: eDataType;
    /**
     * The column's ShowThousandsSeparator flag. `undefined` means "column saved before the flag
     * existed" and must behave like the DB default (1 = on), which is why the test is `!== false`
     * everywhere and never `!flag`.
     */
    showThousandsSeparator?: boolean;
}

/* Sign, integer digits (optionally already grouped in the source), optional fraction. Nothing else
   is a number for display purposes — a currency symbol, a unit or a stray letter means "leave it
   alone", because we do not know where the symbol belongs in the user's locale. */
const NUMERIC_RE = /^([-+]?)((?:\d{1,3}(?:,\d{3})+)|\d+)(\.\d*)?$/;

const groupDigits = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Format ONE cell for display.
 *
 * `raw` is whatever came out of RowJson: string, number, boolean, null, undefined. Everything that
 * is not a NUMBER column, or not recognisably numeric, comes back as a plain string of itself.
 */
export const formatValue = (raw: any, options: FormatValueOptions): string => {
    if (raw === null || raw === undefined) return '';
    const s = String(raw);
    if (options.type !== eDataType.NUMBER) return s;

    const trimmed = s.trim();
    if (trimmed === '') return s;

    const m = NUMERIC_RE.exec(trimmed);
    if (!m) return s;                     // not a number after all — never mangle it

    const sign = m[1] === '+' ? '' : m[1];
    const intDigits = m[2].replace(/,/g, '');
    const fraction = m[3] ?? '';          // includes the '.' and EXACTLY the source's digits

    // Leading zeros are load-bearing (ids, zips, account numbers). columnTypeDetect never types such
    // a column as NUMBER, but a single odd cell inside a real number column can still look like
    // this — and re-grouping 007 into 007 while dropping nothing is pointless, so leave it be.
    if (/^0\d/.test(intDigits)) return s;

    const grouped = options.showThousandsSeparator !== false ? groupDigits(intDigits) : intDigits;
    return sign + grouped + fraction;
};

/** Convenience wrapper for a whole column, so callers do not re-derive the options per cell. */
export const formatValueForColumn = (
    raw: any,
    column: { DataType: eDataType; ShowThousandsSeparator?: boolean }
): string => formatValue(raw, { type: column.DataType, showThousandsSeparator: column.ShowThousandsSeparator });

// ── self-tests ─────────────────────────────────────────────────────────────
// Not run on import. Call from a console or a test runner:
//   import { runFormatValueSelfTests } from './formatValue';
//   console.table(runFormatValueSelfTests());

export interface FormatSelfTestResult { name: string; ok: boolean; detail: string; }

export const runFormatValueSelfTests = (): FormatSelfTestResult[] => {
    const out: FormatSelfTestResult[] = [];
    const num = (raw: any, sep?: boolean) => formatValue(raw, { type: eDataType.NUMBER, showThousandsSeparator: sep });
    const eq = (name: string, actual: string, expected: string) =>
        out.push({ name, ok: actual === expected, detail: `expected "${expected}", got "${actual}"` });

    // separators always on for NUMBER
    eq('groups thousands', num('1234567'), '1,234,567');
    eq('groups 4 digits', num('1234'), '1,234');
    eq('no separator under 1000', num('999'), '999');
    eq('re-groups an already grouped source', num('1,234,567'), '1,234,567');
    eq('negative keeps its sign', num('-1234567.5'), '-1,234,567.5');
    eq('drops a redundant plus', num('+1234'), '1,234');

    // decimals: exactly what the source had
    eq('keeps trailing zeros', num('10.00'), '10.00');
    eq('keeps 5 decimals (toLocaleString would round to 3)', num('1.23456'), '1.23456');
    eq('adds no decimals', num('10'), '10');
    eq('keeps a bare trailing dot', num('10.'), '10.');
    eq('groups the integer part only', num('1234567.891011'), '1,234,567.891011');

    // ShowThousandsSeparator === false
    eq('flag off -> ungrouped', num('1234567', false), '1234567');
    eq('flag off keeps decimals', num('1234567.50', false), '1234567.50');
    eq('flag off strips a grouped source', num('1,234,567', false), '1234567');
    eq('undefined flag behaves like the DB default (on)', num('1234567', undefined), '1,234,567');

    // never mangle
    eq('leading zero left alone', num('007'), '007');
    eq('currency symbol left alone', num('$1234'), '$1234');
    eq('free text left alone', num('n/a'), 'n/a');
    eq('empty stays empty', num(''), '');
    eq('null renders blank', num(null), '');
    eq('undefined renders blank', num(undefined), '');

    // non-number columns are passed through verbatim
    eq('TEXT passthrough', formatValue('1234567', { type: eDataType.TEXT }), '1234567');
    eq('PHONE passthrough', formatValue('0521234567', { type: eDataType.PHONE }), '0521234567');
    eq('DATE passthrough', formatValue('14/12/2017', { type: eDataType.DATE }), '14/12/2017');
    eq('EMAIL passthrough', formatValue('a@b.com', { type: eDataType.EMAIL }), 'a@b.com');

    // numeric (non-string) input from JSON.parse
    eq('numeric input', num(1234567), '1,234,567');

    return out;
};
