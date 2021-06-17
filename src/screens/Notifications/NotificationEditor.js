import React, { useState, useEffect } from 'react';
import DefaultScreen from '../DefaultScreen'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
  Typography, Button, TextField, Grid, Switch, Box, FormControlLabel, FormControl, RadioGroup, Radio, ClickAwayListener,
  FormHelperText, Divider
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Preview } from '../../components/Notifications/Preview/Preview';
import { getNotificationById, save, updateNotification, getNotificationPublicKey, getNotificationGroups, getSettings, saveNotificationSettings, SendNotification, getUniqueClientsByGroups } from '../../redux/reducers/notificationSlice';
import clsx from 'clsx';
import { useHistory } from "react-router-dom";
import { PushService } from './init-push';
import Picker from 'emoji-picker-react';
import { FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import './notification.styles.css';
import Groups from '../../components/Notifications/Groups/Groups';
import Gallery from '../../components/Gallery/Gallery.component';
import {
  DateField, Dialog
} from '../../components/managment/index';
import { MdErrorOutline, MdNotificationsActive } from 'react-icons/md';
import { IoMdImages } from 'react-icons/io'
import moment from 'moment'
import 'moment/locale/he'
import Toast from '../../components/Toast/Toast.component';
import Tooltip from '@material-ui/core/Tooltip';
import {
  CheckAnimation
} from '../../assets/images/settings/index'


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
      height: 40,
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

const NotificationEditor = ({ props, classes }) => {
  /* #region  Component settings constatns */
  const dispatch = useDispatch();
  const { language } = useSelector(state => state.core)
  const { t } = useTranslation();
  const history = useHistory();
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
    if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
      getData();
      if (props.match.params.send || props.match.url.toLowerCase().indexOf('send') > -1) {
        getSubAccountGroups();
        setActiveStep(activeStep + 1);
      }
    }
    else {
      handlePublicKey();
    }
  }, [dispatch]);

  useEffect(() => {
    if (groupList && groupList.length > 0) {
      getNotificationSettings();
    }
  }, [groupList]);
  /* #endregion */
  /* #region  Callbacks */
  const callbackSelectedGroups = (group, key, reference) => {
    const found = selectedGroups.map((group) => { return group.Id }).includes(group.Id)
    if (found) {
      setSelected(selectedGroups.filter(g => g.Id !== group.Id))
    } else {
      setSelected([...selectedGroups, group])
    }
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
  const callbackUpdateGroups = (groups) => {
    setSelected(groups);
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
  
  /* #endregion */
  /* #region  Data Handlers */
  const handlePublicKey = async () => {
    const t = await dispatch(getNotificationPublicKey());
    if (t && t.payload) {
      setPublicKey(t.payload.PublicKey);
    }
    else {
      setPublicKey('');
    }
  }
  const saveNotification = (isExit, isContinue) => {
    // Show loader
    // event.preventDefault();
    setSourceModel(model);
    if (isValidNotification()) {
      if (!ShowRedirectButton) {
        model.RedirectButtonText = '';
      }
      if (model && model.ID > 0) {
        dispatch(updateNotification(model));
        setToastMessage(toastMessages.SUCCESS);
        if (isContinue) {
          redirectAfterSave(model.ID);
        }
      }
      else {
        dispatch(save(model)).then((response) => {
          if (props.match.params.create || props.match.url.toLowerCase().indexOf('create') > -1) {
            if (isExit) {
              history.push("/Notifications");
            }
            else {
              setTimeout(() => {
                if (isContinue) {
                  redirectAfterSave(response.payload);
                }
                else {
                  history.push(`/Notification/edit/${response.payload}`);
                }
              }, 1000);
            }
          }
          else {
            setModel({ ...model, ID: response.payload });
            if (isContinue) {
              redirectAfterSave(response.payload);
            }
            else {
              setToastMessage(toastMessages.SUCCESS);
            }
          }
        });
      }
      if (isExit) {
        history.push("/Notifications");
      }
    }
  }
  const saveSettings = async (isExit) => {
    // event.preventDefault();
    setSourceModel(model);
    if (isValidSettings()) {
      if (sendType === "2") {
        const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
        m.set({ h: m.format('HH'), m: m.format('mm') });

        model.SendDate = m.format();
      }
      else {
        model.sendDate = null;
      }
      const data = { NotificationId: parseInt(props.match.params.id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
      const result = await dispatch(saveNotificationSettings(data));
      if (result.payload == true) {
        if (!isExit) {
          setToastMessage(toastMessages.SAVE_SETTINGS);
        }
        else {
          history.push("/Notifications");
        }
      }
      else {
        setToastMessage(toastMessages.ERROR);
      }
    }

  }
  const insertNotificationForSend = async (e) => {
    e.preventDefault();
    const data = { NotificationId: parseInt(props.match.params.id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
    const result = await dispatch(SendNotification(data));

    if (result && result.payload === true) {
      setSummary(null);
      setCampaignSent(true);
    }
  }
  const getData = async () => {
    const notificationPayload = await dispatch(getNotificationById(props.match.params.id));
    setModel(notificationPayload.payload);
    setSourceModel(notificationPayload.payload);
    setPublicKey(notificationPayload.payload.PublicKey);
    if (notificationPayload.payload.RedirectButtonText != '') {
      setRedirectButtonVisibillity(true);
    }
  }
  const getSubAccountGroups = async () => {
    const list = await dispatch(getNotificationGroups());
    setGroupList(list.payload);
  }
  const getNotificationSettings = async () => {
    const list = await dispatch(getSettings(props.match.params.id));
    const selectedList = [];
    if (list.payload.length > 0) {
      const sendDate = list.payload[0].SendDate;
      // const status = list.payload[0].StatusID;
      if (sendDate) {
        const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
        const d = m.format('YYYY-MM-DD HH:mm:ss');
        handleFromDate(d);
        setSendType('2');
      }
      list.payload.forEach((g) => {
        const exist = groupList.filter(gl => { return gl.Id === g.NotificationGroupId });
        if (exist && exist.length > 0) {
          selectedList.push(exist[0]);
        }
      });
    }
    setSelected(selectedList);
  }
  const getSummary = async (event) => {
    event.preventDefault();
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
  const handleSendConfirm = () => {
    history.push("/Notifications");
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
            onClick={handleSendConfirm}
            className={clsx(
              classes.confirmButton,
              classes.dialogConfirmButton,
            )}>
            {t('common.confirm')}
          </Button>
        )
      };

      return (
        <Dialog
          showDivider={false}
          classes={classes}
          open={true}
          onClose={handleSendConfirm}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
    return null;
  }

  /* #endregion */
  /* #region  Wizard steps */
  const handleCancel = () => {
    if (JSON.stringify(sourceModel) !== JSON.stringify(model)) {
      setShowConfirmCancel(true);
    }
    else {
      onCancelConfirm(false);
    }
  };
  const onCancelConfirm = (saveBeforeCancel) => {
    if (saveBeforeCancel) {
      if (activeStep == 0) {
        saveNotification(true, false)
      }
      else {
        saveSettings(true)
      }
    }
    else {
      history.push("/Notifications");
    }
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
        <Dialog
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
        </Dialog>
      );
    }
  }
  const handleBack = () => {

    history.push(`/Notification/edit/${model.ID}`);
  };
  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return notificationEdit();
      case 1:
        return notificationSendSettings();
    }
  }
  const redirectAfterSave = (notificationId) => {
    if (notificationId > 0) {
      history.push(`/Notification/send/${notificationId}`);
    }
  }
  /* #endregion */
  /* #region  Model Handlers */
  const handleNotificationName = (event) => {
    setModel({ ...model, Name: event.target.value });
  }
  const handleRedirectUrlChange = (event) => {
    setModel({ ...model, RedirectURL: event.target.value });
  }
  const handleRedirectButtonTextChange = (event) => {
    const textLength = event.target.value.length;
    if (textLength <= 50) {
      setModel({ ...model, RedirectButtonText: event.target.value });
    }
    return;
  }
  const handleRedirectVisibillity = (event) => {
    setRedirectButtonVisibillity(event.target.checked);
  }
  const handleNotificationTitle = (event) => {
    if (event.target.value.length <= 50) {
      setModel({ ...model, Title: event.target.value });
    }
    event.target.value = event.target.value.substring(0, 50);
  }
  const handleNotificationText = (event) => {
    if (event.target.value.length <= 100) {
      setModel({ ...model, Body: event.target.value });
    }
    event.target.value = event.target.value.substring(0, 100);
  }
  const handleDirection = (event) => {
    setModel({ ...model, Direction: parseInt(event.target.value) })
  }
  const handleSendType = (event) => {
    if (event.target.value == '1') {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
    }
    setSendType(event.target.value);
  }
  /* #endregion */
  /* #region  Emoji */
  const showEmoji = () => {
    setShowEmoji(!isEmojiShown);
  }
  const handleClickOutsideEmoji = (event) => {
    if (event.target.id != 'emohiToggle')
      setShowEmoji(false);
  }
  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    const el = document.querySelector(`#${inputFocus}`);
    if (el) {
      let finalStr = '';
      const textBefore = el.value.substring(0, cursorPosition);
      const textAfter = el.value.substring(cursorPosition, el.value.length);
      const valToReplace = el.value.substring(el.selectionStart, el.selectionEnd);

      if (valToReplace != '') {
        finalStr = el.value.replace(valToReplace, emojiObject.emoji);
      }
      else {
        finalStr = `${textBefore}${emojiObject.emoji}${textAfter}`;
      }

      if (inputFocus == 'notificationTitle') {
        if (finalStr.length <= 50) {
          setModel({ ...model, Title: finalStr });
        }
      }
      else if (inputFocus == 'notificationText') {
        if (finalStr.length <= 100) {
          setModel({ ...model, Body: finalStr });
        }
      }
      else {
        if (finalStr.length <= 50) {
          setModel({ ...model, RedirectButtonText: finalStr });
        }
      }
    }
  };
  const handleTextFocus = (event) => {
    setFocusOnInput(event.target.id);
    const el = document.querySelector(`#${event.target.id}`);
    setTimeout(() => {
      const selection = el.selectionEnd - el.selectionStart;
      if (selection == 0) {
        setCursorPosition(el.selectionStart);
      }
    }, 100);

  }
  /* #endregion */
  /* #region  Validators */
  const isValivalidURL = (str) => {
    try {
      new URL(str);
    } catch (_) {
      return false;
    }

    return true;
  }
  const updateUrlValue = (e) => {
    const val = e.target.value;
    if (val.trim().replace(" ", "") != "" && val.indexOf("http") == -1) {
      if (val.indexOf("www") === -1) {
        e.target.value = "https://www." + val
      }
      else e.target.value = "https://" + val;
      setModel({ ...model, RedirectURL: e.target.value });
    }
  }
  const isValidNotification = () => {
    setShowConfirmCancel(false);
    const errorList = [];
    document.querySelector("#notificationName").classList.remove("error");
    if (ShowRedirectButton)
      document.querySelector("#notificationRedirectUrl").classList.remove("error");
    document.querySelector("#notificationTitle").classList.remove("error");
    document.querySelector("#notificationText").classList.remove("error");

    if (model.Name === '') {
      errorList.push({ message: t('notifications.validation.notificationName') });
      document.querySelector("#notificationName").classList.add("error");
    }
    if (!isValivalidURL(model.RedirectURL) && ShowRedirectButton) {
      errorList.push({ message: t('notifications.validation.redirectUrl') });
      document.querySelector("#notificationRedirectUrl").classList.add("error");
    }
    if (model.Title === '') {
      errorList.push({ message: t('notifications.validation.title') });
      document.querySelector("#notificationTitle").classList.add("error");
    }
    if (model.Body === '') {
      errorList.push({ message: t('notifications.validation.body') });
      document.querySelector("#notificationText").classList.add("error");
    }

    if (errorList.length > 0) {
      setValidationError(errorList);
      return false;
    }

    return true;
  }
  const isValidSettings = () => {
    let result = true;
    setShowConfirmCancel(false);
    const errorList = [];
    document.querySelector("#datePicker").classList.remove("error");
    document.querySelector("#timePicker").classList.remove("error");

    if (sendType == 2) {
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
  /* #endregion */
  // Test send 
  const handleTestSend = () => {
    PushService(notificationPublicKey).then((permissions) => {
      try {
        if (permissions.subscription && permissions.state == 'granted') {
          const options = {
            id: model.ID,
            dir: model.Direction == '2' ? 'rtl' : 'ltr',
            body: model.Body,
            icon: model.Icon,
            image: model.Image,
            title: model.Title,
            renotify: 'true',
            tag: 'pulseem_' + model.ID,
            redirect: model.RedirectURL
          };

          if (model.RedirectURL != '' && model.RedirectButtonText != '' && ShowRedirectButton) {
            options.actions = [];
            options.actions.push({ action: model.RedirectURL, title: model.RedirectButtonText });
          }

          permissions.subscription.showNotification(model.Title, options);
        }
      }
      catch (e) {
        console.log(e);
      }

    });
  }

  /* #region  HTML Renders */
  // Notification Edtior
  const notificationEdit = () => {
    return (
      <Box>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={3} xs={12}>
            <label>* {t('notifications.notificationName')}</label>
            <TextField
              id="notificationName"
              required
              placeholder={t('notifications.notificationName')}
              value={model && model.Name || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleNotificationName}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <BootstrapTooltip title={t("notifications.tooltip.showRedirectButton")} placement="top">
              <FormControlLabel
                style={{ marginTop: 25, display: 'flex', justifyContent: 'center', alignContent: 'center' }}
                control={
                  <Switch
                    checked={ShowRedirectButton}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    onChange={handleRedirectVisibillity}
                  />
                }
                label={t('notifications.showRedirectUrlButton')}
              />
            </BootstrapTooltip>
          </Grid>
          {ShowRedirectButton &&
            <Grid item md={3} xs={12}>
              <label>* {t('notifications.redirectUrl')}</label>
              <TextField
                placeholder={t('notifications.redirectUrl')}
                id="notificationRedirectUrl"
                style={{ textAlign: 'left' }}
                required
                value={model && model.RedirectURL || ''}
                className={classes.textField}
                margin="dense"
                variant="outlined"
                onChange={handleRedirectUrlChange}
                onBlur={event => updateUrlValue(event)}
              />
            </Grid>
          }
          {ShowRedirectButton &&
            <Grid item md={3} xs={12}>
              <label>{t('notifications.redirectUrlButton')}</label>
              <TextField
                placeholder={t('notifications.redirectUrlButton')}
                id="notificationButton"
                value={model && model.RedirectButtonText || ''}
                className={classes.textField}
                margin="dense"
                variant="outlined"
                onChange={handleRedirectButtonTextChange}
                onFocus={handleTextFocus}
              />
            </Grid>}
        </Grid>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={4} xs={12}>
            {notificationContent()}
          </Grid>
          <Grid item md={1} xs={12}>&nbsp;</Grid>
          <Grid item md={4} xs={12} className={classes.previewStep}>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText && model.RedirectButtonText != ''}
            />
          </Grid>
        </Grid>
      </Box>
    );

  }
  const notificationContent = () => {
    // const toggleHover = () => setHovered(!notificationHover);
    // const toggleIconHover = () => setIconHover(!iconHover);
    const removeImage = () => {
      setModel({ ...model, Image: null });
    }
    const removeIcon = () => {
      setModel({ ...model, Icon: null });
    }
    return (
      <div>
        <Grid style={{ marginRight: '10px', marginLeft: '10px', marginTop: 35 }}>
          <Box pt={2} style={{ position: 'relative' }}>
            <FormControl component="fieldset" className={classes.directionBar}>
              <RadioGroup defaultValue="2" aria-label="direction" name="direction" className={!isRTL ? classes.flexReveres : classes.directionBar}>
                <FormControlLabel value="2"
                  control={<Radio
                    name="direction"
                    value="2"
                    checked={model.Direction === 2}
                    onChange={handleDirection}
                    checkedIcon={<FaAlignRight
                      style={{ fontWeight: 'bold', fontSize: 24, color: 'black' }}
                    />}
                    icon={<FaAlignRight style={{ fontSize: 24 }}
                    />}
                  />}
                />
                <FormControlLabel value="1"
                  control={<Radio
                    name="direction"
                    value="1"
                    checked={model.Direction === 1}
                    onChange={handleDirection}
                    checkedIcon={<FaAlignLeft
                      style={{ fontWeight: 'bold', fontSize: 24, color: 'black' }}
                    />}
                    icon={<FaAlignLeft style={{ fontSize: 24 }}
                    />}
                  />}
                />
              </RadioGroup>
              <button className={classes.emojiIcon} onClick={showEmoji} id="emohiToggle"></button>
              <ClickAwayListener onClickAway={handleClickOutsideEmoji}>
                <div>
                  {isEmojiShown && <Picker onEmojiClick={onEmojiClick}
                    disableSearchBar={true}
                    disableSkinTonePicker={true}
                    pickerStyle={{ backgroundColor: '#fff', zIndex: '99999', textAlign: 'left' }}
                    groupVisibility={{ recently_used: false }} />}
                </div>
              </ClickAwayListener>
            </FormControl>
          </Box>
        </Grid>
        <div className={classes.notification} id={model.ID}>
          <div style={{ marginBottom: 5 }} className={clsx(
            classes.flexJustifyCenter,
            classes.dashed,
            classes.notificationTop,
            classes.notificationContainer
          )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={openGallery(false)}
            style={{
              backgroundImage: `url(${model.Image})`
            }}
          >
            {model == null || !model.Image ? chooseImage() : ""
            }
            <button href="#"
              className={clsx(classes.absTopRight, notificationHover && model.Image != null && model.Image !== '' ? null : classes.hidden)}
              style={{ border: 'none', cursor: 'pointer', textDecoration: 'none', opacity: notificationHover ? 1 : 0 }}
              onClick={removeImage}
              id="removeImage"
            >X</button>
          </div>
          <div className={clsx(classes.footerWrapper, classes.dashed)} style={{ flexDirection: isRTL ? (model.Direction == 1 ? 'row-reverse' : 'row') : (model.Direction == 1 ? 'row' : 'row-reverse') }}>
            <div className={classes.iconWrapper}>
              <div className={clsx(classes.flexJustifyCenter, classes.dashed, classes.icon)}
                onMouseEnter={() => setIconHover(true)}
                onMouseLeave={() => setIconHover(false)}
                onClick={openGallery(true)}
                style={{
                  backgroundImage: `url(${model.Icon})`
                }}>
                <div className={clsx(classes.flex, classes.flexCenter, classes.flexColumn)}
                  style={{
                    fontSize: '30px', cursor: 'pointer'
                  }}>
                  {model == null || !model.Icon ? <ChooseIcon /> : ""
                  }
                </div>
                <button href="#"
                  className={clsx(classes.absTopRight, iconHover && model.Icon !== null && model.Icon !== '' ? null : classes.hidden)}
                  style={{ border: 'none', cursor: 'pointer', textDecoration: 'none', opacity: iconHover ? 1 : 0 }}
                  onClick={removeIcon}
                  id="removeIcon"
                >X</button>
              </div>
            </div>
            <div className={classes.notificationContent} style={{ marginBottom: 15 }}>
              <DashedInput
                aria-label=""
                required
                placeholder={t("notifications.ph_title")}
                value={model.Title}
                className={clsx(classes.transparent, classes.dashed)}
                onChange={handleNotificationTitle}
                style={{ direction: model.Direction == 2 ? 'rtl' : 'ltr', textAlign: model.Direction == 2 ? 'right' : 'left' }}
                onFocus={handleTextFocus}
                variant="outlined"
                id="notificationTitle"
              />
              <DashedInput
                inputProps={{ className: classes.textarea }}
                multiline
                rows={2}
                aria-label=""
                required
                placeholder={t("notifications.ph_body")}
                value={model.Body}
                className={clsx(classes.transparent, classes.dashed, classes.notificationText)}
                onChange={handleNotificationText}
                style={{ direction: model.Direction == 2 ? 'rtl' : 'ltr', textAlign: model.Direction == 2 ? 'right' : 'left', maxHeight: 45 }}
                onFocus={handleTextFocus}
                variant="outlined"
                id="notificationText"
              />
            </div>
          </div>
          {ShowRedirectButton && model.RedirectButtonText != '' ? redirectButton(true) : ''}
        </div>
        <Box pt={1} mt={1}>
          <b>{t("notifications.titleLimitation")}</b>
          {model && model.Title && model.Title != '' && model.Title.length || 0}
        </Box>
        <Box>
          <b>{t("notifications.bodyLimitation")}</b>
          {model && model.Body && model.Body != '' && model.Body.length || 0}
        </Box>
      </div >
    )
  }
  // Notification Settings
  const notificationSendSettings = () => {
    return (
      <Grid container
        direction="row"
        justify="flex-start"
        spacing={4}
        className={classes.wizardFlex}
      >
        <Grid item md={7} xs={12}>
          <h2 className={classes.sectionTitle}>{t('notifications.toWhomToSend')}</h2>
          <Groups classes={classes}
            groupList={groupList}
            selectedList={selectedGroups}
            callbackSelectedGroups={callbackSelectedGroups}
            callbackUpdateGroups={callbackUpdateGroups}
            callbackSelectAll={callbackSelectAll}
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
                minimumDate={moment()}
                classes={classes}
                value={sendDate}
                onChange={handleDatePicker}
                placeholder={t('notifications.date')}
                buttons={{ ok: t("common.confirm"), cancel: t("common.cancel") }}
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
                buttons={{ ok: t("common.confirm"), cancel: t("common.cancel") }}
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
  // Notification Summary
  const renderSummary = () => {
    if (summary && totalRecipients) {
      let dialog = {};
      dialog = summaryContent();
      return (
        <Dialog
          customContainerStyle={classes.summaryContainer}
          classes={classes}
          open={summary}
          onClose={handleSummaryClose}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }
  const summaryContent = () => {
    const handleShowDetails = () => {
      setDetailsVisibility(!showDetails);
    }
    const whenToSend = summary.sendDate ? `${summary.sendDate}` : t("notifications.immediateSend")
    return {
      showDivider: true,
      icon: (
        <MdNotificationsActive style={{ fontSize: 30 }} />
      ),
      title: <span style={{ color: '#161616' }}>{`${t("notifications.summaryModalTitle")} "${model.Name}"`}</span>,
      content: (
        <Grid container direction={'row'} className={clsx(classes.root, classes.dialogBox)} spacing={4}>
          <Grid item md={6} xs={12}>
            <h3 className={clsx(classes.blue, classes.summaryTitle)}>{t("notifications.when")}</h3>
            <b>{whenToSend}</b>
            <h3 className={clsx(classes.blue, classes.summaryTitle)}>{t("notifications.for")}</h3>
            {t("notifications.totalRecipientForSending")} <b>{totalRecipients}</b>
            <Grid item xs={12} style={{ paddingTop: 15 }}>
              <a onClick={handleShowDetails} style={{ cursor: 'pointer', fontWeight: '500', textDecoration: 'underline', color: '#6c757d' }}>
                {!showDetails ? t("notifications.details") : t("notifications.close")}
              </a>
            </Grid>
          </Grid>
          {windowSize !== 'xs' && <Grid item md={6}>
            <h3 className={classes.blue} style={{ fontWeight: '500', fontSize: 20, marginTop: 10 }}>{t("notifications.preview")}</h3>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText != ''}
              showDevices={true}
              showTitle={false}
              showOSScreen={false}
            />
          </Grid>}
          <Grid item xs={12} style={{ paddingTop: 0 }}>
            {showDetails && <div>
              <h3 style={{ cursor: 'pointer', marginBotton: 0 }} onClick={() => setShowGroupsList(!showGroupsList)}>{t("notifications.buttons.groups")} ({selectedGroups.length})</h3>
              <Divider />
              {showGroupsList && <ul>
                {selectedGroups.map((g, index) => {
                  return (<li key={`group_${g.Id}`}>
                    <div className={classes.flexSpaceBetween}>
                      <Typography className={classes.padding10}>{g.GroupName}</Typography> <Typography>{g.Members} {g.Members != 1 ? t("notifications.recipients") : t("notifications.recipient")}</Typography>
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
              variant='contained'
              size='small'
              onClick={insertNotificationForSend}
              className={clsx(
                classes.dialogButton,
                classes.dialogConfirmButton
              )}>
              {t('common.Send1')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              size='small'
              onClick={handleSummaryClose}
              className={clsx(
                classes.dialogButton,
                classes.dialogCancelButton
              )}>
              {t('common.Cancel')}
            </Button>
          </Grid>
        </Grid>
      )
    };
  }
  const handleSummaryClose = () => {
    setSummary(null);
  }
  /* #region  Templates */
  const chooseImage = () => {
    return (<div className={clsx(
      classes.flex,
      classes.flexCenter,
      classes.flexColumn
    )}
      style={{ fontSize: '80px' }}>
      <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="image" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <g>
          <path fillRule="evenodd" d="M14.002 2h-12a1 1 0 0 0-1 1v9l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094L15.002 9.5V3a1 1 0 0 0-1-1zm-12-1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm4 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
        </g>
      </svg>
      <span style={{ fontSize: '14px', direction: isRTL ? 'rtl' : 'ltr' }}>{t("notifications.ph_chooseImage")}</span>
    </div>
    )
  }
  const ChooseIcon = () => {
    return (<div className={clsx(
      classes.flex,
      classes.flexCenter,
      classes.flexColumn
    )}
      style={{ fontSize: '40px' }}><svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="image" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <g>
          <path fillRule="evenodd" d="M14.002 2h-12a1 1 0 0 0-1 1v9l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094L15.002 9.5V3a1 1 0 0 0-1-1zm-12-1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm4 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
        </g>
      </svg>
      <span style={{ fontSize: '14px', direction: isRTL ? 'rtl' : 'ltr' }}>{t("notifications.ph_chooseIcon")}</span>
    </div>
    )
  }
  /* #endregion */
  /* #endregion */
  /* #region  Gallery Dialog */
  const openGallery = (isIcon) => (event) => {
    if (event.target.id == "removeIcon" || event.target.id == "removeImage") {
      return;
    }

    setIsIcon(isIcon);
    setGalleryState(true);
    setIsFileSelected(false);
  }
  const handleSelectedImage = (image) => {
    setGalleryState(false);
    if (isIcon == true) {
      setModel({ ...model, Icon: image });
    }
    else {
      setModel({ ...model, Image: image });
    }
  }
  const handleGalleryConfirm = () => {
    setIsFileSelected(true);
  }
  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {};
      dialog = renderGalleryDialog();

      return (
        <Dialog
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={handleDialogClose}
          onConfirm={handleGalleryConfirm}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }
  const renderGalleryDialog = () => {
    return {
      showDivider: false,
      icon: (
        <IoMdImages style={{ fontSize: 30, color: '#fff' }} />
      ),
      title: t("common.imageGallery"),
      content: (
        <Gallery
          classes={classes}
          isConfirm={isGalleryConfirmed}
          callbackSelectFile={handleSelectedImage}
          style={{ minWidth: 400 }} />
      )
    };
  }
  /* #endregion */
  /* #region  Dialog */
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
  /* #endregion */
  const redirectButton = (showBorder) => {
    return <div className={clsx(classes.RedirectButtonText, showBorder ? classes.dashed : null)}>{model.RedirectButtonText}</div>
  }
  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>{t('notifications.createNewPush')}</Typography>
        <Typography className={classes.pageSubTitle}>
          <span className={classes.roundedCircle}>
            {activeStep + 1}
          </span>
          <span className={classes.subTitle}>
            {activeStep == 0 ? t('notifications.createContent') : t('notifications.sendSettings')}
          </span>
        </Typography>
        <Typography style={{ fontSize: 24 }}>{activeStep == 0 && t('notifications.createContentText')}</Typography>
      </>
    )
  }
  const renderNotification = () => {
    return (
      <div className={classes.root}>
        <div>
          {getStepContent(activeStep)}
        </div>
      </div>
    )
  }
  const WizardButtons = () => {
    return (<div className={clsx(classes.wizardButtonContainer, "wizardButtonContainer")}>
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
          onClick={handleBack}
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
          onClick={handleCancel}
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
          onClick={event => activeStep == 0 ? saveNotification(false, true) : getSummary(event)}>
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

  return (
    <DefaultScreen
      currentPage='notifications'
      customPadding={true}
      classes={classes}>
      <div style={{ height: 'calc(100vh - 53px)', display: 'flex', flexDirection: 'column' }}>
        {renderToast()}
        {renderHeader()}
        {renderNotification()}
        {renderDialog()}
        {renderSummary()}
        {renderSentDialog()}
        {showGalleryModal()}
        {renderConfirmCancel()}
        <WizardButtons />
      </div>
    </DefaultScreen>
  );
}

export default NotificationEditor;