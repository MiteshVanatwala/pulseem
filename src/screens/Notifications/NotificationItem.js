import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import {
  Typography, Divider,
  Button, TextField, Grid, TextareaAutosize, Switch, Box
} from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { Preview } from '../../components/Notifications/Preview/Preview';
import { getNotificationById } from '../../redux/reducers/notificationSlice';
import clsx from 'clsx';
import { useHistory } from "react-router-dom";

function getSteps() {
  return ['Create content', 'Send Settings'];
}



const NotificationItem = ({ props, classes }) => {
  const dispatch = useDispatch();
  const { language } = useSelector(state => state.core)
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const history = useHistory();
  let isEditable = false;
  const { isRTL } = useSelector(state => state.core)
  const [model, setModel] = useState({
    ID: 0,
    Name: "",
    Title: "",
    Body: "",
    Icon: "",
    Image: "",
    RedirectURL: "",
    Tag: "",
    Direction: "",
    IsRenotify: "",
    SendDate: "",
    IsDeleted: "",
    SentCount: "",
    StatusID: "",
    NotificationGroups: "",
    RedirectButtonText: "",
  });

  const [ShowRedirectButton, setRedirectButtonVisibillity] = useState(false);

  moment.locale(language);

  const getData = async () => {
    const notificationPayload = await dispatch(getNotificationById(props.match.params.id));
    setModel(notificationPayload.payload);
    if (model.RedirectButtonText != '') {
      setRedirectButtonVisibillity(true);
    }
  }

  useEffect(() => {
    if (props.match.params.id != null && parseInt(props.match.params.id) > 0) {
      getData();
      isEditable = true;
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
    setModel({ ...model, Title: event.target.value });
  }
  const handleNotificationText = (event) => {
    setModel({ ...model, Body: event.target.value });
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
          <Grid item xs={2}>
            <TextField
              label={t('notifications.redirectUrlButton')}
              id="outlined-margin-dense"
              value={model && model.RedirectButtonText || ''}
              className={classes.textField}
              margin="dense"
              variant="outlined"
              onChange={handleRedirectButtonTextChange}
            />
          </Grid>
          <Grid item xs={2}>
            <Switch
              checked={ShowRedirectButton}
              color="primary"
              name="checkedB"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              onChange={handleRedirectVisibillity}
            />
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          className={classes.dialogButtonsContainer}>
          <Grid item xs={4}>
            {notificationContent()}
          </Grid>
          <Grid item xs={4}>
            <Preview classes={classes} model={model} ShowRedirectButton={ShowRedirectButton} />
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
    return (<div><svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false" role="img" aria-label="image" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
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
            />
            <TextareaAutosize
              rowsMax={4}
              aria-label=""
              placeholder={t("notifications.ph_body")}
              value={model.Body}
              className={clsx(classes.transparent, classes.borderSign, classes.dashed, classes.notificationText)}
              onChange={handleNotificationText}
            />
          </div>
        </div>
        {ShowRedirectButton ? redirectButton() : ''}
      </div>
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
                      onClick={handleNext}>
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
                    style={{margin: '8px'}}
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
                    style={{margin: '8px'}}
                    onClick={handleNext}>
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
                    style={{margin: '8px'}}
                    onClick={handleNext}>
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
                    style={{margin: '8px'}}
                    onClick={handleNext}>
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