const iconWidth = {
  xs: 25,
  sm: 20,
  md: 25,
  lg: 30,
  xl: 35
}

const flex12 = {
  xs: 5,
  sm: 5,
  md: 7,
  lg: 6,
  xl: 6
}
const blue = '#0371AD';

const iconPadding = {
  xs: '0.5rem 0.8rem 0.5em',
  sm: '0.8rem 1.1rem 0.2rem',
  md: '0.8rem 1.1rem 0.2rem',
  lg: '0.8rem 1.1rem 0.2rem',
  xl: '0.8rem 1.1rem 0.2rem'
}

const ellipsisMaxWidth = {
  xs: '100%',
  sm: '250px',
  md: '100%',
  lg: '100%',
  xl: '100%'
}

const tableRowMinWidth = {
  xs: 75,
  sm: 75,
  md: 75,
  lg: 75,
  xl: 100
}

const barWidth = {
  sm: '460px!important',
  md: '430px!important',
  lg: '450px!important',
  xl: '500px!important'
}

const barHeight = {
  sm: '',
  md: '220px!important',
  lg: '250px!important',
  xl: '250px!important'
}

const shortcutFontSize = {
  category: {
    xs: 16,
    sm: 14,
    md: 16,
    lg: 16,
    xl: 16
  },
  page: {
    xs: 18,
    sm: 16,
    md: 18,
    lg: 18,
    xl: 18
  }

}

const dashboardDirection = {
  xs: 'column-reverse',
  sm: '',
  md: '',
  lg: '',
  xl: ''
}

const paperTopHeight = {
  xs: 'auto',
  sm: 'auto',
  md: '350px',
  lg: '350px',
  xl: '350px'
}

const paperBottomHeight = {
  xs: 'auto',
  sm: 'auto',
  md: '350px',
  lg: '350px',
  xl: '350px'
}

const shortcutEditLeft = {
  xs: '8%',
  sm: '18px',
  md: '15px',
  lg: '22px',
  xl: '28px'
}

const shortcutPaperHeight = {
  xs: '',
  sm: '100vh',
  md: '100vh',
  lg: '95vh',
  xl: '95vh'
}

export const getManagmentStyle = (windowSize, isRTL, theme) => ({
  managementTitle: {
    fontSize: windowSize === 'xs' ? '25px' : '36px',
    color: '#333333',
    paddingBlock: '0.5rem',
    fontFamily: "Assistant",
    fontWeight: 'bold',
    marginTop: 20
  },
  tableRow: {
    marginBox: 20
  },
  tableCellHead: {
    fontFamily: 'Assistant',
    fontWeight: 'bold',
    fontSize: 20,
    marginBlock: 0,
    borderBottom: 0,
    padding: '16px 10px!important'
  },
  tableCellBody: {
    borderInlineEnd: '1px solid #797979',
    marginBlock: 20,
    borderBottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  borderRight: {
    marginBlock: 20,
    borderBottom: 0,
    borderInlineEnd: '1px solid #797979',
  },
  flex: {
    display: 'flex',
  },
  minWidth75: {
    minWidth: '75px!important'
  },
  minWidth50: {
    minWidth: '50px!important'
  },
  maxWidth75: {
    maxWidth: '75px!important'
  },
  paddingRightLeft10: {
    padding: '0 10px!important'
  },
  paddingHead: {
    padding: '20px 10px'
  },
  tableCellBodyNoBorder: {
    marginBlock: 20,
    borderBottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  tableCellRoot: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 50,
    padding: '0 10px'
  },
  tableRowRoot: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid #797979',
    '&:last-child': {
      borderBottom: 0
    },
    '&:nth-of-type(even)': {
      backgroundColor: '#E3E9F0',
    }
  },
  tableRowHead: {
    backgroundColor: '#E3E9F0',
    borderColor: 'transparent',
  },
  tableRowReportHead: {
    backgroundColor: '#D7D7D7',
    borderColor: 'transparent',
  },
  middleText: {
    fontSize: windowSize === 'xs' ? 15 : 18,
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: '#333'
  },
  middleTxt: {
    fontSize: 18,
    whiteSpace: 'nowrap',
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: '#333'
  },
  middleWrapText: {
    fontSize: 18,
    overflow: "hidden",
    color: '#333'
  },
  wrapText: {
    fontSize: 16,
    flexWrap: "wrap",
    textOverflow: "ellipsis",
  },
  errorText: {
    color: 'red'
  },
  paddingIcon: {
    padding: '0.8rem 0rem 0.2rem!important'
  },
  minWidth95: {
    minWidth: 95,
    padding: '0.8rem 0px!important'
  },
  managmentIconHide: {
    opacity: 0
  },
  managmentIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textDecoration: 'none',
    width: '100%',
    padding: iconPadding[windowSize],
    color: '#333'
  },
  managmentIcon: {
    width: iconWidth[windowSize],
    margin: 'auto',
    marginTop: -10
  },
  managmentUicon: {
    fontSize: 30,
    fontFamily: 'pulseemicons',
    marginBottom: -15,
    marginTop: -15
  },
  managmentIconDisable: {
    opacity: 0.5
  },
  managmentIconText: {
    textAlign: 'center',
    alignSelf: 'center',
    textTransform: 'none',
    marginTop: 2,
    fontSize: windowSize === 'xs' && 15
  },
  sendIcon: {
    border: '1px solid #27AE60',
    borderRadius: 5
  },
  sendIconText: {
    color: '#27AE60'
  },
  recipientsStatus: {
    fontSize: 18,
    color: 'black'
  },
  statusStopped: {
    fontWeight: 700,
    color: '#E74C3C'
  },
  statusFailed: {
    fontWeight: 700,
    color: '#E74C3C'
  },
  statusCreated: {
    fontWeight: 700,
    color: '#0371AD'
  },
  statusDeleted: {
    fontWeight: 700,
    color: '#E74C3C'
  },
  statusSending: {
    fontWeight: 700,
    color: '#F59A23'
  },
  statusSent: {
    fontWeight: 700,
    color: '#27AE60'
  },
  statusPending: {
    fontWeight: 700,
    color: '#F59A23'
  },
  statusScheduled: {
    fontWeight: 700,
    color: '#F59A23'
  },
  recipientsStatusCreated: {
    color: '#0371AD',
    fontWeight: 700
  },
  recipientsStatusSent: {
    color: '#27AE60',
    fontWeight: 700
  },
  recipientsStatusSending: {
    color: '#F59A23',
    fontWeight: 700
  },
  recipientsStatusCanceled: {
    color: '#E74C3C',
    fontWeight: 700
  },
  recipientsStatusStopped: {
    color: '#E74C3C',
    fontWeight: 700
  },
  textColorRed: {
    color: '#E74C3C'
  },
  actionButton: {
    color: 'white',
    fontSize: 18,
    textTransform: 'none'
  },
  actionButtonLightGreen: {
    backgroundColor: '#27AE60',
    '&:hover': {
      backgroundColor: '#219150'
    }
  },
  textColorBlue: {
    color: '#3498DB'
  },
  actionButtonLightBlue: {
    backgroundColor: '#3498DB',
    '&:hover': {
      backgroundColor: '#2283c3'
    }
  },
  actionButtonDarkBlue: {
    backgroundColor: '#5088b5',
    '&:hover': {
      backgroundColor: '#4477a2'
    }
  },
  actionButtonGreen: {
    backgroundColor: '#217346',
    '&:hover': {
      backgroundColor: '#1d633c'
    }
  },
  actionButtonRed: {
    backgroundColor: '#c9302c',
    '&:hover': {
      backgroundColor: '#ae2a27'
    }
  },
  textField: {
    width: 180,
    textTransform: 'capitalize',
    '& .MuiInputBase-root': {
      fontSize: 18,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#a6a6a6'
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#797979'
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #797979',
      }
    }
  },
  selectField: {
    width: 180,
    '& .MuiSelect-root': {
      fontSize: 18,
      padding: '12px 30px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#a6a6a6'
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#797979'
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #797979',
      }
    }
  },
  textFieldPlaceholder: {
    '& .MuiInputBase-root': {
      color: 'rgba(0,0,0,0.40)'
    }
  },
  selectPlaceholder: {
    height: 0,
    padding: 0
  },
  tableStyle: {
    overflowX: 'visible'
  },
  tableContainer: {
    width: '100%',
    border: '1px solid #7F7F7F',
  },
  flex7: {
    flex: 7
  },
  flex2: {
    flex: 2
  },
  flex3: {
    flex: 3
  },
  flex15: {
    flex: 1
  },
  flex1: {
    flex: 1
  },
  flexHalf: {
    flex: .5
  },
  flex5: {
    flex: 4,
    borderBottom: 0,
    justifyContent: 'center'
  },
  flex12: {
    flex: flex12[windowSize] || 5,
    borderBottom: 0,
    justifyContent: 'center'
  },
  cellIconsContainer: {
    justifyContent: windowSize === 'xs' ? 'flex-start' : 'flex-end',
  },
  datePickerInput: {
    paddingBlock: 10
  },
  datePickerButton: {
    right: isRTL ? 10 : -10,
    padding: 10
  },
  groupsLableContainer: {
    justifyContent: windowSize === 'xs' ? 'start' : 'flex-end',
    display: 'flex',
    flex: 1
  },
  groupsLable: {
    alignSelf: 'center',
    fontSize: 16
  },
  searchButton: {
    backgroundColor: '#E3E9F0',
    color: '#333',
    paddingInline: 25,
    textTransform: 'none',
    borderRadius: 6
  },
  tablePaginationSelect: {
    '& .MuiSelect-icon': {
      color: '#000'
    },
    color: '#000',
    marginInlineStart: 15
  },
  tablePadingtonSelect: {
    '& .MuiSelect-root': {
      padding: 0,
      paddingBlock: 2,
      paddingInline: 15,
      marginInlineStart: 10
    },
    '& .MuiSelect-icon': {
      color: '#000',
      top: 0,
      marginInlineEnd: -5
    },
    '& .MuiInput-underline': {
      '&:before': {
        borderBottom: 0
      },
      '&:hover:not(.Mui-disabled):before': {
        borderBottom: 0
      },
      '&:after': {
        borderBottom: 0,
      }
    }
  },
  tablePadingtonTextFeild: {
    marginInline: 10,
    width: 30,
    '& .MuiInputBase-root': {
      fontSize: 14,
      padding: 0,
      height: 30,
    },
    '& .MuiOutlinedInput': {
      '&-input': {
        padding: 0,
        textAlign: 'center',
        alignSelf: 'center',
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        '&::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      },
      '&-inputMarginDense': {
        paddingTop: 0,
        paddingBottom: 0
      },
      '&-notchedOutline': {
        borderColor: '#a6a6a6'
      },
      '&-root': {
        '&:hover fieldset': {
          borderColor: '#797979'
        },
        '&.Mui-focused fieldset': {
          border: '1px solid #797979',
        }
      }
    }
  },
  tablePadingtonArrow: {
    transform: isRTL ? 'rotateY(0deg)' : 'rotateY(180deg)',
    marginInlineStart: 10,
    padding: 10
  },
  tablePadingtonArrowOppisite: {
    transform: isRTL ? 'rotateY(180deg)' : 'rotateY(0deg)',
    marginInlineEnd: 10,
    padding: 10
  },
  tablePadingtonGridItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50
  },
  tablePadingtonGridContainer: {
    paddingBlock: 10,
  },
  phoneSearchBar: {
    border: '1px solid #797979',
    borderRadius: '50px',
    overflow: 'hidden',
    marginTop: '1rem',
    paddingInlineStart: 10,
    '&:before': {
      borderBottom: 0
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: 0
    },
    '&:after': {
      borderBottom: 0
    }
  },
  phoneSearchBarRoot: {
    zIndex: 0
  },
  phoneSearchBarIcon: {
    backgroundColor: '#E3E9F0',
    padding: 10,
    '&:hover': {
      backgroundColor: '#dee5ed'
    }
  },
  linePadding: {
    paddingBlock: '1rem'
  },
  lineTopMarging: {
    marginTop: '1rem'
  },
  restoreDialogCheckBoxLable: {
    '& .MuiFormControlLabel-label': {
      fontWeight: 'bold'
    }
  },
  groupsTable: {
    border: '1px solid #ccc'
  },
  groupsTableHead: {
    padding: 0,
    background: '#ccc'

  },
  gruopsDialogText: {
    fontSize: 16
  },
  gruopsDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: 400,
    overflow: 'auto',
    marginBlock: 10
  },
  gruopsDialogButton: {
    alignSelf: 'center',
    fontFamily: 'OpenSansHebrew',
    color: '#fff',
    textTransform: 'capitalize',
    width: 400,
    fontSize: 16,
    borderRadius: 100
  },
  gruopsDialogBullet: {
    fontSize: 8,
    marginInlineEnd: 10
  },
  restoreDialogCheckBox: {
    padding: 0,
    marginInlineStart: 10,
    marginInlineEnd: 5
  },

  restorDialogContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 300,
    width: 600,
    border: '1px solid #8b8b8b',
    overflowY: 'auto',
    padding: 5,
    marginBlock: 10
  },
  grayTextCell: {
    'WebkitLineClamp': 1,
    color: '#7F7F7F'
  },
  fontBold: {
    fontWeight: 700
  },
  cardMedia: {
    height: '200px',
  },
  cardIcon: {
    width: '100px',
    height: '100%',
    minHeight: 85,
    backgroundSize: 'contain'
  },
  searchWhite: {
    transform: 'scale(1.5)',
    padding: 10,
    '& path': {
      fill: 'white',
    }
  },
  confirmButton: {
    alignSelf: 'center',
    fontFamily: 'OpenSansHebrew',
    color: '#fff',
    textTransform: 'capitalize',
    width: 167,
    fontSize: 16,
    borderRadius: 100
  },
  formControl: {
    '& .MuiInputLabel-formControl': {
      top: -7
    }
  },
  formControlSelect: {
    '& .MuiSelect-outlined.MuiSelect-outlined': {
      padding: '12px 32px'
    }
  },
  dialogBox: {
    padding: 20
  },
  directoryField: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 400
  },
  radioGroup: {
    padding: '0 10px'
  },
  copyIcon: {
    fontFamily: 'pulseemicons',
    fontSize: 10,
    padding: '0 5px'
  },
  avatarIcon: {
    fontFamily: 'pulseemicons',
    color: '#fff',
    fontSize: 18
  },
  checkIcon: {
    backgroundColor: 'green',
    width: 14,
    height: 14
  },
  redIcon: {
    backgroundColor: 'darkred',
    width: 14,
    height: 14
  },
  newLine: {
    whiteSpace: 'pre-line'
  },
  contactUs: {
    fontSize: 12,
    marginTop: 20
  },
  verifyLink: {
    paddingInlineStart: 5,
    fontSize: 12,
    textDecoration: 'underline',
    cursor: 'pointer',
    color: '#000',
    '&:hover': {
      color: 'darkred'
    }
  },
  nameEllipsis: {
    fontSize: 20,
    fontWeight: 700,
    color: '#333333',
    fontFamily: 'Assistant',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    maxWidth: ellipsisMaxWidth[windowSize]
  },
  p10: {
    padding: 10
  },
  p15: {
    padding: 15
  },
  emptyImageLabel: {
    textAlign: 'center',
    alignSelf: 'center',
    textTransform: 'none',
    fontWeight: 500
  },
  mt_10: {
    marginTop: -10
  },
  pictureIcon: {
    fontFamily: 'pulseemicons',
    color: '#000',
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  f80: {
    fontSize: 80
  },
  boxShadow: {
    boxShadow: '0px 5px 10px #888888'
  },
  chooseImageBtn: {
    width: '100%',
    padding: 0
  },
  pictureBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100px',
    height: '75px',
    padding: 0,
    border: '1px dashed #64a1bd!important'
  },
  pictureBoxBig: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '99%',
    minHeight: 200,
    padding: 0,
    border: '1px dashed #64a1bd!important',
    margin: 'auto'
  },
  previewCardContent: {
    display: 'flex',
    alignItems: 'center',
    justify: 'center',
    padding: 0,
    minHeight: 115
  },
  previewLabel: {
    background: '#a9a9a9',
    color: 'white',
    margin: 5,
    padding: 5
  },
  w100: {
    width: '100%'
  },
  scriptCode: {
    background: '#eee',
    fontSize: 12,
    wordBreak: 'break-all',
    overflow: 'auto'
  },
  verificationTitle: {
    fontWeight: 'bold',
    fontSize: 25
  },
  green: {
    color: '#48a148'
  },
  white: {
    color: 'white'
  },
  red: {
    color: 'red!important'
  },
  verifySuccessIcon: {
    fontFamily: 'pulseemicons',
    fontWeight: 'bold',
    fontSize: 90,
    color: '#48a148'
  },
  borderRed: {
    borderColor: 'red!important'
  },
  minWidth252: {
    minWidth: '252.6px!important'
  },
  verifyButton: {
    background: 'green',
    textTransform: 'capitalize',
    color: 'white',
    '&:hover': {
      background: 'darkgreen'
    }
  },
  verifyField: {
    '& .MuiOutlinedInput-input': {
      fontSize: 20
    }
  },
  myGroupsTitleSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  languageSelect: {
    textTransform: 'capitalize',
    color: 'white',
    padding: 10,
    fontSize: 18,
    fontFamily: 'OpenSansHebrew'
  },
  disabledCursor: {
    cursor: 'not-allowed'
  },
  pointerShow: {
    '&.MuiButtonBase-root.Mui-disabled': {
      pointerEvents: 'visible'
    }
  },
  numberBox: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  phoneNumberList: {
    padding: 0,
    overflow: 'auto',
    height: 'calc(100vh - 500px)'
  },
  margin0: {
    margin: 0
  },
  padding0: {
    padding: 0
  },
  minWidth25: {
    minWidth: 25
  },
  minWidth150: {
    minWidth: 150
  },
  boldSize25: {
    fontWeight: 'bold',
    fontSize: 25
  },
  pt20: {
    paddingTop: 20
  },
  link: {
    textDecoration: 'underline',
    margin: '0 5px'
  },
  mobileReportHead: {
    fontWeight: 'bold',
    marginTop: 15,
    marginInlineStart: 10
  },
  tabelCellPadding: {
    paddingBlock: 15
  },
  dashboard: {
    background: '#F2F2F2',
    padding: 0,
    maxHeight: 'unset'
  },
  dashboardContainer: {
    flexDirection: dashboardDirection[windowSize]

  },
  chartLabelGreen: {
    position: 'absolute',
    top: 'calc(50% - 28px)',
    width: '100%',
    fontSize: 35,
    fontWeight: '500',
    textTransform: 'uppercase',
    color: '#65d638'
  },
  shortcutTitleSection: {
    width: '85%',
    marginTop: '2.1rem',
    marginBottom: 40
  },
  shortcutTitle: {
    fontSize: windowSize === 'xs' ? 23 : 25,
    fontWeight: 'bold'
  },
  shortcutSubtitle: {
    fontSize: windowSize === 'xs' ? 16 : 18,
  },
  shortcutBox: {
    position: windowSize === 'xs' ? '' : 'sticky',
    top: 0,
    height: shortcutPaperHeight[windowSize],
    [theme.breakpoints.down('xs')]: {
      margin: '10px 10px -10px 10px'
    }
  },
  shortcutPaper: {
    [theme.breakpoints.down('xs')]: {
      borderRadius: 10,
    },
    height: shortcutPaperHeight[windowSize],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '0px'
    },
    '&::-webkit-scrollbar-thumb': {
      'backgroundColor': 'darkgrey',
      borderRadius: '5px'
    }
  },
  shortcutBtnBox: {
    position: 'relative',
    width: '100%',
    textAlign: 'center'
  },
  shortcutButton: {
    height: '92px',
    width: '85%',
    background: '#0371AD',
    borderRadius: '20px',
    marginBottom: windowSize === 'xs' ? 30 : 45,
    fontSize: '18px',
    position: 'relative',
    textTransform: 'capitalize',
    padding: '6px 30px'

  },
  shortcutDottedButton: {
    borderRadius: '20px',
    border: '1px dashed #0371AD',
    fontFamily: 'pulseemicons',
    height: '92px',
    fontSize: '30px',
    marginBottom: 45,
    width: '85%',
  },
  shortcutList: {
    maxWidth: 350,
    background: 'white',
    borderRadius: 10,
    margin: 10
  },
  shortcutEditIcon: {
    position: 'absolute',
    left: shortcutEditLeft[windowSize],
    bottom: windowSize === 'xs' ? 40 : 50,
    fontFamily: 'pulseemicons',
    fontSize: 18,
    color: 'white'
  },
  shortcutLabel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    marginTop: -5
  },
  popperPaper: {
    padding: '5px 0',
    width: 300,
    background: '#D7D7D7'
  },
  hideIndicator: {
    background: 'none'
  },
  pageTitle: {
    fontSize: shortcutFontSize.page[windowSize],
    lineHeight: 1
  },
  categoryLabel: {
    fontSize: shortcutFontSize.category[windowSize],
    lineHeight: 1
  },
  carouselPaper: {
    borderRadius: 10
  },
  carouselChart: {
    '& .carousel-root': {
      width: '100%'
    },
    position: 'relative'
  },
  carouselArrows: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    zIndex: 1
  },
  carouselTipsArrows: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 'calc(50% - 24px)',
    zIndex: 1
  },
  carouselTips: {
    position: 'relative',
    '& .control-dots .dot': {
      background: 'white!important',
      height: '10px!important',
      width: '10px!important',
      boxShadow: 'unset!important',
      border: '1px solid #000',
      margin: '0 2px!important'
    },
    '& .control-dots .dot.selected': {
      background: '#000!important'
    }
  },
  doughnutGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  barChart: {
    // maxWidth: 500,
    float: 'right',
    '& canvas': {
      // width: barWidth[windowSize],
      height: barHeight[windowSize]
    },
    paddingBottom: 10
  },
  emptyDoughnut: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#F9F9F9',
    border: '1px solid #D7D7D7',
    width: 180,
    height: 180,
    margin: 10
  },
  recipientTitleSection: {
    marginBottom: '1.2rem',
    borderBottom: '1px solid #ccc'
  },
  noRecipients: {
    color: '#AAAAAA',
    marginTop: 40,
    fontSize: 20
  },
  addRecipientsIcon: {
    fontFamily: 'pulseemicons',
    fontSize: 20
  },
  addRecipientsBtn: {
    textTransform: 'capitalize',
    marginTop: -10
  },
  tipsTitle: {
    textAlign: 'center',
    padding: '20px 20px 0px 20px',
    marginBottom: 10
  },
  bulkStatusTitleSection: {
    marginBottom: '1rem',
    marginTop: '1rem'
  },
  bulkStatusBlue: {
    marginBottom: '1rem',
    padding: '3px 15px',
    borderRadius: '.9rem',
    background: '#0371AD',
    color: 'white',
  },
  bulkOutline: {
    marginBottom: '1rem',
    padding: '3px 15px',
    borderRadius: '.9rem',
    border: '1px solid #0371AD',
    background: 'transparent',
    color: '#0371AD',
  },
  bulkTitle: {
    fontWeight: 700,
    fontSize: '12',
    lineHeight: '2.1rem',
  },
  bulkContent: {
    fontWeight: 300,
    fontSize: '12',
    lineHeight: '2.1rem',
    textDecoration: 'underline',
    color: '#0371AD',
  },
  dashboardTitle: {
    fontWeight: 'bold',
    color: '#0371AD',
    marginTop: 10,
    marginInlineStart: 30,
    fontSize: 20
  },
  dashboardUsername: {
    fontWeight: 'bold',
    color: '#0371AD',
    fontSize: 20
  },
  dashboardTopPaper: {
    [theme.breakpoints.up('lg')]: {
      minHeight: 330
    },
    [theme.breakpoints.down('md')]: {
      paddingBottom: 40
    },
    [theme.breakpoints.down('xs')]: {
      margin: '10px 10px 0px 10px',
    },
    margin: '30px 30px 0px 30px',
    borderRadius: 10
  },
  dashboardBottomPaper: {
    [theme.breakpoints.up('lg')]: {
      height: 370
    },
    [theme.breakpoints.down('xs')]: {
      margin: 10,
    },
    margin: 30,
    borderRadius: 10
  },
  bulkMargin: {
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
    },
    [theme.breakpoints.up('lg')]: {
      marginInlineEnd: 0
    },
  },
  tipMargin: {
    [theme.breakpoints.up('lg')]: {
      marginInlineEnd: 0,
    },
  },
  tipItem: {
    padding: '0 30px 20px 30px'
  },
  tipulseemMsg: {
    fontSize: 18,
    padding: '0px 20px 20px 20px'
  },
  lightBulb: {
    width: 100,
    height: 100,
    marginBottom: 10
  },
  activeTab: {
    background: blue,
    borderRadius: 5,
    color: 'white',
  },
  tabText: {
    fontSize: 20,
    textTransform: 'capitalize',
    padding: 2,
    minWidth: 120,
    minHeight: 40
  },
  SMSLastReportGrid: {
    padding: '15px 20px 0px 20px'
  },
  newsletterLastReportGrid: {
    padding: '0px 20px 20px 20px',
  },
  newsletterItemBorder: {
    borderBottom: '1px solid #ccc'
  },
  phoneLastReportTitle: {
    marginBottom: '1.2rem',
    borderBottom: '1px solid #ccc'
  },
  lastReportItemText: {
    display: 'flex',
    alignItems: 'baseline'
  },
  lastReportTitleSection: {
    marginTop: 5,
    marginBottom: '1.2rem',
    borderBottom: '1px solid #ccc'
  },
  lastReportRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0px'
  },
  lastReportsTabPanels: {
    padding: '0 20px 0 30px'
  },
  lastReportPadding: {
    [theme.breakpoints.down('md')]: {
      marginTop: 0
    }
  },
  chartLabel: {
    position: 'absolute',
    height: 55,
    top: 0,
    bottom: 0,
    width: '55%',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'gray',
    right: 0,
    left: 0,
    margin: 'auto'
  },
  doughnutBox: {
    width: 200,
    height: 200,
    position: 'relative',
    textAlign: 'center'
  },
  doughnutGreenBox: {
    width: 180,
    height: 180,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 1
  },
  bgLightGreen: {
    position: 'absolute',
    background: '#E0FAC6',
    width: 145,
    height: 145,
    marginTop: 10,
    zIndex: -1
  },
  duplicateSuccessMsg: {
    padding: '0 25px!important'
  },
  tooltipBlack: {
    backgroundColor: 'black',
    maxWidth: 300,
    fontSize: '16px!important',
    textAlign: 'center',
  },
  tooltipPlacement: {
    '&.MuiTooltip-tooltipPlacementTop': {
      margin: '10px 0px!important'
    }
  },
  tooltipArrow: {
    color: 'black',
    left: isRTL?'unset!important':'2px!important',
    right: isRTL?'2px!important':'unset!important'
  },
  previewID: {
    fontSize: windowSize === 'xs' ? 20 : 25,
    position: 'absolute',
    top: 20,
    left: isRTL?'unset':75,
    right: isRTL?75:'unset',
  }
})