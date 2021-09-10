import React from 'react';
import DefaultScreen from '../DefaultScreen'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Grid, Box } from '@material-ui/core';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Shortcut from '../../components/Shortcuts/Shortcut';
import BulkStatus from '../../components/Prices/BulkStatus';
import RecipientChart from '../../components/Charts/RecipientChart';
import PulseemTips from '../../components/Tips/PulseemTips';
import LatestReports from '../../components/Reports/LatestReports';
import clsx from 'clsx';

const DashboardScreen = ({ classes }) => {
  const { windowSize, isRTL } = useSelector(state => state.core);
  const { t } = useTranslation();

  document.title = t('dashboard.pageTitle');

  return (
    <DefaultScreen
      currentPage='dashboard'
      classes={classes}
      customStyle={classes.dashboard}>
      <Grid container>
        <Grid item xs={12} sm={9} md={10} className={clsx(classes.pt20, classes.dashboardTop)}>
          <Grid container direction='row'>
            <Grid item xs={12} sm={12} md={12} lg={4}>
              <BulkStatus classes={classes} />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8}>
              <RecipientChart classes={classes} />
            </Grid>
          </Grid>
          <Grid container direction='row' className={classes.pt20}>
            <Grid item xs={12} sm={12} md={12} lg={3}>
              <PulseemTips
                classes={classes}
                t={t}
                isRTL={isRTL}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={9}>
              {windowSize !== 'xs' && <LatestReports
                classes={classes}
                windowSize={windowSize}
                t={t}
                isRTL={isRTL}
              />}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={3} md={2} className={classes.dashboardSide}>
          <Shortcut
            windowSize={windowSize}
            classes={classes}
            t={t}
            isRTL={isRTL}
          />
        </Grid>
      </Grid>
    </DefaultScreen>
  )
}

function isLoaded(prevProps, nextProps) {
  return prevProps === nextProps;
}

export default React.memo(DashboardScreen, isLoaded);
