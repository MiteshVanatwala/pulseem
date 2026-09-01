import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Box, Paper, Typography, Grid, Chip } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { fetchAiAssistantAnalytics } from '../../../../redux/reducers/aiAssistantSlice';
import { IAnalyticsReferencedItem, IKnowledgeSourceRef, DEFAULT_ANALYTICS_RANGE_DAYS } from '../../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBlockEnd: 20,
  },
  datePicker: {
    minWidth: 160,
  },
  // Deliberately loud: thick colored left border, larger padding, bold heading — a
  // banner about missing real customer data must not read like routine page copy.
  testModeBanner: {
    padding: '20px 24px',
    marginBlockEnd: 24,
    borderInlineStart: '6px solid #ed6c02',
    alignItems: 'flex-start',
  },
  testModeBannerTitle: {
    fontWeight: 700,
    marginBlockEnd: 4,
  },
  emptyState: {
    textAlign: 'center',
    padding: 56,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 48,
    color: '#9ca3af',
    marginBlockEnd: 12,
  },
  card: {
    padding: 24,
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBlockEnd: 16,
  },
  // Most Referenced: a ranked bar-chart list — rank badge + proportional fill + count.
  rankBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  referencedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBlockEnd: 14,
  },
  referencedBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  referencedBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  // Unused Content: a chip cloud, not a ranked list — there is no count to rank by,
  // so it must not borrow the bar/rank visual language above.
  unusedChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  unusedChip: {
    borderColor: '#f59e0b',
    color: '#92400e',
  },
  cardEmptyNote: {
    color: '#6b7280',
  },
});

interface MostReferencedCardProps {
  items: IAnalyticsReferencedItem[];
  classes: any;
}

const MostReferencedCard = ({ items, classes }: MostReferencedCardProps) => {
  const { t } = useTranslation();
  const maxCount = items.reduce((max, item) => Math.max(max, item.referenceCount), 0) || 1;

  return (
    <Paper variant="outlined" className={classes.card}>
      <Box className={classes.cardHeader}>
        <TrendingUpIcon style={{ color: '#2563eb' }} />
        <Typography variant="h6">{t('AIAssistant.analytics.mostReferencedTitle')}</Typography>
      </Box>
      {items.length === 0 ? (
        <Typography variant="body2" className={classes.cardEmptyNote}>
          {t('AIAssistant.analytics.mostReferencedEmpty')}
        </Typography>
      ) : (
        items.map((item, index) => (
          <Box key={item.id} className={classes.referencedRow}>
            <Box className={classes.rankBadge}>{index + 1}</Box>
            <Typography variant="body2" style={{ minWidth: 120, flexShrink: 0 }} noWrap title={item.title}>
              {item.title}
            </Typography>
            <Box className={classes.referencedBarTrack}>
              <Box
                className={classes.referencedBarFill}
                style={{ width: `${Math.max(4, (item.referenceCount / maxCount) * 100)}%` }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary" style={{ minWidth: 28, textAlign: 'end' }}>
              {item.referenceCount}
            </Typography>
          </Box>
        ))
      )}
    </Paper>
  );
};

interface UnusedContentCardProps {
  items: IKnowledgeSourceRef[];
  classes: any;
}

const UnusedContentCard = ({ items, classes }: UnusedContentCardProps) => {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" className={classes.card}>
      <Box className={classes.cardHeader}>
        <WarningRoundedIcon style={{ color: '#f59e0b' }} />
        <Typography variant="h6">{t('AIAssistant.analytics.unusedContentTitle')}</Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" style={{ marginBlockEnd: 16 }}>
        {t('AIAssistant.analytics.unusedContentSubtitle')}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" className={classes.cardEmptyNote}>
          {t('AIAssistant.analytics.unusedContentEmpty')}
        </Typography>
      ) : (
        <Box className={classes.unusedChipRow}>
          {items.map((item) => (
            <Chip key={item.id} variant="outlined" size="small" label={item.title} className={classes.unusedChip} />
          ))}
        </Box>
      )}
    </Paper>
  );
};

const Analytics = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { analytics, analyticsLoading, analyticsError } = useSelector((state: any) => state.aiAssistant);

  const [range, setRange] = useState(() => ({
    startDate: moment().subtract(DEFAULT_ANALYTICS_RANGE_DAYS, 'days'),
    endDate: moment(),
  }));

  const startKey = range.startDate.format('YYYY-MM-DD');
  const endKey = range.endDate.format('YYYY-MM-DD');

  // The actual re-fetch trigger: runs on mount, and again any time the formatted
  // start/end date changes — not just when the picker components re-render.
  useEffect(() => {
    dispatch(fetchAiAssistantAnalytics({ startDate: startKey, endDate: endKey }) as any);
  }, [startKey, endKey, dispatch]);

  const liveModeCount = analytics?.liveModeCount ?? 0;
  const testModeCount = analytics?.testModeCount ?? 0;
  const showTestModeBanner = !!analytics && liveModeCount === 0;
  const isGenuinelyEmpty = !!analytics && liveModeCount === 0 && testModeCount === 0;
  const isLoading = analyticsLoading === 'loading';

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'}>
      <Box className={classes.toolbar}>
        <KeyboardDatePicker
          className={classes.datePicker}
          inputVariant="outlined"
          size="small"
          variant="inline"
          format="DD/MM/YYYY"
          keyboardIcon={<CalendarTodayIcon fontSize="small" />}
          label={t('AIAssistant.analytics.fromDateLabel')}
          maxDate={range.endDate}
          value={range.startDate}
          onChange={(date: any) => date && setRange((prev) => ({ ...prev, startDate: date }))}
          autoOk
        />
        <KeyboardDatePicker
          className={classes.datePicker}
          inputVariant="outlined"
          size="small"
          variant="inline"
          format="DD/MM/YYYY"
          keyboardIcon={<CalendarTodayIcon fontSize="small" />}
          label={t('AIAssistant.analytics.toDateLabel')}
          minDate={range.startDate}
          maxDate={moment()}
          value={range.endDate}
          onChange={(date: any) => date && setRange((prev) => ({ ...prev, endDate: date }))}
          autoOk
        />
      </Box>

      {analyticsError && (
        <Alert severity="error" style={{ marginBlockEnd: 16 }}>
          {analyticsError}
        </Alert>
      )}

      {isLoading && !analytics ? (
        <Typography variant="body2" color="textSecondary">
          {t('AIAssistant.analytics.loading')}
        </Typography>
      ) : (
        <>
          {showTestModeBanner && (
            <Alert severity="warning" icon={<WarningRoundedIcon fontSize="large" />} className={classes.testModeBanner}>
              <Typography variant="subtitle1" className={classes.testModeBannerTitle}>
                {t('AIAssistant.analytics.testModeBannerTitle')}
              </Typography>
              <Typography variant="body2">{t('AIAssistant.analytics.testModeBannerBody')}</Typography>
            </Alert>
          )}

          {isGenuinelyEmpty ? (
            <Paper variant="outlined" className={classes.emptyState}>
              <InboxOutlinedIcon className={classes.emptyIcon} />
              <Typography variant="h6">{t('AIAssistant.analytics.emptyTitle')}</Typography>
              <Typography variant="body2">{t('AIAssistant.analytics.emptyBody')}</Typography>
            </Paper>
          ) : analytics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MostReferencedCard items={analytics.mostReferencedItems} classes={classes} />
              </Grid>
              <Grid item xs={12} md={6}>
                <UnusedContentCard items={analytics.unusedContentItems} classes={classes} />
              </Grid>
            </Grid>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default Analytics;
