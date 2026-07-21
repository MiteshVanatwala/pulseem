import React from 'react';
import ColorField from './fields/ColorField';
import GeoField from './fields/GeoField';
import TokenTextField from './fields/TokenTextField';
import ToggleField from './fields/ToggleField';

function NumField({ label, value, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        value={value == null ? '' : value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
        style={{ width: '100%', fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px' }}
      />
    </div>
  );
}

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
    return (
      <div>
        <Head icon="📊" name={t('campaigns.tierGraph.tierTitle', { n: i + 1 })} t={t} />
        {/* tier amounts may be personalized too — a ##Field## resolves per-recipient at send time */}
        <GeoField label={t('campaigns.tierGraph.amountLabel')} geo={tr.amount} mergeData={mergeData} t={t} fontSize={tr.amountSize} onFontSize={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'amountSize', val: v })} onChange={(geo) => dispatch({ type: 'SET_GEO', path: i, geo })} />
        <ColorField label={t('campaigns.tierGraph.fillColor')} value={tr.fill} onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'fill', val: v })} />
        <ColorField label={t('campaigns.tierGraph.labelColor')} value={tr.labelColor} onChange={(v) => dispatch({ type: 'SET_TIER_FIELD', i, key: 'labelColor', val: v })} />
        {/* highlight is AUTOMATIC by the "here" value now — no manual toggle */}
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{t('campaigns.tierGraph.highlightAutoNote')}</div>
      </div>
    );
  }

  if (selected.type === 'box') {
    const i = selected.index;
    const b = graph.tiers[i].box;
    const setBox = (key, val) => dispatch({ type: 'SET_BOX_FIELD', i, key, val });
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
