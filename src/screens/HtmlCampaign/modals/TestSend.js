import React, { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import {
    Grid,
    Typography,
    Divider,
    Button,
    TextField,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    makeStyles
} from "@material-ui/core";
import { RiSendPlaneFill } from '@material-ui/icons/ri'

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { Dialog } from "../../../components/managment/Dialog";
const TestSend = ({classes, isOpen = false, onClose}) => {
  return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={t('recipient.recipientAddPopUpTitle')}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            reduceTitle
            style={{ minWidth: 240 }}
            customContainerStyle=""
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box className={clsx(localClasses.contentBox, classes.mt10)}>

            </Box>
            <Loader isOpen={showLaoder} />
        </Dialog>
    );
}

export const TestSend;
