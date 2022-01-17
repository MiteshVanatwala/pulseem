import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Box, Grid, Typography } from '@material-ui/core';

const TotalSection = ({ classes, TotalObject }) => {
    const { t } = useTranslation();

    if (TotalObject) {
        return <Box className={clsx(classes.paddingSides25, classes.mb10, classes.reportPaperBgGray, classes.alignCenter)} style={{ marginBottom: 50 }}>
            <Grid item container className={clsx(classes.justifyEvenly)} style={{ width: '100%' }}>
                {Object.keys(TotalObject).map((to) => {
                    if (typeof TotalObject[to] === 'object') {
                        return false;
                    }
                    return <Grid item className={clsx(classes.txtCenter, classes.pt14)}>
                        <Typography className={clsx(classes.bold, classes.colorBlue)}>
                            {t(`report.${to}`)}
                        </Typography>
                        <Typography align='center' className={clsx(classes.colorBlue)}>
                            {!TotalObject[to] ? 0 : TotalObject[to].toLocaleString()}
                        </Typography>
                    </Grid>
                })}
            </Grid>
        </Box>
    }
    return <></>
}

export default TotalSection;