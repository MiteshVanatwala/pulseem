import { Button, Select, FormControl, Grid, Typography, MenuItem } from '@material-ui/core'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai'
import LabeledTextField from '../../../../components/core/LabeledTextField';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import Editorbox from '../../../../components/Wizard/Editorbox';
import { getSmsMarketing, setSmsMarketing } from '../../../../redux/reducers/smsSlice'

const SmsMarketingDialog = ({
    classes,
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null
}, ...props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [values, setValues] = useState({
        SendDate: null,
        SendTime: null,
        FromNumber: "",
        SendSmsTo: -1
    })
    const [linkToUpdate, setLinkToUpdate] = useState(null);
    const [linkToCampaign, setLinkToCampaign] = useState(null);
    const [linkToUpdateEnabled, setLinkToUpdateEnabled] = useState(true);
    const [linkToCampaignEnabled, setLinkToCampaignEnabled] = useState(true);
    const { newsletterSettings } = useSelector(state => state.newsletter);
    const { isRTL } = useSelector(state => state.core);
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
            const response = dispatch(getSmsMarketing(newsletterSettings?.CampaignID));
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

    const handleUpdate = (smsModel) => {
        setLinkToUpdateEnabled(smsModel?.Text?.indexOf(`https://${window.location.hostname}/Pulseem/Home/UpdateClientInfo/?ClientID===ClientID==&CampaignID=${newsletterSettings.CampaignID}&Culture=he-IL`) === -1)
        setLinkToCampaignEnabled(smsModel?.Text?.indexOf(`##RedirectToEmail##${newsletterSettings.CampaignID}##ClientID##`) === -1)
    }

    return {
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
                    <FormControl variant="standard" className={classes.selectInputFormControl} style={{ width: '100%' }}>
                        <Select
                            style={{
                                height: 40
                            }}
                            placeholder={t('campaigns.newsLetterEditor.sendSettings.sendTo')}
                            className={classes.select}
                            labelId="sendToSelect"
                            id="sendToSelect"
                            value={values.SendTo}
                            onChange={(e) => setValues({ ...values, SendSmsTo: e.target.value })}
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
                    </FormControl >
                </Grid>
                <Grid item sm={12} md={6}>
                    <LabeledTextField
                        textFieldProps={{
                            className: classes.NoPaddingtextField,
                            // helperText: "Some important text",
                            onChange: (e) => {
                                setValues({ ...values, FromNumber: e.target.value })
                            },
                            onKeyPress: (e) => {
                                if (!e.key.match(/^[0-9]*$/)) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                }
                            }
                            ,
                            value: values.FromNumber
                        }}
                        labelProps={{
                            label: t('campaigns.newsLetterEditor.sendSettings.smsMarketing.fromNumber')
                        }}
                        containerProps={{
                            direction: 'column'
                        }}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingDate')}
                    </Typography>
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={values.SendDate}
                        onChange={(value) => setValues({ ...values, SendDate: value })}
                        placeholder={t("notifications.date")}
                        timePickerOpen={true}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.smsMarketing.sendingTime')}
                    </Typography>
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={values.SendTime}
                        onTimeChange={(value) => setValues({ ...values, SendTime: value })}
                        placeholder={t("notifications.hour")}
                        isTimePicker={true}
                        ampm={false}
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
                        values={values}
                        onUpdate={handleUpdate}
                        onFromNumberInit={(fromNumber) => setValues({ ...values, FromNumber: fromNumber })}
                        linkToCampaign={linkToCampaign}
                        linkToUpdate={linkToUpdate} />
                </Grid>
            </Grid>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Yes"),
        cancelText: t("common.Cancel"),
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default SmsMarketingDialog