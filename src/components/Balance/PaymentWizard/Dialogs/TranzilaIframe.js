import clsx from 'clsx';
import { Button, Grid, Typography, Divider, FormControlLabel, FormControl, FormGroup, Radio, Link, Box } from '@material-ui/core';
import PurchaseSummary from './PurchaseSummary'
import { Loader } from '../../../Loader/Loader';

const TranzilaIframe = ({
    t,
    classes,
    data,
    isRTL,
    packageId,
    windowSize,
    paymentUrl = null,
    onComplete = () => null
}) => {
    return <Grid container>
        <Grid item xs={12}>
            <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>{t("payment.updateCreditCard")}</Typography>
            <Divider />
        </Grid>
        <Grid item className={clsx(classes.mt25, classes.fullFlexItem)}>
            <PurchaseSummary data={data}
                classes={classes}
                isRTL={isRTL}
                packageId={packageId}
                showTitle={false}
                showButtons={false} />

        </Grid>
        <Grid item xs={12} className={clsx(classes.mb25)}>
            <Divider />
        </Grid>
        <Grid item xs={12} className={clsx(classes.fullFlexItem)}>
            <Loader isOpen={paymentUrl === null} showBackdrop={false} />
            <iframe title="Tranzila Url" src={`${paymentUrl}`} width={windowSize !== 'xs' ? 400 : 250} height="420" border="no" frameBorder="0" style={{ border: "none !important" }} />
        </Grid>
    </Grid>
}

export default TranzilaIframe;