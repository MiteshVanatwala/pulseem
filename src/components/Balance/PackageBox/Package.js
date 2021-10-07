import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Box, Button, Grid, Typography } from '@material-ui/core';

const Package = ({ classes,
    pack,
    packSize,
    packageType = 1,
    onSelect = () => null }) => {

    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    return (
        <Grid item xs={12} sm={6} md={4} lg={packSize} >
            <Box className={clsx(classes.alignCenter, classes.whiteBox)}>
                <Box className={clsx(classes.borderBox, classes.alignCenter, classes.m5)} style={{ width: '100%' }}>
                    <Typography className={clsx(classes.blue, classes.textCenter, classes.line1, classes.font24)}>{packageType === 1 ? t('common.smsBulk') : t('common.newsletterBulk')}</Typography>
                    <Typography className={clsx(classes.dialogTitle, classes.textCenter)}>
                        <NumberFormat value={pack.Quantity} displayType={'text'} thousandSeparator={true} />
                    </Typography>
                    <Typography className={clsx(classes.black, classes.bold, classes.mb2, classes.textCenter)}>
                        <NumberFormat className={clsx(classes.f20, classes.textCenter)} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={pack.Price} displayType={'text'} thousandSeparator={true} prefix={'₪'} />
                    </Typography>
                    <Button
                        variant='contained'
                        size='medium'
                        className={clsx(
                            classes.actionButton,
                            classes.actionButtonLightGreen)}
                        onClick={() => onSelect(pack.ID)}
                    >{t('common.select')}</Button>
                </Box>
            </Box>
        </Grid>
    )
}

export default Package;