import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer, Box, IconButton, Typography, Button, MenuItem,
  ClickAwayListener, Grow, Paper, Popper, MenuList, Divider,
  Collapse, List, ListItem, ListItemIcon, ListItemText, Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../../redux/reducers/coreSlice';
import { useTranslation } from "react-i18next";
import {
  FaBars, FaTimes, FaChevronLeft, FaChevronRight,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { getRoutes, getSettingsItem } from '../../helpers/Routes/routes';
import { setCookie, getCookie } from '../../helpers/Functions/cookies';
import { ChartIcon } from '../../assets/images/drawer/index';
import i18n from '../../i18n';
import NotificationBell from '../NotificationBell/NotificationBell';
import useRedirect from '../../helpers/Routes/Redirect';
import { IoIosArrowDown } from 'react-icons/io';
import { BsGlobe2 } from 'react-icons/bs';
import { sitePrefix } from '../../config';
import PulseemNewLogo from '../../assets/images/PulseemNewLogo';
import { get } from 'lodash';
import { RedirectPropTypes } from '../../helpers/Types/Redirect';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 70;

// Types
interface Language {
  title: string;
  mobileTitle: string;
  value: string;
  isShow: boolean;
}

interface SidebarProps {
  classes: any;
  currentPage?: string;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}

interface SidebarItemProps {
  item: any;
  isCollapsed: boolean;
  isActive?: boolean;
  level?: number;
  classes: any;
  onItemClick?: () => void;
  showSubmenu?: boolean;
  toggleSubmenu?: () => void;
}

const useStyles = makeStyles((theme) => ({
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  sidebarCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  sidebarPaper: {
    width: SIDEBAR_WIDTH,
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#ffffff',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  sidebarPaperCollapsed: {
    width: SIDEBAR_COLLAPSED_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    minHeight: 64,
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sidebarLogo: {
    maxHeight: 40,
    maxWidth: 150,
  },
  toggleButton: {
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  sidebarContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarNav: {
    flex: 1,
    padding: theme.spacing(1, 0),
  },
  sidebarItem: {
    margin: theme.spacing(0.5, 1),
    borderRadius: 8,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemText-primary': {
        fontWeight: 600,
      },
    },
  },
  sidebarItemIcon: {
    color: '#ffffff',
    minWidth: 40,
    justifyContent: 'center',
  },
  sidebarItemText: {
    '& .MuiListItemText-primary': {
      fontSize: '0.9rem',
      fontWeight: 500,
    },
  },
  sidebarSubmenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& .MuiListItem-root': {
      paddingLeft: theme.spacing(4),
    },
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: theme.spacing(1),
  },
  languageSelector: {
    margin: theme.spacing(0.5),
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  userSection: {
    padding: theme.spacing(1),
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: theme.spacing(1),
  },
  tooltip: {
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '0.8rem',
  },
  // Mobile styles
  mobileOverlay: {
    [theme.breakpoints.down('sm')]: {
      '& .MuiDrawer-paper': {
        width: '100%',
        maxWidth: 320,
      },
    },
  }
}));

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isCollapsed,
  isActive = false,
  level = 0,
  classes,
  onItemClick,
  showSubmenu = false,
  toggleSubmenu
}) => {
  const { t } = useTranslation();
  const Redirect = useRedirect();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.options && item.options.length > 0) {
      toggleSubmenu && toggleSubmenu();
    } else {
      if (onItemClick) {
        onItemClick();
      }
      else {
        if (item.href) {
          Redirect({ url: item.href } as RedirectPropTypes);
        }
        if (item.onClick) {
          item.onClick();
        }
      }
    }
  };

  const hasSubmenu = item.options && item.options.length > 0;

  const itemContent = (
    <ListItem
      button
      onClick={handleClick}
      className={clsx(classes.sidebarItem, isActive && 'active')}
      style={{ paddingLeft: level > 0 ? 32 + (level * 16) : 16 }}
    >
      <ListItemIcon className={classes.sidebarItemIcon}>
        {item.iconUnicode || item.icon || '●'}
      </ListItemIcon>
      {!isCollapsed && (
        <>
          <ListItemText
            primary={item.title}
            className={classes.sidebarItemText}
          />
          {hasSubmenu && (
            <IconButton size="small" style={{ color: '#ffffff' }}>
              {showSubmenu ? <FaChevronUp /> : <FaChevronDown />}
            </IconButton>
          )}
        </>
      )}
    </ListItem>
  );

  return (
    <>
      {isCollapsed && typeof item.title === 'string' ? (
        <Tooltip
          title={item.title}
          placement="right"
          classes={{ tooltip: classes.tooltip }}
        >
          {itemContent}
        </Tooltip>
      ) : (
        itemContent
      )}

      {hasSubmenu && !isCollapsed && (
        <Collapse in={showSubmenu} timeout="auto" unmountOnExit>
          <List className={classes.sidebarSubmenu}>
            {item.options && item.options.filter((option: any) => option.isShow !== false).map((option: any, index: number) => (
              <SidebarItem
                key={`${item.key || 'item'}-${index}`}
                item={option}
                isCollapsed={false}
                level={level + 1}
                classes={classes}
                onItemClick={() => {
                  if (option.href) {
                    Redirect({ url: option.href, openNewTab: option.openInNewWindow } as RedirectPropTypes);
                  } else if (option.onClick) {
                    option.onClick();
                  }
                }}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const LanguageSelector: React.FC<{ isCollapsed: boolean; classes: any }> = ({ isCollapsed, classes }) => {
  const cookieData = getCookie('Culture');
  const { IsPoland } = useSelector((state: any) => state.common);
  let language = !!cookieData
    ? cookieData
    : (IsPoland ? 'en-US' : 'he-IL');
  if (language === 'he-IL' && IsPoland) language = 'pl-PL';

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const languages: Language[] = [
    {
      title: "עברית",
      mobileTitle: 'עב',
      value: 'he-IL',
      isShow: true
    },
    {
      title: 'English',
      mobileTitle: 'EN',
      value: 'en-US',
      isShow: true
    },
    {
      title: 'Polski',
      mobileTitle: 'PL',
      value: 'pl-PL',
      isShow: true
    }
  ];

  if (IsPoland) {
    languages.shift();
  }

  const currentLanguage = languages.find(lang =>
    lang.value.toLowerCase() === language.toLowerCase()
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (option: Language) => {
    const { value } = option;
    const langSelected = value.split('-')[0];

    setCookie('Culture', value);
    i18n.changeLanguage(langSelected);
    dispatch(setLanguage(langSelected));
    handleClose();
  };

  const buttonContent = (
    <Button
      onClick={handleClick}
      className={classes.languageSelector}
      startIcon={<BsGlobe2 />}
      endIcon={!isCollapsed ? <IoIosArrowDown /> : null}
      fullWidth={!isCollapsed}
    >
      {!isCollapsed && (currentLanguage?.title || '')}
    </Button>
  );

  return (
    <>
      {isCollapsed ? (
        <Tooltip
          title={currentLanguage?.title || ''}
          placement="right"
          classes={{ tooltip: classes.tooltip }}
        >
          {buttonContent}
        </Tooltip>
      ) : (
        buttonContent
      )}

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="right-start"
        disablePortal
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper className={classes.languageSelector}>
            <MenuList>
              {languages.map((lang) => (
                <MenuItem
                  key={lang.value}
                  onClick={() => changeLanguage(lang)}
                  selected={lang.value.toLowerCase() === language.toLowerCase()}
                >
                  {lang.title}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

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
  isCollapsed: externalIsCollapsed = false
}) => {
  const classes = useStyles();
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
    setIsCollapsed(externalIsCollapsed);
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

  const toggleSidebar = () => {
    if (windowSize === 'xs' || windowSize === 'sm') {
      onToggle();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleSubmenu = (key: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
        classes.sidebar,
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
      {/* Header */}
      <div className={classes.sidebarHeader}>
        {!isCollapsed && <Button
          // href={routes[0]?.href}
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

          {/* Notifications */}
          <Box display="flex" justifyContent="center" mb={1}>
            <NotificationBell classes={externalClasses} />
          </Box>

          {/* Language Selector */}
          <LanguageSelector isCollapsed={isCollapsed && !isMobile} classes={classes} />

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