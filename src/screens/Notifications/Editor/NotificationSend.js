import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
    Typography, Button, TextField, Grid, Switch, Box, FormControlLabel, FormControl, RadioGroup, Radio, ClickAwayListener,
    FormHelperText, Divider
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Preview } from '../../../components/Notifications/Preview/Preview';
import {
    getNotificationById, save, updateNotification, getNotificationPublicKey, getNotificationGroups,
    getSettings, saveNotificationSettings, SendNotification, getUniqueClientsByGroups
}
    from '../../../redux/reducers/notificationSlice';
import clsx from 'clsx';
import { PushService } from './init-push';
import Picker from 'emoji-picker-react';
import { FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import './notification.styles.css';
import Groups from '../../../components/Notifications/Groups/Groups';
import Gallery from '../../../components/Gallery/Gallery.component';
import {
    DateField, Dialog
} from '../../../components/managment/index';
import { MdErrorOutline, MdNotificationsActive } from 'react-icons/md';
import { IoMdImages } from 'react-icons/io'
import moment from 'moment'
import 'moment/locale/he'
import Toast from '../../../components/Toast/Toast.component';
import Tooltip from '@material-ui/core/Tooltip';
import {
    CheckAnimation
} from '../../../assets/images/settings/index'
import { isValidUrl } from '../../../helpers/UrlHelper';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
        color: theme.palette.common.black,
    },
    tooltip: {
        backgroundColor: theme.palette.common.black,
    },
}));

function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();

    return <Tooltip arrow classes={classes} {...props} disableFocusListener />;
}

const DashedInput = withStyles({
    root: {
        border: 'none',
        borderRadius: 0,
        "& .MuiOutlinedInput-multiline": {
            padding: 0,
            minHeight: 55,
            paddingTop: 0,
            '& textarea + fieldset': {
                border: '1px dashed #64a1bd',
                borderRadius: 0,
                borderWidth: 1
            },
            '& textarea:invalid:focus + fieldset': {
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: 'red'
            },
            '& textarea:valid:focus + fieldset': {
                borderStyle: 'dashed',
                borderWidth: 1
            },
            '& textarea + fieldset:hover': {
                color: 'rgba(0, 0, 0, 0.87)',
                border: '1px dashed #000',
            },
            '& textarea.error': {
                border: '1px dashed red'
            }
        },
        '& input': {
            height: 0,
        },
        '& input + fieldset': {
            borderStyle: 'dashed',
            borderColor: '#64a1bd',
            borderRadius: 0
        },
        '& input:invalid:focus + fieldset': {
            borderColor: 'red',
            borderWidth: 1
        },
        '& input:valid:focus + fieldset': {
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: '#64a1bd'
        },
        '& input:hover + fieldset': {
            color: 'rgba(0, 0, 0, 0.87)',
            border: '1px dashed rgba(0, 0, 0, 0.87)',
        },
        '& input.error': {
            border: '1px dashed red'
        }
    },

})(TextField);

const NotificationSend = ({ classes }) => {
    const redirect = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    /* #region  Component settings constatns */
    const dispatch = useDispatch();
    const { language } = useSelector(state => state.core)
    const { t } = useTranslation();
    const { isRTL, windowSize } = useSelector(state => state.core);
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

    const [sourceModel, setSourceModel] = useState({
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

    const [activeStep, setActiveStep] = useState(0);
    const [ShowRedirectButton, setRedirectButtonVisibillity] = useState(false);
    const [notificationPublicKey, setPublicKey] = useState(0);
    const [chosenEmoji, setChosenEmoji] = useState(null);
    const [inputFocus, setFocusOnInput] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [isEmojiShown, setShowEmoji] = useState(false);
    const [validationErrorList, setValidationError] = useState(null);
    const [groupList, setGroupList] = useState([]);
    // Groups
    const [selectedGroups, setSelected] = useState([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    // Send Type settings
    const [sendType, setSendType] = useState('1'); // Immediate
    const [sendDate, handleFromDate] = useState(null);
    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [showDetails, setDetailsVisibility] = useState(false);
    const [notificationHover, setHovered] = useState(false);
    const [showGallery, setGalleryState] = useState(false);
    const [iconHover, setIconHover] = useState(false);
    const [isIcon, setIsIcon] = useState(false);
    const [totalRecipients, setTotalRecipients] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [isGalleryConfirmed, setIsFileSelected] = useState(false);
    const [campaignSent, setCampaignSent] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
    const [showGroupsList, setShowGroupsList] = useState(false);

    const toastMessages = {
        SUCCESS: { severity: 'success', color: 'success', message: t('notifications.saved'), showAnimtionCheck: true },
        SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('notifications.settings_saved'), showAnimtionCheck: true },
        ERROR: { severity: 'error', color: 'error', message: t('notifications.error'), showAnimtionCheck: true },
    }

    useEffect(() => {
        const body = document.querySelector('#root');
        body.scrollIntoView({}, 100);

        handlePublicKey();
        if (id != null && parseInt(id) > 0) {
            getData();
            if (location.pathname.toLowerCase().indexOf('send') > -1) {
                getSubAccountGroups();
                setActiveStep(activeStep + 1);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (groupList && groupList.length > 0) {
            getNotificationSettings();
        }
    }, [groupList]);


    const renderDialog = () => {
        if (validationErrorList != null) {
            let dialog = {};
            dialog = renderValidationError();

            return (
                <Dialog
                    classes={classes}
                    open={validationErrorList}
                    onClose={handleDialogClose}
                    onConfirm={handleDialogClose}
                    {...dialog}>
                    {dialog.content}
                </Dialog>
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
                        classes.confirmButton,
                        classes.dialogConfirmButton,
                    )}>
                    {t('common.confirm')}
                </Button>
            )
        };
    }
    const handleDialogClose = () => {
        setValidationError(null);
        setGalleryState(null);
        setSummary(null);
    }

    const WizardButtons = () => {
        return (<div className={clsx(classes.wizardButtonContainer, "wizardButtonContainer")} style={{ paddingBottom: 40 }}>
            {activeStep == 0 &&
                <Box>
                    <BootstrapTooltip title={t("notifications.tooltip.testSend")} placement={isRTL ? "left" : "right"} >
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightBlue,
                                classes.backButton
                            )}
                            color="primary"
                            onClick={handleTestSend}>
                            {t('notifications.testSend')}
                        </Button>
                    </BootstrapTooltip>

                </Box>
            }
            {activeStep > 0 &&
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightBlue,
                        classes.backButton
                    )}
                    onClick={() => handleBack()}
                >
                    {t('notifications.back')}
                </Button>
            }

            <Box style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto" }}>
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonRed
                    )}
                    style={{ margin: '8px' }}
                    onClick={() => handleCancel()}
                >
                    {t('notifications.cancel')}
                </Button>
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightBlue,
                        classes.backButton
                    )}
                    color="primary"
                    style={{ margin: '8px' }}
                    onClick={event => activeStep == 0 ? saveNotification(false, false) : saveSettings(false)}>
                    {t('notifications.save')}
                </Button>
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightBlue,
                        classes.backButton
                    )}
                    color="primary"
                    style={{ margin: '8px' }}
                    onClick={event => activeStep == 0 ? saveNotification(true, false) : saveSettings(true)}>
                    {t('notifications.saveAndExit')}
                </Button>
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightGreen,
                        classes.backButton,
                        activeStep > 0 && selectedGroups.length === 0 ? classes.disabled : ''
                    )}
                    color="primary"
                    style={{ margin: '8px' }}
                    onClick={event => activeStep == 0 ? saveNotification(false, true) : saveSettings(false, true)}>
                    {activeStep == 0 ? t('notifications.saveAndContinue') : t('notifications.summary')}
                </Button>
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

    const notificationSendSettings = () => {
        return (
            <Grid container
                direction="row"
                justifyContent="flex-start"
                spacing={4}
                className={classes.wizardFlex}
            >
                <Grid item md={7} xs={12}>
                    <h2 className={classes.sectionTitle}>{t('notifications.toWhomToSend')}</h2>
                    <Groups classes={classes}
                        list={groupList}
                        selectedList={selectedGroups}
                        callbackSelectedGroups={callbackSelectedGroups}
                        callbackUpdateGroups={callbackUpdateGroups}
                        callbackSelectAll={callbackSelectAll}
                        isNotifications={true}
                        showFilter={false}
                        isSms={false}
                        noSelectionText={t("notifications.noGroupsSelected")}
                        innerHeight={325}
                    />
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
                    <h2 className={classes.sectionTitle} style={{ marginTop: windowSize == "xs" ? "0" : null }}>{t('notifications.whenToSend')}</h2>
                    <FormControl component="fieldset">
                        <RadioGroup aria-label="gender" name="sendType" value={sendType} onChange={handleSendType}>
                            <FormControlLabel value="1" control={<Radio color="primary" />} label={<span className={classes.radioText}>{t("notifications.immediateSend")}</span>} />
                            <FormHelperText className={classes.helpText}>{t("notifications.immediateDescription")}</FormHelperText>
                            <FormControlLabel value="2" control={<Radio color="primary" />} label={<span className={classes.radioText}>{t("notifications.futureSend")}</span>} />
                        </RadioGroup>
                        <Box style={{ paddingRight: isRTL ? 30 : '', paddingLeft: isRTL ? '' : 30, pointerEvents: sendType == '1' ? 'none' : 'auto' }}>
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
                        <Box style={{ marginTop: 10, paddingRight: isRTL ? 30 : '', paddingLeft: isRTL ? '' : 30, pointerEvents: sendType == '1' ? 'none' : 'auto' }}>
                            <DateField
                                classes={classes}
                                value={sendDate}
                                onTimeChange={handleTimePicker}
                                placeholder={t('notifications.hour')}
                                isTimePicker={true}
                                // buttons={{ ok: t("common.confirm"), cancel: t("common.cancel") }}
                                ampm={false}
                                timePickerOpen={timePickerOpen}
                                autoOk
                            />
                        </Box>
                    </FormControl>
                </Grid>
            </Grid>

        );
    }

    return (
        <DefaultScreen
            currentPage='notifications'
            subPage='create'
            customPadding={true}
            classes={classes}
            containerClass={classes.editor}>
            <div style={{ height: 'calc(100vh - 53px)', display: 'flex', flexDirection: 'column', paddingBottom: 40 }}>
                {renderToast()}
                {renderHeader()}
                {notificationSendSettings()}
                {renderDialog()}
                {renderSummary()}
                {renderSentDialog()}
                {renderConfirmCancel()}
                <WizardButtons />
            </div>
        </DefaultScreen>
    );
};

export default NotificationSend;