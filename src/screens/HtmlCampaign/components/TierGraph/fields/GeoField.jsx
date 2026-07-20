import React, { useRef } from 'react';
import { isTok } from '../tierGraphCore';

/**
 * GeoField — a height/amount value: free text (number or ##Field## token) plus,
 * only when a token is present, a "sample value" used for the on-canvas height
 * (the real height is decided per-recipient at send time). A new token with no
 * sample defaults to 100000 (matches the POC / SET_GEO reducer).
 * Props: { label, geo:{t,s}, onChange({t,s}), mergeData, t }
 */
export default function GeoField({ label, geo, onChange, mergeData, t }) {
  const ref = useRef(null);
  const text = geo && geo.t != null ? String(geo.t) : '';
  const sample = geo ? geo.s : undefined;
  const tok = isTok(text);
  const list = Array.isArray(mergeData) ? mergeData : [];
  const notCanonical = tok && !list.some((m) => m && m.value && text.indexOf(m.value) >= 0);

  const setT = (newT) => {
    const next = { t: newT, s: sample };
    if (isTok(newT) && !next.s) next.s = 100000;
    onChange(next);
  };
  const setS = (newS) => onChange({ t: text, s: parseFloat(newS) || 0 });

  const inject = (token) => {
    const el = ref.current;
    let pos = text.length;
    if (el && typeof el.selectionStart === 'number') pos = el.selectionStart;
    const next = text.slice(0, pos) + token + text.slice(pos);
    setT(next);
    setTimeout(() => {
      if (!el) return;
      el.focus();
      const p = pos + token.length;
      try { el.setSelectionRange(p, p); } catch (e) { /* noop */ }
    }, 0);
  };

  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>{label}</label>
      <input
        ref={ref}
        type="text"
        value={text}
        onChange={(e) => setT(e.target.value)}
        style={{
          width: '100%', fontSize: 13, color: '#1f2430', borderRadius: 7, padding: '6px 8px',
          border: '1px solid ' + (tok ? '#a5b4fc' : '#e2e6ee'), background: tok ? '#f5f7ff' : '#fff',
        }}
      />
      {list.length > 0 && (
        <select
          value=""
          onChange={(e) => { if (e.target.value) { inject(e.target.value); e.target.value = ''; } }}
          style={{ marginTop: 6, width: '100%', fontSize: 12.5, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px', background: '#fff' }}
        >
          <option value="">{t('campaigns.tierGraph.personalField')}</option>
          {list.map((m, i) => (
            <option key={i} value={m.value}>{m.name || m.value}</option>
          ))}
        </select>
      )}
      {tok && (
        <div style={{ marginTop: 6 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#6b7280' }}>
            {t('campaigns.tierGraph.sampleValueLabel')}
          </label>
          <input
            type="number"
            value={sample == null ? '' : sample}
            onChange={(e) => setS(e.target.value)}
            style={{ width: '100%', fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px' }}
          />
          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>
            {t('campaigns.tierGraph.sampleValueHint')}
          </div>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>
        {t('campaigns.tierGraph.tokenHint')}
      </div>
      {notCanonical && (
        <div style={{ fontSize: 11.5, color: '#4f46e5', marginTop: 3, lineHeight: 1.5 }}>
          {t('campaigns.tierGraph.tokenNotCanonicalHint')}
        </div>
      )}
    </div>
  );
}
