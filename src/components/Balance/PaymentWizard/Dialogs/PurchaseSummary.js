import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid, Typography, Divider } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { useSelector } from 'react-redux'
import { GlobalPackageId, IsraelCurrencyId } from '../../../../helpers/Constants';

const PurchaseSummary = ({
    data,
    classes,
    isRTL,
    packageId,
    showTitle = true,
    showButtons = true,
    onConfirm = () => null,
    onComplete = () => null }) => {
    const { t } = useTranslation();
    const pack = data.find((p) => { return p.ID === packageId });
    const { windowSize } = useSelector(state => state.core);
    const { VAT: VAT_Tax, currencySymbol, isCurrencySymbolPrefix, isGlobal, currencyId } = useSelector(state => state.common);
    const israelTax = isGlobal ? 0 : (VAT_Tax / 100);
    const vat = (pack.Price * israelTax).toFixed(2);
    const totalPrice = pack.Price + parseFloat(vat);
    const productName = {
        2: t('common.newsletterMessages'),
        3: t('common.smsMessages'),
        4: t('common.whatsappBalance'),
    };
    return (
        <Grid container spacing={1} className={classes.paymentDialog}>
            {showTitle && <Grid item xs={12} className={clsx(classes.mb4)}>
                <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>{t('payment.purchaseSummary')}</Typography>
                <Divider />
            </Grid>}
            <Grid item xs={6}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.productName')}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{`${pack.Quantity} ${productName[pack?.CampaignType]}`}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>

            <Grid item xs={6}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.price')}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={pack.Price} displayType={'text'} thousandSeparator={true} prefix={packageId === GlobalPackageId ? (isCurrencySymbolPrefix === true ? ` ${currencySymbol} ` : '') : '₪'} suffix={packageId === GlobalPackageId && (isCurrencySymbolPrefix === false ? ` ${currencySymbol} ` : '')} /></Typography>
            </Grid>
            <Grid item xs={12}>
                <Divider />
            </Grid>

            {
                ((isGlobal && currencyId === IsraelCurrencyId) || !isGlobal) && (
                    <>
                        <Grid item xs={6}>
                            <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}>
                                {packageId === GlobalPackageId && (`${israelTax * 100}% `)}
                                {t( packageId === GlobalPackageId ? 'common.VATTax' : 'common.vat')}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={vat} displayType={'text'} thousandSeparator={true} prefix={packageId === GlobalPackageId ? (isCurrencySymbolPrefix === true ? ` ${currencySymbol} ` : '') : '₪'} suffix={packageId === GlobalPackageId && (isCurrencySymbolPrefix === false ? ` ${currencySymbol} ` : '')} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider className={classes.blackDivider} />
                        </Grid>
                    </>
                )
            }


            <Grid item xs={6} className={clsx(classes.mb4)}>
                <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.line1, classes.font20)}>{t('common.totalPrice')}</Typography>
            </Grid>
            <Grid item md={6}>
                <Typography className={clsx(classes.bold, classes.blue, classes.subTitle, classes.line1, classes.font20)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={totalPrice.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={packageId === GlobalPackageId ? (isCurrencySymbolPrefix === true ? ` ${currencySymbol} ` : '') : '₪'} suffix={packageId === GlobalPackageId && (isCurrencySymbolPrefix === false ? ` ${currencySymbol} ` : '')} /></Typography>
            </Grid>

            {showButtons && <Grid
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
                        {t('common.continue')}
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
    )
}

export default PurchaseSummary;