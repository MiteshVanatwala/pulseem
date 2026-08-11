import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Paper, Typography, Tabs, Tab, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import DefaultScreen from '../../DefaultScreen';
import TabPanel from './components/TabPanel';
import KnowledgeBase from './tabs/KnowledgeBase';
import AISettings from './tabs/AISettings';
import UpgradePrompt from '../../../components/UpgradePrompt/UpgradePrompt';
import { fetchAiAssistantOverview } from '../../../redux/reducers/aiAssistantSlice';
import { computeStats } from '../../../Models/Service/AIAssistant';

const useStyles = makeStyles({
  statsRow: {
    marginBlockEnd: 16,
  },
  statCard: {
    padding: 16,
    textAlign: 'center',
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
  const { knowledgeItems, gateStatus } = useSelector((state: any) => state.aiAssistant);

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

  if (gateStatus === 'rolloutDisabled' || gateStatus === 'unknown') {
    return null;
  }

  const stats = computeStats(knowledgeItems);

  return (
    <DefaultScreen currentPage="aiAssistant" classes={pageClasses} containerClass={clsx(pageClasses?.management)}>
      <Typography variant="h5" style={{ marginBlockEnd: 16 }}>
        {t('AIAssistant.pageTitle')}
      </Typography>

      {gateStatus === 'notEntitled' ? (
        <UpgradePrompt classes={pageClasses} messageKey="AIAssistant.locked.message" />
      ) : (
        <>
          <Grid container spacing={2} className={localClasses.statsRow}>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Typography variant="body2" color="textSecondary">
                  {t('AIAssistant.header.knowledgeItemsLabel')}
                </Typography>
                <Typography variant="h6">
                  {t('AIAssistant.header.knowledgeItemsFormat', {
                    active: stats.activeKnowledgeItems,
                    total: stats.totalKnowledgeItems,
                  })}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Typography variant="body2" color="textSecondary">
                  {t('AIAssistant.header.trainingDataLabel')}
                </Typography>
                <Typography variant="h6">
                  {t('AIAssistant.header.trainingDataFormat', { words: stats.totalWordCount })}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper variant="outlined" className={localClasses.statCard}>
                <Typography variant="body2" color="textSecondary">
                  {t('AIAssistant.header.statusLabel')}
                </Typography>
                <Typography variant="h6" style={{ color: stats.status === 'ready' ? '#16a34a' : '#ed6c02' }}>
                  {stats.status === 'ready' ? t('AIAssistant.header.statusReady') : t('AIAssistant.header.statusNotReady')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <Tab label={t('AIAssistant.tabs.knowledgeBase')} />
            <Tab label={t('AIAssistant.tabs.settings')} />
            <Tab label={t('AIAssistant.tabs.testChat')} disabled />
            <Tab label={t('AIAssistant.tabs.analytics')} disabled />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            <KnowledgeBase />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <AISettings onDirtyChange={setSettingsDirty} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            {/* TODO(Slice 3): Test Chat */}
            <Box p={2}>
              <Typography color="textSecondary">{t('AIAssistant.placeholderTab.testChatNotice')}</Typography>
            </Box>
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            {/* TODO(Slice 5): Analytics */}
            <Box p={2}>
              <Typography color="textSecondary">{t('AIAssistant.placeholderTab.analyticsNotice')}</Typography>
            </Box>
          </TabPanel>
        </>
      )}
    </DefaultScreen>
  );
};

export default AIAssistant;
