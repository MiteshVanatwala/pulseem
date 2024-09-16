import React, { useEffect, useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import { Title } from "../../../components/managment/Title";
import { useTranslation } from "react-i18next";
import Toast from "../../../components/Toast/Toast.component";
import { useDispatch, useSelector } from "react-redux";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { ERROR_TYPE } from "../../../helpers/Types/common";
import { ListIcon } from "../../../assets/images/managment";
import BillingDetails from "./BillingDetails";
import { getCreditCardIframe, getAccountOperations, getBulkHistory } from "../../../redux/reducers/BillingSlice";
import { Loader } from "../../../components/Loader/Loader";
import PurchaseTableTemplate from "./PurchaseTableTemplate";
import { CreditHistory, CreditHistoryRequest, PurchaseHistoryModel } from "../../../Models/Account/AccountBilling";
import CreditHistoryDetails from "./CreditHistoryDetails";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";


const BillingSettingsPage = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL, windowSize, rowsPerPage } = useSelector((state: any) => state.core);

  const [addCardDialog, setAddCardDialog] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
  const [paymentIframe, setPaymentIframe] = useState<string>('');
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [showPurchaseLoader, setShowPurchaseLoader] = useState<boolean>(true);
  const [showOpenInvoicesLoader, setShowOpenInvoicesLoader] = useState<boolean>(true);
  const [purchaseHistoryData, setPurchaseHistoryData] = useState<PurchaseHistoryModel>();
  const [purchaseUnpaidData, setPurchaseUnpaidData] = useState<PurchaseHistoryModel>();
  const [panel, setPanel] = useState<string>('panel1');
  const [openPanels, setOpenPanels] = useState<string[]>(['panel1']);

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const initPurchaseHistory = async () => {
    const paidResponse = await dispatch(getAccountOperations(true)) as any;
    const unpaidResponse = await dispatch(getAccountOperations(false)) as any;


    if (paidResponse && paidResponse?.payload?.StatusCode === 201) {
      setPurchaseHistoryData(paidResponse?.payload?.Data);
    }
    if (unpaidResponse && unpaidResponse?.payload?.StatusCode === 201) {
      setPurchaseUnpaidData(unpaidResponse?.payload?.Data);
    }

    //requestCreditHistory(null);
    setShowPurchaseLoader(false);
    setShowOpenInvoicesLoader(false);
  }

  useEffect(() => {
    initPurchaseHistory();
  }, []);

  const handleOnCardSaved = () => { }

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

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="billingSettings"
      classes={classes}
      containerClass={classes.management}
    >
      {toastMessage && renderToast()}
      <Box className={classes.accordion}>
        <Accordion expanded={openPanels.indexOf('panel1') > -1} onChange={() => handlePanels('panel1')}>
          <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
            <Title
              isIcon={false}
              classes={classes}
              Element={
                <Box className={clsx(classes.flex, windowSize !== 'xs' ? classes.spaceBetween : '', classes.flexWrap)} style={{ width: '100%' }}>
                  <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                    {openPanels.indexOf('panel1') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    <Typography
                      style={{ width: 'auto', marginInlineStart: 15 }}
                      className={clsx(classes.managementTitle, "mgmtTitle")}
                    >
                      {t("settings.billingSettings.title")}
                    </Typography>
                  </Box>
                  <Button
                    style={{ marginInlineStart: 'auto' }}
                    className={clsx(
                      classes.btn,
                      classes.btnRounded
                    )}
                    onClick={() => handleShowCreditCardIframe()}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  >
                    <>{t("settings.billingSettings.btnAddCard")}</>
                  </Button>
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
        <Accordion expanded={openPanels.indexOf('panel2') > -1} onChange={() => handlePanels('panel2')}>
          <AccordionSummary aria-controls="panel2-content" id="panel2-header">
            <Title isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('panel2') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
                <Typography
                  style={{ width: 'auto', marginInlineStart: 15 }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("settings.billingSettings.openInvoices")}
                </Typography>
              </Box>}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Box style={{ paddingInline: 25, paddingBlock: 20, width: '100%' }} className={classes.dFlex}>
              <PurchaseTableTemplate classes={classes} data={purchaseUnpaidData} showLoader={showOpenInvoicesLoader} isPaid={false} />
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={openPanels.indexOf('panel3') > -1} onChange={() => handlePanels('panel3')}>
          <AccordionSummary aria-controls="panel3-content" id="panel3-header">
            <Title isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('panel3') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
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
        <Accordion expanded={openPanels.indexOf('panel4') > -1} onChange={() => handlePanels('panel4')}>
          <AccordionSummary aria-controls="panel4-content" id="panel4-header">
            <Title isIcon={false} classes={classes}
              Element={<Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {openPanels.indexOf('panel4') > -1 ? <IoIosArrowUp /> : <IoIosArrowDown />}
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
            <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
              <CreditHistoryDetails classes={classes} />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
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
      <Loader isOpen={showLoader} showBackdrop={true} zIndex={9999} />
    </DefaultScreen>
  );
};

export default BillingSettingsPage;
