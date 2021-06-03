const dialogWidth = {
  xs: 200,
  sm: 350,
  md: 350,
  lg: 350
}

const minDialogWidth = {
  xs: 330,
  sm: 330,
  md: 500,
  lg: 500
}
const maxDialogWidth = {
  xs: 350,
  sm: 350,
  md: 1050,
  lg: 1050,
  xl: 1050
}

const summaryPadding = {
  xs: 0,
  sm: 0,
  md: 25,
  lg: 25,
  xl: 25
}

const iconWrapperMargin = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 15,
  xl: 15
}
const iconWrapperMinWidth = {
  xs: 80,
  sm: 80,
  md: 100
}
const summaryNotificationMinWidth = {
  xs: "240px",
}
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
      minWidth: summaryNotificationMinWidth[windowSize],
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
        minWidth: windowSize === 'xs' || windowSize === 'sm' ? 0 : 100
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
    boxShadow: '0px 3px 3px darkred'
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
    position: 'absolute',
    border: '1px solid #3476b0',
    padding: 5,
    color: '#3476b0',
    fontWeight: 600,
    backgroundColor: '#bde5f8',
    opacity: 0,
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
  },
  maxWidth400: {
    maxWidth: 400
  },
  ps25: {
    paddingInlineStart: 25
  },
  pt10: {
    paddingBottom: 10
  },
  pb10: {
    paddingBottom: 10
  },
  f14: {
    fontSize: 14
  },
  f18: {
    fontSize: 18
  },
  f25: {
    fontSize: 25
  },
  colorGray: {
    color: 'rgba(0,0,0,0.40)'
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
  }
})