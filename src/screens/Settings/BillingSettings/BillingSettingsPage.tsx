import React, { useEffect, useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  FormControl,
  Grid,
  Link,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import Toast from "../../../components/Toast/Toast.component";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { ERROR_TYPE } from "../../../helpers/Types/common";
import BillingDetails from "./BillingDetails";
import { getCreditCardIframe, getAccountOperations, payDebtInvoices } from "../../../redux/reducers/BillingSlice";
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
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import SharedAppBar from "../../../components/core/SharedAppBar";


const BillingSettingsPage = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL, windowSize } = useSelector((state: any) => state.core);
  const { creditCards } = useSelector((state: any) => state.payment);
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

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const initPurchaseHistory = async () => {
    const paidResponse = await dispatch(getAccountOperations(true)) as any;
    const unpaidResponse = await dispatch(getAccountOperations(false)) as any;
    dispatch(getAccountCards()) as any;

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
      }
    }
    setShowPurchaseLoader(false);
    setShowOpenInvoicesLoader(false);
  }

  useEffect(() => {
    initPurchaseHistory();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(isRTL ? 'he-IL' : 'en-US');
  }, [isRTL]);

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
    setShowLoader(true);
    const invoiceIds = purchaseUnpaidData?.filter((item: PurchaseHistoryModel) => {
      return invoicesForPayment.indexOf(item.OperationID.toString()) !== -1;
    }).map((g: PurchaseHistoryModel) => { return g.AccountPurchaseID });

    console.log(invoiceIds);

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
      case 405: {
        handleShowCreditCardIframe();
        break;
      }
      case 404:
      case 406:
      case 407:
      case 408:
      case 409:
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

  const renderDebtDialog = () => {
    return {
      title: t('billing.debtBalance'),
      open: showPopup,
      exitButton: false,
      onClose: () => setShowPopup(false),
      onCancel: () => setShowPopup(false),
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
            onClick={(e: any) => { setShowPopup(false) }}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            <>{t("common.continue")}</>
          </Button>)}
        </>
      },
      children: <>{RenderHtml(t('billing.debtWelcomeMessage'))}</>
    } as DialogOptions;
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
          onClick={(e: any) => { window.location.href = '/react' }} // logout() }}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        >
          <>{t("common.reconnect")}</>
        </Button>
      },
      children: <Box style={{ marginBottom: 25 }}>{RenderHtml(t('billing.paymentSuccessful'))}</Box>
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
    }
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
        {hasDebt && <SharedAppBar classes={classes} />}
        <Box className={'topSection'} style={{ marginTop: hasDebt ? 100 : 37.870 }}>
          <Title Text={t('settings.billingSettings.pageTitle')} classes={classes} ContainerStyle={{ width: 'auto' }} />
          <Box className={classes.accordion} style={{ padding: 15 }}>
            <Accordion expanded={openPanels.indexOf('1') > -1} onChange={() => handlePanels('1')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="1-content" id="1-header">
                <Title
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
                          >{t("settings.billingSettings.editCard")}</Link>
                        </Box>
                      </>)}
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
            <Accordion expanded={openPanels.indexOf('2') > -1} onChange={() => handlePanels('2')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="2-content" id="2-header">
                <Title isIcon={false} classes={classes}
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
                        style={{ marginInlineStart: 15 }}
                        className={clsx(
                          classes.btn,
                          classes.btnRounded,
                          invoicesForPayment?.length === 0 && classes.disabled
                        )}
                        onClick={(e: any) => {
                          e?.preventDefault();
                          e?.stopPropagation();
                          payInvoices()
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
                    classes={classes}
                    data={purchaseUnpaidData}
                    showLoader={showOpenInvoicesLoader}
                    isPaid={false}
                    onInvoiceSelection={handleInvoices}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={openPanels.indexOf('3') > -1} onChange={() => handlePanels('3')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="3-content" id="3-header">
                <Title isIcon={false} classes={classes}
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
            </Accordion>
            <Accordion expanded={openPanels.indexOf('4') > -1} onChange={() => handlePanels('4')} elevation={0}
              classes={{
                root: classes.MuiAccordionroot
              }}>
              <AccordionSummary aria-controls="4-content" id="4-header">
                <Title isIcon={false} classes={classes}
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
            </Accordion>
          </Box>
        </Box>
        <Loader isOpen={showLoader} showBackdrop={true} />
      </Box>
      {/* @ts-ignore */}
      {showPopup && <BaseDialog
        classes={classes}
        {...renderOptions()}
      ></BaseDialog>}
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
    </DefaultScreen>
  );
};

export default BillingSettingsPage;
