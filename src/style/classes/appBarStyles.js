const appBarTitleTextSize={xs: 20,sm: 17,md: 15,lg: 17,xl: 19}

export const appBarStyle=(windowSize,isRTL,theme) => ({
  appBarItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none'
  },
  appBarHrefContainer: {
    display: 'flex',
    flex: 1,
    textDecoration: 'none',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  appBarItemText: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'OpenSansHebrew',
    color: 'white',
    textTransform: 'none',
    whiteSpace: 'wrap',
    overflow: 'hidden',
    fontSize: appBarTitleTextSize[windowSize],
    borderRadius: 0,
    flex: 1
  },
  appBarItemIcon: {
    color: 'white',
    textTransform: 'none',
    fontSize: 26,
    borderRadius: 0,
    fontFamily: 'pulseemicons'
  },
  appBarItemBorder: {
    backgroundColor: 'black',
    height: 1
  },
  appBarItemDoubleArrowIcon: {
    marginInlineEnd: '0.5em',
    transform: isRTL? 'rotate(0deg)':'rotateY(180deg)'
  },
  appBarItemArrow: {
    position: 'absolute',
    color: 'black',
    alignSelf: 'center',
    bottom: -15,
    fontSize: 40
  },
  appBarItemPaper: {
    borderRadius: 0,
    //backgroundColor: '#F5F5F5',
  },
  appBarItemMenuItem: {
    fontSize: 14,
    fontFamily: 'OpenSansHebrew-Bold',
    alignSelf: 'center',
    textDecoration: 'none',
    color: '#333'
  },
  appBarItemMenuRoot: {
    '&:hover': {
      backgroundColor: '#e3e9f0'
    }
  },
  appBar: {
    backgroundColor: '#0371ad',
    height: '45px',
    zIndex: 50000000
  },
  appBarLogo: {
    marginInlineEnd: '1vw',
    width: 143,
    alignSelf: 'center'
  },
  appBerSpace: {
    display: 'flex',
    flex: 2
  },
  appBarUsername: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-start',
    fontSize: 16,
    fontFamily: 'OpenSansHebrew-Bold'
  },
  appBarAfterTollbarContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'black',
    height: 2
  },
  phoneAppBarContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center'
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
  chosenText: {
    fontWeight: 'bold'
  }
})