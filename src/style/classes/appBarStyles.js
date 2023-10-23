const appBarTitleTextSize = { xs: 13, sm: 14, md: 10, lg: 16, xl: 14 }

export const appBarStyle = (windowSize, isRTL, theme) => ({
  appBarItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    zIndex: 1300,
    height: '100%',
    '& .chosenText, .chosenText~.downArraow': {
      fontWeight: 'bold',
      color: '#FF0054'
    },
    '&:hover': {
      '& .MuiIconButton-root, svg': {
        fontWeight: 'bold',
        color: '#FF0054'
      }
    }
  },
  appBarHrefContainer: {
    display: 'flex',
    flex: 1,
    textDecoration: 'none',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '100%'
  },
  appBarItemText: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'OpenSansHebrew',
    color: '#000',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    height: '100%',
    fontSize: appBarTitleTextSize[windowSize],
    borderRadius: 0,
    flex: 1,
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  appBarItemIcon: {
    color: '#000',
    textTransform: 'none',
    fontSize: 26,
    borderRadius: 0,
    fontFamily: 'pulseemicons',
    '& svg': {
      color: '#000'
    },
    '&:hover': {
      '& svg': {
        color: '#FF0054'
      }
    },
    '& .header-whatsapp-icon': {
      width: '24px',
      height: '24px',
      marginBottom: '4px',
    },
  },
  appBarItemBorder: {
    borderBottom: '1px solid #707070',
    // marginInline: 15
  },
  appBarItemDoubleArrowIcon: {
    marginInlineEnd: '0.5em',
    transform: isRTL ? 'rotate(0deg)' : 'rotateY(180deg)'
  },
  appBarItemArrow: {
    color: 'black',
    alignSelf: 'center',
    fontSize: 21,
    marginTop: 4,
    marginLeft: -6
  },
  appBarItemPaper: {
    borderRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  appBarItemPaperBottom: {
    height: 6.09,
    width: '100%',
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100
  },
  appBarItemMenuItem: {
    fontSize: 14,
    fontFamily: 'OpenSansHebrew-Bold',
    alignSelf: 'center',
    textDecoration: 'none',
    color: '#000',
    '& svg': {
      fontSize: 17,
      color: '#555555',
      paddingRight: isRTL ? '0px !important' : '10px !important',
      paddingLeft: isRTL ? '10px !important' : '0px !important',
    },
    '&.active': {
      background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
      color: '#fff',
      '& svg': {
        color: '#fff',
      },
    },
    '&:hover': {
      background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
      color: '#fff',
      // border: 'none',
      '& svg': {
        color: '#fff',
      },
    }
  },
  appBarItemMenuRoot: {
    '&:hover': {
      backgroundColor: '#e3e9f0'
    }
  },
  pulseemAppBarLogo: {
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    borderRadius: 0,
    height: '100%',
    '&.logo': {
      padding: isRTL ? '15px 15px 15px 0px' : '15px 0px 15px 15px',
      marginLeft: isRTL ? 0 : '-24px',
      marginRight: isRTL ? '-24px' : 0,
      borderBottomLeftRadius: isRTL ? 0 : 40,
      borderBottomRightRadius: isRTL ? 40 : 0,
      '& svg': {
        padding: '0 28px'
      }
    }
  },
  appBar: {
    maxWidth: 'calc(100vw - 56px)',
    backgroundColor: '#fff',
    zIndex: 50000000,
    boxShadow: '0px 1px 10px 4a4a4aab',
    height: 62.78,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  },
  appBarLogo: {
    marginInlineEnd: '1vw',
    width: windowSize === 'xs' ? 125 : 130,
    alignSelf: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  appBerSpace: {
    display: 'flex',
    flex: 1
  },
  appBarUsername: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    fontSize: 16,
    fontFamily: 'OpenSansHebrew-Bold'
  },
  appBarAfterTollbarContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    '& .settingsContainer': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      '& .MuiButtonBase-root': {
        fontWeight: 600
      },
      '& .settingsBorder': {
        background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
        width: 1.5,
        height: 24
      },
      '& svg': {
        color: '#FF0076'
      }
    },
    '&>div': {
      '&:nth-child(1)': {
        '&>div': {
          padding: '0 10px'
        }
      },
    }
  },
  appBarSettingIcon: {
    width: 21
  },
  appBarQuestionIcon: {
    fontWeight: 'bold',
    fontSize: 27,
    textTransform: 'none'

  },
  appBarBorder: {
    backgroundColor: 'none',
    height: 0
  },
  phoneAppBarPaperContainer: {
    zIndex: 99999,
    boxSizing: 'border-box',
    top: 3,
    width: '100%',
    left: -7,
    padding: '0 75px',
    "@media screen and (max-width: 540px)": {
      padding: 0
    }
  },
  phoneAppBarContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    maxWidth: '100%'
  },
  phoneAppBarButton: {
    color: '#000',
    textTransform: 'none',
    fontSize: 28,
    borderRadius: 0,
    "&:hover": {
      color: "#ff3343"
    }
  },
  phoneAppBarPaper: {
    padding: 20,
    borderRadius: 0,
    marginTop: 3
  },
  phoneAppBarPopupContainer: {
    padding: 20,
    border: '2px solid #ff3343',
    borderRadius: 5,
    alignSelf: 'center'
  },
  phoneAppBarCloseContainer: {
    backgroundColor: '#ff3343',
    justifyContent: 'center',
    position: 'absolute',
    borderRadius: 50,
    display: 'flex',
    height: 20,
    width: 20,
    left: 86,
    top: 15,
    "@media screen and (max-width: 540px)": {
      left: 12
    }
  },
  phoneAppBarCloseIcon: {
    fontSize: 13,
    alignSelf: 'center'
  },
  phoneAppBarItemContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  phoneAppBarItemIcon: {
    fontFamily: 'pulseemicons',
    textAlign: 'center',
    fontSize: 23,
    '& .header-whatsapp-icon': {
      width: '24px',
      height: '24px',
      fill: 'black',
    },
  },
  mobileLanguageBtn: {
    fontSize: appBarTitleTextSize[windowSize],
    color: 'white'
  }
})