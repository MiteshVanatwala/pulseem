import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Grid, TextField, Tab, Tabs } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import clsx from 'clsx';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import DefaultScreen from '../../DefaultScreen';
import { Title } from '../../../components/managment/Title';
import { sitePrefix } from '../../../config';
import { getChatbotFlow, saveChatbot, clearCurrentFlow } from '../../../redux/reducers/chatbotSlice';
import { IChatbotFlow, IFlowStep, IWhatsAppTemplate } from '../../../Models/Service/Chatbot';
import { MOCK_WA_TEMPLATES, emptyFlow } from './mockChatbots';
import TriggerSection from './components/TriggerSection';
import FlowBuilder from './components/FlowBuilder';
import './chatbot.css';

// Walks the whole step tree (branches + else, recursively) looking for an action
// step whose required field is still empty — e.g. a Webhook step with no URL yet,
// or a WhatsApp Template step missing one of its template's dynamic fields
// (e.g. pricing_info_v2's {{plan_name}}, order_status_update's {{order_id}}/{{eta}}).
const hasEmptyActionField = (steps: IFlowStep[], templates: IWhatsAppTemplate[]): boolean =>
  steps.some((step) => {
    if (step.type === 'action') {
      const payload = step.payload as any;
      switch (step.actionType) {
        case 'send_widget':
        case 'send_wa_chat':
          return !payload?.text?.trim();
        case 'send_wa_template': {
          if (!payload?.templateId) return true;
          const template = templates.find((tpl) => tpl.id === payload.templateId);
          return (template?.variables ?? []).some((varName) => !payload?.variables?.[varName]?.trim());
        }
        case 'send_webhook':
          return !payload?.url?.trim();
        default:
          return false;
      }
    }
    return (
      step.branches.some((branch) => hasEmptyActionField(branch.steps, templates)) ||
      hasEmptyActionField(step.elseBranch, templates)
    );
  });

// Same recursive walk, but for a condition branch's own keyword text (the "If
// message Contains/Equals [___]" input) being left blank.
const hasEmptyConditionKeyword = (steps: IFlowStep[]): boolean =>
  steps.some((step) => {
    if (step.type === 'action') return false;
    return (
      step.branches.some((branch) => !branch.keyword.trim() || hasEmptyConditionKeyword(branch.steps)) ||
      hasEmptyConditionKeyword(step.elseBranch)
    );
  });

const ChatbotBuilder = ({ classes }: { classes?: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const { chatbotId } = useParams<{ chatbotId?: string }>();
  const { isRTL, windowSize } = useSelector((s: any) => s.core);
  const isMobile = windowSize === 'xs';
  const { currentFlow, loadingFlow, saving } = useSelector((s: any) => s.chatbot);

  const [flow, setFlow] = useState<IChatbotFlow>(emptyFlow());
  const [nameInvalid, setNameInvalid] = useState(false);
  const [stepsInvalid, setStepsInvalid] = useState(false);
  const [conditionKeywordInvalid, setConditionKeywordInvalid] = useState(false);
  const [actionFieldInvalid, setActionFieldInvalid] = useState(false);
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
    // Save acts as "Next" on the Trigger tab — a valid name just advances to
    // Conditions & Action instead of submitting. The form is only actually
    // submitted from the second tab, once its own validation passes.
    if (tabValue === '1') {
      const isNameMissing = !flow.name.trim();
      setNameInvalid(isNameMissing);
      if (isNameMissing) return;

      setTabValue('2');
      return;
    }

    const areStepsMissing = flow.steps.length === 0;
    setStepsInvalid(areStepsMissing);
    if (areStepsMissing) return;

    const isConditionKeywordMissing = hasEmptyConditionKeyword(flow.steps);
    setConditionKeywordInvalid(isConditionKeywordMissing);
    if (isConditionKeywordMissing) return;

    const isActionFieldMissing = hasEmptyActionField(flow.steps, MOCK_WA_TEMPLATES);
    setActionFieldInvalid(isActionFieldMissing);
    if (isActionFieldMissing) return;

    dispatch(saveChatbot(flow)).then(() => goBack());
  };

  if (loadingFlow) {
    return (
      <DefaultScreen
        classes={classes}
        currentPage="service"
        subPage="serviceChatbots"
        customPadding
        containerClass={clsx(classes.mb50, classes.editorCont)}
        hideSideImages
      >
        <div className="svc-cb">{t('common.loading', 'Loading…')}</div>
      </DefaultScreen>
    );
  }

  return (
    <DefaultScreen
      classes={classes}
      currentPage="service"
      subPage="serviceChatbots"
      customPadding
      containerClass={clsx(classes.mb50, classes.editorCont)}
      hideSideImages
    >
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
              disabled={!flow.name.trim()}
            />
          </Tabs>

          <TabContext value={tabValue}>
            <TabPanel value="1" className={classes.p0} style={{ paddingTop: 20 }}>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={isMobile ? 2 : 8}
                className={classes.dialogButtonsContainer}
                style={{ justifyContent: 'flex-start' }}
              >
                <Grid item xs={12} sm={4} style={{ paddingBottom: isMobile ? 8 : 20 }}>
                  <Typography className={classes.alignDir}>
                    {t('chatbot_name_label', 'Chatbot Name')} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    id="chatbotName"
                    label=""
                    variant="outlined"
                    value={flow.name}
                    className={clsx(
                      classes.pl5,
                      classes.pr10,
                      classes.NoPaddingtextField,
                      classes.textField,
                      classes.minWidth252,
                      'fullWidth',
                      { [classes.textFieldError]: nameInvalid },
                    )}
                    autoComplete="off"
                    onChange={(e) => {
                      setFlow({ ...flow, name: e.target.value });
                      if (e.target.value.trim()) setNameInvalid(false);
                    }}
                    error={nameInvalid}
                    title={flow.name}
                  />
                  {nameInvalid && (
                    <Typography className={clsx(classes.errorText, classes.f14, classes.pl5)}>
                      {t('chatbot_error_name_required', 'Chatbot Name is required')}
                    </Typography>
                  )}
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

            <TabPanel value="2" className={classes.p0} style={{ paddingTop: 24, paddingBottom: 24, paddingInlineStart: 8 }}>
              {stepsInvalid && (
                <Typography
                  className={clsx(classes.errorText, classes.f14, classes.pl5)}
                  style={{ marginBottom: 12, paddingTop: 4 }}
                >
                  {t('chatbot_error_step_required', 'Add at least one step before saving.')}
                </Typography>
              )}
              {conditionKeywordInvalid && (
                <Typography
                  className={clsx(classes.errorText, classes.f14, classes.pl5)}
                  style={{ marginBottom: 12, paddingTop: 4 }}
                >
                  {t('chatbot_error_condition_keyword_required', 'Fill in the message text for each condition before saving.')}
                </Typography>
              )}
              {actionFieldInvalid && (
                <Typography
                  className={clsx(classes.errorText, classes.f14, classes.pl5)}
                  style={{ marginBottom: 12, paddingTop: 4 }}
                >
                  {t('chatbot_error_action_field_required', 'Fill in the required field for each action before saving.')}
                </Typography>
              )}
              <FlowBuilder
                steps={flow.steps}
                templates={MOCK_WA_TEMPLATES}
                onChange={(steps) => {
                  setFlow({ ...flow, steps });
                  if (steps.length > 0) setStepsInvalid(false);
                  if (!hasEmptyConditionKeyword(steps)) setConditionKeywordInvalid(false);
                  if (!hasEmptyActionField(steps, MOCK_WA_TEMPLATES)) setActionFieldInvalid(false);
                }}
                classes={classes}
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
                {saving
                  ? t('common.saving', 'Saving…')
                  : tabValue === '1'
                    ? t('common.continue', 'Continue')
                    : t('common.save', 'Save')}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </DefaultScreen>
  );
};

export default ChatbotBuilder;
