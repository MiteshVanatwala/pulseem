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
import { combinedGroup } from "../../../../redux/reducers/groupSlice";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";

const MergeGroupPopUp = ({
    classes,
    isOpen = false,
    onClose,
    setLoader,
    windowSize,
    selectedGroupId,
    ToastMessages,
    setToastMessage,
    getData
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [newGroupData, setNewGroupData] = useState({
        IsTestGroup: false,
        GroupName: "",
    });
    const [saveDisabled, setSaveDisabled] = useState(false);

    const handleAddGroup = async () => {
        setSaveDisabled(true);
        if (!newGroupData.GroupName) {
            setToastMessage(ToastMessages.GROUP_NAME_EMPTY)
            setSaveDisabled(false);
            return false;
        }
        try {
            setLoader(true);
            let payload = {
                SubAccountID: -1,
                GroupName: newGroupData.GroupName,
                GroupIds: selectedGroupId,
                IsTestGroup: newGroupData.IsTestGroup,
            };
            await dispatch(combinedGroup(payload));
            setSaveDisabled(false);
            setToastMessage(ToastMessages.GROUP_CREATED);
            setLoader(false);
            onClose();
            getData();
        } catch (err) {
            setLoader(false);
            return false;
        }
    };

    return (
        <BaseDialog
            customContainerStyle={classes.mergeGroup}
            classes={classes}
            open={isOpen}
            title={t("group.mergeGroup")}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
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
                                saveDisabled ? classes.disabled : ''
                            )}
                            onClick={handleAddGroup}
                        >
                            {t("common.confirm")}
                        </Button>
                    </Grid>
                </Grid>
            )}
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box>
                <Typography>{t("group.mergeGroupDesc")}</Typography>
            </Box>
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
                        classes.flex
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
        </BaseDialog>
    );
};

MergeGroupPopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    ToastMessages: PropTypes.object.isRequired,
    setToastMessage: PropTypes.func.isRequired,
}

export default MergeGroupPopUp;