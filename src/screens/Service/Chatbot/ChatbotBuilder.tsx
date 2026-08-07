import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Grid, TextField, FormControlLabel, Switch, Tab, Tabs } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import clsx from 'clsx';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { sitePrefix } from '../../../config';
import { getChatbotFlow, saveChatbot, clearCurrentFlow } from '../../../redux/reducers/chatbotSlice';
import { IChatbotFlow } from '../../../Models/Service/Chatbot';
import { MOCK_WA_TEMPLATES, emptyFlow } from './mockChatbots';
import TriggerSection from './components/TriggerSection';
import FlowBuilder from './components/FlowBuilder';
import './chatbot.css';

const ChatbotBuilder = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { chatbotId } = useParams<{ chatbotId?: string }>();
  const { isRTL, windowSize } = useSelector((s: any) => s.core);
  const isMobile = windowSize === 'xs';
  const { currentFlow, loadingFlow, saving } = useSelector((s: any) => s.chatbot);

  const [flow, setFlow] = useState<IChatbotFlow>(emptyFlow());
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<string>('1');

  useEffect(() => {
    dispatch(getChatbotFlow(chatbotId));
    return () => {
      dispatch(clearCurrentFlow());
    };
  }, [dispatch, chatbotId]);

  useEffect(() => {
    if (currentFlow) setFlow(currentFlow);
  }, [currentFlow]);

  const goBack = () => navigate(`${sitePrefix}Chatbots`);

  const handleSave = () => {
    if (!flow.name.trim()) {
      setError(t('chatbot_error_name_required', 'Give this chatbot a name before saving.') as string);
      return;
    }
    if (flow.steps.length === 0) {
      setError(t('chatbot_error_step_required', 'Add at least one step before saving.') as string);
      return;
    }
    setError(null);
    dispatch(saveChatbot(flow)).then(() => goBack());
  };

  if (loadingFlow) {
    return (
      <DefaultScreen classes={classes} currentPage="service" subPage="serviceChatbots" containerClass={clsx(classes.editorCont)} hideSideImages>
        <div className="svc-cb">{t('common.loading', 'Loading…')}</div>
      </DefaultScreen>
    );
  }

  return (
    <DefaultScreen classes={classes} currentPage="service" subPage="serviceChatbots" containerClass={clsx(classes.editorCont)} hideSideImages>
      <div className="svc-cb">
        <div className="head">
          <Title
            Text={chatbotId ? t('chatbot_edit_title', 'Edit Chatbot') : t('chatbot_create_title', 'Create Chatbot')}
            classes={classes}
          />
        </div>

        <div className="containerBody">
          <Tabs
            variant="scrollable"
            scrollButtons="auto"
            value={tabValue}
            onChange={(_e, value) => setTabValue(value)}
            classes={{ indicator: classes.hideIndicator }}
          >
            <Tab
              label={t('chatbot_tab_trigger', 'Trigger')}
              classes={{ root: classes.tabText, selected: classes.activeTab }}
              className={clsx(classes.iconTab, classes.f18)}
              value="1"
            />
            <Tab
              label={t('chatbot_tab_conditions_actions', 'Conditions & Action')}
              classes={{ root: classes.tabText, selected: classes.activeTab }}
              className={clsx(classes.iconTab, classes.f18)}
              value="2"
            />
          </Tabs>

          {error && (
            <div className="svc-cb-limit-note" style={{ background: '#fef3f2', borderColor: '#fda29b', color: '#b42318' }}>
              ⚠️ <span>{error}</span>
            </div>
          )}

          <TabContext value={tabValue}>
            <TabPanel value="1">
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={isMobile ? 2 : 8}
                className={clsx(classes.dialogButtonsContainer, classes.flexStart)}
              >
                <Grid item xs={12} sm={6} md={3} style={{ paddingBottom: isMobile ? 8 : 20 }}>
                  <Typography className={classes.alignDir}>* {t('chatbot_name_label', 'Chatbot name')}</Typography>
                  <TextField
                    id="chatbotName"
                    required
                    value={flow.name}
                    className={classes.textField}
                    margin="dense"
                    variant="outlined"
                    onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    style={{ marginTop: isMobile ? 0 : 25 }}
                    control={
                      <Switch
                        checked={flow.enabled}
                        color="primary"
                        onChange={(e) => setFlow({ ...flow, enabled: e.target.checked })}
                      />
                    }
                    label={flow.enabled ? t('chatbot_enabled', 'Enabled') : t('chatbot_disabled', 'Disabled')}
                  />
                </Grid>
              </Grid>

              <div style={{ marginTop: isMobile ? 16 : 48 }}>
                <TriggerSection
                  trigger={flow.trigger}
                  cooldownEnabled={flow.cooldownEnabled}
                  cooldownHours={flow.cooldownHours}
                  onChange={(patch) => setFlow({ ...flow, ...patch })}
                  classes={classes}
                />
              </div>
            </TabPanel>

            <TabPanel value="2">
              <div className="svc-cb-flow-heading">
                <div className="svc-cb-flow-heading-title">{t('chatbot_flow', 'Flow')}</div>
                <div className="svc-cb-flow-heading-desc">
                  {t('chatbot_flow_desc', 'Build the condition and action steps that run when this chatbot is triggered.')}
                </div>
              </div>
              <FlowBuilder
                steps={flow.steps}
                templates={MOCK_WA_TEMPLATES}
                onChange={(steps) => setFlow({ ...flow, steps })}
              />
            </TabPanel>
          </TabContext>

          <div className={clsx(classes.wizardButtonContainer, 'wizardButtonContainer')} style={{ paddingBottom: 40 }}>
            <Box style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
              <Button
                className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                style={{ margin: '8px' }}
                onClick={goBack}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                style={{ margin: '8px' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </DefaultScreen>
  );
};

export default ChatbotBuilder;
