import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen'
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
  Typography, Button, TextField, Grid, Switch, Box, FormControlLabel, FormControl, RadioGroup, Radio, ClickAwayListener, Input
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Preview } from '../../../components/Notifications/Preview/Preview';
import {
  getNotificationById, save, updateNotification, getNotificationPublicKey
}
  from '../../../redux/reducers/notificationSlice';
import clsx from 'clsx';
import { PushService } from './init-push';
import Picker from 'emoji-picker-react';
import { FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import './notification.styles.css';
import Gallery from '../../../components/Gallery/Gallery.component';
import { MdArrowBackIos, MdArrowForwardIos, MdErrorOutline, MdNotificationsActive } from 'react-icons/md';
import { IoMdImages } from 'react-icons/io'
import moment from 'moment'
import 'moment/locale/he'
import Toast from '../../../components/Toast/Toast.component';
import Tooltip from '@material-ui/core/Tooltip';
import { IsValidURL } from "../../../helpers/Utils/Validations";
import { useParams, useLocation } from 'react-router-dom';
import useRedirect from '../../../helpers/Routes/Redirect';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import { PulseemFolderType } from '../../../model/PulseemFields/Fields';
import { sitePrefix } from '../../../config';
import { Title } from '../../../components/managment/Title';
import { Stack } from '@mui/material';

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

// const DashedInput = withStyles({
//   root: {
//     border: 'none',
//     borderRadius: 0,
//     "& .MuiOutlinedInput-multiline": {
//       padding: 0,
//       minHeight: 55,
//       paddingTop: 0,
//       '& textarea + fieldset': {
//         border: '1px dashed #64a1bd',
//         borderRadius: 0,
//         borderWidth: 1
//       },
//       '& textarea:invalid:focus + fieldset': {
//         borderStyle: 'dashed',
//         borderWidth: 1,
//         borderColor: 'red'
//       },
//       '& textarea:valid:focus + fieldset': {
//         borderStyle: 'dashed',
//         borderWidth: 1
//       },
//       '& textarea + fieldset:hover': {
//         color: 'rgba(0, 0, 0, 0.87)',
//         border: '1px dashed #000',
//       },
//       '& textarea.error': {
//         border: '1px dashed red'
//       }
//     },
//     '& input': {
//       height: 0,
//     },
//     '& input + fieldset': {
//       borderStyle: 'dashed',
//       borderColor: '#64a1bd',
//       borderRadius: 0
//     },
//     '& input:invalid:focus + fieldset': {
//       borderColor: 'red',
//       borderWidth: 1
//     },
//     '& input:valid:focus + fieldset': {
//       borderStyle: 'dashed',
//       borderWidth: 1,
//       borderColor: '#64a1bd'
//     },
//     '& input:hover + fieldset': {
//       color: 'rgba(0, 0, 0, 0.87)',
//       border: '1px dashed rgba(0, 0, 0, 0.87)',
//     },
//     '& input.error': {
//       border: '1px dashed red'
//     }
//   },

// })(TextField);

const NotificationEdit = ({ classes }) => {
  const Redirect = useRedirect();
  const { id } = useParams();
  const location = useLocation();

  /* #region  Component settings constatns */
  const dispatch = useDispatch();
  const { language, isRTL, CoreToastMessages } = useSelector(state => state.core)
  const { t } = useTranslation();
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

  const [ShowRedirectButton, setRedirectButtonVisibillity] = useState(false);
  const [notificationPublicKey, setPublicKey] = useState(0);
  const [inputFocus, setFocusOnInput] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isEmojiShown, setShowEmoji] = useState(false);
  const [validationErrorList, setValidationError] = useState(null);
  // Send Type settings
  const [notificationHover, setHovered] = useState(false);
  const [showGallery, setGalleryState] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [isIcon, setIsIcon] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isGalleryConfirmed, setIsFileSelected] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: t('notifications.saved'), showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('notifications.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('notifications.error'), showAnimtionCheck: true },
  }

  useEffect(() => {
    const body = document.querySelector('#root');
    body.scrollIntoView({}, 100);

    const getData = async () => {
      const notificationPayload = await dispatch(getNotificationById(id));
      setModel(notificationPayload.payload);
      setSourceModel(notificationPayload.payload);
      setPublicKey(notificationPayload.payload.PublicKey);
      if (notificationPayload.payload.RedirectButtonText !== '') {
        setRedirectButtonVisibillity(true);
      }
    }
    const handlePublicKey = async () => {
      const t = await dispatch(getNotificationPublicKey());
      if (t && t.payload) {
        setPublicKey(t.payload.PublicKey);
      }
      else {
        setPublicKey('');
      }
    }

    handlePublicKey();
    if (id != null && parseInt(id) > 0) {
      getData();
    }
  }, [dispatch, id]);

  // useEffect(() => {
  //   if (!ShowRedirectButton) {
  //     setModel({ ...model, RedirectURL: '', RedirectButtonText: '' });
  //   }
  // }, [ShowRedirectButton, model])

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
      saveNotification(true, false)
    }
    else {
      Redirect({ url: `${sitePrefix}Notifications` });
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
  const redirectAfterSave = (notificationId) => {
    if (notificationId > 0) {
      Redirect({ url: `${sitePrefix}Notification/send/${notificationId}` });
    }
  }
  const handleNotificationName = (event) => {
    setModel({ ...model, Name: event.target.value });
  }
  const handleRedirectUrlChange = (event) => {
    setModel({ ...model, RedirectURL: event.target.value });
  }
  const handleRedirectButtonTextChange = (event) => {
    const textLength = event.target.value.length;
    if (textLength <= 20) {
      setModel({ ...model, RedirectButtonText: event.target.value });
    }
    return;
  }
  const handleRedirectVisibillity = (event) => {
    setRedirectButtonVisibillity(event.target.checked);
    if (event.target.checked === false) {
      setModel({ ...model, RedirectURL: '' });
      setModel({ ...model, RedirectButtonText: '' });
    }
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
  const showEmoji = () => {
    setShowEmoji(!isEmojiShown);
  }
  const handleClickOutsideEmoji = (event) => {
    if (event.target.id !== 'emohiToggle')
      setShowEmoji(false);
  }
  const onEmojiClick = (event, emojiObject) => {
    const el = document.querySelector(`#${inputFocus}`);
    if (el) {
      let finalStr = '';
      const textBefore = el.value.substring(0, cursorPosition);
      const textAfter = el.value.substring(cursorPosition, el.value.length);
      const valToReplace = el.value.substring(el.selectionStart, el.selectionEnd);

      if (valToReplace !== '') {
        finalStr = el.value.replace(valToReplace, emojiObject.emoji);
      }
      else {
        finalStr = `${textBefore}${emojiObject.emoji}${textAfter}`;
      }

      if (inputFocus === 'notificationTitle') {
        if (finalStr.length <= 50) {
          setModel({ ...model, Title: finalStr });
        }
      }
      else if (inputFocus === 'notificationText') {
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
      if (selection === 0) {
        setCursorPosition(el.selectionStart);
      }
    }, 100);

  }

  const updateUrlValue = (e) => {
    const val = e.target.value;
    if (val.trim().replace(" ", "") !== "" && val.indexOf("http") === -1) {
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
    if (ShowRedirectButton === true) {
      if (model.RedirectURL.length <= 0) {
        errorList.push({ message: t('notifications.validation.redirectUrl') });
        document.querySelector("#notificationRedirectUrl").classList.add("error");
      }
      else {
        if (!IsValidURL(model.RedirectURL)) {
          errorList.push({ message: t('notifications.validation.redirectUrlNotValid') });
          document.querySelector("#notificationRedirectUrl").classList.add("error");
        }
      }
      if (model.RedirectButtonText.length <= 0) {
        errorList.push({ message: t('notifications.validation.redirectButtonText') });
        document.querySelector("#notificationButton").classList.add("error");
      }
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
  const handleTestSend = () => {
    if (isValidNotification()) {
      PushService(notificationPublicKey).then((permissions) => {
        try {
          if (permissions.subscription && permissions.state === 'granted') {
            const options = {
              id: model.ID,
              dir: model.Direction === '2' ? 'rtl' : 'ltr',
              body: model.Body,
              icon: model.Icon,
              image: model.Image,
              title: model.Title,
              renotify: 'true',
              tag: 'pulseem_' + model.ID,
              redirect: model.RedirectURL
            };

            if (model.RedirectURL !== '' && model.RedirectButtonText !== '' && ShowRedirectButton) {
              options.actions = [];
              options.actions.push({ action: model.RedirectURL, title: model.RedirectButtonText });
            }

            permissions.subscription.showNotification(model.Title, options);
          }
        }
        catch (e) {
          dispatch(sendToTeamChannel({
            MethodName: 'handleTestSend',
            ComponentName: 'NotificationEdit.js',
            Text: e
          }));
          console.log(e);
        }
      });
    }
  }
  // Notification Edtior
  const notificationEdit = () => {
    return (
      <Box>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={3} xs={12} className='textBoxWrapper'>
            <Typography>
              <>
                * {t('notifications.notificationName')}
              </>
            </Typography>
            <TextField
              id="notificationName"
              required
              value={(model && model.Name) || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleNotificationName}
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <BootstrapTooltip title={t("notifications.tooltip.showRedirectButton")} placement="top">
              <FormControlLabel
                style={{ marginTop: 25, }}
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
            <Grid item md={3} xs={12} className='textBoxWrapper'>
              <Typography>* {t('notifications.redirectUrl')}</Typography>
              <TextField
                placeholder={t('notifications.redirectUrl')}
                id="notificationRedirectUrl"
                style={{ textAlign: 'left' }}
                required
                value={(model && model.RedirectURL) || ''}
                className={classes.textField}
                margin="dense"
                variant="outlined"
                onChange={handleRedirectUrlChange}
                onBlur={event => updateUrlValue(event)}
              />
            </Grid>
          }
          {ShowRedirectButton &&
            <Grid item md={3} xs={12} className='textBoxWrapper'>
              <Typography>* {t('notifications.redirectUrlButton')}</Typography>
              <TextField
                placeholder={t('notifications.redirectUrlButton')}
                id="notificationButton"
                value={(model && model.RedirectButtonText) || ''}
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
          justifyContent="flex-start"
          alignItems="flex-start"
          className={clsx(classes.dialogButtonsContainer, classes.flexStart)}>
          <Grid item md={4} xs={12}>
            {notificationContent()}
          </Grid>
          <Grid item md={1} xs={12}>&nbsp;</Grid>
          <Grid item md={4} xs={12} className={classes.previewStep}>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText && model.RedirectButtonText !== ''}
            />
          </Grid>
        </Grid>
      </Box>
    );

  }
  const notificationContent = () => {
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
          <div
            className={clsx(
              classes.flexJustifyCenter,
              classes.dashed,
              classes.notificationTop,
              classes.notificationContainer
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={openGallery(false)}
            style={{
              marginBottom: 5,
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
          <div className={clsx(classes.footerWrapper, classes.dashed)} style={{ flexDirection: isRTL ? (model.Direction === 1 ? 'row-reverse' : 'row') : (model.Direction === 1 ? 'row' : 'row-reverse') }}>
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
              <Input
                aria-label=""
                required
                placeholder={t("notifications.ph_title")}
                value={model.Title}
                className={clsx(classes.transparent, classes.dashed)}
                onChange={handleNotificationTitle}
                style={{ direction: model.Direction === 2 ? 'rtl' : 'ltr', textAlign: model.Direction === 2 ? 'right' : 'left' }}
                onFocus={handleTextFocus}
                variant="outlined"
                id="notificationTitle"
              />
              <Input
                inputProps={{ className: classes.textarea }}
                multiline
                rows={2}
                aria-label=""
                required
                placeholder={t("notifications.ph_body")}
                value={model.Body}
                className={clsx(classes.transparent, classes.dashed, classes.notificationText)}
                onChange={handleNotificationText}
                style={{ direction: model.Direction === 2 ? 'rtl' : 'ltr', textAlign: model.Direction === 2 ? 'right' : 'left', maxHeight: 55 }}
                onFocus={handleTextFocus}
                variant="outlined"
                id="notificationText"
              />
            </div>
          </div>
          {ShowRedirectButton && model.RedirectButtonText !== '' ? redirectButton(true) : ''}
        </div>
        <Box pt={1} mt={1}>
          <b>{t("notifications.titleLimitation")}</b>
          {(model && model.Title && model.Title !== '' && model.Title.length) || 0}
        </Box>
        <Box>
          <b>{t("notifications.bodyLimitation")}</b>
          {(model && model.Body && model.Body !== '' && model.Body.length) || 0}
        </Box>
      </div >
    )
  }
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
  const openGallery = (isIcon) => (event) => {
    if (event.target.id === "removeIcon" || event.target.id === "removeImage") {
      return;
    }

    setIsIcon(isIcon);
    setGalleryState(true);
    setIsFileSelected(false);
  }
  const handleSelectedImage = (image) => {
    setGalleryState(false);
    if (isIcon === true) {
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
        <BaseDialog
          maxHeight="calc(70vh)"
          disableBackdropClick={true}
          style={{ minHeight: 400 }}
          showDivider={false}
          classes={classes}
          open={showGallery}
          onClose={handleDialogClose}
          onCancel={handleDialogClose}
          onConfirm={handleGalleryConfirm}
          {...dialog}>
          {dialog.content}
        </BaseDialog>
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
          style={{ minWidth: 400 }}
          folderType={PulseemFolderType.CLIENT_IMAGES} />
      )
    };
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
          onCancel={handleDialogClose}
          onConfirm={handleDialogClose}
          {...dialog}>
          {dialog.content}
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
            classes.confirmButton,
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}>
          {t('common.confirm')}
        </Button>
      )
    };
  }
  const handleDialogClose = () => {
    setValidationError(null);
    setGalleryState(null);
  }
  const redirectButton = (showBorder) => {
    return <div className={clsx(classes.RedirectButtonText, showBorder ? classes.dashed : null)}>{model.RedirectButtonText}</div>
  }
  const renderHeader = () => {
    return (
      <Box className={clsx('stepHead', classes.notificationTitle, classes.noPadding)}>
        <Stack className={'stepNum'} justifyContent={'center'} alignItems={'center'}>
          <span >1</span>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} ml={1} >
          <span className={'stepTitle'}>
            {t('notifications.createContent')}
          </span>
          <span className={'stepDesc'}>({t('notifications.createContentText')})</span>
        </Stack>
      </Box>
    )
  }
  const WizardButtons = () => {
    return (<div className={clsx(classes.wizardButtonContainer, "wizardButtonContainer")} style={{ paddingBottom: 40 }}>
      <Box className={classes.textCenter}>
        <BootstrapTooltip title={t("notifications.tooltip.testSend")} placement={isRTL ? "left" : "right"}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.middle
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            color="primary"
            onClick={handleTestSend}>
            {t('notifications.testSend')}
          </Button>
        </BootstrapTooltip>
      </Box>
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
          onClick={event => saveNotification(false, false)}>
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
          onClick={event => saveNotification(true, false)}>
          {t('notifications.saveAndExit')}
        </Button>
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.middle
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ margin: '8px' }}
          onClick={event => saveNotification(false, true)}>
          {t('notifications.saveAndContinue')}
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

  const saveNotification = async (isExit, isContinue) => {
    setSourceModel(model);

    const modelToSave = { ...model };

    if (isValidNotification()) {
      if (modelToSave && modelToSave.ID > 0) {
        await dispatch(updateNotification(modelToSave));
        setToastMessage(toastMessages.SUCCESS);
        if (isContinue) {
          redirectAfterSave(modelToSave.ID);
        }
      }
      else {
        dispatch(save(modelToSave)).then((response) => {
          if (location.pathname.toLowerCase().indexOf('create') > -1) {
            if (isExit) {
              Redirect({ url: `${sitePrefix}Notifications` })
            }
            else {
              setToastMessage(toastMessages.SUCCESS);
              setTimeout(() => {
                if (isContinue) {
                  redirectAfterSave(response.payload);
                }
                else {
                  Redirect({ url: `${sitePrefix}Notification/edit/${response.payload}` });
                }
                setToastMessage(null);
              }, 1500);
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
        Redirect({ url: `${sitePrefix}Notifications` });
      }
    }
  }

  return (
    <DefaultScreen
      currentPage='notifications'
      subPage='create'
      customPadding={true}
      classes={classes}
      containerClass={clsx(classes.editorCont)}>
      <div className={'head'} >
        <Title Text={t('notifications.createNewPush')} classes={classes} />
      </div>
      <div className={'containerBody'}>
        {renderHeader()}
        {renderToast()}
        <div className='bodyBlock'>
          {notificationEdit()}
          {renderDialog()}
          {showGalleryModal()}
          {renderConfirmCancel()}
          <WizardButtons />
        </div>
      </div>
    </DefaultScreen>
  );

}

export default NotificationEdit;