import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid, Button, Divider, Paper, useTheme, TextField } from '@material-ui/core';
import { CheckCircle, Language, Group, Lock, Mail, AccessTime, Public, Tune, Visibility, Mouse, ArrowDownward, BarChart, Settings, Description } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { sitePrefix, isProdMode } from '../../config';
import { publish, getById } from '../../redux/reducers/landingPagesSlice';
import { getGroupsBySubAccountId } from '../../redux/reducers/groupSlice';
import { Loader } from '../../components/Loader/Loader';
import Toast from '../../components/Toast/Toast.component';
import DefaultScreen from '../DefaultScreen';
import { StateType } from '../../Models/StateTypes';
import { logout } from '../../helpers/Api/PulseemReactAPI';
import { LangugeCode } from '../../model/PulseemFields/Fields';
import { Title } from '../../components/managment/Title';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { MdComputer, MdPhoneIphone } from "react-icons/md";
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import { TierFeatures } from '../../helpers/Constants';
import { coreProps } from '../../model/Core/corePros.types';
import { get } from 'lodash';
import TierPlans from '../../components/TierPlans/TierPlans';

interface ToastMessage {
  severity?: 'error' | 'success' | 'info';
  color?: 'error' | 'success' | 'info';
  message: string;
  showAnimtionCheck?: boolean;
}

const SummaryItem = ({ icon: Icon, label, value, classes }: any) => (
  <Box display="flex" alignItems="flex-start" mb={1}>
    {Icon && <Icon className={classes.popupSummaryIcons} />}
    <Box>
      <Typography variant="body1" className={classes.bold}>
        {label}
      </Typography>
      <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const SummaryList = ({ icon: Icon, label, items, classes, t }: any) => (
  <Box mb={1}>
    <Box display="flex" alignItems="center">
      {Icon && <Icon className={classes.popupSummaryIcons} />}
      <Typography variant="body1" className={classes.bold}>
        {label}
      </Typography>
    </Box>
    {items?.length > 0 ? (
      items.map((item: string | number, index: number) => (
        <Typography key={index} variant="body1" style={{ marginLeft: 28, wordBreak: 'break-word' }}>
          {item}
        </Typography>
      ))
    ) : (
      <Typography variant="body1" style={{ marginLeft: 28 }}>
        {t('common.notSet')}
      </Typography>
    )}
  </Box>
);

const PopupSummary = ({ classes }: any) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { id } = useParams();

  const { payload, lookupData } = location.state || {};
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
  const { subAccountAllGroups } = useSelector((state: StateType) => state.group);
  const { subAccount } = useSelector((state: any) => state.common);
  const { isRTL } = useSelector(
    (state: { core: coreProps }) => state.core
  );
  const [loading, setLoader] = useState(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [webForm, setWebForm] = useState<any>(null);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedData, setEmbedData] = useState<any>(null);
  const [TierMessageCode, setTierMessageCode] = useState<string>('');
  const [dialogType, setDialogType] = useState<{
		type: string;
	} | null>(null);
  const [showTierPlans, setShowTierPlans] = useState(false);

  const showErrorToast = (message: string) => {
    setToastMessage({
      severity: 'error',
      color: 'error',
      message,
      showAnimtionCheck: false,
    });
  };

  const showSuccessToast = (message: string) => {
    setToastMessage({
      severity: 'success',
      color: 'success',
      message,
      showAnimtionCheck: true,
    });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const getData = async () => {
    if (!id) return;

    try {
      if (!subAccountAllGroups || subAccountAllGroups.length === 0) {
        //@ts-ignore
        await dispatch(getGroupsBySubAccountId());
      }

      //@ts-ignore
      const response = await dispatch(getById(id)) as any;
      handleResponse(response.payload);
    } catch (err) {
      console.error('Error fetching popup summary:', err);
      showErrorToast(t('common.Error') || 'An error occurred');
      setShowLoader(false);
    }
  };

  const handleResponse = (responsePayload: any) => {
    if (!responsePayload) {
      showErrorToast(t('common.ErrorFetchingData') || 'Error fetching data');
      setShowLoader(false);
      return;
    }

    switch (responsePayload.StatusCode) {
      case 201: {
        setWebForm(responsePayload?.Data?.WebForm);
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 404: {
        showErrorToast(t('common.ErrorFetchingData') || 'Data not found');
        break;
      }
      default: {
        showErrorToast(t('common.ErrorFetchingData') || 'Error fetching data');
        break;
      }
    }
    setShowLoader(false);
  };

  useEffect(() => {
    getData();
  }, [id]);

  const handleGetPlanForFeature = (tierMessageCode: string) => {
    const planName = findPlanByFeatureCode(
      tierMessageCode,
      availablePlans,
      currentPlan.Id
    );
    
    if (planName) {
      return t('billing.tier.featureNotAvailable').replace('{feature}', t(TierFeatures[tierMessageCode as keyof typeof TierFeatures] || tierMessageCode)).replace('{planName}', planName);
    } else {
      return t('billing.tier.noFeatureAvailable');
    }
  };

  const getTierValidationDialog = () => ({
    title: t('billing.tier.permission'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {handleGetPlanForFeature(TierMessageCode)}
      </Typography>
    ),
    renderButtons: () => (
      <Grid
        container
        spacing={2}
        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}
      >
        <Grid item>
          <Button
            onClick={() => {
              setShowTierPlans(true);
            }}
            className={clsx(classes.btn, classes.btnRounded)}
          >
            {t('billing.upgradePlan')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => setDialogType(null)}
            className={clsx(classes.btn, classes.btnRounded)}
          >
            {t('common.cancel')}
          </Button>
        </Grid>
      </Grid>
    )
  })

  const renderDialog = () => {
    const { type } = dialogType || {}
    let currentDialog: any = {};
    if (type === 'tier') {
      currentDialog = getTierValidationDialog();
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          onCancel={() => setDialogType(null)}
          onClose={() => setDialogType(null)}
          renderButtons={currentDialog?.renderButtons || null}
          {...currentDialog}>
          {currentDialog?.content}
        </BaseDialog>
      )
    }
  }

  const handlePublish = async () => {
    if (!id) return;

    try {
      setLoader(true);
      //@ts-ignore
      const response = await dispatch(publish(id)) as any;
      //@ts-ignore
      if (response?.payload?.StatusCode === 201) {
        showSuccessToast(t('PopupTriggers.popupPublished'));
        //@ts-ignore
        const updatedResponse = await dispatch(getById(id)) as any;
        const updatedWebForm = updatedResponse?.payload?.Data?.WebForm;
        
        if (updatedWebForm) {
          setWebForm(updatedWebForm);
          setEmbedData({
            PopupGuid: updatedWebForm.PopupGuid || payload?.PopupGuid,
            Name: updatedWebForm.PageName
          });
          setShowEmbedDialog(true);
        }
      } else if (response?.payload?.StatusCode === 927) {
        setTierMessageCode(response?.payload?.Message); // SURVEY_SYSTEM
        setDialogType({ type: 'tier' });
      } else {
        showErrorToast(t('common.Error') || 'An error occurred');
      }
    } catch (err) {
      console.error('Publish error', err);
      showErrorToast(t('common.Error') || 'An error occurred');
    } finally {
      setLoader(false);
    }
  };

  const getNameById = (list: any[] = [], idToFind: number) => {
    if (!list || !Array.isArray(list)) return t('common.notSet');
    const item = list.find((it: any) => it?.Id === idToFind);
    return item ? item.Name : t('common.notSet');
  };

  const renderLanguage = (lang: number) => {
    const currentLang = LangugeCode.filter((l: any) => l.value === lang);
    return currentLang[0] ? t(currentLang[0]?.label) : t('common.notSet');
  };

  const handleCloseEmbedDialog = () => {
    setShowEmbedDialog(false);
    setEmbedData(null);
  };

  const getEmbedDialog = () => {
    if (!embedData) return null;

    const PopupBaseUrl = isProdMode ? "https://l-p.site" : "https://stage.l-p.site";
    const popupId = embedData.PopupGuid;
    const embedCode = `<script type="text/javascript" src="${PopupBaseUrl}/pulseempopup.js?id=${popupId}"></script>`;

    return {
      title: t('landingPages.popupManagement.actions.embed'),
      showDivider: false,
      content: (
        <Box>
          <Typography style={{ fontSize: 16, marginBottom: 16 }}>
            {t('landingPages.popupManagement.actions.embedMessage')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={embedCode}
            InputProps={{
              readOnly: true,
            }}
            onClick={(e: any) => e.target.select()}
          />
        </Box>
      ),
      onConfirm: () => {
        navigator.clipboard.writeText(embedCode);
        handleCloseEmbedDialog();
        setToastMessage({ 
          severity: 'success',
          color: 'success',
          message: 'Embed code copied to clipboard!',
          showAnimtionCheck: true
        });
      },
      confirmText: 'Copy Code'
    };
  };

  if (showLoader) {
    return <Loader isOpen={true} showBackdrop={true} />;
  }

  if (!webForm || !payload || !lookupData) {
    return (
      <DefaultScreen
        currentPage="SurveyDetails"
        classes={classes}
        containerClass={clsx(classes.management, classes.mb50)}
      >
        <Box style={{ padding: 25, maxWidth: 1200, margin: '0 auto' }}>
          <Typography variant="h5">
            {t('common.ErrorLoadingData') || 'Failed to load popup details.'}
          </Typography>
        </Box>
      </DefaultScreen>
    );
  }


  const renderTriggers = () => {
    if (!payload?.PopupTriggers || payload.PopupTriggers.length === 0) {
      return <Typography style={{ marginLeft: 28 }}>{t('common.notSet')}</Typography>;
    }

    const getTriggerContent = (trigger: any, triggerName: string) => {
      const configs: Record<string, { label: string; value: string; icon: any }> = {
        'Exit Intent': {
          label: t('PopupTriggers.summary.exitIntent'),
          value: t('common.on'),
          icon: Mouse,
        },
        'Page Views': {
          label: t('PopupTriggers.summary.pageCount'),
          value: `${t('PopupTriggers.summary.displayAfterVisiting')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.pages')}`,
          icon: BarChart,
        },
        'Viewing Time': {
          label: t('PopupTriggers.summary.timeDelay'),
          value: `${t('PopupTriggers.summary.displayAfter')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.secsOnPage')}`,
          icon: AccessTime,
        },
        'Scroll Depth': {
          label: t('PopupTriggers.summary.displayAfterScrolling'),
          value: `${trigger.TriggerValue}% ${t('PopupTriggers.summary.onThePage')}`,
          icon: ArrowDownward,
        },
        'Page Clicks': {
          label: t('PopupTriggers.summary.clicksCount'),
          value: `${t('PopupTriggers.summary.displayAfter')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.clicksInPage')}`,
          icon: Mouse,
        },
      };
      return configs[triggerName] || { label: triggerName, value: trigger.TriggerValue || '', icon: Visibility };
    };

    return payload.PopupTriggers.map((trigger: any) => {
      const triggerName = getNameById(lookupData?.PopupTriggers, trigger.TriggerId);
      const { label, value, icon } = getTriggerContent(trigger, triggerName);
      return (
        <SummaryItem
          key={`${trigger.TriggerId}-${trigger.TriggerValue}`}
          classes={classes}
          icon={icon}
          label={label}
          value={value}
        />
      );
    });
  };

  const renderDeviceTargeting = () => {
    if (!payload?.DeviceTargets || payload.DeviceTargets.length === 0) {
      return <Typography style={{ marginLeft: 28 }}>{t('common.notSet')}</Typography>;
    }

    return payload.DeviceTargets.map((device: any) => {
      console.log(device);
      
      const deviceIcon = device === 1 ? MdComputer : MdPhoneIphone;
      return (
        <SummaryItem
          key={device.Id}
          classes={classes}
          icon={deviceIcon}
          label={device === 1 ? t("PopupTriggers.deviceTargeting.desktop") : t("PopupTriggers.deviceTargeting.mobile")}
        />
      );
    });
  };

  const renderPageTargeting = () => {
    if (!payload?.PopupPageTargeting || payload.PopupPageTargeting.length === 0) {
      return <Typography style={{ marginLeft: 28 }}>{t('common.notSet')}</Typography>;
    }

    return payload.PopupPageTargeting.map((rule: any, i: number) => {
      const conditionType = getNameById(lookupData?.ConditionTypes, rule.ConditionTypeId);
      const conditionText =
        conditionType === 'Contains'
          ? t('common.contains')
          : conditionType === 'Not contains'
            ? t('common.notContains')
            : t('common.equal');

      return (
        <SummaryItem
          key={i}
          classes={classes}
          icon={Tune}
          label={conditionText}
          value={rule.ConditionValue}
        />
      );
    });
  };

  const renderFrequency = () => {
    if (!payload?.PopupFrequency) {
      return <Typography style={{ marginLeft: 28 }}>{t('common.notSet')}</Typography>;
    }

    const { FrequencyTypeId, FrequencyValue, AudienceTargetTypeId, VisitorDays } = payload.PopupFrequency;
    const frequencyTypeName = getNameById(lookupData?.DisplayFrequencies, FrequencyTypeId);
    const audienceTargetName = getNameById(lookupData?.AudienceTargets, AudienceTargetTypeId);

    const getFrequencyTypeTranslation = (typeName: string) => {
      const map: Record<string, string> = {
        'Once a day': t('PopupTriggers.displayFrequency.displaySchedule.oncePerDay.title'),
        'Once every few days': t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.main'),
        'Once every few visits': t('PopupTriggers.displayFrequency.displaySchedule.everyXVisit.main'),
        'Every visit': t('PopupTriggers.displayFrequency.displaySchedule.everyVisit.title'),
      };
      return map[typeName] || typeName;
    };

    const getAudienceTargetTranslation = (audienceName: string) => {
      const map: Record<string, string> = {
        'All Visitors': t('PopupTriggers.displayFrequency.targetAudience.allVisitors'),
        'New Visitors': t('PopupTriggers.displayFrequency.targetAudience.newVisitors'),
        'Returning Visitors': t('PopupTriggers.displayFrequency.targetAudience.returningVisitors'),
      };
      return map[audienceName] || audienceName;
    };

    const getFrequencyValueText = () => {
      if (FrequencyValue <= 0) return null;

      if (frequencyTypeName === 'Once every few days') {
        return `${t('PopupTriggers.summary.onceEvery')} ${FrequencyValue} ${t('PopupTriggers.displayFrequency.displaySchedule.everyXDays.suffix')}`;
      } else if (frequencyTypeName === 'Once every few visits') {
        return `${t('PopupTriggers.summary.onceEvery')} ${FrequencyValue} ${t('PopupTriggers.summary.visits')}`;
      }
      return FrequencyValue;
    };

    const getVisitorDaysText = () => {
      if (VisitorDays <= 0) return null;
      return `${t('PopupTriggers.summary.onceEvery')} ${VisitorDays} ${t('common.days') || 'days'}`;
    };

    const frequencyValueText = getFrequencyValueText();
    const visitorDaysText = getVisitorDaysText();

    return (
      <Box>
        <SummaryItem
          classes={classes}
          icon={AccessTime}
          label={t('PopupTriggers.summary.frequencyType')}
          value={getFrequencyTypeTranslation(frequencyTypeName)}
        />
        {frequencyValueText && (
          <SummaryItem
            classes={classes}
            icon={AccessTime}
            label={t('PopupTriggers.summary.frequencyValue')}
            value={frequencyValueText}
          />
        )}
        <SummaryItem
          classes={classes}
          icon={Public}
          label={t('PopupTriggers.summary.audienceTarget')}
          value={getAudienceTargetTranslation(audienceTargetName)}
        />
        {visitorDaysText && (
          <SummaryItem
            classes={classes}
            icon={AccessTime}
            label={t('PopupTriggers.summary.visitorDays')}
            value={visitorDaysText}
          />
        )}
      </Box>
    );
  };

  const renderConversionSettings = () => {
    const isConversionSet = payload?.ConversionTypeId !== 0 && payload?.ConversionTypeId !== null;

    if (!isConversionSet) {
      return (
        <SummaryItem
          classes={classes}
          icon={Settings}
          label={t('PopupTriggers.advanceSettings.postConversion.title')}
          value={t('common.disabled')}
        />
      );
    }

    return (
      <Box>
        <SummaryItem
          classes={classes}
          icon={Settings}
          label={t('PopupTriggers.summary.continueAfterConversion')}
          value={payload?.ContinueAfterConversion ? t('common.Yes') : t('common.No')}
        />
        <SummaryItem
          classes={classes}
          icon={BarChart}
          label={t('PopupTriggers.summary.conversionType')}
          value={
            payload?.ConversionTypeId === 1
              ? t('PopupTriggers.advanceSettings.postConversion.defineConversion.formSubmission')
              : t('PopupTriggers.advanceSettings.postConversion.defineConversion.buttonClick')
          }
        />
      </Box>
    );
  };

  const renderPopupInfo = () => {
    const groupNames = webForm?.SelectedGroupList?.map((groupId: any) => {
      const g = subAccountAllGroups?.find((x: any) => x.GroupID === parseInt(groupId));
      return g?.GroupName || t('common.notSet');
    }) || [];

    const emailList = webForm?.EmailsToReport?.split(',')?.filter((email: string) => email.trim() !== '') || [];

    const generalSettingsItems = [
      {
        type: 'item',
        icon: Description,
        label: t('PopupTriggers.summary.popupName'),
        value: webForm?.PageName || t('common.notSet'),
      },
      {
        type: 'item',
        icon: Language,
        label: t('PopupTriggers.summary.popupLanguage'),
        value: renderLanguage(webForm?.BaseLanguage),
      },
      {
        type: 'item',
        icon: Lock,
        label: t('landingPages.answerType'),
        value: webForm?.AnswerData || t('landingPages.systemDefaultMessage'),
      },
      {
        type: 'item',
        icon: Lock,
        label: t('landingPages.limitNumberOfSubscribers'),
        value: webForm?.SubscriptionsLimit > 0 ? webForm?.SubscriptionsLimit : t('common.disabled'),
      },
      {
        type: 'item',
        icon: CheckCircle,
        label: t('landingPages.doubleOptIn'),
        value: webForm?.DoubleOptin ? t('common.enabled') : t('common.disabled'),
      },
      {
        type: 'list',
        icon: Group,
        label: t('landingPages.groupsForSubscribers'),
        items: groupNames,
      },
      {
        type: 'list',
        icon: Mail,
        label: t('landingPages.reportLeadsToEmails'),
        items: emailList,
      },
    ];

    const rows = [];
    for (let i = 0; i < generalSettingsItems.length; i += 3) {
      rows.push(generalSettingsItems.slice(i, i + 3));
    }

    return (
      <Paper elevation={3} style={{ padding: 24, marginBottom: 24, borderRadius: 8 }}>
        <Typography variant="body1" className={clsx(classes.managementTitle, classes.sectionTitlePopupTrigger)} gutterBottom style={{ color: theme.palette.primary.main }}>
          {t('PopupTriggers.summary.generalSettings')}
        </Typography>
        <Divider style={{ margin: '8px 0 16px 0' }} />

        {rows.map((row, rowIndex) => (
          <Grid container spacing={1} key={rowIndex}>
            {row.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {item.type === 'item' ? (
                  <SummaryItem classes={classes} icon={item.icon} label={item.label} value={item.value} />
                ) : (
                  <SummaryList classes={classes} icon={item.icon} label={item.label} items={item.items} t={t} />
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Paper>
    );
  };

  const renderDisplayRules = () => (
    <Paper elevation={3} style={{ padding: 24, marginBottom: 24, borderRadius: 8 }}>
      <Typography variant="body1" className={clsx(classes.managementTitle, classes.sectionTitlePopupTrigger)} gutterBottom style={{ color: theme.palette.primary.main }}>
        {t('PopupTriggers.summary.displayRules') || 'Display Rules'}
      </Typography>
      <Divider style={{ margin: '8px 0 16px 0' }} />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary}}>
            {t('PopupTriggers.summary.triggers')}
          </Typography>
          {renderTriggers()}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary}}>
            {t("PopupTriggers.deviceTargeting.title")}
          </Typography>
          {renderDeviceTargeting()}
        </Grid>
         <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary}}>
            {t('PopupTriggers.summary.pageTargeting')}
          </Typography>
          {renderPageTargeting()}
        </Grid>
      </Grid>

      <Divider style={{ margin: '24px 0 16px 0' }} />

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary}}>
            {t('PopupTriggers.summary.frequency')}
          </Typography>
          {renderFrequency()}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
            {t('PopupTriggers.advanceSettings.postConversion.title') || 'Post-Conversion Behavior'}
          </Typography>
          {renderConversionSettings()}
        </Grid>
      </Grid>
    </Paper>
  );

  const embedDialogConfig = getEmbedDialog();

  return (
    <DefaultScreen
      currentPage="SurveyDetails"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box style={{ padding: 25, maxWidth: 1200, margin: '0 auto' }}>
        <Title classes={classes} Text={t('PopupTriggers.summary.title')} />
        {renderPopupInfo()}
        {renderDisplayRules()}
      </Box>

      <Box
        className={clsx(classes.stickyFooter)}
        style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '15px 50px' }}
      >
        <Button
          onClick={() => navigate(`${sitePrefix}Popups/DisplayRules/${id}`)}
          className={clsx(classes.btn, classes.btnRounded, classes.backButton)}
        >
          {t('common.back')}
        </Button>
        <Button
          onClick={handlePublish}
          className={clsx(classes.btn, classes.btnRounded)}
          disabled={loading}
          variant="contained"
          color="primary"
        >
          {t('common.publish')}
        </Button>
         <Button
          onClick={() => navigate(`${sitePrefix}PopUpManagement`)}
          className={clsx(classes.btn, classes.btnRounded)}
          variant="contained"
          color="primary"
        >
          {t('landingPages.popupManagement.title')}
        </Button>
      </Box>

      {embedDialogConfig && (
        <BaseDialog
          classes={classes}
          open={showEmbedDialog}
          onClose={handleCloseEmbedDialog}
          onCancel={handleCloseEmbedDialog}
          {...embedDialogConfig}
        >
          {embedDialogConfig.content}
        </BaseDialog>
      )}

      <Loader isOpen={showLoader || loading} showBackdrop={true} />
      {toastMessage && <Toast customData={null} data={toastMessage} />}
      {renderDialog()}
      {showTierPlans && <TierPlans
        classes={classes}
        isOpen={showTierPlans}
        onClose={() => setShowTierPlans(false)}
      />}
    </DefaultScreen>
  );
};

export default PopupSummary;