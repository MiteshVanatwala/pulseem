import React, { useState } from "react";
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
import {
  AccDtlPropTypes,
  AccountDetailsType,
} from "../../../Models/Settings/AccountDetails";
import useCore from "../../../helpers/hooks/Core";

const Form_AccountDetails = ({
  setToastMessage,
  ToastMessages,
}: AccDtlPropTypes) => {
  const { t } = useTranslation();
  const { classes } = useCore();
  const { isRTL } = useSelector((state: any) => state.core);
  const dispatch = useDispatch();

  const [accountDetails, setAccountDetails] = useState<AccountDetailsType>({
    FromEmail: "",
    FromName: "",
    FromPhoneNumber: "",
    UnsubType: "",
    SmsUnsubLinkType: "",
  });

  // const [errors, setErrors] = useState<AccDtlErrorsType>({
  //   FromEmail: "",
  //   FromName: "",
  //   FromPhoneNumber: "",
  //   UnsubType: "",
  //   SmsUnsubLinkType: "",
  // });

  const isNumber = (event: any) => {
    var NumberRegEx = /^[0-9]*$/;
    if (
      !event.key.match(NumberRegEx) ||
      event.key === "e" ||
      event.key === "."
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  const isValidPayload = () => {
    if (!accountDetails.FromEmail) {
    }
    return true;
  };

  const handleChange = (e: any, name = "") => {
    let actualValue = e?.target?.value;
    let trimValue = e?.target?.value.trim();
    setAccountDetails({
      ...accountDetails,
      [e?.target?.name]:
        trimValue.length + 1 === actualValue?.length ? actualValue : trimValue,
    });
  };

  const handleResponses = (response: any) => {
    switch (response?.StatusCode || response?.payload?.StatusCode) {
      case 201: {
        break;
      }
      case 401: {
        break;
      }
      case 405: {
        break;
      }
      case 409: {
        break;
      }
      case 500:
      default: {
        setToastMessage(ToastMessages.GENERAL_ERROR);
      }
    }
  };

  const handleSave = () => {
    if (isValidPayload()) {
      let response = dispatch(() => {}); //updateAccountDetails()
      handleResponses(response);
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
              name="FromName"
              value={accountDetails.FromName}
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
              name="FromEmail"
              value={accountDetails.FromEmail}
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
              name="FromPhoneNumber"
              value={accountDetails.FromPhoneNumber}
              onKeyPress={isNumber}
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
                aria-label="quiz"
                name="UnsubType"
                value={accountDetails.UnsubType}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="best"
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
                  value="worst"
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
                name="SmsUnsubLinkType"
                value={accountDetails.SmsUnsubLinkType}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="best"
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
                  value="worst"
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
export default Form_AccountDetails;
