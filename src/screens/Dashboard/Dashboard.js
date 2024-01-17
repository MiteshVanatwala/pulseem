import React, { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Checkbox, FormControlLabel, Grid } from '@material-ui/core';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Shortcut from '../../components/Shortcuts/Shortcut';
import BulkStatus from '../../components/Balance/BulkStatus';
import RecipientChart from '../../components/Charts/RecipientChart';
import PulseemTips from '../../components/Tips/PulseemTips';
import LatestReports from '../../components/Reports/LatestReports';
import clsx from 'clsx';
import ChangePassword from '../Settings/AccountSettings/Password/ChangePassword';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import Toast from "../../components/Toast/Toast.component";
import { logout } from '../../helpers/Api/PulseemReactAPI';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { getCookie, setCookie } from '../../helpers/Functions/cookies';
import { useNavigate } from 'react-router';
import DahsboardDomainVerificationPopup from './Popup/DahsboardDomainVerificationPopup';

const DashboardScreen = ({ classes }) => {
  const { windowSize, isRTL, accountSettings } = useSelector(state => state.core);
  const { t } = useTranslation();
  const [toastMessage, setToastMessage] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDomainVerificationMessage, setShowDomainVerificationMessage] = useState(true);
  const [member, setMember] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      if (document.referrer.toLocaleLowerCase().includes('login.aspx')) {
        const member = accountSettings?.SubAccountSettings?.MembershipDetails;
        setMember(member);
        if (member?.PasswordExpired === true) {
          logout();
          return false;
        }
        else {
          if (member?.NextRequiredChange <= 14) {
            setShowChangePassword(true);
          }
        }
      }
    }
    if (accountSettings) {
      initialize();
    }
  }, [accountSettings])

  const renderToast = () => {
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return <Toast data={toastMessage} />;
  };

  const renderPasswordText = () => {
    return RenderHtml(t('dashboard.changePassword').replace('##days##', member?.NextRequiredChange ?? ''))
  }

  const handleShowDomainCookie = () => {
    const cookie = getCookie("popup_hide_domain_verification");
    setCookie("popup_hide_domain_verification", cookie !== 'true');
  }

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
      {toastMessage && renderToast()}
      {showChangePassword && <ChangePassword
        SetToast={setToastMessage}
        IsOpen={showChangePassword}
        OnClose={() => setShowChangePassword(false)}
        Text={renderPasswordText()}
      />}
      <DahsboardDomainVerificationPopup
        classes={classes}
        isOpen={showDomainVerificationMessage}
        onClose={() => setShowDomainVerificationMessage(false)} />
    </DefaultScreen>
  )
}

function isLoaded(prevProps, nextProps) {
  return prevProps === nextProps;
}

export default React.memo(DashboardScreen, isLoaded);
