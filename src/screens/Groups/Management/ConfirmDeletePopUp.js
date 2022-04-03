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
                {'\uE0D2'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => handleDeleteGroup()}
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
