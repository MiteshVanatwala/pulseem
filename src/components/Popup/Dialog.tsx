import clsx from "clsx";
import {
  Typography,
  Divider,
  Grid,
  Button,
  Dialog as BaseDialog,
  Paper,
  Box,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export class Props {
  exit: boolean = false;
  reduceTitle: boolean = false;
  maxHeight: string = "";
}
export class Options extends Props {
  Classes: any;
  Children: any;
  Title: string = "";
  Style: any = null;
  Open: boolean = false;
  PaperStyle: any = null;
  ContentStyle: any = null;
  ChildrenStyle: any = null;
  RenderButtons: any = null;
  ChildrenPadding: boolean = true;
  ShowDivider: boolean = false;
  CustomContainerStyle: string = "";
  ShowDefaultButtons: boolean = true;
  OnClose: VoidFunction = () => null;
  OnCancel: VoidFunction = () => null;
  OnConfirm: VoidFunction = () => null;
  RenderTitle: VoidFunction = () => null;
  DisableBackdropClick: boolean = false;
  ConfirmText: string = "common.Ok";
  CancelText: string = "common.Cancel";
}

export const Dialog = (options: Options) => {
  const direction: any = {
    true: "rtl",
    false: "ltr",
  };

  const { t } = useTranslation();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);

  const onExit = () => {
    if (options.OnCancel !== null) {
      options.OnCancel();
    } else {
      options.OnClose();
    }
  };
  const renderExitButton = () => {
    return (
      <>
        {options.exit ? null : (
          <Box
            onClick={onExit}
            className={clsx(options.Classes.dialogExitButton, {
              [options.Classes.dialogExitButtonRTL]: isRTL,
              [options.Classes.dialogExitButtonLTR]: !isRTL,
            })}
          >
            x
          </Box>
        )}{" "}
      </>
    );
  };
  const renderTitleDefault = () => {
    return (
      <>
        <Typography
          className={clsx(
            options.reduceTitle ? options.Classes.reducedTitle : "",
            options.Classes.dialogTitle,
            windowSize !== "xs" && windowSize !== "sm"
              ? options.Classes.ellipsisText
              : null
          )}
        >
          {options.Title}
        </Typography>
        {options.ShowDivider && <Divider />}
      </>
    );
  };
  const renderButtonsDefault = () => {
    return (
      options.ShowDefaultButtons && (
        <Grid
          container
          spacing={4}
          className={clsx(
            options.Classes.dialogButtonsContainer,
            isRTL ? options.Classes.rowReverse : null
          )}
        >
          <Grid item>
            <Button
              variant="contained"
              size="small"
              onClick={options.OnConfirm}
              className={clsx(
                options.Classes.dialogButton,
                options.Classes.dialogConfirmButton
              )}
            >
              <>{t(options.ConfirmText)}</>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="small"
              onClick={options.OnClose}
              className={clsx(
                options.Classes.dialogButton,
                options.Classes.dialogCancelButton
              )}
            >
              <>{t(options.CancelText)}</>
            </Button>
          </Grid>
        </Grid>
      )
    );
  };
  const renderChildren = () => {
    return (
      <Box
        className={clsx(options.Classes.dialogChildren, options.ChildrenStyle)}
        style={{
          maxHeight: options.maxHeight
            ? options.maxHeight
            : windowSize !== "sm" && windowSize !== "xs"
              ? "calc(65vh)"
              : "calc(45vh)",
          minWidth:
            windowSize !== "xs" && windowSize !== "sm" ? "330px" : "0px",
        }}
      >
        {options.Children}
      </Box>
    );
  };
  const renderContent = () => {
    return (
      <Box
        dir={direction[isRTL]}
        className={clsx(options.Classes.dialogContent, options.ContentStyle)}
      >
        {options.RenderTitle ? options.RenderTitle() : renderTitleDefault()}
        {renderChildren()}
        {options.RenderButtons
          ? options.RenderButtons()
          : renderButtonsDefault()}
      </Box>
    );
  };
  return (
    <BaseDialog
      classes={options.Classes}
      style={options.Style}
      open={!!options.Open}
      className={clsx(
        options.Classes.dialogContainer,
        options.CustomContainerStyle !== ""
          ? options.CustomContainerStyle
          : null
      )}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" || !options.DisableBackdropClick) {
          options.OnClose();
        }
      }}
    >
      <Paper
        className={clsx(
          options.Classes.posRelative,
          options.PaperStyle,
          options.Classes.sidebar
        )}
      >
        {renderExitButton()}
        {renderContent()}
      </Paper>
    </BaseDialog>
  );
};
