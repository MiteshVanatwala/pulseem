import React, { useState, useEffect } from 'react';
import { Box, Divider, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { AccountSettings } from '../../../Models/Account/AccountSettings';
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
import { getCommonFeatures } from '../../../redux/reducers/commonSlice';
import { getAccountSettings } from '../../../redux/reducers/AccountSettingsSlice';
import Toast from '../../../components/Toast/Toast.component';
import { RenderHtml } from '../../../helpers/Utils/HtmlUtils';

const ApiSettings = ({ classes }: any) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isRTL, windowSize } = useSelector((state: any) => state.core);
    const { account, ToastMessages } = useSelector((state: any) => state?.accountSettings);
    const { CoreToastMessages } = useSelector((state: any) => state?.core);
    const [toastMessage, setToastMessage] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [smsVerificationPopup, setSmsVerificationPopup] = useState(false);
    const [emailVerificationPopup, setEmailVerificationPopup] = useState(false);
    const [tfaEmailVerification, setTfaEmailVerification] = useState(false);
    const [tfaSmsVerification, setTfaSmsVerification] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0);
    const [emailToVerify, setEmailToVerify] = useState<string>('');
    const [cellphoneToVerify, setCellphoneToVerify] = useState<string>('');

    const renderToast = () => {
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
        return <Toast data={toastMessage} />;
    };


    // const getData = async () => {
    // 	await dispatch(getAccountSettings());
    // 	setShowLoader(false);
    // }
    // useEffect(() => {
    // 	getData();
    // }, []);

    const handleResponses = async (response: any, updatedObject: AccountSettings) => {
        switch (response?.StatusCode || response?.payload?.StatusCode) {
            case 201: {
                setToastMessage(ToastMessages.SETTINGS_SAVED);
                break;
            }
            case 401: {
                logout();
                break;
            }
            case 400: {
                switch (response?.payload?.Message) {
                    case 'Email': {
                        setToastMessage(ToastMessages.INVALID_EMAIL);
                        break;
                    }
                    case 'Cellphone': {
                        setToastMessage(ToastMessages.INVALID_CELLPHONE);
                        break;
                    }
                    case 'AuthCompanyEmail': {
                        setEmailToVerify(updatedObject.Email);
                        setVerificationStep(1);
                        setToastMessage(ToastMessages.VERIFY_EMAIL);
                        handleVerification('email2fa');
                        break;
                    }
                    case 'AuthCompanyCellphone': {
                        setCellphoneToVerify(updatedObject.CellPhone);
                        setVerificationStep(1);
                        setToastMessage(ToastMessages.VERIFY_CELLPHONE);
                        handleVerification('sms2fa');
                        break;
                    }
                    case 'AuthEmail': {
                        setEmailToVerify(updatedObject.DefaultFromMail);
                        setVerificationStep(1);
                        setToastMessage(ToastMessages.VERIFY_EMAIL);
                        handleVerification('email');
                        break;
                    }
                    case 'AuthCellphone': {
                        setCellphoneToVerify(updatedObject.DefaultCellNumber);
                        setVerificationStep(1);
                        setToastMessage(ToastMessages.VERIFY_CELLPHONE);
                        handleVerification('cellphone');
                        break;
                    }
                }
                break;
            }
            case 403: {
                setToastMessage(CoreToastMessages?.XSS_ERROR);
                await dispatch(getAccountSettings());
                break;
            }
            case 200:
            case 500:
            default: {
                setToastMessage(ToastMessages?.GENERAL_ERROR);
                break;
            }
        }
    };

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

    return (
        <DefaultScreen
            currentPage="settings"
            subPage="apiSettings"
            key="apiSettings"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {toastMessage && renderToast()}
            <Box className={clsx(classes.settingsContainer)}>
                <Box className={clsx("head")} style={{ display: windowSize !== 'xs' ? '' : 'block' }}>
                    <Title Text={t("settings.apiSettings.title")} classes={classes}
                        ContainerStyle={{ width: '100% !important' }}
                        Element={<Box style={{ float: isRTL ? 'left' : 'right' }}>
                            <Button
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
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded,
                                )}
                                onClick={() =>
                                    handleVerification('email')
                                }
                                startIcon={<MdOutlineMarkEmailRead />}
                                endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                            >
                                <>
                                    {t(
                                        "settings.apiSettings.exportDirectRemovals"
                                    )}
                                </>
                            </Button>
                        </Box>}
                    />
                </Box>
                <Box className={"containerBody"}>
                <Box>
                    <ul>
                        <li>{RenderHtml(t('settings.apiSettings.mainApiDesc'))}</li>
                        <li>{RenderHtml(t('settings.apiSettings.directSendApiDesc'))}</li>
                    </ul>
                </Box>
                <Divider />
                    AAA
                </Box>
            </Box>
            {tfaEmailVerification && <VerificationDialog
                variant="emailTFA"
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                isOpen={tfaEmailVerification}
                step={verificationStep}
                value={verificationStep > 0 && emailToVerify}
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
                value={verificationStep > 0 && emailToVerify}
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
                value={verificationStep > 0 && cellphoneToVerify}
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
                value={verificationStep > 0 && cellphoneToVerify}
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
