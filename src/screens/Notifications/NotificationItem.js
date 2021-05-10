import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import {
  Typography, Button, TextField, Grid, TextareaAutosize, Switch, Box, FormControlLabel, FormControl, RadioGroup, Radio, ClickAwayListener,
  Card, CardContent, Dialog
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { Preview } from '../../components/Notifications/Preview/Preview';
import { getNotificationById, save, updateNotification, getApiToken } from '../../redux/reducers/notificationSlice';
import clsx from 'clsx';
import { useHistory } from "react-router-dom";
import { PushService } from './init-push';
import Picker from 'emoji-picker-react';
import { FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import './notification.styles.css';
import { FormatLineSpacing } from '@material-ui/icons';


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
  const { isRTL } = useSelector(state => state.core)

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
    Direction: "2",
    IsRenotify: "",
    SendDate: "",
    IsDeleted: "",
    SentCount: "",
    StatusID: "",
    NotificationGroups: "",
    RedirectButtonText: "",
  });


  const [activeStep, setActiveStep] = React.useState(0);
  const [ShowRedirectButton, setRedirectButtonVisibillity] = React.useState(false);
  const [apiToken, setApiToken] = useState(0);
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [inputFocus, setFocusOnInput] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isEmojiShown, setShowEmoji] = useState(false);
  const [validationErrorList, setValidationError] = useState([]);
  const [dialogType, setDialogType] = useState(null)

  moment.locale(language);

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

  useEffect(() => {
    if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
      getData();
      handleApiToken();
      isEditable = true;
      if (props.match.params.send) {
        setActiveStep(activeStep + 1);
      }
    }
    else {
      isEditable = false;
    }
  }, [dispatch]);

  // Steps handlers

  const handleCancel = () => {
    history.push("/Notification");
  };
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

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
    setModel({ ...model, Direction: event.target.value })
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
    setValidationError(errorList);

    setDialogType({
      type: 'validation',
      data: errorList
    })

    if (errorList.length > 0) {
      return false;
    }
  }

  const renderValidationError = () => {
    return {
      showDivider: false,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE0F8'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Card>
            <CardContent>
              (
                 <>
                <ul>
                  {validationErrorList.map(d => (<li>{d.message}</li>))}
                </ul>
              </>
              )
            </CardContent>
          </Card>
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
    setDialogType(null)
  }

  const renderDialog = () => {
    let dialog = {};

    dialog = renderValidationError();

    return (
      <Dialog
        classes={classes}
        open={dialogType}
        onClose={handleDialogClose}
        {...dialog}>
        {dialog.content}
      </Dialog>
    );
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
      }
      else {
        dispatch(save(model)).then((response) => {
          setModel({ ...model, ID: response.payload });
          if (isContinue) {
            redirectAfterSave(response.payload);
          }
        });
      }
      if (isExit) {
        history.push("/Notification");
      }
    }
    else {
      renderDialog();
    }
  }

  const redirectAfterSave = (notificationId) => {
    if (notificationId > 0) {
      history.push(`/NotificationItem/${notificationId}/send`);
    }
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

  // HTML

  const notificationPage = () => {
    return (
      <Box>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
          spacing={4}
          className={classes.dialogButtonsContainer}>
          <Grid item xs={2}>
            <TextField
              label={t('notifications.notificationName')}
              id="outlined-margin-dense"
              value={model && model.Name || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleNotificationName}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label={t('notifications.redirectUrl')}
              id="outlined-margin-dense"
              value={model && model.RedirectURL || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleRedirectUrlChange}
            />
          </Grid>
          <Grid item>
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
          {ShowRedirectButton && <Grid item xs={2}>
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
          </Grid>
          }

        </Grid>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className={classes.dialogButtonsContainer}>
          <Grid item xs={3} style={{ marginTop: 90 }}>
            {notificationContent()}
          </Grid>
          <Grid item xs={3}>
            <Preview classes={classes}
              model={model}
              ShowRedirectButton={ShowRedirectButton && model.RedirectButtonText != ''}
            />
          </Grid>
        </Grid>
      </Box>
    );

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

  const notificationContent = () => {
    return (
      <div>
        <div className={classes.notification} id={model.ID}>
          <div className={clsx(
            classes.borderSign,
            classes.dashed,
            classes.notificationTop,
            classes.notificationContainer
          )}
            style={{
              backgroundImage: `url(${model.Image})`
            }}>
            {model == null || !model.Image ? chooseImage() : ""
            }
            <a href="#" className={clsx(classes.absTopRight, classes.hidden)} style={{ cursor: 'pointer' }}>X</a>
          </div>
          <div className={clsx(classes.footerWrapper, classes.dashed)}>
            <div className={classes.iconWrapper}>
              <div className={clsx(classes.borderSign, classes.dashed, classes.icon)}
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
                <a href="#" className={clsx(classes.absTopRight, classes.hidden)}>X</a>
              </div>
            </div>
            <div className={classes.notificationContent}>
              <TextField
                aria-label=""
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
              <RadioGroup defaultValue="2" aria-label="gender" name="customized-radios" className={classes.directionRadio}>
                <FormControlLabel value="2"
                  control={<Radio
                    onChange={handleDirection}
                    checked
                    checkedIcon={<FaAlignRight
                      style={{ fontWeight: 'bold', fontSize: 24, color: 'black' }}
                    />}
                    icon={<FaAlignRight style={{ fontSize: 24 }}
                    />}
                  />}
                />
                <FormControlLabel value="1"
                  control={<Radio
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


  const redirectButton = () => {
    return <div className={classes.RedirectButtonText}>{model.RedirectButtonText}</div>
  }

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return notificationPage();
      case 1:
        return 'SendSettings';
    }
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
              <div className={classes.wizardButtonContainer}>
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
                    onClick={saveNotification(false, false)}>
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
                    onClick={saveNotification(true, false)}>
                    {t('notifications.saveAndExit')}
                  </Button>
                  <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                      classes.actionButton,
                      classes.actionButtonLightGreen,
                      classes.backButton
                    )}
                    color="primary"
                    style={{ margin: '8px' }}
                    onClick={saveNotification(false, true)}>
                    {t('notifications.saveAndContinue')}
                  </Button>
                </Box>


              </div>
            </div>
          )}
        </div>
      </div >
    )

  }

  return (
    <DefaultScreen
      currentPage='notifications'
      classes={classes}>
      {renderHeader()}
      {renderNotification()}
    </DefaultScreen>
  );
}

export default NotificationItem;