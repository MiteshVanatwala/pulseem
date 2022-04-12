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
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";
import {
    createGroup,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";

const AddGroupPopUp = ({ classes, isOpen = false, onClose, setLoader, onCreateGroupResponse, windowSize, ToastMessages, setToastMessage, openARDialog, getData, handleResponses = (response, actions) => null }) => {
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
        IsTestGroup: false,
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



    const handleAddGroup = async (data, callback) => {
        if (!newGroupData.GroupName) {
            setToastMessage(ToastMessages.GROUP_NAME_EMPTY)
            return false;
        }
        try {
            onClose()
            setLoader(true);
            const response = await dispatch(createGroup(data));
            setLoader(false);
            console.log("response:", response.payload.Message)
            handleResponses(response, {
                'S_201': {
                    code: 201,
                    message: ToastMessages.GROUP_UPDATED,
                    Func: new Promise(async (resolutionFunc, rejectionFunc) => {
                        await resolutionFunc(getData());
                    }).then((res) => {
                        // selectGroup(response.payload.Message)
                        callback?.()
                    }),
                },
                'S_400': {
                    code: 201,
                    message: ToastMessages.GROUP_INPUT_INCORRECT,
                    Func: () => null
                },
                'S_401': {
                    code: 201,
                    message: ToastMessages.GROUP_INVALID_API,
                    Func: () => null
                },
                'S_405': {
                    code: 201,
                    message: ToastMessages.GROUP_ERROR,
                    Func: () => null
                },
                'S_422': {
                    code: 201,
                    message: ToastMessages.GROUP_ALREADY_EXIST,
                    Func: () => null
                },
                'default': {
                    message: '',
                    Func: () => null
                },
            })
            // onCreateGroupResponse(response);
            // return response
        } catch (err) {
            return false;
        }
    };

    // const handleAddRecipient = async () => {
    //     try {
    //         const response = await handleAddGroup(newGroupData);
    //         console.log("STATUSCODE:", response.payload?.StatusCode);
    //         if (response.payload?.StatusCode === 201) {
    //             openARDialog()
    //         }
    //     }
    //     catch (err) {
    //         console.log(err)
    //     }

    // }

    return (
        <>
            <Dialog
                classes={classes}
                open={isOpen}
                title={t("group.createNew")}
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
                                    classes.fullWidth,
                                    classes.dialogButton,
                                    classes.dialogConfirmButton,
                                    classes.actionButtonLightGreen,
                                    classes.whiteSpaceNoWrap,
                                    !newGroupData.GroupName ? classes.disabled : ''
                                )}
                                onClick={() => handleAddGroup(newGroupData, openARDialog)}
                            >
                                {t("recipient.addRecipients")}
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
                        // classes.responsiveFlex
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
                                        GroupName: e.target.value,
                                    });
                                }
                                else {
                                    e.preventDefault()
                                    setNewGroupData({
                                        ...newGroupData,
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
                            classes.flex,
                            // classes.responsiveFlex
                        )}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox checked={newGroupData.IsTestGroup} onClick={() => { setNewGroupData({ ...newGroupData, IsTestGroup: !newGroupData.IsTestGroup }) }} name="testGroup" size="small" color="primary" />
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
            </Dialog>
        </>
    );
};

AddGroupPopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreateGroupResponse: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    ToastMessages: PropTypes.object.isRequired,
    setToastMessage: PropTypes.func.isRequired,
}

export default AddGroupPopUp;