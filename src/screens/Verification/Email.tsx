import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  Typography,
  Button,
  TextField,
  Divider,
  Avatar,
} from "@material-ui/core";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  newAuthorizeEmail,
  verifyEmailCode,
} from "../../redux/reducers/commonSlice";
import { getAuthorizedEmails } from "../../redux/reducers/commonSlice";
import { MdOutlineMarkEmailRead } from "react-icons/md";

import { Stack } from "@mui/material";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import useCore from "../../helpers/hooks/Core";
import {
  POPUP_OBJECT_TYPE,
  verificationErrorType,
  Verification_Dialog_Popup,
} from "../../helpers/Types/Verification";

const GetEmailVerificationDialog = ({
  onClose = () => {},
}: Verification_Dialog_Popup) => {
  const { classes } = useCore();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: { core: any }) => state.core);
  const { verifiedEmails } = useSelector(
    (state: { common: any }) => state.common
  );
  const { t } = useTranslation();
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationError, setVerificationError] =
    useState<verificationErrorType | null>(null);
  const [selectedVerificationContact, setSelectedVerificationContact] =
    useState("");
  const [codeResend, setCodeResend] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authorizedTypeDisabled, setAuthorizedTypeDisabled] = useState(false);

  let trials = localStorage.getItem("verificationTrial")
    ? Number(localStorage.getItem("verificationTrial"))
    : 0;

  useEffect(() => {
    dispatch(getAuthorizedEmails());
  }, []);

  const NextSlide = () => {
    if (verificationStep === 4) {
      return setVerificationStep(0);
    }
    if (setVerificationError) {
      setVerificationError(null);
    }
    setCodeResend(false);
    return setVerificationStep(verificationStep + 1);
  };

  const PrevSlide = () => {
    if (verificationStep === 0) {
      return setVerificationStep(5);
    }
    return setVerificationStep(verificationStep - 1);
  };

  const handleClose = (callback?: Function) => {
    callback?.();
    onClose?.();
    verificationStep && setVerificationStep(0);
    verificationError && setVerificationError(null);
    selectedVerificationContact && setSelectedVerificationContact("");
    verificationCode && setVerificationCode("");
    if (localStorage.getItem("verificationTrial"))
      localStorage.removeItem("verificationTrial");
    setAuthorizedTypeDisabled(false);
  };

  const handleVerifyCode = async () => {
    dispatch(
      // @ts-ignore
      verifyEmailCode({
        email: selectedVerificationContact,
        optinCode: verificationCode,
      })
    ).then((response: any) => {
      switch (response?.payload.toLowerCase()) {
        case "ok": {
          NextSlide();
          break;
        }
        case "expired": {
          setVerificationError({
            code: t(
              "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired"
            ),
          });
          break;
        }
        case "notmatch": {
          setVerificationError({
            code: t(
              "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match"
            ),
          });
          break;
        }
        case "toomuch": {
          setVerificationError({
            code: t(
              "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts"
            ),
          });
          break;
        }
        default: {
          setVerificationError({ code: t("common.ErrorOccured") });
          break;
        }
      }
    });
  };

  const handleSendCode = (val: any, isResend: boolean = false) => {
    // @ts-ignore
    dispatch(newAuthorizeEmail({ email: val })).then((result) => {
      setCodeResend(isResend);
      return result?.payload;
    });
  };

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
        transform: `translate(${
          isRTL ? verificationStep * 100 : -(verificationStep * 100)
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
            {/* <Stack pb={1} className={classes.textCenter}> */}
            <Typography
              style={{
                fontWeight: 700,
                padding: "0 0 10px 0",
                color: "#0a74a9",
              }}
              variant="h4"
            >
              <>{t("campaigns.newsLetterMgmt.emailVerification.popupTitle")}</>
            </Typography>
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
                classes.actionButton,
                classes.actionButtonDarkBlue,
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
                  className: classes.textColorBlue,
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
                  classes.actionButton,
                  classes.actionButtonGreen,
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
                  {t(
                    "campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs"
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
                className={clsx(classes.textField, classes.maxWidth400)}
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
                  classes.actionButton,
                  classes.actionButtonDarkBlue,
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
                classes.actionButton,
                classes.actionButtonGreen,
                classes.buttonMinWidth,
                classes.mt6
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

  const POPUP_OBJECT: POPUP_OBJECT_TYPE = {
    title: "",
    icon: (
      <div className={classes.dialogIconContent}>
        <MdOutlineMarkEmailRead />
      </div>
    ),
    content: (
      <Stack className={clsx(classes.carouselContainer, classes.sidebar)}>
        {EMAIL_SLIDE_1()}
        {EMAIL_SLIDE_2()}
        {EMAIL_SLIDE_3()}
        {trials && trials >= 4 ? EMAIL_SLIDE_ERROR() : EMAIL_SLIDE_SUCCESS()}
      </Stack>
    ),
    renderButtons: () => (
      <Stack className={classes.textCenter} alignItems="center">
        {verificationStep < 1 && (
          <Button
            name="btnConfirm"
            variant="contained"
            size="small"
            onClick={() => {
              handleClose();
            }}
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton,
              classes.ml5
            )}
          >
            <>{t("common.Ok")}</>
          </Button>
        )}

        {verificationStep > 0 && verificationStep < 3 && (
          <Button
            name="btnConfirm"
            variant="contained"
            size="small"
            onClick={PrevSlide}
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton,
              classes.ml5
            )}
          >
            <>{t("notifications.back")}</>
          </Button>
        )}
      </Stack>
    ),
  };

  return { ...POPUP_OBJECT };
};

export default GetEmailVerificationDialog;
