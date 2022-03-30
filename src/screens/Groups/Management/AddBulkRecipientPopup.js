import React, { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import {
    Typography,
    Grid,
    Button,
    TextField,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    makeStyles
} from "@material-ui/core";
import { DateField } from '../../../components/managment/index'

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { GrFormAdd, GrFormSubtract } from "react-icons/gr";
import {
    addRecipient,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { DEFAULT_RECIPIENT_DATA, ADD_RECIPIENT_TABS, ADD_RECIPIENT_REQUIRED_ERRORS } from "../../../model/Groups/Contants";
import GroupTags from "../../../components/Groups/GroupTags";
import { ValidateEmail, ValidateNumber } from "../../../helpers/utils";
import { UploadSettings } from "../tempConstants";
import UploadXL from '../../../components/Files/UploadXL'
import { FaUpload } from "react-icons/fa";

const useStyles = makeStyles({
    contentBox: {
        "width": 560,
        "height": '50vh'
    },
    accordionIcons: {
        position: 'absolute',
        '& path': {
            stroke: '#0371ad'
        }
    }
});

const AddBulkRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    windowSize,
    selectedGroups,
    selectGroup,
    setToastMessage,
    ToastMessages,
    onAddRecipient = () => null
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const localClasses = useStyles()

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            title={
                <Box className={clsx(classes.flex, classes.justifyBetween)}>
                    <Box>{t('recipient.bulkImportTitle')}</Box>
                    <Box>
                        <label htmlFor="uploadxl">
                            <FaUpload color='#000' />
                        </label>
                    </Box>
                </Box>
            }
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            renderButtons={() => (<></>)}
            customContainerStyle=""
        >
            <Box className={localClasses.contentBox}>
                <UploadXL
                    classes={classes}
                    onDone={onAddRecipient}
                    settings={UploadSettings.GROUPS}
                    uploadToGroups={selectedGroups}
                />
            </Box>

        </Dialog>
    );
};

export default AddBulkRecipientPopup;
