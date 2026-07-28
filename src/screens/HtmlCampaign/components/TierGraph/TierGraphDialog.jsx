import React, { useReducer, useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  defaultState, buildLink, measureTextFactory, isTok, parseTierGraphUrl, geoNum,
} from './tierGraphCore';
import TierGraphStage from './TierGraphStage';
import TierGraphEditorPanel from './TierGraphEditorPanel';

/* ----------------------------- reducer ----------------------------- */
const clone = (g) => JSON.parse(JSON.stringify(g));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---------------------- geometry clamps (contract §9) ----------------------
   These re-implement the §3 cascade arithmetic locally on purpose: the reducer runs with no
   measureText and must not depend on computeLayout's signature (Core's file, another owner).
   Rule everywhere: OVERRIDE WINS, THEN CLAMP — never silently resize the other tiers.
   `undefined` always means auto/inherit and is never clamped. */
const BAR_MIN = 24;
const BAR_MAX = 190;
/* §16d A21(c): every read of a geometry value goes through Core's `geoNum` (IMPORTED above, not
   re-declared — one predicate, so "absent" cannot come to mean two different things), NEVER a bare
   `!= null`. `parseTierGraphUrl` is a pure inverse of `buildLink` (§8) and applies no coercion, so
   an imported `{"gp":"x"}` arrives here as the STRING "x"; a bare null-check accepts it, the clamp
   turns it into NaN, and NaN is then stored, emitted by buildLink and handed to React as an input
   `value` (which warns and renders an empty, uncontrolled-looking field). geoNum maps
   NaN / ±Infinity / non-numeric to ABSENT (= auto), exactly as Core and the C# renderer already
   do, and coerces a numeric string ('40' -> 40) instead of letting it string-concatenate. */
/* §16d A21(a): clamp results are STORED, so they must be integers — a stored 121.8 makes the
   `step={1}` input `:invalid` and puts a 15-char float in the cfg. Rounding alone is not safe
   (round(51.6) = 52 escapes a 51.6 ceiling and re-creates the A11 "state lies" bug), so the
   INTERVAL is integerised first: floor the ceiling, ceil the floor, and — when no integer fits
   between them — §9's tie-break applies and the UPPER bound wins. `0` stays representable for
   gap and cornerRadius: their `lo` is 0, so `iLo` is 0. */
const clampInt = (v, lo, hi) => {
  const iHi = Math.floor(hi);
  const iLo = Math.min(Math.ceil(lo), iHi);   // §9 tie-break: upper bound wins on an inverted range
  return Math.max(iLo, Math.min(iHi, Math.round(v)));
};
/* §16c A5/A10 + §16d A21(c): the active tier count resolves EXACTLY as Core's `activeN`
   (tierGraphCore.js:142) — same geoNum, same round, same [1,4] clamp — so the reducer can never
   bound a field against a different `n` than the one both renderers draw. */
const nOf = (g) => Math.min(4, Math.max(1, Math.round(geoNum(g.tierCountActive) ?? 4)));
const usableOf = (g) => g.width - 92;
const autoGapOf = (g) => Math.min(28, usableOf(g) * 0.05);
/* Resolved gap. Mirrors computeLayout's resolution EXACTLY (tierGraphCore.js:163-165): a SUPPLIED
   gap is forced to 0 at n == 1 — there is no inter-bar space to give — while an ABSENT one falls
   back to the auto gap at every n. The n == 1 arm only became REACHABLE with §16c A12 (which stops
   reclampGeometry from zeroing a manual gap on the way to n == 1), and it matters in exactly one
   place: clampCardWidth reads the gap DIRECTLY (`hi = min(barW + gap, barW + 84)`) where every
   other caller multiplies it by (n - 1) == 0. Without this the reducer would accept a card up to
   `gap` px wider than the one both renderers draw — the §16c A11 "stored state lies about what is
   drawn" failure, re-introduced by A12 through the back door. */
const gapOf = (g) => {
  const gv = geoNum(g.gap);                       // §16d A21(c): "x" is ABSENT, not NaN
  if (gv != null) return nOf(g) < 2 ? 0 : gv;
  return autoGapOf(g);
};
/* The EXPLICIT width of tier i (the §3 cascade minus its auto step): own override, else the global,
   else `undefined` = auto. Returning `undefined` rather than a number is what makes a tier count as
   "free" below — `0` is not a legal bar width, but the distinction is kept explicit anyway. */
const ownBarOf = (g, i) => geoNum(g.tiers[i] && g.tiers[i].barWidth);   // §16d A21(c)
const fixedBarOf = (g, i) => {
  const own = ownBarOf(g, i);
  if (own != null) return own;
  return geoNum(g.barWidth);
};
/* §3 AS AMENDED BY §16b A1: the auto tiers SHARE what the explicitly-sized ones leave, rather than
   each taking usable/n blind to the overrides. This local copy must stay identical to Core's (and
   C#'s) cascade: it feeds the top-bar auto placeholder AND — through barOf() — the cardWidth /
   cornerRadius bounds, so an out-of-date copy silently clamps against the wrong barW_i. */
const autoBarOf = (g) => {
  const n = nOf(g);
  const room = usableOf(g) - gapOf(g) * (n - 1);
  let fixedSum = 0;
  let freeCount = 0;
  for (let i = 0; i < n; i += 1) {
    const w = fixedBarOf(g, i);
    if (w != null) fixedSum += w; else freeCount += 1;
  }
  return freeCount > 0
    ? Math.min(BAR_MAX, Math.max(BAR_MIN, (room - fixedSum) / freeCount))
    : Math.min(BAR_MAX, room / n);
};

// number | undefined from a raw input value. '' IS the reset (§10) — so is any non-number.
// Routed through geoNum (§16d A21(c)) so ±Infinity resets too instead of being stored.
const numOrUndef = (v) => {
  const num = geoNum(v);
  return num == null ? undefined : Math.round(num);
};

/* Σ over the ACTIVE tiers of each tier's *committed* width, skipping index `skip` (-1 = none).
   Committed = the tier's explicit width (fixedBarOf), else BAR_MIN — read straight off the §16b A1
   cascade: an auto tier resolves to `min(190, max(24, (room - fixedSum) / freeCount))`, i.e. it
   absorbs the remainder but never shrinks past the 24px floor. So with R = room - Σ(explicit):
     R ≥ 24*freeCount  → the auto tiers take R (or less, at the 190 cap) and the total lands ON
                          `usable` by construction — the invariant holds;
     R <  24*freeCount → they are pinned at 24 and the graph overflows by 24*freeCount - R.
   Bounding the edited field against this sum is therefore §9's MASTER INVARIANT exactly, not an
   approximation of it, and it still degenerates to §9's static gap bound (usable - n*24)/(n-1)
   when nothing is overridden. Committing the auto tiers' *resolved* width instead would be circular
   (it depends on the value being edited) and would freeze the controls. */
const committedBars = (g, skip) => {
  let s = 0;
  for (let i = 0; i < nOf(g); i += 1) {
    if (i === skip) continue;
    const w = fixedBarOf(g, i);
    s += w != null ? w : BAR_MIN;
  }
  return s;
};
// §9 gap ceiling. Exposed as its own function so the input's `max` attribute and the reducer's
// clamp cannot drift apart — a `max` that disagrees with the clamp is worse than no `max` at all.
const gapMaxOf = (g) => (nOf(g) < 2 ? 0 : Math.max(0, (usableOf(g) - committedBars(g, -1)) / (nOf(g) - 1)));
const clampGap = (g, v) => {
  if (nOf(g) < 2) return 0; // control is disabled when n == 1 — there is no inter-bar space to give
  return clampInt(v, 0, gapMaxOf(g));
};
/* §16d A18: the GLOBAL bar-width ceiling, exposed as its own function for the same reason
   `gapMaxOf` is — the top-bar input's `max` attribute and the reducer's clamp must come from ONE
   expression. The input hard-coded `max={BAR_MAX}` while the real ceiling is
   `min(190, (usable - gap*(n-1) - fixed) / free)`, so typing 190 on the DEFAULT graph silently
   snapped to 116.45 with no feedback at all. Tiers carrying their own override keep it; only the
   inheriting ones are sized by the global. */
const globalBarMaxOf = (g) => {
  const n = nOf(g);
  let free = 0;
  let fixed = 0;
  for (let i = 0; i < n; i += 1) {
    const own = ownBarOf(g, i);
    if (own != null) fixed += own; else free += 1;
  }
  const hi = free ? Math.min(BAR_MAX, (usableOf(g) - gapOf(g) * (n - 1) - fixed) / free) : BAR_MAX;
  return Math.max(BAR_MIN, hi);
};
const clampGlobalBar = (g, v) => clampInt(v, BAR_MIN, globalBarMaxOf(g));
const clampTierBar = (g, i, v) => {
  const hi = Math.min(BAR_MAX, usableOf(g) - gapOf(g) * (nOf(g) - 1) - committedBars(g, i));
  return clampInt(v, BAR_MIN, Math.max(BAR_MIN, hi));
};
// resolved bar width for tier i (§3 cascade) — the base for the card/radius bounds.
const barOf = (g, i) => {
  const w = fixedBarOf(g, i);
  return w != null ? w : autoBarOf(g);
};
const clampCardWidth = (g, i, v) => {
  const b = barOf(g, i);
  // §9 tie-break: this interval INVERTS on small canvases (W=320,n=4 -> hi ~59.9 < lo 90).
  // The UPPER bound wins: it prevents adjacent-card overlap and canvas overflow (breakage),
  // while the lower bound only protects readability (cramped but correct). Raising hi to 90
  // instead would diverge ~30px from the C# renderer, which resolves upper-bound-wins.
  // §16d A21(a): stored as an INTEGER inside the interval — `clampInt` floors the ceiling, so the
  // panel's `max` (also floored) and the value the reducer keeps are the same number.
  const hi = Math.min(b + gapOf(g), b + 84);
  return clampInt(v, Math.min(90, hi), hi);
};
const clampCornerRadius = (g, i, v) => clampInt(v, 0, Math.max(0, Math.min(40, Math.floor(barOf(g, i) / 2))));
/* Re-clamp ONE stored geometry key in place. Single entry point for §16d A21(a) + A21(c):
   the value is read through geoNum, and anything that is not a finite number is treated as ABSENT
   and DELETED — never left as NaN and never re-stored as a string. Deleting (rather than writing
   `undefined`) keeps this file's existing invariant that auto === the key is absent, so the
   persisted blob, the `!= null` cfg guards in buildLink and isDefaultGraph() all agree. */
const reclampKey = (obj, key, fn) => {
  if (!obj) return;
  const v = geoNum(obj[key]);
  if (v == null) delete obj[key];
  else obj[key] = fn(v);
};
/* §16c A11 — the RESOLVED bar width of every active tier, snapshotted BEFORE an edit that can move
   it. `cardWidth` and `cornerRadius` are not independent values: BOTH bounds derive from barW_i, so
   when barW_i moves they must be re-clamped or the stored state and the panel report a geometry
   NEITHER renderer draws. Review case: tier 0 at barWidth 190 / cornerRadius 40 / cardWidth 200,
   then barWidth -> 24. The panel kept showing 40 / 200 and buildLink emitted `br:40, cw:200` while
   both renderers clamped to 12 and 51.4. Not a parity break — a state/UI lie, which is worse,
   because the cfg that gets emailed carries the numbers nobody is drawing. */
const resolvedBars = (g) => {
  const out = [];
  for (let i = 0; i < nOf(g); i += 1) out.push(barOf(g, i));
  return out;
};
/* Re-clamp the DEPENDENT fields only, and only for the tiers whose resolved width ACTUALLY moved
   (an edit to tier 0 also moves every AUTO tier, via A1's `room - fixedSum` share — those are
   dependents too). Nothing here ever writes a barWidth or a gap: §9 forbids resizing a tier the
   user did not touch, and a tier whose resolved width did not move is skipped entirely. */
const reclampDependents = (g, before) => {
  for (let i = 0; i < nOf(g); i += 1) {
    const tr = g.tiers[i];
    if (!tr) continue;
    /* §16d A16: `cardWidth` is re-clamped UNCONDITIONALLY — its ceiling is
       `min(barW_i + gap, barW_i + 84)`, which the GAP moves on its own while `barW_i` stays
       bit-identical. Gating it on the width delta skipped exactly that case: W=640, n=4, tier 0
       bar 100 -> gap 40 -> card 140 (accepted, hi = 140) -> gap 0. Tier 0's resolved width never
       moved, so the tier was skipped, state kept `cw:140`, and BOTH renderers drew 100 — a 40px
       state-vs-render lie carried into the emailed cfg.
       `cornerRadius` keeps the gate: `min(40, floor(barW_i/2))` has no other input, so a tier
       whose resolved width did not move cannot have a stale radius. */
    reclampKey(tr, 'cardWidth', (v) => clampCardWidth(g, i, v));
    if (before[i] !== barOf(g, i)) reclampKey(tr, 'cornerRadius', (v) => clampCornerRadius(g, i, v));
  }
  return g;
};
/* §9: re-clamp whenever W or n changes — the AUTO gap scales with W, a frozen manual one does not,
   so a gap that was legal at W=1400 overflows at W=640. Gap first (its bound reads the OLD global
   width), then the widths against the freshly clamped gap. Mutates the already-cloned draft. */
const reclampGeometry = (g) => {
  /* H-e: `W`/`H` are clamped FIRST — before nOf/usableOf are read — because `usable = W - 92` is
     the input to EVERY bound below (gap, global bar, per-tier bar, cardWidth). computeLayout
     (tierGraphCore.js:155-156, §16d A17) and C# (`StairClampInt(cfg["w"], 1000, 320, 1400)`) both
     clamp W/H at RENDER, but nothing clamped them in STATE, so an imported `{"w":1600,"gp":460}`
     kept width 1600, bounded the gap against `(1508-96)/3 = 470.67` and ACCEPTED 460 — while
     both renderers drew W 1400 and gap 404. Same "state lies about what is drawn" class as
     §16c A11 / §16d A16, plus `onInsert(url, graph.width)` (and core's `imgTag`) emitted
     `width="1600"` for a 1400px PNG — a wrong width in the actual email.
     Read through geoNum (§16d A21(c)) so a numeric STRING clamps as a number; a value that is not
     a finite number is left exactly as it was — inventing a default here is not this clamp's job,
     and `parseTierGraphUrl` (`cfg.w || d.width`) already makes that branch unreachable.
     Deliberately NOT rounded: Core does not round W/H either (see the F4/A17 ledger entry — C#'s
     `Math.Round` is banker's), and every reachable UI path already stores an integer. */
  const wv = geoNum(g.width);
  if (wv != null) g.width = clamp(wv, 320, 1400);
  const hv = geoNum(g.height);
  if (hv != null) g.height = clamp(hv, 320, 900);
  /* §16d A21(b): the tier COUNT is clamped next — like W, it is an input to every bound below.
     `parseTierGraphUrl` sets it from `cfg.tiers.length` uncapped, so an imported 5-tier link left
     `tierCountActive: 5`: none of the 1/2/3/4 buttons matched (`graph.tierCountActive === num`), so
     the segmented control showed no selection, and the state persisted to localStorage described a
     graph neither renderer draws (both clamp n to 4). `nOf` is Core's `activeN` expression, so the
     stored count is now exactly the one that gets drawn and emitted. The tier ARRAY is truncated to
     4 for the same reason — a 5th tier can never be rendered, selected or emitted (buildLink slices
     to activeN), it only rides along in every save. Inert for every UI path: SET_TIER_COUNT grows
     the array to at most 4 and deliberately never shrinks it, so tiers 2-4 still survive n -> 1. */
  g.tierCountActive = nOf(g);
  if (Array.isArray(g.tiers) && g.tiers.length > 4) g.tiers.length = 4;
  /* §16c A12: the gap arm is SKIPPED at n < 2. clampGap returns 0 there, and a stored 0 is
     indistinguishable from a deliberate "no gap" on the way back up, so gap=20 -> n=1 -> n=4 used
     to lose the setting permanently. Nothing is lost visually by keeping it: computeLayout resolves
     a supplied gap to 0 at n == 1 anyway (tierGraphCore.js:165) and every other consumer multiplies
     it by (n - 1) == 0. Re-clamping resumes automatically the moment n >= 2 again. */
  // §16d A21(c): every arm goes through reclampKey, so an imported `{"gp":"x"}` is dropped as
  // "auto" here instead of being clamped into NaN and stored. At n < 2 the gap keeps its value
  // (A12) but is still normalised to a number.
  reclampKey(g, 'gap', (v) => (nOf(g) >= 2 ? clampGap(g, v) : Math.round(v)));
  reclampKey(g, 'barWidth', (v) => clampGlobalBar(g, v));
  for (let i = 0; i < nOf(g); i += 1) {
    reclampKey(g.tiers[i], 'barWidth', (v) => clampTierBar(g, i, v));
  }
  /* §16b A4: cardWidth and cornerRadius must be re-clamped too. BOTH bounds derive from the
     RESOLVED barW_i, so lowering a bar width (or letting the auto width shrink after a W/n change)
     leaves a stale radius/card width that JS honours and C# clamps — tens of px apart, two clicks
     away. This is a SECOND pass on purpose: it may only run once every bar width above has settled,
     otherwise it would clamp against a barW_i that is about to change. */
  for (let i = 0; i < nOf(g); i += 1) {
    reclampKey(g.tiers[i], 'cardWidth', (v) => clampCardWidth(g, i, v));
    reclampKey(g.tiers[i], 'cornerRadius', (v) => clampCornerRadius(g, i, v));
  }
  return g;
};
// §9 SOFT warning (never a block): adjacent amount bubbles collide below 94px of pitch.
const bubbleCrowded = (g) => {
  const n = nOf(g);
  if (n < 2) return false;
  const gap = gapOf(g);
  for (let i = 0; i < n; i += 1) if (barOf(g, i) + gap < 94) return true;
  return false;
};

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selected: action.selected };
    case 'SET_BG_FIELD': {
      const g = clone(state.graph);
      let val = action.val;
      if (action.key === 'width' || action.key === 'height') {
        const num = Number(val);
        const rounded = isNaN(num) ? (action.key === 'width' ? 640 : 420) : Math.round(num);
        val = action.key === 'width' ? clamp(rounded, 320, 1400) : clamp(rounded, 320, 900);
        g[action.key] = val;
        if (action.key === 'width') reclampGeometry(g); // usable = W - 92 just moved (§9)
        return { ...state, graph: g };
      }
      if (action.key === 'axisMax') {
        const num = Number(val);
        val = isNaN(num) ? 0 : Math.max(0, num);
      } else if (action.key === 'barWidth' || action.key === 'gap') {
        /* §16c A11: both of these move the RESOLVED barW_i of every tier that inherits — the global
           width directly, the gap through A1's `room - fixedSum` share — so the dependent
           cardWidth / cornerRadius of those tiers must be re-clamped. SETTING and CLEARING both
           count: clearing hands the auto share back and is exactly the path A11 calls out. */
        const before = resolvedBars(g);
        // §9 + §10: empty === auto. Keep the key ABSENT rather than present-and-undefined so the
        // persisted blob, the `!= null` cfg guards and isDefaultGraph() all agree it was never set.
        val = numOrUndef(val);
        if (val === undefined) delete g[action.key];
        else g[action.key] = action.key === 'gap' ? clampGap(g, val) : clampGlobalBar(g, val);
        return { ...state, graph: reclampDependents(g, before) };
      }
      g[action.key] = val;
      return { ...state, graph: g };
    }
    case 'SET_TIER_COUNT': {
      const g = clone(state.graph);
      const n = clamp(action.n, 1, 4);
      const d = defaultState();
      while (g.tiers.length < n) g.tiers.push(JSON.parse(JSON.stringify(d.tiers[g.tiers.length % 4])));
      g.tierCountActive = n; // array never shrinks — edits to tiers 3-4 survive
      reclampGeometry(g);    // n moved: the per-bar share of `usable` moved with it (§9)
      return { ...state, graph: g, selected: null };
    }
    case 'SET_TIER_FIELD': {
      const g = clone(state.graph);
      let val = action.val;
      /* §16c A11: a per-tier bar-width edit moves THIS tier's resolved width and — through A1's
         `room - fixedSum` share — every AUTO tier's width with it. Snapshot before the write. */
      const barsBefore = action.key === 'barWidth' ? resolvedBars(g) : null;
      // §9 is enforced here too, not only in the panel: the panel's min/max attributes are advisory
      // (a pasted value walks straight past them), so the reducer is the last place that can
      // guarantee Σ barW_i + gap*(n-1) ≤ usable regardless of what the caller passes.
      // NOTE cardWidth is a TIER-level key (§2/§3/§8) and arrives here, not via SET_BOX_FIELD,
      // even though §14 places its control in the panel's `box` screen.
      if (action.key === 'barWidth' || action.key === 'cardWidth' || action.key === 'cornerRadius') {
        val = numOrUndef(val);
        if (val !== undefined) {
          if (action.key === 'barWidth') val = clampTierBar(g, action.i, val);
          else if (action.key === 'cardWidth') val = clampCardWidth(g, action.i, val);
          else val = clampCornerRadius(g, action.i, val);
        }
      }
      if (val === undefined) delete g.tiers[action.i][action.key]; // empty IS the reset (§10)
      else g.tiers[action.i][action.key] = val;
      /* Clearing a per-tier bar width RAISES freeCount, so the GLOBAL width suddenly spreads across
         more tiers than it was validated against — the residual overflow R2 measured (122/160,000
         sequences, worst 87px). Re-clamp the global ONLY. That is not the "resize other tiers" §9
         forbids: it re-validates the single field whose meaning just changed, exactly as §9 already
         mandates on a width/tier-count change. Other tiers' explicit values are never touched. */
      if (action.key === 'barWidth' && val === undefined && g.barWidth != null) {
        g.barWidth = clampGlobalBar(g, g.barWidth);
      }
      // §16c A11 — LAST: the global re-clamp just above can move the resolved widths again, and
      // the dependents must be clamped against the widths that finally settled, not the interim.
      if (barsBefore) reclampDependents(g, barsBefore);
      return { ...state, graph: g };
    }
    case 'SET_BOX_FIELD': {
      const g = clone(state.graph);
      if (action.val === undefined) delete g.tiers[action.i].box[action.key]; // empty IS the reset (§10)
      else g.tiers[action.i].box[action.key] = action.val;
      return { ...state, graph: g };
    }
    case 'SET_HERE_FIELD': {
      const g = clone(state.graph);
      g.here[action.key] = action.val;
      return { ...state, graph: g };
    }
    case 'SET_GEO': {
      const g = clone(state.graph);
      const geo = { t: String(action.geo.t), s: action.geo.s };
      if (isTok(geo.t) && !geo.s) geo.s = 100000;
      if (action.path === 'here') g.here.value = geo;
      else g.tiers[action.path].amount = geo;
      return { ...state, graph: g };
    }
    case 'IMPORT_JSON': {
      if (!action.obj || action.obj.version !== 4) return state; // caller shows invalidFile
      /* §16b A4: an imported link is the ONE path into state that never passed through a clamp —
         parseTierGraphUrl is a pure inverse of buildLink and applies no bounds, so a hand-edited
         cfg ({"bwg":400}) would render 400 in the preview and 190 in the PNG. Clamp on entry.
         clone() first: reclampGeometry mutates, and the JSON round-trip also drops the `undefined`
         geometry keys the parser emits, so an absent override stays absent (§10 auto). */
      return { ...state, graph: reclampGeometry(clone(action.obj)), selected: null };
    }
    case 'RESET_DEFAULT':
      return { ...state, graph: defaultState(), selected: null };
    default:
      return state;
  }
}

/* §11 popup fit. `--tg-chrome-h` is everything the dialog puts AROUND the image:
   header + footer + the stage column's own padding (18*2 = 36). NEITHER bar has a constant
   height. The header is `flexWrap:'wrap'`. §17 compacted it (sliders instead of the two number
   inputs, a narrower numInput, tighter button padding, no `flex:1` spacer) so its ~1000px of
   content fits the 1024px content box of the default 1056px paper on ONE row in en/he — but PL is
   ~70px longer and still wraps, as does ANY language once the paper is narrower (the paper fits
   the IMAGE, 1056px at the 640 default — it is not a flat 94vw). The FOOTER grows 26-52px on
   a message (`msg`, `tooLong`, or the insert error) — two clicks away: "Insert to campaign" on an
   unmodified graph shows `defaultUnchangedWarn`. A hard-coded 153 was measured against the
   ONE-LINE 55px header and an EMPTY 62px footer, so on every wrapped/messaged layout the root
   asked for less than it needs and the stage scrolled — the exact symptom this feature exists to
   remove. WORSE, a hard-coded footer made the measurement a FEEDBACK LOOP: the root under-sized
   its own content, the header (a column-flex item) was compressed to absorb it, the
   ResizeObserver read the SMALLER offsetHeight and republished an even smaller chrome-h. So BOTH
   bars are measured, and BOTH carry `flexShrink: 0` (see the JSX) — a measured height can then
   never be a function of the value measuring it. Only the true constant is added; the two
   fallbacks below are SSR/pre-measure only and still sum to the historical 153. */
const STAGE_PAD_H = 36;           // stage column padding 18*2 — the only genuinely fixed part
const HEADER_H_FALLBACK = 55;     // one-line header, pre-measure only
const FOOTER_H_FALLBACK = 62;     // message-less footer, pre-measure only
const CHROME_H_FALLBACK = HEADER_H_FALLBACK + FOOTER_H_FALLBACK + STAGE_PAD_H;   // = 153

/* ----------------------------- component ----------------------------- */
/**
 * TierGraphDialog — full design dialog content (rendered as BaseDialog children).
 * Props: { onClose, onInsert(url, width):Promise, mergeData, t, isRTL, classes }
 */
export default function TierGraphDialog({ onClose, onInsert, mergeData, t }) {
  const core = useSelector((s) => (s && s.core) || {});
  const userKey = core.userId || core.userID || core.subAccountId || core.SubAccountID || 'default';
  const storageKey = 'tierGraph_' + userKey;

  // always open with the LAST graph (persisted in localStorage); importing a link replaces it.
  const init = () => {
    const d = defaultState();
    let graph = d;
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // version stays 4 (contract §1): bumping it would make this gate fail for every existing
        // user and silently discard their last graph. Forward-compat is carried by the merge below
        // instead — a blob saved by an older build is layered OVER current defaults, so a key added
        // to defaultState() later can never arrive here as `undefined` and render as a hole.
        if (parsed && parsed.version === 4) {
          graph = {
            ...d,
            ...parsed,
            here: { ...d.here, ...(parsed.here || {}) },
            tiers: (parsed.tiers && parsed.tiers.length ? parsed.tiers : d.tiers).map((tr, i) => ({
              ...d.tiers[i % 4],
              ...tr,
              box: { ...d.tiers[i % 4].box, ...((tr && tr.box) || {}) },
            })),
          };
        }
      }
    } catch (e) { /* localStorage blocked/full — fall back to defaults */ }
    /* Re-clamp what we just loaded. H-e stops any FUTURE build persisting an out-of-range W/H or
       gap, but blobs written by the CURRENTLY DEPLOYED build can already hold them: its
       parseTierGraphUrl does `cfg.w || d.width` unclamped and IMPORT_JSON accepts that verbatim, so
       a user who imported a hand-edited link today has one sitting in localStorage right now. On a
       graph already inside the legal ranges this is a proven no-op (the full legal W/H domain moves
       0 values), so it costs nothing and stops a stale blob resurrecting the "state lies about what
       is drawn" class on the first open after upgrade. */
    return { graph: reclampGeometry(graph), selected: null };
  };
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const { graph, selected } = state;

  const md = Array.isArray(mergeData) ? mergeData : [];

  // measureText — re-created once fonts finish loading so widths stabilize.
  const [fontTick, setFontTick] = useState(0);
  useEffect(() => {
    let alive = true;
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (alive) setFontTick((x) => x + 1); });
    }
    return () => { alive = false; };
  }, []);
  const measureText = useMemo(() => measureTextFactory(), [fontTick]); // eslint-disable-line react-hooks/exhaustive-deps

  /* §17: the §14 barDraft/gapDraft machinery is GONE. It existed only because the two top-bar
     geometry controls were `type=number` fields the reducer clamped per keystroke (the first `1`
     of `150` snapped to the 24 floor), so the raw text had to be held un-dispatched until
     blur/Enter — which is exactly why the graph stopped updating live. Those two controls are now
     RANGE sliders (see the header JSX): every value a slider can produce is already inside
     [min, max], so there is no partially-typed state to protect and `onChange` dispatches
     immediately. FIX 4 puts a small `type=number` back BESIDE each slider for exact entry, so a
     partially-typed value exists again — but only while that one field has focus, and it is
     committed on blur/Enter. Clicking Insert or Cancel fires blur (mousedown precedes click), so
     the commit lands before the action; only ESCAPE, which closes the MUI dialog without a blur,
     discards it — the same "escape throws the edit away" every other commit-on-blur field has, and
     the graph it discards was never dispatched, so the flush below still has nothing to commit. */

  // debounced persistence to localStorage on EVERY change — never let it break the UI.
  // Holds the write the pending timer would perform; `done` flips once the timer has fired (H-f).
  const pendingWrite = useRef(null);
  useEffect(() => {
    // §16b A3: the write is UNCONDITIONAL. §12's `userKey === 'default'` guard was defending against
    // a hydration race that cannot happen — coreSlice carries none of userId/userID/subAccountId/
    // SubAccountID, so userKey is ALWAYS 'default' and the guard fired for every user, meaning the
    // last graph was never saved for anyone. The key itself must also stay 'tierGraph_' + userKey:
    // switching it to core.email would orphan every graph already saved under the old key.
    const rec = { graph, storageKey, done: false };
    pendingWrite.current = rec;
    const id = setTimeout(() => {
      rec.done = true;                          // fired — this graph is on disk already
      try { localStorage.setItem(storageKey, JSON.stringify(graph)); } catch (e) { /* noop */ }
    }, 500);
    return () => clearTimeout(id);
  }, [graph, storageKey]);
  /* H-f: FLUSH the debounce on unmount. The cleanup above cancels the pending timer, so an edit
     made within 500ms of clicking Insert or Cancel was never persisted at all — directly against
     §0.4 ("the dialog still opens on the user's last graph"), and silently, because every SLOWER
     edit does persist. This is a SEPARATE mount-lifetime effect on purpose: the effect above also
     cleans up on every `graph` change, where writing would defeat the debounce entirely. React
     runs unmount cleanups in declaration order, so `clearTimeout` has already run when this one
     fires; `pendingWrite.done` says whether the timer had already fired, so an unchanged, already-
     written graph is never written twice. It writes the SAME value the timer would
     have written 500ms later — no new state, and nothing changes for a dialog left open.
     §17: it no longer has to commit top-bar drafts first. That step existed because Escape closes
     the MUI dialog WITHOUT firing blur, so a value typed into the commit-on-blur Gap field was
     dropped by React and then persisted over by this very flush. The sliders dispatch on every
     change, so the graph in `pendingWrite` already contains every edit and `p.done` is once again
     a sufficient reason to skip the write. */
  useEffect(() => () => {
    const p = pendingWrite.current;
    if (!p) return;
    pendingWrite.current = null;
    if (p.done) return;                    // the timer already put this exact graph on disk
    try { localStorage.setItem(p.storageKey, JSON.stringify(p.graph)); } catch (e) { /* noop */ }
  }, []);

  const headerRef = useRef(null);        // the wrapping header row — variable-height chrome
  const footerRef = useRef(null);        // the footer row — grows 26-52px when it shows a message
  const publishChrome = useRef(null);    // latest publish fn, owned by the mount effect below
  const publishedChrome = useRef(null);  // last value written to --tg-chrome-h ('153px'), or null

  // §11 popup fit: publish the image box on <html> so the OUTER MUI paper (ganaralStyle
  // `tierGraphDialogContainer`, which BaseDialog takes as a CLASS NAME, not a style object) can
  // size itself to the image instead of always taking 94vw. Cleaned up on unmount so no other
  // dialog ever inherits them.
  useLayoutEffect(() => {
    if (typeof document === 'undefined' || !document.documentElement) return undefined;
    const root = document.documentElement;
    root.style.setProperty('--tg-img-w', graph.width + 'px');
    root.style.setProperty('--tg-img-h', graph.height + 'px');
    return () => {
      root.style.removeProperty('--tg-img-w');
      root.style.removeProperty('--tg-img-h');
    };
  }, [graph.width, graph.height]);

  /* --tg-chrome-h: MEASURED off the real header (see the CHROME_* note above), never assumed.
     Mount-scoped on purpose — the observer is installed once and the publish closure reads only
     refs and `root`, so it can never go stale. Cleanup mirrors the effect above: the observer /
     listener is torn down AND the custom property removed, so no other dialog inherits it. */
  useLayoutEffect(() => {
    if (typeof document === 'undefined' || !document.documentElement) return undefined;
    const root = document.documentElement;
    /* `offsetHeight` FIRST, not `getBoundingClientRect()`: the rect reports the TRANSFORMED box,
       so a dialog opening under a scale transition would measure a shrunken bar and keep that
       number for good — a ResizeObserver reports the LAYOUT box and never fires when a transform
       ends. offsetHeight is that same layout box, already an integer. rect is only the fallback
       (an inline/absent layout box), and it is ceil'd: half a pixel short brings back the exact
       scrollbar this effect exists to remove. */
    const measure = (el) => (el
      ? Math.ceil(el.offsetHeight || (el.getBoundingClientRect && el.getBoundingClientRect().height) || 0)
      : 0);
    const publish = () => {
      // Each bar falls back INDEPENDENTLY, so a missing ref degrades to its own historical
      // constant instead of throwing the whole sum away; with both absent this is still 153.
      const h = measure(headerRef.current);
      const f = measure(footerRef.current);
      const px = ((h > 0 ? h : HEADER_H_FALLBACK) + (f > 0 ? f : FOOTER_H_FALLBACK) + STAGE_PAD_H) + 'px';
      if (px === publishedChrome.current) return;   // unchanged: no style write, no restyle churn
      publishedChrome.current = px;
      root.style.setProperty('--tg-chrome-h', px);
    };
    publishChrome.current = publish;
    publish();

    /* ONE ResizeObserver, watching BOTH bars: it catches every chrome height change — viewport
       resize, font load, a wrapped row appearing, a footer message rendering — including the ones
       that happen with no re-render at all. Where it is missing (old Safari/Edge) the `resize`
       listener covers the viewport case and the per-commit effect below covers language /
       tier-count / width. Referenced off `window` so a missing global is a falsy read rather than
       a ReferenceError. It cannot self-trigger: both observed elements are `flexShrink: 0`, so
       what it publishes (the container's HEIGHT) is not an input to what it measures. */
    const RO = typeof window !== 'undefined' ? window.ResizeObserver : null;
    let ro = null;
    let onWinResize = null;
    if (RO && (headerRef.current || footerRef.current)) {
      ro = new RO(publish);
      if (headerRef.current) ro.observe(headerRef.current);
      if (footerRef.current) ro.observe(footerRef.current);
    } else if (typeof window !== 'undefined' && window.addEventListener) {
      onWinResize = publish;
      window.addEventListener('resize', onWinResize);
    }
    return () => {
      publishChrome.current = null;
      if (ro) ro.disconnect();
      if (onWinResize && typeof window !== 'undefined') window.removeEventListener('resize', onWinResize);
      publishedChrome.current = null;
      root.style.removeProperty('--tg-chrome-h');
    };
  }, []);
  /* Re-measure when the chrome's CONTENT can have changed. This is the fallback path for browsers
     with no ResizeObserver (the RO already catches everything, re-render or not), so it only has
     to cover the height inputs a re-render brings: the language (`t` — a new identity on every
     i18n change, which is what catches a header WRAP after switching to pl/he), the canvas W/H,
     and the active tier count.
     It ran with NO dependency array before, which made every commit read `offsetHeight` and force
     a synchronous style+layout flush — including one per KEYSTROKE in any editor-panel text field
     and on every re-render of the un-memoized parent. `nOf(graph)` is called inline rather than
     reusing the `nActive` further down: that const is declared BELOW this hook, so naming it here
     is a TDZ ReferenceError. */
  useLayoutEffect(() => { if (publishChrome.current) publishChrome.current(); },
    [graph.width, graph.height, nOf(graph), t]);

  const [inserting, setInserting] = useState(false);
  const [msg, setMsg] = useState(null);            // footer message { kind:'error'|'warn', text }
  const [defaultAcked, setDefaultAcked] = useState(false); // "add anyway" ack for an unchanged graph
  const [importOpen, setImportOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [importError, setImportError] = useState(null);
  /* §17: the two top-bar geometry controls hold NO local state for the SLIDER — every value a
     slider can produce is already inside [min, max], so it dispatches live. The one draft slot
     below belongs to the exact-entry readouts added by FIX 4 (see the note above `geoText`): at
     most one of the two fields can be mid-typing, and it is committed on blur/Enter. */
  const [geoDraft, setGeoDraft] = useState(null);   // { key, text } | null

  const { url } = buildLink(graph);
  const cfgPart = url.split('cfg=')[1];
  const cfgLen = cfgPart ? cfgPart.split('&')[0].length : 0;
  const tooLong = cfgLen > 4096 || url.length > 6000;

  const isDefaultGraph = () => JSON.stringify(graph) === JSON.stringify(defaultState());

  const onInlineAmountEdit = (index, newText) => {
    const cur = graph.tiers[index].amount;
    dispatch({ type: 'SET_GEO', path: index, geo: { t: newText, s: cur.s } });
  };

  const handleInsert = async () => {
    setMsg(null);
    if (tooLong) { setMsg({ kind: 'error', text: t('campaigns.tierGraph.urlTooLong') }); return; }
    // validation: warn once if nothing was customized (maybe they forgot to edit the sample)
    if (isDefaultGraph() && !defaultAcked) {
      setDefaultAcked(true);
      setMsg({ kind: 'warn', text: t('campaigns.tierGraph.defaultUnchangedWarn') });
      return;
    }
    setInserting(true);
    try {
      await onInsert(url, graph.width);
    } catch (e) {
      setInserting(false);
      // append the real failure detail — turns the opaque "failed" into a diagnosable message.
      const detail = e && (e.message || String(e));
      setMsg({ kind: 'error', text: t('campaigns.tierGraph.insertError') + (detail ? ' — ' + detail : '') });
      return;
    }
    onClose(); // success — close the dialog (no setState after this)
  };

  // "import image" — load an existing graph back from its image link (inverse of buildLink).
  const handleImportOpen = () => { setLinkInput(''); setImportError(null); setImportOpen(true); };
  const handleImportConfirm = () => {
    const parsed = parseTierGraphUrl(linkInput);
    if (!parsed || parsed.version !== 4) {
      setImportError(t('campaigns.tierGraph.invalidFile'));
      return;
    }
    dispatch({ type: 'IMPORT_JSON', obj: parsed });
    setDefaultAcked(false);
    setMsg(null);
    setImportOpen(false);
  };

  /* §17: the header has to hold SEVEN groups on one row inside the default paper's 1024px content
     box (the paper fits the image: 640 + 416 = 1056px). The padding/width numbers below are the
     compaction that buys the ~120px this needed — do not widen them back without re-measuring. */
  const btn = {
    border: 0, borderRadius: 8, padding: '7px 10px', fontWeight: 700, cursor: 'pointer',
    background: '#f3f4f8', color: '#1f2430', fontSize: 12.5,
  };
  const primaryBtn = { ...btn, background: '#1565d8', color: '#fff', padding: '9px 22px', fontSize: 14 };
  const segBtn = (on) => ({ border: 0, background: on ? '#4f46e5' : '#fff', color: on ? '#fff' : '#6b7280', padding: '5px 9px', fontWeight: 700, cursor: 'pointer', fontSize: 13 });
  // 52px still fits a 4-digit width plus the spinner (~46px of content) — the W/H fields only.
  const numInput = { width: 52, fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '5px 7px' };
  const rangeInput = { width: 80, margin: 0, padding: 0, accentColor: '#4f46e5', cursor: 'pointer' };
  // §17 (FIX 4): the live readout is ALSO the exact-entry field. 48px holds three digits plus the
  // spinner at 12.5px — the smallest that does; the header has no width to spare (see §17 note).
  const readoutInput = {
    width: 48, boxSizing: 'border-box', fontSize: 12.5, textAlign: 'center',
    border: '1px solid #e2e6ee', borderRadius: 7, padding: '4px 3px', fontVariantNumeric: 'tabular-nums',
  };

  const nActive = nOf(graph);
  const gapDisabled = nActive < 2;                 // §9: no inter-bar space to distribute at n == 1
  const crowded = bubbleCrowded(graph);            // §9 SOFT warning — amber affordance, never a block
  // The amber colour alone is an unexplained affordance. Pair it with the §13 warning string so the
  // user is told WHAT is wrong and HOW to fix it. `title` (not an inline row) on purpose: it adds no
  // layout at all — and a header row that DOES appear is now measured (--tg-chrome-h) rather than
  // assumed, so a wrap-jump costs the stage nothing either way.
  const crowdedHint = crowded ? t('campaigns.tierGraph.bubbleCrowdedWarn') : undefined;
  /* §9 ceilings for the two top-bar geometry controls, each read from the SAME function its clamp
     uses (`gapMaxOf` / `globalBarMaxOf`) so a `max` can never disagree with the reducer — §16c A13
     / §16d A18. Both are FLOORED, which since §16d A21(a) is an exact mirror rather than a
     compromise: the reducer now stores integers, so `floor(hi)` IS the largest value it can keep.
     `step` is 1 for the same reason. §17 (report #5): these ARE "the maximum according to the image
     width" — both are functions of `usable = W - 92`. Since FIX 1/FIX 3 they bound the DISPLAYED
     value only; the two sliders carry their own, wider/narrower track ceilings (see below), because
     a clamp ceiling and a usable track are not the same requirement. */
  const gapMax = Math.floor(gapMaxOf(graph));
  const barMax = Math.floor(globalBarMaxOf(graph));
  /* §17 (reports #1/#2/#3/#5) — the two geometry controls are RANGE SLIDERS.
     WHY NOT a number input: with the override absent (§10 auto) its `value` was '', and the first
     spinner click on an EMPTY number input jumps to the `min` attribute — 24 for the bar, 1 for the
     gap, which is exactly what the user hit. Showing the RESOLVED value instead fixes that at the
     root, and a slider additionally has no partially-typed state, so the §14 draft (commit on
     blur/Enter — the reason the graph stopped following the control) is no longer needed.
     DISPLAYED VALUE = the override if set, else the computed AUTO value, which is derived from the
     image width — report #1. Clamped into the slider's own [min, max] so the thumb and the readout
     can never disagree (round(auto) can land 1px above floor(max)). */
  const barSet = geoNum(graph.barWidth);
  const gapSet = geoNum(graph.gap);
  const barVal = clampInt(barSet != null ? barSet : autoBarOf(graph), BAR_MIN, barMax);
  const gapVal = clampInt(gapOf(graph), 0, gapMax);
  /* §17 (FIX 1) — the SLIDER's ceiling, which is deliberately NOT the reducer's. `globalBarMaxOf`
     subtracts the CURRENT gap, so with no per-tier override it collapses to the very expression
     `autoBarOf` uses: `barVal === barMax` on every auto graph and the thumb had ZERO travel to the
     right (default 640/n=4: 116 of 116 — a dead control). The track therefore runs to the ceiling
     that would apply if the gap went to zero, `min(190, floor(usable / n))` = 137 at the default,
     which is the widest bar the canvas can ever hold. The reducer's clamp is UNTOUCHED and still
     decides what is stored, so dragging past what currently fits settles at the true limit — honest
     feedback rather than a control that cannot move. No gap-shrinking, no redistribution.
     `barVal` can legitimately sit ABOVE that ceiling when pinned neighbours inflate the auto share
     (W=320, three tiers at 24 -> 121 > 57), so the max widens to it: a `value` above `max` is
     silently pinned by the DOM and the readout beside it would then lie. */
  const barSliderMax = Math.max(barVal, Math.min(BAR_MAX, Math.floor(usableOf(graph) / nOf(graph))));
  /* §17 (FIX 3) — the gap slider is CAPPED at 120px. `gapMaxOf` is the reducer's raw clamp ceiling
     and reaches 1260 at W=1400/n=2; on an 80px track that squeezes every useful value into the
     leftmost ~2% of the travel. 120 is already far past any legible layout. The clamp is unchanged,
     so a larger value can still be typed, stored or imported — and when one IS stored the max
     widens to it, for the same "the thumb must be able to represent the value" reason as above. */
  const gapSliderMax = Math.max(gapVal, Math.min(gapMax, 120));
  const geoIsAuto = barSet == null && gapSet == null;
  /* Commit LIVE (report #3) — but ONLY when the requested integer differs from the one already
     displayed. That single guard is what keeps AUTO reachable: with the key absent the slider sits
     on the auto value, so a drag that lands back on it writes nothing and `graph.barWidth` / `gap`
     stay ABSENT. Absent is what buildLink's `!= null` cfg guards, isDefaultGraph() and the
     persisted blob all read as "never customised" — a default graph therefore still emits a cfg
     with no `bwg` and no `gp`, and the "you haven't changed anything" warning still fires. */
  const setGeo = (key, raw, shown) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v === shown) return;
    dispatch({ type: 'SET_BG_FIELD', key, val: v });
  };
  /* §17 (FIX 4) — the readout is a small `type=number`, so an EXACT value can be typed and not only
     dragged, and it feeds the SAME `setGeo` path as the slider. Typing must not dispatch per
     keystroke — that is precisely the §14 bug this feature removed (the first `1` of `150` was
     clamped to the 24 floor and the field fought the user) — so the raw text sits in ONE draft slot
     and is committed on blur/Enter, while the slider keeps committing live on change. Only one of
     the two fields can be mid-typing, hence one slot keyed by `key`. An EMPTY draft is discarded
     rather than dispatched: `Number('')` is 0, so clearing the box would otherwise write a real
     override (gap 0 / bar 24) — auto is reached with the reset button beside it, which is what that
     button is for. Dragging the slider clears any draft so the two can never disagree. */
  const geoText = (key, shown) => (geoDraft && geoDraft.key === key ? geoDraft.text : String(shown));
  const commitGeoDraft = (key, shown) => {
    const d = geoDraft;
    if (!d || d.key !== key) return;
    setGeoDraft(null);                                 // always drop the draft; `shown` takes over
    if (String(d.text).trim() === '') return;          // not a value — revert, never write 0
    setGeo(key, d.text, shown);                        // setGeo re-checks finite + "already shown"
  };
  // label + slider + px readout/entry field. The readout is also the AUTO affordance the placeholder
  // used to be: muted grey while the value is auto-derived, solid once it is an override, amber
  // (with the §9 hint) while the bubbles are crowded.
  const geoSlider = (key, label, shown, isAuto, min, max, disabled) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.45 : 1 }} title={crowdedHint}>
      <label style={{ fontSize: 12.5 }} htmlFor={'tg-' + key}>{label}</label>
      <input
        id={'tg-' + key} type="range" min={min} max={max} step={1}
        value={shown}
        disabled={disabled}
        onChange={(e) => { setGeoDraft(null); setGeo(key, e.target.value, shown); }}
        style={rangeInput}
      />
      <input
        type="number" min={min} max={max} step={1}
        aria-label={label}
        value={geoText(key, shown)}
        disabled={disabled}
        onChange={(e) => setGeoDraft({ key, text: e.target.value })}
        onBlur={() => commitGeoDraft(key, shown)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commitGeoDraft(key, shown); }
          else if (e.key === 'Escape') setGeoDraft(null);
        }}
        style={{
          ...readoutInput,
          color: crowded ? '#b45309' : (isAuto ? '#8a94a6' : '#1f2430'), fontWeight: isAuto ? 500 : 700,
        }}
      />
    </div>
  );

  return (
    /* §11: track graph.height so the popup has no tall grey band under the image, but keep the 80vh
       cap and the 480px floor. Deliberately NOT tied to panel selection — that reintroduces the
       dialog-jump bug 80vh was introduced to fix. --tg-chrome-h is PUBLISHED from the measured
       header AND the measured footer (see the CHROME_* note); the 153px here is only the
       pre-measure fallback, and it is the sum of the three CHROME_* fallbacks by construction. */
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', height: 'min(max(480px, calc(var(--tg-img-h, 420px) + var(--tg-chrome-h, 153px))), 80vh)' }}>
      {/* header — measured (headerRef): it WRAPS, so its height is not a constant.
          `flexShrink: 0` is LOAD-BEARING, not cosmetic: this element is both a column-flex item of
          a height-constrained root AND the thing --tg-chrome-h is measured from. Shrinkable, an
          under-sized root compresses it, the ResizeObserver reads the compressed offsetHeight and
          republishes a smaller chrome-h — a monotonically shrinking header plus "ResizeObserver
          loop completed with undelivered notifications". At 0 its layout height depends only on
          its own content and the paper's WIDTH, so the loop has no edge to close. */}
      <div ref={headerRef} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid #e2e6ee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontWeight: 500, fontSize: 12.5 }}>{t('campaigns.tierGraph.tiersCount')}</label>
          <div style={{ display: 'flex', border: '1px solid #e2e6ee', borderRadius: 8, overflow: 'hidden' }}>
            {[1, 2, 3, 4].map((num) => (
              <button key={num} type="button" style={segBtn(graph.tierCountActive === num)} onClick={() => dispatch({ type: 'SET_TIER_COUNT', n: num })}>{num}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12.5 }}>{t('campaigns.tierGraph.widthLabel')}</label>
          <input type="number" min={320} max={1400} step={10} value={graph.width} onChange={(e) => dispatch({ type: 'SET_BG_FIELD', key: 'width', val: parseFloat(e.target.value) || 640 })} style={numInput} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12.5 }}>{t('campaigns.tierGraph.heightLabel')}</label>
          <input type="number" min={320} max={900} step={10} value={graph.height} onChange={(e) => dispatch({ type: 'SET_BG_FIELD', key: 'height', val: parseFloat(e.target.value) || 420 })} style={numInput} />
        </div>
        {geoSlider('barWidth', t('campaigns.tierGraph.barWidthLabel'), barVal, barSet == null, BAR_MIN, barSliderMax, false)}
        {geoSlider('gap', t('campaigns.tierGraph.gapLabel'), gapVal, gapSet == null, 0, gapSliderMax, gapDisabled)}
        {/* §17 (report #4) — reset the TWO geometry overrides to auto, and nothing else. Deliberately
            NOT `RESET_DEFAULT`: "Load sample" throws the whole graph away, which is not what someone
            who only over-shot a slider wants. `val: ''` is §10's existing reset — SET_BG_FIELD maps it
            through numOrUndef to `undefined` and DELETES the key, so the graph goes back to emitting
            no geometry at all. Sits inside the geometry cluster and disables itself once both are
            already auto, which is what tells it apart from the whole-graph button on the right. */}
        <button
          type="button"
          style={geoIsAuto ? { ...btn, opacity: 0.45, cursor: 'default' } : btn}
          disabled={geoIsAuto}
          title={t('campaigns.tierGraph.resetGeometryHint')}
          onClick={() => {
            dispatch({ type: 'SET_BG_FIELD', key: 'barWidth', val: '' });
            dispatch({ type: 'SET_BG_FIELD', key: 'gap', val: '' });
          }}
        >
          {t('campaigns.tierGraph.resetGeometry')}
        </button>
        {/* §17 (report #6): `marginInlineStart:'auto'` instead of a `<div style={{flex:1}}/>` spacer.
            The spacer never caused the wrap (a flex-basis-0 item adds 0 to the intrinsic width) but it
            did cost one extra 10px gap; `auto` right-aligns these two identically, RTL included. */}
        <button type="button" style={{ ...btn, marginInlineStart: 'auto' }} onClick={handleImportOpen}>{t('campaigns.tierGraph.importImage')}</button>
        <button type="button" style={btn} onClick={() => dispatch({ type: 'RESET_DEFAULT' })}>{t('campaigns.tierGraph.loadSample')}</button>
      </div>

      {/* body: stage + editor panel.
          NOTE: flexWrap MUST stay 'nowrap' — with 'wrap' the row's height is driven by the tallest
          item's CONTENT (not the container), so the editor panel grows past the dialog and the footer
          overlaps it instead of the panel scrolling. nowrap + minHeight:0 lets each column scroll. */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, flexDirection: 'row', flexWrap: 'nowrap' }}>
        {/* stage: NO horizontal scroll (overflowX hidden) — this also kills the scrollbar-induced
            "jump" when selecting an element; only the panel scrolls, vertically. */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowX: 'hidden', overflowY: 'auto', padding: 18, background: '#eef1f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: graph.width, boxShadow: '0 8px 30px rgba(0,0,0,.14)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            <TierGraphStage
              graph={graph}
              selected={selected}
              onSelect={(sel) => dispatch({ type: 'SELECT', selected: sel })}
              onInlineAmountEdit={onInlineAmountEdit}
              measureText={measureText}
            />
          </div>
        </div>
        <aside style={{ flex: '0 0 380px', minWidth: 380, minHeight: 0, boxSizing: 'border-box', borderInlineStart: '1px solid #e2e6ee', overflowX: 'hidden', overflowY: 'auto', padding: 16, background: '#fff' }}>
          <TierGraphEditorPanel graph={graph} selected={selected} dispatch={dispatch} mergeData={md} t={t} />
        </aside>
      </div>

      {/* footer: messages + actions — measured (footerRef) and `flexShrink: 0` for exactly the
          reasons on the header: it GROWS 26-52px whenever a message renders, and it is the other
          half of --tg-chrome-h. */}
      <div ref={footerRef} style={{ borderTop: '1px solid #e2e6ee', flexShrink: 0, padding: '12px 16px', background: '#fbfcfe' }}>
        {msg ? <div style={{ marginBottom: 8, fontSize: 12.5, textAlign: 'center', color: msg.kind === 'error' ? '#b42318' : '#b54708' }}>{msg.text}</div> : null}
        {tooLong ? <div style={{ marginBottom: 8, fontSize: 12.5, textAlign: 'center', color: '#b42318' }}>{t('campaigns.tierGraph.urlTooLong')}</div> : null}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="button" style={{ ...btn, background: '#f3f4f8' }} onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" style={{ ...primaryBtn, opacity: inserting || tooLong ? 0.6 : 1 }} disabled={inserting || tooLong} onClick={handleInsert}>
            {t('campaigns.tierGraph.insertButton')}
          </button>
        </div>
      </div>

      {/* import-from-link popup */}
      {importOpen ? (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(17,21,29,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 15 }}
          onClick={() => setImportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(540px, 92%)', background: '#fff', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,.35)', padding: '24px 26px', direction: 'rtl' }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t('campaigns.tierGraph.importImage')}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>{t('campaigns.tierGraph.importImageHint')}</div>
            <input
              autoFocus
              type="text"
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setImportError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleImportConfirm(); if (e.key === 'Escape') setImportOpen(false); }}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, border: '1px solid #cfd6e0', borderRadius: 9, padding: '11px 12px', direction: 'ltr' }}
            />
            {importError ? <div style={{ color: '#b42318', fontSize: 12.5, marginTop: 8 }}>{importError}</div> : null}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', marginTop: 20 }}>
              <button type="button" style={{ ...primaryBtn, padding: '10px 24px' }} onClick={handleImportConfirm}>{t('campaigns.tierGraph.importImageConfirm')}</button>
              <button type="button" style={{ ...btn, padding: '10px 20px' }} onClick={() => setImportOpen(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
