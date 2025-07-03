import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { TopAppBar,/*Drawer*/ } from '../components/core'
import { Container } from '@material-ui/core'
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getRoutes, getSettingsItem } from '../helpers/Routes/routes';
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import Illustration_BG_BL from '../assets/images/Illustration_BG_BL';
import Illustration_BG_BR from '../assets/images/Illustration_BG_BR';
import DomainVerification from '../Shared/Dialogs/DomainVerification';
import TawkToContainer from '../components/TawkTo/TawkToContainer';
import { sitePrefix } from '../config';
import useRedirect from '../helpers/Routes/Redirect';
import { getCookie } from '../helpers/Functions/cookies';
import { get } from 'lodash';
import { MainLayout } from '../components/core/SideMenu/MainLayout';

const DefaultScreen = ({ classes, children, currentPage = '', subPage = '', containerClass, customPadding = false, showAppBar = true, customStyle = '', hideSideImages = false }) => {
  const { t } = useTranslation();
  const { isAdmin, isAllowSwitchAccount, windowSize, isRTL, isDebtAccount, isClal, userRoles } = useSelector(state => state.core)
  const { domainVerificationPopUp } = useSelector(state => state.newsletter);
  const { username } = useSelector(state => state.user)
  const [reKey, setReKey] = useState(0);
  const Redirect = useRedirect();
  const { accountSettings, accountFeatures, subAccount } = useSelector(state => state.common);

  let route, title;

  const routes = getRoutes(t, isClal, accountFeatures, accountSettings, windowSize, isRTL);

  if (subPage) {
    if (currentPage === 'settings') {
      let settingsRoutes = getSettingsItem(t, classes.appBarSettingIcon,
        (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')), username, isRTL, accountSettings, accountFeatures, get(subAccount, 'CompanyAdmin', false), userRoles)
      const option = settingsRoutes.options.find((sr) => sr.key === subPage) //settingsRoutes && settingsRoutes.options[0].title || '';
      title = (option && option.title) ?? '';
    }
    else {
      route = routes.filter(route => route.key === currentPage);
      route = route[0].options.filter(opt => opt.key === subPage);
      title = (route && route[0]?.title) ?? '';
    }
  } else {
    route = routes.filter(route => route.key === currentPage);
    title = (route && route[0] && route[0].pageTitle) || (route && route[0] && route[0].title) || '';
  }

  title = title ? `${title} | ${t('master.pulseemSystem')}` : t('master.pulseemSystem');



  useEffect(() => {
    setReKey(reKey + 1);
    if (isDebtAccount === true && window.location.href.toLowerCase().indexOf('billingsettings') <= -1) {
      Redirect({ url: `${sitePrefix}BillingSettings?p=2` })
    }
    else if (!isAdmin && !accountSettings?.SubAccountSettings?.IsTermsApproved &&
      getCookie('ignoreTerm') !== 'true' &&
      accountSettings?.SubAccountSettings?.IgnoranceCount === 3 &&
      window.location.href.toLowerCase().indexOf('termsofuse') <= -1) {
      Redirect({ url: `${sitePrefix}TermsOfUse` })
    }
  }, [])

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {(!isDebtAccount || isDebtAccount === false) && <MainLayout
        classes={classes}
        currentPage={currentPage}
        showAppBar={showAppBar}
      >
        <Container
          maxWidth='xl'
          className={clsx(customPadding ? classes.sidePadding : null, containerClass ?? null, customStyle)}
        >
          {!hideSideImages && <div className={classes.background}>
            <Illustration_BG_BL className={isRTL ? 'rightSvg' : 'leftSvg'} />
            <Illustration_BG_BR className={isRTL ? 'leftSvg' : 'rightSvg'} />
          </div>}
          <DomainVerification classes={classes} domain={domainVerificationPopUp} />
          {children}
        </Container>

      </MainLayout>}
      <TawkToContainer itemId={reKey} />
    </HelmetProvider>
  )
}

export default DefaultScreen;
