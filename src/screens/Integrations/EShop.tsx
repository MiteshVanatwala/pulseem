import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, MenuItem, FormControl } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { EShopModel, IntegrationGroups } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import GroupTags from "../../components/Groups/GroupTags";
import { IoIosArrowDown } from "react-icons/io";
import { StateType } from "../../Models/StateTypes";
import Select from '@mui/material/Select';
import { TimeType } from "../../Models/PushNotifications/Enums";

const EShop = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  const [ showResetDialog, setShowResetDialog ] = useState(false);
  const [ toastMessage, setToastMessage ] = useState(null);
  const [ showLoader, setShowLoader ] = useState(false);
  const [ isPageLoading, setIsPageLoading ] = useState(false);
  const [ errors, setErrors ] = useState({
    ApiKey: '',
    authentication_message: '',
    group_not_selected: '',
    IntervalToRunService: '',
    IntervalToProccessingAbandoned: '',
    DaysBackwards: '',
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    ApiKey: '',
    IntervalToRunService: '',
    IntervalToProccessingAbandoned: '',
    DaysBackwards: 1,
    RegisterEventActive: false,
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    Groups: {} as IntegrationGroups,
  } as EShopModel);
  const [ isAuthenticated, setAuthenticated ] = useState(false);
  const [ storeRunInterval, setStoreRunInterval ] = useState<number>(0);
  const [ storeRunIntervalType, setStoreRunIntervalType ] = useState<number>(TimeType.Hours);
  const [ insertCartAsAbandonedTime, setInsertCartAsAbandonedTime ] = useState<number>(0);
  const [ insertCartAsAbandonedTimeType, setInsertCartAsAbandonedTimeType ] = useState<number>(TimeType.Minutes);
  
  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    initSettings();
    document.title = `${t('integrations.eShop.title')} | ${document.title}`;
  }, []);

  useEffect(() => {
    if (storeRunIntervalType === TimeType.Days && storeRunInterval > 365) setStoreRunInterval(365); 
    else if (storeRunIntervalType === TimeType.Hours && storeRunInterval > 24) setStoreRunInterval(24); 
  }, [ storeRunIntervalType ])

  useEffect(() => {
    if (insertCartAsAbandonedTimeType === TimeType.Minutes && storeRunInterval > 60) setStoreRunInterval(60); 
    else if (insertCartAsAbandonedTimeType === TimeType.Hours && storeRunInterval > 24) setStoreRunInterval(24); 
  }, [ insertCartAsAbandonedTimeType ])

  const initSettings = async () => {
    setShowLoader(true);
    const settingResponse = await dispatch(getIntegration(LU_Plugin.EShop)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse)
    if (!subAccountAllGroups?.length) {
      dispatch(getGroupsBySubAccountId());
    }
    setIsPageLoading(false);
  }

  const submitForm = async () => {
    let isValid = settings.RegisterEventActive || settings.PurchaseEventActive || settings.AbandonedEventActive;
    let errorsObj = JSON.parse(JSON.stringify(errors));
    
    if (!isValid) {
      errorsObj = { ...errorsObj, group_not_selected: t(`integrations.selectGroup`) };
    }
    
    if (settings.DaysBackwards < 0 || settings.DaysBackwards > 365) {
      errorsObj = { ...errorsObj, DaysBackwards: t('integrations.eShop.1To365') };
      isValid = false;
    }

    if (storeRunInterval <= 0) {
      errorsObj = { ...errorsObj, IntervalToRunService: t('integrations.eShop.nonZero') };
      isValid = false;
    }

    if (insertCartAsAbandonedTime <= 0) {
      errorsObj = { ...errorsObj, IntervalToProccessingAbandoned: t('integrations.eShop.nonZero') };
      isValid = false;
    }

    if (isValid) {
      setErrors({
        ...errors,
        group_not_selected: '',
        DaysBackwards: '',
        IntervalToRunService: '',
        IntervalToProccessingAbandoned: ''
      })
      setShowLoader(true);
      let IntervalToProccessingAbandoned = '';
      let IntervalToRunService = '';
      if (storeRunIntervalType === TimeType.Hours) {
        IntervalToRunService = `00:${storeRunInterval < 10 ? `0${storeRunInterval}` : storeRunInterval}:00`;
      } else {
        IntervalToRunService = `${storeRunInterval < 10 ? `0${storeRunInterval}` : storeRunInterval}:00:00`;
      }

      if (insertCartAsAbandonedTimeType === TimeType.Hours) {
        IntervalToProccessingAbandoned = `${insertCartAsAbandonedTime < 10 ? `0${insertCartAsAbandonedTime}` : insertCartAsAbandonedTime}:00`;
      } else {
        IntervalToProccessingAbandoned = `00:${insertCartAsAbandonedTime < 10 ? `0${insertCartAsAbandonedTime}` : insertCartAsAbandonedTime}`;
      }

      const request = {
        IntegrationSource: LU_Plugin.EShop,
        JsonData: JSON.stringify({
          ...settings,
          IntervalToRunService,
          IntervalToProccessingAbandoned
        })
      } as IntegrationRequest;
      const response = await dispatch(setIntegration(request));
      handleSubmitFormResponse(response);
      setShowLoader(false);
    } else {
      setErrors(errorsObj);
    }
  }

  const handleSubmitFormResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setMessages({
          ...messages,
          group_saved: t(`integrations.formSubmitResponses.201`),
        });
        setTimeout(() => {
          setMessages({
            ...errors,
            group_saved: '',
          });
        }, 4000);
        break;
      }
    }
  }

  const handleGetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        const resp = response?.payload?.Data as EShopModel;
        if (resp.ApiKey) {
          setSettings(resp);
          calculateDaysHoursMinutes(resp.IntervalToProccessingAbandoned)
          calculateDaysHoursMinutes(resp.IntervalToRunService)
          setAuthenticated(true);
        }
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 200:
      case 402:
      case 500: {
        break;
      }
    }
  }

  const handleResetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setAuthenticated(false);
        setSettings({
          ApiKey: '',
          IntervalToRunService: '',
          IntervalToProccessingAbandoned: '',
          DaysBackwards: 1,
          RegisterEventActive: false,
          PurchaseEventActive: false,
          AbandonedEventActive: false,
          Groups: {}
        });
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 200:
      case 402:
      case 403:
      case 500: {
        break;
      }
    }
  }

  const resetStore = async () => {
    setShowResetDialog(false);
    setShowLoader(true);
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.EShop)) as any;
    handleResetIntegrationResponse(resetResponse);
    setShowLoader(false);
  }

  const renderResetDialog = () => {
    return (
      <BaseDialog
        classes={classes}
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => resetStore()}
        title=""
      >
        <Box className={clsx(classes.bodyTextDialog, classes.pb25)}>
          <Typography>
            {t("integrations.resetConfirmation")}
          </Typography>
        </Box>
      </BaseDialog>
    )
  }

  const authenticateStore = async () => {
    let errorsDump = errors;
    if (settings.ApiKey.trim() === '') errorsDump = { ...errorsDump, ApiKey: t('integrations.eShop.subTitle') };
    await setErrors(errorsDump);
    if (settings.ApiKey.trim() !== '') {
      setErrors({
        ApiKey: '',
        authentication_message: '',
        group_not_selected: '',
        IntervalToRunService: '',
        DaysBackwards: '',
        IntervalToProccessingAbandoned: '',
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.EShop,
        JsonData: JSON.stringify(settings)
      } as IntegrationRequest;
      const authResponse = await dispatch(authenticate(request));
      setShowLoader(false);
      handleAuthResponse(authResponse);
    }
  }

  const calculateDaysHoursMinutes = (str: string) => {
    const strSplit: any = str.split(':');
    if (strSplit.length > 2) {
      setStoreRunInterval(Number(Number(strSplit[0]) === 0 ? strSplit[1] : strSplit[0]));
      setStoreRunIntervalType(Number(strSplit[0]) === 0 ? TimeType.Hours : TimeType.Days);
    } else {
      setInsertCartAsAbandonedTime(Number(Number(strSplit[0]) === 0 ? strSplit[1] : strSplit[0]));
      setInsertCartAsAbandonedTimeType(Number(strSplit[0]) === 0 ? TimeType.Minutes : TimeType.Hours);
    }
  }

  const validateDayHourMinuteField = (element: React.FormEvent<HTMLInputElement>, type: number) => {
    let number = Number(element.currentTarget.value || 0);
    let min = 0, max = 0;
    if (type === TimeType.Days) {
      min = 1; max = 365;
    } else if (type === TimeType.Hours) {
      min = 1; max = 24;
    } else if (type === TimeType.Minutes) {
      min = 1; max = 60;
    }
    if (number < min) number = min;
    else if (number > max) number = max;
    return number;
  }

  const handleAuthResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setMessages({
          ...messages,
          authentication_message: t(`integrations.authResponses.201`),
        });
        setTimeout(() => {
          setMessages({
            ...messages,
            authentication_message: '',
          });
          setAuthenticated(true);
          initSettings();
        }, 2000);
        break;
      }
      case 400: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.400`),
        });
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 200:
      case 403: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.403`),
        })
        break;
      }
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.404`),
        })
        setToastMessage({ severity: 'error', color: 'error', message: "integrations.authResponses.404", showAnimtionCheck: false } as any);
        break;
      }
    }
  }

  return (
    <>
      {toastMessage && renderToast()}
      {
        !isPageLoading && (
          <Box className={"formContainer"}>
            <Box className={clsx(classes.dblock)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.apiKey")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.eShop.subTitle")}
              </Typography>
              <TextField
                size="small"
                name="DefaultFromName"
                value={settings.ApiKey}
                onChange={(event) => setSettings({ ...settings, ApiKey: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.ApiKey && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.ApiKey}
                </Typography>
              )}
            </Box>

            {!isAuthenticated &&
              <Box className={clsx(classes.dblock, classes.pb15, classes.pt30)}>
                <Button
                  onClick={authenticateStore}
                  variant='contained'
                  size='medium'
                  className={clsx(
                    classes.btn,
                    classes.btnRounded
                  )}
                  color="primary"
                >
                  {t("integrations.connectStore")}
                </Button>
              </Box>
            }
          </Box>
        )
      }
      {
        !isAuthenticated && (
          <>
            {!!errors.authentication_message && (
              <Box className={clsx(classes.flex, classes.pbt15)}>
                <Typography className={clsx(classes.errorText, classes.f16)}>
                  {errors.authentication_message}
                </Typography>
              </Box>
            )}
            {!!messages.authentication_message && (
              <Box className={clsx(classes.flex, classes.pbt15)}>
                <Typography className={clsx(classes.green, classes.f16)}>
                  {messages.authentication_message}
                </Typography>
              </Box>
            )}
          </>
        )
      }
      {
        isAuthenticated && (
          <Box className={"formContainer"}>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt20)}>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant='contained'
                size='medium'
                className={clsx(
                  classes.btn,
                  classes.btnRounded
                )}
                color="primary"
              >
                {t("integrations.disconnectStore")}
              </Button>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt14)}>
              <Box className={clsx(windowSize !== 'xs' ? classes.justifyBetween : '')}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.fetchStore")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid container>
                    <Grid>
                      <TextField
                        type="number"
                        size="small"
                        name="DefaultFromName"
                        value={storeRunInterval}
                        onChange={async (event: any) => {
                          const number = validateDayHourMinuteField(event, storeRunIntervalType);
                          setStoreRunInterval(number);
                        }}
                        className={clsx(classes.textField, classes.pt5, classes.pb5)}
                        InputProps={{
                          style: { paddingTop: 5, paddingBottom: 4 },
                        }}
                      />
                    </Grid>
                    <Grid className={clsx(classes.pe10, classes.pr10)}>
                      <FormControl
                        className={clsx(classes.selectInputFormControl, classes.dInlineBlock)}
                      >
                        <Select
                          variant="standard"
                          name="fetchStoreHourOrDay"
                          onChange={(e: any) => setStoreRunIntervalType(e.target.value)}
                          value={storeRunIntervalType}
                          className={classes.pbt5}
                          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                direction: isRTL ? 'rtl' : 'ltr'
                              },
                            },
                          }}
                        >
                          <MenuItem value={TimeType.Hours}>{t("common.hours")}</MenuItem>
                          <MenuItem value={TimeType.Days}>{t("common.days")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
            {!!errors.IntervalToRunService && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.IntervalToRunService}
              </Typography>
            )}
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <Box className={clsx(windowSize !== 'xs' ? classes.justifyBetween : '')}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.fetchData")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <TextField
                    type="number"
                    size="small"
                    name="DaysBackwards"
                    value={settings.DaysBackwards}
                    onChange={(event) => setSettings({ ...settings, DaysBackwards: Number(event.target.value || 0) })}
                    className={clsx(classes.textField, classes.pt5, classes.pb5)}
                    InputProps={{
                      style: { paddingTop: 5, paddingBottom: 4 },
                    }}
                  />
                </Box>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.daysAgo")}
                </Typography>
              </Box>
            </Grid>
            {!!errors.DaysBackwards && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.DaysBackwards}
              </Typography>
            )}
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt14)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.RegisterEventActive}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        RegisterEventActive: event.target.checked,
                        Groups: {
                          ...settings.Groups,
                          RegisterGroups: event.target.checked ? settings?.Groups?.RegisterGroups : []
                        }
                      })
                    }
                    name="signup"
                    color="primary"
                  />
                }
                label={t('integrations.signUp')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Box className={clsx('group-dropdown', !settings.RegisterEventActive ? classes.disabled : '')}>
                  <GroupTags
                    className='group-select'
                    groupSelected={settings.Groups?.RegisterGroups || []}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    dropdown
                    dropDownProps={{
                      onChange: (e: any, val: any) => {
                        setSettings({
                          ...settings,
                          Groups: {
                            ...settings.Groups,
                            RegisterGroups: val.reduce((prevVal: any, newVal: any) => [...prevVal, newVal.GroupID], [])
                          }
                        })
                      },
                      selectedGroups: settings.Groups?.RegisterGroups || [],
                      groups: []
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.PurchaseEventActive}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        PurchaseEventActive: event.target.checked,
                        Groups: {
                          ...settings.Groups,
                          PurchaseGroups: event.target.checked ? settings?.Groups?.PurchaseGroups : []
                        }
                      })
                    }
                    name="signup"
                    color="primary"
                  />
                }
                label={t('integrations.purchase')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Box className={clsx('group-dropdown', !settings.PurchaseEventActive ? classes.disabled : '')}>
                  <GroupTags
                    className='group-select'
                    groupSelected={settings.Groups?.PurchaseGroups || []}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    dropdown
                    dropDownProps={{
                      onChange: (e: any, val: any) => {
                        setSettings({
                          ...settings,
                          Groups: {
                            ...settings.Groups,
                            PurchaseGroups: val.reduce((prevVal: any, newVal: any) => [...prevVal, newVal.GroupID], [])
                          }
                        })
                      },
                      selectedGroups: settings.Groups?.PurchaseGroups || [],
                      groups: []
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.AbandonedEventActive}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        AbandonedEventActive: event.target.checked,
                        Groups: {
                          ...settings.Groups,
                          AbandonedGroups: event.target.checked ? settings?.Groups?.AbandonedGroups : []
                        }
                      })
                    }
                    name="signup"
                    color="primary"
                  />
                }
                label={t('integrations.cartAbandonment')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Box className={clsx('group-dropdown', !settings.AbandonedEventActive ? classes.disabled : '')}>
                  <GroupTags
                    className='group-select'
                    groupSelected={settings.Groups?.AbandonedGroups || []}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    dropdown
                    dropDownProps={{
                      onChange: (e: any, val: any) => {
                        setSettings({
                          ...settings,
                          Groups: {
                            ...settings.Groups,
                            AbandonedGroups: val.reduce((prevVal: any, newVal: any) => [...prevVal, newVal.GroupID], [])
                          }
                        })
                      },
                      selectedGroups: settings.Groups?.AbandonedGroups || [],
                      groups: []
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            {!!errors.group_not_selected && (
              <Box className={clsx(classes.flex, classes.pbt15)}>
                <Typography className={clsx(classes.errorText, classes.f16)}>
                  {errors.group_not_selected}
                </Typography>
              </Box>
            )}
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, !settings.AbandonedEventActive ? classes.disabled : '')}>
              <Box className={clsx(windowSize !== 'xs' ? classes.justifyBetween : '')}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.cartAbandonedMinutesHours")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid container>
                    <Grid>
                      <TextField
                        type="number"
                        size="small"
                        name="insertCartAsAbandonedTime"
                        value={insertCartAsAbandonedTime}
                        onChange={async (event: any) => {
                          const number = validateDayHourMinuteField(event, insertCartAsAbandonedTimeType);
                          setInsertCartAsAbandonedTime(number);
                        }}
                        className={clsx(classes.textField, classes.pt5, classes.pb5)}
                        InputProps={{
                          style: { paddingTop: 5, paddingBottom: 4 },
                        }}
                      />
                    </Grid>
                    <Grid className={clsx(classes.pe10, classes.pr10)}>
                      <FormControl
                        className={clsx(classes.selectInputFormControl, classes.dInlineBlock)}
                      >
                        <Select
                          variant="standard"
                          name="cartAsAbandonedType"
                          onChange={(e: any) => setInsertCartAsAbandonedTimeType(e.target.value)}
                          value={insertCartAsAbandonedTimeType}
                          className={classes.pbt5}
                          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                direction: isRTL ? 'rtl' : 'ltr'
                              },
                            },
                          }}
                        >
                            <MenuItem value={TimeType.Minutes}>{t("common.minutes")}</MenuItem>
                            <MenuItem value={TimeType.Hours}>{t("common.hours")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
            {!!errors.IntervalToProccessingAbandoned && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.IntervalToProccessingAbandoned}
              </Typography>
            )}
            {!!messages.group_saved && (
              <Box className={clsx(classes.flex, classes.pbt15)}>
                <Typography className={clsx(classes.green, classes.f16)}>
                  {messages.group_saved}
                </Typography>
              </Box>
            )}
            <Box className={clsx(classes.flex, classes.pbt15)}>
              <Button
                onClick={submitForm}
                variant='contained'
                size='medium'
                className={clsx(
                  classes.btn,
                  classes.btnRounded
                )}
                color="primary"
              >
                {t("common.save")}
              </Button>
            </Box>
          </Box>
        )
      }
      <Loader isOpen={showLoader} showBackdrop={true} />
      {renderResetDialog()}
    </>
  );
};
export default EShop;