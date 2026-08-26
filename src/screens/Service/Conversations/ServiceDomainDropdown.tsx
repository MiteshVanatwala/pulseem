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
    // flex rather than a fixed 200px: the sidebar header has to fit the avatar and
    // four action icons too, and a rigid width pushed the last icon off the edge.
    style={{ height: 40, flex: '1 1 auto', minWidth: 0, maxWidth: 200, background: '#fff' }}
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
