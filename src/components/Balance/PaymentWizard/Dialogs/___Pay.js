import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Button, Grid, Typography, Divider, FormControlLabel, FormControl, FormGroup, Radio, Link, Box } from '@material-ui/core';
import { useSelector } from 'react-redux'

const Pay = ({
    classes,
    addNewCard,
    creditCards,
    isRTL,
    onSetAddCredit = () => null,
    onConfirmPayment = () => null,
    onComplete = () => null

}) => {
    const { t } = useTranslation();
    const { windowSize } = useSelector(state => state.core);
    return (
        <Grid container spacing={1} className={classes.paymentDialog}>
            <Grid item xs={12}>
                <Typography className={classes.dialogTitle} style={{ marginInline: windowSize !== 'xs' ? 0 : 25 }}>{t('payment.selectMethod')}</Typography>
                <Divider />
            </Grid>
            {!addNewCard && creditCards && creditCards.map((c, index) => {
                return (
                    <Box key={`credit_${index}`}>
                        <FormControl sx={{ m: 1 }} component="fieldset">
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Radio
                                            key={`chk_${index}`}
                                            checked={true}
                                            inputProps={{ 'aria-labelledby': c.LastDigits }}
                                        />
                                    }
                                    label={`${t("payment.useExistCard")}${c.LastDigits}`}
                                />
                            </FormGroup>
                        </FormControl>
                    </Box>
                )
            })}

            <Grid item xs={12}>
                {creditCards && creditCards.length <= 0 && <Typography>{t("payment.noCreditFound")}</Typography>}
                <Link style={{ cursor: 'pointer', textDecoration: 'underline', marginInline: 10 }} onClick={() => onSetAddCredit(!addNewCard)}>{t("payment.addCreditCard")}</Link>
            </Grid>
            {!addNewCard && <Grid container spacing={3} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)} style={{ display: 'flex', marginTop: 10 }}>
                <Grid item>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={() => onConfirmPayment()}
                        className={clsx(
                            classes.btn,
                            classes.btnRounded
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

export default Pay;