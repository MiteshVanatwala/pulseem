import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Typography, Button, TextField, Box, Divider, Avatar, FormControlLabel, Checkbox } from '@material-ui/core'
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import 'moment/locale/he'
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { newAuthorizeEmail, verifyEmailCode, getTwoFactorAuthValues } from '../../redux/reducers/commonSlice';
import { getAuthorizedEmails, getAuthorizeNumbers } from '../../redux/reducers/commonSlice'
import { sendVerificationCode, verifyCode } from '../../redux/reducers/smsSlice'
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    addTwoFactorAuthValues,
    deleteAuthorizationValue,
    checkEmailAuthorization,
    deleteAuthorization2FA,
    checkCellphoneAuthorization
} from '../../redux/reducers/AccountSettingsSlice';
import { Loader } from '../Loader/Loader';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { IsValidNonGlobalPhoneNumber, IsValidPhoneNumberKeyPress, IsValidPhoneNumberWithCountryCode } from '../../helpers/Utils/Validations';


const VerificationDialog = ({
    classes,
    isOpen = false,
    onClose,
    variant = 'email',
    step = 0, value,
    onSenderSelect = undefined,
    showSelect = false,
    value,
    ...props }) => {
    const dispatch = useDispatch();
    const { isRTL } = useSelector(state => state.core);
    const { verifiedEmails, verifiedNumbers, twoFactorAuthEmails, twoFactorAuthNumbers, accountSettings, countryCodeList, isGlobal } = useSelector(state => state.common);
    const { t } = useTranslation();
    const [showLoader, setShowLoader] = useState(true);
    const [verificationStep, setVerificationStep] = useState(step ?? 0)
    const [verificationError, setVerificationError] = useState(null)
    const [selectedVerificationContact, setSelectedVerificationContact] = useState(value ?? "")
    const [codeResend, setCodeResend] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [authorizedTypeDisabled, setAuthorizedTypeDisabled] = useState(false);
    const [resendDisabled, setResendDisalbed] = useState(false);
    const [resendInterval, setResendInterval] = useState(10);
    const [userCodeConfirmed, setUserCodeConfirmed] = useState(false);
    const [addToFromEmailToSend, setAddToFromEmailToSend] = useState(false);
    const [addToFromNumberToSend, setAddToFromNumberToSend] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleteValue, setDeleteValue] = useState(null);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [senderNames, setSenderNames] = useState([]);    

    let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0
    const SLIDE_HEIGHTS = [25, 20, 20, 20, 20];
    const isIsraeliPhoneNumber = (val) => /^(\+972|972|0)5\d{8}$/.test(val);
    
    useEffect(() => {
        setDeleteValue(null);
        setAddToFromEmailToSend(false);
        setAddToFromNumberToSend(false);
        switch (variant) {
            case "email": {
                const handleVerificationDialog = async () => {
                    await dispatch(getAuthorizedEmails());
                    setShowLoader(false);
                }
                handleVerificationDialog();
                break;
            }
            case "sms": {
                const handleVerificationDialog = async () => {
                    const result = await dispatch(getAuthorizeNumbers());
                    const numbers = result.payload || [];
                    const nonIsraeliSenders = numbers
                        .filter(n => !isIsraeliPhoneNumber(n.Number))
                        .map(n => ({
                            ID: n.ID,
                            SenderName: n.Number,
                            RequestDate: n.CreateDate,
                            Status: n.IsOptIn ? 0 : (n.ReviewType === 'Rejected' ? 2 : 1),
                        }));
                    setSenderNames(nonIsraeliSenders);
                    setShowLoader(false);
                }
                handleVerificationDialog();
                break;
            }
            case "emailTFA": {

                const handleVerificationDialog = async () => {
                    await dispatch(getAuthorizedEmails());
                    await dispatch(getTwoFactorAuthValues(1));
                    setShowLoader(false);
                }
                handleVerificationDialog()
                break;
            }
            case "smsTFA": {
                const handleVerificationDialog = async () => {
                    await dispatch(getAuthorizeNumbers());
                    await dispatch(getTwoFactorAuthValues(2));
                    setShowLoader(false);
                }
                handleVerificationDialog()
                break;
            }
            default: {
                break;
            }
        }
    }, [])


    const NextSlide = () => {
        if (verificationStep === 4) {
            return setVerificationStep(0)
        }
        if (setVerificationError) {
            setVerificationError(null)
        }
        setCodeResend(false)
        return setVerificationStep(verificationStep + 1)
    }

    const PrevSlide = () => {
        if (verificationStep === 0) {
            return setVerificationStep(5)
        }
        return setVerificationStep(verificationStep - 1)
    }

    const handleClose = (callback) => {

        if (verificationStep <= 3 && variant === 'emailTFA' && selectedVerificationContact && !addToFromEmailToSend) {
            dispatch(deleteAuthorizationValue({ TwoFactorAuthTypeID: 1, AuthValue: selectedVerificationContact }));
        }
        if (verificationStep <= 3 && variant === 'smsTFA' && selectedVerificationContact && !addToFromNumberToSend) {
            dispatch(deleteAuthorizationValue({ TwoFactorAuthTypeID: 2, AuthValue: selectedVerificationContact }));
        }

        callback?.()
        onClose?.(verificationSuccess && selectedVerificationContact)
        verificationStep && setVerificationStep(0)
        verificationError && setVerificationError(null)
        selectedVerificationContact && setSelectedVerificationContact('');
        verificationCode && setVerificationCode('')
        if (localStorage.getItem('verificationTrial')) localStorage.removeItem('verificationTrial')
        setAuthorizedTypeDisabled(false);
        variant === 'email' && dispatch(getAuthorizedEmails());
        variant === 'sms' && dispatch(getAuthorizeNumbers());
        variant === 'sms' && setSenderNames([]);
        variant === 'emailTFA' && dispatch(getTwoFactorAuthValues(1));
        variant === 'smsTFA' && dispatch(getTwoFactorAuthValues(2));

        setAddToFromEmailToSend(false);
        setAddToFromNumberToSend(false);
    }

    const addTwoFactorValue = async (disableNextStep = false, type = 1) => {
        try {
            const authResponse = await dispatch(addTwoFactorAuthValues({ TwoFactorAuthTypeID: type, AuthValue: selectedVerificationContact, AddToFromValues: addToFromEmailToSend }))
            if (disableNextStep) {
                return authResponse?.payload;
            }
            switch (authResponse.payload?.StatusCode) {
                case 201:
                case 202: {
                    NextSlide();
                    break;
                }
                case 401: {
                    setVerificationError({ code: t('group.invalidApi') })
                    break;
                }
                case 403: {
                    setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') });
                    break;
                }
                default: {
                    break;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    const handleSubmitAlphabeticalSender = async () => {
        setShowLoader(true);
        const res = await dispatch(sendVerificationCode({ number: selectedVerificationContact }));
        setShowLoader(false);
  
        if (res?.payload) {
            setVerificationStep(4);
        } else {
            setVerificationError({ Number: t('common.errorContactSupport') });
        }
    };

    const handleVerifyCode = async () => {
        setShowLoader(true);
        setUserCodeConfirmed(true);
        switch (variant) {
            //#region email
            case 'email':
            case 'emailTFA': {
                dispatch(verifyEmailCode(
                    {
                        email: selectedVerificationContact,
                        optinCode: verificationCode
                    })).then(async (response) => {
                        setUserCodeConfirmed(false);
                        switch (response?.payload.toLowerCase()) {
                            case "ok": {
                                setVerificationSuccess(true);
                                if (variant === 'emailTFA') {
                                    addTwoFactorValue();
                                }
                                else {
                                    NextSlide();
                                }
                                break;
                            }
                            case "expired": {
                                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired') })
                                break;
                            }
                            case "notmatch": {
                                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') })
                                break;
                            }
                            case "toomuch": {
                                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts') })
                                break;
                            }
                            case "abused": {
                                setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.email_error_abused') })
                                break;
                            }
                            default: {
                                setVerificationError({ code: t('common.ErrorOccured') })
                                break;
                            }
                        }
                    })
                break;
            }
            //#endregion
            //#region sms
            case 'sms':
            case 'smsTFA': {
                const result = await dispatch(verifyCode({
                    optinCode: verificationCode,
                    phoneNumber: selectedVerificationContact
                }));
                setUserCodeConfirmed(false);
                switch (result.payload.toLowerCase()) {
                    case 'ok': {
                        setVerificationSuccess(true);
                        if (variant === 'smsTFA') {
                            addTwoFactorValue(false, 2);
                        }
                        else {
                            NextSlide();
                        }
                        break;
                    }
                    case 'notmatch': {
                        localStorage.setItem('verificationTrial', trials + 1)
                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') })
                        break;
                    }
                    case 'expired': {
                        localStorage.setItem('verificationTrial', trials + 1)
                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired') })
                        break;
                    }
                    case "toomuch": {
                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts') })
                        break;
                    }
                    case "abused": {
                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.sms_error_abused') })
                        break;
                    }
                    default: {
                        setVerificationError({ code: t('common.ErrorOccured') })
                        break;
                    }
                }
                break;
            }
            //#endregion
            default: { break; }
        }
        setShowLoader(false);
    }

    const handleResendInterval = () => {
        let intervalTime = 10;

        const startInterval = () => {
            if (intervalTime === 0) {
                stopInterval();
            }
            setResendInterval(intervalTime--);
        }
        const stopInterval = () => {
            setCodeResend(false);
            setResendInterval(10);
            clearInterval(interval);
            setResendDisalbed(false);
        }

        const interval = setInterval(startInterval, 1000);
    }

    useEffect(() => {
        if (codeResend === true) {
            handleResendInterval();
        }
    }, [codeResend])

    const handleSendCode = async (val, isResend = false) => {
        setShowLoader(true);
        setResendDisalbed(isResend);
        switch (variant) {
            case 'email':
            case 'emailTFA': {
                const request = { value: selectedVerificationContact, isTwoFa: variant === 'emailTFA' }
                const res = await dispatch(checkEmailAuthorization(request));
                if (res?.payload?.StatusCode === 404) {
                    dispatch(newAuthorizeEmail({ email: val })).then((result) => {
                        setCodeResend(isResend);
                        return result?.payload;
                    });
                }
                else if (res?.payload?.StatusCode === 201) {
                    setVerificationStep(3);
                }
                break;
            }
            case 'sms':
            case 'smsTFA': {
                const request = { value: selectedVerificationContact, isTwoFa: variant === 'smsTFA' }
                const res = await dispatch(checkCellphoneAuthorization(request));
                if (res?.payload?.StatusCode === 404) {
                    dispatch(sendVerificationCode({ number: val })).then((result) => {
                        setCodeResend(isResend);
                        if (!isResend) NextSlide();
                        return result?.payload;
                    });
                }
                else if (res?.payload?.StatusCode === 201) {
                    setVerificationStep(3);
                }
                break;
            }
            default: {
                break;
            }
        }
        setShowLoader(false);
    }

    const removeValue = async () => {
        const response = await dispatch(deleteAuthorization2FA(deleteValue));
        if (response?.payload?.StatusCode === 201) {
            await dispatch(getTwoFactorAuthValues(variant === 'emailTFA' ? 1 : 2));
        }
        else {
            setVerificationError({ Number: t('common.ErrorOccured') })
        }
        setShowConfirmDelete(false);
    }

    const renderVerificationText = () => {
        switch (accountSettings?.Account?.ReferrerID) {
            case 4:
            case '4': {
                return <Typography variant='body1'>{RenderHtml(t('SimplyClub.contactUs'))}</Typography>
            }
            default: {
                return <Typography variant='body1'>{RenderHtml(t('campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs'))}</Typography>
            }
        }
    }

    const EMAIL_MODULE = () => {
        const EMAIL_SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)}
                style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        {/* <Box pb={1} className={classes.textCenter}> */}
                        {/* <Typography style={{ fontWeight: 700, padding: '0 0 10px 0', color: '#0a74a9' }} variant="h4">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupTitle')}
                        </Typography> */}
                        <Typography style={{ fontSize: 15, color: '#000' }} variant="body1">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupDesc1')}
                        </Typography>
                        <Typography style={{ fontSize: 15, color: '#000' }} variant="body1">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupDesc2')}
                        </Typography>
                        <Divider />
                    </Box>
                    <Box style={{ position: 'relative', height: 'calc(100% - 80px)', display: 'flex', flexDirection: 'column' }} >
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} className={classes.pb15}>
                            <Typography className={clsx(classes.bold)} variant='h6'>{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails')} </Typography>
                            <Button
                                style={{ height: 35 }}
                                className={clsx(
                                    classes.btn, classes.btnRounded
                                )}
                                onClick={() => {
                                    setSelectedVerificationContact('')
                                    setVerificationError({ Number: '' })
                                    NextSlide()
                                }}
                            >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.addNewToVerify')}</Button>
                        </Box>
                        <Box className={clsx('contactDataBox', classes.sidebar)}>
                            {
                                verifiedEmails.map((obj, idx) => (
                                    <>
                                        <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')} style={{ justifyContent: 'space-between', alignItems: 'center', height: 40 }}>
                                            <Box style={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar className={obj.IsOptIn ? classes.checkIcon : classes.redIcon}>
                                                    <div className={clsx(classes.avatarIcon)} style={{ paddingTop: 4 }}>
                                                        {obj.IsOptIn ? '\uE134' : '\uE0A7'}
                                                    </div>
                                                </Avatar>
                                                <Typography className='emailText' title={obj.Number} style={{ fontSize: 16 }}>{obj.Number} </Typography>
                                            </Box>
                                            {!obj.IsOptIn && <Typography className={clsx(classes.link, 'emailVerLink')}
                                                onClick={() => {
                                                    setSelectedVerificationContact(obj.Number);
                                                    setVerificationError({ Number: '' })
                                                    NextSlide()
                                                    setAuthorizedTypeDisabled(true);
                                                }}
                                            >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifyEmailAddr')}</Typography>}
                                        </Box>
                                        {idx < verifiedEmails.length - 1 && <Divider style={{ marginBottom: 6 }} />}
                                    </>
                                ))
                            }
                        </Box>
                    </Box>
                </Box>
            </Box >
        )
        const EMAIL_SLIDE_2 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide secondSlide' >
                    <Box className='titleDescBox' >
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title')}</Typography>
                        <Box className='desc'>
                            <Typography variant='body1' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc1')}</Typography>
                            <Typography variant='body1' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc2')}</Typography>
                        </Box>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={selectedVerificationContact}
                                inputProps={{
                                    disabled: authorizedTypeDisabled,
                                    className: classes.textColorBlue
                                }}
                                onChange={(e) => {
                                    !!verificationError?.email && setVerificationError({ email: '' })
                                    setSelectedVerificationContact(e.target.value?.trim())
                                }}
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter, classes.p10)}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                                error={!!verificationError?.Number}
                                style={{ direction: 'ltr' }}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.btn, classes.btnRounded)}
                                onClick={() => {
                                    if (selectedVerificationContact) {
                                        if (selectedVerificationContact.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/)) {
                                            handleSendCode(selectedVerificationContact);
                                            NextSlide();
                                        }
                                        else {
                                            setVerificationError({ Number: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error1') })
                                        }
                                    }
                                    else
                                        setVerificationError({ Number: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error2') })
                                }}
                            >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.btnText')}</Button>
                            <Typography className='error' variant="body1">{verificationError?.Number}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')}</Typography>
                        {renderVerificationText()}
                    </Box>
                </Box>
            </Box>
        )
        const EMAIL_SLIDE_3 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4' className={classes.bold}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1')}</Typography>
                        <Typography variant='body1' mt={1}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2')}</Typography>
                    </Box>
                    <Box className={clsx(classes.flexColumn, classes.mt20)}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value.trim())) {
                                        setVerificationCode(e.target.value.trim())
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button
                                className={clsx(classes.btn, classes.btnRounded, userCodeConfirmed ? classes.disabled : null)}
                                onClick={() => {
                                    if (verificationCode) {
                                        handleVerifyCode();
                                    }
                                    else {
                                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2') })
                                    }
                                }}
                            >
                                {userCodeConfirmed ? <CircularProgress size={31} style={{ color: '#FFF' }} /> : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && resendInterval !== 0 && resendInterval !== 10 && <span>{resendInterval}</span>}</Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )
        const EMAIL_SLIDE_SUCCESS = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.title')}</Typography>
                        <Typography variant='body1' className={clsx(classes.mt4, classes.mb15)}>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.desc')} </Typography>
                        <Button className={clsx(classes.btn, classes.btnRounded, classes.mt6)} onClick={() => {
                            handleClose()
                        }}>{props.textButtonOnSuccess && props.textButtonOnSuccess !== '' ? props.textButtonOnSuccess : t('campaigns.newsLetterMgmt.emailVerification.successSlide.btnTxt')}</Button>
                    </Box>
                </Box>
            </Box >
        )

        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[verificationStep]}rem`, transition: 'height .5s' }}>
                {EMAIL_SLIDE_1()}
                {EMAIL_SLIDE_2()}
                {EMAIL_SLIDE_3()}
                {EMAIL_SLIDE_SUCCESS()}
            </Box>
        )
    }
    const SMS_MODULE = () => {
        const SMS_SLIDE_HEIGHTS = [42, 22, 22, 20, 20];
        const slideTransform = (step) => ({ transform: `translate(${isRTL ? (step * 100) : -(step * 100)}%)` });
        const SMS_SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer, classes.posRelative)}
                style={slideTransform(verificationStep)}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        <Typography variant="body1">
                            {t('sms.verificationBody')} <b>{t('sms.oneTimeProcess')}</b>{' '}{t('sms.foreachSubmission')}
                        </Typography>
                        <Typography className={clsx(classes.mt15, classes.mb15, classes.verNote)}>
                            {t('sms.verificationNote')}
                        </Typography>
                        <Divider />
                    </Box>
                    <Box className={clsx(classes.spaceBetween, classes.alignItemsCenter, classes.mb15)}>
                        <Typography className={clsx(classes.bold)} variant='h6'>{t('sms.numbersInAccount')}</Typography>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded, classes.marginSides5)}
                            onClick={() => {
                                setSelectedVerificationContact('');
                                setVerificationError({ Number: '' });
                                setAuthorizedTypeDisabled(false);
                                NextSlide();
                            }}
                        >{t('sms.verifySenderButton')}</Button>
                    </Box>
                    <Box className={clsx('contactDataBox', classes.sidebar, classes.verNumListBox)}>
                        {verifiedNumbers.filter(obj => isIsraeliPhoneNumber(obj.Number)).map((obj, idx) => (
                            <React.Fragment key={`verificationNumber${obj.ID}`}>
                                <Box className={clsx(classes.flex, classes.hAuto, 'emailBox', classes.verNumRow)}>
                                    <Box className={clsx(classes.dFlex, classes.alignItemsCenter)}>
                                        <Avatar className={obj.IsOptIn ? classes.checkIcon : classes.redIcon}>
                                            <div className={clsx(classes.avatarIcon, classes.verAvatarIcon)}>
                                                {obj.IsOptIn ? '\uE134' : '\uE0A7'}
                                            </div>
                                        </Avatar>
                                        <Typography className='emailText'>{obj.Number}</Typography>
                                    </Box>
                                    {showSelect && obj.IsOptIn && (
                                        <Button
                                            className={clsx(classes.btn, classes.btnRounded, classes.marginSides5)}
                                            classes={{ label: classes.btnLabel12 }}
                                            size="small"
                                            onClick={() => {
                                                onSenderSelect?.({ SenderName: obj.Number, Status: 0 });
                                                handleClose();
                                            }}
                                        >{t('common.select')}</Button>
                                    )}
                                    {!obj.IsOptIn && (
                                        <Typography
                                            className={clsx(classes.link, 'emailVerLink')}
                                            onClick={() => {
                                                setSelectedVerificationContact(obj.Number);
                                                setVerificationError({ Number: '' });
                                                NextSlide();
                                                setAuthorizedTypeDisabled(true);
                                            }}
                                        >{t('sms.verifyNumber')}</Typography>
                                    )}
                                </Box>
                            </React.Fragment>
                        ))}
                    </Box>

                    <Divider className={classes.verSectionDivider} />

                    <Box className={clsx(classes.spaceBetween, classes.alignItemsCenter, classes.mb15)}>
                        <Typography className={clsx(classes.bold)} variant='h6'>{t('sms.senderNamesInAccount')}</Typography>
                    </Box>
                    <Box className={classes.senderTableHeader}>
                        <Typography className={clsx(classes.flex2, classes.tableColHeader)}>{t('sms.colSenderName')}</Typography>
                        <Typography className={clsx(classes.flex2, classes.tableColHeader)}>{t('sms.colSubmitted')}</Typography>
                        <Typography className={clsx(classes.tableColHeader)} style={{ flex: 1 }}>{t('sms.colStatus')}</Typography>
                        {showSelect && <Typography className={clsx(classes.tableColHeader)} style={{ flex: 1 }}>{t('sms.colAction')}</Typography>}
                    </Box>
                    <Box className={clsx(classes.sidebar, classes.senderNamesListBox)}>
                        {senderNames.map((sender) => {
                            const statusDot   = sender.Status === 0 ? '#4caf50' : sender.Status === 1 ? '#ff9800' : '#f44336';
                            const statusBg    = sender.Status === 0 ? '#e8f5e9' : sender.Status === 1 ? '#fff8e1' : '#fdecea';
                            const statusText  = sender.Status === 0 ? '#388e3c' : sender.Status === 1 ? '#f57c00' : '#c62828';
                            const statusLabel = sender.Status === 0 ? t('common.approved') : sender.Status === 1 ? t('common.Pending') : t('sms.statusRejected');
                            return (
                                <Box key={sender.ID} className={classes.senderTableRow}>
                                    <Typography className={clsx(classes.flex2, classes.senderNameCell)}>{sender.SenderName}</Typography>
                                    <Typography className={clsx(classes.flex2, classes.senderDateCell)}>
                                        {sender.RequestDate
                                            ? new Date(sender.RequestDate).toLocaleDateString('en-GB')
                                            : ''}
                                    </Typography>
                                    <Box className={classes.statusCell}>
                                        <Box className={classes.statusChip} style={{ background: statusBg, color: statusText }}>
                                            <Box className={classes.statusDotIndicator} style={{ background: statusDot }} />
                                            {statusLabel}
                                        </Box>
                                    </Box>
                                    {showSelect && (
                                        <Box className={classes.senderActionCell}>
                                            {sender.Status === 0 && (
                                                <Button
                                                    className={clsx(classes.btn, classes.btnRounded)}
                                                    classes={{ label: classes.btnLabel12 }}
                                                    size="small"
                                                    onClick={() => {
                                                        onSenderSelect?.({ SenderName: sender.SenderName, Status: 0 });
                                                        handleClose();
                                                    }}
                                                >{t('common.select')}</Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_2 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={slideTransform(verificationStep)}>
                <Box className='cFlexSlide secondSlide'>
                    <Box className='titleDescBox'>
                        <Typography variant='h4'>{t('sms.shortVerificationTitle')}</Typography>
                        <Box className='desc'>
                            <Typography variant='body1'>{t('sms.verificationBody')} <b>{t('sms.oneTimeProcess')}</b>{t('sms.foreachSubmission')}</Typography>
                        </Box>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={selectedVerificationContact}
                                inputProps={{
                                    disabled: authorizedTypeDisabled,
                                    className: classes.textColorBlue
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Only allow English letters, digits, +, -, and spaces
                                    if (val && !/^[a-zA-Z0-9+\-\s]*$/.test(val)) {
                                        setVerificationError({ Number: t('sms.onlyEnglishChars') });
                                        return;
                                    }
                                    const isNumeric = /^[0-9+\-\s]*$/.test(val);
                                    const startsWith972 = /^\+?972/.test(val.trim());
                                    if (!startsWith972 && val.length > 11) {
                                        setVerificationError({ Number: isNumeric ? t("mainReport.campaignFromNumberMaxLength") : t("mainReport.campaignFromMaxLength") });
                                    } else {
                                        !!verificationError?.Number && setVerificationError({ Number: '' });
                                    }
                                    setSelectedVerificationContact(val.trim());
                                }}
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter, classes.directionLTR)}
                                placeholder={t('sms.newSenderPlaceholder')}
                                error={!!verificationError?.Number}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button
                                className={clsx(classes.btn, classes.btnRounded)}
                                onClick={async () => {
                                    if (!selectedVerificationContact) {
                                        setVerificationError({ Number: t('sms.newSenderRequired') });
                                        return;
                                    }
                                    const isNumeric = /^[0-9+\-\s]*$/.test(selectedVerificationContact);
                                    const startsWith972 = /^\+?972/.test(selectedVerificationContact.trim());
                                    if (!startsWith972 && selectedVerificationContact.length > 11) {
                                        setVerificationError({ Number: isNumeric ? t("mainReport.campaignFromNumberMaxLength") : t("mainReport.campaignFromMaxLength") });
                                        return;
                                    }
                                    const normalized = selectedVerificationContact.replace(/-/g, '');
                                    if (isIsraeliPhoneNumber(normalized)) {
                                        setSelectedVerificationContact(normalized);
                                        handleSendCode(normalized);
                                    } else {
                                        handleSubmitAlphabeticalSender();
                                    }
                                }}
                            >{t('sms.submitSender')}</Button>
                            <Typography className='error' variant="body1">{verificationError?.Number}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')}</Typography>
                        {renderVerificationText()}
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_3 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={slideTransform(verificationStep)}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4' className={classes.bold}>{t('common.Sent')}</Typography>
                        <Typography variant='body1' className={classes.mt4}> {t('sms.verificationSentToNumber')}{selectedVerificationContact}</Typography>
                        <Typography variant='body1' mt={1}> {t('sms.pleaseNoteCode')}</Typography>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                className={clsx(classes.textField, classes.maxWidth400)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' });
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value.trim())) {
                                        setVerificationCode(e.target.value.trim());
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button
                                className={clsx(classes.btn, classes.btnRounded, userCodeConfirmed ? classes.disabled : null)}
                                onClick={() => {
                                    if (verificationCode) {
                                        handleVerifyCode();
                                    } 
                                    else {
                                        setVerificationError({ code: t('sms.verificationCodeError') });
                                    }
                                }}
                            >
                                {userCodeConfirmed ? <CircularProgress size={31} className={classes.colorWhite} /> : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && resendInterval !== 0 && resendInterval !== 10 && <span>{resendInterval}</span>}</Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )
        const SMS_SLIDE_SUCCESS = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={slideTransform(verificationStep)}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('sms.verificationSuccessful')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('sms.verificationSuccessMessage')}</Typography>
                        <Button className={clsx(classes.btn, classes.btnRounded)} onClick={() => {
                            onSenderSelect?.({ SenderName: selectedVerificationContact, Status: 0 });
                            handleClose();
                        }}>{props.textButtonOnSuccess && props.textButtonOnSuccess !== '' ? props.textButtonOnSuccess : t('common.continue')}</Button>
                    </Box>
                </Box>
            </Box>
        )
        const SMS_SLIDE_PENDING = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={slideTransform(verificationStep)}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('sms.senderPendingApprovalTitle')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('sms.senderPendingApproval')}</Typography>
                    </Box>
                    <Box mt={2}>
                        <Button className={clsx(classes.btn, classes.btnRounded)} onClick={() => handleClose()}>
                            {t('sms.doneSender')}
                        </Button>
                    </Box>
                </Box>
            </Box>
        )

        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar, classes.verCarouselContainer)}
                style={{ height: `${SMS_SLIDE_HEIGHTS[verificationStep]}rem` }}>
                {SMS_SLIDE_1()}
                {SMS_SLIDE_2()}
                {SMS_SLIDE_3()}
                {SMS_SLIDE_SUCCESS()}
                {SMS_SLIDE_PENDING()}
            </Box>
        )

    }
    const SMS_TFA_MODULE = () => {
        const SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        <Typography style={{ fontSize: 15, color: '#000' }} variant="body1">
                            {RenderHtml(t('settings.accountSettings.2fa.cellphone.firstSlide.descirption'))}
                        </Typography>
                        <Divider style={{ marginTop: 15 }} />
                    </Box>
                    <Box style={{ position: 'relative', height: 'calc(100% - 80px)', display: 'flex', flexDirection: 'column' }} >
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} className={classes.pb15}>
                            <Typography className={clsx(classes.bold)} variant='h6'>{t('sms.numbersAccount')} </Typography>
                            <Button
                                className={clsx(
                                    classes.btn, classes.btnRounded
                                )}
                                onClick={() => {
                                    setSelectedVerificationContact('')
                                    setVerificationError({ Number: '' })
                                    NextSlide()
                                }}
                            >{t('sms.verifyAnotherNumber')}</Button>
                        </Box>
                        <Box className={clsx('contactDataBox', classes.sidebar)}>
                            {
                                twoFactorAuthNumbers.map((obj, idx) => (
                                    <>
                                        <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')} style={{ justifyContent: 'space-between', alignItems: 'center', height: 40 }} key={`verificationNumber${obj.ID}`}>
                                            <Typography className='emailText'>{obj.AuthValue} </Typography>
                                            {idx > 0 && <Button
                                                onClick={() => {
                                                    setShowConfirmDelete(true);
                                                    setDeleteValue(obj.AuthValue)
                                                }
                                                }
                                                className={clsx(classes.f14)}
                                                style={{
                                                    textTransform: 'capitalize',
                                                    paddingTop: 0,
                                                    paddingBottom: 0
                                                }}
                                            >{t("common.remove")}</Button>
                                            }
                                        </Box>
                                        {idx < twoFactorAuthNumbers.length - 1 && <Divider style={{ marginBottom: 6 }} />}
                                    </>
                                ))
                            }
                        </Box>
                    </Box>
                </Box>
            </Box>
        )

        const SLIDE_2 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide secondSlide' >
                    <Box className='titleDescBox'>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title')}</Typography>
                        <Box className='desc'>
                            <Typography style={{ fontSize: 16, color: '#000' }} variant="body1">
                                {RenderHtml(t('settings.accountSettings.2fa.cellphone.firstSlide.descirption'))}
                            </Typography>
                        </Box>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={selectedVerificationContact}
                                inputProps={{
                                    disabled: authorizedTypeDisabled,
                                    className: classes.textColorBlue
                                }}
                                onChange={(e) => {
                                    !!verificationError?.number && setVerificationError({ number: '' })
                                    if (!e.target.value || IsValidPhoneNumberKeyPress(e.target.value)) {
                                        setSelectedVerificationContact(e.target.value?.trim())
                                    }
                                }}
                                style={{ direction: 'ltr' }}
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter)}
                                placeholder={t('sms.enterNumberText')}
                                error={!!verificationError?.Number}
                                onKeyPress={isGlobal ? IsValidPhoneNumberKeyPress : null}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.btn, classes.btnRounded)}
                                onClick={() => {
                                    if (isGlobal ? IsValidPhoneNumberWithCountryCode(selectedVerificationContact, countryCodeList) : IsValidNonGlobalPhoneNumber(selectedVerificationContact)) {
                                        const cellphoneAuth = verifiedNumbers.find((v) => { return v?.Number === selectedVerificationContact });

                                        if (cellphoneAuth?.IsOptIn) {
                                            setAddToFromNumberToSend(true);
                                            addTwoFactorValue(true, 2).then((res) => {
                                                setVerificationStep(verificationStep + 2);
                                            })
                                        }
                                        else {
                                            handleSendCode(selectedVerificationContact);
                                            NextSlide();
                                        }
                                    }
                                    else
                                        setVerificationError({ Number: t('sms.invalidNumber') })
                                }}
                            >{t('sms.verificationButtonText')}</Button>
                            <Typography className='error' variant="body1">{verificationError?.Number}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')}</Typography>
                        {renderVerificationText()}
                    </Box>
                </Box>
            </Box>
        )

        const SLIDE_3 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4' className={classes.bold}>{t('common.Sent')}</Typography>
                        <Typography variant='body1' className={classes.mt4}> {t('sms.verificationSentToNumber')}{selectedVerificationContact}</Typography>
                        <Typography variant='body1' mt={1}> {t('sms.pleaseNoteCode')}</Typography>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value.trim())) {
                                        setVerificationCode(e.target.value.trim())
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button
                                className={clsx(classes.btn, classes.btnRounded, userCodeConfirmed ? classes.disabled : null)}
                                onClick={() => {
                                    if (verificationCode) {
                                        handleVerifyCode();
                                    }
                                    else {
                                        setVerificationError({ code: t('sms.verificationCodeError') })
                                    }
                                }}
                            >
                                {userCodeConfirmed ? <CircularProgress size={31} style={{ color: '#FFF' }} /> : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && resendInterval !== 0 && resendInterval !== 10 && <span>{resendInterval}</span>}</Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )
        const SLIDE_SUCCESS = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('sms.verificationSuccessful')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('settings.accountSettings.2fa.cellphone.successSlide.title')}</Typography>
                        <Box>
                            <FormControlLabel
                                label={t("settings.accountSettings.2fa.addToFromNumberToSend")}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={addToFromNumberToSend}
                                        onClick={() => {
                                            setAddToFromNumberToSend(!addToFromNumberToSend)
                                        }}
                                    />
                                }
                            />
                        </Box>
                        <Button className={clsx(classes.btn, classes.btnRounded)} onClick={() => {
                            handleClose()
                        }}>{t('common.continue')}</Button>
                    </Box>
                </Box>
            </Box >
        )
        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[verificationStep]}rem`, transition: 'height .5s' }}>
                {SLIDE_1()}
                {SLIDE_2()}
                {SLIDE_3()}
                {SLIDE_SUCCESS()}
            </Box>
        )

    }
    const EMAIL_TFA_MODULE = () => {
        const SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        <Typography style={{ fontSize: 15, color: '#000' }} variant="body1">
                            {RenderHtml(t('settings.accountSettings.2fa.email.firstSlide.descirption'))}
                        </Typography>
                        <Divider style={{ marginTop: 15 }} />
                    </Box>
                    <Box style={{ position: 'relative', height: 'calc(100% - 80px)', display: 'flex', flexDirection: 'column' }} >
                        <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} classes={classes.pb15}>
                            <Typography className={clsx(classes.bold)} variant='h6'>{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails')} </Typography>
                            <Button
                                className={clsx(
                                    classes.btn, classes.btnRounded
                                )}
                                onClick={() => {
                                    setSelectedVerificationContact('')
                                    setVerificationError({ Number: '' })
                                    NextSlide()
                                }}
                            >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.addNewToVerify')}</Button>
                        </Box>
                        <Box className={clsx('contactDataBox', classes.sidebar)} style={{ paddingTop: 15 }}>
                            {
                                twoFactorAuthEmails.map((obj, idx) => {
                                    return (
                                        <>
                                            <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')} style={{ justifyContent: 'space-between', alignItems: 'center', height: 40 }}>
                                                <Typography className='emailText' title={obj.Number} style={{ fontSize: 16 }}>{obj.AuthValue} </Typography>
                                                {idx > 0 && <Button
                                                    onClick={() => {
                                                        setShowConfirmDelete(true);
                                                        setDeleteValue(obj.AuthValue);
                                                    }}
                                                    className={clsx(classes.f14)}
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        paddingTop: 0,
                                                        paddingBottom: 0
                                                    }}
                                                >{t("common.remove")}</Button>
                                                }
                                            </Box>
                                            {idx < twoFactorAuthEmails.length - 1 && <Divider style={{ marginBottom: 6 }} />}
                                        </>
                                    )
                                })
                            }
                        </Box>
                    </Box>
                </Box>
            </Box >
        )
        const SLIDE_2 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide secondSlide' >
                    <Box className='titleDescBox'>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title')}</Typography>
                        <Box className='desc'>
                            <Typography variant='body1' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc1')}</Typography>
                            <Typography variant='body1' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc2')}</Typography>
                        </Box>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={selectedVerificationContact}
                                inputProps={{
                                    disabled: authorizedTypeDisabled,
                                    className: classes.textColorBlue
                                }}
                                onChange={(e) => {
                                    !!verificationError?.email && setVerificationError({ email: '' })
                                    setSelectedVerificationContact(e.target.value?.trim())
                                }}
                                style={{ direction: 'ltr' }}
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter, classes.p10)}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                                error={!!verificationError?.Number}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.btn, classes.btnRounded)}
                                onClick={() => {
                                    if (selectedVerificationContact) {
                                        const emailAuth = verifiedEmails.find((v) => { return v?.Number === selectedVerificationContact });

                                        if (emailAuth?.IsOptIn) {
                                            setAddToFromEmailToSend(true);
                                            addTwoFactorValue(true, 1).then((res) => {
                                                console.log(res);
                                                setVerificationStep(verificationStep + 2);
                                            })
                                        }
                                        else {
                                            if (selectedVerificationContact.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/)) {
                                                handleSendCode(selectedVerificationContact)
                                                NextSlide()
                                            }
                                            else {
                                                setVerificationError({ Number: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error1') })
                                            }
                                        }
                                    }
                                    else
                                        setVerificationError({ Number: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error2') })
                                }}
                            >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.btnText')}</Button>
                            <Typography className='error' variant="body1">{verificationError?.Number}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')}</Typography>
                        {renderVerificationText()}
                    </Box>
                </Box>
            </Box>
        )
        const SLIDE_3 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4' className={classes.bold}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1')}</Typography>
                        <Typography variant='body1' mt={1}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2')}</Typography>
                    </Box>
                    <Box className={clsx(classes.flexColumn, classes.mt20)}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value.trim())) {
                                        setVerificationCode(e.target.value.trim())
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button
                                className={clsx(classes.btn, classes.btnRounded, userCodeConfirmed ? classes.disabled : null)}
                                onClick={() => {
                                    if (verificationCode) {
                                        handleVerifyCode();
                                    }
                                    else {
                                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2') })
                                    }
                                }}
                            >
                                {userCodeConfirmed ? <CircularProgress size={31} style={{ color: '#FFF' }} /> : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && resendInterval !== 0 && resendInterval !== 10 && <span>{resendInterval}</span>}</Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )
        const SLIDE_SUCCESS = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.title')}</Typography>
                        <Typography variant='body1' className={clsx(classes.mt4, classes.mb15)}>{t('settings.accountSettings.2fa.email.successSlide.title')} </Typography>
                        <Box>
                            <FormControlLabel
                                label={t("settings.accountSettings.2fa.addToFromEmailToSend")}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={addToFromEmailToSend}
                                        onClick={() => {
                                            setAddToFromEmailToSend(!addToFromEmailToSend)
                                        }}
                                    />
                                }
                            />
                        </Box>
                        <Button className={clsx(classes.btn, classes.btnRounded, classes.mt6)} onClick={() => {
                            handleClose()
                        }}>{t('common.continue')}</Button>
                    </Box>
                </Box>
            </Box >
        )

        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[verificationStep]}rem`, transition: 'height .5s' }}>
                {SLIDE_1()}
                {SLIDE_2()}
                {SLIDE_3()}
                {SLIDE_SUCCESS()}
            </Box>
        )
    }

    const getTitle = () => {
        switch (variant) {
            case 'email':
                return t('campaigns.newsLetterMgmt.emailVerification.popupTitle');
            case 'sms':
                return t('sms.verifySenderTitle');
            case 'emailTFA':
                return t('settings.accountSettings.2fa.email.firstSlide.title');
            case 'smsTFA':
                return t('settings.accountSettings.2fa.cellphone.firstSlide.title');
            default:
                break;
        }
    }

    const Popup = (data = '') => ({
        title: getTitle(),
        content: (<>
            {variant === 'email' && EMAIL_MODULE()}
            {variant === 'sms' && SMS_MODULE()}
            {variant === 'emailTFA' && EMAIL_TFA_MODULE()}
            {variant === 'smsTFA' && SMS_TFA_MODULE()}
        </>

        ),
        renderButtons: () => {
            return (
                <Box className={classes.textCenter}>
                    {verificationStep < 1 && (<Button
                        name="btnConfirm"
                        variant='contained'
                        size='medium'
                        onClick={() => {
                            handleClose()
                        }}
                        className={clsx(
                            classes.btn, classes.btnRounded,
                            classes.ml5
                        )}>
                        {t('common.Ok')}
                    </Button>)}

                    {(verificationStep > 0 && verificationStep < 3) && <Button
                        name="btnConfirm"
                        variant='contained'
                        size='medium'
                        onClick={PrevSlide}
                        className={clsx(classes.btn, classes.btnRounded)}>
                        {t('notifications.back')}
                    </Button>}
                </Box>
            );
        }
    })

    return (
        <>
            <BaseDialog
                classes={classes}
                contentStyle={classes.maxWidth900}
                open={showConfirmDelete}
                onClose={() => {
                    setDeleteValue(null);
                    setShowConfirmDelete(false);
                }}
                onCancel={() => {
                    setDeleteValue(null);
                    setShowConfirmDelete(false);
                }}
                onConfirm={removeValue}
                title={t('settings.accountSettings.2fa.deleteValueTitle')}
            >
                {t("settings.accountSettings.2fa.deleteValueDescription")}
            </BaseDialog>
            <BaseDialog
                classes={classes}
                contentStyle={classes.maxWidth900}
                open={isOpen}
                onClose={handleClose}
                onCancel={handleClose}
                renderButtons={Popup().renderButtons || null}
                {...Popup()}>
                {Popup().content}
                <Loader isOpen={showLoader} />
            </BaseDialog>
        </>
    )
}

export default VerificationDialog