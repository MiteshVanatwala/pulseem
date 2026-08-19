import React from 'react';
import { Select, MenuItem, ListSubheader, Box } from '@material-ui/core';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import LanguageIcon from '@material-ui/icons/Language';

interface Props {
  numbers: string[];
  domains: string[];
  value: string; // 'all' | 'wa:<number>' | 'dom:<domain>'
  onChange?: (value: string) => void;
}

// Combined "source" selector shown in the sidebar header in All mode.
// Groups the account's WhatsApp numbers and widget domains under one dropdown;
// picking one narrows the merged list to that single source ("All sources" = everything).
const labelFor = (value: string) => {
  if (value?.startsWith('wa:')) return value.slice(3);
  if (value?.startsWith('dom:')) return value.slice(4);
  return 'All sources';
};

const ServiceSourceDropdown = ({ numbers, domains, value, onChange }: Props) => (
  <Select
    value={value || 'all'}
    onChange={(e) => onChange && onChange(e.target.value as string)}
    variant="outlined"
    displayEmpty
    style={{ height: 40, flex: 1, minWidth: 0, maxWidth: 220, background: '#fff' }}
    renderValue={(v: any) => (
      <Box display="flex" alignItems="center" style={{ minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labelFor(v)}</span>
      </Box>
    )}
  >
    <MenuItem value="all">All sources</MenuItem>
    {numbers.length > 0 && <ListSubheader disableSticky>WhatsApp numbers</ListSubheader>}
    {numbers.map((n) => (
      <MenuItem key={`wa:${n}`} value={`wa:${n}`}>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <WhatsAppIcon style={{ fontSize: 16, color: '#25D366' }} /> {n}
        </Box>
      </MenuItem>
    ))}
    {domains.length > 0 && <ListSubheader disableSticky>Widget domains</ListSubheader>}
    {domains.map((d) => (
      <MenuItem key={`dom:${d}`} value={`dom:${d}`}>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <LanguageIcon style={{ fontSize: 16, color: '#546e7a' }} /> {d}
        </Box>
      </MenuItem>
    ))}
  </Select>
);

export default ServiceSourceDropdown;
