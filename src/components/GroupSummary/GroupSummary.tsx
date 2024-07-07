import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Divider, Grid, Typography } from '@material-ui/core';
import { GroupSummaryProps } from '../../model/Groups/GroupSummary.types';

const GroupSummary = ({
  classes,
  summary
}: GroupSummaryProps) => {
  const { t } = useTranslation();

  return (
    <Grid container className={clsx(classes.mb20)}>
      <Grid item xs={12} className={classes.pb15}>
        <Typography className={clsx(classes.f20, classes.semibold)}>{t("recipient.summary.commonSummary")}</Typography>
        <Divider className={clsx(classes.mt1, classes.mb1)} />
        <Grid container>
          <Grid item xs={4}><Typography>{t("recipient.summary.totalValidUploadedRecords")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.TotalUploaded || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.totalInvalidOrEmptyAddresses")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.TotalErrors || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.totalDuplicates")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.TotalDuplicates || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.totalRecords")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.TotalRecords || 0}</Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} className={classes.pb15}>
        <Typography className={clsx(classes.f20, classes.semibold)}>{t("recipient.summary.emailSummary")}</Typography>
        <Divider className={clsx(classes.mt1, classes.mb1)} />
        <Grid container>
          <Grid item xs={4}><Typography>{t("recipient.summary.invalidOrEmptyEmailAddresses")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.EmailInvalid || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.duplicateEmailAddressesInFile")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.EmailDuplicates || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.totalEmailExistingInAccount")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.EmailExists || 0}</Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography className={clsx(classes.f20, classes.semibold)}>{t("recipient.summary.smsSummary")}</Typography>
        <Divider className={clsx(classes.mt1, classes.mb1)} />
        <Grid container>

          <Grid item xs={4}><Typography>{t("recipient.summary.invalidOrEmptyCellphones")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.PhoneInvalid || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.duplicateCellphoneInFile")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.PhoneDuplicates || 0}</Grid>

          <Grid item xs={4}><Typography>{t("recipient.summary.totalCellularExistingInAccount")}</Typography></Grid>
          <Grid item xs={2} className={clsx(classes.paddingSides5)}>{summary?.PhoneExists || 0}</Grid>

        </Grid>
      </Grid>
    </Grid>
  );
};

export default GroupSummary;
