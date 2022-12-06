import React, { useEffect, useState } from "react";
import { Checkbox, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import { FaRegCalendarAlt } from "react-icons/fa";
import { DateField } from "../managment/index";
import { Grid, Box, FormControlLabel, FormControl, RadioGroup, Radio, FormHelperText, Divider } from "@material-ui/core";
import clsx from "clsx";
import { Stack } from "@mui/material";


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
    ToastMessages,
    setToastMessage = () => null,
    enablePulse = false,
    campaign = null,
    onUpdateCampaign = () => null,
    handlePulseDialog = () => null
}) => {
    const { t } = useTranslation();
    const styles = useStyles();
    const { extraData } = useSelector((state) => state.sms);

    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    const handleSendType = (e) => {
        onUpdateCampaign({ ...campaign, SendingMethod: e.target.value, IsBestTime: false })
    }

    const handleDatePicker = (value) => {
        onUpdateCampaign({ ...campaign, SendDate: value })
    }

    const handleTimePicker = (value) => {
        var date = moment(campaign.SendDate);
        var time = moment(value, "HH:mm");

        date.set({
            hour: time.get("hour"),
            minute: time.get("minute"),
        });

        if (date < moment()) {
            date = moment();
            setToastMessage(ToastMessages.DATE_PASS);
        }

        onUpdateCampaign({ ...campaign, SendDate: date, timePickerOpen: false });
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
        onUpdateCampaign({ ...campaign, ...temp });
    }

    const handleSpecialDayChange = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
            onUpdateCampaign({ ...campaign, daysBeforeAfter: e.target.value })
        }

    }

    const handlebef = () => {
        onUpdateCampaign({ ...campaign, afterClick: false, toggleA: false, toggleB: true })
    };

    const handleaf = () => {
        onUpdateCampaign({ ...campaign, afterClick: true, toggleA: true, toggleB: false })
    };

    const handleRadioTime = (value) => {
        onUpdateCampaign({ ...campaign, sendTime: value })
    }

    const renderForm = () => {
        return (
            <div>
                <h2
                    className={classes.sectionTitle}
                    style={{ marginTop: windowSize === "xs" ? 15 : null }}
                >
                    {t("notifications.whenToSend")}
                </h2>
                {/* {console.log('SendingMethod:', sendingTimeFormValues.SendingMethod)} */}
                <FormControl component="fieldset">
                    <RadioGroup
                        aria-label="gender"
                        name="SendingMethod"
                        onChange={handleSendType}
                        value={`${campaign.SendingMethod}`}
                    >
                        <FormControlLabel
                            value="1"
                            control={<Radio color="primary" className={`${campaign.SendingMethod}` !== "1" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
                            label={
                                <span className={classes.radioText}>
                                    {t("notifications.immediateSend")}
                                </span>
                            }
                        />
                        <FormHelperText className={clsx(classes.helpText, classes.mb0)}>
                            {t("notifications.immediateDescription")}
                        </FormHelperText>
                        <Stack direction='row' alignItems='center'>
                            <Checkbox
                                className={classes.ml20}
                                disabled={`${campaign.SendingMethod}` !== "1"}
                                checked={`${campaign.SendingMethod}` === "1" && campaign.IsBestTime}
                                color="primary"
                                inputProps={{ "aria-label": "secondary checkbox" }}
                                onClick={() => {
                                    onUpdateCampaign({ ...campaign, IsBestTime: !campaign.IsBestTime })
                                }}
                            />
                            <span><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </span>
                            <Tooltip
                                disableFocusListener
                                title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                // classes={{ tooltip: styles.customWidth }}
                                style={{ marginInlineStart: "5px" }}
                            >
                                <span className={classes.bodyInfo}>i</span>
                            </Tooltip>
                        </Stack>
                        <FormControlLabel
                            value="2"
                            control={<Radio color="primary" className={`${campaign.SendingMethod}` !== "2" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
                            label={
                                <span className={classes.radioText}>
                                    {t("notifications.futureSend")}
                                </span>
                            }
                        />
                        <Box
                            className={classes.dateBox}
                            style={{
                                pointerEvents: `${campaign.SendingMethod}` === "2" ? "auto" : "none",
                            }}
                        >
                            <DateField
                                minDate={moment()}
                                classes={classes}
                                value={`${campaign.SendingMethod}` === "2" ? campaign.SendDate : null}
                                onChange={handleDatePicker}
                                placeholder={t("notifications.date")}
                                timePickerOpen={true}
                                dateActive={`${campaign.SendingMethod}` === "2" ? false : true}
                            />
                        </Box>
                        <Box
                            className={classes.dateBox}
                            style={{
                                marginTop: 10,
                                pointerEvents: `${campaign.SendingMethod}` === "2" ? "auto" : "none",
                            }}
                        >
                            <DateField
                                minDate={moment()}
                                classes={classes}
                                value={`${campaign.SendingMethod}` === "2" ? campaign.SendDate : null}
                                onTimeChange={handleTimePicker}
                                placeholder={t("notifications.hour")}
                                isTimePicker={true}
                                ampm={false}
                                timeActive={`${campaign.SendingMethod}` === "2" ? false : true}
                                timePickerOpen={campaign.timePickerOpen}
                            />
                        </Box>
                        <Stack direction='row' alignItems='center'>
                            <Checkbox
                                className={classes.ml20}
                                disabled={`${campaign.SendingMethod}` !== "2"}
                                checked={`${campaign.SendingMethod}` === "2" && campaign.IsBestTime}
                                color="primary"
                                inputProps={{ "aria-label": "secondary checkbox" }}
                                onClick={() => {
                                    onUpdateCampaign({ ...campaign, IsBestTime: !campaign.IsBestTime })
                                }}
                            />
                            <span><b>{t('campaigns.newsLetterEditor.sendSettings.optimalSending')} - </b> {t('campaigns.newsLetterEditor.sendSettings.optimalSendCBDesc')}. </span>
                            <Tooltip
                                disableFocusListener
                                title={t('campaigns.newsLetterEditor.sendSettings.optimalSendCBTooltip')}
                                // classes={{ tooltip: styles.customWidth }}
                                style={{ marginInlineStart: "5px" }}
                            >
                                <span className={classes.bodyInfo}>i</span>
                            </Tooltip>
                        </Stack>
                        <FormControlLabel
                            value="3"
                            control={<Radio color="primary" className={`${campaign.SendingMethod}` !== "3" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
                            label={
                                <span className={classes.radioText}>
                                    {t("mainReport.specialDate")}
                                </span>
                            }
                        />
                        <Box
                            className={classes.dateBox}
                            style={{
                                marginTop: 10,
                                pointerEvents: `${campaign.SendingMethod}` === "3" ? "auto" : "none",
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
                                disabled={`${campaign.SendingMethod}` === "3" ? false : true}
                                onChange={(e) => { handleSelectChange(e) }}
                                value={`${campaign.SendingMethod}` === "3" ? campaign.spectialDateFieldID : "0"}
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
                                pointerEvents: `${campaign.SendingMethod}` === "3" ? "auto" : "none",
                            }}
                        >
                            <input
                                type="text"
                                className={classes.inputDays}
                                placeholder="0"
                                disabled={`${campaign.SendingMethod}` === "3" ? false : true}
                                value={`${campaign.SendingMethod}` === "3" ? campaign.daysBeforeAfter : ""}
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
                                            `${campaign.SendingMethod}` === "3" ? campaign.toggleB ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                                        }
                                        onClick={() => {
                                            handlebef();
                                        }}
                                    >
                                        {t("mainReport.before")}
                                    </span>
                                    <span
                                        className={
                                            `${campaign.SendingMethod}` === "3" ? campaign.toggleA ? classes.beforeActive : classes.before : classes.disabledBefore
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
                                            `${campaign.SendingMethod}` === "3" ? campaign.toggleB ? classes.beforeActive : classes.before : classes.disabledBefore
                                        }
                                        onClick={() => {
                                            handlebef();
                                        }}
                                    >
                                        {t("mainReport.before")}
                                    </span>
                                    <span
                                        className={
                                            `${campaign.SendingMethod}` === "3" ? campaign.toggleA ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
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
                                pointerEvents: `${campaign.SendingMethod}` === "3" ? "auto" : "none",
                                marginBottom: '1rem'
                            }}
                        >
                            <DateField
                                classes={classes}
                                value={`${campaign.SendingMethod}` === "3" ? campaign.sendTime : null}

                                onTimeChange={handleRadioTime}
                                placeholder={t("notifications.hour")}
                                isTimePicker={true}
                                buttons={{
                                    ok: t("common.confirm"),
                                    cancel: t("common.cancel"),
                                }}
                                ampm={false}
                                timePickerOpen={campaign.timePickerOpen}
                                timeActive={`${campaign.SendingMethod}` === "3" ? false : true}
                                disabled={`${campaign.SendingMethod}` === "3" ? false : true}
                                autoOk
                            />
                        </Box>
                    </RadioGroup>
                </FormControl>
                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
                <Stack className={classes.pulseDiv} spacing={2} direction="row">
                    <Stack direction="row" justifyContent="center" alignItems="center">
                        <span
                            className={enablePulse ? classes.pulse : classes.pulseDisable}
                            onClick={() => {
                                handlePulseDialog();
                            }}
                        >
                            <FaRegCalendarAlt style={{ fontSize: '125%' }} />
                            {t("mainReport.pulseSend")}
                        </span>
                        <Tooltip
                            disableFocusListener
                            title={t("smsReport.pulseSendTip")}
                            classes={{ tooltip: styles.customWidth }}
                        >
                            <span className={classes.bodyInfo}>i</span>
                        </Tooltip>
                    </Stack>
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

                    {campaign?.PulseAmount && campaign?.PulseAmount > 0 ? (
                        <span style={{ marginBottom: "5px", marginTop: "5px" }}>
                            {t("smsReport.packetSend")} - {campaign.PulseAmount} {t("sms.recipients")} {" "} 
                            {t("sms.every")} {campaign.TimeInterval} {t("common.hours")}
                        </span>
                    ) : null}
                </div>
            </div>
        );
    }

    return renderForm()
}

export default SendingMethod