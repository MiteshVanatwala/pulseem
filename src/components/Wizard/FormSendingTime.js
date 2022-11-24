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


const FormSendingTime = ({
    extraButtons = null,
    classes,
    ToastMessages,
    setToastMessage = () => null,
    enablePulse = false,
    sendingTimeFormValues = null,
    setSendingTimeFormValues = () => null,
    handlePulseDialog = () => null
}) => {
    const { t } = useTranslation();
    const styles = useStyles();
    const { extraData } = useSelector((state) => state.sms);

    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    const handleSendType = (e) => {
        setSendingTimeFormValues({ ...sendingTimeFormValues, sendType: e.target.value, SendingMethod: e.target.value, IsBestTime: false })
    }

    const handleDatePicker = (value) => {
        setSendingTimeFormValues({ ...sendingTimeFormValues, sendDate: value })
    }

    const handleTimePicker = (value) => {
        var date = moment(sendingTimeFormValues.sendDate);
        var time = moment(value, "HH:mm");

        date.set({
            hour: time.get("hour"),
            minute: time.get("minute"),
        });

        if (date < moment()) {
            date = moment();
            setToastMessage(ToastMessages.DATE_PASS);
        }

        setSendingTimeFormValues({ ...sendingTimeFormValues, sendDate: date, timePickerOpen: false });
    }

    const handleSelectChange = (e) => {
        let temp = {
            spectialDateFieldID: e.target.event,
            selectedSpecialValue: ""
        }
        if (e.target.value !== "0") {
            Object.keys(extraData).map((item, i) => {
                if (e.target.value == i + 3) {
                    temp.selectedSpecialValue = item;
                }
                else if (e.target.value == 1) {
                    temp.selectedSpecialValue = "Birthday";
                }
                else if (e.target.value == 2) {
                    temp.selectedSpecialValue = "Creation day";
                }
            })
        }
        setSendingTimeFormValues({ ...sendingTimeFormValues, ...temp });
    }

    const handleSpecialDayChange = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
            setSendingTimeFormValues({ ...sendingTimeFormValues, daysBeforeAfter: e.target.value })
        }

    }

    const handlebef = () => {
        setSendingTimeFormValues({ ...sendingTimeFormValues, afterClick: false, toggleA: false, toggleB: true })
    };

    const handleaf = () => {
        setSendingTimeFormValues({ ...sendingTimeFormValues, afterClick: true, toggleA: true, toggleB: false })
    };

    const handleRadioTime = (value) => {
        setSendingTimeFormValues({ ...sendingTimeFormValues, sendTime: value })
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
                        value={`${sendingTimeFormValues.SendingMethod}`}
                    >
                        <FormControlLabel
                            value="1"
                            control={<Radio color="primary" className={`${sendingTimeFormValues.SendingMethod}` !== "1" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
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
                                disabled={`${sendingTimeFormValues.SendingMethod}` !== "1"}
                                checked={`${sendingTimeFormValues.SendingMethod}` === "1" && sendingTimeFormValues.IsBestTime}
                                color="primary"
                                inputProps={{ "aria-label": "secondary checkbox" }}
                                onClick={() => {
                                    setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: !sendingTimeFormValues.IsBestTime })
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
                            control={<Radio color="primary" className={`${sendingTimeFormValues.SendingMethod}` !== "2" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
                            label={
                                <span className={classes.radioText}>
                                    {t("notifications.futureSend")}
                                </span>
                            }
                        />
                        <Box
                            className={classes.dateBox}
                            style={{
                                pointerEvents: `${sendingTimeFormValues.SendingMethod}` == "2" ? "auto" : "none",
                            }}
                        >
                            <DateField
                                minDate={moment()}
                                classes={classes}
                                value={`${sendingTimeFormValues.SendingMethod}` == "2" ? sendingTimeFormValues.sendDate : null}
                                onChange={handleDatePicker}
                                placeholder={t("notifications.date")}
                                timePickerOpen={true}
                                dateActive={`${sendingTimeFormValues.SendingMethod}` == "2" ? false : true}
                            />
                        </Box>
                        <Box
                            className={classes.dateBox}
                            style={{
                                marginTop: 10,
                                pointerEvents: `${sendingTimeFormValues.SendingMethod}` == "2" ? "auto" : "none",
                            }}
                        >
                            <DateField
                                minDate={moment()}
                                classes={classes}
                                value={`${sendingTimeFormValues.SendingMethod}` == "2" ? sendingTimeFormValues.sendDate : null}
                                onTimeChange={handleTimePicker}
                                placeholder={t("notifications.hour")}
                                isTimePicker={true}
                                ampm={false}
                                timeActive={`${sendingTimeFormValues.SendingMethod}` == "2" ? false : true}
                                timePickerOpen={sendingTimeFormValues.timePickerOpen}
                            />
                        </Box>
                        <Stack direction='row' alignItems='center'>
                            <Checkbox
                                className={classes.ml20}
                                disabled={`${sendingTimeFormValues.SendingMethod}` !== "2"}
                                checked={`${sendingTimeFormValues.SendingMethod}` === "2" && sendingTimeFormValues.IsBestTime}
                                color="primary"
                                inputProps={{ "aria-label": "secondary checkbox" }}
                                onClick={() => {
                                    setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: !sendingTimeFormValues.IsBestTime })
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
                            control={<Radio color="primary" className={`${sendingTimeFormValues.SendingMethod}` !== "3" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
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
                                pointerEvents: `${sendingTimeFormValues.SendingMethod}` == "3" ? "auto" : "none",
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
                                disabled={`${sendingTimeFormValues.SendingMethod}` === "3" ? false : true}
                                onChange={(e) => { handleSelectChange(e) }}
                                value={`${sendingTimeFormValues.SendingMethod}` === "3" ? sendingTimeFormValues.spectialDateFieldID : "0"}
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
                                pointerEvents: `${sendingTimeFormValues.SendingMethod}` === "3" ? "auto" : "none",
                            }}
                        >
                            <input
                                type="text"
                                className={classes.inputDays}
                                placeholder="0"
                                disabled={`${sendingTimeFormValues.SendingMethod}` == "3" ? false : true}
                                value={`${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.daysBeforeAfter : ""}
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
                                            `${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.toggleB ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                                        }
                                        onClick={() => {
                                            handlebef();
                                        }}
                                    >
                                        {t("mainReport.before")}
                                    </span>
                                    <span
                                        className={
                                            `${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.toggleA ? classes.beforeActive : classes.before : classes.disabledBefore
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
                                            `${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.toggleB ? classes.beforeActive : classes.before : classes.disabledBefore
                                        }
                                        onClick={() => {
                                            handlebef();
                                        }}
                                    >
                                        {t("mainReport.before")}
                                    </span>
                                    <span
                                        className={
                                            `${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.toggleA ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
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
                                pointerEvents: `${sendingTimeFormValues.SendingMethod}` == "3" ? "auto" : "none",
                                marginBottom: '1rem'
                            }}
                        >
                            <DateField
                                classes={classes}
                                value={`${sendingTimeFormValues.SendingMethod}` == "3" ? sendingTimeFormValues.sendTime : null}

                                onTimeChange={handleRadioTime}
                                placeholder={t("notifications.hour")}
                                isTimePicker={true}
                                buttons={{
                                    ok: t("common.confirm"),
                                    cancel: t("common.cancel"),
                                }}
                                ampm={false}
                                timePickerOpen={sendingTimeFormValues.timePickerOpen}
                                timeActive={`${sendingTimeFormValues.SendingMethod}` == "3" ? false : true}
                                disabled={`${sendingTimeFormValues.SendingMethod}` == "3" ? false : true}
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

                    {sendingTimeFormValues.togglePulse ? (
                        <span style={{ marginBottom: "5px", marginTop: "5px" }}>
                            {t("smsReport.packetSend")} - {sendingTimeFormValues.PulseAmount} {sendingTimeFormValues.pulsePer == "" || sendingTimeFormValues.pulsePer == "recipients" ? t("sms.recipients") : t("common.Percent")} {" "}
                            {t("sms.every")} {sendingTimeFormValues.TimeInterval} {sendingTimeFormValues.hourName == "" || sendingTimeFormValues.minName == "mins" ? t("common.minutes") : t("common.hours")}
                        </span>
                    ) : null}
                    {sendingTimeFormValues.toggleRandom ? (
                        <span>{t("smsReport.randomSend")} - {sendingTimeFormValues.random} {t("smsReport.randomRecipients")}</span>
                    ) : null}
                </div>
            </div>
        );
    }

    return renderForm()
}

export default FormSendingTime