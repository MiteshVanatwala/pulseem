import React, { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Grid } from '@material-ui/core';
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
// import WelcomePulseemNewDesign from './Popup/WelcomePulseemNewDesign';
import { WhiteLabelObject } from '../../components/WhiteLabel/WhiteLabelMigrate';
import GlobalBalance from '../../components/Balance/GlobalBalance';
import TermsOfUse from '../TermsOfUse/TermsOfUse';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import { updateTermsOfUse } from '../../redux/reducers/TermsOfUseSlice';
import { getCommonFeatures } from '../../redux/reducers/commonSlice';
import { getCookie, setCookie } from '../../helpers/Functions/cookies';
import BusinessSectorActivity from './Popup/BusinessSectorActivity';

const DashboardScreen = ({ classes }) => {
  const { windowSize, isRTL, isAdmin } = useSelector(state => state.core);
  const { accountSettings, isGlobal, companyAdmin } = useSelector(state => state.common);
  const { t } = useTranslation();
  const [toastMessage, setToastMessage] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [member, setMember] = useState(null);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [termOfUse, setTermOfUse] = useState({
    IsTermsApproved: false
  });
  const [showBusinessSectorActivity, setShowBusinessSectorActivity] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const initialize = async () => {
      let popupShowing = false;
      const hasCookie = getCookie('ignoreTerm');
      const dontShowAgainBusinessSector = getCookie('dontShowAgainBusinessSector');

      if (document.referrer.toLocaleLowerCase().includes('login.aspx')) {
        const member = accountSettings?.SubAccountSettings?.MembershipDetails;
        setMember(member);
        if (member?.PasswordExpired === true) {
          logout();
          return false;
        }
        else {
          if (member?.NextRequiredChange <= 14) {
            popupShowing = true;
            setShowChangePassword(true);
          }
        }
        if (!popupShowing) {
          setShowBusinessSectorActivity((dontShowAgainBusinessSector === 'true' || !accountSettings?.SubAccountSettings?.RequestBusinessActivity) ? false : true);
        }
      }
      if (!isAdmin && companyAdmin) {
        setShowTermsOfUse(!accountSettings?.SubAccountSettings?.IsTermsApproved)
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

  const isWhiteLabel = accountSettings.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings.Account?.ReferrerID] !== undefined;

  const onIgnoreTerms = async () => {
    setShowTermsOfUse(false);
    setCookie("ignoreTerm", true);
    const response = await dispatch(updateTermsOfUse(termOfUse));
    if (response?.payload?.StatusCode === 201 && termOfUse.IsTermsApproved) {
      await dispatch(getCommonFeatures());
    }
  }

  const onIgnoreBusinessSector = () => {
    const count = getCookie('businessSectorActivityIgnore') || 0;
    const nextCount = parseInt(count) + 1;
    setCookie('businessSectorActivityIgnore', nextCount);
    setShowBusinessSectorActivity(false);
  }


  return (
    <DefaultScreen
      currentPage='dashboard'
      classes={classes}
      customStyle={clsx(classes.dashboard, classes.mb75)}>
      <Grid container>
        <Grid item xs={12} sm={8} md={9} lg={9} xl={10} className={clsx(classes.pt20, classes.dashboardTop)}>
          <Grid container direction='row'>
            <Grid item xs={12} sm={12} md={12} lg={4}>
              {<BulkStatus classes={classes} />}
              {<GlobalBalance classes={classes} />}
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={8} className={windowSize === "xs" ? classes.pt20 : null}>
              <RecipientChart classes={classes} />
            </Grid>
          </Grid>
          <Grid container direction='row' className={classes.pt20}>
            {!isWhiteLabel && <Grid item xs={12} sm={12} md={12} lg={4}>
              <PulseemTips
                classes={classes}
                t={t}
                isRTL={isRTL}
              />
            </Grid>}
            <Grid item xs={12} sm={12} md={12} lg={!isWhiteLabel ? 8 : 12}>
              <LatestReports
                classes={classes}
                windowSize={windowSize}
                t={t}
                isRTL={isRTL}
                isWhiteLabel={isWhiteLabel}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={4} md={3} lg={3} xl={2} className={classes.dashboardSide}>
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
        classes={classes}
        SetToast={setToastMessage}
        IsOpen={showChangePassword}
        OnClose={() => setShowChangePassword(false)}
        Text={renderPasswordText()}
      />}
      <BaseDialog
        paperStyle={classes.maxWidthMinContent}
        disableBackdropClick
        classes={classes}
        hideHeader={false}
        open={showTermsOfUse}
        showDefaultButtons={false}
        title={t('TermsOfUse.title')}
        // onCancel={() => {
        //   onIgnoreTerms();
        // }}
        // onClose={() => {
        //   onIgnoreTerms();
        // }}
      >
        <Box style={{ height: 230 }}>
          <TermsOfUse classes={classes} onClose={() => setShowTermsOfUse(false)} />
        </Box>
      </BaseDialog>
      <BaseDialog
        paperStyle={classes.maxWidthMinContent}
        disableBackdropClick
        classes={classes}
        open={showBusinessSectorActivity}
        showDefaultButtons={false}
        childrenStyle={classes.overflowHidden}
        title={t('dashboard.businessSectorActivity.title')}
        onCancel={() => {
          onIgnoreBusinessSector();
        }}
        onClose={() => {
          onIgnoreBusinessSector();
        }}
      >
        <BusinessSectorActivity thankYouPage={showThankYou} classes={classes} onDone={() => {
          if (showThankYou) {
            setShowBusinessSectorActivity(false);
          }
          else {
            setShowThankYou(true);
          }
        }} />
      </BaseDialog>
    </DefaultScreen>
  )
}

function isLoaded(prevProps, nextProps) {
  return prevProps === nextProps;
}

export default React.memo(DashboardScreen, isLoaded);
