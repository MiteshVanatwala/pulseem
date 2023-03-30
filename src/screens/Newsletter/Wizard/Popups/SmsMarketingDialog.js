import { Button, Select, FormControl, Grid, Typography, MenuItem, FormHelperText, Box, FormGroup, TextField, Link } from '@material-ui/core'
import Switch from "react-switch";
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import LabeledTextField from '../../../../components/core/LabeledTextField';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import Editorbox from '../../../../components/Wizard/Editorbox';
import { setSmsMarketing } from '../../../../redux/reducers/smsSlice'
import VerificationDialog from '../../../../components/DialogTemplates/VerificationDialog.js';
import { Loader } from '../../../../components/Loader/Loader';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import Toast from '../../../../components/Toast/Toast.component';

const SmsMarketingDialog = ({
    classes,
    selectedGroups = [],
    settings = null,
    isOpen = false,
    smsMarketingModel = null,
    setDialogType = () => null,
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null
}) => {
    const textRef = useRef(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    const { verifiedNumbers, accountSettings } = useSelector(state => state.common);

    const [smsModel, setSmsModel] = useState({ ...smsMarketingModel })
    const [linkToUpdate, setLinkToUpdate] = useState(null);
    const [linkToCampaign, setLinkToCampaign] = useState(null);
    const [linkToUpdateEnabled, setLinkToUpdateEnabled] = useState(true);
    const [linkToCampaignEnabled, setLinkToCampaignEnabled] = useState(true);
    const [newSmsVerification, setNewSmsVerification] = useState(false);
    const [showLoader, setLoader] = useState(false);
    const [numberVerified, setNumberVerified] = useState(true);
    const [errors, setErrors] = useState({});
    const [isLinksStatistics, setIsLinksStatistics] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const toggleLinkStatistics = () => {
        setIsLinksStatistics(!isLinksStatistics);
    };

    useEffect(() => {
        setIsLinksStatistics(smsMarketingModel.IsLinksStatistics ?? true);
    }, [])

    const sendToOptions = [
        {
            text: t("common.select"),
            value: -1
        },
        {
            text: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.everyone"),
            value: 0
        },
        {
            text: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.opened"),
            value: 3
        },
        {
            text: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.invalid"),
            value: 2
        },
        {
            text: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.unOpened"),
            value: 1
        },
        {
            text: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.clicked"),
            value: 4
        }
    ];

    const onAddLinkToCampaign = () => {
        setLinkToUpdate(`##RedirectToEmail##${settings.CampaignID}##ClientID##`);
    }
    const onAddLinkToUpdate = () => {
        setLinkToCampaign(`https://${window.location.hostname}/Pulseem/Home/UpdateClientInfo/?ClientID===ClientID==&CampaignID=${settings.CampaignID}&Culture=he-IL`);
    }
    const validateFromNumber = (e) => {
        const text = e.target.value;
        var lastChar = text.substring(text.length, text.length - 1);
        var isNumber = /^[0-9]*$/;
        var english = /^[A-Za-z0-9 ]*$/;

        if (!text.match(isNumber) && text.match(english) && text.length >= 10) {
            e.target.value = text.substring(0, 10);
        }
        if (text.match(isNumber) && text.length >= 13) {
            e.target.value = text.substring(0, 13);
        }
        if (!text.match(english)) {
            e.target.value = e.target.value.replace(lastChar, '');
        }

        handleFromNumber(e.target.value)

    }
    const handleFromNumber = (value) => {
        if (!value) {
            return;
        }
        setSmsModel({ ...smsModel, FromNumber: value });
        if (value === accountSettings?.DefaultCellNumber) {
            setNumberVerified(true);
        }
        else {
            if (value.length > 8) {
                const isVerified = verifiedNumbers.find((number) => {
                    return number?.Number === value;
                });
                setNumberVerified(isVerified);
            }
        }
    }
    const handleUpdate = (model) => {
        setLinkToUpdateEnabled(model?.Text?.indexOf(`https://${window.location.hostname}/Pulseem/Home/UpdateClientInfo/?ClientID===ClientID==&CampaignID=${settings.CampaignID}&Culture=he-IL`) === -1)
        setLinkToCampaignEnabled(model?.Text?.indexOf(`##RedirectToEmail##${settings.CampaignID}##ClientID##`) === -1)
        setSmsModel({
            ...smsModel,
            Text: model?.Text,
            IsLinksStatistics: model?.IsLinksStatistics,
            Credits: model?.Credits,
            CreditsPerSms: model?.CreditsPerSms
        });
    }
    const handleConfirm = async () => {
        setLoader(true);
        const finalDate = moment(smsModel.SendDate, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: moment(smsModel.SendTime).format("HH"), m: moment(smsModel.SendTime).format("mm") });
        const newVal = finalDate.format();

        setSmsModel({ ...smsModel, SendDate: finalDate, Text: textRef.current.value });

        if (finalDate < moment(smsModel.MinSendDate)) {
            setErrors({ SendDate: t('campaigns.newsLetterEditor.sendSettings.errors.selectFutureDate') })
        }
        else if (!textRef.current.value || textRef.current.value === '') {
            setErrors({ Text: t('campaigns.newsLetterEditor.sendSettings.errors.reqText') })
        }
        else {
            if (handleValidation()) {
                const totalMarketing = { ...settings };
                const smsCampaignPayload = {
                    Type: 0,
                    SendDate: newVal,
                    Name: smsModel.Name,
                    Text: textRef.current.value,
                    IsTestCampaign: false,
                    SendSmsTo: smsModel.SendSmsTo,
                    FromNumber: smsModel.FromNumber,
                    SmsBulkCost: smsModel.SmsBulkCost,
                    IsLinksStatistics: isLinksStatistics,
                    CreditsPerSms: smsModel.CreditsPerSms,
                    EmailCampaignID: totalMarketing?.CampaignID,
                    GroupIds: selectedGroups.map((g) => g.GroupID)
                };

                const r = await dispatch(setSmsMarketing(smsCampaignPayload));
                handleTotalMarketingResponse(r.payload);
                setLoader(false);
                setTimeout(() => {
                    onConfirm();
                }, 3000);
            }
        }

        setLoader(false);
    }
    const handleTotalMarketingResponse = (response) => {
        switch (response?.StatusCode) {
            case 201: {
                setToastMessage({ severity: 'success', color: 'success', message: t('common.savedSuccessfully'), showAnimtionCheck: true });
                break;
            }
            case 401: {
                //Invalid api key
                break;
            }
            case 200:
            case 500: {
                break;
            }
            default: {
                setToastMessage({ severity: 'success', color: 'success', message: response?.Message, showAnimtionCheck: true });
            }
        }
    }
    const handleValidation = () => {
        const tempErrors = {};

        if (!numberVerified) {
            setNewSmsVerification(true);
            return false;
        }

        if (!smsModel.FromNumber) {
            tempErrors.FromNumber = t('campaigns.newsLetterEditor.sendSettings.errors.reqFromNumber');
        }
        if (!smsModel.SendDate) {
            tempErrors.SendDate = t('campaigns.newsLetterEditor.sendSettings.errors.reqDate');

        }
        else if (moment(smsModel.SendDate) < moment(smsModel.MinSendDate)) {
            tempErrors.SendDate = t('campaigns.newsLetterEditor.sendSettings.errors.selectFutureDate');
        }
        else if (Object.prototype.toString.call(smsModel.SendDate) === "[object Date]") {
            tempErrors.SendDate = t('campaigns.newsLetterEditor.sendSettings.errors.invalidDate');
        }
        if (!smsModel.SendTime) {
            tempErrors.SendTime = t('campaigns.newsLetterEditor.sendSettings.errors.reqTime');
        }
        else if (/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(smsModel.SendTime)) {
            tempErrors.SendTime = t('campaigns.newsLetterEditor.sendSettings.errors.invalidTime');
        }
        if (smsModel.SendSmsTo === -1) {
            tempErrors.SendSmsTo = t('campaigns.newsLetterEditor.sendSettings.errors.reqSendTo');
        }
        setErrors({ ...tempErrors })
        return Object.values(tempErrors).length === 0;
    }

    const currentDialog = {
        title: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.title"),
        showDivider: true,
        disableBackdropClick: true,
        content: (
            <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendTo')}
                    </Typography>
                    <FormControl variant="standard" className={classes.selectInputFormControl} style={{ width: '100%' }} error={!!errors.SendSmsTo}>
                        <Select
                            style={{
                                height: 40
                            }}
                            placeholder={t('campaigns.newsLetterEditor.sendSettings.sendTo')}
                            className={classes.select}
                            labelId="sendToSelect"
                            id="sendToSelect"
                            value={smsModel.SendSmsTo}
                            onChange={(e) => setSmsModel({ ...smsModel, SendSmsTo: e.target.value })}
                        >
                            {
                                sendToOptions.map((obj, idx) => <MenuItem
                                    key={idx}
                                    style={{ paddingBlockStart: 10, textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}
                                    disabled={obj.value === -1}
                                    value={obj.value}>{t(obj.text)}</MenuItem>
                                )
                            }
                        </Select>
                        {errors.SendSmsTo && <FormHelperText>{errors.SendSmsTo}</FormHelperText>}
                    </FormControl >
                </Grid>
                <Grid item sm={12} md={6}>
                    <Box className={classes.spaceBetween}>
                        <Box>
                            <Typography>
                                {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.fromNumber')}
                            </Typography>
                        </Box>
                        <Box>
                            <Link
                                className={clsx(classes.textColorGrey, classes.link, accountSettings?.DefaultCellNumber === smsModel.FromNumber ? classes.disabled : null)}
                                style={{ fontSize: '0.9rem' }}
                                onClick={() => {
                                    handleFromNumber(accountSettings?.DefaultCellNumber);
                                }}
                            >
                                {t("mainReport.restore")}
                            </Link>
                        </Box>

                    </Box>
                    <Box>
                        <TextField
                            style={{ width: '100%' }}
                            variant="outlined"
                            className={classes.NoPaddingtextField}
                            helperText={!!errors.FromNumber && errors.FromNumber}
                            error={!!errors.FromNumber}
                            onLoadedData={(e) => {
                                handleFromNumber(e.target.value);
                            }}
                            onChange={validateFromNumber}
                            onKeyPress={(e) => {
                                if (!e.key.match(/^[0-9]*$/)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                }
                            }}
                            value={smsModel.FromNumber}
                        />
                        {!numberVerified && <strong className={classes.link} onClick={() => setNewSmsVerification(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>}
                    </Box>
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingDate')}
                    </Typography>
                    <DateField
                        minDate={moment(smsModel.MinSendDate)}
                        classes={classes}
                        value={smsModel.SendDate}
                        onChange={(value) => {
                            setSmsModel({ ...smsModel, SendDate: value })
                        }}
                        placeholder={t("notifications.date")}
                        timePickerOpen={true}
                        error={!!errors.SendDate}
                        helperText={!!errors.SendDate && errors.SendDate}
                        errorMessage={errors.SendDate}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingTime')}
                    </Typography>
                    <DateField
                        classes={classes}
                        value={smsModel.SendTime}
                        onTimeChange={(value) => {
                            setSmsModel({ ...smsModel, SendTime: value })
                        }}
                        placeholder={t("notifications.hour")}
                        isTimePicker={true}
                        ampm={false}
                        error={!!errors.SendTime}
                        errorMessage={!!errors.SendTime && errors.SendTime}
                    />
                </Grid>
                <Grid item md={12}>
                    <Typography className={clsx(classes.f20, classes.bold)}>
                        {t("mainReport.yourMessage")}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightBlue,
                                    classes.backButton
                                )}
                                disabled={!linkToCampaignEnabled}
                                onClick={onAddLinkToCampaign}
                            >{t('campaigns.newsLetterEditor.sendSettings.smsMarketing.addLinkToCampaign')}</Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightBlue,
                                    classes.backButton
                                )}
                                disabled={!linkToUpdateEnabled}
                                onClick={onAddLinkToUpdate}
                            >{t('campaigns.newsLetterEditor.sendSettings.smsMarketing.addLinkToUpdate')}</Button>
                        </Grid>
                        <Grid item>
                            <Box className={classes.switchDiv}>
                                <FormGroup>
                                    <Switch
                                        className={
                                            isRTL
                                                ? clsx(classes.reactSwitchHe, "react-switch")
                                                : clsx(classes.reactSwitch, "react-switch")
                                        }
                                        checked={isLinksStatistics}
                                        onChange={() => {
                                            toggleLinkStatistics(!isLinksStatistics);
                                            setSmsModel({ ...smsModel, IsLinksStatistics: !isLinksStatistics });
                                        }}
                                        onColor="#28a745"
                                        checkedIcon={false}
                                        uncheckedIcon={false}
                                        handleDiameter={30}
                                        height={20}
                                        width={48}
                                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                        id="material-switch"
                                    />
                                </FormGroup>
                                <Box className={classes.radio}>
                                    <Typography style={{ fontSize: "18px" }}>
                                        {t("mainReport.keepTrack")}
                                    </Typography>
                                    <Typography

                                        className={clsx(classes.descSwitch, classes.w100)}
                                    >
                                        {t("mainReport.keepDesc")}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item md={12}>
                    <Editorbox classes={classes}
                        variant="column"
                        textRef={textRef}
                        values={{ ...smsModel }}
                        onUpdate={handleUpdate}
                        onFromNumberInit={(fromNumber) => setSmsModel({ ...smsModel, FromNumber: fromNumber })}
                        linkToCampaign={linkToCampaign}
                        linkToUpdate={linkToUpdate} />
                    {errors.Text && <p className={classes.errorText}>{errors.Text}</p>}
                </Grid>
                {newSmsVerification && <VerificationDialog
                    classes={classes}
                    isOpen={newSmsVerification}
                    variant='sms'
                    onClose={() => setNewSmsVerification(false)}
                    Option={{
                        Step: 1,
                        Value: smsModel.FromNumber
                    }}
                />}
                <Loader isOpen={showLoader} />
            </Grid>
        ),
        showDefaultButtons: true,
        confirmText: t("common.save"),
        cancelText: t("common.Cancel"),
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: handleConfirm
    }

    return (
        <>
            <BaseDialog
                classes={classes}
                open={isOpen}
                onClose={() => { setDialogType(null) }}
                onCancel={() => { setDialogType(null) }}
                {...currentDialog}>
                {currentDialog.content}
            </BaseDialog>
            { toastMessage &&  <Toast data={toastMessage} /> }
        </>
    )
}

export default SmsMarketingDialog