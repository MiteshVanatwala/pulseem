import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PurchaseWizard from './PaymentWizard/PurchaseWizard';
import { GoPackage } from 'react-icons/go';
import { Grid, Paper, Typography, Button, Box, Divider, Tooltip, IconButton } from '@material-ui/core';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { MdArrowBackIos, MdArrowForwardIos, MdSupportAgent } from 'react-icons/md';
import { BellIcon, WhatsappIcon, SmsIcon, CardIcon, NewsletterIcon } from '../../assets/images/dashboard/index'
import { TooltipBubble } from '../../assets/images/dashboard/index';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { WhiteLabelObject } from '../WhiteLabel/WhiteLabelMigrate';
import { MdVoiceChat } from "react-icons/md";
import { URLS } from '../../config/enum';
import AddCardDialog from '../AddCardDialog/AddCardDialog';
import UnsubscribePayPerRecipient from '../PayPerRecipient/UnsubscribePayPerRecipient';
import Toast from '../Toast/Toast.component';
import PayPerRecipientNew from '../PayPerRecipient/PayPerRecipientNew';
import { BiCog } from 'react-icons/bi';
import { getAccountBilling } from '../../redux/reducers/BillingSlice';
import BillingSettings from '../BillingSettings/BillingSettings';
import TierPlans from '../TierPlans/TierPlans';
import { contactSalesForScale, deletePolandSubscription, getCurrentPlan } from '../../redux/reducers/TiersSlice';
import { getAccountSettings } from '../../redux/reducers/AccountSettingsSlice';
import { Loader } from '../Loader/Loader';
import ConfirmDeletePopUp from '../../screens/Groups/Management/Popup/ConfirmDeletePopUp';
import moment from 'moment';
import { DateFormats } from '../../helpers/Constants';
import { logout } from '../../helpers/Api/PulseemReactAPI';

const BulkStatus = ({ classes }) => {
  const { billingTypeId, windowSize, isRTL } = useSelector(state => state.core)
  const { accountSettings, accountFeatures, isGlobal, IsPoland, accountCurrencySymbol, accountIsCurrencySymbolPrefix } = useSelector(state => state.common);
  const { packagesDetails, accountAvailablePackages } = useSelector(state => state.dashboard);
  const { billing: { Data: billingDetail } } = useSelector(state => state.billing);
  const { currentPlan } = useSelector((state) => state.tiers);
  const [ isOpenPackageDialog, setIsOpenPackageDialog ] = useState(false);
  const [ isOpenAddCardDialog, setIsOpenAddCardDialog ] = useState(false);
  const [ isOpenUnsubscribeDialog, setIsOpenUnsubscribeDialog ] = useState(false);
  const [ selectedPackageType, setPackageType ] = useState({ type: 1, title: '' });
  const [ isOpenPayPerRecipient, setIsOpenPayPerRecipient ] = useState(false);
  const [ isOpenBillingSettings, setIsOpenBillingSettings ] = useState(false);
  const [ toastMessage, setToastMessage ] = useState(null);
  const [ billingPopupCallback, setBillingPopupCallback ] = useState(null);
  const [ isOpenEmailTierPlans, setIsOpenEmailTierPlans ] = useState(false);
  const [ isOpenCancelConfirmDialog, setIsOpenCancelConfirmDialog ] = useState(false);
  const [ isLoader, setIsLoader ] = useState(false);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const Redirect = useRedirect();

  const isWhiteLabel = accountSettings.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings.Account?.ReferrerID] !== undefined;

  const { Mms = {}, Newsletters = {}, Notifications = {}, Sms = {}, Whatsapp = {}, SMSVC } = packagesDetails || {};

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
      await dispatch(getAccountBilling());
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
      // if (!accountSettings.Account?.IsBillingAccount) {
      //   dialog = renderBillingSupportDialog();
      // } else {
      dialog = renderPackagesListDialog();
      availablePack = accountAvailablePackages.filter((aa) => { return aa.CampaignType === selectedPackageType.type });
      // }
      
      const options = {
        classes: classes,
        open: isOpenPackageDialog,
        title: selectedPackageType.title,
        onCancel: handleDialogClose,
        onClose: handleDialogClose,
        // onConfirm: handleDialogClose,
        renderButtons: dialog.renderButtons || false,
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
    const isWhiteLabel = accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined;
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 35, padding: 5 }} />
      ),
      showDefaultButtons: false,
      content: (
        <Grid item xs={12} style={{ paddingBottom: 5 }}>
          <Typography className={classes.f20}>
            {RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['BillingTitle']))}
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

  const renderSubscribePayPerRecipientPolandDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage />
      ),
      content: (
        <Box classes={clsx(classes.textCenter)}>
          <Typography className={classes.f18}>{t('dashboard.polishSubscribe.question')}</Typography>
        </Box >
      ),
      renderButtons: () => (
        <Grid
            container
            spacing={2}
            className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
              <Button
                  onClick={() => { }}
                  className={clsx(
                      classes.btn,
                      classes.btnRounded
                  )}>
                  {t('common.SubscribeButton')}
              </Button>
          </Grid>
        </Grid>
      ),
    };
  }

  const renderUnsubscribePayPerRecipientPolandDialog = () => {
    return {
      showDivider: false,
      icon: (
        <GoPackage style={{ fontSize: 35, padding: 5 }} />
      ),
      content: (
        <Grid item xs={12} style={{ paddingBottom: 25 }}>
          <Typography className={classes.f18}>{t('dashboard.polishUnsubscribe.desc1')}</Typography>
          <Typography className={classes.f18}>{t('dashboard.polishUnsubscribe.desc2')}</Typography>
          <Typography className={classes.f18}>{t('dashboard.polishUnsubscribe.desc3')}</Typography>
          <Typography className={classes.f18}>{t('dashboard.polishUnsubscribe.desc4')}</Typography>
        </Grid >
      ),
      renderButtons: () => (
        <Grid
            container
            spacing={2}
            className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
              <Button
                  onClick={() => { }}
                  className={clsx(
                      classes.btn,
                      classes.btnRounded
                  )}>
                  {t('common.SubscribeButton')}
              </Button>
          </Grid>
        </Grid>
      ),
    };
  }

  const isAllowSms = () => {
    return Sms?.FeatureAllowed && billingTypeId !== "1" && Sms.eBillingType === 0 && accountAvailablePackages.length > 0;
  }
  const isAllowNewsletter = () => {
    return Newsletters?.FeatureAllowed && accountFeatures && accountFeatures?.indexOf(PulseemFeatures.PURCHASE_NEWSLETTER_PACKAGES) > -1 && billingTypeId !== "1" && Newsletters.eBillingType === 0 && accountAvailablePackages.length > 0 && !IsPoland;
  }

  const isAllowNewsletterForPoland = () => {
    return Newsletters?.FeatureAllowed && accountFeatures && accountFeatures?.indexOf(PulseemFeatures.PURCHASE_NEWSLETTER_PACKAGES) > -1 && billingTypeId !== "1" && isGlobal === true && IsPoland;
  }

  const isAllowNewsletterSubscription = !Newsletters.IsPrepaid && accountAvailablePackages.filter((aa) => { return aa.CampaignType === 2 }).length === 0;
  const showPackageDialogType = async (packageType) => {
    setPackageType(packageType);
    setIsOpenPackageDialog(true);
  }

  const handleEmailTierCancelPlan = async () => {
    setIsOpenCancelConfirmDialog(false);    
    setIsLoader(true);
    
    // For cancel plan, we typically downgrade to the free/basic tier (ID: 1)
    const response = await dispatch(deletePolandSubscription());
    setIsLoader(false);
    
    switch (response?.payload?.StatusCode) {
      case 201:
      case 200: {
        setToastMessage({ 
          severity: 'success', 
          color: 'success', 
          message: t('billing.planCancelledSuccess'), 
          showAnimtionCheck: false 
        });
        // Refresh current plan data
        dispatch(getCurrentPlan());
        break;
      }
      case 404: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: t('billing.planNotFound'),
          showAnimtionCheck: false
        });
        break;
      }
      case 406: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: t('common.ErrorOccured'),
          showAnimtionCheck: false
        });
        break;
      }
      case 401: {
        logout();
        break;
      }
      default: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: response?.payload?.Message || t('billing.planCancelFailed'),
          showAnimtionCheck: false
        });
        break;
      }
    }
  }
  
  const handleCancelPlan = async () => {
    try {
      setIsLoader(true);
      const accountData = await dispatch(getAccountSettings()).unwrap();
      const account = accountData?.Data;

      if (!account?.CompanyName || !account?.Email || !account?.CellPhone) {
        setToastMessage({ severity: 'error', color: 'error', message: t('SubAccount.subAccountNotFound'), showAnimtionCheck: false });
        setIsOpenCancelConfirmDialog(false);
        return;
      }

      const request = {
        Name: account?.CompanyName || '',
        Email: account?.Email || '',
        Cellphone: account?.CellPhone || '',
        Message: 'Cancel plan request'
      };

      const result = await dispatch(contactSalesForScale(request)).unwrap();
      setIsLoader(false);
      if (result?.StatusCode === 200) {
        setToastMessage({ severity: 'success', color: 'success', message: t('common.planCancellationRequestSubmitted'), showAnimtionCheck: false });
        await dispatch(getPackagesDetails());
      } else {
        setToastMessage({ severity: 'error', color: 'error', message: result?.Message || t('common.Error'), showAnimtionCheck: false });
      }
    } catch (error) {
      setToastMessage({ severity: 'error', color: 'error', message: t('WhatsappApiResponse.twilio.45350.description'), showAnimtionCheck: false });
    } finally {
      setIsOpenCancelConfirmDialog(false);
    }
  };

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  if (isGlobal === true && !IsPoland) return <></>;

  const isBillingDetailsRequired = billingDetail?.CompanyName === '' || billingDetail?.CompanyName === null || billingDetail?.CorporationNumber === '' || billingDetail?.CorporationNumber === null || billingDetail?.Email === '' || billingDetail?.Email === null;

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
              {isWhiteLabel ? <Box className={clsx(classes.mr15, 'bubbleNew')}>
                <Typography className='bubbleText'>{t('common.new')}</Typography>
                <TooltipBubble />
              </Box> :
                <Box className={clsx(classes.dFlex, classes.flexWrap)} justifyContent='center' alignItems='center'>
                  <Tooltip
                    arrow
                    title={t('master.RadMenuItemResource21.Text')}
                    placement={"top"}
                    open
                    classes={{
                      tooltip: clsx(classes.tooltipPrimary, classes.f12),
                      arrow: classes.colrPrimary
                    }}
                  >
                    <IconButton size="small" className={clsx(classes.noPadding)} onClick={() => window.open(URLS.ContactUs, '_blank')}>
                      <MdSupportAgent className={classes.linkNoDesign} style={{ fontSize: 30, color: '#ff3343' }} title={t('master.RadMenuItemResource21.Text')} />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
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
                  <Button
                    className={clsx(classes.btn, classes.btnRounded, classes.f12)}
                    onClick={() => {
                      if (isBillingDetailsRequired) {
                        setIsOpenBillingSettings(true);
                        setBillingPopupCallback('SMS');
                      } else {
                        showPackageDialogType({ type: 3, title: t('common.smsBulkTitle') });
                      }
                    }}
                  >
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
              className={clsx(classes.flex, classes.mt2, isAllowNewsletterSubscription && Newsletters?.IsEmailTierSubscribed ? classes.mb1 : classes.mb2, classes.paddingSides15)}
              justifyContent='space-between'
            >
              <Grid item md={5} xs={4}>
                <NewsletterIcon className={classes.shoppingCartIcon} />
                <Typography className={classes.bulkTitle}>{t('appBar.newsletter.title')}</Typography>
              </Grid>

              <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                {  
                  <Tooltip
                    title={getBillingTypeText(Newsletters)}
                    placement='top-start'
                    interactive={true}
                    classes={{
                      tooltip: clsx(classes.tooltipPrimary, classes.f12),
                      arrow: classes.colrPrimary
                    }}
                  >
                    <Typography
                      className={clsx(classes.bold, classes.elipsis)}
                      title={`${getBillingTypeText(Newsletters)} ${t('report.Credits')}`}
                      aria-label={`${getBillingTypeText(Newsletters)} ${t('report.Credits')}`}>
                      {getBillingTypeText(Newsletters)}
                    </Typography>
                  </Tooltip>
                }
              </Grid>

              <Grid item md={4} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
                {
                  !IsPoland && Newsletters.eBillingType === 2 && (
                    <>
                      {
                        !isAllowNewsletterSubscription && !Newsletters?.IsEmailTierSubscribed && (
                          <Button
                            className={clsx(classes.btn, classes.btnRounded, classes.f12)}
                            onClick={() => {
                              console.log("475")
                              if (isAllowNewsletter()) {
                                if (isBillingDetailsRequired) {
                                  console.log("478")
                                  setIsOpenBillingSettings(true);
                                  setBillingPopupCallback('Newsletter');
                                } else {
                                  console.log("482")
                                  showPackageDialogType({ type: 2, title: t('common.newsletterBulkTitle') });
                                }
                              } else if (isAllowNewsletterSubscription) {
                                console.log("486")
                                if (isBillingDetailsRequired) {
                                  console.log("488")
                                  setIsOpenBillingSettings(true);
                                  setBillingPopupCallback('EmailTier');
                                } else {
                                  console.log("492")
                                  setIsOpenEmailTierPlans(true);
                                }
                              }
                            }}
                          >
                            {t('dashboard.purchase')}
                            {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                          </Button>
                        )
                      }
                    </>
                  )
                }
                {
                  isAllowNewsletterForPoland() && (
                    <>
                      {
                        Newsletters.IsEmailPolandSubscribed ? (
                          <>
                            <IconButton className={clsx(classes.p5)} onClick={() => setIsOpenPayPerRecipient(true)}>
                              <BiCog />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            className={clsx(classes.btn, classes.btnRounded, classes.f12)}
                            onClick={() => {
                              if (isBillingDetailsRequired) {
                                setIsOpenBillingSettings(true);
                                setBillingPopupCallback('PayPerRecipient');
                              } else setIsOpenPayPerRecipient(true)
                            }}
                          >
                            {t(`common.${ !Newsletters.IsEmailPolandSubscribed ? 'SubscribeButton' : 'cancel'}`)}
                            {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                          </Button>
                        )
                      }
                    </>
                  )
                }
              </Grid>
                {
                  !IsPoland && (Newsletters.eBillingType === 0 || Newsletters.eBillingType === 2) && (
                    <>
                      {
                        isAllowNewsletterSubscription && Newsletters?.IsEmailTierSubscribed ?
                          (
                            <>
                              <Divider className={clsx(classes.rocketImage, classes.mt1)} />
                              <Grid container className={clsx(classes.mt1)} alignItems='center'>
                                <Grid item md={5} xs={4}>
                                  <Typography className={clsx(classes.bulkTitle, classes.mlr30, classes.pl5)}>{t('billing.plan')}</Typography>
                                </Grid>
                                <Grid item md={3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                                  {
                                    <Tooltip
                                      title={currentPlan?.Name}
                                      placement='top-start'
                                      interactive={true}
                                      classes={{
                                        tooltip: clsx(classes.tooltipPrimary, classes.f12),
                                        arrow: classes.colrPrimary
                                      }}
                                    >
                                      <Typography className={clsx(classes.bold, classes.elipsis)}>
                                        {currentPlan?.Name}
                                      </Typography>
                                    </Tooltip>
                                  }
                                </Grid>
                                 <Grid item md={4} xs={4} className={clsx(classes.justifyContentEnd)}>
                                  <Button
                                    className={clsx(
                                      classes.btn,
                                      classes.btnRounded,
                                      classes.marginSides5,
                                      classes.smallButton
                                    )}
                                    onClick={() => {
                                      setIsOpenEmailTierPlans(true);
                                    }}
                                  >
                                    {t('billing.tier.steps.upgrade')}
                                  </Button>
                                  <Button
                                    className={clsx(
                                      classes.btn,
                                      classes.btnRounded,
                                      classes.smallButton
                                    )}
                                    onClick={() => {
                                      setIsOpenCancelConfirmDialog(true);
                                    }}
                                  >
                                    {t('common.cancel')}
                                  </Button>
                                </Grid>
                              </Grid>
                            </>
                          ) : null
                      }
                    </>
                  )
                }
            </Grid>
          <Divider />
          {/* {
            isAllowNewsletterForPoland() && Newsletters.eBillingType === 2 && (
              <>
                <Grid container spacing={2} className={clsx(classes.p10)}>
                  <Grid item md={6}>
                    {getBillingTypeText(Newsletters)}
                  </Grid>
                  <Grid item md={6}>
                    {
                      Newsletters.LevelLow > 0 && Newsletters.LevelHigh > 0 && (
                        <>
                          {Newsletters.LevelLow}
                          -
                          {Newsletters.LevelHigh}
                        </>
                      )
                    }
                  </Grid>
                </Grid>
                <Divider />
              </>
            )
          } */}
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
          {Whatsapp.FeatureExist && Whatsapp.FeatureAllowed && (<>
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

              <Grid item md={Whatsapp.eBillingType === 8 ? 7 : 3} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                <Typography className={clsx(classes.bold, classes.elipsis, classes.noWrap)} style={{ whiteSpace: 'normal' }}>
                  {
                    billingTypeId === "1" || Whatsapp.eBillingType === 8
                    ? t('dashboard.perUsage') 
                    : `${accountIsCurrencySymbolPrefix ? accountCurrencySymbol : ''} ${getBillingTypeText(Whatsapp)} ${!accountIsCurrencySymbolPrefix ? accountCurrencySymbol : ''}`
                  }
                </Typography>
              </Grid>

              {
                Whatsapp.eBillingType !== 8 && (
                  <Grid item md={4} xs={4} className={isRTL ? classes.textLeft : classes.textRight}>
                    {Whatsapp?.FeatureAllowed && <Button className={clsx(classes.btn, classes.btnRounded, classes.f12)} onClick={() => {
                      if (isBillingDetailsRequired) {
                        setIsOpenBillingSettings(true);
                        setBillingPopupCallback('Whatsapp');
                      } else {
                        showPackageDialogType({ type: 4, title: t('common.whatsappBulk') })
                      }
                    }}>
                      {t('dashboard.purchase')}
                      {isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    </Button>}
                  </Grid>
                )
              }
            </Grid>
            <Divider />
          </>)}
          {
            accountFeatures && accountFeatures?.indexOf(PulseemFeatures.MMS) > -1 && Mms.Credits > 0 && (
              <>
                <Grid
                  container
                  item sm={12} md={12} lg={12} xl={12}
                  className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
                  justifyContent='space-between'
                >
                  <Grid item md={4} xs={4}>
                    <SmsIcon className={classes.shoppingCartIcon} />
                    <Typography className={classes.bulkTitle}>{t('appBar.mms.title')}</Typography>
                  </Grid>
                  <Grid item md={1} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                    <Typography
                      className={clsx(classes.bold)}
                      title={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}
                      aria-label={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}>
                      {billingTypeId === "1" ? t('dashboard.perUsage') : getBillingTypeText(Mms)}
                    </Typography>
                  </Grid>
                  <Grid item md={5} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                    &nbsp;
                  </Grid>
                </Grid>
                <Divider />
              </>
            )
          }

          {SMSVC && SMSVC?.FeatureExist && (<>
            <Grid
              container
              item sm={12} md={12} lg={12} xl={12}
              className={clsx(classes.flex, classes.mt2, classes.mb2, classes.paddingSides15)}
              justifyContent='space-between'
            >
              <Grid item md={4} xs={4}>
                <MdVoiceChat className={classes.shoppingCartIcon} style={{ opacity: '.3' }} />
                <Typography className={classes.bulkTitle}>{t('common.smsVc')}</Typography>
              </Grid>
              <Grid item md={1} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                <Typography
                  className={clsx(classes.bold)}
                  title={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}
                  aria-label={`${getBillingTypeText(Mms)} ${t('report.Credits')}`}>
                  {billingTypeId === "1" ? t('dashboard.perUsage') : `${getBillingTypeText(SMSVC)}`}
                </Typography>

              </Grid>
              <Grid item md={5} xs={4} className={clsx(classes.paddingSides10, windowSize === 'xs' ? classes.textRight : '')}>
                &nbsp;
              </Grid>
            </Grid>
          </>)}
        </Grid>
        <BillingSettings
          classes={classes}
          isOpen={isOpenBillingSettings}
          onClose={(isSuccess) => {
            setIsOpenBillingSettings(false);
            if (isSuccess) {
              if (billingPopupCallback === 'SMS') {
                showPackageDialogType({ type: 3, title: t('common.smsBulkTitle') });
              } else if (billingPopupCallback === 'Whatsapp') {
                showPackageDialogType({ type: 4, title: t('common.whatsappBulk') });
              } else if (billingPopupCallback === 'PayPerRecipient') {
                setIsOpenPayPerRecipient(true);
              } else if (billingPopupCallback === 'Newsletter') {
                showPackageDialogType({ type: 2, title: t('common.newsletterBulkTitle') });
              } else if (billingPopupCallback === 'Email') {
                setIsOpenEmailTierPlans(true);
              } else if (billingPopupCallback === 'EmailTier') {
                setIsOpenEmailTierPlans(true);
              }
              setBillingPopupCallback(null);
            }
          }}
        />
        <TierPlans
        classes={classes}
        isOpen={isOpenEmailTierPlans}
        onClose={() => {
          setIsOpenEmailTierPlans(false);
          dispatch(getPackagesDetails());
        }}
        isEmailMarketing={true}
        isBankTransferForTiers={Newsletters?.IsBankTransferForTiers}
      />
        <PayPerRecipientNew
          classes={classes}
          isOpen={isOpenPayPerRecipient}
          onClose={(PricePackageId) => {
            setIsOpenPayPerRecipient(false);
            if (PricePackageId) {
              setIsOpenAddCardDialog(true);
            }
          }}
        />
        <AddCardDialog
          classes={classes}
          isOpen={isOpenAddCardDialog}
          onClose={() => setIsOpenAddCardDialog(false)}
        />
        <UnsubscribePayPerRecipient
          classes={classes}
          isOpen={isOpenUnsubscribeDialog}
          onClose={async (response) => {
            setIsOpenUnsubscribeDialog(false);
            if (response) {
              setToastMessage({ severity: 'success', color: 'success', message: t('dashboard.polishUnsubscribe.success'), showAnimtionCheck: false });
              await dispatch(getPackagesDetails());
            }
          }}
        />
        <ConfirmDeletePopUp
          classes={classes}
          isOpen={isOpenCancelConfirmDialog}
          title={t('billing.confirmCancelPlanTitle')}
          text={t('billing.confirmCancelPlanText').replace("{Date}", moment(currentPlan?.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY) || '')}
          onClose={() => setIsOpenCancelConfirmDialog(false)}
          onCancel={() => setIsOpenCancelConfirmDialog(false)}
          handleDeleteGroup={handleEmailTierCancelPlan}
          windowSize={windowSize}
        />
      </Paper>
      {renderToast()}
      <Loader isOpen={isLoader} showBackdrop={true} />
    </>
  )
}

export default React.memo(BulkStatus);
