import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, MenuItem, FormControl } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { EShopModel, IntegrationGroups, IsracardModel } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import GroupTags from "../../components/Groups/GroupTags";
import { IoIosArrowDown } from "react-icons/io";
import { StateType } from "../../Models/StateTypes";
import Select from '@mui/material/Select';

const EShop = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errors, setErrors] = useState({
    api_key: '',
    authentication_message: '',
    group_not_selected: '',
    fetchStoreNumber: '',
    fetchDataNumber: '',
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    api_key: '',
    interfaceConnected: true,
    fetchStoreNumber: 0,
    fetchStoreHourOrDay: 'hours',
    fetchDataNumber: 0,
    RegisterEventActive: false,
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    cartAsAbandonedMinutesHours: 15,
    cartAsAbandonedType: 'minutes',
    Groups: {} as IntegrationGroups,
  } as EShopModel);
  
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

  const initSettings = async () => {
    setShowLoader(true);
    // const settingResponse = await dispatch(getIntegration(LU_Plugin.EShop)) as any;
    setShowLoader(false);
    // handleGetIntegrationResponse(settingResponse)
    if (subAccountAllGroups?.length === 0) {
      dispatch(getGroupsBySubAccountId());
    }
    setIsPageLoading(false);
  }

  const submitForm = async () => {
    if (settings.RegisterEventActive || settings.PurchaseEventActive || settings.AbandonedEventActive) {
      setErrors({
        ...errors,
        group_not_selected: '',
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Isracard,
        JsonData: JSON.stringify({ ...settings })
      } as IntegrationRequest;
      const response = await dispatch(setIntegration(request));
      handleSubmitFormResponse(response);
      setShowLoader(false);
    } else {
      setErrors({
        ...errors,
        group_not_selected: t(`integrations.selectGroup`),
      })
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
        const IsracardResponse = response?.payload?.Data as IsracardModel;
        if (IsracardResponse.api_key) {
          // setSettings(response?.payload?.Data as IsracardModel);
          // setAuthenticated(true);
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
        setSettings({
          api_key: '',
          interfaceConnected: false,
          fetchStoreNumber: 0,
          fetchStoreHourOrDay: '',
          fetchDataNumber: 0,
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
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.Isracard)) as any;
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
    if (settings.api_key.trim() === '') errorsDump = { ...errorsDump, api_key: t('integrations.eShop.subTitle') };
    await setErrors(errorsDump);
    if (settings.api_key.trim() !== '') {
      setErrors({
        api_key: '',
        authentication_message: '',
        group_not_selected: '',
        fetchStoreNumber: '',
        fetchDataNumber: ''
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Isracard,
        JsonData: JSON.stringify(settings)
      } as IntegrationRequest;
      const authResponse = await dispatch(authenticate(request));
      setShowLoader(false);
      handleAuthResponse(authResponse);
    }
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
          // setAuthenticated(true);
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
                value={settings.api_key}
                onChange={(event) => setSettings({ ...settings, api_key: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={settings.interfaceConnected}
              />
              {!!errors.api_key && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.api_key}
                </Typography>
              )}
            </Box>

            {!settings.interfaceConnected &&
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
        !settings.interfaceConnected && (
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
        settings.interfaceConnected && (
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
              <Box className={clsx(classes.justifyBetween)}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.fetchStore")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid container>
                    <Grid>
                      <TextField
                        size="small"
                        name="DefaultFromName"
                        value={settings.fetchStoreNumber}
                        onChange={(event) => setSettings({ ...settings, fetchStoreNumber: Number(event.target.value || 0) })}
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
                          onChange={(e: any) => { setSettings({ ...settings, fetchStoreHourOrDay: e.target.value }) }}
                          value={settings.fetchStoreHourOrDay}
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
                          <MenuItem value='hours'>{t("common.hours")}</MenuItem>
                          <MenuItem value='days'>{t("common.days")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                {!!errors.fetchStoreNumber && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.fetchStoreNumber}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <Box className={clsx(classes.justifyBetween)}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.fetchData")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <TextField
                    size="small"
                    name="DefaultFromName"
                    value={settings.fetchStoreNumber}
                    onChange={(event) => setSettings({ ...settings, fetchStoreNumber: Number(event.target.value || 0) })}
                    className={clsx(classes.textField, classes.pt5, classes.pb5)}
                    InputProps={{
                      style: { paddingTop: 5, paddingBottom: 4 },
                    }}
                  />
                </Box>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.daysAgo")}
                </Typography>
                {!!errors.fetchStoreNumber && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.fetchStoreNumber}
                  </Typography>
                )}
              </Box>
            </Grid>
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
              <Box className={clsx(classes.justifyBetween)}>
                <Typography className={clsx(classes.pt10, classes.fBlack)}>
                  {t("integrations.eShop.cartAbandonedMinutesHours")}
                </Typography>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid container>
                    <Grid>
                      <TextField
                        size="small"
                        name="DefaultFromName"
                        value={settings.cartAsAbandonedMinutesHours}
                        onChange={(event) => setSettings({ ...settings, cartAsAbandonedMinutesHours: Number(event.target.value || 0) })}
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
                          onChange={(e: any) => { setSettings({ ...settings, cartAsAbandonedType: e.target.value }) }}
                          value={settings.cartAsAbandonedType}
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
                            <MenuItem value='minutes'>{t("common.minutes")}</MenuItem>
                            <MenuItem value='hours'>{t("common.hours")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                {!!errors.fetchStoreNumber && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.fetchStoreNumber}
                  </Typography>
                )}
              </Box>
            </Grid>
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