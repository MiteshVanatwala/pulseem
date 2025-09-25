import clsx from 'clsx';
import React, { useState, useEffect, useRef } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
import { useTranslation } from 'react-i18next';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import { Typography, Button, TextField, Grid, Box, FormControlLabel, FormControl, Checkbox } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { get, post, update, getScript, setDomain, deleteSiteTrackingEvent, deletePulseemSiteTracking, updateEventModel, setPurchase } from '../../redux/reducers/siteTrackingSlice';
import { EventRequestModel } from '../../model/SiteTracking/SiteTrackingModel';
import { MdArrowBackIos, MdArrowForwardIos, MdErrorOutline } from 'react-icons/md';
import Toast from '../../components/Toast/Toast.component';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getCookie, setCookie } from '../../helpers/Functions/cookies';
import { FaExclamationCircle } from 'react-icons/fa'
import { AiOutlineExclamationCircle } from "react-icons/ai";
import EventTabs from './EventTabs';
import { IsValidURL } from '../../helpers/Utils/Validations';
import { setSelectedGroups, getGroupsBySubAccountId } from '../../redux/reducers/groupSlice';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { sendToTeamChannel } from "../../redux/reducers/ConnectorsSlice";
import { Title } from '../../components/managment/Title';
import { InputAdornment } from '@mui/material';
import { getCommonFeatures } from '../../redux/reducers/commonSlice';
import { SetRevenueFeature } from '../../redux/reducers/AccountSettingsSlice';
import { findPlanByFeatureCode } from '../../redux/reducers/TiersSlice';
import TierPlans from '../../components/TierPlans/TierPlans';

const SiteTrackingEditor = ({ classes }) => {
    const { isRTL, windowSize } = useSelector(state => state.core);
    const { ToastMessages, siteScript, event, purchaseEvent } = useSelector((state) => state.siteTracking);
    const { currentPlan, availablePlans } = useSelector((state) => state.tiers);
    const [showLoader, setShowLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [validationError, setValidationError] = useState([]);
    const [dialogType, setDialogType] = useState({ type: null });
    const [TierMessageCode, setTierMessageCode] = useState("");
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [copyStatus, setCopyStatus] = useState(false);
    const refScriptCode = useRef(null);
    const [scriptDialog, handleScriptDialogCheck] = useState(false);
    const [isValidDomain, setIsValidDomain] = useState(null);
    const [showActions, setShowActions] = useState(true);
    const [purchaseToggleDisabled, setPurchaseToggleDisabled] = useState(false);
    const [showTierPlans, setShowTierPlans] = useState(false);

    const handleGetPlanForFeature = (tierMessageCode) => {
        const planName = findPlanByFeatureCode(
            tierMessageCode,
            availablePlans,
            currentPlan.Id
        );

        if (planName) {
            return t('billing.tier.featureNotAvailable').replace('{feature}', tierMessageCode).replace('{planName}', planName);
        } else {
            return t('billing.tier.noFeatureAvailable');
        }
    };

    const getTierValidationDialog = () => {
        return {
            type: 'tier',
            data: null,
            title: t('billing.tier.permission'),
            showDivider: false,
            content: (
                <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
                    {handleGetPlanForFeature(TierMessageCode)}
                </Typography>
            ),
            renderButtons: () => (
                <Grid container spacing={2} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                    <Grid item>
                        <Button
                            onClick={() => {
                                setDialogType(null);
                                setShowTierPlans(true);
                            }}
                            className={clsx(classes.btn, classes.btnRounded)}
                        >
                            {t('billing.upgradePlan')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={() => { setDialogType(null); }}
                            className={clsx(classes.btn, classes.btnRounded)}
                        >
                            {t('common.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            )
        };
    };

    useEffect(() => {
        const getData = async () => {
            await dispatch(getScript());
            await dispatch(getGroupsBySubAccountId());
            const response = await dispatch(get(EventRequestModel.PageView));
            const retModel = response.payload;
            if (!response.error && retModel.length !== 0) {
                const eventObject = retModel[0];
                if (!eventObject.metadata) {
                    dispatch(updateEventModel({ type: 'new' }));
                }
            }
            else {
                dispatch(updateEventModel({ type: 'new' }));
            }
            setShowLoader(false);
            const hideScriptIntro = getCookie("hideScriptSiteEventDialog");
            if (hideScriptIntro !== 'true') {
                setDialogType({ type: 'scriptImplementation' });
            }
        }
        getData();
    }, [dispatch]);

    useEffect(() => {
        if (event && (isValidDomain !== null || event.domain !== '')) {
            setIsValidDomain(IsValidURL(event.domain));
        }
    }, [event, isValidDomain]);

    const handleModelChange = async (name, value) => {
        await dispatch(updateEventModel({ prop: name, value: value }))
    }
    const validateForm = () => {
        let isValid = true;

        if (event.domain === '') {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.domainRequired')])
            isValid = false;
        }
        if (event.domain !== '' && !IsValidURL(event.domain)) {
            setValidationError(oldArray => [...oldArray, t('siteTracking.validation.domainNotValid')])
            isValid = false;
        }
        event.metadata.forEach((mt) => {
            if (mt.groupIds.length === 0) {
                setValidationError(oldArray => [...oldArray, t('siteTracking.validation.groupsRequired')])
                isValid = false;
            }
            if (mt.operatorValue === '') {
                setValidationError(oldArray => [...oldArray, t('siteTracking.validation.pageUrlRequired')])
                isValid = false;
                const el = document.getElementById(`input${mt.id}`);
                el.classList.add('error');
            }
        });
        return isValid;
    }
    const handlePurchase = async (isEnable) => {
        setPurchaseToggleDisabled(true);
        if (isEnable) {
            const request = {
                domain: event?.domain,
                eventName: "PURCHASE",
                actionType: "TRACK_PURCHASE_EVENT",
                metadata: []
            }
            const response = await dispatch(post(request));
            if (response.payload.status !== 200 && response.payload.status !== 201) {
                onSaveReponse(response?.payload);
            }
            else {
                request.id = response?.payload?.data?.id;
                dispatch(setPurchase(request));
                updateRevenueFeature(isEnable);                
                const setDomainResponse = await dispatch(setDomain({ DomainAddress: event?.domain }));
                if (setDomainResponse.payload.Result !== 1) {
                    onPulseemSaveReponse(setDomainResponse.payload);
                    setPurchaseToggleDisabled(false);
                    return;
                }
            }
        }
        else {
            const response = await dispatch(deleteSiteTrackingEvent(purchaseEvent.id));
            setPurchase(response?.payload?.data);
            updateRevenueFeature(isEnable);
            if (event && event.id !== '') {
                return;
            }
            else {
                await dispatch(deletePulseemSiteTracking());
                dispatch(updateEventModel({ type: 'new' }));
            }
        }
        setPurchaseToggleDisabled(false);
    }

    const updateRevenueFeature = async (isEnable) => {
        const revenueResponse = await dispatch(SetRevenueFeature({
            FeatureName: "revenue",
            ToggleFeature: isEnable
        }));
        if (revenueResponse.payload.StatusCode === 200) {
            setToastMessage(isEnable ? ToastMessages.REVENUE_ADDED : ToastMessages.REVENUE_REMOVED);
            await dispatch(getCommonFeatures());
        } else {
            setToastMessage(ToastMessages.REVENUE_ERROR);
        }
    }

    const onSave = async () => {
        setShowLoader(true);
        if (validateForm()) {
            const request = { ...event };
            const setDomainResponse = await dispatch(setDomain({ DomainAddress: request.domain }));
            if (setDomainResponse.payload.Result === 1) {
                let response = null;
                if (request.id && request.id !== '') {
                    response = await dispatch(update(request));
                }
                else {
                    response = await dispatch(post(request));
                    if (response.payload && response.payload.data) {
                        const id = response.payload.data.id;
                        dispatch(updateEventModel({ prop: 'id', id }));
                    }
                }
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
        // Check for StatusCode 927 (tier validation)
        if (response.StatusCode === 927) {
            // SITE_TRACKING
            setTierMessageCode(response.Message);
            setDialogType(getTierValidationDialog());
            return;
        }
        
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
        try {
            let statusCode = response.statusCode ? response.statusCode : response.status
            switch (statusCode) {
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
                case 400: {
                    setDialogType({ type: 'invalidDomain' })
                    break
                }
                default:
                case 500: {
                    setDialogType({ type: 'serverNotAble' })
                    break;
                }
            }
        }
        catch (e) {
            console.log(e);
            dispatch(sendToTeamChannel({
                MethodName: 'onSaveReponse',
                ComponentName: 'SiteTrackingEditor.js',
                Text: e
            }));
            setDialogType({ type: 'serverNotAble' })
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
            dynamicMessage: renderDynamicDataDialog(t('common.ErrorTitle'), message),
            deleteEvent: renderDynamicDataDialog(t('siteTracking.deleteDialogTitle'), RenderHtml(t("siteTracking.deleteDialogMessage")), false, true, true),
            invalidDomain: renderDynamicDataDialog(t('common.ErrorTitle'), t('siteTracking.invalidDomainAddress')),
            tier: renderDynamicDataDialog(t('billing.tier.permission'), RenderHtml(handleGetPlanForFeature(TierMessageCode)), false, false, false),
        }

        const currentDialog = dialogContent[type] || {}

        if (type) {
            return (
                dialogType && <BaseDialog
                    classes={classes}
                    open={dialogType}
                    onClose={() => { setDialogType(null) }}
                    onCancel={() => { setDialogType(null) }}
                    {...currentDialog}>
                    {currentDialog.content}
                </BaseDialog>
            )
        }
        return <></>
    }

    const renderDynamicDataDialog = (title, message, isErrorDialog = true, showCancel = false, showDelete = false) => {
        const handleClose = () => {
            setDialogType(null);
        }
        return {
            showDivider: false,
            icon: (
                <MdErrorOutline />
            ),
            title: title,
            content: (
                <Box className={clsx(classes.dialogBox, isErrorDialog ? classes.red : null)}>
                    {message}
                </Box>
            ),
            renderButtons: () => (
                <Box className={classes.spaceEvenly}>
                    {
                        showCancel && <Button
                            onClick={handleClose}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded,
                                classes.middle
                            )}>
                            {t('common.Cancel')}
                        </Button>
                    }
                    <Button
                        onClick={() => { !isErrorDialog && showDelete === true ? handleDeleteEvent() : handleClose() }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded,
                            classes.middle
                        )}
                        style={{ margin: !showCancel ? '0 auto' : null }}>
                        {t('common.Ok')}
                    </Button>
                </Box>
            )
        };
    }

    const validationErrorDialog = () => {
        return {
            showDivider: false,
            icon: (
                <MdErrorOutline />
            ),
            title: t("notifications.validationError"),
            content: (
                <Box className={classes.dialogBox}>
                    <ul>
                        {validationError.map((d, index) => (<li key={index} className={classes.red}>{d}</li>))}
                    </ul>
                </Box>
            ),
            renderButtons: () => (
                <Button
                    onClick={() => { setDialogType(null); setValidationError([]); }}
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.middle
                    )}
                    style={{ margin: '0 auto' }}>
                    {t('common.confirm')}
                </Button>
            ),
            onCancel: () => { setDialogType(null); setValidationError([]); },
            onClose: () => { setDialogType(null); setValidationError([]); },
        };
    }
    const handleDeleteEvent = async () => {
        setShowLoader(true);
        setDialogType(null);
        if (event.id && event.id !== '') {
            await dispatch(deletePulseemSiteTracking())
            await dispatch(deleteSiteTrackingEvent(event.id))
            handleModelChange('id', null);
        }
        dispatch(updateEventModel({ type: "new" }));
        dispatch(setSelectedGroups([]));
        setShowLoader(false);
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
            showDivider: false,
            icon: (
                <AiOutlineExclamationCircle />
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
                            style={{ height: 40 }}
                            onClick={() => { setDialogType(null) }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded,
                                classes.middle
                            )}>
                            {t('common.confirm')}
                        </Button>
                    </Grid>
                </Grid>
            )
        }
    }
    const scriptImplementationDialog = () => {
        const purchaseObject = ["Order ID", "Grand Total", "Shipping", "Tax", "Name", "Item Code", "Price"];
        return {
            title: null,
            showDivider: false,
            icon: (
                <div className={clsx(classes.dialogIconContent, 'unicode')}>
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
                        className={clsx(classes.f18, classes.pb10)}>
                        {RenderHtml(t('siteTracking.scriptDescription'))}
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
                    <Box>
                        <Typography className={clsx(classes.f18, classes.mt15, classes.mb15)}>
                            {t('siteTracking.scriptPageviewImplemented')}
                        </Typography>
                    </Box>
                    <Box>
                        <Box className={clsx(classes.f18)}>
                            <Typography className={clsx(classes.bold, classes.f18)}>
                                {t('siteTracking.purchaseActivating')}
                            </Typography>
                            <Typography className={classes.f18} style={{ display: 'inline-block' }}>{t('siteTracking.scriptPurchaseInstruction')}
                                <Typography style={{ marginInlineStart: 5, display: 'inline-block', transform: 'translateY(3px)' }}>
                                    <CustomTooltip
                                        isSimpleTooltip={false}
                                        arrow={true}
                                        style={{ fontSize: 14 }}
                                        nameEllipsis={false}
                                        classes={classes}
                                        interactive={true}
                                        placement={'top'}
                                        titleStyle={{ fontSize: 13, textAlign: 'center' }}
                                        title={t("siteTracking.purchaseInstructionTooltip")}
                                        text={<span className={classes.bodyInfo}>i</span>}
                                    />
                                </Typography>
                            </Typography>
                        </Box>
                        <ul>
                            {purchaseObject.map((item, idx) => {
                                return <li key={idx}>{item}</li>
                            })}
                        </ul>
                    </Box>
                    <Box>
                        <Typography className={clsx(classes.f18, classes.mb10)}>{t("siteTracking.scriptPurchaseIstructionForComplete")}</Typography>
                        <Typography className={clsx(classes.f18, classes.mb10)}>{t("siteTracking.javscriptFunction")}</Typography>
                        <pre>
                            <div className={classes.scriptCode} style={{ padding: 5, direction: 'ltr' }}>
                                {`window.addEventListener('load', function(event) {
    const eventName = 'PURCHASE';
    const orderId = 'order1';
    const grandTotal = 100.00;
    const shipping = 10.00;
    const tax = 10.00;
    const orderItems = [{ itemCode: 'item1', name: 'item', price: 80.00, quantity: 1 }];
                                    `}
                                <b>
                                    {`
    window.trackPurchase(orderId, grandTotal, shipping, tax, orderItems);
    `}
                                </b>
                                {`
});`}
                            </div>
                        </pre>

                    </Box>
                    <Typography className={clsx(classes.f18, classes.mt10)}>{t("siteTracking.scriptInstructionEndText")}</Typography>
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
                        onClick={() => handleImplementScript(true)}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded,
                            classes.middle
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

    const PageFooter = () => {
        return <Grid container spacing={2}>
            <Grid item xs={12} className={classes.baseButtonsContainer} style={{ marginBottom: 70 }}>
                <Button
                    className={clsx(classes.btn, classes.btnRounded, windowSize === 'xs' ? classes.w100 : '')}
                    style={{ margin: '8px' }}
                    onClick={() => { setDialogType({ type: 'deleteEvent' }) }}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >
                    {t("common.Delete")}
                </Button>
                <Button
                    className={clsx(classes.btn, classes.btnRounded, windowSize === 'xs' ? classes.w100 : '')}
                    onClick={() => onSave()}
                    style={{ height: '100%', minWidth: 100, margin: '8px' }}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                >{t('common.Save')}</Button>
            </Grid>
        </Grid>
    }

    const handleDomainAddress = (e) => {
        var clipboardData, pastedData;
        e.stopPropagation();
        e.preventDefault();
        clipboardData = e.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');
        const url = pastedData.replace('http://', '').replace('https://', '').replace('www.', '');
        const splittedUrl = url.split('/');
        const finalUrl = splittedUrl[0];
        handleModelChange("domain", finalUrl);
    }

    const handleOnDomainChange = (e) => {
        const url = e.target.value.replace('http://', '').replace('https://', '').replace('www.', '');
        handleModelChange("domain", url);
    }
    return <DefaultScreen
        currentPage='settings'
        subPage='SiteTracking'
        classes={classes}
        customPadding={true}>
        <Box className={classes.editorCont}>
            <Box className='head'>
                <Title
                    Element={
                        <Box className={clsx(classes.flex, classes.spaceBetween, classes.flexWrap)}>
                            <Typography
                                style={{ width: 'auto' }}
                                className={clsx(classes.managementTitle, "mgmtTitle")}
                            >
                                {t("siteTracking.title")}
                            </Typography>
                            <Button
                                onClick={() => setDialogType({ type: 'scriptImplementation' })}
                                style={{ lineHeight: windowSize === 'xs' ? 1 : null, marginInlineStart: 'auto' }}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded)}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >{t("siteTracking.scriptImplementation")}</Button>
                        </Box>
                    }
                    classes={classes}
                    isIcon={true}
                    ContainerStyle={{
                        width: '100%'
                    }}
                />
            </Box>
            <Box className={'containerBody'}>
                {renderToast()}
                <Box className='bodyBlock'>
                    {renderDialog()}
                    <Box style={{ marginBottom: 'auto' }}>
                        <form className={classes.root} noValidate autoComplete="off">
                            <Grid container alignItems="center">
                                <Grid item lg={12} xs={12}>
                                    <Typography className={clsx(classes.marginBlock20, classes.font24)}>{t("siteTracking.siteToTrack")}</Typography>
                                    <Typography className={clsx(classes.mt10, classes.buttonHead)}>
                                        {t("siteTracking.yourDomain")}
                                    </Typography>
                                </Grid>
                                <Grid item sm={6} xs={12} className={'textBoxWrapper'} style={{ height: 55, direction: 'ltr' }}>
                                    <TextField
                                        placeholder={t('siteTracking.addDomain')}
                                        className={clsx(classes.textField,
                                            classes.fullWidth,
                                            isRTL ? classes.startElementNoRadius : classes.endElementNoRadius,
                                            classes.domainAddress,
                                            isValidDomain === false ? classes.error : isValidDomain !== null ? classes.valid : null)}
                                        required
                                        fullWidth
                                        onPaste={handleDomainAddress}
                                        variant="outlined"
                                        onChange={handleOnDomainChange}
                                        value={event?.domain}
                                        style={{ marginTop: isValidDomain === false || isValidDomain === true ? 2 : 0 }}
                                        InputProps={{
                                            style: { padding: 0 },
                                            startAdornment: <InputAdornment position="start" ><span style={{ color: '#000' }}>https://</span></InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography className={clsx(classes.marginBlock20, classes.font20)}>{t("siteTracking.eventToTrack")}</Typography>
                                    <EventTabs
                                        classes={classes}
                                        setDialog={setDialogType}
                                        showButtons={setShowActions}
                                        domain={event?.domain}
                                        onPurchaseChanged={handlePurchase}
                                        purchaseToggleDisabled={purchaseToggleDisabled} />
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                    {showActions && PageFooter()}
                </Box>
            </Box>

        </Box>
        <Loader isOpen={showLoader} />
        {showTierPlans && <TierPlans
            classes={classes}
            isOpen={showTierPlans}
            onClose={() => setShowTierPlans(false)}
        />}
    </DefaultScreen>
}

export default SiteTrackingEditor;
