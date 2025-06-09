import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Box, Grid, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';

const TotalSection = ({ classes, TotalObject, callerType }) => {
    const { t } = useTranslation();
    const { windowSize } = useSelector(state => state.core);
    const { accountCurrencySymbol, accountIsCurrencySymbolPrefix, finalGlobalBalance, isGlobal, IsPoland } = useSelector((state) => state.common)

    if (typeof TotalObject === 'object' && Object.keys(TotalObject).length > 0) {
        return <Box className={clsx(classes.paddingSides25, classes.mb10, classes.reportPaperBgGray, classes.alignCenter)} style={{ marginBottom: 50 }}>
            <Grid item container className={clsx(classes.justifyEvenly)} style={{ width: '100%' }}>
                {Object.keys(TotalObject).map((to) => {
                    if (isGlobal && !IsPoland && (['SMSCredits', 'BulkEmails', 'WhatsappBalance'].indexOf(to) > -1)) return false;

                    if ((typeof TotalObject[to] === 'object' && TotalObject[to] !== null) || to === 'DirectReport' || to === 'MmsCredits') { //|| to === 'TotalCredits') {
                        return false;
                    }
                    if (windowSize === 'xs') {
                        if (to === 'TotalRecords' || to === 'TotalSent') {
                            return false;
                        }
                    }

                    return <Grid item className={clsx(classes.txtCenter, classes.pt14)} style={{ maxWidth: windowSize === 'xs' ? 100 : null }} key={to}>
                        <Typography className={clsx(classes.bold, classes.colorBlue)}>
                            {t(`report.${to}`)}
                        </Typography>
                        <Typography align='center' className={clsx(classes.colorBlue)}>
                            {!TotalObject[to] ? 0 : TotalObject[to].toLocaleString()}
                        </Typography>
                    </Grid>
                })}

                {
                    isGlobal && !IsPoland && (
                        <Grid item className={clsx(classes.txtCenter, classes.pt14)} style={{ maxWidth: windowSize === 'xs' ? 100 : null }} >
                            <Typography className={clsx(classes.bold, classes.colorBlue)}>
                                {t(`SubAccount.balance`)}
                            </Typography>
                            <Typography align='center' className={clsx(classes.colorBlue)}>
                                { accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' } {finalGlobalBalance} { !accountIsCurrencySymbolPrefix ? accountCurrencySymbol : '' }
                            </Typography>
                        </Grid>
                    )
                }
            </Grid>
        </Box>
    }
    return <></>
}

export default TotalSection;