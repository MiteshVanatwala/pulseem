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
//import {useHistory} from "react-router-dom";
import {history} from '../../helpers/history'

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
  const menuWidth=240

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
      component='div'
      zIndex='tooltip'
      onMouseOver={handleOpen}
      onMouseLeave={handleClose}
      className={classes.appBarItemContainer}>
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
                    <Box>
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
  const {language}=useSelector(state => state.core)
  const dispatch=useDispatch()
  const languages=[
    {
      title: "עברית",
      value: 'he'
    },
    {
      title: 'English',
      value: 'en'
    }
  ]

  const item={title: languages.find(lang => lang.value===language).title,options: languages}

  const changeLanguage=option => {
    dispatch(setLanguage(option.value))
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

  useEffect(() => {
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

  const navigate=({href}) => {
    history.push(href)
  }

  const renderRegularAppBar=() => (
    <>
      {routes.map(route => (
        <AppBarItem
          key={route.key}
          classes={classes}
          item={route}
          chosen={route.key===currentPage}
          showIcon={windowSize==='sm'}
          onMainClick={navigate}
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
          onMainClick={navigate}
          onInnerClick={navigate}
        />
        <LanguageSelector classes={classes} />
        <AppBarItem
          classes={classes}
          item={{title: question}}
          textStyle={classes.appBarQuestionIcon}
          onMainClick={() => navigate('/Support')}
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
                      {smallRoutes.map(routesRow => (
                        <Grid
                          container
                          xs={12} s
                          pacing={1}>
                          {routesRow.map(route => (
                            <Grid
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