import { SmartSendColumn, SmartSendTokenInfo } from '../../Models/DataSources/SmartSend';

// Auto-suggest a data-source column for every UNMAPPED ##token## on the smart-send mapping
// screen. Pure, total, deterministic: no React, no redux, no i18n, no Date, no randomness,
// no network, no new npm dependency (the similarity math is hand-rolled on purpose — see
// TRIGRAM/IDF sections below). The only consumer is TokenMappingTable, which renders each
// suggestion as a CHIP and applies it through its existing `onChange` when the user clicks it.
//
// WHY THIS IS A FLAT MODULE BESIDE THE SCREEN AND NOT A SLICE/HOOK:
// businessColumnDefaults.ts:8-16 records the safety property this feature must not weaken —
// a GUESSED value must never trip the 750ms autosave into the shared production DB on its
// own. A pure function returns data and writes nothing, so it structurally cannot. The click
// that applies a suggestion is the user's, and that click MAY mark dirty.
//
// ─────────────────────────────────────────────────────────────────────────────────────────
// THIS MODULE SUGGESTS. IT NEVER BULK-APPLIES. DO NOT RE-ADD A BULK-APPLY PATH.
//
// An earlier build of this file also returned `autoApplicable` — the subset of suggestions an
// "auto-map" button was allowed to WRITE to N rows at once. Three independent adversarial
// review rounds each patched the gate that guarded it (a confidence floor, then a runner-up
// margin, then a two-sided IDF "coverage" measure with script-anchored affix handling), and
// each following round reproduced a fresh set of wrong columns still getting written. The
// final arbiter rebuilt from source and reproduced five, three of them at confidence 1.0000:
//     EmailAddress → [DisplayName 'האימייל של בן הזוג' / SourceHeader 'EmailAddress']  1.0000
//     MobilePhone  → [DisplayName 'טלפון נייד חסום'    / SourceHeader 'MobilePhone']    1.0000
//     Email        → [DisplayName 'Spouse Emails'     / SourceHeader 'Email']         1.0000
//     CarNumber    → 'Card Number'   ·   ClientAge → 'Client Agent'
//
// THAT IS NOT A BUG, IT IS THE LIMIT OF THE SIGNAL, which is why the path is gone rather than
// gated a fourth time. The last gate's veto compared WORDS across the two name halves; in this
// deployment DisplayName is Hebrew and SourceHeader is Latin, so the two halves share no word
// by construction and the veto can NEVER FIRE. More generally: a spouse's email address and
// the recipient's are the same field with a different owner, and NOTHING IN A NAME distinguishes
// `Policy Start Date` from `Mobile Phone Blocked` as a target for `PolicyStart`/`MobilePhone` —
// one extra word in both cases. Similarity is the right measurement for "how alike are these
// two names"; it is the wrong measurement for "may this be written to the shared production DB
// unattended".
//
// THE ASYMMETRY THAT DECIDES IT: a suggestion CHIP is safe BY CONSTRUCTION — it prints the
// column's name and requires a deliberate click, so a wrong one costs one glance. A bulk-apply
// is not — it writes N rows, the 750ms debounce persists them to the shared production DB,
// there is no undo, and an auto-written row is indistinguishable from a user's own choice, so
// nobody ever re-checks it. Wrong chip: ignored. Wrong write: a live insurance mailing to the
// wrong person.
//
// ─────────────────────────────────────────────────────────────────────────────────────────
// THE MANDATE: NOTHING HERE MAY BE HARDCODED TO A CUSTOMER'S FIELD NAMES.
//
// businessColumnDefaults.ts:18-38 documents a name-guesser that independent review KILLED.
// It ported a word list (חוסר / נשאר / חסר, plus פער / יעד "because the columns in this
// project are named that way"), scanned columns in Ordinal order, and matched ANY word.
// It got the WRONG ANSWER on this repo's own fixtures: "יעד רבעוני" (Ordinal 4, a TARGET
// column) beat "פער מהיעד" (Ordinal 7, the actual shortfall), because — quoting the review —
// "matching ANY word gives no priority between words".
//
// This module is the answer to that review, and it must not repeat any part of it:
//   · ZERO word lists, ZERO language vocabularies, ZERO customer terms. Search this file for
//     a Hebrew/English/Polish business word and you will find none. The only script-specific
//     data below is ORTHOGRAPHIC (Hebrew final-letter forms and the niqqud code range) — the
//     same letter written two ways, not a meaning.
//   · Priority between words comes from IDF measured over the column set of THIS CALL, so a
//     word that many columns share weighs less than a word only one column has. That is
//     data-driven, per-call, and survives a customer whose fields are named anything at all.
//   · Ordinal is a TIE-BREAK, never a search order. The old bug was "first hit in Ordinal
//     order wins"; here every candidate is scored and the best score wins.
// ─────────────────────────────────────────────────────────────────────────────────────────

export interface MappingSuggestion {
    columnId: number;      // SmartSendColumn.ColumnID — always > 0
    confidence: number;    // 0..1
}

export type SuggestionMap = { [token: string]: MappingSuggestion };

/**
 * Display floor: below this nothing is shown at all. The ONLY threshold this module has.
 *
 * MEASURED 2026-08-03 over a corpus built to include the two shapes the original calibration
 * set was missing — names of 3-5 words, and tokens whose correct column is ABSENT from the
 * source. Every raw token×column score was dumped with this floor temporarily set to ~0:
 *   · UNRELATED 0.000 – 0.227   nothing in common but the alphabet and the space padding.
 *   · CORRECT   0.399 – 1.000   the column a human would pick; the weakest genuine non-exact
 *                               match measured 0.399 (CustomerEmailAddress → Email), and exact
 *                               normalized equality on either name half is 1.000.
 * 0.34 sits above the whole unrelated band and below the weakest genuine match — a narrower gap
 * than an earlier comment here claimed, and worth knowing: a token whose column is absent scored
 * 0.227 against the nearest thing in the source, so this floor is what keeps a chip off that row.
 * Under it a "suggestion" is indistinguishable from two names that merely share an alphabet, and
 * a wrong chip on every row would train the user to ignore the feature — a suggestion nobody
 * reads is worse than none.
 *
 * NOTE, and the reason there is no second, higher threshold: a WRONG column that shares words
 * scores 0.221 – 0.800, straight through the correct band (`טלפון נייד` → `טלפון נייד חסום`
 * measured 0.800, `MobilePhone` → `Mobile Phone Blocked` 0.7775). No floor separates right from
 * wrong. This one only separates "worth showing" from "noise", which is a question similarity
 * can actually answer.
 */
export const SUGGEST_MIN_CONFIDENCE = 0.34;

// ── Blend ────────────────────────────────────────────────────────────────────────────────
// score = TRIGRAM_WEIGHT · trigramDice + WORD_WEIGHT · idfWeightedWordDice   (weights sum to 1)
//
// WORD_WEIGHT is the larger of the two because IDF word overlap is the documented fix and it
// is the component that actually knows which word matters. TRIGRAM_WEIGHT is not small,
// though, and dropping it was considered and rejected: whole-word equality is brittle in
// Hebrew, where an inflected/prefixed form shares NO word with its base ("מהיעד" vs "יעד" is
// zero word overlap) but shares most of its characters. Trigrams carry those cases, plus
// typos, singular/plural and any language's affixes — genericly, with no morphology table.
const TRIGRAM_WEIGHT = 0.45;
const WORD_WEIGHT = 0.55;

// Two candidates whose scores differ by less than this are "near-equal" for the SemanticRole
// tie-break. Half of it is used as the ordering nudge (see orderKey below) so the tie-break can
// reorder near-equals without ever changing a reported confidence.
const ROLE_TIEBREAK_EPSILON = 0.02;

// DataSourceColumns.SemanticRole: 0=None, 1=RecipientEmail, 2=RecipientCellphone.
const SEMANTIC_ROLE_NONE = 0;

// ── Normalization ────────────────────────────────────────────────────────────────────────
// Applied IDENTICALLY to both sides. Asymmetric normalization is the classic way a matcher
// silently stops matching, so there is exactly ONE function and both sides call it.

// Hebrew niqqud / cantillation. Stripped (not spaced) because they are diacritics ON a letter,
// not separators: "שָׁלוֹם" and "שלום" must normalize to the same string.
const NIQQUD_RE = /[֑-ׇ]/g;

// Hebrew final letter forms. Purely orthographic — the SAME letter, written differently
// because of where it sits in the word. A token written mid-word ("סכום") and a header where
// the same root ends the word ("הסכום"/"סכום") must not miss each other over letter shape.
// This is a script rule, not a vocabulary: it carries no meaning and no customer term.
const HEBREW_FINALS_RE = /[ךםןףץ]/g;
const HEBREW_FINALS_MAP: { [ch: string]: string } = {
    'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ',
};

// camelCase / PascalCase → spaced words, so a token `FirstName` meets a header `First Name`.
// Run BEFORE lowercasing (afterwards the case boundary is gone).
//   ACRONYM: "IDNumber" → "ID Number"   (uppercase run followed by Upper+lower)
//   BOUNDARY: "firstName" → "first Name" (any non-uppercase, non-space char before an Upper)
// The BOUNDARY class is `[^A-Z\s]` rather than `[a-z0-9]` so it is script-agnostic: a Hebrew
// or Polish letter directly before a Latin capital also splits.
const CAMEL_ACRONYM_RE = /([A-Z]+)([A-Z][a-z])/g;
const CAMEL_BOUNDARY_RE = /([^A-Z\s])([A-Z])/g;

// Everything that is a SEPARATOR becomes one space: control chars, whitespace, ASCII
// punctuation, Latin-1 punctuation/symbols, Hebrew geresh/gershayim, general punctuation,
// CJK and fullwidth punctuation. The `+` collapses runs, so this is also the whitespace
// collapse step.
//
// `/` and `[` are deliberately UNESCAPED. Inside a character class neither is special (only
// `]`, `\`, a leading `^` and a bare `-` are), so escaping them was noise that eslint flags as
// no-useless-escape. Verified character-by-character before/after over U+0000..U+FFFF: both
// forms match the same 430 characters, zero differences.
//
// REJECTED: the tidier inverse `[^\p{L}\p{N}]+/gu` (keep letters+digits, drop the rest).
// Unicode property escapes are ES2018; as a literal they depend on the babel transform, and
// as `new RegExp(...)` they throw outright on an older engine — either way the normalizer
// stops being total, which is a contract violation here. REJECTED for the same reason: an
// explicit per-script letter whitelist, which would have to be extended every time a customer
// arrives with a new alphabet — i.e. exactly the maintenance trap the mandate forbids.
// Blacklisting PUNCTUATION is script-agnostic: every letter and digit of every script that is
// not enumerated here survives untouched, including Latin-1/Extended accented letters
// (U+00C0 and up are deliberately outside the range below).
// eslint-disable-next-line no-control-regex
const SEPARATOR_RE = /[\s\u0000-\u0020\u007F!-/:-@[-`{-~\u00A0-\u00BF\u00D7\u00F7\u05F3\u05F4\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F\uFF01-\uFF0F\uFF1A-\uFF20]+/g;

/**
 * The single normalizer. Total: any input, including null/undefined/non-string, yields a
 * string (possibly empty). Order matters and is fixed:
 *   surrounding '#' → camel split → lowercase → strip niqqud → unify finals → separators → trim.
 * '#' is stripped explicitly first even though it would fall out as a separator anyway: the
 * server hands tokens over WITHOUT `##` (SmartSend.ts:44), but a caller that passes the raw
 * `##name##` form must land on the same normalized string, not on one padded with boundary
 * space that would skew its trigrams.
 */
const normalize = (raw: string | null | undefined): string => {
    if (typeof raw !== 'string' || raw.length === 0) return '';
    let s = raw.replace(/^#+/, '').replace(/#+$/, '');
    s = s.replace(CAMEL_ACRONYM_RE, '$1 $2').replace(CAMEL_BOUNDARY_RE, '$1 $2');
    s = s.toLowerCase();
    s = s.replace(NIQQUD_RE, '');
    s = s.replace(HEBREW_FINALS_RE, (ch) => HEBREW_FINALS_MAP[ch] || ch);
    s = s.replace(SEPARATOR_RE, ' ');
    return s.replace(/^ +/, '').replace(/ +$/, '');
};

/**
 * Mirrors businessColumnDefaults.ts:70 — a column's identity is its DisplayName AND its
 * SourceHeader. DisplayName is what the user sees and may have renamed; SourceHeader is what
 * the file said. Either one can be the one that resembles the token, so both are scored.
 *
 * Returns the DISTINCT normalized halves, DisplayName first, empties dropped:
 *   · identical halves (nothing was renamed — overwhelmingly the common case) → ONE entry.
 *     Keeping both would double the column's trigram count while the token side stays single,
 *     so a PERFECT match would score 2n/(n+2n) ≈ 0.67 on the trigram component instead of 1 and
 *     the exact-equality short-circuit would never fire for the commonest data shape there is.
 *   · genuinely different halves → TWO entries.
 *
 * WHY THE HALVES ARE KEPT SEPARATE AND NOT ONLY MERGED (adversarial review, 2026-08-03):
 * the scorer used to compare the token against the merged string ALONE, which made the
 * exact-equality short-circuit structurally dead for every renamed column — the only shape where
 * it matters. `EditColumnDialog.tsx` lets a user type any DisplayName they like while
 * SourceHeader keeps whatever the file said, and businessColumnDefaults.ts:55-59 documents the
 * upload wizard rewriting DisplayName to a localized label by itself, so the shape is routine,
 * not hypothetical. Measured before the fix: token `Email` against a column
 * [DisplayName 'Email', SourceHeader 'RCPT_EMAIL_ADDRESS_PRIMARY_2024'] was beaten by a
 * neighbouring 'Email Notes' column, and against
 * [DisplayName 'Email', SourceHeader 'f3a9c0b2_col_00017_raw_import'] it produced nothing at all
 * — a silent miss, no chip on the row. An exact hit on EITHER half is an exact hit on the column.
 *
 * The two halves are NOT equal EVIDENCE — an exact DisplayName hit is a human's own naming, an
 * exact SourceHeader hit under a different DisplayName may be the spouse's column ([DisplayName
 * 'Spouse Email' / SourceHeader 'Email']). A previous build tried to encode that asymmetry to
 * decide bulk-apply, and it could not be made to work (see the header block). For a CHIP the
 * distinction does not arise: the chip prints the DisplayName, so the user sees `Spouse Email`
 * before clicking. Both halves therefore short-circuit confidence to 1 and the human reads the
 * name — which is the whole reason this feature is chips-only.
 */
const normalizedColumnVariants = (c: SmartSendColumn): string[] => {
    const display = normalize(c.DisplayName);
    const header = normalize(c.SourceHeader);
    const variants: string[] = [];
    if (display) variants.push(display);
    if (header && header !== display) variants.push(header);
    return variants;
};

/**
 * The text the FUZZY path scores against: every distinct half, space-joined. The halves are
 * additionally kept apart (above) purely for the exact-equality test.
 */
const mergedColumnText = (variants: string[]): string => variants.join(' ');

// ── Bags ─────────────────────────────────────────────────────────────────────────────────
// Null-prototype maps throughout. A plain `{}` would answer `bag['constructor']` with a
// Function, and a column literally named "constructor" (or "toString") would then poison the
// IDF table and blow up the arithmetic. That is not hypothetical enough to risk in a function
// whose contract says "never throws".
type Bag = { [key: string]: number };
const newBag = (): Bag => Object.create(null) as Bag;

// The RETURNED map is null-prototype for the same reason (adversarial review, 2026-08-03 — it
// used to be a plain `{}`). A template token may legally be named anything, and
// `suggestions['__proto__'] = { columnId, confidence }` on a plain object does not create a key
// at all: it invokes the prototype SETTER. The read still answers through the chain, which is
// exactly why the older self-test passed, but `Object.keys` never sees it — so any consumer
// iterating the map would silently skip the row. `Object.create(null)` has no setter to hit.
const newSuggestionMap = (): SuggestionMap => Object.create(null) as SuggestionMap;

/**
 * Character trigrams of the normalized string, as a MULTISET (counts, not a set) so a repeated
 * trigram contributes once per occurrence — otherwise "aa aa" and "aa" look identical.
 * The string is padded with one space on each side: boundary trigrams make the start and end
 * of a name count, and padding also guarantees at least one trigram for names of 1-2 chars,
 * which would otherwise score 0 against everything.
 */
const trigramBag = (s: string): { bag: Bag; size: number } => {
    const bag = newBag();
    if (!s) return { bag, size: 0 };
    const padded = ` ${s} `;
    let size = 0;
    for (let i = 0; i + 3 <= padded.length; i++) {
        const g = padded.substr(i, 3);
        bag[g] = (bag[g] || 0) + 1;
        size++;
    }
    return { bag, size };
};

/** Dice on two multisets: 2·|A ∩ B| / (|A| + |B|). 0..1, symmetric, 1 iff identical. */
const diceFromBags = (a: Bag, aSize: number, b: Bag, bSize: number): number => {
    if (aSize <= 0 || bSize <= 0) return 0;
    let shared = 0;
    const keys = Object.keys(a);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const other = b[k] || 0;
        shared += a[k] < other ? a[k] : other;
    }
    const d = (2 * shared) / (aSize + bSize);
    return d > 1 ? 1 : d;
};

/** Unique words of a normalized string, order preserved. */
const uniqueWords = (s: string): string[] => {
    if (!s) return [];
    const parts = s.split(' ');
    const seen = newBag();
    const out: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        if (!w || seen[w]) continue;
        seen[w] = 1;
        out.push(w);
    }
    return out;
};

// ── IDF ──────────────────────────────────────────────────────────────────────────────────
/**
 * THE FIX FOR THE REVIEWED FAILURE (businessColumnDefaults.ts:18-38).
 *
 * Document set = the columns of THIS CALL. df(w) = how many of them contain w.
 *     idf(w) = ln(1 + N / (1 + df(w)))
 * Strictly positive, strictly decreasing in df, and finite for df = 0 — a token word that
 * appears in no column at all gets the maximum weight instead of Infinity, which keeps every
 * downstream sum finite (the "never throws / never NaN" requirement).
 *
 * What it buys, concretely: when several columns are qualified variants of one another they
 * all share the qualifier word, so that word's df is high and its weight collapses toward
 * ln(2); the word that only ONE column has keeps nearly double the weight. A token that shares
 * the crowded word with column X and the rare word with column Y now resolves to Y — which is
 * precisely the case the old any-word matcher got backwards. No literal, no list: the weights
 * are read off whatever columns the customer actually uploaded.
 *
 * REJECTED: computing IDF over tokens as well, or over both sets pooled. The question being
 * asked is "how distinctive is this word AMONG THE COLUMNS I MUST CHOOSE BETWEEN" — pooling in
 * the token side answers a different question and makes the weights depend on which template
 * the user happens to have open.
 */
const buildIdf = (columnWords: string[][]): ((w: string) => number) => {
    const df = newBag();
    const n = columnWords.length;
    for (let i = 0; i < n; i++) {
        const words = columnWords[i];
        for (let j = 0; j < words.length; j++) df[words[j]] = (df[words[j]] || 0) + 1;
    }
    const cache = newBag();
    return (w: string): number => {
        const hit = cache[w];
        if (hit !== undefined) return hit;
        const v = Math.log(1 + n / (1 + (df[w] || 0)));
        cache[w] = v;
        return v;
    };
};

/** Sum of idf over a word list. Precomputed once per token and per column. */
const idfMass = (words: string[], idf: (w: string) => number): number => {
    let sum = 0;
    for (let i = 0; i < words.length; i++) sum += idf(words[i]);
    return sum;
};

/**
 * IDF-weighted word Dice: 2·Σidf(shared) / (Σidf(A) + Σidf(B)). Dice rather than Jaccard so it
 * is the same shape as the trigram component and the blend stays interpretable; both rank the
 * same way, but Dice does not punish a long header quite as hard for its extra words.
 */
const weightedWordDice = (
    aWords: string[], aMass: number,
    bWords: string[], bMass: number,
    idf: (w: string) => number,
): number => {
    if (aMass <= 0 || bMass <= 0) return 0;
    // Membership over the SHORTER list, scanned against the longer — same answer, less work.
    const short = aWords.length <= bWords.length ? aWords : bWords;
    const long = aWords.length <= bWords.length ? bWords : aWords;
    const inLong = newBag();
    for (let i = 0; i < long.length; i++) inLong[long[i]] = 1;
    let shared = 0;
    for (let i = 0; i < short.length; i++) if (inLong[short[i]]) shared += idf(short[i]);
    const d = (2 * shared) / (aMass + bMass);
    return d > 1 ? 1 : d;
};

// ── Internal shapes ──────────────────────────────────────────────────────────────────────

interface ScoredColumn {
    columnId: number;
    ordinal: number;
    semanticRole: number;
    norm: string;         // merged text — the FUZZY path, and what `confidence` is measured on
    norms: string[];      // the distinct name halves — the EXACT path
    words: string[];
    mass: number;
    tri: { bag: Bag; size: number };
}

interface Pair {
    token: string;
    tokenIndex: number;
    columnId: number;
    ordinal: number;
    confidence: number;   // what the user is shown — never adjusted by the tie-break
    orderKey: number;     // sort key only; may carry the SemanticRole nudge
}

// Null-prototype here too, for the same reason as the populated one below: a caller reading
// `result.suggestions['__proto__']` off a plain {} gets Object.prototype — a truthy non-suggestion.
const emptyResult = (): { suggestions: SuggestionMap } => ({ suggestions: newSuggestionMap() });

const isPositiveInt = (v: unknown): v is number =>
    typeof v === 'number' && isFinite(v) && v > 0;

/**
 * Suggest a column for every unmapped token.
 *
 * @param tokens     the template's ##tokens## (server order). Null/empty → empty result.
 * @param columns    the locked version's columns (server order = Ordinal ASC).
 * @param currentMap the LIVE edit state `{ token: columnId | null }` as held by the screen.
 *
 * Returns `{ suggestions }` — every token that found a candidate at or above
 * SUGGEST_MIN_CONFIDENCE. Each one is rendered as a chip and applied only by a user click;
 * nothing here may be written without one (see the header block).
 *
 * The result is an OBJECT rather than a bare map so the shape stays extensible: this signature
 * has already lost one field (`autoApplicable`), and a caller destructuring `{ suggestions }`
 * does not have to change again if another is ever added.
 *
 * Rules, in the order they bite:
 *  1. A token is ALREADY MAPPED when `currentMap[token] != null && > 0` and that ColumnID still
 *     exists in `columns`. Those tokens are skipped and their columns are RESERVED — never
 *     offered to anyone else. (A stored id that no longer exists is the "vanished column" case
 *     TokenMappingTable already flags with its `vanishedColumn` tooltip; the token counts as
 *     unmapped and gets a suggestion, which is the useful behaviour after a re-upload renamed
 *     things. Cited without a line number on purpose — that file is under concurrent edit.)
 *  2. ONE-TO-ONE. Within one call no ColumnID appears in more than one suggestion. Greedy over
 *     all (token, column) pairs by descending score.
 *  3. Deterministic. Ties break by lower Ordinal, then lower ColumnID, then earlier token.
 *
 * REJECTED: falling back to `SmartSendTokenInfo.MappedColumnID` when `currentMap` is omitted.
 * MappedColumnID is the snapshot the server returned at load; `currentMap` is what the user has
 * since done. Silently mixing the two would resurrect a mapping the user had just cleared —
 * and the "already mapped" predicate is fixed by contract in terms of currentMap alone.
 */
export const suggestMapping = (
    tokens: SmartSendTokenInfo[] | null | undefined,
    columns: SmartSendColumn[] | null | undefined,
    currentMap?: { [token: string]: number | null },
): { suggestions: SuggestionMap } => {
    if (!tokens || !columns) return emptyResult();
    // Object.prototype.toString is the cheap total guard: a caller handing us a non-array
    // (a server payload that arrived as an object, say) must get an empty result, not a throw.
    if (!Array.isArray(tokens) || !Array.isArray(columns)) return emptyResult();
    if (!tokens.length || !columns.length) return emptyResult();

    const map = currentMap || {};
    const hasOwn = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

    // ── 1. Index the columns, and reserve the ones already spoken for ─────────────────────
    const byId = newBag();                       // ColumnID → 1, for the "still exists" test
    const usable: SmartSendColumn[] = [];
    for (let i = 0; i < columns.length; i++) {
        const c = columns[i];
        if (!c || !isPositiveInt(c.ColumnID) || byId[c.ColumnID]) continue;  // dupes: first wins
        byId[c.ColumnID] = 1;
        usable.push(c);
    }
    if (!usable.length) return emptyResult();

    const reserved = newBag();
    const openTokens: { info: SmartSendTokenInfo; index: number }[] = [];
    const seenToken = newBag();
    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (!tk || typeof tk.Token !== 'string' || !tk.Token.length) continue;
        if (seenToken[tk.Token]) continue;       // duplicate token names: first occurrence wins
        seenToken[tk.Token] = 1;
        const stored = hasOwn(map, tk.Token) ? map[tk.Token] : null;
        if (stored != null && isPositiveInt(stored) && byId[stored]) {
            reserved[stored] = 1;                // rule 1: mapped → skip the token, keep the column
            continue;
        }
        openTokens.push({ info: tk, index: i });
    }
    if (!openTokens.length) return emptyResult();

    // ── 2. Normalize + IDF over the FULL column set ───────────────────────────────────────
    // IDF is built over every column, including reserved ones. They are part of what makes a
    // word common or rare in this source; dropping them would make the weights lurch around as
    // the user maps rows one by one, and a suggestion that changes because an UNRELATED row was
    // filled in is indefensible to a user watching it happen.
    const scoredColumns: ScoredColumn[] = [];
    const allColumnWords: string[][] = [];
    for (let i = 0; i < usable.length; i++) {
        const c = usable[i];
        const norms = normalizedColumnVariants(c);
        const norm = mergedColumnText(norms);
        const words = uniqueWords(norm);
        allColumnWords.push(words);
        if (reserved[c.ColumnID]) continue;      // scored below only if still available
        scoredColumns.push({
            columnId: c.ColumnID,
            ordinal: isFinite(c.Ordinal as number) ? (c.Ordinal as number) : 0,
            semanticRole: isFinite(c.SemanticRole as number) ? (c.SemanticRole as number) : SEMANTIC_ROLE_NONE,
            norm,
            norms,
            words,
            mass: 0,
            tri: trigramBag(norm),
        });
    }
    if (!scoredColumns.length) return emptyResult();

    const idf = buildIdf(allColumnWords);
    for (let i = 0; i < scoredColumns.length; i++) {
        scoredColumns[i].mass = idfMass(scoredColumns[i].words, idf);
    }

    // ── 3. Score every (open token × available column) pair ───────────────────────────────
    const pairs: Pair[] = [];

    for (let ti = 0; ti < openTokens.length; ti++) {
        const tk = openTokens[ti].info;
        const tokenNorm = normalize(tk.Token);
        if (!tokenNorm) continue;
        const tokenWords = uniqueWords(tokenNorm);
        const tokenTri = trigramBag(tokenNorm);
        const tokenMass = idfMass(tokenWords, idf);

        for (let ci = 0; ci < scoredColumns.length; ci++) {
            const col = scoredColumns[ci];
            let confidence: number;
            // EXACT NORMALIZED EQUALITY ON EITHER NAME HALF short-circuits to 1, and is the
            // 2026-08-03 review fix for the renamed-column miss — see normalizedColumnVariants()
            // for those reproductions. Matching against the MERGED text alone made this branch
            // structurally dead for every column whose DisplayName and SourceHeader differ, which
            // is exactly the shape where an exact hit is worth the most.
            if (col.norms.indexOf(tokenNorm) >= 0) {
                confidence = 1;
            } else {
                const tri = diceFromBags(tokenTri.bag, tokenTri.size, col.tri.bag, col.tri.size);
                const wrd = weightedWordDice(tokenWords, tokenMass, col.words, col.mass, idf);
                confidence = TRIGRAM_WEIGHT * tri + WORD_WEIGHT * wrd;
            }
            if (!isFinite(confidence) || confidence <= 0) continue;
            if (confidence > 1) confidence = 1;
            if (confidence < SUGGEST_MIN_CONFIDENCE) continue;

            // SemanticRole as a TIE-BREAK ONLY, and only for a system-field token.
            // A system-field token belongs to the sender's closed set of recipient attributes;
            // a column carrying a non-zero SemanticRole is the one the server has positively
            // identified as a recipient identity (businessColumnDefaults.ts:68-69 — SemanticRole
            // IS dependable, enforced by IX_DataSourceColumns__VersionID_EmailRole). When two
            // columns are within ROLE_TIEBREAK_EPSILON of each other on name alone, that is the
            // better guess. It moves the SORT KEY only, by half an epsilon: the reported
            // confidence is untouched, so this can never lift a candidate over the display floor.
            //
            // DataType is NOT consulted, anywhere in this file. businessColumnDefaults.ts:61-69
            // documents three routes by which a perfectly ordinary column ends up typed TEXT
            // (programmatic upload skips value-sampling; EditColumnDialog can demote a column
            // with no way back; unrecognised values stay TEXT). A signal that is silently absent
            // on ordinary data is worse than no signal.
            const roleNudge = (tk.IsSystemField === true && col.semanticRole !== SEMANTIC_ROLE_NONE)
                ? ROLE_TIEBREAK_EPSILON / 2
                : 0;

            pairs.push({
                token: tk.Token,
                tokenIndex: openTokens[ti].index,
                columnId: col.columnId,
                ordinal: col.ordinal,
                confidence,
                orderKey: confidence + roleNudge,
            });
        }
    }
    if (!pairs.length) return emptyResult();

    // ── 4. Greedy one-to-one assignment ──────────────────────────────────────────────────
    // Total order, so Array.prototype.sort's (unspecified before ES2019) stability is never
    // relied on: orderKey DESC → Ordinal ASC → ColumnID ASC → token position ASC. The column
    // tie-breaks come first because the contract fixes them; the token position is the last
    // resort, for two different tokens tying on the very same column.
    pairs.sort((a, b) => {
        if (b.orderKey !== a.orderKey) return b.orderKey - a.orderKey;
        if (a.ordinal !== b.ordinal) return a.ordinal - b.ordinal;
        if (a.columnId !== b.columnId) return a.columnId - b.columnId;
        return a.tokenIndex - b.tokenIndex;
    });

    const suggestions: SuggestionMap = newSuggestionMap();
    const takenColumn = newBag();
    const takenToken = newBag();
    for (let i = 0; i < pairs.length; i++) {
        const p = pairs[i];
        if (takenToken[p.token] || takenColumn[p.columnId]) continue;
        takenToken[p.token] = 1;
        takenColumn[p.columnId] = 1;
        suggestions[p.token] = { columnId: p.columnId, confidence: p.confidence };
    }

    return { suggestions };
};
