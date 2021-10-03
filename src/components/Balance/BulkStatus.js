import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PricePackages from './PaymentWizard/PricePackages';
import { GoPackage } from 'react-icons/go/index';
import { Dialog } from '../managment/index';
import { Grid, Paper, Typography, Button } from '@material-ui/core';
import { getPackagesDetails, getPurchaseLog } from '../../redux/reducers/dashboardSlice';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const BulkStatus = ({ classes }) => {
  const { billingTypeId } = useSelector(state => state.core)
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
  const { username } = useSelector(state => state.user);
  const [isShowSmsPackage, showSmsPackage] = useState(false);
  const [isShowEmailPackage, showEmailPackage] = useState(false);
  const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
  const [selectedPackageType, setPackageType] = useState(1);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { Mms = {}, Newsletters = {}, Notifications = {}, Sms = {} } = packagesDetails || {};

  const getBillingTypeText = (product) => {
    switch (product.eBillingType) {
      case 2: {
        return t('dashboard.perRecipients');
      }
      case 4: {
        return t('dashboard.payAsYouGo');
      }
      case 5: {
        return t('dashboard.perBulk');
      }
      case 8: {
        return t('dashboard.perUsage')
      }
      case 13: {
        return t('dashboard.perValidRecipients')
      }
      default: {
        return product.Credits && product.Credits > 0 ? product.Credits.toLocaleString() : 0;
      }
    }
  }

  useEffect(async () => {
    await dispatch(getPackagesDetails());
    dispatch(getPurchaseLog());
  }, []);

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
          <PricePackages classes={classes} onComplete={handleDialogClose} packageType={selectedPackageType} />
        </Grid>
      )
    };
  }

  const showPackageDialogType = (packageType) => {
    setPackageType(packageType);
    setIsOpenPackageDialog(true);
  }

  const isAllowEmailPurchase = accountAvailablePackages.filter((pl) => {return pl.CampaignType === 3}).length > 0;

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
          {<Grid
            container
            item xs={9}
            className={getBillingTypeText(Sms) === 0 ? classes.bulkOutline : classes.bulkStatusBlue}
            justify='space-between'
            onMouseEnter={() => showSmsPackage(true)}
            onMouseLeave={() => showSmsPackage(false)}
          >
            <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            {isShowSmsPackage && billingTypeId !== "1" ? (
              <Button onClick={() => showPackageDialogType(1)} className={classes.whiteLink}>
                {t('dashboard.purchase')}
              </Button>
            )
              :
              (<Typography className={classes.bulkTitle}>
                {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Sms)}
              </Typography>)
            }
          </Grid>
          }
          {<Grid
            container
            item xs={9}
            className={getBillingTypeText(Newsletters) === 0 ? classes.bulkOutline : classes.bulkStatusBlue}
            justify='space-between'
            onMouseEnter={() => showEmailPackage(true)}
            onMouseLeave={() => showEmailPackage(false)}
          >
            <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            {isShowEmailPackage && billingTypeId !== "1" && isAllowEmailPurchase ? (
              <Button onClick={() => showPackageDialogType(3)} className={classes.whiteLink}>
                {t('dashboard.purchase')}
              </Button>
            )
              :
              (<Typography className={classes.bulkTitle}>
                {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Newsletters)}
              </Typography>)
            }
          </Grid>
          }
          {Mms.Credits > 0 && <Grid
            container
            item xs={9}
            className={classes.bulkStatusBlue}
            justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Mms)}
            </Typography>
          </Grid>
          }
          {Notifications.FeatureExist && <Grid
            container
            item xs={9}
            className={getBillingTypeText(Notifications) === 0 ? classes.bulkOutline : classes.bulkStatusBlue}
            justify='space-between'>
            <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
            <Typography className={classes.bulkTitle}>
              {t('dashboard.freeTrial')}
            </Typography>
          </Grid>}
        </Grid>
      </Paper>
    </>
  );
}

export default React.memo(BulkStatus);