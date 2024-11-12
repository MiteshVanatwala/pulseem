import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Button, Grid, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { BaseDialog } from './BaseDialog';
import { useState } from 'react';
import { setCookie } from '../../helpers/Functions/cookies';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';


const TFA = ({ classes,
    showTFA = false,
    onCancel = () => null,
    onConfirm = () => null
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    const { companyName } = useSelector(state => state.core)
    const [hideThisMessage, setHideThisMessage] = useState(false);

    const handleHideThisMessage = (e) => {
        setHideThisMessage(e);
        if (e === true) {
            setCookie("2faPopupv2", "false");
        }
        else {
            setCookie("2faPopupv2", "true");
        }
    }

    const dialog = {
        title: `${t('dashboard.2faTitle')} ${companyName}`,
        showDivider: false,
        icon: null,
        content: (
            <Grid container>
                <Grid item xs={12} className={clsx(classes.mb4)} style={{ textAlign: 'center' }}>
                    {RenderHtml(t('dashboard.2faDescription'))}
                    <Box className={classes.mt15}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={hideThisMessage}
                                    onChange={() => handleHideThisMessage(!hideThisMessage)}
                                    name="checkedB"
                                    color="primary"
                                />
                            }
                            label={t('notifications.implementDialog.dontShowThisMessage')}
                        />
                    </Box>
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
                        onClick={() => { onConfirm() }}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
                        )}>
                        {t('common.Yes')}
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
                        {t('common.notNow')}
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
        open={showTFA}
        onClose={() => onCancel()}
        onCancel={() => onCancel()}
        {...dialog}>
        {dialog.content}
    </BaseDialog>);
}

export default TFA;