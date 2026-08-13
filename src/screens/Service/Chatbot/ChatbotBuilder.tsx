import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Grid, TextField, Tab, Tabs } from '@material-ui/core';
import { TabContext, TabPanel } from '@material-ui/lab';
import clsx from 'clsx';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import DefaultScreen from '../../DefaultScreen';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import Toast from '../../../components/Toast/Toast.component';
import { Title } from '../../../components/managment/Title';
import { sitePrefix } from '../../../config';
import { getChatbotFlow, saveChatbot, clearCurrentFlow } from '../../../redux/reducers/chatbotSlice';
import { getSavedTemplates } from '../../../redux/reducers/whatsappSlice';
import { getTemplatePreviewData, getDynamicFields, getVariableValue, getTemplateName } from '../../Whatsapp/Common';
import { templateStatusIdsByStatusName } from '../../Whatsapp/Constant';
import { IChatbotFlow, IFlowStep, IWhatsAppTemplate } from '../../../Models/Service/Chatbot';
import { emptyFlow } from './chatbotHelpers';
import TriggerSection from './components/TriggerSection';
import FlowBuilder from './components/FlowBuilder';
import './chatbot.css';

// dispatch(thunk).unwrap() throws the raw value passed to rejectWithValue(...)
// directly - a plain string here, not an Error - so reading err.message on it
// is always undefined. This pulls the real backend message out regardless of
// which shape the rejection actually took.
const getErrorMessage = (err: any, fallbackKey: string): string => {
  if (typeof err === 'string' && err) return err;
  if (err?.message) return err.message;
  if (err?.Message) return err.Message;
  return fallbackKey;
};

// Walks the whole step tree (branches + else, recursively) looking for an action
// step whose required field is still empty — e.g. a Webhook step with no URL yet,
// or a WhatsApp Template step missing a value for one of its template's {{n}}
// placeholders (extracted from the approved template's body text).
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
  const [templates, setTemplates] = useState<IWhatsAppTemplate[]>([]);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [stepsInvalid, setStepsInvalid] = useState(false);
  const [conditionKeywordInvalid, setConditionKeywordInvalid] = useState(false);
  const [actionFieldInvalid, setActionFieldInvalid] = useState(false);
  const [tabValue, setTabValue] = useState<string>('1');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<any>(null);

  // Snapshot of the flow as it was when last loaded/saved — Cancel compares the
  // live `flow` against this to decide whether there's anything to warn about.
  const initialFlowRef = useRef<IChatbotFlow>(flow);

  useEffect(() => {
    dispatch(getChatbotFlow(chatbotId));
    return () => {
      dispatch(clearCurrentFlow());
    };
  }, [dispatch, chatbotId]);

  // Approved WhatsApp templates only - matches the "templateStatus: 3" filter used
  // by every other template picker (Campaign, Chat, Editor) that lets a user send one.
  useEffect(() => {
    (async () => {
      const result: any = await dispatch(getSavedTemplates({ templateStatus: templateStatusIdsByStatusName.Approved }));
      const items = result?.payload?.Data?.Items ?? [];
      setTemplates(
        items.map((tpl: any) => {
          const preview = getTemplatePreviewData(tpl.Data?.types);
          const variables = getDynamicFields(preview?.templateData?.templateText).map(getVariableValue);
          return { id: tpl.TemplateId, name: getTemplateName(tpl), variables };
        }),
      );
    })();
  }, [dispatch]);

  useEffect(() => {
    if (currentFlow) {
      setFlow(currentFlow);
      initialFlowRef.current = currentFlow;
    }
  }, [currentFlow]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const goBack = () => navigate(`${sitePrefix}Chatbots`);

  const isDirty = () => JSON.stringify(flow) !== JSON.stringify(initialFlowRef.current);

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowUnsavedDialog(true);
    } else {
      goBack();
    }
  };

  // "Yes, save" from the unsaved-changes popup — runs the same validation as
  // that tab's own Save button before actually saving, so leaving from the
  // popup can never persist an incomplete name or an incomplete step tree.
  // On failure it just closes the popup and leaves the tab's own inline error
  // showing, rather than saving invalid data or blocking the user from leaving.
  const handleSaveAndLeave = async () => {
    if (tabValue === '1') {
      const isNameMissing = !flow.name.trim();
      setNameInvalid(isNameMissing);
      if (isNameMissing) {
        setShowUnsavedDialog(false);
        return;
      }
    } else {
      const areStepsMissing = flow.steps.length === 0;
      const isConditionKeywordMissing = hasEmptyConditionKeyword(flow.steps);
      const isActionFieldMissing = hasEmptyActionField(flow.steps, templates);
      setStepsInvalid(areStepsMissing);
      setConditionKeywordInvalid(isConditionKeywordMissing);
      setActionFieldInvalid(isActionFieldMissing);
      if (areStepsMissing || isConditionKeywordMissing || isActionFieldMissing) {
        setShowUnsavedDialog(false);
        return;
      }
    }

    try {
      await dispatch(saveChatbot(flow)).unwrap();
      setShowUnsavedDialog(false);
      setToastMessage({
        severity: 'success',
        color: 'success',
        message: tabValue === '1' ? 'chatbot_trigger_saved' : 'chatbot_condition_action_saved',
      });
      // Give the toast a moment on screen before navigating away, same delay
      // SmsCreator.js uses between its save-success toast and the redirect.
      setTimeout(() => {
        setToastMessage(null);
        goBack();
      }, 1200);
    } catch (err: any) {
      // Save failed server-side (e.g. tier limit reached) - stay put, don't
      // leave, and surface the real reason instead of silently discarding it.
      setShowUnsavedDialog(false);
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_save_failed') });
    }
  };

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    goBack();
  };

  // Shared by the Trigger tab's Save and Continue buttons — both persist the
  // flow as it currently stands (same flow.id throughout, so this updates the
  // same record rather than creating a new one each time); only Continue also
  // advances the tab.
  const validateTriggerTab = (): boolean => {
    const isNameMissing = !flow.name.trim();
    setNameInvalid(isNameMissing);
    return !isNameMissing;
  };

  const handleSaveTrigger = async () => {
    if (!validateTriggerTab()) return;
    if (!isDirty()) return; // nothing changed since the last save — no need to submit again

    try {
      await dispatch(saveChatbot(flow)).unwrap();
      setToastMessage({ severity: 'success', color: 'success', message: 'chatbot_trigger_saved' });
    } catch (err: any) {
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_save_failed') });
    }
  };

  const handleContinue = async () => {
    if (!validateTriggerTab()) return;

    if (!isDirty()) {
      // Trigger data already matches what's saved — just move on, no need to
      // submit and show a "saved" message for a no-op save.
      setTabValue('2');
      return;
    }

    try {
      await dispatch(saveChatbot(flow)).unwrap();
      setToastMessage({ severity: 'success', color: 'success', message: 'chatbot_trigger_saved' });
      setTabValue('2');
    } catch (err: any) {
      // Save failed - stay on the Trigger tab, don't advance.
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_save_failed') });
    }
  };

  // Conditions & Action tab's Save — the actual final submit, which returns to
  // the chatbot list once it succeeds.
  const handleSaveConditions = async () => {
    const areStepsMissing = flow.steps.length === 0;
    setStepsInvalid(areStepsMissing);
    if (areStepsMissing) return;

    const isConditionKeywordMissing = hasEmptyConditionKeyword(flow.steps);
    setConditionKeywordInvalid(isConditionKeywordMissing);
    if (isConditionKeywordMissing) return;

    const isActionFieldMissing = hasEmptyActionField(flow.steps, templates);
    setActionFieldInvalid(isActionFieldMissing);
    if (isActionFieldMissing) return;

    try {
      await dispatch(saveChatbot(flow)).unwrap();
      goBack();
    } catch (err: any) {
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_save_failed') });
    }
  };

  // Back — same validation as the tab's own Save, but on success it returns to
  // the Trigger tab instead of the chatbot list.
  const handleBackToTrigger = async () => {
    const areStepsMissing = flow.steps.length === 0;
    setStepsInvalid(areStepsMissing);
    if (areStepsMissing) return;

    const isConditionKeywordMissing = hasEmptyConditionKeyword(flow.steps);
    setConditionKeywordInvalid(isConditionKeywordMissing);
    if (isConditionKeywordMissing) return;

    const isActionFieldMissing = hasEmptyActionField(flow.steps, templates);
    setActionFieldInvalid(isActionFieldMissing);
    if (isActionFieldMissing) return;

    if (!isDirty()) {
      // Nothing changed since the last save — just go back, no need to submit.
      setTabValue('1');
      return;
    }

    try {
      await dispatch(saveChatbot(flow)).unwrap();
      setToastMessage({ severity: 'success', color: 'success', message: 'chatbot_condition_action_saved' });
      setTabValue('1');
    } catch (err: any) {
      setToastMessage({ severity: 'error', color: 'error', message: getErrorMessage(err, 'chatbot_save_failed') });
    }
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
            onChange={(_e, value) => {
              if (value === tabValue) return;
              // Switching tabs via the tab headers runs the same validate+save
              // as the wizard buttons (Save and Continue / Back), so the flow
              // is never left mid-edit just because the user clicked a tab
              // instead of a button.
              if (value === '2') {
                handleContinue();
              } else {
                handleBackToTrigger();
              }
            }}
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
                templates={templates}
                onChange={(steps) => {
                  setFlow({ ...flow, steps });
                  if (steps.length > 0) setStepsInvalid(false);
                  if (!hasEmptyConditionKeyword(steps)) setConditionKeywordInvalid(false);
                  if (!hasEmptyActionField(steps, templates)) setActionFieldInvalid(false);
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
                onClick={handleCancelClick}
              >
                {t('common.cancel', 'Cancel')}
              </Button>

              {tabValue === '1' ? (
                <>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={handleSaveTrigger}
                    disabled={saving}
                  >
                    {saving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
                  </Button>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={handleContinue}
                    disabled={saving}
                  >
                    {saving ? t('common.saving', 'Saving…') : t('common.saveAndContinue', 'Save and Continue')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={handleBackToTrigger}
                  >
                    {t('common.back', 'Back')}
                  </Button>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.middle)}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={handleSaveConditions}
                    disabled={saving}
                  >
                    {saving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
                  </Button>
                </>
              )}
            </Box>
          </div>
        </div>
      </div>

      {toastMessage && <Toast data={toastMessage} />}

      {showUnsavedDialog && (
        <BaseDialog
          classes={classes}
          open={showUnsavedDialog}
          title={
            tabValue === '1'
              ? t('chatbot_unsaved_title_trigger', 'Leave Chatbot Creation')
              : t('chatbot_unsaved_title_conditions', 'Leave Chatbot Configuration')
          }
          showDivider={false}
          disableBackdropClick
          confirmText={t('common.Yes', 'Yes')}
          cancelText={t('common.No', 'No')}
          onConfirm={handleSaveAndLeave}
          onCancel={handleDiscardAndLeave}
          onClose={handleDiscardAndLeave}
        >
          <Typography className={classes.f14}>
            {tabValue === '1'
              ? t('chatbot_unsaved_body_trigger', 'Would you like to save the chatbot before exit?')
              : t('chatbot_unsaved_body_conditions', 'Would you like to save it before exit?')}
          </Typography>
        </BaseDialog>
      )}
    </DefaultScreen>
  );
};

export default ChatbotBuilder;
