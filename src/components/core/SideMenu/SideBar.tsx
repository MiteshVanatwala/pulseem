import clsx from 'clsx';
import { get } from 'lodash';
import SidebarItem from './SideBarItem';
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useRedirect from '../../../helpers/Routes/Redirect';
import PulseemNewLogo from '../../../assets/images/PulseemNewLogo';
import { RedirectPropTypes } from '../../../helpers/Types/Redirect';
import { setCookie, getCookie } from '../../../helpers/Functions/cookies';
import { getRoutes, getSettingsItem } from '../../../helpers/Routes/routes';
import { FaTimes, FaChevronLeft, FaChevronRight, } from 'react-icons/fa';
import { Drawer, IconButton, Button, Divider, List } from '@material-ui/core';
import { SidebarProps } from '../../../Models/SideMenuBar/SideMenuBarModel';

const returnToMainAccount = () => {
  window.location.href = '/Pulseem/ReactRedirect.aspx?fromreact=true';
};

const returnToAdmin = () => {
  window.location.href = '/Pulseem/ReactRedirect.aspx';
};

export const Sidebar: React.FC<SidebarProps> = ({
  classes: externalClasses,
  currentPage = '',
  isOpen,
  onToggle,
  classes,
  isCollapsed: externalIsCollapsed = false
}) => {
  const Redirect = useRedirect();
  const { t } = useTranslation();

  const {
    windowSize,
    isRTL,
    imageURL,
    cameFromSubAccount,
    isAdmin,
    isAllowSwitchAccount,
    isClal,
    userRoles
  } = useSelector((state: any) => state.core);

  const {
    accountSettings,
    accountFeatures,
    subAccount,
    isGlobal,
    IsPoland
  } = useSelector((state: any) => state.common);

  const { username } = useSelector((state: any) => state.user);

  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (accountSettings && accountSettings !== '') {
      setSettingsLoaded(true);
    }
  }, [accountSettings]);

  useEffect(() => {
    const collapsedFromCookie = getCookie('SidebarCollapsed');
    if (collapsedFromCookie !== null) {
      setIsCollapsed(collapsedFromCookie === 'true');
    } else {
      setIsCollapsed(externalIsCollapsed);
    }
  }, [externalIsCollapsed]);

  const routes = getRoutes(
    t,
    isClal,
    accountFeatures,
    accountSettings,
    windowSize,
    isRTL,
    userRoles,
    isGlobal && IsPoland
  );

  const settings = getSettingsItem(
    t,
    externalClasses.appBarSettingIcon,
    (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')),
    username.length > 20 ? `${username.slice(0, 20)}...` : username,
    isRTL,
    accountSettings,
    accountFeatures,
    get(subAccount, 'CompanyAdmin', false),
    userRoles
  );

  useEffect(() => {
    if (settingsLoaded && currentPage && routes.length > 0) {
      const parentKey = findParentKey(routes, currentPage);
      if (parentKey && !openMenus[parentKey]) {
        const updated = { ...openMenus, [parentKey]: true };
        setOpenMenus(updated);
        setCookie('sidebarOpenMenus', JSON.stringify(updated));
      }
    }
  }, [settingsLoaded, currentPage, routes]);

  const toggleSidebar = () => {
    if (windowSize === 'xs' || windowSize === 'sm') {
      onToggle();
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      setCookie('SidebarCollapsed', String(newState), 365); // שמור לשנה
    }
  };

  const toggleSubmenu = (key: string) => {
    setOpenMenus((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setCookie('sidebarOpenMenus', JSON.stringify(updated));
      return updated;
    });
  };

  const findParentKey = (
    routesList: any[],
    currentPageKey: string
  ): string | null => {
    for (const route of routesList) {
      if (
        route.options &&
        Array.isArray(route.options) &&
        route.options.some((child: any) => child.key === currentPageKey)
      ) {
        return route.key;
      }
    }
    return null;
  };

  useEffect(() => {
    if (settingsLoaded && currentPage && routes.length > 0) {
      const parentKey = findParentKey(routes, currentPage);
      if (parentKey) {
        setOpenMenus((prev) => ({
          ...prev,
          [parentKey]: true,
        }));
      }
    }
  }, [settingsLoaded, currentPage, routes]);

  const isMobile = windowSize === 'xs' || windowSize === 'sm';
  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const drawerOpen = isMobile ? isOpen : true;

  console.log(isRTL)
  return (
    <Drawer
      variant={drawerVariant}
      open={drawerOpen}
      onClose={onToggle}
      anchor={isRTL ? 'right' : 'left'}
      PaperProps={{
        style: {
          right: isRTL ? 0 : 'auto',
          left: isRTL ? 'auto' : 0,
          direction: isRTL ? 'rtl' : 'ltr'
        }
      }}
      className={clsx(
        classes.menuSidebar,
        isCollapsed && !isMobile && classes.sidebarCollapsed,
        isMobile && classes.mobileOverlay
      )}
      classes={{
        paper: clsx(
          classes.sidebarPaper,
          isCollapsed && !isMobile && classes.sidebarPaperCollapsed
        ),
      }}
    >
      <div className={classes.sidebarHeader}>
        {!isCollapsed && <Button
          onClick={(e) => {
            e.preventDefault();
            Redirect({ url: routes[0]?.href } as RedirectPropTypes);
          }}
          style={{ padding: 0, margin: 0 }}
        >
          {imageURL !== '' ? (
            <img
              src={imageURL}
              alt="Logo"
              className={classes.sidebarLogo}
            />
          ) : (
            <PulseemNewLogo />
          )}
        </Button>}
        <IconButton
          onClick={toggleSidebar}
          className={classes.toggleButton}
        >
          {isMobile ? (
            <FaTimes />
          ) : isCollapsed ? (
            isRTL ? <FaChevronLeft /> : <FaChevronRight />
          ) : (
            isRTL ? <FaChevronRight /> : <FaChevronLeft />
          )}
        </IconButton>
      </div>

      {/* Content */}
      <div className={classes.sidebarContent}>
        {/* Navigation */}
        <nav className={classes.sidebarNav}>
          <List>
            {settingsLoaded && routes.map((route, index) =>
              route.isShow && (
                <SidebarItem
                  key={route.key || `route-${index}`}
                  item={route}
                  isCollapsed={isCollapsed && !isMobile}
                  isActive={route.key === currentPage}
                  classes={classes}
                  showSubmenu={openMenus[route.key || `route-${index}`]}
                  toggleSubmenu={() => toggleSubmenu(route.key || `route-${index}`)}
                />
              )
            )}
          </List>
        </nav>
        {/* Footer */}
        <div className={classes.sidebarFooter}>
          {/* User Settings */}
          {settingsLoaded && (
            <SidebarItem
              item={settings}
              isCollapsed={isCollapsed && !isMobile}
              classes={classes}
              showSubmenu={openMenus['settings']}
              toggleSubmenu={() => toggleSubmenu('settings')}
            />
          )}
          <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '8px 0' }} />
          {/* Admin/Return buttons */}
          {!cameFromSubAccount && isAdmin !== '' && (
            <Button
              onClick={returnToAdmin}
              className={classes.languageSelector}
              fullWidth={!isCollapsed || isMobile}
            >
              {(!isCollapsed || isMobile) ? t('appBar.admin') : 'A'}
            </Button>
          )}
          {cameFromSubAccount && (
            <Button
              onClick={returnToMainAccount}
              className={classes.languageSelector}
              fullWidth={!isCollapsed || isMobile}
            >
              {(!isCollapsed || isMobile) ? t('appBar.returnToMainAccount') : 'R'}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
};