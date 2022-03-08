// import React, { useState, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';
import clsx from "clsx";
import {
    Typography,
    Grid,
    Button,
    Box,
} from "@material-ui/core";

import { useTranslation } from "react-i18next";
import { Dialog } from "../../../components/managment/Dialog";

const ConfirmDeletePopUp = ({ classes, isOpen = false, onClose, windowSize, handleDeleteGroup }) => {

    const { t } = useTranslation();

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={t("group.delete")}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => handleDeleteGroup()}
            renderButtons={() => (
                <Grid container spacing={2} className={classes.linePadding}>
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        sm={4}
                        className={classes.txtCenter}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogCancelButton,
                                classes.fullWidth,
                                classes.whiteSpaceNoWrap
                            )}
                            onClick={onClose}
                        >
                            {t("group.cancel")}
                        </Button>
                    </Grid>
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        sm={4}
                        className={classes.txtCenter}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                classes.fullWidth,
                                classes.whiteSpaceNoWrap,
                                classes.textUppercase
                            )}
                            onClick={() => handleDeleteGroup()}
                        >
                            {t("group.ok")}
                        </Button>
                    </Grid>
                </Grid>
            )}
            customContainerStyle=""
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box>
                <Typography variant="subtitle1">
                    {t("group.deleteConfirm")}
                </Typography>
            </Box>
        </Dialog>
    );
};

ConfirmDeletePopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    handleDeleteGroup: PropTypes.func.isRequired
}

export default ConfirmDeletePopUp;