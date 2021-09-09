const dialogWidth = {
  xs: 200,
  sm: 350,
  md: 350,
  lg: 350
}

// const paperMinWidthSm = {
//   xs: 350,
//   sm: 500,
//   md: 500,
//   lg: 500,
//   xl: 500
// }
const minDialogWidth = {
  xs: 330,
  sm: 330,
  md: 500,
  lg: 500
}

const maxDialogWidth = {
  md: 1050,
  lg: 1050,
  xl: 1050
}

const summaryPadding = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 25,
  xl: 25
}

const iconWrapperMargin = {
  xs: '10px 5px 5px',
  sm: 10,
  md: 15,
  lg: 15,
  xl: 15
}
const iconWrapperMinWidth = {
  xs: 50,
  sm: 100,
  md: 100
}
// const summaryNotificationMinWidth = {
//   xs: "240px",
// }
const notificationTitleFontSize = {
  xs: 12,
  sm: 12,
  md: '1rem'
}

export const getGeneralStyle = (windowSize, isRTL, theme) => ({
  dialogContainer: {
    '& .MuiPaper-root': {
      overflowX: 'hidden'
    },
    '& .MuiDialog-paperWidthSm': {
      minWidth: minDialogWidth[windowSize],
      maxWidth: maxDialogWidth[windowSize]
    }
  },
  noPadding: {
    padding: '0px !important'
  },
  dialogIconContainer: {
    paddingTop: 60,
    paddingBottom: 15,
    textAlign: 'center',
    color: '#fff',
    borderRadius: 200,
    backgroundColor: '#0371ad',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: -50
  },
  dialogIconContainerRTL: {
    right: -50,
    paddingInlineEnd: 60,
    paddingInlineStart: 15,
  },
  dialogIconContainerLTR: {
    left: -50,
    paddingInlineEnd: 15,
    paddingInlineStart: 60,
  },
  dialogExitButton: {
    width: 25,
    height: 25,
    textAlign: 'center',
    color: '#fff',
    borderRadius: 25,
    fontWeight: '700',
    backgroundColor: '#0371ad',
    position: 'absolute',
    top: '0.5rem',
    cursor: 'pointer'
  },
  dialogExitButtonRTL: {
    left: '0.5rem',
  },
  dialogExitButtonLTR: {
    right: '0.5rem',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    border: '3px solid #0371ad',
    borderRadius: 5,
    margin: '1rem',
    padding: '1rem',
    minWidth: dialogWidth[windowSize],
    '& $notification': {
      '& $iconWrapper': {
        margin: iconWrapperMargin[windowSize],
        minWidth: iconWrapperMinWidth[windowSize]
      },
      '& b, & textarea': {
        fontSize: notificationTitleFontSize[windowSize]
      }
    },
    '& $dialogChildren': {
      maxHeight: windowSize === 'xs' || windowSize === 'sm' ? '100vh' : 'calc(65vh)'
    },
    '& $mobileBG': {
      '& $iconWrapper': {
        minWidth: windowSize === 'xs' ? 0 : 100
      }
    }
  },
  dialogButton: {
    fontFamily: 'OpenSansHebrew',
    color: '#fff',
    textTransform: 'capitalize',
    width: 120,
    fontSize: 18,
    borderRadius: 50
  },
  dialogConfirmButton: {
    backgroundImage: 'linear-gradient(to bottom, #5cb85c 0%, #449d44 100%)',
    backgroundRepeat: 'repeat-x',
    border: '1px solid #345233',
    borderTop: '0px solid #345233',
    boxShadow: '0px 3px 3px #345233',
    maxWidth: 150
  },
  dialogCancelButton: {
    background: 'rgba(212,137,33,1)',
    backgroundImage: 'linear-gradient(to bottom, #d9534f 0%, #c9302c 100%)',
    backgroundRepeat: 'repeat-x',
    border: '1px solid darkred',
    borderTop: '0px solid darkred',
    boxShadow: '0px 3px 3px darkred',
    maxWidth: 150
  },
  dialogButtonsContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center'
  },
  wizardFlex: {
    flex: 1,
    alignContent: 'flex-end',
    justifyContent: 'center'
  },
  dialogTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#0a74a9',
    marginInline: 25
  },
  dialogChildren: {
    // marginInline: 25,
    marginBlock: 10,
    paddingRight: summaryPadding[windowSize],
    paddingLeft: summaryPadding[windowSize],
    overflowY: 'auto'
  },
  copyClip: {
    border: '1px solid #3476b0',
    padding: 5,
    color: '#3476b0',
    fontWeight: 600,
    backgroundColor: '#bde5f8',
    opacity: 1,
    zIndex: 10
  },
  dialogIconContent: {
    fontFamily: 'pulseemicons',
    color: '#fff',
    fontSize: 30,
    padding: 5
  },
  dialogAlertIcon: {
    fontSize: 32,
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: 50,
    width: 40,
    height: 40
  },
  switchActive: {
    color: '#27AE60'
  },
  switchInactive: {
    color: '#F02039'
  },
  dialogErrorText: {
    fontFamily: 'Assistant',
    fontSize: 18
  },
  boxDialog: {
    maxWidth: 380,
    marginBottom: 15
  },
  middle: {
    alignSelf: 'center'
  },
  mainContainer: {
    maxHeight: 'calc(100vh - 53px)',
    overflow: 'auto'
  },
  defaultScreen: {
    'overflow': 'visible'
    //maxHeight: 'calc(100vh - 53px)'
  },
  pulseemIcon: {
    fontFamily: 'pulseemicons'
  },
  dBlock: {
    display: 'block'
  },
  w20: {
    width: '20%'
  },
  borderAround: {
    border: '1px solid #000'
  },
  borderBottom1: {
    borderBottom: '1px solid #ccc'
  },
  dFlex: {
    display: 'flex'
  },
  alignItemsCenter: {
    alignItems: 'center'
  },
  w80: {
    width: '80%'
  },
  w110: {
    width: 110
  },
  lineHeight1point2: {
    lineHeight: 1.2
  },
  w25: {
    width: 25
  },
  maxHeight87: {
    maxHeight: 87
  },
  minWidth100: {
    minWidth: 100
  },
  maxWidth400: {
    maxWidth: 400
  },
  maxWidth190: {
    maxWidth: 190
  },
  widthUnset: {
    width: 'unset'
  },
  maxWidth540: {
    maxWidth: 540
  },
  flex2: {
    flex: 2
  },
  dFlex: {
    display: 'flex'
  },
  dInline: {
    display: 'inline'
  },
  dInlineBlock: {
    display: 'inline-block'
  },
  pl25: {
    paddingInlineEnd: 25
  },
  pe10: {
    paddingInlineEnd: 10
  },
  p10: {
    padding: 10
  },
  p0: {
    padding: 0
  },
  plr10: {
    padding: '0 10px'
  },
  pr25: {
    paddingInlineStart: 25
  },
  ps15: {
    paddingInlineStart: 8
  },
  ps25: {
    paddingInlineStart: 25
  },
  pt0: {
    paddingTop: 0
  },
  pt2rem: {
    paddingTop: '2rem'
  },
  pt10: {
    paddingTop: 10
  },
  pt14: {
    paddingTop: 14
  },
  pt2: {
    paddingTop: 1.4
  },
  pb0: {
    paddingBottom: 0
  },
  pb10: {
    paddingBottom: 10
  },
  mr10: {
    marginInlineEnd: 10
  },
  mb5: {
    marginBottom: 5
  },
  mb10: {
    marginBottom: 10
  },
  mb20: {
    marginBottom: 20
  },
  mbNeg10: {
    marginBottom: -10
  },
  ml25: {
    marginInlineStart: 25
  },
  mtNeg15: {
    marginTop: -15
  },
  mt5: {
    marginTop: 5
  },
  ml0: {
    marginInlineStart: 0
  },
  ml5: {
    marginInlineStart: 5
  },
  ml10: {
    marginInlineStart: 10
  },
  mr15: {
    marginInlineEnd: 15
  },
  mt0: {
    marginTop: 0
  },
  mt10: {
    marginTop: 10
  },
  mt15: {
    marginTop: 15
  },
  f14: {
    fontSize: 14
  },
  f15: {
    fontSize: 15
  },
  f16: {
    fontSize: 16
  },
  f18: {
    fontSize: 18
  },
  f20: {
    fontSize: 20
  },
  f22: {
    fontSize: 22
  },
  f25: {
    fontSize: 25
  },
  f28: {
    fontSize: 28
  },
  line1: {
    lineHeight: 1
  },
  bgBrown: {
    backgroundColor: '#636363',
  },
  colorWhite: {
    color: '#fff'
  },
  colorGray: {
    color: 'rgba(0,0,0,0.40)'
  },
  colorBlue: {
    color: '#0371AD'
  },
  bgGreen: {
    backgroundColor: 'green'
  },
  inlineGrid: {
    display: 'inline-grid'
  },
  bgLightGray: {
    backgroundColor: 'rgba(242, 242, 242, 1)'
  },
  justifyBetween: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  flexColumn2: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 14,
    paddingInlineEnd: 10
  },
  txtCenter: {
    textAlign: 'center'
  },
  bold: {
    fontWeight: 'bold'
  },
  disabled: {
    opacity: '.65',
    pointerEvents: 'none !important'
  },
  imageInfo: {
    backgroundColor: 'rgba(255,255,255,.5)',
    color: '#000 !important'
  },
  alignCenter: {
    display: 'flex',
    alignCenter: 'center'
  },
  justifyCenter: {
    display: 'flex',
    justifyContent: 'center'
  },
  spaceEvenly: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  textCapitalize: {
    textTransform: 'capitalize'
  },
  noborder: {
    border: 'none'
  },
  floatRight: {
    float: 'right'
  },
  wordBreak: {
    wordBreak: 'break-all'
  },
  posRelative: {
    position: 'relative'
  },
  iconsFont: {
    fontFamily: 'pulseemicons',
    fontSize: 22
  },
  rtlSwitch: {
    transform: 'rotateY(180deg)'
  },
  pageSubTitle: {
    marginTop: 5,
    fontSize: 28
  },
  subTitle: {
    margin: '0 10px !important',
    color: '#157eaf',
    fontSize: 30
  },
  blue: {
    color: '#0a74a9'
  },
  bgBlack: {
    backgroundColor: 'black'
  },
  fBlack: {
    color: 'black'
  },
  black: {
    color: '#626262'
  },
  white: {
    color: 'white'
  },
  whiteBox: {
    backgroundColor: '#fff',
    boxShadow: "5px 3px 3px 1px rgba(0,0,0,.2)",
    padding: 5
  },
  mt1: {
    marginTop: 5
  },
  mt2: {
    marginTop: 10
  },
  mt3: {
    marginTop: 15
  },
  mt4: {
    marginTop: 20
  },
  mb1: {
    marginBottom: 5
  },
  mb2: {
    marginBottom: 10
  },
  mb3: {
    marginBottom: 15
  },
  mb4: {
    marginBottom: 20
  },
  m5: {
    margin: '.5rem'
  },
  font15: {
    fontSize: 15
  },
  font18: {
    fontSize: 18
  },
  font20: {
    fontSize: 20
  },
  font24: {
    fontSize: 24
  },
  linkNoDesign: {
    textDecoration: 'none',
    color: 'black'
  },
  font30: {
    fontSize: 30
  },
  borderBox: {
    border: '3px solid #0371ad',
    margin: '1rem',
    display: 'flex',
    padding: '1rem',
    borderRadius: 5,
    flexDirection: 'column'
  },
  whiteLink: {
    textDecoration: 'underline',
    color: '#fff',
    textTransform: 'capitalize',
    lineHeight: 1
  },
  noWrap: {
    flexWrap: 'nowrap'
  },
  management: {
    maxWidth: 1500
  },
  editor: {
    maxWidth: 1920
  },
  report: {
    maxWidth: 1920
  },
  blackDivider: {
    height: 2,
    backgroundColor: 'rgb(0, 0, 0, 0.5)'
  },
  noWrap: {
    flexWrap: 'nowrap'
  },
  italic: {
    fontStyle: 'italic'
  },
  ellipsisText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mb25: {
    marginBottom: 25
  },
  mt25: {
    marginTop: 25
  }
})