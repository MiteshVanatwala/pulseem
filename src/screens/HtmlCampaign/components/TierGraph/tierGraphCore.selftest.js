/* ============================================================================
 * tierGraphCore.selftest.js — node self-test for the pure core (plan §3.9).
 * Run: `node tierGraphCore.selftest.js` (ESM) — or run the same assertions
 * under jest if the executor has react-scripts.
 *
 * Provides a LOCAL btoa/atob polyfill (test file only — the module is NOT
 * modified). Exits non-zero on the first failed batch so it is CI-usable.
 * ========================================================================== */

// --- local base64 polyfill (node) — does not touch the module ---------------
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
}
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (b) => Buffer.from(b, 'base64').toString('binary');
}

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  amountDisp, num, fmt, gv, sizeG, numG, isTok, pureTok, tokName,
  defaultState, computeLayout, buildLink, b64url, PALETTE, STATE_VERSION,
  parseTierGraphUrl, autoHighlightIndex,
  // A19 (§16d): the Stage's radius arithmetic, imported — NOT re-declared below.
  clipRx, ringRx,
  // A21c (§16d): exported so the Dialog reducer can share it.
  geoNum,
  // H-b: the shared [6,200]-else-fallback font gate the Stage renders with.
  fontPx,
} from './tierGraphCore.js';

/* THIS FILE IS ALSO A JEST MODULE. `tierGraphCore.selftest.test.js` (beside it) imports it, which
   runs every assertion below at import time and then fails the run on a non-zero count — that is
   the only way the suite actually executes in this repo (`node tierGraphCore.selftest.js` needs
   `"type":"module"` in package.json, and `.selftest.js` matches no CRA `testMatch`).
   Two consequences, both handled here and nowhere else — no assertion changes:
   1. `import.meta.url` is GONE. Jest compiles this module to CommonJS, where `import.meta` is a
      hard syntax error — the file would not even parse. `__dirname` is what that transform gives;
      the cwd candidates keep a plain ESM/script run working from the repo root or the folder
      itself. First candidate that actually reads wins (A19 asserts that one of them did).
   2. `process.exit` is not called under jest — it would kill the worker mid-suite. */
const UNDER_JEST = typeof jest !== 'undefined'
  || (typeof process !== 'undefined' && !!(process.env && process.env.JEST_WORKER_ID));
const CANDIDATE_DIRS = [];
if (typeof __dirname !== 'undefined') CANDIDATE_DIRS.push(__dirname);
if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  CANDIDATE_DIRS.push(process.cwd());
  CANDIDATE_DIRS.push(join(process.cwd(), 'src', 'screens', 'HtmlCampaign', 'components', 'TierGraph'));
}
const readBeside = (file) => {
  for (let i = 0; i < CANDIDATE_DIRS.length; i += 1) {
    try { return readFileSync(join(CANDIDATE_DIRS[i], file), 'utf8'); } catch (e) { /* next candidate */ }
  }
  return '';
};

let failures = 0;
let assertions = 0;      // exported below, so the jest wrapper can prove the suite RAN, not just
const failureLog = [];   // that nothing failed. The wrapper prints THESE, not 243 ok lines.
const eq = (label, got, want) => {
  assertions++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    failures++;
    failureLog.push(label + '\n   got : ' + JSON.stringify(got) + '\n   want: ' + JSON.stringify(want));
    console.error('FAIL', label, '\n   got :', JSON.stringify(got), '\n   want:', JSON.stringify(want));
  } else if (!UNDER_JEST) console.log('ok  ', label);
};
const ok = (label, cond) => {
  assertions++;
  if (!cond) { failures++; failureLog.push(label); console.error('FAIL', label); }
  else if (!UNDER_JEST) console.log('ok  ', label);
};

// decode a b64url cfg back to an object (mirror of the module's b64url encode)
const decodeCfg = (b64) => {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return JSON.parse(decodeURIComponent(escape(atob(s))));
};

/* ---------------- constants ---------------- */
eq('STATE_VERSION', STATE_VERSION, 4);
eq('PALETTE length', PALETTE.length, 13);
eq('PALETTE[0]/[12]', [PALETTE[0], PALETTE[12]], ['#c4cdf2', '#dc2626']);

/* ---------------- token helpers ---------------- */
ok('isTok mixed', isTok('בונוס ##X##'));
ok('pureTok true', pureTok('  ##ExtraField1##  '));
ok('pureTok false on mixed', !pureTok('שלום ##X##'));
eq('tokName', tokName('##ExtraField7##'), 'ExtraField7');

/* ---------------- num / fmt ---------------- */
eq('num empty', num(''), 0);
eq('num hebrew', num('פרס'), 0);
eq('num commas', num('1,234'), 1234);
eq('num null', num(null), 0);
eq('fmt empty', fmt(''), '');
eq('fmt hebrew', fmt('פרס יוקרה'), 'פרס יוקרה');
eq('fmt number', fmt('120000'), '120,000');
eq('fmt decimal', fmt('1234567.5'), '1,234,567.5');

/* ---------------- gv (scalar — deviation #8) ---------------- */
eq('gv explicit s', gv('##X##', 5000), 5000);
eq('gv from t', gv('7500', undefined), 7500);
eq('gv fallback', gv('##X##', undefined), 100000);
ok('gv is scalar', typeof gv('##X##', 5000) === 'number');

/* ---------------- sizeG (deviation #7) ---------------- */
eq('sizeG static numeric', sizeG({ t: '120000' }), 120000);
eq('sizeG static text -> 0', sizeG({ t: 'פרס יוקרה' }), 0);
eq('sizeG token+s', sizeG({ t: '##X##', s: 5000 }), 5000);
eq('sizeG token no s', sizeG({ t: '##X##' }), 100000);
eq('numG == sizeG', numG({ t: '##X##', s: 5000 }), 5000);

/* ---------------- amountDisp (4 states, deviation #6) ---------------- */
eq('amountDisp static numeric', amountDisp({ t: '120000' }), '₪120,000');
eq('amountDisp static text', amountDisp({ t: 'פרס יוקרה' }), 'פרס יוקרה');
eq('amountDisp pure token', amountDisp({ t: '##ExtraField1##', s: 100000 }), 'ExtraField1 · ₪100,000');
eq('amountDisp mixed token', amountDisp({ t: 'בונוס ##ExtraField1##', s: 100000 }), '₪100,000');

/* ---------------- computeLayout ---------------- */
const L = computeLayout(defaultState());
eq('layout chartBottom', L.chartBottom, defaultState().height - 152);
eq('layout chartTop', L.chartTop, 78);
const autoBarW4 = Math.min(190, (defaultState().width - 92 - L.gap * 3) / 4);
eq('layout barWs cap (all tiers)', L.barWs, [autoBarW4, autoBarW4, autoBarW4, autoBarW4]);
eq('layout cardWs default = barW + 8', L.cardWs, L.barWs.map((b) => b + 8));
eq('layout radii default 18', L.radii, [18, 18, 18, 18]);
ok('scalar barW REMOVED from return (contract §4)', !('barW' in L));
eq('layout return key set', Object.keys(L).sort(), [
  'H', 'W', 'axisMax', 'barWs', 'cardWs', 'cardX', 'chartBottom', 'chartTop', 'gap',
  'hereY', 'leftStart', 'marginX', 'n', 'plotH', 'radii', 'sizes', 'totalW', 'usable', 'xRight',
]);
ok('hereY clamps low', Math.abs(L.hereY(-100) - L.chartBottom) < 1e-9);
ok('hereY clamps high', Math.abs(L.hereY(L.axisMax * 5) - L.chartTop) < 1e-9);
ok('axisMax floor 1', computeLayout({ ...defaultState(), tiers: [{ amount: { t: '0' } }], tierCountActive: 1, axisMax: 0 }).axisMax >= 1);

/* -------- geometry cascade: no overrides == today's closed form (n = 1..4) -------- */
// The highest-value parity test: prefix-sum xRight must reproduce the OLD formula
// `leftStart + totalW - barW - (barW + gap) * i` exactly when all widths are equal.
[1, 2, 3, 4].forEach((n) => {
  const sN = defaultState(); sN.tierCountActive = n;
  const LN = computeLayout(sN);
  const gapN = Math.min(28, (sN.width - 92) * 0.05);
  const barWN = Math.min(190, (sN.width - 92 - gapN * (n - 1)) / n);
  const totalN = barWN * n + gapN * (n - 1);
  const leftN = (sN.width - totalN) / 2;
  eq('n=' + n + ' gap == auto', LN.gap, gapN);
  eq('n=' + n + ' barWs all == old scalar barW', LN.barWs, Array(n).fill(barWN));
  eq('n=' + n + ' barWs/cardWs/radii length', [LN.barWs.length, LN.cardWs.length, LN.radii.length], [n, n, n]);
  ok('n=' + n + ' totalW == old closed form', Math.abs(LN.totalW - totalN) < 1e-9);
  ok('n=' + n + ' leftStart == old closed form', Math.abs(LN.leftStart - leftN) < 1e-9);
  for (let i = 0; i < n; i++) {
    ok('n=' + n + ' xRight(' + i + ') == old closed form',
      Math.abs(LN.xRight(i) - (leftN + totalN - barWN - (barWN + gapN) * i)) < 1e-9);
    // cardX reduces to today's `bx - 4` exactly when cardW == barW + 8
    ok('n=' + n + ' cardX(' + i + ') == xRight - 4', Math.abs(LN.cardX(i) - (LN.xRight(i) - 4)) < 1e-9);
  }
});

/* -------- geometry cascade: overrides win, no redistribution -------- */
const sOv = defaultState();
sOv.gap = 0; sOv.barWidth = 100;             // 0 must survive — `??` not `||`
sOv.tiers[1].barWidth = 60;
sOv.tiers[2].cardWidth = 200;
sOv.tiers[3].cornerRadius = 0;               // 0 must survive
const LOv = computeLayout(sOv);
eq('override gap 0 survives (?? not ||)', LOv.gap, 0);
eq('override global barWidth + per-tier win', LOv.barWs, [100, 60, 100, 100]);
// §16b A2 CHANGED THIS EXPECTATION ONCE: cardWidth 200 on a 100px bar with gap 0 is OUTSIDE
// §9's range (hi = min(barW+gap, barW+84) = 100), and computeLayout clamps SUPPLIED values
// exactly as C# does. Pre-A2 it read [108, 68, 200, 108] — a 100px JS/C# split.
// H-a CHANGES IT AGAIN, and for the same class of bug one field over: this fixture supplies
// `gap: 0`, so the three AUTO cards (barW + 8) each sat 8px past their own §9 ceiling and
// OVERLAPPED their neighbours. They now take the ceiling too: [100, 60, 100, 100].
// This is an OVERRIDE fixture (gap is supplied), so §1 is not in scope — the three §1
// guards (pre-change base64 fixture, p1..p8 byte-identity, the auto-cascade sweep) are
// untouched and still pass unretuned. Nothing but a supplied gap < 8 can move an auto card.
eq('override cardWidth wins, clamped to §9 (A2); AUTO cards take the ceiling (H-a)',
  LOv.cardWs, [100, 60, 100, 100]);
ok('H-a an auto card never exceeds min(barW+gap, barW+84) — no adjacent-card overlap',
  LOv.cardWs.every((c, i) => c <= Math.min(LOv.barWs[i] + LOv.gap, LOv.barWs[i] + 84) + 1e-9));
ok('H-a an auto card is never NARROWER than its bar (the 90px floor is NOT applied)',
  LOv.cardWs.every((c, i) => c >= LOv.barWs[i] - 1e-9));
eq('override cornerRadius 0 survives', LOv.radii, [18, 18, 18, 0]);
eq('override totalW = Σ barWs + gap*(n-1)', LOv.totalW, 360);
ok('no redistribution — tier0 unaffected by tier1 override', LOv.barWs[0] === 100);

/* -------- A1 (§16b): an explicit width shrinks the AUTO tiers, never overflows ---- */
const sA1 = defaultState();                    // W 640 -> usable 548, auto gap 28
sA1.tiers[0].barWidth = 190;                   // one fixed tier, three auto
const LA1 = computeLayout(sA1);
const gapA1 = Math.min(28, 548 * 0.05);
eq('A1 the fixed tier keeps its width', LA1.barWs[0], 190);
ok('A1 auto tiers share the REMAINDER',
  Math.abs(LA1.barWs[1] - (548 - gapA1 * 3 - 190) / 3) < 1e-9);
ok('A1 auto tiers stay equal to each other',
  LA1.barWs[1] === LA1.barWs[2] && LA1.barWs[2] === LA1.barWs[3]);
ok('A1 totalW <= usable (pre-A1: 621.55 > 548, bars spilled)', LA1.totalW <= LA1.usable + 1e-9);
ok('A1 no longer equals the override-blind §3 autoBarW (116)', Math.abs(LA1.barWs[1] - 116) > 1);
const sA1f = defaultState(); sA1f.barWidth = 24;   // freeCount 0 -> the fallback branch
eq('A1 freeCount==0 fallback still resolves', computeLayout(sA1f).barWs, [24, 24, 24, 24]);

/* -------- A2 (§16b): imported / hand-edited out-of-range values are clamped ------- */
const sA2 = defaultState(); sA2.barWidth = 400; sA2.gap = 999;   // e.g. a hand-forged cfg
const LA2 = computeLayout(sA2);
eq('A2 global barWidth 400 -> 190 (was a 210px JS/C# divergence)', LA2.barWs, [190, 190, 190, 190]);
eq('A2 gap 999 -> (usable - n*24)/(n-1)', LA2.gap, (548 - 4 * 24) / 3);
const sA2b = defaultState();
sA2b.tiers[0].barWidth = 1; sA2b.tiers[1].cardWidth = 9999;
sA2b.tiers[2].cornerRadius = 500; sA2b.tiers[3].cornerRadius = -7;
const LA2b = computeLayout(sA2b);
eq('A2 per-tier barWidth 1 -> 24 floor', LA2b.barWs[0], 24);
ok('A2 cardWidth -> min(barW + gap, barW + 84)',
  LA2b.cardWs[1] === Math.min(LA2b.barWs[1] + LA2b.gap, LA2b.barWs[1] + 84));
eq('A2 cornerRadius 500 -> min(40, floor(barW/2))', LA2b.radii[2], Math.min(40, Math.floor(LA2b.barWs[2] / 2)));
eq('A2 cornerRadius -7 -> 0', LA2b.radii[3], 0);
const sA2c = defaultState(); sA2c.width = 320;   // n=4 -> cardWidth hi ~59.85 < lo 90
sA2c.tiers[0].cardWidth = 300; sA2c.tiers[1].cardWidth = 10;
const LA2c = computeLayout(sA2c);
const hiA2c = Math.min(LA2c.barWs[0] + LA2c.gap, LA2c.barWs[0] + 84);
ok('A2 inverted cardWidth interval -> UPPER bound wins, from both sides',
  hiA2c < 90 && Math.abs(LA2c.cardWs[0] - hiA2c) < 1e-9 && Math.abs(LA2c.cardWs[1] - hiA2c) < 1e-9);

/* -------- A5 (§16b): n resolves to [1,4] here too, not just in the reducer -------- */
const sA5 = defaultState(); sA5.tierCountActive = 9;   // parseTierGraphUrl is uncapped
eq('A5 n clamps high to 4', computeLayout(sA5).n, 4);
eq('A5 arrays follow the clamped n', [computeLayout(sA5).barWs.length,
  computeLayout(sA5).cardWs.length, computeLayout(sA5).radii.length], [4, 4, 4]);
const sA5b = defaultState(); sA5b.tierCountActive = 0;
eq('A5 n clamps low to 1', computeLayout(sA5b).n, 1);
eq('A5 n=4 (default) is unchanged', computeLayout(defaultState()).n, 4);

/* -------- A6 (§16b): NaN is ABSENT; cornerRadius rounds to an int ---------------- */
const sA6 = defaultState();
sA6.barWidth = NaN; sA6.gap = NaN;               // one parseFloat('abc') used to blank ALL
sA6.tiers[0].barWidth = NaN; sA6.tiers[0].cardWidth = NaN; sA6.tiers[0].cornerRadius = NaN;
sA6.tiers[1].cornerRadius = 12.5; sA6.tiers[2].cornerRadius = 12.4;
const LA6 = computeLayout(sA6);
const LClean = computeLayout(defaultState());
eq('A6 NaN everywhere == no keys at all', [LA6.gap, LA6.barWs, LA6.cardWs],
  [LClean.gap, LClean.barWs, LClean.cardWs]);
ok('A6 no NaN leaks into any layout number',   // JSON.stringify(NaN) === 'null'
  !JSON.stringify([LA6.gap, LA6.barWs, LA6.cardWs, LA6.radii, LA6.totalW, LA6.leftStart,
    [0, 1, 2, 3].map((i) => LA6.xRight(i)), [0, 1, 2, 3].map((i) => LA6.cardX(i))]).includes('null'));
eq('A6 cornerRadius rounds to an int (GDI+)', [LA6.radii[1], LA6.radii[2]], [13, 12]);
ok('A6 every radius is an integer', LA6.radii.every((r) => Number.isInteger(r)));
// Stage mirror (A6): the clip radius floors an INTEGER bar height, because C# must
// integerise barTop (GDI+ Rectangle). A19 (§16d): this now calls the EXPORTED `clipRx`,
// the same expression TierGraphStage.jsx renders with — the old inline copy passed even
// with the Math.floor deleted from the Stage.
const barTopS = LClean.hereY(LClean.sizes[0]);
ok('A6 Stage clip radius is taken over an integer bar height',
  Number.isInteger(LClean.chartBottom - Math.floor(barTopS))
  && clipRx(LClean.radii[0], barTopS, LClean.chartBottom) === 18);

/* -------- A8 (§16c): the radius clamp by bar WIDTH applies to the DEFAULT too ----- */
// GDI+ receives diameter > rect.Width and emits a self-intersecting path; SVG hides it
// by clamping rx to width/2 implicitly. Trigger: any bar 24-35px wide with NO `br`.
const sA8 = defaultState();
sA8.tiers[0].barWidth = 24;                     // no cornerRadius -> the default 18
const LA8 = computeLayout(sA8);
eq('A8 a 24px bar defaults to radius 12, not 18', LA8.radii[0], 12);
ok('A8 the other (auto, wide) tiers keep 18', LA8.radii.slice(1).every((r) => r === 18));
// the whole trigger window: every width in [24,35] must yield floor(bw/2), i.e. < 18
let a8Win = 0;
for (let bw = 24; bw <= 35; bw++) {
  const sW8 = defaultState(); sW8.tiers[0].barWidth = bw;
  if (computeLayout(sW8).radii[0] !== Math.floor(bw / 2)) a8Win++;
}
eq('A8 bar widths 24..35 all clamp the default to floor(barW/2)', a8Win, 0);
const sA8b = defaultState(); sA8b.tiers[0].barWidth = 36;
eq('A8 the clamp stops binding at 36 (floor(36/2) == 18)', computeLayout(sA8b).radii[0], 18);
// BACK-COMPAT PROOF: the legacy auto bar width bottoms out at 48.45 over the whole
// clamped (W, n) domain, so floor(barW/2) >= 24 > 18 and the clamp can NEVER bind
// without an override. The §1 sweep below re-asserts radii === 18 for every auto graph.
let minAutoBar = Infinity;
for (let w = 320; w <= 1400; w += 10) {
  for (let nn = 1; nn <= 4; nn++) {
    const sW = defaultState(); sW.width = w; sW.tierCountActive = nn;
    minAutoBar = Math.min(minAutoBar, ...computeLayout(sW).barWs);
  }
}
ok('A8 min auto bar width over W 320..1400 x n 1..4 is 48.45 (>= 36)',
  Math.abs(minAutoBar - 48.45) < 1e-9 && Math.floor(minAutoBar / 2) >= 18);
const sA8c = defaultState(); sA8c.width = 320;   // n=4 -> the 48.45 auto bar itself
eq('A8 a 48.45px auto bar still yields exactly 18', computeLayout(sA8c).radii, [18, 18, 18, 18]);
// A8 is what lets A9 skip a width-leg cap on the ring: radius + 3 <= (barW + 6)/2.
let a8Guard = 0;
for (let w = 320; w <= 1400; w += 40) {
  for (let bw = 24; bw <= 190; bw += 2) {
    const sG = defaultState(); sG.width = w; sG.barWidth = bw;
    sG.tiers[0].cornerRadius = 400; sG.tiers[1].cornerRadius = 40;   // maximal radii
    const LG = computeLayout(sG);
    for (let i = 0; i < LG.n; i++) {
      if (LG.radii[i] > Math.floor(LG.barWs[i] / 2)) a8Guard++;
      if (LG.radii[i] + 3 > (LG.barWs[i] + 6) / 2) a8Guard++;
    }
  }
}
eq('A8 radius <= floor(barW/2) always -> ring rx+3 <= (barW+6)/2 (A9 width leg)', a8Guard, 0);

/* -------- A9 (§16c): the ring radius is capped over the same INTEGER bar height --- */
// Stage mirror of C#'s `Math.Min(radius + 3, (barH + 6) / 2)`. SVG clamps rx and ry
// INDEPENDENTLY, so an uncapped rx draws an ELLIPSE where the PNG draws a circle.
// A19 (§16d): `ringRx` is now the module's EXPORT — the local re-declaration that used to
// sit here made all five assertions below pass against a Stage with its Math.floor deleted.
const ringOf = (LL, i) => ringRx(LL.radii[i], LL.hereY(LL.sizes[i]), LL.chartBottom);
const sA9 = defaultState();
sA9.tierCountActive = 2;
sA9.tiers[0].amount = { t: '1000' }; sA9.tiers[1].amount = { t: '100000' };  // a very short bar
sA9.tiers[0].barWidth = 190; sA9.tiers[0].cornerRadius = 40;                 // + a large radius
const LA9 = computeLayout(sA9);
const barTop9 = LA9.hereY(LA9.sizes[0]);
const barHInt9 = LA9.chartBottom - Math.floor(barTop9);
eq('A9 short bar + radius 40 -> ring rx capped at floor((barH+6)/2)',
  [LA9.radii[0], barHInt9, ringOf(LA9, 0)], [40, 2, 4]);
ok('A9 the cap actually binds (uncapped rx would be 43 — a 39px ellipse/circle split)',
  ringOf(LA9, 0) < LA9.radii[0] + 3);
ok('A9 capped rx is within 2px of the height SVG would clamp ry to',
  Math.abs(ringOf(LA9, 0) - (LA9.chartBottom - barTop9 + 6) / 2) <= 2);
ok('A9 tall bar is UNAFFECTED — the cap is inert (byte-identical to today)',
  ringOf(LA9, 1) === LA9.radii[1] + 3);
let a9Drift = 0;                       // default graph: the cap must never bind
const LA9d = computeLayout(defaultState());
for (let i = 0; i < LA9d.n; i++) if (ringOf(LA9d, i) !== LA9d.radii[i] + 3) a9Drift++;
eq('A9 default graph ring radius unchanged (radii[i] + 3)', a9Drift, 0);
// the exported helpers must equal the C# SPEC, written out here in C#'s own spelling:
// `Math.Min(radius, barH / 2)` (:3047) and `Math.Min(radius + 3, (barH + 6) / 2)` (:3078),
// both integer division over the already-integerised barH. This is the one place the
// formula may be restated — it pins the shared export to the other language, not to itself.
const bhSpec = (LL, i) => LL.chartBottom - Math.floor(LL.hereY(LL.sizes[i]));
ok('A9/A6 clipRx == C# Math.Min(radius, barH/2) over the integer barH',
  [LA9, LA9d].every((LL) => [0, 1].every((i) => i >= LL.n
    || clipRx(LL.radii[i], LL.hereY(LL.sizes[i]), LL.chartBottom)
       === Math.min(LL.radii[i], Math.floor(bhSpec(LL, i) / 2)))));
ok('A9 ringRx == C# Math.Min(radius + 3, (barH + 6)/2) over the integer barH',
  [LA9, LA9d].every((LL) => [0, 1].every((i) => i >= LL.n
    || ringOf(LL, i) === Math.min(LL.radii[i] + 3, Math.floor((bhSpec(LL, i) + 6) / 2)))));

/* -------- A15 + A19 + A21d (§16d): the Stage SOURCE is pinned, not paraphrased ---- */
// A19's finding: every A6/A9 assertion above used to pass with the `Math.floor` deleted
// from TierGraphStage.jsx, because the formula was re-declared in THIS file. They now call
// the module's exports — but that only pins the Stage if the Stage really CALLS them, and a
// node ESM test cannot import JSX. So the Stage is pinned as SOURCE: these fail the moment
// the arithmetic is inlined back or a radius leg is dropped.
// RUNNER NOTE: place TierGraphStage.jsx beside the two core files (it is read, never imported).
const stageSrc = readBeside('TierGraphStage.jsx');
ok('A19 TierGraphStage.jsx is readable (the runner must copy it beside the core files)', stageSrc.length > 0);
ok('A19 Stage imports clipRx/ringRx from tierGraphCore',
  /import\s*\{[^}]*\bclipRx\b[^}]*\bringRx\b[^}]*\}\s*from\s*'\.\/tierGraphCore'/.test(stageSrc));
ok('A19 Stage CALLS clipRx for the bar clip (no inline re-derivation)',
  stageSrc.includes('clipRx(radii[i], barTop, chartBottom)'));
ok('A19 Stage CALLS ringRx for the highlight ring (no inline re-derivation)',
  stageSrc.includes('ringRx(radii[i], barTop, chartBottom)'));
ok('A19 Stage keeps NO local copy of the radius arithmetic',
  !/Math\.min\(\s*radii\[/.test(stageSrc) && !/barHInt/.test(stageSrc));
// A15/A21d — the three remaining rounded rects: BOTH legs, floored to match the C# ints.
ok('A15 here-pill rx caps by BOTH legs, floored — min(15, floor(ph/2), floor(pw/2))',
  stageSrc.includes('rx={Math.min(15, Math.floor(ph / 2), Math.floor(pw / 2))}'));
ok('A15 amount bubble rx caps by BOTH legs, floored — min(17, floor(ph/2), floor(pw/2))',
  stageSrc.includes('rx={Math.min(17, Math.floor(ph / 2), Math.floor(pw / 2))}'));
ok('A21d card rx floors the width leg — min(14, floor(cardW/2), 60)',
  stageSrc.includes('Math.min(14, Math.floor(cardW / 2), 60)'));
// a NEW rounded rect must not slip past the both-legs audit unnoticed
eq('A15 the Stage has exactly 7 rx= rects (5 parity + selection frame + accent square)',
  (stageSrc.match(/\brx=\{/g) || []).length, 7);
eq('A15 only the bar clip carries an explicit ry (rx == ry there by construction)',
  (stageSrc.match(/\bry=\{/g) || []).length, 1);
// A21d moves the bubble/pill height leg by up to 0.5px on a graph with NO keys set. That is
// a KNOWING §1 deviation, mandated by the amendment ("0.5-0.75px each") and in the same class
// as A6's clip integerisation: both move JS ONTO the integer C# has always drawn. Computed
// here from the Stage's own constants so the delta is documented, not discovered later.
eq('A21d default pill (pSize 14, 1 line -> ph 29): 14.5 -> 14, i.e. C#\'s (int)14.5',
  [Math.min(15, 29 / 2), Math.min(15, Math.floor(29 / 2))], [14.5, 14]);
eq('A21d static-amount bubble (valSize 17 -> ph 33): 16.5 -> 16, i.e. C#\'s (int)16.5',
  [Math.min(17, 33 / 2), Math.min(17, Math.floor(33 / 2))], [16.5, 16]);
ok('A21d a PURE-TOKEN bubble (ph 43) does not move — the default graph is untouched',
  Math.min(17, Math.floor(43 / 2)) === 17 && Math.min(17, 43 / 2) === 17);
ok('A21d/A15 both new pill legs are inert above the legacy auto bar floor (48.45)',
  Math.min(15, Math.floor(29 / 2), Math.floor(48 / 2)) === 14);

/* -------- A10 (§16c): buildLink slices the SAME clamped n computeLayout uses ------ */
const s10 = defaultState();
s10.tiers.push(JSON.parse(JSON.stringify(s10.tiers[0])));   // a hand-edited 5-tier graph
s10.tierCountActive = 5;
eq('A10 computeLayout still clamps n to 4 (A5)', computeLayout(s10).n, 4);
const cfg10 = decodeCfg(buildLink(s10).url.split('cfg=')[1].split('&')[0]);
eq('A10 buildLink slices n=5 to 4 (was a 5-tier cfg -> C# demo-graph fallback)', cfg10.tiers.length, 4);
const s10z = defaultState(); s10z.tierCountActive = 0;
eq('A10 n=0 slices to 1, matching computeLayout', [computeLayout(s10z).n,
  decodeCfg(buildLink(s10z).url.split('cfg=')[1].split('&')[0]).tiers.length], [1, 1]);
// §1: identical for n in 1..4 — the emitted tier count is untouched in the legal range
eq('A10 n=1..4 emit an unchanged tier count', [1, 2, 3, 4].map((nn) => {
  const sN = defaultState(); sN.tierCountActive = nn;
  return decodeCfg(buildLink(sN).url.split('cfg=')[1].split('&')[0]).tiers.length;
}), [1, 2, 3, 4]);

/* -------- A17 (§16d): W/H are clamped at RENDER, not only in the reducer --------- */
// `parseTierGraphUrl` passes cfg.w straight through, so a link carrying {"w":1600}
// PREVIEWED at 1600 and EMAILED at 1400 — 200px, the whole image. C# has always clamped:
// StairClampInt(cfg["w"], 1000, 320, 1400) (:2859) and h to [320,900] (:2860).
const sBigWH = defaultState(); sBigWH.width = 1600; sBigWH.height = 1200;
const LBigWH = computeLayout(sBigWH);
eq('A17 W 1600 -> 1400 and H 1200 -> 900 (was a whole-image divergence)', [LBigWH.W, LBigWH.H], [1400, 900]);
const sTinyWH = defaultState(); sTinyWH.width = 10; sTinyWH.height = 10;
const LTinyWH = computeLayout(sTinyWH);
eq('A17 W 10 -> 320 and H 10 -> 320', [LTinyWH.W, LTinyWH.H], [320, 320]);
ok('A17 the CLAMPED W/H drive usable/chartBottom too, not just the returned pair',
  LBigWH.usable === 1400 - 92 && LBigWH.chartBottom === 900 - 152 && LTinyWH.usable === 320 - 92);
ok('A17 the whole layout stays finite at the clamped extremes',
  !JSON.stringify([LBigWH.barWs, LBigWH.totalW, LBigWH.leftStart, LTinyWH.barWs, LTinyWH.totalW]).includes('null'));
// §1: the clamp must be INERT over every W/H the UI can actually produce.
let whDrift = 0;
for (let w = 320; w <= 1400; w += 11) {
  for (let h = 320; h <= 900; h += 11) {
    const sWH = defaultState(); sWH.width = w; sWH.height = h;
    const LWH = computeLayout(sWH);
    if (LWH.W !== w || LWH.H !== h || LWH.chartBottom !== h - 152 || LWH.usable !== w - 92) whDrift++;
  }
}
eq('A17 clamp is inert over the whole legal W x H domain (§1)', whDrift, 0);
// A17 is a RENDER rule: it does not rewrite state, so buildLink still emits what is stored
// (harmless — C# clamps the same cfg to the same 1400x900 the preview now draws).
const cfgBigWH = decodeCfg(buildLink(sBigWH).url.split('cfg=')[1].split('&')[0]);
eq('A17 buildLink still emits the STORED w/h (clamping is render-time, not a state edit)',
  [cfgBigWH.w, cfgBigWH.h], [1600, 1200]);

/* -------- A21c (§16d): geoNum is EXPORTED so the reducer can share one rule ------- */
// The reducer used a bare `!= null`, so an imported {"gp":"x"} wrote NaN into state while
// core treated it as absent. One exported predicate, so "absent" cannot mean two things.
ok('A21c geoNum is exported as a function', typeof geoNum === 'function');
eq('A21c NaN / Infinity / junk / empty / null / undefined are ABSENT',
  [geoNum(NaN), geoNum(Infinity), geoNum(-Infinity), geoNum('x'), geoNum(''), geoNum('  '),
    geoNum(null), geoNum(undefined)],
  [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
eq('A21c 0 stays 0 (gap/cornerRadius 0 are legal) and numeric strings coerce',
  [geoNum(0), geoNum('0'), geoNum('100'), geoNum(12.5), geoNum(-7)], [0, 0, 100, 12.5, -7]);
ok('A21c a JSON boolean is ABSENT (a bare `!= null` accepted it — §16c A14)',
  geoNum(true) === undefined && geoNum(false) === undefined);
ok('A21c geoNum is the SAME rule computeLayout uses (A6 behaviour unchanged)',
  geoNum(computeLayout(sA6).gap) !== undefined);

/* ================= H1 hardening pass (H-a / H-b / H-c / H-d) ===================== */

/* -------- H-a: the AUTO card width gets §9's CEILING (never its 90px floor) ------- */
// Repro from NORMAL USE, not a hand-forged cfg: the default 640x420 graph with `0` typed
// into the top bar's Gap box. usable 548 / n 4 -> barW 137, auto card 145, bars touching:
// every pair of adjacent cards overlapped by 8px. C# had the identical gap.
const sHa = defaultState(); sHa.gap = 0;
const LHa = computeLayout(sHa);
eq('H-a gap 0 on the DEFAULT graph: barW 137, card 137 (was 145 — an 8px overlap)',
  [LHa.barWs[0], LHa.cardWs[0]], [137, 137]);
ok('H-a adjacent cards no longer overlap (cardX(i) + cardW <= cardX(i-1), RTL)',
  [1, 2, 3].every((i) => LHa.cardX(i) + LHa.cardWs[i] <= LHa.cardX(i - 1) + 1e-9));
// §1 PROOF, executed rather than argued: the ceiling can only bind when gap < 8, and an
// ABSENT gap is min(28, usable*0.05) with usable = W-92 >= 228, i.e. >= 11.4 > 8.
let minAutoGap = Infinity, autoCardMoved = 0;
for (let w = 320; w <= 1400; w += 1) {
  for (let nn = 1; nn <= 4; nn++) {
    const sG = defaultState(); sG.width = w; sG.tierCountActive = nn;
    const LG = computeLayout(sG);
    minAutoGap = Math.min(minAutoGap, LG.gap);
    for (let i = 0; i < nn; i++) if (LG.cardWs[i] !== LG.barWs[i] + 8) autoCardMoved++;
  }
}
ok('H-a the minimum AUTO gap over W 320..1400 is 11.4 (> the 8px the ceiling needs to bind)',
  Math.abs(minAutoGap - 11.4) < 1e-9 && minAutoGap > 8);
eq('H-a INERT: every auto card is still exactly barW + 8 over W 320..1400 x n 1..4', autoCardMoved, 0);
eq('H-a the DEFAULT graph\'s cardWs are unchanged (barW + 8, byte-for-byte)',
  computeLayout(defaultState()).cardWs, computeLayout(defaultState()).barWs.map((b) => b + 8));
// the floor is deliberately NOT applied to an auto card: at W=320/n=4 hi is 59.85 < 90, and
// §9's upper-bound-wins tie-break would have widened a 56.45px legacy card to 59.85.
const sHaS = defaultState(); sHaS.width = 320;
const LHaS = computeLayout(sHaS);
ok('H-a on an inverted interval the auto card keeps barW + 8 (56.45), NOT the 59.85 ceiling',
  Math.abs(LHaS.cardWs[0] - (LHaS.barWs[0] + 8)) < 1e-9
  && Math.min(LHaS.barWs[0] + LHaS.gap, LHaS.barWs[0] + 84) < 90);

/* -------- H-b: asz / tsz are range-gated to [6,200], exactly as C# gates them ----- */
// C# `StairSizedFont` (:2681) is `if (sz >= 6 && sz <= 200) use it; else FALLBACK` — a gate,
// not a clamp. `{"here":{"tsz":300}}` rendered 300px in the preview and 14px in the PNG.
ok('H-b fontPx is exported as a function', typeof fontPx === 'function');
eq('H-b in-range values pass through unchanged (today\'s behaviour for every real graph)',
  [fontPx(6, 17), fontPx(17, 17), fontPx(30, 17), fontPx(200, 17)], [6, 17, 30, 200]);
eq('H-b absent -> the fallback (17 amount / 14 pill), identical to the old `|| 17`',
  [fontPx(undefined, 17), fontPx(null, 17), fontPx(undefined, 14)], [17, 17, 14]);
eq('H-b out of range -> the FALLBACK, not the bound (C# gates, it does not clamp)',
  [fontPx(300, 14), fontPx(201, 17), fontPx(5, 17), fontPx(-5, 17)], [14, 17, 17, 17]);
ok('H-b tsz 300 renders 14 (the PNG\'s value), NOT 200 — a clamp would swap one split for another',
  fontPx(300, 14) === 14 && fontPx(300, 14) !== 200);
eq('H-b 0 -> the fallback (C#: a zero-size Font THROWS and the recipient gets the demo image)',
  [fontPx(0, 17), fontPx(0, 14)], [17, 14]);
eq('H-b junk / NaN / Infinity / booleans -> the fallback (geoNum), numeric strings coerce',
  [fontPx('abc', 17), fontPx(NaN, 17), fontPx(Infinity, 17), fontPx(true, 17), fontPx('', 17), fontPx('30', 17)],
  [17, 17, 17, 17, 17, 30]);
// §1: defaultState() sets neither key, so both sites resolve to the same 17 / 14 as before.
ok('H-b §1: defaultState() carries no amountSize / textSize, so the gate cannot bind',
  !('amountSize' in defaultState().tiers[0]) && !('textSize' in defaultState().here));

/* -------- H-c: W/H are SANITISED (not merely clamped) and rounded, as C# does ----- */
// geoClamp(undefined|NaN|'abc', ..) returns its argument untouched — both comparisons are
// false — so ONE junk `w` poisoned W, usable, totalW, leftStart and every xRight: a BLANK
// preview against a PNG that renders fine.
const junkWH = [undefined, null, NaN, 'abc', Infinity, true];
let junkBad = 0;
junkWH.forEach((bad) => {
  const sJ = defaultState(); sJ.width = bad; sJ.height = bad;
  const LJ = computeLayout(sJ);
  if (LJ.W !== 640 || LJ.H !== 420) junkBad++;
  if (JSON.stringify([LJ.barWs, LJ.totalW, LJ.leftStart, LJ.gap, LJ.cardWs]).includes('null')) junkBad++;
});
eq('H-c junk/absent W/H -> defaultState()\'s 640x420, and nothing downstream goes NaN', junkBad, 0);
const sHc0 = defaultState(); sHc0.width = 0; sHc0.height = 0;
eq('H-c a legitimate 0 is NOT "absent" — it clamps to the 320 floor, exactly as C# does',
  [computeLayout(sHc0).W, computeLayout(sHc0).H], [320, 320]);
const sHcR = defaultState(); sHcR.width = 640.6; sHcR.height = 419.4;
eq('H-c W/H are rounded (C# StairClampInt does (int)Math.Round before clamping)',
  [computeLayout(sHcR).W, computeLayout(sHcR).H], [641, 419]);
// §1: inert for every integer the reducer can store — the whole-domain sweep at A17 already
// asserts W === w / H === h; this pins the two graphs that ship.
eq('H-c INERT on the default graph and on the pinned fixture canvas (800x500)',
  [computeLayout(defaultState()).W, computeLayout(defaultState()).H,
    computeLayout({ ...defaultState(), width: 800, height: 500 }).W,
    computeLayout({ ...defaultState(), width: 800, height: 500 }).H], [640, 420, 800, 500]);
// parseTierGraphUrl: `cfg.h || d.height` turned a legitimate 0 into 420 while C# yielded 320.
const mkCfgUrl = (o) => 'https://any.host/pulseemmonitorgraph.png?gt=stairs&cfg=' + b64url(JSON.stringify(o));
const rtZeroWH = parseTierGraphUrl(mkCfgUrl({ w: 0, h: 0, tiers: [{ a: { v: '1' }, box: {} }] }));
eq('H-c parse {"w":0,"h":0} keeps 0 (was 640x420); computeLayout then clamps to 320x320',
  [rtZeroWH.width, rtZeroWH.height, computeLayout(rtZeroWH).W, computeLayout(rtZeroWH).H], [0, 0, 320, 320]);
const rtJunkWH = parseTierGraphUrl(mkCfgUrl({ w: 'abc', h: {}, tiers: [{ a: { v: '1' }, box: {} }] }));
eq('H-c parse junk w/h -> defaultState()\'s 640x420 (was the junk itself)',
  [rtJunkWH.width, rtJunkWH.height], [640, 420]);
ok('H-c parse INERT for a real cfg: the pre-change fixture\'s 800x500 is untouched (asserted below)', true);

/* -------- H-d: the accent square\'s rx matches C# (2, not 1.5) -------------------- */
ok('H-d accent square rx is 2 — C# draws this 10x10 mark with radius 2 (:3314)',
  stageSrc.includes('rx={2} fill={color}') && !stageSrc.includes('rx={1.5}'));

/* -------- H-b Stage wiring: both font sites go through the shared gate ----------- */
ok('H-b Stage imports fontPx from tierGraphCore',
  /import\s*\{[^}]*\bfontPx\b[^}]*\}\s*from\s*'\.\/tierGraphCore'/.test(stageSrc));
ok('H-b Stage gates the amount font size — fontPx(tr.amountSize, 17)',
  stageSrc.includes('fontPx(tr.amountSize, 17)') && !stageSrc.includes('tr.amountSize || 17'));
ok('H-b Stage gates the pill font size — fontPx(graph.here.textSize, 14)',
  stageSrc.includes('fontPx(graph.here.textSize, 14)') && !stageSrc.includes('graph.here.textSize || 14'));

/* -------- §1 INVARIANT, SWEPT: clamping never moves an AUTO value ---------------- */
// A2 clamps SUPPLIED values only. Verified, not assumed: across the whole reachable
// (W, n) grid an all-auto layout must be bit-identical to the pre-amendment cascade.
// A19 (§16d): the sweep now also varies the tier AMOUNTS. The cascade is amount-blind, but
// the Stage's two radii are NOT — a short bar is the only place the A9 ring cap can bind on
// a graph carrying no keys at all, and one fixed amount set never produced one, so the
// ring's back-compat claim was untested exactly where it can fail.
const AMOUNT_SETS = [
  ['120000', '150000', '180000', '240000'],   // the default graph
  ['240000', '240000', '240000', '240000'],   // every bar at full height
  ['1', '150000', '180000', '240000'],        // a 1-unit bar -> barHInt 0..1
  ['0', '3000', '180000', '240000'],          // a ZERO bar + a very short one
  ['90000', '2000', '181000', '7000'],        // mixed; moves the highlighted index too
];
let autoDrift = 0;
let ringBind = 0, ringBadIff = 0, ringEllipse = 0, clipSpec = 0, widthLeg = 0;
for (let w = 320; w <= 1400; w += 10) {
  for (let nn = 1; nn <= 4; nn++) {
    for (let a = 0; a < AMOUNT_SETS.length; a++) {
      const sW = defaultState(); sW.width = w; sW.tierCountActive = nn;
      sW.tiers.forEach((t, i) => { t.amount = { t: AMOUNT_SETS[a][i] }; });
      const LW = computeLayout(sW);
      const gpW = Math.min(28, (w - 92) * 0.05);                        // PRE-amendment §3
      const bwW = Math.min(190, (w - 92 - gpW * (nn - 1)) / nn);        // PRE-amendment §3
      if (LW.gap !== gpW) autoDrift++;
      for (let i = 0; i < nn; i++) {
        if (LW.barWs[i] !== bwW) autoDrift++;
        if (LW.cardWs[i] !== bwW + 8) autoDrift++;
        if (LW.radii[i] !== 18) autoDrift++;
        /* --- the Stage's radii over the SAME sweep, via the SHIPPED exports --- */
        const bTop = LW.hereY(LW.sizes[i]);
        const bhInt = LW.chartBottom - Math.floor(bTop);
        const rr = ringRx(LW.radii[i], bTop, LW.chartBottom);
        const cc = clipRx(LW.radii[i], bTop, LW.chartBottom);
        // with the auto radius 18, min(21, floor((bhInt+6)/2)) < 21 <=> bhInt <= 35.
        if ((rr !== LW.radii[i] + 3) !== (bhInt < 36)) ringBadIff++;
        if (rr !== LW.radii[i] + 3) {
          ringBind++;
          // Where it binds, SVG was ALREADY clamping ry BELOW the requested rx — the browser
          // drew an ELLIPSE the PNG never drew. So no circle is lost by A9: only the rx leg
          // moves onto the ry the browser was using anyway, and to within 1px of it.
          if (!((LW.chartBottom - bTop + 6) / 2 < LW.radii[i] + 3)) ringEllipse++;
          if (Math.abs(rr - (LW.chartBottom - bTop + 6) / 2) > 1) ringEllipse++;
        }
        if (cc !== Math.min(LW.radii[i], Math.floor(bhInt / 2))) clipSpec++;   // == C# min(radius, barH/2)
        if (LW.radii[i] + 3 > (LW.barWs[i] + 6) / 2) widthLeg++;               // A8 -> no width leg needed
      }
    }
  }
}
eq('§1 absent keys: auto cascade byte-identical over W 320..1400 x n 1..4 x 5 amount sets', autoDrift, 0);
ok('A19 the sweep actually PRODUCES short bars (else the ring claim stays untested)', ringBind > 0);
eq('A19 ring cap binds IFF the bar is under 36px — nothing else can move it', ringBadIff, 0);
eq('A19 every capped ring replaces an ELLIPSE SVG already drew, and lands within 1px of its ry', ringEllipse, 0);
eq('A19 clip rx == C# min(radius, barH/2) for every swept short bar', clipSpec, 0);
eq('A19 A8 keeps BOTH rects\' width leg inert over the swept amounts', widthLeg, 0);

/* ---------------- buildLink — 2 tokens (M1 acceptance) ---------------- */
const s2 = defaultState();
s2.here.value = { t: '##ExtraField7##', s: 42000 };
s2.tiers[0].amount = { t: '##ExtraField1##', s: 120000 };
const { url, imgTag } = buildLink(s2);

ok('url gt first, cfg second', /\?gt=stairs&cfg=/.test(url));
ok('url p1/p2 URL-encoded', url.includes('&p1=%23%23ExtraField7%23%23&p2=%23%23ExtraField1%23%23'));
ok('url encodes ## as %23', url.includes('%23%23ExtraField7%23%23'));
ok('imgTag well-formed', imgTag.startsWith('<img src="') && imgTag.includes('alt="גרף התקדמות"') && imgTag.includes('width="' + defaultState().width + '"'));

const cfg = decodeCfg(url.split('cfg=')[1].split('&')[0]);
eq('cfg here.v slot', cfg.here.v, { dyn: 'p1', s: 42000, n: 'ExtraField7' });
eq('cfg tier0.a slot', cfg.tiers[0].a, { dyn: 'p2', s: 120000, n: 'ExtraField1' });
eq('cfg top keys', Object.keys(cfg).sort(), ['axisMax', 'bg', 'font', 'h', 'here', 'pg', 'tiers', 'w']);
// second case: global geometry present -> exactly two extra top-level keys
const sTop = defaultState(); sTop.barWidth = 120; sTop.gap = 0;
const cfgTop = decodeCfg(buildLink(sTop).url.split('cfg=')[1].split('&')[0]);
eq('cfg top keys with bwg/gp', Object.keys(cfgTop).sort(),
  ['axisMax', 'bg', 'bwg', 'font', 'gp', 'h', 'here', 'pg', 'tiers', 'w']);
eq('cfg bwg/gp values (gp:0 not dropped)', [cfgTop.bwg, cfgTop.gp], [120, 0]);
eq('cfg here keys', Object.keys(cfg.here).sort(), ['color', 'show', 't', 'v']);
eq('cfg static here.t stays', cfg.here.t, { v: 'אתה כאן' });
ok('cfg contains no ## token', !JSON.stringify(cfg).includes('##'));
eq('cfg tiers length == active', cfg.tiers.length, 4);

/* ---------------- deterministic pN order + only active tiers ------------- */
const s3 = defaultState();
s3.tierCountActive = 2;                 // array still length 4, only 2 exported
s3.here.value = { t: '##A##', s: 1 };   // p1
s3.here.text = '##B##';                 // p2
s3.tiers[0].amount = { t: '##C##', s: 3 };   // p3
s3.tiers[0].box.cat1 = '##D##';         // p4  (c1)
s3.tiers[0].box.cat2 = '##E##';         // p5  (c2)
s3.tiers[0].box.line1 = '##F##';        // p6  (l1)
s3.tiers[0].box.line2 = '##G##';        // p7  (l2)
s3.tiers[1].amount = { t: '##H##', s: 8 };   // p8
const { url: u3 } = buildLink(s3);
const P8 = [
  'p1=%23%23A%23%23', 'p2=%23%23B%23%23', 'p3=%23%23C%23%23', 'p4=%23%23D%23%23',
  'p5=%23%23E%23%23', 'p6=%23%23F%23%23', 'p7=%23%23G%23%23', 'p8=%23%23H%23%23',
];
const pOf = (u) => u.split('?')[1].split('&').filter((p) => /^p\d/.test(p));
const q3 = pOf(u3);
eq('pN deterministic order', q3, P8);
const cfg3 = decodeCfg(u3.split('cfg=')[1].split('&')[0]);
eq('cfg3 only active tiers', cfg3.tiers.length, 2);

/* -------- THE regression test: geometry keys must NOT renumber pN ---------- */
// bwg/gp/bw/cw/br are plain scalars, never geoSlot/txtSlot. If anyone routes them
// through a slot, pCounter shifts and every already-sent URL silently mis-binds.
const s3g = JSON.parse(JSON.stringify(s3));
s3g.barWidth = 140; s3g.gap = 0;
s3g.tiers[0].barWidth = 80; s3g.tiers[0].cardWidth = 150; s3g.tiers[0].cornerRadius = 0;
s3g.tiers[1].barWidth = 90; s3g.tiers[1].cardWidth = 160; s3g.tiers[1].cornerRadius = 40;
const u3g = buildLink(s3g).url;
eq('pN byte-identical with all geometry keys set', pOf(u3g), P8);
const cfg3g = decodeCfg(u3g.split('cfg=')[1].split('&')[0]);
eq('cfg3g global bwg/gp', [cfg3g.bwg, cfg3g.gp], [140, 0]);
eq('cfg3g tier0 bw/cw/br (br:0 kept)', [cfg3g.tiers[0].bw, cfg3g.tiers[0].cw, cfg3g.tiers[0].br], [80, 150, 0]);
eq('cfg3g tier1 bw/cw/br', [cfg3g.tiers[1].bw, cfg3g.tiers[1].cw, cfg3g.tiers[1].br], [90, 160, 40]);
ok('cfg3g slots unchanged', JSON.stringify(cfg3g.tiers[0].a) === JSON.stringify(cfg3.tiers[0].a));

/* -------- br:0 / gp:0 survive a buildLink -> parse round-trip -------------- */
const rtZero = parseTierGraphUrl(u3g);
eq('parse global barWidth/gap (gap 0)', [rtZero.barWidth, rtZero.gap], [140, 0]);
eq('parse tier0 geometry (cornerRadius 0)',
  [rtZero.tiers[0].barWidth, rtZero.tiers[0].cardWidth, rtZero.tiers[0].cornerRadius], [80, 150, 0]);
ok('parse cornerRadius 0 is a number, not undefined', rtZero.tiers[0].cornerRadius === 0);
// re-emit is symmetric: parse -> buildLink -> same cfg
const cfgRe = decodeCfg(buildLink(rtZero).url.split('cfg=')[1].split('&')[0]);
eq('re-emit cfg geometry identical', [cfgRe.bwg, cfgRe.gp, cfgRe.tiers[0].br], [140, 0, 0]);
// padded tiers 2/3 inherit (undefined) — the pad loop must not invent geometry
ok('padded tiers carry no geometry', rtZero.tiers[2].barWidth === undefined
  && rtZero.tiers[2].cardWidth === undefined && rtZero.tiers[2].cornerRadius === undefined);

/* ---------------- b64url round-trip with Hebrew ---------------- */
const round = decodeURIComponent(escape(atob(
  (() => { let x = b64url('אתה כאן · ₪42,000'); x = x.replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return x; })(),
)));
eq('b64url hebrew round-trip', round, 'אתה כאן · ₪42,000');

/* ---------------- parseTierGraphUrl (inverse of buildLink) ---------------- */
// default (all static) round-trip
const rtDef = parseTierGraphUrl(buildLink(defaultState()).url);
eq('parse default width/height', [rtDef.width, rtDef.height], [640, 420]);
eq('parse default tierCount', rtDef.tierCountActive, 4);
eq('parse default tier0 amount token', [rtDef.tiers[0].amount.t, rtDef.tiers[0].amount.s], ['##פרס עמודה ראשונה##', 120000]);
eq('parse default here text', rtDef.here.text, 'אתה כאן');
eq('parse default box texts', [rtDef.tiers[0].box.line1, rtDef.tiers[0].box.cat1], ['יחיד', 'פרס טיסה']);

// token round-trip — the raw ## tokens must be recovered from the pN params
const st = defaultState();
st.here.value = { t: '##ExtraField7##', s: 42000 };
st.tiers[0].amount = { t: '##ExtraField1##', s: 120000 };
const rtTok = parseTierGraphUrl(buildLink(st).url);
eq('parse token here.value', rtTok.here.value, { t: '##ExtraField7##', s: 42000 });
eq('parse token tier0.amount', rtTok.tiers[0].amount, { t: '##ExtraField1##', s: 120000 });

// tokens with Hebrew + spaces must stay URL-valid (no raw # / whitespace in pN) AND round-trip
const stHeb = defaultState();
stHeb.tiers[0].amount = { t: '##יעד פרס 1##', s: 120000 };
const urlHeb = buildLink(stHeb).url;
const pHeb = urlHeb.split('&').filter((p) => p.startsWith('p')).join('&');
ok('hebrew/space token URL-safe (no raw # or whitespace in pN)', !/[#\s]/.test(pHeb));
eq('hebrew/space token round-trips via parse', parseTierGraphUrl(urlHeb).tiers[0].amount.t, '##יעד פרס 1##');

// 2 active tiers -> tierCountActive 2, array padded to 4
const st2 = defaultState(); st2.tierCountActive = 2;
const rt2 = parseTierGraphUrl(buildLink(st2).url);
eq('parse 2-tier active count', rt2.tierCountActive, 2);
eq('parse 2-tier array padded', rt2.tiers.length, 4);

// invalid inputs -> null (soft error, no throw)
eq('parse invalid string', parseTierGraphUrl('not a url'), null);
eq('parse empty', parseTierGraphUrl(''), null);

/* ---------------- auto-highlight (by value) ---------------- */
eq('autoHighlight 42k -> tier0', autoHighlightIndex([120000, 150000, 180000, 240000], 42000), 0);
eq('autoHighlight 130k -> tier1', autoHighlightIndex([120000, 150000, 180000, 240000], 130000), 1);
eq('autoHighlight exact 150k -> tier1', autoHighlightIndex([120000, 150000, 180000, 240000], 150000), 1);
eq('autoHighlight exceeds-all -> largest', autoHighlightIndex([120000, 150000, 180000, 240000], 999999), 3);
eq('autoHighlight tie -> lowest index', autoHighlightIndex([100, 100, 100], 50), 0);

/* ---------------- per-field font sizes (asz/l1sz/..) + row show/hide (r1/r2) ---------------- */
const sx = defaultState();
sx.tiers[0].box.row2Show = false;
sx.tiers[0].box.line1Size = 22; sx.tiers[0].box.cat1Size = 9;
sx.tiers[0].amountSize = 30; sx.here.textSize = 18;
const cfgX = decodeCfg(buildLink(sx).url.split('cfg=')[1].split('&')[0]);
eq('cfg emits r2:0 when hidden', cfgX.tiers[0].box.r2, 0);
eq('cfg emits asz/tsz', [cfgX.tiers[0].asz, cfgX.here.tsz], [30, 18]);
eq('cfg emits l1sz/c1sz', [cfgX.tiers[0].box.l1sz, cfgX.tiers[0].box.c1sz], [22, 9]);
const rtX = parseTierGraphUrl(buildLink(sx).url);
eq('parse row2Show=false, row1Show default true', [rtX.tiers[0].box.row2Show, rtX.tiers[0].box.row1Show], [false, true]);
eq('parse sizes round-trip', [rtX.tiers[0].box.line1Size, rtX.tiers[0].box.cat1Size, rtX.tiers[0].amountSize, rtX.here.textSize], [22, 9, 30, 18]);

const cfgDef = decodeCfg(buildLink(defaultState()).url.split('cfg=')[1].split('&')[0]);
ok('default cfg omits all size/row/geometry keys',
  !/r1|r2|asz|tsz|l1sz|c1sz|l2sz|c2sz|bwg|gp|bw|cw|br/.test(JSON.stringify(cfgDef)));
ok('default cfg omits dead hl key', !/"hl"/.test(JSON.stringify(cfgDef)));
// a default graph must cost exactly zero cfg bytes vs. the pre-geometry build
eq('defaultState() has no geometry keys (contract §1/§2)',
  ['barWidth', 'gap'].filter((k) => k in defaultState())
    .concat(['barWidth', 'cardWidth', 'cornerRadius'].filter((k) => k in defaultState().tiers[0])), []);

/* ---------------- PRE-CHANGE cfg fixture (already-sent URL regression) ------ */
// Captured from the module BEFORE the geometry keys existed: w=800 h=500, 3 static
// tiers, no pN params. It must still parse, and must still lay out identically.
// This is the only test that can catch a break of a URL that is already in an inbox.
const PRE_CHANGE_CFG64 = 'eyJ3Ijo4MDAsImgiOjUwMCwiYmciOiIjZmRmMGVhIiwiZm9udCI6IkFzc2lzdGFudCIsImF4aXNNYXgiOjAsInBnIjoiIzdlZDk4YyIsImhlcmUiOnsic2hvdyI6dHJ1ZSwiY29sb3IiOiIjMmJiMjRjIiwidiI6eyJ2IjoiNDIwMDAifSwidCI6eyJ2IjoieW91IGFyZSBoZXJlIn19LCJ0aWVycyI6W3siZmlsbCI6IiNjNGNkZjIiLCJsYyI6IiMzYjNiNmIiLCJhIjp7InYiOiIxMTAwMDAifSwiYm94Ijp7ImYiOiIjZmZmZmZmIiwidGMiOiIjMWU3ZTM0IiwiYWMiOiIjMmJiMjRjIiwiYzEiOnsidiI6IkMxIn0sImMyIjp7InYiOiJDMiJ9LCJsMSI6eyJ2IjoiTDEifSwibDIiOnsidiI6IkwyIn19fSx7ImZpbGwiOiIjYzRjZGYyIiwibGMiOiIjM2IzYjZiIiwiYSI6eyJ2IjoiMTYwMDAwIn0sImJveCI6eyJmIjoiI2ZmZmZmZiIsInRjIjoiIzFlN2UzNCIsImFjIjoiIzJiYjI0YyIsImMxIjp7InYiOiJDMSJ9LCJjMiI6eyJ2IjoiQzIifSwibDEiOnsidiI6IkwxIn0sImwyIjp7InYiOiJMMiJ9fX0seyJmaWxsIjoiI2M0Y2RmMiIsImxjIjoiIzNiM2I2YiIsImEiOnsidiI6IjIyMDAwMCJ9LCJib3giOnsiZiI6IiNmZmZmZmYiLCJ0YyI6IiMxZTdlMzQiLCJhYyI6IiMyYmIyNGMiLCJjMSI6eyJ2IjoiQzEifSwiYzIiOnsidiI6IkMyIn0sImwxIjp7InYiOiJMMSJ9LCJsMiI6eyJ2IjoiTDIifX19XX0';
const rtPre = parseTierGraphUrl('https://any.host/pulseemmonitorgraph.png?gt=stairs&cfg=' + PRE_CHANGE_CFG64);
ok('pre-change cfg still parses', rtPre !== null);
eq('pre-change w/h/count', [rtPre.width, rtPre.height, rtPre.tierCountActive], [800, 500, 3]);
eq('pre-change amounts', rtPre.tiers.slice(0, 3).map((t) => t.amount.t), ['110000', '160000', '220000']);
eq('pre-change geometry stays undefined', [
  rtPre.barWidth, rtPre.gap,
  rtPre.tiers[0].barWidth, rtPre.tiers[0].cardWidth, rtPre.tiers[0].cornerRadius,
], [undefined, undefined, undefined, undefined, undefined]);
const LPre = computeLayout(rtPre);
// values recorded from the PRE-CHANGE computeLayout for this exact cfg
eq('pre-change layout gap/totalW/leftStart', [LPre.gap, LPre.totalW, LPre.leftStart], [28, 626, 87]);
eq('pre-change layout barWs', LPre.barWs, [190, 190, 190]);
eq('pre-change layout xRight', [0, 1, 2].map((i) => LPre.xRight(i)), [523, 305, 87]);
eq('pre-change layout radii/cardWs', [LPre.radii, LPre.cardWs], [[18, 18, 18], [198, 198, 198]]);
// re-emitting a parsed pre-change graph must reproduce the ORIGINAL cfg byte-for-byte
eq('pre-change cfg re-emits byte-identically',
  buildLink(rtPre).url.split('cfg=')[1].split('&')[0], PRE_CHANGE_CFG64);

/* ---------------- summary ---------------- */
// Every assertion above is a TOP-LEVEL statement, so the suite has already finished by the time an
// importer gets here: these two are plain reads of the final tally, for the jest wrapper.
export const selfTestFailures = () => failures;
export const selfTestFailureLog = () => failureLog.slice();
export const selfTestCount = () => assertions;

if (failures > 0) {
  console.error(`\n${failures} assertion(s) FAILED`);
  // Under jest the wrapper test fails the run — exiting here would kill the worker instead.
  if (!UNDER_JEST && typeof process !== 'undefined') process.exit(1);
} else if (!UNDER_JEST) {
  console.log('\nAll tierGraphCore self-tests passed.');
}
