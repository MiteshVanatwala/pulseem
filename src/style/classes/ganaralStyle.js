const dialogWidth = {
  xs: "200px",
  sm: "350px",
  md: "350px",
  lg: "460px",
};

const minDialogWidth = {
  xs: 330,
  sm: 330,
  md: 500,
  lg: 500,
  xl: 620,
};

const maxDialogWidth = {
  md: 1080,
  lg: 1080,
  xl: 1080,
};

// const maxTemplateDialogWidth = {
//   xs: 330,
//   sm: 500,
//   md: 960,
//   xl: 1060,
//   lg: 1060,
// };


const summaryPadding = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 25,
  xl: 25,
};

const iconWrapperMargin = {
  xs: "10px 5px 5px",
  sm: 10,
  md: 15,
  lg: 15,
  xl: 15,
};
const iconWrapperMinWidth = {
  xs: 50,
  sm: 100,
  md: 100,
};
// const summaryNotificationMinWidth = {
//   xs: "240px",
// }
const notificationTitleFontSize = {
  xs: 12,
  sm: 12,
  md: "1rem",
};

const graphTextWidth = {
  sm: 250,
  md: 250,
  lg: 110,
  xl: 250,
};

export const getGeneralStyle = (windowSize, isRTL, theme) => ({
  background: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    '& svg': {
      position: 'absolute',
      bottom: 0
    },
    '& .rightSvg': {
      right: 0,
      transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)'
    },
    '& .leftSvg': {
      left: 0,
      transform: isRTL ? 'scaleX(-1)' : 'scaleX(1)'
    }
  },
  appBody: {
    maxWidth: 'calc(100vw - 6px)',
    '& input::placeholder': {
      color: 'rgba(0,0,0,.65)',
      opacity: 1/* Firefox */
    },
    '& input::ms-input-placeholder': {
      color: 'rgba(0,0,0,.65)',
    }
  },
  greyBackground: {
    background: '#F0F5FF',
  },
  evenRowBackground: {
    backgroundColor: "#f7faff",
  },
  sidebar: {
    paddingRight: '0 !important',
    "&::-webkit-scrollbar": {
      display: "block !important",
      width: 6,
      height: 6,
    },
    /* Track */
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 0px",
      borderRadius: 10,
      backgroundColor: "#fff !important",
    },
    /* Handle */
    "&::-webkit-scrollbar-thumb": {
      background: "#ccc",
      borderRadius: 10,
    },
    /* Handle on hover */
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#999",
    },
    '& *': {
      "&::-webkit-scrollbar": {
        display: "block !important",
        width: 6,
        height: 6,
      },
      /* Track */
      "&::-webkit-scrollbar-track": {
        boxShadow: "inset 0 0 0px",
        borderRadius: 10,
        backgroundColor: "#fff !important",
      },
      /* Handle */
      "&::-webkit-scrollbar-thumb": {
        background: "#ccc",
        borderRadius: 10,
      },
      /* Handle on hover */
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#999",
      },
    }
  },
  dialogCustomSize: {
    height: "40vh",
    width: windowSize === "lg" || windowSize === "xl" ? "550px" : null,
  },
  solidDialogContainer: {
    zIndex: '1500 !important',
    "& .MuiPaper-root": {
      borderRadius: 25,
      overflowX: "hidden",
      boxShadow: '5px 5px 5px rgb(0 0 0 / 35%)',
      backgroundColor: '#f5f5f5',
    },
    "& .MuiDialog-paperWidthSm": {
      minWidth: minDialogWidth[windowSize],
      maxWidth: maxDialogWidth[windowSize],
    },
    "& .MuiDialog-paperScrollPaper": {
      maxHeight: '100%'
    },
  },
  dialogContainer: {
    // zIndex: "1500 !important",
    "& .MuiPaper-root": {
      overflowX: "hidden",
    },
    "& .MuiDialog-scrollPaper": {
      "@media screen and (max-width: 450px)": {
        zoom: '85%'
      },
      "@media screen and (max-width: 330px)": {
        zoom: '70%'
      }
    },
    "& .MuiDialog-paperWidthSm": {
      minWidth: 440,
      maxWidth: `${maxDialogWidth[windowSize]}px !important`,
    },
    "& .MuiDialog-paperScrollPaper": {
      maxHeight: "100%",
      borderRadius: 15
    },
  },
  noPadding: {
    padding: "0px !important",
  },
  noMargin: {
    margin: '0px !important',
  },
  wizardFlex: {
    flex: 1,
    alignContent: "flex-end",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: '1.2rem',
    fontWeight: "500",
    color: "#fff",
    paddingInline: 15,
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    direction: isRTL ? 'rtl' : 'ltr'
  },
  resetDialogTitle: {
    fontSize: "2rem",
    fontWeight: "400",
    color: "#0a74a9",
    whiteSpace: "pre-line",
  },
  reducedTitle: {
    "@media screen and (max-width: 768px)": {
      fontSize: "1.3rem",
    }
  },
  packageDialogPpaper: {
    // background: '#ffe6e0c4'
  },
  dialogChildren: {
    marginBlock: 20,
    marginTop: 5,
    paddingRight: `${summaryPadding[windowSize]}px !important`,
    paddingLeft: summaryPadding[windowSize],
    overflowY: "auto",
  },
  paddingSides5: {
    paddingRight: 5,
    paddingLeft: 5,
  },
  pl10: {
    paddingLeft: 10,
  },
  pl30: {
    paddingLeft: 30,
  },
  paddingSides10: {
    paddingRight: 10,
    paddingLeft: 10,
  },
  paddingSides15: {
    paddingRight: 15,
    paddingLeft: 15,
  },
  paddingSides25: {
    paddingRight: 25,
    paddingLeft: 25,
  },
  marginSides5: {
    marginRight: 5,
    marginLeft: 5,
  },
  copyClip: {
    border: "1px solid #3476b0",
    padding: 5,
    color: "#3476b0",
    fontWeight: 600,
    backgroundColor: "#bde5f8",
    opacity: 1,
    zIndex: 10,
  },
  dialogIconContent: {
    fontFamily: "pulseemicons",
    color: "#fff",
    fontSize: 25,
    '&.unicode': {
      fontSize: 24
    }
    // padding: 5,
  },
  dialogAlertIcon: {
    fontSize: 28,
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: 50,
    width: 40,
    height: 40,
  },
  switchActive: {
    color: "#27AE60",
  },
  switchInactive: {
    color: "#F02039",
  },
  dialogErrorText: {
    fontFamily: "Assistant",
    fontSize: 18,
  },
  boxDialog: {
    maxWidth: 380,
    marginBottom: 15,
  },
  middle: {
    alignSelf: "center",
  },
  mainContainer: {
    maxHeight: "calc(100vh - 53px)",
    overflow: "auto",
  },
  defaultScreen: {
    overflow: "visible",
    //maxHeight: 'calc(100vh - 53px)'
  },
  pulseemIcon: {
    fontFamily: "pulseemicons",
  },
  borderBottom1: {
    borderBottom: "1px solid #ccc",
  },
  dFlex: {
    display: "flex",
  },
  justifyContentEnd: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  width_min_content: {
    width: 'min-content'
  },
  rtlSwitch: {
    transform: "rotateY(180deg)",
  },
  dBlock: {
    display: "block !important",
  },
  dInlineBlock: {
    display: "inline-block !important",
  },
  dNone: {
    display: "none",
  },
  borderAround: {
    border: "1px solid #000",
  },
  greyBorderAround: {
    border: "1px solid #d3d3d3",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  w110: {
    width: 110,
  },
  lineHeight1point2: {
    lineHeight: 1.2,
  },
  w25: {
    width: 25,
  },
  minHeight50: {
    minHeight: 50,
  },
  height50: {
    height: 50,
  },
  maxHeight87: {
    maxHeight: "auto",
    "@media screen and (min-width: 600px)": {
      maxHeight: 100,
    },
  },
  w20: {
    width: "20%",
  },
  w30: {
    width: "30%",
  },
  w40: {
    width: "40%",
  },
  w80: {
    width: "80%",
  },
  w70: {
    width: "70%",
  },
  w60: {
    width: "60%",
  },
  w15VW: {
    width: "15vw",
  },
  w70VW: {
    width: "70vw",
  },
  minWidth100: {
    minWidth: 100,
  },
  width100: {
    width: 100,
  },
  maxWidth400: {
    maxWidth: 400,
  },
  maxWidth190: {
    maxWidth: 190,
  },
  width160: {
    width: 160,
    maxWidth: 160,
  },
  widthUnset: {
    width: "unset",
  },
  maxWidth540: {
    maxWidth: 540,
  },
  maxWidth900: {
    maxWidth: 900,
  },
  flex2: {
    flex: 2,
  },
  dInline: {
    display: "inline",
  },
  pl25: {
    paddingInlineEnd: 25,
  },
  pe10: {
    paddingInlineEnd: 10,
  },
  pe5: {
    paddingInlineEnd: 5,
  },
  p10: {
    padding: 10,
  },
  p50: {
    padding: 50,
  },
  pbt5: {
    padding: "5px 0",
  },
  p20: {
    padding: 20,
  },
  p0: {
    padding: 0,
  },
  plr10: {
    padding: "0 10px",
  },
  pr10: {
    paddingInlineStart: 10,
  },
  pl5: {
    paddingInlineStart: 5,
  },
  ps15: {
    paddingInlineStart: 8,
  },
  pe15: {
    paddingInlineEnd: 8,
  },
  ps25: {
    paddingInlineStart: 25,
  },
  pt0: {
    paddingTop: '0px !important',
  },
  pt2rem: {
    paddingTop: "2rem",
  },
  pt5: {
    paddingTop: 5,
  },
  pt10: {
    paddingTop: 10,
  },
  pt14: {
    paddingTop: 14,
  },
  pt15: {
    paddingTop: '15px !important'
  },
  pt25: {
    paddingTop: 25
  },
  pt30: {
    paddingTop: 30
  },
  pt50: {
    paddingTop: 50
  },
  pt90: {
    paddingTop: 90
  },
  pt2: {
    paddingTop: 1.4,
  },
  pb0: {
    paddingBottom: 0
  },
  pb5: {
    paddingBottom: 5,
  },
  pb10: {
    paddingBottom: 10,
  },
  m10: {
    margin: 10,
  },
  mr10: {
    marginInlineEnd: 10,
  },
  mb5: {
    marginBottom: 5,
  },
  mb10: {
    marginBottom: 10,
  },
  mb15: {
    marginBottom: '15px !important',
  },
  mt20: {
    marginTop: 20,
  },
  mt25: {
    marginTop: 25,
  },
  mb20: {
    marginBottom: 20,
  },
  ml25: {
    marginInlineStart: '25px !important',
  },
  mtNeg15: {
    marginTop: -15,
  },
  mbNeg10: {
    marginBottom: -10,
  },
  mleft5: {
    marginLeft: 5,
  },
  mr5: {
    marginLeft: 5,
  },
  mlr10: {
    marginInline: 10,
  },
  ml0: {
    marginLeft: 0,
    marginInlineStart: 0,
  },
  ml5: {
    marginInline: 5,
  },
  ml10: {
    marginInlineStart: 10,
  },
  mr15: {
    marginInlineEnd: 15,
  },
  mt0: {
    marginTop: 0,
  },
  ml15: {
    marginInlineStart: 15,
  },
  mt10: {
    marginTop: '10px !important',
  },
  mt15: {
    marginTop: 15,
  },
  f12: {
    fontSize: `12px !important`,
  },
  f13: {
    fontSize: '13px !important',
  },
  mxAuto: {
    marginInline: "auto",
  },
  f14: {
    fontSize: '14px !important',
  },
  f15: {
    fontSize: 15,
  },
  f16: {
    fontSize: '16px !important',
  },
  f18: {
    fontSize: 18,
  },
  f20: {
    fontSize: 20,
  },
  f22: {
    fontSize: 22,
  },
  f25: {
    fontSize: 25,
  },
  f28: {
    fontSize: 28,
  },
  f30: {
    fontSize: 30,
  },
  f09rem: {
    fontSize: '0.9rem'
  },
  h50v: {
    height: '50vh'
  },
  h10v: {
    height: '20vh'
  },
  line1: {
    lineHeight: 1,
  },
  colrPrimary: {
    color: '#ff3343'
  },
  bgWhite: {
    backgroundColor: "#ffffff !important",
  },
  bgBrown: {
    backgroundColor: "#636363",
  },
  colorWhite: {
    color: "#fff !important",
  },
  colorGray: {
    color: "rgba(0,0,0,0.40)",
  },
  colorBlue: {
    color: "#0371AD",
  },
  bgGreen: {
    backgroundColor: "green",
  },
  inlineGrid: {
    display: "inline-grid",
  },
  bgLightGray: {
    backgroundColor: "rgba(242, 242, 242, 1)",
  },
  borderRadius30: {
    borderRadius: "30px",
  },
  justifyBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  justifyEvenly: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  tabText: {
    fontSize: 20,
    textTransform: "capitalize",
    padding: '5px 20px',
    minWidth: 150,
    minHeight: 40,
  },
  flexColumn2: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 14,
    paddingInlineEnd: 10,
  },
  txtCenter: {
    textAlign: "center",
    "& input": {
      textAlign: "center",
    },
  },
  bold: {
    fontWeight: "bold",
  },
  semibold: {
    fontWeight: 500,
  },
  semibold600: {
    fontWeight: 600,
  },
  disabled: {
    opacity: ".65",
    pointerEvents: "none !important",
    cursor: "not-allowed !important",
  },
  imageInfo: {
    backgroundColor: "rgba(255,255,255,.5)",
    color: "#000 !important",
  },
  alignCenter: {
    display: "flex",
    alignContent: "center",
  },
  justifyCenterOfCenter: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  spaceBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  spaceEvenly: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  textCapitalize: {
    textTransform: "capitalize",
  },
  textUppercase: {
    textTransform: "uppercase !important",
  },
  noborder: {
    border: "none",
  },
  floatRight: {
    float: "right",
  },
  floatLeft: {
    float: "left",
  },
  wordBreak: {
    wordBreak: "break-all",
  },
  posRelative: {
    position: "relative",
  },
  posAbsolute: {
    position: "absolute",
  },
  iconsFont: {
    fontFamily: "pulseemicons",
    fontSize: 22,
  },
  pageSubTitle: {
    marginTop: 5,
    fontSize: 28,
  },
  subTitle: {
    margin: "0 10px !important",
    // color: "#157eaf",
    color: '#FF0054',
    fontSize: 30,
  },
  packageBoxTitle: {
    color: "#fff",
  },
  packagePriceText: {
    color: "rgb(204, 255, 0)",
  },
  blue: {
    color: "#FF0054",
  },
  bgLightBlue: {
    backgroundColor: "#E3E9F0",
  },
  bgBlack: {
    backgroundColor: "black",
  },
  fBlack: {
    color: "black",
  },
  black: {
    color: "#626262",
  },
  white: {
    color: "white",
  },
  whiteBox: {
    backgroundColor: "#fff",
    boxShadow: "0px 0px 10px 3px rgba(0, 0, 0, .2)",
    padding: 5,
  },
  packageBox: {
    borderRadius: 30,
    // background: 'linear-gradient(145deg, #fff3f3, #ffc2b0)',
    background: 'linear-gradient(0deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
    boxShadow: '5px 5px 10px #999999, -5px -5px 10px #ffffff',
    padding: 5,
  },
  packageBoxQty: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  mt1: {
    marginTop: 5,
  },
  mt2: {
    marginTop: 10,
  },
  mt3: {
    marginTop: 15,
  },
  mt4: {
    marginTop: 20,
  },
  mt5: {
    marginTop: 25,
  },
  mt6: {
    marginTop: 30,
  },
  mt50: {
    marginTop: 50
  },
  mb1: {
    marginBottom: 5,
  },
  mb2: {
    marginBottom: 10,
  },
  mb3: {
    marginBottom: 15,
  },
  mb4: {
    marginBottom: 20,
  },
  mb8: {
    marginBottom: 40,
  },
  mb50: {
    marginBottom: 50,
  },
  mb75: {
    marginBottom: 75,
  },
  m5: {
    margin: ".5rem",
  },
  font12: {
    fontSize: 12,
  },
  font13: {
    fontSize: 13,
  },
  font14: {
    fontSize: 14,
  },
  font15: {
    fontSize: 15,
  },
  font16: {
    fontSize: 16,
  },
  font18: {
    fontSize: 18,
  },
  font20: {
    fontSize: 20,
  },
  font24: {
    fontSize: 24,
  },
  linkNoDesign: {
    textDecoration: "none",
    color: "black",
  },
  font30: {
    fontSize: 30,
  },
  w35: {
    width: '35%'
  },
  w50: {
    width: '50%'
  },
  directionRTL: {
    direction: 'rtl',
  },
  directionLTR: {
    direction: 'ltr',
  },
  wAuto: {
    width: 'auto'
  },
  w100: {
    width: '100% !important'
  },
  h100: {
    height: '100%'
  },
  hAuto: {
    height: 'auto !important'
  },
  pRelative: {
    position: 'ralative'
  },
  borderBox: {
    // border: "3px solid #0371ad",
    margin: "1rem",
    display: "flex",
    padding: "1rem",
    borderRadius: 5,
    flexDirection: "column",
  },
  whiteLink: {
    cursor: "pointer",
    color: "#fff",
    textTransform: "capitalize",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    textDecoration: "underline",
  },
  blackDivider: {
    height: 2,
    backgroundColor: "rgb(0, 0, 0, 0.5)",
    textDecoration: "none",
    color: "#fff",
    textTransform: "capitalize",
    lineHeight: 1,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  blueLink: {
    color: '#0371ad',
    textTransform: 'capitalize',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  size150: {
    width: 127,
    height: 127,
  },
  size130: {
    width: 110,
    height: 110,
  },
  noWrap: {
    flexWrap: "nowrap",
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  infoDiv: {
    height: "100px",
    display: "flex",
    alignItems: "center",
    "@media screen and (max-width: 540px)": {
      width: "100%",
      height: "auto",
      marginTop: 10,
    },
  },
  headInfo: {
    fontSize: "32px",
    fontWeight: "600",
    marginInlineEnd: "10px",
    "@media screen and (max-width: 768px)": {
      fontSize: "26px",
    },
  },
  bodyInfo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "20px",
    height: "20px",
    backgroundColor: "black",
    borderRadius: "50%",
    color: "white",
    cursor: "pointer",
  },
  noBorderOnLastCell: {
    borderInlineEnd: 'none',
  },
  shortcutIcon: {
    position: 'absolute',
    padding: '10px'
  },
  headNo: {
    backgroundColor: "#1c82b2",
    color: "#fff",
    fontSize: "25px",
    border: "1px solid",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginInlineEnd: "10px",
    "@media screen and (max-width: 768px)": {
      width: "30px",
      fontSize: "24px",
      height: "30px",
    },
  },
  headDiv: {
    height: "60px",
    display: "flex",
    alignItems: "center",
  },
  contentHead: {
    color: "#ff3343",
    fontSize: "30px",
    "@media screen and (max-width: 768px)": {
      fontSize: "24px",
    },
  },
  fieldDiv: {
    // height: "100px",
    marginTop: "20px",
    // "@media screen and (max-width: 960px)": {

    //   height: "0"

    // },
  },
  btn: {
    padding: '2px 10px',
    fontWeight: 'bold',
    background: '#fff',
    // maxWidth: 300,
    minHeight: 34,
    color: '#000',
    '& path': {
      stroke: 'inherit',
    },
    "@media screen and (max-width: 400px)": {
      '& .MuiButton-startIcon': {
        width: 'initial'
      }
    },
    '&:hover': {
      background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
      color: '#fff',
      '& svg': {
        color: '#fff',
        fill: '#fff'
      }
    },
    border: '2px solid #F65026',
    '& svg': {
      '&:hover': {
        color: '#fff',
        fill: '#fff'
      }
      // marginLeft: 5,
      // color: '#000'
    },
    '& .MuiButton-startIcon': {
      marginTop: '-2px',
      width: 30,
      '& svg': {
        fontSize: 20
      },
      "@media screen and (max-width: 475px)": {
        width: 'auto',
        marginRight: 0
      }
    },
    '& .MuiButton-endIcon': {
      width: 30
    }
  },
  greenButton: {
    borderColor: '#5db85b',
    backgroundColor: '#5db85b',
    '&:hover': {
      background: '#5db85b',
    }
  },
  redButton: {
    borderColor: '#FF3343',
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#fff',
    border: '2px solid #F65026',
    '&:hover': {
      // background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
      background: '#fff',
      // maxWidth: 300,
      minHeight: 34,
      color: '#000',
      '& path': {
        stroke: 'inherit'
      },
    },
  },
  redButtonLink: {
    // borderColor: '#FF3343',
    backgroundColor: '#FFF',
    color: '#FF3343',
    '&:hover': {
      background: '#FF3343',
      color: '#fff'
    },
  },
  btnNohover: {
    '&:hover': {
      background: '#fff',
      '& svg': {
        color: '#FF0054'
      }
    },
  },

  btnDisabled: {
    opacity: 0.7,
    pointerEvents: 'none'
  },
  btnRounded: {
    borderRadius: 20,
  },
  buttonForm: {
    display: "flex",
    flexDirection: "column",
  },
  buttonHead: {
    fontSize: "20px",
    marginBottom: "10px",
    // "@media screen and (max-width: 414px)": {
    //   fontSize: 16
    // }
  },
  buttonContent: {
    fontSize: 14,
  },
  alertMsg: {
    color: "#ca332f",
  },
  buttonField: {
    // borderRadius: "5px",
    // border: "1px solid #bbb",
    outline: "none",
    padding: "8px 12px 8px 4px",
    fontSize: "16px",
    "&::placeholder": {
      fontSize: "16px",
    },
  },
  buttonFieldRemoval: {
    borderRadius: "5px",
    // border: "1px solid #bbb",
    maxWidth: '100px !important',
    outline: "none",
    padding: "8px",
    width: 100,
    backgroundColor: "#e9ecef",
    "&::placeholder": {
      fontSize: "16px",
    },
    "& .Mui-disabled": {
      color: "#000",
    },
    "@media screen and  (max-width: 960)": {
      width: "100%",
    },
  },
  buttonFieldRemovalMobile: {
    borderRadius: "5px",
    border: "1px solid #bbb",
    outline: "none",
    // padding: "8px",
    "&::placeholder": {
      fontSize: "16px",
    },
    "&:disabled": {
      color: "black",
    },
  },
  success: {
    borderBottom: "1px solid green",
  },
  error: {
    borderBottom: "1px solid red !important",
  },
  errorFullBorder: {
    border: "3px solid red !important",
  },
  valid: {
    borderBottom: "1px solid #008000 !important",
  },
  msgHead: {
    fontSize: "20px",
    "@media screen and (max-width: 768px)": {
      marginTop: "40px",
    },
  },
  msgArea: {
    resize: "none",
    height: "240px",
    boxSizing: "border-box",
    fontSize: "16px",
    fontFamily: "Sans-serif",
    overflow: "hidden",
    marginTop: 5,
    overflowY: "auto",
    width: "100%",
    border: "1px solid #ced4da",
    borderBottom: "none",
    outline: "none",
    padding: "10px !important",
    borderTopLeftRadius: ".25rem",
    borderTopRightRadius: ".25rem",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
    },
  },
  textarea: {
    resize: "none",
    height: "200px",
    boxSizing: "border-box",
    fontSize: "16px",
    fontFamily: "Sans-serif",
    overflow: "hidden",
    marginTop: 5,
    overflowY: "auto",
    width: "100%",
    border: "1px solid #ced4da",
    outline: "none",
    padding: "10px !important",
    borderRadius: ".25rem",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
    },
  },
  smallInfoDiv: {
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    top: "-4px",
    justifyContent: "flex-end",
    alignItems: "center",
    color: "#ff3343",
    fontSize: "12px",
    padding: "10px",
    border: "1px solid #ced4da",
    borderTop: "none",
  },
  funcDiv: {
    width: "100%",
    height: "auto",
    boxSizing: "border-box",
    position: "relative",
    top: "-4px",
    padding: 5,
    border: "1px solid #ced4da",
    borderTop: "none",
    alignItems: "center",
    borderBottomLeftRadius: ".25rem",
    borderBottomRightRadius: ".25rem",
  },
  mergeGroup: {
    '& .MuiPaper-root': {
      maxWidth: 'calc(40vw)',
      width: 'calc(40vw)',
    }
  },
  templateModal: {
    // minWidth: "900px",
    minWidth: '60vw',
    '& .preview-btn': {
      height: 30,
      background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
      color: '#fff',
      fontWeight: 'bold'
    },
    '& .category-container': {
      paddingLeft: 10,
      "@media screen and (max-width: 900px)": {
        '& p': {
          fontSize: '15px !important'
        }
      },
    },
    "@media screen and (max-width: 1278px)": {
      padding: '0px 10px',
    },
    "@media screen and (max-width: 900px)": {
      '& #name, #buttons': {
        fontSize: '13px'
      }
    },
    "@media screen and (min-width: 759px) and (max-width: 1200px)": {
      '& .category-container': {
        maxWidth: '25%',
        flexBasis: '25%'
      },
      '& .template-container': {
        maxWidth: '75%',
        flexBasis: '75%'
      },
    },
    '& .template-item': {
      "@media screen and (max-width: 768px)": {
        maxWidth: '100%',
        flexBasis: '100%'
      },
      "@media screen and (min-width: 768px) and (max-width: 1024px)": {
        maxWidth: '50%',
        flexBasis: '50%'
      },
      "@media screen and (min-width: 1024px) and (max-width: 1200px)": {
        maxWidth: '33.33%',
        flexBasis: '33.33%'
      },
      "@media screen and (min-width: 1200px)": {
        maxWidth: '25%',
        flexBasis: '25%'
      },
    },
  },
  beeTemplate: {
    padding: '0px !important',
    margin: '0px !important',
    minHeight: 'calc(70vh)',
    minWidth: 'calc(90vh)',
    '& .dialogChildren': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    "& .MuiDialog-paperWidthSm": {
      minWidth: `70vw !important`,
      maxWidth: `70vw !important`,
    },
  },
  templateItem: {
    border: 'solid 1px #000',
    padding: 0,
    textAlign: 'center',
    borderRadius: 3,
    height: '200px',
    minHeight: '200px',
    maxHeight: '200px',
    overflow: 'hidden',
    transition: 'all 0.1s ease',
    '& label': {
      zoom: '25%',
      pointerEvents: 'none'
    },
    "&.selected": {
      border: "solid 5px #ff3343"
    }
  },
  removeTemplateItem: {
    position: 'absolute',
    top: 6,
    color: '#FFF',
    right: isRTL ? 'auto' : 15,
    left: isRTL ? 25 : 'auto',
    background: 'red',
    padding: '2px 5px 0px 5px',
    borderRadius: 5,
    fontSize: '1.2rem',
    cursor: 'pointer',
    '& svg': {
      marginInline: 2,
    },
    zIndex: 100
  },
  baseButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: "100%",
    borderInlineEnd: "1px solid grey",
    "@media screen and (max-width: 768px)": {
      borderInlineEnd: 'none'
    },
    "@media screen and (max-width: 540px)": {
      flexDirection: "column-reverse",
      paddingInlineEnd: "8px",
    },
  },
  infoButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: 14,
    color: "white",
    padding: "5px 15px 5px 15px",
    backgroundColor: "#ff3343",
    cursor: "pointer",
    border: "solid 1px #ff3343",
    textTransform: "none",
    [theme.breakpoints.down("xs")]: {
      width: 'auto !important',
      margin: '5px !important',
      fontSize: '14px !important',
      padding: '5px 10px !important',
    },
    "&$disabled": {
      cursor: "not-allowed !important",
    },
    "&:hover": {
      backgroundColor: "#ff334",
      border: 'solid 1px #ff3343',
      color: '#ff3343',
      "& *": {
        color: '#ff3343'
      }
    },
    "&:first-child": {
      marginInlineStart: 5,
      marginInlineEnd: 5,
    },
    "&:nth-child(2)": {
      marginInlineStart: 0,
      marginInlineEnd: 5,
    },
    "&:nth-child(3)": {
      marginInlineStart: 0,
      marginInlineEnd: 5,
    },
    "@media screen and (max-width: 1366px)": {
      fontSize: 11,
    },
    "@media screen and (max-width: 768px)": {
      width: "110px",
      padding: "8px",
      marginBottom: 5,
      fontSize: 11,
    },
    "@media screen and (max-width: 530px)": {
      "&:first-child": {
        marginInlineStart: 0,
        marginInlineEnd: 0,
      },
      "&:nth-child(2)": {
        marginInlineStart: 0,
        marginInlineEnd: 0,
      },
    },
    "@media screen and (max-width: 375px)": {
      "&:first-child": {
        marginInlineStart: 5,
        marginInlineEnd: 0,
      },
      "&:nth-child(2)": {
        marginInlineStart: 5,
        marginInlineEnd: 0,
      },
    },
  },
  selectMsg: {
    height: "100%",
    borderInlineEnd: "1px solid grey",
    display: "flex",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    "@media screen and (max-width: 1366px)": {
      paddingLeft: 5,
      paddingRight: 0,
    },
    "@media screen and (max-width: 768px)": {
      borderRight: "none",
      borderLeft: "none",
    },
  },
  selectGroupDiv: {
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    width: "90%",
    "@media screen and (max-width: 450px)": {
      width: "calc(100% - 50px)",
    },
  },
  selectVal: {
    outline: "none",
    padding: "10px",
    width: "100%",
    minWidth: 150,
    marginInlineEnd: "5px",
    marginInlineStart: "5px",
    borderRadius: "5px",
    border: "1px solid #ced4da",
    backgroundColor: "#fff",
    "@media screen and (max-width: 1366px)": {
      minWidth: 130,
    },
    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginTop: "8px",
    },
  },
  sortBySelect: {
    width: 200,
    paddingLeft: 5,
    color: '#000 !important',
    '& #groupOrder': {
      padding: '5px !important',
      border: 'none',
    },
    '& fieldset': {
      border: 'none',
    }
  },
  addDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",

    width: "80px",
  },
  addButtons: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "600",
    "@media screen and (max-width: 768px)": {
      padding: "5px",
    },
  },
  rightForm: {
    display: "flex",
    alignItems: "center",
  },
  rightInput: {
    outline: "none",
    padding: "10px",
    width: "220px",
    height: "23px",
    border: "1px solid #BBBBBB",
    borderRadius: "4px",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  descSwitch: {
    width: "200px",
    fontSize: "15px",
    marginTop: "5px",
    color: "#C2C2C2",
    fontWeight: "600",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  rightSend: {
    display: "flex",
    width: "70px",
    border: "1px solid green",
    color: "green",
    height: "25px",
    padding: "9px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
  },
  rightInput2: {
    outline: "none",
    padding: "10px",
    border: "1px solid #efefef",
    width: "240px",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },

  buttonDiv: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    bottom: "10px",
    marginBottom: "40px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column-reverse",
    },
  },
  buttonDivAct: {
    position: "relative",
    bottom: "10px",
    display: "flex",
    alignItems: "center",

    marginBottom: "40px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column-reverse",
    },
  },
  rightInput3: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "15px",
    borderRadius: "30px",
    width: "50px",
    cursor: "pointer",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    borderColor: "#dc3545",
    backgroundImage: "linear-gradient(180deg,#d9534f 0,#c9302c)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    "@media screen and (max-width: 768px)": {
      marginInlineEnd: "0px",
      height: "30px",
      width: "90%",
      marginBottom: "8px",
    },
  },
  rightInput4: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "15px",
    borderRadius: "30px",
    cursor: "pointer",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "80px",
    borderColor: "#5b9bcd",
    background: "linear-gradient(180deg,#5b9bcd 0,#4678a3)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    "@media screen and (max-width: 768px)": {
      marginInlineEnd: "0px",
      height: "30px",
      width: "90%",
      marginBottom: "8px",
    },
  },
  rightInput5: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "15px",
    borderRadius: "30px",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    cursor: "pointer",
    width: "80px",
    borderColor: "#5b9bcd",
    background: "linear-gradient(180deg,#5b9bcd 0,#4678a3)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    "@media screen and (max-width: 768px)": {
      marginInlineEnd: "0px",
      height: "30px",
      width: "90%",
      marginBottom: "8px",
    },
  },
  rightInput6: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "12px",
    cursor: "pointer",
    borderRadius: "30px",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "100px",
    borderColor: "#449d44",
    backgroundImage: "linear-gradient(180deg,#5cb85c 0,#449d44)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    "@media screen and (max-width: 768px)": {
      marginInlineEnd: "0px",
      height: "30px",
      width: "90%",
      marginBottom: "8px",
    },
  },
  summaryBtn: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "12px",
    cursor: "pointer",
    borderRadius: "30px",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "100px",
    borderColor: "#449d44",
    // backgroundImage: "linear-gradient(180deg,#5cb85c 0,#449d44)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    "@media screen and (max-width: 768px)": {
      marginInlineEnd: "0px",
      height: "30px",
      width: "90%",
      marginBottom: "8px",
    },
  },
  phoneNumber: {
    position: "absolute",
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    top: 95,
    fontSize: 12,
    "@media screen and (max-width: 768px)": {
      top: 90,
      right: 0,
      margin: "0 auto",
      fontSize: 16,
    },
    "@media screen and (max-width: 560px)": {
      top: 100,
      fontSize: 14,
    },
    "@media screen and (max-width: 414px)": {
      top: 73,
      fontSize: 14,
    },
    "@media screen and (max-width: 375px)": {
      top: 80,
      fontSize: 12,
    },
    "@media screen and (max-width: 360px)": {
      top: 78,
      fontSize: 12,
    },
  },
  testDiv: {
    marginInlineStart: "35px",
    display: "flex",
    marginTop: "20px",
    "@media screen and (max-width: 768px)": {
      marginInlineStart: "0px",
    },
  },
  testRadios: {
    marginTop: "10px",
    marginInlineStart: "35px",
    "@media screen and (max-width: 768px)": {
      marginInlineStart: "0px",
    },
  },
  phoneNumberSumm: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    top: "92px",
    marginInlineStart: "133px",
    fontSize: "15px",
  },
  // phoneNumberSum: {
  //   top: "24%",
  //   left: "38%",
  //   position: "absolute",
  //   fontWeight: "700",
  //   fontSize: "15px",
  // },
  chat: {
    backgroundColor: "#3da6f6",
    color: "#fff",
    maxWidth: "260px",
    backgroundAttachment: "fixed",
    minWidth: "100px",
    padding: "8px",
    minHeight: "30px",
    wordBreak: "break-all",
    borderRadius: "12px",
    fontWeight: "500",
    maxHeight: "200px",
    "@media screen and (max-width: 768px)": {
      top: "180px",
      bottom: "0",
      left: "50px",
      right: "0",
    },
    "@media screen and (device-width: 360px)": {
      top: "180px",
      bottom: "0",
      left: "40px",
      right: "0",
    },
    "@media screen and (device-width: 411px)": {
      top: "180px",
      bottom: "0",
      left: "65px",
      right: "0",
    },
    "@media screen and (device-width: 414px)": {
      top: "180px",
      bottom: "0",
      left: "65px",
      right: "0",
    },
    "@media screen and (device-width: 320px)": {
      top: "180px",
      bottom: "0",
      left: "20px",
      right: "0",
    },
    "&:before": {
      content: "",
      position: "absolute",
      zIndex: 0,
      bottom: 0,
      right: "-8px",
      height: "20px",
      width: "20px",
      background: "#3da6f6",
      backgroundAttachment: "fixed",
      bordeBottomLefRadius: "15px",
    },
    "&:after": {
      content: "",
      position: "absolute",
      zIndex: "1",
      bottom: "0",
      right: "-10px",
      width: "10px",
      height: "20px",
      background: "#fff",
      borderBottomLeftRadius: "10px",
    },
  },
  wrapChatSumm: {
    position: "absolute",
    top: "130px",
    left: "13%",
    backgroundColor: "#fff",
    color: "#fff",
    borderRadius: "12px",
    height: "200px",
    overflowY: "auto",
    width: "260px",
    wordBreak: "break-all",
    "&::-webkit-scrollbar": {
      visibility: "hidden",
      width: "0px",
    },
  },
  chatBox: {
    display: "flex",
    justifyContent: isRTL ? "flex-start" : "flex-end",
    wordBreak: "break-all",
  },
  chatBoxHe: {
    display: "flex",
    wordBreak: "break-all",
  },
  wrapChat: {
    position: "absolute",
    top: "115px",
    width: 'calc(100% - 110px)',
    height: 240,
    left: "auto",
    right: 45,
    wordBreak: "break-all",
    color: "#fff",
    borderRadius: "12px",
    overflowY: "auto",
    padding: 10,
    // "@media screen and (max-width: 1530px)": {
    //   width: 308
    // },
    // "@media screen and (max-width: 1430px)": {
    //   right: 50,
    // },
    // "@media screen and (max-width: 1366px)": {
    //   width: 270,
    // },
    "@media screen and (max-width: 1260px)": {
      top: 125,
      // right: 50,
    },
    "@media screen and (max-width: 768px)": {
      // right: 45,
      // width: 250,
      height: 230,
    },

    "@media screen and (max-width: 414px)": {
      top: 100,
      right: 30,
      width: 'calc(100% - 82px)',
      height: 160,
    },
    "@media screen and (max-width: 360px)": {
      top: 105,
      right: 38,
      width: 'min-content',
      height: 'auto',
    },
    "@media screen and (max-width: 320px)": {
      top: 90,
      right: 38,
      left: "auto",
      width: 'min-content',
      height: 'auto',
    },
  },
  fromMe: {
    alignSelf: "flex-end",
    borderRadius: "1.15rem",
    lineHeight: "1.25",
    // maxWidth: '79%',
    minHeight: "53px",
    padding: "0.5rem .875rem",
    position: "relative",
    minWidth: 200,
    wordWrap: "break-word",
    backgroundColor: "#3da6f6",
    color: "#fff",
    fontSize: 16,
    "& p": {
      wordBreak: "break-word",
    },
    "&::before": {
      borderBottomLeftRadius: "0.8rem 0.7rem",
      borderRight: "1rem solid #3da6f6",
      right: "-0.35rem",
      transform: "translate(0, -0.1rem)",
      bottom: "-0.1rem",
      content: `''`,
      height: "1rem",
      position: "absolute",
    },
    "&::after": {
      backgroundColor: "#fff",
      borderBottomLeftRadius: "0.5rem",
      right: "-40px",
      transform: "translate(-30px, -2px)",
      width: "10px",
      bottom: "-0.1rem",
      content: `''`,
      height: "1rem",
      position: "absolute",
    },
    "@media screen and (max-width: 414px)": {
      minWidth: 150,
    },
    "@media screen and (max-width: 360px)": {
      minWidth: 140,
    },
  },
  groupName: {
    display: "block",
    fontSize: "32px",
    width: "100%",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      fontSize: "22px",
      textAlign: 'start'
    },
  },
  fieldsRequire: {
    fontSize: "18px",
    color: "red",
    fontWeight: "400",
    "& li": {
      marginTop: 5,
    },
    "@media screen and (max-width: 768px)": {
      fontSize: "12px !important",
      marginBottom: "4px",
    },
  },
  baseDialogSetup: {
    height: "60px",
    borderBottom: "1px solid #DEE2E7",
    "@media screen and (max-width: 768px)": {
      height: "auto",
    },
  },
  bodyTextDialog: {
    fontSize: "22px",
    marginTop: "5px",
    "@media screen and (max-width: 768px)": {
      fontSize: "16px",
    },
  },
  modalDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "700px",
    marginTop: "20px",
  },
  modalSearch: {
    width: "100%",
    padding: "10px",
    outline: "none",
  },
  confirmButton: {
    outline: "none",
    padding: "10px",
    borderRadius: "30px",
    height: "30px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "130px",
    borderColor: "#449d44",
    backgroundColor: "#449d44",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginTop: "20px",
  },
  cancelBtn: {
    outline: "none",
    padding: "10px",
    borderRadius: "30px",
    height: "30px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "130px",
    borderColor: "#c9302c",
    backgroundColor: "#c9302c",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginTop: "20px",
  },
  saveButton: {
    outline: "none",
    padding: "10px",
    borderRadius: "30px",
    height: "30px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "130px",
    borderColor: "#4678a1",
    backgroundColor: "#4678a1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginTop: "20px",
  },
  dropDiv: {
    position: "absolute",
    width: "200px",
    height: "150px",
    top: "-150px",
    left: "20px",
    display: "flex",
    flexDirection: "column",
    "@media screen and (max-width: 768px)": {
      top: "40px",
      left: "0",
      right: "0",
      bottom: "0",
      width: "100%",
      zIndex: "999",
    },
  },
  dropCon: {
    cursor: 'pointer',
    marginBottom: "8px",
    border: "1px solid #ff3343",
    boxShadow: "0 3px 5px 1px #e0dada",
    borderRadius: "15px",
    backgroundColor: "#fff",
    padding: "10px",
    width: "100%",
    color: "#ff3343",
    textAlign: "center",
  },
  listDiv: {
    height: "300px",
    maxHeight: "200px",
    width: "100%",
    overflowX: "hidden",
    marginTop: "20px",
    overflow: "auto",
  },
  listDivFilter: {
    height: 130,
    width: "100%",
    overflowY: "auto",
    borderBottom: "1px solid #efefef",
    borderLeft: "1px solid #efefef",
    borderRight: "1px solid #efefef",
    marginTop: "0",
  },
  searchCon: {
    padding: 5,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    width: '100%',
    "&:hover": {
      backgroundColor: "#efefef",
    },
    '@media screen and (max-width: 414px)': {
      top: 120,
      right: 42
    },
    '@media screen and (max-width: 360px)': {
      top: 105,
      right: 38
    },
    '@media screen and (max-width: 320px)': {
      top: 90,
      right: 38,
      left: 'auto'
    },
  },
  conInfo: {
    fontSize: "22px",
    color: "#555",
    marginInlineEnd: "5px",
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
      paddingTop: 5,
      paddingBottom: 10
    },
  },
  tabDiv: {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    minHeight: 40

    // "@media screen and (max-width: 768px)": {
    //   width: "315px",
    // },
    // "@media screen and (device-width: 411px)": {
    //   width: "355px",
    // },
  },
  directSendTab: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    color: "#777777",
    width: 120,
    cursor: 'pointer',
    borderBottom: '4px solid transparent',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    "@media screen and (max-width: 768px)": {
      fontSize: "14px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '15px !important',
      width: 80,
      height: 30,
    },
  },
  tab1: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    color: "#777777",
    width: '100%',
    cursor: 'pointer',
    borderBottom: '4px solid transparent',
    "@media screen and (max-width: 768px)": {
      fontSize: "14px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '15px !important'
    },
  },
  tablistRoot: {
    '& .MuiTabs-fixed': {
      '& .MuiTabs-flexContainer': {
        height: '100%',
        background: '#fff',
        borderRadius: 10,
        borderBottomRightRadius: 0,
      },
    },
    '& .MuiTabs-scroller': {
      overflow: 'auto !important'
    }
  },
  btnTab: {
    fontSize: 20,
    textTransform: "capitalize",
    minWidth: 100,
    height: 'auto',
    // color: '#ff2c44',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    background: '#e4e4e4',
    marginLeft: 2,
    marginRight: 2,
    color: '#000',
    // border: '1px solid rgba(0,0,0,.125)',
    borderBottom: 0,
    '&.alignCenter': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    [theme.breakpoints.down("xs")]: {
      minWidth: 'auto',
      fontSize: 16,
    },
  },
  currentActiveTab: {
    borderBottom: '4px solid #ff2c44 !important',
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#fff !important',
    '& svg': {
      color: '#fff',
    }
  },
  activeTab: {
    borderBottom: '4px solid #ff2c44 !important',
    color: "#ff2c44 !important",
  },
  "@media screen and (max-width: 768px)": {
    width: "100%",
    marginInlineStart: "0px",
    // marginBottom:"30px"
  },
  phoneDiv: {
    position: 'relative',
    maxHeight: '100%',
    overflowY: 'clip',
    "@media screen and (max-width: 960px)": {
      marginTop: 0,
    },
    "@media screen and (max-width: 768px)": {
      marginTop: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "@media screen and (max-width: 566px)": {
      marginTop: 25,
    },
  },
  groupsMan: {
    width: "700px",
    border: "1px solid #efefef",
    padding: "4px",
    "@media screen and (max-width: 768px)": {
      width: "315px",
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
    },
  },
  groupsMan1: {
    width: "700px",
    display: "flex",
    "@media screen and (max-width: 768px)": {
      width: "315px",
      flexWrap: "wrap",
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      flexWrap: "wrap",
    },
  },
  reciFilter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "8px",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff",
    },
    "@media screen and (max-width: 768px)": {
      width: "30%",
      fontSize: "14px",
    },
  },
  selectSort: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "7px",
    borderRadius: "4px",
    // width:"150px",
    outline: "none",
    height: "40px",
    fontSize: "17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff",
    },
    "@media screen and (max-width: 768px)": {
      width: "100%",
      fontSize: "14px",
    },
  },
  arrowSort: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#007bff",
    border: "1px solid #007bff",
    padding: "7px",
    borderRadius: "4px",
    height: "25px",
    fontSize: "17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff",
    },
  },
  selectedContact: {
    width: "700px",
    maxWidth: "700px",
    height: "50px",
    backgroundColor: "#efefef",
    maxHeight: "50px",
    display: "flex",
    flexWrap: "wrap",
    overflowY: "auto",
    "@media screen and (max-width: 768px)": {
      width: "315px",
      fontSize: "14px",
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      fontSize: "14px",
    },
  },
  bubble: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    height: "24px",
    color: "#ffffff",
    width: "70px",
    borderRadius: "20px",
    fontSize: "16px",
    margin: "6px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "20px",
    padding: "12px",
    "&:hover": {
      backgroundColor: "#efefef",
    },
  },
  graphCampaignName: {
    fontWeight: "bold",
    maxWidth: graphTextWidth[windowSize],
  },
  greyButtonWithRoundCorder: {
    background: '#535353',
    color: '#fff',
    borderRadius: '20px'
  },
  mt24: {
    marginTop: 24,
  },
  mb25: {
    marginBottom: 25,
  },
  fullSize: {
    height: "100%",
    width: "100%",
  },
  baseButtonsContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: "15px",
    paddingBottom: 20,
    width: "100%",
    display: "flex",
    marginTop: "auto",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column-reverse",
      justifyContent: "center",
      paddingBottom: "45px",
      marginTop: "auto",
      marginBottom: "40px",
      width: "100% !important",
    },
  },
  flexColCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  marginLeftAuto: {
    marginLeft: "auto !important",
  },
  marginRightAuto: {
    marginRight: "auto !important",
  },
  deleteIcon: {
    color: "#fff",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 28,
  },
  fullWidth: {
    maxWidth: '100% !important',
    width: "100% !important",
  },
  width90P: {
    width: "90%",
  },
  errorLabel: {
    marginTop: 8,
    color: "red",
    fontSize: 12,
  },
  columnError: {
    borderBottom: "2px solid red",
    // padding: "4px"
  },
  modalInputForm: {
    "@media screen and (max-width: 375px)": {
      maxWidth: "calc(100% - 20px)",
    },
  },
  //#region Dialog
  dialogIconContainer: {
    paddingTop: 60,
    paddingBottom: 15,
    textAlign: "center",
    color: "#fff",
    borderRadius: 200,
    backgroundColor: "#0371ad",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: -50,
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
  solidDialogExitButton: {
    fontSize: 30,
    fontFamily: 'Assistant',
    textAlign: "center",
    color: "#000",
    fontWeight: "700",
    position: "absolute",
    top: "0.5rem",
    cursor: "pointer"
  },
  dialogExitButton: {
    fontSize: 30,
    fontFamily: 'Assistant',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '700',
    position: 'absolute',
    // top: '0.2rem',
    cursor: 'pointer',
    '& svg': {
      color: '#fff'
    }
  },
  btnBgExitDialog: {
    backgroundColor: "#0371ad",
  },
  btnNoBgExitDialog: {
    background: "none",
    color: "#000"
  },
  dialogExitButtonRTL: {
    left: '1.2rem',
  },
  dialogExitButtonLTR: {
    right: '1rem',
  },
  solidDialog: {
    display: "flex",
    flexDirection: "column",
    margin: "1rem",
    padding: "1rem",
    paddingTop: 0,
    minWidth: dialogWidth[windowSize],
    maxWidth: dialogWidth[windowSize],
    backgroundColor: '#f5f5f5',
    '& .title': {
      '& p': {
        color: '#000',
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 700
      }
    }
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    border: "3px solid #0371ad",
    borderRadius: 5,
    margin: "1rem",
    padding: "1rem",
    minWidth: dialogWidth[windowSize],
    "& $notification": {
      "& $iconWrapper": {
        margin: iconWrapperMargin[windowSize],
        minWidth: iconWrapperMinWidth[windowSize],
      },
      "& b, & textarea": {
        fontSize: notificationTitleFontSize[windowSize],
      },
    },
    "& $dialogChildren": {
      maxHeight:
        windowSize === "xs" || windowSize === "sm" ? "100vh" : "calc(65vh)",
      "& $phoneNumber": {
        "@media screen and (max-width: 560px)": {
          top: "70px !important",
          fontSize: 14,
        },
        "@media screen and (max-width: 414px)": {
          top: "65px !important",
          fontSize: 12,
        },
        "@media screen and (max-width: 375px)": {
          "& $phoneNumber": {
            top: 58,
            fontSize: 12,
          },
        },
      },
      "& $wrapChat": {
        "@media screen and (max-width: 560px)": {
          top: 110,
        },
        "@media screen and (max-width: 414px)": {
          top: "90px !important",
          right: 30,
          width: 190,
          height: 135,
        },
        "@media screen and (max-width: 375px)": {
          top: 75,
          right: 26,
          width: 180,
          height: 135,
        },
      },
    },
    "& $mobileBG": {
      "& $iconWrapper": {
        minWidth: windowSize === "xs" ? 0 : 100,
      },
    },
  },
  solidDialogButton: {
    fontFamily: "OpenSansHebrew",
    color: "#fff",
    textTransform: "capitalize",
    width: 120,
    fontSize: 18,
    borderRadius: 8,
    boxShadow: 'none !important',
    border: 'none !important'
  },
  dialogButton: {
    fontFamily: "OpenSansHebrew",
    color: "#fff",
    textTransform: "capitalize",
    width: 120,
    fontSize: 18,
    borderRadius: 50,
  },
  dialogButtonResponive: {
    marginInline: 10,
    "@media screen and (max-width: 768px)": {
      fontSize: 14,
      marginTop: 5,
      marginBottom: 5,
      width: 100
    },
  },
  dialogButtonCenter: {
    margin: "0 auto",
    height: 40,
    fontSize: 18,
    fontWeight: 400,
  },
  dialogConfirmButton: {
    backgroundImage: "linear-gradient(to bottom, #5cb85c 0%, #449d44 100%)",
    backgroundRepeat: "repeat-x",
    border: "1px solid #345233",
    borderTop: "0px solid #345233",
    boxShadow: "0px 3px 3px #345233",
    maxWidth: 250,
  },
  dialogCancelButton: {
    background: "#c9302c",
    backgroundImage: "linear-gradient(to bottom, #d9534f 0%, #c9302c 100%)",
    border: "1px solid darkred",
    borderTop: "0px solid darkred",
    boxShadow: "0px 3px 3px darkred",
    maxWidth: 150,
  },
  dialogBlueButton: {
    background: '#006996',
    // backgroundImage: "linear-gradient(to bottom, #d9534f 0%, #c9302c 100%)",
    border: '1px solid #006996',
    borderTop: '0px solid #006996',
    boxShadow: '0px 3px 3px #006996',
    // maxWidth: 150,
  },
  dialogConfirmBlueButton: {
    backgroundImage: "linear-gradient(180deg,#5b9bcd 0%,#4678a3 100%)",
    maxWidth: 150,
  },
  dialogButtonsContainer: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    "@media screen and (max-width: 375px)": {
      "& .MuiGrid-item": {
        padding: "5px !important",
        marginTop: 15,
        marginBottom: 15,
      },
    },
  },
  //#endregion
  textCenter: {
    textAlign: "center !important",
  },
  marginBlock10: {
    marginBlock: 10,
  },
  marginBlock20: {
    marginBlock: 20,
  },
  MuiChipRoot: {
    backgroundColor: "#FF3343 !important",
    marginRight: 5,
    "& span": {
      color: "#fff",
      fontWeight: 500,
    },
    "& .MuiChip-deleteIcon": {
      color: "#fff",
      fill: "currentColor",
    },
  },
  roundedBorder: {
    borderRadius: 50,
  },
  tooltipText: {
    ontWeight: 400,
    fontSize: 16,
    direction: isRTL ? 'rtl' : 'ltr',
    color: '#fff'
  },
  autoCompleteTag: {
    '& .MuiAutocomplete-tag': {
      backgroundColor: '#fff',
      border: 'solid 2px #F65026',
      color: '#000',
      fontWeight: 'bold',
      '& .MuiChip-deleteIcon': {
        fill: '#F65026'
      }
    }
  },
  noHoverBg: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  p5: {
    padding: 5
  },
  p15: {
    padding: 10
  },
  maxContent: {
    width: 'max-Content'
  },
  alignDir: {
    textAlign: isRTL ? "right" : "left"
  },
  '.MuiAccordion-root': {
    '&::before': {
      top: '-1px',
      left: 0,
      right: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: 'absolute',
      transition: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      backgroundColor: 'rgba(0, 0, 0, 0.12)'
    }
  },
  customScroll: {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      'boxShadow': 'inset 0 0 5px #e9e9e9',
      'borderRadius': '10px',
    },
  },
  comingSoonTab: {
    marginInlineStart: 10,
    padding: '2px 10px',
    borderRadius: 5,
    borderBottomRightRadius: 0,
    background: '#fff',
    color: '#000'
  },

  areaManual: {
    border: "2px dashed rgba(0,0,0,.2)",
    // height: "400px",
    backgroundColor: "white !important",
    "@media screen and (max-width: 768px)": {
      width: "auto",
    },
  },
  greenManual: {
    border: "2px dashed #4BB543",
    // height: "400px",
    backgroundColor: "#CCFFE5",
    "@media screen and (max-width: 768px)": {
      width: "auto",
    },
  },

  editorCont: {
    marginTop: 40,
    marginBottom: 50,
    // background: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // '& .head': {
    //   background: '#F0F5FF',
    //   borderTopLeftRadius: 10,
    //   borderTopRightRadius: 10,
    // },
    // '& .mgmtTitle': {
    //   fontSize: 22,
    //   width: '100%'
    // },
    '& .containerBody': {
      paddingInline: 20,
      paddingTop: 20,
      backgroundColor: '#fff',
      border: "2px solid #F0F5FF",
      [theme.breakpoints.down("xs")]: {
        paddingTop: 10,
        paddingInline: 10,
      },

      '& .stepHead': {
        fontSize: 20,
        display: 'flex',
        '& .stepNum': {
          padding: '6px 12px',
          fontWeight: 700,
          background: 'red',
          color: '#fff',
          // alignSelf: 'center'
        },
        '& .stepTitle': {
          // paddingInline: '6px',
          // alignSelf: 'center'
          // background: 'red',
          marginInlineStart: 5,
          margin: 'auto',
          paddingTop: 5,
          paddingBottom: 5
        },
        '& .stepDesc': {
          fontSize: 20,
          margin: 'auto',
          marginInline: 5,
          paddingTop: 5,
          paddingBottom: 5,
          "@media screen and (max-width: 768px)": {
            fontSize: 15,
          },
        }
      },
      '& .bodyBlock': {
        paddingInline: 10,
        [theme.breakpoints.down('xs')]: {
          paddingInline: 0
        },
      },
      '& .selectWrapper': {
        height: 'auto',
        '& .MuiSelect-root': {
          padding: '7px 0 11px 0px'
        },
        '& .bottomAlignedSelect': {
          '& .MuiSelect-root': {
            padding: '11px 0px 2px 0'
          },
          '& .MuiInputAdornment-root': {
            marginTop: 8
          }
        },
        '& .MuiTypography-body1': {
          marginLeft: isRTL ? 12 : 0
          // marginRight isRTL ? 0 : 12,
          // marginLeft: isRTL ? 12 : 0
        }

      },
      '& .textBoxWrapper': {
        // paddingTop: 30,
        '& .MuiTypography-body1': {
          color: '#979797',
          wordBreak: 'break-all',
        },
        '& .MuiTextField-root': {
          paddingBottom: 8,
          paddingTop: 8,
          // maxWidth: 245,
          '&.fullWidth': {
            maxWidth: '100%'
          },
          '& input': {
            padding: 0
          }
        },
      }
    }
  },

  settingsContainer: {
    height: '100%',
    marginBottom: 68,
    background: '#fff',
    marginTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    '& .head': {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      '& .mgmtTitle': {
        fontSize: 20
      }
    },
    '& .link': {
      fontSize: 15,
      color: '#FF0054',
      padding: '2px 0',
      // marginTop: 28,
      marginLeft: 0
    },
    '& .containerBody': {
      position: 'relative',
      paddingBottom: 48,
      // minHeight: 'calc(100vh - 10em)',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      border: "2px solid #F0F5FF",
      backgroundColor: '#fff',
      paddingInline: 17.2,
      '& .settingsWrapper': {
        '& .mgmtTitle': {
          fontSize: 18,
          width: '100%'
        },
        '& .formContainer': {
          position: 'relative',
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 10,
          [theme.breakpoints.down("xs")]: {
            paddingLeft: 0,
            paddingRight: 0,
          },
          '& .form': {
            maxWidth: 900,
            background: '#fff',
            zIndex: 100,
            position: 'relative',
          },
          '& .svg_data_analysis': {
            position: 'absolute',
            right: isRTL ? 'auto' : 85,
            left: isRTL ? 85 : 'auto',
            top: 49.17,
            transform: isRTL ? 'scaleX(1)' : 'scaleX(-1)'
          },
          '& .svg_app_settings': {
            position: 'absolute',
            top: 121.3,
            right: isRTL ? 'auto' : 90,
            left: isRTL ? 90 : 'auto',
            transform: isRTL ? 'scaleX(1)' : 'scaleX(-1)'
          },
          '& .subHeading': {
            marginTop: 39,
            color: '#000'
          },
          '& .MuiFormControl-root': {
            maxWidth: 245,
            '& .MuiSelect-root': {
              padding: 0,
              '&:focus': {
                background: 'none'
              },
              '& input': {
                padding: 0
              }
            },
            '& .subform': {
              marginTop: 22,
              '& .selectWrapper': {
                height: 'auto',
                '& .MuiTypography-body1': {
                  marginLeft: isRTL ? 12 : 0
                  // marginRight: isRTL ? 0 : 12,
                  // marginLeft: isRTL ? 12 : 0
                }
              },

            }
          },
          '& .MuiTypography-body1': {
            color: '#979797',
          },
          '& .link': {
            fontSize: 15,
            color: '#FF0054',
            padding: '2px 0',
            marginTop: 28,
            marginLeft: 0
          }
        }
      },
      '& .textBoxWrapper': {
        paddingTop: 30,
        '& .MuiTypography-body1': {
          color: '#979797',
        },
        '& .MuiTextField-root': {
          paddingBottom: 2,
          maxWidth: 245,
          '& input': {
            padding: 0
          }
        }
      }

      // display: 'grid',
      // padding: '0 17px 32.8px 17px'
    }
  },

  addCardForm: {
    maxWidth: 470,
    margin: 0,
    '& .textBoxWrapper': {
      maxWidth: '100%'
    },
    '& .MuiFormControl-root': {
      maxWidth: '100%',
      '& .MuiSelect-root': {
        maxHeight: 29,
        overflow: "hidden",
        padding: '3px 0 7px 0',

        '&:focus': {
          background: 'none'
        },
        '& input': {
          padding: 0
        }
      },
      '& .MuiSelect-icon': {
        display: 'none'
      },
    },
    '& .MuiOutlinedInput-adornedEnd': {
      paddingRight: 0
    },
    '& .MuiInputAdornment-root': {
      color: '#ff104b',
      '& svg': {
        cursor: 'pointer',
        // '&:hover':{

        // },
        '& path': {
          fill: '#ff104b !important'
        }
      }
    }
  },

  areaCon: {
    width: "calc(100% - 20px)",
    outline: "none",
    border: "none",
    fontSize: "16px",
    fontFamily: "Sans-serif",
    resize: "none",
    height: 315,
    backgroundColor: "white !important",
    padding: "10px",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
      fontFamily: "inherit",
    },
    "@media screen and (max-width: 965px)": {
      maxHeight: 275
    },
    "@media screen and (max-width: 768px)": {
      width: "90%",
    },
  },
  greenCon: {
    width: "calc(100% - 20px)",
    outline: "none",
    border: "none",
    fontFamily: "Sans-serif",
    resize: "none",
    height: 315,
    backgroundColor: "#CCFFE5",
    padding: "10px",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
      fontFamily: "inherit",
    },
  },
  addManualDiv: {
    // padding: "8px !important",
    // backgroundColor: "#51AA51 !important",
    // color: "#fff !important",
    // marginInlineEnd: "6px !important",
    // borderRadius: "6px !important",
    cursor: "pointer !important",
    "@media screen and (max-width: 768px)": {
      fontSize: "10px !important",
    },
  },
  clearDiv: {
    padding: "8px !important",
    color: "#277BFF !important",
    marginInlineEnd: "6px !important",
    borderRadius: "6px !important",
    cursor: "pointer !important",
    border: "1px solid #277BFF !important",
    "@media screen and (max-width: 768px)": {
      fontSize: "10px !important",
    },
  },
  backBtn: {
    marginTop: "30px",
    boxShadow: "0 1px 2px #a5a2a2",
    padding: "12px",
    backgroundColor: "#4F87B5",
    width: "70px",
    color: "white",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  pulseDiv: {
    display: "flex",
    marginTop: "20px",
    alignItems: "center",
  },
  pulse: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 14,
    border: "1px solid #ff3343",
    padding: "8px",
    marginInlineEnd: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#ff3343",
    '& svg': {
      marginInlineEnd: 5
    },
    "&:hover": {
      color: "#ffffff",
      backgroundColor: "#ff3343",
    },
  },

  pulseDisable: {
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    display: "flex",
    color: "#808080",
    marginInlineEnd: 8,
    alignItems: "center",
    pointerEvents: "none",
    cursor: "not-allowed",
    border: "1px solid  #808080",
    justifyContent: "space-between",
    '& svg': {
      marginInlineEnd: 5
    },
  },
  toggleDiv: {
    display: "flex",
    alignItems: "center",
    width: "100px",
  },
  inputDays: {
    padding: "10px",
    outline: "none",
    width: "70px",
    // marginInlineEnd: "5px",
    marginBottom: "8px",
    textAlign: "center",
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 5,
    border: "1px solid #bbb",
  },
  before: {
    display: 'flex',
    width: '72px',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: isRTL ? null : '4px',
    borderBottomRightRadius: isRTL ? '4px' : null,
    borderTopLeftRadius: isRTL ? null : '4px',
    borderTopRightRadius: isRTL ? '4px' : null,
    border: '1px solid #f74f26',
    padding: '10px',
    marginBottom: '8px',
    color: '#f74f26',
    cursor: 'pointer',
  },
  disabledBefore: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #D3D3D3",
    padding: "10px",
    marginBottom: "8px",
    color: "#D3D3D3",
    cursor: "pointer",
  },
  after: {
    display: 'flex',
    width: '72px',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: isRTL ? '4px' : null,
    borderBottomRightRadius: isRTL ? null : '4px',
    borderTopLeftRadius: isRTL ? '4px' : null,
    borderTopRightRadius: isRTL ? null : '4px',
    // borderLeft: "none",
    border: '1px solid #f74f26',
    padding: '10px',
    marginBottom: '8px',
    color: '#f74f26',
    cursor: 'pointer',
  },
  disabledAfter: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #D3D3D3",
    padding: "10px",
    marginBottom: "8px",
    color: "#D3D3D3",
    cursor: "pointer",
  },
  beforeActive: {
    display: 'flex',
    width: '72px',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: isRTL ? null : '4px',
    borderBottomRightRadius: isRTL ? '4px' : null,
    borderTopLeftRadius: isRTL ? null : '4px',
    borderTopRightRadius: isRTL ? '4px' : null,
    border: '1px solid #FF3343',
    padding: '10px',
    marginBottom: '8px',
    backgroundColor: '#FF3343',
    color: '#ffffff',
    cursor: 'pointer',
  },
  afterActive: {
    display: 'flex',
    width: '72px',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: isRTL ? null : '4px',
    borderBottomLeftRadius: isRTL ? '4px' : null,
    borderTopRightRadius: isRTL ? null : '4px',
    borderTopLeftRadius: isRTL ? '4px' : null,
    borderLeft: 'none',
    border: '1px solid #f74f26',
    padding: '10px',
    marginBottom: '8px',
    backgroundColor: '#f74f26',
    color: '#ffffff',
    cursor: 'pointer',
  },
  // smsGrid: {
  //   padding: "40px 80px 15px 80px"
  // },
  msgDiv: {
    marginTop: 50,
    height: "400px",
    "@media screen and (max-width: 960px)": {
      marginTop: 0,
      height: "auto",
    },
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
    },
  },
  boxDiv: {
    width: "100%",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginBottom: "10px",
    },
    "@media screen and (max-width: 960px)": {
      width: "100%",
      marginBottom: "10px",
    },
  },
  emoji: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    borderInlineEnd: "1px solid black",
    paddingInlineEnd: "0",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      borderRight: "none",
    },
  },
  emojiHe: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderInlineEnd: "1px solid grey",
    paddingInlineStart: "8px",
    height: "100%",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      paddingInlineStart: 0,
      // borderRight: "1px solid black",
    },
  },
  pickerEmoji: {
    position: "relative",
    verticalAlign: "sub",
    height: "100%",
    zIndex: "99",
    display: "inline-block",
    alignItems: "center",
    justifyContent: "center",
    "@media screen and (max-width: 768px)": {
      marginTop: "4px",
    },
    //#region emoji
    "& .emoji-group": {
      "&::before": {
        direction: isRTL ? "rtl" : "ltr",
      },
    },
    "& .emoji-search": {
      direction: "ltr",
    },
    //#endregion
  },
  endButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column-reverse",
      // borderInlineStart: "1px solid black",
      borderInlineStart: 'none'
    }
  },
  radio: {
    display: "flex",
    flexDirection: "column",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  switchDiv: {
    display: "flex",
    marginInlineStart: 25,
    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginInlineStart: "0px",
      // marginBottom:"30px"
    },
  },
  dialogTopBar: {
    paddingInline: 15,
    height: 50,
    display: 'flex',
    alignItems: "center",
    // justifyContent: "center",
    flexDirection: isRTL ? 'row-reverse !important' : 'row',
    color: "#fff",
    fontWeight: 600,
    background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
    '& .MuiStack-root': {
      display: 'flex',
      flexDirection: isRTL ? 'row-reverse' : 'row',
      // paddingInlineStart: 15,
      // paddingInlineEnd: 15,
    },
    '& svg': {
      fontSize: 30
    },
    '& .dialogTitle': {
      width: '85%',
      direction: isRTL ? 'rtl' : 'ltr',
    }
  },
  textRight: {
    textAlign: "right",
  },
  textLeft: {
    textAlign: "left",
  },

  elipsis: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  scrollY: {
    overflowX: 'hidden',
    overflowY: 'scroll',

  },
  checkbox: {
    '&.MuiCheckbox-root': {
      color: '#FF3343',
      '&$checked': {
        color: 'FF3343',
      },
    },
  },
  switchButton: {
    background: '#e4e4e4',
    padding: '2px 10px 3px 10px',
    boxShadow: 'inset 0px 0px 5px #898888',
    fontWeight: 500,
    cursor: 'pointer'
  },
  switchButtonActive: {
    background: '#a9d9a9',
    padding: '2px 10px 3px 10px',
    boxShadow: '0px 0px 5px #898888',
    fontWeight: 500,
    cursor: 'pointer'
  },
  toggleSwitch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: '#339933',
      '&:hover': {
        backgroundColor: 'transparent'
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#339933',
    },
  },

  textField: {
    '&.MuiTextField-root': {
      width: '100%',
      borderBottom: '1px solid #D6D1E6',
      paddingLeft: 5,
      '&:hover': {
        borderBottom: '1px solid #000',
        '& .MuiInputAdornment-root': {
          '& svg': {
            '& path': {
              fill: '#000'
            }
          }
        }
      },
      '& input': {
        padding: '3px 0 7px 0',
        minHeight: 25,
      },
      '& fieldset': {
        border: 'none',
      },
      '& .MuiInputAdornment-root': {
        '& svg': {
          '& path': {
            fill: '#B3B3B3'
          }
        }
      },
      '& label + .MuiInput-formControl': {
        marginTop: '10px',
      },

    },
    // [theme.breakpoints.down('xs')]: {
    //   width: 'auto !important'
    // },
  },

  textFieldError: {
    border: 'none !important',
    "& .MuiFormHelperText-contained": {
      marginLeft: 0,
      marginRight: 0,
      width: '100%',
      color: 'red'
    },
    "& .MuiInputBase-root": {
      "& input": {
        borderBottom: '2px solid red'
      },
    }
  },
  ltr: {
    direction: 'ltr'
  },
  rtl: {
    direction: 'rtl'
  },
  selectPlaceholderInput: {
    height: '90%',
    opacity: 1,
    border: 'none',
    boxShadow: 'none',
    background: 'none',
    width: '95%',
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: '0.9rem',
    position: 'absolute',
    pointerEvents: 'none',
    '&::placeholder': {
      color: '#bfbfbf'
    }
  },

  selectInputFormControl: {
    '&.MuiFormControl-root': {
      marginInline: 3,
      borderBottom: "1px solid #d6d1e6",
      "&:hover": {
        borderBottom: "1px solid #000"
      },
      '& label': {
        marginInline: 5
      },
      '& .MuiInput-root': {
        direction: isRTL ? 'rtl' : 'ltr',
      },
      '& .MuiSelect-root': {
        minHeight: 25,
        maxHeight: 29,
        overflow: "hidden",
        padding: '3px 0 7px 0',

        '&:focus': {
          background: 'none'
        },
        '& input': {
          padding: 0
        }
      },
      '& .MuiSelect-icon': {
        display: 'none'
      },
      '& .outerborder': {
        // border: '1px solid #c4c4c4',
        borderRadius: 5,
        '& .MuiSelect-select': {
          border: 'none !important'
        },
      },
      '& .MuiSelect-select': {
        minWidth: '100px !important',
        width: '100%',
        maxWidth: '100%',
        borderRadius: 4,
        paddingInlineStart: 15,
        paddingInlineEnd: 40,
        // paddingLeft: 0,
        // paddingRight: 0,
        minHeight: 25,
        display: 'block',
        alignItems: 'center',
        '&:focus': {
          backgroundColor: '#fff !important'
        }
      },
      '& svg': {
        color: '#ff3343',
        left: isRTL ? 10 : 'auto',
        right: isRTL ? 'auto' : 10,
      }
    }
  },
  dropdownIconComponent: {
    position: 'absolute',
    pointerEvents: 'none'
  },
  iconTab: {
    '& .MuiTab-wrapper': {
      display: 'inline-block',
    },
    '& img': {
      verticalAlign: 'bottom',
      marginBottom: '0px !important',
      paddingRight: isRTL ? '0px' : '15px',
      paddingLeft: !isRTL ? '0px' : '15px',
      height: '30px'
    }
  },
  InputMaskTextField: {
    padding: 10,
    borderBottom: 'solid 1px #c4c4c4',
    fontSize: 14,
    width: 390,
    letterSpacing: 1
  },
  whatsapp: {
    '& .MuiSelect-select': {
      minHeight: '35px !important',
    },
    '& .MuiSelect-icon': {
      top: 15
    }
  },
  dialogZindex: {
    zIndex: '1000 !important'
  },
  testSendDialog: {
    width: '100%',
    maxWidth: 390
  },
  containerFullHeight: {
    minHeight: 'calc(100vh - 80px)',
    height: 'calc(100vh - 80px)'
  },
  pb15: {
    paddingBottom: 15
  },
  pb25: {
    paddingBottom: 25
  },
  pbt9: {
    paddingTop: 9,
    paddingBottom: 9
  },
  pbt10: {
    paddingTop: 10,
    paddingBottom: 10
  },
  pbt15: {
    paddingTop: 15,
    paddingBottom: 15
  },
  buttonMinWidth: {
    minWidth: 167
  },
  noShadowAccordion: {
    boxShadow: 'none',
    '&.MuiAccordion-root': {
      '&:before': {
        height: 0,
      },
    },
  },
  filterHeight: {
    height: '65vh',
  },
  root: {
    '.Mui-expanded': {
      margin: '0 !important',
    },
  },
  flexColumnCenter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textRed: {
    color: '#c9302c'
  },
  commingSoon:
  {
    backgroundColor: "#dc3545",
    padding: 5,
    fontSize: 11,
    color: "#fff",
    borderRadius: 5,
    fontWeight: 400,
    marginInlineStart: "3px",
    marginBottom: '0 !important'
  },
  flexCenterOfCenter: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  passwordDialog: {
    maxWidth: windowSize !== 'xs' ? '25vw' : null
  },
  ribbonContainer: {
    position: 'relative',
    '& .wrap': {
      width: 'inherit',
      height: '58px',
      position: 'absolute',
      top: '-2px',
      left: '1.5px',
      overflow: 'hidden',
      '& .ribbon': {
        width: '45px',
        height: '10px',
        lineHeight: '10px',
        position: 'absolute',
        top: '8px',
        right: isRTL ? 'auto' : '-10px',
        left: isRTL ? '-10px' : 'auto',
        zIndex: '2',
        overflow: 'hidden',
        transform: isRTL ? 'rotate(-45deg)' : 'rotate(45deg)',
        '-webkit-transform': isRTL ? 'rotate(-45deg)' : 'rotate(45deg)',
        boxShadow: '0px 0px 2px 1px #b7b7b7,  0px 21px 5px -18px rgba(0,0,0,0.6)',
        background: '#ff0000',
        textAlign: 'center',
        fontSize: '0.5rem',
        color: "#fff"
      }
    }
  },
  disabledButPointer: {
    opacity: ".65",
    pointerEvents: "unset !important",
    cursor: "not-allowed !important",
  },
  disableChildButtons: {
    '& button': {
      opacity: ".65",
      pointerEvents: "none !important",
      cursor: "not-allowed !important",
    }
  },
  cursorPointer: {
    cursor: 'pointer'
  },
  flexGrow1: {
    flexGrow: 1
  },
  shopifySettingTextBox: {
    '& input': {
      minWidth: '400px',
      maxWidth: '400px',
      paddingLeft: 5,
      borderBottom: 'solid 1px #c4c4c4',
      paddingTop: 10,
      paddingBottom: 10,
    },
    '& .selectBox': {
      marginLeft: 30,
      border: "1px solid #818181",
      backgroundColor: "white",
      padding: "10px",
      borderRadius: "4px",
      width: 400,
      outline: "none",
      display: 'block'
    },
  },
  shopifySettingMultiSelect: {
    paddingLeft: '30px',
    '& #multiple-checkbox': {
      width: 330,
    },
    '& .group-dropdown': {
      width: 400,
    },
    '& .MuiSelect-icon': {
      position: 'initial',
      paddingRight: '10px'
    },
    textFieldWithTemplate: {
      display: 'flex',
      marginTop: 5,
      border: '1px solid #ccc',
      borderRadius: 4,
      height: 28,
      padding: 5,
      justifyContent: 'center'
    },
    justifyContentEnd: {
      justifyContent: 'flex-end'
    },
    errorIcon: {
      position: 'absolute',
      top: 0,
      left: isRTL ? 0 : 'auto',
      right: isRTL ? 'auto' : 0,
      zIndex: 100,
      fontSize: 25,
      fill: 'white',
      backgroundColor: 'red',
      borderRadius: 25
    }
  },
  alignSelfCenter: {
    alignSelf: 'center'
  },
  alignSelfTop: {
    alignSelf: 'flex-start'
  },
  smallActionIcons: {
    '& button': {
      minWidth: 45,
    },
    '& svg': {
      padding: 3
    },
    '& p': {
      fontSize: '12px !important'
    },
    '& .MuiBox-root': {
      '& div': {
        height: '20px !important',
        width: '20px !important'
      }
    }
  },
  callToAction: {
    minWidth: '50vw',
    "& .MuiDialog-paperWidthSm": {
      minWidth: '80vw',
      maxWidth: '80vw',
    },
    "& .MuiDialog-paperScrollPaper": {
      maxHeight: '100%'
    },
    '& .MuiDialogActions-root': {
      marginTop: 20
    },
    '& .keep-track': {
      paddingTop: 5,
    },
    '& .keep-track-desc': {
      color: '#aaa'
    }
  },
  paddingInline5: {
    paddingInline: 5
  },
  paddingInline25: {
    paddingInline: 25
  },
  paddingInline30: {
    paddingInline: 30
  },
  desktop: {
    boxSizing: 'border-box',
    '& .ep_container': {
      width: 'calc(50vw)',
      margin: '0px auto',
      position: 'relative',
      transform: 'scale(0.7)',
      '& .ep_base': {
        width: 90,
        height: 50,
        bottom: -70,
        left: '45%',
        background: '#e8ebf0',
        position: 'absolute',
        '&:before': {
          content: "",
          position: 'absolute',
          top: 0,
          borderLeft: '13px solid transparent',
          borderRight: '0px solid transparent',
          borderBottom: '50px solid #e8ebf0',
          left: -13,
        },
        '&:after': {
          content: "",
          position: 'absolute',
          top: 0,
          borderRight: '13px solid transparent',
          borderLeft: '0px solid transparent',
          borderBottom: '50px solid #e8ebf0',
          right: -13,
        },
        '& .ep_div': {
          position: 'absolute',
        }
      },
      '& .ep_content': {
        // HTML Content
        // width: '-webkit-fill-available',
        // height: 'calc(43vh)',

        // iFrame
        width: '100%',
        height: '100%',

        overflow: 'auto',
        '&:before': {
          content: "",
          position: 'absolute',
          right: -90,
          width: 200,
          height: 300,
          transform: 'rotate(45deg)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%,rgba(255,255,255,0) 100%)',
          zIndex: 5,
        }
      },
      '& .ep_screen': {
        width: 'auto',
        height: 'calc(50vh)',
        position: 'relative',
        background: '#fff',
        border: '20px solid #474e5d',
        borderRadius: 10,
        '&:after': {
          width: 8,
          height: 8,
          borderRadius: 8,
          bottom: -10,
          margin: '0 0 -4px -4px',
          background: '#e8ebf0'
        }
      },
      '& .ep_monitor': {
        '& .ep_div': {
          position: 'absolute'
        },
        '&:before': {
          content: "",
          position: 'absolute',
          left: '50%',
          top: -10,
          margin: '-3px 0 0 -3px',
          width: 6,
          height: 6,
          borderRadius: 6,
          background: '#a5adbd'
        },
        '&:after': {
          content: "",
          position: 'absolute',
          left: '50%',
        }
      },
      '& .ep_foot': {
        background: '#e8ebf0',
        zIndex: 1,
      },
      '& .ep_top': {
        width: 116,
        height: 5,
        bottom: -5,
        left: '50%',
        marginLeft: -58,
        '&:before': {
          content: "",
          position: 'absolute',
          top: 0,
          borderLeft: '16px solid transparent',
          borderRight: '0px solid transparent',
          borderBottom: '5px solid #e8ebf0',
          left: -16,
        },
        '&:after': {
          content: "",
          position: 'absolute',
          top: 0,
          borderRight: '16px solid transparent',
          borderLeft: '0px solid transparent',
          borderBottom: '5px solid #e8ebf0',
          right: -16,
        }
      },
      '& .ep_bottom': {
        width: 150,
        height: 5,
        bottom: -10,
        left: '50%',
        marginLeft: -75,
        zIndex: 999,
      },
      '& .ep_shadow': {
        position: 'absolute',
        width: 350,
        height: 15,
        left: '50%',
        marginLeft: -175,
        zIndex: -1,
        bottom: -20,
        background: 'radial-gradient(ellipse at center, rgb(150 150 150) 0%,rgb(255 255 255) 53%,rgb(255 255 255) 55%,rgba(46,204,113,0) 55%,rgba(46,204,113,0) 100%)',
      }
    },
  },
  mobilePreview: {
    position: 'relative',
    width: 360,
    height: 640,
    margin: 'auto',
    border: '16px black solid',
    borderTopWidth: 60,
    borderBottomWidth: 60,
    borderRadius: 36,
    '&:before': {
      content: '',
      display: 'block',
      width: 60,
      height: 5,
      position: 'absolute',
      top: -30,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#333',
      borderRadius: 10,
    },
    '&:after': {
      content: '',
      display: 'block',
      width: 35,
      height: 35,
      position: 'absolute',
      left: '50%',
      bottom: -65,
      transform: 'translate(-50%, -50%)',
      background: '#333',
      borderRadius: '50%'
    },
    '& .content': {
      width: '100%',
      height: '100%',
      background: 'white',
      overflow: 'auto'
    }
  },
  whiteIcon: {
    fontSize: 20,
    padding: 5,
    color: '#fff',
    fill: '#fff',
    '& svg, & path': {
      stroke: '#fff',
      color: '#fff',
      fill: '#transparent'
    }
  },
  marginInlineStart5: {
    marginInlineStart: 5
  },
  marginInlineEnd5: {
    marginInlineEnd: 5
  },
  marginInlineStart10: {
    marginInlineStart: 10
  },
  marginInlineEnd10: {
    marginInlineEnd: 10
  },
  marginInlineStart15: {
    marginInlineStart: 15
  },
  marginInlineEnd15: {
    marginInlineEnd: 15
  },
  verticalAlignTop: {
    verticalAlign: 'top'
  },
  verticalAlignMiddle: {
    verticalAlign: 'middle'
  },
  messageButtons: {
    display: 'contents'
  },
  underline: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  alignItemsStart: {
    alignItems: "start",
  },
  fullFlexColumn: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& .flexEnd': {
      alignSelf: 'flex-end'
    }
  },
  centeredLink: {
    display: 'flex',
    alignSelf: 'center',
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  flexEnd: {
    justifyContent: 'flex-end'
  },
  textFieldWithTemplate: {
    display: 'flex',
    marginTop: 5,
    border: '1px solid #ccc',
    borderRadius: 4,
    height: 28,
    padding: 5,
    justifyContent: 'center'
  },
  errorIcon: {
    position: 'absolute',
    top: 0,
    left: isRTL ? 0 : 'auto',
    right: isRTL ? 'auto' : 0,
    zIndex: 100,
    fontSize: 25,
    fill: 'white',
    backgroundColor: 'red',
    borderRadius: 25
  },
  tooltipIcon: {
    display: 'flex',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 13,
    borderRadius: 25,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexStart: {
    justifyContent: "flex-start"
  },
  errorBg: {
    backgroundColor: '#fde2e2'
  },
  fromEmailSelect: {
    '& :focus': {
      backgroundColor: 'transparent !important'
    }
  },
  reipientReportCampaignName: {
    display: 'grid !important',
    wordBreak: 'break-all',
    minHeight: 50,
    margin: 'auto',
  },
  selectOption: {
    width: '100%',
    display: 'flex',
    height: '30px !important',
    alignItems: 'center !important',
    paddingInline: '15px !important',
    paddingBlock: '10px !important'
  },
  productCatalogDialog: {
    '& .MuiPaper-root': {
      maxWidth: '70% !important',
      width: '70% !important',
      padding: '10px !important'
    }
  },
  selectField: {
    borderBottom: '1px solid #D6D1E6',
    height: 46
  },
  pageContainer: {
    marginLeft: '7rem',
    marginRight: '7rem',
  },
  fieldOfInterestButton: {
    borderRadius: 10,
    paddingInline: 20,
    textTransform: 'none',
    '& .MuiButton-startIcon': {
      marginRight: 0,
      marginLeft: 0,
      paddingInline: 5,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'inline-flex',
      marginBottom: 0,
    },
  },
  SignUpLanguageDropdown: {
    width: 150,
    borderRadius: 5,
    '& .MuiSelect-select': {
      padding: '5px 7px !important',
      display: 'flex !important',
      justifyContent: 'flex-end'
    },
    '& img': {
      height: 20,
    },
    '& .cname': {
      paddingInline: 10,
    }
  },
  gradientBackground: {
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
  },
  passwordVisibilityToggle: {
    top: 0,
    right: isRTL ? 'initial' : 0,
    left: isRTL ? 0 : 'initial'
  },
  autoComplete: {
    '& .MuiAutocomplete-endAdornment': {
      right: isRTL ? 'unset' : '0px',
      left: isRTL ? '0px' : 'unset',
    },
    '& .MuiInputBase-root.MuiInput-root.MuiInput-underline.MuiAutocomplete-inputRoot.MuiInputBase-fullWidth.MuiInput-fullWidth.MuiInputBase-formControl.MuiInput-formControl.MuiInputBase-adornedEnd':
    {
      paddingRight: isRTL ? '0px !important' : '0px',
      paddingInlineEnd: 40
    },
  },
  highlightExpandedRow: {
    backgroundColor: '#dbdbdb !important',
    borderLeft: 'solid 2px #797979',
    borderRight: 'solid 2px #797979',
    '&.last': {
      borderBottom: 'solid 2px #797979 !important',
    },
    '&.first': {
      borderTop: 'solid 2px #797979 !important',
    },
  },
  renderHtml: {
    '& label': {
      display: 'block !important',
      '& select': {
        backgroundPosition: isRTL ? 'left center' : 'right-center'
      }
    }
  },
  flexContainerGap25: {
    gap: 25,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  mInline15: {
    marginInline: 15
  },
  left10: {
    left: 10,
    right: 'auto'
  },
  right10: {
    right: 10,
    left: 'auto'
  },
  left15: {
    left: 15,
    right: 'auto'
  },
  right15: {
    right: 15,
    left: 'auto'
  },
  accordion: {
    '& .MuiAccordionSummary-root': {
      margin: '20px 0 0 0',
      padding: 0,
      width: '100%'
    },
    '& .MuiAccordionSummary-content': {
      width: '100%',
      margin: '0 !important',
      padding: 0,
    }
  },
  btnActive: {
    color: "#fff",
    background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)'
  },
  MuiAccordionroot: {
    "&:before": {
      backgroundColor: 'transparent'
    }
  },
  maxWidthMinContent: {
    maxWidth: 'min-content !important'
  },
  connectedDot: {
    '& .MuiBadge-dot': {
      left: isRTL ? 'auto' : -10,
      right: isRTL ? -10 : 'auto',
      top: 10,
      background: '#23ff23'
    }
  },
  automationTemplate: {
    border: 'solid 1.5px #fefefe',
    borderRadius: '5px',
    boxShadow: '0px 0px 10px #898888',
    padding: '15px',
    height: '110px',
    transition: 'all 0.5s ease',
    overflowY: 'hidden',
    "&:hover, &.active": {
      background: '#fff8f8',
      boxShadow: '0px 0px 10px #ff3343',
      borderColor: '#ff3343',
      transform: 'scale(1.03)',
    },
    "& .description": {
      height: '50px'
    }
  }
});
