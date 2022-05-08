import clsx from "clsx";
import {
  Typography,
  Grid,
  Button,
  Box,
} from "@material-ui/core";

import { useTranslation } from "react-i18next";
import { Dialog } from "../../../../components/managment/Dialog";

const AddRecipientResponse = ({ classes, isOpen = false, onClose, windowSize, title, message, summary = null }) => {

  const { t } = useTranslation();

  return (
    <Dialog
      classes={classes}
      open={isOpen}
      title={title}
      icon={<div className={classes.dialogIconContent}>
        {'\uE0D5'}
      </div>}
      showDivider={true}
      onClose={onClose}
      onConfirm={onClose}
      confirmText="common.Ok"
      showDefaultButtons={false}
      paperStyle={classes.width_min_content}
      renderButtons={() => {
        return <Button
          variant='contained'
          style={{ margin: '0 auto' }}
          onClick={onClose}
          className={clsx(
            classes.dialogButton,
            classes.dialogConfirmButton
          )}>
          {t('common.confirm')}
        </Button>
      }}
    >
      <Box>
        {!summary && <Typography variant="subtitle1">
          {message}
        </Typography>
        }
        {summary && <Grid container className={clsx(classes.mb20, classes.mt20)}>
          <Grid item xs={12}>
            <Typography className={classes.f28}>{t("recipient.summary.commonSummary")}</Typography>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalValidUploadedRecords")}</Typography></Grid>
              <Grid item xs={3}>{summary.TotalValidUploadedRecords}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalInvalidOrEmptyAddresses")}</Typography></Grid>
              <Grid item xs={3}>{summary.TotalInvalidOrEmptyAddresses}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalDuplicates")}</Typography></Grid>
              <Grid item xs={3}>{summary.TotalDuplicates}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalRecords")}</Typography></Grid>
              <Grid item xs={3}>{summary.TotalRecords}</Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography className={classes.f28}>{t("recipient.summary.emailSummary")}</Typography>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.invalidOrEmptyEmailAddresses")}</Typography></Grid>
              <Grid item xs={3}>{summary.InvalidOrEmptyEmails}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.duplicateEmailAddressesInFile")}</Typography></Grid>
              <Grid item xs={3}>{summary.DuplicateEmails}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalEmailExistingInAccount")}</Typography></Grid>
              <Grid item xs={3}>{summary.ExistingEmails}</Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography className={classes.f28}>{t("recipient.summary.smsSummary")}</Typography>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.invalidOrEmptyCellphones")}</Typography></Grid>
              <Grid item xs={3}>{summary.InvalidOrEmptyCellphones}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.duplicateCellphoneInFile")}</Typography></Grid>
              <Grid item xs={3}>{summary.DuplicateCellphones}</Grid>
            </Grid>
            <Grid container>
              <Grid item xs={9}><Typography className={classes.bold}>{t("recipient.summary.totalCellularExistingInAccount")}</Typography></Grid>
              <Grid item xs={3}>{summary.ExistingCellphones}</Grid>
            </Grid>
          </Grid>
        </Grid>}
      </Box>
    </Dialog>
  );
};

export default AddRecipientResponse;
