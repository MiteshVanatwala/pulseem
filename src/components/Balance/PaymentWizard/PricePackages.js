import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid } from '@material-ui/core';
import { Loader } from '../../Loader/Loader';
import { getTranzillaURL, getAccountCards, buyPackage } from '../../../redux/reducers/paymentSlice';
import { BiCreditCard } from 'react-icons/bi';
import { Dialog } from '../../managment/index';
import PurchaseSummary from './Dialogs/PurchaseSummary';
import PackagesList from './Dialogs/PackagesList';
import Pay from './Dialogs/Pay';

const PricePackages = ({ classes,
    onComplete = () => null,
    packageType
}) => {
    const { isRTL } = useSelector(state => state.core);
    const { accountAvailablePackages } = useSelector(state => state.dashboard);
    const { tranzillaUrl, creditCards, paymentConfirmation } = useSelector(state => state.payment);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [newsletterBulkData, setNewsletterBulkData] = useState(null);
    const [smsBulkData, setSmsBulkData] = useState(null);
    const [notificationsBulkData, setNotificationsBulkData] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [packageId, setPackageId] = useState(null);
    const [step, setStep] = useState(1);
    const [addNewCard, setAddNewCard] = useState(false);
    const [showPayResult, setShowPaymentResult] = useState(null);
    const [chargeDetails, setChargeDetails] = useState({
        CreditNumber: "",
        CVV: "",
        ExpirtaionDate: "",
        Price: "",
        Credits: 1,
        PackageType: 3,
        PackageName: ""
    });
    const israelTax = 0.17;

    const initData = async () => {
        setAddNewCard(false);
        setShowPaymentResult(null);
        setSmsBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 3 }));
        setNewsletterBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 2 }));

        setData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === packageType }));
        await dispatch(getAccountCards());
        if (!creditCards) {
            await dispatch(getTranzillaURL());
        }
        setLoader(false);
    }

    useEffect(initData, [dispatch]);

    const selectPackage = (packageId) => {
        const pack = data.find((p) => { return p.ID === packageId });
        const vat = (pack.Price * israelTax).toFixed(2);
        const totalPrice = pack.Price + parseFloat(vat);
        setPackageId(packageId);
        setStep(step + 1);

        const packageName = `${pack.CampaignType === 3 ? t('common.smsBulk') : t('common.newsletterBulk')} ${pack.Quantity}`;

        setChargeDetails({ ...chargeDetails, Price: pack.Price, PackageName: packageName, PackageType: pack.CampaignType, Quantity: pack.Quantity });

    }

    const onConfirm = () => {
        setShowPaymentResult(false);
        setStep(step + 1);
    }

    const purchaseWizard = () => {
        switch (step) {
            case 1:
                return <PackagesList data={data}
                    classes={classes}
                    onSelect={selectPackage}
                    packageType={packageType}
                    smsBulkData={smsBulkData}
                    newsletterBulkData={newsletterBulkData}
                />
            case 2:
                return <PurchaseSummary data={data}
                    classes={classes}
                    isRTL={isRTL}
                    packageId={packageId}
                    onConfirm={onConfirm}
                    onComplete={onComplete} />;
            case 3: {
                return <Pay
                    classes={classes}
                    isRTL={isRTL}
                    onSetAddCredit={() => setAddNewCard(!addNewCard)}
                    addNewCard={addNewCard}
                    creditCards={creditCards}
                    onConfirmPayment={onConfirmPayment}
                    onComplete={onComplete} />;
            }
        }
    }

    const onConfirmPayment = async () => {
        setLoader(true);
        const result = await dispatch(buyPackage(chargeDetails));
        console.log(result.payload);
        setShowPaymentResult(true);
        setLoader(false);
    }

    const handleTranzilaClose = async () => {
        await dispatch(getAccountCards());
        setAddNewCard(false);
        setShowPaymentResult(null);

        return <Pay
            classes={classes}
            isRTL={isRTL}
            onSetAddCredit={() => setAddNewCard(!addNewCard)}
            addNewCard={addNewCard}
            creditCards={creditCards}
            onConfirmPayment={onConfirmPayment}
            onComplete={onComplete} />;
    }

    const showDynamicDialog = (type) => {
        let dialog = null;
        switch (type) {
            case "newcard": {
                dialog = {
                    title: t('payment.updateCreditCard'),
                    showDivider: true,
                    icon: (
                        <BiCreditCard style={{ fontSize: 30 }} />
                    ),
                    content: (
                        <Grid container>
                            <Grid item xs={12} className={clsx(classes.mb4)}>
                                <iframe src={`${tranzillaUrl}`} width="400" height="350" border="no" frameBorder="0" style={{ border: "none !important" }} />
                            </Grid>
                        </Grid>
                    ),
                    renderButtons: () => (
                        <Button
                            variant='contained'
                            size='small'
                            onClick={handleTranzilaClose}
                            className={clsx(
                                classes.confirmButton,
                                classes.dialogConfirmButton,
                            )}>
                            {t('payment.done')}
                        </Button>
                    )
                };
                break;
            }
            case "paymentResult": {
                dialog = {
                    title: t('payment.updateCreditCard'),
                    showDivider: true,
                    icon: (
                        <BiCreditCard style={{ fontSize: 30 }} />
                    ),
                    content: (
                        <Grid container>
                            <Grid item xs={12} className={clsx(classes.mb4)}>
                                {paymentConfirmation === false ? "Fail" : "Success"}
                            </Grid>
                        </Grid>
                    ),
                    renderButtons: () => (
                        <Button
                            variant='contained'
                            size='small'
                            onClick={paymentConfirmation === true ? onComplete : handleTranzilaClose}
                            className={clsx(
                                classes.confirmButton,
                                classes.dialogConfirmButton,
                            )}>
                            {t('common.confirm')}
                        </Button>
                    )
                };
                break;
            }

        }
        return dialog;
    }

    const renderTranzillaFrame = () => {
        let dialog = null;
        if (addNewCard && tranzillaUrl) {
            dialog = showDynamicDialog("newcard")
        }
        if (showPayResult && paymentConfirmation !== null) {
            dialog = showDynamicDialog("paymentResult")
        }
        if (dialog != null) {
            return (<Dialog
                classes={classes}
                open={addNewCard || showPayResult}
                onClose={handleTranzilaClose}
                {...dialog}>
                {dialog.content}
            </Dialog>);
        }
    }

    return (
        <Grid container spacing={1} style={{ maxWidth: '100%' }}>
            {purchaseWizard()}
            {renderTranzillaFrame()}
            <Loader isOpen={showLoader} showBackdrop={false} />
        </Grid>
    );
}

export default PricePackages;