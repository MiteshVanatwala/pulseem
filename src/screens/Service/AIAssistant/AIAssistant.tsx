import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Paper, Typography, Tabs, Tab, Button, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import LibraryBooksOutlinedIcon from '@material-ui/icons/LibraryBooksOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import DefaultScreen from '../../DefaultScreen';
import TabPanel from './components/TabPanel';
import KnowledgeBase from './tabs/KnowledgeBase';
import AISettings from './tabs/AISettings';
import TestChat from './tabs/TestChat';
import Analytics from './tabs/Analytics';
import LockedFeatureOverlay from '../../../components/Service/LockedFeatureOverlay';
import { useServicePlanLimits } from '../../../hooks/useServicePlanLimits';
import { fetchAiAssistantOverview } from '../../../redux/reducers/aiAssistantSlice';
import { computeStats } from '../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  statsRow: {
    marginBlockEnd: 24,
  },
  statCard: {
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: '#fee2e2',
    color: '#FF0076',
  },
  errorSection: {
    padding: 24,
    textAlign: 'center',
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
});

interface AIAssistantProps {
  classes?: any;
}

const AIAssistant = ({ classes: pageClasses }: AIAssistantProps) => {
  const localClasses = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const { knowledgeItems, gateStatus, loading, error } = useSelector((state: any) => state.aiAssistant);
  const { limits } = useServicePlanLimits();

  const [tabIndex, setTabIndex] = useState(0);
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => {
    dispatch(fetchAiAssistantOverview() as any);
  }, [dispatch]);

  const handleTabChange = (_e: React.ChangeEvent<{}>, newValue: number) => {
    if (tabIndex === 1 && settingsDirty && newValue !== 1) {
      const confirmed = window.confirm(t('AIAssistant.settingsActions.leaveGuardMessage') as string);
      if (!confirmed) return;
    }
    setTabIndex(newValue);
  };

  // Rollout kill-switch (Feature.ServiceAI.Enabled) - separate concern from plan
  // entitlement below: this is "not launched yet for anyone", not "not on your
  // plan", so it stays hidden entirely rather than showing a locked state.
  if (gateStatus === 'rolloutDisabled') {
    return null;
  }

  // A rejection that isn't a recognized gate (423/429/network error/etc.) leaves
  // gateStatus at 'unknown' forever — without this, the page renders null forever
  // with no error surfaced. Still loading only while there's no failure yet.
  const isGenericLoadFailure = gateStatus === 'unknown' && loading === 'failed';
  if (gateStatus === 'unknown' && !isGenericLoadFailure) {
    return null;
  }

  // PR-2457 / PR-3766: plan-gated - shown as a locked state with an upgrade
  // prompt (AC: "rather than being hidden entirely"), not a blank page. Sourced
  // from useServicePlanLimits (ServicePlanLimits.AiAssistantEnabled via
  // GetAccountLimits), which is what the SQL sync script keying off FeatureTierId
  // now sets per tier - see dbo.ServicePlanLimits.AiAssistant.Update.sql.
  if (!limits.aiAssistantEnabled) {
    return (
      <DefaultScreen currentPage="aiAssistant" classes={pageClasses} containerClass={clsx(pageClasses?.management)}>
        <LockedFeatureOverlay message="AI Assistant is available on Pro and Scale plans" />
      </DefaultScreen>
    );
  }

  const stats = computeStats(knowledgeItems);

  return (
    <DefaultScreen currentPage="aiAssistant" classes={pageClasses} containerClass={clsx(pageClasses?.management)}>
      <Typography className={clsx(pageClasses?.managementTitle, 'mgmtTitle')} style={{ marginBlockEnd: 24 }}>
        {t('AIAssistant.pageTitle')}
      </Typography>

      {isGenericLoadFailure ? (
        <Paper variant="outlined" className={localClasses.errorSection}>
          <Alert severity="error" style={{ marginBlockEnd: 16 }}>
            {error || t('AIAssistant.validation.genericError')}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            className={clsx(pageClasses?.btn, pageClasses?.btnRounded)}
            onClick={() => dispatch(fetchAiAssistantOverview() as any)}
          >
            {t('AIAssistant.loadError.retry')}
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3} className={localClasses.statsRow}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Box className={localClasses.statIcon}>
                  <LibraryBooksOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('AIAssistant.header.knowledgeItemsLabel')}
                  </Typography>
                  <Typography variant="h6">
                    {t('AIAssistant.header.knowledgeItemsFormat', {
                      active: stats.activeKnowledgeItems,
                      total: stats.totalKnowledgeItems,
                    })}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Box className={localClasses.statIcon}>
                  <DescriptionOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('AIAssistant.header.trainingDataLabel')}
                  </Typography>
                  <Typography variant="h6">
                    {t('AIAssistant.header.trainingDataFormat', { words: stats.totalWordCount })}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Box
                  className={localClasses.statIcon}
                  style={
                    stats.status === 'ready'
                      ? { backgroundColor: '#dcfce7', color: '#16a34a' }
                      : { backgroundColor: '#fff7ed', color: '#ed6c02' }
                  }
                >
                  {stats.status === 'ready' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t('AIAssistant.header.statusLabel')}
                  </Typography>
                  <Typography variant="h6" style={{ color: stats.status === 'ready' ? '#16a34a' : '#ed6c02' }}>
                    {stats.status === 'ready' ? t('AIAssistant.header.statusReady') : t('AIAssistant.header.statusNotReady')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            value={tabIndex}
            onChange={handleTabChange}
            dir={isRTL ? 'rtl' : 'ltr'}
            classes={{ indicator: pageClasses?.hideIndicator }}
          >
            <Tab
              label={t('AIAssistant.tabs.knowledgeBase')}
              classes={{ root: pageClasses?.tabText, selected: pageClasses?.activeTab }}
              className={pageClasses?.f18}
            />
            <Tab
              label={t('AIAssistant.tabs.settings')}
              classes={{ root: pageClasses?.tabText, selected: pageClasses?.activeTab }}
              className={pageClasses?.f18}
            />
            <Tab
              label={t('AIAssistant.tabs.testChat')}
              classes={{ root: pageClasses?.tabText, selected: pageClasses?.activeTab }}
              className={pageClasses?.f18}
            />
            <Tab
              label={t('AIAssistant.tabs.analytics')}
              classes={{ root: pageClasses?.tabText, selected: pageClasses?.activeTab }}
              className={pageClasses?.f18}
            />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            <KnowledgeBase pageClasses={pageClasses} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <AISettings pageClasses={pageClasses} onDirtyChange={setSettingsDirty} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <TestChat pageClasses={pageClasses} />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <Analytics pageClasses={pageClasses} />
          </TabPanel>
        </>
      )}
    </DefaultScreen>
  );
};

export default AIAssistant;
