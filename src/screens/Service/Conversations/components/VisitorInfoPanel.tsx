import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { IVisitorInfo } from '../../../../Models/Service/Conversation';

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Box display="flex" justifyContent="space-between" mb={0.5}>
    <Typography variant="caption" style={{ color: '#9ca3af' }}>{label}</Typography>
    <Typography variant="caption" style={{ color: '#374151', fontWeight: 600, textAlign: 'end', wordBreak: 'break-all', marginInlineStart: 8 }}>{value || '—'}</Typography>
  </Box>
);

const VisitorInfoPanel = ({ info }: { info: IVisitorInfo | null }) => {
  const { t } = useTranslation();
  if (!info) return null;
  return (
    <Box p={1.5} style={{ backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #f1f3f5' }}>
      <Typography variant="caption" style={{ fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}>
        {t('conv_visitor_info', 'Visitor Info')}
      </Typography>
      <Row label={t('conv_browser', 'Browser')} value={info.browser} />
      <Row label={t('conv_location', 'Location')} value={info.location} />
      <Row label={t('conv_referrer', 'Referrer')} value={info.referrerUrl} />
    </Box>
  );
};

export default VisitorInfoPanel;
