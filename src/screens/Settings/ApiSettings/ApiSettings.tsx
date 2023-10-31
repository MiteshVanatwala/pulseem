import React, { useState, useEffect } from 'react';
import { Box, Divider, Button, Typography, TextField, makeStyles, Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../../../components/Loader/Loader';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import VerificationDialog from '../../../components/DialogTemplates/VerificationDialog';
import {
    MdArrowBackIos,
    MdArrowForwardIos,
    MdMobileFriendly,
    MdOutlineMarkEmailRead,
} from 'react-icons/md';
import { Title } from '../../../components/managment/Title';
import { getApiKey, generateApiKey } from '../../../redux/reducers/AccountSettingsSlice';
import Toast from '../../../components/Toast/Toast.component';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Visibility, VisibilityOff } from '@material-ui/icons';
// @ts-ignore
import CopyToClipboard from 'react-copy-to-clipboard';
import { UIApiSwaggerURL, DirectApiSwaggerURL } from '../../../config';
import { BaseDialog } from '../../../components/DialogTemplates/BaseDialog';
import { HiOutlineRefresh } from 'react-icons/hi';
import { BiExport } from 'react-icons/bi';
import CustomTooltip from '../../../components/Tooltip/CustomTooltip';
import PulseemRadio from '../../../components/Controlls/PulseemRadio';

const useStyles = makeStyles({
    pwdEveButton: {
        padding: 5
    },
    customIcon: {
        '& .MuiButton-startIcon': {
            marginRight: 'unset !important',
            marginLeft: 'unset !important'
        }
    }
});

const ApiSettings = ({ classes }: any) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isRTL, windowSize } = useSelector((state: any) => state.core);
    const { ToastMessages } = useSelector((state: any) => state?.accountSettings);
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [smsVerificationPopup, setSmsVerificationPopup] = useState(false);
    const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
    const [tfaEmailVerification, setTfaEmailVerification] = useState(false);
    const [tfaSmsVerification, setTfaSmsVerification] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0);
    const [cellphoneToVerify, setCellphoneToVerify] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState<boolean>(false);
    const [copyStatus, setCopyStatus] = useState<boolean>(false);
    const [showRegenerate, setShowRegenerate] = useState<boolean>(false);
    const [isMainApi, setIsMainApi] = useState<boolean>(true);

    const localClasses = useStyles();

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return <Toast data={toastMessage} />;
    };

    useEffect(() => {
        if (showApiKey && apiKey === '') {
            requestApiKey();
        }
    }, [showApiKey])

    useEffect(() => {
        requestApiKey();
    }, [])

    const requestApiKey = async () => {
        const response = await dispatch(getApiKey()) as any;
        const payload = response?.payload;

        if (payload.StatusCode === 401) {
            logout();
        }
        else if (payload?.StatusCode === 500) {
            setToastMessage(ToastMessages?.GENERAL_ERROR);
        }
        else {
            setApiKey(payload?.Data);
        }
    }

    const reGenerateApiKey = async () => {
        setApiKey('');
        setShowRegenerate(false)
        const response = await dispatch(generateApiKey()) as any;
        const payload = response?.payload;

        if (payload.StatusCode === 401) {
            logout();
        }
        else if (payload?.StatusCode === 500) {
            setToastMessage(ToastMessages?.GENERAL_ERROR);
        }
        else {
            setApiKey(payload?.Data);
        }
    }

    const handleVerification = (type: string) => {
        switch (type) {
            case 'cellphone': {
                setSmsVerificationPopup(true);
                break;
            }
            case 'email': {
                setEmailVerificationPopup(true);
                break;
            }
            case 'email2fa': {
                setTfaEmailVerification(true);
                break;
            }
            case 'sms2fa': {
                setTfaSmsVerification(true);
                break;
            }
            default: {
                return false;
            }
        }
    }

    const handleCopyScript = () => {
        setCopyStatus(true);
        setTimeout(() => {
            setCopyStatus(false);
        }, 1000);
    }

    const handleApiType = (e: any) => {
        setIsMainApi(e.target.value === '1')
    }

    const radios = [
        {
            value: "1",
            className: classes.radioButtonActive,
            label: t("settings.apiSettings.mainApi"),
        },
        {
            value: "2",
            className: classes.radioButtonActive,
            label: t("settings.apiSettings.directApi"),
        }
    ];

    return (
        <DefaultScreen
            currentPage="settings"
            subPage="apiSettings"
            key="apiSettings"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {toastMessage && renderToast()}
            <Box className={'topSection'}>
                <Box className={clsx("head")} style={{ display: windowSize !== 'xs' ? '' : 'block' }}>
                    <Title
                        classes={classes}
                        ContainerStyle={{ width: '100% !important', flexDirection: windowSize !== 'xs' ? 'row' : 'column', 'padding': windowSize === 'xs' ? '10px 15px 10px 15px' : '11px 31.69px 8px 31.69px' }}
                        Element={<Box className={clsx(classes.dFlex, classes.flexWrap)} justifyContent='center' alignItems='center'>
                            <Typography className={clsx(classes.managementTitle, "mgmtTitle")} style={{ width: 'auto' }}>{t('settings.apiSettings.title')}</Typography>
                            <Box style={{ marginInlineStart: 'auto' }}>

                                <Button
                                    style={{ width: windowSize === 'xs' ? '100%' : '', maxWidth: windowSize === 'xs' ? '100%' : 'unset', marginTop: windowSize !== 'xs' ? 'unset' : 10 }}
                                    className={clsx(
                                        classes.btn,
                                        classes.btnRounded,
                                        classes.mr10
                                    )}
                                    onClick={() =>
                                        handleVerification('cellphone')
                                    }
                                    startIcon={<MdMobileFriendly />}
                                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                >
                                    <>
                                        {t(
                                            "settings.accountSettings.fixedComDetails.btnVerifyNumber"
                                        )}
                                    </>
                                </Button>
                                <Button
                                    style={{ width: windowSize === 'xs' ? '100%' : '', maxWidth: windowSize === 'xs' ? '100%' : 'unset', marginTop: windowSize !== 'xs' ? 'unset' : 10 }}
                                    className={clsx(
                                        classes.btn,
                                        classes.btnRounded,
                                        classes.mr10
                                    )}
                                    onClick={() =>
                                        handleVerification('email')
                                    }
                                    startIcon={<MdOutlineMarkEmailRead />}
                                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                >
                                    <>
                                        {t(
                                            "settings.accountSettings.fixedComDetails.btnVerifyEmail"
                                        )}
                                    </>
                                </Button>
                                <Button
                                    style={{ width: windowSize === 'xs' ? '100%' : '', maxWidth: windowSize === 'xs' ? '100%' : 'unset', marginTop: windowSize !== 'xs' ? 'unset' : 10 }}
                                    className={clsx(
                                        classes.btn,
                                        classes.btnRounded,
                                    )}
                                    onClick={() =>
                                        window.open('/Pulseem/ExportRemovals.aspx')
                                    }
                                    startIcon={<BiExport />}
                                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                                >
                                    <>
                                        {t(
                                            "settings.apiSettings.exportDirectRemovals"
                                        )}
                                    </>
                                </Button>
                            </Box>
                        </Box>}
                    />
                </Box>
                <Box className={"containerBody"}>
                    <Box className={classes.p20} style={{ marginTop: 15 }}>
                        <Typography
                            className={classes.gruopsDialogText}>
                            <FiberManualRecordIcon
                                className={classes.gruopsDialogBullet} />
                            {RenderHtml(t('settings.apiSettings.mainApiDesc'))}
                        </Typography>
                        <Typography
                            className={classes.gruopsDialogText}>
                            <FiberManualRecordIcon
                                className={classes.gruopsDialogBullet} />
                            {RenderHtml(t('settings.apiSettings.directSendApiDesc'))}
                        </Typography>
                    </Box>
                    <Divider style={{ marginTop: 15 }} />
                    <Box className={clsx(classes.p20)} >
                        <Box className={clsx(classes.flex)}>
                            <Box style={{ display: 'flex', flexDirection: windowSize !== 'xs' ? 'row' : 'column', alignItems: windowSize !== 'xs' ? 'flex-end' : '' }}>
                                <Typography className={clsx(classes.managementTitle, classes.font20)} style={{ maxWidth: windowSize !== 'xs' ? 90 : '' }}>{t('integrations.shopify.apiKey')}:</Typography>
                                <Box className={clsx(classes.mr10, classes.ml10)}>
                                    <TextField
                                        type={showApiKey ? "text" : "password"}
                                        id="outlined-basic"
                                        name="ConfirmPassword"
                                        label=""
                                        variant="outlined"
                                        value={apiKey}
                                        style={{ minWidth: windowSize !== 'xs' ? 650 : 'unset', width: '100%' }}
                                        className={clsx(
                                            classes.textField,
                                            localClasses.customIcon
                                        )}
                                        inputProps={{
                                            style: {
                                                paddingInline: 15
                                            },
                                            autocomplete: "new-password"
                                        }}
                                        disabled

                                        InputProps={{

                                            endAdornment: (
                                                <>
                                                    <CustomTooltip
                                                        text={null}
                                                        titleStyle={{ fontSize: 14 }}
                                                        arrow
                                                        isSimpleTooltip={false}
                                                        classes={classes}
                                                        interactive={true}
                                                        placement={'top'}
                                                        title={RenderHtml(t("settings.apiSettings.showApiKey"))}
                                                        style={{ maxWidth: 'unset !important', textOverflow: 'unset !important', overflow: 'unset !important', direction: isRTL ? 'rtl' : 'ltr' }}
                                                        children={
                                                            <Button
                                                                onClick={() => setShowApiKey(!showApiKey)}
                                                                className={localClasses.pwdEveButton}
                                                                startIcon={<div className={classes.copyIcon}>{showApiKey ? (
                                                                    <VisibilityOff style={{ fontSize: 18 }} />
                                                                ) : (
                                                                    <Visibility style={{ fontSize: 18 }} />
                                                                )}</div>}
                                                            >
                                                                {" "}
                                                            </Button>
                                                        }
                                                        icon={null}
                                                    />
                                                    <CustomTooltip
                                                        text={null}
                                                        titleStyle={{ fontSize: 14 }}
                                                        arrow
                                                        isSimpleTooltip={false}
                                                        classes={classes}
                                                        interactive={true}
                                                        placement={'top'}
                                                        title={RenderHtml(t("settings.apiSettings.createNewApiKey"))}
                                                        style={{ maxWidth: 'unset !important', textOverflow: 'unset !important', overflow: 'unset !important', direction: isRTL ? 'rtl' : 'ltr' }}
                                                        children={
                                                            <Button
                                                                onClick={() => setShowRegenerate(true)}
                                                                className={localClasses.pwdEveButton}
                                                                startIcon={<div className={classes.copyIcon}>{<HiOutlineRefresh style={{ fontSize: 18 }} />}</div>}
                                                            >
                                                                {" "}
                                                            </Button>
                                                        }
                                                        icon={null}
                                                    />
                                                    <CustomTooltip
                                                        text={null}
                                                        titleStyle={{ fontSize: 14 }}
                                                        arrow
                                                        isSimpleTooltip={false}
                                                        classes={classes}
                                                        interactive={true}
                                                        placement={'top'}
                                                        title={RenderHtml(t("notifications.copy"))}
                                                        style={{ maxWidth: 'unset !important', textOverflow: 'unset !important', overflow: 'unset !important', direction: isRTL ? 'rtl' : 'ltr' }}
                                                        children={
                                                            <CopyToClipboard text={apiKey} onCopy={handleCopyScript}>
                                                                <Button
                                                                    className={localClasses.pwdEveButton}
                                                                    startIcon={<div className={classes.copyIcon}>{copyStatus ? '\uE134' : '\ue0b0'}</div>}
                                                                >
                                                                    {" "}
                                                                </Button>
                                                            </CopyToClipboard>
                                                        }
                                                        icon={null}
                                                    />


                                                </>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                        <Box className={clsx(classes.flex, classes.alignItemsCenter)} style={{ width: '100%' }}>
                            <Box style={{ display: 'flex', flexDirection: windowSize !== 'xs' ? 'row' : 'column', alignItems: 'center', height: windowSize !== 'xs' ? 60 : '' }}>
                                <PulseemRadio
                                    classes={classes}
                                    name={"apiType"}
                                    onChange={(e: any) => handleApiType(e)}
                                    value={isMainApi ? '1' : '2'}
                                    radioOptions={radios}
                                    isVerical={windowSize !== 'xs'}
                                />
                                <Box className={clsx(classes.mr10, classes.ml10)}>
                                    {isMainApi && <Link className={windowSize !== 'xs' ? classes.font18 : classes.font14} style={{ width: '100%', alignSelf: 'center', marginTop: 2, display: 'block', textDecoration: 'underline' }} href={UIApiSwaggerURL}>{UIApiSwaggerURL}</Link>}
                                    {!isMainApi && <Link className={windowSize !== 'xs' ? classes.font18 : classes.font14} style={{ width: '100%', alignSelf: 'center', marginTop: 2, display: 'block', textDecoration: 'underline' }} href={DirectApiSwaggerURL}>{DirectApiSwaggerURL}</Link>}
                                </Box>
                            </Box>
                        </Box>
                        {/* Explanations */}
                        <Box className={classes.mt25} style={{ maxWidth: 768 }}>
                            {RenderHtml(t('settings.apiSettings.mainApiExplainTitle'))}
                            {RenderHtml(t('settings.apiSettings.mainApiExplainDesc'))}
                        </Box>
                    </Box>
                </Box>
            </Box>
            {showRegenerate && <BaseDialog
                classes={classes}
                open={showRegenerate}
                onClose={() => {
                    setShowRegenerate(false)
                }}
                onCancel={() => {
                    setShowRegenerate(false)
                }}
                onConfirm={() => {
                    reGenerateApiKey()
                }}
                showDefaultButtons={true}
                title={t('integrations.shopify.apiKey')}
            >
                {RenderHtml(t('settings.apiSettings.reGenerateConfirm'))}
            </BaseDialog>}
            {tfaEmailVerification && <VerificationDialog
                variant="emailTFA"
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                isOpen={tfaEmailVerification}
                step={verificationStep}
                value={null}
                onClose={() => {
                    setTfaEmailVerification(false);
                    setVerificationStep(0);
                }}
            />}
            {emailVerificationPopup && <VerificationDialog
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                variant="email"
                isOpen={emailVerificationPopup}
                step={verificationStep}
                value={null}
                onClose={() => {
                    setEmailVerificationPopup(false);
                    setVerificationStep(0);
                }} />}
            {tfaSmsVerification && <VerificationDialog
                variant="smsTFA"
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                isOpen={tfaSmsVerification}
                step={verificationStep}
                value={null}
                onClose={() => {
                    setTfaSmsVerification(false);
                    setVerificationStep(0);
                }}
            />}
            {smsVerificationPopup && <VerificationDialog
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                variant="sms"
                step={verificationStep}
                value={null}
                isOpen={smsVerificationPopup}
                onClose={() => {
                    setSmsVerificationPopup(false);
                    setVerificationStep(0);
                }} />}
            <Loader isOpen={showLoader} showBackdrop={true} />
        </DefaultScreen>
    );
};

export default ApiSettings;
