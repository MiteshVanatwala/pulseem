import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Grid, TextField, FormControlLabel, Switch } from '@material-ui/core';
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
  const { isRTL } = useSelector((s: any) => s.core);
  const { currentFlow, loadingFlow, saving } = useSelector((s: any) => s.chatbot);

  const [flow, setFlow] = useState<IChatbotFlow>(emptyFlow());
  const [error, setError] = useState<string | null>(null);

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
        <div className="svc-cb">{t('common_loading', 'Loading…')}</div>
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
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            className={clsx(classes.dialogButtonsContainer, classes.flexStart)}
          >
            <Grid item md={3} xs={12} className="textBoxWrapper">
              <Typography>* {t('chatbot_name_label', 'Chatbot name')}</Typography>
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
            <Grid item md={3} xs={12}>
              <FormControlLabel
                style={{ marginTop: 25 }}
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

          {error && (
            <div className="svc-cb-limit-note" style={{ background: '#fef3f2', borderColor: '#fda29b', color: '#b42318' }}>
              ⚠️ <span>{error}</span>
            </div>
          )}

          <TriggerSection
            trigger={flow.trigger}
            cooldownEnabled={flow.cooldownEnabled}
            cooldownHours={flow.cooldownHours}
            onChange={(patch) => setFlow({ ...flow, ...patch })}
          />

          <p className="svc-cb-card-title" style={{ margin: '18px 0 10px' }}>
            {t('chatbot_flow', 'Flow')}
          </p>
          <FlowBuilder
            steps={flow.steps}
            templates={MOCK_WA_TEMPLATES}
            onChange={(steps) => setFlow({ ...flow, steps })}
          />

          <div className={clsx(classes.wizardButtonContainer, 'wizardButtonContainer')} style={{ paddingBottom: 40 }}>
            <Box style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
              <Button
                className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                style={{ margin: '8px' }}
                onClick={goBack}
              >
                {t('common_cancel', 'Cancel')}
              </Button>
              <Button
                className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                style={{ margin: '8px' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? t('common_saving', 'Saving…') : t('common_save', 'Save')}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </DefaultScreen>
  );
};

export default ChatbotBuilder;
