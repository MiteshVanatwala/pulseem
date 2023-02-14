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
import { AlertIcon } from "../icons/index";
import { Stack } from "@mui/material";
import { DialogOptions } from "../../helpers/Types/Dialog";
import useCore from "../../helpers/hooks/Core";
import { CgClose } from "react-icons/cg";
import { IoAlertCircleOutline } from "react-icons/io5";

export const BaseDialog = ({
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
  exitButton = null,
  style = undefined,
  maxHeight = "",
  reduceTitle = false,
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

  const RenderIcon = () => {
    if (icon === false) return <></>;
    const alertIcon = <IoAlertCircleOutline />;
    return (
      <Stack
        className={clsx(classes.dialogIconContainer, {
          [classes.dialogIconContainerRTL]: isRTL,
          [classes.dialogIconContainerLTR]: !isRTL,
        })}
      >
        {icon || alertIcon}
      </Stack>
    );
  };

  const RenderTopBar = () => {
    return (
      <Stack
        style={{ width: '100%' }}
        className={clsx(classes.dialogTopBar)}
        direction="row"
        justifyContent={"space-between"}
      >
        <Stack direction={"row"} style={{ width: '100%' }}>
          {/* {RenderIcon()} */}
          <Stack alignSelf="center" style={{ width: '100%' }}>
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
      <Stack
        style={{ border: 'none' }}
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
        {RenderTopBar()}
        {RenderContent()}
      </Paper>
    </Dialog>
  );
};
