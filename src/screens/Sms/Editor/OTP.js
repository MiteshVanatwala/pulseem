import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Loader } from '../../../components/Loader/Loader';
import Gif from "../../../assets/images/managment/check-circle.gif";
import { Typography, Box, Button, TextField } from "@material-ui/core";

import {
    getSMSRequestOTP,
    getSMSConfirmOTP
} from "../../../redux/reducers/smsSlice";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";

const OTP = ({ classes, campaignNumber, isOpen = false, onClose = () => null }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [otpValue, setotpValue] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [dialogType, setDialogType] = useState(null);
    const [otpValidation, setOtpValidation] = useState(false);
    const [otpMsgs, setotpMsgs] = useState(t("common.requiredField"));

    const otpProps = {
        maxlength: "5"
    }

    useEffect(() => {
        setDialogType({ type: "otpVerification" });
    }, [isOpen]);

    const onCloseDialog = () => {
        setLoader(false);
        setDialogType(null);
        onClose();
    }


    const handleVerifyOTP = async () => {
        setLoader(true);
        setDialogType(null);

        let payload = {
            "Cellphone": campaignNumber,
        }
        await dispatch(getSMSRequestOTP(payload))
        setLoader(false);
        setDialogType({ type: 'otpCode' });
    }
    const submitOtp = async () => {
        let payload =
        {
            "Cellphone": campaignNumber,
            "Code": otpValue,
        }
        if (otpValidationscheck()) {
            let r = await dispatch(getSMSConfirmOTP(payload))
            handleOtpResult(r.payload.Status)
        }
    }
    const handleOtpChnage = (e) => {
        setotpValue(e.target.value);
        setOtpValidation(false);
        setotpMsgs(t("common.requiredField"));
    }
    const otpValidationscheck = () => {
        if (otpValue === "") {
            setOtpValidation(true);
            return false;
        }
        return true;
    };
    const OTPVerificationDialog = () => {
        return {
            title: t('sms.verificationOtp'),
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE11B'}
                </div>
            ),
            content: (
                <Box className={classes.flexColCenter}>
                    <Typography className={classes.fontSmsRegulations}>
                        {t("sms.OtpRegulations")}
                    </Typography>
                    <Typography className={classes.fontSmsRegulations}>{t("sms.regulationSecondLine")} <strong>{t("sms.oneTime")}</strong> {t("sms.regulationThirdLine")}</Typography>
                    <TextField
                        id="outlined-basic"
                        type="text"
                        className={classes.OtpPhoneNumberInput}
                        value={campaignNumber}
                        disabled
                    />
                    <Button
                        variant='contained'
                        size='small'
                        className={clsx(
                            classes.dialogButton,
                            classes.dialogConfirmButton
                        )} style={{ whiteSpace: 'nowrap', width: 'auto' }} onClick={() => { handleVerifyOTP() }}>{t("sms.sendVerificationCode")}</Button>
                    <Typography className={classes.otpContactUs}>{t("sms.otpContactUs")}</Typography>
                    <Typography style={{ fontSize: "14px" }}>{t("sms.helplineSMS")}</Typography>
                </Box>
            ),
            showDefaultButtons: false,
            onClose: () => { onCloseDialog() }
        }
    }
    const OTPCodeDialog = () => {
        return {
            title: t('sms.weHaveSentOtp'),
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE11B'}
                </div>
            ),
            content: (
                <Box className={classes.flexColCenter}>
                    <Box className={clsx(classes.verificationBodySMS, classes.txtCenter)}>
                        <Typography className={classes.fontSmsRegulations}>
                            {t("sms.OtpSentSuccessLine1")} <strong>{campaignNumber}</strong>
                        </Typography>
                        <Typography className={classes.fontSmsRegulations}>{t("sms.OtpSentSuccessLine2")}</Typography>
                        <TextField
                            id="outlined-basic"
                            type="text"
                            className={otpValidation ? clsx(classes.OtpPhoneNumberConfirm, classes.error) : clsx(classes.OtpPhoneNumberConfirmSuccess, classes.success)}
                            placeholder={t("sms.typeOtpPlaceholder")}
                            onChange={(e) => { handleOtpChnage(e) }}
                            inputProps={otpProps}
                        />
                        {otpValidation ? <Typography style={{ marginBottom: "30px", color: "red" }}>{otpMsgs}</Typography> : null}
                        <Button
                            variant='contained'
                            size='small'
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmBlueButton
                            )} style={{ width: "250px" }} onClick={() => { submitOtp() }}>{t("sms.confirmOtp")}</Button>
                        <Box style={{ display: "flex", marginTop: "20px" }}>
                            <Typography className={classes.fontSmsRegulations}>{t("sms.didntReceivedOtp")} </Typography>
                            <Typography style={{ textDecoration: "underline", marginInlineStart: "4px", cursor: 'pointer' }} className={classes.fontSmsRegulations} onClick={() => { handleVerifyOTP() }}>{t("sms.resend")}</Typography>
                        </Box>
                    </Box>
                </Box>
            ),
            showDefaultButtons: false,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { handleVerifyOTP() }
        }
    }
    const OTPSuccess = () => {
        return {
            title: t('sms.otpNumberValidatedTitle'),
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE11B'}
                </div>
            ),
            content: (
                <Box className={classes.flexColCenter} style={{ paddingBottom: 10 }}>
                    <img src={Gif} style={{ width: "150px", height: "150px" }} alt="" />
                    <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
                        {t("sms.otpNumberValidatedDescription")}
                    </p>
                    <Button
                        variant='contained'
                        size='large'
                        className={clsx(
                            classes.dialogButton,
                            classes.dialogConfirmButton
                        )}
                        onClick={() => { setDialogType(null) }}>
                        {t('common.Ok')}
                    </Button>
                </Box>
            ),
            showDefaultButtons: false,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { setDialogType(null) }
        }
    }
    const handleOtpResult = async (otpSendResult) => {
        switch (otpSendResult) {
            default:
            case 1: {// Request
                break;
            }
            case 2: {// Success
                setDialogType({ type: 'otpSuccess' });
                break;
            }
            case 3: {// Not_Authirized
                setOtpValidation(true);
                setotpMsgs(t("sms.otpNotAuthirized"));
                break;
            }
            case 4: {// Failed
                setOtpValidation(true);
                setotpMsgs(t("sms.otpFailed"));
                break;
            }
            case 5: {// NotMatch
                setOtpValidation(true);
                setotpMsgs(t("sms.otpNotMatch"));
                break;
            }
            case 6: {//  CellphoneNotProvided
                setOtpValidation(true);
                setotpMsgs(t("sms.phoneNotProvided"));
                break;
            }
            case 7: {// CodeNotProvided
                setOtpValidation(true);
                setotpMsgs(t("common.requiredField"));
                break;
            }

        }
    }
    const alertDialog = () => {
        return {
            title: t('mainReport.pleaseNote'),
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\uE11B'}
                </div>
            ),
            content: (
                <Box style={{ maxWidth: 400 }}>
                    <Typography className={classes.f18}>{t("mainReport.pleaseNoteDsec")}</Typography>
                </Box>
            ),
            showDefaultButtons: true,
            onClose: () => { handleAlertoff() },
            onConfirm: () => { handleAlertoff() }
        }
    }
    const handleClose = () => {
        setLoader(false);
        setDialogType(null);
    };

    const renderDialog = () => {
        const { type } = dialogType || {}

        const dialogContent = {
            alert: alertDialog(),
            otpVerification: OTPVerificationDialog(),
            otpCode: OTPCodeDialog(),
            otpSuccess: OTPSuccess()
        }

        const currentDialog = dialogContent[type] || {}
        return (
            dialogType && <BaseDialog
                classes={classes}
                open={dialogType}
                onClose={handleClose}
                onCancel={handleClose}
                {...currentDialog}>
                {currentDialog.content}
            </BaseDialog>
        )
    }
    const handleAlertoff = () => {
        setDialogType(null);
    }
    
    return (<>
        {renderDialog()}
        <Loader isOpen={showLoader} />
    </>
    );
};

export default OTP;