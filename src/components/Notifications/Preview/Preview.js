import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Box, Typography, AppBar, Tab, Tabs } from '@material-ui/core'
import clsx from 'clsx';
import './preview.styles.css';
import PropTypes from 'prop-types';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaChrome, FaFirefox, FaMobile } from 'react-icons/fa';

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



export const Preview = ({ classes, model, ShowRedirectButton }) => {
    const { t } = useTranslation();
    const [previewDeviceSelected, setPreviewDevice] = useState(0);
    const [notificationExpanded, setNotificationExpanded] = useState(false);
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

    // Desktop/Mobile Preview
    const desktopPreview = (isChrome) => {
        return (
            <div className={classes.notification}>
                { isChrome && <div className={clsx(
                    classes.borderSign,
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
                    </div>
                </div>
                }
                {!isChrome && <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right", paddingTop: 10, paddingRight: 15, paddingLeft: 5, marginBottom: '-10px' }}><b>{model.Title}</b></Typography>}
                <div className={clsx(classes.footerWrapper, isChrome ? classes.chromeNotification : '')}>
                    <div className={classes.iconWrapper}>
                        <div className={clsx(classes.borderSign, classes.icon)}
                            style={{
                                backgroundImage: `url(${model.Icon})`,
                                cursor: 'unset'
                            }}>
                        </div>
                    </div>
                    <div className={classes.notificationContent}>
                        {isChrome && <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}><b>{model.Title}</b></Typography>}
                        <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}>{model.Body}</Typography>
                    </div>
                </div>
                {
                    isChrome && ShowRedirectButton &&
                    <div className={clsx(classes.RedirectButtonText, isChrome ? classes.chromeRedirectButtonText : '')}>
                        <div className={isChrome ? classes.chromeRedirectInnerButton : ''}>{model.RedirectButtonText}</div>
                    </div>
                }
            </div>
        )
    }

    const expandNotification = () => {
        setNotificationExpanded(!notificationExpanded);
    }

    const mobilePreview = () => {
        return (
            <div className={classes.mobileBG}>
                <div className={classes.mobileNotification}>
                    <div style={{ position: 'relative' }}>
                        <button className={classes.expandNotification} onClick={expandNotification}>{notificationExpanded ? <FaChevronUp /> : <FaChevronDown />}</button>
                    </div>
                    <div className={classes.notificationSiteAddress}><Typography>www.pulseem.co.il</Typography></div>
                    <div className={clsx(classes.footerWrapper)}>
                        {model.Icon && <div className={classes.iconWrapper}>
                            <div className={clsx(classes.borderSign, classes.icon)}
                                style={{
                                    backgroundImage: `url(${model.Icon})`,
                                    cursor: 'unset'
                                }}>
                            </div>
                        </div>
                        }
                        <div className={classes.notificationContent}>
                            <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}><b>{model.Title}</b></Typography>
                            <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}>{model.Body}</Typography>
                        </div>
                    </div>

                    {notificationExpanded && <div className={clsx(
                        classes.borderSign,
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
                        </div>
                    </div>
                    }
                </div>
            </div>
        )
    }

    // Return final template

    return (
        <Grid>
            <h3 className={classes.previewTitle}>{t("notifications.preview")}</h3>
            <AppBar position="static" color="default" className={classes.deviceSelectorPanel}>
                <Tabs
                    value={previewDeviceSelected}
                    onChange={handleDeviceChange}
                    variant="fullWidth"
                    scrollButtons="off"
                    aria-label="scrollable force tabs example"
                >
                    <Tab className={classes.deviceSelector} icon={<FaChrome style={{ fontSize: '24px' }} />} {...a11yProps(0)} />
                    <Tab className={classes.deviceSelector} icon={<FaFirefox style={{ fontSize: '24px' }} />} {...a11yProps(1)} />
                    <Tab className={classes.deviceSelector} icon={<FaMobile style={{ fontSize: '24px' }} />} {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <TabPanel value={previewDeviceSelected} index={0}>
                {desktopPreview(true)}
            </TabPanel >
            <TabPanel value={previewDeviceSelected} index={1}>
                {desktopPreview(false)}
            </TabPanel >
            <TabPanel value={previewDeviceSelected} index={2}>
                {mobilePreview()}
            </TabPanel >

        </Grid>

    )
}