import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, Tooltip, IconButton } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { IntegrationGroups, IsracardModel } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import GroupTags from "../../components/Groups/GroupTags";
import PulseemSwitch from "../../components/Controlls/PulseemSwitch";
import { URL_HELPER } from "../../helpers/Links/ExternalLink";
import { StateType } from "../../Models/StateTypes";
import { BsInfoCircle } from "react-icons/bs";
const Istores = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errors, setErrors] = useState({
    api_key: '',
    StoreID: '',
    authentication_message: '',
    group_not_selected: ''
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    ID: '',
    api_key: '',
    StoreID: '',
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    StatusChangedEventActive: false,
    RegisterEventActive: false,
    Groups: {} as IntegrationGroups,
    IsUnsubscribeFromPulseem: false,
    IsInsertAsActive: false
  } as IsracardModel);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    initSettings();
  }, []);

  const initSettings = async () => {
    setShowLoader(true);
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Isracard)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse)
    if (subAccountAllGroups?.length === 0) {
      dispatch(getGroupsBySubAccountId());
    }
    setIsPageLoading(false);
  }

  const submitForm = async () => {
    if (settings.PurchaseEventActive || settings.AbandonedEventActive) {
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
          setSettings(response?.payload?.Data as IsracardModel);
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
        setSettings({
          api_key: '',
          StoreID: '',
          RegisterEventActive: false,
          PurchaseEventActive: false,
          AbandonedEventActive: false,
          Groups: {},
          IntegrationSource: LU_Plugin.Isracard,
          IsUnsubscribeFromPulseem: false,
          IsInsertAsActive: false
        });

        setAuthenticated(false);
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
            <>{t("integrations.resetConfirmation")}</>
          </Typography>
        </Box>
      </BaseDialog>
    )
  }

  const authenticateStore = async () => {
    let errorsDump = errors;
    if (settings.api_key.trim() === '') errorsDump = { ...errorsDump, api_key: t('integrations.Istores.subTitle') };
    if (settings.StoreID.trim() === '') errorsDump = { ...errorsDump, StoreID: t('integrations.Istores.storeIDDesc') };
    await setErrors(errorsDump);
    if (settings.api_key.trim() !== '' && settings.StoreID.trim() !== '') {
      setErrors({
        api_key: '',
        StoreID: '',
        authentication_message: '',
        group_not_selected: ''
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
        setToastMessage({ severity: 'error', color: 'error', message: "integrations.authResponses.400", showAnimtionCheck: false } as any);
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
        setToastMessage({ severity: 'error', color: 'error', message: "integrations.authResponses.403", showAnimtionCheck: false } as any);
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
            <Button
              onClick={() => window.open(URL_HELPER.Integrations.IStore.guide, '_blank')}
              variant='contained'
              size='medium'
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mb20
              )}
              color="primary"
            >
              {t(`integrations.Istores.connectStore`)}
            </Button>
            <Box className={clsx(classes.dblock)}>
              <Typography className={clsx(classes.bold)}>
                <>{t("integrations.apiKey")}</>
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                <>{t("integrations.Istores.subTitle")}</>
              </Typography>
              <TextField
                size="small"
                name="DefaultFromName"
                value={settings.api_key}
                onChange={(event) => setSettings({ ...settings, api_key: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.api_key && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.api_key}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15, classes.mt15)}>
              <Typography className={clsx(classes.bold)}>
                <>{t("integrations.Istores.storeID")}</>
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                <>{t("integrations.Istores.storeIDDesc")}</>
              </Typography>
              <TextField
                size="small"
                name="DefaultFromName"
                value={settings.StoreID}
                onChange={(event) => setSettings({ ...settings, StoreID: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.StoreID && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.StoreID}
                </Typography>
              )}
            </Box>
            {!isAuthenticated &&
              <Box className={clsx(classes.dblock, classes.pb15)}>
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
                  <>{t("integrations.connectStore")}</>
                </Button>
              </Box>
            }
          </Box>
        )
      }
      {
        !authenticate && (
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
            {
              !isAuthenticated && (
                <Box className={clsx(classes.flex, classes.pbt15)}>
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
                    <>{t("integrations.connectStore")}</>
                  </Button>
                </Box>
              )
            }
          </>
        )
      }
      {
        isAuthenticated && (
          <Box className={"formContainer"}>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
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
                <>{t("integrations.disconnectStore")}</>
              </Button>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
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
                // @ts-ignore
                label={t('integrations.register')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Box className={clsx('group-dropdown', !settings.RegisterEventActive ? classes.disabled : '')}>
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
                // @ts-ignore
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
                // @ts-ignore
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
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.StatusChangedEventActive}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        StatusChangedEventActive: event.target.checked,
                        Groups: {
                          ...settings.Groups,
                          StatusChangedGroups: event.target.checked ? settings?.Groups?.StatusChangedGroups : []
                        }
                      })
                    }
                    name="signup"
                    color="primary"
                  />
                }
                // @ts-ignore
                label={t('integrations.orderStatusCompleted')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Box className={clsx('group-dropdown', !settings.StatusChangedEventActive ? classes.disabled : '')}>
                  <GroupTags
                    className='group-select'
                    groupSelected={settings.Groups?.StatusChangedGroups || []}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    dropdown
                    dropDownProps={{
                      onChange: (e: any, val: any) => {
                        setSettings({
                          ...settings,
                          Groups: {
                            ...settings.Groups,
                            StatusChangedGroups: val.reduce((prevVal: any, newVal: any) => [...prevVal, newVal.GroupID], [])
                          }
                        })
                      },
                      selectedGroups: settings.Groups?.StatusChangedGroups || [],
                      groups: []
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Grid item md={12} xs={12} className={clsx(isRTL ? classes.textRight : classes.textLeft, classes.pb10, classes.pt10)}>
              <FormControlLabel
                control={
                  <PulseemSwitch
                    id="1"
                    switchType='ios'
                    classes={classes}
                    onColor="#0371ad"
                    handleDiameter={20}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={15}
                    className={clsx({ [classes.rtlSwitch]: isRTL })}
                    checked={settings.IsUnsubscribeFromPulseem}
                    onChange={(event: any) => {
                      setSettings({
                        ...settings,
                        IsUnsubscribeFromPulseem: event.target.checked
                      });
                    }}
                  />
                }
                label={t('integrations.Istores.syncRemovalFromPulseemToIstore')}
              />

              <Tooltip
                disableFocusListener
                title={t('integrations.Istores.syncRemovalFromPulseemToIstoreDescription')}
                classes={{ tooltip: classes.customWidth }}
                placement={ isRTL ? 'left' : 'right'}
                arrow
              >
                <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)}>
                    <BsInfoCircle />
                </IconButton>
              </Tooltip>
            </Grid>
            
            <Grid item md={12} xs={12} className={clsx(isRTL ? classes.textRight : classes.textLeft, classes.pb10, classes.pt10)}>
              <FormControlLabel
                control={
                  <PulseemSwitch
                    id="1"
                    switchType='ios'
                    classes={classes}
                    onColor="#0371ad"
                    handleDiameter={20}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={15}
                    className={clsx({ [classes.rtlSwitch]: isRTL })}
                    checked={settings.IsInsertAsActive}
                    onChange={(event: any) => {
                      setSettings({
                        ...settings,
                        IsInsertAsActive: event.target.checked
                      });
                    }}
                  />
                }
                label={t('integrations.Istores.activeRecipientsFromIstore')}
              />
            </Grid>

            {!!errors.group_not_selected && (
              <Box className={clsx(classes.flex, classes.pbt15)}>
                <Typography className={clsx(classes.errorText, classes.f16)}>
                  {errors.group_not_selected}
                </Typography>
              </Box>
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
                <>{t("common.save")}</>
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
export default Istores;