import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, Select, MenuItem, ListItemText, OutlinedInput } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import useCore from "../../helpers/hooks/Core";
import { Loader } from "../../components/Loader/Loader";
import { authenticate, getSettings } from "../../redux/reducers/integrationSlice";
import { ShopifyModel, IntegrationGroups } from '../../Models/Integrations/Shopify/Shopify';
import { PulseemResponse } from '../../Models/APIResponse';
import { LU_Plugin, IntegrationRequest } from '../../Models/Integrations/Integration';

const Shopify = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);
  const { accountSettings, ToastMessages } = useSelector((state: any) => state?.accountSettings);
  const { CoreToastMessages } = useSelector((state: any) => state?.core);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  // This object should be used as Shopify model
  const [authenticationDetails, setAuthenticationDetails] = useState({
    IntegrationSource: LU_Plugin.Shopify,
    api_key: '',
    api_access_token: '',
    store_name: '',
    api_version: '2023-01'
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

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  useEffect(() => {
    const initSettings = async () => {
      const settingResponse = await dispatch(getSettings(LU_Plugin.Shopify));
      //setSettings(settingResponse?.payload?.Data as ShopifyModel);

    }
    initSettings();

  }, []);

  const submitForm = async () => {

    // Add validation then this logic
    const request = {
      IntegrationSource: LU_Plugin.Shopify,
      JsonData: JSON.stringify(authenticationDetails)
    } as IntegrationRequest;

    const authResponse = await dispatch(authenticate(request));
    handleAuthResponse(authResponse);
  }

  const handleAuthResponse = (response: any) => {
    switch (response?.StatusCode) {
      case 201: {
        console.log(response);
        // success
        break;
      }
      case 400: {
        console.log(response);
        // Cannot set groups - general error
        break;
      }
      case 401: {
        console.log(response);
        // Invalid Pulseem API key -> Logout session
        break;
      }
      case 403: {
        console.log(response);
        // No Source has been requested
        break;
      }
    }
  }

  const resetStore = () => { }
  const showCredentials = () => { }

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
        </Box>
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
          />
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
          />
        </Box>
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
            {t("integrations.shopify.authenticate")}
          </Button>
          {isAuthenticated && <Box>
            <Button onClick={resetStore}>Reset</Button>
            <Button onClick={showCredentials}>Show Credetianls</Button>
          </Box>
          }
          <Loader isOpen={showLoader} showBackdrop={true} />
        </Box>
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
                  input={<OutlinedInput label="Purchase history" />}
                >
                  <MenuItem key='0' value='0' style={{ paddingRight: 15 }}>
                    <Checkbox />
                    <ListItemText primary={'--- Select ---'} className={clsx(classes.dInlineBlock)} />
                  </MenuItem>
                </Select>
                {/* <select
                  placeholder={t("common.select")}
                  style={{
                    
                  }}
                  className={clsx(classes.dBlock, "selectBox")}
                  // disabled={sendType === "3" ? false : true}
                  // onChange={(e) => { handleSelectChange(e) }}
                  // value={sendType === "3" ? spectialDateFieldID : "0"}
                >
                  <option value="0">{t("common.select")}</option>
                  <option value="1">{t("mainReport.birthday")}</option>
                  <option value="2">{t("mainReport.creationDay")}</option>
                </select> */}
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
                >
                  <MenuItem key='0' value='0' style={{ paddingRight: 15 }}>
                    <Checkbox />
                    <ListItemText primary={'--- Select ---'} className={clsx(classes.dInlineBlock)} />
                  </MenuItem>
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
                  input={<OutlinedInput label="Purchase history" />}
                >
                  <MenuItem key='0' value='0' style={{ paddingRight: 15 }}>
                    <Checkbox />
                    <ListItemText primary={'--- Select ---'} className={clsx(classes.dInlineBlock)} />
                  </MenuItem>
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
    </>
  );
};

export default Shopify;
