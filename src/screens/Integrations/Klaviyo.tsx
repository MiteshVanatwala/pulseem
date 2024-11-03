import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, MenuItem, FormControl } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { RunIntegrationService, authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { KlaviyoModel, UnsubscribePreferenceType } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { StateType } from "../../Models/StateTypes";
import { URL_HELPER } from "../../helpers/Links/ExternalLink";
import { GoLinkExternal } from "react-icons/go";
import PulseemSwitch from "../../components/Controlls/PulseemSwitch";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { Select } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";

const Klaviyo = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showManualFetchDialog, setManualFetchDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errors, setErrors] = useState({
    ApiKey: '',
    authentication_message: '',
    unsubscribePreferenceTypeID: '',
    DaysBackwards: '',
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    ApiKey: '',
    DaysBackwards: null,
    IsDeleted: false,
    UnsubscribePreferenceTypeID: UnsubscribePreferenceType.None,
    isSyncRecipients: false
  } as KlaviyoModel);
  const [isAuthenticated, setAuthenticated] = useState(false);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    initSettings();
    document.title = `${t('integrations.Klaviyo.title')} | ${document.title}`;
  }, []);

  const initSettings = async () => {
    setShowLoader(true);
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Klaviyo)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse)
    if (!subAccountAllGroups?.length) {
      dispatch(getGroupsBySubAccountId());
    }
    setIsPageLoading(false);
  }

  const handleSave = async (req: KlaviyoModel) => {
    setShowLoader(true);

    setSettings(req);

    setErrors({
      ...errors,
      unsubscribePreferenceTypeID: ''
    })

    const request = {
      IntegrationSource: LU_Plugin.Klaviyo,
      JsonData: JSON.stringify({ ...req })
    } as IntegrationRequest;
    const response = await dispatch(setIntegration(request));
    handleSubmitFormResponse(response);
    setShowLoader(false);
  }

  const handleSubmitFormResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setMessages({
          ...messages,
          group_saved: t(`integrations.formSubmitResponses.201`),
        });
        setToastMessage({ severity: 'success', color: 'success', message: t(`integrations.formSubmitResponses.201`), showAnimtionCheck: false } as any);
        setTimeout(() => {
          setMessages({
            ...errors,
            group_saved: '',
          });
        }, 4000);
        break;
      }
      case 401: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.formSubmitResponses.401`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: t(`integrations.formSubmitResponses.401`), showAnimtionCheck: false } as any);
        break;
      }
      case 402:
        setErrors({
          ...errors,
          authentication_message: t(`integrations.formSubmitResponses.402`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: t(`integrations.formSubmitResponses.402`), showAnimtionCheck: false } as any);
        break;
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.404`),
        })
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.404"), showAnimtionCheck: false } as any);
        break;
      }
      case 500: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.formSubmitResponses.500`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: t(`integrations.formSubmitResponses.500`), showAnimtionCheck: false } as any);
        break;
      }
    }
  }

  const handleGetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        const resp = response?.payload?.Data as KlaviyoModel;
        if (resp.ApiKey) {
          setSettings(resp);
          setAuthenticated(true);
        }
        break;
      }
      case 400: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.400`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.400"), showAnimtionCheck: false } as any);
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.404`),
        })
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.404"), showAnimtionCheck: false } as any);
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
          UnsubscribePreferenceTypeID: 0,
          DaysBackwards: 1,
          IsDeleted: false,
          isSyncRecipients: false
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
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.Klaviyo)) as any;
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
    if (settings.ApiKey.trim() === '') errorsDump = { ...errorsDump, ApiKey: t('integrations.Klaviyo.subTitle') };
    await setErrors(errorsDump);
    if (settings.ApiKey.trim() !== '') {
      setErrors({
        ApiKey: '',
        authentication_message: '',
        DaysBackwards: '',
        unsubscribePreferenceTypeID: '',
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Klaviyo,
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
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.400"), showAnimtionCheck: false } as any);
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
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.403"), showAnimtionCheck: false } as any);
        break;
      }
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.authResponses.404`),
        })
        setToastMessage({ severity: 'error', color: 'error', message: t("integrations.authResponses.404"), showAnimtionCheck: false } as any);
        break;
      }
    }
  }

  return (
    <>
      {toastMessage && renderToast()}
      {
        !isPageLoading && (
          <Box className={clsx(classes.containerBody)}>
            {!isAuthenticated && <Button
              onClick={() => window.open(URL_HELPER.Integrations.Klaviyo.guide, '_blank')}
              variant='contained'
              size='medium'
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mb20,
                classes.mt20
              )}
              color="primary"
              endIcon={<GoLinkExternal />}
            >
              {t(`integrations.Klaviyo.howToConnect`)}
            </Button>}
            <Box className={clsx(classes.dblock)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.apiKey")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              {!isAuthenticated && <Typography className={clsx(classes.mb5)}>
                {t("integrations.Klaviyo.subTitle")}
              </Typography>}
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
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt14)}>
              <Grid item xs={12}>
                <Typography style={{ fontSize: "18px", color: "#000" }}>{RenderHtml(t("integrations.Klaviyo.notice"))}</Typography>
              </Grid>
            </Grid>
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt14)}>
              <Box className={clsx(windowSize !== 'xs' ? classes.justifyBetween : '')}>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      style={{ display: 'flex', alignItems: 'start' }}
                      control={
                        <PulseemSwitch
                          id={'isSyncRecipients'}
                          switchType='ios'
                          classes={classes}
                          checked={settings?.isSyncRecipients === true}
                          height={20}
                          width={48}
                          className={{ [classes.rtlSwitch]: isRTL }}
                          onChange={(e: any) => {
                            handleSave({ ...settings, isSyncRecipients: !settings?.isSyncRecipients })
                          }}
                        />
                      }
                      label={<Box className={classes.radio}>
                        <Typography style={{ fontSize: "18px" }}>
                          <b>{t("integrations.Klaviyo.importListsAndRecipients")}</b>
                        </Typography>
                        <Typography style={{ maxWidth: 400, wordBreak: 'break-word' }}>
                          {RenderHtml(t("integrations.Klaviyo.importListsAndRecipientsDesc"))}
                        </Typography>
                      </Box>}
                    />
                  </Grid>
                </Box>
                <Box className={clsx(classes.pr10, classes.pe10)}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      style={{ display: 'flex', alignItems: 'start' }}
                      control={
                        <PulseemSwitch
                          id={'UnsubscribePreferenceTypeID'}
                          switchType='ios'
                          classes={classes}
                          checked={settings?.UnsubscribePreferenceTypeID > 0}
                          height={20}
                          width={48}
                          className={{ [classes.rtlSwitch]: isRTL }}
                          onChange={(e: any) => {
                            handleSave({ ...settings, UnsubscribePreferenceTypeID: settings?.UnsubscribePreferenceTypeID === 0 ? UnsubscribePreferenceType.Both : UnsubscribePreferenceType.None });
                          }}
                        />
                      }
                      label={<Box className={classes.radio}>
                        <Typography style={{ fontSize: "18px" }}>
                          <b>{t("integrations.Klaviyo.unusbscribe")}</b>
                        </Typography>
                        <Typography style={{ maxWidth: 400, wordBreak: 'break-word' }}>
                          {RenderHtml(t("integrations.Klaviyo.unsubscribeDesc"))}
                        </Typography>
                      </Box>}
                    />
                  </Grid>
                  <Grid item xs={12} className={classes.pt20}>
                    <Typography className={clsx(classes.bold, classes.font18)}>{t("common.remove")}</Typography>
                    <FormControl className={clsx(classes.selectInputFormControl, classes.w100, classes.pt10)}>
                      <Select
                        native
                        variant="standard"
                        value={settings?.UnsubscribePreferenceTypeID || UnsubscribePreferenceType.None}
                        onChange={(event: any) => {
                          setSettings({
                            ...settings,
                            UnsubscribePreferenceTypeID: event.target.value
                          });

                          // submitForm(false)

                          handleSave({
                            ...settings,
                            UnsubscribePreferenceTypeID: event.target.value
                          });
                        }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                              direction: isRTL ? 'rtl' : 'ltr'
                            },
                          },
                        }}
                        style={{
                          padding: 2
                        }}
                      >
                        <option value={UnsubscribePreferenceType.None}>{t('report.None')}</option>
                        <option value={UnsubscribePreferenceType.Email}>{t('common.email')}</option>
                        <option value={UnsubscribePreferenceType.Sms}>{t('common.SMS')}</option>
                        <option value={UnsubscribePreferenceType.Both}>{t('common.both')}</option>
                      </Select>
                    </FormControl>
                  </Grid>
                </Box>
              </Box >
            </Grid >
          </Box>
        )
      }
      {isAuthenticated && <Box className={"formContainer"}>
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
      </Box>}
      <Loader isOpen={showLoader} showBackdrop={true} />
      {renderResetDialog()}
    </>
  );
};
export default Klaviyo;