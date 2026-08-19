import { useState, useEffect } from "react";
import React from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, FormControl, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { YotpoModel, UnsubscribePreferenceType } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { logout } from "../../helpers/Api/PulseemReactAPI";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { StateType } from "../../Models/StateTypes";
import PulseemSwitch from "../../components/Controlls/PulseemSwitch";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { Select } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdContentCopy } from "react-icons/md";

const Yotpo = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const [dialogType, setDialogType] = useState<string>('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [errors, setErrors] = useState({
    ApiGuid: '',
    ApiKey: '',
    authentication_message: '',
  });
  const [messages, setMessages] = useState({
    authentication_message: ''
  });
  const [settings, setSettings] = useState({
    ApiGuid: '',
    ApiKey: '',
    IsDeleted: false,
    isSyncRecipients: false,
    IsInsertAsActive: false,
    RegisterAsActiveOptionsID: UnsubscribePreferenceType.Both,
    WebhookUrl: ''
  } as YotpoModel);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [activeImportType, setActiveImportType] = useState<UnsubscribePreferenceType>(UnsubscribePreferenceType.Both);
  const ArrowDownIcon = (): JSX.Element => React.createElement('span', null, React.createElement(IoIosArrowDown as any, { size: 20, className: classes.dropdownIconComponent }));
  const CopyIcon = (): JSX.Element => React.createElement('span', null, React.createElement(MdContentCopy as any, null));

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
    document.title = `${t('integrations.Yotpo.title')} | ${document.title}`;
  }, []);

  const initSettings = async () => {
    setShowLoader(true);
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Yotpo)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse);
    setIsPageLoading(false);
  }

  const handleSave = async (req: YotpoModel) => {
    setShowLoader(true);

    const normalizedReq = {
      ...req,
      RegisterAsActiveOptionsID: normalizePreferenceType(req.RegisterAsActiveOptionsID, UnsubscribePreferenceType.Both),
    } as YotpoModel;

    const request = {
      IntegrationSource: LU_Plugin.Yotpo,
      JsonData: JSON.stringify(normalizedReq)
    } as IntegrationRequest;
    const response = await dispatch(setIntegration(request)) as any;

    if (response?.payload?.StatusCode === 200 || response?.payload?.StatusCode === 201) {
      setSettings(normalizedReq);
    }

    handleSubmitFormResponse(response);
    setShowLoader(false);
  }

  const handleSubmitFormResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setToastMessage({ severity: 'success', color: 'success', message: t(`integrations.Yotpo.integrationSaved`), showAnimtionCheck: false } as any);
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
        const resp = response?.payload?.Data as YotpoModel;
        if (resp?.ApiKey) {
          const resolvedResp = {
            ...resp,
            RegisterAsActiveOptionsID: normalizePreferenceType(resp.RegisterAsActiveOptionsID, UnsubscribePreferenceType.Both)
          } as YotpoModel;
          setSettings(resolvedResp);
          setAuthenticated(true);
          setActiveImportType(resolvedResp.RegisterAsActiveOptionsID || UnsubscribePreferenceType.Both);
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
          ApiGuid: '',
          ApiKey: '',
          IsDeleted: false,
          isSyncRecipients: false,
          IsInsertAsActive: false,
          RegisterAsActiveOptionsID: UnsubscribePreferenceType.Both,
          WebhookUrl: ''
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
    const resetResponse = await dispatch(resetIntegration(LU_Plugin.Yotpo)) as any;
    handleResetIntegrationResponse(resetResponse);
    setShowLoader(false);
    setDialogType('');
  }

  const authenticateStore = async () => {
    let errorsDump = errors;
    if (settings.ApiGuid.trim() === '') errorsDump = { ...errorsDump, ApiGuid: t('integrations.Yotpo.guidRequired') };
    if (settings.ApiKey.trim() === '') errorsDump = { ...errorsDump, ApiKey: t('integrations.Yotpo.apiKeyRequired') };
    await setErrors(errorsDump);
    if (settings.ApiGuid.trim() !== '' && settings.ApiKey.trim() !== '') {
      setErrors({
        ApiGuid: '',
        ApiKey: '',
        authentication_message: '',
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Yotpo,
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
    confirmText: 'integrations.Yotpo.iApprove',
    content: (
      <Box>
        <Typography style={{ wordBreak: 'break-word' }}>
          <div>{RenderHtml(t("integrations.Yotpo.newAsActiveDesc1"))}</div>
          <div className={clsx(classes.pt5)}>{RenderHtml(t("integrations.Yotpo.newAsActiveDesc2"))}</div>
        </Typography>
        <Box className={clsx(classes.pt20)}>
          <Typography>{t("integrations.Yotpo.importFromYotpo")}</Typography>
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
              <MenuItem value={UnsubscribePreferenceType.Both}>{t('integrations.Yotpo.bothEmailSMS')}</MenuItem>
              <MenuItem value={UnsubscribePreferenceType.Email}>{t('integrations.Yotpo.emailOnly')}</MenuItem>
              <MenuItem value={UnsubscribePreferenceType.Sms}>{t('integrations.Yotpo.SMSOnly')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    ),
    onConfirm: async () => {
      const updatedSettings = { ...settings, IsInsertAsActive: true, RegisterAsActiveOptionsID: activeImportType };
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

  return (
    <>
      {toastMessage && renderToast()}
      {
        !isPageLoading && (
          <Box className={clsx(classes.containerBody)}>
            <Box className={clsx(classes.dblock)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.Yotpo.apiGuid")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              {!isAuthenticated && <Typography className={clsx(classes.mb5)}>
                {t("integrations.Yotpo.guidSubTitle")}
              </Typography>}
              <TextField
                size="small"
                name="YotpoApiGuid"
                value={settings.ApiGuid}
                onChange={(event) => setSettings({ ...settings, ApiGuid: event.target.value })}
                className={clsx(classes.dBlock, classes.shopifySettingTextBox)}
                disabled={isAuthenticated}
              />
              {!!errors.ApiGuid && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.ApiGuid}
                </Typography>
              )}
            </Box>
            <Box className={clsx(classes.dblock, classes.pt14)}>
              <Typography className={clsx(classes.bold)}>
                {t("integrations.apiKey")}
                <label className={clsx(classes.ml10, classes.textRed)}>*</label>
              </Typography>
              {!isAuthenticated && <Typography className={clsx(classes.mb5)}>
                {t("integrations.Yotpo.subTitle")}
              </Typography>}
              <TextField
                size="small"
                name="YotpoApiKey"
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
                <Typography style={{ fontSize: "18px", color: "#000" }}>{RenderHtml(t("integrations.Yotpo.notice"))}</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item md={10} xs={12}>
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
                      <b>{t("integrations.Yotpo.syncRecipients")}</b>
                    </Typography>
                    <Typography style={{ maxWidth: 500, wordBreak: 'break-word' }}>
                      {RenderHtml(t("integrations.Yotpo.syncRecipientsDesc"))}
                    </Typography>
                  </Box>}
                />
              </Grid>

              <Grid item md={10} xs={12}>
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
                      <b>{t("integrations.Yotpo.newAsActive")}</b>
                      {settings?.IsInsertAsActive && (
                        <span style={{ fontWeight: 'normal', marginLeft: 8 }}>
                          ({normalizedRegisterAsActiveOptionsID === UnsubscribePreferenceType.Email
                            ? t('integrations.Yotpo.emailOnly')
                            : normalizedRegisterAsActiveOptionsID === UnsubscribePreferenceType.Sms
                            ? t('integrations.Yotpo.SMSOnly')
                            : t('integrations.Yotpo.bothEmailSMS')})
                        </span>
                      )}
                    </Typography>
                  </Box>}
                />
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

export default Yotpo;
