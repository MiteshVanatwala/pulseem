import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Switch, Checkbox } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { VerifoneModel } from '../../Models/Integrations/Verifone/Verifone';
import { LU_Plugin, IntegrationRequest, IntegrationGroups } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import GroupTags from "../../components/Groups/GroupTags";
import { BiSave } from "react-icons/bi";
import { getScript } from "../../redux/reducers/siteTrackingSlice";

const Verifone = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isShowCredentials, setIsShowCredentials] = useState(false);
  // const [isPageLoading, setIsPageLoading] = useState(true);
  // const [dialogType, setDialogType] = useState<{
  //   type: string;
  // } | null>(null);
  // const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    ChainID: '',
    Username: '',
    Password: '',
    MainServiceUrl: '',
    SecondServiceUrl: '',
    authentication_message: '',
    group_not_selected: ''
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    ChainID: '',
    Username: '',
    Password: '',
    MainServiceUrl: '',
    SecondServiceUrl: '',
    IsSendSms: false,
    RegisterEventActive: false,
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    Groups: {} as IntegrationGroups
  } as VerifoneModel);

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
    await dispatch(getScript());
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Verifone)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse);
    if (subAccountAllGroups?.length === 0) {
      dispatch(getGroupsBySubAccountId());
    }
    // setIsPageLoading(false);
  };

  const resetErrors = () => {
    setErrors({
      ChainID: '',
      Username: '',
      Password: '',
      MainServiceUrl: '',
      SecondServiceUrl: '',
      authentication_message: '',
      group_not_selected: ''
    });
  };

  const authenticateStore = async () => {
    resetErrors();
    let errorsDump = errors;
    
    if (settings.ChainID.trim() === '') errorsDump = { ...errorsDump, ChainID: t('integrations.verifone.enterChainID') };
    if (settings.Username.trim() === '') errorsDump = { ...errorsDump, Username: t('integrations.verifone.enterUsername') };
    if (settings.Password.trim() === '') errorsDump = { ...errorsDump, Password: t('integrations.verifone.enterPassword') };
    if (settings.MainServiceUrl.trim() === '') errorsDump = { ...errorsDump, MainServiceUrl: t('integrations.verifone.enterMainServiceUrl') };
    if (settings.SecondServiceUrl.trim() === '') errorsDump = { ...errorsDump, SecondServiceUrl: t('integrations.verifone.enterProductsServiceURL') };

    await setErrors(errorsDump);
    if (settings.ChainID.trim() !== '' && 
        settings.Username.trim() !== '' && 
        settings.Password.trim() !== '' && 
        settings.MainServiceUrl.trim() !== '' && 
        settings.SecondServiceUrl.trim() !== '') {
      resetErrors();
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Verifone,
        JsonData: JSON.stringify(settings)
      } as IntegrationRequest;

      const authResponse = await dispatch(authenticate(request));
      setShowLoader(false);
      handleAuthResponse(authResponse);
    }
  };

  const submitForm = async () => {
    setErrors({
      ...errors,
      group_not_selected: '',
    });
    setShowLoader(true);
    const request = {
      IntegrationSource: LU_Plugin.Verifone,
      JsonData: JSON.stringify({ ...settings })
    } as IntegrationRequest;
    const response = await dispatch(setIntegration(request));
    handleSubmitFormResponse(response);
    setShowLoader(false);
  };

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
  };

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
          setIsShowCredentials(false);
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
        });
        break;
      }
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.404`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: "integrations.authResponses.404", showAnimtionCheck: false } as any);
        break;
      }
    }
  };

  const handleGetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        const verifoneResponse = response?.payload?.Data as VerifoneModel;
        if (verifoneResponse.ChainID && verifoneResponse.Username && verifoneResponse.MainServiceUrl) {
          setSettings(response?.payload?.Data as VerifoneModel);
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
  };

  const handleResetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setSettings({
          ID: 0,
          ChainID: '',
          Username: '',
          Password: '',
          MainServiceUrl: '',
          SecondServiceUrl: '',
          IsSendSms: false,
          RegisterEventActive: false,
          PurchaseEventActive: false,
          AbandonedEventActive: false,
          Groups: {},
          CreateDate: '',
          UpdateDate: '',
          IntegrationSource: LU_Plugin.Verifone
        });

        setAuthenticated(false);
        setIsShowCredentials(false);
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
  };

  const resetStore = async () => {
    setShowResetDialog(false);
    setShowLoader(true);
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.Verifone)) as any;
    handleResetIntegrationResponse(resetResponse);
    setShowLoader(false);
  };

  // const showCredentials = () => {
  //   setIsShowCredentials(true);
  // };

  // const registerChange = (event: any) => {
  //   setSettings({
  //     ...settings,
  //     Groups: {
  //       ...settings.Groups,
  //       RegisterGroups: event.target.value
  //     }
  //   });
  // };

  // const purchaseChange = (event: any) => {
  //   setSettings({
  //     ...settings,
  //     Groups: {
  //       ...settings.Groups,
  //       PurchaseGroups: event.target.value
  //     }
  //   });
  // };

  // const cartAbandonedChange = (event: any) => {
  //   setSettings({
  //     ...settings,
  //     Groups: {
  //       ...settings.Groups,
  //       AbandonedGroups: event.target.value
  //     }
  //   });
  // };

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
    );
  };

  return (
    <Box className={clsx(classes.managmentWrapper, classes.tabWrapper)}>
      {toastMessage && renderToast()}
      {showResetDialog && renderResetDialog()}

      {
        (!isAuthenticated || isShowCredentials) && (
          <Box className={clsx(classes.pt2rem)}>
            <Box className={clsx(classes.dblock, classes.pb15)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.verifone.chainID")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.verifone.chainIDDescription")}
              </Typography>
              <TextField
                size="small"
                name="ChainID"
                value={settings.ChainID}
                onChange={(event) => setSettings({ ...settings, ChainID: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.ChainID && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.ChainID}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.verifone.username")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.verifone.usernameDescription")}
              </Typography>
              <TextField
                size="small"
                name="Username"
                value={settings.Username}
                onChange={(event) => setSettings({ ...settings, Username: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.Username && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.Username}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.verifone.password")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.verifone.passwordDescription")}
              </Typography>
              <TextField
                size="small"
                name="Password"
                type="password"
                value={settings.Password}
                onChange={(event) => setSettings({ ...settings, Password: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.Password && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.Password}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.verifone.mainServiceUrl")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.verifone.mainServiceUrlDescription")}
              </Typography>
              <TextField
                size="small"
                name="MainServiceUrl"
                value={settings.MainServiceUrl}
                onChange={(event) => setSettings({ ...settings, MainServiceUrl: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
                placeholder="https://api.verifone.com/main"
              />
              {!!errors.MainServiceUrl && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.MainServiceUrl}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.verifone.productsServiceURL")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              <Typography className={clsx(classes.mb5)}>
                {t("integrations.verifone.productsServiceURLDescription")}
              </Typography>
              <TextField
                size="small"
                name="SecondServiceUrl"
                value={settings.SecondServiceUrl}
                onChange={(event) => setSettings({ ...settings, SecondServiceUrl: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
                placeholder="https://api.verifone.com/second"
              />
              {!!errors.SecondServiceUrl && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.SecondServiceUrl}
                </Typography>
              )}
            </Box>

            <Box className={clsx(classes.dblock, classes.pb15, classes.pt10)}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.IsSendSms}
                    onChange={(e) => setSettings({ ...settings, IsSendSms: e.target.checked })}
                    color="primary"
                  />
                }
                label={t("integrations.verifone.activateCustomerRegistrationSMS")}
              />
            </Box>

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
                    {t("integrations.connectStore")}
                  </Button>
                </Box>
              )
            }
          </Box>
        )
      }

      {
        isAuthenticated && (
          <Box className={clsx(classes.pb30)}>
            <Box className={clsx(classes.connectedBox, classes.p20, classes.mb20)}>
              <Typography className={clsx(classes.green, classes.f18, classes.bold)}>
                ✓ {t("integrations.verifone.connectedSuccessfully")}
              </Typography>
              <Typography className={clsx(classes.mt10)}>
                {t("integrations.verifone.chainID")}: {settings.ChainID}
              </Typography>
              <Typography>
                {t("integrations.verifone.username")}: {settings.Username}
              </Typography>
            </Box>

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

            <Button
              onClick={() => setIsShowCredentials(!isShowCredentials)}
              variant='contained'
              size='medium'
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.ml10
              )}
              color="primary"
            >
              {t(`integrations.shopify.${isShowCredentials ? 'hideCredentials' : 'showCredentials'}`)}
            </Button>
            <Loader isOpen={showLoader} showBackdrop={true} />
          </Box>
        )
      }

      {
        isAuthenticated && (
          <Box className={classes.pt30}>
            <Typography className={clsx(classes.managementTitle, classes.f22, classes.pb15, classes.bold)}>
              {t('integrations.shopify.insertClientToGroup')}
            </Typography>
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
                label={t('integrations.verifone.siteSignUp')}
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

            {/* <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
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
            </Grid> */}

            {/* <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
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
            </Grid> */}

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
                  classes.btnRounded,
                  classes.redButton
                )}
                color="primary"
                startIcon={<BiSave className={classes.colorWhite} />}
              >
                {t("common.save")}
              </Button>
              <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>
          </Box>
        )
      }
      <Loader isOpen={showLoader} showBackdrop={true} />
    </Box>
  );
};

export default Verifone;