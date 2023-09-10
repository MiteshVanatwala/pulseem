import { Box, Grid } from "@material-ui/core"
import clsx from "clsx"
import { useTranslation } from "react-i18next";

type SummaryObj = {
    Stats: Stats,
    CampaignType: string,
    classes: any
}

type Stats = {
    Sent: number;
    Opened: number;
    UnOpened: number;
    Clicks: number;
    ErrorCount: number;
    RealClicks?: number;
    ReadCount?: number;
    UniqueClicksCount?: number;
}

const SummaryLine = ({ classes, Stats, CampaignType }: SummaryObj) => {
    const { t } = useTranslation();
    if (Stats) {
        return <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
            <Grid container spacing={2} className={clsx(classes.greyBorderAround, classes.flexJustifyCenter, classes.textCenter, classes.pr25, classes.pe25)}>
                <Grid item md={2} className={classes.flexGrow1}>
                    <Box className={clsx(classes.bold)}>{t('common.Sent')}</Box>
                    <Box className={classes.pt10}>{Stats?.Sent}</Box>
                </Grid>
                {CampaignType === 'sms' &&
                    <Grid item md={2} className={classes.flexGrow1}>
                        <Box className={clsx(classes.bold)}>{t('mainReport.verifiedCount')}</Box>
                        <Box className={classes.pt10}>{Stats?.RealClicks}</Box>
                    </Grid>}
                {CampaignType === 'email' && <>
                    <Grid item md={2} className={classes.flexGrow1}>
                        <Box className={clsx(classes.bold)}>{t('common.Opened')}</Box>
                        <Box className={classes.pt10}>{Stats?.Opened}</Box>
                    </Grid>
                    <Grid item md={2} className={classes.flexGrow1}>
                        <Box className={clsx(classes.bold)}>{t('common.NoOpened')}</Box>
                        <Box className={classes.pt10}>{Stats?.UnOpened}</Box>
                    </Grid>
                </>}
                {CampaignType === 'whatsapp' && <>
                    <Grid item md={2} className={classes.flexGrow1}>
                        <Box className={clsx(classes.bold)}>{t('common.read')}</Box>
                        <Box className={classes.pt10}>{Stats?.ReadCount}</Box>
                    </Grid>
                    <Grid item md={2} className={classes.flexGrow1}>
                        <Box className={clsx(classes.bold)}>{t('common.ClicksUnique')}</Box>
                        <Box className={classes.pt10}>{Stats?.UniqueClicksCount}</Box>
                    </Grid>
                </>}
                <Grid item md={2} className={classes.flexGrow1}>
                    <Box className={clsx(classes.bold)}>{t('common.Clicks')}</Box>
                    <Box className={classes.pt10}>{Stats?.Clicks}</Box>
                </Grid>
                <Grid item md={2} className={classes.flexGrow1}>
                    <Box className={clsx(classes.bold)}>{t('recipient.Bounced')}</Box>
                    <Box className={classes.pt10}>{Stats?.ErrorCount}</Box>
                </Grid>
            </Grid>
        </Box >
    }
    return <Box className={clsx(classes.p10, classes.mt15, classes.mb15, classes.colorBlue)}>
        <Grid container spacing={2} className={clsx(classes.greyBorderAround, classes.flexJustifyCenter, classes.alignCenter, classes.textCenter, classes.pr25, classes.pe25)} style={{ minHeight: 70 }}>
            <Grid item md={6} className={classes.flexGrow1}>{t('common.NoDataTryFilter')}</Grid>
        </Grid>
    </Box>;

}

export default SummaryLine;