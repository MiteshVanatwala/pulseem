import React, { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Grid } from '@material-ui/core';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Shortcut from '../../components/Shortcuts/Shortcut';
import BulkStatus from '../../components/Balance/BulkStatus';
import RecipientChart from '../../components/Charts/RecipientChart';
import PulseemTips from '../../components/Tips/PulseemTips';
import LatestReports from '../../components/Reports/LatestReports';
import clsx from 'clsx';
import { getCookie } from '../../helpers/Functions/cookies'
import TFA from '../../components/DialogTemplates/TFA'
import { Log } from "../../connectors/Teams/Log";

const DashboardScreen = ({ classes }) => {
  const { windowSize, isRTL, accountSettings } = useSelector(state => state.core);
  const { t } = useTranslation();
  const [showTFA, setShowTFA] = useState(false);
  const [TFAInit, setTFAInit] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (document.referrer.toLocaleLowerCase().includes('login.aspx') || document.referrer.toLocaleLowerCase().includes('accountsmanage.aspx')) {
        init2FA();
      }
    }
    if (accountSettings && !TFAInit) {
      initialize();
      setTFAInit(true);
    }
  }, [accountSettings])

  const init2FA = async () => {
    try {
      if (accountSettings && accountSettings.SubAccountSettings.TwoFactorAuthEnabled !== true) {
        const userSelection = getCookie("2faPopupv2");
        if (!userSelection && userSelection !== false) {
          setShowTFA(true);
        }
      }
    } catch (e) {
      console.error(e);
      Log({
        MethodName: 'init2FA',
        ComponentName: 'Dashboard.js',
        Text: e
      })
    }
  }

  const onConfirm2FA = () => {
    window.location = '/Pulseem/AccountSettings.aspx?2fa=1'
  }
  const onCancel2FA = () => {
    setShowTFA(false);
  }

  return (
    <DefaultScreen
      currentPage='dashboard'
      classes={classes}
      customStyle={classes.dashboard}>
      <TFA classes={classes}
        showTFA={showTFA}
        onConfirm={onConfirm2FA}
        onCancel={onCancel2FA} />
      <Grid container>
        <Grid item xs={12} sm={9} md={10} className={clsx(classes.pt20, classes.dashboardTop)}>
          <Grid container direction='row'>
            <Grid item xs={12} sm={12} md={12} lg={4}>
              <BulkStatus classes={classes} />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8} className={windowSize === "xs" ? classes.pt20 : null}>
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
              <LatestReports
                classes={classes}
                windowSize={windowSize}
                t={t}
                isRTL={isRTL}
              />
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
