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
  lg: 500,
};

const maxDialogWidth = {
  md: 1050,
  lg: 1050,
  xl: 1050,
};

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
  md: "1rem",
};

const graphTextWidth = {
  sm: 250,
  md: 250,
  lg: 110,
  xl: 250

}

export const getGeneralStyle = (windowSize, isRTL, theme) => ({
  dialogContainer: {
    "& .MuiPaper-root": {
      overflowX: "hidden",
    },
    "& .MuiDialog-paperWidthSm": {
      minWidth: minDialogWidth[windowSize],
      maxWidth: maxDialogWidth[windowSize],
    },
  },
  noPadding: {
    padding: "0px !important",
  },
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
  dialogExitButton: {
    width: 25,
    height: 25,
    textAlign: "center",
    color: "#fff",
    borderRadius: 25,
    fontWeight: "700",
    backgroundColor: "#0371ad",
    position: "absolute",
    top: "0.5rem",
    cursor: "pointer",
  },
  dialogExitButtonRTL: {
    left: "0.5rem",
  },
  dialogExitButtonLTR: {
    right: "0.5rem",
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
    fontFamily: "OpenSansHebrew",
    color: "#fff",
    textTransform: "capitalize",
    width: 120,
    fontSize: 18,
    borderRadius: 50,
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
    // backgroundRepeat: "repeat-x",
    border: "1px solid darkred",
    borderTop: "0px solid darkred",
    boxShadow: "0px 3px 3px darkred",
    maxWidth: 150,
  },
  dialogConfirmBlueButton: {
    // background: "rgba(212,137,33,1)",
    backgroundImage: "linear-gradient(180deg,#5b9bcd 0%,#4678a3 100%)",
    // backgroundRepeat: "repeat-x",
    // border: "1px solid darkred",
    // borderTop: "0px solid darkred",
    // boxShadow: "0px 3px 3px darkred",
    maxWidth: 150,
  },
  dialogButtonsContainer: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
  },
  wizardFlex: {
    flex: 1,
    alignContent: "flex-end",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#0a74a9",
    marginInline: 25,
  },
  dialogChildren: {
    // marginInline: 25,
    marginBlock: 10,
    paddingRight: summaryPadding[windowSize],
    paddingLeft: summaryPadding[windowSize],
    overflowY: "auto",
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
    fontSize: 30,
    padding: 5,
  },
  dialogAlertIcon: {
    fontSize: 32,
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
    'overflow': 'visible'
    //maxHeight: 'calc(100vh - 53px)'
  },
  pulseemIcon: {
    fontFamily: "pulseemicons",
  },
  borderBottom1: {
    borderBottom: '1px solid #ccc'
  },
  dFlex: {
    display: 'flex'
  },
  rtlSwitch: {
    transform: 'rotateY(180deg)'
  },
  dBlock: {
    display: 'block'
  },
  borderAround: {
    border: '1px solid #000'
  },
  alignItemsCenter: {
    alignItems: 'center'
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
  maxHeight87: {
    maxHeight: 87,
  },
  w20: {
    width: "20%",
  },
  w80: {
    width: "80%",
  },
  minWidth100: {
    minWidth: 100
  },
  maxWidth400: {
    maxWidth: 400,
  },
  maxWidth190: {
    maxWidth: 190
  },
  widthUnset: {
    width: "unset",
  },
  maxWidth540: {
    maxWidth: 540,
  },
  flex2: {
    flex: 2
  },
  dInline: {
    display: "inline",
  },
  dInlineBlock: {
    display: "inline-block",
  },
  pl25: {
    paddingInlineEnd: 25,
  },
  pe10: {
    paddingInlineEnd: 10,
  },
  p10: {
    padding: 10,
  },
  p0: {
    padding: 0,
  },
  plr10: {
    padding: "0 10px",
  },
  pr25: {
    paddingInlineStart: 25,
  },
  ps15: {
    paddingInlineStart: 8,
  },
  ps25: {
    paddingInlineStart: 25,
  },
  pt0: {
    paddingTop: 0
  },
  pt2rem: {
    paddingTop: "2rem",
  },
  pt10: {
    paddingTop: 10,
  },
  pt14: {
    paddingTop: 14,
  },
  pt2: {
    paddingTop: 1.4,
  },
  pb0: {
    paddingBottom: 0
  },
  pb10: {
    paddingBottom: 10,
  },
  mr10: {
    marginInlineEnd: 10,
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
  ml25: {
    marginInlineStart: 25
  },
  mtNeg15: {
    marginTop: -15
  },
  mbNeg10: {
    marginBottom: -10
  },
  mt5: {
    marginTop: 5,
  },
  ml0: {
    marginInlineStart: 0,
  },
  ml5: {
    marginInlineStart: 5,
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
    marginInlineStart: 15
  },
  mt10: {
    marginTop: 10,
  },
  mt15: {
    marginTop: 15
  },
  f14: {
    fontSize: 14,
  },
  f15: {
    fontSize: 15,
  },
  f16: {
    fontSize: 16,
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
  line1: {
    lineHeight: 1,
  },
  bgBrown: {
    backgroundColor: '#636363',
  },
  colorWhite: {
    color: '#fff'
  },
  colorGray: {
    color: "rgba(0,0,0,0.40)",
  },
  colorBlue: {
    color: '#0371AD'
  },
  bgGreen: {
    backgroundColor: 'green'
  },
  inlineGrid: {
    display: "inline-grid",
  },
  bgLightGray: {
    backgroundColor: 'rgba(242, 242, 242, 1)'
  },
  justifyBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  flexColumn2: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 14,
    paddingInlineEnd: 10,
  },
  txtCenter: {
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  disabled: {
    opacity: ".65",
    pointerEvents: "none !important",
  },
  imageInfo: {
    backgroundColor: "rgba(255,255,255,.5)",
    color: "#000 !important",
  },
  alignCenter: {
    display: 'flex',
    alignCenter: 'center'
  },
  justifyCenter: {
    display: 'flex',
    alignCenter: 'center'
  },
  justifyCenterOfCenter: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    alignItems: 'center'
  },
  spaceEvenly: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  textCapitalize: {
    textTransform: "capitalize",
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
    position: "relative",
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
    color: "#157eaf",
    fontSize: 30,
  },
  blue: {
    color: "#0a74a9",
  },
  whiteBox: {
    backgroundColor: "#fff",
    boxShadow: "5px 3px 3px 1px rgba(0,0,0,.2)",
    padding: 5,
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
  m5: {
    margin: ".5rem",
  },
  font15: {
    fontSize: 15,
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
  borderBox: {
    border: "3px solid #0371ad",
    margin: "1rem",
    display: "flex",
    padding: "1rem",
    borderRadius: 5,
    flexDirection: "column",
  },
  whiteLink: {
    textDecoration: "underline",
    color: "#fff",
    textTransform: "capitalize",
    lineHeight: 1,
  },
  blackDivider: {
    height: 2,
    backgroundColor: "rgb(0, 0, 0, 0.5)",
  },
  noWrap: {
    flexWrap: "nowrap",
  },
  infoDiv: {
    height: "100px",
    display: "flex",
    alignItems: "center",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  headInfo: {
    fontSize: "32px",
    fontWeight: "600",
    marginInlineEnd: "10px",
    "@media screen and (max-width: 768px)": {
      // width : '300px',
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
    color: "#157eaf",
    fontSize: "30px",
    "@media screen and (max-width: 768px)": {
      // width : '300px',
      fontSize: "24px",
    },
  },
  fieldDiv: {
    height: "100px",
    marginTop: "20px",
    // "@media screen and (max-width: 768px)": {
    //   width: "100%",
    //   gridTemplateColumns: "auto",
    // },
  },
  buttonForm: {
    display: "flex",
    flexDirection: "column",
  },
  buttonHead: {
    fontSize: "20px",
    marginBottom: "10px",

  },
  buttonContent: {
    fontSize: "14px",
    marginTop: "8px",
  },
  alertMsg: {
    color: "#ca332f",
  },
  buttonField: {
    borderRadius: "5px",
    border: "1px solid #bbb",
    outline: "none",
    padding: "8px 12px 8px 4px",
    fontSize: "16px",
    '&::placeholder':
    {
      fontSize: "16px"
    }
  },
  buttonFieldRemoval: {
    borderRadius: "5px",
    border: "1px solid #bbb",
    outline: "none",
    padding: "8px",
    width: "20%",
    '&::placeholder':
    {
      fontSize: "16px"
    }
  },
  buttonFieldRemovalMobile: {
    borderRadius: "5px",
    border: "1px solid #bbb",
    outline: "none",
    padding: "8px",
    '&::placeholder':
    {
      fontSize: "16px"
    }
  },
  success: {
    borderBottom: "2px solid green",
  },
  error: {
    borderBottom: "2px solid red !important",
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
    marginTop: "20px",
    width: "100%",
    border: "none",
    borderTop: "1px solid rgb(170, 170, 170)",
    borderInlineStart: "1px solid rgb(170, 170, 170)",
    borderInlineEnd: "1px solid rgb(170, 170, 170)",
    outline: "none",
    padding: "10px",
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
    color: "#1c82b2",
    fontSize: "12px",
    padding: "10px",
    border: "none",
    borderBottom: "1px solid rgb(170, 170, 170)",
    borderLeft: "1px solid rgb(170, 170, 170)",
    borderRight: "1px solid rgb(170, 170, 170)",

  },
  funcDiv: {
    width: "100%",
    height: "70px",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "auto auto auto auto",
    position: "relative",
    top: "-4px",
    padding: "10px",
    border: "1px solid rgb(170, 170, 170)",
    alignItems: "center",
    "@media screen and (max-width: 768px)": {
      height: "110px"
    },

  },
  baseButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height:"100%",
    borderInlineEnd: "1px solid black",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      paddingInlineEnd: "8px",
    },
  },
  infoButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    fontWeight: "600",
    color: "white",
    fontSize: "12px",
    padding: "5px 5px 5px 5px",
    backgroundColor: "#1c82b2",
    cursor: "pointer",
    borderColor: "#1c82b2",
    marginInlineStart: "5px",
    "@media screen and (max-width: 768px)": {
      width: "110px",
      padding: "8px",
      marginBottom: "5px",
      fontSize: "11px",
    },
  },
  info2Buttons: {
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "white",
    fontWeight: "600",
    padding: "5px 5px 5px 5px",
    backgroundColor: "#1c82b2",
    cursor: "pointer",
    borderColor: "#1c82b2",
    marginInlineStart: "3px",
    marginInlineEnd: "2px",
    "@media screen and (max-width: 768px)": {
      width: "110px",
      padding: "8px",
      marginBottom: "5px",
      fontSize: "11px",
    },
  },
  selectMsg: {
    marginInlineStart: "3px",
    height: "100%",
    borderInlineEnd : "1px solid black",
    display:"flex",
    alignItems:"center",
    "@media screen and (max-width: 768px)": {
      borderRight: "none",
    },
  },
  selectGroupDiv:
  {
    cursor: "pointer",
    display: "flex",

    justifyContent: "space-between",
    width: "100%"
  },
  selectVal: {
    outline: "none",
    padding: "10px",
    width: "100%",
    marginInlineEnd:"5px",
    borderRadius: "5px",
    borderColor: "#1c82b2",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginTop: "8px",
    },
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
    height:"23px",
    border: "1px solid #BBBBBB",
    borderRadius: "4px",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  descSwitch:
  {
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
    height:"25px",
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
    marginBottom:"40px",
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
  phoneNumber: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    top: "142px",
    marginInlineStart: "145px",
    fontSize: "15px",
    "@media screen and (max-width: 768px)": {
      marginInlineStart: "10px",
    },
  },
  testDiv:
  {
    marginInlineStart: "35px",
    display: "flex",
    marginTop: "20px",
    "@media screen and (max-width: 768px)": {
      marginInlineStart: "0px",
    },
  },
  testRadios:
  {
    marginTop: "10px", marginInlineStart: "35px",
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
    fontSize: "15px"
  },
  phoneNumberSum: {
    top: "24%",
    left: "38%",
    position: "absolute",
    fontWeight: "700",
    fontSize: "15px",
  },
  chat: {
    backgroundColor: "#3da6f6",
    color: "#fff",
    maxWidth: "260px",
    backgroundAttachment: 'fixed',
    minWidth: "100px",
    padding: '8px',
    minHeight: '30px',
    wordBreak: 'break-all',
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
  wrapChat:
  {
    position: "absolute",
    top: "180px",
    left: "13%",
    backgroundColor: "#fff",
    color: "#fff",
    borderRadius: "12px",
    height: "230px",
    overflowY: "auto",
    width: '260px',
    wordBreak: 'break-all',
    "&::-webkit-scrollbar" :  {
      visibility: "hidden",
      width: "0px",
      }
  },
  wrapChatSumm:
  {
    position: "absolute",
    top: "130px",
    left: "13%",
    backgroundColor: "#fff",
    color: "#fff",
    borderRadius: "12px",
    height: "200px",
    overflowY: "auto",
    width: '260px',
    wordBreak: 'break-all',
    "&::-webkit-scrollbar" :  {
      visibility: "hidden",
      width: "0px",
      }
  },
  chatBox : 
  {
    display: 'flex',
    justifyContent: 'flex-end',
    wordBreak: 'break-all',
  },
  wrapChatHe:
  {
    position: "absolute",
    top: "180px",
    width: "260px",
    maxWidth: "260px",
    right: "11%",
    backgroundColor: "#fff",
    wordBreak: 'break-all',
    color: "#fff",
    display: 'flex',
    justifyContent: 'flex-start',
    borderRadius: "12px",
    maxHeight: '230px',
    overflowY: "auto",
    overflowX: "hidden",
    minHeight: '40px',
    '&::-webkit-scrollbar': {
      width: "0px",
      background: "transparent"
    },
    '&::-webkit-scrollbar-thumb':
    {
      background: "transparent"
    }
  },
  fromMe:
  {
    alignSelf: 'flex-end',
    borderRadius: '1.15rem',
    lineHeight: '1.25',
    maxWidth: '79%',

    minHeight: '20px',

    padding: '0.5rem .875rem',
    position: 'relative',
    minWidth: "20px",
    wordWrap: 'break-word',
    right: "12px",
    cursor: "pointer",
    backgroundColor: '#248bf5',
    color: '#fff',
    '&::before':
    {
      borderBottomLeftRadius: '0.8rem 0.7rem',
      borderRight: '1rem solid #248bf5',
      right: '-0.35rem',
      transform: 'translate(0, -0.1rem)',
      bottom: '-0.1rem',
      content: `''`,
      height: '1rem',
      position: 'absolute',

    },
    '&::after':
    {
      backgroundColor: '#fff',
      borderBottomLeftRadius: '0.5rem',
      right: '-40px',
      transform: 'translate(-30px, -2px)',
      width: '10px',
      bottom: '-0.1rem',
      content: `''`,
      height: '1rem',
      position: 'absolute',
    }
  },
  groupName: {
    display: "block",
    fontSize: "32px",
    color: "#006996",
    width: "700px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      fontSize: "22px",
    },

  },
  fieldsRequire:
  {
    fontSize: "20px", color: "red", fontWeight: "600",

    "@media screen and (max-width: 768px)": {

      fontSize: "12px !important",
      marginBottom: "4px"
    },
  },
  baseDialogSetup:
  {
    height: "60px", borderBottom: "1px solid #DEE2E7",
    "@media screen and (max-width: 768px)": {
      height: "auto"
    },
  },
  bodyTextDialog:
  {
    fontSize: "22px", marginTop: "5px",
    "@media screen and (max-width: 768px)": {
      fontSize: "16px"
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
    marginBottom: "8px",
    border: "1px solid #1c82b2",
    boxShadow: "0 3px 5px 1px #e0dada",
    borderRadius: "15px",
    backgroundColor: "#fff",
    padding: "10px",
    width: "100%",
    color: "#1c82b2",
    textAlign: "center",
  },
  listDiv: {
    height: "300px",
    maxHeight: "200px",
    width: "700px",
    overflowX: "hidden",
    marginTop: "20px",
    overflow: "auto"
  },
  listDivFilter:
  {
    height: "300px",
    maxHeight: "200px",
    width: "700px",
    overflowY: "auto",
    borderBottom: "1px solid #efefef",
    borderLeft: "1px solid #efefef",
    borderRight: "1px solid #efefef",
    marginTop: "0",
  },
  searchCon: {
    padding: "12px",
    display: "flex",
    alignItems: "center",
    cursor:"pointer",

    "&:hover": {
      backgroundColor: "#efefef",
    },
  },
  conInfo: {
    fontSize: "22px",
    color: "#555",
    marginInlineEnd: "5px",
  },
  tabDiv: {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    "@media screen and (max-width: 768px)": {
      width: "315px",
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
    },
  },
  tab1: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#777777",
    "@media screen and (max-width: 768px)": {
      fontSize: "14px",

    },
  },
  activeTab: {
    borderBottom: "3px solid #1771AD",
    color: "#277BFF !important",
  },
  areaManual: {
    border: "2px dashed rgba(0,0,0,.2)",
    height: "400px",
    backgroundColor: "white !important",
    "@media screen and (max-width: 768px)": {
      width: "auto"
    },
  },
  greenManual: {
    border: "2px dashed #4BB543",
    height: "400px",
    backgroundColor: "#CCFFE5",
    "@media screen and (max-width: 768px)": {
      width: "auto"
    },
  },
  areaCon: {
    width: "calc(100% - 20px)",
    outline: "none",
    border: "none",
    fontSize: "16px",
    fontFamily: "Sans-serif",
    resize: "none",
    height: "330px",
    backgroundColor: "white !important",
    padding: "10px",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
      fontFamily: "inherit",
    },
    "@media screen and (max-width: 768px)": {
      width: "90%"
    },
  },
  greenCon: {
    width: "calc(100% - 20px)",
    outline: "none",
    border: "none",
    resize: "none",
    height: "230px",
    backgroundColor: "#CCFFE5",
    padding: "10px",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
      fontFamily: "inherit",
    },
  },
  addManualDiv:
  {
    padding: "8px",
    backgroundColor: "#51AA51",
    color: "#fff",
    marginInlineEnd: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    "@media screen and (max-width: 768px)": {
      fontSize: "10px"
    },
  },
  clearDiv:
  {
    padding: "8px",
    color: "#277BFF",
    marginInlineEnd: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid #277BFF",
    "@media screen and (max-width: 768px)": {
      fontSize: "10px"
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
    border: "1px solid #277bff",
    padding: "8px",
    marginInlineEnd: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#277bff",
    '&:hover':
    {
      color: "#ffffff",
      backgroundColor: "#277bff",
    }
  },

  pulseDisable : 
  {
    border: "1px solid  #808080",
    padding: "8px",
    marginInlineEnd: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#808080",
    pointerEvents:"none"
  
  },
  toggleDiv: {
    display: "flex",
    alignItems: "center",
    width: "100px",
  },
  inputDays: {
    padding: "10px",
    outline: "none",
    width: "30px",
    marginInlineEnd: "5px",
    marginBottom: "8px",
  },
  before: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #277BFF",
    padding: "10px",
    marginBottom: "8px",
    color: "#277BFF",
    cursor: "pointer"
  },
  after: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #277BFF",
    padding: "10px",
    marginBottom: "8px",
    color: "#277BFF",
    cursor: "pointer"
  },
  beforeActive: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #277BFF",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#277BFF",
    color: "#ffffff",
    cursor: "pointer"

  },
  afterActive: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #277BFF",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#277BFF",
    color: "#ffffff",
    cursor: "pointer"
  },
  smsInit: {
    padding: "40px 80px 15px 90px",
    justifyContent:"flex-end"
  },
  msgDiv: {

    marginTop: "80px",
    height: "400px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      marginTop: "250px !important",
    },
  },
  boxDiv: {
    width: "100%",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginBottom: "10px"
    },
  },
  emoji: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height:"100%",
    borderInlineEnd: "1px solid black",
    paddingInlineEnd: "0",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      borderRight: "1px solid black",
    },
  },
  emojiHe: {
    display: "flex",
    alignItems: "center",
    borderInlineEnd: "1px solid black",
    paddingInlineStart: "8px",
    height:"100%",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      // borderRight: "1px solid black",
    },
  },
  pickerEmoji: {
    position: "relative",
    height: "100%",
    zIndex: "99",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "@media screen and (max-width: 768px)": {
      marginTop: "4px",
    },
  },
  endButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height:"100%",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column-reverse",
      // borderRight: "1px solid black",
    },
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

    "@media screen and (max-width: 768px)": {
      width: "100%",
      marginInlineStart: "0px",
      // marginBottom:"30px"
    },
  },
  phoneDiv: {
    position: "relative",
    // marginInlineStart: "5px",
    "@media screen and (max-width: 768px)": {
      marginTop: "170px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  groupsMan:
  {
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
  groupsMan1:
  {
    width: "700px",
    display: "flex",
    "@media screen and (max-width: 768px)": {
      width: "315px",
      flexWrap: "wrap",


    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      flexWrap: "wrap"
    },
  },
  reciFilter:
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding: "8px",
    borderRadius: '4px',
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff"
    },
    "@media screen and (max-width: 768px)": {
      width: "30%",
      fontSize: "14px"

    },
  },
  selectSort:
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding: "7px",
    borderRadius: '4px',
    // width:"150px",
    outline: "none",
    height: "40px",
    fontSize: "17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff"
    },
    "@media screen and (max-width: 768px)": {
      width: "100%",
      fontSize: "14px"

    },
  },
  arrowSort:
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding: "7px",
    borderRadius: '4px',
    height: "25px",
    fontSize: "17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color: "#ffffff"
    },
  },
  selectedContact:
  {
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
      fontSize: "14px"

    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      fontSize: "14px"
    },
  },
  bubble:
  {

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    height: "24px",
    color: "#ffffff",
    width: "70px",
    borderRadius: "20px",
    fontSize: "16px",
    margin: "6px"
  },
  listGroup:
  {
    height: "250px",
    maxHeight: "250px",
    overflowY: "auto",
    padding: "8px"
  },

  row:
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "20px",
    padding: "12px",
    "&:hover": {
      backgroundColor: "#efefef"
    }
  },
  icnList:
  {
    marginInlineEnd: "18px",
  },
  groupInput:
  {
    padding: "10px",
    outline: "none",
    border: "1px solid #efefef",
    marginInlineStart: "10px"

  },
  saveBtn:
  {
    marginInlineStart: "5px",
    color: '#007bff',
    border: '1px solid #007bff',
    padding: "8px",
    borderRadius: "5px",
    cursor:"pointer"
  },
  blueDoc:
  {
    border: "2px solid #3DA6F7",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    color: "#3DA6F7"
  },
  greenDoc:
  {
    border: "2px solid #018901",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    color: "#3DA6F7"
  },
  reactSwitch: {
    verticalAlign: 'middle',
    marginInlineEnd: '8px'
  },
  reactSwitchHe: {
    verticalAlign: 'middle',
    marginInlineStart: '8px',
    transform: 'rotateY(180deg)'
  },
  icn:
  {
    fontSize: "30px",
    color: "#fff",
    'path':
    {
      stroke: "#fff"
    }
  },
  baseSum:
  {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    width: "700px",
    height: "400px",
    marginTop: "15px"


  },
  sumLeft:
  {
    marginTop: "10px"
  },
  sumRight:
  {

  },
  sumChild:
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: "25px"
  },
  spanSum:
  {
    fontSize: "22px",
    color: "#1771ad",
    marginBottom: "7px"
  },
  bodySum:
  {
    fontWeight: "700",
    fontSize: "18px"
  },
  pulseInsert:
  {
    padding: "8px",
    width: "50px",
    border: "2px solid #efefef",
    height: "25px",
    marginInlineEnd: "8px",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  pulseActive:
  {
    padding: "8px",
    width: "50px",
    border: "2px solid #efefef",
    height: "25px",
    marginInlineEnd: "8px",
    borderRadius: "6px",
    marginBottom: "8px",
    outline: "none",
  },
  percent: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #efefef",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#A7A7A7",
    cursor: "pointer",
  },
  reci: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #efefef",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#A7A7A7",
    cursor: "pointer",
  },
  percentActive: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#277BFF",
    cursor: "pointer",
  },
  percentTrue: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#ffffff",
    backgroundColor: " #277BFF",
    cursor: "pointer",
  },
  reciActive: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#277BFF",
    cursor: "pointer",
  },
  percentActivetrue: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: "4px",
    borderTopLeftRadius: "4px",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#ffffff",
    backgroundColor: "#277BFF"
  },
  reciTrue: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#ffffff",
    backgroundColor: " #277BFF",
    cursor: "pointer",
  },
  reciActivetrue: {
    display: "flex",
    width: "72px",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: "4px",
    borderTopRightRadius: "4px",
    borderLeft: "none",
    border: "1px solid #277BFF",
    padding: "8px",
    marginBottom: "8px",
    height: "25px",
    color: "#ffffff",
    backgroundColor: "#277BFF"
  },
  inputreci:
  {
  },
  reciMain:
  {
    marginTop: "10px",
    border: "1px solid #efefef",
    boxShadow: "none",
    borderRadius: "none !important"

  },
  reciList:
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "40px",
    width: "100%",
    backgroundColor: "#F7F7F7",
  },
  manualModal: {
    display: "flex",
    alignItems: "center",
    height: "40px",
    marginTop: "15px",
    marginBottom: "20px",
    width: "100%",
   
  },
  inputManual:
  {
    padding: "10px",
    width:"72%",
    outline: "none",
    borderRadius: "4px",
    border : "1px solid #ddd"
  },
  adjustP:
  {
    position: "relative",
    width: "100%",
    // display:"flex",
    // alignItems:"center",
    // justifyContent:"center"
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
  management: {
    maxWidth: 1500
  },
  adjustC:
  {
    position: "absolute",
    // height:"80px",

    width: "100%",
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    zIndex: "99",
    backgroundColor: "#fff"


  },
  grouping:
  {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
    zIndex: "9",
    cursor: "pointer",

    '&:hover':
    {
      backgroundColor: "#277BFF",
      color: "#fff",
      zIndex: "9"
    }
  },
  grayGroup:
  {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
    zIndex: "9",
    cursor: "pointer",
    pointerEvents: "none"
  },
  manualChild:
  {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px"
  },
  listValues:
  {
    fontSize: "20px", color: "red", fontWeight: "600"
  },
  campNameLi:
  {
    marginBottom: "8px"
  },
  inputCampDiv:
  {
    display: "flex", justifyContent: "space-between"
  },
  restoreBtn:
  {
    fontSize: "18px",
    color: "rgb(170, 170, 170)",
    cursor: "pointer",
    textDecoration: "underline"
  },
  selectedGroupsDiv: {
    display: "flex",
    alignItems: "center",
    marginTop: "15px",
    color: "#fff",
    backgroundColor: "#007bff",
    borderRadius: "20px",
    justifyContent: "center",
    padding: "5px",
    marginInlineStart: "5px"
  },
  reciFilterDiv:
  {
    height: "60px",
    borderBottom: "1px solid black"
  },
  reciCheckoxContainer:
  {
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "cneter",
  },
  bubbleReciDiv:
  {
    padding: "6px",
    borderRadius: "20px",
    backgroundColor: "#1771ad",
    marginInlineEnd: "4px",
    marginBottom: "4px",
    color: "white",
    display: "flex",
    alignItems: "center"
  },
  nameGroup:
  {
    marginInlineEnd: "4px"
  },
  groupCloseicn:
  {
    color: "#fff",
    cursor: "pointer",
    alignItems: "center",
  },
  editorLink: {
    marginInlineEnd: "5px",
    cursor: "pointer"
  },
  addBtn:
  {
    marginInlineEnd: "3px",
    border: "2px solid #17a2b8",
    borderRadius: "50%",
    padding: "5px",
    width: "12px",
    height: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#17a2b8",
    fontSize: "19px",
    fontWeight: "700",
  },
  plusIcn:
  {
    marginBottom: "3px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactGroupDiv:
  {
    width: "280px",
    height: "30px",
    padding: "8px",
    border: "1px solid #bbb",
    borderRadius: "5px",
    color: "#bbb",
    maxHeight: "30px",
    overflowY: "auto",
  },
  newIcn:
  {
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "5px",
    padding: "5px",
    marginInlineStart: "3px",
    fontWeight: "600"
  },
  mappedGroup:
  {
    display: "flex",
    flexWrap: "wrap",
    // marginTop: "5px",
  },
  bubbleGroups:
  {
    width: "70px",
    padding: "6px",
    borderRadius: "20px",
    backgroundColor: "#1771ad",
    marginInlineEnd: "4px",
    marginBottom: "4px",
    color: "white",
  },
  phoneImg:
  {
    width: "375px",
    height: "415px",
    marginTop: "50px",
    borderBottom: "1px solid black"
  },
  groupsFilterList:
  {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "calc(100% - 70px)",
    cursor: "pointer",
    "& span": {
      whiteSpace: 'nowrap'
    }
  },
  camapignsDiv:
  {
    display: "flex",
    justifyContent: "space-between",
    // alignItems: "center",
    flexDirection: "column",
    marginTop: "15px"
  },
  createGroupSpan:
  {
    color: "black",
    fontSize: "14px",
    fontWeight: "500"
  },
  createGroupSpanDisabled:
  {
    color: "#808080",
    fontSize: "14px",
    fontWeight: "500"
  },
  iconNew:
  {
    backgroundColor: "#CA332F",
    display: "flex",
    color: "#fff",
    padding: "5px",
    borderRadius: "5px",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0 5px"
    // marginTop: "15px"
  },
  pulseParentDiv:
  {
    height: "60px", borderBottom: "1px solid black"
  },
  pulseChildDiv:
  {
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "10px",
    marginBottom: "10px",
  },
  topPulseDiv:
  {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #efefef",
    paddingBottom: "15px",
  },
  noOfReci:
  {
    fontSize: "18px",
    fontWeight: "500",
    marginTop: "10px",
    marginBottom: "10px",
  },
  inputFieldDiv:
  {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  commonFieldPulse:
  {
    display: "flex", alignItems: "center"
  },
  randomSendDiv:
  {
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "10px",
    marginBottom: "10px",
  },
  randomReciSpan:
  {
    fontSize: "18px",
    fontWeight: "500",
    marginTop: "10px",
    marginBottom: "10px",
  },
  confirmDiv:
  {
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalDiv:
  {
    height: "60px", borderBottom: "1px solid #DEE2E7"
  },
  subDeleteDiv:
  {
    fontSize: "22px", marginTop: "5px"
  },
  smsStepDiv:
  {
    display: "grid",
    padding: "40px 80px 15px 90px",
    "@media screen and (max-width: 768px)": {
      gridTemplateColumns: "auto",
      padding: "0px"
    },

  },
  numberChnageModal:
  {
    height: "60px",
    borderBottom: "1px solid #DEE2E7"
  },

  creatorButtons:
  {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom:"40px",
    marginTop: "20px",
    position: "relative",
    bottom: "10px",
    "@media screen and (max-width: 768px)": {

      marginTop: "150px",
      display: "block"
    },
  },
  rightMostContainer:
  {
    display: "flex",
    "@media screen and (max-width: 768px)": {
      display: "block"
    }
  },
  mobileGrid:
  {
    padding: "0px !important",
    margin: "0px !important"
  },
  report: {
    maxWidth: 1920
  },
  italic: {
    fontStyle: 'italic'
  },
  ellipsisText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  graphCampaignName: {
    fontWeight: 'bold',
    maxWidth: graphTextWidth[windowSize]
  },
  mb25: {
    marginBottom: 25
  },
  mt25: {
    marginTop: 25
  },
  radioButtonActive : 
  {
    color : "#007bff"
  },
  radioButtonDisabled : 
  {
    color:"#d3d3d3"
  },
  grDoc : 
  {
    border : "1px solid #1771AD",
    color:"#1771AD",
    borderRadius:"50%",
    padding:"10px",
    display:"flex"
  },
  fullSize: {
    height: '100%',
    width: '100%'
  },
  spaceEvenly: {
    justifyContent: 'space-evenly'
  },
  verificationBoxSMS:
  {
    borderBottom:"1px solid #dee2e6",padding:"4px"
  },
  verificationBodySMS:
  {
    marginTop:"15px",alignItems:"center",display:"flex",flexDirection:"column",width:"100%",textAlign:"center"
  },
  fontSmsRegulations : 
  {
    fontSize:"18px"
  },
  OtpPhoneNumberInput :
  {
    border:"1px solid #bbb",borderRadius:"5px",marginTop:"30px",width:"200px",alignContent:"center",marginBottom:"30px",padding:"5px",textAlign:"center"
  
  },
  OtpPhoneNumberConfirm :
  {
    border:"1px solid #bbb",borderRadius:"5px",marginTop:"30px",width:"300px",textAlign:"center",padding:"5px",
    "&::placeholder":
    {
      textAlign: "center"
    }
  },
  OtpPhoneNumberConfirmSuccess :
  {
    border:"1px solid #bbb",borderRadius:"5px",marginTop:"30px",width:"300px",textAlign:"center",padding:"5px",marginBottom:"30px",
    "&::placeholder":
    {
      textAlign: "center"
    }
  },
  otpContactUs : 
  {
    marginTop:"30px",fontSize:"14px"
  }
});