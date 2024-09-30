import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IoIosArrowDown } from 'react-icons/io';
import { IsNumberField } from "../../../helpers/Utils/Validations";
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BillingAccount } from '../../../Models/Product/BillingAccount';
import { BillingErrorTypes } from "../../../Models/Settings/BillingSettings";
import { Box, Button, FormControl, Grid, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { getAccountBilling, updateAccountBilling } from '../../../redux/reducers/BillingSlice';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { Loader } from '../../../components/Loader/Loader';
import Toast from '../../../components/Toast/Toast.component';


const BillingDetails = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispacth = useDispatch();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);
  const { billing } = useSelector((state: any) => state.billing);

  const [toastMessage, setToastMessage] = useState<any | never>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return toastMessage && <Toast customData={toastMessage} data={null} />;
  };

  const [billingInfoValues, setBillingInfoValues] = useState<BillingAccount>({
    CompanyName: "",
    ContactName: "",
    CellPhone: "",
    OfficePhoneNumber: "",
    CompanyNameForInvoice: "",
    StreetAndNumber: "",
    City: "",
    ZipCode: "",
    Country: "",
    CorporationNumber: "",
    BillingLanguage: '-1',
    Email: ""
  });

  const [errors, setErrors] = useState<BillingErrorTypes>({
    CompanyName: "",
    EmailForInvoices: "",
    CompRegNumber: ""
  });

  const getData = async () => {
    await dispacth(getAccountBilling());
    setShowLoader(false);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (billing && billing !== null && billing?.StatusCode === 201) {
      setBillingInfoValues(billing?.Data);
    }
  }, [billing])

  const onBeforeUpdate = (e: any) => {
    if (e.target.name === 'CompanyName') {
      setErrors({ ...errors, CompanyName: '' });
    }
    if (e.target.name === 'CorporationNumber') {
      setErrors({ ...errors, CompRegNumber: '' });
    }
    if (e.target.name === 'Email') {
      setErrors({ ...errors, EmailForInvoices: '' });
    }
    setBillingInfoValues({
      ...billingInfoValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveBillingInfo = async () => {
    setShowLoader(true);
    if (isValidBillingPayload()) {
      const response = await dispacth(updateAccountBilling(billingInfoValues)) as any;

      switch (response?.payload?.StatusCode) {
        case 201: {
          setToastMessage({ severity: 'success', color: 'success', message: t('settings.accountSettings.savedSuccessfuly'), showAnimtionCheck: false } as any);
          break;
        }
        case 402: {
          setToastMessage({ severity: 'error', color: 'error', message: t('campaigns.newsLetterEditor.errors.generalError'), showAnimtionCheck: false } as any);
          break;
        }
        case 406: {
          setToastMessage({ severity: 'error', color: 'error', message: t('common.requiredField'), showAnimtionCheck: false } as any);
          break;
        }
        case 401: {
          logout();
          break;
        }
      }
    }
    setShowLoader(false);
  };

  const isValidBillingPayload = () => {
    let isValid = true;
    const tempErrors = { ...errors };

    if (!billingInfoValues?.CompanyName || billingInfoValues?.CompanyName === '') {
      tempErrors.CompanyName = t('common.requiredField');
      isValid = false;
    }
    if (!billingInfoValues?.CorporationNumber || billingInfoValues?.CorporationNumber === '') {
      tempErrors.CompRegNumber = t('common.requiredField');
      isValid = false;
    }
    if (!billingInfoValues?.Email || billingInfoValues?.Email === '') {
      tempErrors.EmailForInvoices = t('common.requiredField');
      isValid = false;
    }

    setErrors(tempErrors)

    return isValid;
  };

  return <Box style={{ position: 'relative' }}>
    <Loader isOpen={showLoader} showBackdrop={false} />
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Typography>
          <>
            {t("settings.accountSettings.fixedComDetails.fields.compName")}
          </>
        </Typography>
        <TextField
          name="CompanyName"
          value={billingInfoValues?.CompanyName}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252, errors.CompanyName !== '' && classes.error)}
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
          name="ContactName"
          value={billingInfoValues?.ContactName}
          onChange={onBeforeUpdate}
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
          name="StreetAndNumber"
          value={billingInfoValues?.StreetAndNumber}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
        <Typography>
          <>{t("common.city")}</>
        </Typography>
        <TextField
          name="City"
          value={billingInfoValues?.City}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
        <Typography>
          <>{t("common.zip")}</>
        </Typography>
        <TextField
          name="ZipCode"
          value={billingInfoValues?.ZipCode}
          onKeyPress={IsNumberField}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
        <Typography>
          <>{t("common.country")}</>
        </Typography>
        <TextField
          name="Country"
          value={billingInfoValues?.Country}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
        <Typography>
          <>{t("common.telephone")}</>
        </Typography>
        <TextField
          name="CellPhone"
          value={billingInfoValues?.CellPhone}
          onKeyPress={IsNumberField}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
        <Typography>
          <>{t("settings.accountSettings.fixedComDetails.fields.mobile")}</>
        </Typography>
        <TextField
          name="OfficePhoneNumber"
          value={billingInfoValues?.OfficePhoneNumber}
          onKeyPress={IsNumberField}
          onChange={onBeforeUpdate}
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
          name="CorporationNumber"
          value={billingInfoValues?.CorporationNumber}
          onKeyPress={IsNumberField}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252, errors.CompRegNumber !== '' && classes.error)}
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
          name="Email"
          value={billingInfoValues?.Email}
          onChange={onBeforeUpdate}
          className={clsx(classes.textField, classes.minWidth252, errors.EmailForInvoices !== '' && classes.error)}
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
            autoWidth
            value={billingInfoValues?.BillingLanguage}
            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
            MenuProps={{
              PaperProps: {
                style: {
                  direction: isRTL ? 'rtl' : 'ltr'
                },
              },
            }}
            name="BillingLanguage"
            onChange={(e: any) => onBeforeUpdate(e)}
          >
            <MenuItem value={-1} className={classes.dropDownItem} disabled={true}>{t("common.select")}</MenuItem>
            {[t('languages.langCodes.hebrew'), t('languages.langCodes.english')].map((so, index) => {
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
    </Grid>
    <Box className={clsx(classes.dFlex, classes.w100)}>
      <Button
        className={clsx(
          classes.mt5,
          classes.btn,
          classes.btnRounded,
          "saveFixedDetails"
        )}
        style={{ marginRight: isRTL && 'auto', marginLeft: !isRTL ? 'auto' : 0 }}
        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        onClick={handleSaveBillingInfo}
      >
        <>{t("settings.billingSettings.btnUpdate")}</>
      </Button>
    </Box>
    {renderToast()}
  </Box>
}

export default BillingDetails;