import clsx from 'clsx';
import { Grid, Box, Typography, Divider, Link } from '@material-ui/core';
import PurchaseSummary from './PurchaseSummary'
import { Loader } from '../../../Loader/Loader';
import { useEffect } from 'react';
import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const TranzilaIframe = ({
    classes,
    data,
    isRTL,
    packageId,
    onStepBack,
    paymentUrl = null,
    onComplete = () => { }
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { windowSize } = useSelector(state => state.core);

    useEffect(() => {
        window.addEventListener('message', (e) => {
            if (e.data) {
                try {
                    const message = JSON.parse(e.data);
                    if (message["result"] !== null && message["result"] !== undefined) {
                        onComplete(message);
                    }
                }
                catch (e) {
                    // dispatch(sendToTeamChannel({
                    //     MethodName: 'UseEffect',
                    //     ComponentName: 'TranzilaIframe',
                    //     Message: e
                    // }));
                    return false;
                }
            }
        })

    }, []);

    return <Grid container>
        {onStepBack && <Grid item xs={12}>
            <Box className={classes.justifyBetween} style={{ alignItems: 'center' }}>
                <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>{t("payment.updateCreditCard")}</Typography>
                <Link onClick={onStepBack} style={{ cursor: 'pointer' }}>{t("smsReport.back")}</Link>
            </Box>
            <Divider />
        </Grid>}
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