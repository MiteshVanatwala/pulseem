import React, { useState } from 'react';
import { Popover } from '@material-ui/core';
import PulseemColorPicker from '../../../../../components/Controlls/PulseemColorPickerUI';
import { PALETTE } from '../tierGraphCore';

/**
 * ColorField — 13 palette swatches + a free hex input + the existing
 * PulseemColorPicker (react-color) inside an MUI Popover. No new color library.
 * Props: { label, value:hex, onChange(hex) }
 */
export default function ColorField({ label, value, onChange }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => setAnchor(e.currentTarget)}
          style={{
            width: 34, height: 30, padding: 0, borderRadius: 6, flex: '0 0 auto',
            border: '1px solid rgba(0,0,0,.18)', background: value || '#fff', cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={value == null ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, fontFamily: 'monospace', fontSize: 13, color: '#1f2430',
            border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
        {PALETTE.map((c) => (
          <span
            key={c}
            title={c}
            onClick={() => onChange(c)}
            style={{ width: 20, height: 20, borderRadius: 5, cursor: 'pointer', border: '1px solid rgba(0,0,0,.12)', background: c }}
          />
        ))}
      </div>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <PulseemColorPicker
          initialColor={value || '#000000'}
          onSelectColor={(c) => { onChange(c); setAnchor(null); }}
          onCancel={() => setAnchor(null)}
        />
      </Popover>
    </div>
  );
}
