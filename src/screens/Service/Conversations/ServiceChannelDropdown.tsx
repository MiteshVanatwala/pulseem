import React from 'react';
import { Select, MenuItem, Box } from '@material-ui/core';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';

export type ServiceChannel = 'whatsapp' | 'widget';

interface Props {
  value: ServiceChannel;
  onChange: (value: ServiceChannel) => void;
}

// Channel selector shown in the sidebar header (replaces the old avatar).
// WhatsApp → shows the number dropdown next to it; Widget → shows the domain dropdown.
const ServiceChannelDropdown = ({ value, onChange }: Props) => {
  const icon = (ch: ServiceChannel, size = 18) =>
    ch === 'whatsapp'
      ? <WhatsAppIcon style={{ fontSize: size, color: '#25D366' }} />
      : <ChatBubbleOutlineIcon style={{ fontSize: size, color: '#f4511e' }} />;

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as ServiceChannel)}
      variant="outlined"
      style={{ height: 40, width: 62, minWidth: 62, background: '#fff', borderRadius: 8, flexShrink: 0 }}
      renderValue={(v: any) => (
        <Box display="flex" alignItems="center" justifyContent="center">{icon(v)}</Box>
      )}
    >
      <MenuItem value="whatsapp">
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>{icon('whatsapp')} WhatsApp</Box>
      </MenuItem>
      <MenuItem value="widget">
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>{icon('widget')} Widget</Box>
      </MenuItem>
    </Select>
  );
};

export default ServiceChannelDropdown;
