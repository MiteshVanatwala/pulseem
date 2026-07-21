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
 * ========================================================================== */

import { actionURL } from '../../../../config'; // ReactCode\src\config\index.js

export const STATE_VERSION = 4;
export const CUR = '₪';

// Exactly 13 colors, in the exact POC order.
export const PALETTE = [
  '#c4cdf2', '#aab6ee', '#8e9ce9', '#7ed98c', '#2bb24c', '#1e7e34', '#ffffff',
  '#fdf0ea', '#fff3cd', '#e0e0e0', '#3b3b6b', '#1f2937', '#d14343',
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
    { amount: { t: '120000', s: 120000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'יחיד', cat1: 'פרס טיסה', line2: 'זוגי', cat2: 'פרס משפחות' } },
    { amount: { t: '150000', s: 150000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+1', cat2: 'פרס משפחות' } },
    { amount: { t: '180000', s: 180000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+2', cat2: 'פרס משפחות' } },
    { amount: { t: '240000', s: 240000 }, fill: '#c4cdf2', labelColor: '#3b3b6b',
      box: { fill: '#ffffff', textColor: '#1e7e34', accent: '#2bb24c',
             line1: 'זוגי', cat1: 'פרס טיסה', line2: '+3', cat2: 'פרס משפחות' } },
  ],
  here: { value: { t: '42000', s: 42000 }, text: 'אתה כאן', color: '#2bb24c', show: true },
});

/* ---------------- layout constants (identical in the C# renderer) ---------- */
export const computeLayout = (state) => {
  const W = state.width, H = state.height;
  const n = state.tierCountActive;
  const marginX = 46;
  const chartTop = 78;
  const chartBottom = H - 152;          // boxH=120 + boxGap=20 + 12
  const plotH = chartBottom - chartTop;
  const usable = W - 92;                // W - 2*marginX
  const gap = Math.min(28, usable * 0.05);
  const barW = Math.min(190, (usable - gap * (n - 1)) / n);
  const totalW = barW * n + gap * (n - 1);
  const leftStart = (W - totalW) / 2;
  const sizes = state.tiers.slice(0, n).map((t) => sizeG(t.amount));
  const axisMax = state.axisMax > 0 ? state.axisMax : Math.max(1, ...sizes) * 1.08;
  const xRight = (i) => leftStart + totalW - barW - (barW + gap) * i; // RTL: tier 0 rightmost
  const hereY = (v) => chartBottom - (Math.max(0, Math.min(v, axisMax)) / axisMax) * plotH;
  return {
    W, H, n, marginX, chartTop, chartBottom, plotH, usable, gap, barW,
    totalW, leftStart, sizes, axisMax, xRight, hereY,
  };
};
// fixed extras: boxH=120, boxGap=20, bar rx=18, bubble min 94x34, dash '8 6'

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
    here: {
      show: state.here.show, color: state.here.color,
      v: geoSlot(state.here.value), t: txtSlot(state.here.text),
      ...(state.here.textSize ? { tsz: state.here.textSize } : {}),   // D: pill font size
    },
    tiers: state.tiers.slice(0, state.tierCountActive).map((tr) => ({
      fill: tr.fill, lc: tr.labelColor,
      a: geoSlot(tr.amount),
      ...(tr.amountSize ? { asz: tr.amountSize } : {}),               // D: amount font size
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
      },
    })),
  };

  const url = TIER_GRAPH_ENDPOINT + '?gt=stairs&cfg=' + b64url(JSON.stringify(cfg))
    + (params.length ? '&' + params.join('&') : '');
  const imgTag = '<img src="' + url + '" alt="גרף התקדמות" width="' + state.width + '" />';
  return { url, imgTag };
};

// Inverse of buildLink: an image URL -> a graph state (version 4), or null if it
// cannot be parsed. Used by "load from link" so an existing graph can be re-edited.
// MUST stay in sync with buildLink's cfg shape (w/h/bg/font/axisMax/pg/here/tiers,
// slot {v} | {dyn,s[,n]}, box {f,tc,ac,c1,c2,l1,l2}, here {show,color,v,t}).
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
        if (params[slot.dyn] != null && params[slot.dyn] !== '') return { t: params[slot.dyn], s: slot.s };
        if (slot.n) return { t: '##' + slot.n + '##', s: slot.s }; // recover a pure token from a truncated URL
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
      width: cfg.w || d.width, height: cfg.h || d.height,
      bg: cfg.bg || d.bg, font: cfg.font || d.font,
      axisMax: cfg.axisMax || 0, progressFill: cfg.pg || d.progressFill,
      tierCountActive: Array.isArray(cfg.tiers) && cfg.tiers.length ? cfg.tiers.length : d.tierCountActive,
      tiers: (Array.isArray(cfg.tiers) ? cfg.tiers : []).map((tr) => {
        const box = tr.box || {};
        return {
          amount: geo(tr.a),
          fill: tr.fill || d.tiers[0].fill,
          labelColor: tr.lc || d.tiers[0].labelColor,
          amountSize: tr.asz,                                          // D
          box: {
            fill: box.f || d.tiers[0].box.fill,
            textColor: box.tc || d.tiers[0].box.textColor,
            accent: box.ac || d.tiers[0].box.accent,
            cat1: txt(box.c1), cat2: txt(box.c2),
            line1: txt(box.l1), line2: txt(box.l2),
            row1Show: box.r1 !== 0, row2Show: box.r2 !== 0,            // E
            line1Size: box.l1sz, cat1Size: box.c1sz,                  // D
            line2Size: box.l2sz, cat2Size: box.c2sz,
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
