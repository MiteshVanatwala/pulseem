import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField, FormControlLabel, Checkbox, Select, MenuItem, ListItemText, OutlinedInput } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import Toast from "../../components/Toast/Toast.component";
import useCore from "../../helpers/hooks/Core";
import { Loader } from "../../components/Loader/Loader";

const Shopify = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = useCore();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);
  const { accountSettings, ToastMessages } = useSelector((state: any) => state?.accountSettings);
  const { CoreToastMessages } = useSelector((state: any) => state?.core);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [ isAuthenticated, setAuthenticated ] = useState(true);
  const [ authenticationDetails, setAuthenticationDetails ] = useState({
    apiKey: '',
    apiAccessToken: '',
    shopifyURL: ''
  });
  const [ insertClientDetails, setInsertClientDetails ] = useState({
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

  const submitForm = () => {
    // setAuthenticated(true);
    if (authenticationDetails.apiKey.trim() !== '' && authenticationDetails.apiAccessToken.trim() !== '' && authenticationDetails.shopifyURL.trim() !== '') {
      console.log(authenticationDetails);
    }
  }

  return (
    <>
      {toastMessage && renderToast()}
      <Box className={"formContainer"}>
        <Typography className={clsx(classes.managementTitle, classes.f22, classes.pb15)}>
          {t('integrations.shopify.authentication')}
        </Typography>
        <div className={clsx(classes.dblock, classes.pb15)}>
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
            onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, apiKey: event.target.value})}
            className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
          />
        </div>

        <div className={clsx(classes.dblock, classes.pb15)}>
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
            onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, apiAccessToken: event.target.value})}
            className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
          />
        </div>

        <div className={clsx(classes.dblock, classes.pb15)}>
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
            onChange={(event) => setAuthenticationDetails({ ...authenticationDetails, shopifyURL: event.target.value})}
            className={clsx(classes.textField, classes.dBlock, classes.shopifySettingTextBox)}
          />
        </div>
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
                    checked={insertClientDetails.siteSigupChecked}
                    onChange={(event) => setInsertClientDetails({...insertClientDetails, siteSigupChecked: event.target.checked})}
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
                  <MenuItem key='0' value='0' style={{paddingRight: 15}}>
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
                    checked={insertClientDetails.purchaseChecked}
                    onChange={(event) => setInsertClientDetails({...insertClientDetails, purchaseChecked: event.target.checked})}
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
                  <MenuItem key='0' value='0' style={{paddingRight: 15}}>
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
                    checked={insertClientDetails.cartAbandonmentChecked}
                    onChange={(event) => setInsertClientDetails({...insertClientDetails, cartAbandonmentChecked: event.target.checked})}
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
                  <MenuItem key='0' value='0' style={{paddingRight: 15}}>
                    <Checkbox />
                    <ListItemText primary={'--- Select ---'} className={clsx(classes.dInlineBlock)} />
                  </MenuItem>
                </Select>
              </Grid>
            </Grid> 
          </Box>
        )
      }


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
    </>
  );
};

export default Shopify;
