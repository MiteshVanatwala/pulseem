import React from 'react';

/** ToggleField — a simple labelled checkbox. Props: { label, value:boolean, onChange(boolean) } */
export default function ToggleField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label
        style={{
          display: 'flex', gap: 8, alignItems: 'center', background: '#f3f4f8',
          borderRadius: 7, padding: '8px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12.5,
        }}
      >
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    </div>
  );
}
