import React, { useRef } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box
} from '@material-ui/core';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { FaBars } from 'react-icons/fa';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import PulseemNewLogo from '../../assets/images/PulseemNewLogo';
import NotificationBell from '../NotificationBell/NotificationBell';
import { RedirectPropTypes } from '../../helpers/Types/Redirect';
import { GiHamburgerMenu } from 'react-icons/gi';

interface TopAppBarProps {
  classes: any;
  currentPage?: string;
  showAppBar?: boolean;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  classes,
  currentPage = '',
  showAppBar = true,
  onMenuToggle,
  isSidebarOpen
}) => {
  const Redirect = useRedirect();
  const { t } = useTranslation();

  const {
    windowSize,
    isRTL,
    imageURL
  } = useSelector((state: any) => state.core);

  const {
    accountSettings
  } = useSelector((state: any) => state.common);

  const topNavRef = useRef(null);

  // On mobile, show a simplified top bar with hamburger menu
  const isMobile = windowSize === 'xs' || windowSize === 'sm';

  if (!isMobile) {
    // On desktop, the sidebar handles everything, so we show minimal top bar or none
    return (
      <Box style={{ flexGrow: 1 }} className={clsx(classes.pl25, classes.ps25)}>
        <AppBar
          position='static'
          className={classes.appBar}
          ref={topNavRef}
          style={{
            display: showAppBar === true ? 'block' : 'none',
            backgroundColor: '#f5f5f5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            color: '#333'
          }}
        >
          <Toolbar variant='dense' className={clsx(classes.justifyBetween, classes.h100)}>
            <Typography variant="h6" style={{ color: '#333', fontWeight: 500 }}>
            </Typography>
            <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
            </Box>
          </Toolbar>
        </AppBar>
        <Box className={classes.appBarBorder} />
      </Box>
    );
  }

  // Mobile version with hamburger menu
  return (
    <Box style={{ flexGrow: 1 }} className={clsx(classes.pl25, classes.ps25)}>
      <AppBar
        position='static'
        className={classes.appBar}
        ref={topNavRef}
        style={{ display: showAppBar === true ? 'block' : 'none' }}
      >
        <Toolbar variant='dense' className={clsx(classes.justifyBetween, classes.h100)}>
          <Button
            href={`${sitePrefix}Dashboard`}
            onClick={(e) => {
              e.preventDefault();
              Redirect({ url: `${sitePrefix}Dashboard` } as RedirectPropTypes);
            }}
            className={clsx(
              accountSettings?.SubAccountSettings?.IsTokenAccount
                ? classes.tokenAppBarLogo
                : classes.pulseemAppBarLogo,
              'logo'
            )}
          >
            {imageURL !== '' ? (
              <img
                src={imageURL}
                alt='Logo'
                className={classes.appBarLogo}
              />
            ) : (
              <PulseemNewLogo />
            )}
          </Button>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            className={classes.menuButton}
          >
            <GiHamburgerMenu style={{ color: '#000' }} />
          </IconButton>
          <Box>
            <NotificationBell classes={classes} />
          </Box>
        </Toolbar>
      </AppBar>
      <Box className={classes.appBarBorder} />
    </Box>
  );
};