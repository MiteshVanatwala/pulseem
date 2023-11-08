import { useState } from "react";
import PropTypes from 'prop-types';
import clsx from "clsx";
import {
    Typography,
    Grid,
    Button,
    TextField,
    Box,
    Checkbox,
    FormControlLabel,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import CustomTooltip from "../../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";
import {
    createGroup,
    getGroupsBySubAccountId
} from "../../../../redux/reducers/groupSlice";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { getTestGroups } from "../../../../redux/reducers/smsSlice";
import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";

const AddGroupPopUp = ({
    classes,
    isOpen = false,
    onCancel,
    onClose,
    setLoader,
    windowSize,
    ToastMessages,
    setToastMessage,
    addClientByQuery = false,
    createGroupCallback,
    addAnotherRecCallback,
    getData,
    isDynamic = false,
    handleResponses }) => {
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
        IsDynamic: isDynamic,
        IsTestGroup: false,
        PendingClients: 0,
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
    const [saveDisabled, setSaveDisabled] = useState(false);

    const handleAddGroup = async (data, callback) => {
        setSaveDisabled(true);
        if (!newGroupData.GroupName) {
            setToastMessage(ToastMessages.GROUP_NAME_EMPTY)
            setSaveDisabled(false);
            return false;
        }
        try {
            setLoader(true);
            const response = await dispatch(createGroup(data));
            setLoader(false);
            handleResponses(response, {
                S_201: {
                    code: 201,
                    message: ToastMessages.GROUP_CREATED,
                    Func: () => {
                        new Promise(async (resolutionFunc, rejectionFunc) => {
                            await dispatch(getGroupsBySubAccountId())
                            await resolutionFunc(getData());
                            setNewGroupData(DEFAULT_NEW_GROUP);
                            onClose()
                            if (data.IsTestGroup)
                                await dispatch(getTestGroups());
                        }).then((res) => {
                            callback?.(response.payload.Message)
                        })
                    }
                },
                S_400: {
                    code: 400,
                    message: ToastMessages.GROUP_INPUT_INCORRECT,
                    Func: () => null
                },
                S_401: {
                    code: 401,
                    message: ToastMessages.GROUP_INVALID_API,
                    Func: () => null
                },
                S_405: {
                    code: 405,
                    message: ToastMessages.MAX_GROUPS_EXCEEDED,
                    Func: () => null
                },
                S_422: {
                    code: 422,
                    message: ToastMessages.GROUP_ALREADY_EXIST,
                    Func: () => null
                },
                default: {
                    message: ToastMessages.GROUP_ERROR,
                    Func: () => null
                },
            })

        } catch (err) {
            dispatch(sendToTeamChannel({
                MethodName: 'init2FA',
                ComponentName: 'Dashboard.js',
                Text: err
            }));
            return false;
        }
        setSaveDisabled(false);
    };

    return (
        <>
            <BaseDialog
                classes={classes}
                open={isOpen}
                title={t("group.createNew")}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                onClose={onClose}
                onCancel={onCancel ?? onClose}
                onConfirm={() => {
                    const result = handleAddGroup(newGroupData);
                    if (result) {
                        setNewGroupData(DEFAULT_NEW_GROUP);
                    }
                }}
                renderButtons={() => (
                    <Grid container spacing={2} className={classes.linePadding} justifyContent='center'>
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
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.fullWidth,
                                    classes.whiteSpaceNoWrap
                                )}
                                onClick={onClose}
                            >
                                {t("group.cancel")}
                            </Button>
                        </Grid>
                        {!addClientByQuery && !isDynamic && <Grid
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
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.actionButtonLightGreen,
                                    classes.whiteSpaceNoWrap,
                                    !newGroupData.GroupName || saveDisabled ? classes.disabled : '',

                                )}
                                onClick={() => handleAddGroup(newGroupData, addAnotherRecCallback)}
                            >
                                {t("recipient.addRecipients")}
                            </Button>
                        </Grid>
                        }
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
                                    classes.btn,
                                    classes.btnRounded,
                                    classes.fullWidth,
                                    classes.whiteSpaceNoWrap,
                                    classes.textUppercase,
                                    saveDisabled ? classes.disabled : ''
                                )}
                                onClick={() => {
                                    if (addClientByQuery === true) {
                                        setSaveDisabled(true);
                                        createGroupCallback(newGroupData);
                                        setSaveDisabled(false);
                                    }
                                    else {
                                        handleAddGroup(newGroupData, createGroupCallback);
                                    }
                                }}
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
                <Box
                    className={clsx(
                        classes.customDialogContentBox,
                        classes.flex,
                        classes.mt4,
                    )}
                >
                    <Box className={classes.flex1} style={{ marginInlineEnd: 10 }}>
                        <Typography>{t("common.GroupName")}:</Typography>
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
                                if (e.target.value.length <= 100) {
                                    setNewGroupData({
                                        ...newGroupData,
                                        IsDynamic: isDynamic,
                                        GroupName: e.target.value,
                                    });
                                }
                                else {
                                    e.preventDefault()
                                    setNewGroupData({
                                        ...newGroupData,
                                        IsDynamic: isDynamic,
                                        GroupName: e.target.value.substring(0, 100),
                                    });
                                    setToastMessage(ToastMessages.GROUP_NAME_MAXLENGTH)
                                }
                                e.preventDefault();
                            }}
                        />
                    </Box>
                    <Box
                        className={clsx(
                            classes.flex1,
                            classes.flex
                        )}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox checked={newGroupData.IsTestGroup} onClick={() => { setNewGroupData({ ...newGroupData, IsTestGroup: !newGroupData.IsTestGroup, IsDynamic: isDynamic }) }} name="testGroup" size="small" color="primary" />
                            }
                            label={t("group.testGroup")}
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
            </BaseDialog>
        </>
    );
};

AddGroupPopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    ToastMessages: PropTypes.object.isRequired,
    setToastMessage: PropTypes.func.isRequired,
}

export default AddGroupPopUp;