import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './PricePackages.styles.css'
import clsx from 'clsx';
import { getPackagesList } from '../../redux/reducers/commonSlice';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, Typography, Divider, TextField, FormControl, Select, MenuItem } from '@material-ui/core';
import { Loader } from '../Loader/Loader';
import NumberFormat from 'react-number-format';
import DropdownMonthes from '../Dropdowns/month';
import DropdownYears from '../Dropdowns/years';
import moment from 'moment';
import validator from 'validator'
import { buySmsPackage } from '../../redux/reducers/dashboardSlice';

const PricePackages = ({ classes,
    onComplete = () => null,
    ...props }) => {
    const { language } = useSelector(state => state.core)
    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [showLoader, setLoader] = useState(true);
    const [packageId, setPackageId] = useState(null);
    const [step, setStep] = useState(1);
    const [expiredMonth, setExpiredMonth] = useState(0);
    const [expiredYear, setExpiredYear] = useState(0);
    const [creditInfo, setCreditCard] = useState({
        CreditNumber: "",
        CVV: "",
        ExpirtaionDate: "",
        Price: "",
        Credits: 1,
        CardType: 0
    });
    const CardTypeOptions = [{ ID: 0, Type: "Visa" }, { ID: 1, Type: "MasterCard" }, { ID: 2, Type: "AmericanExpress" }];
    const [isCreditCardValid, setIsCreditCardValid] = useState(null);
    const [isValidCVV, setIsValidCVV] = useState(null);
    // const [expiredSet, setExpiredSet] = useState(false);


    const initData = async () => {
        const d = await dispatch(getPackagesList());
        setData(d.payload);
        setLoader(false);
    }

    useEffect(initData, [dispatch]);

    useEffect(() => {
        if (expiredMonth !== 0 && expiredMonth !== null && expiredYear !== 0 && expiredYear !== null) {
            const expiredDate = moment();
            expiredDate.set("month", expiredMonth - 1);
            expiredDate.set("year", expiredYear);
            setCreditCard({ ...creditInfo, ExpirtaionDate: moment(expiredDate).format("YYYY/MM") });

            // if(moment(expiredDate).isValid()){
            //     setExpiredSet(true);
            // }
        }
    }, [expiredMonth, expiredYear]);

    const Package = ({ pack, packSize }) => {
        return (
            <Grid item xs={12} sm={6} md={4} lg={packSize} className={clsx(classes.mb4, classes.mt4)}>
                <Box className={clsx(classes.alignCenter, classes.whiteBox)}>
                    <Box className={clsx(classes.borderBox, classes.alignCenter, classes.m5)}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font24)}>{t('common.smsBulk')}</Typography>
                        <Typography className={classes.dialogTitle}><NumberFormat value={pack.Quantity} displayType={'text'} thousandSeparator={true} /></Typography>
                        <Typography className={clsx(classes.black, classes.bold, classes.mb2)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={pack.Price} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightGreen)}
                            onClick={() => selectPackage(pack.ID)}
                        >{t('common.select')}</Button>
                    </Box>
                </Box>
            </Grid>
        )
    }

    const selectPackage = (packageId) => {
        const pack = data.find((p) => { return p.ID === packageId });
        const vat = (pack.Price * 0.17).toFixed(2);
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
            const packPerLine = Math.ceil(12 / packageLength);
            return (
                data !== null &&
                data.map((d) => {
                    return (
                        <Package pack={d} packSize={packPerLine} key={d.ID} />
                    )
                })
            );
        }
    }

    const purchaseWizard = () => {
        switch (step) {
            case 1:
                return packagesDetails();
            case 2:
                return renderSummary();
            case 3:
                return renderPayment();
        }
    }

    const renderSummary = () => {
        const pack = data.find((p) => { return p.ID === packageId });
        const vat = (pack.Price * 0.17).toFixed(2);
        const totalPrice = pack.Price + parseFloat(vat);
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} className={clsx(classes.mb4)}>
                    <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font30)}>{t('common.endPurchase')}</Typography>
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
                    <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalPrice} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
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

    const isFormValid = () => {
        let isValid = true;
        const dateNow = new Date(Date.now());
        dateNow.setDate(1);
        const expirationDate = moment(creditInfo.ExpirtaionDate, "YYYY-MM-DD 23:59:59");
        const selectedDate = new Date(expirationDate);
        selectedDate.setHours("23");
        selectedDate.setMinutes("59");
        selectedDate.setSeconds("59");
        document.querySelector("#cvvNumber").classList.remove('error');
        document.querySelector("#cardNumber").classList.remove('error');
        document.querySelector("#expiredYear").classList.remove('error');
        document.querySelector("#expiredMonth").classList.remove('error');


        if (creditInfo.CVV !== '' && creditInfo.CVV.length > 3 || creditInfo.CVV.length < 3) {
            document.querySelector("#cvvNumber").classList.add('error');
            isValid = false;
        }
        if (!validator.isCreditCard(creditInfo.CreditNumber)) {
            document.querySelector("#cardNumber").classList.add('error');
            isValid = false;
        }
        if ((expirationDate === null || !expirationDate.isValid()) || dateNow > selectedDate) {
            document.querySelector("#expiredMonth").classList.add('error');
            document.querySelector("#expiredYear").classList.add('error');
            isValid = false;
        }
        return isValid;
    }
    const handleCreditCardChange = (e) => {
        e.target.classList.remove('error');
        const length = e.target.value.length;
        if (length <= 19) {
            setCreditCard({ ...creditInfo, CreditNumber: e.target.value })
        }
        e.target.value = e.target.value.substring(0, 19);
        setIsCreditCardValid(validator.isCreditCard(e.target.value))
        return;
    }
    const handleCVVChange = (e) => {
        const length = e.target.value.length;
        if (length <= 3) {
            setCreditCard({ ...creditInfo, CVV: e.target.value })
        }
        e.target.value = e.target.value.substring(0, 3);
        setIsValidCVV(e.target.value.length >= 3);
        return;
    }
    const onConfirmPayment = async () => {
        setLoader(true);
        if (isFormValid()) {
            const result = await dispatch(buySmsPackage(creditInfo));
            console.log(result.payload);
            setLoader(false);
        }
    }
    const onSelectExpMonth = (value) => {
        setExpiredMonth(value)
    }
    const onSelectExpYear = (value) => {
        setExpiredYear(value);
    }

    const renderPayment = () => {
        return (
            <form className={classes.root} autoComplete="off">
                <Grid container spacing={1}>
                    <Grid item xs={12} className={clsx(classes.mb4)}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font30)}>{t('common.creditCardInfo')}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        {t("common.cardNumber")}
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                            id="cardNumber"
                            error={isCreditCardValid}
                            placeholder={t("common.cardNumber")}
                            variant="outlined"
                            onChange={handleCreditCardChange} style={{ width: '100%' }}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9\s]{13,19}"
                            autoComplete="cc-number"
                            maxLength="19"
                            required
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {t("common.expiration")}
                    </Grid>
                    <Grid item xs={5}>
                        <DropdownMonthes
                            id="expiredMonth"
                            classes={classes}
                            isNumeric={false}
                            isRTL={isRTL}
                            style={{ width: "100%" }}
                            onChange={onSelectExpMonth}
                            required />
                    </Grid>
                    <Grid item xs={4}>
                        <DropdownYears
                            id="expiredYear"
                            classes={classes}
                            style={{ width: "100%" }}
                            onChange={onSelectExpYear}
                            required />
                    </Grid>
                    <Grid item xs={3}>
                        {t("common.cvv")}
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                            id="cvvNumber"
                            error={isValidCVV}
                            placeholder={t("common.cvv")}
                            variant="outlined"
                            onChange={handleCVVChange} style={{ width: '100%' }}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9\s]{13,19}"
                            autoComplete="cc-number"
                            maxLength="3"
                            required
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {t("common.cardType")}
                    </Grid>
                    <Grid item xs={9}>
                        <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%' }}>
                            <Select
                                id="cardType"
                                value={creditInfo.CardType}
                                onChange={(e) => setCreditCard({ ...creditInfo, CardType: e.target.value })}
                            >
                                {CardTypeOptions.map((c) => {
                                    return (
                                        <MenuItem key={c.ID} value={c.ID}>{c.Type}</MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, classes.mt2)}>
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
                </Grid>
            </form>
        );
    }

    return (
        <Grid container spacing={1} style={{ maxWidth: '100%' }}>
            {step === 1 && <Grid item xs={12}>
                <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.smsBulkTitle')}</Typography>
                <Divider />
                <Typography className={classes.mt3}>{t('common.smsBulkDescription')}</Typography>
            </Grid>}
            {purchaseWizard()}
            <Loader isOpen={showLoader} showBackdrop={false} />
        </Grid>
    );
}

export default PricePackages;