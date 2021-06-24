import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './PricePackages.styles.css'
import clsx from 'clsx';
import { getPackagesList } from '../../redux/reducers/commonSlice';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, Typography, Divider } from '@material-ui/core';
import { Loader } from '../Loader/Loader';
import NumberFormat from 'react-number-format';

const PricePackages = ({ classes }) => {
    const { language } = useSelector(state => state.core)
    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [showLoader, setLoader] = useState(true);

    const initData = async () => {
        const d = await dispatch(getPackagesList());
        setData(d.payload);
        setLoader(false);
    }

    useEffect(initData, [dispatch]);

    const renderPackageInfo = () => {
        return (
            <Grid item xs={12}>
                <Typography className={classes.dialogTitle} style={{ marginInline: 0 }}>{t('common.smsBulkTitle')}</Typography>
                <Divider />
                <Typography className={classes.mt3}>{t('common.smsBulkDescription')}</Typography>
            </Grid>
        );
    }

    const Package = ({ pack, packSize }) => {
        return (
            <Grid item xs={12} sm={6} md={4} lg={packSize} className={clsx(classes.mb4, classes.mt4)}>
                <Box className={clsx(classes.alignCenter, classes.whiteBox)}>
                    <Box className={clsx(classes.dialogContent, classes.alignCenter, classes.m5)}>
                        <Typography className={clsx(classes.blue, classes.subTitle, classes.line1, classes.font24)}>{t('common.smsBulk')}</Typography>
                        <Typography className={classes.dialogTitle}><NumberFormat value={pack.Quantity} displayType={'text'} thousandSeparator={true} /></Typography>
                        <Typography className={clsx(classes.black, classes.bold, classes.mb2)}><NumberFormat className={classes.f20} style={{ direction: isRTL ? 'rtl' : 'ltr' }} value={pack.Price} displayType={'text'} thousandSeparator={true} prefix={'₪'} /></Typography>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonLightGreen)}
                        >{t('common.select')}</Button>
                    </Box>
                </Box>
            </Grid>
        )

    }

    const packagesDetails = () => {
        if(data !== null){
            const packageLength = data.length;
            const packPerLine = Math.ceil(12 / packageLength);
            return (
                data !== null &&
                data.map((d) => {
                    return (
                        <Package pack={d} packSize={packPerLine} />
                    )
                })
            );
        }
    }

    return (
        <Grid container spacing={1}>
            {renderPackageInfo()}
            {packagesDetails()}
            <Loader isOpen={showLoader} showBackdrop={false} />
        </Grid>
    );
}

export default PricePackages;