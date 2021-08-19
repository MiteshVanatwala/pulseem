import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PricePackages from './PricePackages.component';
import { GoPackage } from 'react-icons/go/index';
import { Dialog } from '../managment/index';
import { Grid, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const BulkStatus = ({ classes }) => {
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
  const { username } = useSelector(state => state.user);
  const [isShowSmsPackage, showSmsPackage] = useState(false);
  const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
  const { t } = useTranslation();

  const { Mms = {}, Newsletters = {}, Notifications = {}, Sms = {} } = packagesDetails || {};
  const availablePackages = accountAvailablePackages || [];
  let isNewsletterPrepaid = Newsletters.isPrepaid || Newsletters.Credits == -1;
  let isMMSPrepaid = Mms.isPrepaid || Mms.Credits == -1;
  let isNotificationsPrepaid = Notifications.isPrepaid || Notifications.Credits == -1;
  //let isSMSPrepaid = Sms.isPrepaid || Sms.Credits == -1;

  const handleDialogClose = () => {
    setIsOpenPackageDialog(false);
  }

  const renderPackagesDialog = () => {
    if (isOpenPackageDialog === true) {
      let dialog = {};
      dialog = renderPackagesListDialog();

      return (
        <Dialog
          classes={classes}
          open={isOpenPackageDialog}
          onClose={handleDialogClose}
          onConfirm={handleDialogClose}
          showDefaultButtons={false}
          {...dialog}>
          {dialog.content}
        </Dialog>
      );
    }
  }

  const renderPackagesListDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 30 }} />
      ),
      content: (
        <Grid item xs={12} style={{ paddingBottom: 25 }}>
          <PricePackages classes={classes} onComplete={handleDialogClose} />
        </Grid>
      )
    };
  }

  return (
    <>
      {renderPackagesDialog()}
      <Paper
        className={clsx(classes.dashboardTopPaper, classes.bulkMargin)}
        elevation={3}>
        <Grid container justify='center'>
          <Grid item xs={8} className={classes.bulkStatusTitleSection}>
            <Typography
              align='center'
              className={classes.dashboardUsername}>
              {t('dashboard.hi')} {username},
            </Typography>
            <Typography align='center' className={classes.f20}>{t('dashboard.yourBulkStatus')}</Typography>
          </Grid>
          <Grid
            container
            item xs={9}
            className={classes.bulkStatusBlue}
            justify='space-between'
            onMouseEnter={() => showSmsPackage(true)}
            onMouseLeave={() => showSmsPackage(false)}>
            <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {!Sms.IsPrepaid ? t('dashboard.perRecipients') : Sms.Credits}
            </Typography>
            {/* {isShowSmsPackage ? (
              <Button onClick={() => setIsOpenPackageDialog(true)} className={classes.whiteLink}>
                {t('dashboard.purchase')}
              </Button>
            )
              :
              (<Typography className={classes.bulkTitle}>
                {!Sms.IsPrepaid ? t('dashboard.perRecipients') : Sms.Credits}
              </Typography>)
            } */}
          </Grid>
          <Grid container item xs={9} className={classes.bulkStatusBlue} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {isNewsletterPrepaid ? t('dashboard.perRecipients') : Newsletters.Credits}
            </Typography>
          </Grid>
          <Grid container item xs={9} className={classes.bulkOutline} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
            {isMMSPrepaid?t('dashboard.perRecipients'):Mms.Credits}
            {/* {availablePackages.length > 0 && <a href='#' className={classes.bulkContent}>
              {t('dashboard.purchase')}
            </a> */}
          </Grid>
          <Grid container item xs={9} className={classes.bulkOutline} justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
            {isNotificationsPrepaid?t('dashboard.perRecipients'):Notifications.Credits}
            {/* {availablePackages.length > 0 &&
              <a href='#' className={classes.bulkContent}>
                {t('dashboard.purchase')}
              </a>
            } */}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

export default BulkStatus;