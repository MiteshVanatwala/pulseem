import clsx from "clsx";
import { Box, Button, Container, Grid, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { StateType } from "../../Models/StateTypes";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { lowerCaseLetters, numbers, specialLetters, upperCaseLetters } from "../../helpers/Constants";
import { RenderHtml, useStylesBootstrapPasswordHint } from "../../helpers/Utils/HtmlUtils";
import { Loader } from "../../components/Loader/Loader";
import Illustration_BG_BL from "../../assets/images/Illustration_BG_BL";
import Illustration_BG_BR from "../../assets/images/Illustration_BG_BR";
import PasswordHint from "../Settings/AccountSettings/Password/PasswordHint";
import { ValidPassword } from "../Settings/AccountSettings/Password/Types";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import Toast from "../../components/Toast/Toast.component";
import queryString from 'query-string';
import { setLanguage } from "../../redux/reducers/coreSlice";
import { useDispatch } from 'react-redux';
import i18n from "../../i18n";
import { IsValidEmail } from "../../helpers/Utils/Validations";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import SharedAppBar from "../../components/core/SharedAppBar";

const SubUserConfirmationPage = ({ classes }: any) => {
  const dispatch = useDispatch();
  const { windowSize, isRTL } = useSelector((state: StateType) => state.core);
  const { ToastMessages } = useSelector((state: any) => state?.subUser);
  const { t } = useTranslation();
  const [showLoader, setLoader] = useState(false);
  const [linkIsValid, setLinkIsValid] = useState<boolean | null>(null);
  const qs = queryString.parse(window.location.search);
  const passwordHintStyle = useStylesBootstrapPasswordHint();
  const [userDetails, setUserDetails] = useState({
    EmailId: qs?.emailid || '',
    Password: '',
    isPasswordVisible: false,
    confirmPassword: '',
    isConfirmPasswordVisible: false,
  });
  const [errors, setErrors] = useState({
    emailId: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordValidation, setPasswordValidation] = useState<ValidPassword>({
    LowerChar: false,
    SpecialChar: false,
    UpperChar: false,
    PasswordLength: 0,
    NumberChar: false,
  } as ValidPassword);
  const [dialogType, setDialogType] = useState<{
    type: string;
  } | null>(null);
  const [showPasswordTip, setShowPasswordTip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<any | never>(null);


  const onInitRef = async () => {
    setLoader(true);

    const response: any = await PulseemReactInstance.post(`SubUser/CheckSubUserRef  `, { EmailId: qs?.emailId, ConfirmationId: qs?.cid });
    const { StatusCode = 200 } = response?.data;

    switch (StatusCode) {
      case 201: {
        setLinkIsValid(true);
        setLoader(false);
        break;
      }
      case 406: {
        setLinkIsValid(false);
        setLoader(false);
        break;
      }
    }
    return;
  }

  useEffect(() => {
    dispatch(setLanguage(qs?.culture || 'he'));
    i18n.changeLanguage('he-IL');

    if ((qs?.cid && qs?.cid !== '' && qs?.emailId && qs?.emailId !== '')) {
      onInitRef();
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

  const handleChange = (e: any) => {
    setUserDetails({
      ...userDetails,
      Password: e?.target?.value.trim()
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

  const displayConfirmationPopup = () => ({
    title: t('SignUp.ConfirmationTitle'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {RenderHtml(t('SubUsers.activationSuccess'))}
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
            onClick={() => {
              window.location.href = 'https://www.pulseem.co.il/Pulseem/Login.aspx';
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}>
            {t('integrations.shopify.authenticate')}
          </Button>
        </Grid>
      </Grid>
    )
  })

  const saveSignup = async () => {
    let errorsTemp = errors;
    errorsTemp.password = '';
    errorsTemp.confirmPassword = userDetails.confirmPassword === '' ? t('SignUp.ConfirmPasswordRequired') : (userDetails.Password === userDetails.confirmPassword ? '' : t("settings.changePassword.error.notMatch"));
    errorsTemp.emailId = qs?.emailId ? (IsValidEmail(`${qs?.emailId}`) ? '' : t('common.invalidEmail')) : t('common.Required');

    if (userDetails.Password && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
      errorsTemp.password = t('SignUp.InvalidPassword');
    } else if (!userDetails.Password) {
      errorsTemp.password = t('SignUp.PasswordRequired');
    }
    setErrors({
      ...errors,
      ...errorsTemp
    });

    if (!errorsTemp.password && !errorsTemp.confirmPassword && !errorsTemp.emailId) {
      setLoader(true);
      const { data: { Message, StatusCode }, status } = await PulseemReactInstance.post(`SubUser/ConfirmSubUser`, {
        Password: userDetails.Password,
        EmailId: qs?.emailId,
        ConfirmationId: qs?.cid
      });

      setLoader(false);
      if (status === 200) {
        switch (StatusCode) {
          case 201: {
            setDialogType({ type: 'confirmation' });
            break;
          }
          case 404: { // user is not approved
            setToastMessage(ToastMessages[404])
            break;
          }
          case 405: { // illegal password or empty
            setToastMessage(ToastMessages[405])
            break;
          }
          case 500:
          default: {
            setDialogType({ type: 'internalError' });
          }
        }
      }
    }
  }

  const renderDialog = () => {
    const { type } = dialogType || {}
    let currentDialog: any = {};
    if (type === 'internalError') {
      currentDialog = displayInternalErrorPopup();
    }
    else if (type === 'confirmation') {
      currentDialog = displayConfirmationPopup();
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

  return (
    <Container
      maxWidth='xl'
      className={clsx()}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className={classes.background}>
        <Illustration_BG_BL className={isRTL ? 'rightSvg' : 'leftSvg'} />
        <Illustration_BG_BR className={isRTL ? 'leftSvg' : 'rightSvg'} />
      </div>
      <SharedAppBar title={t('SubUsers.userActivation')} classes={classes} />
      <Box style={{ height: 'calc(100vh - 50px' }} className={clsx(classes.flexCenterOfCenter, classes.pt20)}>
        <Box className={clsx(classes.pt20)} style={{ textAlign: linkIsValid ? (isRTL ? 'right' : 'left') : 'center', width: linkIsValid ? 430 : '100%' }}>
          {linkIsValid ? <Box className={classes.loginForm}>
            <Box className={clsx(classes.logref, classes.f20, classes.bold)} style={{ color: '#fff' }}>
              {t('SignUp.LoginDetails')}
            </Box>
            <Box style={{ padding: 25 }}>
              <Box>
                <Typography style={{ textAlign: isRTL ? 'right' : 'left' }} className={clsx(classes.font15, classes.pb15, classes.bold)}>
                  {RenderHtml(t('SubUsers.activateDescription'))}
                </Typography>
              </Box>
              <Box className={classes.dFelx}>
                <Box className={classes.pb15}>
                  <Typography className={clsx(classes.f18)}>
                    {t("common.Email")}
                    <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}></span>
                  </Typography>
                  <TextField
                    type="email"
                    variant="outlined"
                    size="small"
                    name="EmailLastName"
                    value={qs?.emailId}
                    onChange={(event: any) => setUserDetails({
                      ...userDetails,
                      EmailId: event.target.value
                    })}
                    className={clsx(classes.textField, classes.minWidth252)}
                    error={!!errors.emailId}
                    disabled={true}
                    inputProps={{ maxLength: 100 }}
                  />
                  {!!errors.emailId && (
                    <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                      {errors.emailId}
                    </Typography>
                  )}
                </Box>
                <Box className={classes.pb15}>
                  <Box>
                    <Typography className={clsx(classes.f18)}>
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
                        classes={passwordHintStyle}
                      >
                        <TextField
                          autoFocus
                          onFocus={() => setShowPasswordTip(true)}
                          onBlur={() => setShowPasswordTip(false)}
                          type={userDetails.isPasswordVisible ? "text" : "password"}
                          variant="outlined"
                          size="small"
                          name="Password"
                          value={userDetails?.Password}
                          onChange={handleChange}
                          className={clsx(classes.textField, classes.minWidth252)}
                          error={!!errors.password}
                          inputProps={{ maxWidth: 50 }}
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
                  <Box className={classes.pt15}>
                    <Typography className={clsx(classes.f18)}>
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
                        inputProps={{ maxLength: 50 }}
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
                        }}
                      />
                    </Box>
                    {!!errors.confirmPassword && (
                      <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                        {errors.confirmPassword}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box className={clsx(classes.pt25, classes.pb25, classes.textCenter)}>
                  <Button
                    className={clsx(
                      classes.btn,
                      classes.btnRounded,
                      classes.mr10,
                      classes.p10,
                      classes.f25,
                      classes.colorWhite,
                      classes.gradientBackground
                    )}
                    style={{ width: windowSize === 'xs' ? '100%' : '250px' }}
                    onClick={saveSignup}
                  >
                    {t(`SubUsers.activate`)}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box> : linkIsValid === null ? (<></>) : (<Box>
            <Typography style={{ fontSize: 40 }}>
              {RenderHtml(t("SubUsers.activationLinkExpired"))}
            </Typography>
          </Box>)}
        </Box>
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} zIndex={9999} />
      {renderToast()}
      {renderDialog()}
    </Container>
  );
};

export default SubUserConfirmationPage;