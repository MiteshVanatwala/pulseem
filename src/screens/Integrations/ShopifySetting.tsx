import { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, Select, MenuItem, ListItemText, OutlinedInput } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getIntegration, setIntegration } from "../../redux/reducers/integrationSlice";
import { ShopifyModel, IntegrationGroups } from '../../Models/Integrations/Shopify/Shopify';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { logout } from '../../helpers/api'
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";

const Shopify = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isShowCredentials, setIsShowCredentials] = useState(false);
  const [errors, setErrors] = useState({
    api_key: '',
    api_access_token: '',
    store_name: '',
    authentication_message: '',
    group_not_selected: '',
    api_version: '',
  });
  const [messages, setMessages] = useState({
    authentication_message: '',
    group_saved: ''
  });
  const [settings, setSettings] = useState({
    api_key: '',
    api_access_token: '',
    store_name: '',
    api_version: '',
    RegisterEventActive: false,
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    Groups: {} as IntegrationGroups
  } as ShopifyModel)
  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    initSettings();
    document.title = `${t('integrations.shopify.title')} | ${document.title}`;
  }, []);

  const initSettings = async () => {
    setShowLoader(true);
    const settingResponse = await dispatch(getIntegration(LU_Plugin.Shopify)) as any;
    setShowLoader(false);
    handleGetIntegrationResponse(settingResponse)
    if (subAccountAllGroups?.length === 0) {
      dispatch(getGroupsBySubAccountId());
    }
  }

  const authenticateStore = async () => {
    // Add validation then this logic
    let errorsDump = errors;
    if (settings.store_name.trim() === '') errorsDump = { ...errorsDump, store_name: t('integrations.shopify.enterShopifyUrl') };
    if (settings.api_key.trim() === '') errorsDump = { ...errorsDump, api_key: t('integrations.shopify.enterAPIKey') };
    if (settings.api_access_token.trim() === '') errorsDump = { ...errorsDump, api_access_token: t('integrations.shopify.enterAPIKey') };
    if (settings.api_version.trim() === '') errorsDump = { ...errorsDump, api_version: t('integrations.shopify.enterAPIVersion') };

    await setErrors(errorsDump);
    if (settings.store_name.trim() !== '' && settings.api_key.trim() !== '' && settings.api_access_token.trim() !== '') {
      setSettings({
        ...settings,
        store_name: '',
        api_key: '',
        api_access_token: ''
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Shopify,
        JsonData: JSON.stringify(settings)
      } as IntegrationRequest;

      const authResponse = await dispatch(authenticate(request));
      setShowLoader(false);
      handleAuthResponse(authResponse);
    }
  }

  const submitForm = async () => {
    if (settings.RegisterEventActive || settings.PurchaseEventActive || settings.AbandonedEventActive) {
      setErrors({
        ...errors,
        group_not_selected: '',
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Shopify,
        JsonData: JSON.stringify({ ...settings })
      } as IntegrationRequest;
      const response = await dispatch(setIntegration(request));
      handleSubmitFormResponse(response);
      setShowLoader(false);
    } else {
      setErrors({
        ...errors,
        group_not_selected: t(`integrations.shopify.selectGroup`),
      })
    }
  }

  const handleSubmitFormResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setMessages({
          ...messages,
          group_saved: t(`integrations.shopify.formSubmitResponses.201`),
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

  const handleAuthResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        setMessages({
          ...messages,
          authentication_message: t(`integrations.shopify.authResponses.201`),
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
          authentication_message: t(`integrations.shopify.authResponses.400`),
        });
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 403: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.shopify.authResponses.403`),
        })
        break;
      }
      case 404: {
        setErrors({
          ...errors,
          authentication_message: t(`integrations.shopify.authResponses.404`),
        })
        setToastMessage({ severity: 'error', color: 'error', message: "integrations.shopify.authResponses.404", showAnimtionCheck: false } as any);
        break;
      }
    }
  }

  const handleGetIntegrationResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        const shopifyResponse = response?.payload?.Data as ShopifyModel;
        if (shopifyResponse.api_access_token && shopifyResponse.store_name && shopifyResponse.store_name !== '') {
          setSettings(response?.payload?.Data as ShopifyModel);
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

  const resetStore = () => {
    setShowResetDialog(false);
    setSettings({
      ID: 0,
      SubAccountID: 0,
      store_name: '',
      api_key: '',
      api_access_token: '',
      api_password: '',
      api_version: '',
      RegisterEventActive: false,
      PurchaseEventActive: false,
      AbandonedEventActive: false,
      UiApi_ApiKey: '',
      Groups: {},
      CreateDate: '',
      UpdateDate: '',
      IntegrationSource: 2
    });

    setAuthenticated(false);
    setIsShowCredentials(false);
  }

  const showCredentials = () => {
    setIsShowCredentials(true);
  }

  const registerChange = (event: any) => {
    setSettings({
      ...settings,
      Groups: {
        ...settings.Groups,
        RegisterGroups: event.target.value
      }
    })
  }

  const purchaseChange = (event: any) => {
    setSettings({
      ...settings,
      Groups: {
        ...settings.Groups,
        PurchaseGroups: event.target.value
      }
    })
  }

  const cartAbandonedChange = (event: any) => {
    setSettings({
      ...settings,
      Groups: {
        ...settings.Groups,
        AbandonedGroups: event.target.value
      }
    })
  }

  const renderResetDialog = () => {
    return (
      <BaseDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => resetStore()}
        title=""
      >
        <Box className={clsx(classes.bodyTextDialog, classes.pb25)}>
          <Typography>
            {t("integrations.shopify.resetConfirmation")}
          </Typography>
        </Box>
      </BaseDialog>
    )
  }

  return (
    <>
      {toastMessage && renderToast()}
      <Box className={"formContainer"}>
        <Typography className={clsx(classes.managementTitle, classes.f22, classes.pb15)}>
          {t('integrations.shopify.authentication')}
        </Typography>
        <Box className={clsx(classes.dblock, classes.pb15)}>
          <Typography className={clsx(classes.bold)}>
            {t("integrations.shopify.shopifyURL")}
            <label className={clsx(classes.ml10, classes.textRed)}>*</label>
          </Typography>
          <Typography className={clsx(classes.mb5)}>
            {t("integrations.shopify.insertShopifyURL")}
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="DefaultFromName"
            value={settings.store_name}
            onChange={(event) => setSettings({ ...settings, store_name: event.target.value })}
            className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
          />
          {!!errors.store_name && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.store_name}
            </Typography>
          )}
        </Box>
        {!isAuthenticated || isShowCredentials ? (<>
          <Box className={clsx(classes.dblock, classes.pb15)}>
            <Typography className={clsx(classes.bold)}>
              {t("integrations.shopify.apiKey")}
              <label className={clsx(classes.ml10, classes.textRed)}>*</label>
            </Typography>
            <Typography className={clsx(classes.mb5)}>
              {t("integrations.shopify.insertAPIKey")}
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="DefaultFromName"
              value={settings.api_key}
              onChange={(event) => setSettings({ ...settings, api_key: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
            />
            {!!errors.api_key && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.api_key}
              </Typography>
            )}
          </Box>

          <Box className={clsx(classes.dblock, classes.pb15)}>
            <Typography className={clsx(classes.bold)}>
              {t("integrations.shopify.apiAccessToken")}
              <label className={clsx(classes.ml10, classes.textRed)}>*</label>
            </Typography>
            <Typography className={clsx(classes.mb5)}>
              {t("integrations.shopify.insertToken")}
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="DefaultFromName"
              value={settings.api_access_token}
              onChange={(event) => setSettings({ ...settings, api_access_token: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
            />
            {!!errors.api_access_token && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.api_access_token}
              </Typography>
            )}
          </Box>
          <Box className={clsx(classes.dblock, classes.pb15)}>
            <Typography className={clsx(classes.bold)}>
              {t("integrations.shopify.apiVersion")}
              <label className={clsx(classes.ml10, classes.textRed)}>*</label>
            </Typography>
            <Typography className={clsx(classes.mb5)}>
              {t("integrations.shopify.apiVersion")}
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="apiVersion"
              value={settings.api_version}
              onChange={(event) => setSettings({ ...settings, api_version: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
            />
            {!!errors.api_version && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.api_version}
              </Typography>
            )}
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
            <Box className={clsx(classes.flex, classes.pbt15)}>
              <Button
                onClick={authenticateStore}
                variant='contained'
                size='medium'
                className={clsx(
                  classes.actionButton,
                  classes.actionButtonLightGreen,
                  classes.backButton
                )}
                color="primary"
              >
                {t("integrations.shopify.authenticate")}
              </Button>
            </Box>
          }
        </>) :
          (<>
            <Button
              onClick={() => setShowResetDialog(true)}
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightGreen,
                classes.backButton
              )}
              color="primary"
            >
              {t("integrations.shopify.reset")}
            </Button>
            <Button
              onClick={showCredentials}
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightGreen,
                classes.backButton,
                classes.ml10
              )}
              color="primary"
            >
              {t("integrations.shopify.showCredentials")}
            </Button>
          </>)
        }
        <Loader isOpen={showLoader} showBackdrop={true} />
      </Box>

      {
        isAuthenticated && (
          <Box className={"formContainer"}>
            <Typography className={clsx(classes.managementTitle, classes.f22, classes.pb15)}>
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
                label={t('integrations.shopify.siteSignUp')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Select
                  labelId="multiple-checkbox-label"
                  id="multiple-checkbox"
                  input={<OutlinedInput label="Register history" />}
                  multiple
                  value={settings.Groups?.RegisterGroups || []}
                  onChange={registerChange}
                  disabled={!settings.RegisterEventActive}
                  renderValue={(selected: any) => {
                    return subAccountAllGroups.reduce((selectedGroupName: any, group: any) => {
                      if (selected.indexOf(group.GroupID) > -1) {
                        selectedGroupName.push(group.GroupName);
                      }
                      return selectedGroupName;
                    }, []).join(', ');
                  }}
                >
                  {subAccountAllGroups?.map((group: any) => {
                    return (<MenuItem key={`register_${group.GroupID}`} value={group.GroupID} style={{ paddingRight: 15 }}>
                      <Checkbox
                        checked={(settings.Groups?.RegisterGroups || []).indexOf(group.GroupID) > -1}
                        color="primary"
                      />
                      <ListItemText primary={group.GroupName} className={clsx(classes.dInlineBlock)} />
                    </MenuItem>)
                  })
                  }
                </Select>
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
                label={t('integrations.shopify.purchase')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Select
                  labelId="multiple-checkbox-label"
                  id="multiple-checkbox"
                  input={<OutlinedInput label="Purchase history" />}
                  disabled={!settings.PurchaseEventActive}
                  multiple
                  value={settings.Groups?.PurchaseGroups || []}
                  onChange={purchaseChange}
                  renderValue={(selected: any) => {
                    return subAccountAllGroups.reduce((selectedGroupName: any, group: any) => {
                      if (selected.indexOf(group.GroupID) > -1) {
                        selectedGroupName.push(group.GroupName);
                      }
                      return selectedGroupName;
                    }, []).join(', ');
                  }}
                >
                  {subAccountAllGroups?.map((group: any) => {
                    return (<MenuItem key={`purchase_${group.GroupID}`} value={group.GroupID} style={{ paddingRight: 15 }}>
                      <Checkbox
                        checked={(settings.Groups?.PurchaseGroups || []).indexOf(group.GroupID) > -1}
                        color="primary"
                      />
                      <ListItemText primary={group.GroupName} className={clsx(classes.dInlineBlock)} />
                    </MenuItem>)
                  })}
                </Select>
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
                label={t('integrations.shopify.cartAbandonment')}
              />
              <Grid container item xs={12} sm={12} md={12} className={clsx("textBoxWrapper", classes.dblock, classes.shopifySettingMultiSelect)}>
                <Select
                  labelId="multiple-checkbox-label"
                  id="multiple-checkbox"
                  input={<OutlinedInput label="Cart Abandoned" />}
                  disabled={!settings.AbandonedEventActive}
                  multiple
                  value={settings.Groups?.AbandonedGroups || []}
                  onChange={cartAbandonedChange}
                  renderValue={(selected: any) => {
                    return subAccountAllGroups.reduce((selectedGroupName: any, group: any) => {
                      if (selected.indexOf(group.GroupID) > -1) {
                        selectedGroupName.push(group.GroupName);
                      }
                      return selectedGroupName;
                    }, []).join(', ');
                  }}
                >
                  {subAccountAllGroups?.map((group: any) => {
                    return (
                      <MenuItem key={`abandoned_${group.GroupID}`} value={group.GroupID}>
                        <Checkbox
                          checked={(settings.Groups?.AbandonedGroups || []).indexOf(group.GroupID) > -1}
                          color="primary"
                        />
                        <ListItemText primary={group.GroupName} className={clsx(classes.dInlineBlock)} />
                      </MenuItem>
                    )
                  })}
                </Select>
              </Grid>
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
                  classes.actionButton,
                  classes.actionButtonLightGreen,
                  classes.backButton
                )}
                color="primary"
              >
                {t("common.save")}
              </Button>
              <Loader isOpen={showLoader} showBackdrop={true} />
            </Box>
          </Box>
        )
      }
      {renderResetDialog()}
    </>
  );
};

export default Shopify;
