import { useState, useEffect } from "react";
import React from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, FormControl, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { KlaviyoModel, UnsubscribePreferenceType } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
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
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [dialogType, setDialogType] = useState<string>('');
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
    authentication_message: ''
  });
  const [settings, setSettings] = useState({
    ApiKey: '',
    DaysBackwards: null,
    IsDeleted: false,
    UnsubscribePreferenceTypeID: UnsubscribePreferenceType.None,
    isSyncRecipients: false,
    EcommerceSyncOptionsID: UnsubscribePreferenceType.Both,
    IsInsertAsActive: false,
    RegisterAsActiveOptionsID: UnsubscribePreferenceType.Both
  } as KlaviyoModel);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [activeImportType, setActiveImportType] = useState<UnsubscribePreferenceType>(UnsubscribePreferenceType.Both);
  const ArrowDownIcon = (): JSX.Element => React.createElement('span', null, React.createElement(IoIosArrowDown as any, { size: 20, className: classes.dropdownIconComponent }));
  const LinkExternalIcon = (): JSX.Element => React.createElement('span', null, React.createElement(GoLinkExternal as any, null));

  const normalizePreferenceType = (value: any, fallback: UnsubscribePreferenceType) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed as UnsubscribePreferenceType;
  }

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
    handleGetIntegrationResponse(settingResponse);
    setIsPageLoading(false);
  }

  const handleSave = async (req: KlaviyoModel) => {
    setShowLoader(true);
    setErrors({
      ...errors,
      unsubscribePreferenceTypeID: ''
    })

    const normalizedReq = {
      ...req,
      EcommerceSyncOptionsID: normalizePreferenceType(req.EcommerceSyncOptionsID, UnsubscribePreferenceType.Both),
      UnsubscribePreferenceTypeID: normalizePreferenceType(req.UnsubscribePreferenceTypeID, UnsubscribePreferenceType.None),
      RegisterAsActiveOptionsID: normalizePreferenceType(req.RegisterAsActiveOptionsID, UnsubscribePreferenceType.Both),
    } as KlaviyoModel;

    const request = {
      IntegrationSource: LU_Plugin.Klaviyo,
      JsonData: JSON.stringify(normalizedReq)
    } as IntegrationRequest;
    const response = await dispatch(setIntegration(request)) as any;
    
    if (response?.payload?.StatusCode === 200 || response?.payload?.StatusCode === 201) {
      setSettings(normalizedReq);
      if (normalizedReq.IsInsertAsActive) {
        localStorage.setItem('klaviyoRegisterAsActiveOptionsID', String(normalizedReq.RegisterAsActiveOptionsID));
      } else {
        localStorage.removeItem('klaviyoRegisterAsActiveOptionsID');
      }
    }
    
    handleSubmitFormResponse(response);
    setShowLoader(false);
  }

  const handleSubmitFormResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setToastMessage({ severity: 'success', color: 'success', message: t(`integrations.Klaviyo.integrationSaved`), showAnimtionCheck: false } as any);
        break;
      }
      case 400:
      case 401:
      case 402:
      case 404:
      case 500: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.formSubmitResponses.${response?.payload?.StatusCode}`),
        });
        setToastMessage({ severity: 'error', color: 'error', message: t(`integrations.formSubmitResponses.${response?.payload?.StatusCode}`), showAnimtionCheck: false } as any);
        break;
      }
    }
  }

  const handleGetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 200:
      case 201: {
        const resp = response?.payload?.Data as KlaviyoModel;
        if (resp?.ApiKey) {
          const resolvedEcommerceSyncOptionsID = normalizePreferenceType(resp.EcommerceSyncOptionsID, UnsubscribePreferenceType.Both);
          const resolvedUnsubscribePreferenceTypeID = normalizePreferenceType(resp.UnsubscribePreferenceTypeID, UnsubscribePreferenceType.None);
          let resolvedRegisterAsActiveOptionsID = normalizePreferenceType(resp.RegisterAsActiveOptionsID, UnsubscribePreferenceType.None);
          const localRegisterAsActiveOptionsID = normalizePreferenceType(localStorage.getItem('klaviyoRegisterAsActiveOptionsID'), UnsubscribePreferenceType.None);

          if (resp.IsInsertAsActive && resolvedRegisterAsActiveOptionsID === UnsubscribePreferenceType.None) {
            if (localRegisterAsActiveOptionsID !== UnsubscribePreferenceType.None) {
              resolvedRegisterAsActiveOptionsID = localRegisterAsActiveOptionsID;
            } else if (resolvedEcommerceSyncOptionsID === UnsubscribePreferenceType.Email || resolvedEcommerceSyncOptionsID === UnsubscribePreferenceType.Sms) {
              resolvedRegisterAsActiveOptionsID = resolvedEcommerceSyncOptionsID;
            } else {
              resolvedRegisterAsActiveOptionsID = UnsubscribePreferenceType.Both;
            }
          }

          const resolvedResp = {
            ...resp,
            EcommerceSyncOptionsID: resolvedEcommerceSyncOptionsID,
            UnsubscribePreferenceTypeID: resolvedUnsubscribePreferenceTypeID,
            RegisterAsActiveOptionsID: resolvedRegisterAsActiveOptionsID
          } as KlaviyoModel;
          console.log('[Klaviyo] resolvedResp', resolvedResp);
          setSettings(resolvedResp);
          setAuthenticated(true);
          setActiveImportType(resolvedRegisterAsActiveOptionsID || UnsubscribePreferenceType.Both);
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
        localStorage.removeItem('klaviyoRegisterAsActiveOptionsID');
        setSettings({
          ApiKey: '',
          IntervalToRunService: '',
          UnsubscribePreferenceTypeID: UnsubscribePreferenceType.None,
          DaysBackwards: 1,
          IsDeleted: false,
          isSyncRecipients: false,
          EcommerceSyncOptionsID: UnsubscribePreferenceType.Both,
          IsInsertAsActive: false,
          RegisterAsActiveOptionsID: UnsubscribePreferenceType.Both
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
    setShowLoader(true);
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.Klaviyo)) as any;
    handleResetIntegrationResponse(resetResponse);
    setShowLoader(false);
    setDialogType('');
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

  const renderResetDialog = () => ({
    title: '',
    showDivider: false,
    content: (
      <Box className={clsx(classes.bodyTextDialog, classes.pb25)}>
        <Typography>
          {t("integrations.resetConfirmation")}
        </Typography>
      </Box>
    ),
    onConfirm: async () => { resetStore() },
    onClose: () => { setDialogType(''); }
  })

  const showNewRegisteredToActive = () => ({
    title: t("common.notice"),
    showDivider: false,
    paperStyle: classes.maxWidth540,
    confirmText: 'integrations.Klaviyo.iApprove',
    content: (
      <Box>
        <Typography style={{ wordBreak: 'break-word' }}>
          <div>{RenderHtml(t("integrations.Klaviyo.newAsActiveDesc1"))}</div>
          <div className={clsx(classes.pt5)}>{RenderHtml(t("integrations.Klaviyo.newAsActiveDesc2"))}</div>
        </Typography>
        <Box className={clsx(classes.pt20)}>
          <Typography>{t("integrations.Klaviyo.importFromKlaviyo")}</Typography>
          <FormControl className={clsx(classes.selectInputFormControl, classes.w100)}>
            <Select
              variant="standard"
              value={activeImportType || UnsubscribePreferenceType.Both}
              onChange={(event: any) => setActiveImportType(Number(event.target.value) as UnsubscribePreferenceType)}
              IconComponent={ArrowDownIcon}
              MenuProps={{
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    direction: isRTL ? 'rtl' : 'ltr'
                  },
                },
              }}
              style={{ padding: 2 }}
            >
              <MenuItem value={UnsubscribePreferenceType.Both}>{t('integrations.Klaviyo.bothEmailSMS')}</MenuItem>
              <MenuItem value={UnsubscribePreferenceType.Email} disabled={smsOnlyScope}>{t('integrations.Klaviyo.emailOnly')}</MenuItem>
              <MenuItem value={UnsubscribePreferenceType.Sms} disabled={emailOnlyScope}>{t('integrations.Klaviyo.SMSOnly')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    ),
    onConfirm: async () => {
      const updatedSettings = { ...settings, IsInsertAsActive: true, RegisterAsActiveOptionsID: activeImportType };
      console.log('[Klaviyo] popup save activeImportType', activeImportType, 'updatedSettings', updatedSettings);
      await handleSave(updatedSettings);
      setDialogType('');
    },
    onClose: () => {
      setActiveImportType(settings?.RegisterAsActiveOptionsID || UnsubscribePreferenceType.Both);
      setDialogType('');
    },
  })

  const renderDialog = () => {
		let currentDialog: any = {};
		if (dialogType === 'resetDialog') {
			currentDialog = renderResetDialog();
		} else if (dialogType === 'newToActive') {
			currentDialog = showNewRegisteredToActive();
		}

		if (dialogType) {
			return (
				dialogType && <BaseDialog
					classes={classes}
					open={dialogType}
					onCancel={() => setDialogType('')}
					onClose={() => setDialogType('')}
					renderButtons={currentDialog?.renderButtons || null}
					{...currentDialog}>
					{currentDialog?.content}
				</BaseDialog>
			)
		}
	}

  const normalizedRegisterAsActiveOptionsID = normalizePreferenceType(settings?.RegisterAsActiveOptionsID, UnsubscribePreferenceType.Both);
  const normalizedEcommerceSyncOptionsID = normalizePreferenceType(settings?.EcommerceSyncOptionsID, UnsubscribePreferenceType.Both);
  const normalizedUnsubscribePreferenceTypeID = normalizePreferenceType(settings?.UnsubscribePreferenceTypeID, UnsubscribePreferenceType.None);
  const emailOnlyScope = normalizedEcommerceSyncOptionsID === UnsubscribePreferenceType.Email;
  const smsOnlyScope = normalizedEcommerceSyncOptionsID === UnsubscribePreferenceType.Sms;

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
              endIcon={<LinkExternalIcon />}
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
            <Grid container spacing={3}>
              <Grid item md={5} xs={12}>
                <FormControlLabel
                  style={{ alignItems: 'start', marginRight: 0 }}
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

              <Grid item md={5} xs={12}>
                <FormControlLabel
                  style={{ alignItems: 'start', marginRight: 0 }}
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

              <Grid item md={10} xs={12}>
                <Box style={{ display: 'flex', gap: 32 }}>
                  <Box style={{ flex: 1 }}>
                  <Typography>{t("integrations.Klaviyo.importFromKlaviyo")}</Typography>
                  <FormControl className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                      variant="standard"
                      value={normalizedEcommerceSyncOptionsID}
                      onChange={(event: any) => {
                        const newScope = Number(event.target.value) as UnsubscribePreferenceType;
                        const corrected = { ...settings, EcommerceSyncOptionsID: newScope };
                        if (newScope === UnsubscribePreferenceType.Email && corrected.UnsubscribePreferenceTypeID === UnsubscribePreferenceType.Sms) {
                          corrected.UnsubscribePreferenceTypeID = UnsubscribePreferenceType.Email;
                        }
                        if (newScope === UnsubscribePreferenceType.Sms && corrected.UnsubscribePreferenceTypeID === UnsubscribePreferenceType.Email) {
                          corrected.UnsubscribePreferenceTypeID = UnsubscribePreferenceType.Sms;
                        }
                        if (newScope === UnsubscribePreferenceType.Email && corrected.RegisterAsActiveOptionsID === UnsubscribePreferenceType.Sms) {
                          corrected.RegisterAsActiveOptionsID = UnsubscribePreferenceType.Email;
                        }
                        if (newScope === UnsubscribePreferenceType.Sms && corrected.RegisterAsActiveOptionsID === UnsubscribePreferenceType.Email) {
                          corrected.RegisterAsActiveOptionsID = UnsubscribePreferenceType.Sms;
                        }
                        if (newScope === UnsubscribePreferenceType.Email && activeImportType === UnsubscribePreferenceType.Sms) {
                          setActiveImportType(UnsubscribePreferenceType.Email);
                        }
                        if (newScope === UnsubscribePreferenceType.Sms && activeImportType === UnsubscribePreferenceType.Email) {
                          setActiveImportType(UnsubscribePreferenceType.Sms);
                        }
                        handleSave(corrected);
                      }}
                      IconComponent={ArrowDownIcon}
                      MenuProps={{
                        anchorOrigin: { vertical: 'top', horizontal: 'left' },
                        transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                      style={{ padding: 2 }}
                    >
                      <MenuItem value={UnsubscribePreferenceType.Both}>{t('integrations.Klaviyo.bothEmailSMS')}</MenuItem>
                      <MenuItem value={UnsubscribePreferenceType.Email}>{t('integrations.Klaviyo.emailOnly')}</MenuItem>
                      <MenuItem value={UnsubscribePreferenceType.Sms}>{t('integrations.Klaviyo.SMSOnly')}</MenuItem>
                    </Select>
                  </FormControl>
                  </Box>
                  <Box style={{ flex: 1 }}>
                  <Typography>{t("integrations.Klaviyo.unsubscribe")}</Typography>
                  <FormControl className={clsx(classes.selectInputFormControl, classes.w100)}>
                    <Select
                      variant="standard"
                      value={normalizedUnsubscribePreferenceTypeID}
                      onChange={(event: any) => {
                        handleSave({
                          ...settings,
                          UnsubscribePreferenceTypeID: Number(event.target.value) as UnsubscribePreferenceType
                        });
                      }}
                      IconComponent={ArrowDownIcon}
                      MenuProps={{
                        anchorOrigin: { vertical: 'top', horizontal: 'left' },
                        transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                      style={{ padding: 2 }}
                    >
                      <MenuItem value={UnsubscribePreferenceType.None}>{t('report.None')}</MenuItem>
                      <MenuItem value={UnsubscribePreferenceType.Email} disabled={smsOnlyScope}>{t('common.email')}</MenuItem>
                      <MenuItem value={UnsubscribePreferenceType.Sms} disabled={emailOnlyScope}>{t('common.SMS')}</MenuItem>
                      <MenuItem value={UnsubscribePreferenceType.Both}>{t('integrations.Klaviyo.bothEmailSMS')}</MenuItem>
                    </Select>
                  </FormControl>
                  </Box>
                </Box>
                <Box className={clsx(classes.pt20)}>
                  <FormControlLabel
                    style={{ display: 'flex', alignItems: 'start' }}
                    control={
                      <PulseemSwitch
                        id={'IsInsertAsActive'}
                        switchType='ios'
                        classes={classes}
                        checked={settings?.IsInsertAsActive === true}
                        height={20}
                        width={48}
                        className={{ [classes.rtlSwitch]: isRTL }}
                        onChange={(e: any) => {
                          if (!settings?.IsInsertAsActive) {
                            setActiveImportType(normalizedRegisterAsActiveOptionsID);
                            setDialogType('newToActive');
                          } else {
                            handleSave({ ...settings, IsInsertAsActive: false });
                          }
                        }}
                      />
                    }
                    label={<Box className={classes.radio}>
                      <Typography style={{ wordBreak: 'break-word', fontSize: '18px' }}>
                        <b>{t("integrations.Klaviyo.newAsActive")}</b>
                        {settings?.IsInsertAsActive && (
                          <span style={{ fontWeight: 'normal', marginLeft: 8 }}>
                            ({normalizedRegisterAsActiveOptionsID === UnsubscribePreferenceType.Email
                              ? t('integrations.Klaviyo.emailOnly')
                              : normalizedRegisterAsActiveOptionsID === UnsubscribePreferenceType.Sms
                              ? t('integrations.Klaviyo.SMSOnly')
                              : t('integrations.Klaviyo.bothEmailSMS')})
                          </span>
                        )}
                      </Typography>
                    </Box>}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }
      {isAuthenticated && <Box className={"formContainer"}>
        <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15, classes.pt20)}>
          <Button
            onClick={() => setDialogType('resetDialog')}
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
      {renderDialog()}
    </>
  );
};
export default Klaviyo;