import React from 'react';
import ColorField from './fields/ColorField';
import GeoField from './fields/GeoField';
import TokenTextField from './fields/TokenTextField';
import ToggleField from './fields/ToggleField';
import { computeLayout, geoNum } from './tierGraphCore';

/**
 * NumField — a PLAIN number input. Deliberately NOT token-capable: geometry values
 * must never travel through geoSlot/txtSlot, because that bumps pCounter and renumbers
 * every pN — which would break every graph link already sent.
 *
 * `placeholder` opts the field into the "auto" convention (same as the font-size input
 * in GeoField): the field shows the inherited/auto value as a placeholder, and CLEARING
 * it is the reset — it emits `undefined`, not 0. Without a placeholder the legacy
 * empty -> 0 behaviour is kept for width / height / axisMax.
 *
 * §17 (FIX 5): `resolved` is the value the renderers actually DRAW when there is no override —
 * displayed, in muted grey, wherever `value` is absent. This is the same bug the top bar's sliders
 * were built to fix, still living here: an EMPTY number input jumps to its `min` on the first
 * spinner click, so selecting a tier and nudging "Bar width" snapped straight to 24 — the exact
 * report. Showing the resolved number means the spinner steps from where the user already is.
 * Opt-in per field: a call site that passes no `resolved` behaves exactly as before (width /
 * height / axis max keep the legacy empty -> 0 contract, and card width is excluded on purpose —
 * see its call site).
 * DISPLAY ONLY — nothing here calls `onChange`, so a graph that was never edited still holds no
 * geometry keys and buildLink still emits a cfg without them; `''` remains the reset, because the
 * user can still clear the field and `emit('')` is untouched.
 */
function NumField({ label, value, min, max, step, placeholder, resolved, onChange }) {
  const auto = placeholder != null;
  const emit = (raw) => {
    if (raw === '') return onChange(auto ? undefined : 0);
    const n = parseFloat(raw);
    return onChange(Number.isNaN(n) ? (auto ? undefined : 0) : n);
  };
  // Grey + regular weight while the number on screen is the auto one, solid + bold once it is an
  // override — the affordance the (now rarely visible) "Auto (N)" placeholder used to carry, and
  // the same convention the header readouts use.
  const showsAuto = value == null && resolved != null;
  const shown = value == null ? (resolved == null ? '' : resolved) : value;
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        value={shown}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => emit(e.target.value)}
        style={{
          width: '100%', fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px',
          color: showsAuto ? '#8a94a6' : '#1f2430', fontWeight: showsAuto ? 400 : 700,
        }}
      />
    </div>
  );
}

// Reads the resolved value for tier i out of a computeLayout array (contract §4 — every
// consumer indexes the per-tier array; there is no scalar fallback). Returns undefined
// rather than NaN so a stale selection index simply shows no hint.
const at = (arr, i) => {
  const v = Array.isArray(arr) ? arr[i] : undefined;
  return Number.isFinite(v) ? v : undefined;
};
// "auto (N)" placeholder — absent when the auto value cannot be resolved.
const autoHint = (t, v) => (v == null ? undefined : t('campaigns.tierGraph.autoPlaceholder', { v: Math.round(v) }));
// §17 (FIX 5): the resolved number a field DISPLAYS while it carries no override. ROUNDED, because
// every geometry input is `step={1}` — an unrounded 116.45 would render the field `:invalid`.
const autoShown = (v) => (v == null ? undefined : Math.round(v));

/* ---- §16c A13: min/max mirror the REDUCER's clamps ------------------------------------------
   `min`/`max` on a number input stay advisory (a paste walks past them; the reducer in
   TierGraphDialog.jsx is authoritative) — but a bound that DISAGREES with the clamp is worse than
   no bound at all: the browser marks the field `:invalid` and the spinner offers values the reducer
   silently snaps back. Both expressions below are read off `computeLayout`'s return (§4: n, usable,
   gap, barWs) so they track W / n / every override live. They are the second copy of §9's
   arithmetic, by design (see the B4 ledger entry) — if §9 moves, the reducer AND these move. */
const BAR_MIN = 24;
const BAR_MAX = 190;
/* Per-tier bar-width ceiling, mirroring clampTierBar:
     max(24, min(190, usable - gap*(n-1) - Σ committed widths of the OTHER active tiers))
   where a tier commits its own override, else the global, else only the 24px floor — an AUTO tier
   shrinks to fit, so it commits nothing more than the floor. A hard-coded max={190} overshoots
   whenever the canvas is small or a neighbour is pinned: at W=320/n=4 the real ceiling is 121.8,
   and at W=640/n=4 with two neighbours pinned at 190 it is 61.8. */
const tierBarMax = (graph, lay, i) => {
  const n = Number.isFinite(lay.n) ? lay.n : 1;
  const usable = Number.isFinite(lay.usable) ? lay.usable : graph.width - 92;
  const gap = Number.isFinite(lay.gap) ? lay.gap : 0;
  let committed = 0;
  for (let j = 0; j < n; j += 1) {
    if (j === i) continue;
    const tj = graph.tiers[j];
    /* §16d A21(c): read through Core's `geoNum`, never a bare `!= null` — this is the last place
       in the panel that did. An imported `{"bw":"40"}` arrives as the STRING "40" (parseTierGraphUrl
       is a pure inverse of buildLink and coerces nothing), a bare null-check accepts it, and
       `usable - gap*(n-1) - "40"` string-concatenates into `max={NaN}` — an input whose ceiling the
       browser cannot evaluate, so every value reads `:invalid`. geoNum maps a numeric string to a
       number and anything non-finite to ABSENT, exactly as the reducer's copy does. */
    const own = geoNum(tj && tj.barWidth) ?? geoNum(graph.barWidth);
    committed += own != null ? own : BAR_MIN;
  }
  // FLOORED since §16d A21(a): the reducer stores an INTEGER inside the interval, so floor(hi) is
  // the largest value it can actually keep. An exact fractional mirror would now be the thing that
  // disagrees — it lets the spinner offer 121.8 where the reducer stores 121.
  return Math.floor(Math.max(BAR_MIN, Math.min(BAR_MAX, usable - gap * (n - 1) - committed)));
};
/* Card-width bounds, mirroring clampCardWidth INCLUDING §9's inverted-interval tie-break:
     hi = min(barW_i + gap, barW_i + 84);  lo = min(90, hi)   — the UPPER bound wins.
   The old hard-coded min={90} exceeded its own max on a small canvas (W=320, n=4 -> hi ~59.85),
   which made the field permanently invalid and the spinner unusable: the browser rejected every
   value the reducer would actually have accepted. Not floored/rounded — an exact mirror, so the
   value the reducer stores at either bound is a value the input reports as valid. */
const cardBounds = (lay, i) => {
  const b = at(lay.barWs, i);
  if (b == null) return { min: 90, max: undefined };   // stale index: fall back to §9's raw floor
  const gap = Number.isFinite(lay.gap) ? lay.gap : 0;
  // FLOORED since §16d A21(a) — see tierBarMax. Flooring BOTH legs keeps the inverted case exact:
  // at W=320/n=4 the reducer stores floor(hi), and min == max == floor(hi) is the one value it
  // keeps, so the field is valid instead of permanently `:invalid` on range AND on step.
  const hi = Math.floor(Math.min(b + gap, b + 84));
  return { min: Math.min(90, hi), max: hi };
};

function Head({ icon, name, t }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6b7280', margin: '0 0 4px' }}>
        {t('campaigns.tierGraph.editElement')}
      </h2>
      <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span>{name}
      </div>
    </div>
  );
}

/**
 * TierGraphEditorPanel — the side panel; one of 4 screens per selected.type.
 * Props: { graph, selected, dispatch, mergeData, t, classes }
 */
export default function TierGraphEditorPanel({ graph, selected, dispatch, mergeData, t }) {
  if (!selected) {
    return (
      <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 40, lineHeight: 1.8 }}>
        {t('campaigns.tierGraph.clickElementHint')}
      </div>
    );
  }

  if (selected.type === 'bg') {
    return (
      <div>
        <Head icon="🎨" name={t('campaigns.tierGraph.bgTitle')} t={t} />
        <ColorField label={t('campaigns.tierGraph.bgLabel')} value={graph.bg} onChange={(v) => dispatch({ type: 'SET_BG_FIELD', key: 'bg', val: v })} />
        <NumField label={t('campaigns.tierGraph.widthLabel')} value={graph.width} min={320} max={1400} step={10} onChange={(v) => dispatch({ type: 'SET_BG_FIELD', key: 'width', val: v })} />
        <NumField label={t('campaigns.tierGraph.heightLabel')} value={graph.height} min={320} max={900} step={10} onChange={(v) => dispatch({ type: 'SET_BG_FIELD', key: 'height', val: v })} />
        <NumField label={t('campaigns.tierGraph.axisMaxLabel')} value={graph.axisMax} min={0} step={1000} onChange={(v) => dispatch({ type: 'SET_BG_FIELD', key: 'axisMax', val: v })} />
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: -8, marginBottom: 10 }}>{t('campaigns.tierGraph.axisMaxAuto')}</div>
        <ColorField label={t('campaigns.tierGraph.progressColor')} value={graph.progressFill} onChange={(v) => dispatch({ type: 'SET_BG_FIELD', key: 'progressFill', val: v })} />
      </div>
    );
  }

  if (selected.type === 'here') {
    const hr = graph.here;
    return (
      <div>
        <Head icon="📍" name={t('campaigns.tierGraph.hereTitle')} t={t} />
        <ToggleField label={t('campaigns.tierGraph.hereShow')} value={hr.show} onChange={(v) => dispatch({ type: 'SET_HERE_FIELD', key: 'show', val: v })} />
        <GeoField label={t('campaigns.tierGraph.hereValue')} geo={hr.value} mergeData={mergeData} t={t} onChange={(geo) => dispatch({ type: 'SET_GEO', path: 'here', geo })} />
        <TokenTextField label={t('campaigns.tierGraph.hereText')} value={hr.text} mergeData={mergeData} t={t} fontSize={hr.textSize} onFontSize={(v) => dispatch({ type: 'SET_HERE_FIELD', key: 'textSize', val: v })} onChange={(v) => dispatch({ type: 'SET_HERE_FIELD', key: 'text', val: v })} />
        <ColorField label={t('campaigns.tierGraph.hereColor')} value={hr.color} onChange={(v) => dispatch({ type: 'SET_HERE_FIELD', key: 'color', val: v })} />
      </div>
    );
  }

  if (selected.type === 'tier') {
    const i = selected.index;
    const tr = graph.tiers[i];
    const lay = computeLayout(graph);
    const barWi = at(lay.barWs, i);
    return (
      <div>
        <Head icon="📊" name={t('campaigns.tierGraph.tierTitle', { n: i + 1 })} t={t} />
        {/* tier amounts may be personalized too — a ##Field## resolves per-recipient at send time */}
        <GeoField label={t('campaigns.tierGraph.amountLabel')} geo={tr.amount} mergeData={mergeData} t={t} fontSize={tr.amountSize} onFontSize={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'amountSize', val: v })} onChange={(geo) => dispatch({ type: 'SET_GEO', path: i, geo })} />
        <ColorField label={t('campaigns.tierGraph.fillColor')} value={tr.fill} onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'fill', val: v })} />
        <ColorField label={t('campaigns.tierGraph.labelColor')} value={tr.labelColor} onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'labelColor', val: v })} />
        {/* geometry overrides — plain numbers, empty = inherit the global / auto value.
            §17 (FIX 5): `resolved` makes them SHOW that inherited value instead of sitting empty.
            An empty number input steps to its `min` on the first spinner click, so this field was
            still one click from snapping to 24 — the bug the top bar's sliders were built to fix,
            reported against the panel and never fixed here. Both resolved values are provably
            inside this field's own min/max (the auto bar width is `min(190, max(24, share))`, and
            `radii` is clamped by computeLayout with the exact expression used for `max` below), so
            nothing can render `:invalid`. `cardWidth` deliberately does NOT get this: core resolves
            its auto to `min(barW + 8, hi)` WITHOUT the 90px floor (tierGraphCore.js:192-194 calls
            that out), so on a small canvas the resolved value is legitimately below the field's own
            `min` and displaying it would make the input permanently invalid. */}
        <NumField
          label={t('campaigns.tierGraph.barWidthLabel')}
          value={tr.barWidth}
          resolved={autoShown(barWi)}
          min={BAR_MIN}
          max={tierBarMax(graph, lay, i)}
          step={1}
          placeholder={autoHint(t, barWi)}
          onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'barWidth', val: v })}
        />
        <NumField
          label={t('campaigns.tierGraph.cornerRadiusLabel')}
          value={tr.cornerRadius}
          resolved={autoShown(at(lay.radii, i))}
          min={0}
          max={barWi == null ? 40 : Math.min(40, Math.floor(barWi / 2))}
          step={1}
          placeholder={autoHint(t, at(lay.radii, i))}
          onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'cornerRadius', val: v })}
        />
        {/* highlight is AUTOMATIC by the "here" value now — no manual toggle */}
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{t('campaigns.tierGraph.highlightAutoNote')}</div>
      </div>
    );
  }

  if (selected.type === 'box') {
    const i = selected.index;
    const b = graph.tiers[i].box;
    const setBox = (key, val) => dispatch({ type: 'SET_BOX_FIELD', i, key, val });
    const lay = computeLayout(graph);
    const cardB = cardBounds(lay, i);   // §16c A13 — exact mirror of the reducer's clampCardWidth
    return (
      <div>
        <Head icon="🟩" name={t('campaigns.tierGraph.boxTitle', { n: i + 1 })} t={t} />
        {/* --- Row 1: its show toggle sits ABOVE the row's fields --- */}
        <ToggleField label={t('campaigns.tierGraph.row1Show')} value={b.row1Show !== false} onChange={(v) => setBox('row1Show', v)} />
        <TokenTextField label={t('campaigns.tierGraph.line1Value')} value={b.line1} mergeData={mergeData} t={t} fontSize={b.line1Size} onFontSize={(v) => setBox('line1Size', v)} onChange={(v) => setBox('line1', v)} />
        <TokenTextField label={t('campaigns.tierGraph.line1Cat')} value={b.cat1} mergeData={mergeData} t={t} fontSize={b.cat1Size} onFontSize={(v) => setBox('cat1Size', v)} onChange={(v) => setBox('cat1', v)} />
        {/* --- Row 2: its show toggle sits before the row's fields --- */}
        <ToggleField label={t('campaigns.tierGraph.row2Show')} value={b.row2Show !== false} onChange={(v) => setBox('row2Show', v)} />
        <TokenTextField label={t('campaigns.tierGraph.line2Value')} value={b.line2} mergeData={mergeData} t={t} fontSize={b.line2Size} onFontSize={(v) => setBox('line2Size', v)} onChange={(v) => setBox('line2', v)} />
        <TokenTextField label={t('campaigns.tierGraph.line2Cat')} value={b.cat2} mergeData={mergeData} t={t} fontSize={b.cat2Size} onFontSize={(v) => setBox('cat2Size', v)} onChange={(v) => setBox('cat2', v)} />
        {/* --- styling --- */}
        {/* card width is a TIER-level key (contract §2/§3/§8: tier.cardWidth -> cfg `cw`),
            so it dispatches SET_TIER_FIELD even though the control lives on the card screen */}
        <NumField
          label={t('campaigns.tierGraph.cardWidthLabel')}
          value={graph.tiers[i].cardWidth}
          min={cardB.min}
          max={cardB.max}
          step={1}
          placeholder={autoHint(t, at(lay.cardWs, i))}
          onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'cardWidth', val: v })}
        />
        <ColorField label={t('campaigns.tierGraph.boxFill')} value={b.fill} onChange={(v) => setBox('fill', v)} />
        <ColorField label={t('campaigns.tierGraph.boxTextColor')} value={b.textColor} onChange={(v) => setBox('textColor', v)} />
        <ColorField label={t('campaigns.tierGraph.boxAccent')} value={b.accent} onChange={(v) => setBox('accent', v)} />
        <div style={{ marginBottom: 13 }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>{t('campaigns.tierGraph.dotShapeLabel')}</label>
          <select value={b.dotShape || 'circle'} onChange={(e) => setBox('dotShape', e.target.value)} style={{ width: '100%', fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px', background: '#fff' }}>
            <option value="circle">{t('campaigns.tierGraph.dotShapeCircle')}</option>
            <option value="square">{t('campaigns.tierGraph.dotShapeSquare')}</option>
            <option value="dot">{t('campaigns.tierGraph.dotShapeDot')}</option>
            <option value="none">{t('campaigns.tierGraph.dotShapeNone')}</option>
          </select>
        </div>
      </div>
    );
  }

  return null;
}
