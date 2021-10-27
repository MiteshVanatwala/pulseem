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
import Radio from "@material-ui/core/Radio";
import Toast from '../../../components/Toast/Toast.component';
import RadioGroup from "@material-ui/core/RadioGroup";
import Emoj from "../../../assets/images/smile.png";
import Waze from "../../../assets/images/waze.png";
import { FaCheck } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";
import queryString from 'query-string';
import Title from '../../../components/Wizard/Title'

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
import { AiOutlineExclamationCircle, AiOutlinePlusCircle, AiOutlineFile, AiOutlineAlignLeft } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { Loader } from '../../../components/Loader/Loader';
import Switch from "react-switch";
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";
import MobilePreview from '../../../components/MobilePreive/Mobile'

const useStyles = makeStyles((theme) => ({
  customWidth: {
    maxWidth: 200,
    backgroundColor: "black",
    fontSize: "14px",
    textAlign: 'center'
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
    maxLength: "13"
  }

  const otpProps = {
    maxLength: "5"
  }
  const history = useHistory();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL } = useSelector(
    (state) => state.core
  );
  const {
    previousLandingData,
    previousCampaignData,
    extraData,
    accountId,
    getCampaignSum,
    smsSendResult,
    commonSettings,
    testGroups
  } = useSelector((state) => state.sms);

  const [dialogType, setDialogType] = useState(null)
  const [alignment, setAlignment] = useState('right');
  const [showEmoji, setShowEmoji] = useState(false);
  const [checked, setChecked] = React.useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const [campaignBool, setcampaignBool] = useState(false);
  const [OtpCounter, setOtpCounter] = useState(false);
  const [restoreBool, setrestoreBool] = useState(false);
  const [campaignNumber, setcampaignNumber] = useState("");
  const [characterCount, setcharacterCount] = useState(0);
  const [linkCount, setlinkCount] = useState(0);
  const [counterBool, setcounterBool] = useState(false);
  const [messageCount, setmessageCount] = useState(0);
  const [removalMessageButtonDisabled, setremovalMessageButtonDisabled] = useState(false);
  const [radioBtn, setradioBtn] = useState("top");
  const [landingSearch, setlandingSearch] = useState("");
  const [CampaignSearch, setCampaignSearch] = useState("");
  const [removalLinkDisabled, setremovalLinkDisabled] = useState(false);
  const [waize, setwaize] = useState(false);
  const [PhoneNumberCampaignId, setPhoneNumberCampaignId] = useState("");
  const [ContactSearch, setContactSearch] = useState("");
  const [phone, setphone] = useState("");
  const [alertToggle, setalertToggle] = useState(false);
  const [selectedGroup, setselectedGroup] = useState([]);
  const [StaticNumber, setStaticNumber] = useState("");
  const [hidden, sethidden] = useState(false);
  const [splittedMsg, setsplittedMsg] = useState([])
  const [SplittedLinks, setSplittedLinks] = useState(null);
  const [Searched, setSearched] = useState("");
  const [modalOpen, setmodalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [removalNumber, setremovalNumber] = useState(null);
  const [storedValue, setstoredValue] = useState("");
  const [keep, setkeep] = useState(true);
  const [summary, setsummary] = useState(false);
  const [campaignNumberValidated, setcampaignNumberValidated] = useState(false);
  const [total, settotal] = useState(0);
  const [otpValue, setotpValue] = useState("");
  const [showLoader, setLoader] = useState(true);
  const [selectValue, setselectValue] = useState("Personilization");
  const [finalApi, setfinalApi] = useState(false);
  const [isTestCampaign, setIsTestCampaign] = useState(false);
  const [extraAccountDATA, setextraAccountDATA] = useState([]);
  const [isLinksStatistics, setIsLinksStatistics] = useState(true);
  const [otpMsgs, setotpMsgs] = useState("Required Field")
  const [isFromAutomation, setIsFromAutomation] = useState(false);
  const [isNewVersion, setIsNewVersion] = useState(true);
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
    Name: "",
    ResponseToEmail: "",
    SendDate: Date.now(),
    SendingMethod: 0,
    Status: 1,
    TestGroupsIds: [],
    Text: "",
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
    Name: "",
    FromNumber: campaignNumber,
    Text: "",
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

  useEffect(() => {
    setAlignment(isRTL ? "right" : "left");
  }, [isRTL])

  const qs = queryString.parse(props.location.search);

  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: t('sms.saved'), showAnimtionCheck: true },
    QUICKSENDSUCCESSS: { severity: 'success', color: 'success', message: t('sms.quickSend'), showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('sms.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('sms.error'), showAnimtionCheck: true },
    OTP: { severity: 'success', color: 'success', message: "OTP verified successfully", showAnimtionCheck: true },
    INVALIDNUMBER: { severity: 'error', color: 'error', message: t("sms.invalidNumber"), showAnimtionCheck: false },
    QUICKSENDERROR: { severity: 'error', color: 'error', message: "Error sending message", showAnimtionCheck: false },
    SENTALREADY: { severity: 'success', color: 'success', message: "Already Sent Message", showAnimtionCheck: true },
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
        setPhoneNumberCampaignId("");
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
        setDialogType({ type: 'otpVerification' });
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
        setDialogType({ type: 'otpSuccess' });
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

  useEffect(async () => {
    linkCalculation();
  }, [smsModel, isLinksStatistics]);

  useEffect(async () => {
    getcredits(characterCount);
  }, [characterCount])

  const handleSmsModelChange = (name, value) => {
    setSmsModel(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const onApiCall = async () => {
    const groupIds = selectedGroup.map((g) => { return g.GroupID });
    const FinalPayloadData = { ...smsModel, fromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, TestGroupsIds: groupIds, IsTestCampaign: isTestCampaign, IsTest: true, IsLinksStatistics: isLinksStatistics }
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
    let resp = await dispatch(getAccountExtraData());
    let arr = Object.keys(resp.payload)
    let arr2 = arr.map(function (key) {
      return { [key]: resp.payload[key] };
    })
    let tempArr = [
      { "FirstName": "common.first_name" },
      { "LastName": "common.last_name" },
      { "Email": "common.email" },
      { "Telephone": "common.telephone" },
      { "Cellphone": "common.cellphone" },
      { "Address": "common.address" },
      { "City": "common.city" },
      { "Company": "common.company" },
      { "BirthDate": "common.birth_date" },
      { "ReminderDate": "common.reminder_date" },
      { "Country": "common.country" },
      { "State": "common.state" },
      { "Zip": "common.zip" }
    ];
    for (let i = 0; i < arr2.length; i++) {
      tempArr.push({ ...arr2[i], selected: false })
    }
    setextraAccountDATA(tempArr)
    await dispatch(getGroupsBySubAccountId());
    let r = await dispatch(getCommonFeatures());
    if (props && props.match.params.id) {
      getSavedData();
    }
    if (qs && qs.FromAutomation && qs.FromAutomation > 0) {
      setIsFromAutomation(true);
    }

    setcampaignNumber(r.payload.DefaultCellNumber)
    let response = await dispatch(getSMSVirtualNumber(r.payload.DefaultCellNumber));
    setStaticNumber(response.payload.Number);
    setremovalNumber(response.payload.RemovalKey);
    setstoredValue(r.payload.DefaultCellNumber)
    setLoader(false);
    if (campaignNumber !== response.payload.Number) {
      setrestoreBool(false);
      setremovalMessageButtonDisabled(true);
    }
  }, [dispatch]);

  useEffect(() => { }, [removalMessageButtonDisabled]);

  useEffect(() => { }, [testGroups]);
  useEffect(() => {
    document.title = t("mainReport.smsTitle");
  }, []);

  const getAutomationReturnUrl = (campaignId) => {
    const nodeToEdit = qs.NodeToEdit ?? null;
    return `/pulseem/CreateAutomations.aspx?AutomationID=${qs.FromAutomation}&NodeToEdit=${nodeToEdit}&SMSCampaignID=${campaignId}`;
  }
  const getSavedData = async () => {
    if (props && props.match.params.id) {
      let response = await dispatch(getSmsByID(props.match.params.id))
      if (response) {
        setcampaignNumber(response.payload.FromNumber)
        setmessageCount(response.payload.CreditsPerSms);
        setcharacterCount(response.payload.Text ? response.payload.Text.length : 0)
        setSmsModel(response.payload);
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

  const linkCalculation = () => {
    let linksCharsAddition = 0;
    let t = smsModel.Text.toLowerCase();

    if (t && t.length > 0) {
      const res = t.replace('\n', ' ');
      // eslint-disable-next-line
      const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_#]*)?\??(?:[{}\-\+=&;,%@\.\w_]*)#?(?:[\.\!\/\\\w+]*))?)/g;
      const links = res.match(regex);

      if (links && links.length > 0) {
        setlinkCount(links.length);
        if (isLinksStatistics) {
          setSplittedLinks(links);
          for (var i = 0; i < links.length; i++) {
            var linkLength = links[i].length;
            linksCharsAddition += 35 - linkLength;
          }
          setcharacterCount(smsModel.Text.length + linksCharsAddition);
        }
        else {
          setcharacterCount(smsModel.Text.length);
        }
      }
      else {
        setlinkCount(0);
        setcharacterCount(smsModel.Text.length);
      }
    }
    else {
      setlinkCount(0);
      setcharacterCount(0);
      setmessageCount(0);
    }
  }

  const getcredits = (count) => {
    dispatch(getCreditsforSMS(count)).then((res) => {
      let credits = res.payload.split("#");
      setmessageCount(credits[0]);
    });
  }
  const onCamppaignChange = (e) => {
    handleSmsModelChange("Name", e.target.value);
    setcampaignBool(false);
  };

  const onCampaignNumber = (e) => {
    var isNumber = /^[0-9]*$/;
    var english = /^[A-Za-z0-9]*$/;
    var reg = "/[^\x00-\xFF]/g";
    if (!isNumber.test(e.target.value) && e.target.value.length >= 10) {
      e.target.value = e.target.value.substring(0, 10);
    }
    if (!english.test(e.target.value)) {
      e.target.value = e.target.value.replaceAll(
        reg,
        ""
      );
    }
    else {
      setrestoreBool(false);
      setremovalMessageButtonDisabled(false);
      setcampaignNumber(e.target.value);
      setcampaignNumberValidated(false);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const validationCheck = () => {
    if (smsModel.Name === "") {
      setcampaignBool(true);
      setDialogType({ type: "valiateError" })
      return false;
    }

    if (smsModel.Text === "") {
      setDialogType({ type: "valiateError" })
      return false;
    }
    let english = /^[ A-Za-z0-9]*$/;
    if (campaignNumber === "" || !english.test(campaignNumber)) {
      setcampaignNumberValidated(true);
      setDialogType({ type: "valiateError" })
      return false;
    }
    return true;
  };
  const handleSend = async () => {
    if (validationCheck()) {
      if (phone !== "") {
        if (props && props.match.params.id) {
          const smsQuickSendData = {
            ...quickSendPayload, SmsCampaignID: props.match.params.id, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
              SubAccountID: commonSettings.SubAccountId, AccountID: commonSettings.AccountID, SmsCampaignID: props.match.params.id, Credits: messageCount,
              TotalRecipients: 1
            }
          }
          setLoader(true);
          let r = await dispatch(smsQuick(smsQuickSendData));
          setLoader(false);
          handleSendResult(r.payload.Result)
        }
        else {
          if (PhoneNumberCampaignId !== "") {
            const smsQuickSendData = {
              ...quickSendPayload, SmsCampaignID: PhoneNumberCampaignId, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
                SubAccountID: commonSettings.SubAccountId, AccountID: commonSettings.AccountID, SmsCampaignID: PhoneNumberCampaignId, Credits: messageCount,
                TotalRecipients: 1
              }
            }
            setLoader(true);
            let r = await dispatch(smsQuick(smsQuickSendData));
            setPhoneNumberCampaignId(r.payload.SmsCampaignId)
            setLoader(false);
            handleSendResult(r.payload.Result)
          }
          else {
            const smsQuickSendData = {
              ...quickSendPayload, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
                SubAccountID: commonSettings.SubAccountId, AccountID: commonSettings.AccountID, SmsCampaignID: -1, Credits: messageCount,
                TotalRecipients: 1
              }
            }
            setLoader(true);
            let r = await dispatch(smsQuick(smsQuickSendData));
            setPhoneNumberCampaignId(r.payload.SmsCampaignId)
            setLoader(false);
            handleSendResult(r.payload.Result)
          }
        }
      } else {
        setToastMessage(toastMessages.INVALIDNUMBER);
      }
    }
  };
  const onLeave = (e) => {
    if (!modalOpen && campaignNumber !== storedValue) {
      setDialogType({ type: 'alert' });
      // setalertToggle(true);
      setcounterBool(true);
    } else {
      setcounterBool(false);
    }
  }
  const handleRestore = async () => {
    setrestoreBool(true);
    setcampaignNumber(StaticNumber);
    setLoader(true);
    let r = await dispatch(getCommonFeatures());
    setLoader(false);
    // setcampaignNumber(r.payload.DefaultCellNumber)
    setLoader(true);
    let response = await dispatch(getSMSVirtualNumber(r.payload.DefaultCellNumber));
    setLoader(false);
    setcampaignNumber(response.payload.Number);
    setStaticNumber(response.payload.Number);
    setremovalNumber(response.payload.RemovalKey);
    setremovalMessageButtonDisabled(false);
  }

  const onAddText = (text) => {
    text = text.trim();
    let afterUpdateCharCount =
      smsModel.Text.length + text.length;
    if (isLinksStatistics) {
      afterUpdateCharCount = characterCount + text.length;
    }
    if (afterUpdateCharCount < 1000) {
      var tArea = document.getElementById("yourMessage");
      // filter:
      if (0 == text) {
        return;
      }
      if (0 == cursorPos) {
        return;
      }

      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value;

      // insert:
      handleSmsModelChange("Text", tmpStr.substring(0, startPos) +
        text +
        tmpStr.substring(endPos, tmpStr.length));

      // move cursor:
      setTimeout(() => {
        cursorPos += text.length;
        tArea.selectionStart = tArea.selectionEnd = cursorPos;
      }, 10);

      tArea.focus();
    }
  }

  const onEmojiClick = (event, emojiObject) => {
    setShowEmoji(false);
    onAddText(emojiObject.emoji);
  };
  const renderFields = () => {
    return (
      <Grid container spacing={windowSize === "xs" ? 0 : 2} className={classes.fieldDiv}>
        <Grid item={true} xs={12} md={4} sm={12} className={classes.buttonForm}>
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
            value={smsModel.Name}
          />
          <Typography className={classes.buttonContent}>
            {t("mainReport.campDesc")}
          </Typography>
        </Grid>
        <Grid item={true} xs={12} md={4} sm={12} className={classes.buttonForm}>
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
                : clsx(classes.buttonField, classes.success)
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
        <Grid item={true} xs={12} md={4} sm={12} >
          {restoreBool && removalNumber !== null ? (
            <Box className={classes.buttonForm}>
              <Typography className={clsx(classes.buttonHead)}>
                {t("mainReport.removalReply")}
              </Typography>
              <TextField
                id="outlined-basic"
                type="text"
                placeholder="2"
                disabled
                className={windowSize === "xs" ? classes.buttonFieldRemovalMobile : clsx(classes.buttonFieldRemoval)}
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
    handleSmsModelChange("Text", e.target.value);

    if (smsModel.Text && smsModel.Text !== "" && e.target.value.length < smsModel.Text.length) {
      handleMsgSelect();
    }
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
  };

  const onRemovalLink = async () => {
    onAddText("##SmsUnsubscribeURL##");
    let total = splittedMsg;
    total.push("##SmsUnsubscribeURL##")
    if (isLinksStatistics && SplittedLinks !== null) {
      setremovalLinkDisabled(true);
    }
    else {
      setremovalLinkDisabled(true);
    }
    setremovalLinkDisabled(true);
  };

  const onRemovalMsg = async () => {
    let removelReplyText = t("sms.toUnsubscribe") + removalNumber;
    onAddText(removelReplyText);
    let total = splittedMsg;
    total.push(removelReplyText)
    setremovalMessageButtonDisabled(true);
  };

  const handleSelectChange = async (e) => {
    setselectValue(e.target.value);
    onAddText("##" + e.target.value + "##");
  };
  const handleMsgSelect = () => {
    let removelReplyText = t("sms.toUnsubscribe") + removalNumber;
    if (smsModel.Text.includes(removelReplyText)) {
      setremovalMessageButtonDisabled(true);
    }
    else {
      if (restoreBool)
        setremovalMessageButtonDisabled(false);
    }
    if (smsModel.Text.includes("##SmsUnsubscribeURL##")) {
      setremovalLinkDisabled(true);
    }
    else {
      setremovalLinkDisabled(false);
    }
  }

  const renderMsg = () => {
    return (
      <Grid container className={clsx(classes.msgDiv)}>
        <Grid container>
          <Grid item={true} xs={12} md={8} className={classes.boxDiv}>
            <Typography className={classes.msgHead}>
              {t("mainReport.yourMessage")}
            </Typography>
            <textarea
              placeholder={t("mainReport.typeText")}
              maxLength="1000"
              outlined=""
              id="yourMessage"
              className={clsx(classes.msgArea, classes.sidebar)}
              style={{ textAlign: alignment }}
              onChange={onMsgChange}
              onSelect={handleMsgSelect}
              value={smsModel.Text}
            ></textarea>

            <Box className={classes.smallInfoDiv}>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {linkCount} {linkCount === 1 ? t("mainReport.link") : t("mainReport.links")}
              </Typography>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {messageCount} {messageCount === 1 ? t("sms.message") : t("sms.messages")}
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
                      <FormatAlignRightIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('right') }} />
                    </Tooltip>
                    <Tooltip
                      disableFocusListener
                      title={t("mainReport.alignToLeft")}
                      classes={{ tooltip: styles.customWidth }}
                      placement="top-start"
                      arrow
                    >
                      <FormatAlignLeftIcon onClick={() => { setAlignment('left') }} />
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
                      <FormatAlignLeftIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('left') }} />
                    </Tooltip>
                    <Tooltip
                      disableFocusListener
                      title={t("mainReport.aligntoRight")}
                      classes={{ tooltip: styles.customWidth }}
                      placement="top-start"
                      arrow
                    >
                      <FormatAlignRightIcon onClick={() => { setAlignment('right') }} />
                    </Tooltip>
                  </>
                )}
                <Box className={classes.pickerEmoji}>
                  {showEmoji ? (
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
                        setShowEmoji(!showEmoji);
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
                  placement="top"
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
                  placement="top"
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
                    placement="top"
                    arrow
                  >
                    <select
                      className={clsx(classes.selectVal, classes.sidebar)}
                      value={selectValue}
                      onChange={handleSelectChange}
                    >
                      <option disabled value="Personilization">{t("mainReport.personalisationSelect")}</option>
                      {extraAccountDATA.map((item, i) => {
                        if (item.selected) {
                          return (<option disabled value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{t(item[Object.keys(item)[0]])}</option>)
                        }
                        else {
                          return <option value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{item[Object.keys(item)[0]] ? t(item[Object.keys(item)[0]]) : Object.keys(item)[0]}</option>;
                        }

                      })}
                    </select>
                  </Tooltip>
                </Box>
                <Box className={classes.addDiv} tabIndex="0" onBlur={() => { seteditmenuClick(false) }}>
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.addVariantsTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top"
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
                          setDialogType({ type: 'latestLP' });
                          seteditmenuClick(false);
                        }}
                      >
                        {t("mainReport.landingLink")}
                      </Typography>
                      {previousCampaignData.length == 0 ? null : (
                        <Typography
                          className={classes.dropCon}
                          onClick={() => {
                            setDialogType({ type: 'latestCampaigns' });
                            seteditmenuClick(false);
                          }}
                        >
                          {t("mainReport.campLink")}
                        </Typography>
                      )}
                      <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setDialogType({ type: 'waze' })
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
          <Grid item={true} xs={12} md={4} sm={12}>
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

  const onRadiochange = (e) => {
    setradioBtn(e.target.value);
    if (e.target.value === "bottom") {
      setDialogType({ type: "groups" })
    }
  };

  const handleNumberChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setphone(e.target.value);
    }
  };

  const renderPhone = () => {
    return (
      <Box className={classes.mobilePreviewContainer}>
        <MobilePreview classes={classes} campaignNumber={campaignNumber} text={smsModel.Text} keyItem="edtiorPreview" />
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
              <div style={{ display: "flex", flexDirection: "column", width: '100%' }}>
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
                        setDialogType({ type: "groups" });
                      }}
                    >
                      {selectedGroup.length <= 0 && <div> {t("mainReport.ChooseLinks")}</div>}
                      {selectedGroup.length > 0 ? (
                        <div className={classes.mappedGroup}>
                          {selectedGroup.map((item, index) => {
                            return (
                              <div key={index} className={classes.selectedGroupsDiv}>
                                <span className={classes.nameGroup}>
                                  {item.GroupName}
                                </span>
                                <RiCloseFill
                                  className={classes.groupCloseicn}
                                  onClick={(event) => {
                                    handleCross(event, item.GroupID);
                                  }}
                                />
                              </div>
                            );
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

  const handleCross = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    const newSelection = selectedGroup.filter((g) => { return g.GroupID !== id });
    setselectedGroup(newSelection);
    sethidden(newSelection.length === 0);
  };

  const onContinueClick = async (isSave, returnToAutomation = false) => {
    if (validationCheck()) {
      let smsCampaignId = props && props.match.params.id ? props.match.params.id : -1;
      const payloadToPush = { ...smsModel, FromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, CreditsPerSms: `${messageCount}`, IsLinksStatistics: isLinksStatistics, IsTest: isTestCampaign, AccountID: commonSettings.AccountID, SubAccountID: commonSettings.SubAccountId, SmsCampaignID: smsCampaignId }
      setLoader(true);
      let r = await dispatch(smsSave(payloadToPush));
      smsCampaignId = r.payload.Message;
      setLoader(false);
      if (r.payload.Status == 2) {
        if (isSave) {
          setToastMessage(toastMessages.SUCCESS);
          setTimeout(() => {
            history.push(`/sms/edit/${smsCampaignId}${isFromAutomation ? "?FromAutomation=" + qs.FromAutomation + "&NodeToEdit=" + qs.NodeToEdit : ""}`);
            setToastMessage(null);
          }, 1500);
        } else if (returnToAutomation) {
          window.location = getAutomationReturnUrl(smsCampaignId);
        } else {

          history.push(`/sms/edit/${smsCampaignId}`);
          history.push(`/sms/send/${smsCampaignId}`);
        }
      }
      else if (r.payload.Status == 3) {
        setDialogType({ type: 'otpVerification' });
      }
    }
  };

  const handleClose = () => {
    setDialogType(null);
  };
  const handleAddLink = async (id, linkType) => {
    let text = "";
    if (linkType === 'campaign') {
      text = previousCampaignData[id].EncryptURL;
    }
    else if (linkType === 'lp') {
      text = previousLandingData[id].PageHref
    }
    seteditmenuClick(false);
    onAddText(text)
    let lc = linkCount;
    setlinkCount(++lc);
    setDialogType(null);
  };

  const handleSelect = (id) => {
    let tempArr = [];
    const isExist = selectedGroup.filter((g) => { return g.GroupID === id }).length > 0;
    if (isExist) {
      tempArr = selectedGroup.filter((g) => { return g.GroupID !== id });
      setselectedGroup(tempArr);
    }
    else {
      const newItem = testGroups.filter((g) => { return g.GroupID === id })[0];
      setselectedGroup([...selectedGroup, newItem]);
    }
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
    if (selectedGroup.length > 0) {
      const groupIds = selectedGroup.map((g) => { return g.GroupID });
      settotal(selectedGroup.length);
      if (validationCheck()) {
        const payloadToPush = { ...smsModel, fromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, TestGroupsIds: groupIds }
        let r = await dispatch(smsSave(payloadToPush));
        if (r.payload.Status == 2) {
          let payload2 = {
            IsTestGroups: true,
            SMSCampaignID: r.payload.Message,
            TestGroupsIds: groupIds,
          };
          handleSmsModelChange("SMSCampaignID", r.payload.Message);
          let r2 = await dispatch(smsSaveGroup(payload2));
          await dispatch(getCampaignSumm(r.payload.Message));
          setsummary(true);
        }
        else if (r.payload.Status == 3) {
          setDialogType({ type: 'otpVerification' });
        }
        else {
          setDialogType(null);
        }
      }
    }
    sethidden(true);
  };

  const handlecaution = () => {
    setalertToggle(false);
    setcounterBool(false);
    setmodalOpen(false);
    setremovalNumber(null);
    setDialogType(null);
  };
  const handleAlertoff = () => {
    setcampaignNumber(storedValue);
    setalertToggle(false);
    setDialogType(null);
  };
  const handleExit = async (saveBeforeExit) => {
    if (saveBeforeExit) {
      if (validationCheck()) {
        const payloadToPush = { ...smsModel, fromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text }
        let saveResponse = await dispatch(smsSave(payloadToPush));
        if (saveResponse) {
          if (saveResponse.payload.Status === 3) {
            setDialogType({ type: 'otpVerification' });
            return;
          }
          else if (saveResponse.payload.Status === 2) {
            history.push("/SMSCampaigns");
          }
          else {
            setToastMessage(toastMessages.ERROR);
          }
        }
        else {
          setToastMessage(toastMessages.ERROR);
        }
      }
    }
    else if (saveBeforeExit === false) {
      history.push("/SMSCampaigns");
    }
    setDialogType(null);
  };
  const handleSummary = () => {
    setsummary(false);
  }
  const renderSummary = () => {
    return (
      <>
        <Summary
          classes={classes}
          campaignName={smsModel.Name}
          fromNumber={campaignNumber}
          textMsg={smsModel.Text}
          groups={selectedGroup}
          open={summary}
          handleCallback={handleSummary}
          summaryPayload={getCampaignSum}
          onConfirm={onApiCall}
        />
      </>
    );
  };
  const onLocation = async () => {
    let tempmsg = "";
    tempmsg = smsModel.Text + "https://waze.to/?q=" + Searched.split(" ").join("%20");
    handleSmsModelChange("Text", tempmsg);
    let lc = linkCount;
    setlinkCount(++lc);
    setwaize(false);
    setDialogType(null);
  };

  const renderToast = () => {
    if (toastMessage) {

      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const renderButtons = () => {
    return (
      <div style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto", paddingBottom: 40 }} className={clsx(classes.baseButtonsContainer, "baseButtonsContainer")}>
        <Box>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonRed
            )}
            style={{ margin: '8px', padding: '9px 0' }}
            onClick={() => { setDialogType({ type: 'deleteSms' }) }}
          >
            <BsTrash style={{ fontSize: "25" }} />
          </Button>
        </Box>
        <Button
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightBlue,
            classes.backButton
          )}
          color="primary"
          style={{ margin: '8px' }}
          onClick={() => { setDialogType({ type: 'exit' }) }}>
          {t('mainReport.exitSms')}
        </Button>
        <Button
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightBlue,
            classes.backButton
          )}
          color="primary"
          style={{ margin: '8px' }}
          onClick={() => {
            onContinueClick(true, isFromAutomation);
          }}>
          {t('mainReport.saveSms')}
        </Button>
        <Button
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonLightGreen,
            classes.backButton
          )}
          color="primary"
          style={{ margin: '8px' }}
          onClick={() => {
            onContinueClick(false, isFromAutomation);
          }}>
          {!isFromAutomation ? t("mainReport.continue") : t("sms.saveAndExit")}
        </Button>
      </div>
    );
  }
  const handleVerifyOTP = async () => {
    setLoader(true);
    setDialogType(null);

    let payload = {
      "Cellphone": campaignNumber,
    }
    let r = await dispatch(getSMSRequestOTP(payload))
    setLoader(false);
    setDialogType({ type: 'otpCode' });
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
  const switchToOldVersion = () => {
    setIsNewVersion(false);
    setTimeout(() => {
      if (smsModel.SMSCampaignID && smsModel.SMSCampaignID > 0) {
        window.location = `/Pulseem/SMSCampaignEdit.aspx?OldVersion=true&SMSCampaignID=${smsModel.SMSCampaignID}${isFromAutomation ? "&FromAutomation=" + qs.FromAutomation + "&NodeToEdit=" + qs.NodeToEdit : ""}`;
      }
      else {
        window.location = "/Pulseem/SMSCampaignEdit.aspx?OldVersion=true";
      }
    }, 500)
  }
  //#region Dialogs
  const lpDialog = () => {
    return {
      title: t('mainReport.selectLanding'),
      showDivider: true,
      icon: (
        <BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />
      ),
      content: (
        <Box className={classes.dialogBox} style={{width: windowSize === 'lg' || windowSize === 'xl' ? '500px' : null}}>
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
          <Box style={{ marginTop: 20 }}>
            {previousCampaignData
              .filter((val) => {
                if (CampaignSearch == "") {
                  return val;
                } else if (
                  val.Name.toLowerCase().includes(
                    CampaignSearch.toLowerCase()
                  )
                ) {
                  return val;
                }
              })
              .map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className={classes.searchCon}
                    onClick={() => {
                      handleAddLink(idx, 'campaign');
                    }}
                  >
                    <span
                      style={{ marginInlineEnd: "8px" }}
                      className={classes.grDoc}
                    >
                      <AiOutlineFile />
                    </span>
                    <span className={classes.ellipsisText}>{item.Name}</span>
                  </div>
                );
              })}
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) }
    }
  }
  const campaignsDialog = () => {
    return {
      title: t('mainReport.selectCamp'),
      showDivider: true,
      icon: (
        <BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />
      ),
      content: (
        <Box className={classes.dialogBox} style={{width: windowSize === 'lg' || windowSize === 'xl' ? '500px' : null}}>
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
          <Box style={{ marginTop: 20 }}>
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
                    key={idx}
                    className={classes.searchCon}
                    onClick={() => {
                      handleAddLink(idx, 'lp');
                    }}
                  >
                    <span
                      style={{ marginInlineEnd: "8px" }}
                      className={classes.grDoc}
                    >
                      <AiOutlineFile style={{ color: "#1771AD", fill: "#1771AD", stroke: "#1771AD" }} color="#1771AD" />
                    </span>
                    <span className={classes.ellipsisText}>{item.CampaignName}</span>
                  </div>
                );
              })}
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) }

    }
  }
  const wazeDialog = () => {
    return {
      title: t('mainReport.waizeTitle'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Paper component="form" className={btnStyle.root}>
            <img src={Waze} style={{ pointerEvents: "none" }} />
            <InputBase
              className={btnStyle.input}
              placeholder={t("mainReport.typeAddress")}
              inputProps={{ "aria-label": "Search" }}
              onChange={(e) => {
                setSearched(e.target.value);
              }}
            />
          </Paper>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { onLocation() }
    }
  }
  const deleteDialog = () => {
    return {
      title: t('mainReport.deleteSms'),
      showDivider: true,
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />
      ),
      content: (
        <Box>
          <div className={classes.bodyTextDialog}>
            <Typography>
              {t("mainReport.confirmSure")}
            </Typography>
          </div>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { handleDelete() }
    }
  }
  const validationDialog = () => {
    return {
      title: t('mainReport.fieldInvalid'),
      showDivider: true,
      icon: (
        <AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />
      ),
      content: (
        <Box>
          <div>
            <ul style={{ fontSize: "20px", color: "red", fontWeight: "600" }} className={classes.fieldsRequire}>
              {campaignBool ? <li style={{ marginBottom: "8px" }}>
                {t("mainReport.campaignRequire")}
              </li> : null}
              {smsModel.Text === "" ? <li>{t("mainReport.msgRequire")}</li> : null}
              {campaignNumberValidated ? <li style={{ marginBottom: "8px" }}>
                {t("mainReport.campaignFromRequire")}
              </li> : null}
            </ul>
          </div>
        </Box>
      ),
      renderButtons: () => (
        <Button
          variant='contained'
          size='small'
          style={{ maxWidth: 100 }}
          onClick={() => { setDialogType(null) }}
          className={clsx(
            classes.gruopsDialogButton,
            classes.dialogConfirmButton,
          )}>
          {t('common.Ok')}
        </Button>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { setDialogType(null) }
    }
  }
  const groupDialog = () => {
    return {
      title: t('mainReport.selectGroups'),
      showDivider: true,
      icon: (
        <HiOutlineUserGroup
          style={{ fontSize: 30, color: "#fff" }}
        />
      ),
      content: (
        <Box className={classes.dialogBox} style={{width: windowSize === 'lg' || windowSize === 'xl' ? '500px' : null}}>
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
          <Box style={{ marginTop: 20 }}>
            {testGroups
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
                const itemChecked = selectedGroup.filter((g) => { return g.GroupID === item.GroupID }).length > 0
                return (
                  <div key={idx} className={classes.searchCon} onClick={() => {
                    handleSelect(item.GroupID);
                  }}>
                    <span
                      style={{ marginInlineEnd: windowSize !== "xs" ? "25px" : "10px" }}
                      className={
                        itemChecked ? classes.greenDoc : classes.blueDoc
                      }
                    >
                      {itemChecked ? (
                        <FaCheck className={clsx(classes.green)} />
                      ) : (
                        <HiOutlineUserGroup />
                      )}
                    </span>
                    <div
                      className={classes.selectGroupDiv}
                    >
                      <span className={classes.ellipsisText}>{item.GroupName}</span>
                      <span style={{ whiteSpace: 'nowrap' }}>{item.Recipients} {item.Recipients === 1 ? t("sms.recipient") : t("sms.recipients")}</span>
                    </div>
                  </div>
                );
              })}
          </Box>
        </Box>
      ),
      showDefaultButtons: true,
      onCancel: () => { setselectedGroup([]); setDialogType(null) },
      onClose: () => { setselectedGroup([]); setDialogType(null) },
      onConfirm: () => { handleGroupClose() }
    }
  }
  const exitDialog = () => {
    return {
      title: t('mainReport.handleExitTitle'),
      showDivider: true,
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />
      ),
      content: (
        <Box>
          <Typography className={classes.f18}>{t("mainReport.leaveCampaign")}</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      cancelText: t("common.No"),
      onClose: () => { handleExit(false) },
      onCancel: () => { setDialogType(null) },
      onConfirm: () => { handleExit(true) }
    }
  }
  const alertDialog = () => {
    return {
      title: t('mainReport.pleaseNote'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>
      ),
      content: (
        <Box style={{ maxWidth: 400 }}>
          <Typography className={classes.f18}>{t("mainReport.pleaseNoteDsec")}</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { handleAlertoff() },
      onConfirm: () => { handlecaution() }
    }
  }
  const OTPVerificationDialog = () => {
    return {
      title: t('sms.verificationOtp'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>
      ),
      content: (
        <Box className={classes.flexColCenter}>
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
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) }
    }
  }
  const OTPCodeDialog = () => {
    return {
      title: t('sms.weHaveSentOtp'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>
      ),
      content: (
        <Box className={classes.flexColCenter}>
          <Box className={clsx(classes.verificationBodySMS, classes.txtCenter)}>
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
            <Box style={{ display: "flex", marginTop: "20px" }}>
              <Typography className={classes.fontSmsRegulations}>{t("sms.didntReceivedOtp")} </Typography>
              <Typography style={{ textDecoration: "underline", marginInlineStart: "4px" }} className={classes.fontSmsRegulations} onClick={() => { handleVerifyOTP() }}>{t("sms.sendAgainOtp")}</Typography>
            </Box>
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { handleVerifyOTP() }
    }
  }
  const OTPSuccess = () => {
    return {
      title: t('sms.otpNumberValidatedTitle'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\uE11B'}
        </div>
      ),
      content: (
        <Box className={classes.flexColCenter} style={{ paddingBottom: 10 }}>
          <img src={Gif} style={{ width: "150px", height: "150px" }} />
          <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
            {t("sms.otpNumberValidatedDescription")}
          </p>
          <Button
            variant='contained'
            size='large'
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton
            )}
            onClick={() => { setDialogType(null) }}>
            {t('common.Ok')}
          </Button>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { setDialogType(null) }
    }
  }
  const renderDialog = () => {
    const { type } = dialogType || {}

    const dialogContent = {
      latestLP: lpDialog(),
      latestCampaigns: campaignsDialog(),
      waze: wazeDialog(),
      deleteSms: deleteDialog(),
      valiateError: validationDialog(),
      groups: groupDialog(),
      exit: exitDialog(),
      alert: alertDialog(),
      otpVerification: OTPVerificationDialog(),
      otpCode: OTPCodeDialog(),
      otpSuccess: OTPSuccess()
    }

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <Dialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </Dialog>
    )
  }

  //#endregion
  const SwitchOldVersion = () => {
    return (<Grid item={true} xs={12} style={{ paddingTop: 20 }}>
      <Switch
        className={
          isRTL
            ? clsx(classes.reactSwitchHe, "react-switch")
            : clsx(classes.reactSwitch, "react-switch")
        }
        checked={isNewVersion}
        onChange={switchToOldVersion}
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
      <Typography className={clsx(classes.dInlineBlock, classes.buttonHead)}>{t("sms.switchToOldeVersion")}</Typography>
    </Grid>);
  }
  return (
    <DefaultScreen currentPage="sms" classes={classes} customPadding={true}>
      {renderToast()}
      <Grid container className={windowSize === "xs" || windowSize === "sm" ? classes.mobileGrid : null}>
        <SwitchOldVersion />
      </Grid>
      <Grid container spacing={windowSize === "xs" ? 0 : 3} className={windowSize === "xs" || windowSize === "sm" ? classes.mobileGrid : null}>
        <Grid item sm={12} md={8} lg={8}>
          <Title title={t("mainReport.smsCampaign")}
            classes={classes}
            tooltip={t("mainReport.toolTip1")}
            stepNumber={1}
            subTitle={t("mainReport.createContent")}
          />
          {renderFields()}
          {renderMsg()}
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4}>
          <Box style={{ maxWidth: 420 }}>
            {renderPhone()}
          </Box>
        </Grid>
        {renderButtons()}
      </Grid>
      {renderDialog()}
      {renderSummary()}
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  );
};
export default SmsCreator;
