import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { Stack } from "@mui/material";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import useCore from "../../helpers/hooks/Core";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { Slider_Dialog_PropTypes } from "../../helpers/Types/Dialog";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { POPUP_OBJECT_TYPE } from "../../helpers/Types/Verification";
import { Button } from "@material-ui/core";
import { TYPE_JSX } from "../../helpers/Types/common";

const SliderDialog = ({
  slides = [],
  isOpen = false,
  VARIABLE_SLIDE_HEIGHTS = null,
  navigationButtons = true,
  defaultButtons = true,
  customButtons = "",
  confirmText = "common.Ok",
  cancelText = "common.Cancel",
  onClose = () => {},
  onConfirm = () => {},
  rollBack = false,
}: Slider_Dialog_PropTypes) => {
  const { classes } = useCore();
  const { t } = useTranslation();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: { core: any }) => state.core);
  const [step, setStep] = useState(0);

  const NextSlide = () => {
    step < slides.length - 1
      ? setStep(step + 1)
      : step === slides.length - 1 && rollBack && setStep(0);
    // if (verificationStep === 4) {
    //   return setVerificationStep(0);
    // }
    // if (setVerificationError) {
    //   setVerificationError(null);
    // }
    // setCodeResend(false);
    // return setVerificationStep(verificationStep + 1);
  };

  const PrevSlide = () => {
    step >= 0
      ? setStep(step - 1)
      : step === 0 && rollBack && setStep(slides.length - 1);
    // if (verificationStep === 0) {
    //   return setVerificationStep(5);
    // }
    // return setVerificationStep(verificationStep - 1);
  };

  const handleClose = (callback?: Function) => {
    // callback?.();
    // onClose?.();
    // verificationStep && setVerificationStep(0);
    // verificationError && setVerificationError(null);
    // selectedVerificationContact && setSelectedVerificationContact("");
    // verificationCode && setVerificationCode("");
    // if (localStorage.getItem("verificationTrial"))
    //   localStorage.removeItem("verificationTrial");
    // setAuthorizedTypeDisabled(false);
  };

  const defaultDialogButtons = () => (
    <>
      <Button
        name="btnConfirm"
        variant="contained"
        size="small"
        onClick={(e: React.MouseEvent<HTMLElement>) => onConfirm()}
        className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
      >
        <>{t(confirmText)}</>
      </Button>
      <Button
        variant="contained"
        size="small"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          if (onClose) {
            onClose();
          }
          return false;
        }}
        className={clsx(classes.dialogButton, classes.dialogCancelButton)}
      >
        <>{t(cancelText)}</>
      </Button>
    </>
  );

  const renderButtons = () => {
    const BtnPrevious = (
      <Button
        name="btnConfirm"
        variant="contained"
        size="small"
        onClick={() => {
          PrevSlide();
        }}
        className={clsx(
          classes.dialogButton,
          classes.dialogConfirmButton,
          classes.ml5
        )}
      >
        <>{t("notifications.back")}</>
      </Button>
    );

    const BtnNext = (
      <Button
        name="btnConfirm"
        variant="contained"
        size="small"
        onClick={() => {
          NextSlide();
        }}
        className={clsx(
          classes.dialogButton,
          classes.dialogConfirmButton,
          classes.ml5
        )}
      >
        <>{t("common.next")}</>
      </Button>
    );

    return (
      <Stack justifyContent="space-between" direction="row">
        <Stack>{navigationButtons && BtnPrevious}</Stack>
        <Stack
          alignSelf="center"
          direction="row"
          justifyContent="space-around"
          spacing={2}
        >
          {defaultButtons && defaultDialogButtons()}
          {customButtons}
        </Stack>
        <Stack>{navigationButtons && BtnNext}</Stack>
      </Stack>
    );
  };

  const Slide = ({
    children = "",
    className_SlideBody = "",
    style_SlideBody = {},
    slideStyle = {},
  }: {
    children: any;
    className_SlideBody?: any;
    style_SlideBody?: CSSProperties;
    slideStyle?: CSSProperties;
  }) => (
    <Stack
      className={clsx(
        classes.carouselItem,
        classes.T05S,
        classes.emailVerItemContainer
      )}
      style={{
        transform: `translate(${isRTL ? step * 100 : -(step * 100)}%)`,
        ...slideStyle,
      }}
    >
      <Stack style={{ ...style_SlideBody }} className={className_SlideBody}>
        {children}
      </Stack>
    </Stack>
  );

  const POPUP_OBJECT: POPUP_OBJECT_TYPE = {
    title: "",
    icon: (
      <div className={classes.dialogIconContent}>
        <MdOutlineMarkEmailRead />
      </div>
    ),
    content: (
      <>
        {slides.map((elem: any) =>
          Slide({
            children: elem,
            style_SlideBody: { height: 300, width: 500 },
          })
        )}
      </>
    ),
    renderButtons: renderButtons,
  };

  return (
    <BaseDialog
      open={isOpen}
      onClose={handleClose}
      onCancel={handleClose}
      {...POPUP_OBJECT}
    >
      <Stack
        className={clsx(classes.carouselContainer, classes.sidebar)}
        style={
          VARIABLE_SLIDE_HEIGHTS
            ? {
                height: `${VARIABLE_SLIDE_HEIGHTS[step]}`,
                transition: "height .5s",
              }
            : {}
        }
      >
        {POPUP_OBJECT.content}
      </Stack>
    </BaseDialog>
  );
};

export default SliderDialog;
