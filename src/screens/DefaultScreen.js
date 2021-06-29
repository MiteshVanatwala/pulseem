import React from 'react'
import { TopAppBar,/*Drawer*/ } from '../components/core'
import { Container } from '@material-ui/core'
import { Helmet } from 'react-helmet';
import { getRoutes } from '../helpers/routes';
import {useTranslation} from "react-i18next";

const DefaultScreen = ({ classes, children, currentPage = '', subPage = '', customPadding = false }) => {
  const {t}=useTranslation();
  let route, title;

  if (subPage) {
    route = getRoutes(t).filter(route=>route.key===currentPage);
    route = route[0].options.filter(opt=>opt.key===subPage);
    title = route&&route[0].title || '';
  } else {
    route = getRoutes(t).filter(route=>route.key===currentPage);
    title = route&&route[0]&&route[0].pageTitle || '';
  }

  title = title? `${title} | ${t('master.pulseemSystem')}`: t('master.pulseemSystem');



  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      {/*<Drawer classes={classes} />*/}
      <Container
        maxWidth='xl'
        //className={classes.defaultScreen}
        style={{ maxHeight: 'calc(100vh - 53px)' }}
        className={customPadding ? classes.sidePadding : null}>
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
