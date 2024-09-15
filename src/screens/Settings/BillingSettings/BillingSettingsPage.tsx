import React, { useEffect, useState } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
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
  return (
    <DefaultScreen
      currentPage="settings"
      subPage="billingSettings"
      classes={classes}
      containerClass={classes.management}
    >
      {toastMessage && renderToast()}
      <Box className={classes.settingsContainer}>
        <Box className="head">
          <Title
            classes={classes}
            Element={
              <Box className={clsx(classes.flex, windowSize !== 'xs' ? classes.spaceBetween : '', classes.flexWrap)}>
                {
                  windowSize === 'xs' && <ListIcon className={classes.mr15} />
                }
                <Typography
                  style={{ width: 'auto' }}
                  className={clsx(classes.managementTitle, "mgmtTitle")}
                >
                  {t("settings.billingSettings.title")}
                </Typography>
                <Button
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
        </Box>
        <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
          <BillingDetails classes={classes} />
        </Box>
      </Box>
      <Box className={classes.settingsContainer}>
        <Box className="head">
          <Title classes={classes} Text={t("settings.billingSettings.openInvoices")} />
        </Box>
        <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
          <PurchaseTableTemplate classes={classes} data={purchaseUnpaidData} showLoader={showOpenInvoicesLoader} isPaid={false} />
        </Box>
      </Box>
      <Box className={classes.settingsContainer}>
        <Box className="head">
          <Title classes={classes} Text={t("settings.billingSettings.lastPurchases")} />
        </Box>
        <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
          <PurchaseTableTemplate classes={classes} data={purchaseHistoryData} showLoader={showPurchaseLoader} isPaid={true} />
        </Box>
      </Box>
      <Box className={classes.settingsContainer}>
        <Box className="head">
          <Title classes={classes} Text={t("settings.billingSettings.lastPurchases")} />
        </Box>
        <Box style={{ paddingInline: 25, paddingBlock: 20 }} className={classes.dFlex}>
          <CreditHistoryDetails classes={classes} />
        </Box>
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
