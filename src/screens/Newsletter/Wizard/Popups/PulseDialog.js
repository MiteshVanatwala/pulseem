import React from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useSelector } from 'react-redux';
import { Box, Checkbox, Typography } from '@material-ui/core';

const PulseDialog = ({
    classes,
    pulseValues = {},
    setPulseValues = () => null,
    selectedGroups = [],
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null,
}) => {
    const { t } = useTranslation();
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );


    const handleTime = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setPulseValues({ ...pulseValues, timeInterval: e.target.value, timeBool: false });
        }
    };
    const handleRandom = (e) => {
        setPulseValues({ ...pulseValues, boolRandom: false });
        const re = /^[0-9\b]+$/;
        const totalRecipients = selectedGroups.reduce(function (a, b) {
            return a + b['Recipients'];
        }, 0);

        if ((e.target.value === '' || re.test(e.target.value))) {
            if (pulseValues.pulseType === 1) {
                if (Number(e.target.value) > totalRecipients) {
                    setPulseValues({
                        ...pulseValues, random: selectedGroups.reduce(function (a, b) {
                            return a + b['Recipients'];
                        }, 0), boolRandom: false
                    });
                }
                else {
                    setPulseValues({ ...pulseValues, random: e.target.value, timeBool: false });
                }
            }
            else {
                if (Number(e.target.value) > totalRecipients) {
                    setPulseValues({ ...pulseValues, random: totalRecipients });
                }
                else {
                    setPulseValues({ ...pulseValues, random: e.target.value });
                }
            }
        }
    };
    const handlePulseInput = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value))) {
            let tempData = { ...pulseValues }
            if (pulseValues.pulseType === 1) {
                if (Number(e.target.value) > 100) {
                    tempData = { ...tempData, pulseAmount: "100" }
                    // setPulseValues({ ...pulseValues, pulseAmount: "100" });
                    // setPulseAmount("100");
                }
                else {
                    tempData = { ...tempData, pulseAmount: e.target.value }
                    // setPulseValues({ ...pulseValues, pulseAmount: e.target.value });
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
                        ...tempData, pulseAmount: selectedGroups.reduce(function (a, b) {
                            return a + b['Recipients'];
                        }, 0)
                    }
                    // setPulseValues({ ...pulseValues, pulseAmount: selectedGroups.reduce(function (a, b) {
                    //     return a + b['Recipients'];
                    // }, 0) });
                }
                else {
                    tempData = { ...tempData, pulseAmount: e.target.value }
                    // setPulseValues({ ...pulseValues, pulseAmount: e.target.value });
                    // setPulseAmount(e.target.value);
                }
            }
            tempData = { ...tempData, pulseBool: false }
            setPulseValues({ ...pulseValues, ...tempData })
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
                        checked={pulseValues.togglePulse}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => {
                            setPulseValues({ ...pulseValues, togglePulse: !pulseValues.togglePulse, pulseAmount: '', timeInterval: '' });
                        }}
                    />
                    <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.packetSend")}</Typography>
                </Box>
                <Box
                    className={classes.topPulseDiv}
                >
                    <Box>
                        <span
                            className={classes.noOfReci}
                        >
                            {t("smsReport.noOfReciPulse")}
                        </span>
                        <div
                            className={classes.inputFieldDiv}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={pulseValues.togglePulse ? false : true}
                                className={
                                    pulseValues.togglePulse
                                        ? pulseValues.pulseBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                value={pulseValues.pulseAmount}
                                onChange={handlePulseInput}
                            />
                            <div className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                                <span
                                    className={
                                        pulseValues.togglePulse
                                            ? pulseValues.pulseType === 1
                                                ? clsx(classes.percentTrue)
                                                : clsx(classes.toggleActive)
                                            : clsx(classes.toggleEnd)
                                    }
                                    onClick={() => {
                                        setPulseValues({ ...pulseValues, pulseType: 1, pulsePer: 'percent', noTrue: false });
                                    }}
                                >
                                    {t("smsReport.percent")}
                                </span>
                                <span
                                    className={
                                        pulseValues.togglePulse
                                            ? pulseValues.pulseType === 2
                                                ? clsx(classes.reciTrue)
                                                : clsx(classes.reciActive)
                                            : clsx(classes.toggleStart)
                                    }
                                    onClick={() => {
                                        setPulseValues({ ...pulseValues, pulseType: 2, pulsePer: 'recipients', pulseReci: "Recipients", noTrue: true });
                                    }}
                                >
                                    {t("smsReport.Reci")}
                                </span>
                            </div>
                        </div>
                    </Box>
                    <Box>
                        <span
                            className={classes.noOfReci}
                        >
                            {t("smsReport.timeSend")}
                        </span>
                        <Box
                            className={classes.inputFieldDiv}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={pulseValues.togglePulse ? false : true}
                                className={
                                    pulseValues.togglePulse
                                        ? pulseValues.timeBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                onChange={handleTime}
                                value={pulseValues.timeInterval}
                                maxLength="3"
                            />

                            <Box className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                                <span
                                    className={
                                        pulseValues.togglePulse
                                            ? pulseValues.timeType === 2
                                                ? clsx(classes.percentTrue)
                                                : clsx(classes.toggleActive)
                                            : clsx(classes.toggleEnd)
                                    }
                                    onClick={() => {
                                        setPulseValues({ ...pulseValues, timeType: 2, minName: '', hourName: "hours" });
                                    }}
                                >
                                    {t("smsReport.Hours")}
                                </span>
                                <span
                                    className={
                                        pulseValues.togglePulse
                                            ? pulseValues.timeType === 1
                                                ? clsx(classes.reciTrue)
                                                : clsx(classes.reciActive)
                                            : clsx(classes.toggleStart)
                                    }
                                    onClick={() => {
                                        setPulseValues({ ...pulseValues, timeType: 1, minName: 'mins', hourName: "" });
                                    }}
                                >
                                    {t("smsReport.min")}
                                </span>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box
                    className={classes.randomSendDiv}
                >
                    <Checkbox
                        style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
                        checked={pulseValues.toggleRandom}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => {
                            setPulseValues({ ...pulseValues, toggleRandom: !pulseValues.toggleRandom, random: '' });
                        }}
                    />
                    <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.randomSend")}</Typography>
                </Box>
                <Box className={classes.randomRows}>
                    <span
                        className={classes.randomReciSpan}
                    >
                        {t("smsReport.noOfReci")}
                    </span>
                    <input
                        type="text"
                        placeholder={t("smsReport.insert")}
                        disabled={pulseValues.toggleRandom ? false : true}
                        className={
                            pulseValues.toggleRandom
                                ? pulseValues.boolRandom ? clsx(classes.ml5, classes.mr5, classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.ml5, classes.mr5)
                                : clsx(classes.pulseInsert, classes.ml5, classes.mr5)
                        }
                        value={pulseValues.random}
                        onChange={handleRandom}
                    />
                </Box>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default PulseDialog