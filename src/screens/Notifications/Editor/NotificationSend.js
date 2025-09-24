import clsx from 'clsx';
import 'moment/locale/he'
import moment from 'moment'
import './notification.styles.css';
import { useTranslation } from 'react-i18next'
import DefaultScreen from '../../DefaultScreen'
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Toast from '../../../components/Toast/Toast.component';
import { CheckAnimation } from '../../../assets/images/settings/index'
import { Preview } from '../../../components/Notifications/Preview/Preview';
import { useParams } from 'react-router-dom';
import { Typography, Button, Grid, Box, FormControlLabel, FormControl, RadioGroup, Radio, FormHelperText, Divider, Link } from '@material-ui/core'
import { getNotificationById, getNotificationGroups, getSettings, saveNotificationSettings, SendNotification, getUniqueClientsByGroups } from '../../../redux/reducers/notificationSlice';
import Groups from '../../../components/Groups/GroupsHandler/Groups';
import { DateField } from '../../../components/managment/index';
import { MdArrowBackIos, MdArrowForwardIos, MdErrorOutline, MdNotificationsActive } from 'react-icons/md';
import useRedirect from '../../../helpers/Routes/Redirect';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import { sitePrefix } from '../../../config';
import { Title } from '../../../components/managment/Title';
import { findPlanByFeatureCode } from '../../../redux/reducers/TiersSlice';

const NotificationSend = ({ classes }) => {
    const { id } = useParams();
    const { t } = useTranslation();
    const Redirect = useRedirect();
    const { notificationGroups } = useSelector(state => state.notification)
    /* #region  Component settings constatns */
    const dispatch = useDispatch();
    const { language, isRTL, windowSize, userRoles } = useSelector(state => state.core);
    const { currentPlan, availablePlans } = useSelector(state => state.tiers);
    const [ShowRedirectButton, setRedirectButtonVisibillity] = useState(false);
    const [groupList, setGroupList] = useState(null);
    moment.locale(language);
    /* #endregion */
    /* #region  State */
    const [model, setModel] = useState({
        ID: 0,
        Name: "",
        Title: "",
        Body: "",
        Icon: "",
        Image: "",
        RedirectURL: "",
        Tag: "",
        Direction: 2,
        IsRenotify: "",
        SendDate: "",
        IsDeleted: "",
        SentCount: "",
        StatusID: "",
        NotificationGroups: "",
        RedirectButtonText: ""
    });

    const [validationErrorList, setValidationError] = useState(null);
    // Groups
    const [selectedGroups, setSelected] = useState([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    // Send Type settings
    const [sendType, setSendType] = useState('1'); // Immediate
    const [sendDate, handleFromDate] = useState(null);
    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [showDetails, setDetailsVisibility] = useState(false);
    const [totalRecipients, setTotalRecipients] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [campaignSent, setCampaignSent] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
    const [showGroupsList, setShowGroupsList] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [dialogType, setDialogType] = useState(null);
    const [TierMessageCode, setTierMessageCode] = useState('');

    const toastMessages = {
        SUCCESS: { severity: 'success', color: 'success', message: t('notifications.saved'), showAnimtionCheck: true },
        SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('notifications.settings_saved'), showAnimtionCheck: true },
        ERROR: { severity: 'error', color: 'error', message: t('notifications.error'), showAnimtionCheck: true },
    }

    useEffect(() => {
        const body = document.querySelector('#root');
        body.scrollIntoView({}, 100);

        const initSettings = async () => {
            if (!notificationGroups) {
                const groups = await dispatch(getNotificationGroups());
                setGroupList(groups.payload);
            }
            else {
                setGroupList(notificationGroups);
            }
        }
        if (id !== null && parseInt(id) > 0) {
            initSettings();
        }
    }, [dispatch, id, notificationGroups]);

    useEffect(() => {
        const getNotificationSettings = async () => {
            const list = await dispatch(getSettings(id));
            const selectedList = [];
            if (list.payload.length > 0) {
                const sendDate = list.payload[0].SendDate;
                if (sendDate) {
                    const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
                    const d = m.format('YYYY-MM-DD HH:mm:ss');
                    handleFromDate(d);
                    setSendType('2');
                }
                list.payload.forEach((g) => {
                    const exist = groupList?.filter(gl => { return gl.Id === g.NotificationGroupId });
                    if (exist && exist.length > 0) {
                        selectedList.push(exist[0]);
                    }
                });
            }
            setSelected(selectedList);
        }
        const getData = () => {
            return new Promise(async (resolve) => {
                const notificationPayload = await dispatch(getNotificationById(id));
                setModel(notificationPayload.payload);
                if (notificationPayload.payload.RedirectButtonText !== '') {
                    setRedirectButtonVisibillity(true);
                }
                resolve();
            })
        }

        if (groupList?.length > 0) {
            getData().then(() => {
                getNotificationSettings();
            })
        }
    }, [dispatch, groupList, id])

    const renderHeader = () => {
        return (
            <>
                <Title
                    Element={(
                        <Box className='stepHead'>
                            <span className={'stepNum'}>
                                2
                            </span>
                            <span className={'stepTitle'}>
                                {t('notifications.sendSettings')}
                            </span>
                        </Box>
                    )}
                    classes={classes}
                    isIcon={false}
                    ContainerStyle={{
                        padding: 0,
                        height: 42,
                        overflowY: 'hidden'
                    }}
                />
            </>
        )
    }
    const renderDialog = () => {
        if (validationErrorList != null) {
            let dialog = {};
            dialog = renderValidationError();

            return (
                <BaseDialog
                    classes={classes}
                    open={validationErrorList}
                    onCancel={handleDialogClose}
                    onClose={handleDialogClose}
                    onConfirm={handleDialogClose}
                    {...dialog}>
                    {dialog.content}
                </BaseDialog>
            );
        }

        if (dialogType) {
            const { type } = dialogType;
            const dialogContent = {
                tier: renderTierValidationDialog()
            };

            const currentDialog = dialogContent[type] || {};

            return (
                <BaseDialog
                    classes={classes}
                    open={dialogType}
                    onClose={() => setDialogType(null)}
                    onCancel={() => setDialogType(null)}
                    {...currentDialog}>
                    {currentDialog.content}
                </BaseDialog>
            );
        }
    }
    const renderValidationError = () => {
        return {
            showDivider: true,
            icon: (
                <MdErrorOutline style={{ fontSize: 30 }} />
            ),
            title: t("notifications.validationError"),
            content: (
                <Box className={classes.dialogBox}>
                    <ul>
                        {validationErrorList.map((d, index) => (<li key={{ index }}>{d.message}</li>))}
                    </ul>
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='small'
                    onClick={handleDialogClose}
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}>
                    {t('common.Ok')}
                </Button>
            )
        };
    }
    const handleDialogClose = () => {
        setValidationError(null);
        setSummary(null);
    }

    const renderTierValidationDialog = () => {
        return {
            showDivider: false,
            title: t('common.Notice'),
            content: (
                <Box className={classes.dialogBox}>
                    {RenderHtml(t('common.TierValidationMessage'))}
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='small'
                    onClick={() => setDialogType(null)}
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}>
                    {t('common.Ok')}
                </Button>
            )
        };
    }
    const handleCancel = () => {
        onCancelConfirm(false);
    };
    const onCancelConfirm = (saveBeforeCancel) => {
        if (saveBeforeCancel) {
            saveSettings(true)
        }
        else {
            Redirect({ url: `${sitePrefix}Notifications` });
        }
    }
    const saveSettings = async (isExit, isSummary = false) => {
        if (isValidSettings()) {
            if (sendType === "2") {
                const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
                m.set({ h: m.format('HH'), m: m.format('mm') });

                model.SendDate = m.format();
            }
            else {
                model.sendDate = null;
            }
            const data = { NotificationId: parseInt(id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
            const result = await dispatch(saveNotificationSettings(data));
            if (result.payload === true) {
                if (!isExit && isSummary === false) {
                    setToastMessage(toastMessages.SAVE_SETTINGS);
                }
                else {
                    if (isSummary === false)
                        Redirect({ url: `${sitePrefix}Notifications` });
                    else
                        getSummary();
                }
            }
            else {
                setToastMessage(toastMessages.ERROR);
            }
        }
    }
    const getSummary = async () => {
        const totalResonse = await dispatch(getUniqueClientsByGroups(selectedGroups.map((g) => { return g.Id; })));
        const currentTotalRecipients = selectedGroups.reduce(function (a, b) {
            return a + b['Members'];
        }, 0);
        setTotalRecipients(totalResonse.payload);
        setDuplicatedRecipients(currentTotalRecipients - totalResonse.payload);
        if (sendDate) {
            const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
            m.lang(isRTL ? "he" : "en");
            setSummary({ groups: selectedGroups, sendType: sendType, sendDate: m.format("MMMM Do YYYY, hh:mm a") });

        }
        else {
            setSummary({ groups: selectedGroups, sendType: sendType, sendDate: null });
        }
    }
    const isValidSettings = () => {
        let result = true;
        setShowConfirmCancel(false);
        const errorList = [];
        document.querySelector("#datePicker").classList.remove("error");
        document.querySelector("#timePicker").classList.remove("error");

        if (sendType === 2) {
            if ((!sendDate)) {
                errorList.push({ message: t('notifications.validation.notificationDate') });
            }
            else {
                const dateNow = new Date(Date.now());
                const selectedDate = new Date(sendDate);
                if (selectedDate < dateNow) {
                    errorList.push({ message: t('notifications.validation.notificationDatePassed') });
                    document.querySelector("#datePicker").classList.add("error");
                    document.querySelector("#timePicker").classList.add("error");
                    document.querySelector("#timePicker").focus();
                    result = false;
                }
            }
        }
        if (selectedGroups.length === 0) {
            errorList.push({ message: t('notifications.validation.notificationGroups') });
            result = false;
        }
        if (errorList.length > 0) {
            setValidationError(errorList);
            result = false;
        }
        return result;
    }

    const WizardButtons = () => {
        return (<div className={clsx(classes.wizardButtonContainer, "wizardButtonContainer")} style={{ paddingBottom: 40 }}>
            <Button
                className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.middle
                )}
                startIcon={!isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                onClick={() => Redirect({ url: `${sitePrefix}Notification/edit/${model.ID}` })}
            >
                {t('notifications.back')}
            </Button>

            <Box style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto" }}>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={() => handleCancel()}
                >
                    {t('notifications.cancel')}
                </Button>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={() => saveSettings(false)}>
                    {t('notifications.save')}
                </Button>
                <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={() => saveSettings(true)}>
                    {t('notifications.saveAndExit')}
                </Button>
                {userRoles?.AllowSend && <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle,
                        selectedGroups.length === 0 ? classes.disabled : ''
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    style={{ margin: '8px' }}
                    onClick={() => saveSettings(false, true)}>
                    {t('notifications.summary')}
                </Button>}
            </Box>
        </div>)
    }
    const renderToast = () => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 2000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }
    const callbackSelectAll = () => {
        if (!allGroupsSelected) {
            setSelected(groupList);
        }
        else {
            setSelected([]);
        }
        setAllGroupsSelected(!allGroupsSelected);

    }
    const handleSendType = (event) => {
        if (event.target.value === '1') {
            setModel({ ...model, SendDate: null });
            handleFromDate(null);
        }
        setSendType(event.target.value);
    }
    const handleDatePicker = (value) => {
        handleFromDate(value);
        setTimePickerOpen(!timePickerOpen);
    }
    const handleTimePicker = (value) => {
        var date = moment(sendDate);
        var time = moment(value, 'HH:mm');
        date.set({
            hour: time.get('hour'),
            minute: time.get('minute')
        });

        handleFromDate(date);
        setTimePickerOpen(false);
    }
    const renderSummary = () => {
        if (summary && totalRecipients) {
            let dialog = {};
            dialog = summaryContent();
            return (
                <BaseDialog
                    customContainerStyle={classes.summaryContainer}
                    classes={classes}
                    open={summary}
                    onCancel={() => setSummary(null)}
                    onClose={() => setSummary(null)}
                    {...dialog}>
                    {dialog.content}
                </BaseDialog>
            );
        }
    }
    const summaryContent = () => {
        const handleShowDetails = () => {
            setDetailsVisibility(!showDetails);
        }
        const whenToSend = summary.sendDate ? `${summary.sendDate}` : t("notifications.immediateSend")
        return {
            icon: (
                <MdNotificationsActive style={{ fontSize: 30 }} />
            ),
            title: `${t("notifications.summaryModalTitle")} ${model.Name}`,
            content: (
                <Grid container direction={'row'} className={clsx(classes.root, classes.dialogBox)} spacing={4}>
                    <Grid item md={6} xs={12}>
                        <h3 className={clsx(classes.colrPrimary, classes.summaryTitle)}>{t("notifications.when")}</h3>
                        <b>{whenToSend}</b>
                        <h3 className={clsx(classes.colrPrimary, classes.summaryTitle)}>{t("notifications.for")}</h3>
                        {t("notifications.totalRecipientForSending")} <b>{totalRecipients}</b>
                        <Grid item xs={12} style={{ paddingTop: 15 }}>
                            <Link onClick={() => handleShowDetails()} style={{ cursor: 'pointer', fontWeight: '500', textDecoration: 'underline', color: '#6c757d' }}>
                                {!showDetails ? t("notifications.details") : t("notifications.close")}
                            </Link>
                        </Grid>
                    </Grid>
                    {windowSize !== 'xs' && <Grid item md={6}>
                        <h3 className={classes.colrPrimary} style={{ fontWeight: '500', fontSize: 20, marginTop: 10 }}>{t("notifications.preview")}</h3>
                        <Preview classes={classes}
                            model={model}
                            ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText !== ''}
                            showDevices={true}
                            showTitle={false}
                            showOSScreen={false}
                        />
                    </Grid>}
                    <Grid item xs={12} style={{ paddingTop: 0 }}>
                        {showDetails && <div>
                            <h3 style={{ cursor: 'pointer', marginBotton: 0 }}
                                onClick={() => setShowGroupsList(!showGroupsList)}
                            >{t("notifications.buttons.groups")} ({selectedGroups.length})</h3>
                            <Divider />
                            {showGroupsList && <ul>
                                {selectedGroups.map((g, index) => {
                                    return (<li key={`group_${g.Id}`}>
                                        <div className={classes.flexSpaceBetween}>
                                            <Typography className={classes.padding10}>{g.GroupName}</Typography> <Typography>{g.Members} {g.Members !== 1 ? t("notifications.recipients") : t("notifications.recipient")}</Typography>
                                        </div>
                                        <Divider />
                                    </li>)
                                })}
                            </ul>
                            }
                            {showDetails && duplicatedRecipients > 0 &&
                                <div className={clsx(classes.flexStart, classes.flexAlignCetner)}>
                                    <h3 className={classes.blue} style={{ marginTop: 0, marginBottom: 0 }}>{t("notifications.duplicatedRecipients")}: </h3> <b className={classes.summaryText}>{duplicatedRecipients}</b>
                                </div>
                            }
                        </div>}

                    </Grid>
                </Grid>
            ),
            renderButtons: () => (
                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
                >
                    <Grid item>
                        <Button
                            onClick={(e) => { setIsSending(true); insertNotificationForSend(e); }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded,
                                isSending ? classes.disabled : null
                            )}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        >
                            {t('common.Send1')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { setSummary(null) }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded
                            )}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        >
                            {t('common.Cancel')}
                        </Button>
                    </Grid>
                </Grid>
            )
        };
    }

    const insertNotificationForSend = async (e) => {
        e.preventDefault();
        const data = { NotificationId: parseInt(id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
        const result = await dispatch(SendNotification(data));

        // Check for tier validation
        if (result?.payload?.StatusCode === 927) {
            setTierMessageCode(result?.payload?.Message || 'WEB_PUSH');
            setDialogType(getTierValidationDialog());
            return;
        }

        if (result && result.payload === true) {
            setSummary(null);
            setCampaignSent(true);
        }
    }

    const handleGetPlanForFeature = (tierMessageCode) => {
        const planName = findPlanByFeatureCode(
            tierMessageCode,
            availablePlans,
            currentPlan.Id
        );
        
        if (planName) {
            return t('billing.tier.featureNotAvailable').replace('{feature}', tierMessageCode).replace('{planName}', planName);
        } else {
            return t('billing.tier.noFeatureAvailable');
        }
    };

    const getTierValidationDialog = () => ({
        type: 'tier',
        data: null,
        title: t('billing.tier.permission'),
        showDivider: false,
        content: (
            <Box className={classes.dialogBox}>
                {handleGetPlanForFeature(TierMessageCode)}
            </Box>
        )
    });
    const callbackSelectedGroups = (group, key, reference) => {
        const found = selectedGroups.map((group) => { return group.Id }).includes(group.Id)
        if (found) {
            setSelected(selectedGroups.filter(g => g.Id !== group.Id))
        } else {
            setSelected([...selectedGroups, group])
        }
    }
    const notificationSendSettings = () => {
        return (
            <div className={classes.root}>
                <div>
                    <Grid container
                        direction="row"
                        justifyContent="flex-start"
                        spacing={4}
                        className={classes.wizardFlex}
                    >
                        <Grid item md={7} xs={12}>
                            <h2 className={classes.sectionTitle}>{t('notifications.toWhomToSend')}</h2>
                            {groupList && <Groups classes={classes}
                                list={[...groupList]}
                                selectedList={selectedGroups}
                                callbackSelectedGroups={callbackSelectedGroups}
                                callbackUpdateGroups={callbackSelectedGroups}
                                callbackSelectAll={callbackSelectAll}
                                isNotifications={true}
                                showFilter={false}
                                isSms={false}
                                noSelectionText={t("notifications.noGroupsSelected")}
                                uniqueKey={'groups_2'}
                                innerHeight={325}
                            />}
                            <Box>
                                <Typography style={{ float: isRTL ? 'left' : 'right', marginTop: 5 }}>
                                    {t('notifications.totalRecipients')}
                                    {selectedGroups.reduce(function (a, b) {
                                        return a + b['Members'];
                                    }, 0)}
                                </Typography>
                            </Box>
                        </Grid>
                        {windowSize !== "xs" && <Grid item xs={1}></Grid>}
                        <Grid item md={4} xs={12}>
                            <h2 className={classes.sectionTitle} style={{ marginTop: windowSize === "xs" ? "0" : null }}>{t('notifications.whenToSend')}</h2>
                            <FormControl component="fieldset">
                                <RadioGroup aria-label="gender" name="sendType" value={sendType} onChange={handleSendType}>
                                    <FormControlLabel value="1" control={<Radio color="primary" />} label={<span className={classes.radioText}>{t("notifications.immediateSend")}</span>} />
                                    <FormHelperText className={classes.helpText}>{t("notifications.immediateDescription")}</FormHelperText>
                                    <FormControlLabel value="2" control={<Radio color="primary" />} label={<span className={classes.radioText}>{t("notifications.futureSend")}</span>} />
                                </RadioGroup>
                                <Box style={{ paddingRight: isRTL ? 30 : '', paddingLeft: isRTL ? '' : 30, pointerEvents: sendType === '1' ? 'none' : 'auto' }}>
                                    <DateField
                                        minDate={moment()}
                                        classes={classes}
                                        value={sendDate}
                                        onChange={handleDatePicker}
                                        placeholder={t('notifications.date')}
                                        // buttons={{ ok: t("common.confirm"), cancel: t("common.cancel") }}
                                        autoOk
                                    />
                                </Box>
                                <Box style={{ marginTop: 10, paddingRight: isRTL ? 30 : '', paddingLeft: isRTL ? '' : 30, pointerEvents: sendType === '1' ? 'none' : 'auto' }}>
                                    <DateField
                                        classes={classes}
                                        value={sendDate}
                                        onTimeChange={handleTimePicker}
                                        placeholder={t('notifications.hour')}
                                        isTimePicker={true}
                                        ampm={false}
                                        timePickerOpen={timePickerOpen}
                                        autoOk
                                    />
                                </Box>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
    const renderConfirmCancel = () => {
        if (showConfirmCancel) {
            let dialog = {
                showDivider: true,
                icon: (
                    <MdNotificationsActive style={{ fontSize: 30 }} />
                ),
                title: t("notifications.leaveCampaignCreationTitle"),
                content: (
                    <Typography style={{ marginBottom: 20 }}>
                        {t("notifications.leaveCampaignCreationText")}
                    </Typography>
                )
            }
            return (
                <BaseDialog
                    cancelText="common.No"
                    confirmText="common.Yes"
                    disableBackdropClick={true}
                    classes={classes}
                    open={showConfirmCancel}
                    onCancel={() => setShowConfirmCancel(null)}
                    onClose={() => onCancelConfirm(false)}
                    onConfirm={() => onCancelConfirm(true)}
                    {...dialog}>
                    {dialog.content}
                </BaseDialog>
            );
        }
    }
    const renderSentDialog = () => {
        if (campaignSent) {

            let dialog = {};
            dialog = {
                icon: (
                    <MdNotificationsActive style={{ fontSize: 30 }} />
                ),
                content: (
                    <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        <img alt="Sent" src={CheckAnimation} />
                        <Typography style={{ fontWeight: 'bold' }}>{t("common.sentAlert")}</Typography>
                        <Typography>{t("common.yourCampaignOnItsWay")}</Typography>
                    </Box >
                ),
                renderButtons: () => (
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { Redirect({ url: `${sitePrefix}Notifications` }) }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded,
                            classes.middle
                        )}>
                        {t('common.Ok')}
                    </Button>
                )
            };

            return (
                <BaseDialog
                    showDivider={false}
                    classes={classes}
                    open={true}
                    onClose={() => { Redirect({ url: `${sitePrefix}Notifications` }) }}
                    onCancel={() => { Redirect({ url: `${sitePrefix}Notifications` }) }}
                    {...dialog}>
                    {dialog.content}
                </BaseDialog>
            );
        }
        return null;
    }

    return (
        <DefaultScreen
            currentPage='notifications'
            subPage='create'
            customPadding={true}
            classes={classes}
            containerClass={classes.editorCont}>
            <div className={'head'} >
                <Title Text={t('notifications.createNewPush')} classes={classes} />
            </div>
            <div className={'containerBody'}>
                {renderToast()}
                {renderHeader()}
                <div className='bodyBlock'>
                    {notificationSendSettings()}
                    {renderDialog()}
                    {renderSummary()}
                    {renderSentDialog()}
                    {renderConfirmCancel()}
                    <WizardButtons />
                </div>
            </div>
        </DefaultScreen>
    );
};

export default NotificationSend;