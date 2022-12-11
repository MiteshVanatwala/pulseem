import { Button, Select, FormControl, Grid, Typography, MenuItem, FormHelperText } from '@material-ui/core'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai'
import LabeledTextField from '../../../../components/core/LabeledTextField';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import Editorbox from '../../../../components/Wizard/Editorbox';
import { getSmsMarketing, setSmsMarketing } from '../../../../redux/reducers/smsSlice'
import VerificationDialog from '../../../../components/DialogTemplates/VerificationDialog';
import { Loader } from '../../../../components/Loader/Loader';
import { getAuthorizeNumbers } from '../../../../redux/reducers/commonSlice'
import { Dialog } from "../../../../components/managment/index";

const SmsMarketingDialog = ({
    classes,
    selectedGroups = [],
    newsletterSettings = null,
    isOpen = false,
    setDialogType = () => null,
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null,
    onUpdate = () => null
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    const { verifiedNumbers } = useSelector(state => state.common);

    const [smsModel, setSmsModel] = useState({
        Type: 0,
        SendSmsTo: -1,
        FromNumber: "",
        SendDate: null,
        SendTime: null,
    })
    const [linkToUpdate, setLinkToUpdate] = useState(null);
    const [linkToCampaign, setLinkToCampaign] = useState(null);
    const [linkToUpdateEnabled, setLinkToUpdateEnabled] = useState(true);
    const [linkToCampaignEnabled, setLinkToCampaignEnabled] = useState(true);
    const [newSmsVerification, setNewSmsVerification] = useState(false);
    const [showLoader, setLoader] = useState(false);
    const [numberVerified, setNumberVerified] = useState(true);
    const [errors, setErrors] = useState({});

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

    useEffect(() => {
        const initSmsMarketing = async () => {
            await dispatch(getAuthorizeNumbers());
            const response = await dispatch(getSmsMarketing(newsletterSettings?.CampaignID));
            if (response?.payload?.StatusCode === 201 && response?.payload?.Data) {
                const sendDate = response?.payload?.Data?.SendDate;
                const sendTime = moment(sendDate);
                const restData = response?.payload.Data;
                handleFromNumber(response?.payload?.Data.FromNumber ?? restData?.FromNumber);
                setSmsModel({
                    SendDate: sendDate,
                    SendTime: moment(sendTime),
                    ...restData
                });
                onUpdate(restData);
            }
        }

        if (newsletterSettings && newsletterSettings?.CampaignID) {
            initSmsMarketing();
        }
    }, [newsletterSettings]);

    const onAddLinkToCampaign = () => {
        setLinkToUpdate(`##RedirectToEmail##${newsletterSettings.CampaignID}##ClientID##`);
    }
    const onAddLinkToUpdate = () => {
        setLinkToCampaign(`https://${window.location.hostname}/Pulseem/Home/UpdateClientInfo/?ClientID===ClientID==&CampaignID=${newsletterSettings.CampaignID}&Culture=he-IL`);
    }
    const handleFromNumber = (value) => {
        setSmsModel({ ...smsModel, FromNumber: value });
        if (value.length > 8) {
            const isVerified = verifiedNumbers.find((number) => {
                return number?.Number === value;
            });
            setNumberVerified(isVerified);
        }
    }

    const handleUpdate = (model) => {
        setLinkToUpdateEnabled(model?.Text?.indexOf(`https://${window.location.hostname}/Pulseem/Home/UpdateClientInfo/?ClientID===ClientID==&CampaignID=${newsletterSettings.CampaignID}&Culture=he-IL`) === -1)
        setLinkToCampaignEnabled(model?.Text?.indexOf(`##RedirectToEmail##${newsletterSettings.CampaignID}##ClientID##`) === -1)
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

        setSmsModel({ ...smsModel, SendDate: finalDate });

        if (handleValidation()) {
            const totalMarketing = { ...newsletterSettings };
            const smsCampaignPayload = {
                CreditsPerSms: smsModel.CreditsPerSms,
                FromNumber: smsModel.FromNumber,
                SendSmsTo: smsModel.SendSmsTo,
                SendDate: newVal,
                EmailCampaignID: totalMarketing?.CampaignID,
                GroupIds: selectedGroups.map((g) => g.GroupID),
                Text: smsModel.Text,
                Type: 0,
                ...smsModel?.model
            }

            const r = await dispatch(setSmsMarketing(smsCampaignPayload));
            handleTotalMarketingResponse(r.payload);
            setLoader(false);
            onConfirm();
        }
        setLoader(false);
    }

    const handleTotalMarketingResponse = (response) => {
        switch (response?.StatusCode) {
            case 201: {
                alert('success');
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
                alert(response?.Message);
            }
        }
    }

    const handleValidation = () => {
        const tempErrors = {};
        if (!smsModel.FromNumber) {
            tempErrors.FromNumber = 'From Number is required';
        }
        if (!smsModel.Text) {
            tempErrors.Text = 'Text is required';
        }
        if (!smsModel.SendDate) {
            tempErrors.SendDate = 'Date is required';
        }
        if (!smsModel.SendTime) {
            tempErrors.SendTime = 'Time is required';
        }
        if (!numberVerified) {
            tempErrors.numberVerified = 'Please verified from number';
        }
        if (smsModel.SendSmsTo === -1) {
            tempErrors.SendSmsTo = 'Send to is required ';
        }
        setErrors({ ...tempErrors })
        return Object.values(tempErrors).length === 0;
    }

    const currentDialog = {
        title: t("campaigns.newsLetterEditor.sendSettings.smsMarketing.title"),
        description: 'This is the description',
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
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
                    <LabeledTextField
                        textFieldProps={{
                            className: classes.NoPaddingtextField,
                            helperText: !!errors.FromNumber && errors.FromNumber,
                            error: !!errors.FromNumber,
                            onChange: (e) => {
                                handleFromNumber(e.target.value);
                            },
                            onKeyPress: (e) => {
                                if (!e.key.match(/^[0-9]*$/)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                }
                            }
                            ,
                            value: smsModel.FromNumber
                        }}
                        labelProps={{
                            label: t('campaigns.newsLetterEditor.sendSettings.smsMarketing.fromNumber')
                        }}
                        containerProps={{
                            direction: 'column'
                        }}
                    />
                    {!numberVerified && <strong className={classes.link} onClick={() => setNewSmsVerification(true)}>{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</strong>}
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingDate')}
                    </Typography>
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={smsModel.SendDate}
                        onChange={(value) => {
                            console.log(value);
                            setSmsModel({ ...smsModel, SendDate: value })
                        }}
                        placeholder={t("notifications.date")}
                        timePickerOpen={true}
                        error={!!errors.SendDate}
                        helperText={!!errors.SendDate && errors.SendDate}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingTime')}
                    </Typography>
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={smsModel.SendTime}
                        onTimeChange={(value) => {
                            setSmsModel({ ...smsModel, SendTime: value })
                        }}
                        placeholder={t("notifications.hour")}
                        isTimePicker={true}
                        ampm={false}
                        error={!!errors.SendTime}
                        helperText={!!errors.SendTime && errors.SendTime}
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
                    </Grid>
                </Grid>
                <Grid item md={12}>
                    <Editorbox classes={classes}
                        variant="column"
                        values={smsModel}
                        onUpdate={handleUpdate}
                        onFromNumberInit={(fromNumber) => setSmsModel({ ...smsModel, FromNumber: fromNumber })}
                        linkToCampaign={linkToCampaign}
                        linkToUpdate={linkToUpdate} />
                    {errors.Text && <p className={classes.errorText}>{errors.Text}</p>}
                </Grid>
                {newSmsVerification && <VerificationDialog
                    classes={classes}
                    isOpen={newSmsVerification}
                    variant='sms' onClose={() => setNewSmsVerification(false)}
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

    return <Dialog
        classes={classes}
        open={isOpen}
        onClose={() => { setDialogType(null) }}
        {...currentDialog}>
        {currentDialog.content}
    </Dialog>
}

export default React.memo(SmsMarketingDialog)