import clsx from 'clsx';
import { Grid, Box, Typography, Button } from '@material-ui/core';
import { FaExclamationCircle } from 'react-icons/fa';
import {
    CheckAnimation
} from '../../../../assets/images/settings/index'

const PaymentResult = ({ t, classes, paymentObject, onStepBack = () => {} }) => {
    return <Grid container>
        <Grid item xs={12}>
            {paymentObject.result === true ? (<Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <img src={CheckAnimation} alt="Checkmark animation" />
                <Typography style={{ fontWeight: 'bold' }}>{t("common.ThankYou")}</Typography>
                <Typography>{t("payment.paymentSuceess")}</Typography>
            </Box>) : (
                <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <FaExclamationCircle style={{ fontSize: 100 }} />
                    <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{t("common.errorDetected")}</Typography>
                    <Typography>{t("common.tryAgain")}</Typography>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen,
                            classes.backButton,
                            classes.mt50
                        )}
                        onClick={() => onStepBack()}>{t("payment.tryAgain")}</Button>
                </Box>)
            }
        </Grid>
    </Grid>
}

export default PaymentResult;