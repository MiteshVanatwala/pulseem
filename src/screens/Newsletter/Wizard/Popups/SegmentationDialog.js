import { Box, Checkbox, Divider, MenuItem, Select, Typography } from '@material-ui/core'
import { Stack } from '@mui/material';
import moment from 'moment';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai'
import { DateField } from '../../../../components/managment';
import clsx from 'clsx';



const SegmentationDialog = ({
    classes,
    campaign,
    onClose = () => null,
    onCancel = () => null,
    onConfirm = () => null,
    handleSetValues = () => null
}) => {
    const { t } = useTranslation();

    return {
        title: t("campaigns.newsLetterEditor.sendSettings.send"),
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Stack direction='column' spacing={2} style={{height: '65vh'}}>
                <Stack direction='row' spacing={3}>
                    <Box style={{ margin: 8 }}>
                        <DateField
                            classes={classes}
                            value={campaign.FromDate}
                            onChange={(value) => handleSetValues({ ...campaign, FromDate: value.format("YYYY-MM-DD HH:mm:ss") })}
                            placeholder={t("common.FromDate")}
                            timePickerOpen={true}
                        />
                    </Box>
                    <Box style={{ margin: 8 }}>
                        <DateField
                            classes={classes}
                            value={campaign.ToDate}
                            onChange={(value) => handleSetValues({ ...campaign, ToDate: value.format("YYYY-MM-DD HH:mm:ss") })}
                            placeholder={t("common.ToDate")}
                            timePickerOpen={true}
                        />
                    </Box>
                </Stack>
                <Divider />
                <Typography className={clsx(classes.f20, classes.bold)}>
                    {t('campaigns.newsLetterEditor.sendSettings.segmCriteria')}
                </Typography>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        disabled={campaign.IsNotOpened || campaign.IsOpenedClicked}
                        checked={campaign.IsOpened || campaign.IsOpenedClicked}
                        onChange={(e) => handleSetValues({ ...campaign, IsOpened: e.target.checked })}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb1')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        disabled={campaign.IsOpened || campaign.IsOpenedClicked}
                        checked={campaign.IsNotOpened}
                        onChange={(e) => handleSetValues({ ...campaign, IsNotOpened: e.target.checked })}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb2')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        disabled={campaign.IsNotClicked || campaign.IsNotOpened}
                        checked={campaign.IsOpenedClicked}
                        onChange={(e) => handleSetValues({ ...campaign, IsOpenedClicked: e.target.checked })}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb3')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        disabled={campaign.IsOpenedClicked || campaign.IsNotOpened}
                        checked={campaign.IsNotClicked}
                        onChange={(e) => handleSetValues({ ...campaign, IsNotClicked: e.target.checked })}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb4')}
                    </Typography>
                </Stack>
            </Stack>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Ok"),
        cancelText: t("common.Cancel"),
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default SegmentationDialog