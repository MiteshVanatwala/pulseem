import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Grid, Box, Typography, AppBar, Tab, Tabs, TextareaAutosize, Paper, Divider } from '@material-ui/core'
import clsx from 'clsx';
import './preview.styles.css';
import PropTypes from 'prop-types';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaChrome, FaFirefox, FaMobile } from 'react-icons/fa';
import desktopClock from '../../../assets/images/desktopClock.jpg';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Preview = (
  { classes, model, ShowRedirectButton, mobileFullsize = false,
    showDevices = true, showTitle = true, isSMS = false, isMMS = false,
    showOSScreen = true, showID = false
  }) => {
  const { t } = useTranslation();
  const { isRTL, windowSize } = useSelector(state => state.core);
  const [previewDeviceSelected, setPreviewDevice] = useState(showDevices === false ? 0 : 0);
  const [notificationExpanded, setNotificationExpanded] = useState(!showDevices);
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  const handleDeviceChange = (event, newValue) => {
    setPreviewDevice(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-force-tab-${index}`,
      'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
  }
  // Image/Icon selection
  const ChooseImage = () => {
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
    </div>
    )
  }


  // Desktop/Mobile Preview
  const desktopPreview = (isChrome) => {
    return (
      <div>
        <div className={classes.osScreen}>
          <div className={classes.notification}>
            {isChrome && <div className={clsx(
              classes.flexJustifyCenter,
              classes.notificationTop,
              classes.notificationContainer
            )}
              style={{
                backgroundImage: `url(${model.Image})`,
                cursor: 'unset'
              }}>
              <div className={clsx(
                classes.flex,
                classes.flexCenter, classes.flexColumn
              )}
                style={{ fontSize: '80px' }}>
                {model == null || !model.Image ? <ChooseImage /> : ""}
              </div>
            </div>
            }
            {!isChrome && <Typography style={{
              textAlign: model.Direction === 1 ? "left" : "right",
              paddingTop: 10,
              paddingRight: 15,
              paddingLeft: 15,
              marginBottom: '-10px',
              wordBreak: 'break-word'
            }}>
              <b>{model.Title !== '' ? model.Title : t('notifications.exampleTitle')}</b>
            </Typography>}
            <div className={clsx(classes.footerWrapper, isChrome ? classes.chromeNotification : null)} style={{ flexDirection: isRTL ? (model.Direction === 1 ? 'row-reverse' : 'row') : (model.Direction === 1 ? 'row' : 'row-reverse') }}>
              <div className={classes.iconWrapper}>
                <div className={clsx(classes.flexJustifyCenter, classes.icon)}
                  style={{
                    backgroundImage: `url(${model.Icon})`,
                    cursor: 'unset',
                    maxHeight: 85
                  }}>
                  {model == null || !model.Icon ? <ChooseIcon /> : ""}
                </div>
              </div>
              <div className={classes.notificationContent}>
                {isChrome && <Typography style={{ textAlign: model.Direction === 1 ? "left" : "right" }}><b>{model.Title !== '' ? model.Title : t('notifications.exampleTitle')}</b></Typography>}
                <TextareaAutosize
                  maxRows={4}
                  style={{
                    direction: model.Direction === 2 ? 'rtl' : 'ltr',
                    textAlign: model.Direction === 2 ? 'right' : 'left',
                    color: isChrome ? '#a5a5a5' : '',
                    marginTop: 0,
                    outline: 'none'
                  }}
                  value={model.Body !== '' ? model.Body : t('notifications.exampleBody')}
                  className={clsx(classes.notificationPreviewBody, classes.flexJustifyCenter, classes.notificationText)}
                />
              </div>
            </div>
            {
              isChrome && ShowRedirectButton &&
              <div className={clsx(classes.RedirectButtonText, isChrome ? classes.chromeRedirectButtonText : '')}>
                <div className={isChrome ? classes.chromeRedirectInnerButton : ''}>{model.RedirectButtonText}</div>
              </div>
            }
          </div>
          {showOSScreen && <img alt="Windows Operatin System Preview" src={desktopClock} style={{ display: 'block', marginTop: 15, width: '100%' }} />}
        </div>
        {
          !isChrome && <label className={clsx(classes.smallNotice, classes.red)}>* {t("notifications.tooltip.firefoxNotSupported")}</label>
        }
      </div>
    )
  }

  const expandNotification = () => {
    setNotificationExpanded(!notificationExpanded);
  }

  const mobileFullPreview = () => {
    const sms = (model.Text && model.Text.split(/\r\n|\n\r|\n|\r/)) || [];
    const mms = (model.NavigateUrl && model.NavigateUrl.split(/\r\n|\n\r|\n|\r/)) || [];

    return (
      <Box className={clsx(mobileFullsize && classes.mobileFullBG, classes.mobileBG, 'mobileBg')}>
        <Box className={classes.bubbleContainer}>
          <Paper elevation={0} className={classes.bubblePaper}>
            {model.Links && model.Links.split(',').map((link, index) => (
              link && <img src={link} className={classes.mmsImage} key={`mms${model.MmsCampaignID}${index}`} alt="" />
            ))}
            {isSMS && sms.map((text, index) => (
              <Typography className={classes.bubbleText} key={`smsTxt${index}`}>{text ? text : <br />}</Typography>
            ))}
            {isMMS && mms.map((url, index) => (
              <Typography className={classes.bubbleText} key={`mmsTxt${index}`}>{url ? url : <br />}</Typography>
            ))}
          </Paper>
        </Box>

      </Box>
    )
  }

  const mobilePreview = () => {
    return (
      <div className={clsx(classes.mobileBG, "mobileBG")}>
        <div className={clsx(classes.mobileNotification, "mobileNotification")}>
          <div style={{ position: 'relative' }}>
            <button className={classes.expandNotification} onClick={expandNotification}>{notificationExpanded ? <FaChevronUp /> : <FaChevronDown />}</button>
          </div>
          <div className={classes.notificationSiteAddress}><Typography>www.pulseem.co.il</Typography></div>
          <div className={clsx(classes.footerWrapper)} style={{ flexDirection: isRTL ? (model.Direction === 1 ? 'row-reverse' : 'row') : (model.Direction === 1 ? 'row' : 'row-reverse') }}>
            {model.Icon && model.Icon !== "" && <div className={classes.iconWrapper}>
              <div className={clsx(classes.borderSign, classes.icon)}
                style={{
                  backgroundImage: `url(${model.Icon})`,
                  cursor: 'unset'
                }}>
              </div>
            </div>
            }
            <div className={classes.notificationContent}>
              <Typography style={{
                textAlign: model.Direction === 1 ? "left" : "right",
                paddingRight: isRTL && (model.Icon === '' || !model.Icon) ? 15 : 0,
                paddingLeft: !isRTL && (model.Icon === '' || !model.Icon) ? 15 : 0
              }}><b>{model.Title}</b></Typography>
              <Typography style={{
                textAlign: model.Direction === 1 ? "left" : "right",
                paddingRight: isRTL && (model.Icon === '' || !model.Icon) ? 15 : 0,
                paddingLeft: !isRTL && (model.Icon === '' || !model.Icon) ? 15 : 0
              }}>{model.Body}</Typography>
            </div>
          </div>

          {notificationExpanded && <div className={clsx(
            classes.borderSign,
            classes.notificationTop,
            classes.notificationContainer,
            "notificationContainer"
          )}
            style={{
              backgroundImage: `url(${model.Image})`,
              cursor: 'unset',
              minHeight: windowSize === 'xs' ? 75 : (model.RedirectButtonText !== '' ? 135 : 185)
            }}>
            <div className={clsx(
              classes.flex,
              classes.flexCenter, classes.flexColumn
            )}
              style={{ fontSize: '80px' }}>
            </div>
          </div>
          }
          {
            notificationExpanded && model.RedirectButtonText !== '' && <Grid container alignItems="center" className={clsx(classes.flex, classes.root, classes.notificationMobileButtons)}>
              <Box>{t("common.settings")}</Box>
              <Divider orientation="vertical" flexItem />
              <Box className={classes.ellipsisText}>{model.RedirectButtonText}</Box>
            </Grid>
          }
        </div>
      </div>
    )
  }

  // Return final template
  // const campaignID = (isSMS && model.SMSCampaignID) || (isMMS && model.MmsCampaignID) || model.ID || '';
  return (
    <>
      <Grid className={mobileFullsize && classes.alignCenter}>
        {showTitle && <Typography className={clsx(classes.colrPrimary, classes.previewTitle, "previewTitle")}>{t("notifications.preview")}</Typography>}
        {showDevices && !mobileFullsize && <AppBar position="static" color="default" className={classes.deviceSelectorPanel}>
          <Tabs
            value={previewDeviceSelected}
            onChange={handleDeviceChange}
            className={clsx(classes.tab, classes.tablistRoot)}
            classes={{ indicator: classes.hideIndicator }}
            variant="fullWidth"
            scrollButtons="off"
            aria-label="scrollable force tabs example"
          >
            <Tab label={<FaChrome style={{ fontSize: '24px' }} />} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}  {...a11yProps(0)} />
            <Tab label={<FaFirefox style={{ fontSize: '24px' }} />} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}  {...a11yProps(1)} />
            <Tab label={<FaMobile style={{ fontSize: '24px' }} />} classes={{ root: classes.btnTab, selected: classes.currentActiveTab }}  {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        }
        {mobileFullsize ? mobileFullPreview() :
          <Box className={classes.mt2}>
            <TabPanel value={previewDeviceSelected} index={0}>
              {desktopPreview(true)}
            </TabPanel >
            <TabPanel value={previewDeviceSelected} index={1}>
              {desktopPreview(false)}
            </TabPanel >
            <TabPanel value={previewDeviceSelected} index={2}>
              {mobilePreview()}
            </TabPanel >
          </Box>
        }
      </Grid>
    </>
  )
}