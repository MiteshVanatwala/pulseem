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
  const [ showResetDialog, setShowResetDialog ] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isShowCredentials, setIsShowCredentials] = useState(false);
  const [authenticationErrors, setAuthenticationErrors] = useState({
    api_key: '',
    api_access_token: '',
    store_name: '',
    authentication_message: '',
    api_version: ''
  });
  // This object should be used as Shopify model
  const [authenticationDetails, setAuthenticationDetails] = useState({
    IntegrationSource: LU_Plugin.Shopify,
    api_key: '',
    api_access_token: '',
    store_name: '',
    api_version: ''
  } as ShopifyModel);
  const [settings, setSettings] = useState({
    RegisterEventActive: false,
    PurchaseEventActive: false,
    AbandonedEventActive: false,
    Groups: {} as IntegrationGroups
  } as ShopifyModel)
  const [insertClientDetails, setInsertClientDetails] = useState({
    siteSigupChecked: false,
    siteSelected: '',
    purchaseChecked: false,
    purchaseSelected: '',
    cartAbandonmentChecked: false,
    cartAbandonmentSelected: '',
  });
  const [preloadIntegrations, setPreloadIntegrations] = useState({
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
  } as ShopifyModel);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    const initSettings = async () => {
      const settingResponse = await dispatch(getIntegration(LU_Plugin.Shopify)) as any;
      const settings = settingResponse?.payload?.Data as ShopifyModel;
      if (settings.ID) {
        setPreloadIntegrations(settings);
        setAuthenticated(true);
      }
      if (subAccountAllGroups?.length === 0) {
        dispatch(getGroupsBySubAccountId());
      }
    }
    initSettings();
  }, []);

  const authenticateStore = async () => {
    // Add validation then this logic
    let authenticationErrorsDump = authenticationErrors;
    if (authenticationDetails.store_name.trim() === '') authenticationErrorsDump = { ...authenticationErrorsDump, store_name: t('integrations.shopify.enterShopifyUrl') };
    if (authenticationDetails.api_key.trim() === '') authenticationErrorsDump = { ...authenticationErrorsDump, api_key: t('integrations.shopify.enterAPIKey') };
    if (authenticationDetails.api_access_token.trim() === '') authenticationErrorsDump = { ...authenticationErrorsDump, api_access_token: t('integrations.shopify.enterAPIKey') };
    if (authenticationDetails.api_version.trim() === '') authenticationErrorsDump = { ...authenticationErrorsDump, api_version: t('integrations.shopify.enterAPIVersion') };
    
    await setAuthenticationErrors(authenticationErrorsDump);
    if (authenticationDetails.store_name.trim() !== '' && authenticationDetails.api_key.trim() !== '' && authenticationDetails.api_access_token.trim() !== '') {
      setAuthenticationErrors({
        ...authenticationErrors,
        store_name: '',
        api_key: '',
        api_access_token: ''
      })
      setShowLoader(true);
      const request = {
        IntegrationSource: LU_Plugin.Shopify,
        JsonData: JSON.stringify(authenticationDetails)
      } as IntegrationRequest;

      const authResponse = await dispatch(authenticate(request));
      setShowLoader(false);
      handleAuthResponse(authResponse);
    }
  }

  const submitForm = async () => {
    setShowLoader(true);
    const request = {
      IntegrationSource: LU_Plugin.Shopify,
      JsonData: JSON.stringify({...preloadIntegrations, ...settings})
    } as IntegrationRequest;
    const response = await dispatch(setIntegration(request));
    console.log(response);
    setShowLoader(false);
  }

  const handleAuthResponse = (response: any) => {
    switch (response?.payload?.StatusCode) {
      case 201: {
        // success
        setAuthenticationDetails({
          ...authenticationDetails,
          store_name: '',
          api_key: '',
          api_access_token: ''
        })
        setAuthenticated(true);
        break;
      }
      case 400: {
        setAuthenticationErrors({
          ...authenticationErrors,
          authentication_message: t(`integrations.shopify.authResponses.400`),
          store_name: '',
          api_key: '',
          api_access_token: ''
        });
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 403: {
        //TODO mitesh
        // No Source has been requested
        setAuthenticationErrors({
          ...authenticationErrors,
          authentication_message: t(`integrations.shopify.authResponses.403`),
          store_name: '',
          api_key: '',
          api_access_token: ''
        })
        break;
      }
    }
  }

  const resetStore = () => {
    setShowResetDialog(false);
    setAuthenticationDetails({
      ...authenticationDetails,
      store_name: '',
      api_key: '',
      api_access_token: ''
    });

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
    setAuthenticationDetails({
      ...authenticationDetails,
      store_name: settings.store_name,
      api_key: settings.api_key,
      api_access_token: settings.api_access_token
    });
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
            onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, store_name: event.target.value })}
            className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
          />
          {!!authenticationErrors.store_name && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {authenticationErrors.store_name}
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
              onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, api_key: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
              disabled={isShowCredentials}
            />
            {!!authenticationErrors.api_key && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {authenticationErrors.api_key}
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
              onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, api_access_token: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
              disabled={isShowCredentials}
            />
            {!!authenticationErrors.api_access_token && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {authenticationErrors.api_access_token}
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
              onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, api_version: event.target.value })}
              className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
              disabled={isShowCredentials}
            />
            {!!authenticationErrors.api_version && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {authenticationErrors.api_version}
              </Typography>
            )}
          </Box>
          
          {!!authenticationErrors.authentication_message && (
            <Box className={clsx(classes.flex, classes.pbt15)}>
              <Typography className={clsx(classes.errorText, classes.f16)}>
                {authenticationErrors.authentication_message}
              </Typography>
            </Box>
          )}
          {
            !isShowCredentials && <Box className={clsx(classes.flex, classes.pbt15)}>
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
                    onChange={(event) => setSettings({ ...settings, RegisterEventActive: event.target.checked })}
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
                    onChange={(event) => setSettings({ ...settings, PurchaseEventActive: event.target.checked })}
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
                    onChange={(event) => setSettings({ ...settings, AbandonedEventActive: event.target.checked })}
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
