import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { Title } from "../../../components/managment/Title";
import Illustration_app_Settings from "../../../assets/images/settings/Illustration_app_Settings";
import { AccDtlPropTypes } from "../../../Models/Settings/AccountDetails";
import useCore from "../../../helpers/hooks/Core";
import { IsNumberField } from "../../../helpers/Utils/Validations";
import { AccountSettings } from "../../../Models/Account/AccountSettings";

const FORM_ACCOUNT_DETAILS = ({
  setToastMessage,
  ToastMessages,
  Settings,
  OnUpdate
}: AccDtlPropTypes) => {
  const { t } = useTranslation();
  const { classes } = useCore();
  const { isRTL } = useSelector((state: any) => state.core);
  const dispatch = useDispatch();

  const [accountDetails, setAccountDetails] = useState<AccountSettings>({
    DefaultFromMail: "",
    DefaultFromName: "",
    DefaultCellNumber: "",
    UnsubscribeType: false,
    IsSmsImmediateUnsubscribeLink: false
  } as AccountSettings);

  const isValidPayload = () => {
    if (!accountDetails.DefaultFromMail) {
    }
    return true;
  };

  useEffect(() => {
    setAccountDetails(Settings);
  }, [Settings])

  const handleChange = (e: any, name = "") => {
    let actualValue = e?.target?.value;
    let trimValue = e?.target?.value.trim();
    setAccountDetails({
      ...accountDetails,
      [e?.target?.name]:
        trimValue.length + 1 === actualValue?.length ? actualValue : trimValue,
    });
  };

  const handleSave = () => {
    if (isValidPayload()) {
      OnUpdate(accountDetails);
    }
  };

  return (
    <Box
      style={{ marginTop: 42.6, paddingInline: 17.2 }}
      className={"settingsWrapper"}
    >
      <Title
        Text={t("settings.accountSettings.actDetails.title")}
        classes={classes}
        isIcon={false}
        ContainerStyle={{
          padding: `6px ${isRTL ? "14.69px" : 0} 5px ${isRTL ? 0 : "14.69px"}`,
        }}
      />
      <Box className={"formContainer"}>
        <Illustration_app_Settings className={"svg_app_settings"} />
        <Grid container className={"form"}>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("mainReport.fromName")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="DefaultFromName"
              value={accountDetails.DefaultFromName}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("mainReport.fromEmail")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="DefaultFromMail"
              value={accountDetails.DefaultFromMail}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>
                {t(
                  "settings.accountSettings.actDetails.fields.fromPhoneNumber"
                )}
              </>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="DefaultCellNumber"
              value={accountDetails.DefaultCellNumber}
              onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid container>
            <Grid item xs={12} sm={6} md={3} className={"textBoxWrapper"}>
              <Typography>
                <>
                  {t(
                    "settings.accountSettings.actDetails.fields.unsubSettings"
                  )}
                </>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={"textBoxWrapper"}>
              <RadioGroup
                aria-label="UnsubscribeType"
                name="UnsubscribeType"
                value={!accountDetails.UnsubscribeType ? '0' : '1'}
                onChange={() => {
                  setAccountDetails({ ...accountDetails, UnsubscribeType: accountDetails.UnsubscribeType === false ? true : false })
                }}
              >
                <FormControlLabel
                  value="0"
                  control={<Radio />}
                  label={
                    <>
                      {t(
                        "settings.accountSettings.actDetails.fields.unsubByEmailOrCell"
                      )}
                    </>
                  }
                />
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label={
                    <>
                      {t(
                        "settings.accountSettings.actDetails.fields.unsubByEmailAndCell"
                      )}
                    </>
                  }
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={3} className={"textBoxWrapper"}>
              <Typography>
                <>
                  {t("settings.accountSettings.actDetails.fields.smsUnsubLink")}
                </>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8} className={"textBoxWrapper"}>
              <RadioGroup
                aria-label="quiz"
                name="IsSmsImmediateUnsubscribeLink"
                value={!accountDetails.IsSmsImmediateUnsubscribeLink ? '0' : '1'}
                onChange={() => {
                  setAccountDetails({ ...accountDetails, IsSmsImmediateUnsubscribeLink: accountDetails.IsSmsImmediateUnsubscribeLink === false ? true : false })
                }}
              >
                <FormControlLabel
                  value="0"
                  control={<Radio />}
                  label={
                    <>
                      {t(
                        "settings.accountSettings.actDetails.fields.regSmsUnsubLink"
                      )}
                    </>
                  }
                />
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label={
                    <>
                      {t(
                        "settings.accountSettings.actDetails.fields.imdSmsUnsubLink"
                      )}
                    </>
                  }
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} className={classes.justifyContentEnd}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  "saveFixedDetails"
                )}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                onClick={handleSave}
              >
                <>{t("settings.accountSettings.actDetails.btnUpdate")}</>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default FORM_ACCOUNT_DETAILS;
