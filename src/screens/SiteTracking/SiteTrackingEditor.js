import clsx from 'clsx';
import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
import { useTranslation } from 'react-i18next';
import Title from '../../components/Wizard/Title'
import {
    Typography, Button, TextField, Grid, Box, FormControlLabel, FormControl, Select, MenuItem, Radio, RadioGroup, Checkbox
} from '@material-ui/core'
import PageItem from './PageItem'
import { eventsOptions, domainProtocol } from '../../helpers/PulseemArrays'
import { getGroupsBySubAccountId } from "../../redux/reducers/smsSlice";
import { useDispatch, useSelector } from 'react-redux'
import { get, post, getScript } from '../../redux/reducers/siteTrackingSlice';
import { EventRequestModel, SiteTrackingModel } from '../../model/SiteTracking/SiteTrackingModel';
import { MdErrorOutline } from 'react-icons/md';
import { Dialog } from '../../components/managment/index';
import Toast from '../../components/Toast/Toast.component';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getCookie, setCookie } from '../../helpers/cookies';
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
    const { isRTL } = useSelector(state => state.core);
    const [copyStatus, setCopyStatus] = useState(false);
    const refScriptCode = useRef(null);
    const [scriptDialog, handleScriptDialogCheck] = useState(false);

    useEffect(() => {
        getData();
    }, [dispatch]);

    const getData = async () => {
        await dispatch(getScript());
        await dispatch(getGroupsBySubAccountId());
        const response = await dispatch(get(EventRequestModel.PageView));
        setModel(response.payload);
        setShowLoader(false);
        const hideScriptIntro = getCookie("hideScriptSiteEventDialog");
        if (hideScriptIntro === "false") {
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

    const validateForm = (event) => {
        let isValid = true;
        const isValidDomain = () => {
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
            return model.domain.match(domainRegex);
        }
        if (model.domain === '') {
            setValidationError([...validationError, t('siteTracking.validation.domainRequired')])
            isValid = false;
        }
        if (!isValidDomain()) {
            setValidationError([...validationError, t('siteTracking.validation.domainNotValid')])
            isValid = false;
        }
        if (model.metadata.GroupIds.length === 0) {
            setValidationError([...validationError, t('siteTracking.validation.groupsRequired')])
            isValid = false;
        }
        return isValid;
    }

    const onSave = async () => {
        setShowLoader(true);
        if (validateForm()) {
            const request = { ...model };
            request.domain = protocol + request.domain;
            const response = await dispatch(post(request));
            onSaveReponse(response.payload);
        }
        else {
            setDialogType({ type: "validationError" });
        }
        setShowLoader(false);
    }

    const onSaveReponse = (response) => {
        console.log(response);
        switch (response.statusCode) {
            case 200: {
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
        const { type } = dialogType || {}
        const dialogContent = {
            notAutorized: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.notAuthorized')),
            missingMandatoryAction: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.missingMandatoryAction')),
            serverNotAble: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.serverNotAble')),
            domainAlreadyExist: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.serverResponse.serverNotAble')),
            validationError: validationErrorDialog(),
            scriptImplementation: scriptImplementationDialog()
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
                <Box className={classes.dialogBox}>
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
                        {validationError.map((d, index) => (<li key={{ index }}>{d}</li>))}
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
                            <div ref={refScriptCode} className={classes.scriptCode}>
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

    //#endregion Dialogs
    return <DefaultScreen
        currentPage='settings'
        subPage='SiteTracking'
        classes={classes}
        containerClass={classes.management}>
        <Box style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <Title title={t("siteTracking.title")}
                classes={classes}
                subTitle={t("siteTracking.setUp")}
                topZero={false}
            />
            {renderToast()}
            {renderDialog()}
            {model && <Box style={{ marginBottom: 'auto' }}>
                <form className={classes.root} noValidate autoComplete="off">
                    <Grid container alignItems="center">
                        <Grid item xs={12}>
                            <Typography className={clsx(classes.marginBlock20)}>{t("siteTracking.siteToTrack")}</Typography>
                            <Typography className={clsx(classes.mt10)}>{t("siteTracking.yourDomain")}</Typography>
                        </Grid>
                        <Grid item xs={6} className={clsx(classes.flex)} style={{ height: 55, direction: 'ltr' }}>
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
                            <Box>
                                <FormControl component="fieldset">
                                    <RadioGroup aria-label="eventName" name="eventName" value={model.eventName}>
                                        {
                                            eventsOptions.map((eo, idx) => {
                                                return <FormControlLabel
                                                    key={idx}
                                                    value={eo.key}
                                                    labelPlacement="end"
                                                    onChange={() => handleModelChange("eventName", eo.key)}
                                                    control={<Radio color="primary" />}
                                                    label={t(eo.value)} />
                                            })
                                        }
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            {
                                model && <PageItem siteEvent={model} onUpdate={deepUpdate} classes={classes} />
                            }
                        </Grid>
                    </Grid>
                </form>
            </Box>}
            <Box>
                <Grid item xs={12} style={{ marginTop: 'auto' }}>
                    <Button
                        variant='contained'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen)}
                        onClick={() => onSave()}
                        style={{ height: '100%', minWidth: 100 }}
                    >{t('common.Save')}</Button>
                    <Button
                        onClick={() => setDialogType({ type: 'scriptImplementation' })}
                        variant='contained'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue)}
                        style={{ height: '100%', minWidth: 100, marginInline: 10 }}
                    >{t("siteTracking.scriptImplementation")}</Button>
                </Grid>
            </Box>
        </Box>
        <Loader isOpen={showLoader} />
    </DefaultScreen>
}

export default SiteTrackingEditor;
