import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@material-ui/core";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import {
  MdArrowBackIos,
  MdArrowForwardIos,
  MdMobileFriendly,
  MdOutlineMarkEmailRead,
} from "react-icons/md";
import { DataAnalysis, UnLockIcon } from "../../../assets/images/settings";
import { DateField } from "../../../components/managment";
import {
  IsNumberField,
  IsValidEmail,
} from "../../../helpers/Utils/Validations";
import {
  CompDtlPropTypes
} from "../../../Models/Settings/CompanyDetails";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { AccountSettings } from '../../../Models/Account/AccountSettings';
import { resetTwoFA, update2FASettings } from "../../../redux/reducers/AccountSettingsSlice";
import { useSearchParams } from 'react-router-dom';
import ChangePassword from "./Password/ChangePassword";
import { Title } from "../../../components/managment/Title";
import { PulseemFeatures } from "../../../model/PulseemFields/Fields";
import ILLUSTRATION_DATA_ANALYSIS from "../../../assets/images/settings/Illustration_data_Analysis";
import { IoIosArrowDown } from "react-icons/io";


const FORM_COMPANY_DETAILS = ({
  classes,
  setToastMessage,
  ToastMessages,
  Settings,
  OnUpdate,
  onShowTwoFactorAuth
}: CompDtlPropTypes) => {
  const { t } = useTranslation();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);
  const { accountSettings, accountFeatures } = useSelector((state: any) => state.common);
  const { twoFAUpdated } = useSelector((state: any) => state?.accountSettings);
  const dispatch = useDispatch();

  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [companyDetails, setCompanyDetails] = useState<AccountSettings | null>({} as AccountSettings);
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
    if (!companyDetails?.Email) {
      isValid = false;
      tempErrors = {
        ...errors,
        Email: t("settings.accountSettings.fixedComDetails.errors.reqEmail"),
      };
    } else if (!IsValidEmail(companyDetails?.Email)) {
      isValid = false;
      tempErrors = {
        ...errors,
        Email: t(
          "settings.accountSettings.fixedComDetails.errors.invalidEmail"
        ),
      };
    }
    if (!companyDetails?.CellPhone) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CellPhone: t("settings.accountSettings.fixedComDetails.errors.reqMobile"),
      };
    } else if (
      companyDetails?.CellPhone.length > 16 ||
      companyDetails?.CellPhone.length < 9
    ) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CellPhone: t(
          "settings.accountSettings.fixedComDetails.errors.invalidMobile"
        ),
      };
    }
    if (!companyDetails?.CompanyName) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CompanyName: t(
          "settings.accountSettings.fixedComDetails.errors.reqCompName"
        ),
      };
    }
    if (!companyDetails?.ContactName) {
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
    const newSettings = { ...Settings, TwoFactorAuthEnabled: accountFeatures?.indexOf(PulseemFeatures.DISABLE_TWO_FACTOR_AUTH) === -1 } as AccountSettings;
    setCompanyDetails(newSettings);
    if (Settings)
      handleQueryString2FA();
  }, [accountFeatures, Settings]);

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

  const on2FAUpdate = async (req: AccountSettings) => {
    const ures = await dispatch(update2FASettings(req));
    setCompanyDetails(req);
    OnUpdate(req, false);
    dispatch(resetTwoFA());

  }

  const handleQueryString2FA = () => {
    //@ts-ignore
    if (searchParams.has('2fa') && Settings?.SubAccountId > 0 && !Settings.TwoFactorAuthEnabled) {
      searchParams.delete('2fa');
      setSearchParams(searchParams);
      const req = { ...companyDetails, TwoFactorAuthEnabled: true };
      setCompanyDetails({ ...req } as AccountSettings);
      on2FAUpdate({ ...req } as AccountSettings);
    }
  }

  const handleChange = (e: any, name = "") => {
    //@ts-ignore
    !!errors?.[e?.target?.name] &&
      setErrors({ ...errors, [e.target.name]: "" });
    if (name === "TwoFactorAuth") {
      const req = {
        ...companyDetails,
        TwoFactorAuthEnabled: true,
      };
      on2FAUpdate({ ...req } as AccountSettings);

    } else if (name === "BirthDate") {
      setCompanyDetails({
        ...companyDetails,
        BirthDate: e,
      } as AccountSettings);
    } else {
      let actualValue = e?.target?.value;
      let trimValue = e?.target?.value.trim();
      setCompanyDetails({
        ...companyDetails,
        [e?.target?.name]:
          trimValue.length + 1 === actualValue?.length
            ? actualValue
            : trimValue,
      } as AccountSettings);
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
        classes={classes}
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
    setCompanyDetails({ ...req } as AccountSettings);
    on2FAUpdate({ ...req } as AccountSettings);
  }
  if (!accountSettings) {
    return <></>
  }
  return (
    <>
      <Box
        className={clsx("settingsWrapper", classes.pb25)}
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
        <Box className={"formContainer"} style={{ marginBottom: 25 }}>
          { windowSize !== 'xs' && <ILLUSTRATION_DATA_ANALYSIS className={"svg_data_analysis"} /> }
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
                value={companyDetails?.CompanyName}
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
                value={companyDetails?.ContactName}
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
              {/* @ts-ignore */}
              <DateField
                toolbarDisabled={false}
                classes={classes}
                value={companyDetails?.BirthDate}
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
                value={companyDetails?.Telephone}
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
                value={companyDetails?.CellPhone}
                onKeyPress={IsNumberField}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.CellPhone}
                inputProps={{ maxLength: 13 }}
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
                value={companyDetails?.Email}
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
                value={companyDetails?.Address}
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
                value={companyDetails?.City}
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
                value={companyDetails?.ZipCode === 0 ? '' : companyDetails?.ZipCode}
                onKeyPress={IsNumberField}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
              />
            </Grid>
          </Grid>
        </Box>
        <Title
          Text={t("settings.accountSettings.fixedComDetails.securitySettings")}
          classes={classes}
          isIcon={false}
          ContainerStyle={{
            padding: `6px ${isRTL ? "14.69px" : 0} 5px ${isRTL ? 0 : "14.69px"
              }`,
          }}
        />
        <Box className={clsx("formContainer", classes.pt20)}>
          <Grid container className={"form"} style={{ maxWidth: '100%' }}>
            {accountFeatures?.indexOf(PulseemFeatures.DISABLE_TWO_FACTOR_AUTH) === -1 && <Grid
              item
              xs={12}
              sm={3}
              md={4}
              className={clsx(windowSize !== 'xs' ? classes.dFlex : '', classes.mt3, classes.mr15, "selectWrapper")}
              alignItems="center"
            >
              <Typography>
                {t("settings.accountSettings.fixedComDetails.fields.enableTwoFactorAuth")}
              </Typography>
              <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                <Select
                  variant="standard"
                  autoWidth
                  value={`${companyDetails?.TwoFactorAuthOptionID ?? 202}`}
                  name="TwoFactorAuthOptionID"
                  onChange={(e: SelectChangeEvent) => { handleTwoFactorOption(e) }}
                  IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        direction: isRTL ? 'rtl' : 'ltr'
                      },
                    },
                  }}
                >
                  {[
                    { name: t("settings.accountSettings.auth.everyDay"), value: 101 },
                    { name: t("settings.accountSettings.auth.everyTwoWeeks"), value: 202 }
                  ].map((so) => {
                    return (
                      <MenuItem
                        key={so.value}
                        value={so.value}
                      >
                        {so.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>}
            {accountFeatures?.indexOf(PulseemFeatures.DISABLE_TWO_FACTOR_AUTH) === -1 && <Grid item xs={12} sm={6} md={6} className={classes.mt3} style={{ paddingInlineEnd: 25 }}>
              <Box style={{
                display: windowSize !== 'xs' ? 'flex' : 'block',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
                <Button
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.mr15,
                    {
                      [classes.mt10]: windowSize === 'xs',
                      [classes.f12]: windowSize === 'xs',
                    }
                  )}
                  onClick={() => {
                    onShowTwoFactorAuth('smsTFA');
                  }}
                  startIcon={<MdMobileFriendly className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>
                    {t(
                      "settings.accountSettings.2fa.addNumber"
                    )}
                  </>
                </Button>
                <Button
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    {
                      [classes.mt10]: windowSize === 'xs',
                      [classes.f12]: windowSize === 'xs',
                    }
                  )}
                  onClick={() => {
                    onShowTwoFactorAuth('emailTFA');
                  }}
                  startIcon={<MdOutlineMarkEmailRead className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
                  endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                  <>
                    {t(
                      "settings.accountSettings.2fa.addEmail"
                    )}
                  </>
                </Button>
              </Box>
            </Grid>}
            <Grid
              item
              xs={12}
              className={clsx(
                classes.mt3,
                classes.dFlex,
                classes.flexWrap,
                classes.spaceBetween,
                classes.paddingSides10
              )}
            >
              <Button
                className={clsx(
                  // classes.btn,
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
            </Grid>
            <Grid item xs={12} className={classes.justifyContentEnd}>
              <Button
                variant='contained'
                size='medium'
                onClick={handleSave}
                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                className={clsx(
                  classes.mt5,
                  classes.btn,
                  classes.btnRounded,
                  "saveFixedDetails"
                )}>
                {/* @ts-ignore */}
                {t('settings.accountSettings.fixedComDetails.btnUpdate')}
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Box>
      {RenderDialog()}
      {showChangePassword && <ChangePassword
        Text={null}
        classes={classes}
        SetToast={setToastMessage}
        IsOpen={showChangePassword}
        OnClose={() => setShowChangePassword(false)}
      />
      }
    </>
  );
};

export default FORM_COMPANY_DETAILS;
