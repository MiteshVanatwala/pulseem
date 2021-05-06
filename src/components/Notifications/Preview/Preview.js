import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TextareaAutosize, TextField, Grid, Box, AppBar, Tab, Tabs, Typography
} from '@material-ui/core'
import clsx from 'clsx';
import './preview.styles.css';
import PropTypes from 'prop-types';
import { FaChrome, FaFirefox, FaMobile, FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
                <Box p={3}>
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
                <div className={clsx(classes.footerWrapper)}>
                    <div className={classes.iconWrapper}>
                        <div className={clsx(classes.borderSign, classes.icon)}
                            style={{
                                backgroundImage: `url(${model.Icon})`,
                                cursor: 'unset'
                            }}>
                        </div>
                    </div>
                    <div className={classes.notificationContent}>
                        <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}>{model.Title}</Typography>
                        <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}>{model.Body}</Typography>
                    </div>
                </div>
                {
                    ShowRedirectButton &&
                    <div className={classes.RedirectButtonText}>{model.RedirectButtonText}</div>
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
                            <Typography style={{ textAlign: model.Direction == 1 ? "left" : "right" }}>{model.Title}</Typography>
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
            <Grid item xs={6} style={{ paddingRight: '25px', paddingLeft: '25px' }}>
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
            </Grid>
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