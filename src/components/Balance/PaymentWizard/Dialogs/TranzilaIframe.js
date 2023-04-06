import clsx from 'clsx';
import { Grid, Box, Typography, Divider, Link } from '@material-ui/core';
import PurchaseSummary from './PurchaseSummary'
import { Loader } from '../../../Loader/Loader';
import { useEffect } from 'react';
import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";
import { useDispatch } from 'react-redux';

const TranzilaIframe = ({
    t,
    classes,
    data,
    isRTL,
    packageId,
    packageType,
    windowSize,
    paymentUrl = null,
    onStepBack = () => null,
    onComplete = () => null
}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        window.addEventListener('message', (e) => {
            if (e.data) {
                try {
                    const message = JSON.parse(e.data);
                    if (message["result"] !== null) {
                        onComplete(message);
                    }
                }
                catch (e) {
                    dispatch(sendToTeamChannel({
                        MethodName: 'UseEffect',
                        ComponentName: 'TranzilaIframe',
                        Message: e
                    }));
                    return false;
                }
            }
        })
    }, []);

    return <Grid container>
        <Grid item xs={12}>
            <Box className={classes.justifyBetween} style={{ alignItems: 'center' }}>
                <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>{t("payment.updateCreditCard")}</Typography>
                <Link onClick={onStepBack} style={{ cursor: 'pointer' }}>{t("smsReport.back")}</Link>
            </Box>
            <Divider />
        </Grid>
        <Grid item className={clsx(classes.mt25, classes.fullFlexItem)}>
            <PurchaseSummary data={data}
                classes={classes}
                isRTL={isRTL}
                packageId={packageId}
                packageType={packageType}
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