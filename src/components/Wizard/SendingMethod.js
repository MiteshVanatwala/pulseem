import { Box, Accordion, AccordionDetails, AccordionSummary, Checkbox, Tooltip, Typography, Radio, FormHelperText, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import { DateField } from "../managment/index";
import clsx from "clsx";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";


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
    onUpdateCampaign = () => null
}) => {
    const { t } = useTranslation();
    const styles = useStyles();
    const { extraData } = useSelector((state) => state.sms);
    const [date, setDate] = useState(moment(campaign?.SendDate))
    const [isBestTime, setIsBestTime] = useState(false);
    const [isBestTimeFuture, setIsBestTimeFuture] = useState(false);

    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    const handleSendType = (sendingMethod) => {
        setIsBestTime(false);
        setIsBestTimeFuture(false);
        onUpdateCampaign({ SendingMethod: sendingMethod, IsBestTime: false })
    }

    const handleDatePicker = (value) => {
        setDate(moment(value))
    }

    useEffect(() => {
        if (date) {
            onUpdateCampaign({ SendDate: date });
        }
    }, [date]);
    useEffect(() => {
        if (campaign.SendingMethod === 1) {
            onUpdateCampaign({ IsBestTime: isBestTime });
        }
    }, [isBestTime])
    useEffect(() => {
        if (campaign.SendingMethod === 2) {
            onUpdateCampaign({ IsBestTime: isBestTimeFuture });
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
            spectialDateFieldID: e.target.event,
            selectedSpecialValue: ""
        }
        if (e.target.value !== "0") {
            Object.keys(extraData).map((item, i) => {
                if (e.target.value === i + 3) {
                    temp.selectedSpecialValue = item;
                }
                else if (e.target.value === 1) {
                    temp.selectedSpecialValue = "Birthday";
                }
                else if (e.target.value === 2) {
                    temp.selectedSpecialValue = "Creation day";
                }
            })
        }
        onUpdateCampaign({ ...temp });
    }

    const handleSpecialDayChange = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
            onUpdateCampaign({ DaysBeforeAfter: e.target.value })
        }

    }

    const handlebef = () => {
        onUpdateCampaign({ afterClick: false, ToggleA: false, ToggleB: true })
    };

    const handleaf = () => {
        onUpdateCampaign({ afterClick: true, ToggleA: true, ToggleB: false })
    };

    return (
        <div className={classes.h100}>
            <div style={{ height: '85%' }}>
                <h2
                    className={classes.sectionTitle}
                    style={{ marginTop: windowSize === "xs" ? 15 : 5 }}
                >
                    {t("notifications.whenToSend")}
                </h2>
                <Accordion expanded={campaign.SendingMethod === 1}
                    onChange={() => handleSendType(1)}
                    className={classes.noShadowAccordion}
                >
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse}
                        expandIcon={<Radio color="primary" name="cSendingMethod" checked={campaign.SendingMethod === 1} className={campaign.SendingMethod !== 1 ? classes.radioButtonDisabled : classes.radioButtonActive} />}>
                        <Typography>{t("notifications.immediateSend")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack direction='column'>
                            <FormHelperText className={clsx(classes.helpText, classes.mb0)}>
                                {t("notifications.immediateDescription")}
                            </FormHelperText>
                            <Stack direction='row' alignItems='center'>
                                <Checkbox
                                    className={classes.ml20}
                                    disabled={campaign.SendingMethod !== 1}
                                    checked={campaign.SendingMethod === 1 && isBestTime === true}
                                    color="primary"
                                    inputProps={{ "aria-label": "secondary checkbox" }}
                                    onClick={() => {
                                        setIsBestTime(!isBestTime);
                                    }}
                                />
                                <Typography className={classes.font14}><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </Typography>
                                <Tooltip
                                    disableFocusListener
                                    title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                    // classes={{ tooltip: styles.customWidth }}
                                    style={{ marginInlineStart: "5px" }}
                                >
                                    <span className={classes.bodyInfo}>i</span>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={campaign.SendingMethod === 2}
                    onChange={() => handleSendType(2)}
                    className={classes.noShadowAccordion}
                >
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse}
                        expandIcon={<Radio color="primary" name="cSendingMethod" checked={campaign.SendingMethod === 2} className={campaign.SendingMethod !== 2 ? classes.radioButtonDisabled : classes.radioButtonActive} />}>
                        <Typography>{t("notifications.futureSend")}</Typography>
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
                                className={classes.dateBox}
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
                            <Stack direction='row' alignItems='center'>
                                <Checkbox
                                    className={classes.ml20}
                                    disabled={campaign.SendingMethod !== 2}
                                    checked={campaign.SendingMethod === 2 && isBestTimeFuture === true}
                                    color="primary"
                                    inputProps={{ "aria-label": "secondary checkbox" }}
                                    onClick={() => {
                                        setIsBestTimeFuture(!isBestTimeFuture);
                                    }}
                                />
                                <Typography className={classes.font14}><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </Typography>
                                <Tooltip
                                    disableFocusListener
                                    title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                    // classes={{ tooltip: styles.customWidth }}
                                    style={{ marginInlineStart: "5px" }}
                                >
                                    <span className={classes.bodyInfo}>i</span>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={campaign.SendingMethod === 3}
                    onChange={() => handleSendType(3)}
                    className={classes.noShadowAccordion}
                >
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" className={classes.rowReverse}
                        expandIcon={<Radio color="primary" name="cSendingMethod" checked={campaign.SendingMethod === 3} className={campaign.SendingMethod !== 3 ? classes.radioButtonDisabled : classes.radioButtonActive} />}>
                        <Typography>{t("mainReport.specialDate")}</Typography>
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
                                <select
                                    placeholder={t("common.select")}
                                    style={{
                                        border: "1px solid #818181",
                                        backgroundColor: "white",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        width: 300,
                                        outline: "none",
                                        marginBottom: "10px",
                                    }}
                                    disabled={campaign.SendingMethod === 3 ? false : true}
                                    onChange={(e) => { handleSelectChange(e) }}
                                    value={campaign.SendingMethod === 3 ? campaign.spectialDateFieldID : "0"}
                                >
                                    <option value="0">{t("common.select")}</option>
                                    <option value="1">{t("mainReport.birthday")}</option>
                                    <option value="2">{t("mainReport.creationDay")}</option>
                                    {extraData && Object.keys(extraData).map((item, i) => {
                                        if (extraData[item]) {
                                            return item.toLowerCase().indexOf('extradate') > -1 && <option value={i + 3} key={`extrakey_${i}`}>{Object.values(extraData[item])}</option>;
                                        }
                                        return <></>
                                    })}
                                </select>
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
                                    type="text"
                                    className={classes.inputDays}
                                    placeholder="0"
                                    disabled={campaign.SendingMethod === 3 ? false : true}
                                    value={campaign.SendingMethod === 3 ? campaign.DaysBeforeAfter : ""}
                                    onChange={(e) => { handleSpecialDayChange(e) }}
                                    maxLength="3"
                                />

                                <span style={{ marginInlineEnd: "8px", marginBottom: "8px", fontSize: 14 }}>
                                    {t("mainReport.days")}
                                </span>

                                {isRTL ?
                                    <div style={{ display: "flex" }}>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 ? campaign.ToggleB ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                                            }
                                            onClick={() => {
                                                handlebef();
                                            }}
                                        >
                                            {t("mainReport.before")}
                                        </span>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 ? campaign.ToggleA ? classes.beforeActive : classes.before : classes.disabledBefore
                                            }
                                            onClick={() => {
                                                handleaf();
                                            }}
                                        >
                                            {t("mainReport.after")}
                                        </span>

                                    </div> : <div style={{ display: "flex" }}>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 ? campaign.ToggleB ? classes.beforeActive : classes.before : classes.disabledBefore
                                            }
                                            onClick={() => {
                                                handlebef();
                                            }}
                                        >
                                            {t("mainReport.before")}
                                        </span>
                                        <span
                                            className={
                                                campaign.SendingMethod === 3 ? campaign.ToggleA ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                                            }
                                            onClick={() => {
                                                handleaf();
                                            }}
                                        >
                                            {t("mainReport.after")}
                                        </span>
                                    </div>}
                            </Box>
                            <Box
                                className={classes.dateBox}
                                style={{
                                    marginTop: 10,
                                    pointerEvents: campaign.SendingMethod === 3 ? "auto" : "none",
                                    marginBottom: '1rem'
                                }}
                            >
                                <DateField
                                    classes={classes}
                                    value={campaign.SendingMethod === 3 ? campaign.SendDate : null}
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
        </div>
    );
}

export default SendingMethod