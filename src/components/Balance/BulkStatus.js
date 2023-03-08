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
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BellIcon, WhatsappIcon, SmsIcon, CardIcon, NewsletterIcon, NewBubbleIcon } from '../../assets/images/dashboard/index'
import { TooltipBubble } from '../../assets/images/dashboard/index';
import useCore from '../../helpers/hooks/Core';
import { BaseDialog } from '../DialogTemplates/BaseDialog';

const BulkStatus = () => {
  const { billingTypeId, accountFeatures, accountSettings, isRTL } = useSelector(state => state.core)
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
  const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
  const [selectedPackageType, setPackageType] = useState({ type: 1, title: '' });
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = useCore()

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
    if (isOpenPackageDialog && accountSettings !== null) {
      let dialog = {};
      let availablePack = null;

      if (accountSettings.Account.IsBillingAccount === false || selectedPackageType.type === -1 || !accountSettings.Account?.IsPaying) {
        dialog = renderBillingSupportDialog();
      }
      else {
        dialog = renderPackagesListDialog();
        availablePack = accountAvailablePackages.filter((aa) => { return aa.CampaignType === selectedPackageType.type });
      }

      const options = {
        classes: classes,
        open: isOpenPackageDialog,
        title: selectedPackageType.title,
        onCancel: handleDialogClose,
        onClose: handleDialogClose,
        onConfirm: handleDialogClose,
        ShowDefaultButtons: false,
        Style: availablePack && availablePack.length < 3 ? { maxWidth: 600, margin: '0 auto' } : null,
        children: dialog.content,
        paperStyle: classes.packageDialogPpaper
      }

      return (
        <BaseDialog {...options}></BaseDialog>
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
          <PurchaseWizard onComplete={handleDialogClose} packageType={selectedPackageType.type} />
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
    if (!settings?.payload?.Data?.Account?.IsPaying) {
      packageType = { type: -1, title: '' };
      setPackageType(packageType);
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
            item sm={9} md={9} lg={10} xl={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <NewsletterIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2, classes.textCenter)}>
              <Typography className={classes.bulkTitle}>
                {getBillingTypeText(Newsletters)}
              </Typography>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType({ type: 2, title: t('dashboard.purchaseNewsletter') })}>
              <Button className={clsx(classes.btn, classes.btnRounded, !isAllowNewsletter() ? classes.btnDisabled : '')}>
                {t('dashboard.purchase')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>

          <Divider />

          <Grid
            container
            item sm={9} md={9} lg={10} xl={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <SmsIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.sms.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2, classes.textCenter)}>
              <Typography className={classes.bulkTitle}>
                {getBillingTypeText(Sms)}
              </Typography>
            </Box>
            <Box className={clsx(classes.flex1)} onClick={() => showPackageDialogType({ type: 3, title: t('dashboard.purchaseSms') })}>
              <Button className={clsx(classes.btn, classes.btnRounded, !isAllowSms() ? classes.btnDisabled : '')}>
                {t('dashboard.purchase')}
                {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
              </Button>
            </Box>
          </Grid>

          <Divider />

          {Mms.Credits > 0 && <Grid
            container
            item sm={9} md={9} lg={10} xl={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <WhatsappIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('appBar.whatsapp.title')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2, classes.textCenter)}>
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
            item sm={9} md={9} lg={10} xl={9}
            className={clsx(classes.flex, classes.mt2, classes.mb2)}
            justifyContent='space-between'
          >
            <Box className={clsx(classes.flex1)}>
              <BellIcon className={classes.shoppingCartIcon} />
            </Box>
            <Box className={clsx(classes.flex2)}>
              <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
            </Box>
            <Box className={clsx(classes.flex2, classes.textCenter)}>
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
