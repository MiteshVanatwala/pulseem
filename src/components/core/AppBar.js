import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, MenuItem, ClickAwayListener,
  Grow, Paper, Popper, MenuList, Grid, Box
} from '@material-ui/core';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../../redux/reducers/coreSlice'
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes } from 'react-icons/fa';
import { getRoutes, getSettingsItem } from '../../helpers/Routes/routes'
import { setCookie, getCookie } from '../../helpers/Functions/cookies'
// import { setScriptDialog } from '../../redux/reducers/notificationSlice';
import {
  ChartIcon
} from '../../assets/images/drawer/index'
import i18n from '../../i18n'
import NotificationBell from '../NotificationBell/NotificationBell.tsx';
import useRedirect from '../../helpers/Routes/Redirect';
import { IoIosArrowDown } from 'react-icons/io';
import { BsGlobe2 } from 'react-icons/bs';
import { sitePrefix } from '../../config';
import PulseemNewLogo from '../../assets/images/PulseemNewLogo';
import { get } from 'lodash';

const AppBarItem = ({
  item,
  chosen = false,
  textStyle = '',
  showIcon = false,
  classes,
  menuWidth = 290,
  onMainClick = () => null,
  onInnerClick = () => null,
}) => {
  const { t } = useTranslation();
  const Redirect = useRedirect();
  const [open, setOpen] = useState(false)

  // const [buttonWidth, setButtonWidth] = useState(0)
  const buttonRef = useRef(null)

  // useEffect(() => {
  //   setButtonWidth(buttonRef.current.clientWidth)
  // }, [])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const currentStyle = showIcon ? classes.appBarItemIcon : classes.appBarItemText;
  const appBarItemFontSize = window.screen.availWidth < 1500 ? classes.f14 : classes.f16;
  {/* Top menu */ }
  return (
    <Box
      zIndex='tooltip'
      onMouseOver={handleOpen}
      onMouseLeave={handleClose}
      className={clsx(classes.appBarItemContainer)}>
      <Box
        style={{ whiteSpace: 'nowrap' }}
        component='a'
        href={item.href}
        className={classes.appBarHrefContainer}
        onClick={(e) => {
          e.preventDefault();
          if (onMainClick) {
            onMainClick();
          }
          else {
            handleOpen()
            Redirect({ url: item.href })
          }
        }}>
        <IconButton
          ref={buttonRef}
          className={clsx(
            currentStyle,
            appBarItemFontSize,
            textStyle,
            chosen ? 'chosenText' : ''
          )}>
          {showIcon ? (item.iconUnicode || item.icon) : (item && item.title) ?? ''}
        </IconButton>
        {item?.options?.length > 0 && <IoIosArrowDown className={clsx(classes.appBarItemArrow, 'downArraow')} />}
      </Box>
      {/* Submenu */}
      {item?.options?.length > 0 &&
        <Popper open={open} anchorEl={buttonRef.current} role={undefined} transition placement={'bottom-start'} disablePortal>
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}>
              <Paper
                className={classes.appBarItemPaper}
                style={{ width: menuWidth }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    style={{ padding: 0 }}>
                    {item.options && item.options.filter((item) => item.isShow !== false).map((option, index, row) => (
                      <Box
                        key={index}
                        component='a'
                        href={option.href}
                        className={classes.appBarItemMenuItem}>
                        {/* {index !== 0 && option.title !== t("appBar.logout") && <Box className={classes.appBarItemBorder} />} */}
                        <MenuItem
                          key={option.title}
                          onClick={(e) => {
                            e.preventDefault();
                            if (option.title === t("appBar.logout")) {
                              option.onClick();
                            }

                            if (!option.href || option.href === '') {
                              onInnerClick(option)
                            }
                            else Redirect({ url: option.href })
                          }}
                          classes={{ root: classes.appBarItemMenuRoot }}
                          className={clsx(classes.appBarItemMenuItem, index !== row.length - 1 ? classes.appBarItemBorder : '', option.title === t("appBar.logout") ? 'active' : '')}
                        >
                          {option.title}
                          {
                            option.title === t("appBar.logout") && <option.iconSrc style={{ padding: '0 5px', marginInlineStart: 'auto', color: '#fff' }} />
                          }
                        </MenuItem>
                      </Box>
                    ))}
                  </MenuList>

                </ClickAwayListener>
                <div className={classes.appBarItemPaperBottom}></div>
              </Paper>
            </Grow>
          )}
        </Popper>
      }
    </Box>
  )
}

const returnToMainAccount = () => {
  window.location = '/Pulseem/ReactRedirect.aspx?fromreact=true';
}
const LanguageSelector = ({ windowSize, classes }) => {
  const cookieData = getCookie('Culture');
  const language = !!cookieData ? cookieData : 'he-IL';
  const dispatch = useDispatch();
  const languages = [
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
    }
  ]

  const item = {
    title: <Box className={clsx(classes.flex, classes.justifyEvenly)} ><BsGlobe2 style={{ marginInline: 6 }} /> <p>{(languages && languages.find(lang => lang.value.toLocaleLowerCase() === language.toLocaleLowerCase()).title) ?? ''}</p></Box>,
    options: languages
  }

  const changeLanguage = option => {
    const { value } = option
    const langSelected = value.split('-')[0];

    setCookie('Culture', value);
    i18n.changeLanguage(langSelected);
    dispatch(setLanguage(langSelected));
  }

  return (
    <AppBarItem
      isMobile={windowSize === 'xs'}
      textStyle={windowSize === 'xs' && classes.textCapitalize}
      classes={classes}
      item={item}
      menuWidth={230}
      onInnerClick={changeLanguage} />
  )
}


export const TopAppBar = ({ classes, currentPage = '', showAppBar = true }) => {
  const Redirect = useRedirect();

  const { companyName, windowSize, isRTL, imageURL, cameFromSubAccount, isAdmin, isAllowSwitchAccount, isClal } = useSelector(state => state.core) // smsOldVersion
  const { accountSettings, accountFeatures, subAccount } = useSelector(state => state.common);
  const phoneMenuButtonRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const topNavRef = useRef(null)

  useEffect(() => {
    if (accountSettings && accountSettings !== '') {
      setSettingsLoaded(true);
    }
  }, [accountSettings])

  const handleOpen = () => {
    setOpen(!open)
  }
  const { t } = useTranslation();
  const { username } = useSelector(state => state.user)
  const routes = getRoutes(t, isClal, accountFeatures, accountSettings?.SubAccountSettings, windowSize, isRTL) // smsOldVersion
  const settings = getSettingsItem(t, classes.appBarSettingIcon,
    (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')), username, isRTL, accountSettings, accountFeatures, get(subAccount, 'CompanyAdmin', false))

  const returnToAdmin = () => {
    window.location = '/Pulseem/ReactRedirect.aspx';
  }

  const renderRegularAppBar = () => (
    <>
      {routes.map(route => (
        route.isShow &&
        <AppBarItem
          key={route.key}
          classes={classes}
          item={route}
          chosen={route.key === currentPage}
          showIcon={windowSize === 'sm' || windowSize === 'md' || route.key === 'homepage'}
          onInnerClick={() => Redirect({ url: route.href })}
          onMainClick={null}
        />
      ))}
      <Box className={classes.appBarAfterTollbarContainer}>
        <Box className='settingsContainer'>
          <span className='settingsBorder'></span>
          <AppBarItem
            classes={classes}
            item={settings}
          />
          <span className='settingsBorder'></span>
        </Box>
        <Box>
          <NotificationBell classes={classes} />
        </Box>
        <Box style={{ zIndex: 1300 }}>
          <LanguageSelector classes={classes} />
        </Box>
        {!cameFromSubAccount && isAdmin !== '' && <AppBarItem
          classes={classes}
          item={{ title: t('appBar.admin') }}
          onMainClick={() => {
            returnToAdmin();
          }}
        />}
        {cameFromSubAccount && <AppBarItem
          classes={classes}
          item={{ title: t('appBar.returnToMainAccount') }}
          onMainClick={() => {
            returnToMainAccount()
          }}
        />}
      </Box>
    </>
  )

  const renderPhoneAppBar = () => {
    const reportsOptions = routes.find(r => r.key === 'reports').options
    const smallRoutes = [
      routes[0],
      routes[1],
      routes[2],
      routes[3],
      routes[4],
      routes[5],
      { title: t('appBar.reports.newsletterReports'), iconUnicode: '\ue049', href: reportsOptions[1].href, isShow: true },
      { title: t('appBar.reports.smsReports'), iconUnicode: '\ue04c', href: reportsOptions[2].href, isShow: true },
      { title: t('report.DirectSendReport'), key: 'directSendReport', href: `${sitePrefix}Reports/DirectSendReport`, isShow: accountSettings?.SubAccountSettings && accountSettings?.SubAccountSettings?.IsDirectAccount === true }      //routes[1]
    ]
    return (
      <>
        <Box
          ref={phoneMenuButtonRef}
          className={classes.phoneAppBarContainer}
        >
          <IconButton
            className={classes.phoneAppBarButton}
            onClick={handleOpen}>
            {!open ? <FaBars /> : <FaTimes />}
          </IconButton>
        </Box>
        <Popper
          open={open}
          anchorEl={topNavRef.current}
          role={undefined}
          className={classes.phoneAppBarPaperContainer}
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}>
              <Paper
                // style={{ width: windowWidth - 40 }}
                className={classes.phoneAppBarPaper}>
                <ClickAwayListener
                  onClickAway={handleOpen}>
                  <Box
                    className={classes.phoneAppBarPopupContainer}>
                    <Box
                      className={classes.phoneAppBarCloseContainer}
                      onClick={handleOpen}>
                      <FaTimes
                        color='white'
                        className={classes.phoneAppBarCloseIcon}
                      />
                    </Box>
                    <Grid
                      container
                      spacing={1}
                      direction={isRTL ? 'row-reverse' : 'row'} >
                      {smallRoutes.map((route, i) => (
                        route.isShow &&
                        <Grid
                          key={`appBarItem${i}`}
                          item
                          xs={4}>
                          <Box
                            className={classes.phoneAppBarItemContainer}>
                            <Button
                              href={route.href}
                              onClick={(e) => {
                                e.preventDefault();
                                Redirect({ url: route.href })
                              }}
                              style={{ alignSelf: 'center', fontSize: route.key === 'directSendReport' ? 35 : null }}>
                              {route?.iconUnicode || route?.icon ? (<Typography
                                className={classes.phoneAppBarItemIcon}>
                                {route?.iconUnicode || route?.icon}
                              </Typography>)
                                : route.key === 'directSendReport' ? (<img
                                  style={{ paddingBottom: 5 }}
                                  alt='DirectSend Icon'
                                  src={ChartIcon} />) : null
                              }
                            </Button>
                            <Typography
                              style={{ textAlign: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
                              {route.title}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    )
  }

  const renderAppBar = windowSize === 'xs' || windowSize === 'sm' ? renderPhoneAppBar : renderRegularAppBar

  return (
    <Box style={{ flexGrow: 1 }} className={clsx(classes.pl25, classes.ps25)}>
      <AppBar position='static' className={classes.appBar} ref={topNavRef} style={{ display: showAppBar === true ? null : 'none' }}>
        <Toolbar variant='dense' className={clsx(classes.justifyBetween, classes.h100)}>
          <Button
            // style={{ padding: 0, matgin: 0 }}
            href={routes[0].href}
            onClick={(e) => {
              e.preventDefault();
              Redirect({ url: routes[0].href })
            }}
            // className={clsx(classes.pulseemAppBarLogo, isRTL ? 'logoRTL' : 'logoLTR')}
            className={clsx(classes.pulseemAppBarLogo, 'logo')}
          >
            {imageURL !== '' ? (<Box
              component='img'
              src={`${imageURL}`}
              alt='Logo'
              className={classes.appBarLogo} />)
              :
              (<PulseemNewLogo />)}
          </Button>
          {settingsLoaded && <>
            {renderAppBar()}
          </>
          }
        </Toolbar>
      </AppBar>
      <Box className={classes.appBarBorder} />
    </Box>
  )
}