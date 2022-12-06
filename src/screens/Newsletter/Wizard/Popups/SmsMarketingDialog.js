import { Box, Button, ClickAwayListener, FormControlLabel, FormGroup, Grid, makeStyles, Switch, Tooltip, Typography } from '@material-ui/core'
import { Stack } from '@mui/material';
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle, AiOutlinePlusCircle } from 'react-icons/ai'
import LabeledTextField from '../../../../components/core/LabeledTextField';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import TemoEditorbox from './Editorbox';
import { DateField } from '../../../../components/managment';
import moment from 'moment';
import TemoEditorbox from '../../../../components/Wizard/Editorbox';


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

const SmsMarketingDialog = ({ classes, onClose = () => null, onCancel = () => null, onConfirm = () => null }, ...props) => {
    const { t } = useTranslation();
    const [values, setValues] = useState({
        SendDate: null,
        SendTime: null,
        FromNumber: "",
        SendTo: ""
    })


    return {
        title: t("campaigns.newsLetterEditor.sendSettings.smsMarketing"),
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
                        {t('campaigns.newsLetterEditor.sendSettings.sendTo')}
                    </Typography>
                    <select
                        placeholder={t('campaigns.newsLetterEditor.sendSettings.sendTo')}
                        className={classes.select}
                        onChange={(e) => setValues({ ...values, SendTo: e.target.value })}
                        value={values.SendTo}
                    >
                        <option value="0">{t("campaigns.newsLetterEditor.sendSettings.everyone")}</option>
                        <option value="1">{t("campaigns.newsLetterEditor.sendSettings.unOpened")}</option>
                        <option value="2">{t("campaigns.newsLetterEditor.sendSettings.invalid")}</option>
                        <option value="3">{t("campaigns.newsLetterEditor.sendSettings.opened")}</option>
                        <option value="4">{t("campaigns.newsLetterEditor.sendSettings.clicked")}</option>
                    </select>
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
                            label: t('campaigns.newsLetterEditor.sendSettings.fromNumber')
                        }}
                        containerProps={{
                            direction: 'column'
                        }}
                    />
                </Grid>
                <Grid item sm={12} md={6}>
                    <Typography>
                        {t('campaigns.newsLetterEditor.sendSettings.sendingDate')}
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
                        {t('campaigns.newsLetterEditor.sendSettings.sendingTime')}
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
                        Message content
                    </Typography>
                    <Stack direction='row'>
                        <Button className={clsx(classes.btnBlue, classes.btnRounded, classes.p_v3_h8)}>Item 1</Button>
                        <Button className={clsx(classes.btnBlue, classes.btnRounded, classes.p_v3_h8)}>Item 2</Button>
                        <Button className={clsx(classes.btnBlue, classes.btnRounded, classes.p_v3_h8)}>Item 3</Button>
                    </Stack>
                </Grid>
                <Grid item md={12}>
                    <TemoEditorbox classes={classes} variant="column" values={values} />
                </Grid>
            </Grid>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Ok"),
        cancelText: t("common.Cancel"),
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default SmsMarketingDialog