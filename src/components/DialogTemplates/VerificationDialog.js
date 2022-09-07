import React, { useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { Typography, Button, TextField, Box, makeStyles, Divider, Avatar } from '@material-ui/core'
import { Dialog } from '../../components/managment/index'
import 'moment/locale/he'
import { RiCheckboxCircleFill, RiCloseCircleFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { newAuthorizeEmail, verifyEmailCode } from '../../redux/reducers/commonSlice';
import { getAuthorizedEmails } from '../../redux/reducers/commonSlice'
import { MdOutlineMarkEmailRead } from 'react-icons/md';
import {
    getAuthorizeNumbers, sendVerificationCode, verifyCode
} from '../../redux/reducers/smsSlice'

const useStyles = makeStyles({
    carouselContainer: {
        display: 'flex',
        flexWrap: 'nowrap',
        overflow: 'hidden'
    },
    carouselItem: {
        height: '20rem',
        minWidth: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    T05S: {
        transition: '.5s cubic-bezier(0.39, 0.575, 0.565, 1)'
    },
    T10S: {
        transition: '1s cubic-bezier(0.39, 0.575, 0.565, 1)'
    },
    hAuto: {
        height: 'auto !important'
    },
    contactDataBox: {
        overflowX: 'clip',
        overflowY: 'auto',
        height: '100%'
    },
    emailVerItemContainer: {
        '& .error': {
            marginTop: 20,
            color: 'red',
            height: 26
        },
        '& .success': {
            marginTop: 7,
            color: 'green',
            height: 26
        },
        '& .cSlide': {
            width: "100%",
            height: '100%',
            position: "relative",
            '&.firstSlide': {
                '& .emailBox': {
                    '& span': {
                        paddingInline: 2,
                        fontSize: 18,
                        marginTop: 2
                    },
                    '& .emailText': {
                        paddingInline: 4,
                        maxWidth: 250,
                        minWidth: 160
                    },
                    '& .emailVerLink': {
                        paddingInline: 3
                    }
                }
                ,
                '& .btnVerifyNewLtr': {
                    position: "absolute",
                    top: 0,
                    right: 10
                },
                '& .btnVerifyNewRTL': {
                    position: "absolute",
                    top: 0,
                    left: 0
                },
                '& .MuiDivider-root': {
                    marginTop: 6,
                    height: '1.3px',
                    backgroundColor: '#cdcdcd'
                }
            }
        },
        '& .cFlexSlide': {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: "100%",
            height: '100%',
            textAlign: 'center',
            '&.secondSlide': {
                '& .titleDescBox': {
                    '& .mt20': {
                        marginTop: 20
                    },
                    '& .desc': {
                        marginTop: 20,
                    }
                }
            }
        },
    }
})

const VerificationDialog = ({ classes, isOpen = false, onClose = () => null, variant = 'email', ...props }) => {
    const dispatch = useDispatch();
    const { isRTL } = useSelector(state => state.core);
    const { username } = useSelector(state => state.user)
    const compClasses = useStyles()
    const { verifiedEmails, verifiedNumbers } = useSelector(state => state.common);
    const { t } = useTranslation();
    const [verificationStep, setVerificationStep] = useState(0)
    const [verificationError, setVerificationError] = useState(null)
    const [selectedVerificationContact, setSelectedVerificationContact] = useState('')
    const [codeResend, setCodeResend] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')


    let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0

    useEffect(() => {
        variant === 'email' && dispatch(getAuthorizedEmails());
        if (variant === 'sms') {

            const handleVerificationDialog = async () => {
                const numbers = await dispatch(getAuthorizeNumbers());
                // setDialogType({
                //     type: 'verify',
                //     data: numbers.payload
                // })
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
        if (codeResend) {
            setCodeResend(false)
        }
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
    }

    const verifyCode = async () => {

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
                            localStorage.setItem('verificationTrial', trials + 1)
                            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired') })
                            break;
                        }
                        case "notmatch": {
                            localStorage.setItem('verificationTrial', trials + 1)
                            setVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match') })
                            break;
                        }
                        default: {
                            localStorage.setItem('verificationTrial', trials + 1)
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
            if (result.error || result.payload === 'NotMatch') {
                setVerificationError({ code: t('common.ErrorOccured') })
                localStorage.setItem('verificationTrial', trials + 1)
            } else {
                NextSlide();
            }
        }
    }

    const handleSendCode = (val) => {
        setCodeResend(false);
        variant === 'email' && dispatch(newAuthorizeEmail({ email: val })).then((result) => {
            if (result?.payload === true) {
                setCodeResend(true);
            }
            return result?.payload;
        });
        variant === 'sms' && dispatch(sendVerificationCode({ username, number: val }));
    }

    const EMAIL_MODULE = () => {
        let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0

        const EMAIL_SLIDE_1 = () => (
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
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
                    <Box style={{ position: 'relative', height: '90%' }} >
                        <Typography className={clsx(classes.pbt5, classes.bold)} variant='h6' >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails')} </Typography>
                        <Box className={clsx(compClasses.contactDataBox, classes.sidebar)}>
                            {
                                verifiedEmails.map((obj) => (
                                    <Box className={clsx(classes.flex, compClasses.hAuto, 'emailBox')}>
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
                                                handleSendCode(obj.Number);
                                            }}
                                        >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifyEmailAddr')}</Typography>}
                                    </Box>
                                ))
                            }
                        </Box>
                        <Button className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue,
                            'btnVerifyNewLtr'
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
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
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
                                onChange={(e) => {
                                    !!verificationError?.email && setVerificationError({ email: '' })
                                    setSelectedVerificationContact(e.target.value?.trim())
                                }}
                                className={clsx(classes.textField, classes.maxWidth400)}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                                error={!!verificationError?.Number}
                            // helperText={verificationError?.email}
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
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')} <span className={classes.link}>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs')}</span></Typography>
                        <Typography variant='body1'>{t('common.phone')} 03-5240290 / {t('common.email')} support@pulseem.com</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const EMAIL_SLIDE_3 = () => (
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1')}</Typography>
                        <Typography variant='body1' mt={1}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2')}</Typography>
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
                            <Button className={clsx(classes.actionButton, classes.actionButtonDarkBlue)}
                                onClick={() => {


                                    if (trials === 4) {
                                        return NextSlide();
                                    }

                                    if (verificationCode) {
                                        verifyCode();
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
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={classes.link} onClick={handleSendCode}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span></Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const EMAIL_SLIDE_ERROR = () => (
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
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
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.desc')} </Typography>
                        <Button className={clsx(classes.actionButton, classes.actionButtonGreen, classes.mt6)} onClick={() => {
                            handleClose()
                        }}>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.btnTxt')}</Button>
                    </Box>
                </Box>
            </Box >
        )



        return (
            <Box className={clsx(compClasses.carouselContainer, classes.sidebar)}>
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
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1}>
                        <Typography style={{ fontWeight: 700, padding: '0 0 10px 0', color: '#0a74a9' }} variant="h4">
                            {t('sms.verificationDialogTitle')}
                        </Typography>
                        <Typography style={{ fontSize: 14, color: '#000' }} variant="body1">
                            {t('sms.verificationBody')}
                        </Typography>
                        <Typography style={{ fontSize: 14, color: '#000' }} variant="body1">
                            <b>{t('sms.oneTimeProcess')}</b>{' '}{t('sms.foreachSubmission')}
                        </Typography>
                        <Typography style={{ fontSize: 15, textDecoration: 'underline' }}>
                            {t('sms.verificationNote')}
                        </Typography>
                        <Divider />
                    </Box>
                    <Box style={{ position: 'relative', height: '90%' }} >
                        <Typography className={clsx(classes.pbt5, classes.bold)} variant='h6' >{t('sms.numbersAccount')} </Typography>
                        <Box className={clsx(compClasses.contactDataBox, classes.sidebar)}>
                            {
                                (verifiedNumbers || verifiedEmails).map((obj) => (
                                    <Box className={clsx(classes.flex, compClasses.hAuto, 'emailBox')} key={`verificationNumber${obj.ID}`}>
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
                                                handleSendCode(obj.Number);
                                            }}
                                        > {t('sms.verifyNumber')}</Typography>}
                                    </Box>
                                ))
                            }
                        </Box>
                        <Button className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue,
                            'btnVerifyNewLtr'
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
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
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
                                onChange={(e) => {
                                    !!verificationError?.number && setVerificationError({ number: '' })
                                    if (!e.target.value || /^[0-9]+$/.test(e.target.value)) {
                                        setSelectedVerificationContact(e.target.value?.trim())
                                    }
                                }}
                                className={clsx(classes.textField, classes.maxWidth400)}
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
                        <Typography variant='body1'>{t('sms.havingIssuesMessage')} </Typography>
                        {/* <Typography variant='body1'>{t('common.phone')} 03-5240290 / {t('common.email')} support@pulseem.com</Typography> */}
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_3 = () => (
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('common.Sent')}</Typography>
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
                            <Button className={clsx(classes.actionButton, classes.actionButtonDarkBlue)}
                                onClick={() => {


                                    if (trials === 4) {
                                        return NextSlide();
                                    }

                                    if (verificationCode) {
                                        verifyCode();
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
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={classes.link} onClick={handleSendCode}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span></Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const SMS_SLIDE_ERROR = () => (
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
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
            <Box className={clsx(compClasses.carouselItem, compClasses.T05S, compClasses.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (verificationStep * 100) : -(verificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('sms.verificationSuccessful')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('sms.verificationSuccessMessage')}</Typography>
                        <Button className={clsx(classes.actionButton, classes.actionButtonGreen, classes.mt6)} onClick={() => {
                            handleClose()
                        }}>{t('common.continue')}</Button>
                    </Box>
                </Box>
            </Box >
        )



        return (
            <Box className={clsx(compClasses.carouselContainer, classes.sidebar)}>
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
            <div className={classes.dialogIconContent}>
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
            {verificationStep < 2 && (<Button
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
            open={isOpen}
            onClose={handleClose}
            renderButtons={Popup().renderButtons || null}
            {...Popup()}>
            {Popup().content}
        </Dialog>
    )
}

export default VerificationDialog