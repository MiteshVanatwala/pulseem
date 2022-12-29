import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PurchaseWizard from './PaymentWizard/PurchaseWizard';
import { GoPackage } from 'react-icons/go/index';
import { Grid, Paper, Typography, Button, Box, Divider } from '@material-ui/core';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { getCommonFeatures } from '../../redux/reducers/commonSlice';
import { setAccountFeatures } from '../../redux/reducers/coreSlice'
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { Dialog } from '../Popup/Dialog';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BellIcon, WhatsappIcon, SmsIcon, CardIcon, NewsletterIcon, NewBubbleIcon } from '../../assets/images/dashboard/index'
import { TooltipBubble } from '../../assets/images/dashboard/index';

const BulkStatus = ({ classes }) => {
  const { billingTypeId, accountFeatures, accountSettings, isRTL } = useSelector(state => state.core)
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
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
        classes: classes,
        open: isOpenPackageDialog,
        onCancel: handleDialogClose,
        onClose: handleDialogClose,
        onConfirm: handleDialogClose,
        showDefaultButtons: false,
        style: availablePack && availablePack.length < 3 ? { maxWidth: 600, margin: '0 auto' } : null,
        children: dialog.content
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
        className={clsx(classes.dashboardTopPaper, classes.bulkMargin, classes.bulkStatusContainer)}
        elevation={3}>

        <Grid container justifyContent='center'>
          <Grid item xs={12} className={classes.dashBoxtitleSection}>
            <Box className={classes.spaceBetween}>
              <Box className={clsx(classes.alignItemsCenter, classes.flexJustifyCenter)}>
                <CardIcon className={classes.mlr10} />
                <Typography
                  className={clsx(classes.dInlineBlock, 'title')}
                >
                  {t('dashboard.yourBulkStatus')}
                </Typography>
              </Box>
              <Box className={clsx(classes.mr15, 'bubbleNew')}>
                <Typography className='bubbleText'>{t('common.new')}</Typography>
                <TooltipBubble />
              </Box>

            </Box>
          </Grid>



          <Grid
            container
            item xs={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <NewsletterIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>
                {getBillingTypeText(Newsletters)}
              </Typography>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType(3)}>
              <Button className={clsx(classes.btn, classes.btnRounded, !isAllowNewsletter() ? classes.btnDisabled : '')}>
                {t('dashboard.purchase')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>

          <Divider />

          <Grid
            container
            item xs={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <SmsIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>
                {getBillingTypeText(Sms)}
              </Typography>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType(3)}>
              <Button className={clsx(classes.btn, classes.btnRounded, !isAllowSms() ? classes.btnDisabled : '')}>
                {t('dashboard.purchase')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>

          <Divider />

          {Mms.Credits > 0 && <Grid
            container
            item xs={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <WhatsappIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.whatsapp.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>
                {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Mms)}
              </Typography>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType(3)}>
              <Button className={clsx(classes.btn, classes.btnRounded, classes.btnDisabled)}>
                {t('dashboard.purchase')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>}

          <Divider />

          {Notifications.FeatureExist && <Grid
            container
            item xs={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <BellIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2)}>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType(3)}>
              <Button className={clsx(classes.btn, classes.btnRounded, classes.btnDisabled)}>
                {t('dashboard.freeTrial')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>}

        </Grid>
      </Paper>
    </>
  );
}

export default React.memo(BulkStatus);
