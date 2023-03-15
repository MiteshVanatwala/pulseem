import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Button, Grid, Typography, FormControl, FormHelperText, FormControlLabel, RadioGroup, Radio } from '@material-ui/core';
import { SolidDialog } from '../managment/index';
import { useState } from 'react';
import { setCookie, getCookie } from '../../helpers/Functions/cookies';

const ConfirmRadioDialog = ({
    classes,
    text = '',
    title = '',
    radioTitle = '',
    options = [],
    isOpen = false,
    onCancel,
    onConfirm,
    defaultValue = "",
    cookieName = ""
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state?.core);
    const [value, setValue] = useState(getCookie(cookieName) ?? defaultValue);

    const handleValue = (e) => {
        if (cookieName) {
            setCookie(cookieName, e.target.value, { maxAge: 36000000000 });
        }
        setValue(e.target.value);
    }

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
                    {options.length > 0 && (<FormControl component="fieldset">
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
                        onClick={() => { onConfirm(value) }}
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

    return (<SolidDialog
        classes={classes}
        open={isOpen ?? false}
        onClose={() => onCancel()}
        {...dialog}>
        {dialog.content}
    </SolidDialog>);
}

export default ConfirmRadioDialog;