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
  newAuthorizeEmail,
  verifyEmailCode,
} from "../../redux/reducers/commonSlice";
import { getAuthorizedEmails } from "../../redux/reducers/commonSlice";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import useCore from "../../helpers/hooks/Core";
import { Stack } from "@mui/material";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import {
  POPUP_OBJECT_TYPE,
  verificationErrorType,
} from "../../helpers/Types/Verification";

const useEmailVerification = ({ onClose = () => {} }) => {
  const core = useCore();
  const { t } = useTranslation();
  const { classes, isRTL } = core;
  const dispatch: any = useDispatch();
  const { verifiedEmails } = useSelector(
    (state: { common: any }) => state.common
  );
  const [verificationStep, setStep] = useState(1);
  const [codeResend, setCodeResend] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [authorizedTypeDisabled, setAuthorizedTypeDisabled] = useState(false);
  const [selectedVerificationContact, setSelectedVerificationContact] =
    useState("");
  const [verificationError, setVerificationError] =
    useState<verificationErrorType | null>(null);
  let trials = localStorage.getItem("verificationTrial")
    ? Number(localStorage.getItem("verificationTrial"))
    : 0;

  useEffect(() => {
    if (!verifiedEmails || verifiedEmails.length === 0)
      dispatch(getAuthorizedEmails());
  }, []);

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

  const handleSendCode = (val: any, isResend: boolean = false) => {
    // @ts-ignore
    dispatch(newAuthorizeEmail({ email: val })).then((result) => {
      setCodeResend(isResend);
      return result?.payload;
    });
  };
  //#region Slides

  const EMAIL_SLIDE_1 = () => (
    <Slide
      slideStyle={{ position: "relative" }}
      className_SlideBody="cSlide firstSlide"
    >
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
        <Typography className={clsx(classes.pb25, classes.bold)} variant="h6">
          <>
            {t(
              "campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails"
            )}
          </>{" "}
        </Typography>
        <Stack className={clsx("contactDataBox", classes.sidebar)}>
          {verifiedEmails?.map(
            ({ IsOptIn, Number }: { IsOptIn: boolean; Number: string }) => (
              <Stack className={clsx(classes.flex, classes.hAuto, "emailBox")}>
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
    </Slide>
  );

  const EMAIL_SLIDE_2 = () => (
    <Slide
      slideStyle={{ position: "relative" }}
      className_SlideBody="cFlexSlide secondSlide"
    >
      <Stack className="titleDescBox">
        <Typography variant="h4">
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.secondSlide.title")}
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
              !!verificationError?.email && setVerificationError({ email: "" });
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
        <Stack mt={2}>
          <Button
            className={clsx(classes.actionButton, classes.actionButtonGreen)}
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
    </Slide>
  );

  const EMAIL_SLIDE_3 = () => (
    <Slide
      slideStyle={{ position: "relative" }}
      className_SlideBody="cFlexSlide"
    >
      <Stack>
        <Typography variant="h4" className={classes.bold}>
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.thirdSlide.title")}
          </>
        </Typography>
        <Typography variant="body1" className={classes.mt4}>
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1")}
          </>
        </Typography>
        <Typography variant="body1">
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2")}
          </>
        </Typography>
      </Stack>
      <Stack className={clsx(classes.flexColumn, classes.mt20)}>
        <Stack>
          <TextField
            variant="outlined"
            size="small"
            className={clsx(classes.textField, classes.maxWidth400)}
            onChange={(e) => {
              !!verificationError?.code && setVerificationError({ code: "" });
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
            onClick={() => handleSendCode(selectedVerificationContact, true)}
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
    </Slide>
  );

  const OnError = () => (
    <Slide
      slideStyle={{ position: "relative" }}
      className_SlideBody="cFlexSlide"
    >
      <Stack mt={4}>
        <Typography variant="h4">
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.errorSlide.title")}
          </>
        </Typography>
        <Typography variant="body1" className={classes.mt4}>
          <>{t("campaigns.newsLetterMgmt.emailVerification.errorSlide.desc")}</>
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
            {t("campaigns.newsLetterMgmt.emailVerification.errorSlide.phone")}:
            035240290
          </>
        </Typography>
        <Typography variant="body1">
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.errorSlide.email")}:
            support@pulseem.com
          </>
        </Typography>
      </Stack>
    </Slide>
  );

  const OnSuccess = () => (
    <Slide
      slideStyle={{ position: "relative" }}
      className_SlideBody="cFlexSlide"
    >
      <Stack>
        <Typography variant="h4">
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.successSlide.title")}
          </>
        </Typography>
        <Typography variant="body1" className={clsx(classes.mt4, classes.mb15)}>
          <>
            {t("campaigns.newsLetterMgmt.emailVerification.successSlide.desc")}{" "}
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
    </Slide>
  );
  const steps: POPUP_OBJECT_TYPE[] = [
    {
      step: 1,
      title: "",
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: <>{EMAIL_SLIDE_1()}</>,
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
    },
    {
      step: 2,
      title: "",
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: <>{EMAIL_SLIDE_2()}</>,
      renderButtons: null,
    },
    {
      step: 3,
      title: "",
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: <>{EMAIL_SLIDE_3()}</>,
      renderButtons: null,
    },
    {
      step: -1,
      title: "",
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: <>{OnError()}</>,
      renderButtons: null,
    },
    {
      step: 100,
      title: "",
      icon: (
        <div className={classes.dialogIconContent}>
          <MdOutlineMarkEmailRead />
        </div>
      ),
      content: <>{OnSuccess()}</>,
      renderButtons: null,
    },
  ];

  //#endregion Slides
  //#region Actions
  const handleClose = (callback?: Function) => {
    callback?.();
    onClose?.();
    verificationStep && setStep(1);
    verificationError && setVerificationError(null);
    selectedVerificationContact && setSelectedVerificationContact("");
    verificationCode && setVerificationCode("");
    if (localStorage.getItem("verificationTrial"))
      localStorage.removeItem("verificationTrial");
    setAuthorizedTypeDisabled(false);
  };
  const PrevSlide = () => {
    if (verificationStep === 0) {
      return setStep(5);
    }
    return setStep(verificationStep - 1);
  };
  const NextSlide = () => {
    if (verificationStep === steps.length) {
      return setStep(1);
    }
    if (setVerificationError) {
      setVerificationError(null);
    }
    setCodeResend(false);
    return setStep(verificationStep + 1);
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
          setStep(100);
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
  //#endregion Actions

  const VerificationDialog: { [key: string]: POPUP_OBJECT_TYPE[] } = {
    steps: steps,
  };

  return VerificationDialog;
};

export default useEmailVerification;
