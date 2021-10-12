import React, { useState, useEffect, useRef } from "react";
import { Tooltip, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Picker from "emoji-picker-react";
import Mobile from "../../../assets/images/mobileiphone.png";
import Radio from "@material-ui/core/Radio";
import Toast from '../../../components/Toast/Toast.component';
import RadioGroup from "@material-ui/core/RadioGroup";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Emoj from "../../../assets/images/smile.png";
import { FaCheck } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";

import { useHistory } from "react-router";
import {
  getPreviousCampaignData,
  getPreviousLandingData,
  getAccountExtraData,
  getGroupsBySubAccountId,
  smsSave,
  deleteSms,
  smsSaveGroup,
  getSmsByID,
  smsQuick,
  getCampaignSumm,
  getCreditsforSMS,
  sendSms,
  getTestGroups,
  getCommonFeatures,
  getSMSVirtualNumber,
  getSMSRequestOTP,
  getSMSConfirmOTP
} from "../../../redux/reducers/smsSlice";
import { Dialog } from "../../../components/managment/index";
import Summary from "./smsSummary";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { RiCloseFill } from "react-icons/ri";
import IconButton from "@material-ui/core/IconButton";
import { Button, Grid, Box, TextField } from "@material-ui/core";
import { AiOutlineExclamationCircle,  AiOutlinePlusCircle , AiOutlineFile ,AiOutlineAlignLeft } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { Loader } from '../../../components/Loader/Loader';
import MuiAlert from "@material-ui/lab/Alert";
import Switch from "react-switch";
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  customWidth: {
    maxWidth: 200,
    backgroundColor: "black",
    fontSize: "14px",
  },
  noMaxWidth: {
    maxWidth: "none",
  },
}));
const useStyleNew = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    border: "1px solid #efefef",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

const SmsCreator = ({ classes, ...props }) => {
  const { t } = useTranslation();
  document.title = t("sms.pageTitle");
  const styles = useStyles();
  const btnStyle = useStyleNew();
  const inputProps = {
    maxlength:"13"
  }
  const otpProps = {
    maxlength:"5"
  }
  const history = useHistory();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL} = useSelector(
    (state) => state.core
  );
  const {
    previousLandingData,
    previousCampaignData,
    extraData,
    accountId,
    getCampaignSum,
    smsSendResult,
    commonSettings
  } = useSelector((state) => state.sms);

  const [alignment, setAlignment] = useState(isRTL ? 'right' : 'left');
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [flagemoji, setflagemoji] = useState(false);
  const [checked, setChecked] = React.useState(false);
  const [dialogClickLanding, setdialogClickLanding] = useState(false);
  const [dialogClickCampaign, setdialogClickCampaign] = useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const [campaignBool, setcampaignBool] = useState(false);
  const [OtpCounter, setOtpCounter] = useState(false);
  const [restoreBool, setrestoreBool] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [save, setsave] = useState(false);
  const [campaignName, setcampaignName] = useState("");
  const [campaignNumber, setcampaignNumber] = useState("");
  const [characterCount, setcharacterCount] = useState(0);
  const [linkCount, setlinkCount] = useState(0);
  const [counterBool, setcounterBool] = useState(false);
  const [messageCount, setmessageCount] = useState(0);
  const [msg, setmsg] = useState("");
  const [removalMessageButtonDisabled, setremovalMessageButtonDisabled] = useState(false);
  const [radioBtn, setradioBtn] = useState("top");
  const [landingSearch, setlandingSearch] = useState("");
  const [CampaignSearch, setCampaignSearch] = useState("");
  const [removalLinkDisabled, setremovalLinkDisabled] = useState(false);
  const [waize, setwaize] = useState(false);
  const [contactGroup, setcontactGroup] = useState(false);
  const [ContactSearch, setContactSearch] = useState("");
  const [cancel, setcancel] = useState(true);
  const [exitClick, setexitClick] = useState(false);
  const [otpConfirm, setOtpConfirm] = useState(false);
  const [phone, setphone] = useState("");
  const [OpenS, setOpenS] = useState(false);
  const [alertToggle, setalertToggle] = useState(false);
  const [selectedGroup, setselectedGroup] = useState([]);
  const [StaticNumber, setStaticNumber] = useState("");
  const [hidden, sethidden] = useState(false);
  const [splittedMsg, setsplittedMsg] = useState([])
  const [SplittedLinks, setSplittedLinks] = useState(null);
  const [otpSuccess, setotpSuccess] = useState(false);
  const [Searched, setSearched] = useState("");
  const [modalOpen, setmodalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [removalNumber, setremovalNumber] = useState(null);
  const [otpVerifyDialog, setOtpVerifyDialog] = useState(false);
  const [storedValue, setstoredValue] = useState("");
  const [keep, setkeep] = useState(true);
  const [summary, setsummary] = useState(false);
  const [campaignNumberValidated, setcampaignNumberValidated] = useState(false);
  const [total, settotal] = useState(0);
  const [temp, settemp] = useState([]);
  const [otpValue, setotpValue] = useState("");
  const [SelectValueDisabled, setsetSelectValueDisabled] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [selectValue, setselectValue] = useState("Personilization");
  const [finalApi, setfinalApi] = useState(false);
  const [isTestCampaign, setIsTestCampaign] = useState(false);
  const [extraAccountDATA, setextraAccountDATA] = useState([]);
  const [isLinksStatistics, setIsLinksStatistics] = useState(true);
  const [otpMsgs, setotpMsgs] = useState("Required Field")
  const [smsModel, setSmsModel] = useState({
    SubAccountID: -1,
    CreditsPerSms: "1",
    FromNumber: campaignNumber,
    IsLinksStatistics: true,
    IsResponse: false,
    IsTest: true,
    IsTestCampaign: false,
    AccountID: -1,
    Credits: "1",
    SmsCampaignID: -1,
    TotalRecipients: 1,
    Name: campaignName,
    ResponseToEmail: "",
    SendDate: Date.now(),
    SendingMethod: 0,
    Status: 1,
    TestGroupsIds: temp,
    Text: msg,
    Type: 0,
    UpdateDate: Date.now(),
  });
  const [quickSendPayload, setquickSendPayload] = useState({
          SMSCampaignID: -1,
          SubAccountID: -1,
          Status: -1,
          Type: 0,
          CreditsPerSms: "1",
          UpdateDate: Date.now(),
          Name: campaignName,
          FromNumber: campaignNumber,
          Text: msg,
          ResponseToEmail: "",
          IsTestCampaign: false,
          IsResponse: false,
          IsLinksStatistics: isLinksStatistics,
          SendDate: Date.now(),
          SendingMethod: 0,
          IsTest: isTestCampaign,
          PhoneNumber: phone,
          MessageLength: "1",
          LogData: {
            SmsCampaignID: -1, 
            SubAccountID: "", 
            AccountID: "", 
            Credits: "1", 
            TotalRecipients: 1
          }
  })

  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: t('sms.saved'), showAnimtionCheck: true },
    QUICKSENDSUCCESSS: { severity: 'success', color: 'success', message: t('sms.quickSend'), showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('sms.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('sms.error'), showAnimtionCheck: true },
    OTP : { severity: 'success', color: 'success', message: "OTP verified successfully", showAnimtionCheck: true},
    INVALIDNUMBER : { severity: 'error', color: 'error', message: "Invalid phone number", showAnimtionCheck: false},
    QUICKSENDERROR : { severity: 'error', color: 'error', message: "Error sending message", showAnimtionCheck: false},
    SENTALREADY : { severity: 'success', color: 'success', message: "Already Sent Message", showAnimtionCheck: true},

  }

  const handleSendResult = async (smsSendResult) => {
      switch (smsSendResult) {
        case -2: {// ALREADY_SENT
          setToastMessage(toastMessages.SENTALREADY)
          break;
        }
        case -1: {// ERROR
          setToastMessage(toastMessages.QUICKSENDERROR)
          break;
        }
        case 0: {// SUCCESS
        setToastMessage(toastMessages.QUICKSENDSUCCESSS)
        }
        case 1: {// PROVISION
          break;
        }
        case 2: {// NO_CREDITS
          break;
        }
        case 3: {// INVALID_NUMBER
          setToastMessage(toastMessages.INVALIDNUMBER)
          break;
        }
        case 4: {// OTP_NEEDED
          setOtpVerifyDialog(true);
          break;
        }
        case 5: {// ACCEPTED
          break;
        }
    }
  }

  const handleOtpResult = async (otpSendResult) => {
  
   
    switch (otpSendResult) {
      case 1: {// Request
        break;
      }
      case 2: {// Success
      setOtpConfirm(false);
      setotpSuccess(true);
        break;
      }
      case 3: {// Not_Authirized
      }
      case 4: {// Failed
        setOtpCounter(true);
        setotpMsgs("Session Expired , please send again");
        break;
      }
      case 5: {// NotMatch
        setOtpCounter(true);
        setotpMsgs("Incorrect code, try again or click on Send again");
        break;
      }
      case 6: {//  CellphoneNotProvided
        setOtpCounter(true);
        setotpMsgs("Cellphone not correct , please try again later");
      
        break;
      }
      case 7: {// CodeNotProvided
        setOtpCounter(true);
        setotpMsgs("Required field");
        break;
      }
    
  }
}
  useEffect(async () => {
    await handleSendResult();
  }, [smsSendResult]);

  const onApiCall = async () => {
    let temp = [];
    let tempfull = [];
    for (let i = 0; i < selectedGroup.length; i++) {
      if (selectedGroup[i].selected) {
        temp.push(selectedGroup[i].GroupID);
        tempfull.push(selectedGroup[i]);  
      }
    }
    settemp(tempfull);
    const FinalPayloadData = {...smsModel , fromNumber : campaignNumber , Name : campaignName , Text: msg , TestGroupsIds : temp ,IsTestCampaign : isTestCampaign , IsTest : true , IsLinksStatistics : isLinksStatistics}
    await dispatch(smsQuick(FinalPayloadData));
    setfinalApi(true);
    setsummary(false);
    setToastMessage(toastMessages.QUICKSENDSUCCESSS);
  };

  useEffect(async () => {
    setLoader(true);
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getPreviousCampaignData());
    let  resp = await dispatch(getAccountExtraData());
    let arr = Object.keys(resp.payload)
    let arr2 = arr.map(function(key)
    {
      return {[key] : resp.payload[key]};
    })
    let tempArr = [];
      for (let i = 0; i < arr2.length; i++) {
        tempArr.push({ ...arr2[i], selected: false })
      }
      setextraAccountDATA(tempArr)
    await dispatch(getGroupsBySubAccountId());
    let r = await dispatch(getCommonFeatures());
    if (props && props.match.params.id) {
      getSavedData();
    }
    setcampaignNumber(r.payload.DefaultCellNumber)
    let response = await dispatch(getSMSVirtualNumber(r.payload.DefaultCellNumber));
    setStaticNumber(response.payload.Number);
    setremovalNumber(response.payload.RemovalKey);
    setstoredValue(r.payload.DefaultCellNumber)
    setLoader(false);
  }, [dispatch]);

  useEffect(() => { }, [removalMessageButtonDisabled]);

  useEffect(() => { }, [selectedGroup]);
  useEffect(() => {
    document.title = t("mainReport.smsTitle");
  }, []);

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < accountId.length; i++) {
      temp.push(accountId[i]);
    }
    setselectedGroup(temp);
  }, [accountId]);

  const getSavedData = async () => {
    if (props && props.match.params.id) {
      let response = await dispatch(getSmsByID(props.match.params.id))
      if (response) {
        setcampaignName(response.payload.Name);
        setmsg(response.payload.Text)
        setcampaignNumber(response.payload.FromNumber)
        setmessageCount(response.payload.CreditsPerSms);
        setcharacterCount(response.payload.Text ? response.payload.Text.length : 0)
      }
    }
  }
  useEffect(() => {
    getSavedData();
  }, [])

  const toggleChecked = () => {
    setChecked((prev) => !prev);
    setIsTestCampaign(!isTestCampaign)
  };
  const toggleKeep = () => {
    let toggle = !isLinksStatistics
    setkeep((prev) => !prev);
    setIsLinksStatistics(!isLinksStatistics);
  };

  const getcredits = async (count) =>
  {
    let response = await dispatch(getCreditsforSMS(count));
    let credits = response.payload.split("#");
    setmessageCount(credits[0]);
  }

  const renderSwitch = () => {
    return (
      <Box className={classes.infoDiv}>
        <Typography className={classes.headInfo}>
          {t("mainReport.smsCampaign")}
        </Typography>
        <Tooltip
          disableFocusListener
          title={t("mainReport.toolTip1")}
          classes={{ tooltip: styles.customWidth }}
        >
          <Typography className={classes.bodyInfo}>i</Typography>
        </Tooltip>
      </Box>
    );
  };
  const renderHead = () => {
    return (
      <Box className={classes.headDiv}>
        <Typography className={classes.headNo}>1</Typography>
        <Typography className={classes.contentHead}>
          {t("mainReport.createContent")}
        </Typography>
      </Box>
    );
  };

  const onCamppaignChange = (e) => {
    setcampaignName(e.target.value);
    setcampaignBool(false);
  };

  const onCampaignNumber = (e) => {
      setrestoreBool(false);
      setcampaignNumber(e.target.value);
      setcampaignNumberValidated(false);
  };

  const validationCheck = () => {
    if (campaignName === "") {
      setcampaignBool(true);
      setsave(true);
      return false;
    }

    if (msg === "") {
      setsave(true);
      return false;
    }
    let english = /^[ A-Za-z0-9]*$/;
    if(campaignNumber === "" || !english.test(campaignNumber))
    { 
      setcampaignNumberValidated(true);
      setsave(true);
      return false;
    }
    return true;
  };
  const handleSend = async () => {
    if (validationCheck()) {
      if (phone !== "") {
        if(props && props.match.params.id)
        {
          const smsQuickSendData = {...quickSendPayload , SmsCampaignID : props.match.params.id ,FromNumber : campaignNumber , PhoneNumber : phone , Name : campaignName , Text : msg  , IsTest : false , IsLinksStatistics : isLinksStatistics , CreditsPerSms : messageCount ,  LogData : { SubAccountID : commonSettings.SubAccountId , AccountID : commonSettings.AccountID , SmsCampaignID :  props.match.params.id , Credits: messageCount,
          TotalRecipients: 1 } }
          setLoader(true);
          let r = await  dispatch(smsQuick(smsQuickSendData));
          setLoader(false);  
          handleSendResult(r.payload.Result)
        }
        else
        {
          const smsQuickSendData = {...quickSendPayload , FromNumber : campaignNumber , PhoneNumber : phone , Name : campaignName , Text : msg  , IsTest : false, IsLinksStatistics : isLinksStatistics , CreditsPerSms : messageCount , LogData :  { SubAccountID : commonSettings.SubAccountId , AccountID : commonSettings.AccountID , SmsCampaignID :  -1 , Credits: messageCount, 
          TotalRecipients: 1} }
          setLoader(true);
          let r = await  dispatch(smsQuick(smsQuickSendData));
          setLoader(false);
          handleSendResult(r.payload.Result)
        }
      } else {
        setToastMessage(toastMessages.INVALIDNUMBER);
      }
    }
  };
  const onLeave = (e) => {
    if (!modalOpen && campaignNumber !== storedValue) {
      setalertToggle(true);
      setcounterBool(true);
    } else {
      setcounterBool(false);
    }
  }
  const handleRestore = async () => 
  {
    setrestoreBool(true);
    setcampaignNumber(StaticNumber);
    setLoader(true);
    let r = await dispatch(getCommonFeatures());
    setLoader(false);
    // setcampaignNumber(r.payload.DefaultCellNumber)
    setLoader(true);
    let response =  await dispatch(getSMSVirtualNumber(r.payload.DefaultCellNumber));
    setLoader(false);
    setcampaignNumber(response.payload.Number);
    setStaticNumber(response.payload.Number);
    setremovalNumber(response.payload.RemovalKey);
  }
  const onEmojiClick = (event, emojiObject) => {
    let msgs = msg;
    let count = characterCount;
    count++;
    setcharacterCount(count);
    setChosenEmoji(emojiObject);
    setflagemoji(false);
    setmsg(msgs + emojiObject.emoji);
    getcredits(count);  
  };
  const renderFields = () => {
    return (
      <Grid container spacing={windowSize === "xs" ? 0 : 2} className={classes.fieldDiv}>
        <Grid item xs={windowSize === "xs" ? 12 : 4} className={classes.buttonForm}>
          <Typography className={classes.buttonHead}>
            {t("mainReport.campName")}
          </Typography>
          <TextField
            id="outlined-basic"
            type="text"
            placeholder={t("mainReport.campaignNamePlaceholder")}
            className={
              campaignBool
                ? clsx(classes.buttonField, classes.error)
                : clsx(classes.buttonField, classes.success)
            }
            onChange={onCamppaignChange}
            value={campaignName}
          />
          <Typography className={classes.buttonContent}>
            {t("mainReport.campDesc")}
          </Typography>
        </Grid>
        <Grid item xs={windowSize === "xs" ? 12 : 4} className={classes.buttonForm}>
          <Box className={classes.inputCampDiv}>
            <Typography className={classes.buttonHead}>
              {t("mainReport.campFrom")}
            </Typography>
            <Typography
              className={classes.restoreBtn}
              onClick={() => {
                handleRestore()
              }}
            >
              {t("mainReport.restore")}
            </Typography>
            
          </Box>

          <TextField
            id="outlined-basic"
            type="text"
            className={
              campaignNumberValidated
                ? clsx(classes.buttonField, classes.error)
                : clsx(classes.buttonField , classes.success)
            }
            onChange={onCampaignNumber}
            inputProps={inputProps}
            value={campaignNumber}
            onBlur={onLeave}
          />
          <Typography className={clsx(classes.buttonContent, classes.alertMsg)}>
            {t("mainReport.campRemovalDesc")}
          </Typography>
        </Grid>
        <Grid item xs={windowSize === "xs" ? 12 : 4} >
          {restoreBool || removalNumber !== null ? (
            <Box className={classes.buttonForm}>
              <Typography className={clsx(classes.buttonHead)}>
                {t("mainReport.removalReply")}
              </Typography>
              <TextField
                id="outlined-basic"
                type="text"
                placeholder="2"
                disabled
                className={windowSize === "xs" ? classes.buttonFieldRemovalMobile : classes.buttonFieldRemoval}
                value={removalNumber}
                disabled
              />
            </Box>
          ) : null}
        </Grid>
      </Grid>
    );
  };
  const onMsgChange = async (e) => {
    if (msg !== "" && e.target.value.length < msg.length) {
      if(msg.includes("To unsubscribe reply 282"))
      {
        setremovalMessageButtonDisabled(true);
      }
      else
      {
        setremovalMessageButtonDisabled(false);
      }
      if(msg.includes("##SmsUnsubscribeURL##"))
      {
        setremovalLinkDisabled(true);
      }
      else
      {
        setremovalLinkDisabled(false);
      }
      if(msg.includes(selectValue))
      {
        setsetSelectValueDisabled(true);
      }
      else
      {
        setsetSelectValueDisabled(false);
      }
    }
    setmsg(e.target.value);
    setcharacterCount(e.target.value.length);
let tempMsg = "";
tempMsg = e.target.value
let arr = e.target.value.split("\n");
setsplittedMsg(arr);

let count = 0;
for (let i = 0; i < arr.length; i++) {
  if (arr[i] != "") {
    count++;
  }
}
const linkRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
let links = e.target.value.match(linkRegex);
setSplittedLinks(links);
if(links)
{
    let linkSize = links.length;
    if(isLinksStatistics)
    {
      let a= 0 
      for (let i = 0; i < arr.length; i++) { 
        if(arr[i].includes("https://") == false)
        {
            a = a+arr[i].length
        }
      }
      setcharacterCount(a + 35)
    }
    else
    {
           setcharacterCount(tempMsg.length)
    }
}
else
{
    setlinkCount(0);
}
getcredits(e.target.value.length)
  };

  const onRemovalLink = async () => {
    let newLink = "";
    newLink = msg + "##SmsUnsubscribeURL##";
    setmsg(newLink);
    let total = splittedMsg;
    total.push("##SmsUnsubscribeURL##")
    if(isLinksStatistics && SplittedLinks !== null) {
      let a=0;
      for(let i = 0 ; i<total.length;i++)
      {
        if(total[i].includes("https://") == false)
        {
          a = a + total[i].length
        }
      }
      setcharacterCount(a+35)
      setremovalLinkDisabled(true);
    }
    else
    {
       setcharacterCount(newLink.length);
       setremovalLinkDisabled(true);
    }
    getcredits(newLink.length)
    setremovalLinkDisabled(true);
  };

  const onRemovalMsg = async () => {

    let newMsg = "";
    newMsg = msg + "To unsubscribe reply 282";
    setmsg(newMsg);
    let total = splittedMsg;
    total.push("To unsubscribe reply 282")

    if(isLinksStatistics && SplittedLinks !== null)
    {
      let a=0;
      for(let i = 0; i<total.length;i++) {
        if(total[i].includes("https://") == false) {
          a = a + total[i].length
        }
      }
      setcharacterCount(a+35)
      setremovalMessageButtonDisabled(true);
    }
    else
    {
      setcharacterCount(newMsg.length);
      setremovalMessageButtonDisabled(true);
    }
    getcredits(newMsg.length)
    setremovalMessageButtonDisabled(true);
  };

  const handleSelectChange =  async (e) => {
    setselectValue(e.target.value);
    let linkMsg = "";
    linkMsg = msg +  "##" + e.target.value + "##";
    setmsg(linkMsg);
    getcredits(e.target.value.length)
    setcharacterCount(linkMsg.length);
    setsetSelectValueDisabled(true);
    let temparr = [];
    for(let i = 0 ; i < extraAccountDATA.length ; i++ )
    {
      if(e.target.value === Object.keys(extraAccountDATA[i])[0])
      {
        temparr.push({ ...extraAccountDATA[i], selected: true })
      }
    }
    setextraAccountDATA(temparr);
  };
  const handleMsgSelect = () =>
  {
    if(msg.includes("To unsubscribe reply 282"))
    {
      setremovalMessageButtonDisabled(true);
    }
    else
    {
      setremovalMessageButtonDisabled(false);
    }
    if(msg.includes("##SmsUnsubscribeURL##"))
    {
      setremovalLinkDisabled(true);
    }
    else
    {
      setremovalLinkDisabled(false);
    }
    if(msg.includes(selectValue))
    {
      setsetSelectValueDisabled(true);
    }
    else
    {
      setsetSelectValueDisabled(false);
    }
  }

  const renderMsg = () => {
    return (
      <Grid container className={classes.msgDiv}>
        <Grid container>
          <Grid item xs={windowSize === "xs" ? 12 : 8} className={classes.boxDiv}>
            <Typography className={classes.msgHead}>
              {t("mainReport.yourMessage")}
            </Typography>
            <textarea
              placeholder={t("mainReport.typeText")}
              maxlength="1000"
              outlined=""
              id="yourMessage"
              className={clsx(classes.msgArea)}
              style={{ textAlign: alignment == "left" ? "left" : "right" }}
              onChange={onMsgChange}
              onSelect={handleMsgSelect}
              value={msg}
            ></textarea>
            <Box className={classes.smallInfoDiv}>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {linkCount} {t("mainReport.link")}
              </Typography>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {messageCount} {t("mainReport.message")}
              </Typography>
              <Typography>{characterCount}/1000 {t("mainReport.char")}</Typography>
            </Box>
            <Box className={classes.funcDiv}>
              <Box
                className={isRTL ? classes.emojiHe : classes.emoji}
              >
                {isRTL ? (
                       <>
                         <Tooltip
                    disableFocusListener
                    title={t("mainReport.aligntoRight")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                        <FormatAlignRightIcon style={{marginInlineEnd:"4px"}} onClick={() => {handleToggleClick("right")}}/>
                        </Tooltip>
                        <Tooltip
                    disableFocusListener
                    title={t("mainReport.alignToLeft")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                       <FormatAlignLeftIcon   onClick={() => {handleToggleClick("left")}}/>
                      </Tooltip>
                       </>
                ) : (   
          <>
            <Tooltip
                    disableFocusListener
                    title={t("mainReport.alignToLeft")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                      <FormatAlignLeftIcon  style={{marginInlineEnd:"4px"}} onClick={() => {handleToggleClick("left")}}/>   
          </Tooltip>          
          <Tooltip
                    disableFocusListener
                    title={t("mainReport.aligntoRight")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                      <FormatAlignRightIcon  onClick={() => {handleToggleClick("right")}}/>
                      </Tooltip>
                      </>
                )}
                <Box className={classes.pickerEmoji}>
                  {flagemoji ? (
                    <Picker
                      onEmojiClick={onEmojiClick}
                     
                      groupVisibility={{
                        flags: false,
                      }}
                    />
                  ) : null}
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.emoji")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                    <img
                      src={Emoj}
                      style={{
                        marginInlineEnd: "8px",
                        widht: "25px",
                        height: "25px",
                      }}
                      onClick={() => {
                        setflagemoji(!flagemoji);
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box className={classes.baseButtons}>
              <Tooltip
                    disableFocusListener
                    title={t("mainReport.removalMsgTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-center"
                    arrow
                  >
                <Typography
                  className={classes.infoButtons}
                  onClick={removalMessageButtonDisabled ? null : onRemovalMsg}
                >
                  <Typography className={classes.editorLink}>+</Typography>
                  {t("mainReport.removalMsg")}
                </Typography>
                </Tooltip>
                <Tooltip
                    disableFocusListener
                    title={t("mainReport.removalLinkTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-center"
                    arrow
                  >
                <Typography
                  className={classes.infoButtons}
                  onClick={removalLinkDisabled ? null : onRemovalLink}
                >
                  <Typography className={classes.editorLink}>+</Typography>
                  {t("mainReport.removalLink")}
                </Typography>
                </Tooltip>
              </Box>
              <Box className={classes.endButtons}>
                <Box className={classes.selectMsg}>
                <Tooltip
                    disableFocusListener
                    title={t("mainReport.selectTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-center"
                    arrow
                  >
                  <select
                    className={classes.selectVal}
                    value={selectValue}
                    onChange={handleSelectChange}
                  >
                    <option disabled value="Personilization">{t("mainReport.personalisationSelect")}</option>
                    {extraAccountDATA.map((item, i) => {
                      if(item.selected)
                      {
                        return(<option disabled value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{item[Object.keys(item)[0]]}</option>)
                      }
                     else
                     {
                      return <option  value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{item[Object.keys(item)[0]]}</option>;
                     }
                     
                    })}
                  </select>
                  </Tooltip>
                </Box>
                <Box className={classes.addDiv} tabindex="0" onBlur={() => {seteditmenuClick(false)}}>
                <Tooltip
                    disableFocusListener
                    title={t("mainReport.addVariantsTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-center"
                    arrow
                  >
                  <Typography 
                    className={classes.addButtons}
                    onClick={() => {
                      seteditmenuClick(!editmenuClick);
                    }}
                  >
                    <AiOutlinePlusCircle style={{ fontSize: "28px", color: "#1AA2B8", marginInlineEnd: "5px" }} />
                    {t("mainReport.add")}
                  </Typography>
                  </Tooltip>
                  {editmenuClick ? (
                    <Box className={classes.dropDiv}>
                      <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setdialogClickLanding(true);
                          seteditmenuClick(false);
                        }}
                      >
                        {t("mainReport.landingLink")}
                      </Typography>
                      {previousCampaignData.length == 0 ? null : (
                        <Typography
                          className={classes.dropCon}
                          onClick={() => {
                            setdialogClickCampaign(true);
                            seteditmenuClick(false);
                          }}
                        >
                          {t("mainReport.campLink")}
                        </Typography>
                      )}
                      <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setwaize(true);
                          seteditmenuClick(false);
                        }}
                      >
                        {t("mainReport.waize")}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={windowSize === "xs" ? 12 : 4}>
            <Box className={classes.switchDiv}>
              <FormGroup>
                <Switch
                  className={
                    isRTL
                      ? clsx(classes.reactSwitchHe, "react-switch")
                      : clsx(classes.reactSwitch, "react-switch")
                  }
                  checked={keep}
                  onChange={toggleKeep}
                  onColor="#28a745"
                  checkedIcon={false}
                  uncheckedIcon={false}
                  handleDiameter={30}
                  height={20}
                  width={48}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  id="material-switch"
                />
              </FormGroup>
              <Box className={classes.radio}>
                <Typography style={{ fontSize: "18px" }}>
                  {t("mainReport.keepTrack")}
                </Typography>
                <Typography
                  className={classes.descSwitch}
                >
                  {t("mainReport.keepDesc")}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const handleToggleClick = (val) =>
  {
    if(val == "left")
    {
      setAlignment("left")
    }
    else
    {
      setAlignment("right")
    }
  }

  const onRadiochange = (e) => {
    setradioBtn(e.target.value);
    if (e.target.value === "bottom") {
      setcontactGroup(true);
    }
  };

  const handleNumberChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) 
    {
      setphone(e.target.value);
    }
  };

  const renderPhone = () => {
    return (
      <Box>
        <Box className={classes.phoneDiv}>
          <img src={Mobile} className={classes.phoneImg} />
          <span className={classes.phoneNumber}>{campaignNumber}</span>
          <div className={isRTL ? classes.wrapChatHe : classes.wrapChat}>
            <div className={classes.chatBox}>
            <div className={classes.fromMe}>
              {msg}
            </div>
            </div>
           
          </div>
        </Box>
        <div
          className={classes.testDiv}
        >
          <FormGroup>
            <Switch
              checked={checked}
              onChange={toggleChecked}
              name="checkedB"
              handleDiameter={30}
              onColor="#28a745"
              checkedIcon={false}
              uncheckedIcon={false}
              height={20}
              width={48}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              className="react-switch"
              id="material-switch"
              className={isRTL ? classes.reactSwitchHe : classes.reactSwitch}
            />
          </FormGroup>
          <div
            style={{ display: "flex", flexDirection: "column", width: "250px" }}
          >
            <span style={{ fontSize: "18px" }}>{t("mainReport.testSend")}</span>
            <span
              style={{
                width: "200px",
                fontSize: "15px",
                marginTop: "5px",
                color: "#B5B5B5",
              }}
            >
              {t("mainReport.testDesc")}
            </span>
          </div>
        </div>
        {checked ? (
          <div className={classes.testRadios}>
            <RadioGroup
              row
              aria-label="position"
              name="position"
              value={radioBtn}
              onChange={onRadiochange}
            >
              <div className={{ display: "flex", flexDirection: "column" }}>
                <div>
                  <FormControlLabel
                    value="top"
                    control={
                      <Radio
                        color="primary"
                        id="top"
                        style={{ color: "#007bff" }}
                      />
                    }
                  />
                  <span>{t("mainReport.sendToOne")}</span>
                </div>
                {radioBtn === "top" ? (
                  <div className={classes.rightForm}>
                    <input
                      type="text"
                      placeholder={t("mainReport.enterPhone")}
                      className={classes.rightInput}
                      value={phone}
                      maxLength="12"
                      onChange={handleNumberChange}
                    />
                    <span className={classes.rightSend} onClick={handleSend}>
                      {t("mainReport.send")}
                    </span>

                  </div>
                ) : null}
                <div>
                  <FormControlLabel
                    value="bottom"
                    control={
                      <Radio
                        color="primary"
                        id="bottom"
                        style={{ color: "#007bff" }}
                      />
                    }
                  />
                  <span>
                    {t("mainReport.sendToGroups")}
                    <span className={classes.newIcn}>{t("mainReport.newFeature")}</span>
                  </span>
                </div>
                {radioBtn === "bottom" ? (
             <div className={classes.rightForm}>
             <div
               className={classes.contactGroupDiv}
               onClick={() => {
                 setcontactGroup(true);
               }}
             >
               <div> {t("mainReport.ChooseLinks")}</div>
               {hidden ? (
                 <div className={classes.mappedGroup}>
                   {selectedGroup.map((item, index) => {
                     if (item.selected && hidden) {
                       return (
                         <div className={classes.selectedGroupsDiv}>
                           <span className={classes.nameGroup}>
                             {item.GroupName}
                           </span>
                           <RiCloseFill
                             className={classes.groupCloseicn}
                             onClick={() => {
                               handleCross(index);
                             }}
                           />
                         </div>
                       );
                     }
                   })}
                 </div>
               ) : null}
             </div>
           </div>
                ) : null}
              </div>
            </RadioGroup>
          </div>
        ) : null}
      </Box>
    );
  };

  const handleCross = (id) => {
    let temp = [];
    for (let i = 0; i < selectedGroup.length; i++) {
      if (i == id) {
        temp.push({ ...selectedGroup[i], selected: false });
      } else {
        temp.push(selectedGroup[i]);
      }
    }
    setselectedGroup(temp);
  };
  const clickExit = () => {
    setexitClick(true);
  };
  const onHandleDelete = () => {
    setDeleteModalOpen(true);
  };

  const onContinueClick = async (isSave) => {
    if (validationCheck()) {

      if(props && props.match.params.id)
      {
        const payloadToPush = {...smsModel , FromNumber : campaignNumber , Name : campaignName , Text : msg  , CreditsPerSms: `${messageCount}` , IsLinksStatistics : isLinksStatistics , IsTest : isTestCampaign , AccountID : commonSettings.AccountID , SubAccountID : commonSettings.SubAccountId , SmsCampaignID  : props.match.params.id}
        setLoader(true);
        let r = await dispatch(smsSave(payloadToPush));
        setLoader(false);
        if(r.payload.Status == 2)
        {
          if (isSave) {  
            setToastMessage(toastMessages.SUCCESS);
            setTimeout(() => {
              history.push(`/sms/edit/${props.match.params.id}`);
              setToastMessage(null);
            }, 1500);
          } else {

            history.push(`/sms/edit/${props.match.params.id}`);
            history.push(`/sms/send/${props.match.params.id}`);
          }
        }
        else if (r.payload.Status == 3) {
          setOtpVerifyDialog(true);
        }

      }
      else
     {
      const payloadToPush = {...smsModel , FromNumber : campaignNumber , Name : campaignName , Text : msg  , CreditsPerSms: `${messageCount}` , IsLinksStatistics : isLinksStatistics , IsTest : isTestCampaign , AccountID : commonSettings.AccountID , SubAccountID : commonSettings.SubAccountId , SmsCampaignID  : -1}
      setLoader(true);
      let r = await dispatch(smsSave(payloadToPush));
      setLoader(false);
       if(r.payload.Status == 2)
       {
       
       if (isSave) {
        setToastMessage(toastMessages.SUCCESS);
        setTimeout(() => {
          history.push(`/sms/edit/${r.payload.Message}`);
          setToastMessage(null);
        }, 1500);  
      } else {
            history.push(`/sms/edit/${r.payload.Message}`);
            history.push(`/sms/send/${r.payload.Message}`);
          }
        }
        else if (r.payload.Status == 3) {
          setOtpVerifyDialog(true);
        }
      }
    }
  };

  const handleClose = () => {
    setDeleteModalOpen(false);
  };
  const handleCloseSave = () => {
    setsave(false);
  };
  const handleCloseLanding = () => {
    setdialogClickLanding(false);
  };
  const handleCloseCampaign = () => {
    setdialogClickCampaign(false);
  };
  const handleCloseWaize = () => {
    setwaize(false);
  };
  const handleLink = async (id) => {
    let linkMsg = "";
    linkMsg = msg + previousLandingData[id].PageHref;
    setdialogClickLanding(false);
    seteditmenuClick(false);
    setmsg(linkMsg);
    let total = splittedMsg;
    total.push(previousLandingData[id].PageHref)
    if(isLinksStatistics && SplittedLinks !== null) {
      let a=0;
      for(let i = 0 ; i<total.length;i++)
      {
        if(total[i].includes("https://") == false)
        {
          a = a + total[i].length
        }
      }
      setcharacterCount(a+35)
      getcredits(a+35)
    }
    else
    {
      setcharacterCount(linkMsg.length);  
      getcredits(linkMsg.length)
    }
    let lc = linkCount;
    setlinkCount(++lc);
  };

  const handleCampClick = async (id) => {
    let campaignData = "";
    campaignData = msg + previousCampaignData[id].EncryptURL;
    setdialogClickCampaign(false);
    seteditmenuClick(false);
    setmsg(campaignData);
    let total = splittedMsg;
    total.push(previousCampaignData[id].EncryptURL)
    if(isLinksStatistics && SplittedLinks !== null) {
      let a=0;
      for(let i = 0 ; i<total.length;i++)
      {
        if(total[i].includes("https://") == false)
        {
          a = a + total[i].length
        }
      }
      setcharacterCount(a+35)
      getcredits(a+35)
    }
    else
    {
      setcharacterCount(campaignData.length);
      getcredits(campaignData.length)
    }
    let cc = linkCount;
    setlinkCount(++cc);
  };

  const handleCloseContact = () => {
    setcontactGroup(false);
  };

  const handleSelect = (id) => {
    let tempArr = [];
    for (let i = 0; i < selectedGroup.length; i++) {
      if (id === selectedGroup[i].GroupID) {
        if (selectedGroup[i].selected) {
          tempArr.push({ ...selectedGroup[i], selected: false });
        } else {
          tempArr.push({ ...selectedGroup[i], selected: true });
        }
      } else {
        tempArr.push(selectedGroup[i]);
      }
    }
    setselectedGroup(tempArr);
  };

  const handleDelete = async () => {
    if (props && props.match.params.id) {
      let response = await dispatch(getSmsByID(props.match.params.id))
      if (response) {
        dispatch(deleteSms(response.payload.SMSCampaignID));
        handleClose();
        history.push("/SMSCampaigns");
      }
    }
    else {
      dispatch(deleteSms(-1));
      handleClose();
      history.push("/SMSCampaigns");
    }
  };

  const handleGroupClose = async () => {

    let boolean = false;
    for (let i = 0; i < selectedGroup.length; i++) {
      if (selectedGroup[i].selected) {
        boolean = true;
        break;
      }
    }
    if (campaignName !== "" && msg !== "" && boolean === true) {

      let temp = [];
      let tempfull = [];
      let num = 0;
      for (let i = 0; i < selectedGroup.length; i++) {
        if (selectedGroup[i].selected) {
          temp.push(selectedGroup[i].GroupID);
          tempfull.push(selectedGroup[i]);
          ++num;
        }
      }
      settotal(num);
      settemp(tempfull);
      const payloadToPush = { ...smsModel, fromNumber: campaignNumber, Name: campaignName, Text: msg, TestGroupsIds: temp }
      let r = await dispatch(smsSave(payloadToPush));
      if (r.payload.Status == 2) {
        let payload2 = {
          IsTestGroups: true,
          SMSCampaignID: r.payload.Message,
          TestGroupsIds: temp,
        };
        let r2 = await dispatch(smsSaveGroup(payload2));
        await dispatch(getCampaignSumm(r.payload.Message));
        setsummary(true);
      }
      else if (r.payload.Status == 3) {
        setOtpVerifyDialog(true);
      }
    }
    setsave(false);
    sethidden(true);
    setcontactGroup(false);
  };
  const renderSendGroup = () => {
    return (
      <>
        {contactGroup ? (
          <Dialog
            classes={classes}
            open={contactGroup}
            onClose={handleCloseContact}
            showDefaultButtons={false}
            icon={<HiOutlineUserGroup className={classes.icn} />}
          >
            <div className={classes.baseDialogSetup}>
              <span className={classes.groupName}>
                {t("mainReport.selectGroups")}
              </span>
            </div>
            <div className={classes.modalDiv}>
              <Paper component="form" className={btnStyle.root}>
                <IconButton
                  type="submit"
                  className={btnStyle.iconButton}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
                <InputBase
                  className={btnStyle.input}
                  placeholder={t("mainReport.searchSms")}
                  inputProps={{ "aria-label": "Search" }}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                  }}
                />
              </Paper>
            </div>
            <div className={classes.listDiv}>
              {selectedGroup
                .filter((val) => {
                  if (ContactSearch == "") {
                    return val;
                  } else if (
                    val.GroupName.toLowerCase().includes(
                      ContactSearch.toLowerCase()
                    )
                  ) {
                    return val;
                  }
                })
                .map((item, idx) => {
                 
                  return (
                    <div className={classes.searchCon} onClick={() => {
                      handleSelect(item.GroupID);
                    }}>
                      <span
                        style={{ marginInlineEnd: "25px" }}
                        className={
                          item.selected ? classes.greenDoc : classes.blueDoc
                        }
                      >
                        {item.selected ? (
                          <FaCheck className={clsx(classes.green)} />
                        ) : (
                          <HiOutlineUserGroup />
                        )}
                      </span>
                      <div
                        className={classes.selectGroupDiv}
                      >
                        <span>{item.GroupName}</span>
                        <span>{item.Recipients} Recipients</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div
              style={{
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  handleGroupClose();
                }}
                className={clsx(
                  classes.dialogButton,
                  classes.dialogConfirmButton
                )}
              >
                {t("mainReport.confirmSms")}
              </Button>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };

  const renderExit = () => {
    return (
      <>
        {exitClick ? (
          <Dialog
            classes={classes}
            open={exitClick}
            onClose={() => { handleExit(false) }}
            onConfirm={() => { handleExit(true) }}
            onCancel={() => { setexitClick(false) }}
            confirmText={t("mainReport.Ok")}
            cancelText={t("mainReport.No")}
            showDefaultButtons={true}
            icon={
              <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
              />
            }
          >
            <div className={classes.baseDialogSetup}>
              <span className={classes.groupName}>{t("mainReport.handleExitTitle")}</span>
            </div>
            <div className={classes.bodyTextDialog}>
              <span>{t("mainReport.leaveCampaign")}</span>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };
  const handlecaution = () => {
    setalertToggle(false);
    setcounterBool(false);
    setmodalOpen(true);
  };

  const handlecautioncancel = () => {
    setcampaignNumber(storedValue);
    setalertToggle(false);
  };

  const handleAlertoff = () => {
    setcampaignNumber(storedValue);
    setalertToggle(false);
  };
  const renderAlert = () => {
    return (
      <>
        {alertToggle ? (
          <Dialog
            classes={classes}
            open={alertToggle}
            onClose={handleAlertoff}
            onConfirm={handlecaution}
            confirmText={t("mainReport.confirmSms")}
            onCancel={handlecautioncancel}
            cancelText={t("mainReport.cancelPleaseNoteModal")}
            showDefaultButtons={true}
            icon={<div className={classes.dialogIconContent}>
              {'\uE11B'}
            </div>}
          >
            <Box className={classes.numberChnageModal}>
              <Typography className={classes.groupName}>  {t("mainReport.pleaseNote")}</Typography>
            </Box>
            <Box >
              <Typography className={classes.modalText}>
                {t("mainReport.pleaseNoteDsec")}
              </Typography>
            </Box>
          </Dialog>
        ) : null}
      </>
    );
  };
  const handleExit = async (saveBeforeExit) => {

    if (saveBeforeExit) {
      const payloadToPush = { ...smsModel, fromNumber: campaignNumber, Name: campaignName, Text: msg }
      let r = await dispatch(smsSave(payloadToPush));
      if (r) {
        setexitClick(false);
        history.push("/SMSCampaigns");
      }
    }
    else if (saveBeforeExit == false) {

      setexitClick(false);
      history.push("/SMSCampaigns");
    }
  };
  const handleSummary = () => {
    setsummary(false);
  }

  const renderSummary = () => {
    return (
      <>
        <Summary
          classes={classes}
          campaignName={campaignName}
          fromNumber={campaignNumber}
          totalmsg={msg}
          selectedGroups={selectedGroup}
          open={summary}
          totalRecipients={total}
          handleCallback={handleSummary}
          groups={temp}
          summaryPayload={getCampaignSum}
          api={onApiCall}
        />
      </>
    );
  };
  const onLocation = async () => {
    let tempmsg = "";
    tempmsg = msg + "https://waze.to/?q=" + Searched.split(" ").join("%20");
    setmsg(tempmsg);
    let lc = linkCount;
    setlinkCount(++lc);
    setcharacterCount(tempmsg.length);
    getcredits(tempmsg.length)
    setwaize(false);
  };

  const renderPreviousLandingDataModal = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={dialogClickLanding}
          onClose={handleCloseLanding}
          showDefaultButtons={false}
          icon={<BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>{t("mainReport.selectLanding")}</span>
          </div>
          <div className={classes.modalDiv}>
            <Paper component="form" className={btnStyle.root}>
              <IconButton
                type="submit"
                className={btnStyle.iconButton}
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>
              <InputBase
                className={btnStyle.input}
                placeholder={t("mainReport.searchSms")}
                inputProps={{ "aria-label": "Search" }}
                onChange={(e) => {
                  setlandingSearch(e.target.value);
                }}
              />
            </Paper>
          </div>
          <div className={classes.listDiv}>
            {previousLandingData
              .filter((val) => {
                if (landingSearch == "") {
                  return val;
                } else if (
                  val.CampaignName.toLowerCase().includes(
                    landingSearch.toLowerCase()
                  )
                ) {
                  return val;
                }
              })
              .map((item, idx) => {
                return (
                  <div
                    className={classes.searchCon}
                    onClick={() => {
                      handleLink(idx);
                    }}
                  >
                    <span
                      style={{ marginInlineEnd: "8px" }}
                      className={classes.grDoc}
                    >
                      <AiOutlineFile style={{ color: "#1771AD", fill: "#1771AD", stroke: "#1771AD" }} color="#1771AD" />
                    </span>
                    <span>{item.CampaignName}</span>
                  </div>
                );
              })}
          </div>
        </Dialog>
      </>
    )
  }
  const renderPreviousCampaignsData = () => {
    return (
      <>
        {dialogClickCampaign ? (
          <Dialog
            classes={classes}
            open={dialogClickCampaign}
            onClose={handleCloseCampaign}
            showDefaultButtons={false}
            icon={<BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />}
          >
            <div style={{ height: "60px", borderBottom: "1px solid black" }}>
              <span className={classes.groupName}>{t("mainReport.selectCamp")}</span>
            </div>
            <div className={classes.modalDiv}>
              <Paper component="form" className={btnStyle.root}>
                <IconButton
                  type="submit"
                  className={btnStyle.iconButton}
                  aria-label="search"
                >
                  <SearchIcon />
                </IconButton>
                <InputBase
                  className={btnStyle.input}
                  placeholder={t("mainReport.searchSms")}
                  inputProps={{ "aria-label": "Search" }}
                  onChange={(e) => {
                    setCampaignSearch(e.target.value);
                  }}
                />
              </Paper>
            </div>
            <div className={classes.listDiv}>
              {previousCampaignData
                .filter((val) => {
                  if (CampaignSearch == "") {
                    return val;
                  } else if (
                    val.CampaignName.toLowerCase().includes(
                      CampaignSearch.toLowerCase()
                    )
                  ) {
                    return val;
                  }
                })
                .map((item, idx) => {
                  return (
                    <div
                      className={classes.searchCon}
                      onClick={() => {
                        handleCampClick(idx);
                      }}
                    >
                      <span
                        style={{ marginInlineEnd: "8px" }}
                        className={classes.grDoc}
                      >
                        <AiOutlineFile />
                      </span>
                      <span>{item.Name}</span>
                    </div>
                  );
                })}
            </div>
          </Dialog>
        ) : null}</>
    )
  }
  const renderWaizeNavigationModal = () => {
    return (<>
      {waize ? (
        <Dialog
          classes={classes}
          style={{ width: "400px" }}
          open={waize}
          onClose={handleCloseWaize}
          showDefaultButtons={false}
          icon={<div className={classes.dialogIconContent}>
            {'\u0056'}
          </div>}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>
              {t("mainReport.waizeTitle")}
            </span>
          </div>
          <div className={classes.modalDiv}>
            <Paper component="form" className={btnStyle.root}>
              <IconButton
                type="submit"
                className={btnStyle.iconButton}
                aria-label={t("mainReport.searchSms")}
              >
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0ZFOUE1Q0ExQkM0MTFFNTgyQjlDN0NCMzAzQzk4NjkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0ZFOUE1Q0IxQkM0MTFFNTgyQjlDN0NCMzAzQzk4NjkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRkU5QTVDODFCQzQxMUU1ODJCOUM3Q0IzMDNDOTg2OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRkU5QTVDOTFCQzQxMUU1ODJCOUM3Q0IzMDNDOTg2OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu8Ul6cAAAXVSURBVHja1Jd5UJVVGMZ/313hsnMva6mImgpSgBIoLulkJbYxMTrp6EhmLo3TNDrmH2n/pKVZzWiDuS/ZVOKS04xlVuIWqIQMgSGBgKEo6xURLtyt97s6k41o0EadmQPffOd8533O+zznec9V1p0sPg+ESnfw7zadgtKsk4cHcLvpjSZRAzXyv4Heay0aern1OgDdX+JQtOO6JR+NAoqi/LMA1OVdErTd4cQ3IIjgoECMOh1q3A5512S9xvXmJry1ChqNBvffCUAN3t5pxy8kjLj7wqjMz6Xg0B6sdVc9mQgwhzA4YTgPjxxL+dVGmq/UYjLo/xCErpu5pt0Fg2JiuVFWxJbVS7lcXoY5xILZEopGq+VyVRmFB/cS0i+atDkLGTIsibKy8xiRDxXNnwegyB5s8ndYzBAKPt7A/o0fMG7iYyzZuoPYIYN/p+Kyyip2blzP2oUv8GTmXJJnLaS49DzeAsKN0nMA6idtdidDY2M5vW0t2R+uZfOn2SQnJXnGrTLmdDo9GVKzMKh/FG++tYqMadOZkf4Mbrud1PlLKCwsxKTXdUnHPQGogjOHR1Kbl8OBzVnsPnyEodH9abB1YvEyEKDXUtfR6Zlr9jZ6ADd12ImPe5D9R47z7JiRhEZFc1/KROp/qUIrIHvkA3Y5Y5GBvhzcmsWU2XM8wdUAsm0+2buP7wvO4iNC8zHoKCw+x67d2XR22GiWOQP73E/mq4vZ9e5KzDoXDo2u50ak9fLmankpWqedpzKmIskm2KinThQ+LeM53lu5Al8J7isgtqzPYsbUKVworyBI5tgke7PnzifEbKb4+BECgoN7rgGj0YvGqlL8/f0Ji4wUMcp5t3UwaEA0n3/5FSYfX27YbxbR5zNfYPzEiQxPjKdJKHIKgBChZXDsMKrO/ciY1Edpa2oQw1K6B0CdphWTab/R6uHOWzi3O1xSQxXyTueTkjqaMD8fLl9v89S1sSMSsUnPzT1FQkICzlsWqdPrcTrsd3XJLilwCcc2Gbp/QATO9hvYbDZM8t4pbudvNFDwQz5jhsd75kb6maT7eJ4njBzFvj3ZBAhYnf7m3prq6/APDqFTMtUViC4BKHoD/YL8aDiaw+71a0kYNfomMJeT67LQvLkvkSLBUlJT2bRpIzt37OCJSZMIFGtevnw5rTInSLRx9vzPlBQVEZM8imartUsnuIOCTkndA1F9+Pad1zmT8w0L5s1n5rwFtIgNq61NFG709WabBF2z5l2+/PqwxwdGPJzM0mXLMOm0tNidnrmrX19KRPRAwmIeov6nUoxazR8DkDqCTYIZ/IPQSiZmvjgHX3nZqtVjFrWru7CKFtR0vrZ40Z1HV3qg+MOKt9+iWqx4efYhKmpqMWq6qQFVZBdrLjH+5aU8kj6F0XFDWbN6Fe6ODkoqKj3qN+o0BGh/v+Cx02ek59Pacp1Fr77C5zu3s3jLZzQa/Gi3NoLSTStWtasX7z5XUUHKS4vpE5fIgU3rOHHiBHX1DZSVljJ9VibpTz8lNu0Qi9VSJOl9X0CaTD6EWixYIiJ4Y88hrF6BXLlQjrcI925VUZFbcb1waOmyAorqgyL7kBRlZll6GsUlJTyYkEh+Xi5x8fFEhIdjE+fLO5lLZN++njPe1ljHqi9yqHJ7Yb1Yidc9S7LScncjksXUAnKttoZKXxPJ4yZw6uh35B07SlLCQyzK2s4Vu0JURCjhbyziow1ZKDo9aZPSaHdruHZVeP+r9wH1Y6OouubSJWImZzD7WjPVP5cx+cWXueQ0UH25RlzPztiZ83A5HLTIUXtc7gKNdhdahxSpLopP9ym4XdlSVg0+fvSV3RolM7UtrVIPruCjer5UQ1NgEH1DLXKCFGqarDTX1d2T9+5RcFvTi526O9spr6wWeSroFbfnuqW6rdEgFi12XXqh1XPpUMe6F7zHl1JZXHP7Pek3mlRPMCh3jv0vfhf8JwAE92J8f9GAUi0Pllt0/ptNfp0rLb8KMAAdGDxx7StBBAAAAABJRU5ErkJggg==" />
              </IconButton>
              <InputBase
                className={btnStyle.input}
                placeholder={t("mainReport.typeAddress")}
                inputProps={{ "aria-label": "Search" }}
                onChange={(e) => {
                  setSearched(e.target.value);
                }}
              />
            </Paper>
            <span
              className={classes.confirmButton}
              onClick={() => {
                onLocation();
              }}
            >
              {t("mainReport.confirmSms")}
            </span>
          </div>
        </Dialog>
      ) : null}</>)

  }
  const renderToast = () => {
    if (toastMessage) {

      setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }
  const renderDeleteModal = () => {
    return (<>
      {deleteModalOpen ? (
        <Dialog
          classes={classes}
          open={deleteModalOpen}
          onClose={handleClose}
          onCancel={cancel ? null : true}
          onConfirm={handleDelete}
          confirmText={t("mainReport.confirmSms")}
          showDefaultButtons={true}
          icon={
            <AiOutlineExclamationCircle
              style={{ fontSize: 30, color: "#fff" }}
            />
          }
        >
          <div className={classes.baseDialogSetup}>
            <span className={classes.groupName}>{t("mainReport.deleteSms")}</span>
          </div>
          <div className={classes.bodyTextDialog}>
            <span>{t("mainReport.confirmSure")}</span>
          </div>
        </Dialog>
      ) : null}
    </>)
  }

  const renderDefaultButtons = () => {
    return (
      <div
        className={
          checked ? clsx(classes.buttonDiv) : clsx(classes.buttonDivAct)
        }
      >
        <span className={classes.rightInput3} onClick={onHandleDelete}>
          <BsTrash style={{ fontSize: "25" }} />
        </span>
        <span className={classes.rightInput4} onClick={() => { setexitClick(true) }}>
          {t("mainReport.exitSms")}
        </span>
        <span
          className={classes.rightInput5}
          onClick={() => {
            onContinueClick(true);
          }}
        >
          {t("mainReport.saveSms")}
        </span>
        <span
          className={classes.rightInput6}
          onClick={() => {
            onContinueClick(false);
          }}
        >
          {t("mainReport.continue")}
        </span>
      </div>
    )
  }
  const renderSaveModal = () => {
    return (<>
      <Dialog
        classes={classes}
        open={save}
        onClose={handleCloseSave}
        showDefaultButtons={false}
        icon={
          <AiOutlineExclamationCircle style={{ fontSize: 30, color: "#fff" }} />
        }
      >
        <div className={classes.baseDialogSetup}>
          <span className={classes.groupName}>
            {t("mainReport.fieldInvalid")}:
          </span>
        </div>
        <div>
          <ul style={{ fontSize: "20px", color: "red", fontWeight: "600" }} className={classes.fieldsRequire}>
            {campaignBool ? <li style={{ marginBottom: "8px" }}>
              {t("mainReport.campaignRequire")}
            </li> : null}
            {msg === "" ? <li>{t("mainReport.msgRequire")}</li> : null}
            {campaignNumberValidated ? <li style={{ marginBottom: "8px" }}>
              {t("mainReport.campaignFromRequire")}
            </li> : null}
          </ul>
        </div>
        <div
          style={{
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setsave(false);
            }}
            className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
          >
            {t("mainReport.confirmSms")}
          </Button>
        </div>
      </Dialog></>)
  }

  const renderOtpSuccessDialog = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={otpSuccess}
          renderButtons={false}
          showDefaultButtons={false}
          exit={true}
          showDefaultButtons={false}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <img src={Gif} style={{ width: "150px", height: "150px" }} />
            <span style={{ marginTop: "10px", fontSize: "22px", fontWeight: "700" }}>Verified!</span>
            <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
              You can now send campaigns from this number
            </p>
            <span style={{ padding: "12px", backgroundColor: "green", marginTop: "10px", cursor: "pointer", color: "#ffffff", borderRadius: "10px" }} onClick={() => { setotpSuccess(false) }}>Confirm</span>
          </div>
        </Dialog>
      </>
    )
  }

  const handleVerifyOTP = async () => {
    let payload = {
      "Cellphone": campaignNumber,
    }
    let r = await dispatch(getSMSRequestOTP(payload))
    setOtpVerifyDialog(false);
    setOtpConfirm(true);
  }

  const renderOtpVerificationDialog = () => {
    return (
      <Dialog
        classes={classes}
        open={otpVerifyDialog}
        onCancel={() => { setOtpVerifyDialog(false) }}
        showDefaultButtons={false}
        icon={<div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>}
      >
        <Box className={classes.verificationBoxSMS}>
          <Typography className={classes.groupName} style={{ textAlign: "center", width: "100%" }}>
            {t("sms.verificationOtp")}
          </Typography>
        </Box>
        <Box className={classes.verificationBodySMS}>
          <Typography className={classes.fontSmsRegulations}>
            {t("sms.OtpRegulations")}
          </Typography>
          <Typography className={classes.fontSmsRegulations}>{t("sms.regulationSecondLine")} <strong>{t("sms.oneTime")}</strong> {t("sms.regulationThirdLine")}</Typography>
          <TextField
            id="outlined-basic"
            type="text"
            className={classes.OtpPhoneNumberInput}
            value={campaignNumber}
            disabled
          />
          <Button
            variant='contained'
            size='small'
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton
            )} style={{ whiteSpace: 'nowrap', width: 'auto' }} onClick={() => { handleVerifyOTP() }}>{t("sms.sendVerificationCode")}</Button>
          <Typography className={classes.otpContactUs}>{t("sms.otpContactUs")}</Typography>
          <Typography style={{ fontSize: "14px" }}>{t("sms.helplineSMS")}</Typography>
        </Box>
      </Dialog>
    )
  }

  const submitOtp = async () => {
    let payload =
    {
      "Cellphone": campaignNumber,
      "Code": otpValue,
    }
    if (otpValidationscheck()) {
      let r = await dispatch(getSMSConfirmOTP(payload))
      handleOtpResult(r.payload.Status)
    }
  }
  const handleOtpChnage = (e) => {
    setotpValue(e.target.value);
    setOtpCounter(false);
    setotpMsgs("Required field")
  }
  const otpValidationscheck = () => {
    if (otpValue === "") {
      setOtpCounter(true);
      return false;
    }
    return true;
  };
  const renderOtpNumberDialog = () => {
    return (
      <Dialog
        classes={classes}
        open={otpConfirm}
        showDefaultButtons={false}
        onCancel={() => { setOtpConfirm(false) }}
        icon={<div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>}
      >
        <Box className={classes.verificationBoxSMS}>
          <Typography className={classes.groupName} style={{ textAlign: "center", width: "100%" }}>
            {t("sms.weHaveSentOtp")}
          </Typography>
        </Box>
        <Box className={classes.verificationBodySMS}>
          <Typography className={classes.fontSmsRegulations}>
            {t("sms.OtpSentSuccessLine1")} <strong>{campaignNumber}</strong>
          </Typography>
          <Typography className={classes.fontSmsRegulations}>{t("sms.OtpSentSuccessLine2")}</Typography>
          <TextField
            id="outlined-basic"
            type="text"
            className={OtpCounter ? clsx(classes.OtpPhoneNumberConfirm, classes.error) : clsx(classes.OtpPhoneNumberConfirmSuccess, classes.success)}
            placeholder={t("sms.typeOtpPlaceholder")}
            onChange={(e) => { handleOtpChnage(e) }}
            inputProps={otpProps}
          />
          {OtpCounter ? <Typography style={{ marginBottom: "30px", color: "red" }}>{otpMsgs}</Typography> : null}
          <Button
            variant='contained'
            size='small'
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmBlueButton
            )} style={{ width: "250px" }} onClick={() => { submitOtp() }}>{t("sms.confirmOtp")}</Button>
          <Box style={{ display: "flex", marginTop: "20px" }}>  <Typography className={classes.fontSmsRegulations}>{t("sms.didntReceivedOtp")} </Typography ><Typography style={{ textDecoration: "underline", marginInlineStart: "4px" }} className={classes.fontSmsRegulations} onClick={() => { handleVerifyOTP() }}>{t("sms.sendAgainOtp")}</Typography></Box>
        </Box>
      </Dialog>
    )
  }
  return (
    <DefaultScreen currentPage="sms" classes={classes}>
      {renderToast()}
      <Grid container spacing={windowSize === "xs" ? 0 : 3} className={windowSize === "xs" ? classes.mobileGrid : classes.smsInit}>
        {windowSize === "xs" ? <Grid item xs={12} >
          {renderSwitch()}
          {renderHead()}
          {renderFields()}
          {renderMsg()}
          {renderPhone()}
        </Grid> : <> <Grid item xs={8}>
          {renderSwitch()}
          {renderHead()}
          {renderFields()}
          {renderMsg()}
        </Grid>
          <Grid item xs={4}>
            {renderPhone()}
          </Grid> </>}
        {renderDefaultButtons()}
      </Grid>
      {renderPreviousLandingDataModal()}
      {renderPreviousCampaignsData()}
      {renderWaizeNavigationModal()}
      {renderDeleteModal()}
      {renderSaveModal()}
      {renderSendGroup()}
      {renderExit()}
      {renderAlert()}
      {renderOtpVerificationDialog()}
      {renderOtpNumberDialog()}
      {renderSummary()}
      {renderOtpSuccessDialog()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};
export default SmsCreator;
