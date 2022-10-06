import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PurchaseWizard from './PaymentWizard/PurchaseWizard';
import { GoPackage } from 'react-icons/go/index';
//import { Dialog } from '../managment/index';
import { Grid, Paper, Typography, Button, Box } from '@material-ui/core';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CgShoppingCart } from 'react-icons/cg';
import CustomTooltip from '../Tooltip/CustomTooltip';
import { getCommonFeatures } from '../../redux/reducers/commonSlice';
import { setAccountFeatures } from '../../redux/reducers/coreSlice'
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { Dialog } from '../Popup/Dialog';

const BulkStatus = ({ classes }) => {
  const { billingTypeId, accountFeatures, accountSettings } = useSelector(state => state.core)
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

  useEffect(() => {
    const initPackages = async () => {
      await dispatch(getPackagesDetails());
    }

    initPackages();
  }, []);

  const handleDialogClose = () => {
    setIsOpenPackageDialog(false);
    dispatch(getPackagesDetails());
  }

  const renderPackagesDialog = () => {
    if (isOpenPackageDialog === true && accountSettings !== null) {
      let dialog = {};
      let availablePack = null;

      if (accountSettings.Account.IsBillingAccount === false || selectedPackageType === -1 || !accountSettings.Account.IsPaying) {
        dialog = renderBillingSupportDialog();
      }
      else {
        dialog = renderPackagesListDialog();
        availablePack = accountAvailablePackages.filter((aa) => { return aa.CampaignType === selectedPackageType });
      }

      const options = {
        Classes: classes,
        Open: isOpenPackageDialog,
        OnCancel: handleDialogClose,
        OnClose: handleDialogClose,
        OnConfirm: handleDialogClose,
        ShowDefaultButtons: false,
        Style: availablePack && availablePack.length < 3 ? { maxWidth: 600, margin: '0 auto' } : null,
        Children: dialog.content
      }

      return (
        <Dialog {...options}></Dialog>
      );
    }
  }

  const renderBillingSupportDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 35, padding: 5 }} />
      ),
      showDefaultButtons: false,
      content: (
        <Grid item xs={12} style={{ paddingBottom: 5 }}>
          <Typography className={classes.f20}>
            {RenderHtml(t("common.contactSupportForBilling"))}
          </Typography>
          <Box className={clsx(classes.mt25, classes.flexColCenter)}>
            <Button
              variant='contained'
              size='small'
              className={clsx(
                classes.dialogButton,
                classes.dialogConfirmButton
              )} onClick={handleDialogClose}>{t("common.Ok")}</Button>
          </Box>
        </Grid >
      ),
      onConfirm: () => handleDialogClose()
    };
  }

  const renderPackagesListDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 35, padding: 5 }} />
      ),
      content: (
        <Grid item xs={12} style={{ paddingBottom: 25 }}>
          <PurchaseWizard classes={classes} onComplete={handleDialogClose} packageType={selectedPackageType} />
        </Grid >
      )
    };
  }

  const isAllowSms = () => {
    return billingTypeId !== "1" && Sms.eBillingType === 0 && accountAvailablePackages.length > 0;
  }
  const isAllowNewsletter = () => {
    return accountFeatures && accountFeatures.includes('37') && billingTypeId !== "1" && Newsletters.eBillingType === 0 && accountAvailablePackages.length > 0;
  }

  const showPackageDialogType = async (packageType) => {
    const settings = await dispatch(getCommonFeatures({ forceRequest: true }));
    dispatch(setAccountFeatures(settings.payload));
    if (!settings.payload.Account.IsPaying) {
      packageType = -1;
      setPackageType(-1);
    }
    else {
      setPackageType(packageType);
    }
    setIsOpenPackageDialog(true);
  }

  return (
    <>
      {renderPackagesDialog()}
      <Paper
        className={clsx(classes.dashboardTopPaper, classes.bulkMargin)}
        elevation={3}>
        <CustomTooltip
          isSimpleTooltip={true}
          classes={classes}
          interactive={true}
          arrow={true}
          style={{ position: 'absolute', fontSize: 14 }}
          placement={'top'}
          icon={<span className={classes.newIcn}>{t("mainReport.newFeature")}</span>}
          text={
            <Typography noWrap={false} className={classes.tooltipText}>{t("dashboard.tooltipPurchaseNewFeature")}</Typography>
          }
        />
        <Grid container justifyContent='center'>
          <Grid item xs={9} className={classes.bulkStatusTitleSection}>
            <Typography
              title={username}
              align='center'
              className={clsx(classes.dashboardUsername, classes.ellipsisText)}>
              {t('dashboard.hi')} {username},
            </Typography>
            <Typography align='center' className={classes.f20}>{t('dashboard.yourBulkStatus')}</Typography>
          </Grid>
          {<Grid
            container
            item xs={9}
            className={getBillingTypeText(Sms) === 0 ? classes.bulkOutline : classes.bulkStatusBlue}
            justifyContent='space-between'
            onMouseEnter={() => showSmsPackage(true)}
            onMouseLeave={() => showSmsPackage(false)}
          >
            <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            {isShowSmsPackage && isAllowSms() ? (
              <a
                href="javascript:;"
                onClick={() => showPackageDialogType(3)}
                className={clsx(getBillingTypeText(Sms) === 0 ? classes.blueLink : classes.whiteLink, classes.dinline)}
              >
                {t('dashboard.purchase')}
              </a>
            )
              :
              (<Typography className={classes.bulkTitle}>
                {Sms.eBillingType === 0 && accountAvailablePackages.length > 0 && <CgShoppingCart className={classes.shoppingCartIcon} />}
                {getBillingTypeText(Sms)}
              </Typography>)
            }
          </Grid>
          }
          {<Grid
            container
            item xs={9}
            className={getBillingTypeText(Newsletters) === 0 ? classes.bulkOutline : classes.bulkStatusBlue}
            justifyContent='space-between'
            onMouseEnter={() => showEmailPackage(true)}
            onMouseLeave={() => showEmailPackage(false)}
          >
            <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            {isShowEmailPackage && isAllowNewsletter() ? (
              <a
                href="javascript:;"
                onClick={() => showPackageDialogType(2)}
                className={clsx(getBillingTypeText(Newsletters) === 0 ? classes.blueLink : classes.whiteLink, classes.dinline)}
              >
                {t('dashboard.purchase')}
              </a>
            )
              :
              (<Typography className={classes.bulkTitle}>
                {accountFeatures && accountFeatures.includes('37') && Newsletters.eBillingType === 0 && accountAvailablePackages.length > 0 && <CgShoppingCart className={classes.shoppingCartIcon} />}
                {getBillingTypeText(Newsletters)}
              </Typography>)
            }
          </Grid>
          }
          {Mms.Credits > 0 && <Grid
            container
            item xs={9}
            className={getBillingTypeText(Mms) === 0 ? classes.statusOutline : classes.statusBlue}
            justifyContent='space-between'>
            <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
            <Typography className={classes.bulkTitle}>
              {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Mms)}
            </Typography>
          </Grid>
          }
          {Notifications.FeatureExist && <Grid
            container
            item xs={9}
            className={getBillingTypeText(Notifications) === 0 ? classes.statusOutline : classes.statusBlue}
            justifyContent='space-between'>
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
