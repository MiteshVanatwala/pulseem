/* ============================================================================
 * tierGraphCore.js — Tier Graph ("גרף המדרגות") pure logic module
 * ----------------------------------------------------------------------------
 * A faithful, React-free port of the POC (Context\TierGraphDesigner.html,
 * state v4). This module is the SINGLE SOURCE OF TRUTH for:
 *   - the graph state model + defaults
 *   - the layout constants / geometry (computeLayout)
 *   - the URL/link contract (buildLink + b64url)
 * The C# renderer (PulseemHandler.GenerateStairsChart) is the same
 * specification in another language — every constant here must match it 1:1.
 *
 * It has ZERO React imports. The only allowed import is `actionURL`.
 *
 * Declared deviations from the POC (plan §2.1 — allowed, NOT findings):
 *   #3 endpoint            -> TIER_GRAPH_ENDPOINT (not img.pulseem.co.il)
 *   #6 amountDisp (mixed)  -> '₪'+fmt(sample) instead of the raw g.t
 *   #7 sizeG (static text) -> 0 (aligns with server Num(nonNumeric)=0)
 *   #8 gv                  -> returns a SCALAR sample (the {t,s} builder moved
 *                            to the reducer SET_GEO / buildLink geoSlot)
 *   + buildLink adds `gt=stairs`, a text-slot sample `s`, and a pure-token
 *     geo-slot token name `n` — so a URL truncated at the first '#'
 *     (the BEE-canvas preview) is still fully reconstructable from the cfg.
 *   + geometry overrides (geometry contract §2-§5, beyond the POC): optional
 *     `state.barWidth` / `state.gap` and per-tier `barWidth` / `cardWidth` /
 *     `cornerRadius`. All are `undefined` = auto/inherit, NONE is set by
 *     defaultState(), and an absent key reproduces the POC rendering exactly.
 *     computeLayout therefore returns the ARRAYS `barWs` / `cardWs` / `radii`;
 *     the scalar `barW` is REMOVED so a missed call site crashes instead of
 *     silently misrendering.
 * ========================================================================== */

import { actionURL } from '../../../../config'; // ReactCode\src\config\index.js

export const STATE_VERSION = 4;
export const CUR = '₪';

// Exactly 13 colors, in the exact POC order.
export const PALETTE = [
  '#c4cdf2', '#aab6ee', '#8e9ce9', '#7ed98c', '#2bb24c', '#1e7e34', '#ffffff',
  '#fdf0ea', '#fff3cd', '#e0e0e0', '#3b3b6b', '#1f2937', '#dc2626',
];

// Absolute endpoint. In prod actionURL = `https://${host}/Pulseem/`.
// FORBIDDEN: img.pulseem.co.il/tiergraph.png (POC address — has no server impl).
export const TIER_GRAPH_ENDPOINT =
  process.env.REACT_APP_TIER_GRAPH_URL || (actionURL + 'pulseemmonitorgraph.png');

/* ---------------- token helpers ---------------- */
export const isTok = (s) => /##[^#]+##/.test(s || '');
export const pureTok = (s) => /^\s*##[^#]+##\s*$/.test(s || '');
export const tokName = (s) => (s || '').replace(/#/g, '').trim();

// numeric parse: strip everything except digits, dot, minus; NaN -> 0
export const num = (s) => {
  const v = parseFloat(String(s == null ? '' : s).replace(/[^\d.\-]/g, ''));
  return isNaN(v) ? 0 : v;
};

// format: numeric -> toLocaleString('en-US'); non-numeric -> original string
export const fmt = (s) => {
  const v = parseFloat(String(s).replace(/[^\d.\-]/g, ''));
  return isNaN(v) ? String(s) : v.toLocaleString('en-US');
};

// sample value for a geo slot: explicit s, else num(t), else 100000.
// DECLARED DEVIATION #8: POC gv(t,s) returned {t,s}; here it returns a SCALAR.
export const gv = (t, s) => (s != null ? s : (num(t) || 100000));

// height value — DECLARED DEVIATION #7: static non-numeric -> 0
// (POC kept the previous sample height; here it aligns with server Num()=0).
export const sizeG = (g) => (isTok(g.t) ? gv(g.t, g.s) : num(g.t));
export const numG = (g) => sizeG(g);

// bubble display — exactly 4 states:
//  static numeric -> '₪'+fmt(t) ; static text -> t as-is ; pure token ->
//  name·₪fmt(sample) ; mixed token -> '₪'+fmt(sample) [DECLARED DEVIATION #6].
export const amountDisp = (g) => {
  if (!isTok(g.t)) return /\d/.test(g.t) ? CUR + fmt(g.t) : String(g.t);
  const sample = gv(g.t, g.s);
  return pureTok(g.t) ? tokName(g.t) + ' · ' + CUR + fmt(sample) : CUR + fmt(sample);
};

// Auto-highlight: index of the tier the current value is working toward — the smallest tier value
// that is >= the current value; if the value exceeds every tier, the largest tier. This replaces the
// old manual per-tier highlight. Both renderers (React TierGraphStage + C# RenderStairs) MUST use this
// exact rule so the editor preview and the per-recipient sent image agree.
export const autoHighlightIndex = (tierSizes, hereVal) => {
  let idx = -1, best = Infinity;
  for (let i = 0; i < tierSizes.length; i++) {
    if (tierSizes[i] >= hereVal && tierSizes[i] < best) { best = tierSizes[i]; idx = i; }
  }
  if (idx < 0) {
    let mx = -Infinity;
    for (let i = 0; i < tierSizes.length; i++) { if (tierSizes[i] > mx) { mx = tierSizes[i]; idx = i; } }
  }
  return idx;
};

/* ---------------- default state (hard-coded Hebrew content) ---------------- */
export const defaultState = () => ({
  version: 4,
  width: 640, height: 420,
  bg: '#fdf0ea', font: 'Assistant',
  axisMax: 0,                 // 0 = automatic
  progressFill: '#7ed98c',
  tierCountActive: 4,
  tiers: [
    { amount: { t: '##פרס עמודה ראשונה##', s: 120000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'יחיד', cat1: 'פרס טיסה', line2: 'זוגי', cat2: 'פרס משפחות' } },
    { amount: { t: '##פרס עמודה שנייה##', s: 150000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+1', cat2: 'פרס משפחות' } },
    { amount: { t: '##פרס עמודה שלישית##', s: 180000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+2', cat2: 'פרס משפחות' } },
    { amount: { t: '##פרס עמודה רביעית##', s: 240000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+3', cat2: 'פרס משפחות' } },
  ],
  here: { value: { t: '##סכום עדכני של סוכן##', s: 42000 }, text: 'אתה כאן', color: '#2bb24c', show: true },
});

/* ---------------- layout constants (identical in the C# renderer) ---------- */
// A6 (§16b): NaN / ±Infinity / non-numeric mean ABSENT — exactly as the C# renderer
// already treats them. `??` alone is NOT enough: `NaN` is neither null nor undefined,
// so one `parseFloat('abc')` from the panel used to blank the ENTIRE JS preview while
// the PNG rendered fine. Returns `undefined` for "auto / inherit".
// A21c (§16d): EXPORTED so the Dialog reducer shares this exact predicate instead of a
// bare `!= null` — an imported `"gp":"x"` used to write NaN into state there while core
// treated it as absent. One definition, so "absent" cannot mean two different things.
export const geoNum = (v) => {
  const x = typeof v === 'string' ? (v.trim() === '' ? NaN : Number(v)) : v;
  return typeof x === 'number' && isFinite(x) ? x : undefined;
};
// A2 (§16b): §9's clamp, written in C#'s `StairClampInt` ORDER (min first, then max)
// so an INVERTED interval resolves UPPER-BOUND-WINS in both languages (§9 tie-break).
const geoClamp = (v, lo, hi) => { let r = v; if (r < lo) r = lo; if (r > hi) r = hi; return r; };
// H-b: font sizes are the ONE numeric family that never went through geoNum/clamps.
// This is the JS mirror of C#'s `StairSizedFont` (PulseemHandler.cs:2681-2693), which is a
// RANGE GATE, not a clamp: `if (sz >= 6 && sz <= 200) use it;` else the FALLBACK font.
// So `tsz: 300` must render 14 here, NOT 200 — clamping to 200 would trade one divergence
// (300 vs 14) for another (200 vs 14). Junk / NaN / booleans / '' fall back via geoNum, and
// `0` — which used to slip through JS's `|| 17` as the default but makes GDI+ build a
// zero-size font and THROW (→ the recipient gets the built-in demo image) — is now an
// explicit out-of-range fallback rather than an accident of falsiness.
export const fontPx = (v, dflt) => {
  const x = geoNum(v);
  return x != null && x >= 6 && x <= 200 ? x : dflt;
};
// A5 (§16b) + A10 (§16c): the ACTIVE tier count must resolve IDENTICALLY in all three
// places — computeLayout, buildLink and C#. The reducer clamps to [1,4], but
// parseTierGraphUrl sets it from cfg.tiers.length UNCAPPED and C# bails to the built-in
// demo graph outside [1,4]; a hand-edited 5-tier link therefore drew 4 bars in the
// preview, emitted a 5-tier cfg and emailed an unrelated image. ONE expression, used by
// both callers, so they cannot drift. Identical for n in 1..4, so §1 is untouched.
const activeN = (state) => Math.min(4, Math.max(1, Math.round(geoNum(state.tierCountActive) ?? 4)));

export const computeLayout = (state) => {
  // A17 (§16d): W/H are clamped HERE, not only in the reducer — same class as A2.
  // `parseTierGraphUrl` passes `cfg.w` straight through, so a link carrying {"w":1600}
  // used to preview at 1600 and email at 1400 (C# already clamps: StairClampInt(cfg["w"],
  // 1000, 320, 1400) / (…, 600, 320, 900)). A whole-image, 200px divergence.
  // H-c: SANITISED as well as clamped. `geoClamp(undefined|NaN|'abc', ...)` returns its
  // argument untouched (both comparisons are false), so ONE junk `w` used to poison W,
  // usable, totalW, leftStart and every xRight — a BLANK preview against a PNG that
  // renders fine (C# reads `StairClampInt(cfg["w"], <default>, 320, 1400)`, so junk there
  // is simply the default). `?? 640 / ?? 420` are defaultState()'s own numbers, matching
  // `parseTierGraphUrl`'s `?? d.width`, so the two JS entry points agree.
  // H-c: ROUNDED too, reversing F4's "the round is deliberately not copied" — C# does
  // `(int)Math.Round(...)` inside StairClampInt, the reducer already stores integers, so
  // this is inert on every UI path AND on the pinned fixture (800/500) while removing a
  // whole-pixel JS/C# split on a hand-forged fractional `w`. Round BEFORE the clamp, in
  // C#'s order (identical either way — both bounds are integers). The residual is §16c
  // A14's known .5 disagreement (banker's vs half-away), unchanged and still noise.
  const W = geoClamp(Math.round(geoNum(state.width) ?? 640), 320, 1400);
  const H = geoClamp(Math.round(geoNum(state.height) ?? 420), 320, 900);
  const n = activeN(state);
  const marginX = 46;
  const chartTop = 78;
  const chartBottom = H - 152;          // boxH=120 + boxGap=20 + 12
  const plotH = chartBottom - chartTop;
  const usable = W - 92;                // W - 2*marginX
  // Resolution cascade. `??` (nullish) is MANDATORY here — `||` would swallow the
  // legal values gap = 0 and cornerRadius = 0. Override wins, THEN clamp; leftover
  // space is NEVER redistributed into an EXPLICITLY sized tier.
  // A2 (§16b): a SUPPLIED value is clamped to its §9 range HERE, not only in the
  // reducer, so an imported / hand-edited cfg (`{"bwg":400}`) cannot diverge from C#,
  // which already clamps supplied values. An AUTO value is otherwise NOT clamped:
  // C# does not clamp its auto values either (ledger, B5), and clamping them to their
  // §9 FLOORS would move a graph that carries no keys at all (auto barW is legitimately
  // under 24 on no canvas, but auto cardW = barW + 8 is legitimately under the 90px
  // card floor on a small one) — breaking §1's byte-for-byte rule.
  // H-a is the ONE exception, and only on the card's CEILING: see the cardWs site below.
  const autoGap = Math.min(28, usable * 0.05);
  const gapOv = geoNum(state.gap);
  const gap = gapOv == null
    ? autoGap
    : geoClamp(gapOv, 0, n > 1 ? (usable - n * 24) / (n - 1) : 0);         // §9
  // A1 (§16b): the auto tiers share what is LEFT after the explicitly sized ones.
  // Blind to overrides (the frozen §3 rule) one tier at 190 on W=640/n=4 yields
  // totalW 621.55 > usable 548 and the bars spill past the margins.
  // length n even if state.tiers is short — barWs/cardWs/radii are indexed by tier.
  const tiersN = Array.from({ length: n }, (_, i) => state.tiers[i] || {});
  const gBarW = geoNum(state.barWidth);
  // null = this tier is AUTO. Supplied widths are clamped BEFORE being summed so
  // fixedSum is the Σ of the widths actually DRAWN — C# must clamp before summing too.
  const fixedW = tiersN.map((t) => {
    const v = geoNum(t.barWidth) ?? gBarW;
    return v == null ? null : geoClamp(v, 24, 190);                        // §9
  });
  const fixedSum = fixedW.reduce((a, w) => a + (w == null ? 0 : w), 0);
  const freeCount = n - fixedW.filter((w) => w != null).length;
  const autoBarW = freeCount > 0
    ? Math.min(190, Math.max(24, (usable - gap * (n - 1) - fixedSum) / freeCount))
    : Math.min(190, (usable - gap * (n - 1)) / n);
  const barWs = fixedW.map((w) => (w == null ? autoBarW : w));
  const cardWs = tiersN.map((t, i) => {
    const hi = Math.min(barWs[i] + gap, barWs[i] + 84);                    // §9 + tie-break
    const v = geoNum(t.cardWidth);
    // H-a: the AUTO card takes the §9 CEILING too — but NEVER the 90px floor. `barW + 8`
    // exceeds `min(barW + gap, barW + 84)` exactly when gap < 8, which a SUPPLIED gap
    // reaches trivially: typing 0 into the top bar's Gap box on the DEFAULT 640x420 graph
    // gives barW 137, cards 145 and bars that touch — adjacent cards overlapping by 8px.
    // PROVABLY INERT on an override-free graph, which is why only the ceiling is applied:
    // an ABSENT gap is `min(28, usable*0.05)` with usable = W - 92 >= 228 (W >= 320 after
    // the clamp above), so autoGap >= 11.4 > 8 and this `min` cannot bind. Adding the
    // floor instead WOULD move legacy graphs (at W=320,n=4 hi is 59.85 < 90, so §9's
    // upper-bound-wins tie-break would widen a 56.45px auto card to 59.85). Swept.
    if (v == null) return Math.min(barWs[i] + 8, hi);                      // auto: CEILING only
    return geoClamp(v, Math.min(90, hi), hi);
  });
  // A8 (§16c): the radius is clamped by the bar WIDTH, and — the ONE deliberate exception
  // to "clamp supplied values only" — the clamp applies to the DEFAULT 18 as well.
  // SVG clamps `rx` to width/2 implicitly so the browser survives an oversized radius;
  // GDI+ does not, and a diameter > rect.Width emits a self-intersecting path that
  // corrupts the clip region AND the fill. A *supplied* radius was already capped at
  // floor(barW/2) by §9; the default 18 escaped, so any bar 24-35px wide with no `br`
  // broke the PNG. Back-compat is provable, not assumed: the legacy auto bar width
  // bottoms out at 48.45 over the whole clamped (W, n) domain, so floor(barW/2) >= 24
  // > 18 and this clamp CANNOT bind on an override-free graph (swept in the self-test).
  // A6: GDI+ needs an INT radius, so JS must round the same way, in the cascade.
  const radii = tiersN.map((t, i) => geoClamp(
    Math.round(geoNum(t.cornerRadius) ?? 18), 0, Math.min(40, Math.floor(barWs[i] / 2)),  // §9
  ));
  // prefix[k] = Σ barWs[0..k-1] — ascending accumulation, in double. The C# renderer
  // must accumulate in the SAME order and truncate to int only at the draw call.
  const prefix = [0];
  for (let k = 1; k <= n; k++) prefix[k] = prefix[k - 1] + barWs[k - 1];
  const totalW = prefix[n] + gap * (n - 1);
  const leftStart = (W - totalW) / 2;
  const sizes = state.tiers.slice(0, n).map((t) => sizeG(t.amount));
  const axisMax = state.axisMax > 0 ? state.axisMax : Math.max(1, ...sizes) * 1.08;
  // RTL: tier 0 rightmost. Reduces to the old closed form when all widths are equal.
  const xRight = (i) => leftStart + totalW - prefix[i + 1] - gap * i;
  const cardX = (i) => xRight(i) + barWs[i] / 2 - cardWs[i] / 2;   // == bx - 4 when cardW == barW + 8
  const hereY = (v) => chartBottom - (Math.max(0, Math.min(v, axisMax)) / axisMax) * plotH;
  return {
    W, H, n, marginX, chartTop, chartBottom, plotH, usable, gap,
    barWs, cardWs, radii,                 // scalar `barW` is intentionally GONE
    totalW, leftStart, sizes, axisMax, xRight, cardX, hereY,
  };
};
// fixed extras: boxH=120, boxGap=20, bar rx = radii[i] (default 18), bubble min 94x34, dash '8 6'

/* ---------------- Stage radius helpers — THE single source (A19 §16d) --------
 * These two expressions are the WHOLE of the Stage's radius arithmetic and they are a
 * PARITY SURFACE: C# computes the same integers with integer division over an already
 * integerised barTop — `Math.Min(radius, barH / 2)` (:3047) and
 * `Math.Min(radius + 3, (barH + 6) / 2)` (:3078).
 * They live HERE and not in TierGraphStage.jsx because a formula RE-DECLARED inside the
 * self-test only restates the implementation: before this, deleting the `Math.floor` from
 * the Stage left every A6/A9 assertion green. Stage and self-test now call the same export,
 * so the assertions pin the shipped code instead of describing it.
 * `barTopFloat` is the exact float y the rect is drawn at — the integerisation is applied
 * to the RADIUS only, never to the rect (R1 A6: C# cannot avoid integerising barTop because
 * GDI+ takes a `Rectangle`; moving the rect itself would shift every bar by a sub-pixel).
 * NEITHER takes a width: A8 guarantees `radius_i <= floor(barW_i/2)`, hence
 * `radius_i + 3 <= (barW_i + 6)/2`, so the width leg holds automatically on both rects
 * (swept in the self-test, not assumed). If A8 is ever weakened, both need a width leg.
 */
export const clipRx = (radius, barTopFloat, chartBottom) =>
  Math.min(radius, Math.floor((chartBottom - Math.floor(barTopFloat)) / 2));
export const ringRx = (radius, barTopFloat, chartBottom) =>
  Math.min(radius + 3, Math.floor((chartBottom - Math.floor(barTopFloat) + 6) / 2));

/* ---------------- link / cfg contract (plan §5 — the binding source) ------- */
export const b64url = (s) =>
  btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

// Returns { url, imgTag }. Param order is FIXED: gt first, cfg second, then p1..pN.
export const buildLink = (state) => {
  let pCounter = 1;
  // pN values are URL-ENCODED so ANY token content — Hebrew, spaces, punctuation — rides safely
  // inside the image URL (a raw ## + spaces would be an invalid URL and could be mangled on export).
  // The C# renderer reads pN already %xx-decoded and treats a value still containing '##' as an
  // un-replaced token (preview → sample). At send, the sender maps the token to a source column and
  // writes the recipient's URL-encoded value into pN. See buildTierGraphRow / SendScreen contract.
  const params = [];

  const geoSlot = (g) => {                // height slot (here.value, tiers[i].amount)
    if (!isTok(g.t)) return { v: String(g.t) };
    const slot = { dyn: 'p' + pCounter, s: gv(g.t, g.s) };
    if (pureTok(g.t)) slot.n = tokName(g.t);       // token name for the preview bubble
    params.push('p' + (pCounter++) + '=' + encodeURIComponent(g.t)); // URL-safe token (any content)
    return slot;
  };

  const txtSlot = (t) => {                // text slot (here.text, box.c1/c2/l1/l2)
    if (!isTok(t)) return { v: String(t) };
    const slot = { dyn: 'p' + pCounter, s: String(t).replace(/#/g, '') }; // preview sample
    params.push('p' + (pCounter++) + '=' + encodeURIComponent(t));   // URL-safe token (any content)
    return slot;
  };

  // Evaluation order is deterministic (JS evaluates object literals in source
  // order): here.v -> here.t -> per active tier: a -> box.c1 -> c2 -> l1 -> l2.
  const cfg = {
    w: state.width, h: state.height, bg: state.bg, font: state.font,
    axisMax: state.axisMax, pg: state.progressFill,
    // G: global geometry overrides. `!= null` — NOT the truthy guard used by the
    // size keys below — because gap = 0 is a legal user choice and truthy drops it.
    ...(state.barWidth != null ? { bwg: state.barWidth } : {}),
    ...(state.gap != null ? { gp: state.gap } : {}),
    here: {
      show: state.here.show, color: state.here.color,
      v: geoSlot(state.here.value), t: txtSlot(state.here.text),
      ...(state.here.textSize ? { tsz: state.here.textSize } : {}),   // D: pill font size
    },
    // A10 (§16c): the SAME clamped count computeLayout uses — slicing the RAW
    // tierCountActive emitted a 5-tier cfg for a preview that drew 4 bars, and C#
    // answers an out-of-range tier count with the built-in demo graph.
    tiers: state.tiers.slice(0, activeN(state)).map((tr) => ({
      fill: tr.fill, lc: tr.labelColor,
      a: geoSlot(tr.amount),
      ...(tr.amountSize ? { asz: tr.amountSize } : {}),               // D: amount font size
      // G: per-tier geometry. PLAIN SCALARS — never geoSlot/txtSlot, which would
      // bump pCounter and renumber every pN in already-sent URLs. `!= null` guard:
      // cornerRadius = 0 (square corners) is legal and truthy would drop it.
      ...(tr.barWidth != null ? { bw: tr.barWidth } : {}),
      ...(tr.cardWidth != null ? { cw: tr.cardWidth } : {}),
      ...(tr.cornerRadius != null ? { br: tr.cornerRadius } : {}),
      box: {
        f: tr.box.fill, tc: tr.box.textColor, ac: tr.box.accent,
        c1: txtSlot(tr.box.cat1), c2: txtSlot(tr.box.cat2),
        l1: txtSlot(tr.box.line1), l2: txtSlot(tr.box.line2),
        ...(tr.box.row1Show === false ? { r1: 0 } : {}),              // E: hide row 1
        ...(tr.box.row2Show === false ? { r2: 0 } : {}),              // E: hide row 2
        ...(tr.box.line1Size ? { l1sz: tr.box.line1Size } : {}),      // D: per-field font sizes
        ...(tr.box.cat1Size ? { c1sz: tr.box.cat1Size } : {}),
        ...(tr.box.line2Size ? { l2sz: tr.box.line2Size } : {}),
        ...(tr.box.cat2Size ? { c2sz: tr.box.cat2Size } : {}),
        ...(tr.box.dotShape && tr.box.dotShape !== 'circle' ? { ds: tr.box.dotShape } : {}),  // accent shape
      },
    })),
  };

  // `c` is the product's existing editor/recipient discriminator, already load-bearing for the pie
  // and roundedbar graphs on the same endpoint: Scripts/global.js emits it into every graph URL,
  // and the sender and PreviewCampaign.aspx.cs both rewrite the literal to the real ClientID
  // unconditionally before the image is ever fetched for a person. The server keeps the design-time
  // sample ONLY while the literal survives; a real id — or no `c` at all — is a recipient and gets 0.
  // POSITION: kept ahead of the pN params, matching how global.js orders it for the pie graphs.
  const url = TIER_GRAPH_ENDPOINT + '?gt=stairs&cfg=' + b64url(JSON.stringify(cfg))
    + '&c=ClientIDReplaceFromEditor'
    + (params.length ? '&' + params.join('&') : '');
  const imgTag = '<img src="' + url + '" alt="גרף התקדמות" width="' + state.width + '" />';
  return { url, imgTag };
};

// Inverse of buildLink: an image URL -> a graph state (version 4), or null if it
// cannot be parsed. Used by "load from link" so an existing graph can be re-edited.
// MUST stay in sync with buildLink's cfg shape (w/h/bg/font/axisMax/pg/bwg/gp/here/tiers,
// slot {v} | {dyn,s[,n]}, tier {bw,cw,br}, box {f,tc,ac,c1,c2,l1,l2}, here {show,color,v,t}).
// It is the EXACT inverse: an absent geometry key parses to `undefined`, so a
// re-emit produces a byte-identical cfg.
export const parseTierGraphUrl = (url) => {
  try {
    const u = String(url || '');
    const cfgMatch = u.match(/[?&]cfg=([^&]+)/);
    if (!cfgMatch) return null;
    let b64 = cfgMatch[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const cfg = JSON.parse(decodeURIComponent(escape(atob(b64))));

    // pN params — buildLink URL-encodes the token, so decode it back to the literal ##...## here.
    const params = {};
    u.split('&').forEach((kv) => {
      const m = kv.match(/^p(\d+)=(.*)$/);
      if (m) {
        let val = m[2];
        try { val = decodeURIComponent(m[2]); } catch (e) { /* malformed — keep raw */ }
        params['p' + m[1]] = val;
      }
    });

    const d = defaultState();
    // height slot -> { t, s }
    const geo = (slot) => {
      if (slot && slot.dyn) {
        const raw = params[slot.dyn];
        const has = raw != null && raw !== '';
        // A URL copied out of a SENT email carries ONE recipient's own value in pN (e.g. '35000'),
        // not a token. Importing it verbatim made buildLink emit `{ v: '35000' }` — a STATIC slot,
        // which the server returns at its `v != null` line, UPSTREAM of every policy fix there —
        // turning one agent's personal figure into a hard-coded constant for the whole campaign.
        // Recover the original token from slot.n, where buildLink stored it for exactly this kind
        // of recovery. A MIXED token ('בונוס ##X##') has no `n`, so it clears VISIBLY — an empty
        // amount field in the editor — rather than silently keeping a stranger's number.
        if (has && isTok(raw)) return { t: raw, s: slot.s };
        if (slot.n) return { t: '##' + slot.n + '##', s: slot.s }; // recover a pure token from a truncated URL
        if (has) return { t: '', s: slot.s };
      }
      return { t: String(slot && slot.v != null ? slot.v : ''), s: undefined };
    };
    // text slot -> string
    const txt = (slot) => {
      if (slot && slot.dyn && params[slot.dyn] != null && params[slot.dyn] !== '') return params[slot.dyn];
      return String(slot && slot.v != null ? slot.v : '');
    };

    const g = {
      version: 4,
      // H-c: `geoNum(...) ?? d.width` — NOT `||`. A legitimate `{"w":0}` used to parse as
      // 640 and preview at 640 while C# clamped the same 0 to its 320 floor, and a junk
      // `{"w":"abc"}` used to be handed through verbatim. `0` now survives as `0` and is
      // clamped to 320 by computeLayout, exactly as C# does; junk becomes the default.
      width: geoNum(cfg.w) ?? d.width, height: geoNum(cfg.h) ?? d.height,
      bg: cfg.bg || d.bg, font: cfg.font || d.font,
      axisMax: cfg.axisMax || 0, progressFill: cfg.pg || d.progressFill,
      barWidth: cfg.bwg, gap: cfg.gp,          // G: no `||` default — absent MUST stay undefined
      tierCountActive: Array.isArray(cfg.tiers) && cfg.tiers.length ? cfg.tiers.length : d.tierCountActive,
      tiers: (Array.isArray(cfg.tiers) ? cfg.tiers : []).map((tr) => {
        const box = tr.box || {};
        return {
          amount: geo(tr.a),
          fill: tr.fill || d.tiers[0].fill,
          labelColor: tr.lc || d.tiers[0].labelColor,
          amountSize: tr.asz,                                          // D
          barWidth: tr.bw, cardWidth: tr.cw, cornerRadius: tr.br,       // G: stay undefined when absent
          box: {
            fill: box.f || d.tiers[0].box.fill,
            textColor: box.tc || d.tiers[0].box.textColor,
            accent: box.ac || d.tiers[0].box.accent,
            cat1: txt(box.c1), cat2: txt(box.c2),
            line1: txt(box.l1), line2: txt(box.l2),
            row1Show: box.r1 !== 0, row2Show: box.r2 !== 0,            // E
            line1Size: box.l1sz, cat1Size: box.c1sz,                  // D
            line2Size: box.l2sz, cat2Size: box.c2sz,
            dotShape: box.ds || 'circle',                            // accent shape
          },
        };
      }),
      here: {
        show: !!(cfg.here && cfg.here.show),
        color: (cfg.here && cfg.here.color) || d.here.color,
        value: geo(cfg.here && cfg.here.v),
        text: txt(cfg.here && cfg.here.t),
        textSize: cfg.here && cfg.here.tsz,                            // D: pill font size
      },
    };
    if (!g.tiers.length) return null; // no tiers -> not a valid graph URL
    // pad up to 4 tiers so the count segment can grow during editing (like SET_TIER_COUNT)
    while (g.tiers.length < 4) g.tiers.push(JSON.parse(JSON.stringify(d.tiers[g.tiers.length % 4])));
    return g;
  } catch (e) {
    return null;
  }
};

// measureTextFactory: canvas 2d context, font = `${weight} ${size}px Assistant, Heebo, Arial, sans-serif`.
// The stack MUST match the SVG render font (TierGraphStage) or bubble/label widths mis-size.
// Only call in a browser (uses document); never invoked at import time.
export const measureTextFactory = () => {
  const ctx = document.createElement('canvas').getContext('2d');
  return (text, size, weight) => {
    ctx.font = weight + ' ' + size + 'px Assistant, Heebo, Arial, sans-serif';
    return ctx.measureText(String(text)).width;
  };
};
