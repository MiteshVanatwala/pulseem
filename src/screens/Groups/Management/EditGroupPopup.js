import { useEffect, useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import { BsInfoCircleFill } from "react-icons/bs";
import { editGroup, } from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";

const EditGroupPopup = ({ classes,
    isOpen = false,
    onClose,
    setLoader,
    onCreateGroupResponse,
    windowSize,
    ToastMessages,
    setToastMessage,
    openARDialog,
    selectedGroup }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [editableFroupData, setEditableFroupData] = useState(null);
    const { groupData } = useSelector((state) => state.group);
    const { language, isRTL } = useSelector((state) => state.core);
    moment.locale(language);

    useEffect(() => {
        setLoader(true);

        const initData = async () => {
            const currentGroup = { ...groupData.Groups.find((g) => { return g.GroupID == selectedGroup }) };
            setEditableFroupData(currentGroup);
            setLoader(false);
        }

        initData();
    }, [])

    const handleEditGroup = async (data) => {
        if (!editableFroupData.GroupName) {
            setToastMessage(ToastMessages.GROUP_NAME_EMPTY)
            return false;
        }
        try {
            onClose()
            setLoader(true);
            const response = await dispatch(editGroup(data));
            setLoader(false);
            onCreateGroupResponse(response);
            return response
        } catch (err) {
            return false;
        }
    };

    const handleAddRecipient = async () => {
        try {
            const response = await handleEditGroup(editableFroupData);
            console.log("STATUSCODE:", response.payload?.StatusCode);
            if (response.payload?.StatusCode === 201) {
                openARDialog()
            }
        }
        catch (err) {
            console.log(err)
        }

    }

    return (
        <>
            {editableFroupData && <Dialog
                classes={classes}
                open={isOpen}
                title={t("group.edit")}
                icon={<div className={classes.dialogIconContent}>
                    {'\uE0D5'}
                </div>}
                showDivider={true}
                onClose={onClose}
                onCancel={onClose}
                onConfirm={() => {
                    const result = handleEditGroup(editableFroupData);
                    if (result) {
                        //handleUpdateGroup();
                        //setEditableFroupData(DEFAULT_NEW_GROUP);
                    }
                }}
                renderButtons={() => (
                    <Grid
                        container
                        spacing={4}
                        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                        <Grid item>
                            <Button
                                variant="contained"
                                size="small"
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogCancelButton
                                )}
                                onClick={() => onClose()}
                            >
                                {t("group.cancel")}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                size="small"
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogConfirmButton
                                )}
                                onClick={() => {
                                    const result = handleEditGroup(editableFroupData);
                                    if (result) {
                                        //setEditableFroupData(DEFAULT_NEW_GROUP);
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
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <Box style={{ marginInlineEnd: 10, display: 'flex' }}>
                                <Typography style={{ marginInlineEnd: 10 }}>{t("common.GroupName")}:</Typography>
                                <TextField
                                    id="outlined-basic"
                                    label=""
                                    variant="outlined"
                                    value={editableFroupData.GroupName}
                                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        if (e.target.value.length <= 100) {
                                            setEditableFroupData({
                                                ...editableFroupData,
                                                GroupName: e.target.value,
                                            });
                                        }
                                        else {
                                            e.preventDefault()
                                            setEditableFroupData({
                                                ...editableFroupData,
                                                GroupName: e.target.value.substring(0, 100),
                                            });
                                            setToastMessage(ToastMessages.GROUP_NAME_MAXLENGTH)
                                        }
                                        e.preventDefault();

                                    }}
                                    style={{ marginInlineEnd: 10 }}
                                />
                                <TextField
                                    id="outlined-basic"
                                    label=""
                                    variant="outlined"
                                    value={editableFroupData.GroupID}
                                    className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252, classes.disabled)}
                                    autoComplete="off"
                                    style={{ marginInlineEnd: 10, width: 40, maxWidth: 40 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box
                                className={clsx(
                                    classes.flex1,
                                    classes.flex
                                )}
                                style={{ paddingInlineStart: 10 }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox checked={editableFroupData.IsTestGroup} onClick={() => { setEditableFroupData({ ...editableFroupData, IsTestGroup: !editableFroupData.IsTestGroup }) }} name="testGroup" size="small" color="primary" />
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
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    className={clsx(
                        classes.customDialogContentBox,
                        classes.flex,
                        classes.mt4
                    )}
                    style={{ justifyContent: 'space-between' }}
                >
                    <Typography>{t("common.CreatedOn")}:{moment(editableFroupData.CreationDate).format("DD/MM/YYYY HH:mm")}</Typography>
                    <Typography>{t("common.UpdatedOn")}:{moment(editableFroupData.UpdateDate).format("DD/MM/YYYY HH:mm")}</Typography>
                </Box>
            </Dialog>
            }
        </>
    );
};

EditGroupPopup.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreateGroupResponse: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    ToastMessages: PropTypes.object.isRequired,
    setToastMessage: PropTypes.func.isRequired,
}

export default EditGroupPopup;