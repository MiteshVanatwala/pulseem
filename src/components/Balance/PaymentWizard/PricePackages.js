import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid, Typography, Divider, FormControlLabel, FormControl, FormGroup, Checkbox, Link, Box } from '@material-ui/core';
import { Loader } from '../../Loader/Loader';
import NumberFormat from 'react-number-format';
import { buySmsPackage } from '../../../redux/reducers/dashboardSlice';
import Package from '../PackageBox/Package';
import PurchaseLogs from '../PurhcaseLogs/Logs';
import { getTranzillaURL, getAccountCards } from '../../../redux/reducers/paymentSlice';
import { BiCreditCard } from 'react-icons/bi';
import { Dialog } from '../../managment/index';

const PricePackages = ({ classes,
    onComplete = () => null,
    packageType,
    ...props }) => {
    const { language } = useSelector(state => state.core);
    const { isRTL } = useSelector(state => state.core);
    const { accountAvailablePackages, purchaseLogs } = useSelector(state => state.dashboard);
    const { tranzillaUrl, creditCards } = useSelector(state => state.payment);
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
    const [creditInfo, setCreditCard] = useState({
        CreditNumber: "",
        CVV: "",
        ExpirtaionDate: "",
        Price: "",
        Credits: 1,
        CardType: 0
    });
    const israelTax = 0.17;

    const initData = async () => {
        setSmsBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 1 }));
        setNewsletterBulkData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === 3 }));

        setData(accountAvailablePackages.filter((pack) => { return pack.CampaignType === packageType }));
        await dispatch(getAccountCards());
        if (!creditCards) {
            await dispatch(getTranzillaURL(isRTL ? "he-IL" : "en-US"));
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

        setCreditCard({ ...creditInfo, Price: totalPrice });
    }

    const onConfirm = () => {
        setStep(step + 1);
    }

    const packagesDetails = () => {
        if (data !== null) {
            const packageLength = data.length;
            let packPerLine = Math.ceil(12 / packageLength);
            packPerLine = packPerLine < 3 ? 3 : packPerLine;
            switch (packageType) {
                case 1: {
                    return (
                        <>
                            {/* {purchaseLogs && <PurchaseLogs classes={classes} data={purchaseLogs} />} */}
                            <Grid item xs={12}>
                                <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.smsBulkTitle')}</Typography>
                                <Divider />
                                <Typography className={classes.mt3}>{t('common.smsBulkDescription')}</Typography>
                            </Grid>
                            {
                                smsBulkData.sort((a, b) => a.Quantity - b.Quantity).map((d, index) => {
                                    return (
                                        <Package
                                            pack={d}
                                            packSize={packPerLine}
                                            key={`pack_${d.ID}`}
                                            onSelect={selectPackage}
                                            packageType={packageType}
                                            classes={classes} />
                                    )
                                })
                            }
                        </>);
                }
                case 3: {
                    return (
                        <>
                            <Grid item xs={12}>
                                <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.newsletterBulkTitle')}</Typography>
                                <Divider />
                                <Typography className={classes.mt3}>{t('common.newsletterBulkDescription')}</Typography>
                            </Grid>
                            {
                                newsletterBulkData.sort((a, b) => a.Quantity - b.Quantity).map((d) => {
                                    return (
                                        <Package pack={d}
                                            packSize={packPerLine}
                                            key={d.ID}
                                            onSelect={selectPackage}
                                            packageType={packageType}
                                            classes={classes} />
                                    )
                                })
                            }
                        </>);
                }
            }
        }
    }

    const purchaseWizard = () => {
        switch (step) {
            case 1:
                return packagesDetails();
            case 2:
                return renderSummary();
            case 3: {
                return renderPayment();
            }
        }
    }

    const renderSummary = () => {
        const pack = data.find((p) => { return p.ID === packageId });
        const vat = (pack.Price * israelTax).toFixed(2);
        const totalPrice = pack.Price + parseFloat(vat);
        return (
            <Grid container spacing={1} className={classes.paymentDialog}>
                <Grid item xs={12} className={clsx(classes.mb4)}>
                    <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('payment.purchaseSummary')}</Typography>
                    <Divider />
                </Grid>
                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.productName')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{`${pack.Quantity} ${t('common.smsMessages')}`}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.price')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={pack.Price} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.vat')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={vat} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
                </Grid>
                <Grid item xs={12}>
                    <Divider className={classes.blackDivider} />
                </Grid>


                <Grid item xs={6} className={clsx(classes.mb4)}>
                    <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.totalPrice')}</Typography>
                </Grid>
                <Grid item md={6}>
                    <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalPrice.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
                </Grid>

                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => onConfirm()}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton
                            )}>
                            {t('common.pay')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => onComplete()}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogCancelButton
                            )}>
                            {t('common.cancel')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const onConfirmPayment = async () => {
        setLoader(true);
        const result = await dispatch(buySmsPackage(creditInfo));
        console.log(result.payload);
        setLoader(false);
    }

    const handleTranzilaClose = async () => {
        await dispatch(getAccountCards());
        setAddNewCard(false);
        renderPayment();
    }

    const renderPayment = () => {
        return (
            <Grid container spacing={1} className={classes.paymentDialog} >
                {!addNewCard && creditCards.map((c, index) => {
                    return (
                        <Grid item md={12} xs={12} key={index}>
                            <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('payment.selectMethod')}</Typography>
                            <Divider />
                            <Box>
                                <FormControl sx={{ m: 1 }} component="fieldset" variant="standard">
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    key={`chk_${index}`}
                                                    checked={true}
                                                    inputProps={{ 'aria-labelledby': c.ExpDate }}
                                                />
                                            }
                                            label={`****${c.LastDigits} - ${c.ExpDate}`}
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Box>
                        </Grid>
                    )
                })}

                <Grid item md={12} xs={12}>
                    <Link style={{ cursor: 'pointer' }} onClick={() => setAddNewCard(!addNewCard)}>{!addNewCard ? t("payment.updateCreditCard") : t("common.cancel")}</Link>
                </Grid>
                {!addNewCard && <Grid container spacing={3} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)} style={{ display: 'flex', marginTop: 10 }}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => onConfirmPayment()}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton
                            )}>
                            {t('common.pay')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => onComplete()}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogCancelButton
                            )}>
                            {t('common.cancel')}
                        </Button>
                    </Grid>
                </Grid>}
            </Grid>
        );
    }

    const renderTranzillaFrame = () => {
        if (addNewCard && tranzillaUrl) {
            const tranzillaDialog = {
                title: t('payment.updateCreditCard'),
                showDivider: true,
                icon: (
                    <BiCreditCard style={{ fontSize: 30 }} />
                ),
                content: (
                    <Grid container spacing={1}>
                        <Grid item xs={12} className={clsx(classes.mb4)}>
                            <iframe src={`${tranzillaUrl}`} width="400" height="400" />
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
            return (<Dialog
                classes={classes}
                open={addNewCard}
                onClose={handleTranzilaClose}
                {...tranzillaDialog}>
                {tranzillaDialog.content}
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