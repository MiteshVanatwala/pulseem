import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { Typography, Button, TextField, Box, makeStyles, Divider } from '@material-ui/core'
import { Dialog } from '../../components/managment/index'
import 'moment/locale/he'
import { RiCheckboxCircleFill, RiCloseCircleFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const staticEmails = [
    {
        email: 'Rishabh@gmail.com',
        verified: false,
    },
    {
        email: 'Rish@gmail.com',
        verified: true,
    },
    {
        email: 'Ido@gmail.com',
        verified: false,
    },
    {
        email: 'RishRathore@gmail.com',
        verified: true,
    },
]

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
    emailVerItemContainer: {
        '& .error': {
            marginTop: 20,
            color: 'red'
        },
        '& .success': {
            marginTop: 7,
            color: 'green'
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
                        paddingInline: 3,
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
                    right: 0
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
                    // '& :nthChild(2)': {
                    //   marginTop: 20
                    // }
                    '& .desc': {
                        marginTop: 20
                    }
                }
            }
        },
    }
})

const EmailVerificationDialog = ({ classes, emails = staticEmails, isOpen = false, onClose = () => null }) => {

    const { isRTL } = useSelector(state => state.core);
    const compClasses = useStyles()
    const { t } = useTranslation();
    const [emailVerificationStep, setEmailVerificationStep] = useState(0)
    const [emailVerificationError, setEmailVerificationError] = useState(null)
    const [selectedVerificationEmail, setSelectedVerificationEmail] = useState('')
    const [codeResend, setCodeResend] = useState(false)
    // const [emailStatus, setEmailStatus] = useState(false)
    const verificationCode = useRef('');

    const handleClose = () => {
        // setDialogType(null)
        onClose?.()
        emailVerificationStep && setEmailVerificationStep(0)
        emailVerificationError && setEmailVerificationError(null)
        selectedVerificationEmail && setSelectedVerificationEmail('');
        if (!!verificationCode?.current?.value) verificationCode.current.value = ''
        if (localStorage.getItem('verificationTrial')) localStorage.removeItem('verificationTrial')
    }


    const EmailVerificationModule = () => {

        const verifyCode = () => {
            return true
        }

        const handleResendCode = () => {
            setCodeResend(false);
            //API CALL
            // setCodeResend(false);
            setCodeResend(true);
        }

        const NextSlide = () => {
            if (emailVerificationStep === 4) {
                return setEmailVerificationStep(0)
            }
            return setEmailVerificationStep(emailVerificationStep + 1)
        }

        const PrevSlide = () => {
            if (emailVerificationStep === 0) {
                return setEmailVerificationStep(5)
            }
            return setEmailVerificationStep(emailVerificationStep - 1)
        }

        let trials = localStorage.getItem('verificationTrial') ? Number(localStorage.getItem('verificationTrial')) : 0

        const FirstSlide = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ position: "relative", transform: `translate(${isRTL ? (emailVerificationStep * 100) : -(emailVerificationStep * 100)}%)` }}>
                <Box className='cSlide firstSlide'>
                    <Box pb={1} className={classes.textCenter}>
                        <Typography style={{ fontWeight: 700, padding: '0 0 10px 0' }} variant="h4">
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
                    <Box style={{ position: 'relative' }}>
                        <Typography className={clsx(classes.pbt5, classes.bold)} variant='h6' >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifiedEmails')} </Typography>
                        {
                            emails.map((obj) => (
                                <Box className={clsx(classes.flex, classes.hAuto, 'emailBox')}>
                                    <span>{obj.verified ? <RiCheckboxCircleFill /> : <RiCloseCircleFill />}</span>
                                    <Typography className='emailText'>{obj.email} </Typography>
                                    {!obj.verified && <Typography className={clsx(classes.link, 'emailVerLink')}
                                        onClick={() => {
                                            setSelectedVerificationEmail(obj.email);
                                            setEmailVerificationError({ email: '' })
                                            EmailVerificationModule().NextSlide()
                                        }}
                                    >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.verifyEmailAddr')}</Typography>}
                                </Box>
                            ))
                        }
                        <Button className={clsx(
                            classes.actionButton,
                            classes.actionButtonDarkBlue,
                            isRTL ? 'btnVerifyNewRTL' : 'btnVerifyNewLtr'
                        )}
                            onClick={() => {
                                setSelectedVerificationEmail('')
                                setEmailVerificationError({ email: '' })
                                EmailVerificationModule().NextSlide()
                            }}
                        >{t('campaigns.newsLetterMgmt.emailVerification.firstSlide.addNewToVerify')}</Button>
                    </Box>
                </Box>
            </Box>
        )

        const SecondSlide = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (emailVerificationStep * 100) : -(emailVerificationStep * 100)}%)` }}>
                <Box className='cFlexSlide secondSlide' >
                    <Box className='titleDescBox'>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title')}</Typography>
                        <Typography variant='body1' className='desc' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc1')}</Typography>
                        <Typography variant='body1' className='desc' >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.desc2')}</Typography>
                    </Box>
                    <Box className={classes.flexColumn}>
                        <Box>
                            <TextField
                                variant='outlined'
                                size='small'
                                value={selectedVerificationEmail}
                                onChange={(e) => {
                                    !!emailVerificationError?.email && setEmailVerificationError({ email: '' })
                                    setSelectedVerificationEmail(e.target.value)
                                }}
                                className={clsx(classes.textField, classes.maxWidth400)}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.secondSlide.placeholder')}
                                error={!!emailVerificationError?.email}
                            // helperText={emailVerificationError?.email}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonGreen)}
                                onClick={() => {
                                    if (selectedVerificationEmail) {
                                        if (selectedVerificationEmail.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                                            EmailVerificationModule().NextSlide()
                                        }
                                        else {
                                            setEmailVerificationError({ email: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error1') })
                                        }
                                    }
                                    else
                                        setEmailVerificationError({ email: t('campaigns.newsLetterMgmt.emailVerification.secondSlide.error2') })
                                }}
                            >{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.btnText')}</Button>
                            <Typography className='error' variant="body1">{emailVerificationError?.email}</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.anyProblem')} <span className={classes.link}>{t('campaigns.newsLetterMgmt.emailVerification.secondSlide.contactUs')}</span></Typography>
                        <Typography variant='body1'>{t('common.phone')} 03-5240290 / {t('common.email')} support@pulseem.com</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const ThirdSlide = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (emailVerificationStep * 100) : -(emailVerificationStep * 100)}%)` }}>
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
                                onChange={() => !!emailVerificationError?.code && setEmailVerificationError({ code: '' })}
                                placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
                                error={!!emailVerificationError?.code}
                                // helperText={emailVerificationError?.code}
                                inputProps={{
                                    ref: verificationCode
                                }}
                            />
                        </Box>
                        <Box mt={2}>
                            <Button className={clsx(classes.actionButton, classes.actionButtonDarkBlue)}
                                onClick={() => {
                                    console.log("CODE:", verificationCode?.current)


                                    if (trials === 4) {
                                        return EmailVerificationModule().NextSlide();
                                    }

                                    if (verificationCode?.current?.value) {
                                        if (verifyCode()) {
                                            EmailVerificationModule().NextSlide();
                                        }
                                        else {
                                            localStorage.setItem('verificationTrial', trials + 1)
                                            setEmailVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error1') })
                                        }
                                    }
                                    else {
                                        localStorage.setItem('verificationTrial', trials + 1)
                                        setEmailVerificationError({ code: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2') })
                                    }
                                }}
                            >
                                {t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
                            </Button>
                            <Typography className='error' variant="body1">{emailVerificationError?.code}</Typography>

                            {/* // <Button onClick={() => setEmailStatus(!emailStatus)}>Change Status</Button> */}
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={classes.link} onClick={handleResendCode}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span></Typography>
                        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
                    </Box>
                </Box>
            </Box>
        )

        const ErrorSlide = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (emailVerificationStep * 100) : -(emailVerificationStep * 100)}%)` }}>
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

        const SuccessSlide = () => (
            <Box className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)} style={{ transform: `translate(${isRTL ? (emailVerificationStep * 100) : -(emailVerificationStep * 100)}%)` }}>
                <Box className='cFlexSlide'>
                    <Box>
                        <Typography variant='h4'>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.title')}</Typography>
                        <Typography variant='body1' className={classes.mt4}>{t('campaigns.newsLetterMgmt.emailVerification.successSlide.desc')} </Typography>
                        <Button className={clsx(classes.actionButton, classes.actionButtonGreen, classes.mt6)} >{t('campaigns.newsLetterMgmt.emailVerification.successSlide.btnTxt')}</Button>
                    </Box>
                </Box>
            </Box>
        )

        const UIComp = () => (
            <Box className={classes.carouselContainer}>
                {FirstSlide()}
                {SecondSlide()}
                {ThirdSlide()}
                {(trials && trials >= 4) ? ErrorSlide() : SuccessSlide()}
                {/* {!localStorage.getItem('verificationTrial') && Number(localStorage.getItem('verificationTrial')) < 4 && FifthStep()} */}
            </Box>
        )

        return {
            NextSlide: NextSlide,
            PrevSlide: PrevSlide,
            UIComp: UIComp
        }

    }


    const verificationDialog = (data = '') => ({
        title: '',
        icon: ' ',
        content: (<>
            {EmailVerificationModule().UIComp()}
        </>

        ),
        renderButtons: () => (<Box className={classes.textCenter}>
            <Button
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
            </Button>

            {(emailVerificationStep > 0 && emailVerificationStep < 3) && <Button
                name="btnConfirm"
                variant='contained'
                size='small'
                onClick={EmailVerificationModule().PrevSlide}
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
            renderButtons={verificationDialog().renderButtons || null}
            {...verificationDialog()}>
            {verificationDialog().content}
        </Dialog>
    )
}

export default EmailVerificationDialog