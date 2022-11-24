import React from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useSelector } from 'react-redux';
import { Box, Checkbox, Typography } from '@material-ui/core';
import { Stack } from '@mui/material';

const PulseDialog = ({
    classes,
    sendingTimeFormValues = {},
    handleSetPulseData = () => null,
    selectedGroups = [],
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null
}) => {
    const { t } = useTranslation();
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );


    const handleTime = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            handleSetPulseData({ ...sendingTimeFormValues, TimeInterval: e.target.value, timeBool: false });
        }
    };
    const handleRandom = (e) => {
        handleSetPulseData({ ...sendingTimeFormValues, boolRandom: false });
        const re = /^[0-9\b]+$/;
        const totalRecipients = selectedGroups.reduce(function (a, b) {
            return a + b['Recipients'];
        }, 0);

        if ((e.target.value === '' || re.test(e.target.value))) {
            if (sendingTimeFormValues.pulseType === 1) {
                if (Number(e.target.value) > totalRecipients) {
                    handleSetPulseData({
                        ...sendingTimeFormValues, random: selectedGroups.reduce(function (a, b) {
                            return a + b['Recipients'];
                        }, 0), boolRandom: false
                    });
                }
                else {
                    handleSetPulseData({ ...sendingTimeFormValues, random: e.target.value, timeBool: false });
                }
            }
            else {
                if (Number(e.target.value) > totalRecipients) {
                    handleSetPulseData({ ...sendingTimeFormValues, random: totalRecipients });
                }
                else {
                    handleSetPulseData({ ...sendingTimeFormValues, random: e.target.value });
                }
            }
        }
    };
    const handlePulseInput = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value))) {
            let tempData = { ...sendingTimeFormValues }
            if (sendingTimeFormValues.pulseType === 1) {
                if (Number(e.target.value) > 100) {
                    tempData = { ...tempData, PulseAmount: "100" }
                    // handleSetPulseData({ ...sendingTimeFormValues, PulseAmount: "100" });
                    // setPulseAmount("100");
                }
                else {
                    tempData = { ...tempData, PulseAmount: e.target.value }
                    // handleSetPulseData({ ...sendingTimeFormValues, PulseAmount: e.target.value });
                    // setPulseAmount(e.target.value);
                }
            }
            else {
                if (Number(e.target.value) > selectedGroups.reduce(function (a, b) {
                    return a + b['Recipients'];
                }, 0)) {

                    // setPulseAmount(selectedGroups.reduce(function (a, b) {
                    //     return a + b['Recipients'];
                    // }, 0))
                    tempData = {
                        ...tempData, PulseAmount: selectedGroups.reduce(function (a, b) {
                            return a + b['Recipients'];
                        }, 0)
                    }
                    // handleSetPulseData({ ...sendingTimeFormValues, PulseAmount: selectedGroups.reduce(function (a, b) {
                    //     return a + b['Recipients'];
                    // }, 0) });
                }
                else {
                    tempData = { ...tempData, PulseAmount: e.target.value }
                    // handleSetPulseData({ ...sendingTimeFormValues, PulseAmount: e.target.value });
                    // setPulseAmount(e.target.value);
                }
            }
            tempData = { ...tempData, pulseBool: false }
            handleSetPulseData({ ...sendingTimeFormValues, ...tempData })
            // setpulseBool(false);
        }
    };

    return {
        title: t('smsReport.pulseSending'),
        showDivider: true,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\u0056'}
            </div>
        ),
        content: (
            <Box className={clsx(classes.pulseDialog, classes.mb25)}>
                <Box className={classes.mb15}
                >
                    <Checkbox
                        style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
                        checked={sendingTimeFormValues.togglePulse}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => {
                            handleSetPulseData({ ...sendingTimeFormValues, togglePulse: !sendingTimeFormValues.togglePulse, PulseAmount: '', TimeInterval: '' });
                        }}
                    />
                    <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.packetSend")}</Typography>
                </Box>
                <Stack
                    // className={classes.topPulseDiv}
                    direction="column"
                    spacing={2}
                >
                    <Stack>
                        <span
                        // className={classes.noOfReci}
                        >
                            {t("smsReport.noOfReciPulse")}
                        </span>
                        <div
                            className={classes.inputFieldDiv}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={sendingTimeFormValues.togglePulse ? false : true}
                                className={
                                    sendingTimeFormValues.togglePulse
                                        ? sendingTimeFormValues.pulseBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                value={sendingTimeFormValues.PulseAmount}
                                onChange={handlePulseInput}
                            />
                            {/* <div className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                                <span
                                    className={
                                        sendingTimeFormValues.togglePulse
                                            ? sendingTimeFormValues.pulseType === 1
                                                ? clsx(classes.percentTrue)
                                                : clsx(classes.toggleActive)
                                            : clsx(classes.toggleEnd)
                                    }
                                    onClick={() => {
                                        handleSetPulseData({ ...sendingTimeFormValues, pulseType: 1, pulsePer: 'percent', noTrue: false });
                                    }}
                                >
                                    {t("smsReport.percent")}
                                </span>
                                <span
                                    className={
                                        sendingTimeFormValues.togglePulse
                                            ? sendingTimeFormValues.pulseType === 2
                                                ? clsx(classes.reciTrue)
                                                : clsx(classes.reciActive)
                                            : clsx(classes.toggleStart)
                                    }
                                    onClick={() => {
                                        handleSetPulseData({ ...sendingTimeFormValues, pulseType: 2, pulsePer: 'recipients', pulseReci: "Recipients", noTrue: true });
                                    }}
                                >
                                    {t("smsReport.Reci")}
                                </span>
                            </div> */}
                        </div>
                    </Stack>
                    <Stack>
                        <span
                        // className={classes.noOfReci}
                        >
                            {t("smsReport.timeSend")}
                        </span>
                        <Box
                            className={classes.inputFieldDiv}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={sendingTimeFormValues.togglePulse ? false : true}
                                className={
                                    sendingTimeFormValues.togglePulse
                                        ? sendingTimeFormValues.timeBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                onChange={handleTime}
                                value={sendingTimeFormValues.TimeInterval}
                                maxLength="3"
                            />

                            {/* <Box className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                                <span
                                    className={
                                        sendingTimeFormValues.togglePulse
                                            ? sendingTimeFormValues.timeType === 2
                                                ? clsx(classes.percentTrue)
                                                : clsx(classes.toggleActive)
                                            : clsx(classes.toggleEnd)
                                    }
                                    onClick={() => {
                                        handleSetPulseData({ ...sendingTimeFormValues, timeType: 2, minName: '', hourName: "hours" });
                                    }}
                                >
                                    {t("smsReport.Hours")}
                                </span>
                                <span
                                    className={
                                        sendingTimeFormValues.togglePulse
                                            ? sendingTimeFormValues.timeType === 1
                                                ? clsx(classes.reciTrue)
                                                : clsx(classes.reciActive)
                                            : clsx(classes.toggleStart)
                                    }
                                    onClick={() => {
                                        handleSetPulseData({ ...sendingTimeFormValues, timeType: 1, minName: 'mins', hourName: "" });
                                    }}
                                >
                                    {t("smsReport.min")}
                                </span>
                            </Box> */}
                        </Box>
                    </Stack>
                </Stack>
                {/* <Box
                    className={classes.randomSendDiv}
                >
                    <Checkbox
                        style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
                        checked={sendingTimeFormValues.toggleRandom}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => {
                            handleSetPulseData({ ...sendingTimeFormValues, toggleRandom: !sendingTimeFormValues.toggleRandom, random: '' });
                        }}
                    />
                    <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.randomSend")}</Typography>
                </Box> */}
                {/* <Box className={classes.randomRows}>
                    <span
                        className={classes.randomReciSpan}
                    >
                        {t("smsReport.noOfReci")}
                    </span>
                    <input
                        type="text"
                        placeholder={t("smsReport.insert")}
                        disabled={sendingTimeFormValues.toggleRandom ? false : true}
                        className={
                            sendingTimeFormValues.toggleRandom
                                ? sendingTimeFormValues.boolRandom ? clsx(classes.ml5, classes.mr5, classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.ml5, classes.mr5)
                                : clsx(classes.pulseInsert, classes.ml5, classes.mr5)
                        }
                        value={sendingTimeFormValues.random}
                        onChange={handleRandom}
                    />
                </Box> */}
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default PulseDialog