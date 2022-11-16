import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Typography, Button, TextField, Box, Divider, Avatar } from '@material-ui/core'
import { Dialog } from '../../components/managment/index'
import 'moment/locale/he'
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { newAuthorizeEmail, verifyEmailCode } from '../../redux/reducers/commonSlice';
import { getAuthorizedEmails } from '../../redux/reducers/commonSlice'
import { MdOutlineMarkEmailRead } from 'react-icons/md';
import {
    getAuthorizeNumbers, sendVerificationCode, verifyCode
} from '../../redux/reducers/smsSlice'
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';


const VerificationDialog = ({ classes, isOpen = false, onClose = () => null, variant = 'email', ...props }) => {
    const dispatch = useDispatch();
    const { isRTL } = useSelector(state => state.core);
    const { username } = useSelector(state => state.user)
    const { verifiedEmails, verifiedNumbers } = useSelector(state => state.common);
    const { t } = useTranslation();
    const [verificationStep, setVerificationStep] = useState(0)
    const [verificationError, setVerificationError] = useState(null)
    const [selectedVerificationContact, setSelectedVerificationContact] = useState('')
    const [codeResend, setCodeResend] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [authorizedTypeDisabled, setAuthorizedTypeDisabled] = useState(false);
    const [resendDisabled, setResendDisalbed] = useState(false);
    const [resendInterval, setResendInterval] = useState(10);


    let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0
    const SLIDE_HEIGHTS = [25, 20, 20, 20, 20]

    useEffect(() => {
        variant === 'email' && dispatch(getAuthorizedEmails());
        if (variant === 'sms') {

            const handleVerificationDialog = async () => {
                await dispatch(getAuthorizeNumbers());
            }
            handleVerificationDialog()
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
        callback?.()
        onClose?.()
        verificationStep && setVerificationStep(0)
        verificationError && setVerificationError(null)
        selectedVerificationContact && setSelectedVerificationContact('');
        verificationCode && setVerificationCode('')
        if (localStorage.getItem('verificationTrial')) localStorage.removeItem('verificationTrial')
        setAuthorizedTypeDisabled(false);
        variant === 'email' && dispatch(getAuthorizedEmails());
        variant === 'sms' && dispatch(getAuthorizeNumbers());
    }

    const handleVerifyCode = async () => {

        if (variant === 'email') {
            dispatch(verifyEmailCode(
                {
                    email: selectedVerificationContact,
                    optinCode: verificationCode
                })).then((response) => {
                    switch (response?.payload.toLowerCase()) {
                        case "ok": {
                            NextSlide();
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
                        default: {
                            setVerificationError({ code: t('common.ErrorOccured') })
                            break;
                        }
                    }
                })
        }

        if (variant === 'sms') {
            const result = await dispatch(verifyCode({
                optinCode: verificationCode,
                phoneNumber: selectedVerificationContact
            }));
            switch (result.payload.toLowerCase()) {
                case 'ok': {
                    NextSlide();
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
                default: {
                    setVerificationError({ code: t('common.ErrorOccured') })
                    break;
                }
            }
        }
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

    const handleSendCode = (val, isResend = false) => {
        setResendDisalbed(isResend);
        variant === 'email' && dispatch(newAuthorizeEmail({ email: val })).then((result) => {
            setCodeResend(isResend);
            return result?.payload;
        });
        variant === 'sms' && dispatch(sendVerificationCode({ username, number: val })).then((result) => {
            setCodeResend(isResend);
            return result?.payload;
        });
    }

    const EMAIL_MODULE = () => {
        let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0

        const EMAIL_SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        {/* <Box pb={1} className={classes.textCenter}> */}
                        <Typography style={{ fontWeight: 700, padding: '0 0 10px 0', color: '#0a74a9' }} variant="h4">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupTitle')}
                        </Typography>
                        <Typography style={{ fontSize: 14, color: '#000' }} variant="body1">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupDesc1')}
                        </Typography>
                        <Typography style={{ fontSize: 14, color: '#000' }} variant="body1">
                            {t('campaigns.newsLetterMgmt.emailVerification.popupDesc2')}
                        </Typography>
                        <Divider />
                    </Box>
                    <Box style={{ position: 'relative', height: '70%' }} >
                        <Typography className={clsx(classes.pb25, classes.bold)} variant='h6'>{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails')} </Typography>
                        <Box className={clsx('contactDataBox', classes.sidebar)}>
                            {
                                verifiedEmails.map((obj) => (
                                    <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')}>
                                        <Avatar className={obj.IsOptIn ? classes.checkIcon : classes.redIcon}>
                                            <div className={clsx(classes.avatarIcon)}>
                                                {obj.IsOptIn ? '\uE134' : '\uE0A7'}
                                            </div>
                                        </Avatar>
                                        <Typography className='emailText' title={obj.Number}>{obj.Number} </Typography>
                                        {!obj.IsOptIn && <Typography className={clsx(classes.link, 'emailVerLink')}
                                            onClick={() => {
                                                setSelectedVerificationContact(obj.Number);
                                                setVerificationError({ Number: '' })
                                                NextSlide()
                                                setAuthorizedTypeDisabled(true);
                                            }}
                                        >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifyEmailAddr')}</Typography>}
                                    </Box>
                                ))
                            }
                        </Box>
                        <Button className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue,
                            isRTL ? 'btnVerifyNewRtl' : 'btnVerifyNewLtr'
                        )}
                            onClick={() => {
                                setSelectedVerificationContact('')
                                setVerificationError({ Number: '' })
                                NextSlide()
                            }}
                        >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.addNewToVerify')}</Button>
                    </Box>
                </Box>
            </Box>
        )

        const EMAIL_SLIDE_2 = () => (
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
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter)}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                                error={!!verificationError?.Number}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonGreen)}
                                onClick={() => {
                                    if (selectedVerificationContact) {
                                        if (selectedVerificationContact.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                                            handleSendCode(selectedVerificationContact)
                                            NextSlide()
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
                        <Typography variant='body1'>{RenderHtml(t('campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs'))}</Typography>
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
                                className={clsx(classes.textField, classes.maxWidth400)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                                        setVerificationCode(e.target.value)
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonDarkBlue, classes.buttonMinWidth)}
                                onClick={() => {
                                    if (trials === 4) {
                                        return NextSlide();
                                    }
                                    if (verificationCode) {
                                        handleVerifyCode();
                                    }
                                    else {
                                        localStorage.setItem('verificationTrial', trials + 1)
                                        setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2') })
                                    }
                                }}
                            >
                                {t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>

                            {/* // <Button onClick={() => setEmailStatus(!emailStatus)}>Change Status</Button> */}
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && <span>{resendInterval}</span>}</Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const EMAIL_SLIDE_ERROR = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box mt={4}>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.desc')}</Typography>
                    </Box>

                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.contactSupport')}</Typography>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.phone')}: 035240290</Typography>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.email')}: support@pulseem.com</Typography>
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
                        <Button className={clsx(classes.actionButton, classes.actionButtonGreen, classes.buttonMinWidth, classes.mt6)} onClick={() => {
                            handleClose()
                        }}>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.btnTxt')}</Button>
                    </Box>
                </Box>
            </Box >
        )

        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[verificationStep]}rem`, transition: 'height .5s' }}>
                {EMAIL_SLIDE_1()}
                {EMAIL_SLIDE_2()}
                {EMAIL_SLIDE_3()}
                {(trials && trials >= 4) ? EMAIL_SLIDE_ERROR() : EMAIL_SLIDE_SUCCESS()}
            </Box>
        )
    }

    const SMS_MODULE = () => {
        let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0

        const SMS_SLIDE_1 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        <Typography style={{ fontWeight: 700, padding: '0 0 10px 0', color: '#0a74a9' }} variant="h4">
                            {t('sms.verificationDialogTitle')}
                        </Typography>
                        <Typography style={{ fontSize: 14, color: '#000' }} variant="body1">
                            {t('sms.verificationBody')} <b>{t('sms.oneTimeProcess')}</b>{' '}{t('sms.foreachSubmission')}
                        </Typography>
                        <Typography style={{ fontSize: 15, textDecoration: 'underline' }} className={classes.mt15}>
                            {t('sms.verificationNote')}
                        </Typography>
                        <Divider />
                    </Box>
                    <Box style={{ position: 'relative', height: '70%' }} >
                        <Typography className={clsx(classes.pb25, classes.bold)} variant='h6'>{t('sms.numbersAccount')} </Typography>
                        <Box className={clsx('contactDataBox', classes.sidebar)}>
                            {
                                (verifiedNumbers || verifiedEmails).map((obj) => (
                                    <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')} key={`verificationNumber${obj.ID}`}>
                                        <Avatar className={obj.IsOptIn ? classes.checkIcon : classes.redIcon}>
                                            <div className={clsx(classes.avatarIcon)}>
                                                {obj.IsOptIn ? '\uE134' : '\uE0A7'}
                                            </div>
                                        </Avatar>
                                        <Typography className='emailText'>{obj.Number} </Typography>
                                        {!obj.IsOptIn && <Typography className={clsx(classes.link, 'emailVerLink')}
                                            onClick={() => {
                                                setSelectedVerificationContact(obj.Number);
                                                setVerificationError({ Number: '' })
                                                NextSlide()
                                                setAuthorizedTypeDisabled(true);
                                            }}
                                        > {t('sms.verifyNumber')}</Typography>}
                                    </Box>
                                ))
                            }
                        </Box>
                        <Button className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue,
                            isRTL ? 'btnVerifyNewRtl' : 'btnVerifyNewLtr'
                        )}
                            onClick={() => {
                                setSelectedVerificationContact('')
                                setVerificationError({ Number: '' })
                                NextSlide()
                            }}
                        >{t('sms.verifyAnotherNumber')}</Button>
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_2 = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide secondSlide' >
                    <Box className='titleDescBox'>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title')}</Typography>
                        <Box className='desc'>
                            <Typography variant='body1' >{t('sms.verificationBody')} {' '}<b>{t('sms.oneTimeProcess')}</b>
                                {t('sms.foreachSubmission')}</Typography>
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
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                                        setSelectedVerificationContact(e.target.value?.trim())
                                    }
                                }}
                                className={clsx(classes.textField, classes.maxWidth400, classes.txtCenter)}
                                placeholder={t('sms.enterNumberText')}
                                error={!!verificationError?.Number}
                            // helperText={verificationError?.email}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonGreen)}
                                onClick={() => {
                                    if (selectedVerificationContact) {
                                        if (selectedVerificationContact.match(/^[0-9]+$/)) {
                                            handleSendCode(selectedVerificationContact)
                                            NextSlide()
                                        }
                                        else {
                                            setVerificationError({ Number: t('sms.numberError') })
                                        }
                                    }
                                    else
                                        setVerificationError({ Number: t('sms.numberError') })
                                }}
                            >{t('sms.verificationButtonText')}</Button>
                            <Typography className='error' variant="body1">{verificationError?.Number}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')}</Typography>
                        <Typography variant='body1'>{RenderHtml(t('campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs'))}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_3 = () => (
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
                                className={clsx(classes.textField, classes.maxWidth400)}
                                onChange={(e) => {
                                    !!verificationError?.code && setVerificationError({ code: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                                        setVerificationCode(e.target.value)
                                    }
                                }}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!verificationError?.code}
                                value={verificationCode}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonDarkBlue, classes.buttonMinWidth)}
                                onClick={() => {


                                    if (trials === 4) {
                                        return NextSlide();
                                    }

                                    if (verificationCode) {
                                        handleVerifyCode();
                                    }
                                    else {
                                        localStorage.setItem('verificationTrial', trials + 1)
                                        setVerificationError({ code: t('sms.verificationCodeError') })
                                    }
                                }}
                            >
                                {t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{verificationError?.code}</Typography>

                            {/* // <Button onClick={() => setEmailStatus(!emailStatus)}>Change Status</Button> */}
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={classes.link} onClick={() => handleSendCode(selectedVerificationContact, true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span></Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_ERROR = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box mt={4}>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.desc')}</Typography>
                    </Box>

                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.contactSupport')}</Typography>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.phone')}: 035240290</Typography>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.errorSlide.email')}: support@pulseem.com</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_SUCCESS = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('sms.verificationSuccessful')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('sms.verificationSuccessMessage')}</Typography>
                        <Button className={clsx(classes.actionButton, classes.actionButtonGreen, classes.mt15, classes.buttonMinWidth)} onClick={() => {
                            handleClose()
                        }}>{t('common.continue')}</Button>
                    </Box>
                </Box>
            </Box >
        )



        return (
            <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[verificationStep]}rem`, transition: 'height .5s' }}>
                {SMS_SLIDE_1()}
                {SMS_SLIDE_2()}
                {SMS_SLIDE_3()}
                {(trials && trials >= 4) ? SMS_SLIDE_ERROR() : SMS_SLIDE_SUCCESS()}
            </Box>
        )

    }

    const Popup = (data = '') => ({
        title: '',
        icon: (
            <div className={classes.dialogIconContent} >
                {variant == 'sms' && '\uE11B'}
                {variant == 'email' && <MdOutlineMarkEmailRead />}
            </div>
        ),
        content: (<>
            {variant === 'email' && EMAIL_MODULE()}
            {variant === 'sms' && SMS_MODULE()}
        </>

        ),
        renderButtons: () => (<Box className={classes.textCenter}>
            {verificationStep < 1 && (<Button
                name="btnConfirm"
                variant='contained'
                size='small'
                onClick={() => {
                    handleClose()
                }}
                className={clsx(
                    classes.dialogButton,
                    classes.dialogConfirmButton,
                    classes.ml5
                )}>
                {t('common.Ok')}
            </Button>)}

            {(verificationStep > 0 && verificationStep < 3) && <Button
                name="btnConfirm"
                variant='contained'
                size='small'
                onClick={PrevSlide}
                className={clsx(
                    classes.dialogButton,
                    classes.dialogConfirmButton,
                    classes.ml5
                )}>
                {t('notifications.back')}
            </Button>}
        </Box>)
    })

    return (
        <Dialog
            classes={classes}
            contentStyle={classes.maxWidth900}
            open={isOpen}
            onClose={handleClose}
            renderButtons={Popup().renderButtons || null}
            {...Popup()}>
            {Popup().content}
        </Dialog>
    )
}

export default VerificationDialog