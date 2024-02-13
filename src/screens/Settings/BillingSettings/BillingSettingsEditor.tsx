import React, { useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import Toast from "../../../components/Toast/Toast.component";
import { useSelector } from "react-redux";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { BsQuestionCircle } from "react-icons/bs";
import { BiCreditCard } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import {
  BillingErrorTypes,
  BillingInfoValuesTypes,
  CardDetailsTypes,
} from "../../../Models/Settings/BillingSettings";
import { ERROR_TYPE } from "../../../helpers/Types/common";
import { IsNumberField } from "../../../helpers/Utils/Validations";

const BillingSettingsEditor = ({ classes }: any) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  const [cardDetails, setCardDetails] = useState<CardDetailsTypes>({
    CardNumber: "",
    ExpMonth: "",
    ExpYear: "",
    SecurityCode: "",
    Id: "",
  });
  const [billingInfoValues, setBillingInfoValues] =
    useState<BillingInfoValuesTypes>({
      CompanyName: "",
      ContactName: "",
      Cellphone: "",
      Phone: "",
      EmailForInvoices: "",
      Address: "",
      City: "",
      Zip: "",
      Country: "",
      CompRegNumber: "",
      InvoiceLang: "",
    });

  const [errors, setErrors] = useState<BillingErrorTypes>({
    CompanyName: "",
    ContactName: "",
    Cellphone: "",
    Phone: "",
    EmailForInvoices: "",
    Address: "",
    City: "",
    Zip: "",
    Country: "",
    CompRegNumber: "",
    InvoiceLang: "",
    CardNumber: "",
    ExpMonth: "",
    ExpYear: "",
    SecurityCode: "",
    Id: "",
  });

  const [addCardDialog, setAddCardDialog] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);

  const handleChange = (e: any) => {
    setBillingInfoValues({
      ...billingInfoValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeCardDetails = (e: any) => {
    !!errors?.[e?.target?.name] &&
      setErrors({ ...errors, [e.target.name]: "" });
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveCard = () => {
    if (isValidCardPayload()) {
      //saveCardAPICall
    }
  };

  const handleSaveBillingInfo = () => {
    if (isValidBillingPayload()) {
      //saveBillingInfoAPICall
    }
  };

  const isValidBillingPayload = () => {
    let tempErrors = { ...errors };
    let isValid = true;

    setErrors({ ...tempErrors });

    return isValid;
  };

  const isValidCardPayload = () => {
    let tempErrors = { ...errors };
    let isValid = true;

    if (!errors.CardNumber) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        CardNumber: t("settings.billingSettings.errors.invalidCardNum"),
      };
    }
    if (!errors.ExpMonth) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        ExpMonth: t("settings.billingSettings.errors.invalidMonth"),
      };
    }
    if (!errors.ExpYear) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        ExpYear: t("settings.billingSettings.errors.invalidYear"),
      };
    }
    if (!errors.SecurityCode) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        SecurityCode: t("settings.billingSettings.errors.invalidCvv"),
      };
    }
    if (!errors.Id) {
      isValid = false;
      tempErrors = {
        ...tempErrors,
        Id: t("settings.billingSettings.errors.invalidId"),
      };
    }

    setErrors({ ...tempErrors });

    return isValid;
  };

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const FormBillingInformation = () => (
    <Box
      className={"settingsWrapper"}
    >
      <Title
        Text={t("settings.billingSettings.titleBillingInfo")}
        classes={classes}
        ContainerStyle={{
          padding: `6px ${isRTL ? "14.69px" : 0} 5px ${isRTL ? 0 : "14.69px"}`,
        }}
      />
      <Box className={"formContainer"}>
        <Grid container className={"form"}>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>
                {t("settings.accountSettings.fixedComDetails.fields.compName")}
              </>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="CompanyName"
              value={billingInfoValues.CompanyName}
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
              value={billingInfoValues.ContactName}
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
              <>{t("common.address")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="Address"
              value={billingInfoValues.Address}
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
              value={billingInfoValues.City}
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
              value={billingInfoValues.Zip}
              onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("common.country")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="Country"
              value={billingInfoValues.Country}
              // onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("common.telephone")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="Cellphone"
              value={billingInfoValues.Cellphone}
              onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("settings.accountSettings.fixedComDetails.fields.mobile")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="Phone"
              value={billingInfoValues.Phone}
              onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
              error={!!errors.Phone}
            />
            {!!errors.Phone && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.Phone}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("settings.billingSettings.fields.compRegNumber")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="CompRegNumber"
              value={billingInfoValues.CompRegNumber}
              onKeyPress={IsNumberField}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
              error={!!errors.CompRegNumber}
            />
            {!!errors.CompRegNumber && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.CompRegNumber}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("settings.billingSettings.fields.invoiceEmail")}</>
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              name="EmailForInvoices"
              value={billingInfoValues.EmailForInvoices}
              onChange={handleChange}
              className={clsx(classes.textField, classes.minWidth252)}
              error={!!errors.EmailForInvoices}
            />
            {!!errors.EmailForInvoices && (
              <Typography className={clsx(classes.errorText, classes.f14)}>
                {errors.EmailForInvoices}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
            <Typography>
              <>{t("settings.billingSettings.fields.invoiceLang")}</>
            </Typography>
            <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
              <Select
                variant="standard"
                autoWidth
                value={billingInfoValues.InvoiceLang}
                IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                MenuProps={{
									PaperProps: {
										style: {
											direction: isRTL ? 'rtl' : 'ltr'
										},
									},
								}}
                name="InvoiceLang"
                onChange={(e: SelectChangeEvent) => handleChange(e)}
              >
                <MenuItem value="" className={classes.dropDownItem}>{t("common.Status")}</MenuItem>
                {["עברית", "English"].map((so, index) => {
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
              onClick={() => setAddCardDialog(true)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              <>{t("settings.billingSettings.btnAddCard")}</>
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
              onClick={handleSaveBillingInfo}
            >
              <>{t("settings.billingSettings.btnUpdate")}</>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const RenderAddCardDialog = () => (
    <BaseDialog
      classes={classes}
      title={t("settings.billingSettings.btnAddCard")}
      open={addCardDialog}
      onConfirm={handleSaveCard}
      onClose={() => {
        setAddCardDialog(false);
      }}
      onCancel={() => {
        setAddCardDialog(false);
      }}
    >
      <Grid container className={classes.addCardForm} spacing={2}>
        <Grid item xs={12} className={"textBoxWrapper"}>
          <Typography>
            <>{t("settings.billingSettings.fields.cardNumber")}</>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="CardNumber"
            value={cardDetails.CardNumber}
            onChange={handleChangeCardDetails}
            className={clsx(classes.textField, classes.minWidth252)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <BiCreditCard size={20} />
                </InputAdornment>
              ),
            }}
            error={!!errors.CardNumber}
          />
          {!!errors.CardNumber && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.CardNumber}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6} className={"textBoxWrapper"}>
          <Typography>
            <>{t("settings.billingSettings.fields.expMonth")}</>
          </Typography>
          <FormControl
            className={classes.formControl}
            style={{ width: "100%", maxHeight: 40 }}
            error={!!errors.ExpMonth}
          >
            <Select
              variant="standard"
              autoWidth
              value={cardDetails.ExpMonth}
              name="ExpMonth"
              onChange={(e: SelectChangeEvent) => handleChangeCardDetails(e)}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 270,
                    direction: isRTL ? 'rtl' : 'ltr'
                  },
                },
              }}
            >
              {Array.from({ length: 12 }, (v, i) => (
                <MenuItem
                  key={`itemM${i}`}
                  value={1 + i}
                  className={classes.dropDownItem}
                >
                  {1 + i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!!errors.ExpMonth && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.ExpMonth}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6} className={"textBoxWrapper"}>
          <Typography>
            <>{t("settings.billingSettings.fields.expYear")}</>
          </Typography>
          <FormControl
            className={classes.formControl}
            style={{ width: "100%", maxHeight: 40 }}
            error={!!errors.ExpYear}
          >
            <Select
              variant="standard"
              autoWidth
              value={cardDetails.ExpYear}
              name="ExpYear"
              onChange={(e: any) => handleChangeCardDetails(e)}
              IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 270,
                    direction: isRTL ? 'rtl' : 'ltr'
                  },
                },
              }}
            >
              {Array.from({ length: 50 }, (v, i) => (
                <MenuItem
                  key={`itemY${i}`}
                  value={new Date().getFullYear() + i}
                  className={classes.dropDownItem}
                >
                  {new Date().getFullYear() + i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!!errors.ExpYear && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.ExpYear}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} className={"textBoxWrapper"}>
          <Typography>
            <>{t("settings.billingSettings.fields.secCode")}</>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="SecurityCode"
            value={cardDetails.SecurityCode}
            onChange={handleChangeCardDetails}
            className={clsx(classes.textField, classes.minWidth252)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <BsQuestionCircle size={20} />
                </InputAdornment>
              ),
            }}
            error={!!errors.SecurityCode}
          />
          {!!errors.SecurityCode && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.SecurityCode}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} className={"textBoxWrapper"}>
          <Typography>
            <>{t("settings.billingSettings.fields.id")}</>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="Id"
            value={cardDetails.Id}
            onChange={handleChangeCardDetails}
            className={clsx(classes.textField, classes.minWidth252)}
            error={!!errors.Id}
          />
          {!!errors.Id && (
            <Typography className={clsx(classes.errorText, classes.f14)}>
              {errors.Id}
            </Typography>
          )}
        </Grid>
      </Grid>
    </BaseDialog>
  );

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="billingSettings"
      classes={classes}
      containerClass={classes.management}
    >
      {toastMessage && renderToast()}
      <Box className={classes.settingsContainer}>
        <Box className="head">
          <Title Text={t("settings.billingSettings.title")} classes={classes} />
        </Box>
        <Box className={"containerBody"}>{FormBillingInformation()}</Box>
      </Box>
      {RenderAddCardDialog()}
    </DefaultScreen>
  );
};

export default BillingSettingsEditor;
