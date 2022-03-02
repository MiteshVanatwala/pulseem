import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
    Typography,
    Divider,
    TableBody,
    Grid,
    Button,
    TextField,
    Box,
    Checkbox,
    FormControlLabel,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@material-ui/core";
// import {ExpandMoreIcon} from '@mui/i'
import { SearchIcon, ExportIcon } from "../../../assets/images/managment/index";
import { CSVLink } from "react-csv";
import {
    TablePagination,
    SearchField,
} from "../../../components/managment/index";

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../../components/Loader/Loader";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { setCookie } from "../../../helpers/cookies";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import DataTable from "../../../components/Table/DataTable";
// import { ExcelData, StaticData } from "../tempConstants";
import { GrGroup } from "react-icons/gr";
import { BsInfoCircleFill, BsInfoSquare } from "react-icons/bs";
import { exportFile } from "../../../helpers/exportFromJson";
import { preferredOrder } from "../../../helpers/exportHelper";
import RenderRow from "./RenderRow";
import RenderPhoneRow from "./RenderPhoneRow";
import Toast from '../../../components/Toast/Toast.component';
import {
    getGroups,
    deleteGroups,
    createGroup,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";

const AddRecipientPopup = ({ classes, isOpen = false, onClose, setLoader, onCreateGroupResponse, windowSize }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const DEFAULT_NEW_GROUP = {
        ActiveCell: 0,
        ActiveEmails: 0,
        DynamicData: null,
        DynamicLastUpdate: null,
        DynamicUpdatePolicy: null,
        GroupID: null,
        InvalidCell: 0,
        InvalidEmails: 0,
        IsDynamic: true,
        IsTestGroup: null,
        PendingEmails: 0,
        Recipients: 0,
        RemovedCell: 0,
        RemovedEmails: 0,
        RestrictedEmails: 0,
        SubAccountID: 0,
        TotalRecipients: 0,
        GroupName: "",
        UpdatedDate: new Date(),
        CreatedDate: new Date(),
    };
    const [newGroupData, setNewGroupData] = useState(DEFAULT_NEW_GROUP);



    const handleAddGroup = async (data) => {
        try {
            onClose()
            setLoader(true);
            const response = await dispatch(createGroup(data));
            setLoader(false);
            onCreateGroupResponse();
        } catch (err) {
            return false;
        }
    };


    return (
        <Dialog
            classes={classes}
            open={isOpen}
            // title={t("group.createNew")}
            title={t('recipient.recipientAddPopUpTitle')}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => {
                const result = handleAddGroup(newGroupData);
                if (result) {
                    setNewGroupData(DEFAULT_NEW_GROUP);
                }
            }}
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
                                classes.textCapitalize
                            )}
                            onClick={() => {
                                const result = handleAddGroup(newGroupData);
                                if (result) {
                                    setNewGroupData(DEFAULT_NEW_GROUP);
                                }
                            }}
                        >
                            {t("group.ok")}
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
                                classes.fullWidth,
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                classes.actionButtonLightGreen,
                                classes.whiteSpaceNoWrap
                            )}
                        // onClick={
                        //TODO: ADD ADD Recipient Functionality
                        //     () => setDialogType({
                        //     type: 'restore',
                        //     data: smsDeletedData
                        // })
                        // }
                        >
                            {t("recipient.addAnotherRecipient")}
                        </Button>
                    </Grid>

                </Grid>
            )}
            customContainerStyle=""
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >

            <Box
                className={clsx(
                    classes.customDialogContentBox,
                    classes.flex,
                    classes.mt4,
                    classes.responsiveFlex
                )}
            >

                <Accordion>
                    <AccordionSummary
                        expandIcon={<SearchIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>Accordion 1</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                            malesuada lacus ex, sit amet blandit leo lobortis eget.
                        </Typography>
                    </AccordionDetails>
                </Accordion>





                <Box className={classes.flex1} style={{ marginInlineEnd: 10 }}>
                    <Typography>Group Name:</Typography>
                </Box>
                <Box className={classes.flex2} style={{ marginInlineEnd: 10 }}>
                    <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        value={newGroupData.GroupName}
                        className={clsx(classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setNewGroupData({
                                ...newGroupData,
                                GroupName: e.target.value,
                            });
                        }}
                    />
                </Box>
                <Box
                    className={clsx(
                        classes.flex1,
                        classes.flex,
                        classes.responsiveFlex
                    )}
                >
                    <FormControlLabel
                        control={
                            <Checkbox name="testGroup" size="small" color="primary" />
                        }
                        label="Test Group"
                    />
                    <CustomTooltip
                        isSimpleTooltip={false}
                        interactive={true}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack,
                        }}
                        arrow={true}
                        style={{ fontSize: 18, fontWeight: "bold" }}
                        placement={"top"}
                        title={
                            <Typography noWrap={false}>
                                {t("group.testGroupInfo")}
                            </Typography>
                        }
                        text={t("group.testGroupInfo")}
                    >
                        <span>
                            <BsInfoCircleFill />
                        </span>
                    </CustomTooltip>
                </Box>
            </Box>
        </Dialog>
    );
};

export default AddRecipientPopup;