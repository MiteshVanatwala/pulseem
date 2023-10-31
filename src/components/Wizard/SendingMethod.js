import { FormControl, FormControlLabel, Box, Accordion, AccordionDetails, AccordionSummary, Checkbox, Tooltip, Typography, Radio, FormHelperText, Divider, MenuItem, IconButton } from "@material-ui/core";
import Select from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import { DateField } from "../managment/index";
import clsx from "clsx";
import { Stack } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import DynamicConfirmDialog from "../DialogTemplates/DynamicConfirmDialog";
import { IoIosArrowDown } from "react-icons/io";
import { BsInfoCircle } from "react-icons/bs";


const useStyles = makeStyles((theme) => ({
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center'
    },
    noMaxWidth: {
        maxWidth: "none",
    },
}));

const SendingMethod = ({
    extraButtons = null,
    classes,
    campaign = null,
    disabled = false,
    onUpdateCampaign = () => null
}) => {
    const { t } = useTranslation();
    const { extraData } = useSelector((state) => state.sms);
    const [date, setDate] = useState(moment(campaign?.SendDate))
    const [isBestTime, setIsBestTime] = useState(false);
    const [isBestTimeFuture, setIsBestTimeFuture] = useState(false);
    const [isAfterDay, setIsAfterDay] = useState(false);
    const [showOptimalPulseConflict, setShowOptimalPulseConflict] = useState(false);
    const sendDelayRef = useRef(null);
    const styles = useStyles();

    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    const handleSendType = (sendingMethod) => {
        setIsBestTime(false);
        setIsBestTimeFuture(false);
        setIsAfterDay(false);
        sendDelayRef.current.value = '';

        onUpdateCampaign({ SendingMethod: sendingMethod, IsBestTime: false, SendDate: null, AutoSendingByUserField: "0", AutoSendDelay: '' })
    }

    const handleDatePicker = (value) => {
        const finalDate = moment(value, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: finalDate.format("HH"), m: finalDate.format("mm") });
        const newVal = finalDate.format();

        setDate(newVal)
    }

    useEffect(() => {
        if (date) {
            onUpdateCampaign({ SendDate: date });
        }
    }, [date]);
    useEffect(() => {
        if (campaign.SendingMethod === 1) {
            onUpdateCampaign({ ...campaign, IsBestTime: isBestTime, PulseAmount: '', TimeInterval: '' });
        }
    }, [isBestTime])
    useEffect(() => {
        if (campaign.SendingMethod === 2) {
            onUpdateCampaign({ IsBestTime: isBestTimeFuture, PulseAmount: '', TimeInterval: '' });
        }
    }, [isBestTimeFuture]);
    useEffect(() => {
        if (campaign && campaign.CampaignID) {
            if (campaign?.SendingMethod === 1 && campaign?.IsBestTime) {
                setIsBestTime(true)
            }
            if (campaign?.SendingMethod === 2 && campaign?.IsBestTime) {
                setIsBestTimeFuture(true)
            }
            if (campaign?.SendingMethod === 3) {
                sendDelayRef.current.value = campaign?.AutoSendDelay === 0 ? '' : (campaign?.AutoSendDelay.toString().replace('-', '') ?? '');
                setIsAfterDay(campaign?.AutoSendDelay > 0)
            }
        }
    }, [campaign])

    const handleTimePicker = (value) => {
        const finalDate = moment(value, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: finalDate.format("HH"), m: finalDate.format("mm") });
        const newVal = finalDate.format();
        setDate(newVal);
    }

    const handleSelectChange = (e) => {
        let temp = {
            selectedSpecialValue: ""
        }
        if (e.target.value !== "0") {
            Object.keys(extraData).map((item, i) => {
                if (e.target.value === i.toString()) {
                    temp.selectedSpecialValue = item;
                }
                else if (e.target.value === '5') {
                    temp.selectedSpecialValue = "Birthday";
                }
                else if (e.target.value === '7') {
                    temp.selectedSpecialValue = "Creation day";
                }
            })
        }
        onUpdateCampaign({ ...temp, AutoSendingByUserField: e.target.value });
    }

    const handleSpecialDayChange = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
            sendDelayRef.current.value = e.target.value;
            onUpdateCampaign({ AutoSendDelay: `${campaign.isAfterDay ? e.target.value : `-${e.target.value}`}` });
        }
    }

    const handlebef = () => {
        setIsAfterDay(false);
        onUpdateCampaign({ AutoSendDelay: `-${sendDelayRef.current.value}` })
    };

    const handleaf = () => {
        setIsAfterDay(true);
        onUpdateCampaign({ AutoSendDelay: sendDelayRef.current.value })
    };

    const onConfirmOptimalPulseConflict = (value) => {
        const isFuture = campaign.SendingMethod === 2;
        setShowOptimalPulseConflict(false);
        if (!isFuture) {
            setIsBestTime(value);
        }
        else {
            setIsBestTimeFuture(value);
        }
    }
    const onCancelOptimalPulseConflict = () => {
        setIsBestTime(false);
        setIsBestTimeFuture(false);
        setShowOptimalPulseConflict(false);
    }

    return (
        <div className={classes.h100}>
            <div>
                <h2
                    className={classes.sectionTitle}
                    style={{ marginTop: windowSize === "xs" ? 15 : null }}
                >
                    {t("notifications.whenToSend")}
                </h2>
                <FormControl component="fieldset" className={classes.dBlock}>
                    <Accordion expanded={campaign.SendingMethod === 1}
                        onChange={() => handleSendType(1)}
                        className={classes.noShadowAccordion}
                    >
                        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse} >
                            <FormControlLabel
                                value="1"
                                control={<Radio
                                    disabled={disabled}
                                    color="primary"
                                    style={{ paddingInlineStart: 0, paddingTop: 0 }}
                                    className={campaign.SendingMethod !== 1 ? classes.radioButtonDisabled : classes.radioButtonActive}
                                    checked={campaign.SendingMethod === 1} />}
                                label={
                                    <>
                                        <span className={classes.radioText} style={{ marginTop: 20 }}>
                                            {t("notifications.immediateSend")}
                                        </span>
                                        <FormHelperText className={classes.accordionHelpText}>
                                            {t("notifications.immediateDescription")}
                                        </FormHelperText>
                                    </>
                                }
                                onChange={() => handleSendType(1)}
                            />

                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction='column'>
                                <Stack direction='row' alignItems='center'>
                                    <Checkbox
                                        className={classes.ml20}
                                        disabled={campaign.SendingMethod !== 1 || disabled}
                                        checked={campaign.SendingMethod === 1 && isBestTime === true}
                                        color="primary"
                                        inputProps={{ "aria-label": "secondary checkbox" }}
                                        onClick={() => {
                                            if (campaign.PulseAmount > 0) {
                                                setShowOptimalPulseConflict(true);
                                            }
                                            else {
                                                onConfirmOptimalPulseConflict(!isBestTime)
                                            }
                                        }}
                                    />
                                    <Typography className={classes.font14}><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </Typography>
                                    <Tooltip
                                        disableFocusListener
                                        classes={{ tooltip: styles.customWidth }}
                                        title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                    >
                                        <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                                            <BsInfoCircle />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={campaign.SendingMethod === 2}
                        onChange={() => handleSendType(2)}
                        className={classes.noShadowAccordion}
                    >
                        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse} >
                            <FormControlLabel
                                value="1"
                                control={<Radio
                                    disabled={disabled}
                                    color="primary"
                                    style={{ paddingInlineStart: 0, paddingTop: 0 }}
                                    className={campaign.SendingMethod !== 2 ? classes.radioButtonDisabled : classes.radioButtonActive}
                                    checked={campaign.SendingMethod === 2} />}
                                label={
                                    <span className={classes.radioText} style={{ marginTop: 20 }}>
                                        {t("notifications.futureSend")}
                                    </span>
                                }
                                onChange={() => handleSendType(2)}
                            />

                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction='column'>
                                <Box
                                    className={classes.dateBox}
                                    style={{
                                        pointerEvents: campaign.SendingMethod === 2 ? "auto" : "none",
                                    }}
                                >
                                    <DateField
                                        minDate={moment()}
                                        classes={classes}
                                        value={campaign.SendingMethod === 2 ? campaign.SendDate : null}
                                        onChange={handleDatePicker}
                                        placeholder={t("notifications.date")}
                                        timePickerOpen={true}
                                        dateActive={campaign.SendingMethod === 2 ? false : true}
                                    />
                                </Box>
                                <Box
                                    className={clsx(classes.dateBox, classes.pbt15)}
                                    style={{
                                        marginTop: 10,
                                        pointerEvents: campaign.SendingMethod === 2 ? "auto" : "none",
                                    }}
                                >
                                    <DateField
                                        minDate={moment()}
                                        classes={classes}
                                        value={campaign.SendingMethod === 2 ? campaign.SendDate : null}
                                        onTimeChange={handleTimePicker}
                                        placeholder={t("notifications.hour")}
                                        isTimePicker={true}
                                        ampm={false}
                                        timeActive={campaign.SendingMethod === 2 ? false : true}
                                        timePickerOpen={campaign.timePickerOpen}
                                    />
                                </Box>
                                <Stack direction='row' alignItems='center' className={classes.pbt15}>
                                    <Checkbox
                                        className={classes.ml20}
                                        disabled={campaign.SendingMethod !== 2 || disabled}
                                        checked={campaign.SendingMethod === 2 && isBestTimeFuture === true}
                                        color="primary"
                                        inputProps={{ "aria-label": "secondary checkbox" }}
                                        onClick={() => {
                                            if (campaign.PulseAmount > 0) {
                                                setShowOptimalPulseConflict(true);
                                            }
                                            else {
                                                onConfirmOptimalPulseConflict(!isBestTimeFuture);
                                            }
                                        }}
                                    />
                                    <Typography className={classes.font14}><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </Typography>
                                    <Tooltip
                                        disableFocusListener
                                        title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                        classes={{ tooltip: styles.customWidth }}
                                        style={{ marginInlineStart: "5px" }}
                                    >
                                        <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                                            <BsInfoCircle />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={campaign.SendingMethod === 3}
                        onChange={() => handleSendType(3)}
                        className={classes.noShadowAccordion}
                    >
                        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse} >
                            <FormControlLabel
                                value="1"
                                control={<Radio
                                    disabled={disabled}
                                    color="primary"
                                    style={{ paddingInlineStart: 0, paddingTop: 0 }}
                                    className={campaign.SendingMethod !== 3 ? classes.radioButtonDisabled : classes.radioButtonActive}
                                    checked={campaign.SendingMethod === 3} />}
                                label={
                                    <span className={classes.radioText} style={{ marginTop: 20 }}>
                                        {t("mainReport.specialDate")}
                                    </span>
                                }
                                onChange={() => handleSendType(3)}
                            />

                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction='column'>
                                <Box
                                    className={classes.dateBox}
                                    style={{
                                        marginTop: 10,
                                        pointerEvents: campaign.SendingMethod === 3 ? "auto" : "none",
                                    }}
                                >
                                    <FormControl
                                        className={clsx(classes.selectInputFormControl, classes.w100, classes.mb10)}
                                    >
                                        <Select
                                            variant="standard"
                                            name="sendingMethod"
                                            disabled={campaign.SendingMethod === 3 ? false : true}
                                            onChange={(e) => { handleSelectChange(e) }}
                                            value={campaign.SendingMethod === 3 ? campaign?.AutoSendingByUserField?.toString() : "0"}
                                            className={classes.pbt5}
                                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 200,
                                                        direction: isRTL ? 'rtl' : 'ltr'
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value='0'>{t("common.select")}</MenuItem>
                                            <MenuItem value='5'>{t("mainReport.birthday")}</MenuItem>
                                            <MenuItem value='6'>{t("common.reminder_date")}</MenuItem>
                                            <MenuItem value='7'>{t("mainReport.creationDay")}</MenuItem>
                                            {extraData && Object.keys(extraData).map((item, i) => {
                                                if (extraData[item]) {
                                                    return item.toLowerCase().indexOf('extradate') > -1 && <MenuItem key={`extrakey_${i}`} value={i + 1}>{Object.values(extraData[item])}</MenuItem>;
                                                }
                                            })}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box
                                    className={classes.dateBox}
                                    style={{
                                        marginTop: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        width: "370px",
                                        pointerEvents: campaign.SendingMethod === 3 ? "auto" : "none",
                                    }}
                                >
                                    <input
                                        ref={sendDelayRef}
                                        type="text"
                                        className={classes.inputDays}
                                        placeholder={t('smsReport.insert')}
                                        value={sendDelayRef.current?.value}
                                        onChange={(e) => { handleSpecialDayChange(e) }}
                                        maxLength="3"
                                    />

                                    <span style={{ marginInlineEnd: "8px", marginBottom: "8px", fontSize: 14 }}>
                                        {t("mainReport.days")}
                                    </span>
                                    <div style={{ display: "flex" }}>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 && !isAfterDay ? classes.beforeActive : classes.before
                                            }
                                            onClick={() => {
                                                handlebef();
                                            }}
                                        >
                                            {t("mainReport.before")}
                                        </span>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 && isAfterDay ? classes.afterActive : classes.after
                                            }
                                            onClick={() => {
                                                handleaf();
                                            }}
                                        >
                                            {t("mainReport.after")}
                                        </span>

                                    </div>
                                </Box>
                                <Box
                                    className={clsx(classes.dateBox, classes.pbt15)}
                                    style={{
                                        marginTop: 10,
                                        pointerEvents: campaign.SendingMethod === 3 ? "auto" : "none",
                                        marginBottom: '1rem'
                                    }}
                                >
                                    <DateField
                                        classes={classes}
                                        value={campaign.SendingMethod === 3 ? campaign.SendDate : moment()}
                                        onTimeChange={(value) => handleTimePicker(value)}
                                        placeholder={t("notifications.hour")}
                                        isTimePicker={true}
                                        buttons={{
                                            ok: t("common.confirm"),
                                            cancel: t("common.cancel"),
                                        }}
                                        ampm={false}
                                        timePickerOpen={campaign.timePickerOpen}
                                        timeActive={campaign.SendingMethod === 3 ? false : true}
                                        disabled={campaign.SendingMethod === 3 ? false : true}
                                        autoOk
                                    />
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </FormControl>
            </div>
            <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
            <Stack className={classes.pulseDiv} spacing={2} direction="row">
                {extraButtons}
            </Stack>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: "#7f7f7f",
                    fontWeight: "400",
                    fontSize: "14px",
                }}
            >

                {campaign?.PulseAmount && campaign?.PulseAmount > 0 && campaign.SendingMethod !== 3 ? (
                    <span style={{ marginBottom: "5px", marginTop: "5px" }}>
                        {t("smsReport.packetSend")} - {campaign.PulseAmount} {parseInt(campaign.PulseAmount) === 1 ? t("common.Recipient") : t("common.Recipients")} {" "}
                        {t("sms.every")} {campaign.TimeInterval} {parseInt(campaign.TimeInterval) === 1 ? t("sms.hour") : t("sms.hours")}
                    </span>
                ) : null}
            </div>
            <DynamicConfirmDialog
                classes={classes}
                isOpen={showOptimalPulseConflict}
                title={t('campaigns.newsLetterMgmt.payAttention')}
                text={t('campaigns.newsLetterEditor.sendSettings.optimalPulseConflictMessage')}
                onConfirm={() => onConfirmOptimalPulseConflict(true)}
                onCancel={() => onCancelOptimalPulseConflict()}
            />
        </div>
    );
}

export default SendingMethod