import React,{useState,useRef,useEffect} from 'react';
import {
  AppBar,Toolbar,Typography,Button,IconButton,MenuItem,ClickAwayListener,
  Grow,Paper,Popper,MenuList,SvgIcon,Grid,Box,Select,NativeSelect
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
import {setCookie,getCookie} from '../../helpers/cookies'
import {setScriptDialog} from '../../redux/reducers/notificationSlice';
import {logout} from '../../helpers/api'
import {openInNewTab} from '../../helpers/functions'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
const AppBarItem=({
  item,
  onMainClick=() => {},
  onInnerClick=() => {},
  chosen=false,
  textStyle='',
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
      zIndex='tooltip'
      onMouseOver={handleOpen}
      onMouseLeave={handleClose}
      className={clsx(classes.appBarItemContainer)}>
      <Box
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
            {[classes.chosenText]: chosen})}>
          {showIcon? item.iconUnicode:item.title}
        </IconButton>

        {(chosen||open)&&<ArrowDropUp className={classes.appBarItemArrow} />}
      </Box>
      <Popper open={open} anchorEl={buttonRef.current} role={undefined} transition placement={'bottom-start'} disablePortal>
        {({TransitionProps}) => (
          <Grow
            {...TransitionProps}>
            <Paper
              className={classes.appBarItemPaper}
              style={{width: menuWidth}}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  style={{padding: 0}}>
                  {item.options&&item.options.map((option,index) => (
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

const LanguageSelector=({windowSize,classes}) => {
  const cookieData=getCookie('Culture');
  const language=!!cookieData? cookieData:'he-IL';
  const dispatch=useDispatch();
  //dispatch(setLanguage(language.split('-')[0]));
  const languages=[
    {
      title: "עברית",
      mobileTitle: 'עב',
      value: 'he-IL'
    },
    {
      title: 'English',
      mobileTitle: 'EN',
      value: 'en-US'
    }
  ]

  const item={
    title: languages.find(lang => lang.value===language).title,
    options: languages
  }

  const changeLanguage=option => {
    const {value}=option
    setCookie('Culture',value);
    dispatch(setLanguage(value.split('-')[0]));
  }

  // if(windowSize==='xs') {
  //   return (
  //     <NativeSelect
  //       classes={{root: clsx(classes.languageSelect),icon: classes.white}}
  //       className={classes.textCapitalize}
  //       value={language}
  //       onChange={e => changeLanguage({value: e.target.value})}
  //       IconComponent={props => (
  //         <ExpandMoreIcon {...props} />)
  //       }

  //     >
  //       {languages.map((lang,index) => (
  //         <option
  //           key={`lang${index}`}
  //           value={lang.value}
  //           className={clsx(classes.textCapitalize,classes.black)}>
  //           {lang.title}
  //         </option>
  //       ))}
  //     </NativeSelect>
  //   );
  // }
  return (
    <AppBarItem
      isMobile={windowSize==='xs'}
      textStyle={windowSize==='xs'&&classes.textCapitalize}
      classes={classes}
      item={item}
      onInnerClick={changeLanguage} />
  )
}


export const TopAppBar=({classes,currentPage=''}) => {
  const {companyName,windowSize,isRTL}=useSelector(state => state.core)
  const phoneMenuButtonRef=useRef(null)
  const [open,setOpen]=useState(false)
  const [windowWidth,setWindowWidth]=useState(window.innerWidth)
  //const history=useCtrlHistory()
  const dispatch=useDispatch();

  const handleScriptDialog=() => {
    let scriptDialog=getCookie('scriptDialog');
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
      setCookie('scriptDialog',false,{maxAge: 36000000000});
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
      {windowSize==='xl'&&<>
        <Box className={classes.appBerSpace} />
        <Typography
          className={classes.appBarUsername}>
          {companyName}
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
          item={{title: question}}
          onMainClick={() => {
            openInNewTab('/Pages/Home.aspx?action=support&fromreact=true')
          }}
          textStyle={classes.appBarQuestionIcon}
        />
      </Box>
    </>
  )

  const renderPhoneAppBar=() => {
    const reportsOptions=routes.find(r => r.key==='reports').options
    const smallRoutes=[
        routes[0],
        routes[2],
        routes[3],
        routes[4],
        routes[5],
        {title: t('appBar.reports.newsletterReports'),iconUnicode: '\ue049',href: reportsOptions[1].href},
        {title: t('appBar.reports.smsReports'),iconUnicode: '\ue04c',href: reportsOptions[2].href},
        routes[6],
        routes[7],
        //routes[1]
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
        {/* <LanguageSelector windowSize={windowSize} classes={classes} /> */}
        <Popper
          open={open}
          anchorEl={phoneMenuButtonRef.current}
          role={undefined}
          style={{zIndex: '1'}}
          transition
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
                      {smallRoutes.map((route,i) => (
                        <Grid
                        key={`appBarItem${i}`}
                        item
                        xs={4}>
                        <Box
                          className={classes.phoneAppBarItemContainer}>
                          <Button
                            href={route.href}
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
          <Box
            component='a'
            href={routes[0].href}>
            <Box
              component='img'
              src={Logo}
              alt='Logo'
              className={classes.appBarLogo} />
          </Box>
          {renderAppBar()}
          <AppBarItem
            classes={classes}
            item={{title: t('appBar.logout')}}
            onMainClick={logout}
          />
        </Toolbar>
      </AppBar>
      <Box className={classes.appBarBorder} />
    </Box>
  )
}