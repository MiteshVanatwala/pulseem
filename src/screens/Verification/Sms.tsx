import React, { useState, useEffect } from "react";
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
  getAuthorizeNumbers,
  sendVerificationCode,
  verifyCode,
} from "../../redux/reducers/smsSlice";

import { Stack } from "@mui/material";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import useCore from "../../helpers/hooks/Core";
import {
  POPUP_OBJECT_TYPE,
  verificationErrorType,
  Verification_Dialog_Popup,
} from "../../helpers/Types/Verification";

const GetSMSVerificationDialog = ({
  onClose = () => {},
}: Verification_Dialog_Popup) => {
  const { classes } = useCore();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: { core: any }) => state.core);
  const { username } = useSelector((state: { user: any }) => state.user);
  const { verifiedEmails, verifiedNumbers } = useSelector(
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
    dispatch(getAuthorizeNumbers());
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
    const result = dispatch(
      // @ts-ignore
      verifyCode({
        optinCode: verificationCode,
        phoneNumber: selectedVerificationContact,
      })
    );
    switch (result.payload.toLowerCase()) {
      case "ok": {
        NextSlide();
        break;
      }
      case "notmatch": {
        localStorage.setItem("verificationTrial", `${trials + 1}`);
        setVerificationError({
          code: t(
            "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match"
          ),
        });
        break;
      }
      case "expired": {
        localStorage.setItem("verificationTrial", `${trials + 1}`);
        setVerificationError({
          code: t(
            "campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired"
          ),
        });
        break;
      }
    }
  };

  const handleSendCode = (val: any, isResend: boolean = false) => {
    // @ts-ignore
    dispatch(sendVerificationCode({ username, number: val })).then(
      (result: any) => {
        setCodeResend(isResend);
        return result?.payload;
      }
    );
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

  const SMS_SLIDE_1 = () =>
    Slide({
      slideStyle: { position: "relative" },
      className_SlideBody: "cSlide firstSlide",
      children: (
        <>
          <Stack pb={1}>
            <Typography
              style={{
                fontWeight: 700,
                padding: "0 0 10px 0",
                color: "#0a74a9",
              }}
              variant="h4"
            >
              <>{t("sms.verificationDialogTitle")}</>
            </Typography>
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
                classes.actionButton,
                classes.actionButtonDarkBlue,
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
                  className: classes.textColorBlue,
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
                  classes.txtCenter
                )}
                placeholder={t("sms.enterNumberText")}
                error={!!verificationError?.Number}
                // helperText={verificationError?.email}
              />
            </Stack>
            <Stack mt={2}>
              <Button
                className={clsx(
                  classes.actionButton,
                  classes.actionButtonGreen
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
                className={clsx(classes.textField, classes.maxWidth400)}
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
                classes.actionButton,
                classes.actionButtonGreen,
                classes.mt15,
                classes.buttonMinWidth
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

  const POPUP_OBJECT: POPUP_OBJECT_TYPE = {
    title: "",
    icon: <div className={classes.dialogIconContent}>{"\uE11B"}</div>,
    content: (
      <Stack className={clsx(classes.carouselContainer, classes.sidebar)}>
        {SMS_SLIDE_1()}
        {SMS_SLIDE_2()}
        {SMS_SLIDE_3()}
        {trials && trials >= 4 ? SMS_SLIDE_ERROR() : SMS_SLIDE_SUCCESS()}
      </Stack>
    ),
    renderButtons: () => (
      <Stack className={classes.textCenter}>
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

export default GetSMSVerificationDialog;
