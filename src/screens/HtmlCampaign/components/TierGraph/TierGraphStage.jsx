import React, { useState } from 'react';
import { computeLayout, sizeG, isTok, amountDisp, fmt, CUR, autoHighlightIndex } from './tierGraphCore';

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

// value + colored dot + caption, centered around cx (POC centerRow).
// A value that would be wider than the card wraps to stay INSIDE the column (max 2 lines; a single
// unbreakable line that is still too wide is compressed with textLength) so text never spills sideways.
function CenterRow({ cx, y, value, cat, valColor, dotColor, measureText, maxW, size = 15, capSize = 12 }) {
  const dotR = 5;
  const gap = 8;
  const lineH = size + 2;
  const avail = Math.max(24, (maxW || 9999) - 12);   // usable width inside the card
  const textAvail = avail - (dotR * 2 + gap);         // reserve room for the accent dot
  const oneW = measureText(value, size, '700');

  // Fast path — fits on one line: render exactly as before (centered value + dot unit).
  if (oneW <= textAvail) {
    const total = dotR * 2 + gap + oneW;
    const left = cx - total / 2;
    return (
      <g>
        <text x={left + oneW / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={700} fill={valColor}>{value}</text>
        <circle cx={cx + total / 2 - dotR} cy={y} r={dotR} fill={dotColor} />
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
      <circle cx={cx + firstW / 2 + gap / 2 + dotR} cy={startY} r={dotR} fill={dotColor} />
      {cat ? <text x={cx} y={startY + (n - 1) * lineH + 18} textAnchor="middle" fontSize={capSize} fill="#9aa1ad">{cat}</text> : null}
    </g>
  );
}

// editor-only selection frame (never part of the output/buildLink) — POC selBox.
function selBox(sel, L) {
  if (!sel) return null;
  const { xRight, barW, chartTop, chartBottom, marginX, W, H } = L;
  if (sel.type === 'bg') return { x: 2, y: 2, w: W - 4, h: H - 4 };
  if (sel.type === 'here') return { x: marginX - 8, y: chartTop - 6, w: W - (marginX - 8) * 2, h: chartBottom - chartTop + 12 };
  if (sel.index == null) return null;
  const bx = xRight(sel.index);
  if (sel.type === 'tier') return { x: bx - 6, y: chartTop - 50, w: barW + 12, h: chartBottom - chartTop + 56 };
  if (sel.type === 'box') return { x: bx - 6, y: chartBottom + 20 - 4, w: barW + 12, h: 120 + 8 };
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
  const { W, H, n, marginX, chartTop, chartBottom, plotH, barW, xRight, hereY, sizes } = L;
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
            return (
              <clipPath key={i} id={`tgclip-${i}`}>
                <rect x={xRight(i)} y={barTop} width={barW} height={chartBottom - barTop} rx={18} ry={18} />
              </clipPath>
            );
          })}
        </defs>

        <rect x={0} y={0} width={W} height={H} fill={graph.bg} style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'bg' }))} />
        {grid}

        {tiers.map((tr, i) => {
          const bx = xRight(i);
          const barTop = hereY(sizes[i]);
          const gTop = Math.max(barTop, hY);
          const txt = amountDisp(tr.amount);
          const small = isTok(tr.amount.t);
          const aSize = tr.amountSize || (small ? 14 : 17);   // D: amount font size (fallback to default)
          const pw = Math.max(94, measureText(txt, aSize, '700') + 28);
          const ph = 34;
          const px = bx + barW / 2;
          const py = barTop - ph - 12;
          const cardY = chartBottom + 20;
          const cardX = bx - 4;
          const cardW = barW + 8;
          const cardH = 120;
          const cx = cardX + cardW / 2;
          return (
            <g key={i}>
              <g clipPath={`url(#tgclip-${i})`} style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'tier', index: i }))}>
                <rect x={bx} y={barTop} width={barW} height={chartBottom - barTop} fill={tr.fill} />
                {graph.here.show && gTop < chartBottom
                  ? <rect x={bx} y={gTop} width={barW} height={chartBottom - gTop} fill={graph.progressFill} />
                  : null}
              </g>
              {i === hiIdx
                ? <rect x={bx - 3} y={barTop - 3} width={barW + 6} height={chartBottom - barTop + 6} rx={21} fill="none" stroke={graph.here.color} strokeWidth={2.5} />
                : null}
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'tier', index: i }))} onDoubleClick={(e) => openInline(e, i)}>
                <rect x={px - pw / 2} y={py} width={pw} height={ph} rx={17} fill="#fff" stroke="#0000000f" />
                <text x={px} y={py + ph / 2} textAnchor="middle" dominantBaseline="middle" fontSize={aSize} fontWeight={700} fill={tr.labelColor}>{txt}</text>
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
                    <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={14} fill={b.fill} stroke={i === hiIdx ? graph.here.color : '#0000001a'} strokeWidth={i === hiIdx ? 2 : 1} />
                    {r1 ? <CenterRow cx={cx} y={y1} value={b.line1} cat={b.cat1} valColor={b.textColor} dotColor={b.accent} measureText={measureText} maxW={cardW} size={b.line1Size || 15} capSize={b.cat1Size || 12} /> : null}
                    {r2 ? <CenterRow cx={cx} y={y2} value={b.line2} cat={b.cat2} valColor={b.textColor} dotColor={b.accent} measureText={measureText} maxW={cardW} size={b.line2Size || 15} capSize={b.cat2Size || 12} /> : null}
                  </g>
                );
              })()}
            </g>
          );
        })}

        {graph.here.show ? (() => {
          const lbl = graph.here.text + ' · ' + CUR + fmt(hereVal);
          const pSize = graph.here.textSize || 14;   // D: pill font size
          // never let the pill exceed the chart width (max 100%): clamp to the usable span.
          const pw = Math.min(measureText(lbl, pSize, '700') + 30, W - (marginX - 4) * 2);
          // center the pill over the highlighted column, clamped to stay inside the chart span.
          const colCx = (hiIdx >= 0 ? xRight(hiIdx) : (W - barW) / 2) + barW / 2;
          const left = Math.max(marginX - 4, Math.min(colCx - pw / 2, W - marginX + 4 - pw));
          return (
            <g>
              <line x1={marginX - 4} y1={hY} x2={W - marginX + 4} y2={hY} stroke={graph.here.color} strokeWidth={2.5} strokeDasharray="8 6" style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))} />
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))}>
                <rect x={left} y={hY - 15} width={pw} height={30} rx={15} fill="#eafaf0" stroke={graph.here.color} strokeWidth={1.5} />
                <text x={left + pw / 2} y={hY} textAnchor="middle" dominantBaseline="middle" fontSize={pSize} fontWeight={700} fill="#1e7e34">{lbl}</text>
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
