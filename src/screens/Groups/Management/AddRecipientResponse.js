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

const AddRecipientResponse = ({ classes, isOpen = false, onClose, windowSize, title, message }) => {

    const { t } = useTranslation();

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={title}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onConfirm={onClose}
            confirmText="common.Ok"
            showDefaultButtons={false}
            renderButtons={() => {
              return <Button
                variant='contained'
                style={{ margin: '0 auto' }}
                onClick={onClose}
                className={clsx(
                  classes.dialogButton,
                  classes.dialogConfirmButton
                )}>
                {t('common.confirm')}
              </Button>
            }}
        >
            <Box>
                <Typography variant="subtitle1">
                    {message}
                </Typography>
            </Box>
        </Dialog>
    );
};

export default AddRecipientResponse;
