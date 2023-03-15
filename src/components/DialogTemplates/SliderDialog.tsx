import React, { useState } from "react";
import clsx from "clsx";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import {
  Slider_Dialog_PropTypes,
  Slide_PropTypes,
} from "../../helpers/Types/Dialog";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { POPUP_OBJECT_TYPE } from "../../helpers/Types/Verification";
import { Button } from "@material-ui/core";

const SliderDialog = ({
  classes,
  slides = [],
  isOpen = false,
  VARIABLE_SLIDE_HEIGHTS = null,
  navigationButtons = true,
  defaultButtons = true,
  customButtons = null,
  confirmText = "common.Ok",
  backText = "notifications.back",
  onClose = () => { },
  onConfirm = () => { },
  rollBack = false,
  currentStep = 0,
  setCurrentStep = () => { },
}: Slider_Dialog_PropTypes) => {
  const { t } = useTranslation();
  const dispatch: any = useDispatch();
  const { isRTL } = useSelector((state: { core: any }) => state.core);
  const [step, setStep] = useState(0);

  const NextSlide = async (callback?: Function) => {
    try {
      await callback?.();
      if (navigationButtons) {
        step < slides.length - 1
          ? setStep(step + 1)
          : step === slides.length - 1 && rollBack && setStep(0);
      }
      if (!navigationButtons && setCurrentStep && currentStep) {
        currentStep < slides.length - 1
          ? setCurrentStep(currentStep || 0 + 1)
          : currentStep === slides.length - 1 && rollBack && setCurrentStep(0);
      }
    } catch (error) {
      console.error("Slide-Next Error:", error);
    }
  };

  const PrevSlide = async (callback?: Function) => {
    try {
      await callback?.();
      if (navigationButtons) {
        step >= 0
          ? setStep(step - 1)
          : step === 0 && rollBack && setStep(slides.length - 1);
      }
      if (!navigationButtons) {
        currentStep > 0
          ? setCurrentStep(currentStep - 1)
          : currentStep === 0 && rollBack && setCurrentStep(slides.length - 1);
      }
    } catch (error) {
      console.error("Slide-Prev Error:", error);
    }
  };

  const handleClose = (callback?: Function) => {
    onClose();
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
      {(step || currentStep) === 0 && (
        <Button
          name="btnConfirm"
          variant="contained"
          size="small"
          onClick={async (e: React.MouseEvent<HTMLElement>) => {
            NextSlide(onConfirm?.());
            // try {
            //   await onConfirm();
            //   NextSlide();
            // } catch (error) {
            //   console.log("Error:", error);
            // }
          }}
          className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
        >
          <>{t(confirmText)}</>
        </Button>
      )}
      {(step || currentStep) > 0 &&
        (step || currentStep) < slides.length - 1 && (
          <Button
            variant="contained"
            size="small"
            onClick={async (e: React.MouseEvent<HTMLElement>) => {
              // PrevSlide(onClose?.());
              PrevSlide();
              // if (onClose) {
              // try {
              //   await onClose?.();
              //   PrevSlide();
              // } catch (error) {
              //   console.log("ERROR-Back:", error);
              // }
              // }
              // return false;
            }}
            className={clsx(classes.dialogButton, classes.dialogCancelButton)}
          >
            <>{t(backText)}</>
          </Button>
        )}
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
          {customButtons && customButtons}
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
  }: Slide_PropTypes) => (
    <Stack
      className={clsx(
        classes.carouselItem,
        classes.T05S,
        classes.emailVerItemContainer
      )}
      style={{
        transform: `translate(${isRTL ? step || currentStep * 100 : -(step || currentStep * 100)
          }%)`,
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
        {slides.map(
          (elem: any) =>
            Slide({
              ...elem,
            })
          //   Slide({
          //     children: elem,
          //     style_SlideBody: { height: 300, width: 500 },
          //   })
        )}
      </>
    ),
    renderButtons: renderButtons,
  };

  return (
    <BaseDialog
      classes={classes}
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
