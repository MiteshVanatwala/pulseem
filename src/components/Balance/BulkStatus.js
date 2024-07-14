import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PurchaseWizard from './PaymentWizard/PurchaseWizard';
import { GoPackage } from "react-icons/go";
import { Grid, Paper, Typography, Button, Box, Divider } from '@material-ui/core';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { getCommonFeatures } from '../../redux/reducers/commonSlice';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { BellIcon, WhatsappIcon, SmsIcon, CardIcon, NewsletterIcon } from '../../assets/images/dashboard/index'
import { TooltipBubble } from '../../assets/images/dashboard/index';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';

const BulkStatus = ({ classes }) => {
  const { billingTypeId, windowSize, isRTL } = useSelector(state => state.core)
  const { accountSettings, accountFeatures } = useSelector(state => state.common);
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
  const [isOpenPackageDialog, setIsOpenPackageDialog] = useState(false);
  const [selectedPackageType, setPackageType] = useState({ type: 1, title: '' });
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const Redirect = useRedirect();

  const { Mms = {}, Newsletters = {}, Notifications = {}, Sms = {}, Whatsapp = {} } = packagesDetails || {};

  const getBillingTypeText = (product) => {
    switch (product?.eBillingType) {
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
        return product?.Credits && product?.Credits > 0 ? parseFloat(product?.Credits?.toFixed(2))?.toLocaleString() : 0;
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
        // onConfirm: handleDialogClose,
        renderButtons: false,
        showDefaultButtons: false,
        Style: availablePack && availablePack.length < 3 ? { maxWidth: 600, margin: '0 auto' } : null,
        children: dialog.content,
        paperStyle: classes.packageDialogPpaper
      }

      return (
        <BaseDialog classes={classes} {...options} />
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
          <PurchaseWizard classes={classes} onComplete={handleDialogClose} packageType={selectedPackageType.type} />
        </Grid >
      )
    };
  }

  const isAllowSms = () => {
    return billingTypeId !== "1" && Sms.eBillingType === 0 && accountAvailablePackages.length > 0;
  }
  const isAllowNewsletter = () => {
    return accountFeatures && accountFeatures?.indexOf(PulseemFeatures.PURCHASE_NEWSLETTER_PACKAGES) > -1 && billingTypeId !== "1" && Newsletters.eBillingType === 0 && accountAvailablePackages.length > 0;
  }

  const showPackageDialogType = async (packageType) => {
    const settings = await dispatch(getCommonFeatures({ forceRequest: true }));
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
          <Grid item xs={12} className={clsx(classes.posRelative, classes.dashBoxtitleSection)}>
            <Box className={classes.spaceBetween}>
              <Box className={clsx(classes.alignItemsCenter, classes.flexJustifyCenter)}>
                <CardIcon className={clsx(classes.marginInlineEnd15, classes.marginInlineStart5)} />
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
            item sm={12} md={12} lg={12} xl={12}
            className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
            justifyContent='space-between'
          >
            <Grid item md={5} xs={4}>
              <SmsIcon className={classes.shoppingCartIcon} />
              <Typography className={clsx(classes.bulkTitle)}>{t('appBar.sms.title')}</Typography>
            </Grid>

            <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
              <Typography className={clsx(classes.bold)}
                title={`${getBillingTypeText(Sms)} ${t('report.Credits')}`}
                aria-label={`${getBillingTypeText(Sms)} ${t('report.Credits')}`}>
                {getBillingTypeText(Sms)}
              </Typography>
            </Grid>

            <Grid item md={4} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
              {
                isAllowSms() && (
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => showPackageDialogType({ type: 3, title: t('common.smsBulkTitle') })}>
                    {t('dashboard.purchase')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  </Button>
                )
              }
            </Grid>
          </Grid>
          <Divider />
          <Grid
            container
            item sm={12} md={12} lg={12} xl={12}
            className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
            justifyContent='space-between'
          >
            <Grid item md={5} xs={4}>
              <NewsletterIcon className={classes.shoppingCartIcon} />
              <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
            </Grid>

            <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
              <Typography
                className={clsx(classes.bold)}
                title={`${getBillingTypeText(Newsletters)} ${t('report.Credits')}`}
                aria-label={`${getBillingTypeText(Newsletters)} ${t('report.Credits')}`}>
                {getBillingTypeText(Newsletters)}
              </Typography>
            </Grid>

            <Grid item md={4} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
              {
                isAllowNewsletter() && (
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => showPackageDialogType({ type: 2, title: t('common.newsletterBulkTitle') })}>
                    {t('dashboard.purchase')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  </Button>
                )
              }
            </Grid>
          </Grid>
          <Divider />
          {
            Mms.Credits > 0 && (
              <>
                <Grid
                  container
                  item sm={12} md={12} lg={12} xl={12}
                  className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
                  justifyContent='space-between'
                >
                  <Grid item md={5} xs={4}>
                    <SmsIcon className={classes.shoppingCartIcon} />
                    <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
                  </Grid>

                  <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                  </Grid>

                  <Grid item md={1}>
                    <Typography
                      className={clsx(classes.bold)}
                      title={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}
                      aria-label={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}>
                      {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Mms)}
                    </Typography>

                  </Grid>
                </Grid>
                <Divider />
              </>
            )
          }
          {Notifications.FeatureExist && (
            <>
              <Grid
                container
                item sm={12} md={12} lg={12} xl={12}
                className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
                justifyContent='space-between'
              >
                <Grid item md={5} xs={4}>
                  <BellIcon className={classes.shoppingCartIcon} />
                  <Typography className={classes.bulkTitle}>{t('master.notifications')}</Typography>
                </Grid>

                <Grid item md={7} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => Redirect({ url: `${sitePrefix}Notifications` })}>
                    {t('dashboard.freeTrial')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  </Button>
                </Grid>
              </Grid>
              <Divider />
            </>
          )}
          {Whatsapp?.Credits > 0 && (
            <>
              <Grid
                container
                item sm={12} md={12} lg={12} xl={12}
                className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
                justifyContent='space-between'
              >
                <Grid item md={5} xs={4}>
                  <WhatsappIcon className={classes.shoppingCartIcon} />
                  <Typography className={classes.bulkTitle}>{t('appBar.whatsapp.title')}</Typography>
                </Grid>

                <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                  <Typography className={clsx(classes.bold, classes.elipsis, classes.noWrap)} style={{ whiteSpace: 'normal' }}>
                    {billingTypeId === "1" ? t('dashboard.perUsage') : `${getBillingTypeText(Whatsapp)} ${t('common.NIS')}`}
                  </Typography>
                </Grid>

                <Grid item md={4} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => showPackageDialogType({ type: -1, title: t('common.whatsappBulk') })}>
                    {t('dashboard.purchase')}
                    {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  </Button>
                </Grid>
              </Grid>
              <Divider />
            </>
          )}
        </Grid>
      </Paper>
    </>
  )
}

export default React.memo(BulkStatus);
