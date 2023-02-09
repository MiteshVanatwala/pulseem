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
import { DataAnalysis, UnLockIcon } from "../../../assets/images/settings";
import { Title } from "../../../components/managment/Title";
import { DateField } from "../../../components/managment";
import {
  IsNumberField,
  IsValidEmail,
} from "../../../helpers/Utils/Validations";
import {
  CompDtlPropTypes
} from "../../../Models/Settings/CompanyDetails";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import useCore from "../../../helpers/hooks/Core";
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { resetTwoFA, update2FASettings } from "../../../redux/reducers/AccountSettingsSlice";
import { useSearchParams } from 'react-router-dom';
import ChangePassword from "./Password/ChangePassword";


const FORM_COMPANY_DETAILS = ({
  setToastMessage,
  ToastMessages,
  Settings,
  OnUpdate,
  SetVerification
}: CompDtlPropTypes) => {
  const { t } = useTranslation();
  const { classes } = useCore();
  const { isRTL } = useSelector((state: any) => state.core);
  const { twoFAUpdated } = useSelector((state: any) => state?.accountSettings);
  const dispatch = useDispatch();

  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [companyDetails, setCompanyDetails] = useState<AccountSettings>({} as AccountSettings);
  const [searchParams, setSearchParams] = useSearchParams();

  const [errors, setErrors] = useState<AccountSettings>({
    CompanyName: "",
    ContactName: "",
    BirthDate: "",
    Telephone: "",
    CellPhone: "",
    Email: "",
    Address: "",
    City: "",
    ZipCode: null,
    TwoFactorAuthTestMethodID: null
  } as AccountSettings);

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
    if (!companyDetails.CellPhone) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CellPhone: t("settings.accountSettings.fixedComDetails.errors.reqMobile"),
      };
    } else if (
      companyDetails.CellPhone.length > 16 ||
      companyDetails.CellPhone.length < 9
    ) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CellPhone: t(
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

  useEffect(() => {
    setCompanyDetails(Settings);
    if (Settings)
      handleQueryString2FA();
  }, [Settings]);

  useEffect(() => {
    if (twoFAUpdated !== undefined && twoFAUpdated?.Data !== '') {
      if (twoFAUpdated?.StatusCode === 201) {
        setToastMessage(twoFAUpdated?.Message === 'Activated' ? ToastMessages.TWO_FA_SAVED : ToastMessages.TWO_FA_SAVED_INACTIVE);
      }
      else {
        setToastMessage(ToastMessages.TWO_FA_NOT_SAVED);
      }
    }
  }, [twoFAUpdated])

  const on2FAUpdate = (req: AccountSettings) => {
    dispatch(update2FASettings(req)).then(() => {
      setCompanyDetails(req);
      OnUpdate(req, false);
      dispatch(resetTwoFA());
    })
  }

  const handleQueryString2FA = () => {
    if (searchParams.has('2fa') && Settings?.SubAccountId > 0 && !Settings.TwoFactorAuthEnabled) {
      searchParams.delete('2fa');
      setSearchParams(searchParams);
      const req = { ...companyDetails, TwoFactorAuthEnabled: true };
      setCompanyDetails(req);
      on2FAUpdate(req);
    }
  }

  const handleChange = (e: any, name = "") => {
    //@ts-ignore
    !!errors?.[e?.target?.name] &&
      setErrors({ ...errors, [e.target.name]: "" });
    if (name === "TwoFactorAuth") {
      const req = {
        ...companyDetails,
        TwoFactorAuthEnabled: !!!companyDetails.TwoFactorAuthEnabled,
      };
      on2FAUpdate(req);

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
  const handleSave = () => {
    if (isValidPayload()) {
      OnUpdate(companyDetails, true);
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

  const handleTwoFactorOption = (e: any) => {
    const req = { ...companyDetails, TwoFactorAuthOptionID: e?.target?.value };
    setCompanyDetails(req);
    on2FAUpdate(req);
  }

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
            padding: `6px ${isRTL ? "14.69px" : 0} 5px ${isRTL ? 0 : "14.69px"
              }`,
          }}
        />
        <Box className={"formContainer"}>
          <img src={DataAnalysis} className={'svg_data_analysis'} alt="" width="225" height="155" style={{
            top: 121,
            right: isRTL ? 'auto' : '93.14px',
            left: isRTL ? '93.14px' : 'auto',
            position: 'absolute',
            transform: 'scaleX(1)'
          }} />
          {/* <ILLUSTRATION_DATA_ANALYSIS className={"svg_data_analysis"} /> */}
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
                name="Telephone"
                value={companyDetails.Telephone}
                onKeyPress={IsNumberField}
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
                name="CellPhone"
                value={companyDetails.CellPhone}
                onKeyPress={IsNumberField}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.CellPhone}
              />
              {!!errors.CellPhone && (
                <Typography className={clsx(classes.errorText, classes.f14)}>
                  {errors.CellPhone}
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
                name="ZipCode"
                value={companyDetails.ZipCode === 0 ? '' : companyDetails.ZipCode}
                onKeyPress={IsNumberField}
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
                      checked={companyDetails.TwoFactorAuthEnabled === true}
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
                  style={{ width: "100%", maxHeight: 40, paddingInlineStart: 10 }}
                >
                  <Select
                    disabled={!companyDetails.TwoFactorAuthEnabled}
                    autoWidth
                    value={companyDetails.TwoFactorAuthOptionID ?? 202}
                    style={{
                      maxHeight: 40,
                      overflow: "hidden",
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                    name="TwoFactorAuthOptionID"
                    onChange={(e: any) => { handleTwoFactorOption(e) }}
                  >
                    {[
                      { name: t("settings.accountSettings.auth.everyDay"), value: 101 },
                      { name: t("settings.accountSettings.auth.everyTwoWeeks"), value: 202 }
                    ].map((so, index) => {
                      return (
                        <MenuItem
                          key={so.value}
                          value={so.value}
                          className={classes.dropDownItem}
                        >
                          {so.name}
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
                    setShowChangePassword(true)
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
                    SetVerification('cellphone')
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
                    SetVerification('email')
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
      {showChangePassword && <ChangePassword
        SetToast={setToastMessage}
        IsOpen={showChangePassword}
        OnClose={() => setShowChangePassword(false)}
      />
      }
    </>
  );
};

export default FORM_COMPANY_DETAILS;
