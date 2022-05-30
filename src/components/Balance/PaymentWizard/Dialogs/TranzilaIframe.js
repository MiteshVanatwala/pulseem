import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid, Typography, Divider, FormControlLabel, FormControl, FormGroup, Radio, Link, Box } from '@material-ui/core';
import { useSelector } from 'react-redux'
import PurchaseSummary from './PurchaseSummary'

const TranzilaIframe = ({
    classes,
    data,
    isRTL,
    packageId,
    windowSize,
    onComplete = () => null
}) => {
    return <Grid container>
        <Grid item xs={12}>
            <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>Add credit card</Typography>
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
        <Grid item xs={12} className={clsx(classes.mt25, classes.mb25)}>
            <Divider />
        </Grid>
        <Grid item xs={12} className={clsx(classes.fullFlexItem)}>
            <Typography>Heelo tranzilla</Typography>
        </Grid>
    </Grid>
}

export default TranzilaIframe;