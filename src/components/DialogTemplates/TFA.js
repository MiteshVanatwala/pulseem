import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Button, Grid, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import { SolidDialog } from '../managment/index';
import { useState } from 'react';
import { setCookie } from '../../helpers/cookies';


const TFA = ({ classes,
    showTFA = false,
    onCancel = () => null,
    onConfirm = () => null
}) => {
    const { t } = useTranslation();
    const { windowSize, isRTL } = useSelector(state => state.core);
    const { companyName } = useSelector(state => state.core)
    const [hideThisMessage, setHideThisMessage] = useState(false);

    const renderHtml = (html) => {
        function createMarkup() {
            return { __html: html };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }

    const handleHideThisMessage = (e) => {
        setHideThisMessage(e);
        if (e === true) {
            setCookie("2faPopup", "false");
        }
        else {
            setCookie("2faPopup", "true");
        }
    }

    const dialog = {
        title: `${t('dashboard.2faTitle')} ${companyName}`,
        showDivider: false,
        icon: null,
        content: (
            <Grid container>
                <Grid item xs={12} className={clsx(classes.mb4)} style={{ textAlign: 'center' }}>
                    {renderHtml(t('dashboard.2faDescription'))}
                    <Box>
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
                            classes.solidDialogButton,
                            classes.dialogConfirmButton
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
                        {t('common.No')}
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
        open={showTFA}
        onClose={() => { onCancel() }}
        {...dialog}>
        {dialog.content}
    </SolidDialog>);
}

export default TFA;