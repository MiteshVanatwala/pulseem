import React from "react";
import clsx from "clsx";
import { Typography, Button, Grid, Dialog, Paper, Divider } from "@material-ui/core";
import "moment/locale/he";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { AlertIcon } from "../icons/index";
import { Stack } from "@mui/material";
import { DialogOptions } from "../../helpers/Types/Dialog";
import useCore from '../../helpers/hooks/Core';

export const BaseDialog = ({
    childrenPadding = true,
    open = true,
    title = "",
    icon = <AlertIcon classes={undefined} />,
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
    reduceTitle = false
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
                className={clsx(classes.dialogExitButton, {
                    [classes.dialogExitButtonRTL]: isRTL,
                    [classes.dialogExitButtonLTR]: !isRTL,
                })}
            >
                x
            </Stack>
        );

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
            {showDivider && <Divider />}
        </>
    );

    const RenderButtonsDefault = () => {
        return showDefaultButtons ? (
            <Grid
                container
                spacing={4}
                className={clsx(
                    classes.dialogButtonsContainer,
                    isRTL ? classes.rowReverse : null
                )}
            >
                <Grid item>
                    <Button
                        name="btnConfirm"
                        variant="contained"
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLElement>) => onConfirm()}
                        className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
                    >
                        {t(confirmText)}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                            if (onClose) {
                                onClose()
                            }
                            return false;
                        }}
                        className={clsx(classes.dialogButton, classes.dialogCancelButton)}
                    >
                        {t(cancelText)}
                    </Button>
                </Grid>
            </Grid>
        ) : (
            <></>
        );
    };

    const RenderIcon = () => {
        const alertIcon = <AlertIcon classes={classes} />;
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
            <Stack
                dir={direction[isRTL]}
                className={clsx(classes.dialogContent, contentStyle)}
            >
                {renderTitle ? renderTitle() : RenderTitleDefault()}
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
                {RenderExitButton()}
                {RenderContent()}
                {icon !== "NONE" && RenderIcon()}
            </Paper>
        </Dialog>
    );
};
