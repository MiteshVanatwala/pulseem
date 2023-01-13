import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import PulseemSwitch from "../../../components/Controlls/PulseemSwitch";
import { useDispatch, useSelector } from "react-redux";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdMobileFriendly,
  MdOutlineMarkEmailRead,
} from "react-icons/md";
import { UnLockIcon } from "../../../assets/images/settings";
import { Title } from "../../../components/managment/Title";
import Illustration_data_Analysis from "../../../assets/images/settings/Illustration_data_Analysis";
import { DateField } from "../../../components/managment";
import { IsValidEmail } from "../../../helpers/Utils/Validations";
import {
  CompDtlErrorsType,
  CompDtlPropTypes,
  CompanyDetailsType,
} from "../../../Models/Settings/CompanyDetails";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import useCore from "../../../helpers/hooks/Core";

const Form_CompanyDetails = ({
  setToastMessage,
  ToastMessages,
}: CompDtlPropTypes) => {
  const { t } = useTranslation();
  const { classes } = useCore();
  const { isRTL } = useSelector((state: any) => state.core);
  const dispatch = useDispatch();

  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsType>({
    CompanyName: "",
    ContactName: "",
    BirthDate: null,
    Telephone: "",
    Mobile: "",
    Email: "",
    Address: "",
    City: "",
    Zip: "",
    TwoFactorAuth: false,
    SendCodeMethod: "",
  });

  const [errors, setErrors] = useState<CompDtlErrorsType>({
    CompanyName: "",
    ContactName: "",
    BirthDate: "",
    Telephone: "",
    Mobile: "",
    Email: "",
    Address: "",
    City: "",
    Zip: "",
    SendCodeMethod: "",
  });

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
    let tempErrors = { ...errors };
    let isValid = true;
    if (!companyDetails.Email) {
      isValid = false;
      tempErrors = {
        ...errors,
        Email: t("settings.accountSettings.fixedComDetails.errors.reqEmail"),
      };
    } else if (!IsValidEmail(companyDetails.Email)) {
      isValid = false;
      tempErrors = {
        ...errors,
        Email: t(
          "settings.accountSettings.fixedComDetails.errors.invalidEmail"
        ),
      };
    }
    if (!companyDetails.Mobile) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        Mobile: t("settings.accountSettings.fixedComDetails.errors.reqMobile"),
      };
    } else if (
      companyDetails.Mobile.length > 16 ||
      companyDetails.Mobile.length < 9
    ) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        Mobile: t(
          "settings.accountSettings.fixedComDetails.errors.invalidMobile"
        ),
      };
    }
    if (!companyDetails.CompanyName) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CompanyName: t(
          "settings.accountSettings.fixedComDetails.errors.reqCompName"
        ),
      };
    }
    if (!companyDetails.ContactName) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        ContactName: t(
          "settings.accountSettings.fixedComDetails.errors.reqContctName"
        ),
      };
    }
    setErrors({ ...tempErrors });

    return isValid;
  };

  const handleChange = (e: any, name = "") => {
    !!errors?.[e?.target?.name] &&
      setErrors({ ...errors, [e.target.name]: "" });
    if (name === "TwoFactorAuth") {
      setCompanyDetails({
        ...companyDetails,
        TwoFactorAuth: !companyDetails.TwoFactorAuth,
      });
    } else if (name === "BirthDate") {
      setCompanyDetails({
        ...companyDetails,
        BirthDate: e,
      });
    } else {
      let actualValue = e?.target?.value;
      let trimValue = e?.target?.value.trim();
      setCompanyDetails({
        ...companyDetails,
        [e?.target?.name]:
          trimValue.length + 1 === actualValue?.length
            ? actualValue
            : trimValue,
      });
    }
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
        setToastMessage(ToastMessages?.GENERAL_ERROR);
      }
    }
  };

  const handleSave = () => {
    if (isValidPayload()) {
      let response = dispatch(() => {}); //updateCompanyDetails()
      handleResponses(response);
    }
  };

  const RenderDialog = () => {
    const { type = "", data = { title: "" } } = dialogType || {};

    const dialogContent: { [key: string]: {} } = {
      changePwd: {},
      verifyPhone: {},
      verifyEmail: {},
    };
    const currentDialog: any = dialogContent[type] || {};
    return (
      <BaseDialog
        title={data.title}
        open={!!dialogType}
        onClose={() => {
          setDialogType(null);
        }}
        onCancel={() => {
          setDialogType(null);
        }}
        {...currentDialog}
      >
        {currentDialog?.content || ""}
      </BaseDialog>
    );
  };

  return (
    <>
      <Box
        style={{ marginTop: 34.5, paddingInline: 17.2 }}
        className={"settingsWrapper"}
      >
        <Title
          Text={t("settings.accountSettings.fixedComDetails.title")}
          classes={classes}
          isIcon={false}
          ContainerStyle={{
            padding: `6px ${isRTL ? "14.69px" : 0} 5px ${
              isRTL ? 0 : "14.69px"
            }`,
          }}
        />
        <Box className={"formContainer"}>
          <Illustration_data_Analysis className={"svg_data_analysis"} />
          <Grid container className={"form"}>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>
                  {t(
                    "settings.accountSettings.fixedComDetails.fields.compName"
                  )}
                </>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="CompanyName"
                value={companyDetails.CompanyName}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.CompanyName}
              />
              {!!errors.CompanyName && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.CompanyName}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>
                  {t(
                    "settings.accountSettings.fixedComDetails.fields.contactName"
                  )}
                </>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="ContactName"
                value={companyDetails.ContactName}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.ContactName}
              />
              {!!errors.ContactName && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.ContactName}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.birthDate")}</>
              </Typography>
              <DateField
                toolbarDisabled={false}
                classes={classes}
                value={companyDetails.BirthDate}
                onChange={(value: any) => handleChange(value, "BirthDate")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.telephone")}</>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="Telehone"
                value={companyDetails.Telephone}
                onKeyPress={isNumber}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>
                  {t("settings.accountSettings.fixedComDetails.fields.mobile")}
                </>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="Mobile"
                value={companyDetails.Mobile}
                onKeyPress={isNumber}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.Mobile}
              />
              {!!errors.Mobile && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.Mobile}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.email")}</>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="Email"
                value={companyDetails.Email}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.Email}
              />
              {!!errors.Email && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.Email}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.address")}</>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="Address"
                value={companyDetails.Address}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.city")}</>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="City"
                value={companyDetails.City}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
              <Typography>
                <>{t("common.zip")}</>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="Zip"
                value={companyDetails.Zip}
                onKeyPress={isNumber}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
              />
            </Grid>
            <Typography className="subHeading">
              <>
                {t("settings.accountSettings.fixedComDetails.securitySettings")}
              </>
            </Typography>

            <Grid container className={"subform"}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <PulseemSwitch
                      switchType="ios"
                      classes={classes}
                      checked={companyDetails.TwoFactorAuth}
                      onColor="#0371ad"
                      handleDiameter={20}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      width={40}
                      className={clsx({ [classes.rtlSwitch]: isRTL })}
                      id="switchIDS425"
                      onChange={(e: any) => handleChange(e, "TwoFactorAuth")}
                    />
                  }
                  label={
                    <>
                      {t(
                        "settings.accountSettings.fixedComDetails.fields.enableTwoFactorAuth"
                      )}
                    </>
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                className={clsx(classes.dFlex, "selectWrapper")}
                alignItems="center"
              >
                <Typography>
                  <>
                    {t(
                      "settings.accountSettings.fixedComDetails.fields.sendMeCode"
                    )}
                  </>
                </Typography>
                <FormControl
                  className={classes.formControl}
                  style={{ width: "100%", maxHeight: 40 }}
                >
                  <Select
                    autoWidth
                    value={companyDetails.SendCodeMethod}
                    style={{
                      maxHeight: 40,
                      overflow: "hidden",
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                    name="SendCodeMethod"
                    onChange={(e: any) => handleChange(e)}
                  >
                    <MenuItem value="" className={classes.dropDownItem}>
                      {t("common.Status")}
                    </MenuItem>
                    {[
                      "Option 1",
                      "Option 2",
                      "Option 3",
                      "Option 4",
                      "Option 5",
                    ].map((so, index) => {
                      return (
                        <MenuItem
                          key={index}
                          value={index}
                          className={classes.dropDownItem}
                        >
                          {so}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                className={clsx(
                  classes.dFlex,
                  classes.flexWrap,
                  classes.spaceBetween
                )}
              >
                <Button
                  className={clsx(
                    classes.btn,
                    classes.btnNohover,
                    classes.noBorder,
                    classes.link,
                    classes.textCapitalize,
                    "link"
                  )}
                  onClick={() =>
                    setDialogType({
                      type: "changePwd",
                      data: {
                        title: t(
                          "settings.accountSettings.fixedComDetails.btnChangePwd"
                        ),
                      },
                    })
                  }
                  startIcon={<UnLockIcon />}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>
                    {t("settings.accountSettings.fixedComDetails.btnChangePwd")}
                  </>
                </Button>
                <Button
                  className={clsx(
                    classes.btn,
                    classes.btnNohover,
                    classes.noBorder,
                    classes.link,
                    classes.textCapitalize,
                    "link"
                  )}
                  onClick={() =>
                    setDialogType({
                      type: "verifyPhone",
                      data: {
                        title: t(
                          "settings.accountSettings.fixedComDetails.btnVerifyNumber"
                        ),
                      },
                    })
                  }
                  startIcon={<MdMobileFriendly />}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>
                    {t(
                      "settings.accountSettings.fixedComDetails.btnVerifyNumber"
                    )}
                  </>
                </Button>
                <Button
                  className={clsx(
                    classes.btn,
                    classes.btnNohover,
                    classes.noBorder,
                    classes.link,
                    classes.textCapitalize,
                    "link"
                  )}
                  onClick={() =>
                    setDialogType({
                      type: "verifyEmail",
                      data: {
                        title: t(
                          "settings.accountSettings.fixedComDetails.btnVerifyEmail"
                        ),
                      },
                    })
                  }
                  startIcon={<MdOutlineMarkEmailRead />}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>
                    {t(
                      "settings.accountSettings.fixedComDetails.btnVerifyEmail"
                    )}
                  </>
                </Button>
              </Grid>
              <Grid item xs={12} className={classes.justifyContentEnd}>
                <Button
                  className={clsx(
                    classes.mt5,
                    classes.btn,
                    classes.btnRounded,
                    "saveFixedDetails"
                  )}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  onClick={handleSave}
                >
                  <>{t("settings.accountSettings.fixedComDetails.btnUpdate")}</>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
      {RenderDialog()}
    </>
  );
};

export default Form_CompanyDetails;
