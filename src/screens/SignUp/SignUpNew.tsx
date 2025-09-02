import clsx from "clsx";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, MobileStepper, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import Turnstile from '../../components/Turnstile/Turnstile';
import { StateType } from "../../Models/StateTypes";
import { IoIosArrowDown, IoIosEye, IoIosEyeOff } from "react-icons/io";
import { CountryCodes, DefaultCountryCodeIsrael, DefaultCountryCodePoland, FieldOfInterest, lowerCaseLetters, numbers, specialLetters, upperCaseLetters } from "../../helpers/Constants";
import { MdDvr, MdKeyboardArrowDown, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdMobileFriendly, MdNotifications, MdOutlineAddShoppingCart, MdOutlineAutoMode, MdOutlineMarkEmailRead, MdOutlineWhatsapp } from "react-icons/md";
import { RenderHtml, useStylesBootstrapPasswordHint } from "../../helpers/Utils/HtmlUtils";
import { Loader } from "../../components/Loader/Loader";
import PasswordHint from "../Settings/AccountSettings/Password/PasswordHint";
import { ValidPassword } from "../Settings/AccountSettings/Password/Types";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import Toast from "../../components/Toast/Toast.component";
import queryString from 'query-string';
import { setLanguage } from "../../redux/reducers/coreSlice";
import { useDispatch } from 'react-redux';
import i18n from "../../i18n";
import { IsValidEmail, IsValidPhoneNumber } from "../../helpers/Utils/Validations";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { CompanyWebsiteRequest } from "../../Models/CompanyWebsite/CompanyWebSite";
import { actionURL } from "../../config";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { getCookie, setCookie } from "../../helpers/Functions/cookies";
import EnImage from '../../assets/images/british.svg';
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import PolandImage from "../../assets/images/poland-flag-icon.svg";
import { Autocomplete } from "@mui/material";
import { filter, first } from "lodash";
import { isValidPhoneNumber } from "libphonenumber-js";
import { getLanguageCulture } from "../../helpers/Utils/TextHelper";

const SignUpNew = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { windowSize, isRTL, language } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false);
  const qs = queryString.parse(window.location.search);
  // const isPolish = window.location.origin.includes('pulseem.pl');
  const isPolish = qs?.Culture === 'pl-PL';
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    emailId: qs?.emailid || '',
    phone: '',
    countryCode: isPolish ? DefaultCountryCodePoland : DefaultCountryCodeIsrael,
    cellPhone: '',
    userName: '',
    password: '',
    isPasswordVisible: false,
    confirmPassword: '',
    isConfirmPasswordVisible: false,
    companyName: '',
    fieldOfInterest: [],
    chkUpdate: false,
    chkPolicy: false,
    referralID: qs?.refId || ''
  });
  const [errors, setErrors] = useState({
    fullName: '',
    emailId: '',
    countryCode: '',
    cellPhone: '',
    userName: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    fieldOfInterest: '',
    chkPolicy: '',
    chkUpdate: '',
  });
  const [passwordValidation, setPasswordValidation] = useState<ValidPassword>({
    LowerChar: false,
    SpecialChar: false,
    UpperChar: false,
    PasswordLength: 0,
    NumberChar: false,
  } as ValidPassword);
  const [toastMessage, setToastMessage] = useState<any | never>(null);
  const [dialogType, setDialogType] = useState<{
    type: string;
  } | null>(null);
  const [showPasswordTip, setShowPasswordTip] = useState<boolean>(false);
  const [emailRequest, setEmailRequest] = useState<CompanyWebsiteRequest>({
    Email: null,
    AdName: null,
    AdSetName: null,
    CampaignName: null,
    GCLID: null,
    RequestUrl: null,
    UtmCampaign: null,
    UtmMedium: null,
    UtmSource: null,
    WebFormPosition: null,
    ReferralID: qs?.refId,
  });
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const passwordHintClasses = useStylesBootstrapPasswordHint();
  const cookieData = getCookie('Culture');

  const changeLanguage = (value: any) => {
    let langCode = '';
    if (value === 'he') langCode = 'IL';
    else if (value === 'en') langCode = 'US';
    else if (value === 'pl') langCode = 'PL';
    setCookie('Culture', `${value}-${langCode}`);
    i18n.changeLanguage(value);
    dispatch(setLanguage(value));
  }

  const getUserInfo = async () => {
    setLoader(true);
    const { data: { Message, Data }, status } = await PulseemReactInstance.get(`User/GetStepWiseAccountInfo/${qs?.id}`);
    setLoader(false);
    if (status === 200) {
      if (Message === 'Success') {
        let cellPhone = Data?.Mobile || '';
        let countryCode = isPolish ? DefaultCountryCodePoland : DefaultCountryCodeIsrael;
        if (cellPhone !== '') {
          const CellPhoneWithCode = cellPhone.split("-");
          countryCode = first(filter(CountryCodes, { code: `${CellPhoneWithCode[0]}` })) || countryCode;
          cellPhone = CellPhoneWithCode[1];
        }
        
        setUserDetails({
          ...userDetails,
          fullName: `${Data?.FirstName || ''} ${Data?.LastName || ''}`,
          emailId: qs?.emailid || Data?.Email || '',
          cellPhone: cellPhone || '',
          countryCode,
          companyName: Data?.Company || '',
          fieldOfInterest: Data?.ProductType?.split(',') || []
        })
      }
    } else {
      setDialogType({ type: 'internalError' });
    }
  }

  // Function to setup new email registration
  const setupNewEmail = async (emailId: string): Promise<{ success: boolean; id?: string; redirectLink?: string; message?: string }> => {
    try {
      const updatedEmailRequest = {
        ...emailRequest,
        Email: emailId,
        UtmSource: qs?.utm_source || null,
        UtmMedium: qs?.utm_medium || null,
        GCLID: qs?.GCLID || null,
        UtmCampaign: qs?.UtmCampaign || null,
        RequestUrl: qs?.RequestUrl || null,
        CampaignName: qs?.CampaignName || null,
        AdSetName: qs?.AdSetName || null,
        AdName: qs?.AdName || null,
        WebFormPosition: qs?.WebFormPosition || null
      };

      const response = await PulseemReactInstance.post(`User/SetupNewEmail`, updatedEmailRequest);
      const { Data = null, StatusCode = 200, Message = '' } = response?.data;

      const errorResponses: { [key: string]: string } = {
        "0": "Internal Error",
        "7": "Email Is Empty!",
        "8": "Email Is Not Valid",
        "13": "Email Already Exist"
      };

      switch (StatusCode) {
        case 201:
          return {
            success: true,
            redirectLink: Data?.RedirectLink || null
          };
        case 404:
          return {
            success: false,
            message: errorResponses[Data[0]] || 'Unknown Error'
          };
        case 401:
          return {
            success: false,
            message: 'invalid api'
          };
        default:
          return {
            success: false,
            message: Message || 'Unknown Error'
          };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network Error'
      };
    }
  };

  const saveUserInfo = async () => {
    let errorsTemp = errors;
    const payload: any = {
      FirstName: '',
      LastName: '',
      Mobile: '',
      Email: '',
      Phone: '',
      Company: '',
      ProductType: '',
      UserID: qs?.id
    }
    errorsTemp.fullName = userDetails.fullName ? '' : t('SignUp.fullNameRequired');
    errorsTemp.cellPhone = userDetails.cellPhone.trim() !== '' ? '' : t('SignUp.CellPhoneRequired');
    if (errorsTemp.cellPhone === '') {
      // @ts-ignore
      errorsTemp.cellPhone = !isValidPhoneNumber(userDetails.cellPhone, userDetails.countryCode.country) ? t('SignUp.InvalidCellPhone') : '';
    }
    errorsTemp.emailId = userDetails.emailId ? (IsValidEmail(`${userDetails.emailId}`) ? '' : t('common.invalidEmail')) : t('common.Required');

    setErrors({
      ...errors,
      ...errorsTemp
    });
    if (errorsTemp.fullName || errorsTemp.cellPhone || errorsTemp.emailId) {
      if (activeStep > 0) setActiveStep(0)
      return false;
    }
    else {
      const nameArr = userDetails.fullName.trim().split(' ');
      payload.FirstName = nameArr[0];
      payload.LastName = nameArr.slice(1).join(" ");
      payload.Mobile = `${userDetails.countryCode.code}-${Number(userDetails.cellPhone).toString()}`;
      payload.Email = userDetails.emailId;
    }

    if (activeStep === 1) {
      errorsTemp.companyName = userDetails.companyName ? '' : t('SignUp.BusinessNameRequired');
      errorsTemp.fieldOfInterest = userDetails.fieldOfInterest.length ? '' : t('SignUp.FieldOfInterestRequired');

      setErrors({
        ...errors,
        ...errorsTemp
      });

      if (errorsTemp.companyName || errorsTemp.fieldOfInterest) {
        return false;
      } else {
        if (userDetails.fieldOfInterest.length > 0) {
          const interests: any = [];
          userDetails.fieldOfInterest.map((item: any) => item !== '' && interests.push(item));
          payload.ProductType = interests.join(',');
        }
        payload.Company = userDetails.companyName;
      }
    } else {
      if (userDetails.fieldOfInterest.length > 0) {
        const interests: any = [];
        userDetails.fieldOfInterest.map((item: any) => item !== '' && interests.push(item));
        payload.ProductType = interests.join(',');
      }
      payload.Company = userDetails.companyName;
    }

    setLoader(true);

    // Only call setupNewEmail if we're on step 1 and don't have an ID in the URL parameters
    if (activeStep === 0 && !qs?.id) {
      const setupResult = await setupNewEmail(payload.Email);
      
      if (!setupResult.success) {
        setLoader(false);
        showMessage(setupResult.message || 'Error setting up email');
        return;
      }

      // Update payload with new ID if we got one
      if (setupResult.id) {
        payload.UserID = setupResult.id;
      }
    } else if (activeStep === 0 && qs?.id) {
      // If we have an ID in URL parameters, use that
      payload.UserID = qs.id;
    }

    // Continue with saving info
    const { data: { Message }, status } = await PulseemReactInstance.post(`User/SaveInfoAccounts`, payload);
    setLoader(false);
    if (status === 200) {
      if (Message === 'ok') {
        setActiveStep(activeStep + 1);
      } else if (Message === 'internalerror') {
        setDialogType({ type: 'internalError' });
      } else {
        showMessage(`SignUp.Message.${Message}`);
      }
    } else {
      setDialogType({ type: 'internalError' });
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    const defaultLang = qs?.Culture || cookieData;
    let langCode = 'he';
    if (defaultLang === 'he-IL') langCode = 'he';
    else if (defaultLang === 'en-US') langCode = 'en';
    else if (defaultLang === 'pl-PL') langCode = 'pl';
    changeLanguage(langCode);

    getUserInfo();
    if ((qs?.refId && qs?.refId !== '') && ((!qs?.emailid || qs?.emailid === '') || !qs?.id)) {
      onInitRef().then(() => {
        setDialogType({ type: 'emailDialog' });
      });
    }
  }, []);

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

  const renderInterestIcon = (icon: string) => {
    switch (icon) {
      case FieldOfInterest[0]:
        return <MdOutlineMarkEmailRead className={clsx(classes.p5)} />;

      case FieldOfInterest[1]:
        return <MdMobileFriendly className={clsx(classes.p5)} />;

      case FieldOfInterest[2]:
        return <MdOutlineWhatsapp className={clsx(classes.p5)} />;

      case FieldOfInterest[3]:
        return <MdDvr className={clsx(classes.p5)} />;

      case FieldOfInterest[4]:
        return <MdOutlineAddShoppingCart className={clsx(classes.p5)} />;

      case FieldOfInterest[5]:
        return <MdNotifications className={clsx(classes.p5)} />;

      case FieldOfInterest[6]:
        return <MdOutlineAutoMode className={clsx(classes.p5)} />;

      default:
        return <></>;
    }
  }

  const showMessage = (message: string, type: string = 'error') => {
    setToastMessage({ severity: type, color: type, message: t(message), showAnimtionCheck: false });
  }

  const saveSignup = async () => {
    let errorsTemp = errors;
    errorsTemp.fullName = userDetails.fullName ? '' : t('SignUp.fullNameRequired');
    errorsTemp.cellPhone = userDetails.cellPhone ? '' : t('SignUp.CellPhoneRequired');
    errorsTemp.userName = userDetails.userName ? '' : t('SignUp.UserNameRequired');
    errorsTemp.password = '';
    errorsTemp.confirmPassword = userDetails.confirmPassword === '' ? t('SignUp.ConfirmPasswordRequired') : (userDetails.password === userDetails.confirmPassword ? '' : t("settings.changePassword.error.notMatch"));
    errorsTemp.companyName = userDetails.companyName ? '' : t('SignUp.BusinessNameRequired');
    errorsTemp.fieldOfInterest = userDetails.fieldOfInterest.length ? '' : t('SignUp.FieldOfInterestRequired');
    errorsTemp.chkPolicy = userDetails.chkPolicy ? '' : t('common.requiredField');
    errorsTemp.emailId = userDetails.emailId ? (IsValidEmail(`${userDetails.emailId}`) ? '' : t('common.invalidEmail')) : t('common.Required');

    if (!turnstileToken) {
      showMessage('SignUp.pleaseVerifyCaptcha');
      return;
    }

    if (userDetails.password && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
      errorsTemp.password = t('SignUp.InvalidPassword');
    } else if (!userDetails.password) {
      errorsTemp.password = t('SignUp.PasswordRequired');
    }
    setErrors({
      ...errors,
      ...errorsTemp
    });

    if (!errorsTemp.fullName && !errorsTemp.cellPhone && !errorsTemp.userName && !errorsTemp.password && !errorsTemp.companyName && !errorsTemp.fieldOfInterest && !errorsTemp.chkPolicy && !errorsTemp.confirmPassword && !errorsTemp.emailId) {
      const nameArr = userDetails.fullName.trim().split(' ');
      setLoader(true);
      const interests: any = [];
      userDetails.fieldOfInterest.map((item: any) => item !== '' && interests.push(item));
      const { data: { Message }, status } = await PulseemReactInstance.post(`User/Signup`, {
        FirstName: nameArr[0],
        LastName: nameArr.slice(1).join(" "),
        Mobile: `${userDetails.countryCode.code.replace('+', '')}${Number(userDetails.cellPhone).toString()}`,
        Phone: `${userDetails.phone}`,
        UserName: userDetails.userName,
        Password: userDetails.password,
        Company: userDetails.companyName,
        Website: '',
        ActivityField: '',
        ProductType: interests.join(','),
        UserID: qs?.id,
        chkMailingApproval: userDetails.chkUpdate,
        Email: userDetails.emailId,
        ReferralID: qs?.refId,
        Culture: qs?.Culture || 'he-IL',
        TurnstileToken: turnstileToken,
      });
      setLoader(false);
      if (status === 200) {
        if (Message === 'ok') {
          // setDialogType({ type: 'confirmation' });
          setActiveStep(activeStep + 1);
          // @ts-ignore
          window?.dataLayer?.push({
            'event': 'formSubmission',
            'formType': 'Registraion Complete',
            'formPosition': 'Footer'
          });
        } else if (Message === 'internalerror') {
          setDialogType({ type: 'internalError' });
        } else {
          showMessage(`SignUp.Message.${Message}`);
        }
      } else {
        setDialogType({ type: 'internalError' });
      }
    }
  }

  const handleChange = (e: any) => {
    setUserDetails({
      ...userDetails,
      password: e?.target?.value.trim()
    });
    let trimValue = e?.target?.value.trim();
    const validPass = {
      LowerChar: !!trimValue?.match(lowerCaseLetters),
      SpecialChar: !!trimValue?.match(specialLetters),
      UpperChar: !!trimValue?.match(upperCaseLetters),
      PasswordLength: trimValue.length,
      NumberChar: !!trimValue?.match(numbers),
    } as ValidPassword;

    setPasswordValidation(validPass);
  };

  const sendEmail = async () => {
    setLoader(true);
    const { data: { Message }, status } = await PulseemReactInstance.post(`User/ResendEmail`, {
      UserID: qs?.id,
      Culture: qs?.Culture || 'he-IL',
    });
    setLoader(false);
    if (status === 200) {
      if (Message === 'Sent Email') {
        showMessage('SignUp.EmailSent', 'success');
      } else {
        showMessage('SignUp.EmailNotSent');
      }
    } else {
      showMessage('SignUp.EmailNotSent');
    }
  }

  const displayConfirmationPopup = () => ({
    title: t('SignUp.ConfirmationTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {RenderHtml(t('SignUp.ConfirmationMessage').replace(/{emailid}/g, userDetails.emailId))}
      </Typography>
    ),
    showDefaultButtons: false,
    renderButtons: () => (
      <Grid
        container
        spacing={2}
        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
      >
        <Grid item>
          <Button
            onClick={sendEmail}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}>
            {t('SignUp.ResendEmail')}
          </Button>
        </Grid>
      </Grid>
    )
  })

  const displayInternalErrorPopup = () => ({
    title: t('common.ErrorTitle'),
    showDivider: false,
    showDefaultButtons: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {RenderHtml(t('SignUp.Message.contactSupport'))}
      </Typography>
    ),
    onClose: () => setDialogType(null)
  })

  const keyPress = (e: any) => {
    if (e?.keyCode === 13) {
      handleConfirmEmailDialog()
    }
  }

  const displayEmailPopup = () => ({
    title: t('SignUp.typeEmailForSignUp'),
    showDivider: false,
    showDefaultButtons: false,
    disableBackdropClick: true,
    content: (
      <Box style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter, classes.mb15)}>
          {t('SignUp.typeEmailForSignUpDesc')}
        </Typography>
        <FormControl>
          <TextField
            onKeyDown={keyPress}
            id='txtEmailAddress'
            onFocus={(event: any) => {
              event.target.style.direction = isRTL && event.target.value === '' ? 'rtl' : 'ltr';
            }}
            onBlur={(event: any) => {
              event.target.style.direction = isRTL && event.target.value === '' ? 'rtl' : 'ltr';
            }}
            placeholder={t('SignUp.typeEmailForSignUp')}
            className={clsx(classes.pl5, classes.pr10, classes.textField, invalidEmail && classes.error)}
            onChange={(e: any) => {
              setInvalidEmail(false);
              const email = e?.target?.value;
              e.target.style.direction = isRTL && email === '' ? 'rtl' : 'ltr';
              setEmailRequest({ ...emailRequest, Email: email });
            }}
            value={emailRequest.Email}
            aria-describedby="component-helper-text"
          >
          </TextField>
          {invalidEmail && <FormHelperText style={{ color: 'red', textAlign: isRTL ? 'right' : 'left' }} id='component-helper-text'>{t('common.invalidEmail')}</FormHelperText>}
          <Button
            className={clsx(classes.mt15, classes.btn, classes.btnRounded)}
            style={{ width: 100, alignSelf: 'center' }}
            onClick={() => handleConfirmEmailDialog()}>{t('common.Send1')}</Button>
        </FormControl>
      </Box >
    ),
    onClose: () => {
      return false;
    },
    onCancel: () => {
      return false;
    }
  })

  const handleConfirmEmailDialog = async () => {
    if ((!emailRequest.Email || emailRequest.Email === '') || !IsValidEmail(emailRequest.Email)) {
      setInvalidEmail(true);
      return false;
    }

    setLoader(true);

    const response: any = await PulseemReactInstance.post(`User/SetupNewEmail`, emailRequest);
    const { Data = null, StatusCode = 200, Message = '' } = response?.data;

    const errorResponses: any = {
      "0": "Internal Error",
      "7": "Email Is Empty!",
      "8": "Email Is Not Valid",
      "13": "Email Already Exist"
    };
    

    switch (StatusCode) {
      case 201: {
        const urlObj = new URL(Data?.RedirectLink);
        urlObj.searchParams.delete("culture");

        const newUrl = urlObj.toString().replace(
          'https://www.pulseem.co.il',
          actionURL ? actionURL.replace('/Pulseem/', '') : ''
        );
        window.location.href = `${newUrl}&refId=${qs?.refId}&Culture=${getLanguageCulture(language)}`;
        break;
      }
      case 404: {
        alert(errorResponses[Data[0]])
        break;
      }
      case 401: {
        alert('invalid api');
        break;
      }
      default: {
        alert(Message);
        break;
      }
    }
    setLoader(false);
  }

  const onInitRef = async () => {
    setLoader(true);

    const response: any = await PulseemReactInstance.post(`User/CheckRef`, { RefferalID: qs?.refId });
    const { StatusCode = 200 } = response?.data;

    switch (StatusCode) {
      case 201: {
        setLoader(false);
        break;
      }
      case 406: {
        window.location.href = 'https://www.pulseem.co.il/';
        break;
      }
    }
    return;
  }
  const renderDialog = () => {
    const { type } = dialogType || {}
    let currentDialog: any = {};
    if (type === 'confirmation') {
      currentDialog = displayConfirmationPopup();
    } else if (type === 'internalError') {
      currentDialog = displayInternalErrorPopup();
    }
    else if (type === 'emailDialog') {
      currentDialog = displayEmailPopup();
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={classes.maxWidth540}
          classes={classes}
          open={dialogType}
          onCancel={() => setDialogType(null)}
          onClose={() => setDialogType(null)}
          renderButtons={currentDialog?.renderButtons || null}
          {...currentDialog}>
          {currentDialog?.content}
        </BaseDialog>
      )
    }
  }

  const Step1 = () => {
    return <Box className={clsx(classes.pb25)}>
      <h3 className={clsx(classes.colrPrimary, classes.mt24, classes.mb8, classes.f30)}>
        {t('SignUp.PersonalInfo')}
      </h3>
      <Box>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18)}>
            {t("SignUp.fullName")}
            <span className={clsx(classes.pl5, classes.colrPrimary)}>*</span>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="fullName"
            value={userDetails?.fullName}
            onChange={(event: any) => setUserDetails({
              ...userDetails,
              fullName: event.target.value
            })}
            className={clsx(classes.textField, classes.minWidth252)}
            error={!!errors.fullName}
            inputProps={{
              maxLength: 50,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!errors.fullName && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.fullName}
            </Typography>
          )}
        </Box>

        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Grid container className={clsx(classes.directionLTR)}>
            <Grid item md={4} xs={12}>
              <FormControl
                variant='standard'
                className={clsx(classes.selectInputFormControl, classes.SignUpCountryDropdown, classes.bgWhite, classes.mb10, classes.w100)} 
                style={{ borderRadius: 0, paddingTop: '0px', direction: 'ltr' }}
              >
                <Typography className={clsx(classes.f18, classes.mt24)}>
                  {t("SignUp.countryCode")}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <Autocomplete
                  disableClearable
                  value={userDetails?.countryCode}
                  multiple={false}
                  includeInputInList={true}
                  id="CountryCode"
                  options={CountryCodes}
                  disableCloseOnSelect
                  // @ts-ignore
                  onChange={(option, selected) => setUserDetails({...userDetails, countryCode: selected})}
                  getOptionLabel={(option) => `${option?.country} (${option?.code})`}
                  renderGroup={(option: any) => (
                    <MenuItem value={option} className={clsx(classes.cursorPointer, classes.directionLTR)}>
                      <label className={clsx(classes.paddingInline5)}>
                        {option?.country}&nbsp;({option?.code})
                      </label>
                    </MenuItem>
                  )}
                  renderOption={(props, option: any) => (
                    <MenuItem {...props} value={option} className={clsx(classes.cursorPointer, classes.directionLTR)}>
                      <label className={clsx(classes.paddingInline5)}>
                        {option?.country}&nbsp;({option?.code})
                      </label>
                    </MenuItem>
                  )}
                  style={{ 
                    direction: 'ltr',
                    paddingRight: '30px !important'
                  }}
                  renderInput={(params) => {
                    //@ts-ignore
                    return (<TextField
                      {...params}
                      color="primary" className={clsx(classes.textField, classes.w100)}
                    />)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={8} xs={12}>
              <Typography className={clsx(classes.f18, classes.mt24)}>
                {t("SignUp.CellPhone")}
                <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                name="CellPhone"
                value={userDetails?.cellPhone}
                onChange={(event: any) => IsValidPhoneNumber(event.target.value) && setUserDetails({
                  ...userDetails,
                  cellPhone: event.target.value
                })}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.cellPhone}
                inputProps={{
                  maxLength: 15,
                  style: {
                    textAlign: 'center'
                  }
                }}
              />
              {!!errors.cellPhone && (
                <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                  {errors.cellPhone}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18, classes.mt24)}>
            {t("common.Email")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <TextField
            type="email"
            variant="outlined"
            size="small"
            name="Email"
            value={userDetails?.emailId}
            onChange={(event: any) => setUserDetails({
              ...userDetails,
              emailId: event.target.value
            })}
            className={clsx(classes.textField, classes.minWidth252)}
            error={!!errors.emailId}
            disabled={!!qs?.emailid || false}
            inputProps={{
              maxLength: 100,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!errors.emailId && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.emailId}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  }

  const Step2 = () => {
    return <Box className={clsx(classes.pb25)}>
      <h3 className={clsx(classes.colrPrimary, classes.mt24, classes.mb8, classes.f30)}>
        {t('SignUp.BusinessDetail')}
      </h3>
      <Box>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18)}>
            {t("SignUp.BusinessName")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <TextField
            type="text"
            variant="outlined"
            size="small"
            name="CompanyName"
            value={userDetails?.companyName}
            onChange={(event: any) => setUserDetails({
              ...userDetails,
              companyName: event.target.value
            })}
            className={clsx(classes.textField, classes.minWidth252)}
            error={!!errors.companyName}
            inputProps={{
              maxLength: 100,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!errors.companyName && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.companyName}
            </Typography>
          )}
        </Box>

        <div className={clsx(classes.f18, classes.mt24)}>{t('SignUp.FieldOfInterestDesc')}</div>
        <Box className={clsx(classes.pt25)} style={{ marginBottom: 10 }}>
          {
            FieldOfInterest.map((interest) => {
              return <Button
                key={interest}
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.mr10,
                  classes.fieldOfInterestButton,
                  classes.mb10,
                  classes.f18,
                  classes.signUpFieldOfInterestButton,
                  {
                    [classes.dFlex]: windowSize === 'xs',
                    [classes.mt10]: windowSize === 'xs',
                    [classes.f12]: windowSize === 'xs',
                    "selected": userDetails.fieldOfInterest.find((item) => item === interest),
                  }
                )}
                onClick={() => {
                  setUserDetails({
                    ...userDetails,
                    // @ts-ignore
                    fieldOfInterest: userDetails.fieldOfInterest.find((item) => item === interest) ? userDetails.fieldOfInterest.filter(item => item !== interest) : [...userDetails.fieldOfInterest, interest]
                  })
                }}
                startIcon={renderInterestIcon(interest)}
              >
                {t(`SignUp.${interest}`)}
              </Button>
            })
          }
          {!!errors.fieldOfInterest && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.fieldOfInterest}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  }

  const Step3 = () => {
    return <Box className={clsx(classes.pb25)}>
      <h3 className={clsx(classes.colrPrimary, classes.mt24, classes.mb8, classes.f30)}>
        {t('SignUp.LoginDetails')}
      </h3>
      <Box>
        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18)}>
            {t("SignUp.UserName")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            name="UserName"
            value={userDetails?.userName}
            onChange={(event: any) => setUserDetails({
              ...userDetails,
              userName: event.target.value
            })}
            className={clsx(classes.textField, classes.minWidth252)}
            error={!!errors.userName}
            inputProps={{
              maxLength: 50,
              style: {
                textAlign: 'center'
              }
            }}
          />
          {!!errors.userName && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.userName}
            </Typography>
          )}
        </Box>

        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18, classes.mt24)}>
            {t("SignUp.Password")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <Box className={classes.posRelative}>
            <Tooltip
              TransitionComponent={Zoom}
              interactive={true}
              title={<PasswordHint
                Password={passwordValidation}
                classes={classes}
              />}
              arrow
              open={showPasswordTip}
              classes={passwordHintClasses}
            >
              <TextField
                autoFocus
                onFocus={() => setShowPasswordTip(true)}
                onBlur={() => setShowPasswordTip(false)}
                type={userDetails.isPasswordVisible ? "text" : "password"}
                variant="outlined"
                size="small"
                name="Password"
                value={userDetails?.password}
                onChange={handleChange}
                className={clsx(classes.textField, classes.minWidth252)}
                error={!!errors.password}
                inputProps={{ maxWidth: 50, style: { textAlign: 'center'}}}
                InputProps={{
                  endAdornment: (
                    <span onClick={() => setUserDetails({ ...userDetails, isPasswordVisible: !userDetails.isPasswordVisible })}>
                      {
                        userDetails.isPasswordVisible
                          ? <IoIosEye size={20} className={clsx(classes.posAbsolute, classes.p5, classes.cursorPointer, classes.passwordVisibilityToggle)} />
                          : <IoIosEyeOff size={20} className={clsx(classes.posAbsolute, classes.p5, classes.cursorPointer, classes.passwordVisibilityToggle)} />
                      }
                    </span>
                  ),
                  style: {
                    textAlign: 'center'
                  }
                }}
              />
            </Tooltip>
          </Box>
          {!!errors.password && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.password}
            </Typography>
          )}
        </Box>

        <Box className={clsx(windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Typography className={clsx(classes.f18, classes.mt24)}>
            {t("SignUp.PasswordVerification")}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </Typography>
          <Box>
            <TextField
              type={userDetails.isConfirmPasswordVisible ? "text" : "password"}
              variant="outlined"
              size="small"
              name="confirmPassword"
              value={userDetails?.confirmPassword}
              onChange={(event: any) => setUserDetails({
                ...userDetails,
                confirmPassword: event.target.value
              })}
              className={clsx(classes.textField, classes.minWidth252)}
              error={!!errors.confirmPassword}
              inputProps={{ maxWidth: 50, style: { textAlign: 'center'}}}
              InputProps={{
                endAdornment: (
                  <span onClick={() => setUserDetails({ ...userDetails, isConfirmPasswordVisible: !userDetails.isConfirmPasswordVisible })}>
                    {
                      userDetails.isConfirmPasswordVisible
                        ? <IoIosEye size={20} className={clsx(classes.posAbsolute, classes.p5, classes.cursorPointer, classes.passwordVisibilityToggle)} />
                        : <IoIosEyeOff size={20} className={clsx(classes.posAbsolute, classes.p5, classes.cursorPointer, classes.passwordVisibilityToggle)} />
                    }
                  </span>
                ),
                style: {
                  textAlign: 'center'
                }
              }}
            />
          </Box>
          {!!errors.confirmPassword && (
            <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
              {errors.confirmPassword}
            </Typography>
          )}
        </Box>

        <FormControl className={clsx(classes.mt24)}>
          <FormControlLabel
            control={
              <Checkbox
                checked={userDetails.chkUpdate}
                onChange={() => setUserDetails({ ...userDetails, chkUpdate: !userDetails.chkUpdate })}
                color="primary"
              />
            }
            className={clsx({
              [classes.textRight]: isRTL,
              [classes.textLeft]: !isRTL,
            })}
            style={{ alignItems: 'flex-start' }}
            label={<>
              <span className={classes.f18}>{RenderHtml(t('SignUp.UpdateTrainingContentCheckbox'))}</span>
              {!!errors.chkUpdate && (
                <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                  {errors.chkUpdate}
                </Typography>
              )}
            </>
            }
          />
        </FormControl>

        <FormControl className={classes.dBlock}>
          <FormControlLabel
            control={
              <Checkbox
                checked={userDetails.chkPolicy}
                onChange={() => setUserDetails({ ...userDetails, chkPolicy: !userDetails.chkPolicy })}
                color="primary"
              />
            }
            className={clsx({
              [classes.textRight]: isRTL,
              [classes.textLeft]: !isRTL,
            })}
            style={{ alignItems: 'flex-start' }}
            label={<>
              <span className={clsx(classes.paddingInline5, classes.colrPrimary, classes.f18)}>*</span>
              <span className={classes.f18}>{RenderHtml(t('SignUp.PrivacyPolicyCheckbox'))}</span>
              {!!errors.chkPolicy && (
                <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                  {errors.chkPolicy}
                </Typography>
              )}
            </>
            }
          />
        </FormControl>

        <Box className={clsx(classes.mt24, windowSize !== 'xs' ? classes.paddingInline30 : '')}>
          <Turnstile
            onVerify={(token) => {
              setTurnstileToken(token);
              setEmailRequest({
                ...emailRequest,
                TurnstileToken: token
              });
            }}
            theme={isRTL ? 'light' : 'dark'}
          />
        </Box>
      </Box>
    </Box>
  }

  const Step4 = () => {
    return <Box>
      <Typography style={{ fontSize: 80 }} className={clsx(classes.textCenter)}>😊</Typography>
      <Typography style={{ fontSize: 25 }} className={clsx(classes.textCenter)}>
        {t('SignUp.accountCreated')}
      </Typography>
      <MdKeyboardArrowDown size={35} className={clsx(classes.mt10, classes.mb10)} />
      <Typography style={{ fontSize: 18, wordBreak: 'break-word' }} className={clsx(classes.textCenter)}>
        {RenderHtml(t('SignUp.ConfirmationMessage').replace(/{emailid}/g, userDetails.emailId))}
      </Typography>
    </Box>
  }

  const languageSelector = () => {
    console.log('languageSelector', language);
    return (
      <FormControl variant='standard' className={clsx(classes.SignUpLanguageDropdown, classes.bgWhite, classes.mb10)} style={{ direction: isRTL ? 'ltr' : 'rtl' }}>
        <Select
          variant="standard"
          value={language}
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
          {
            !isPolish && (
              <MenuItem value={'he'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
                <img width={35} src={IsraelImage} alt={t('languages.langCodes.hebrew')} />
                <label>{t('languages.langCodes.hebrew')}</label>
              </MenuItem>
            )
          }

          <MenuItem value={'en'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={35} src={EnImage} alt={t('languages.langCodes.english')} />
            <label>{t('languages.langCodes.english')}</label>
          </MenuItem>
          
          <MenuItem value={'pl'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={35} src={PolandImage} alt={t('languages.langCodes.polish')} />
            <label>{t('languages.langCodes.polish')}</label>
          </MenuItem>
        </Select>
      </FormControl>
    )
  }

  const buttonNextIcon = () => {
    if (activeStep === 3) return <></>;
    return (
      <>
        <IconButton
          aria-label="fingerprint"
          color="secondary"
          className="previous"
          onClick={() => activeStep === 2 ? saveSignup() : saveUserInfo()}
          disabled={activeStep === 3}
          style={{
            left: isRTL ? '-40px' : 'initial',
            right: !isRTL ? '-40px' : 'initil'
          }}
        >
          { isRTL ? <MdKeyboardArrowLeft size={'5rem'} /> : <MdKeyboardArrowRight size={'5rem'} /> }
        </IconButton>
      </>
    )
  }

  const buttonPreviousIcon = () => {
    if (activeStep === 0 || activeStep === 3) return <></>;
    return (
      <>
        <IconButton
          aria-label="fingerprint"
          color="secondary"
          className="next"
          onClick={handleBack}
          disabled={activeStep === 0 || activeStep === 3}
          style={{
            left: !isRTL ? '-40px' : 'initial',
            right: isRTL ? '-40px' : 'initil'
          }}
        >
          { !isRTL ? <MdKeyboardArrowLeft size={'5rem'} /> : <MdKeyboardArrowRight size={'5rem'} /> }
        </IconButton>
      </>
    )
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
          <Box className={clsx('widgetContainer', classes.whiteBox, classes.textCenter)}>
            { activeStep === 0 && Step1() }
            { activeStep === 1 && Step2() }
            { activeStep === 2 && Step3() }
            { activeStep === 3 && Step4() }
            <Box>
              <Grid container>
                <Grid item md={6} xs={6} className={clsx(windowSize === 'xs' ? classes.textCenter : (isRTL ? classes.textRight : classes.textLeft))}>
                  {isRTL ? buttonNextIcon() : buttonPreviousIcon()}
                  {
                    activeStep !== 0 && activeStep !== 3 && (
                      <Button
                        onClick={handleBack}
                        disabled={activeStep === 0 || activeStep === 3}
                        className={clsx(classes.f22, classes.bold)}
                      >
                        {t('common.back')}
                      </Button>
                    )
                  }
                </Grid>
                <Grid item md={6} xs={6} className={clsx(windowSize === 'xs' ? classes.textCenter : (isRTL ? classes.textLeft : classes.textRight))}>
                  {isRTL ? buttonPreviousIcon() : buttonNextIcon()}
                  {
                    activeStep !== 3 && (
                      <Button
                        onClick={() => activeStep === 2 ? saveSignup() : saveUserInfo()}
                        disabled={activeStep === 3}
                        className={clsx(classes.f22, classes.bold)}
                      >
                        {t(`common.${activeStep === 2 ? 'finish' : 'next'}`)}
                      </Button>
                    )
                  }
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
        {
          activeStep < 3 && (
            <MobileStepper
              variant="dots"
              steps={4}
              position="static"
              activeStep={activeStep}
              className={clsx("stepper", classes.mt20, classes.borderRadius30)}
              nextButton={
                <div />
              }
              backButton={
                <div />
              }
            />
          )
        }
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} zIndex={9999} />
      {renderToast()}
      {renderDialog()}
    </Container>
  );
};
export default SignUpNew;