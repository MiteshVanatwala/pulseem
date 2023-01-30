import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { useSelector } from 'react-redux';
import { Box, Checkbox, Typography } from '@material-ui/core';
import { Stack } from '@mui/material';

const PulseDialog = ({
    classes,
    campaign = {},
    selectedGroups = [],
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null
}) => {
    const [pulseEnabled, setPulseEnabled] = useState(false);
    const [pulseSettigns, setPulseSettings] = useState({
        PulseAmount: '',
        TimeInterval: ''
    })
    const { t } = useTranslation();
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );

    useEffect(() => {
        if (campaign && campaign.PulseAmount) {
            setPulseSettings({
                ...pulseSettigns,
                PulseAmount: campaign?.PulseAmount,
                TimeInterval: campaign?.TimeInterval
            });
            setPulseEnabled(true);
        }
    }, [campaign])

    useEffect(() => {
        if (!pulseEnabled) {
            setPulseSettings({
                ...pulseSettigns,
                PulseAmount: '',
                TimeInterval: ''
            });
        }
    }, [pulseEnabled])


    const handleTime = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setPulseSettings({ ...pulseSettigns, TimeInterval: e.target.value });
        }
    };
    const handlePulseInput = (e) => {
        const re = /^[0-9\b]+$/;
        if ((e.target.value === '' || re.test(e.target.value))) {
            if (Number(e.target.value) > selectedGroups.reduce(function (a, b) {
                return a + b['Recipients'];
            }, 0)) {

                setPulseSettings({
                    ...pulseSettigns, PulseAmount: selectedGroups.reduce(function (a, b) {
                        return a + b['Recipients'];
                    }, 0)
                });
            }
            else {
                setPulseSettings({ ...pulseSettigns, PulseAmount: e.target.value });
            }
        }
    };

    const handleConfirm = () => {
        onConfirm(pulseSettigns, pulseEnabled);
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
                        checked={pulseEnabled}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                        onClick={() => {
                            setPulseEnabled(!pulseEnabled);
                            // setPulseSettings({ ...pulseSettigns, PulseAmount: '', TimeInterval: '' })
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
                        <Box style={{ paddingBlock: 10 }}>
                            {t("smsReport.noOfReciPulse")}
                        </Box>
                        <Box
                            className={classes.flexAlignCetner}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={!pulseEnabled}
                                className={
                                    pulseEnabled
                                        ? (!pulseSettigns.PulseAmount || pulseSettigns.PulseAmount < 1) ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                value={pulseSettigns.PulseAmount}
                                onChange={handlePulseInput}
                            />
                            <Box style={{ paddingInlineStart: 10 }}>
                                {parseInt(pulseSettigns.PulseAmount) === 1 ? t("common.Recipient") : t("common.Recipients")}
                            </Box>
                        </Box>
                    </Stack>
                    <Stack>
                        <Box style={{ paddingBlock: 10 }}>
                            {t("smsReport.timeSend")}
                        </Box>
                        <Box className={classes.flexAlignCetner}
                        >
                            <input
                                type="text"
                                placeholder={t("smsReport.insert")}
                                disabled={!pulseEnabled}
                                className={
                                    pulseEnabled
                                        ? (!pulseSettigns.TimeInterval || pulseSettigns.TimeInterval < 1) ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                                        : clsx(classes.pulseInsert)
                                }
                                onChange={handleTime}
                                value={pulseSettigns.TimeInterval}
                                maxLength="3"
                            />
                            <Box style={{ paddingInlineStart: 10 }}>
                                {parseInt(pulseSettigns.TimeInterval) === 1 ? t("sms.hour") : t("sms.hours")}
                            </Box>

                        </Box>
                    </Stack>
                </Stack>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: handleConfirm
    }
}

export default PulseDialog