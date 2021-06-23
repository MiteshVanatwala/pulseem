import React, { useState, useEffect } from 'react';
import { } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import './PricePackages.styles.css'
import clsx from 'clsx';
import { getPackagesList } from '../../redux/reducers/commonSlice';

import { useTranslation } from 'react-i18next'
import {
    Box, Button, Grid, Avatar, Paper,
    Tab, Tabs, Typography, IconButton,
} from '@material-ui/core';

const PricePackages = ({ classes, isOpen = false }) => {
    const { language } = useSelector(state => state.core)
    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [data, setData] = useState(null);

    const initData = async () => {
        const d = await dispatch(getPackagesList());
        setData(d.payload);
    }

    useEffect(initData, [dispatch]);

    const renderPackageInfo = () => {
        return (
            <Grid item xs={12}>
                <Typography variant='h2'>{t('common.smsBulkTitle')}</Typography>
                <Typography>{t('common.smsBulkDescription')}</Typography>
            </Grid>
        );
    }

    const packagesDetails = () => {
        return (
            data !== null &&
            data.map((d) => {
                return (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Paper className={clsx(classes.flexColumn2, classes.justifyCenter, classes.alignCenter)}>
                            <Typography >{t('common.smsBulkTitle')}</Typography>
                            {d.Price}
                            <Button
                                variant='contained'
                                size='medium'
                                className={clsx(
                                    classes.actionButton,
                                    classes.actionButtonLightGreen)}
                            >{t('common.select')}</Button>
                        </Paper>
                    </Grid>
                )
            })
        );
    }

    return (
        <Grid container>
            {renderPackageInfo()}
            {packagesDetails()}
        </Grid>
    );
}

export default PricePackages;