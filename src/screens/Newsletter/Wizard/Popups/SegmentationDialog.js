import { Box, Checkbox, Divider, MenuItem, Select, Typography } from '@material-ui/core'
import { Stack } from '@mui/material';
import moment from 'moment';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai'
import { DateField } from '../../../../components/managment';
import clsx from 'clsx';



const SegmentationDialog = ({ classes, onClose = () => null, onCancel = () => null, onConfirm = () => null, values, handleSetValues = () => null }) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState('0')

    const handleChange = (e) => {
        setSelected(e.target.value)
    }

    return {
        title: t("campaigns.newsLetterEditor.sendSettings.segmentation"),
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Stack direction='column' spacing={2}>
                <Typography className={classes.bold}>
                    {t('common.Campaign')}
                </Typography>
                <Select
                    value={selected}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{
                        'aria-label': 'Without label',
                        className: classes.p10,
                        style: { maxWidth: '70%' }
                    }}
                    variant='outlined'
                    className={classes.mt10}
                >
                    <MenuItem
                        key={'0'}
                        value={'0'}
                    >
                        {t('common.All')} ({t('common.Default')})
                    </MenuItem>
                    {[{ Number: '1' }, { Number: '2' }, { Number: '3' }, { Number: '4' }, { Number: '5' },].map((obj) => (
                        <MenuItem
                            key={obj.Number}
                            value={obj.Number}
                        >
                            {obj.Number}
                        </MenuItem>
                    ))}
                </Select>
                <Stack direction='row' spacing={3}>
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={values.FromDate}
                        onChange={(value) => handleSetValues({ ...values, FromDate: value })}
                        placeholder={t("common.FromDate")}
                        timePickerOpen={true}
                    // dateActive={`${sendingTimeFormValues.SendingMethod}` == "2" ? false : true}
                    />
                    <DateField
                        minDate={moment()}
                        classes={classes}
                        value={values.ToDate}
                        onChange={(value) => handleSetValues({ ...values, ToDate: value })}
                        placeholder={t("common.ToDate")}
                        timePickerOpen={true}
                    // dateActive={`${sendingTimeFormValues.SendingMethod}` == "2" ? false : true}
                    />
                </Stack>
                <Divider />
                <Typography className={clsx(classes.f20, classes.bold)}>
                    {t('campaigns.newsLetterEditor.sendSettings.segmCriteria')}
                </Typography>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        // disabled={`${sendingTimeFormValues.SendingMethod}` !== "1"}
                        // checked={`${sendingTimeFormValues.SendingMethod}` === "1" && sendingTimeFormValues.IsBestTime}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    // onClick={() => {
                    //     setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: true })
                    // }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb1')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        // disabled={`${sendingTimeFormValues.SendingMethod}` !== "1"}
                        // checked={`${sendingTimeFormValues.SendingMethod}` === "1" && sendingTimeFormValues.IsBestTime}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    // onClick={() => {
                    //     setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: true })
                    // }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb2')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        // disabled={`${sendingTimeFormValues.SendingMethod}` !== "1"}
                        // checked={`${sendingTimeFormValues.SendingMethod}` === "1" && sendingTimeFormValues.IsBestTime}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    // onClick={() => {
                    //     setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: true })
                    // }}
                    />
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.segmCritCb3')}
                    </Typography>
                </Stack>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <Checkbox
                        className={classes.p0}
                        // disabled={`${sendingTimeFormValues.SendingMethod}` !== "1"}
                        // checked={`${sendingTimeFormValues.SendingMethod}` === "1" && sendingTimeFormValues.IsBestTime}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                    // onClick={() => {
                    //     setSendingTimeFormValues({ ...sendingTimeFormValues, IsBestTime: true })
                    // }}
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