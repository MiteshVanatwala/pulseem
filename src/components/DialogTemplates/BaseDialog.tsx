import React from "react";
import clsx from "clsx";
import {
  Typography,
  Button,
  Grid,
  Dialog,
  Paper,
} from "@material-ui/core";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { DialogOptions } from "../../helpers/Types/Dialog";
import { CgClose } from "react-icons/cg";
import { IoAlertCircleOutline } from "react-icons/io5";

export const BaseDialog = ({
  classes,
  childrenPadding = true,
  open = true,
  title = "",
  icon = "",
  children,
  showDivider = false,
  onClose = () => { },
  onCancel = () => { },
  onConfirm = () => { },
  renderButtons = null,
  renderTitle = null,
  disableBackdropClick = false,
  customContainerStyle = "",
  paperStyle = null,
  childrenStyle = null,
  contentStyle = null,
  cancelText = "common.Cancel",
  confirmText = "common.Ok",
  showDefaultButtons = true,
  exitButton = true,
  style = undefined,
  maxHeight = "",
  reduceTitle = false,
  confirmDisabled = false,
  className = ''
}: DialogOptions) => {
  const direction: { [key: string]: string } = {
    true: "rtl",
    false: "ltr",
  };

  const { t } = useTranslation();
  const { isRTL, windowSize } = useSelector(
    (state: { core: any }) => state.core
  );

  const onExit = () => {
    onCancel?.();
  };

  const RenderExitButton = () => {
    return <Stack
      onClick={onExit}
      className={clsx(classes.dialogExitButton, classes.f20, className, isRTL ? classes.dialogExitButtonRTL : classes.dialogExitButtonLTR)}
      justifyContent="center"
      alignItems="center"
      alignSelf="center"
    >
      <CgClose />
    </Stack>
  }
  const RenderTitleDefault = () => (
    <>
      <Typography
        className={clsx(
          reduceTitle ? classes?.reducedTitle : "",
          classes?.dialogTitle,
          windowSize !== "xs" && windowSize !== "sm"
            ? classes?.ellipsisText
            : null
        )}
      >
        {title}
      </Typography>
    </>
  );

  const RenderButtonsDefault = () => {
    return showDefaultButtons ? (
      <Grid
        container
        spacing={2}
        className={clsx(
          classes.dialogButtonsContainer,
          isRTL ? classes.rowReverse : null
        )}
      >
        <Grid item>
          <Button
            disabled={confirmDisabled}
            onClick={(e: React.MouseEvent<Element, MouseEvent>) => onConfirm(e)}
            className={clsx(
              classes.btn,
              classes.btnRounded,
              "saveFixedDetails"
            )}
          >
            <>{t(confirmText)}</>
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            size='small'
            onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
              if (onClose) {
                onClose();
              }
              return false;
            }}
            className={clsx(classes.btn, classes.btnRounded)}
          >
            <>{t(cancelText)}</>
          </Button>
        </Grid>
      </Grid>
    ) : (
      <></>
    );
  };

  const RenderIcon = () => {
    if (icon === false) return <></>;
    const alertIcon = <IoAlertCircleOutline />;
    return (
      <Stack>
        {icon || alertIcon}
      </Stack>
    );
  };

  const RenderTopBar = () => {
    return (
      <Stack
        className={clsx(classes.dialogTopBar)}
        direction="row"
        justifyContent={"space-between"}
      >
        <Stack direction={isRTL ? "row-reverse" : "row"} className={classes.w100}>
          {RenderIcon()}
          <Stack alignSelf="center" className="dialogTitle">
            {renderTitle ? renderTitle() : RenderTitleDefault()}
          </Stack>
        </Stack>
        {RenderExitButton()}
      </Stack>
    );
  };

  const RenderChildren = () => {
    return (
      <Stack
        className={clsx(classes.dialogChildren, childrenStyle, classes.sidebar)}
        style={{
          maxHeight: maxHeight
            ? maxHeight
            : windowSize !== "sm" && windowSize !== "xs"
              ? "calc(70vh)"
              : "calc(45vh)",
          minWidth:
            windowSize !== "xs" && windowSize !== "sm" ? 330 : undefined,
        }}
      >
        {children}
      </Stack>
    );
  };

  const RenderContent = () => {
    return (
      <Stack
        style={{ border: 'none', marginTop: 0 }}
        dir={direction[isRTL]}
        className={clsx(classes.dialogContent, contentStyle)}
      >
        {RenderChildren()}

        {renderButtons ? renderButtons() : RenderButtonsDefault()}
      </Stack>
    );
  };

  return (
    <Dialog
      disableEnforceFocus
      style={style}
      open={!!open}
      className={clsx(classes.dialogContainer, customContainerStyle)}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" || !disableBackdropClick) {
          onClose();
        }
      }}
    >
      <Paper className={clsx(classes.posRelative, paperStyle, classes.sidebar, className)}>
        {RenderTopBar()}
        {RenderContent()}
      </Paper >
    </Dialog >
  );
};
