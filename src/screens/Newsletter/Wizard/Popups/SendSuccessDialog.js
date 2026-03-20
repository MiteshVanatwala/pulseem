import { Box, Typography, Button, Grid } from '@material-ui/core'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import Gif from "../../../../assets/images/managment/check-circle.gif";
import { useSelector } from 'react-redux';
import { DateFormats } from '../../../../helpers/Constants';
import moment from 'moment';

const SendSuccessDialog = ({
    classes,
    onBackToCampaigns = () => null,
    onBackToHome = () => null
}) => {
    const { t } = useTranslation()
    const { newsletterSendSummary } = useSelector(state => state.newsletter);

    const renderWhenToSend = () => {
        switch (newsletterSendSummary?.SendingMethod) {
            case 1: {
                return t('campaigns.campaignIsOnItsWay');
            }
            case 2: {
                return `${t('campaigns.mailingScheduledDesc', { DATE_OF_SCHEDULE: moment(newsletterSendSummary?.SendDate).format(DateFormats.DATE_ONLY), TIME_OF_SCHEDULE: moment(newsletterSendSummary?.SendDate).format(DateFormats.TIME_ONLY) })}`;
            }
            case 3: {
                let specialField = null;
                switch (newsletterSendSummary?.AutoSendingByUserField) {
                    case "5":
                    case 5: {
                        specialField = `${t("mainReport.birthday")} ${newsletterSendSummary?.IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    case "6":
                    case 6: {
                        specialField = `${t("common.reminder_date")} ${newsletterSendSummary?.IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    case "7":
                    case 7: {
                        specialField = `${t("mainReport.creationDay")} ${newsletterSendSummary?.IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    default: {
                        specialField = t('campaigns.weSent');
                    }
                }
                const date = `${newsletterSendSummary?.AutoSendDelay.toString().replace('-', '')} ${t("mainReport.days")} ${newsletterSendSummary?.AutoSendDelay > 0 ? t("mainReport.after") : t("mainReport.before")} ${specialField}`;
                const time = moment(newsletterSendSummary?.SendDate).format('h:mm a');
                return t('campaigns.mailingScheduledDesc', { DATE_OF_SCHEDULE: date, TIME_OF_SCHEDULE: time })
            }
            default: {
                return t('campaigns.weSent');
            }
        }
    }
        
    return {
        showDivider: false,
        disableBackdropClick: true,
        content: (
            <Box className={clsx(classes.flexColumnCenter, classes.p20)}>
                <img src={Gif} style={{ width: 150, height: 150 }} alt="Success" />
                <Typography className={clsx(classes.fontBold, classes.font24, classes.mt2)}>
                    {t( newsletterSendSummary?.SendingMethod === 1 ? 'campaigns.weSent' : 'campaigns.mailingScheduled' )}
                </Typography>
                <Typography className={clsx(classes.font18, classes.mt2)}>
                    { renderWhenToSend() }
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
        onCancel: () => { onBackToCampaigns() },
        onClose: () => { onBackToCampaigns() },
        renderButtons: false,
        showDefaultButtons: false,
        onCancel: () => onBackToCampaigns(),
        onClose: () => onBackToCampaigns(),
        exit: true
    }
}

export default SendSuccessDialog