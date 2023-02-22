import React from "react";
import clsx from "clsx";
import {
  Typography,
  Button,
  Grid,
  Dialog,
  Paper,
  Divider,
} from "@material-ui/core";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { DialogOptions } from "../../helpers/Types/Dialog";
import useCore from "../../helpers/hooks/Core";
import { CgClose } from "react-icons/cg";

export const BaseDialog = ({
  childrenPadding = true,
  open = true,
  title = "",
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
  exitButton = null,
  style = undefined,
  maxHeight = "",
  reduceTitle = false,
  confirmDisabled = false
}: DialogOptions) => {
  const direction: { [key: string]: string } = {
    true: "rtl",
    false: "ltr",
  };

  const { classes } = useCore();
  const { t } = useTranslation();
  const { isRTL, windowSize } = useSelector(
    (state: { core: any }) => state.core
  );

  const onExit = () => {
    onCancel?.();
  };

  const RenderExitButton = () =>
    exitButton ?? (
      <Stack
        onClick={onExit}
        className={clsx(classes.dialogExitButton, classes.f20, {
          [classes.dialogExitButtonRTL]: isRTL,
          [classes.dialogExitButtonLTR]: !isRTL,
        })}
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
      >
        <CgClose />
      </Stack>
    );

  const RenderTitleDefault = () => (
    <>
      <Typography
        style={{ textAlign: 'center', marginTop: 15, color: "#000" }}
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
      {showDivider && <Divider />}
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
            variant='contained'
            size='small'
            disabled={confirmDisabled}
            onClick={(e: React.MouseEvent<HTMLElement>) => onConfirm()}
            className={clsx(
              classes.solidDialogButton,
              classes.dialogConfirmButton
            )}>
            <>{t(confirmText)}</>
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            size='small'
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              if (onClose) {
                onClose();
              }
              return false;
            }}
            className={clsx(
              classes.solidDialogButton,
              classes.dialogCancelButton
            )}>
            <>{t(cancelText)}</>
          </Button>
        </Grid>
      </Grid>
    ) : (
      <></>
    );
  };

  const RenderChildren = () => {
    return (
      <Stack
        className={clsx(classes.dialogChildren, childrenStyle)}
        style={{
          maxHeight: maxHeight
            ? maxHeight
            : windowSize !== "sm" && windowSize !== "xs"
              ? "calc(65vh)"
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
      <>
        <RenderExitButton />
        <Stack
          dir={direction[isRTL]}
          className={clsx(classes.solidDialog, contentStyle)}
        >
          {renderTitle ? renderTitle() : RenderTitleDefault()}
          {RenderChildren()}

          {renderButtons ? renderButtons() : RenderButtonsDefault()}
        </Stack>
      </>
    );
  };

  return (
    <Dialog
      style={style}
      open={!!open}
      className={clsx(classes.dialogContainer, customContainerStyle)}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" || !disableBackdropClick) {
          onClose();
        }
      }}
    >
      <Paper className={clsx(classes.posRelative, paperStyle, classes.sidebar)}>
        {RenderContent()}
      </Paper>
    </Dialog>
  );
};
