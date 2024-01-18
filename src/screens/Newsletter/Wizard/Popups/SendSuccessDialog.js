import { Box, Typography, Button, Grid } from '@material-ui/core'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import Gif from "../../../../assets/images/managment/check-circle.gif";

const SendSuccessDialog = ({
    classes,
    onBackToCampaigns = () => null,
    onBackToHome = () => null
}) => {
    const { t } = useTranslation()

    return {
        showDivider: false,
        disableBackdropClick: true,
        content: (
            <Box className={clsx(classes.flexColumnCenter, classes.p20)}>
                <img src={Gif} style={{ width: 150, height: 150 }} alt="Success" />
                <Typography className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
                    {t('campaigns.weSent')}
                </Typography>
                <Typography className={clsx(classes.font18, classes.mt2)}>
                    {t('campaigns.campaignIsOnItsWay')}
                </Typography>
                <Grid
                    container
                    spacing={4}
                    className={clsx(
                        classes.dialogButtonsContainer,
                        classes.mt3
                    )}
                >
                    <Grid item>
                        <Button onClick={() => { onBackToHome() }}
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.btn, classes.btnRounded
                            )}
                            style={{ margin: '8px' }}
                            color="primary"
                        >{t('common.backToHome')}</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={() => { onBackToCampaigns() }}
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.btn, classes.btnRounded
                            )}
                            style={{ margin: '8px' }}
                            color="primary"
                        >{t('common.backToCampaigns')}</Button>
                    </Grid>
                </Grid>
            </Box>
        ),
        renderButtons: false,
        showDefaultButtons: false,
        onCancel: () => onBackToCampaigns(),
        onClose: () => onBackToCampaigns(),
        exit: true
    }
}

export default SendSuccessDialog