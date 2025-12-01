import React, { useState, FC, useEffect, useRef } from "react";
import {
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Slider,
  Box,
  Paper,
  Button,
} from "@material-ui/core";
import {
  ExitToApp as ExitToAppIcon,
  Visibility as VisibilityIcon,
  Timer as TimerIcon,
  Height as HeightIcon,
  TouchApp as TouchAppIcon,
  Refresh as RefreshIcon,
} from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import TriggerCard from "./Components/TriggersCard";
import clsx from 'clsx';
import DisplayFrequency from "./Components/DisplayFrequency";
import PageTargeting, { TargetingRule } from "./Components/PageTargeting";
import AdvancedSettings, { AdvancedSettingsData } from "./Components/AdvanceSettings";
import DefaultScreen from "../../DefaultScreen";
import { Title } from "../../../components/managment/Title";
import { getPopupLookupData, upsertPopupRules, getPopupRulesById } from "../../../redux/reducers/popupTriggersSlice";
import { Loader } from "../../../components/Loader/Loader";
import PulseemSwitch from "../../../components/Controlls/PulseemSwitch";
import { sitePrefix } from "../../../config";
import Toast from "../../../components/Toast/Toast.component";
import Targeting, { DeviceTargetingData } from "./Components/Targeting";

const iconMap: { [key: string]: React.ReactElement } = {
  "Exit Intent": <ExitToAppIcon />,
  "Page Views": <VisibilityIcon />,
  "Viewing Time": <TimerIcon />,
  "Scroll Depth": <HeightIcon />,
  "Page Clicks": <TouchAppIcon />,
};

const PopupTriggers: FC<{ classes: any }> = ({ classes }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const fromEditor = queryParams.get('from') === 'editor';
  const location = useLocation();
  const returnState = location.state as { returnView?: 'card' | 'table'} | undefined;

  const { language } = useSelector((state: any) => state.core);
  const { lookupData, loading, error, upserting, upsertSuccess, popupRules, rulesLoading } = useSelector((state: any) => state.popupTriggers);

  const [deviceTargetingData, setDeviceTargetingData] = useState<DeviceTargetingData>({
    desktop: true,
    mobile: true,
  });

  console.log(deviceTargetingData)
  const [triggersState, setTriggersState] = useState<any>({});
  const [showSections, setShowSections] = useState({
    displayFrequency: true,
    pageTargeting: true,
    advancedSettings: true,
    deviceTargeting: true,
  });

  const [displayFrequencyData, setDisplayFrequencyData] = useState({
    targetAudience: 'All Visitors',
    displaySchedule: 'Every visit',
    everyXDays: 0,
    everyXVisits: 0,
    days: 0,
  });

  const [pageTargetingRules, setPageTargetingRules] = useState<TargetingRule[]>([]);
  const [advancedSettingsData, setAdvancedSettingsData] = useState<AdvancedSettingsData>({
    shouldContinueShowing: false,
    conversionType: 'formSubmission',
  });
  const [payloadForSummary, setPayloadForSummary] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<any>(null);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);

  // Force refresh data when component mounts or when returning from another page
  const refreshData = (silent = false) => {
    if (id) {
      setShouldShowLoader(!silent);
      dispatch(getPopupLookupData({ id: parseInt(id, 10) }));
      dispatch(getPopupRulesById({ webFormId: parseInt(id, 10) }));
    }
  };

  // Manual refresh with user feedback
  const handleManualRefresh = () => {
    refreshData(false);
    setToastMessage({
      severity: 'info',
      color: 'info',
      message: t('common.dataRefreshed') || 'Data refreshed successfully',
      showAnimtionCheck: true
    });
  };

  useEffect(() => {
    refreshData(false);

  }, [dispatch, id]);

  // Also refresh when coming back from navigation (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      // Small delay to ensure the component is properly mounted
      setTimeout(() => {
        refreshData(true);
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [id]);

  // Refresh data when the page becomes visible (user returns to tab/page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!loading && !rulesLoading) {
      setShouldShowLoader(false);
    }
  }, [loading, rulesLoading]);

  // Clear state when component unmounts to ensure fresh data on next visit
  useEffect(() => {
    return () => {
      setTriggersState({});
      setDisplayFrequencyData({
        targetAudience: 'All Visitors',
        displaySchedule: 'Every visit',
        everyXDays: 0,
        everyXVisits: 0,
        days: 0,
      });
      setPageTargetingRules([]);
      setAdvancedSettingsData({
        shouldContinueShowing: false,
        conversionType: 'formSubmission',
      });
    };
  }, []);

  // Initialize triggers state when only lookupData is available (for new popups without saved rules)
  useEffect(() => {
    if (lookupData?.PopupTriggers && !popupRules && !loading && !rulesLoading) {
      const initialState = lookupData.PopupTriggers.reduce((acc: any, trigger: any) => {
        const key = trigger.Name.replace(/\s+/g, '');
        switch (trigger.Name) {
          case "Exit Intent": acc[key] = { enabled: false }; break;
          case "Page Views": acc[key] = { enabled: false, pages: 3 }; break;
          case "Viewing Time": acc[key] = { enabled: false, time: 30, scope: "currentPage" }; break;
          case "Scroll Depth": acc[key] = { enabled: false, depth: 50 }; break;
          case "Page Clicks": acc[key] = { enabled: false, clicks: 5 }; break;
          default: acc[key] = { enabled: false }; break;
        }
        return acc;
      }, {});
      setTriggersState(initialState);
    }
  }, [lookupData, popupRules, loading, rulesLoading]);

  useEffect(() => {
    if (popupRules && lookupData && lookupData.PopupTriggers) {
      // Always create a fresh state with all triggers disabled first
      setTriggersState(() => {
        // Create initial state with all triggers disabled
        const freshState = lookupData.PopupTriggers.reduce((acc: any, trigger: any) => {
          const key = trigger.Name.replace(/\s+/g, '');
          switch (trigger.Name) {
            case "Exit Intent": acc[key] = { enabled: false }; break;
            case "Page Views": acc[key] = { enabled: false, pages: 3 }; break;
            case "Viewing Time": acc[key] = { enabled: false, time: 30, scope: "currentPage" }; break;
            case "Scroll Depth": acc[key] = { enabled: false, depth: 50 }; break;
            case "Page Clicks": acc[key] = { enabled: false, clicks: 5 }; break;
            default: acc[key] = { enabled: false }; break;
          }
          return acc;
        }, {});
        
        // Now apply the API data - only enable triggers that exist in the API response
        if (popupRules.PopupTriggers && Array.isArray(popupRules.PopupTriggers)) {
          popupRules.PopupTriggers.forEach((rule: any) => {
            const triggerDef = lookupData.PopupTriggers.find((t: any) => t.Id === rule.TriggerId);
            
            if (triggerDef) {
              const key = triggerDef.Name.replace(/\s+/g, '');
              // Ensure the key exists in the state before updating
              if (freshState[key]) {
                freshState[key] = { ...freshState[key], enabled: true };
                
                if (key === 'PageViews') {
                  freshState[key].pages = Number(rule.TriggerValue) || 3;
                }
                if (key === 'ViewingTime') {
                  freshState[key].time = Number(rule.TriggerValue) || 30;
                  if (rule.TriggerViewTimeScopeId) {
                    freshState[key].scope = rule.TriggerViewTimeScopeId === 1 ? 'currentPage' : 'anyPage';
                  }
                }
                if (key === 'ScrollDepth') {
                  freshState[key].depth = Number(rule.TriggerValue) || 50;
                }
                if (key === 'PageClicks') {
                  freshState[key].clicks = Number(rule.TriggerValue) || 5;
                }
              }
            }
          });
        }
        return freshState;
      });

      // Bind PopupFrequency
      if (popupRules.PopupFrequency?.length > 0) {
        const freq = popupRules.PopupFrequency[0];
        const audienceTarget = lookupData.AudienceTargets.find((at: any) => at.Id === freq.AudienceTargetTypeId)?.Name;
        const displaySchedule = lookupData.DisplayFrequencies.find((df: any) => df.Id === freq.FrequencyTypeId)?.Name;

        const newDisplayFrequencyData = {
          targetAudience: audienceTarget || '',
          displaySchedule: displaySchedule || '',
          everyXDays: freq.FrequencyTypeId === 2 ? (freq.FrequencyValue || 0) : 0,
          everyXVisits: freq.FrequencyTypeId === 3 ? (freq.FrequencyValue || 0) : 0,
          days: freq.VisitorDays || 0,
        };

        setDisplayFrequencyData(newDisplayFrequencyData);

        // Switch off Display Frequency if audienceTarget is undefined
        if (!audienceTarget) {
          setShowSections(prev => ({
            ...prev,
            displayFrequency: false
          }));
        } else {
          setShowSections(prev => ({
            ...prev,
            displayFrequency: true
          }));
        }
      }

      // Bind PopupDeviceTargets
      if (popupRules.PopupDeviceTargets && Array.isArray(popupRules.PopupDeviceTargets)) {
        const hasDesktop = popupRules.PopupDeviceTargets.includes(1);
        const hasMobile = popupRules.PopupDeviceTargets.includes(2);

        setDeviceTargetingData({
          desktop: hasDesktop,
          mobile: hasMobile,
        });

        // Show device targeting section if there are device targets
        setShowSections(prev => ({
          ...prev,
          deviceTargeting: true
        }));
      } else {
        // Default to both devices if no data
        setDeviceTargetingData({
          desktop: true,
          mobile: true,
        });
        setShowSections(prev => ({
          ...prev,
          deviceTargeting: false
        }));
      }

      // Bind PopupPageTargeting
      if (popupRules.PopupPageTargeting?.length > 0) {
        const newRules = popupRules.PopupPageTargeting.map((rule: any) => {
          const conditionType = lookupData.ConditionTypes.find((ct: any) => ct.Id === rule.ConditionTypeId)?.Name;
          return {
            id: uuidv4(),
            type: conditionType || 'Contains',
            value: rule.ConditionValue,
          };
        });
        setPageTargetingRules(newRules);
        setShowSections(prev => ({
          ...prev,
          pageTargeting: true
        }));
      } else {
        setShowSections(prev => ({
          ...prev,
          pageTargeting: false
        }));
      }

      // Load advanced settings
      const conversionId = popupRules.PopupConversionId || popupRules.PopupConvesrionId;

      const shouldShowAdvancedSettings = conversionId !== undefined && conversionId !== 0;

      setShowSections(prev => ({
        ...prev,
        advancedSettings: shouldShowAdvancedSettings
      }));

      if (popupRules.ContinueAfterConversion !== undefined && conversionId !== undefined && conversionId !== 0) {
        const conversionType = conversionId === 1 ? 'formSubmission' : 'buttonClick';

        setAdvancedSettingsData({
          shouldContinueShowing: popupRules.ContinueAfterConversion,
          conversionType: conversionType,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupRules, lookupData]);

  const handleDisplayFrequencyChange = (fieldName: string, value: any) => {
    setDisplayFrequencyData(prev => {
      const updated = { ...prev, [fieldName]: value };

      if (fieldName === 'displaySchedule') {
        updated.everyXDays = 0;
        updated.everyXVisits = 0;
      }

      if (fieldName === 'targetAudience') {
        updated.days = 0;
        updated.everyXDays = 0;
        updated.everyXVisits = 0;
      }

      return updated;
    });
  };

  const handleDeviceTargetingChange = (devices: DeviceTargetingData) => {
    setDeviceTargetingData(devices);
  };

  const handleAdvancedSettingsChange = (fieldName: string, value: any) => {
    setAdvancedSettingsData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleToggle = (triggerKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTriggersState({
      ...triggersState,
      [triggerKey]: { ...triggersState[triggerKey], enabled: event.target.checked },
    });
  };

  const handleChange = (triggerKey: string, field: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setTriggersState({
      ...triggersState,
      [triggerKey]: { ...triggersState[triggerKey], [field]: event.target.value },
    });
  };

  const handleSliderChange = (triggerKey: string, field: string) => (event: any, newValue: number | number[]) => {
    setTriggersState({
      ...triggersState,
      [triggerKey]: { ...triggersState[triggerKey], [field]: newValue as number },
    });
  };

  const showErrorToast = (message: string) => {
    setToastMessage({
      severity: 'error',
      color: 'error',
      message,
      showAnimtionCheck: false
    });
  };

  const handleSummaryClick = async () => {

    // const anyTriggerEnabled = Object.values(triggersState).some((trigger: any) => trigger.enabled);

    // if (!anyTriggerEnabled) {
    //   showErrorToast(t('PopupTriggers.atLeastOneTrigger'));
    //   return;
    // }

    const popupTriggers = Object.keys(triggersState)
      .filter(key => triggersState[key].enabled)
      .map(key => {
        const triggerLookup = lookupData.PopupTriggers.find((t: any) => t.Name.replace(/\s+/g, '') === key);
        let triggerValue = 0;
        let triggerViewTimeScopeId = undefined;

        if (key === 'PageViews') triggerValue = triggersState[key].pages;
        else if (key === 'ViewingTime') {
          triggerValue = triggersState[key].time;
          triggerViewTimeScopeId = triggersState[key].scope === 'currentPage' ? 1 : 2;
        }
        else if (key === 'ScrollDepth') triggerValue = triggersState[key].depth;
        else if (key === 'PageClicks') triggerValue = triggersState[key].clicks;

        const trigger: any = {
          TriggerId: triggerLookup.Id,
          TriggerValue: triggerValue,
        };

        if (triggerViewTimeScopeId !== undefined) {
          trigger.TriggerViewTimeScopeId = triggerViewTimeScopeId;
        }

        return trigger;
      });

    // Only include page targeting if there are rules with valid condition values
    const popupPageTargeting = pageTargetingRules.length > 0 ? pageTargetingRules
      .filter(rule => rule.value && rule.value.trim() !== '') // Filter out empty or whitespace-only values
      .map(rule => {
        const conditionType = lookupData.ConditionTypes.find((c: any) => c.Name === rule.type);
        return {
          ConditionTypeId: conditionType.Id,
          ConditionValue: rule.value,
        };
      }) : [];

    const displayFrequency = lookupData.DisplayFrequencies.find((df: any) => df.Name === displayFrequencyData.displaySchedule);
    const audienceTarget = lookupData.AudienceTargets.find((at: any) => at.Name === displayFrequencyData.targetAudience);

    let frequencyValue = 0;
    if (displayFrequencyData.displaySchedule === 'Once every few days') {
      frequencyValue = displayFrequencyData.everyXDays;
    } else if (displayFrequencyData.displaySchedule === 'Once every few visits') {
      frequencyValue = displayFrequencyData.everyXVisits;
    }

    const deviceTargets: number[] = [];
    if (deviceTargetingData.desktop) deviceTargets.push(1);
    if (deviceTargetingData.mobile) deviceTargets.push(2);

    // Build payload object conditionally
    const payload: any = {
      WebformId: parseInt(id!, 10),
      PopupTriggers: popupTriggers,
      PopupFrequency: {
        FrequencyTypeId: displayFrequency?.Id || 0,
        FrequencyValue: frequencyValue,
        AudienceTargetTypeId: audienceTarget?.Id || 0,
        VisitorDays: displayFrequencyData?.days || 0,
      },
      ContinueAfterConversion: showSections.advancedSettings ? advancedSettingsData.shouldContinueShowing : false,
      ConversionTypeId: showSections.advancedSettings ? (advancedSettingsData.conversionType === 'formSubmission' ? 1 : 2) : 0,
      DeviceTargets: deviceTargets,
    };

    // Only add PopupPageTargeting if there are rules
    if (popupPageTargeting.length > 0) {
      payload.PopupPageTargeting = popupPageTargeting;
    }

    setPayloadForSummary(payload);
    
    const response = await dispatch(upsertPopupRules(payload));
    
    if (response.payload?.Data?.IsSuccess) {
      navigate(`${sitePrefix}landingPages/Popups/Summary/${id}`, {
        state: { payload, lookupData }
      });
    } else {
      const errorMessage = response.payload?.Data?.ErrorDetails ||
        response.payload?.Message ||
        t('common.Error');
      showErrorToast(errorMessage);
    }
  };

  const renderTriggerSpecificFields = (trigger: any, triggerKey: string) => {
    if (!triggersState[triggerKey]) return null;

    switch (trigger.Name) {
      case "Page Views":
        return (
          <Box className={classes.inputContainerPopupTrigger}>
            <Typography>{t("PopupTriggers.popupTriggers.pageViews.after")}</Typography>
            <TextField variant="outlined" size="small" className={classes.textFieldPopupTrigger} value={triggersState[triggerKey].pages} onChange={handleChange(triggerKey, "pages")} disabled={!triggersState[triggerKey].enabled} />
            <Typography>{t("PopupTriggers.popupTriggers.pageViews.pages")}</Typography>
          </Box>
        );
      case "Viewing Time":
        return (
          <Box className={classes.inputContainerPopupTrigger} display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 8 }}>
            <Typography variant="body2" noWrap>{t("PopupTriggers.popupTriggers.pageViews.after")}</Typography>
            <TextField variant="outlined" className={classes.textFieldPopupTrigger} value={triggersState[triggerKey].time} onChange={handleChange(triggerKey, "time")} disabled={!triggersState[triggerKey].enabled} />
            <Typography variant="body2" noWrap>{t("PopupTriggers.popupTriggers.viewingTime.seconds")}</Typography>
            <Select value={triggersState[triggerKey].scope} onChange={handleChange(triggerKey, "scope")} variant="outlined" className={classes.selectPopupTrigger} disabled={!triggersState[triggerKey].enabled} style={{ minWidth: 120 }}>
              <MenuItem value="currentPage">{t("PopupTriggers.popupTriggers.viewingTime.onCurrentPage")}</MenuItem>
              <MenuItem value="anyPage">{t("PopupTriggers.popupTriggers.viewingTime.onAnyPage")}</MenuItem>
            </Select>
          </Box>
        );
      case "Scroll Depth":
        return (
          <Box className={classes.sliderContainerPopupTrigger}>
            <Box className={clsx(classes.sliderLabelPopupTrigger, classes.mLeft5)}>
              <Typography className={classes.font20}>{t("PopupTriggers.popupTriggers.scrollDepth.pageDepth")}</Typography>
              <Slider value={triggersState[triggerKey].depth} onChange={handleSliderChange(triggerKey, "depth")} aria-labelledby="scroll-depth-slider" valueLabelDisplay="auto" min={0} max={100} classes={{ root: classes.sliderRootPopupTrigger, rail: classes.railPopupTrigger, track: classes.trackPopupTrigger, thumb: classes.thumbPopupTrigger }} disabled={!triggersState[triggerKey].enabled} />
              <Typography className={clsx(classes.font20, classes.p10)}>{triggersState[triggerKey].depth}%</Typography>
            </Box>
          </Box>
        );
      case "Page Clicks":
        return (
          <Box className={classes.inputContainerPopupTrigger}>
            <Typography>{t("PopupTriggers.popupTriggers.pageViews.after")}</Typography>
            <TextField variant="outlined" className={classes.textFieldPopupTrigger} value={triggersState[triggerKey].clicks} onChange={handleChange(triggerKey, "clicks")} disabled={!triggersState[triggerKey].enabled} />
            <Typography>{t("PopupTriggers.popupTriggers.pageClicks.clicks")}</Typography>
          </Box>
        );
      default: return null;
    }
  };

  const renderButtons = () => (
    <>
      <Button
        onClick={() => navigate(
          fromEditor
            ? `${sitePrefix}popupeditor/${id}`
            : `${sitePrefix}PopUpManagement`,
            {
              state: returnState ? {
                view: returnState.returnView
              } : undefined
            }
        )}
        className={clsx(classes.btn, classes.btnRounded, classes.backButton)}
        style={{ margin: "8px" }}
      >
        {t("common.back")}
      </Button>
      <Button
        onClick={handleSummaryClick}
        variant="contained"
        size="medium"
        className={clsx(classes.btn, classes.btnRounded)}
        style={{ margin: "8px" }}
        disabled={upserting}
      >
        {t("common.saveAndContinue")}
      </Button>
    </>
  );

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return <Toast customData={null} data={toastMessage} />;
  };

  return (
    <DefaultScreen currentPage='PopupTriggers' classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
      <Box className={clsx(classes.mainTitlePopupTrigger, 'topSection')} mb={4}>
        <Box justifyContent="space-between" alignItems="center" mb={2}>
          <Title Text={t('PopupTriggers.popupTriggers.mainTitle')} classes={classes} />
        </Box>
        <Paper variant="outlined" className={clsx(classes.paperPopupTrigger, classes.noPadding)}>
          <Box className={clsx(classes.topHeaderPopupTrigger, classes.p10)}>
            <div>
              <Typography variant="body1" className={clsx(classes.managementTitle, classes.sectionTitlePopupTrigger)} gutterBottom>{t("PopupTriggers.popupTriggers.title")}</Typography>
              <Typography variant="body1" className={classes.subtitlePopupTrigger}>{t("PopupTriggers.popupTriggers.subtitle")}</Typography>
            </div>
          </Box>
          <Grid container spacing={3} className={classes.cardContainerPopupTrigger}>
            {lookupData?.PopupTriggers && Object.keys(triggersState).length > 0 && lookupData.PopupTriggers.map((trigger: any) => {
              const triggerKey = trigger.Name.replace(/\s+/g, '');
              return (
                <Grid item xs={12} sm={6} md={4} key={trigger.Id}>
                  <TriggerCard
                    title={t(`PopupTriggers.popupTriggers.${triggerKey.charAt(0).toLowerCase() + triggerKey.slice(1)}.title`)}
                    description={t(`PopupTriggers.popupTriggers.${triggerKey.charAt(0).toLowerCase() + triggerKey.slice(1)}.description`)}
                    footer={t(`PopupTriggers.popupTriggers.${triggerKey.charAt(0).toLowerCase() + triggerKey.slice(1)}.footer`)}
                    icon={iconMap[trigger.Name]}
                    enabled={triggersState[triggerKey]?.enabled}
                    onToggle={handleToggle(triggerKey)}
                    classes={classes}
                  >
                    {renderTriggerSpecificFields(trigger, triggerKey)}
                  </TriggerCard>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
        <DisplayFrequency
          classes={classes}
          lookupData={lookupData}
          show={showSections.displayFrequency}
          onToggle={() => {
            setShowSections(prev => {
              const newDisplayFrequencyState = !prev.displayFrequency;
              
              // If disabling Display Frequency, reset the display schedule to default
              if (!newDisplayFrequencyState) {
                setDisplayFrequencyData(prevData => ({
                  ...prevData,
                  displaySchedule: '',
                  everyXDays: 0,
                  everyXVisits: 0,
                  targetAudience: '',
                  days: 0,
                }));
              } else {
                setDisplayFrequencyData(prevData => ({
                  ...prevData,
                  displaySchedule: 'Every visit',
                  everyXDays: 0,
                  everyXVisits: 0,
                  targetAudience: 'All Visitors',
                  days: 0,
                }));
              }
              
              return { ...prev, displayFrequency: newDisplayFrequencyState };
            });
          }}
          data={displayFrequencyData}
          onChange={handleDisplayFrequencyChange}
        />
        <Targeting
          classes={classes}
          lookupData={lookupData}
          show={showSections.deviceTargeting}
          onToggle={() => {
            setShowSections(prev => {
              const newDeviceTargetingState = !prev.deviceTargeting;
              if (!newDeviceTargetingState) {
                setDeviceTargetingData({
                  desktop: true,
                  mobile: true,
                });
              }

              return { ...prev, deviceTargeting: newDeviceTargetingState };
            });
          }}
          data={deviceTargetingData}
          onChange={handleDeviceTargetingChange}
        />
        <PageTargeting
          classes={classes}
          lookupData={lookupData}
          show={showSections.pageTargeting}
          onToggle={() => setShowSections(prev => ({ ...prev, pageTargeting: !prev.pageTargeting }))}
          rules={pageTargetingRules}
          onRulesChange={setPageTargetingRules}
        />
        <AdvancedSettings
          classes={classes}
          show={showSections.advancedSettings}
          lookupData={lookupData}
          onToggle={() => setShowSections(prev => ({ ...prev, advancedSettings: !prev.advancedSettings }))}
          data={advancedSettingsData}
          onChange={handleAdvancedSettingsChange}
        />
      </Box>
      <Loader isOpen={shouldShowLoader && (loading || upserting || rulesLoading)} />
      <Box className={classes.stickyFooter}>
        {renderButtons()}
      </Box>
      {toastMessage && renderToast()}
    </DefaultScreen>
  );
};

export default PopupTriggers;