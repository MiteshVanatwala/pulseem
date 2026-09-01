import clsx from 'clsx';
import SidebarItem from './SideBarItem';
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useRedirect from '../../../helpers/Routes/Redirect';
import PulseemNewLogo from '../../../assets/images/PulseemNewLogo';
import { RedirectPropTypes } from '../../../helpers/Types/Redirect';
import { setCookie, getCookie } from '../../../helpers/Functions/cookies';
import { getRoutes, getSettingsItem } from '../../../helpers/Routes/routes';
import { FaTimes, FaChevronLeft, FaChevronRight, FaCrown, FaUserCircle } from 'react-icons/fa';
import { Drawer, IconButton, Button, List, Box, Popper, Paper, MenuItem, MenuList, ClickAwayListener, Typography } from '@material-ui/core';
import SidebarTooltip from './SidebarTooltip';
import { SidebarProps } from '../../../Models/SideMenuBar/SideMenuBarModel';
import { setIsDrawerOpen, setLanguage } from '../../../redux/reducers/coreSlice';
import NotificationBell from '../../NotificationBell/NotificationBell';
import SettingsMenu from '../TopMenu/SettingsMenu';
import { BsGlobe2 } from 'react-icons/bs';
import i18n from '../../../i18n';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import { FiZap } from 'react-icons/fi';
import { sitePrefix } from '../../../config';
import TierPlans from '../../TierPlans/TierPlans';

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
    AiAssistantRolloutEnabled,
    subAccount
  } = useSelector((state: any) => state.common);

  const { currentPlan } = useSelector((state: any) => state.tiers);

  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [showTierPlans, setShowTierPlans] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const languageButtonRef = useRef(null);

  useEffect(() => {
    setImageError(false);
  }, [imageURL]);

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
      dispatch(setIsDrawerOpen(collapsedFromCookie === 'true'));
    } else {
      setIsCollapsed(externalIsCollapsed);
      dispatch(setIsDrawerOpen(externalIsCollapsed));
    }
    if (collapseOpenMenus !== null && collapseOpenMenus !== undefined) {
      setOpenMenus(collapseOpenMenus);
    }
  }, [externalIsCollapsed]);

  const routes = useMemo(() => getRoutes(
    t,
    isClal,
    accountFeatures,
    accountSettings,
    windowSize,
    isRTL,
    userRoles,
    isGlobal && IsPoland,
    AiAssistantRolloutEnabled
  ), [t, isClal, accountFeatures, accountSettings, windowSize, isRTL, userRoles, isGlobal, IsPoland, AiAssistantRolloutEnabled]);

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
    if (windowSize === 'xs' || windowSize === 'sm' || windowSize === 'md') {
      onToggle();
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      setCookie('SidebarCollapsed', String(newState), 365); // שמור לשנה
      onToggle(newState);
      dispatch(setIsDrawerOpen(newState));
      return;
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
      onToggle(false);

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

  const isMobile = windowSize === 'xs' || windowSize === 'sm' || windowSize === 'md';
  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const drawerOpen = isMobile ? isOpen : true;

  return (
    <Drawer
      variant={drawerVariant}
      open={drawerOpen}
      // @ts-ignore
      onClose={() => {
        // If the settings dropdown is open, the first "click outside" should only
        // close that dropdown — the sidebar itself only closes on the next one.
        if (isSettingsMenuOpen) {
          setIsSettingsMenuOpen(false);
          return;
        }
        onToggle();
      }}
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
          {imageURL !== '' && !imageError ? (
            <img
              src={imageURL}
              alt="Logo"
              className={classes.sidebarLogo}
              onError={() => setImageError(true)}
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

      {!isCollapsed && !isMobile && (
        <SettingsMenu classes={classes} />
      )}

      {currentPlan && currentPlan.Name && currentPlan.Name !== 'GRAND_FATHER' && (() => {
        const planTooltipContent = (
          <div className={classes.planTooltipCard}>
            <div className={classes.planTooltipLabel}>
              {t('billing.yourPlan')}
            </div>
            <div className={classes.planTooltipName}>
              {currentPlan.Name}
            </div>
            {currentPlan.TierSubscriptionStartDate && currentPlan.TierSubscriptionEndDate && (
              <>
                <div className={classes.planTooltipDivider} />
                <div className={classes.planTooltipDatesRow}>
                  <div className={classes.planTooltipDateCol}>
                    <span className={classes.planTooltipDateLabel}>{t("common.startDate")}</span>
                    <span className={classes.planTooltipDateValue}>
                      {moment(currentPlan.TierSubscriptionStartDate).format(DateFormats.DATE_ONLY)}
                    </span>
                  </div>
                  <div className={classes.planTooltipDateCol}>
                    <span className={classes.planTooltipDateLabel}>{t("common.endDate")}</span>
                    <span className={classes.planTooltipDateValue}>
                      {moment(currentPlan.TierSubscriptionEndDate).format(DateFormats.DATE_ONLY)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        );

        return (
          <>
            {/* Expanded sidebar — plan card with tooltip on hover */}
            {!isCollapsed && (
              <SidebarTooltip title={planTooltipContent} placement={isRTL ? 'left' : 'right'}>
                <div className={classes.sidebarPlanSection}>
                  <div className={classes.sidebarPlanCardHeader}>
                    <div className={classes.sidebarPlanTitle}>
                      {t('billing.yourPlan')}
                    </div>
                  </div>
                  <div className={classes.sidebarPlanNameRow}>
                    <div className={classes.sidebarPlanName}>
                      {currentPlan.Name}
                    </div>
                    {currentPlan.Name !== 'Scale' && (
                      <Button
                        className={classes.sidebarUpgradeBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTierPlans(true);
                        }}
                      >
                        {t('billing.upgradePlan')}
                      </Button>
                    )}
                  </div>
                </div>
              </SidebarTooltip>
            )}

            {/* Collapsed sidebar — just the zap icon with tooltip */}
            {isCollapsed && !isMobile && (
              <div className={classes.sidebarPlanCollapsedIcon}>
                <SidebarTooltip title={planTooltipContent} placement={isRTL ? 'left' : 'right'}>
                  <ZapIcon size={20} />
                </SidebarTooltip>
              </div>
            )}
          </>
        );
      })()}

      {/* Content */}
      <div className={classes.sidebarContent}>
        {!isCollapsed && isMobile && (
          <SettingsMenu classes={classes} />
        )}
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




      {showTierPlans && (
        <TierPlans
          classes={classes}
          isOpen={showTierPlans}
          onClose={() => setShowTierPlans(false)}
        />
      )}

    </Drawer>
  );
};