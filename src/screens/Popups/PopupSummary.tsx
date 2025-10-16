import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Grid, Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { sitePrefix } from '../../config';
import { publish } from '../../redux/reducers/landingPagesSlice';
import { Loader } from '../../components/Loader/Loader';
import Toast from '../../components/Toast/Toast.component';

interface ToastMessage {
  severity?: 'error' | 'success' | 'info';
  color?: 'error' | 'success' | 'info';
  message: string;
  showAnimtionCheck?: boolean;
}

const PopupSummary = ({ classes }: any) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { payload, lookupData } = location.state || {};
  const [loading, setLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showErrorToast = (message: string) => {
    setToastMessage({
      severity: 'error',
      color: 'error',
      message,
      showAnimtionCheck: false
    });
  };

  const showSuccessToast = (message: string) => {
    setToastMessage({
      severity: 'success',
      color: 'success',
      message,
      showAnimtionCheck: true
    });
  };

  const handlePublish = async () => {
    if (!id) return;

    try {
      setLoader(true);
      //@ts-ignore
      const response = await dispatch(publish(id));
      // @ts-ignore
      if (response?.payload?.StatusCode === 201) {
        showSuccessToast(t('common.Pulished'));
        setTimeout(() => {
          navigate(`${sitePrefix}LandingPages/PopUpManagement`);
        }, 1500);
      } else {
        showErrorToast(t('common.Error') || 'An error occurred');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      showErrorToast(t('common.Error') || 'An error occurred');
    } finally {
      setLoader(false);
    }
  };

  const getNameById = (list: any[], id: number) => {
    const item = list?.find(item => item.Id === id);
    return item ? item.Name : t('common.notSet');
  }

  const renderTriggers = () => {
    if (!payload?.PopupTriggers || payload.PopupTriggers.length === 0) {
      return <Typography>{t('common.notSet')}</Typography>;
    }

    const getTriggerContent = (trigger: any, triggerName: string) => {
      const configs: Record<string, { label: string; value: string }> = {
        'Exit Intent': {
          label: t('PopupTriggers.summary.exitIntent'),
          value: trigger.isActive ? t('common.on') : t('common.off'),
        },
        'Page Views': {
          label: t('PopupTriggers.summary.pageCount'),
          value: `${t('PopupTriggers.summary.displayAfterVisiting')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.pages')}`,
        },
        'Viewing Time': {
          label: t('PopupTriggers.summary.timeDelay'),
          value: `${t('PopupTriggers.summary.displayAfter')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.secsOnPage')}`,
        },
        'Scroll Depth': {
          label: t('PopupTriggers.summary.displayAfterScrolling'),
          value: `${trigger.TriggerValue}% ${t('PopupTriggers.summary.onThePage')}`,
        },
        'Page Clicks': {
          label: t('PopupTriggers.summary.clicksCount'),
          value: `${t('PopupTriggers.summary.displayAfter')} ${trigger.TriggerValue} ${t('PopupTriggers.summary.clicksInPage')}`,
        },
      };

      return configs[triggerName] || { label: triggerName, value: trigger.TriggerValue || '' };
    };

    return payload.PopupTriggers.map((trigger: any) => {
      const triggerName = getNameById(lookupData?.PopupTriggers, trigger.TriggerId);
      const { label, value } = getTriggerContent(trigger, triggerName);

      return (
        <div key={trigger.TriggerId}>
          <Typography
            variant='body1'
          >
            {label}:
          </Typography>
          {' '}
          <Typography
            variant='body2'
          >
            {value}
          </Typography>
        </div>
      );
    });
  };

  const renderPageTargeting = () => {
    if (!payload?.PopupPageTargeting || payload.PopupPageTargeting.length === 0) {
      return <Typography>{t('common.notSet')}</Typography>;
    }

    return payload.PopupPageTargeting.map((rule: any, index: number) => {
      const conditionType = getNameById(lookupData?.ConditionTypes, rule.ConditionTypeId);

      return (
        <div key={index}>
          <Typography variant='body1'>
            {conditionType === 'Contains' ? t("common.contains") : conditionType === 'Not contains' ? t("common.notContains") : t("common.equal")}:
          </Typography>
          {' '}
          <Typography variant='body2'>
            {rule.ConditionValue}
          </Typography>
        </div>
      );
    });
  };

  const renderFrequency = () => {
    if (!payload?.PopupFrequency) {
      return <Typography>{t('common.notSet')}</Typography>;
    }
    const { FrequencyTypeId, FrequencyValue, AudienceTargetTypeId, VisitorDays } = payload.PopupFrequency;

    return (
      <>
        <div>
          <Typography variant='body1'>
            {t('PopupTriggers.summary.frequencyType')}:
          </Typography>
          {' '}
          <Typography variant='body2'>
            {getNameById(lookupData?.DisplayFrequencies, FrequencyTypeId)}
          </Typography>
        </div>

        {FrequencyValue > 0 && (
          <div>
            <Typography variant='body1'>
              {t('PopupTriggers.summary.frequencyValue')}:
            </Typography>
            {' '}
            <Typography variant='body2'>
              {FrequencyValue}
            </Typography>
          </div>
        )}

        <div>
          <Typography variant='body1'>
            {t('PopupTriggers.summary.audienceTarget')}:
          </Typography>
          {' '}
          <Typography variant='body2'>
            {getNameById(lookupData?.AudienceTargets, AudienceTargetTypeId)}
          </Typography>
        </div>

        {VisitorDays > 0 && (
          <div>
            <Typography variant='body1'>
              {t('PopupTriggers.summary.visitorDays')}:
            </Typography>
            {' '}
            <Typography variant='body2'>
              {VisitorDays}
            </Typography>
          </div>
        )}
      </>
    );
  };

  const renderToast = () => {
    if (!toastMessage) return null;

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);

    return <Toast customData={null} data={toastMessage} />;
  };

  return (
    <React.Fragment>
      <Box style={{ padding: 25, maxWidth: 900, margin: '0 auto', borderTop: '1px solid #0000001f' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.bold}>{t('PopupTriggers.summary.triggers')}</Typography>
            {renderTriggers()}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.bold}>{t('PopupTriggers.summary.pageTargeting')}</Typography>
            {renderPageTargeting()}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.bold}>{t('PopupTriggers.summary.frequency')}</Typography>
            {renderFrequency()}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.bold}>{t('PopupTriggers.summary.continueAfterConversion')}</Typography>
            <Typography>{payload?.ContinueAfterConversion ? t('common.Yes') : t('common.No')}</Typography>
            <Typography className={classes.bold} style={{ marginTop: 10 }}>{t('PopupTriggers.summary.conversionType')}</Typography>
            <Typography>{payload?.ConversionTypeId === 1 ? t('PopupTriggers.advanceSettings.postConversion.defineConversion.formSubmission') : t('PopupTriggers.advanceSettings.postConversion.defineConversion.buttonClick')}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.stickyFooter}>
        <Button
          onClick={() => navigate(`${sitePrefix}Popups/DisplayRules/${id}`)}
          className={clsx(classes.btn, classes.btnRounded, classes.backButton)}
          style={{ margin: "8px" }}
        >
          {t("common.back")}
        </Button>
        <Button
          onClick={handlePublish}
          className={clsx(classes.btn, classes.btnRounded, classes.backButton)}
          style={{ margin: "8px" }}
          disabled={loading}
        >
          {t("common.publish")}
        </Button>
      </Box>
      <Loader isOpen={loading} />
      {toastMessage && renderToast()}
    </React.Fragment>
  );
};

export default PopupSummary;