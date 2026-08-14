import React from 'react';
import { Box, Typography, Divider } from '@material-ui/core';

interface SettingRowProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Show the bottom divider line (default true). */
  divider?: boolean;
  /** Align the control to the top of the row (use for textareas). */
  alignTop?: boolean;
}

/**
 * Two-column configuration row used across all widget tabs:
 * bold label + gray helper text on the left, the control on the right,
 * with a divider line beneath. Collapses to a single column on narrow widths.
 */
const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  children,
  divider = true,
  alignTop = false,
}) => (
  <>
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems={alignTop ? 'flex-start' : 'center'}
      py={2.5}
    >
      <Box flexBasis="42%" flexShrink={0} pr={3} style={{ minWidth: 200 }}>
        <Typography style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
          {label}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            style={{ color: '#6b7280', marginTop: 4, lineHeight: 1.4, fontSize: '0.8rem' }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Box flexGrow={1} style={{ minWidth: 240 }}>
        {children}
      </Box>
    </Box>
    {divider && <Divider />}
  </>
);

export default SettingRow;
