import clsx from 'clsx';
import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
import { useTranslation } from 'react-i18next';
import Title from '../../components/Wizard/Title'
import {
    Typography, Button, TextField, Grid, Box, FormControlLabel, FormControl, Select, MenuItem, Tab, Checkbox
} from '@material-ui/core'
import EventToGroups from './EventToGroups'
import { eventsOptions, domainProtocol } from '../../helpers/PulseemArrays'
import { getGroupsBySubAccountId } from "../../redux/reducers/smsSlice";
import { useDispatch, useSelector } from 'react-redux'
import { get, post, getScript, setDomain } from '../../redux/reducers/siteTrackingSlice';
import { EventRequestModel, SiteTrackingModel } from '../../model/SiteTracking/SiteTrackingModel';
import { MdErrorOutline } from 'react-icons/md';
import { Dialog } from '../../components/managment/index';
import Toast from '../../components/Toast/Toast.component';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getCookie, setCookie } from '../../helpers/cookies';
import { FaExclamationCircle } from 'react-icons/fa'
import { AiOutlineExclamationCircle } from "react-icons/ai";
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
//import { eventsControllerCreate, CreateEventDefinitionInputDto } from '../../services/test';


const SiteTrackingEditor = ({ classes }) => {
    const [showLoader, setShowLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [model, setModel] = useState(new SiteTrackingModel());
    const { ToastMessages, siteScript } = useSelector((state) => state.siteTracking);
    const [validationError, setValidationError] = useState([]);
    const [protocol, setDomainProtocol] = useState('https://');
    const [dialogType, setDialogType] = useState({ type: null });
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isRTL, windowSize } = useSelector(state => state.core);
    const [copyStatus, setCopyStatus] = useState(false);
    const refScriptCode = useRef(null);
    const [scriptDialog, handleScriptDialogCheck] = useState(false);
    const [tabValue, setTabValue] = useState('PAGE_VIEW');

    useEffect(() => {
        getData();
    }, [dispatch]);

    const getData = async () => {
        await dispatch(getScript());
        await dispatch(getGroupsBySubAccountId());
        const response = await dispatch(get(EventRequestModel.PageView));
        if (!response.error) {
            setModel(response.payload);
        }
        else {
            setModel(new SiteTrackingModel());
        }
        setShowLoader(false);
        const hideScriptIntro = getCookie("hideScriptSiteEventDialog");
        if (hideScriptIntro !== 'true') {
            setDialogType({ type: 'scriptImplementation' });
        }
    }


    const handleDomainProtocol = (event) => {
        setDomainProtocol(event.target.value);
    }

    const handleModelChange = (name, value) => {
        setModel(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const deepUpdate = (keys, value) => {
        let e = { ...model };
        if (e[keys[0]] && e[keys[0]][keys[1]]) {
            e[keys[0]][keys[1]] = value;
        }
        else {
            e[keys] = value;
        }
        setModel(e);
    }

    const validateForm = () => {
        let isValid = true;
        const isValidDomain = () => {
            const domainRegex = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g
            return model.domain.match(domainRegex);
        }
        if (model.domain === '') {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.domainRequired')])
            isValid = false;
        }
        if (model.domain !== '' && !isValidDomain()) {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.domainNotValid')])
            isValid = false;
        }
        if (model.metadata.groupIds.length === 0) {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.groupsRequired')])
            isValid = false;
        }
        if (model.metadata.operatorValue === '') {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.pageUrlRequired')])
            isValid = false;
        }
        return isValid;
    }

    const onSave = async () => {
        setShowLoader(true);
        if (validateForm()) {
            const request = { ...model };
            request.domain = protocol + request.domain;
            const setDomainResponse = await dispatch(setDomain({ DomainAddress: request.domain }));
            if (setDomainResponse.payload.Result === 1) {
                const response = await dispatch(post(request));
                onSaveReponse(response.payload);
            }
            else {
                onPulseemSaveReponse(setDomainResponse.payload);
            }
        }
        else {
            setDialogType({ type: "validationError" });
        }
        setShowLoader(false);
    }
    const onPulseemSaveReponse = (response) => {
        switch (response.Result) {
            default:
            case -1: {
                setDialogType({ type: 'dynamicMessage', message: response.Message || t('siteTracking.serverResponse.serverNotAble') })
                break;
            }
            case 0: {
                setDialogType({ type: 'domainAlreadyExist' });
                break;
            }
        }
    }
    const onSaveReponse = (response) => {
        switch (response.status) {
            case 200:
            case 201: {
                setToastMessage(ToastMessages.SUCCESS);
                break;
            }
            case 401: {
                setDialogType({ type: "notAutorized" });
                break;
            }
            case 422: {
                setDialogType({ type: 'missingMandatoryAction' })
                break;
            }
            case 409: {
                setDialogType({ type: 'domainAlreadyExist' })
                break;
            }
            case 400:
            case 500: {
                setDialogType({ type: 'serverNotAble' })
                break;
            }
            default: {
                break;
            }
        }
    }

    //#region Dialogs
    const renderDialog = () => {
        const { type, message } = dialogType || {}
        const dialogContent = {
            notAutorized: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.notAuthorized')),
            missingMandatoryAction: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.missingMandatoryAction')),
            serverNotAble: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.serverNotAble')),
            domainAlreadyExist: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.domainAlreadyExist')),
            validationError: validationErrorDialog(),
            scriptImplementation: siteScript ? scriptImplementationDialog() : scriptErrorImplementationDialog(),
            dynamicMessage: renderDynamicDataDialog(t('common.ErrorTitle'), message)

        }

        const currentDialog = dialogContent[type] || {}

        if (type) {
            return (
                dialogType && <Dialog
                    classes={classes}
                    open={dialogType}
                    onClose={() => { setDialogType(null) }}
                    {...currentDialog}>
                    {currentDialog.content}
                </Dialog>
            )
        }
        return <></>
    }

    const renderDynamicDataDialog = (title, message) => {
        return {
            showDivider: true,
            icon: (
                <MdErrorOutline style={{ fontSize: 30 }} />
            ),
            title: title,
            content: (
                <Box className={clsx(classes.dialogBox, classes.red)}>
                    {message}
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='large'
                    onClick={() => setDialogType(null)}
                    className={clsx(
                        classes.confirmButton,
                        classes.dialogConfirmButton,
                    )}
                    style={{ margin: '0 auto' }}>
                    {t('common.confirm')}
                </Button>
            )
        };
    }

    const validationErrorDialog = () => {
        return {
            showDivider: true,
            icon: (
                <MdErrorOutline style={{ fontSize: 30 }} />
            ),
            title: t("notifications.validationError"),
            content: (
                <Box className={classes.dialogBox}>
                    <ul>
                        {validationError.map((d, index) => (<li className={classes.red} key={{ index }}>{d}</li>))}
                    </ul>
                </Box>
            ),
            renderButtons: () => (
                <Button
                    variant='contained'
                    size='large'
                    onClick={() => { setDialogType(null); setValidationError([]); }}
                    className={clsx(
                        classes.confirmButton,
                        classes.dialogConfirmButton,
                    )}
                    style={{ margin: '0 auto' }}>
                    {t('common.confirm')}
                </Button>
            )
        };
    }
    const handleCopyScript = () => {
        setCopyStatus(true);
        setTimeout(() => {
            setCopyStatus(false);
        }, 1000);
    }
    const handleImplementScript = (value) => {
        if (value) {
            setCookie('hideScriptSiteEventDialog', true, { maxAge: 2147483647 });
        }
        setDialogType(null);
    }
    const scriptErrorImplementationDialog = () => {
        return {
            title: t("siteTracking.title"),
            showDivider: true,
            icon: (
                <AiOutlineExclamationCircle
                    style={{ fontSize: 30, color: "#fff" }}
                />
            ),
            content: (
                <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <FaExclamationCircle style={{ fontSize: 100 }} />
                    <Typography className={classes.mt4}>
                        {t('common.ErrorOccured')}.
                    </Typography>
                    <Typography style={{ textAlign: 'center' }}>{t("common.tryAgain")}</Typography>
                </Box>
            ),
            renderButtons: () => (
                <Grid
                    container
                    spacing={4}
                    className={classes.dialogButtonsContainer}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='large'
                            style={{ height: 40 }}
                            onClick={() => { setDialogType(null) }}
                            className={clsx(
                                classes.confirmButton,
                                classes.dialogConfirmButton,
                            )}>
                            {t('common.confirm')}
                        </Button>
                    </Grid>
                </Grid>
            )
        }
    }
    const scriptImplementationDialog = () => {
        return {
            title: null,
            showDivider: false,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\u005E'}
                </div>
            ),
            content: (
                <Box className={classes.dialogBox}>
                    <Typography
                        className={classes.f28}>
                        {t('notifications.implementDialog.beforeYouStarted')}
                    </Typography>
                    <Typography
                        className={clsx(classes.f20, classes.pb10)}>
                        {t('siteTracking.scriptDescription')}
                    </Typography>
                    <hr />
                    <Typography className={classes.f18}>
                        {t('siteTracking.scriptInstruction')}
                    </Typography>
                    <Typography className={clsx(classes.bold, classes.pb10, classes.pt10, classes.f18)}>
                        {t('siteTracking.scriptPayAttention')}
                    </Typography>
                    <CopyToClipboard text={siteScript} onCopy={handleCopyScript}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<div className={classes.copyIcon}>{copyStatus ? '\uE134' : '\ue0b0'}</div>}
                        >
                            {copyStatus ? t('notifications.copied') : t('notifications.copy')}
                        </Button>
                    </CopyToClipboard>
                    <Box style={{ direction: 'ltr' }}>
                        <Typography className={clsx(classes.bold, classes.f16)}>
                            {t('notifications.headTagOpenText')} {'<head>'}
                        </Typography>
                        <pre>
                            <div ref={refScriptCode} className={classes.scriptCode} style={{ padding: 5 }}>
                                {siteScript}
                            </div>
                        </pre>
                        <Typography className={clsx(classes.bold, classes.f16)}>
                            {t('notifications.headTagClosesText')} {'</head>'}
                        </Typography>
                    </Box>
                </Box>
            ),
            renderButtons: () => (
                <>
                    <FormControl className={classes.ps25}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={scriptDialog}
                                    onChange={() => handleScriptDialogCheck(!scriptDialog)}
                                    color="primary"
                                />
                            }
                            label={t('notifications.implementDialog.dontShowThisMessage')} />
                    </FormControl>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => handleImplementScript(true)}
                        className={clsx(
                            classes.gruopsDialogButton,
                            classes.dialogConfirmButton,
                        )}>
                        {t('common.Ok')}
                    </Button>
                </>
            )
        }
    }

    const renderToast = () => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 4000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }

    const PageHeader = () => {
        return <>
            <Grid container>
                <Grid item xs={7}>
                    <Title title={t("siteTracking.title")}
                        classes={classes}
                        subTitle={t("siteTracking.setUp")}
                        topZero={false}
                    />
                </Grid>
                <Grid item xs={5} style={{ alignItems: 'center', display: 'flex', marginTop: -10 }}>
                    <Button
                        onClick={() => setDialogType({ type: 'scriptImplementation' })}
                        variant='contained'
                        style={{ lineHeight: windowSize === 'xs' ? 1 : null, marginInlineStart: 'auto' }}
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue)}
                    >{t("siteTracking.scriptImplementation")}</Button>
                </Grid>
            </Grid>
        </>
    }
    const PageFooter = () => {
        return <Box>
            <Grid item xs={12} className={classes.baseButtonsContainer} style={{ marginBottom: 70 }}>
                <Button
                    variant='contained'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightGreen)}
                    onClick={() => onSave()}
                    style={{ height: '100%', minWidth: 100 }}
                >{t('common.Save')}</Button>
            </Grid>
        </Box>
    }

    const handleEventTab = (val) => {
        setTabValue(val);
    }
    const EventTabs = () => {
        return <TabContext value={tabValue}>
            <Grid
                container
                justifyContent='space-between'
                alignItems='center'
                className={classes.borderBottom1}
                item xs={12}>
                <TabList
                    onChange={(e, value) => handleEventTab(value)}
                    indicatorColor="primary"
                >
                    {eventsOptions.map((eo, idx) => {
                        return <Tab
                            key={idx}
                            label={t(eo.value)}
                            classes={{ root: classes.minWidth100 }}
                            value={eo.key}
                        />
                    })}
                </TabList>
            </Grid>
            {eventsOptions.map((eo, idx) => {
                return <TabPanel key={idx} value={eo.key} index={idx} className={classes.p0}>
                    {
                        model && <EventToGroups siteEvent={model} onUpdate={deepUpdate} classes={classes} />
                    }
                </TabPanel>
            })}
        </TabContext>
    }

    //#endregion Dialogs
    return <DefaultScreen
        currentPage='settings'
        subPage='SiteTracking'
        classes={classes}
        customPadding={true}>
        <Box className={classes.editorContainer}>
            {PageHeader()}
            {renderToast()}
            {renderDialog()}
            {model && <Box style={{ marginBottom: 'auto' }}>
                <form className={classes.root} noValidate autoComplete="off">
                    <Grid container alignItems="center">
                        <Grid item lg={12} xs={12}>
                            <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.siteToTrack")}</Typography>
                            <Typography className={clsx(classes.mt10, classes.buttonHead)}>
                                {t("siteTracking.yourDomain")}
                            </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12} className={clsx(classes.flex)} style={{ height: 55, direction: 'ltr' }}>
                            <FormControl variant="outlined"
                                className={clsx(
                                    classes.formControl,
                                    isRTL ? classes.endElementNoRadius : classes.startElementNoRadius)
                                }
                                style={{ minWidth: 120 }}>
                                <Select
                                    id="drpSelectDomainProtocol"
                                    name="drpSelectDomainProtocol"
                                    value={protocol}
                                    onChange={(e) => handleDomainProtocol(e)}
                                    style={{ direction: 'ltr' }}
                                >
                                    {domainProtocol.map((protocol) => {
                                        return <MenuItem key={protocol.key} value={protocol.name}>
                                            {protocol.name}
                                        </MenuItem>
                                    })}
                                </Select>
                            </FormControl>
                            <TextField
                                placeholder={t('siteTracking.addDomain')}
                                inputProps={{
                                    shrink: false
                                }}
                                className={clsx(classes.textField, classes.fullWidth, isRTL ? classes.startElementNoRadius : classes.endElementNoRadius)}
                                required
                                fullWidth
                                variant="outlined"
                                onChange={e => { handleModelChange("domain", e.target.value) }}
                                value={model.domain}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.eventToTrack")}</Typography>
                            <EventTabs />
                        </Grid>
                    </Grid>
                </form>
            </Box>}
            {PageFooter()}
        </Box>
        <Loader isOpen={showLoader} />
    </DefaultScreen>
}

export default SiteTrackingEditor;
