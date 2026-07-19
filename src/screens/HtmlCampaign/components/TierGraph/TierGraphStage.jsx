import React, { useState } from 'react';
import { computeLayout, sizeG, isTok, amountDisp, numG, fmt, CUR } from './tierGraphCore';

// value + colored dot + caption, centered around cx (POC centerRow).
function CenterRow({ cx, y, value, cat, valColor, dotColor, measureText }) {
  const size = 15;
  const dotR = 5;
  const gap = 8;
  const tw = measureText(value, size, '800');
  const total = dotR * 2 + gap + tw;
  const left = cx - total / 2;
  return (
    <g>
      <text x={left + tw / 2} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={800} fill={valColor}>{value}</text>
      <circle cx={cx + total / 2 - dotR} cy={y} r={dotR} fill={dotColor} />
      {cat ? <text x={cx} y={y + 18} textAnchor="middle" fontSize={12} fill="#9aa1ad">{cat}</text> : null}
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
  const { W, H, n, marginX, chartTop, chartBottom, plotH, barW, xRight, hereY } = L;
  const tiers = graph.tiers.slice(0, n);
  const hY = hereY(sizeG(graph.here.value));
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
            const barTop = hereY(sizeG(tr.amount));
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
          const barTop = hereY(sizeG(tr.amount));
          const gTop = Math.max(barTop, hY);
          const txt = amountDisp(tr.amount);
          const small = isTok(tr.amount.t);
          const pw = Math.max(94, measureText(txt, small ? 14 : 17, '800') + 28);
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
              {tr.highlight
                ? <rect x={bx - 3} y={barTop - 3} width={barW + 6} height={chartBottom - barTop + 6} rx={21} fill="none" stroke={graph.here.color} strokeWidth={2.5} />
                : null}
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'tier', index: i }))} onDoubleClick={(e) => openInline(e, i)}>
                <rect x={px - pw / 2} y={py} width={pw} height={ph} rx={17} fill="#fff" stroke="#0000000f" />
                <text x={px} y={py + ph / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={small ? 14 : 17} fontWeight={800} fill={tr.labelColor}>{txt}</text>
                <path d={`M${px - 7},${py + ph} L${px + 7},${py + ph} L${px},${py + ph + 8} Z`} fill="#fff" />
              </g>
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'box', index: i }))}>
                <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={14} fill={tr.box.fill} stroke={tr.highlight ? graph.here.color : '#0000001a'} strokeWidth={tr.highlight ? 2 : 1} />
                <CenterRow cx={cx} y={cardY + 30} value={tr.box.line1} cat={tr.box.cat1} valColor={tr.box.textColor} dotColor={tr.box.accent} measureText={measureText} />
                <CenterRow cx={cx} y={cardY + cardH - 34} value={tr.box.line2} cat={tr.box.cat2} valColor={tr.box.textColor} dotColor={tr.box.accent} measureText={measureText} />
              </g>
            </g>
          );
        })}

        {graph.here.show ? (() => {
          const lbl = graph.here.text + ' · ' + CUR + fmt(numG(graph.here.value));
          const pw = measureText(lbl, 14, '700') + 30;
          return (
            <g>
              <line x1={marginX - 4} y1={hY} x2={W - marginX + 4} y2={hY} stroke={graph.here.color} strokeWidth={2.5} strokeDasharray="8 6" style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))} />
              <g style={{ cursor: 'pointer' }} onClick={(e) => stop(e, () => onSelect({ type: 'here' }))}>
                <rect x={W - marginX - pw} y={hY - 15} width={pw} height={30} rx={15} fill="#eafaf0" stroke={graph.here.color} strokeWidth={1.5} />
                <text x={W - marginX - pw / 2} y={hY + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#1e7e34">{lbl}</text>
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
