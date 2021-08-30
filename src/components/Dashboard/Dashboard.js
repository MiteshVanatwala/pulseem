import React, { useState, useEffect } from 'react';
import DefaultScreen from '../DefaultScreen'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Grid } from '@material-ui/core';
import clsx from 'clsx';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getRecipientsReport, getPackagesDetails, getLastCampaignReport, getTips } from '../../redux/reducers/dashboardSlice';
import Shortcut from '../../components/Shortcuts/Shortcut';
import BulkStatus from '../../components/Prices/BulkStatus';
import RecipientChart from '../../components/Charts/RecipientChart';
import PulseemTips from '../../components/Tips/PulseemTips';
import LatestReports from '../../components/Reports/LatestReports';

const DashboardScreen = ({ classes }) => {
  const { language, windowSize, isRTL } = useSelector(state => state.core);
  const { lastCampaignReport, tips } = useSelector(state => state.dashboard);



  const { t } = useTranslation();
  const dispatch = useDispatch();

  moment.locale(language);

  const initData = async () => {
    dispatch(getPackagesDetails());
    dispatch(getRecipientsReport());
    dispatch(getLastCampaignReport());
    dispatch(getTips());
  }

  useEffect(initData, [dispatch])

  return (
    <DefaultScreen
      currentPage='dashboard'
      classes={classes}
      customStyle={classes.dashboard}>
      <Grid container className={classes.dashboardContainer}>
        <Grid item xs={12} sm={9} md={10}>
          <Grid container direction='row'>
            <Grid item xs={12} sm={12} md={12} lg={4}>
              <BulkStatus classes={classes} />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8}>
              <RecipientChart classes={classes} />
            </Grid>
          </Grid>
          <Grid container direction='row'>
            <Grid item xs={12} sm={12} md={12} lg={3}>
              <PulseemTips
                classes={classes}
                tips={tips}
                t={t}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={9}>
              <LatestReports
                classes={classes}
                windowSize={windowSize}
                lastCampaignReport={lastCampaignReport}
                t={t}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={3} md={2}>
          <Shortcut
            classes={classes}
            windowSize={windowSize}
          />
        </Grid>
      </Grid>
    </DefaultScreen>
  )
}

// function isLoaded(prevProps, nextProps) {
//   return prevProps === nextProps;
// }

export default React.memo(DashboardScreen)
//export default React.memo(DashboardScreen, isLoaded);
