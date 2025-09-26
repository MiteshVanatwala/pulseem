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
    IconButton,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import CustomTooltip from "../../../../components/Tooltip/CustomTooltip";
import { BsInfoCircle } from "react-icons/bs";
import {
    combinedGroup,
    createGroup
} from "../../../../redux/reducers/groupSlice";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { getTestGroups } from "../../../../redux/reducers/smsSlice";
import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";
import { Loader } from "../../../../components/Loader/Loader";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { findPlanByFeatureCode } from "../../../../redux/reducers/TiersSlice";
import TierPlans from "../../../../components/TierPlans/TierPlans";
import { TierFeatures } from "../../../../helpers/Constants";

const AddGroupPopUp = ({
    classes,
    isOpen = false,
    onCancel,
    onClose,
    ToastMessages,
    setToastMessage,
    addClientByQuery = false,
    createGroupCallback,
    addAnotherRecCallback,
    getData,
    isDynamic = false,
    isCombinedRequest = false,
    selectedGroupId,
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
        TotalRecipients: 0,
        GroupName: "",
        UpdatedDate: new Date(),
        CreatedDate: new Date(),
    };
    const [showTierPlans, setShowTierPlans] = useState(false);
    const [newGroupData, setNewGroupData] = useState(DEFAULT_NEW_GROUP);
    const [saveDisabled, setSaveDisabled] = useState(false);
    const [showLoader, setLoader] = useState(false);
    const [dialogType, setDialogType] = useState(null);
    const [TierMessageCode, setTierMessageCode] = useState("");
    const { isRTL } = useSelector((state) => state.core);
    const { CoreToastMessages, windowSize } = useSelector(state => state.core);
    const { currentPlan, availablePlans } = useSelector((state) => state.tiers);

    const handleAddGroup = async (data, callback) => {
        setSaveDisabled(true);
        if (!newGroupData.GroupName) {
            setToastMessage(ToastMessages.GROUP_NAME_EMPTY)
            setSaveDisabled(false);
            return false;
        }
        try {
            setLoader(true);

            let payload = data;
            let response = null;

            if (isCombinedRequest) {
                payload = {
                    GroupName: newGroupData.GroupName,
                    GroupIds: selectedGroupId,
                    IsTestGroup: newGroupData.IsTestGroup,
                };

                response = await dispatch(combinedGroup(payload));
            }
            else {
                response = await dispatch(createGroup(payload));
            }

            setLoader(false);
            handleResponses(response, {
                S_201: {
                    code: 201,
                    message: ToastMessages.GROUP_CREATED,
                    Func: () => {
                        new Promise(async (resolutionFunc, rejectionFunc) => {
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
                S_403: {
                    code: 403,
                    message: CoreToastMessages?.XSS_ERROR,
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
                S_927: {
                    code: 927,
                    message: response.Message,
                    Func: () => {
                        setTierMessageCode(response.Message);
                        setDialogType({ type: 'tier' });
                    }
                },
                default: {
                    message: ToastMessages.GROUP_ERROR,
                    Func: () => null
                },
            })

        } catch (err) {
            dispatch(sendToTeamChannel({
                MethodName: 'handleAddGroup',
                ComponentName: 'AddGroupPopUp.js',
                Text: err
            }));
            return false;
        }
        setSaveDisabled(false);
    };

    const handleGetPlanForFeature = (tierMessageCode) => {
        const planName = findPlanByFeatureCode(
            tierMessageCode,
            availablePlans,
            currentPlan.Id
        );
        
        if (planName) {
            return t('billing.tier.featureNotAvailable').replace('{feature}', t(TierFeatures[tierMessageCode] || tierMessageCode)).replace('{planName}', planName);
        } else {
            return t('billing.tier.noFeatureAvailable');
        }
    };

    const getTierValidationDialog = () => ({
        title: t('billing.tier.permission'),
        showDivider: false,
        content: (
            <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
                {handleGetPlanForFeature(TierMessageCode)}
            </Typography>
        ),
        renderButtons: () => (
            <Grid
                container
                spacing={2}
                className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
            >
                <Grid item>
                    <Button
                        onClick={() => {
                            setShowTierPlans(true);
                        }}
                        className={clsx(classes.btn, classes.btnRounded)}
                    >
                        {t('billing.upgradePlan')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        onClick={() => setDialogType(null)}
                        className={clsx(classes.btn, classes.btnRounded)}
                    >
                        {t('common.cancel')}
                    </Button>
                </Grid>
            </Grid>
        )
    });

    const renderDialog = () => {
        const { type } = dialogType || {}
        let currentDialog = {};
        
        if (type === 'tier') {
            currentDialog = getTierValidationDialog();
        }

        if (type) {
            return (
                dialogType && <BaseDialog
                    classes={classes}
                    open={dialogType}
                    onCancel={() => setDialogType(null)}
                    onClose={() => setDialogType(null)}
                    {...currentDialog}>
                    {currentDialog?.content}
                </BaseDialog>
            )
        }
    };

    return (
        <>
            <BaseDialog
                classes={classes}
                open={isOpen}
                title={isCombinedRequest ? t("group.mergeGroup") : t("group.createNew")}
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
                        {!addClientByQuery && !isDynamic && !isCombinedRequest && <Grid
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
                {isCombinedRequest && <Box>
                    <Typography>{RenderHtml(t("group.mergeGroupDesc"))}</Typography>
                </Box>}
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
                </Box>
                <Box className={clsx(classes.pt5, isRTL ? classes.textLeft : classes.textRight)}>
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
                        <IconButton className={classes.icon_Info} aria-label={t('group.testGroupInfo')}>
                            <BsInfoCircle />
                        </IconButton>
                    </CustomTooltip>
                </Box>
                <Loader isOpen={showLoader} showBackdrop={true} />
            </BaseDialog>
            {showTierPlans && <TierPlans
                classes={classes}
                isOpen={showTierPlans}
                onClose={() => {
                    setShowTierPlans(false);
                    setDialogType(null);
                }}
            />}
            {renderDialog()}
        </>
    );
};

AddGroupPopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ToastMessages: PropTypes.object.isRequired,
    setToastMessage: PropTypes.func.isRequired,
}

export default AddGroupPopUp;