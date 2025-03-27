import clsx from "clsx";
import { Box, Button, Checkbox, Container, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, MenuItem, MobileStepper, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { StateType } from "../../Models/StateTypes";
import { IoIosArrowDown, IoIosEye, IoIosEyeOff } from "react-icons/io";
import { CountryCodes, DefaultCountryCodeIsrael, FieldOfInterest, lowerCaseLetters, numbers, specialLetters, upperCaseLetters } from "../../helpers/Constants";
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
import { setCookie } from "../../helpers/Functions/cookies";
import EnImage from '../../assets/images/british.svg';
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import { Autocomplete } from "@mui/material";
import { filter, first } from "lodash";
import { isValidPhoneNumber } from "libphonenumber-js";

const SignUpNew = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { windowSize, isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false);
  const qs = queryString.parse(window.location.search);
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    emailId: qs?.emailid || '',
    phone: '',
    countryCode: DefaultCountryCodeIsrael,
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
    ReferralID: qs?.refId
  });
  const [invalidEmail, setInvalidEmail] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState(0);
  const passwordHintClasses = useStylesBootstrapPasswordHint();

  const changeLanguage = (value: any) => {
    setCookie('Culture', `${value}-${value === 'he' ? 'IL' : 'US'}`);
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
        let countryCode = DefaultCountryCodeIsrael;
        if (cellPhone !== '') {
          const CellPhoneWithCode = cellPhone.split("-");
          countryCode = first(filter(CountryCodes, { code: `${CellPhoneWithCode[0]}` })) || countryCode;
          cellPhone = CellPhoneWithCode[1];
        }
        
        setUserDetails({
          ...userDetails,
          fullName: `${Data?.FirstName || ''} ${Data?.LastName || ''}`,
          emailId: qs?.emailid || '',
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
      UserID: qs?.id,
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
      const nameArr = userDetails.fullName.split(' ');
      payload.FirstName = nameArr[0];
      payload.LastName = nameArr.slice(1).join(" ");
      payload.Mobile = `${userDetails.countryCode.code}-${userDetails.cellPhone}`;
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
    dispatch(setLanguage(qs?.culture || 'he'));
    i18n.changeLanguage('he-IL');

    getUserInfo();
    if ((qs?.refId && qs?.refId !== '') && ((!qs?.emailid || qs?.emailid === '') || !qs?.id)) {
      onInitRef().then(() => {
        setDialogType({ type: 'emailDialog' });
      });
    }
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
      const nameArr = userDetails.fullName.split(' ');
      setLoader(true);
      const interests: any = [];
      userDetails.fieldOfInterest.map((item: any) => item !== '' && interests.push(item));
      const { data: { Message }, status } = await PulseemReactInstance.post(`User/Signup`, {
        FirstName: nameArr[0],
        LastName: nameArr.slice(1).join(" "),
        Mobile: `${userDetails.countryCode.code}${userDetails.cellPhone}`,
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
        ReferralID: qs?.refId
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
      UserID: qs?.id
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
        // for stage
        const newUrl = Data?.RedirectLink.replace('https://www.pulseem.co.il', actionURL?.replace('/Pulseem/', ''));
        window.location.href = `${newUrl}&refId=${qs?.refId}&culture=${isRTL ? 'he' : 'en'}`;
        // for production
        // window.location.href = `${Data?.RedirectLink}&refId=${qs?.refId}`;
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
            <Grid item md={5} xs={12}>
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
                  value={userDetails?.countryCode}
                  multiple={false}
                  includeInputInList={true}
                  id="CountryCode"
                  options={CountryCodes}
                  disableCloseOnSelect
                  // @ts-ignore
                  onChange={(option, selected) => setUserDetails({...userDetails, countryCode: selected})}
                  getOptionLabel={(option) => `${option?.flag} (${option?.code}) ${option?.name}`}
                  renderGroup={(option: any) => (
                    <MenuItem value={option} className={clsx(classes.cursorPointer, classes.directionLTR)}>
                      <label className={clsx(classes.paddingInline5)}>
                        {option?.flag}&nbsp;({option?.code})&nbsp;{option?.name}
                      </label>
                    </MenuItem>
                  )}
                  renderOption={(props, option: any) => (
                    <MenuItem {...props} value={option} className={clsx(classes.cursorPointer, classes.directionLTR)}>
                      <label className={clsx(classes.paddingInline5)}>
                        {option?.flag}&nbsp;({option?.code})&nbsp;{option?.name}
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
                {/* <Select
                  variant="standard"
                  value={userDetails?.countryCode}
                  name='CountryCode'
                  onChange={(e: SelectChangeEvent) => setUserDetails({
                    ...userDetails,
                    countryCode: e.target.value
                  })}
                  IconComponent={() => <IoIosArrowDown size={20} className={clsx(classes.dropdownIconComponent, classes.bgWhite, classes.paddingInline10)} style={{ right: isRTL ? 0 : 'auto', left: isRTL ? 'auto' : 0, width: 20, height: '100%' }} />}
                  style={{
                    direction: 'ltr',
                    justifyContent: 'flex-start',
                    marginTop: '3.5px'
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 100,
                        maxHeight: 200,
                        direction: isRTL ? 'rtl' : 'ltr',
                        justifyContent: 'flex-start'
                      },
                    },
                  }}
                  className={clsx(classes.w100, classes.directionLTR, classes.SignUpCountryDropdown)}
                >
                  {
                    CountryCodes.map((country: any) => 
                      <MenuItem value={country?.code} className={clsx(classes.cursorPointer, classes.directionLTR)}>
                        <label className={clsx(classes.paddingInline5)}>
                          {country?.flag}&nbsp;({country?.code})&nbsp;{country?.name}
                        </label>
                      </MenuItem>
                    )
                  }
                </Select> */}
              </FormControl>
            </Grid>
            <Grid item md={7} xs={12}>
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
    return (
      <FormControl variant='standard' className={clsx(classes.SignUpLanguageDropdown, classes.bgWhite, classes.mb10)}>
        <Select
          variant="standard"
          value={isRTL ? 'he' : 'en'}
          name='TwoFactorAuthOptionID'
          onChange={(e: SelectChangeEvent) => changeLanguage(e.target.value)}
          IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} style={{ right: isRTL ? 15 : 'auto', left: isRTL ? 'auto' : 15 }} />}
          MenuProps={{
            PaperProps: {
              style: {
                width: 100,
                maxHeight: 200,
                direction: isRTL ? 'rtl' : 'ltr'
              },
            },
          }}
          className={clsx(classes.SignUpLanguageDropdown)}
        >
          <MenuItem value={'he'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={35} src={IsraelImage} alt={t('languages.langCodes.hebrew')} />
            <label>{t('languages.langCodes.hebrew')}</label>
          </MenuItem>

          <MenuItem value={'en'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
            <img width={35} src={EnImage} alt={t('languages.langCodes.english')} />
            <label>{t('languages.langCodes.english')}</label>
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