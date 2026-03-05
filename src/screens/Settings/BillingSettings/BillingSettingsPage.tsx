import React, { useEffect, useRef, useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Grid,
  Link,
  Typography,
} from "@material-ui/core";
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import Toast from "../../../components/Toast/Toast.component";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { ERROR_TYPE } from "../../../helpers/Types/common";
import { getCurrentPlan, getAvailablePlans, downgradePlan, deletePolandSubscription } from "../../../redux/reducers/TiersSlice";
import BillingDetails from "./BillingDetails";
import { getCreditCardIframe, getAccountOperations, payDebtInvoices, inactiveCreditCard, cancelFrozenSends, releaseFrozenSends, getAccountBilling } from "../../../redux/reducers/BillingSlice";
import { Loader } from "../../../components/Loader/Loader";
import PurchaseTableTemplate from "./PurchaseTableTemplate";
import { PurchaseHistoryModel } from "../../../Models/Account/AccountBilling";
import CreditHistoryDetails from "./CreditHistoryDetails";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import queryString from 'query-string';
import { getAccountCards } from "../../../redux/reducers/paymentSlice";
import { PulseemResponse } from "../../../Models/APIResponse";
import { logout } from "../../../helpers/Api/PulseemReactAPI";
import { DialogOptions } from "../../../helpers/Types/Dialog";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import moment from "moment";
import i18n from "../../../i18n";
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import SharedAppBar from "../../../components/core/SharedAppBar";
import { PulseemFeatures } from "../../../model/PulseemFields/Fields";
import ConfirmDeletePopUp from "../../Groups/Management/Popup/ConfirmDeletePopUp";
import useRedirect from "../../../helpers/Routes/Redirect";
import { RedirectPropTypes } from "../../../helpers/Types/Redirect";
import { sitePrefix } from "../../../config";
import SummaryPopup from "./SummaryPopup";
import CreditCardManagement from "../../../components/BillingSettings/CreditCardManagement";
import TierPlans from "../../../components/TierPlans/TierPlans";
import { CreditCard } from "@material-ui/icons";
import { DateFormats } from "../../../helpers/Constants";
import { getPackagesDetails } from "../../../redux/reducers/dashboardSlice";
import BillingSettings from "../../../components/BillingSettings/BillingSettings";


const BillingSettingsPage = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const Redirect = useRedirect();
  const debtPanel: any = useRef(null);
  const { isRTL, windowSize, isAdmin, isDebtAccount, userRoles } = useSelector((state: any) => state.core);
  const { accountFeatures } = useSelector((state: any) => state.common);
  const { creditCards } = useSelector((state: any) => state.payment);
  const { subAccount } = useSelector((state: any) => state.common);
  const { currentPlan } = useSelector((state: any) => state.tiers);
  const { packagesDetails } = useSelector((state: any) => state.dashboard);
  const { billing: { Data: billingDetail } } = useSelector((state: any) => state.billing);
  const qs = (window.location.search && queryString.parse(window.location.search)) as any;
  const [addCardDialog, setAddCardDialog] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
  const [paymentIframe, setPaymentIframe] = useState<string>('');
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [showPurchaseLoader, setShowPurchaseLoader] = useState<boolean>(true);
  const [showOpenInvoicesLoader, setShowOpenInvoicesLoader] = useState<boolean>(true);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState<PurchaseHistoryModel[]>();
  const [purchaseUnpaidData, setPurchaseUnpaidData] = useState<PurchaseHistoryModel[]>();
  const [openPanels, setOpenPanels] = useState<string[]>([qs?.p || '1']);
  const [invoicesForPayment, setInvoicesForPayment] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [currentDialog, setCurrentDialog] = useState<any>('debt');
  const [hasDebt, setHasDebt] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);
  const [confirmCancelPlan, setConfirmCancelPlan] = useState<boolean>(false);
  const [tranzilaError, setTranzilaError] = useState<any>(null);
  const [showEditCard, setShowEditCard] = useState<boolean>(false);
  const [showCreditCardManagement, setShowCreditCardManagement] = useState<boolean>(false);
  const [showTierPlans, setShowTierPlans] = useState<boolean>(false);
  const [ hasFrozenEmail, setHasFrozenEmail ] = useState(false);
  const [ showReleaseMessage, setShowReleaseMessage ] = useState(false);
  const [ showCancelMessage, setShowCancelMessage ] = useState(false);
  const [ showFrozenDialog, setShowFrozenDialog ] = useState(false);
  const [ isOpenBillingSettings, setIsOpenBillingSettings ] = useState(false);
  const hideEmailWithTier = true;

  const isBillingDetailsRequired = billingDetail?.CompanyName === '' || billingDetail?.CompanyName === null || billingDetail?.CorporationNumber === '' || billingDetail?.CorporationNumber === null || billingDetail?.Email === '' || billingDetail?.Email === null;

  const formatPlanDescription = () => {
    const price = currentPlan?.Name !== 'GRAND_FATHER' && currentPlan?.Name !== 'Starter' ? `₪${currentPlan?.Price}/${t('billing.month')}` : '';
    const date = currentPlan?.TierSubscriptionStartDate && currentPlan?.TierSubscriptionEndDate ? ` • ${t("common.startDate")} - ${moment(currentPlan?.TierSubscriptionStartDate).format(DateFormats.DATE_ONLY)} - ${t("common.endDate")} - ${moment(currentPlan?.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY)}` : '';
    return `${price} ${date}`;
  };

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const initPurchaseHistory = async () => {
    dispatch(getPackagesDetails());
    dispatch(getAccountCards()) as any;
    dispatch(getCurrentPlan()) as any;
    dispatch(getAvailablePlans()) as any;
    const paidResponse = await dispatch(getAccountOperations(true)) as any;
    const unpaidResponse = await dispatch(getAccountOperations(false)) as any;

    if (paidResponse && paidResponse?.payload?.StatusCode === 201) {
      setPurchaseHistoryData(paidResponse?.payload?.Data);
    }
    if (unpaidResponse && unpaidResponse?.payload?.StatusCode === 201) {
      setPurchaseUnpaidData(unpaidResponse?.payload?.Data);

      if (unpaidResponse?.payload?.Data?.length > 0) {
        setCurrentDialog('debt');
        setShowPopup(true);

        const expiredOpertaionIds: string[] = unpaidResponse?.payload?.Data?.filter((ifp: PurchaseHistoryModel) => {
          const expiredMonths = moment().diff(ifp.OperationDate, 'months');
          if (expiredMonths >= 3) {
            return ifp.OperationID?.toString();
          }
          return null;
        });

        if (expiredOpertaionIds?.length > 0) {
          setHasDebt(true);
        }
        else {
          setShowEditCard(true);
        }
      }
    }
    setShowPurchaseLoader(false);
    setShowOpenInvoicesLoader(false);
  }

  useEffect(() => {
    accountFeatures.indexOf(PulseemFeatures.NOT_TO_SHOW_CREDITS_HISTORY_FEATURE) === -1 && initPurchaseHistory();
    dispatch(getAccountBilling());
  }, []);

  useEffect(() => {
    if (subAccount) {
      !subAccount?.CompanyAdmin && Redirect({
        url: `${sitePrefix}`,
        openNewTab: false
      } as RedirectPropTypes)
    }
  }, [subAccount])

  useEffect(() => {
    i18n.changeLanguage(isRTL ? 'he-IL' : 'en-US');
  }, [isRTL]);

  useEffect(() => {
    window.addEventListener('message', (e) => {
        if (e.data) {
            try {
                const message = JSON.parse(e.data);
                if (message["result"] !== null && message["result"] !== undefined) {
                    if (message?.hasFrozenEmail === true || String(message?.hasFrozenEmail).toLowerCase() === "true") {
                        setHasFrozenEmail(true);
                        setShowFrozenDialog(true);
                    }
                }
            }
            catch (e) {
                // dispatch(sendToTeamChannel({
                //     MethodName: 'UseEffect',
                //     ComponentName: 'TranzilaIframe',
                //     Message: e
                // }));
                return false;
            }
        }
    })
  }, []);

  const processFrozenCampaigns = async (action: string) => {
    setShowLoader(true);
    const { payload: { StatusCode } }: any = await dispatch(action === 'cancel' ? cancelFrozenSends() : releaseFrozenSends());
    if (StatusCode === 200) {
      if (action === 'process') {
        setShowReleaseMessage(true);
      } else {
        setShowCancelMessage(true);
      }
    }
    setShowLoader(false);
  };

  const FrozenCampaignsMessage = () => {
    if (!hasFrozenEmail) return null;
    
    return (
      <Box className={clsx(classes.frozenCampaignsContainer, classes.pt25)}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Box>
              <Typography className={clsx(classes.f20)}>
                {!showReleaseMessage && !showCancelMessage && RenderHtml(t("dashboard.polishSubscribe.frozenMessage"))}
                {showReleaseMessage && RenderHtml(t("dashboard.polishSubscribe.releaseMessage"))}
                {showCancelMessage && RenderHtml(t("dashboard.polishSubscribe.cancelMessage"))}
              </Typography>
              {
                !showReleaseMessage && !showCancelMessage && (
                  <Grid container spacing={2} className={clsx(classes.mt10, classes.textCenter)}>
                    <Grid item md={12} xs={12} className={clsx(classes.w100)}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => processFrozenCampaigns('process')}
                        disabled={showLoader}
                        className={clsx(classes.btn, classes.btnRounded, classes.mInline5)}
                      >
                        {t('common.Yes')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => processFrozenCampaigns('cancel')}
                        disabled={showLoader}
                        className={clsx(classes.btn, classes.btnRounded, classes.mInline5)}
                      >
                        {t('common.No')}
                      </Button>
                    </Grid>
                  </Grid>
                )
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const handleOnCardSaved = () => {
    setAddCardDialog(false);
    dispatch(getAccountCards()) as any;
  }

  const handleCreditCardIframe = async () => {
    setShowLoader(true);
    const culture: string = isRTL ? 'he' : 'en';
    const response = await dispatch(getCreditCardIframe(culture)) as any;
    setPaymentIframe(response?.payload?.Data);
  }

  const handleShowCreditCardIframe = () => {
    handleCreditCardIframe().then(() => {
      setAddCardDialog(true);
      setShowLoader(false);
    });
  }

  const handleRemoveCreditCard = async () => {
    setConfirmDialog(false);
    setShowLoader(true);
    const response = await dispatch(inactiveCreditCard()) as any;
    setShowLoader(false);
    switch (response?.payload?.StatusCode) {
      case 201: {
        setToastMessage({ severity: 'success', color: 'success', message: t('billing.cardInactiveSuccess'), showAnimtionCheck: false });
        initPurchaseHistory();
        break;
      }
      case 404: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: t('billing.creditNotFound'),
          showAnimtionCheck: false
        } as ERROR_TYPE);
        break;
      }
      case 406: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: t('common.ErrorOccured'),
          showAnimtionCheck: false
        } as ERROR_TYPE);
        break;
      }
      case 401: {
        logout();
        break;
      }
    }
  }

  const handleCancelPlan = async () => {
    setConfirmCancelPlan(false);
    setShowLoader(true);
    
    // For cancel plan, we typically downgrade to the free/basic tier (ID: 1)
    const response = await dispatch(downgradePlan({ newTierId: 1 })) as any;
    setShowLoader(false);
    
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
        } as ERROR_TYPE);
        break;
      }
      case 406: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: t('common.ErrorOccured'),
          showAnimtionCheck: false
        } as ERROR_TYPE);
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
        } as ERROR_TYPE);
        break;
      }
    }
  }

  const handleManageCreditCard = () => {
    setShowCreditCardManagement(true);
  }

  const handleCreditCardManagementClose = () => {
    setShowCreditCardManagement(false);
  }

  const handleAddCardFromManagement = () => {
    setShowCreditCardManagement(false);
    handleShowCreditCardIframe();
  }

  const handleEditCardFromManagement = (cardId: string) => {
    setShowCreditCardManagement(false);
    handleShowCreditCardIframe();
  }

  const handleDeleteCardFromManagement = (cardId: string) => {
    setShowCreditCardManagement(false);
    setConfirmDialog(true);
  }

  const handlePanels = (panelName: string) => {
    const found = openPanels.filter((x: string) => { return x === panelName });
    if (found && found?.length > 0) {
      setOpenPanels(openPanels.filter((x: string) => { return x !== panelName }))
    } else {
      setOpenPanels([...openPanels, panelName]);
    }
  }

  const handleInvoices = (items: any[]) => {
    const uniqueItems = items?.reduce((a: any, b: any) => {
      if (b && a && a.indexOf(b) < 0) a.push(b);
      return a;
    }, []);
    setInvoicesForPayment(uniqueItems);
  }

  const payInvoices = async () => {
    setShowPopup(false);
    setShowLoader(true);
    const invoiceIds = purchaseUnpaidData?.filter((item: PurchaseHistoryModel) => {
      return invoicesForPayment.indexOf(item.OperationID.toString()) !== -1;
    }).map((g: PurchaseHistoryModel) => { return g.OperationID });

    // @ts-ignore
    const debtResponse = await dispatch(payDebtInvoices(invoiceIds)) as any;

    handlePayResponse(debtResponse?.payload);
    setShowLoader(false);
  }

  const handlePayResponse = (response: PulseemResponse) => {
    switch (response.StatusCode) {
      case 201: {
        setCurrentDialog('success');
        setShowPopup(true);
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 404:
      case 405: {
        handleShowCreditCardIframe();
        break;
      }
      case 406:
      case 407:
      case 408:
      case 409: {
        setCurrentDialog('failed');
        setShowPopup(true);
        setTranzilaError(response.Data);
        break;
      }
      case 410: {
        setCurrentDialog('multipleInvoiceTypeSelected');
        setShowPopup(true);
        break;
      }
      case 500: {
        setToastMessage({
          color: 'error',
          severity: 'error',
          message: response?.Data || response?.Message,
          showAnimtionCheck: false
        } as ERROR_TYPE);
        // alert(t('common.ErrorOccured'));
        break;
      }
    }
  }

  const focusOnDebt = () => {
    setOpenPanels(['2']);
    debtPanel?.current?.scrollIntoView();
  }

  const renderDebtDialog = () => {
    return {
      title: t('billing.debtBalance'),
      open: showPopup,
      exitButton: false,
      onClose: (e: any) => { setShowPopup(false); focusOnDebt() },
      onCancel: (e: any) => { setShowPopup(false); focusOnDebt() },
      disableBackdropClick: true,
      showDefaultButtons: false,
      renderButtons: () => {
        return <>
          {(!creditCards || creditCards?.length === 0) ? (<Button
            style={{ marginInlineStart: 'auto' }}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}
            onClick={(e: any) => { setShowPopup(false); handleShowCreditCardIframe() }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            <>{t("settings.billingSettings.btnAddCard")}</>
          </Button>) : (<Button
            style={{ marginInlineStart: 'auto' }}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}
            onClick={(e: any) => { setShowPopup(false); focusOnDebt() }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            <>{t("common.continue")}</>
          </Button>)}
        </>
      },
      children: <>{RenderHtml(t('billing.debtWelcomeMessage'))}</>
    } as DialogOptions;
  }

  const handlePostPayment = () => {
    setShowPopup(false);
    initPurchaseHistory();
  }

  const renderSuccessDialog = () => {
    return {
      title: t('billing.paymentSuccessfulTitle'),
      open: showPopup,
      icon: <IoIosCheckmarkCircleOutline />,
      onCancel: () => { setShowPopup(false) },
      disableBackdropClick: true,
      showDefaultButtons: false,
      renderButtons: () => {
        return <Button
          style={{ marginInlineStart: 'auto' }}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}
          onClick={(e: any) => { isDebtAccount && isDebtAccount === true ? logout() : handlePostPayment() }}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        >
          <>{isDebtAccount && isDebtAccount === true ? t("common.reconnect") : t("common.close")}</>
        </Button>
      },
      children: <Box style={{ marginBottom: 25 }}>{
        RenderHtml(isDebtAccount && isDebtAccount === true ?
          t('billing.paymentSuccessful') :
          t('billing.paymentSuccessfulWithoutLogout'))}</Box>
    } as DialogOptions;
  }
  const renderFailedDialog = () => {
    return {
      title: t('billing.paymentFailedTitle'),
      open: showPopup,
      icon: <IoIosCloseCircleOutline />,
      onCancel: () => { setShowPopup(false); setCurrentDialog(null) },
      disableBackdropClick: true,
      showDefaultButtons: false,
      renderButtons: () => {
        return <Button
          style={{ marginInlineStart: 'auto' }}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}
          onClick={(e: any) => { setShowPopup(false); setCurrentDialog(null) }}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        >
          <>{t("common.close")}</>
        </Button>
      },
      children: <>
        <Box style={{ marginBottom: 25 }}>{RenderHtml(t('billing.paymentFailed'))}</Box>
        {tranzilaError !== null && <>
          <Box><b>{t('common.errorCode')}:</b> {tranzilaError}</Box>
          <br />
          <Box>{RenderHtml(t('common.errorCodeSupport'))}</Box>
        </>}
      </>
    } as DialogOptions;
  }
  const renderMultipleInvoiceTypeDialog = () => {
    return {
      title: t('billing.paymentFailedTitle'),
      open: showPopup,
      icon: <IoIosCloseCircleOutline />,
      onCancel: () => { setShowPopup(false); setCurrentDialog(null) },
      disableBackdropClick: true,
      showDefaultButtons: false,
      renderButtons: () => {
        return <Button
          style={{ marginInlineStart: 'auto' }}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}
          onClick={(e: any) => { setShowPopup(false); setCurrentDialog(null) }}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        >
          <>{t("common.close")}</>
        </Button>
      },
      children: <Box style={{ marginBottom: 25 }}>{
        RenderHtml(t('billing.multipleInvoiceTypeMessage'))}</Box>
    } as DialogOptions;
  }

  const renderCreditCardDialog = () => {
    return {
      title: t('billing.creditCardManagement.title'),
      open: showPopup,
      onClose: () => { setShowPopup(false); setCurrentDialog(null); },
      onCancel: () => { setShowPopup(false); setCurrentDialog(null); },
      showDefaultButtons: false,
      icon: <CreditCard className={clsx(classes.verticalAlignMiddle, classes.ml5)} />,
      children: <CreditCardManagement
        classes={classes}
        onAddCard={handleAddCardFromManagement}
        onEditCard={handleEditCardFromManagement}
        onDeleteCard={handleDeleteCardFromManagement}
      />
    } as DialogOptions;
  }

  const renderOptions = () => {
    switch (currentDialog) {
      default:
      case 'debt': {
        return renderDebtDialog();
      }
      case 'success': {
        return renderSuccessDialog();
      }
      case 'paymentSummary': {
        return renderSummaryDialog();
      }
      case 'failed': {
        return renderFailedDialog();
      }
      case 'multipleInvoiceTypeSelected': {
        return renderMultipleInvoiceTypeDialog();
      }
      case 'creditCardDialog': {
        return renderCreditCardDialog();
      }
    }
  }

  const renderSummaryDialog = () => {
    return {
      title: t('payment.purchaseSummary'),
      open: showPopup,
      exitButton: false,
      onClose: () => setShowPopup(false),
      onCancel: () => setShowPopup(false),
      disableBackdropClick: true,
      showDefaultButtons: false,
      renderButtons: () => {
        return <Box className={clsx(classes.dFlex, classes.justifyContentEnd)}>
          <Button
            style={{ marginInlineEnd: 15 }}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}
            onClick={(e: any) => { setShowPopup(false) }}
          >
            <>{t("common.cancel")}</>
          </Button>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}
            onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); payInvoices() }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            <>{t("common.pay")}</>
          </Button>
        </Box>
      },
      children: <SummaryPopup
        classes={classes}
        data={purchaseUnpaidData?.filter((ud: PurchaseHistoryModel) => { return invoicesForPayment.indexOf(ud.OperationID.toString()) > -1 })}
      />
    } as DialogOptions;
  }

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="billingSettings"
      classes={classes}
      containerClass={classes.management}
    >
      <Box className={classes.mb50}>
        {toastMessage && renderToast()}
        {hasDebt && !isAdmin && <SharedAppBar classes={classes} />}
        <Box className={'topSection'} style={{ marginTop: hasDebt && !isAdmin ? 100 : 37.870 }}>
          <Title Text={t('settings.billingSettings.pageTitle')} classes={classes} ContainerStyle={{ width: 'auto' }} />
          
          {
            currentPlan?.Name !== 'GRAND_FATHER' && (  
              <>
                {/* Your Plan Section */}
                <Box className={classes.accordion}>
                  <Card className={clsx(classes.borderBox, classes.m10)} style={{ marginBottom: 0 }}>
                    <Box className={clsx(classes.dFlex, classes.spaceBetween, classes.alignItemsCenter)} style={{ marginBottom: '20px' }}>
                      <Typography variant="h6" style={{ fontSize: '18px', fontWeight: 600, color: '#333' }}>
                        {t('billing.yourPlan')}
                      </Typography>
                      {
                        currentPlan?.Name !== 'GRAND_FATHER' && (  
                          <Box className={classes.dFlex} style={{ gap: '12px' }}>
                            {/* <Button
                              className={clsx(
                                classes.btn,
                                classes.btnRounded
                              )}
                              onClick={(e: any) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentDialog('creditCardDialog'); 
                                setShowPopup(true);
                              }}
                            >
                              {t('common.tier.manageCard')}
                            </Button> */}
                            {
                              currentPlan?.Name !== 'Scale' && !packagesDetails?.Newsletters?.IsBankTransferForTiers && (
                                <Button
                                  className={clsx(classes.btn, classes.btnRounded)}
                                  onClick={(e: any) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    if (isBillingDetailsRequired) {
                                      setIsOpenBillingSettings(true);
                                    } else {
                                      setShowTierPlans(true);
                                    }
                                  }}
                                >
                                  {t('billing.upgradePlan')}
                                </Button>
                              )
                            }
                            {
                              currentPlan?.Name !== 'Starter' && (
                                <Button
                                  className={clsx(classes.btn, classes.btnRounded, classes.redButton)}
                                  onClick={(e: any) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    setConfirmCancelPlan(true);
                                  }}
                                >
                                  {t('billing.cancelPlan')}
                                </Button>
                              )
                            }
                          </Box>
                        )
                      }
                    </Box>
                    
                    <Box className={classes.dFlex} style={{ alignItems: 'center', gap: '16px' }}>
                      <Box
                        style={{
                          backgroundColor: '#ff6b6b',
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {currentPlan?.Name || ''}
                      </Box>
                      <Typography style={{ fontSize: '16px', color: '#666' }}>
                        {formatPlanDescription()}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </>
            )
          }

          <Box className={classes.accordion} style={{ padding: 15 }}>
            <Accordion expanded={openPanels.indexOf('1') > -1} onChange={() => handlePanels('1')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="1-content" id="1-header" style={{ marginTop: 0 }}>
                <Title
                  autoWidth={false}
                  isIcon={false}
                  classes={classes}
                  Element={
                    <Box className={clsx(classes.flex, windowSize !== 'xs' ? classes.spaceBetween : '', classes.flexWrap)}>
                      <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                        {openPanels.indexOf('1') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        <Typography
                          style={{ width: 'auto', marginInlineStart: 15 }}
                          className={clsx(classes.managementTitle, "mgmtTitle")}
                        >
                          {t("settings.billingSettings.title")}
                        </Typography>
                      </Box>
                      {accountFeatures.indexOf(PulseemFeatures.NOT_TO_SHOW_CREDITS_HISTORY_FEATURE) === -1 && <>
                        {(!creditCards || creditCards?.length === 0) ? (<Button
                          style={{ marginInlineStart: 'auto' }}
                          className={clsx(
                            classes.btn,
                            classes.btnRounded
                          )}
                          onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); handleShowCreditCardIframe() }}
                          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                        >
                          <>{t("settings.billingSettings.btnAddCard")}</>
                        </Button>) : (<>
                          <Box className={classes.dFlex} style={{ alignItems: 'center', gap: 10 }}>
                            <Typography>{t('settings.billingSettings.fields.cardNumber')}</Typography>
                            <Typography style={{ direction: 'ltr', fontWeight: 900 }}>**** {creditCards[0]?.LastDigits}</Typography>
                            <Link
                              onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); handleShowCreditCardIframe() }}
                              className={clsx(classes.font14)}
                              style={{ textDecoration: 'underline' }}
                            >{t("settings.billingSettings.editCard")}</Link>{userRoles?.AllowDelete && showEditCard && <> |
                              <Link
                                onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); setConfirmDialog(true) }}
                                className={clsx(classes.font14)}
                                style={{ textDecoration: 'underline' }}
                              >{t("common.remove")}</Link></>}
                          </Box>
                        </>)}
                      </>}
                    </Box>
                  }
                />
              </AccordionSummary>
              <AccordionDetails>
                <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
                  <BillingDetails classes={classes} />
                </Box>
              </AccordionDetails>
            </Accordion>
            {accountFeatures.indexOf(PulseemFeatures.NOT_TO_SHOW_CREDITS_HISTORY_FEATURE) === -1 && <Accordion expanded={openPanels.indexOf('2') > -1} onChange={() => handlePanels('2')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="2-content" id="2-header">
                <Title autoWidth={false} isIcon={false} classes={classes}
                  Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                    {openPanels.indexOf('2') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    <Typography
                      style={{ width: 'auto', marginInlineStart: 15 }}
                      className={clsx(classes.managementTitle, "mgmtTitle")}
                    >
                      {t("settings.billingSettings.openInvoices")}
                    </Typography>
                    <Box style={{ marginInlineStart: 'auto' }}>
                      <Button
                        style={{ marginInlineStart: 15, minWidth: 150 }}
                        className={clsx(
                          classes.redButton,
                          classes.btnRounded,
                          classes.bold,
                          invoicesForPayment?.length === 0 && classes.disabled
                        )}
                        onClick={(e: any) => {
                          e?.preventDefault();
                          e?.stopPropagation();
                          setCurrentDialog('paymentSummary');
                          setShowPopup(true)
                        }}
                        endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                      >
                        <>{t('common.pay')}</>
                      </Button>
                    </Box>
                  </Box>}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
                  <PurchaseTableTemplate
                    ref={debtPanel}
                    classes={classes}
                    data={purchaseUnpaidData}
                    showLoader={showOpenInvoicesLoader}
                    isPaid={false}
                    onInvoiceSelection={handleInvoices}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>}
            {accountFeatures.indexOf(PulseemFeatures.NOT_TO_SHOW_CREDITS_HISTORY_FEATURE) === -1 && <Accordion expanded={openPanels.indexOf('3') > -1} onChange={() => handlePanels('3')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="3-content" id="3-header">
                <Title autoWidth={false} isIcon={false} classes={classes}
                  Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                    {openPanels.indexOf('3') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    <Typography
                      style={{ width: 'auto', marginInlineStart: 15 }}
                      className={clsx(classes.managementTitle, "mgmtTitle")}
                    >
                      {t("settings.billingSettings.lastPurchases")}
                    </Typography>
                  </Box>}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
                  <PurchaseTableTemplate classes={classes} data={purchaseHistoryData} showLoader={showPurchaseLoader} isPaid={true} />
                </Box>
              </AccordionDetails>
            </Accordion>}
            {accountFeatures.indexOf(PulseemFeatures.NOT_TO_SHOW_CREDITS_HISTORY_FEATURE) === -1 && <Accordion expanded={openPanels.indexOf('4') > -1} onChange={() => handlePanels('4')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="4-content" id="4-header">
                <Title autoWidth={false} isIcon={false} classes={classes}
                  Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                    {openPanels.indexOf('4') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    <Typography
                      style={{ width: 'auto', marginInlineStart: 15 }}
                      className={clsx(classes.managementTitle, "mgmtTitle")}
                    >
                      {t("billing.creditHistory")}
                    </Typography>
                  </Box>}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
                  <CreditHistoryDetails classes={classes} />
                </Box>
              </AccordionDetails>
            </Accordion>}
          </Box>
        </Box>
        <Loader isOpen={showLoader} showBackdrop={true} />
      </Box>
      {/* @ts-ignore */}
      {showPopup && <BaseDialog
        classes={classes}
        {...renderOptions()}
      ></BaseDialog>}
      {showCreditCardManagement && <BaseDialog
        classes={classes}
        title={t("billing.creditCardManagement.title")}
        open={showCreditCardManagement}
        onClose={handleCreditCardManagementClose}
        onCancel={handleCreditCardManagementClose}
        showDefaultButtons={false}
        // maxWidth="md"
        // fullWidth={true}
      >
        <CreditCardManagement
          classes={classes}
          onAddCard={handleAddCardFromManagement}
          onEditCard={handleEditCardFromManagement}
          onDeleteCard={handleDeleteCardFromManagement}
        />
      </BaseDialog>}
      {addCardDialog && paymentIframe && <BaseDialog
        classes={classes}
        title={t("settings.billingSettings.btnAddCard")}
        open={addCardDialog}
        onConfirm={handleOnCardSaved}
        onClose={() => {
          setAddCardDialog(false);
        }}
        onCancel={() => {
          setAddCardDialog(false);
        }}
      >
        <Grid container className={classes.addCardForm} >
          <Grid item xs={12} className={"textBoxWrapper"}>
            {/* @ts-ignore */}
            <iframe title="Tranzila Url" src={`${paymentIframe}`} width={windowSize !== 'xs' ? 400 : 250} height="420" border="no" frameBorder="0" style={{ border: "none !important" }} />
          </Grid>
        </Grid>
      </BaseDialog>}
      {showFrozenDialog && <BaseDialog
        classes={classes}
        title=""
        open={showFrozenDialog}
        onClose={() => {
          setShowFrozenDialog(false);
          setHasFrozenEmail(false);
          setShowReleaseMessage(false);
          setShowCancelMessage(false);
        }}
        onCancel={() => {
          setShowFrozenDialog(false);
          setHasFrozenEmail(false);
          setShowReleaseMessage(false);
          setShowCancelMessage(false);
        }}
        showDefaultButtons={false}
      >
        <FrozenCampaignsMessage />
      </BaseDialog>}
      <ConfirmDeletePopUp
        handleDeleteGroup={() => handleRemoveCreditCard()}
        onCancel={() => setConfirmDialog(false)}
        onClose={() => setConfirmDialog(false)}
        classes={classes}
        isOpen={confirmDialog}
        key={1}
        windowSize={windowSize}
        title={t('billing.confirmDeleteCardTitle')}
        text={t('billing.confirmDeleteCardText')}
      />
      <ConfirmDeletePopUp
        handleDeleteGroup={() => {
          if (packagesDetails?.Newsletters?.IsEmailTierSubscribed && !hideEmailWithTier) {
            setConfirmCancelPlan(false);
            setShowLoader(true);
            dispatch(deletePolandSubscription() as any).then((response: any) => {
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
                  } as ERROR_TYPE);
                  break;
                }
                case 406: {
                  setToastMessage({
                    color: 'error',
                    severity: 'error',
                    message: t('common.ErrorOccured'),
                    showAnimtionCheck: false
                  } as ERROR_TYPE);
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
                  } as ERROR_TYPE);
                  break;
                }
              }
            });
          } else {
            handleCancelPlan()
          }
        }}
        onCancel={() => setConfirmCancelPlan(false)}
        onClose={() => setConfirmCancelPlan(false)}
        classes={classes}
        isOpen={confirmCancelPlan}
        key={2}
        windowSize={windowSize}
        title={t('billing.confirmCancelPlanTitle')}
        text={t('billing.confirmCancelPlanText').replace("{Date}", moment(currentPlan?.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY) || '')}
      />
      {showTierPlans && <TierPlans
        classes={classes}
        isOpen={showTierPlans}
        onClose={() => setShowTierPlans(false)}
        isBankTransferForTiers={!!packagesDetails?.Newsletters?.IsBankTransferForTiers}
      />}
      <BillingSettings
        classes={classes}
        isOpen={isOpenBillingSettings}
        onClose={(isSuccess: boolean) => {
          setIsOpenBillingSettings(false);
          if (isSuccess) {
            dispatch(getAccountBilling());
            setShowTierPlans(true);
          }
        }}
      />
    </DefaultScreen>
  );
};

export default BillingSettingsPage;
