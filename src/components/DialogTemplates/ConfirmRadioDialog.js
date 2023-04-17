import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, Grid, Typography, FormControl, FormHelperText, FormControlLabel, RadioGroup, Radio, Select, OutlinedInput } from '@material-ui/core';
import { SolidDialog } from '../managment/index';
import { useEffect, useState } from 'react';
import { setCookie, getCookie } from '../../helpers/cookies';
import { getAuthorizedEmails } from '../../redux/reducers/commonSlice'
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';

const ConfirmRadioDialog = ({
    classes,
    text = '',
    title = '',
    radioTitle = '',
    options = null,
    isOpen = false,
    onCancel,
    onConfirm,
    defaultValue = "",
    cookieName = "",
    showEmailToNotify = false
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state?.core);
    const { verifiedEmails } = useSelector(state => state.common);
    const [value, setValue] = useState(getCookie(cookieName));
    const [notifyEmail, setNotifyEmail] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const initVerifiedEmails = async () => {
            await dispatch(getAuthorizedEmails());
        }
        if (showEmailToNotify && verifiedEmails?.length === 0) {
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
        icon: null,
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
                    {showEmailToNotify && <>
                        <Box style={{ display: 'flex' }}>
                            <Box className={clsx(classes.spaceBetween, classes.justifyCenterOfCenter)}>
                                <Typography>{RenderHtml(t("recipient.exportGroups.notifyEmail"))}</Typography>
                                <FormControl style={{ width: '50%', maxWidth: 250 }} variant="filled" size="small">
                                    <Select
                                        native
                                        displayEmpty
                                        value={notifyEmail ?? -1}
                                        onChange={(event, val) => {
                                            setNotifyEmail(event.target.value);
                                        }}
                                        label={RenderHtml(t("recipient.exportGroups.notifyEmail"))}
                                        name="FromEmail"
                                        input={
                                            <OutlinedInput />
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    width: '100%',
                                                },
                                            },
                                        }}
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        <option disabled value="-1" key="-1">{t("common.select")}</option>
                                        {verifiedEmails.map((item, index) => {
                                            if (item.IsOptIn) {
                                                return <option
                                                    key={`exd_${index}`}
                                                    value={item.Number}
                                                >
                                                    {t(item.Number)}
                                                </option>
                                            }
                                        }
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </>}
                </Grid>
            </Grid>
        ),
        renderButtons: () => (
            <Grid
                container
                spacing={4}
                className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
            >
                <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { onConfirm(value, notifyEmail) }}
                        className={clsx(
                            classes.solidDialogButton,
                            classes.dialogConfirmButton
                        )}>
                        {t('common.confirm')}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => { onCancel() }}
                        className={clsx(
                            classes.solidDialogButton,
                            classes.dialogCancelButton
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

    return (<SolidDialog
        classes={classes}
        open={isOpen ?? false}
        onClose={() => onCancel()}
        {...dialog}>
        {dialog.content}
    </SolidDialog>);
}

export default ConfirmRadioDialog;