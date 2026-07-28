import React, { useState } from 'react';
import { computeLayout, sizeG, pureTok, tokName, gv, amountDisp, fmt, CUR, autoHighlightIndex, clipRx, ringRx, fontPx } from './tierGraphCore';

// greedy word-wrap: split into lines that each fit within maxW (px), via the shared canvas measurer.
function wrapLines(text, maxW, size, weight, measureText) {
  const words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    if (measureText(cur + ' ' + words[i], size, weight) <= maxW) cur += ' ' + words[i];
    else { lines.push(cur); cur = words[i]; }
  }
  lines.push(cur);
  return lines;
}

// accent mark next to a card value — shape ∈ circle | square | dot (small) | none.
function Dot({ cx, cy, r, shape, color }) {
  if (shape === 'none') return null;
  // H-d: rx 2, not 1.5 — C# draws this 10x10 mark with radius 2 (PulseemHandler.cs:3314).
  // Non-geometry, <=0.5px, and the last known JS/C# radius asymmetry (logged by F4/A15).
  if (shape === 'square') return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={2} fill={color} />;
  const rr = shape === 'dot' ? r * 0.6 : r;   // 'dot' = a smaller circle; default/circle = full
  return <circle cx={cx} cy={cy} r={rr} fill={color} />;
}

// value + colored dot + caption, centered around cx (POC centerRow).
// A value that would be wider than the card wraps to stay INSIDE the column (max 2 lines; a single
// unbreakable line that is still too wide is compressed with textLength) so text never spills sideways.
function CenterRow({ cx, y, value, cat, valColor, dotColor, dotShape, measureText, maxW, size = 15, capSize = 12 }) {
  const dotR = 5;
  const gap = 8;
  const lineH = size + 2;
  const dotSpace = dotShape === 'none' ? 0 : (dotR * 2 + gap);   // no reserved dot space when hidden → text centers
  const avail = Math.max(24, (maxW || 9999) - 12);   // usable width inside the card
  const textAvail = avail - dotSpace;
  const oneW = measureText(value, size, '700');

  // Fast path — fits on one line: render exactly as before (centered value + dot unit).
  if (oneW <= textAvail) {
    const total = dotSpace + oneW;
    const left = cx - total / 2;
    return (
      <g>
        <text x={left + oneW / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={700} fill={valColor}>{value}</text>
        <Dot cx={cx + total / 2 - dotR} cy={y} r={dotR} shape={dotShape} color={dotColor} />
        {cat ? <text x={cx} y={y + 18} textAnchor="middle" fontSize={capSize} fill="#9aa1ad">{cat}</text> : null}
      </g>
    );
  }

  // Long value — wrap (max 2 lines), compress any still-too-wide line, keep the dot by the first line.
  let lines = wrapLines(value, textAvail, size, '700', measureText);
  if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] += '…'; }
  const n = lines.length;
  const startY = y - ((n - 1) * lineH) / 2;           // vertically center the block on y
  const firstW = Math.min(measureText(lines[0], size, '700'), textAvail);
  return (
    <g>
      {lines.map((ln, i) => {
        const w = measureText(ln, size, '700');
        const fit = w > textAvail ? { textLength: textAvail, lengthAdjust: 'spacingAndGlyphs' } : {};
        return (
          <text key={i} x={cx} y={startY + i * lineH} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={700} fill={valColor} {...fit}>{ln}</text>
        );
      })}
      <Dot cx={cx + firstW / 2 + gap / 2 + dotR} cy={startY} r={dotR} shape={dotShape} color={dotColor} />
      {cat ? <text x={cx} y={startY + (n - 1) * lineH + 18} textAnchor="middle" fontSize={capSize} fill="#9aa1ad">{cat}</text> : null}
    </g>
  );
}

// editor-only selection frame (never part of the output/buildLink) — POC selBox.
function selBox(sel, L) {
  if (!sel) return null;
  const { xRight, cardX, barWs, cardWs, chartTop, chartBottom, marginX, W, H } = L;
  if (sel.type === 'bg') return { x: 2, y: 2, w: W - 4, h: H - 4 };
  if (sel.type === 'here') return { x: marginX - 8, y: chartTop - 6, w: W - (marginX - 8) * 2, h: chartBottom - chartTop + 12 };
  if (sel.index == null) return null;
  const i = sel.index;
  // per-tier widths: the tier frame tracks the BAR, the box frame tracks the CARD (they differ once
  // cardWidth is overridden) — otherwise the box frame visibly mis-frames a widened/narrowed card.
  if (sel.type === 'tier') return { x: xRight(i) - 6, y: chartTop - 50, w: barWs[i] + 12, h: chartBottom - chartTop + 56 };
  if (sel.type === 'box') return { x: cardX(i) - 2, y: chartBottom + 20 - 4, w: cardWs[i] + 4, h: 120 + 8 };
  return null;
}

/**
 * TierGraphStage — the live SVG canvas (port of the POC render()).
 * Props: { graph, selected, onSelect, onInlineAmountEdit(index, newText), measureText }
 * Layout is ALWAYS RTL-manual via xRight (tier 0 rightmost) in every UI language.
 */
export default function TierGraphStage({ graph, selected, onSelect, onInlineAmountEdit, measureText }) {
  const [edit, setEdit] = useState(null); // { index, value, left, top }
  const L = computeLayout(graph);
  // NOTE: there is no scalar `barW` — widths are per tier. Index barWs[i] / cardWs[i] / radii[i].
  const { W, H, n, marginX, chartTop, chartBottom, plotH, barWs, cardWs, radii, xRight, cardX, hereY, sizes } = L;
  const tiers = graph.tiers.slice(0, n);
  const hereVal = sizeG(graph.here.value);
  const hY = hereY(hereVal);
  const hiIdx = autoHighlightIndex(sizes, hereVal); // auto — by value, not manual (sizes from computeLayout)
  const stop = (e, fn) => { e.stopPropagation(); fn(); };

  const openInline = (e, i) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setEdit({ index: i, value: String(tiers[i].amount.t), left: r.left, top: r.top });
  };
  const commitInline = () => {
    if (edit) onInlineAmountEdit(edit.index, edit.value);
    setEdit(null);
  };

  const grid = [];
  for (let i = 1; i <= 5; i++) {
    const gy = chartTop + plotH * i / 6;
    grid.push(<line key={i} x1={marginX} y1={gy} x2={W - marginX} y2={gy} stroke="#0000000d" strokeWidth={1} />);
  }
  const sel = selBox(selected, L);

  return (
    <React.Fragment>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ fontFamily: (graph.font || 'Assistant') + ', Assistant, Heebo, Arial, sans-serif', display: 'block', width: '100%', height: 'auto' }}
      >
        <defs>
          {tiers.map((tr, i) => {
            const barTop = hereY(sizes[i]);
            const barH = chartBottom - barTop;
            // A19 (§16d): the radius arithmetic is NOT re-derived here — `clipRx` in
            // tierGraphCore is the single source shared with the self-test and mirrored
            // by C#. (A6: the half is taken over an INTEGER bar height because GDI+ must
            // integerise barTop; the rect's own y/height stay the exact float.)
            const cr = clipRx(radii[i], barTop, chartBottom);
            return (
              <clipPath key={i} id={`tgclip-${i}`}>
                <rect x={xRight(i)} y={barTop} width={barWs[i]} height={barH} rx={cr} ry={cr} />
              </clipPath>
            );
          })}
        </defs>

        <rect x={0} y={0} width={W} height={H} fill={graph.bg} style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'bg' }))} />
        {grid}

        {tiers.map((tr, i) => {
          const bx = xRight(i);
          const bw = barWs[i];               // per-tier bar width
          const barTop = hereY(sizes[i]);
          const gTop = Math.max(barTop, hY);
          // amount bubble: a pure ##token## shows the VALUE big with the field NAME small under it
          // (2 lines — stops the long "name · value" from being clipped); the bubble grows with the font.
          const isPure = pureTok(tr.amount.t);
          const valTxt = isPure ? (CUR + fmt(gv(tr.amount.t, tr.amount.s))) : amountDisp(tr.amount);
          const nameTxt = isPure ? tokName(tr.amount.t) : '';
          const valSize = fontPx(tr.amountSize, 17);   // D + grows with the font. H-b: [6,200] else 17
          const nameSize = Math.max(9, Math.round(valSize * 0.6));
          const bubW = Math.max(measureText(valTxt, valSize, '700'), nameTxt ? measureText(nameTxt, nameSize, '600') : 0);
          const pw = Math.max(94, bubW + 28);
          const ph = nameTxt ? (valSize + nameSize + 16) : (valSize + 16);
          // a narrow bar can push the (min 94px) bubble off-canvas — keep it inside the image.
          const px = Math.max(4 + pw / 2, Math.min(bx + bw / 2, W - 4 - pw / 2));
          const py = barTop - ph - 12;
          const cardY = chartBottom + 20;
          const cardXi = cardX(i);           // layout-owned; reduces to bx - 4 when cardW == bw + 8
          const cardW = cardWs[i];
          const cardH = 120;
          // A21d (§16d): C# is `Math.Min(14, Math.Min(cardW / 2, 60))` on an INT cardW, i.e.
          // integer division — floor. Both legs present: cardW/2 (width) and 60 == cardH/2.
          const cardRx = Math.min(14, Math.floor(cardW / 2), 60);
          const cardMaxW = Math.floor(cardW); // MUST be floored — C# passes an int; a 1px delta flips the wrap branch
          const cx = cardXi + cardW / 2;
          return (
            <g key={i}>
              <g clipPath={`url(#tgclip-${i})`} style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'tier', index: i }))}>
                <rect x={bx} y={barTop} width={bw} height={chartBottom - barTop} fill={tr.fill} />
                {graph.here.show && gTop < chartBottom
                  ? <rect x={bx} y={gTop} width={bw} height={chartBottom - gTop} fill={graph.progressFill} />
                  : null}
              </g>
              {i === hiIdx
                // A9 (§16c) via A19 (§16d): the cap is `ringRx` in tierGraphCore — the ONE
                // definition the self-test and C# both use; re-deriving it here is what let
                // the old assertions pass against a broken Stage. (Uncapped, SVG clamps `rx`
                // and `ry` INDEPENDENTLY and a short bar draws an ELLIPSE where the PNG draws
                // a circle. The width leg needs no cap: A8 gives radii[i] <= floor(bw/2).)
                ? <rect x={bx - 3} y={barTop - 3} width={bw + 6} height={chartBottom - barTop + 6} rx={ringRx(radii[i], barTop, chartBottom)} fill="none" stroke={graph.here.color} strokeWidth={2.5} />
                : null}
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'tier', index: i }))} onDoubleClick={(e) => openInline(e, i)}>
                {/* A15/A21d (§16d): BOTH legs, both floored. C# builds this rect as
                    `(int)Math.Min(17f, ph/2f)` over an int Rectangle — the height leg is a
                    0.5px float/int split. The WIDTH leg is provably inert on both sides
                    (pw = max(94, …) >= 94, so pw/2 >= 47 > 17) and is written out anyway so
                    the "every rounded rect caps by both legs" rule is structural, not a
                    coincidence of the 94px floor; C# needs no mirror for the same reason. */}
                <rect x={px - pw / 2} y={py} width={pw} height={ph} rx={Math.min(17, Math.floor(ph / 2), Math.floor(pw / 2))} fill="#fff" stroke="#0000000f" />
                {nameTxt ? (
                  <React.Fragment>
                    <text x={px} y={py + 6 + valSize / 2} textAnchor="middle" dominantBaseline="middle" fontSize={valSize} fontWeight={700} fill={tr.labelColor}>{valTxt}</text>
                    <text x={px} y={py + ph - 6 - nameSize / 2} textAnchor="middle" dominantBaseline="middle" fontSize={nameSize} fontWeight={600} fill="#9aa1ad">{nameTxt}</text>
                  </React.Fragment>
                ) : (
                  <text x={px} y={py + ph / 2} textAnchor="middle" dominantBaseline="middle" fontSize={valSize} fontWeight={700} fill={tr.labelColor}>{valTxt}</text>
                )}
                <path d={`M${px - 7},${py + ph} L${px + 7},${py + ph} L${px},${py + ph + 8} Z`} fill="#fff" />
              </g>
              {(() => {
                const b = tr.box;
                const r1 = b.row1Show !== false;   // E: row visibility (default shown)
                const r2 = b.row2Show !== false;
                const y1 = (r1 && r2) ? cardY + 30 : cardY + cardH / 2;         // single row centers vertically
                const y2 = (r1 && r2) ? cardY + cardH - 34 : cardY + cardH / 2;
                return (
                  <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'box', index: i }))}>
                    <rect x={cardXi} y={cardY} width={cardW} height={cardH} rx={cardRx} fill={b.fill} stroke={i === hiIdx ? graph.here.color : '#0000001a'} strokeWidth={i === hiIdx ? 2 : 1} />
                    {r1 ? <CenterRow cx={cx} y={y1} value={b.line1} cat={b.cat1} valColor={b.textColor} dotColor={b.accent} dotShape={b.dotShape} measureText={measureText} maxW={cardMaxW} size={b.line1Size || 15} capSize={b.cat1Size || 12} /> : null}
                    {r2 ? <CenterRow cx={cx} y={y2} value={b.line2} cat={b.cat2} valColor={b.textColor} dotColor={b.accent} dotShape={b.dotShape} measureText={measureText} maxW={cardMaxW} size={b.line2Size || 15} capSize={b.cat2Size || 12} /> : null}
                  </g>
                );
              })()}
            </g>
          );
        })}

        {graph.here.show ? (() => {
          const lbl = graph.here.text + ' · ' + CUR + fmt(hereVal);
          const pSize = fontPx(graph.here.textSize, 14);   // D: pill font size. H-b: [6,200] else 14
          const pBarW = barWs[hiIdx >= 0 ? hiIdx : 0];                  // the highlighted column's own width
          const colCx = hiIdx >= 0 ? xRight(hiIdx) + pBarW / 2 : W / 2; // (W - barW)/2 + barW/2 === W/2
          // the pill must NOT exceed the column width — wrap to a new line instead. It grows with the font.
          const pillMax = Math.max(40, pBarW - 24);
          const plines = wrapLines(lbl, pillMax, pSize, '700', measureText);
          const lineH = pSize + 3;
          const widest = Math.max.apply(null, plines.map((l) => measureText(l, pSize, '700')));
          const pw = Math.min(widest + 24, pBarW);
          const ph = plines.length * lineH + 12;
          const left = Math.max(marginX - 4, Math.min(colCx - pw / 2, W - marginX + 4 - pw));
          const top = hY - ph / 2;
          return (
            <g>
              <line x1={marginX - 4} y1={hY} x2={W - marginX + 4} y2={hY} stroke={graph.here.color} strokeWidth={2.5} strokeDasharray="8 6" style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))} />
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))}>
                {/* A15 (§16d, HIGH): the here-pill needs the WIDTH leg too. `pw` floors at the
                    highlighted bar's width, so at bwg:24 SVG clamped rx to 12 while ry stayed
                    at min(15, ph/2) — an ellipse against the PNG's circle, 2.5-3px. C# already
                    caps it: `Math.Min((int)Math.Min(15f, plh/2f), (int)plw/2)` (:3223); both
                    legs are floored there (int Rectangle), so A21d floors them here. */}
                <rect x={left} y={top} width={pw} height={ph} rx={Math.min(15, Math.floor(ph / 2), Math.floor(pw / 2))} fill="#eafaf0" stroke={graph.here.color} strokeWidth={1.5} />
                {plines.map((ln, k) => (
                  <text key={k} x={left + pw / 2} y={top + 6 + k * lineH + lineH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={pSize} fontWeight={700} fill="#1e7e34">{ln}</text>
                ))}
              </g>
            </g>
          );
        })() : null}

        {sel ? <rect x={sel.x} y={sel.y} width={sel.w} height={sel.h} rx={8} fill="none" stroke="#4f46e5" strokeWidth={2} strokeDasharray="5 4" style={{ pointerEvents: 'none' }} /> : null}
      </svg>

      {edit ? (
        <input
          autoFocus
          value={edit.value}
          onChange={(e) => setEdit({ ...edit, value: e.target.value })}
          onBlur={commitInline}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitInline(); }
            else if (e.key === 'Escape') { e.preventDefault(); setEdit(null); }
          }}
          style={{
            position: 'fixed', left: edit.left, top: edit.top, zIndex: 2000, minWidth: 140,
            border: '2px solid #4f46e5', borderRadius: 6, padding: '4px 6px', fontSize: 14,
            boxShadow: '0 4px 14px rgba(0,0,0,.2)', direction: 'ltr',
          }}
        />
      ) : null}
    </React.Fragment>
  );
}
