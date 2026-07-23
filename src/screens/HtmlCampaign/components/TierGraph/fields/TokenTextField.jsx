import React, { useRef } from 'react';
import { isTok } from '../tierGraphCore';

/**
 * TokenTextField — free text that may contain a ##Field## token. A "personal
 * field" dropdown injects a canonical token (item.value, already ##-wrapped) at
 * the caret. A soft, non-blocking warning shows for a non-canonical free token.
 * Props: { label, value, onChange, mergeData, t }
 */
export default function TokenTextField({ label, value, onChange, mergeData, t, fontSize, onFontSize }) {
  const ref = useRef(null);
  const text = value == null ? '' : String(value);
  const tok = isTok(text);
  const list = Array.isArray(mergeData) ? mergeData : [];
  const notCanonical = tok && !list.some((m) => m && m.value && text.indexOf(m.value) >= 0);

  const inject = (token) => {
    const el = ref.current;
    let pos = text.length;
    if (el && typeof el.selectionStart === 'number') pos = el.selectionStart;
    const next = text.slice(0, pos) + token + text.slice(pos);
    onChange(next);
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
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', fontSize: 13, color: '#1f2430', borderRadius: 7, padding: '6px 8px',
          border: '1px solid ' + (tok ? '#a5b4fc' : '#e2e6ee'), background: tok ? '#f5f7ff' : '#fff',
        }}
      />
      {onFontSize && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 11.5, color: '#6b7280' }}>{t('campaigns.tierGraph.fontSizeLabel')}</label>
          <input
            type="number" min={8} max={72}
            value={fontSize == null ? '' : fontSize}
            placeholder={t('campaigns.tierGraph.fontSizeAuto')}
            onChange={(e) => onFontSize(e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || undefined))}
            style={{ width: 70, fontSize: 12.5, border: '1px solid #e2e6ee', borderRadius: 7, padding: '4px 6px' }}
          />
          <span style={{ fontSize: 11, color: '#9aa1ad' }}>px</span>
        </div>
      )}
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
