import React,{useState,useRef,useEffect} from 'react';
import {
  AppBar,Toolbar,Typography,Button,IconButton,MenuItem,ClickAwayListener,
  Grow,Paper,Popper,MenuList,SvgIcon,Grid,Box
} from '@material-ui/core';
import clsx from 'clsx';
import {ArrowDropUp} from '@material-ui/icons';
import {useSelector,useDispatch} from 'react-redux';
import {setLanguage} from '../../redux/reducers/coreSlice'
import Logo from '../../assets/images/pulseemnewlogo.png'
import {useTranslation} from "react-i18next";
import DoubleArrowIcon from '../../assets/images/doubleArrow.png'
import {ReactComponent as QuestionIcon} from '../../assets/images/question.svg'
import {FaBars,FaTimes} from 'react-icons/fa';
import {getRoutes,getSettingsItem} from '../../helpers/routes'
//import useCtrlHistory from '../../helpers/useCtrlHistory'
import Cookies from 'universal-cookie'
import {setScriptDialog} from '../../redux/reducers/notificationSlice';

const AppBarItem=({
  item,
  onMainClick=() => {},
  onInnerClick=() => {},
  chosen=false,
  textStyle={},
  showIcon=false,
  classes,
}) => {
  const [open,setOpen]=useState(false)
  const [buttonWidth,setButtonWidth]=useState(0)
  const buttonRef=useRef(null)
  const menuWidth=290

  useEffect(() => {
    setButtonWidth(buttonRef.current.clientWidth)
  },[])

  const handleOpen=() => {
    setOpen(true)
  }

  const handleClose=() => {
    setOpen(false)
  }
  const currentStyle=showIcon? classes.appBarItemIcon:classes.appBarItemText

  return (
    <Box
      //component='a'
      //href={item.href}
      zIndex='tooltip'
      onMouseOver={handleOpen}
      onMouseLeave={handleClose}
      className={classes.appBarItemContainer}>
      <Box
        component='a'
        href={item.href}
        className={classes.appBarHrefContainer}>
        <IconButton
          ref={buttonRef}
          onClick={() => {
            handleOpen()
            onMainClick(item)
          }}
          className={clsx(
            currentStyle,
            textStyle,
            {[classes.chosenText]: chosen})}>
          {showIcon? item.iconUnicode:item.title}
        </IconButton>

      </Box>
      {(chosen||open)&&<ArrowDropUp className={classes.appBarItemArrow} />}
      <Popper open={open} anchorEl={buttonRef.current} role={undefined} transition disablePortal>
        {({TransitionProps}) => (
          <Grow
            {...TransitionProps}>
            <Paper
              className={classes.appBarItemPaper}
              style={{width: menuWidth,marginInlineStart: menuWidth-buttonWidth}}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  style={{padding: 0}}>
                  {item.options&&item.options.map((option,index) => (
                    //<a href={option.href}>
                    <Box
                      key={index}
                      component='a'
                      className={classes.appBarItemMenuItem}
                      href={option.href}>
                      {index!==0&&<Box className={classes.appBarItemBorder} />}
                      <MenuItem
                        key={option.title}
                        onClick={() => onInnerClick(option)}
                        classes={{root: classes.appBarItemMenuRoot}}
                        className={classes.appBarItemMenuItem}
                      >
                        <img
                          src={option.iconSrc||DoubleArrowIcon}
                          alt='Double Arrow Icon'
                          className={classes.appBarItemDoubleArrowIcon} />
                        {option.title}
                      </MenuItem>
                    </Box>
                    //</a>
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

const LanguageSelector=({classes}) => {
  const cookies=new Cookies()
  const cookieData=cookies.get('Culture');
  const language=!!cookieData? cookieData:'he-IL';
  const dispatch=useDispatch();
  //dispatch(setLanguage(language.split('-')[0]));
  const languages=[
    {
      title: "עברית",
      value: 'he-IL'
    },
    {
      title: 'English',
      value: 'en-US'
    }
  ]

  const item={
    title: languages.find(lang => lang.value===language).title,
    options: languages
  }

  const changeLanguage=option => {
    const {value}=option
    cookies.set('Culture',value);
    dispatch(setLanguage(value.split('-')[0]));
  }

  return (
    <AppBarItem
      classes={classes}
      item={item}
      onInnerClick={changeLanguage} />
  )
}


export const TopAppBar=({classes,currentPage=''}) => {
  const {username}=useSelector(state => state.user)
  const {windowSize}=useSelector(state => state.core)
  const phoneMenuButtonRef=useRef(null)
  const [open,setOpen]=useState(false)
  const [windowWidth,setWindowWidth]=useState(window.innerWidth)
  const cookies=new Cookies()
  //const history=useCtrlHistory()
  const dispatch=useDispatch();

  const handleScriptDialog=() => {
    let scriptDialog=cookies.get('scriptDialog');
    scriptDialog=(scriptDialog==='true');
    dispatch(setScriptDialog(scriptDialog));
  }

  useEffect(() => {
    handleScriptDialog();

    const resizeWindow=() => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize',resizeWindow)

    return () => {
      window.removeEventListener('resize',resizeWindow)
    }
  },[])

  const handleOpen=() => {
    setOpen(!open)
  }
  const {t}=useTranslation();
  const routes=getRoutes(t)
  const settings=getSettingsItem(t,classes.appBarSettingIcon)

  const navigate=({uri}) => {
    if(!!uri) {
      cookies.set('scriptDialog',false,{maxAge: 3600});
      dispatch(setScriptDialog(false));
      window.location.href=uri
    }
  }

  const renderRegularAppBar=() => (
    <>
      {routes.map(route => (
        <AppBarItem
          key={route.key}
          classes={classes}
          item={route}
          chosen={route.key===currentPage}
          showIcon={windowSize==='sm'||windowSize==='md'}
          onInnerClick={navigate}
        />
      ))}
      {windowSize==='lg'&&<>
        <Box className={classes.appBerSpace} />
        <Typography
          className={classes.appBarUsername}>
          {username}
        </Typography>
      </>}
      <Box className={classes.appBarAfterTollbarContainer}>
        <AppBarItem
          classes={classes}
          item={settings}
        />
        <LanguageSelector classes={classes} />
        <AppBarItem
          classes={classes}
          item={{title: question,href: '/Pages/Home.aspx?action=support'}}
          textStyle={classes.appBarQuestionIcon}
        />
      </Box>
    </>
  )

  const renderPhoneAppBar=() => {
    const smallRoutes=[
      [
        routes[0],
        routes[2],
        routes[3]
      ],
      [
        routes[5],
        {title: t('appBar.reports.newsletterReports'),iconUnicode: '\ue049'},
        {title: t('appBar.reports.smsReports'),iconUnicode: '\ue04c'}
      ]
    ]
    return (
      <>
        <Box
          ref={phoneMenuButtonRef}
          className={classes.phoneAppBarContainer}>
          <IconButton
            className={classes.phoneAppBarButton}
            onClick={handleOpen}>
            <FaBars />
          </IconButton>
        </Box>
        <Popper
          open={open}
          anchorEl={phoneMenuButtonRef.current}
          role={undefined}
          style={{zIndex: '1'}}
          transition
          disablePortal
        >
          {({TransitionProps}) => (
            <Grow
              {...TransitionProps}>
              <Paper
                style={{width: windowWidth-40}}
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
                      spacing={1} >
                      {smallRoutes.map((routesRow,i) => (
                        <Grid
                          key={i}
                          container
                          xs={12} s
                          pacing={1}>
                          {routesRow.map((route,j) => (
                            <Grid
                              key={j}
                              item
                              xs={4}>
                              <Box
                                className={classes.phoneAppBarItemContainer}>
                                <Button
                                  style={{alignSelf: 'center'}}>
                                  <Typography
                                    className={classes.phoneAppBarItemIcon}>
                                    {route.iconUnicode}
                                  </Typography>
                                </Button>
                                <Typography
                                  style={{textAlign: 'center'}}>
                                  {route.title}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
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

  const renderAppBar=windowSize==='xs'? renderPhoneAppBar:renderRegularAppBar

  const question=<SvgIcon style={{marginBottom: 5,marginInlineEnd: 5}}>
    <QuestionIcon />
  </SvgIcon>
  return (
    <Box style={{flexGrow: 1}}>
      <AppBar position='static' className={classes.appBar}>
        <Toolbar variant='dense'>
          <img
            src={Logo}
            alt='Logo'
            className={classes.appBarLogo} />
          {renderAppBar()}
          <AppBarItem
            classes={classes}
            item={{title: t('appBar.logout')}} />
        </Toolbar>
      </AppBar>
      <Box className={classes.appBarBorder} />
    </Box>
  )
}