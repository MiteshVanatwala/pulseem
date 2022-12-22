const appBarTitleTextSize = { xs: 18, sm: 17, md: 15, lg: 17, xl: 19 }

export const appBarStyle = (windowSize, isRTL, theme) => ({
  appBarItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    zIndex: 1300
  },
  appBarHrefContainer: {
    display: 'flex',
    flex: 1,
    textDecoration: 'none',
    justifyContent: 'center',
    cursor: 'pointer',
    '& .chosenText, .chosenText~.downArraow': {
      fontWeight: 'bold',
      color: '#FF0054'
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      '& .MuiIconButton-root, svg': {
        fontWeight: 'bold',
        color: '#FF0054'
      },
      '& .downArraow': {
        transform: 'rotate(180deg)'
      }
    }
  },
  appBarItemText: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'OpenSansHebrew',
    color: '#000',
    textTransform: 'none',
    whiteSpace: 'wrap',
    overflow: 'hidden',
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
    }
  },
  appBarItemBorder: {
    borderBottom: '1px solid #707070',
    marginInline: 15
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
    '&:hover': {
      background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
      color: '#fff',
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
    height: '100%',
    '&.logoRTL': {
      padding: '15px 15px 15px 0px',
      marginRight: '-24px',
      borderRadius: '0% 0% 25% 0% / 0% 0% 60% 0%'
    },
    '&.logoLTR': {
      padding: '15px 0px 15px 15px',
      marginLeft: '-24px',
      borderRadius: '0% 0% 0% 40% / 70% 0% 100% 100%',
    }
  },
  appBar: {
    backgroundColor: '#fff',
    height: '45px',
    zIndex: 50000000,
    boxShadow: '0px 1px 5px black',
    height: 62.78,
    borderRadius: '0% 0% 4% 4% / 70% 70% 100% 100% '
  },
  appBarLogo: {
    marginInlineEnd: '1vw',
    width: windowSize === 'xs' ? 125 : 143,
    alignSelf: 'center'
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
    '&>div': {
      '&:nth-child(1)': {
        borderInline: '1px solid #FF0054',
        padding: '0 10px'
      },
      '&:nth-child(2)': {
        paddingLeft: 20
      }
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
  phoneAppBarContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    maxWidth: '100%'
  },
  phoneAppBarButton: {
    color: 'white',
    textTransform: 'none',
    fontSize: 28,
    borderRadius: 0
  },
  phoneAppBarPaper: {
    padding: 20,
    borderRadius: 0,
    marginTop: 3
  },
  phoneAppBarPopupContainer: {
    padding: 20,
    border: '2px solid #0371ad',
    borderRadius: 5,
    alignSelf: 'center'
  },
  phoneAppBarCloseContainer: {
    backgroundColor: '#006996',
    justifyContent: 'center',
    position: 'absolute',
    borderRadius: 50,
    display: 'flex',
    height: 20,
    width: 20,
    left: 12,
    top: 15
  },
  phoneAppBarCloseIcon: {
    fontSize: 13,
    alignSelf: 'center'
  },
  phoneAppBarItemContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  phoneAppBarItemIcon: {
    fontFamily: 'pulseemicons',
    textAlign: 'center',
    fontSize: 23
  },
  mobileLanguageBtn: {
    fontSize: appBarTitleTextSize[windowSize],
    color: 'white'
  }
})