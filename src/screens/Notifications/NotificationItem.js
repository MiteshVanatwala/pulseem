import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import {
  Typography, Button, TextField, Grid, TextareaAutosize, Switch, Box, FormControlLabel, FormControl, RadioGroup, Radio, ClickAwayListener,
  FormHelperText, Divider
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Preview } from '../../components/Notifications/Preview/Preview';
import { getNotificationById, save, updateNotification, getApiToken, getNotificationGroups, getSettings, saveNotificationSettings, SendNotification, getUniqueClientsByGroups } from '../../redux/reducers/notificationSlice';
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


function getSteps() {
  return ['Create content', 'Send Settings'];
}

const NotificationItem = ({ props, classes }) => {
  const dispatch = useDispatch();
  const { language } = useSelector(state => state.core)
  const { t } = useTranslation();
  const steps = getSteps();
  const history = useHistory();
  let isEditable = false;
  const { isRTL } = useSelector(state => state.core);
  moment.locale(language);

  // State
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

  const [activeStep, setActiveStep] = React.useState(0);
  const [ShowRedirectButton, setRedirectButtonVisibillity] = React.useState(false);
  const [apiToken, setApiToken] = useState(0);
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
  const [summary, setSummary] = useState(null);
  const [showDetails, setDetailsVisibility] = useState(false);
  const [notificationHover, setHovered] = useState(false);
  const [showGallery, setGalleryState] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [isIcon, setIsIcon] = useState(false);
  const [totalRecipients, setTotalRecipients] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);


  const getSubAccountGroups = async () => {
    const list = await dispatch(getNotificationGroups());
    setGroupList(list.payload);
  }

  useEffect(() => {
    if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
      getData();
      handleApiToken();
      getSubAccountGroups();
      isEditable = true;
      if (props.match.params.send || props.match.url.toLowerCase().indexOf('send') > -1) {
        setActiveStep(activeStep + 1);
      }
    }
    else {
      isEditable = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (groupList && groupList.length > 0) {
      getNotificationSettings();
    }
  }, [groupList]);

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
  const handleSendType = (event) => {
    setSendType(event.target.value);
  }
  const getSummary = async () => {
    console.log(selectedGroups);
    const totalResonse = await dispatch(getUniqueClientsByGroups(selectedGroups.map((g) => { return g.Id; })));
    setTotalRecipients(totalResonse.payload);
    if (sendDate) {
      const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
      setSummary({ groups: selectedGroups, sendType: sendType, sendDate: m.format("MMMM Do YYYY, hh:mm a") });

    }
    else {
      setSummary({ groups: selectedGroups, sendType: sendType, sendDate: null });
    }
  }
  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: t('notifications.saved'), showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('notifications.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('notifications.error'), showAnimtionCheck: true },
  }
  // Api calls
  const saveNotification = (isExit, isContinue) => (event) => {
    // Show loader
    event.preventDefault();
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
          setModel({ ...model, ID: response.payload });
          if (isContinue) {
            redirectAfterSave(response.payload);
          }
          else {
            setToastMessage(toastMessages.SUCCESS);
          }
        });
      }
      if (isExit) {
        history.push("/Notification");
      }
    }
  }
  const saveSettings = async () => {
    if (isValidSettings()) {
      if (sendType === "2") {
        const m = moment(sendDate, 'YYYY-MM-DD HH:mm:ss');
        m.set({ h: m.format('HH'), m: m.format('mm') });

        model.SendDate = m.format();
      }
      const data = { NotificationId: parseInt(props.match.params.id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
      const result = await dispatch(saveNotificationSettings(data));
      if (result.payload == true) {
        setToastMessage(toastMessages.SAVE_SETTINGS);
      }
    }
  }
  const insertNotificationForSend = async () => {
    const data = { NotificationId: parseInt(props.match.params.id), NotificationGroups: selectedGroups.map((g) => { return g.Id }), ScheduleTime: model.SendDate };
    const result = await dispatch(SendNotification(data));
    if (result && result.payload == "true") {
      history.push("/Notification");
    }
  }
  const getNotificationSettings = async () => {
    const list = await dispatch(getSettings(props.match.params.id));
    const selectedList = [];
    if (list.payload.length > 0) {
      const sendDate = list.payload[0].SendDate;
      const status = list.payload[0].StatusID;
      if (sendDate && (status == 4 || status == 5)) {
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
  const handleApiToken = async () => {
    const apiToken = await dispatch(getApiToken());
    const token = apiToken && apiToken.payload && apiToken.payload.PublicKey || '';
    setApiToken(token);
  }
  const getData = async () => {
    const notificationPayload = await dispatch(getNotificationById(props.match.params.id));
    setModel(notificationPayload.payload);

    if (notificationPayload.payload.RedirectButtonText != '') {
      setRedirectButtonVisibillity(true);
    }
  }

  // Wizard Steps handlers

  const handleCancel = () => {
    history.push("/Notification");
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    history.push(`/Notification/edit/${model.ID}`);
    //setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };
  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return notificationEdit();
      case 1:
        return notificationSendSettings();
    }
  }

  // Model Handlers
  const handleNotificationName = (event) => {
    setModel({ ...model, Name: event.target.value });
  }
  const handleRedirectUrlChange = (event) => {
    setModel({ ...model, RedirectURL: event.target.value });
  }
  const handleRedirectButtonTextChange = (event) => {
    setModel({ ...model, RedirectButtonText: event.target.value });
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
  const redirectAfterSave = (notificationId) => {
    if (notificationId > 0) {
      history.push(`/Notification/send/${notificationId}`);
    }
  }
  // Emoji
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
        setModel({ ...model, Title: finalStr });
      }
      else if (inputFocus == 'notificationText') {
        setModel({ ...model, Body: finalStr });
      }
      else {
        setModel({ ...model, RedirectButtonText: finalStr });
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
  // Validators
  // Notification edit validation
  const isValidNotification = () => {
    const errorList = [];

    if (model.Name === '') {
      errorList.push({ message: t('notifications.validation.notificationName') });
    }
    if (model.RedirectURL === '') {
      errorList.push({ message: t('notifications.validation.redirectUrl') });
    }
    if (model.Title === '') {
      errorList.push({ message: t('notifications.validation.title') });
    }
    if (model.Body === '') {
      errorList.push({ message: t('notifications.validation.body') });
    }

    if (errorList.length > 0) {
      setValidationError(errorList);
      return false;
    }

    return true;
  }
  const isValidSettings = () => {
    const errorList = [];

    if (sendType == 2 && (!sendDate)) {
      errorList.push({ message: t('notifications.validation.notificationDate') });
    }
    if (selectedGroups.length === 0) {
      errorList.push({ message: t('notifications.validation.notificationGroups') });
    }
    if (errorList.length > 0) {
      setValidationError(errorList);
      return false;
    }
    return true;
  }

  const handleDialogClose = () => {
    setValidationError(null);
    setGalleryState(null);
  }
  // Test send 
  const handleTestSend = () => {
    PushService(apiToken).then((permissions) => {
      try {
        if (permissions.subscription) {
          if (permissions.state == 'granted') {
            const options = {
              id: model.ID,
              dir: model.Direction == 2 ? 'rtl' : 'ltr',
              renotify: true,
              body: model.Body,
              icon: model.Icon,
              image: model.Image,
              title: model.Title,
              vibrate: [200, 100, 200],
              tag: "test",
              badge: model.Icon,
              redirect: model.RedirectURL
            };

            if (model.RedirectURL != '' && model.RedirectButtonText != '' && ShowRedirectButton) {
              options.actions = [];
              options.actions.push({ action: model.RedirectURL, title: model.RedirectButtonText });
            }

            permissions.subscription.showNotification(model.Title, options);

          }

        }
      }
      catch (e) {
        console.log(e);
      }

    });
  }
  // HTML Pages
  // Notification Edtior
  const notificationEdit = () => {
    return (
      <Box>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          spacing={4}
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={2} xs={12}>
            <TextField
              label={t('notifications.notificationName')}
              id="outlined-margin-dense"
              required
              value={model && model.Name || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleNotificationName}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <TextField
              label={t('notifications.redirectUrl')}
              id="outlined-margin-dense"
              dir="ltr"
              required
              value={model && model.RedirectURL || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleRedirectUrlChange}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <Grid container justify="flex-start"
              alignItems="center">
              <Grid item md={isRTL ? 4 : 6} xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ShowRedirectButton}
                      color="primary"
                      name="checkedB"
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                      onChange={handleRedirectVisibillity}
                    />
                  }
                  label={t('notifications.redirectUrlButton')}
                />
              </Grid>
              {ShowRedirectButton && <Grid item md={6} xs={12}>
                <TextField
                  label={t('notifications.redirectUrlButton')}
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
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={3} xs={12} style={{ marginTop: 90 }}>
            {notificationContent()}
          </Grid>
          <Grid item md={3} xs={12}>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText != ''}
            />
          </Grid>
        </Grid>
      </Box>
    );

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
        <Grid item md={6} xs={12}>
          <h2>{t('notifications.toWhomToSend')}</h2>
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
        <Grid item xs={2}></Grid>
        <Grid item md={4} xs={12}>
          <h2>{t('notifications.whenToSend')}</h2>
          <FormControl component="fieldset">
            <RadioGroup aria-label="gender" name="sendType" value={sendType} onChange={handleSendType}>
              <FormControlLabel value="1" control={<Radio color="primary" />} label={t("notifications.immediateSend")} />
              <FormHelperText className={classes.helpText}>{t("notifications.immediateDescription")}</FormHelperText>
              <FormControlLabel value="2" control={<Radio color="primary" />} label={t("notifications.futureSend")} />
            </RadioGroup>
            <Box>
              <DateField
                classes={classes}
                value={sendDate}
                onChange={handleFromDate}
                placeholder={t('notifications.date')}
              />

            </Box>
            <Box style={{ marginTop: 10 }}>
              <DateField
                classes={classes}
                value={sendDate}
                onTimeChange={handleFromDate}
                placeholder={t('notifications.hour')}
                isTimePicker={true}
              />
            </Box>
          </FormControl>
        </Grid>
      </Grid>

    );
  }
  const renderSummary = () => {
    if (summary && totalRecipients) {
      let dialog = {};
      dialog = summaryContent();
      return (
        <Dialog
          showDivider={false}
          classes={classes}
          open={summary}
          onClose={handleSummaryClose}
          onConfirm={insertNotificationForSend}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }
  const openGallery = (isIcon) => (event) => {
    if (event.target.id == "removeIcon" || event.target.id == "removeImage") {
      return;
    }

    setIsIcon(isIcon);
    setGalleryState(true);
  }
  const callbackSelectImage = (image) => {
    setGalleryState(null);
    if (isIcon == true) {
      setModel({ ...model, Icon: image });
    }
    else {
      setModel({ ...model, Image: image });
    }
  }
  const showGalleryModal = () => {
    if (showGallery) {
      let dialog = {};
      dialog = renderGalleryDialog();

      return (
        <Dialog
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={handleDialogClose}
          onConfirm={callbackSelectImage}
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
        <Gallery classes={classes} callbackSelectFile={callbackSelectImage} style={{ minWidth: 400 }} />
      )
    };
  }
  const renderDialog = () => {
    if (validationErrorList != null) {
      let dialog = {};
      dialog = renderValidationError();

      return (
        <Dialog
          showDivider={false}
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
      showDivider: false,
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
  // Image/Icon selection
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
      <span style={{ fontSize: '14px' }}>{t("notifications.ph_chooseImage")}</span>
    </div>
    )
  }
  const chooseIcon = () => {
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
      <span style={{ fontSize: '14px' }}>{t("notifications.ph_chooseIcon")}</span>
    </div>
    )
  }
  // Notification Edior Page
  const notificationContent = () => {
    const toggleHover = () => setHovered(!notificationHover);
    const toggleIconHover = () => setIconHover(!iconHover);
    const removeImage = () => {
      setModel({ ...model, Image: null });
    }
    const removeIcon = () => {
      setModel({ ...model, Icon: null });
    }
    return (
      <div>
        <div className={classes.notification} id={model.ID}>
          <div className={clsx(
            classes.borderSign,
            classes.dashed,
            classes.notificationTop,
            classes.notificationContainer
          )}
            onMouseEnter={toggleHover}
            onMouseLeave={toggleHover}
            onClick={openGallery(false)}
            style={{
              backgroundImage: `url(${model.Image})`
            }}
          >
            {model == null || !model.Image ? chooseImage() : ""
            }
            <button href="#"
              className={clsx(classes.absTopRight, notificationHover && model.Image != null ? '' : classes.hidden)}
              style={{ border: 'none', cursor: 'pointer', textDecoration: 'none', opacity: notificationHover ? 1 : 0 }}
              onClick={removeImage}
              id="removeImage"
            >X</button>
          </div>
          <div className={clsx(classes.footerWrapper, classes.dashed)}>
            <div className={classes.iconWrapper}>
              <div className={clsx(classes.borderSign, classes.dashed, classes.icon)}
                onMouseEnter={toggleIconHover}
                onMouseLeave={toggleIconHover}
                onClick={openGallery(true)}
                style={{
                  backgroundImage: `url(${model.Icon})`
                }}>
                <div className={clsx(classes.flex, classes.flexCenter, classes.flexColumn)}
                  style={{
                    fontSize: '30px', cursor: 'pointer'
                  }}>
                  {model == null || !model.Icon ? chooseIcon() : ""
                  }
                </div>
                <button href="#"
                  className={clsx(classes.absTopRight, iconHover && model.Icon != null ? '' : classes.hidden)}
                  style={{ border: 'none', cursor: 'pointer', textDecoration: 'none', opacity: iconHover ? 1 : 0 }}
                  onClick={removeIcon}
                  id="removeIcon"
                >X</button>
              </div>
            </div>
            <div className={classes.notificationContent}>
              <TextField
                aria-label=""
                required
                placeholder={t("notifications.ph_title")}
                value={model.Title}
                className={clsx(classes.transparent, classes.borderSign, classes.dashed)}
                onChange={handleNotificationTitle}
                style={{ direction: model.Direction == 2 ? 'rtl' : 'ltr', textAlign: model.Direction == 2 ? 'right' : 'left' }}
                onFocus={handleTextFocus}
                id="notificationTitle"
              />
              <TextareaAutosize
                aria-label=""
                required
                placeholder={t("notifications.ph_body")}
                value={model.Body}
                className={clsx(classes.transparent, classes.borderSign, classes.dashed, classes.notificationText)}
                onChange={handleNotificationText}
                style={{ direction: model.Direction == 2 ? 'rtl' : 'ltr', textAlign: model.Direction == 2 ? 'right' : 'left', maxHeight: 45 }}
                onFocus={handleTextFocus}
                id="notificationText"
              />
            </div>
          </div>
          {ShowRedirectButton && model.RedirectButtonText != '' ? redirectButton() : ''}
        </div>
        <Grid style={{ marginRight: '10px', marginLeft: '10px' }}>
          <Box pt={2} style={{ position: 'relative' }}>
            <FormControl component="fieldset">
              <RadioGroup defaultValue="2" aria-label="direction" name="direction" className={classes.directionRadio}>
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
                <button className={classes.emojiIcon} onClick={showEmoji} id="emohiToggle"></button>
                <ClickAwayListener onClickAway={handleClickOutsideEmoji}>
                  <div>
                    {isEmojiShown && <Picker onEmojiClick={onEmojiClick} />}
                  </div>
                </ClickAwayListener>
              </RadioGroup>
            </FormControl>
          </Box>
          <Box pt={1}>
            <b>{t("notifications.titleLimitation")}</b>
            {model && model.Title != '' && model.Title.length || 0}
          </Box>
          <Box>
            <b>{t("notifications.bodyLimitation")}</b>
            {model && model.Body != '' && model.Body.length || 0}
          </Box>
        </Grid>
      </div >
    )
  }
  const summaryContent = () => {
    const handleShowDetails = () => {
      setDetailsVisibility(!showDetails);
    }
    const whenToSend = summary.sendDate ? `${summary.sendDate}` : t("notifications.immediateSend")
    return {
      showDivider: false,
      icon: (
        <MdNotificationsActive style={{ fontSize: 30 }} />
      ),
      title: `${t("notifications.summaryModalTitle")} "${model.Name}"`,
      content: (
        <Grid container className={clsx(classes.root, classes.dialogBox, "dialogBox")} spacing={4}>
          <Grid item md={6} xs={12}>
            <h3 className={classes.blue}>{t("notifications.when")}</h3>
            {whenToSend}
            <h3 className={classes.blue}>{t("notifications.for")}</h3>
            {`${t("notifications.totalRecipientForSending")} ${totalRecipients}`}
            <Grid item xs={12} style={{ paddingTop: 15 }}>
              <a onClick={handleShowDetails} style={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                {!showDetails ? t("notifications.details") : t("notifications.close")}
              </a>
            </Grid>
          </Grid>
          <Grid item md={3} xs={12}>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText != ''}
              showDevices={false}
              showTitle={false}
            />
          </Grid>
          <Grid item xs={12}>
            {showDetails && <div>
              <h3>{t("notifications.buttons.groups")} ({selectedGroups.length})</h3>
              <ul>
                {selectedGroups.map((g, index) => {
                  return (<li key={`group_${g.Id}`}>
                    <div className={classes.flexSpaceBetween}>
                      <Typography className={classes.padding10}>{g.GroupName}</Typography> <Typography>{g.Members} {g.Members != 1 ? t("notifications.recipients") : t("notifications.recipient")}</Typography>
                    </div>
                    <Divider />
                  </li>)
                })}
              </ul>
            </div>}
          </Grid>
        </Grid>
      )
    };
  }
  const handleSummaryClose = () => {
    setSummary(null);
  }
  const redirectButton = () => {
    return <div className={classes.RedirectButtonText}>{model.RedirectButtonText}</div>
  }

  const renderHeader = () => {
    return (
      <>
        <Typography className={classes.managementTitle}>
          <span className={classes.roundedCircle}>
            {activeStep + 1}
          </span>
          {t('notifications.createContent')}
        </Typography>
        <Typography>{t('notifications.createContentText')}</Typography>
      </>
    )
  }

  const renderNotification = () => {
    return (
      <div className={classes.root}>
        <div>
          {activeStep === steps.length ? (
            <div>
              <Typography className={classes.instructions}>All steps completed</Typography>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          ) : (
            <div>
              {getStepContent(activeStep)}
              <div className={clsx(classes.wizardButtonContainer, "wizardButtonContainer")}>
                {activeStep == 0 &&
                  <Box>
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
                    onClick={activeStep == 0 ? saveNotification(false, false) : saveSettings}>
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
                    onClick={activeStep == 0 ? saveNotification(true, false) : saveSettings}>
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
                    onClick={activeStep == 0 ? saveNotification(false, true) : getSummary}>
                    {activeStep == 0 ? t('notifications.saveAndContinue') : t('notifications.summary')}
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </div>
      </div >
    )

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
      classes={classes}>
      {renderToast()}
      {renderHeader()}
      {renderNotification()}
      {renderDialog()}
      {renderSummary()}
      {showGalleryModal()}
    </DefaultScreen>
  );
}

export default NotificationItem;