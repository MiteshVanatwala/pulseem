import clsx from "clsx";
import { Box, Button, Container, FormControl, Grid, MenuItem, TextField, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { StateType } from "../../Models/StateTypes";
import { IoIosArrowDown } from "react-icons/io";
import { Loader } from "../../components/Loader/Loader";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import Toast from "../../components/Toast/Toast.component";
import queryString from 'query-string';
import { setLanguage } from "../../redux/reducers/coreSlice";
import { useDispatch } from 'react-redux';
import i18n from "../../i18n";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { setCookie } from "../../helpers/Functions/cookies";
import EnImage from '../../assets/images/british.svg';
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import { IsValidEmail, IsValidOTP } from "../../helpers/Utils/Validations";
import { isValidPhoneNumber } from "libphonenumber-js";
import { reCAPTCHAKey } from "../../helpers/Constants";

const RemoveMyData = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { windowSize, isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [ showLoader, setLoader ] = useState(false);
  const [ toastMessage, setToastMessage ] = useState<any | never>(null);
  const [ activeStep, setActiveStep ] = useState(0);
  const [ emailOrPhoneNumber, setEmailOrPhoneNumber ] = useState<string>('a@b.com');
  const [ emailOrPhoneNumberError, setEmailOrPhoneNumberError ] = useState<string>('');
  const [ OTP, setOTP ] = useState<string>('');
  const [ OTPError, setOTPError ] = useState<string>('');
  const qs = queryString.parse(window.location.search);

  const changeLanguage = (value: any) => {
    setCookie('Culture', `${value}-${value === 'he' ? 'IL' : 'US'}`);
    i18n.changeLanguage(value);
    dispatch(setLanguage(value));
  }

  useEffect(() => {
    dispatch(setLanguage(qs?.culture || 'en'));
    i18n.changeLanguage('he-IL');
  }, []);

  useEffect(() => {
    i18n.changeLanguage(isRTL ? 'he-IL' : 'en-US');
  }, [isRTL]);

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const Step1 = () => {
    return <Box className={clsx(classes.pb25, classes.paddingInline25)}>
      <h3 className={clsx(classes.colrPrimary, classes.mt24, classes.mb8, classes.f30)}>
        {t('RemoveMyData.title')}
      </h3>
      <Box>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18, classes.mt24, classes.mb20)}>
            {t("RemoveMyData.insertEmailPhone")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <TextField
            type="text"
            variant="outlined"
            size="small"
            name="EmailOrPhoneNumber"
            value={emailOrPhoneNumber}
            placeholder={t("RemoveMyData.insertEmailPhonePlaceholder")}
            onChange={(event: any) => setEmailOrPhoneNumber(event.target.value)}
            className={clsx(classes.minWidth252, classes.f12, classes.w100)}
            error={!!emailOrPhoneNumberError}
            inputProps={{
              maxLength: 100,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!emailOrPhoneNumberError && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {emailOrPhoneNumberError}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  }

  const Step2 = () => {
    return <Box className={clsx(classes.pb25, classes.paddingInline25)}>
      <h3 className={clsx(classes.colrPrimary, classes.mt24, classes.mb8, classes.f30)}>
        {t('RemoveMyData.enterOTP')}
      </h3>
      <Box>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18, classes.mt24, classes.mb20)}>
            {t("RemoveMyData.enterOTPPlaceholder")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <TextField
            type="number"
            variant="outlined"
            size="small"
            name="enterOTP"
            value={OTP}
            placeholder={t("RemoveMyData.enterOTP")}
            onChange={(event: any) => IsValidOTP(event.target.value) && setOTP(event.target.value)}
            className={clsx(classes.minWidth252, classes.f12, classes.w100)}
            error={!!OTPError}
            inputProps={{
              maxLength: 6,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!OTPError && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {OTPError}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  }

  const Step3 = () => {
    return <Box className={clsx(classes.pb25)}>
      <h3 className={clsx(classes.f22, isRTL ? classes.textRight : classes.textLeft, windowSize !== 'xs' ? classes.paddingInline10 : '')}>
        {t('RemoveMyData.eraseDataConfirmation')}
      </h3>
      <Box className={clsx(isRTL ? classes.textRight : classes.textLeft)}>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline10 : '')}>
          <Typography className={clsx(classes.f18, classes.mb20)}>
            {t("RemoveMyData.eraseDataDescription1")}
          </Typography>
          
          <Typography className={clsx(classes.f18, classes.mb20)}>
            {t("RemoveMyData.eraseDataDescription2")}
          </Typography>
          
          <Typography className={clsx(classes.f18, classes.mb20)}>
            {t("RemoveMyData.eraseDataDescription3")}
          </Typography>
          
          <Typography className={clsx(classes.f18, classes.mb20)}>
            {t("RemoveMyData.eraseDataDescription4")}
          </Typography>
          
          <Typography className={clsx(classes.f18, classes.mb20)}>
            {t("RemoveMyData.eraseDataDescription5")}
          </Typography>
        </Box>
      </Box>
    </Box>
  }

  const languageSelector = () => {
    return (
      <FormControl variant='standard' className={clsx(classes.SignUpLanguageDropdown, classes.bgWhite, classes.mb10)} style={{ direction: isRTL ? 'ltr' : 'rtl' }}>
        <Select
          variant="standard"
          value={isRTL ? 'he' : 'en'}
          name='TwoFactorAuthOptionID'
          onChange={(e: SelectChangeEvent) => changeLanguage(e.target.value)}
          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} style={{ right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto' }} />}
          MenuProps={{
            PaperProps: {
              style: {
                width: 100,
                maxHeight: 200,
                direction: isRTL ? 'rtl' : 'ltr'
              },
            },
          }}
          className={clsx(classes.SignUpLanguageDropdown, classes.pbt5)}
        >
          <MenuItem value={'he'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={25} src={IsraelImage} className={clsx(classes.paddingInline10)} alt={t('languages.langCodes.hebrew')} />
            <label>{t('languages.langCodes.hebrew')}</label>
          </MenuItem>

          <MenuItem value={'en'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={25} src={EnImage} className={clsx(classes.paddingInline10)} alt={t('languages.langCodes.english')} />
            <label>{t('languages.langCodes.english')}</label>
          </MenuItem>
        </Select>
      </FormControl>
    )
  }

  const authenticateUser = async (token: string) => {
    setLoader(true);
    const response = await PulseemReactInstance.post('GDPR/ForgetMe' ,{
      client: emailOrPhoneNumber,
      token: {
        Token: token
      }
    }).catch((error) => {
      setLoader(false);
      setToastMessage({ type: 'error', message: error?.response?.data?.message || t('RemoveMyData.errorMessage') });
    });
    setLoader(false);
    if (response?.status === 1) {
      setActiveStep(1);
      setEmailOrPhoneNumberError('');
      setEmailOrPhoneNumber('');
    } else if (response?.status === 2) {
      setToastMessage({ type: 'error', message: t('RemoveMyData.invalidCaptcha') });
    } else {
      setToastMessage({ type: 'error', message: response?.data?.message || t('RemoveMyData.errorMessage') });
    }
  }

  const validateOTP = async (token: string) => {
    setLoader(true);
    const response = await PulseemReactInstance.post('GDPR/ValidateOTP' ,{
      clientGuid: "",
      otp: OTP,
      token: {
        Token: token
      }
    }).catch((error) => {
      setLoader(false);
      setToastMessage({ type: 'error', message: error?.response?.data?.message || t('RemoveMyData.errorMessage') });
    });
    setLoader(false);
    if (response?.status === 1) {
      setActiveStep(2);
      setOTP('');
      setOTPError('');
    } else if (response?.status === 2) {
      setToastMessage({ type: 'error', message: t('RemoveMyData.invalidOTP') });
    } else {
      setToastMessage({ type: 'error', message: response?.data?.message || t('RemoveMyData.errorMessage') });
    }
  }

  const eraseClient = async (token: string) => {
    setLoader(true);
    const response = await PulseemReactInstance.post('GDPR/EraseClient' ,{
      clientGuid: "",
      token: {
        Token: token
      }
    }).catch((error) => {
      setLoader(false);
      setToastMessage({ type: 'error', message: error?.response?.data?.message || t('RemoveMyData.errorMessage') });
    });
    setLoader(false);
    if (response?.status === 1) {
      setActiveStep(0);
      setToastMessage({ severity: 'success', color: 'success', message: t('RemoveMyData.dataDeletionBegins'), showAnimtionCheck: false });
    } else if (response?.status === 2) {
      setToastMessage({ type: 'error', message: t('RemoveMyData.errorMessage') });
    } else {
      setToastMessage({ type: 'error', message: response?.data?.message || t('RemoveMyData.errorMessage') });
    }
  }

  const actionButtonClick = async (e: any) => {
    if (activeStep === 0) {
      if (!IsValidEmail(emailOrPhoneNumber) && !isValidPhoneNumber(emailOrPhoneNumber)) {
        setEmailOrPhoneNumberError(t('RemoveMyData.insertEmailPhone'));
        return;
      } else {
        setLoader(true);
        e.preventDefault();
        // @ts-ignore
        grecaptcha.ready(function() {
          // @ts-ignore
          grecaptcha.execute(reCAPTCHAKey, {action: 'submit'}).then(function(token: string) {
            console.log(token)
            authenticateUser(token);
          });
        });
      }
    } else if (activeStep === 1) {
      if (OTP.length < 6) {
        setOTPError(t('RemoveMyData.enterValidOTP'));
        return false;
      } else {
        // @ts-ignore
        grecaptcha.ready(function() {
          // @ts-ignore
          grecaptcha.execute(reCAPTCHAKey, {action: 'submit'}).then(function(token: string) {
            console.log(token)
            validateOTP(token);
          });
        });
      }
    } else if (activeStep === 2) {
      // @ts-ignore
      grecaptcha.ready(function() {
        // @ts-ignore
        grecaptcha.execute(reCAPTCHAKey, {action: 'submit'}).then(function(token: string) {
          console.log(token)
          eraseClient(token)
        });
      });
    }
  }

  return (
    <Container
      maxWidth='xl'
      className={clsx(classes.signupContainer)}
      style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: 'none' }}
    >
      <Box className={clsx(classes.posRelative)}>
        <Box className={clsx(classes.textCenter, 'signUpContainer')}>
          {languageSelector()}
          <Box className={clsx('widgetContainer', 'remove-my-data', classes.whiteBox, classes.textCenter)}>
            { activeStep === 0 && Step1() }
            { activeStep === 1 && Step2() }
            { activeStep === 2 && Step3() }
            <Box>
              <Grid container>
                <Grid item md={12} xs={12} className={clsx(classes.textCenter)}>
                  <Button
                    onClick={actionButtonClick}
                    className={clsx(classes.btn, classes.btnRounded, classes.f12, classes.redButton, classes.removeMyDataButton)}
                  >
                    {activeStep === 0 && t(`common.next`)}
                    {activeStep === 1 && t(`RemoveMyData.validateOTP`)}
                    {activeStep === 2 && t(`RemoveMyData.YesEraseData`)}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} zIndex={9999} />
      {renderToast()}
    </Container>
  );
};
export default RemoveMyData;