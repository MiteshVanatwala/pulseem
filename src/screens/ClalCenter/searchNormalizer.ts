// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLAL CENTER — the FROZEN Hebrew search normaliser (11-CONTRACTS v12 §C5).
//
// PROVENANCE: lifted verbatim from `ClalCenter\clal-center-demo.html:425-444` (`FINALS`,
// `QUOTES`, `PUNCT`, `normMap`, `norm`) — that mock is the proof-of-correctness source, and the
// portal (W4) ships the same algorithm. The two must agree character for character or the admin's
// "יימצא לפי" line promises a match the portal cannot make.
//
// WHAT §C5 §1 ALLOWS: types, `const`, index signatures. NOTHING ELSE.
// WHAT IT FORBIDS: touching the order of operations, the character classes, the unconditional
// final-letter folding, the quote strip-without-space, punct→space, lowercase, or the collapse.
// Do not "improve" a regex here. Ever.
//
// ⚠️ THE TRAP THAT COST v11 A DAY: the folding of final letters is UNCONDITIONAL, so
// `norm('חִסָּכוֹן')` is `'חסכונ'` (not `'חסכון'`) and `norm('ביטוח-חיים')` is `'ביטוח חיימ'`
// (not `'ביטוח חיים'`). That is deliberate — vector 4 exists to prove it. This is exactly why the
// acceptance vectors below are written as EQUIVALENCE PAIRS `norm(a) === norm(b)` and never as
// literal expected strings.
// ═══════════════════════════════════════════════════════════════════════════════════════════

/** Hebrew final forms → their base letter. Applied unconditionally (see the header). */
const FINALS: { [char: string]: string } = {
    'ך': 'כ',
    'ם': 'מ',
    'ן': 'נ',
    'ף': 'פ',
    'ץ': 'צ'
};

/** Geresh/gershayim and every straight or curly quote. REMOVED, not replaced by a space. */
const QUOTES = /[׳״'"‘’“”`]/;

/**
 * Punctuation that becomes a SPACE (so `א(ב)ג.ד` tokenises like `א ב ג ד`).
 *
 * 🔴 DO NOT "CLEAN UP" THIS REGEX. It is byte-for-byte identical to
 * `clal-center-demo.html:427`, the frozen source shared with the portal (W4). ESLint is right
 * that `\-`, `\/` and `\[` are redundant inside a character class — and removing them would
 * still be a divergence from the frozen text, which §C5 forbids. Hence the suppression.
 */
// eslint-disable-next-line no-useless-escape
const PUNCT = /[\-–—־\/\\()\[\],.:;?!+&*#]/;

export interface NormalizedText {
    /** The normalised string. */
    text: string;
    /** For every character of `text`, its index in the ORIGINAL string (for highlighting). */
    map: number[];
}

/**
 * The frozen normaliser. Returns the normalised text plus an index map back to the original,
 * which is what makes `<mark>` highlighting possible without re-searching the raw string.
 */
export function normMap(s: string): NormalizedText {
    s = String(s).normalize('NFC');
    const out: string[] = [];
    const map: number[] = [];
    for (let i = 0; i < s.length; i++) {
        let c = s[i];
        const code = s.charCodeAt(i);
        // Hebrew points and cantillation (nikud, dagesh, ta'amim) — dropped outright.
        if (code >= 0x0591 && code <= 0x05c7) continue;
        if (QUOTES.test(c)) continue;
        if (PUNCT.test(c) || /\s/.test(c)) c = ' ';
        else if (FINALS[c]) c = FINALS[c];
        else c = c.toLowerCase();
        // collapse runs of whitespace, and never open with one
        if (c === ' ' && (out.length === 0 || out[out.length - 1] === ' ')) continue;
        out.push(c);
        map.push(i);
    }
    while (out.length && out[out.length - 1] === ' ') {
        out.pop();
        map.pop();
    }
    return { text: out.join(''), map: map };
}

/** The normaliser everything else calls. */
export function norm(s: string): string {
    return normMap(s).text;
}

// ── search rules (§C5, bottom paragraph) ────────────────────────────────────────────────────
// The mock uses a 1-character minimum for the ADMIN search; the contract overrides it to 2 for
// both surfaces so admin and portal behave identically. C5 wins over the mock (14-W3 header).

export const MIN_QUERY_CHARS = 2;
export const SEARCH_DEBOUNCE_MS = 150;

/** Split a raw query into normalised tokens. Empty ⇒ the search is not active. */
export function tokenize(query: string): string[] {
    const n = norm(query);
    if (n.length < MIN_QUERY_CHARS) return [];
    return n.split(' ').filter(t => t.length > 0);
}

/**
 * AND between tokens, substring within the (already normalised) haystack.
 * Callers pass haystacks that are ALREADY normalised — normalising per keystroke per row is the
 * one place this gets expensive.
 */
export function matchesTokens(normalizedHaystack: string, tokens: string[]): boolean {
    if (!tokens.length) return true;
    for (let i = 0; i < tokens.length; i++) {
        if (normalizedHaystack.indexOf(tokens[i]) === -1) return false;
    }
    return true;
}

// ── the eight acceptance vectors (§C5 §2) ───────────────────────────────────────────────────
// Written as equivalence pairs on purpose. See the header. `verifyC5Vectors()` is a pure
// function with no side effects; the screen runs it once under the mock switch and prints the
// table, which is the coded evidence the acceptance criteria ask for.

export const C5_VECTORS: ReadonlyArray<{ a: string; b: string; note: string }> = [
    { a: 'קופ״ג', b: 'קופג', note: 'gershayim (U+05F4) is dropped, not spaced' },
    { a: 'קופ"ג', b: 'קופג', note: 'straight double quote behaves the same' },
    { a: 'חִסָּכוֹן', b: 'חסכון', note: 'nikud dropped; BOTH sides fold ן→נ' },
    { a: 'ךםןףץ', b: 'כמנפצ', note: 'final letters fold unconditionally' },
    { a: 'Clal PAY', b: 'clal pay', note: 'latin lowercased' },
    { a: 'ביטוח-חיים', b: 'ביטוח חיים', note: 'hyphen → space; BOTH sides fold ם→מ' },
    { a: '  רווח   כפול  ', b: 'רווח כפול', note: 'whitespace collapsed and trimmed' },
    { a: 'א(ב)ג.ד', b: 'א ב ג ד', note: 'punctuation → space' }
];

export interface C5VectorResult {
    index: number;
    a: string;
    b: string;
    normA: string;
    normB: string;
    pass: boolean;
    note: string;
}

/** Runs all eight equivalence vectors. Pure — returns the table, prints nothing. */
export function verifyC5Vectors(): { allPass: boolean; results: C5VectorResult[] } {
    const results = C5_VECTORS.map((v, i) => {
        const normA = norm(v.a);
        const normB = norm(v.b);
        return { index: i + 1, a: v.a, b: v.b, normA, normB, pass: normA === normB, note: v.note };
    });
    return { allPass: results.every(r => r.pass), results };
}
