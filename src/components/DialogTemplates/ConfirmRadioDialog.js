import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, Grid, Typography, FormControl, FormHelperText, FormControlLabel, RadioGroup, Radio, MenuItem } from '@material-ui/core';
import Select from '@mui/material/Select';
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import { useState, useEffect } from 'react';
import { setCookie, getCookie } from '../../helpers/Functions/cookies';
import { getTwoFactorAuthValues } from '../../redux/reducers/commonSlice'
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { IoIosArrowDown } from 'react-icons/io';
import { FaCloudDownloadAlt } from 'react-icons/fa';

const ConfirmRadioDialog = ({
    classes,
    text = '',
    title = '',
    radioTitle = '',
    options,
    isOpen = false,
    onCancel,
    onConfirm,
    defaultValue = "",
    cookieName = "",
    showEmailToNotify = false
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state?.core);
    const { twoFactorAuthEmails } = useSelector(state => state.common);
    const [value, setValue] = useState(getCookie(cookieName));
    const [notifyEmail, setNotifyEmail] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const initVerifiedEmails = async () => {
            await dispatch(getTwoFactorAuthValues(1));
        }
        if (showEmailToNotify && twoFactorAuthEmails?.length === 0) {
            initVerifiedEmails();
        }
    }, [showEmailToNotify]);

    const handleValue = (e) => {
        if (cookieName) {
            setCookie(cookieName, e.target.value, { maxAge: 36000000000 });
        }
        setValue(e.target.value);
    }

    useEffect(() => {
        if (defaultValue && defaultValue !== '')
            setValue(defaultValue)
    }, [defaultValue])

    const dialog = {
        title: title,
        showDivider: true,
        icon: <FaCloudDownloadAlt />,
        content: (
            <Grid container>
                <Grid item xs={12} className={clsx(classes.mb4)}>
                    <Box>
                        <Typography className={classes.smsSummaryText}>
                            {text}
                        </Typography>
                    </Box>
                    <Box className={clsx(classes.mt15, classes.mb10)}>{radioTitle}</Box>
                    {options !== null && (<FormControl component="fieldset">
                        <RadioGroup
                            aria-label="value"
                            name="radioValue"
                            onChange={handleValue}
                            value={value}
                        >
                            {
                                options.map((option, idx) => {
                                    return (<Box key={idx}>
                                        <FormControlLabel
                                            value={option?.value}
                                            control={<Radio color="primary" />}
                                            label={
                                                <span className={classes.radioText}>
                                                    {option?.label}
                                                </span>
                                            }
                                        />
                                        {option?.helperText && <FormHelperText className={classes.helpText}>
                                            {option?.helperText}
                                        </FormHelperText>
                                        }
                                    </Box>
                                    )
                                })
                            }
                        </RadioGroup>
                    </FormControl>)
                    }
                    {showEmailToNotify &&
                        <Box style={{ display: 'flex' }}>
                            <Box className={clsx(classes.spaceBetween, classes.justifyCenterOfCenter)}>
                                <Typography>{RenderHtml(t("recipient.exportGroups.notifyEmail"))}</Typography>
                                <FormControl variant="standard" className={clsx(classes.selectInputFormControl, classes.w100)} style={{ alignSelf: 'flex-end' }}>
                                    <Select
                                        variant="standard"
                                        name="FromEmail"
                                        displayEmpty
                                        value={notifyEmail ?? -1}
                                        onChange={event => setNotifyEmail(event.target.value)}
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
                                        <MenuItem disabled value="-1">{t("common.select")}</MenuItem>
                                        {twoFactorAuthEmails.map((item, index) => {
                                            if (!item.IsDeleted) {
                                                return <MenuItem
                                                    key={`exd_${index}`}
                                                    value={`${item.AuthValue}`}
                                                >
                                                    {t(item.AuthValue)}
                                                </MenuItem>
                                            }
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    }
                </Grid>
            </Grid>
        ),
        renderButtons: () => (
            <Grid
                container
                spacing={2}
                className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
            >
                <Grid item>
                    <Button
                        onClick={() => { onConfirm(value, notifyEmail) }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}>
                        {t('common.confirm')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        onClick={() => { onCancel() }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}>
                        {t('common.cancel')}
                    </Button>
                </Grid>
            </Grid>
        ),
        footerText: () => (
            <Typography className={clsx(classes.contactUs, classes.newLine)} style={{ textAlign: 'center' }}>
                {t('sms.havingIssuesMessage')}
            </Typography>
        )
    };

    return (<BaseDialog
        classes={classes}
        open={isOpen ?? false}
        onClose={() => onCancel()}
        onCancel={() => onCancel()}
        {...dialog}>
        {dialog.content}
    </BaseDialog>);
}

export default ConfirmRadioDialog;