import React, { useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  Typography,
  Button,
  TextField,
  makeStyles,
  Divider,
  Avatar,
} from "@material-ui/core";
import "moment/locale/he";
import { RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { newAuthorizeEmail, verifyEmailCode, getTwoFactorAuthValues } from '../../redux/reducers/commonSlice';
import { getAuthorizedEmails } from "../../redux/reducers/commonSlice";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import {
  getAuthorizeNumbers, sendVerificationCode, verifyCode
} from '../../redux/reducers/smsSlice'

import { Stack } from "@mui/material";
import { BaseDialog } from "./BaseDialog";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import useCore from "../../helpers/hooks/Core";
import {
  addTwoFactorAuthValues,
  deleteAuthorizationValue,
  checkEmailAuthorization,
  deleteAuthorization2FA,
  checkCellphoneAuthorization
} from '../../redux/reducers/AccountSettingsSlice';
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { Loader } from '../Loader/Loader';

type Verification_Dialog_Popup = {
  variant: string;
  isOpen: boolean;
  onClose: Function;
  textButtonOnSuccess?: string;
};

type POPUP_OBJECT_TYPE = {
  title: any;
  icon: any;
  content: any;
  renderButtons: any;
};
type verificationErrorType = {
  email?: string;
  Number?: string;
  code?: string;

};

const VerificationDialog = ({
  variant = "email",
  isOpen = false,
  textButtonOnSuccess = "",
  onClose = () => { },
  ...props
}: Verification_Dialog_Popup) => {
  const { classes } = useCore();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: { core: any }) => state.core);
  const { username } = useSelector((state: { user: any }) => state.user);
  const { verifiedEmails, verifiedNumbers } = useSelector(
    (state: { common: any }) => state.common
  );
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(true);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationError, setVerificationError] =
    useState<verificationErrorType | null>(null);
  const [selectedVerificationContact, setSelectedVerificationContact] =
    useState("");
  const [codeResend, setCodeResend] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const verificationSource = useRef();
  const [authorizedTypeDisabled, setAuthorizedTypeDisabled] = useState(false);
  const [resendDisabled, setResendDisalbed] = useState(false);
  const [resendInterval, setResendInterval] = useState(10);
  const [userCodeConfirmed, setUserCodeConfirmed] = useState(false);
  const [addToFromEmailToSend, setAddToFromEmailToSend] = useState(false);
  const [addToFromNumberToSend, setAddToFromNumberToSend] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteValue, setDeleteValue] = useState(null);

  let trials = localStorage.getItem("verificationTrial")
    ? Number(localStorage.getItem("verificationTrial"))
    : 0;

  // const SLIDE_HEIGHTS = [25, 20, 20, 20, 20];

  useEffect(() => {
    setDeleteValue(null);
    setAddToFromEmailToSend(false);
    setAddToFromNumberToSend(false);
    switch (variant) {
      case "email": {
        const handleVerificationDialog = async () => {
          await dispatch(getAuthorizedEmails());
          setShowLoader(false);
        }
        handleVerificationDialog();
        break;
      }
      case "sms": {
        const handleVerificationDialog = async () => {
          await dispatch(getAuthorizeNumbers());
          setShowLoader(false);
        }
        handleVerificationDialog()
        break;
      }
      case "emailTFA": {

        const handleVerificationDialog = async () => {
          await dispatch(getAuthorizedEmails());
          await dispatch(getTwoFactorAuthValues(1));
          setShowLoader(false);
        }
        handleVerificationDialog()
        break;
      }
      case "smsTFA": {
        const handleVerificationDialog = async () => {
          await dispatch(getAuthorizeNumbers());
          await dispatch(getTwoFactorAuthValues(2));
          setShowLoader(false);
        }
        handleVerificationDialog()
        break;
      }
      default: {
        break;
      }
    }
  }, []);

  const NextSlide = () => {
    if (verificationStep === 4) {
      return setVerificationStep(0)
    }
    if (setVerificationError) {
      setVerificationError(null)
    }
    setCodeResend(false)
    return setVerificationStep(verificationStep + 1)
  };

  const PrevSlide = () => {
    if (verificationStep === 0) {
      return setVerificationStep(5)
    }
    return setVerificationStep(verificationStep - 1)
  };

  const handleClose = (callback?: Function) => {

    if (verificationStep <= 3 && variant === 'emailTFA' && selectedVerificationContact && !addToFromEmailToSend) {
      dispatch(deleteAuthorizationValue({ TwoFactorAuthTypeID: 1, AuthValue: selectedVerificationContact }));
    }
    if (verificationStep <= 3 && variant === 'smsTFA' && selectedVerificationContact && !addToFromNumberToSend) {
      dispatch(deleteAuthorizationValue({ TwoFactorAuthTypeID: 2, AuthValue: selectedVerificationContact }));
    }

    callback?.();
    onClose?.();
    verificationStep && setVerificationStep(0);
    verificationError && setVerificationError(null);
    selectedVerificationContact && setSelectedVerificationContact("");
    verificationCode && setVerificationCode("");
    if (localStorage.getItem("verificationTrial"))
      localStorage.removeItem("verificationTrial");
    setAuthorizedTypeDisabled(false);

    variant === 'email' && dispatch(getAuthorizedEmails());
    variant === 'sms' && dispatch(getAuthorizeNumbers());
    variant === 'emailTFA' && dispatch(getTwoFactorAuthValues(1));
    variant === 'smsTFA' && dispatch(getTwoFactorAuthValues(2));

    setAddToFromEmailToSend(false);
    setAddToFromNumberToSend(false);
  }

  const addTwoFactorValue = async (disableNextStep = false, type = 1) => {
    try {
      const authResponse = await dispatch(addTwoFactorAuthValues({ TwoFactorAuthTypeID: type, AuthValue: selectedVerificationContact, AddToFromValues: addToFromEmailToSend }))
      if (disableNextStep) {
        return authResponse?.payload;
      }
      switch (authResponse.payload?.StatusCode) {
        case 201:
        case 202: {
          NextSlide();
          break;
        }
        case 401: {
          setVerificationError({ code: t('group.invalidApi') })
          break;
        }
        case 403: {
          setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') });
          break;
        }
        default: {
          break;
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  const handleVerifyCode = async () => {
    setShowLoader(true);
    setUserCodeConfirmed(true);
    switch (variant) {
      //#region email
      case 'email':
      case 'emailTFA': {
        dispatch(verifyEmailCode(
          {
            email: selectedVerificationContact,
            optinCode: verificationCode
          })).then(async (response) => {
            setUserCodeConfirmed(false);
            switch (response?.payload.toLowerCase()) {
              case "ok": {
                if (variant === 'emailTFA') {
                  addTwoFactorValue();
                }
                else {
                  NextSlide();
                }
                break;
              }
              case "expired": {
                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired') })
                break;
              }
              case "notmatch": {
                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') })
                break;
              }
              case "toomuch": {
                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts') })
                break;
              }
              case "abused": {
                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.email_error_abused') })
                break;
              }
              default: {
                setVerificationError({ code: t('common.ErrorOccured') })
                break;
              }
            }
          })
        break;
      }
      //#endregion
      //#region sms
      case 'sms':
      case 'smsTFA': {
        const result = await dispatch(verifyCode({
          optinCode: verificationCode,
          phoneNumber: selectedVerificationContact
        }));
        setUserCodeConfirmed(false);
        switch (result.payload.toLowerCase()) {
          case 'ok': {
            if (variant === 'smsTFA') {
              addTwoFactorValue(false, 2);
            }
            else {
              NextSlide();
            }
            break;
          }
          case 'notmatch': {
            localStorage.setItem('verificationTrial', trials + 1)
            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') })
            break;
          }
          case 'expired': {
            localStorage.setItem('verificationTrial', trials + 1)
            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired') })
            break;
          }
          case "toomuch": {
            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts') })
            break;
          }
          case "abused": {
            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.sms_error_abused') })
            break;
          }
          default: {
            setVerificationError({ code: t('common.ErrorOccured') })
            break;
          }
        }
        break;
      }
      //#endregion
      default: { break; }
    }
    setShowLoader(false);
  }


  const handleResendInterval = () => {
    let intervalTime = 10;

    const startInterval = () => {
      if (intervalTime === 0) {
        stopInterval();
      }
      setResendInterval(intervalTime--);
    }
    const stopInterval = () => {
      setCodeResend(false);
      setResendInterval(10);
      clearInterval(interval);
      setResendDisalbed(false);
    }

    const interval = setInterval(startInterval, 1000);
  }

  useEffect(() => {
    if (codeResend === true) {
      handleResendInterval();
    }
  }, [codeResend])

  const handleSendCode = async (val: any, isResend: boolean = false) => {
    setShowLoader(true);
    setResendDisalbed(isResend);
    switch (variant) {
      case 'email':
      case 'emailTFA': {
        const res = await dispatch(checkEmailAuthorization(selectedVerificationContact));
        if (res?.payload?.StatusCode === 404) {
          dispatch(newAuthorizeEmail({ email: val })).then((result) => {
            setCodeResend(isResend);
            return result?.payload;
          });
        }
        else if (res?.payload?.StatusCode === 201) {
          setVerificationStep(3);
        }
        break;
      }
      case 'sms':
      case 'smsTFA': {
        const res = await dispatch(checkCellphoneAuthorization(selectedVerificationContact));
        if (res?.payload?.StatusCode === 404) {
          dispatch(sendVerificationCode({ number: val })).then((result) => {
            setCodeResend(isResend);
            return result?.payload;
          });
        }
        else if (res?.payload?.StatusCode === 201) {
          setVerificationStep(3);
        }
        break;
      }
      default: {
        break;
      }
    }
    setShowLoader(false);
  };

  const removeValue = async () => {
    const response = await dispatch(deleteAuthorization2FA(deleteValue));
    if (response?.payload?.StatusCode === 201) {
      await dispatch(getTwoFactorAuthValues(variant === 'emailTFA' ? 1 : 2));
    }
    else {
      setVerificationError({ Number: t('common.ErrorOccured') })
    }
    setShowConfirmDelete(false);
  }

  const Slide = ({
    children = "",
    className_SlideBody = "",
    slideStyle = {},
  }: {
    children: any;
    className_SlideBody: any;
    slideStyle: CSSProperties;
  }) => (
    <Stack
      className={clsx(
        classes.carouselItem,
        classes.T05S,
        classes.emailVerItemContainer
      )}
      style={{
        transform: `translate(${isRTL ? verificationStep * 100 : -(verificationStep * 100)
          }%)`,
        ...slideStyle,
      }}
    >
      <Stack className={className_SlideBody}>{children}</Stack>
    </Stack>
  );

  const EMAIL_SLIDE_1 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cSlide firstSlide",
      children: (
        <>
          <Stack pb={1}>
            <Typography style={{ fontSize: 14, color: "#000" }} variant="body1">
              <>{t("campaigns.newsLetterMgmt.emailVerification.popupDesc1")}</>
            </Typography>
            <Typography style={{ fontSize: 14, color: "#000" }} variant="body1">
              <>{t("campaigns.newsLetterMgmt.emailVerification.popupDesc2")}</>
            </Typography>
            <Divider />
          </Stack>
          <Stack style={{ position: "relative", height: "90%" }}>
            <Typography
              className={clsx(classes.pb25, classes.bold)}
              variant="h6"
            >
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails"
                )}
              </>{" "}
            </Typography>
            <Stack className={clsx("contactDataBox", classes.sidebar)}>
              {verifiedEmails?.map(
                ({ IsOptIn, Number }: { IsOptIn: boolean; Number: string }) => (
                  <Stack
                    className={clsx(classes.flex, classes.hAuto, "emailBox")}
                    direction="row"
                  >
                    <Avatar
                      className={IsOptIn ? classes.checkIcon : classes.redIcon}
                    >
                      <div className={clsx(classes.avatarIcon)}>
                        {IsOptIn ? "\uE134" : "\uE0A7"}
                      </div>
                    </Avatar>
                    <Typography className="emailText">{Number} </Typography>
                    {!IsOptIn && (
                      <Typography
                        className={clsx(classes.link, "emailVerLink")}
                        onClick={() => {
                          setSelectedVerificationContact(Number);
                          setVerificationError({ Number: "" });
                          NextSlide();
                          setAuthorizedTypeDisabled(true);
                        }}
                      >
                        <>
                          {t(
                            "campaigns.newsLetterMgmt.emailVerification.firstSlide.verifyEmailAddr"
                          )}
                        </>
                      </Typography>
                    )}
                  </Stack>
                )
              )}
            </Stack>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                isRTL ? "btnVerifyNewRTL" : "btnVerifyNewLtr"
              )}
              onClick={() => {
                setSelectedVerificationContact("");
                setVerificationError({ Number: "" });
                NextSlide();
              }}
            >
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.firstSlide.addNewToVerify"
                )}
              </>
            </Button>
          </Stack>
        </>
      ),
    });

  const EMAIL_SLIDE_2 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide secondSlide",
      children: (
        <>
          <Stack className="titleDescBox">
            <Typography variant="h4">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.secondSlide.title"
                )}
              </>
            </Typography>
            <Stack className="desc">
              <Typography variant="body1">
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.secondSlide.desc1"
                  )}
                </>
              </Typography>
              <Typography variant="body1">
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.secondSlide.desc2"
                  )}
                </>
              </Typography>
            </Stack>
          </Stack>
          <Stack className={classes.flexColumn}>
            <Stack alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                value={selectedVerificationContact}
                inputProps={{
                  disabled: authorizedTypeDisabled,
                  className: clsx(classes.textColorBlue, classes.textCenter),
                }}
                onChange={(e) => {
                  !!verificationError?.email &&
                    setVerificationError({ email: "" });
                  setSelectedVerificationContact(e.target.value?.trim());
                }}
                className={clsx(
                  classes.textField,
                  classes.maxWidth400,
                  classes.txtCenter
                )}
                placeholder={t(
                  "campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder"
                )}
                error={!!verificationError?.Number}
              />
            </Stack>
            <Stack mt={2} alignItems="center">
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.wFitContent
                )}
                onClick={() => {
                  if (selectedVerificationContact) {
                    if (
                      selectedVerificationContact.match(
                        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                      )
                    ) {
                      handleSendCode(selectedVerificationContact);
                      NextSlide();
                    } else {
                      setVerificationError({
                        Number: t(
                          "campaigns.newsLetterMgmt.emailVerification.secondSlide.error1"
                        ),
                      });
                    }
                  } else
                    setVerificationError({
                      Number: t(
                        "campaigns.newsLetterMgmt.emailVerification.secondSlide.error2"
                      ),
                    });
                }}
              >
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.secondSlide.btnText"
                  )}
                </>
              </Button>
              <Typography className="error" variant="body1">
                {verificationError?.Number}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem"
                )}
              </>{" "}
              <span className={classes.link}>
                <>
                  {RenderHtml(
                    t(
                      "campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs"
                    )
                  )}
                </>
              </span>
            </Typography>
            <Typography variant="body1">
              <>
                {t("common.phone")} 03-5240290 / {t("common.email")}{" "}
                support@pulseem.com
              </>
            </Typography>
          </Stack>
        </>
      ),
    });

  const EMAIL_SLIDE_3 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack>
            <Typography variant="h4" className={classes.bold}>
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.title"
                )}
              </>
            </Typography>
            <Typography variant="body1" className={classes.mt4}>
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1"
                )}
              </>
            </Typography>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2"
                )}
              </>
            </Typography>
          </Stack>
          <Stack className={clsx(classes.flexColumn, classes.mt20)}>
            <Stack alignItems="center">
              <TextField
                variant="outlined"
                size="small"
                className={clsx(
                  classes.textField,
                  classes.maxWidth400,
                  classes.textCenter
                )}
                inputProps={{
                  className: classes.textCenter,
                }}
                onChange={(e) => {
                  e.preventDefault();
                  !!verificationError?.code &&
                    setVerificationError({ code: "" });
                  if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                    setVerificationCode(e.target.value);
                  }
                }}
                placeholder={t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder"
                )}
                error={!!verificationError?.code}
                value={verificationCode}
              />
            </Stack>
            <Stack mt={2} alignItems="center">
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.buttonMinWidth
                )}
                onClick={() => {
                  if (trials === 4) {
                    return NextSlide();
                  }
                  if (verificationCode) {
                    handleVerifyCode();
                  } else {
                    localStorage.setItem("verificationTrial", `${trials + 1}`);
                    setVerificationError({
                      code: t(
                        "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2"
                      ),
                    });
                  }
                }}
              >
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText"
                  )}
                </>
              </Button>
              <Typography className="error" variant="body1">
                {verificationError?.code}
              </Typography>

              {/* // <Button onClick={() => setEmailStatus(!emailStatus)}>Change Status</Button> */}
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved"
                )}
              </>{" "}
              <span
                className={classes.link}
                onClick={() =>
                  handleSendCode(selectedVerificationContact, true)
                }
              >
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend"
                  )}
                </>
              </span>
            </Typography>
            <Typography className="success" variant="body1">
              <>
                {codeResend
                  ? t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess"
                  )
                  : ""}
              </>
            </Typography>
          </Stack>
        </>
      ),
    });

  const EMAIL_SLIDE_ERROR = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack mt={4}>
            <Typography variant="h4">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.title"
                )}
              </>
            </Typography>
            <Typography variant="body1" className={classes.mt4}>
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.desc"
                )}
              </>
            </Typography>
          </Stack>

          <Stack>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.contactSupport"
                )}
              </>
            </Typography>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.phone"
                )}
                : 035240290
              </>
            </Typography>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.email"
                )}
                : support@pulseem.com
              </>
            </Typography>
          </Stack>
        </>
      ),
    });

  const EMAIL_SLIDE_SUCCESS = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack>
            <Typography variant="h4">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.successSlide.title"
                )}
              </>
            </Typography>
            <Typography
              variant="body1"
              className={clsx(classes.mt4, classes.mb15)}
            >
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.successSlide.desc"
                )}{" "}
              </>
            </Typography>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.buttonMinWidth,
                classes.mt6,
                classes.middle
              )}
              onClick={() => {
                handleClose();
              }}
            >
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.successSlide.btnTxt"
                )}
              </>
            </Button>
          </Stack>
        </>
      ),
    });

  const SMS_SLIDE_1 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cSlide firstSlide",
      children: (
        <>
          <Stack pb={1}>
            <Typography style={{ fontSize: 14, color: "#000" }} variant="body1">
              <>{t("sms.verificationBody")}</>
            </Typography>
            <Typography style={{ fontSize: 14, color: "#000" }} variant="body1">
              <b>
                <>{t("sms.oneTimeProcess")}</>
              </b>
              <>{t("sms.foreachSubmission")}</>
            </Typography>
            <Typography
              style={{ fontSize: 15, textDecoration: "underline" }}
              className={classes.mt15}
            >
              <>{t("sms.verificationNote")}</>
            </Typography>
            <Divider />
          </Stack>
          <Stack style={{ position: "relative", height: "90%" }}>
            <Typography
              className={clsx(classes.pbt15, classes.bold)}
              variant="h6"
            >
              <>{t("sms.numbersAccount")}</>{" "}
            </Typography>
            <Stack className={clsx("contactDataBox", classes.sidebar)}>
              {(verifiedNumbers || verifiedEmails || []).map(
                ({
                  ID,
                  IsOptIn,
                  Number,
                }: {
                  ID: string;
                  IsOptIn: boolean;
                  Number: string;
                }) => (
                  <Stack
                    className={clsx(classes.flex, classes.hAuto, "emailBox")}
                    key={`verificationNumber${ID}`}
                    direction="row"
                  >
                    <Avatar
                      className={IsOptIn ? classes.checkIcon : classes.redIcon}
                    >
                      <div className={clsx(classes.avatarIcon)}>
                        {IsOptIn ? "\uE134" : "\uE0A7"}
                      </div>
                    </Avatar>
                    <Typography className="emailText">{Number} </Typography>
                    {!IsOptIn && (
                      <Typography
                        className={clsx(classes.link, "emailVerLink")}
                        onClick={() => {
                          setSelectedVerificationContact(Number);
                          setVerificationError({ Number: "" });
                          NextSlide();
                          setAuthorizedTypeDisabled(true);
                        }}
                      >
                        {" "}
                        <>{t("sms.verifyNumber")}</>
                      </Typography>
                    )}
                  </Stack>
                )
              )}
            </Stack>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                "btnVerifyNewLtr"
              )}
              onClick={() => {
                setSelectedVerificationContact("");
                setVerificationError({ Number: "" });
                NextSlide();
              }}
            >
              <>{t("sms.verifyAnotherNumber")}</>
            </Button>
          </Stack>
        </>
      ),
    });

  const SMS_SLIDE_2 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide secondSlide",
      children: (
        <>
          <Stack className="titleDescBox">
            <Typography variant="h4">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.secondSlide.title"
                )}
              </>
            </Typography>
            <Stack className="desc">
              <Typography variant="body1">
                <>{t("sms.verificationBody")}</>{" "}
                <b>
                  <>{t("sms.oneTimeProcess")}</>
                </b>
                <>{t("sms.foreachSubmission")}</>
              </Typography>
            </Stack>
          </Stack>
          <Stack className={classes.flexColumn}>
            <Stack>
              <TextField
                variant="outlined"
                size="small"
                value={selectedVerificationContact}
                inputProps={{
                  disabled: authorizedTypeDisabled,
                  className: clsx(classes.textColorBlue, classes.textCenter),
                }}
                onChange={(e) => {
                  !!verificationError?.Number &&
                    setVerificationError({ Number: "" });
                  if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                    setSelectedVerificationContact(e.target.value?.trim());
                  }
                }}
                className={clsx(
                  classes.textField,
                  classes.maxWidth400,
                  classes.middle
                )}
                placeholder={t("sms.enterNumberText")}
                error={!!verificationError?.Number}
              />
            </Stack>
            <Stack mt={2}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.middle
                )}
                onClick={() => {
                  if (selectedVerificationContact) {
                    if (selectedVerificationContact.match(/^[0-9]+$/)) {
                      handleSendCode(selectedVerificationContact);
                      NextSlide();
                    } else {
                      setVerificationError({ Number: t("sms.numberError") });
                    }
                  } else setVerificationError({ Number: t("sms.numberError") });
                }}
              >
                <>{t("sms.verificationButtonText")}</>
              </Button>
              <Typography className="error" variant="body1">
                {verificationError?.Number}
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="body1">
              <>{t("sms.havingIssuesMessage")}</>{" "}
            </Typography>
          </Stack>
        </>
      ),
    });

  const SMS_SLIDE_3 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack>
            <Typography variant="h4" className={classes.bold}>
              <>{t("common.Sent")}</>
            </Typography>
            <Typography variant="body1" className={classes.mt4}>
              {" "}
              <>{t("sms.verificationSentToNumber")}</>
              {selectedVerificationContact}
            </Typography>
            <Typography variant="body1">
              <> {" " + t("sms.pleaseNoteCode")}</>
            </Typography>
          </Stack>
          <Stack className={classes.flexColumn}>
            <Stack>
              <TextField
                variant="outlined"
                size="small"
                className={clsx(
                  classes.textField,
                  classes.maxWidth400,
                  classes.middle
                )}
                inputProps={{
                  className: classes.textCenter,
                }}
                onChange={(e) => {
                  !!verificationError?.code &&
                    setVerificationError({ code: "" });
                  if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                    setVerificationCode(e.target.value);
                  }
                }}
                placeholder={t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder"
                )}
                error={!!verificationError?.code}
                value={verificationCode}
              />
            </Stack>
            <Stack mt={2}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.buttonMinWidth,
                  classes.middle
                )}
                onClick={() => {
                  if (trials === 4) {
                    return NextSlide();
                  }

                  if (verificationCode) {
                    handleVerifyCode();
                  } else {
                    localStorage.setItem("verificationTrial", `${trials + 1}`);
                    setVerificationError({
                      code: t("sms.verificationCodeError"),
                    });
                  }
                }}
              >
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText"
                  )}
                </>
              </Button>
              <Typography className="error" variant="body1">
                {verificationError?.code}
              </Typography>

              {/* // <Button onClick={() => setEmailStatus(!emailStatus)}>Change Status</Button> */}
            </Stack>
          </Stack>
          <Stack>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved"
                ) + " "}
              </>
              <span
                className={classes.link}
                onClick={() =>
                  handleSendCode(selectedVerificationContact, true)
                }
              >
                <>
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend"
                  )}
                </>
              </span>
            </Typography>
            <Typography className="success" variant="body1">
              <>
                {codeResend
                  ? t(
                    "campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess"
                  )
                  : ""}
              </>
            </Typography>
          </Stack>
        </>
      ),
    });

  const SMS_SLIDE_ERROR = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack mt={4}>
            <Typography variant="h4">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.title"
                )}
              </>
            </Typography>
            <Typography variant="body1" className={classes.mt4}>
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.desc"
                )}
              </>
            </Typography>
          </Stack>

          <Stack>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.contactSupport"
                )}
              </>
            </Typography>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.phone"
                )}
                : 035240290
              </>
            </Typography>
            <Typography variant="body1">
              <>
                {t(
                  "campaigns.newsLetterMgmt.emailVerification.errorSlide.email"
                )}
                : support@pulseem.com
              </>
            </Typography>
          </Stack>
        </>
      ),
    });

  const SMS_SLIDE_SUCCESS = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cFlexSlide",
      children: (
        <>
          <Stack>
            <Typography variant="h4">
              <>{t("sms.verificationSuccessful")}</>
            </Typography>
            <Typography variant="body1" className={classes.mt4}>
              <>{t("sms.verificationSuccessMessage")}</>
            </Typography>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mt15,
                classes.buttonMinWidth,
                classes.middle
              )}
              onClick={() => {
                handleClose();
              }}
            >
              <>{t("common.continue")}</>
            </Button>
          </Stack>
        </>
      ),
    });

  const POPUP_OBJECT: { [key: string]: POPUP_OBJECT_TYPE } = {
    email: {
      title: <>{t("campaigns.newsLetterMgmt.emailVerification.popupTitle")}</>,
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: (
        <>
          {EMAIL_SLIDE_1()}
          {EMAIL_SLIDE_2()}
          {EMAIL_SLIDE_3()}
          {trials && trials >= 4 ? EMAIL_SLIDE_ERROR() : EMAIL_SLIDE_SUCCESS()}
        </>
      ),
      renderButtons: () => (
        <Stack className={classes.textCenter}>
          {verificationStep < 1 && (
            <Button
              name="btnConfirm"
              onClick={() => {
                handleClose();
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.ml5,
                classes.middle
              )}
            >
              <>{t("common.Ok")}</>
            </Button>
          )}

          {verificationStep > 0 && verificationStep < 3 && (
            <Button
              name="btnConfirm"
              onClick={PrevSlide}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.ml5,
                classes.middle
              )}
            >
              <>{t("notifications.back")}</>
            </Button>
          )}
        </Stack>
      ),
    },
    sms: {
      title: <>{t("sms.verificationDialogTitle")}</>,
      icon: <div className={classes.dialogIconContent}>{"\uE11B"}</div>,
      content: (
        <>
          {SMS_SLIDE_1()}
          {SMS_SLIDE_2()}
          {SMS_SLIDE_3()}
          {trials && trials >= 4 ? SMS_SLIDE_ERROR() : SMS_SLIDE_SUCCESS()}
        </>
      ),
      renderButtons: () => (
        <Stack className={classes.textCenter}>
          {verificationStep < 1 && (
            <Button
              name="btnConfirm"
              onClick={() => {
                handleClose();
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.ml5,
                classes.middle
              )}
            >
              <>{t("common.Ok")}</>
            </Button>
          )}

          {verificationStep > 0 && verificationStep < 3 && (
            <Button
              name="btnConfirm"
              onClick={PrevSlide}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.ml5,
                classes.middle
              )}
            >
              <>{t("notifications.back")}</>
            </Button>
          )}
        </Stack>
      ),
    },
  };

  return (
    <BaseDialog
      open={isOpen}
      onClose={handleClose}
      onCancel={handleClose}
      {...POPUP_OBJECT[variant]}
    >
      <Stack
        className={clsx(classes.carouselContainer, classes.sidebar)}
      // style={{
      //   height: `${SLIDE_HEIGHTS[verificationStep]}rem`,
      //   transition: "height .5s",
      // }}
      >
        {POPUP_OBJECT[variant].content}
      </Stack>
    </BaseDialog>
  );
};

export default VerificationDialog;
