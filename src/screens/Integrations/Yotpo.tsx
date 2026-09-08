import { useState, useEffect } from "react";
import React from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, FormControl, MenuItem } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, resetIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import { YotpoModel, UnsubscribePreferenceType } from '../../Models/Integrations/Integration';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getAllGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import GroupTags from "../../components/Groups/GroupTags";
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
  const [csvFiles, setCsvFiles] = useState<FileList | null>(null);
  const [importJobIds, setImportJobIds] = useState<number[]>([]);
  const [importStatus, setImportStatus] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);
  const allGroups = useSelector((state: StateType) => state.group?.subAccountAllGroups || []);
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
    await dispatch(getAllGroupsBySubAccountId());
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Yotpo)) as any;
    handleGetIntegrationResponse(settingResponse);
    // restore latest import job status
    try {
      const latestRes = await PulseemReactInstance.get('Integrations/Yotpo/LatestImport');
      const job = latestRes?.data?.Data;
      if (job) {
        setImportStatus({ status: job.Status, processed: job.Processed, failed: job.Failed, total: job.TotalRows, error: job.Error });
        setImportJobIds([job.ID]);
        if (job.Status === 'pending' || job.Status === 'processing') {
          pollImportStatus(job.ID);
        }
      }
    } catch { }
    setShowLoader(false);
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
            RegisterAsActiveOptionsID: normalizePreferenceType(resp.RegisterAsActiveOptionsID, UnsubscribePreferenceType.Both),
            RegisterGroups: resp.RegisterGroups || []
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

  const handleCsvImport = async () => {
    if (!csvFiles || csvFiles.length === 0) return;
    setImportLoading(true);
    setImportStatus(null);
    try {
      const formData = new FormData();
      for (let i = 0; i < csvFiles.length; i++) {
        formData.append('files', csvFiles[i]);
      }
      const response = await PulseemReactInstance.post('Integrations/Yotpo/QueueCsvImport', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      if (data?.StatusCode === 201 && data?.Data?.length > 0) {
        setImportJobIds(data.Data);
        setImportStatus({ status: 'queued', message: t('integrations.Yotpo.importQueued') });
        pollImportStatus(data.Data[0]);
      } else {
        setImportStatus({ status: 'error', message: data?.Message || t('integrations.Yotpo.importError') });
      }
    } catch {
      setImportStatus({ status: 'error', message: t('integrations.Yotpo.importError') });
    }
    setImportLoading(false);
  };

  const pollImportStatus = (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await PulseemReactInstance.get(`Integrations/Yotpo/ImportStatus/${jobId}`);
        const data = response.data;
        const job = data?.Data;
        if (job) {
          setImportStatus({ status: job.Status, processed: job.Processed, failed: job.Failed, total: job.TotalRows, error: job.Error });
          if (job.Status === 'done' || job.Status === 'failed') clearInterval(interval);
        }
      } catch { clearInterval(interval); }
    }, 10000);
  };

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
            <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.pb15)}>
              <Grid item xs={12}>
                <Typography className={clsx(classes.mb5)} style={{ fontWeight: 600 }}>
                  {t("integrations.Yotpo.registerGroup") || "Register Group"}
                </Typography>
                <Typography className={clsx(classes.mb5)} style={{ fontSize: 13, color: '#666' }}>
                  {t("integrations.Yotpo.registerGroupSubtitle") || "New Yotpo customers will be added to this group in Pulseem"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8} md={6}>
                <Box className={'group-dropdown'}>
                  <GroupTags
                    className='group-select'
                    groupSelected={settings.RegisterGroups || []}
                    classes={classes}
                    title={'siteTracking.typeGroupName'}
                    dropdown
                    dropDownProps={{
                      onChange: (_e: any, val: any) => {
                        setSettings({
                          ...settings,
                          RegisterGroups: val.reduce((prev: any, cur: any) => [...prev, cur.GroupID], [])
                        });
                      },
                      selectedGroups: settings.RegisterGroups || [],
                      groups: allGroups
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} style={{ marginTop: 12 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  className={clsx(classes.btn, classes.btnRounded)}
                  onClick={() => handleSave(settings)}
                >
                  {t("integrations.save") || "Save"}
                </Button>
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
      {isAuthenticated && (
        <Box style={{ marginTop: 24, border: '1px solid #E0E4EE', borderRadius: 6, background: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,26,46,0.08)', paddingBottom: 16 }}>
          {/* Header */}
          <Box style={{ padding: '14px 20px 12px', borderBottom: '1px solid #E0E4EE', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Typography style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>
              {t('integrations.Yotpo.importFromCsvTitle')}
            </Typography>
          </Box>

          {/* Upload zone + button — shown first so widgets don't cover it */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px 14px', flexWrap: 'wrap', borderBottom: '1px solid #E0E4EE' }}>
            <Box
              style={{ flex: 1, minWidth: 200, border: `1.5px dashed ${csvFiles && csvFiles.length > 0 ? '#D93A5B' : '#E0E4EE'}`, borderRadius: 6, padding: '18px 14px', textAlign: 'center', cursor: 'pointer', background: csvFiles && csvFiles.length > 0 ? '#FDF1F4' : '#F0F3F8', transition: 'border-color 0.15s, background 0.15s' }}
              onClick={() => (document.getElementById('yotpoCsvInput') as HTMLInputElement)?.click()}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); setCsvFiles(e.dataTransfer.files); }}
            >
              <Typography style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>
                {csvFiles && csvFiles.length > 0
                  ? `${csvFiles.length} ${csvFiles.length > 1 ? t('integrations.Yotpo.importing').replace('...','') : ''} ${Array.from(csvFiles).map(f => f.name).join(', ')}`
                  : t('integrations.Yotpo.importHowTitle').split(':')[0]}
              </Typography>
              <Typography style={{ fontSize: 11, color: '#6B7A99' }}>
                {csvFiles && csvFiles.length > 0 ? t('integrations.Yotpo.importStep5').split('—')[1]?.trim() : t('integrations.Yotpo.importStep5')}
              </Typography>
              {csvFiles && csvFiles.length > 0 && (
                <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                  {Array.from(csvFiles).map((f, i) => (
                    <Box key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FDF1F4', border: '1px solid #F2C0CC', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: '#D93A5B', fontWeight: 500 }}>
                      📄 {f.name}
                    </Box>
                  ))}
                </Box>
              )}
              <Typography style={{ fontSize: 10.5, color: '#A0AABF', marginTop: 7 }}>.csv {t('integrations.Yotpo.importStep5').includes('email') ? 'files only' : ''}</Typography>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 0, justifyContent: 'center', paddingTop: 2 }}>
              <Button
                onClick={handleCsvImport}
                variant='contained'
                size='medium'
                disabled={importLoading || !csvFiles || csvFiles.length === 0}
                className={clsx(classes.btn, classes.btnRounded)}
                color="primary"
              >
                {importLoading ? t('integrations.Yotpo.importing') : t('integrations.Yotpo.importBtn')}
              </Button>
            </Box>
          </Box>
          <input type="file" id="yotpoCsvInput" accept=".csv" multiple style={{ display: 'none' }} onChange={(e) => setCsvFiles(e.target.files)} />

          {/* Steps — shown below upload so they don't push the button down */}
          <Box style={{ display: 'flex', padding: '16px 20px 4px', overflowX: 'auto', gap: 0 }}>
            {[1,2,3,4,5].map((n, i) => (
              <Box key={n} style={{ flex: 1, minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', paddingRight: 12 }}>
                {i < 4 && <Box style={{ position: 'absolute', top: 11, left: 22, right: 0, height: 1, background: '#E0E4EE' }} />}
                <Box style={{ width: 22, height: 22, borderRadius: '50%', background: '#D93A5B', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 7, flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  {n}
                </Box>
                <Typography style={{ fontSize: 11, color: '#6B7A99', lineHeight: 1.5, maxWidth: 105 }}>
                  {t(`integrations.Yotpo.importStep${n}`)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Status bar */}
          {importStatus && (
            <Box style={{
              margin: '0 20px 16px',
              borderRadius: 6,
              padding: '12px 14px',
              border: '1px solid',
              borderColor: importStatus.status === 'done' ? '#A0D8C0' : importStatus.status === 'error' ? '#F0B0B0' : importStatus.status === 'processing' ? '#F2C0CC' : '#F0D090',
              background: importStatus.status === 'done' ? '#F0FAF5' : importStatus.status === 'error' ? '#FFF0F0' : importStatus.status === 'processing' ? '#FDF1F4' : '#FFF8EC',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Box style={{ width: 8, height: 8, borderRadius: '50%', background: importStatus.status === 'done' ? '#2E9E6E' : importStatus.status === 'error' ? '#C0303A' : importStatus.status === 'processing' ? '#D93A5B' : '#C97C10' }} />
                  <Typography style={{ fontSize: 12.5, fontWeight: 600, color: '#1A1A2E' }}>
                    {(importStatus.status === 'queued' || importStatus.status === 'pending') && t('integrations.Yotpo.importQueued')}
                    {importStatus.status === 'processing' && t('integrations.Yotpo.importProcessing', { processed: importStatus.processed, failed: importStatus.failed })}
                    {importStatus.status === 'done' && t('integrations.Yotpo.importDone', { processed: importStatus.processed, failed: importStatus.failed })}
                    {importStatus.status === 'error' && (importStatus.message || importStatus.error || t('integrations.Yotpo.importError'))}
                  </Typography>
                </Box>
                {(importStatus.processed || importStatus.total) && (
                  <Typography style={{ fontSize: 11.5, color: '#6B7A99' }}>
                    {importStatus.processed} / {importStatus.total}
                  </Typography>
                )}
              </Box>
              <Box style={{ height: 4, background: '#E0E4EE', borderRadius: 2, overflow: 'hidden' }}>
                <Box style={{
                  height: '100%',
                  borderRadius: 2,
                  background: importStatus.status === 'done' ? '#2E9E6E' : importStatus.status === 'error' ? '#C0303A' : '#D93A5B',
                  width: importStatus.status === 'done' || importStatus.status === 'error' ? '100%'
                    : importStatus.total ? `${Math.round((importStatus.processed / importStatus.total) * 100)}%` : '5%',
                  transition: 'width 0.4s ease'
                }} />
              </Box>
            </Box>
          )}
        </Box>
      )}
      <Loader isOpen={showLoader} showBackdrop={true} />
      {renderDialog()}
    </>
  );
};

export default Yotpo;
