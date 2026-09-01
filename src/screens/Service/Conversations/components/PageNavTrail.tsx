import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import moment from 'moment';
import { IPageVisit } from '../../../../Models/Service/Conversation';

const PageNavTrail = ({ trail }: { trail: IPageVisit[] }) => {
  const { t } = useTranslation();
  if (!trail || trail.length === 0) return null;
  return (
    <Box p={1.5} style={{ backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #f1f3f5' }}>
      <Typography variant="caption" style={{ fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}>
        {t('conv_page_nav', 'Page Navigation')}
      </Typography>
      {trail.slice(-5).map((p, i) => (
        <Box key={i} display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" style={{ color: '#374151', wordBreak: 'break-all', marginInlineEnd: 8 }} noWrap>{p.url}</Typography>
          <Typography variant="caption" style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>{moment(p.visitedAt).format('HH:mm')}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default PageNavTrail;
