import clsx from 'clsx';
import SidebarItem from './SideBarItem';
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useRedirect from '../../../helpers/Routes/Redirect';
import PulseemNewLogo from '../../../assets/images/PulseemNewLogo';
import { RedirectPropTypes } from '../../../helpers/Types/Redirect';
import { setCookie, getCookie } from '../../../helpers/Functions/cookies';
import { getRoutes, getSettingsItem } from '../../../helpers/Routes/routes';
import { FaTimes, FaChevronLeft, FaChevronRight, FaCrown } from 'react-icons/fa';
import { Drawer, IconButton, Button, List, Box, Popper, Paper, MenuItem, MenuList, ClickAwayListener, Tooltip, Typography } from '@material-ui/core';
import { SidebarProps } from '../../../Models/SideMenuBar/SideMenuBarModel';
import { setIsDrawerOpen, setLanguage } from '../../../redux/reducers/coreSlice';
import NotificationBell from '../../NotificationBell/NotificationBell';
import { BsGlobe2 } from 'react-icons/bs';
import i18n from '../../../i18n';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import { FiZap } from 'react-icons/fi';
import { sitePrefix } from '../../../config';

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage = '',
  isOpen,
  onToggle,
  classes,
  subPage,
  isCollapsed: externalIsCollapsed = false
}) => {
  const Redirect = useRedirect();
  const { t } = useTranslation();
  const CrownIcon = FaCrown as any;
  const ZapIcon = FiZap as any;
  const dispatch = useDispatch();
  const {
    windowSize,
    isRTL,
    imageURL,
    isClal,
    userRoles,
    isAdmin,
    isAllowSwitchAccount
  } = useSelector((state: any) => state.core);

  const { username } = useSelector((state: any) => state.user);

  const {
    accountSettings,
    accountFeatures,
    isGlobal,
    IsPoland,
    subAccount
  } = useSelector((state: any) => state.common);

  const { currentPlan } = useSelector((state: any) => state.tiers);

  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageButtonRef = useRef(null);

  useEffect(() => {
    if (accountSettings && accountSettings !== '') {
      setSettingsLoaded(true);
    }
  }, [accountSettings]);

  useEffect(() => {
    const collapseOpenMenus = getCookie('sidebarOpenMenus');
    const collapsedFromCookie = getCookie('SidebarCollapsed');
    if (collapsedFromCookie !== null) {
      setIsCollapsed(collapsedFromCookie === 'true');
    } else {
      setIsCollapsed(externalIsCollapsed);
    }
    if (collapseOpenMenus !== null && collapseOpenMenus !== undefined) {
      setOpenMenus(collapseOpenMenus);
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

  const getAccountName = () => {
    if (accountSettings?.IsDirectAccount && subAccount?.DirectAccountCompanyName) {
      return subAccount.DirectAccountCompanyName;
    }
    return accountSettings?.SubAccountName || username;
  };

  const accountName = getAccountName();
  const displayAccountName = accountName && accountName.length > 20 ? `${accountName.slice(0, 20)}...` : accountName;

  const settingsMenu = getSettingsItem(
    t,
    '',
    isAllowSwitchAccount,
    displayAccountName || t('Settings'),
    isRTL,
    accountSettings,
    accountFeatures,
    isAdmin,
    userRoles
  );

  // Add icon to settings menu
  if (settingsMenu) {
    (settingsMenu as any).iconName = 'MdAccountCircle';
  }

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
    dispatch(setIsDrawerOpen(isCollapsed));
  };

  const toggleSubmenu = (key: string) => {
    setOpenMenus((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setCookie('sidebarOpenMenus', JSON.stringify(updated));
      return updated;
    });
  };

  const handleIconClick = (key: string) => {
    if (isCollapsed && !isMobile) {
      // If sidebar is collapsed, expand it and open the specific menu
      setIsCollapsed(false);
      setCookie('SidebarCollapsed', 'false', 365);

      // Open the specific menu
      setOpenMenus((prev) => {
        const updated = { ...prev, [key]: true };
        setCookie('sidebarOpenMenus', JSON.stringify(updated));
        return updated;
      });

      dispatch(setIsDrawerOpen(true));
    }
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

  const isMobile = windowSize === 'xs' || windowSize === 'sm';
  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const drawerOpen = isMobile ? isOpen : true;

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
            // @ts-ignore
            <FaTimes />
          ) : isCollapsed ? (
            // @ts-ignore
            isRTL ? <FaChevronLeft /> : <FaChevronRight />
          ) : (
            // @ts-ignore
            isRTL ? <FaChevronRight /> : <FaChevronLeft />
          )}
        </IconButton>
      </div>

      {!isCollapsed && currentPlan && currentPlan.Name && currentPlan.Name !== 'GRAND_FATHER' && (
        <div className={classes.sidebarPlanSection}>
          <div className={classes.sidebarPlanCardHeader}>
            <div className={classes.sidebarPlanTitle}>
              {t('billing.yourPlan')}
            </div>
            <CrownIcon className={classes.sidebarPlanHeaderIcon} />
          </div>

          <div className={classes.sidebarPlanName}>
            {currentPlan.Name}
          </div>

          {currentPlan.TierSubscriptionStartDate && currentPlan.TierSubscriptionEndDate && (
            <div className={classes.sidebarPlanDatesContainer}>
              <div className={classes.sidebarPlanDateRow}>
                <span>{t("common.startDate")}: <strong>{moment(currentPlan.TierSubscriptionStartDate).format(DateFormats.DATE_ONLY)}</strong></span>
              </div>
              <div className={classes.sidebarPlanDateRow}>
                <span>{t("common.endDate")}: <strong>{moment(currentPlan.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY)}</strong></span>
              </div>
            </div>
          )}

          {currentPlan.Name !== 'Scale' && (
            <Button
              className={classes.sidebarUpgradeBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                Redirect({ url: `${sitePrefix}BillingSettings` } as RedirectPropTypes);
              }}
            >
              {t('billing.upgradePlan')}
            </Button>
          )}
        </div>
      )}

      {isCollapsed && !isMobile && currentPlan && currentPlan.Name && currentPlan.Name !== 'GRAND_FATHER' && (
        <Tooltip
          title={
            <Box style={{ padding: 6 }}>
              <Typography style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('billing.yourPlan')}
              </Typography>
              <Typography style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBlock: 4 }}>
                {currentPlan.Name}
              </Typography>
              {currentPlan.TierSubscriptionStartDate && currentPlan.TierSubscriptionEndDate && (
                <Typography style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4 }}>
                  • {t("common.startDate")}: {moment(currentPlan.TierSubscriptionStartDate).format(DateFormats.DATE_ONLY)}
                  <br />
                  • {t("common.endDate")}: {moment(currentPlan.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY)}
                </Typography>
              )}
            </Box>
          }
          placement="right"
          classes={{ tooltip: classes.tooltip }}
        >
          <div className={classes.sidebarPlanCollapsedIcon}>
            <ZapIcon size={20} />
          </div>
        </Tooltip>
      )}

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
                  currentPage={currentPage}
                  subPage={subPage}
                  showSubmenu={openMenus[route.key || `route-${index}`]}
                  toggleSubmenu={() => toggleSubmenu(route.key || `route-${index}`)}
                  onIconClick={() => handleIconClick(route.key || `route-${index}`)}
                />
              )
            )}
          </List>
        </nav>
      </div>

      {settingsLoaded && settingsMenu && (
        <div className={classes.sidebarFooter}>
          <div className={classes.userSection}>
            <SidebarItem
              item={settingsMenu}
              isCollapsed={isCollapsed && !isMobile}
              isActive={currentPage === 'settings'}
              classes={classes}
              currentPage={currentPage}
              subPage={subPage}
              showSubmenu={openMenus[settingsMenu.key]}
              toggleSubmenu={() => toggleSubmenu(settingsMenu.key)}
              onIconClick={() => handleIconClick(settingsMenu.key)}
            />
          </div>
        </div>
      )}

    </Drawer>
  );
};