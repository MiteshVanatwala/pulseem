// import clsx from "clsx";
// import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useDispatch, useSelector } from "react-redux";
// import { Loader } from '../../../components/Loader/Loader';
// import { Dialog } from "../../../components/managment/index";
// import Gif from "../../../assets/images/managment/check-circle.gif";
// import { Typography, Box, Button, TextField } from "@material-ui/core";

// import {
//     getSMSRequestOTP,
//     getSMSConfirmOTP
// } from "../../../redux/reducers/smsSlice";

// const OTP = ({ classes, campaignNumber, otpType = "otpVerification", isOpen = false }) => {
//     const [dialogType, setDialogType] = useState(null);
//     const [showLoader, setLoader] = useState(true);
//     const [OtpCounter, setOtpCounter] = useState(false);
//     const [otpMsgs, setotpMsgs] = useState("Required Field");
//     const [otpValue, setotpValue] = useState(null);
//     const dispatch = useDispatch();
//     const { t } = useTranslation();
//     const otpProps = {
//         maxlength: "5"
//     }


//         setDialogType({ type: otpType });
//         const handleVerifyOTP = async () => {
//             setLoader(true);
//             setDialogType(null);

//             let payload = {
//                 "Cellphone": campaignNumber,
//             }
//             let r = await dispatch(getSMSRequestOTP(payload))
//             setLoader(false);
//             setDialogType({ type: 'otpCode' });
//         }
//         const submitOtp = async () => {
//             let payload =
//             {
//                 "Cellphone": campaignNumber,
//                 "Code": otpValue,
//             }
//             if (otpValidationscheck()) {
//                 let r = await dispatch(getSMSConfirmOTP(payload))
//                 handleOtpResult(r.payload.Status)
//             }
//         }
//         const handleOtpChnage = (e) => {
//             setotpValue(e.target.value);
//             setOtpCounter(false);
//             setotpMsgs("Required field")
//         }
//         const otpValidationscheck = () => {
//             if (otpValue === "") {
//                 setOtpCounter(true);
//                 return false;
//             }
//             return true;
//         };
//         const OTPVerificationDialog = () => {
//             return {
//                 title: t('sms.verificationOtp'),
//                 showDivider: true,
//                 icon: (
//                     <div className={classes.dialogIconContent}>
//                         {'\uE11B'}
//                     </div>
//                 ),
//                 content: (
//                     <Box className={classes.flexColCenter}>
//                         <Typography className={classes.fontSmsRegulations}>
//                             {t("sms.OtpRegulations")}
//                         </Typography>
//                         <Typography className={classes.fontSmsRegulations}>{t("sms.regulationSecondLine")} <strong>{t("sms.oneTime")}</strong> {t("sms.regulationThirdLine")}</Typography>
//                         <TextField
//                             id="outlined-basic"
//                             type="text"
//                             className={classes.OtpPhoneNumberInput}
//                             value={campaignNumber}
//                             disabled
//                         />
//                         <Button
//                             variant='contained'
//                             size='small'
//                             className={clsx(
//                                 classes.dialogButton,
//                                 classes.dialogConfirmButton
//                             )} style={{ whiteSpace: 'nowrap', width: 'auto' }} onClick={() => { handleVerifyOTP() }}>{t("sms.sendVerificationCode")}</Button>
//                         <Typography className={classes.otpContactUs}>{t("sms.otpContactUs")}</Typography>
//                         <Typography style={{ fontSize: "14px" }}>{t("sms.helplineSMS")}</Typography>
//                     </Box>
//                 ),
//                 showDefaultButtons: false,
//                 onClose: () => { setDialogType(null) }
//             }
//         }
//         const OTPCodeDialog = () => {
//             return {
//                 title: t('sms.weHaveSentOtp'),
//                 showDivider: true,
//                 icon: (
//                     <div className={classes.dialogIconContent}>
//                         {'\uE11B'}
//                     </div>
//                 ),
//                 content: (
//                     <Box className={classes.flexColCenter}>
//                         <Box className={clsx(classes.verificationBodySMS, classes.txtCenter)}>
//                             <Typography className={classes.fontSmsRegulations}>
//                                 {t("sms.OtpSentSuccessLine1")} <strong>{campaignNumber}</strong>
//                             </Typography>
//                             <Typography className={classes.fontSmsRegulations}>{t("sms.OtpSentSuccessLine2")}</Typography>
//                             <TextField
//                                 id="outlined-basic"
//                                 type="text"
//                                 className={OtpCounter ? clsx(classes.OtpPhoneNumberConfirm, classes.error) : clsx(classes.OtpPhoneNumberConfirmSuccess, classes.success)}
//                                 placeholder={t("sms.typeOtpPlaceholder")}
//                                 onChange={(e) => { handleOtpChnage(e) }}
//                                 inputProps={otpProps}
//                             />
//                             {OtpCounter ? <Typography style={{ marginBottom: "30px", color: "red" }}>{otpMsgs}</Typography> : null}
//                             <Button
//                                 variant='contained'
//                                 size='small'
//                                 className={clsx(
//                                     classes.dialogButton,
//                                     classes.dialogConfirmBlueButton
//                                 )} style={{ width: "250px" }} onClick={() => { submitOtp() }}>{t("sms.confirmOtp")}</Button>
//                             <Box style={{ display: "flex", marginTop: "20px" }}>
//                                 <Typography className={classes.fontSmsRegulations}>{t("sms.didntReceivedOtp")} </Typography>
//                                 <Typography style={{ textDecoration: "underline", marginInlineStart: "4px" }} className={classes.fontSmsRegulations} onClick={() => { handleVerifyOTP() }}>{t("sms.sendAgainOtp")}</Typography>
//                             </Box>
//                         </Box>
//                     </Box>
//                 ),
//                 showDefaultButtons: false,
//                 onClose: () => { setDialogType(null) },
//                 onConfirm: () => { handleVerifyOTP() }
//             }
//         }
//         const OTPSuccess = () => {
//             return {
//                 title: t('sms.otpNumberValidatedTitle'),
//                 showDivider: true,
//                 icon: (
//                     <div className={classes.dialogIconContent}>
//                         {'\uE11B'}
//                     </div>
//                 ),
//                 content: (
//                     <Box className={classes.flexColCenter} style={{ paddingBottom: 10 }}>
//                         <img src={Gif} style={{ width: "150px", height: "150px" }} />
//                         <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
//                             {t("sms.otpNumberValidatedDescription")}
//                         </p>
//                         <Button
//                             variant='contained'
//                             size='large'
//                             className={clsx(
//                                 classes.dialogButton,
//                                 classes.dialogConfirmButton
//                             )}
//                             onClick={() => { setDialogType(null) }}>
//                             {t('common.Ok')}
//                         </Button>
//                     </Box>
//                 ),
//                 showDefaultButtons: false,
//                 onClose: () => { setDialogType(null) },
//                 onConfirm: () => { setDialogType(null) }
//             }
//         }
//         const handleOtpResult = async (otpSendResult) => {
//             switch (otpSendResult) {
//                 case 1: {// Request
//                     break;
//                 }
//                 case 2: {// Success
//                     setDialogType({ type: 'otpSuccess' });
//                     break;
//                 }
//                 case 3: {// Not_Authirized
//                 }
//                 case 4: {// Failed
//                     setOtpCounter(true);
//                     setotpMsgs("Session Expired , please send again");
//                     break;
//                 }
//                 case 5: {// NotMatch
//                     setOtpCounter(true);
//                     setotpMsgs("Incorrect code, try again or click on Send again");
//                     break;
//                 }
//                 case 6: {//  CellphoneNotProvided
//                     setOtpCounter(true);
//                     setotpMsgs("Cellphone not correct , please try again later");

//                     break;
//                 }
//                 case 7: {// CodeNotProvided
//                     setOtpCounter(true);
//                     setotpMsgs("Required field");
//                     break;
//                 }

//             }
//         }
//         const alertDialog = () => {
//             return {
//                 title: t('mainReport.pleaseNote'),
//                 showDivider: true,
//                 icon: (
//                     <div className={classes.dialogIconContent}>
//                         {'\uE11B'}
//                     </div>
//                 ),
//                 content: (
//                     <Box style={{ maxWidth: 400 }}>
//                         <Typography className={classes.f18}>{t("mainReport.pleaseNoteDsec")}</Typography>
//                     </Box>
//                 ),
//                 showDefaultButtons: true,
//                 onClose: () => { handleAlertoff() },
//                 onConfirm: () => { handleAlertoff() }
//             }
//         }
//         const handleClose = () => {
//             setDialogType(null);
//         };

//         const renderDialog = () => {
//             const { type } = dialogType || {}

//             const dialogContent = {
//                 alert: alertDialog(),
//                 otpVerification: OTPVerificationDialog(),
//                 otpCode: OTPCodeDialog(),
//                 otpSuccess: OTPSuccess()
//             }

//             const currentDialog = dialogContent[type] || {}
//             return (
//                 dialogType && <Dialog
//                     classes={classes}
//                     open={dialogType}
//                     onClose={handleClose}
//                     {...currentDialog}>
//                     {currentDialog.content}
//                 </Dialog>
//             )
//         }
//         const handleAlertoff = () => {
//             setDialogType(null);
//         }
//         return (<>
//             {renderDialog()}
//             <Loader isOpen={showLoader} />
//         </>
//         );

//     return (<></>)

// };

// export default OTP;