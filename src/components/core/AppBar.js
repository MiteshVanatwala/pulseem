import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, MenuItem, ClickAwayListener,
  Grow, Paper, Popper, MenuList, SvgIcon, Grid, Box
} from '@material-ui/core';
import clsx from 'clsx';
import { ArrowDropUp } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../../redux/reducers/coreSlice'
import { useTranslation } from "react-i18next";
import DoubleArrowIcon from '../../assets/images/doubleArrow.png'
import { ReactComponent as QuestionIcon } from '../../assets/images/question.svg'
import { FaBars, FaTimes } from 'react-icons/fa';
import { getRoutes, getSettingsItem } from '../../helpers/routes'
//import useCtrlHistory from '../../helpers/useCtrlHistory'
import { setCookie, getCookie } from '../../helpers/cookies'
import { setScriptDialog } from '../../redux/reducers/notificationSlice';
import { logout } from '../../helpers/api'
import { openInNewTab } from '../../helpers/functions'
import {
  ChartIcon
} from '../../assets/images/drawer/index'
import i18n from '../../i18n'
import NotificationBell from '../NotificationBell/NotificationBell.tsx';

const AppBarItem = ({
  item,
  onMainClick = () => { },
  onInnerClick = () => { },
  chosen = false,
  textStyle = '',
  showIcon = false,
  classes,
  menuWidth = 290
}) => {
  const [open, setOpen] = useState(false)

  const [buttonWidth, setButtonWidth] = useState(0)
  const buttonRef = useRef(null)

  useEffect(() => {
    setButtonWidth(buttonRef.current.clientWidth)
  }, [])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const currentStyle = showIcon ? classes.appBarItemIcon : classes.appBarItemText
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
        onClick={() => {
          handleOpen()
          onMainClick(item)
        }}>
        <IconButton
          ref={buttonRef}
          className={clsx(
            currentStyle,
            textStyle,
            { [classes.chosenText]: chosen })}>
          {showIcon ? (item.iconUnicode || item.icon) : item && item.title || ''}
        </IconButton>

        {(chosen || open) && <ArrowDropUp className={classes.appBarItemArrow} />}
      </Box>
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
                  {item.options && item.options.map((option, index) => (
                    option.isShow &&
                    <Box
                      key={index}
                      component='a'
                      className={classes.appBarItemMenuItem}
                      href={option.href}>
                      {index !== 0 && <Box className={classes.appBarItemBorder} />}
                      <MenuItem
                        key={option.title}
                        onClick={() => onInnerClick(option)}
                        classes={{ root: classes.appBarItemMenuRoot }}
                        className={classes.appBarItemMenuItem}
                      >
                        {option.isFaIcon ?
                          <option.iconSrc style={{ padding: '0 5px' }} />
                          :
                          <img
                            src={option.iconSrc || DoubleArrowIcon}
                            alt='Double Arrow Icon'
                            className={classes.appBarItemDoubleArrowIcon} />
                        }
                        {option.title}
                      </MenuItem>
                    </Box>
                  ))}
                </MenuList>

              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
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
    title: (languages && languages.find(lang => lang.value.toLocaleLowerCase() === language.toLocaleLowerCase()).title) || '',
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
  let cookieFeature = getCookie("accountFeatures");
  const cookieIsClal = getCookie("isClal");

  if (cookieFeature && cookieFeature.constructor.name !== 'Array') {
    cookieFeature = null;
  }

  const { accountSettings, companyName, windowSize, isRTL, imageURL, cameFromSubAccount, isAdmin, isAllowSwitchAccount } = useSelector(state => state.core) // smsOldVersion
  const phoneMenuButtonRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const topNavRef = useRef(null)
  const dispatch = useDispatch();

  const handleScriptDialog = () => {
    let scriptDialog = getCookie('scriptDialog');
    scriptDialog = (scriptDialog === 'true');
    dispatch(setScriptDialog(scriptDialog));
  }

  useEffect(() => {
    handleScriptDialog();
    const resizeWindow = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', resizeWindow)

    return () => {
      window.removeEventListener('resize', resizeWindow)
    }
  }, [])

  useEffect(() => {
    if (accountSettings && accountSettings !== '') {
      setSettingsLoaded(true);
    }
  }, [accountSettings])

  const handleOpen = () => {
    setOpen(!open)
  }
  const { t } = useTranslation();
  const routes = getRoutes(t, cookieIsClal, cookieFeature, accountSettings?.SubAccountSettings, windowSize, isRTL) // smsOldVersion
  const settings = getSettingsItem(t, classes.appBarSettingIcon, (isAllowSwitchAccount && (isAllowSwitchAccount.toLowerCase() === 'true' || isAdmin !== '')))

  const navigate = ({ uri }) => {
    if (!!uri) {
      setCookie('scriptDialog', false, { maxAge: 36000000000 });
      dispatch(setScriptDialog(false));
      window.location.href = uri
    }
  }
  const returnToAdmin = () => {
    setCookie('accountSettings', '');
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
          onInnerClick={navigate}
        />
      ))}
      {windowSize === 'xl' || windowSize === 'lg' ? <>
        <Box className={classes.appBerSpace} />
        <Typography
          className={classes.appBarUsername}>
          {companyName}
        </Typography>
      </> : null}
      <Box className={classes.appBarAfterTollbarContainer}>
        <NotificationBell classes={classes} />
        <AppBarItem
          classes={classes}
          item={settings}
        />
        <LanguageSelector classes={classes} />
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
        <AppBarItem
          classes={classes}
          item={{ title: question }}
          onMainClick={() => {
            openInNewTab('/Pages/Home.aspx?action=support&fromreact=true')
          }}
          textStyle={classes.appBarQuestionIcon}
        />
      </Box>
    </>
  )

  const renderPhoneAppBar = () => {
    const reportsOptions = routes.find(r => r.key === 'reports').options
    const smallRoutes = [
      routes[0],
      routes[2],
      routes[3],
      routes[4],
      { title: t('mms.logPageHeaderResource1.Text'), iconUnicode: '\ue11b', href: '/react/MmsCampaigns', isShow: true },
      routes[6],
      // { title: t('master.Automations'), iconUnicode: '\ue087', href: '/react/Automations', isShow: accountSettings?.SubAccountSettings && accountSettings?.SubAccountSettings?.IsDirectAccount !== true },
      { title: t('appBar.reports.newsletterReports'), iconUnicode: '\ue049', href: reportsOptions[1].href, isShow: true },
      { title: t('appBar.reports.smsReports'), iconUnicode: '\ue04c', href: reportsOptions[2].href, isShow: true },
      { title: t('report.DirectSendReport'), key: 'directSendReport', href: '/react/Reports/DirectSendReport', isShow: accountSettings?.SubAccountSettings && accountSettings?.SubAccountSettings?.IsDirectAccount === true }      //routes[1]
      //{ title: t('report.DirectSendReport'), key: 'directSendReport', href: '/react/Reports/DirectSendReport', isShow: true }
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
            <FaBars />
          </IconButton>
        </Box>
        {/* <LanguageSelector windowSize={windowSize} classes={classes} /> */}
        <Popper
          open={open}
          anchorEl={topNavRef.current}
          role={undefined}
          style={{ zIndex: '1', boxSizing: 'border-box', }}
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}>
              <Paper
                style={{ width: windowWidth - 40 }}
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
                              style={{ alignSelf: 'center', fontSize: route.key === 'directSendReport' ? 35 : null }}>
                              {route.iconUnicode ? (<Typography
                                className={classes.phoneAppBarItemIcon}>
                                {route.iconUnicode}
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

  const question = <SvgIcon style={{ marginBottom: 5, marginInlineEnd: 5 }}>
    <QuestionIcon />
  </SvgIcon>
  return (
    <Box style={{ flexGrow: 1 }}>
      <AppBar position='static' className={classes.appBar} ref={topNavRef} style={{ display: showAppBar === true ? null : 'none' }}>
        <Toolbar variant='dense'>
          <Box
            component='a'
            href={routes[0].href}>
            <Box
              component='img'
              src={`${imageURL}`}
              alt='Logo'
              className={classes.appBarLogo} />
          </Box>
          {settingsLoaded && <>
            {renderAppBar()}
            <AppBarItem
              classes={classes}
              item={{ title: t('appBar.logout') }}
              onMainClick={logout}
            />
          </>
          }
        </Toolbar>
      </AppBar>
      <Box className={classes.appBarBorder} />
    </Box>
  )
}