import React from 'react';
import { Select, MenuItem, Box } from '@material-ui/core';

interface Props {
  domains: string[];
  value: string;
  onChange?: (domain: string) => void;
}

// Domain selector shown in the sidebar header when the channel is "Widget"
// (takes the place of the WhatsApp number dropdown).
const ServiceDomainDropdown = ({ domains, value, onChange }: Props) => (
  <Select
    value={value}
    onChange={(e) => onChange && onChange(e.target.value as string)}
    variant="outlined"
    displayEmpty
    style={{ height: 40, width: 200, minWidth: 0, maxWidth: 200, background: '#fff' }}
    renderValue={(v: any) => (
      <Box display="flex" alignItems="center" style={{ minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || 'All domains'}</span>
      </Box>
    )}
  >
    {domains.length === 0 && <MenuItem value="">All domains</MenuItem>}
    {domains.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
  </Select>
);

export default ServiceDomainDropdown;
