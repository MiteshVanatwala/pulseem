import React from 'react';
import { Box, IconButton } from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  width?: number | string;
}

/** Numeric input with custom up/down chevron steppers (native spinners hidden). */
const NumberStepper: React.FC<NumberStepperProps> = ({ value, onChange, min = 0, max, width = 150 }) => {
  const clamp = (n: number) => {
    let next = n;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    return next;
  };

  return (
    <Box display="flex" alignItems="center" border="1px solid #cbd5e1" borderRadius={6} width={width} overflow="hidden">
      <style>{`
        .widget-no-spinner::-webkit-outer-spin-button,
        .widget-no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .widget-no-spinner { -moz-appearance: textfield; }
      `}</style>
      <input
        className="widget-no-spinner"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 0))}
        style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 10px', fontSize: '0.9rem', width: '100%' }}
      />
      <Box display="flex" flexDirection="column" borderLeft="1px solid #e5e7eb">
        <IconButton size="small" style={{ padding: 0, borderRadius: 0 }} onClick={() => onChange(clamp(value + 1))}>
          <KeyboardArrowUpIcon style={{ fontSize: 16, color: '#6b7280' }} />
        </IconButton>
        <IconButton size="small" style={{ padding: 0, borderRadius: 0 }} onClick={() => onChange(clamp(value - 1))}>
          <KeyboardArrowDownIcon style={{ fontSize: 16, color: '#6b7280' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NumberStepper;
