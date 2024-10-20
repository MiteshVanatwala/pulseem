import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Grid, Typography, Divider } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { useSelector } from 'react-redux'
import { IsraelCurrencyId } from '../../../helpers/Constants';
import { StateType } from '../../../Models/StateTypes';
import { PurchaseHistoryModel } from '../../../Models/Account/AccountBilling';

const SummaryPopup = ({
    data = [] as PurchaseHistoryModel[],
    classes }: any) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector((state: StateType) => state.core);
    const { VAT: VAT_Tax, accountIsCurrencySymbolPrefix, accountCurrencySymbol, currencyId } = useSelector((state: StateType) => state.common);
    const israelTax = currencyId !== IsraelCurrencyId ? 0 : (VAT_Tax / 100);

    const totalAmountToPay: any = data.reduce((accumulator: any, currentItem: PurchaseHistoryModel) => { return accumulator + currentItem.AmountToPay }, 0) || 0;
    const totalAmountToPayWithVat: any = data.reduce((accumulator: any, currentItem: PurchaseHistoryModel) => { return accumulator + currentItem.AmountWithVat }, 0) || 0;
    const totalVat: any = (totalAmountToPayWithVat - totalAmountToPay).toFixed(2);

    return (
        <Grid container className={classes.paymentDialog}>
            <Grid item xs={12} className={clsx(classes.mb4)}>
                <Typography className={clsx(classes.subTitle)}>{t('payment.purchaseSummary')}</Typography>
                <Divider />
            </Grid>
            <Grid item xs={4}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{t('common.productName')}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{t("billing.amount")}</Typography>
            </Grid>
            <Grid item xs={2}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{t("billing.forPayment")}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>
            {data?.map((item: PurchaseHistoryModel, index: number) => {
                return <>
                    <Grid item xs={4}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{item.ProdctDesciption}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{item.NumberOfProducts}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>
                            <NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={item.AmountToPay.toString()} displayType={'text'} thousandSeparator={true} prefix={accountIsCurrencySymbolPrefix === true ? ` ${accountCurrencySymbol} ` : ''} suffix={accountIsCurrencySymbolPrefix === false ? ` ${accountCurrencySymbol} ` : ''} /></Typography>
                    </Grid>
                </>
            })}
            <Grid item xs={12}>
                <Divider />
            </Grid>
            <Grid item xs={4}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>{t('common.price')}</Typography>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={2}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalAmountToPay.toString()} displayType={'text'} thousandSeparator={true} prefix={accountIsCurrencySymbolPrefix === true ? ` ${accountCurrencySymbol} ` : ''} suffix={accountIsCurrencySymbolPrefix === false ? ` ${accountCurrencySymbol} ` : ''} /></Typography>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>

            {
                currencyId === IsraelCurrencyId && (
                    <>
                        <Grid item xs={4}>
                            <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}>
                                {currencyId === IsraelCurrencyId && (`${israelTax * 100}% `)}
                                {t(currencyId === IsraelCurrencyId ? 'common.VATTax' : 'common.vat')}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}></Grid>
                        <Grid item xs={2}>
                            <Typography className={clsx(classes.blue, classes.subTitle, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalVat.toString()} displayType={'text'} thousandSeparator={true} prefix={accountIsCurrencySymbolPrefix === true ? ` ${accountCurrencySymbol} ` : ''} suffix={accountIsCurrencySymbolPrefix === false ? ` ${accountCurrencySymbol} ` : ''} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider className={classes.blackDivider} />
                        </Grid>
                    </>
                )
            }
            <Grid item xs={4} className={clsx(classes.mb4)}>
                <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.font20)}>{t('common.totalPrice')}</Typography>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item md={2}>
                <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalAmountToPayWithVat.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={accountIsCurrencySymbolPrefix === true ? ` ${accountCurrencySymbol} ` : ''} suffix={accountIsCurrencySymbolPrefix === false ? ` ${accountCurrencySymbol} ` : ''} /></Typography>
            </Grid>
        </Grid>
    )
}

export default SummaryPopup;