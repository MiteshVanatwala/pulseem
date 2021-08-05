import { height, width } from "@amcharts/amcharts4/.internal/core/utils/Utils"
import { Block } from "@material-ui/icons"

const dialogWidth = {
  xs: 200,
  sm: 350,
  md: 350,
  lg: 350
}

const paperMinWidthSm = {
  xs: 350,
  sm: 500,
  md: 500,
  lg: 500,
  xl: 500
}
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
        minWidth: windowSize==='xs'? 0:100
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
    maxHeight: 'calc(100vh - 53px)'
  },
  pulseemIcon: {
    fontFamily: 'pulseemicons'
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
  w20: {
    width: '20%'
  },
  w80: {
    width: '80%'
  },
  maxWidth400: {
    maxWidth: 400
  },
  widthUnset: {
    width: 'unset'
  },
  maxWidth540: {
    maxWidth: 540
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
  pb10: {
    paddingBottom: 10
  },
  mr10: {
    marginInlineEnd: 10
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
  black: {
    color: 'black'
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
  inlineGrid: {
    display: 'inline-grid'
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
  justifyCenter: {
    display: 'flex',
    justifyContent: 'center'
  },
  alignCenter: {
    alignContent: 'center',
    alignItems: 'center'
  },
  spaceEvenly: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  textCapitalize: {
    textTransform: 'capitalize'
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
  blackDivider: {
    height: 2,
    backgroundColor: 'rgb(0, 0, 0, 0.5)'
  },
  noWrap: {
    flexWrap: 'nowrap'
  },
  infoDiv : 
  {
    height:'100px',
    display:"flex",
    alignItems:"center"
  },
  headInfo:
  {
    fontSize:'32px',
    fontWeight:'600',
    marginInlineEnd : '10px'
  },
  bodyInfo : 
  {
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    width:"20px",
    height:"20px",
    backgroundColor:"black",
    borderRadius:"50%",
    color:"white",
    cursor:"pointer"

  },
  headNo:
  {
    backgroundColor: "#1c82b2",
    color: "#fff",
    fontSize: "25px",
    border:"1px solid",
    borderRadius:"50%",
    width:"40px",
    height:"40px",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    marginInlineEnd : '10px'
  },
  headDiv : 
  {
    height:'60px',
    display:"flex",
    alignItems:"center"
  },
  contentHead : 
  {
    color: "#157eaf",
    fontSize: "30px"
  },
  fieldDiv:
  {
    width:'90%',
    display:'grid',
    gridTemplateColumns:'auto auto auto',
    gridGap : "20px",
    height : '100px',
    marginTop:'20px'
  },
  buttonForm:
  {
    display:'flex',
    flexDirection:'column',
  },
  buttonHead : 
  {
    fontSize: '20px',
    marginBottom:'10px'
  }
  ,
  buttonContent :
  {
    fontSize:'12px',
    marginTop:'8px'
  },
  alertMsg : 
  {
    color : "red"
  },
  buttonField : 
  {
    borderRadius: '5px',
    border: '1px solid #bbb',
    outline: 'none',
    padding: '12px',
  },
  success : 
  {
    borderBottom:'2px solid green'
  },
  error: 
  {
    borderBottom:'2px solid red'
  },
  msgHead : 
  {
    fontSize: '20px',
  },
  msgArea :
  {
    resize: 'none',
    height: '240px',
    overflow: 'hidden',
    textAlign: 'left',
    marginTop:"20px",
    width:"100%",
    border:'none',
    borderTop:"1px solid rgb(170, 170, 170)",
    borderLeft:"1px solid rgb(170, 170, 170)",
    borderRight:"1px solid rgb(170, 170, 170)",
    outline:'none',
    padding:'10px',
    fontSize:'16px',
    // borderRadius:'5px',
    '&::placeholder':
    {
      color:'rgb(170, 170, 170)',
      fontSize:'16px',

    }
  },
  smallInfoDiv : 
  {
    display:"flex",
    width:"100%",
    justifyContent:"flex-end",
    alignItems:"center",
    color: "#1c82b2",
    fontSize:"12px",
    // backgroundColor:"red",
    padding:'10px',
    border:'none',
    borderBottom:"1px solid rgb(170, 170, 170)",
    borderLeft:"1px solid rgb(170, 170, 170)",
    borderRight:"1px solid rgb(170, 170, 170)",

  },
  funcDiv : 
  {
    width:'100%',
    height:"40px",
    // backgroundColor : "black",
    padding:'10px',
    border:"1px solid rgb(170, 170, 170)",
    display:"flex",
    alignItems:"center",
  },
  baseButtons:
  {
    display:'flex',
    alignItems:"center",
    justifyContent:"center",
    borderRight:"1px solid black"
  },
  infoButtons:
  {
    borderRadius:"20px",
    width:"150px",
    color:'white',
    backgroundColor:"red",
    padding:"10px",
    backgroundColor: '#1c82b2',
    borderColor: '#1c82b2',
    marginInlineStart:'10px'
  },
  info2Buttons:
  {
    borderRadius:"20px",
    width:"110px",
    color:'white',
    backgroundColor:"red",
    padding:"10px",
    backgroundColor: '#1c82b2',
    borderColor: '#1c82b2',
    marginInlineStart:'10px',
    marginInlineEnd:'5px'

  },
  selectMsg:
  {
    marginInlineStart:'12px',
    borderRight:"1px solid black"
  },
  selectVal:
  {
    outline:'none',
    padding:'10px',
    width:'65px',
    borderRadius:'5px',
    borderColor: '#1c82b2',
    marginInlineEnd:'12px'


  },
  addDiv:
  {
    display:'flex',
    alignItems:"center",
    justifyContent:"center",
    position:'relative',
   
    width:'80px'

  },
  addButtons : 
  {
    padding:"10px",
    display:'flex',
    alignItems:"center",
    justifyContent:"center",
    
  },
  rightForm:
  {
    display:'flex',
    alignItems:'center',
  },
  rightInput :
  {
    outline:'none',
    padding:'10px',
    border:'1px solid #efefef',
    marginInlineEnd:'5px'
  },
  rightSend :
  {
    display:'flex',
    width:'70px',
    border:'1px solid green',
    color:'green',
    padding:'9px',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:'8px',
    cursor:'pointer'

  },
  rightInput2 :
  {
    outline:'none',
    padding:'10px',
    border:'1px solid #efefef',
    marginInlineEnd:'5px',
    width:'240px'

  },

  buttonDiv:
  {
    display:"flex",
    alignItems:"center",
    marginTop:"20px",
    marginBottom:'50px'
  },
  rightInput3 :
  {
    outline:'none',
    padding:'10px',
    marginInlineEnd:'15px',
    borderRadius: '30px',
    height: '40px',
    boxShadow: '0 1px 2px #a5a2a2',
    border: '0',
    borderColor: '#dc3545',
    backgroundColor : "#dc3545",
    color:"white",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700'
   

  },
  rightInput4 :
  {
    outline:'none',
    padding:'10px',
    marginInlineEnd:'15px',
    borderRadius: '30px',
    height: '40px',
    boxShadow: '0 1px 2px #a5a2a2',
    border: '0',
    width:'80px',
    borderColor: '#5b9bcd',
    backgroundColor : "#5b9bcd",
    color:"white",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700'
  },
  rightInput5 :
  {
    outline:'none',
    padding:'10px',
    marginInlineEnd:'15px',
    borderRadius: '30px',
    height: '40px',
    boxShadow: '0 1px 2px #a5a2a2',
    border: '0',
    width:'80px',
    borderColor: '#5b9bcd',
    backgroundColor : "#5b9bcd",
    color:"white",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700'
  },
  rightInput6 :
  {
    outline:'none',
    padding:'10px',
    marginInlineEnd:'12px',
    borderRadius: '30px',
    height: '40px',
    boxShadow: '0 1px 2px #a5a2a2',
    border: '0',
    width:'100px',
    borderColor: '#449d44',
    backgroundColor : "#449d44",
    color:"white",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700'
  },
  phoneNumber : 
  {
    position:'absolute',
    left:'28%',
    top:'31%',
    fontWeight:'700'
  },
  chat : 
  {
    position:'absolute',
    top: '180px',
    left:'11%',
    width: '250px',
    height: '165px',
    backgroundColor:'#3da6f6',
    borderRadius : '20px',
    '&:before' :
    {
      content: "",
      position: 'absolute',
      zIndex: 0,
      bottom: 0,
      right: '-8px',
      height: '20px',
      width: '20px',
      background: '#3da6f6',
      backgroundAttachment: 'fixed',
      bordeBottomLefRadius: '15px',
    },
    '&:after' :
    {
      content: "",
      position: 'absolute',
      zIndex: '1',
      bottom: '0',
      right: '-10px',
      width: '10px',
      height: '20px',
      background: '#fff',
      borderBottomLeftRadius: '10px',
    }

  },
  groupName : 
  {
    display:"block",
    fontSize:"32px",
   color: '#006996',
   width:"700px"
  },
  modalDiv:
  {
    display:'flex',
    flexDirection:'column',
    alignItems:"center",
    justifyContent:'center',
    width:'700px',
    marginTop:'20px'
  },
  modalSearch :
  {
    width:'100%',
    padding:'10px',
    outline:'none'
  },
  confirmButton :
  {
    outline:'none',
    padding:'10px',
    borderRadius: '30px',
    height: '30px',
    boxShadow: '0 1px 2px #a5a2a2',
    border: '0',
    width:'130px',
    borderColor: '#449d44',
    backgroundColor : "#449d44",
    color:"white",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700',
    marginTop:'20px'
  },
  dropDiv : 
  {
    position:"absolute",
    width:"200px",
    height:"150px",
    top:"-150px",
    left:"20px",
    display:"flex",
    flexDirection:'column'
  },
  dropCon :
  {
    marginBottom: '8px',
    border: '1px solid #1c82b2',
    boxShadow: '0 3px 5px 1px #e0dada',
    borderRadius: '15px',
    backgroundColor: '#fff',
    padding: '10px',
    width:'100%',
    color:"#1c82b2",
    textAlign:"center"

  },
  listDiv :
  {
    height:"300px",
    maxHeight:'400px',
    width:"700px",
    marginTop:"20px",

  },
  searchCon :
  {
   
    padding:'12px',
    '&:hover' :
    {
      backgroundColor:'#efefef',
    }
  },
  conInfo :
  {
    fontSize: '22px',
    color: '#555',
    marginInlineEnd:'5px'
  },
  tabDiv :
  {
    width:'700px',
    display:'grid',
    gridTemplateColumns:'50% 50%',

  },
  tab1 :
  {
    padding:'10px',
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:"24px",
    color:"#777777"

     
  },
  activeTab:
  {
    borderBottom : '3px solid #1771AD',
    color:"#277BFF !important"

  },
  areaManual :
  {
    border: '2px dashed rgba(0,0,0,.2)',
    width:'700px',
    height:"250px",
    backgroundColor:"white !important",

  },
  areaCon :
  {
    width:'680px',
    outline:'none',
    border:'none',
    resize:'none',
    height:'120px',
    backgroundColor:"white !important",
    padding : "10px",
    '&::placeholder':
    {
      color:'rgb(170, 170, 170)',
      fontSize:'16px',
      fontFamily:'inherit',
    }

  },
  backBtn :
  {
    marginTop: '30px',
    boxShadow: '0 1px 2px #a5a2a2',
    padding:"12px",
    backgroundColor:"#4F87B5",
    width:"70px",
    color :"white",
    borderRadius : "20px",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontWeight:'700'
  },
  pulseDiv :
  {
    display:"flex",
    marginTop:"20px",
    alignItems:"center"

  },
  pulse :
  {
    border:"1px solid blue",
    color:"blue",
    width:"120px",
    padding:"8px",
    marginInlineEnd:"8px",
    borderRadius:"4px",
    cursor:"pointer"

  },
  toggleDiv :
  {
    display:'flex',
    alignItems:"center",
    width:'100px'
    
  },
  inputDays :
  {
    padding:"10px",
    outline:"none",
    width:"30px",
    marginInlineEnd:"5px",
    marginBottom:"8px"
  },
  before:
  {
    display:'block',
    width:"56px",
    alignItems:"center",
    justifyContent:'center',
    borderBottomLeftRadius:"4px",
    borderTopLeftRadius:"4px",
    border:"1px solid #277BFF",
    padding:"10px",
    marginBottom:"8px"
  },
  after :
  {
   display:'block',
    width:"56px",
    alignItems:"center",
    justifyContent:'center',
    borderBottomRightRadius:"4px",
    borderTopRightRadius:"4px",
    borderLeft:"none",
    border:"1px solid #277BFF",
    padding:"10px",
    marginBottom:"8px"
  }



})