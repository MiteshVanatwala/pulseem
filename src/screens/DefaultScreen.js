import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { TopAppBar,/*Drawer*/ } from '../components/core'
import { Container } from '@material-ui/core'
// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { getRoutes, getSettingsItem } from '../helpers/Routes/routes';
import { useTranslation } from "react-i18next";
import clsx from 'clsx';
import Illustration_BG_BL from '../assets/images/Illustration_BG_BL';
import Illustration_BG_BR from '../assets/images/Illustration_BG_BR';

const DefaultScreen = ({ classes, children, currentPage = '', subPage = '', containerClass, customPadding = false, customStyle = '' }) => {
  const { t } = useTranslation();
  const { isAdmin, isAllowSwitchAccount } = useSelector(state => state.core)
  let route, title;

  if (subPage) {
    if (currentPage === 'settings') {
      let settingsRoutes = getSettingsItem(t, classes.appBarSettingIcon, (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')))
      const option = settingsRoutes.options.find((sr) => sr.key === subPage) //settingsRoutes && settingsRoutes.options[0].title || '';
      title = (option && option.title) ?? '';
    }
    else {
      route = getRoutes(t).filter(route => route.key === currentPage);
      route = route[0].options.filter(opt => opt.key === subPage);
      title = (route && route[0].title) ?? '';
    }
  } else {
    route = getRoutes(t).filter(route => route.key === currentPage);
    title = (route && route[0] && route[0].pageTitle) || (route && route[0] && route[0].title) || '';
  }

  title = title ? `${title} | ${t('master.pulseemSystem')}` : t('master.pulseemSystem');

  useEffect(() => {
    if (process.env.REACT_APP_MODE === "PROD") {
      const liveChat = document.createElement("script");
      liveChat.type = 'text/javascript';
      liveChat.async = true;
      liveChat.innerHTML = `
          var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
          (function () {
              var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/59c8caaa4854b82732ff1f7d/default';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
          })();`;
      document.body.append(liveChat)

      return () => {
        document.body.removeChild(liveChat);
      }
    }
  }, [])


  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      <Container
        maxWidth='xl'
        className={clsx(customPadding ? classes.sidePadding : null, containerClass ?? null, customStyle)}
      >
        <div className={classes.background}>
          <Illustration_BG_BL className={'leftSvg'} width={'16.72%'} height={'63.65%'} />
          <Illustration_BG_BR className={'rightSvg'} width={'19.64%'} height={'39.80%'} />
        </div>
        {children}
      </Container>
    </HelmetProvider>
  )
}

export default DefaultScreen
