import { height, width } from "@amcharts/amcharts4/.internal/core/utils/Utils";
import { Block } from "@material-ui/icons";

const dialogWidth = {
  xs: 200,
  sm: 350,
  md: 350,
  lg: 350,
};

const paperMinWidthSm = {
  xs: 350,
  sm: 500,
  md: 500,
  lg: 500,
  xl: 500,
};
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
  xl: 15,
};
const iconWrapperMinWidth = {
  xs: 50,
  sm: 100,
  md: 100,
};
const summaryNotificationMinWidth = {
  xs: "240px",
};
const notificationTitleFontSize = {
  xs: 12,
  sm: 12,
  md: "1rem",
};

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
    "& $dialogChildren": {
      maxHeight:
        windowSize === "xs" || windowSize === "sm" ? "100vh" : "calc(65vh)",
    },
    "& $mobileBG": {
      "& $iconWrapper": {
        minWidth: windowSize === "xs" ? 0 : 100,
      },
    },
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
    maxWidth: 150,
  },
  dialogCancelButton: {
    background: "rgba(212,137,33,1)",
    backgroundImage: "linear-gradient(to bottom, #d9534f 0%, #c9302c 100%)",
    backgroundRepeat: "repeat-x",
    border: "1px solid darkred",
    borderTop: "0px solid darkred",
    boxShadow: "0px 3px 3px darkred",
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
    maxHeight: "calc(100vh - 53px)",
  },
  pulseemIcon: {
    fontFamily: "pulseemicons",
  },
  borderAround: {
    border: '1px solid #000'
  },
  borderBottom1: {
    borderBottom: '1px solid #ccc'
  },
  dBlock: {
    display: 'block'
  },
  dFlex: {
    display: 'flex'
  },
  rtlSwitch: {
    transform: 'rotateY(180deg)'
  },
  alignItemsCenter: {
    alignItems: 'center'
  },
  w80: {
    width: '80%'
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
  dFlex: {
    display: "flex",
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
  mbNeg10: {
    marginBottom:-10
  },
  ml10: {
    marginInlineStart: 10
  },
  ml25: {
    marginInlineStart: 25
  },
  mtNeg15: {
    marginTop: -15
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
  black: {
    color: "black",
  },
  bgBrown: {
    backgroundColor: "#636363",
  },
  colorWhite: {
    color: "#fff",
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
    display: "flex",
    justifyContent: "center",
  },
  alignCenter: {
    alignContent: "center",
    alignItems: "center",
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
  rtlSwitch: {
    transform: "rotateY(180deg)",
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
    width: "90%",
    display: "grid",
    gridTemplateColumns: "auto auto auto",
    gridGap: "20px",
    height: "100px",
    marginTop: "20px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
      gridTemplateColumns: "auto",
    },
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
    fontSize: "12px",
    marginTop: "8px",
  },
  alertMsg: {
    color: "red",
  },
  buttonField: {
    borderRadius: "5px",
    border: "1px solid #bbb",
    outline: "none",
    padding: "12px",
  },
  success: {
    borderBottom: "2px solid green",
  },
  error: {
    borderBottom: "2px solid red",
  },
  msgHead: {
    fontSize: "20px",
  },
  msgArea: {
    resize: "none",
    height: "240px",
    overflow: "hidden",
    textAlign: "left",
    marginTop: "20px",
    width: "100%",
    border: "none",
    borderTop: "1px solid rgb(170, 170, 170)",
    borderInlineStart: "1px solid rgb(170, 170, 170)",
    borderInlineEnd: "1px solid rgb(170, 170, 170)",
    outline: "none",
    padding: "10px",
    fontSize: "16px",
    // borderRadius:'5px',
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
    },
    "@media screen and (max-width: 768px)": {
      width: "92%",
    },
  },
  msgArea1: {
    resize: "none",
    height: "240px",
    overflow: "hidden",
    textAlign: "right",
    marginTop: "20px",
    width: "100%",
    border: "none",
    borderTop: "1px solid rgb(170, 170, 170)",
    borderInlineStart: "1px solid rgb(170, 170, 170)",
    borderInlineEnd: "1px solid rgb(170, 170, 170)",
    outline: "none",
    padding: "10px",
    fontSize: "16px",
    // borderRadius:'5px',
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
    },
    "@media screen and (max-width: 768px)": {
      width: "92%",
    },
  },
  smallInfoDiv: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    color: "#1c82b2",
    fontSize: "12px",
    // backgroundColor:"red",
    padding: "10px",
    border: "none",
    borderBottom: "1px solid rgb(170, 170, 170)",
    borderLeft: "1px solid rgb(170, 170, 170)",
    borderRight: "1px solid rgb(170, 170, 170)",
    "@media screen and (max-width: 768px)": {
      width: "92%",
    },
  },
  funcDiv: {
    width: "100%",
    height: "40px",
    // backgroundColor : "black",
    padding: "10px",
    border: "1px solid rgb(170, 170, 170)",
    display: "flex",
    alignItems: "center",
    "@media screen and (max-width: 768px)": {
      height: "60px",
      width: "92%",
    },
  },
  baseButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRight: "1px solid black",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      paddingInlineEnd: "8px",
    },
  },
  infoButtons: {
    borderRadius: "20px",
    width: "106px",
    color: "white",
    fontSize:"11px",
    backgroundColor: "red",
    padding: "10px",
    backgroundColor: "#1c82b2",
    borderColor: "#1c82b2",
    marginInlineStart: "5px",
    "@media screen and (max-width: 768px)": {
      width: "80px",
      padding: "8px",
      marginBottom: "5px",
      fontSize: "7px",
    },
  },
  info2Buttons: {
    borderRadius: "20px",
    width: "77px",
    fontSize:"11px",
    color: "white",
    backgroundColor: "red",
    padding: "10px",
    backgroundColor: "#1c82b2",
    borderColor: "#1c82b2",
    marginInlineStart: "3px",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "80px",
      padding: "8px",
      marginBottom: "5px",
      fontSize: "10px",
    },
  },
  selectMsg: {
    marginInlineStart: "5px",
    borderInlineEnd: "1px solid black",
    "@media screen and (max-width: 768px)": {
      borderRight: "none",
    },
  },
  selectVal: {
    outline: "none",
    padding: "5px",
    width: "65px",
    borderRadius: "5px",
    borderColor: "#1c82b2",
    marginInlineEnd: "4px",
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

    width: "62px",
  },
  addButtons: {
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize:"14px",
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
    border: "1px solid #efefef",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  rightSend: {
    display: "flex",
    width: "70px",
    border: "1px solid green",
    color: "green",
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
    marginInlineEnd: "5px",
    width: "240px",
    marginInlineEnd: "5px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },

  buttonDiv: {
    display: "flex",
    alignItems: "center",
    marginTop: "20px",
    marginBottom: "50px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
    },
  

  },
  buttonDivAct: {
    display: "flex",
    alignItems: "center",
    marginTop: "150px",
    marginBottom: "50px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
    },
  },
  rightInput3: {
    outline: "none",
    padding: "10px",
    marginInlineEnd: "15px",
    borderRadius: "30px",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    borderColor: "#dc3545",
    backgroundColor: "#dc3545",
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
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "80px",
    borderColor: "#5b9bcd",
    backgroundColor: "#5b9bcd",
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
    width: "80px",
    borderColor: "#5b9bcd",
    backgroundColor: "#5b9bcd",
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
    borderRadius: "30px",
    height: "40px",
    boxShadow: "0 1px 2px #a5a2a2",
    border: "0",
    width: "100px",
    borderColor: "#449d44",
    backgroundColor: "#449d44",
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
    left: "28%",
    top: "31%",
    fontWeight: "700",
  },
  chat: {
   
    
    backgroundColor: "#3da6f6",
    color:"#fff",
     maxWidth:"260px",
    backgroundAttachment: 'fixed',
    minWidth:"100px",
    padding: '8px',
    minHeight: '30px',
    wordBreak: 'break-all',
    borderRadius: "12px",
    fontWeight:"500",
    maxHeight:"200px",
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
  wrapChat : 
  {
    position: "absolute",
    top: "180px",
    left: "10%",
    backgroundColor: "#fff",
    color:"#fff",
    display: 'flex',
    justifyContent: 'flex-end',
    borderRadius: "12px",
 
    backgroundAttachment: 'fixed',
    width: '260px',
    maxHeight: '200px',
    // overflowY:"auto",
    minHeight: '40px',
    wordBreak: 'break-all',
    
    
      
  },
  fromMe  :
  {
    alignSelf: 'flex-end',
    borderRadius: '1.15rem',
    lineHeight: '1.25',
    maxWidth: '75%',
    padding: '0.5rem .875rem',
    position: 'relative',
    wordWrap: 'break-word',
    backgroundColor: '#248bf5',
    color: '#fff',
    '&::before' : 
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
    '&::after' : 
    {
      backgroundColor: '#fff',
      borderBottomLeftRadius: '0.5rem',
      right: '-40px',
      transform:'translate(-30px, -2px)',
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
    marginTop: "20px",
  },
  searchCon: {
    padding: "12px",
    display:"flex",
    alignItems:"center",
    
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
    width: "700px",
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
     fontSize:"14px",

    },
  },
  activeTab: {
    borderBottom: "3px solid #1771AD",
    color: "#277BFF !important",
  },
  areaManual: {
    border: "2px dashed rgba(0,0,0,.2)",
    width: "700px",
    height: "250px",
    backgroundColor: "white !important",
  },
  greenManual: {
    border: "2px dashed #4BB543",
    width: "700px",
    height: "250px",
    backgroundColor: "#CCFFE5",
  },
  areaCon: {
    width: "680px",
    outline: "none",
    border: "none",
    resize: "none",
    height: "230px",
    backgroundColor: "white !important",
    padding: "10px",
    "&::placeholder": {
      color: "rgb(170, 170, 170)",
      fontSize: "16px",
      fontFamily: "inherit",
    },
  },
  greenCon: {
    width: "680px",
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
    color: "blue",
    width: "120px",
    padding: "8px",
    marginInlineEnd: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    color:"#277bff",
    '&:hover' : 
    {
      color:"#ffffff",
      backgroundColor:"#277bff",
    }


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
    color:"#277BFF",
    cursor:"pointer"
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
    color:"#277BFF",
    cursor:"pointer"
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
    backgroundColor:"#277BFF",
    color:"#ffffff",
    cursor:"pointer"

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
    backgroundColor:"#277BFF",
    color:"#ffffff",
    cursor:"pointer"
  },
  smsInit: {
    display: "grid",
    gridTemplateColumns: "67% auto",
    padding: "40px 80px 15px 90px",

    "@media screen and (max-width: 768px)": {
      gridTemplateColumns: "100%",
      padding:"0"
    },
  },
  msgDiv: {
    display: "flex",
    marginTop: "50px",
    height: "400px",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      marginTop: "250px !important",
    },
  },
  boxDiv: {
    width: "450px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  emoji: {
    display: "flex",
    alignItems: "center",
    borderRight: "1px solid black",
    paddingInlineEnd: "0",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      borderRight: "1px solid black",
    },
  },
  pickerEmoji: {
    position: "relative",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "@media screen and (max-width: 768px)": {
      marginTop: "4px",
    },
  },
  endButtons: {
    display: "flex",
    alignItems:"center",
    // borderRight: "1px solid black",
    "@media screen and (max-width: 768px)": {
      flexDirection: "column",
      // borderRight: "1px solid black",
    },
  },
  radio: {
    display: "flex",
    flexDirection: "column",
    width: "220px",
    "@media screen and (max-width: 768px)": {
      width: "100%",
    },
  },
  switchDiv: {
    marginInlineStart: "35px",
    display: "flex",

    "@media screen and (max-width: 768px)": {
      // marginInlineStart: "0px",
      width: "80%",
      marginInlineStart: "0px",
    },
  },
  phoneDiv: {
    position: "relative",
    marginInlineStart:"5px",
    "@media screen and (max-width: 768px)": {
      marginTop: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  groupsMan : 
  {
    width:"700px",
    border:"1px solid #efefef",
    padding:"4px",
    "@media screen and (max-width: 768px)": {
      width: "315px",
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
    },
  },
  groupsMan1 : 
  {
    width:"700px",
   display:"flex",
       "@media screen and (max-width: 768px)": {
      width: "315px",
      flexWrap:"wrap",


    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      flexWrap:"wrap"
    },
  },
  reciFilter : 
  {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding :"8px",
    borderRadius : '4px',
    "&:hover": {
      backgroundColor: "#007bff",
      color:"#ffffff"
    },
    "@media screen and (max-width: 768px)": {
      width: "30%",
      fontSize:"14px"
      
    },
  },
  selectSort :
  {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding :"7px",
    borderRadius : '4px',
    // width:"150px",
    outline:"none",
    height:"40px",
    fontSize:"17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color:"#ffffff"
    },
    "@media screen and (max-width: 768px)": {
      width: "100%",
      fontSize:"14px"
      
    },
  },
  arrowSort :
  {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color: '#007bff',
    border: '1px solid #007bff',
    padding :"7px",
    borderRadius : '4px',
    height:"25px",
    fontSize:"17px",
    "&:hover": {
      backgroundColor: "#007bff",
      color:"#ffffff"
    },
  },
  selectedContact : 
  {
    width:"700px",
    maxWidth:"700px",
    height:"50px",
    backgroundColor:"#efefef",
    maxHeight:"50px",
    display:"flex",
    flexWrap:"wrap",
    overflowY:"auto" ,
    "@media screen and (max-width: 768px)": {
      width: "315px",
      fontSize:"14px"
      
    },
    "@media screen and (device-width: 411px)": {
      width: "355px",
      fontSize:"14px"
    },
  },
  bubble :
  {
    
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "#007bff",
    height:"24px",
    color:"#ffffff",
    width:"70px",
    borderRadius:"20px",
    fontSize:"16px",
    margin:"6px"
  },
  listGroup :
  {
    height :"250px",
    maxHeight:"250px",
    overflowY :"auto",
    padding:"8px"
  },

  row :
  {
    display :"flex",
    alignItems:"center",
    justifyContent:"space-between",
    height:"20px",
    padding:"12px",
    "&:hover" : {
       backgroundColor:"#efefef"
    }
  },
  icnList : 
  {
    marginInlineEnd : "18px",
  },
  groupInput : 
  {
    padding:"10px",
    outline : "none",
    border : "1px solid #efefef",
    marginInlineStart :"10px"

  },
  saveBtn :
  {
    marginInlineStart:"5px",
    color: '#007bff',
    border: '1px solid #007bff',
    padding:"8px",
    borderRadius:"5px"
  },
  blueDoc :
  {
    border : "2px solid #3DA6F7",
    borderRadius:"50%",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    padding:"8px",
    color : "#3DA6F7"
  },
  greenDoc :
  {
    border : "2px solid #018901",
    borderRadius:"50%",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    padding:"8px",
    color : "#3DA6F7"
  },
  reactSwitch :{
    verticalAlign: 'middle',
    marginInlineEnd: '8px'
  },
  icn : 
  {
    fontSize:"30px",
    color:"#fff",
      'path' :
      {
        stroke:"#fff"
      }
  },
  baseSum :
  {
    display : "grid",
    gridTemplateColumns :"50% 50%",
    width:"700px",
    height:"400px",
    marginTop:"15px"


  },
  sumLeft  : 
  {
marginTop:"10px"
  },
  sumRight : 
  {

  },
  sumChild :
  {
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    marginBottom:"25px"
  },
  spanSum :
  {
    fontSize:"22px",
    color:"#1771ad",
    marginBottom:"7px"
  },
  bodySum :
  {
    fontWeight:"700",
    fontSize:"18px"
  },
  pulseInsert : 
  {
    padding:"8px",
    width:"50px",
    border:"2px solid #efefef",
    height:"25px",
    marginInlineEnd:"8px",
    borderRadius:"6px",
    marginBottom: "8px",
  },
  pulseActive : 
  {
    padding:"8px",
    width:"50px",
    border:"2px solid #efefef",
    height:"25px",
    marginInlineEnd:"8px",
    borderRadius:"6px",
    marginBottom: "8px",
    outline:"none",
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
    height:"25px",
    color:"#A7A7A7",
    cursor:"pointer",
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
    height:"25px",
    color:"#A7A7A7",
    cursor:"pointer",
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
    height:"25px",
    color:"#277BFF",
    cursor:"pointer",
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
    height:"25px",
    color:"#ffffff",
    backgroundColor:" #277BFF",
    cursor:"pointer",
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
    height:"25px",
    color:"#277BFF",
    cursor:"pointer",
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
    height:"25px",
    color:"#ffffff",
    backgroundColor:"#277BFF"
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
    height:"25px",
    color:"#ffffff",
    backgroundColor:" #277BFF",
    cursor:"pointer",
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
    height:"25px",
    color:"#ffffff",
    backgroundColor:"#277BFF"
  },
  inputreci : 
  {
  },
  reciMain :
  {
    marginTop:"10px",
    border:"1px solid #efefef",
    boxShadow:"none",
    borderRadius:"none !important"

  },
  reciList : 
  {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    height:"40px",
    width:"100%",
    backgroundColor:"#F7F7F7",
  },
  manualModal : 
  {
    display : "flex",
    padding : "5px",
    marginTop:"15px",
    marginBottom:"15px",
    width:"100%",
    alignItems:"center"
  },
  inputManual : 
  {
    padding:"10px",
    width:"700px",
    outline:"none",
    borderRadius : "4px"
  },
  adjustP : 
  {
    position:"relative"
  },
  adjustC : 
  {
    position:"absolute",
    // height:"80px",
   
    width:"150px",
    display:"flex",
    flexDirection:"column",
    borderLeft:"1px solid gray",
    borderRight:"1px solid gray",
    borderBottom:"1px solid gray",
    zIndex:"99",
    backgroundColor:"#fff"


  },
  grouping : 
  {
    padding:"10px",
    textAlign:"center",
    borderBottom:"1px solid gray",
    zIndex:"9",
    cursor:"pointer",

    '&:hover' : 
    {
      backgroundColor:"#3C88BB",
      color:"#fff",
      zIndex:"9"
    }
  },
  manualChild : 
  {
    display : "flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginTop:"15px"
  },
  leftAlignIcn : 
  {
    width:"30px",height:"30px",
  },
  rightAlignIcn : 
  {
    width:"30px",height:"30px"
  },
  emojiIcon : 
  {
    marginInlineEnd: "8px"
  },
  addFeatures : 
  {
    marginInlineEnd: "3px",
    border: "1px solid #1c82b2",
    borderRadius: "50%",
    padding: "5px",
    width: "10px",
    height: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1c82b2",
    fontSize: "14px",
    fontWeight: "700",
  },
  selectGroupDiv : 
  {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "700px",
    cursor:"pointer"
  }
  
});
