import React, { useState, useEffect, useRef } from "react";
import { Tooltip, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Picker from "emoji-picker-react";
import Mobile from "../../../assets/images/mobileiphone.png";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Emoj from "../../../assets/images/smile.png";
import { FaCheck } from "react-icons/fa";
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
  getCampaignSettings,
  sendSms,
  getTestGroups,
  getCommonFeatures
} from "../../../redux/reducers/smsSlice";
import { Dialog } from "../../../components/managment/index";
import { FaUndoAlt } from "react-icons/fa";
import Summary from "./smsSummary";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { RiCloseFill } from "react-icons/ri";
import IconButton from "@material-ui/core/IconButton";
import { FaMapSigns, FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import { Button, Grid, Box, TextField } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlineDelete, AiOutlinePlusCircle , AiOutlineFile } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Switch from "react-switch";
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";


function Alert(props) {
  return <MuiAlert elevation={0} variant="filled" {...props} />;
}

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
    smsSendResult
  } = useSelector((state) => state.sms);

  const [alignment, setAlignment] = useState("left");
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [flagemoji, setflagemoji] = useState(false);
  const [checked, setChecked] = React.useState(false);
  const [dialogClickLanding, setdialogClickLanding] = useState(false);
  const [dialogClickCampaign, setdialogClickCampaign] = useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const [campaignBool, setcampaignBool] = useState(false);
  const [restoreBool, setrestoreBool] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [save, setsave] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [campaignName, setcampaignName] = useState("");
  const [campaignNumber, setcampaignNumber] = useState("");
  const [characterCount, setcharacterCount] = useState(0);
  const [linkCount, setlinkCount] = useState(0);
  const [counterBool, setcounterBool] = useState(false);
  const [messageCount, setmessageCount] = useState(0);
  const [msg, setmsg] = useState(null);
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
  const [phone, setphone] = useState("");
  const [OpenS, setOpenS] = useState(false);
  const [alertToggle, setalertToggle] = useState(false);
  const [selectedGroup, setselectedGroup] = useState([]);
  const [hidden, sethidden] = useState(false);
  const [Searched, setSearched] = useState("");
  const [modalOpen, setmodalOpen] = useState(false);
  const [storedValue, setstoredValue] = useState("");
  const [keep, setkeep] = useState(true);
  const [summary, setsummary] = useState(false);
  const [total, settotal] = useState(0);
  const [temp, settemp] = useState([]);
  const [selectValue, setselectValue] = useState("Personilization");
  const [finalApi, setfinalApi] = useState(false);
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
          SMSCampaignID: "",
          SubAccountID: -1,
          Status: -1,
          Type: 0,
          CreditsPerSms: "1",
          UpdateDate: 1628770145467,
          Name: campaignName,
          FromNumber: campaignNumber,
          Text: msg,
          ResponseToEmail: "",
          IsTestCampaign: false,
          IsResponse: false,
          IsLinksStatistics: true,
          SendDate: Date.now(),
          SendingMethod: 0,
          IsTest: false,
          PhoneNumber: phone,
          MessageLength: "1"

  })

  const handleSendResult = async () => {
    if (smsSendResult) {
      switch (smsSendResult) {
        case -2: {// ALREADY_SENT
          break;
        }
        case -1: {// ERROR
          break;
        }
        case 0: {// SUCCESS
          break;
        }
        case 1: {// PROVISION
          break;
        }
        case 2: {// NO_CREDITS
          break;
        }
        case 3: {// INVALID_NUMBER
          break;
        }
        case 4: {// OTP_NEEDED
          break;
        }
        case 5: {// ACCEPTED
          break;
        }
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
    const FinalPayloadData = {...smsModel , fromNumber : campaignNumber , Name : campaignName , Text: msg , TestGroupsIds : temp }
    await dispatch(smsQuick(FinalPayloadData));
    setfinalApi(true);
    setsummary(false);
  };

  useEffect(async () => {
    setLoader(true);
    await dispatch(getPreviousLandingData());
    await dispatch(getTestGroups());
    await dispatch(getPreviousCampaignData());
    await dispatch(getAccountExtraData());
    await dispatch(getGroupsBySubAccountId());
    let r = await dispatch(getCommonFeatures());
    setcampaignNumber(r.payload.DefaultCellNumber)
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

  const onEmojiClick = (event, emojiObject) => {
    let msgs = msg;
    let count = characterCount;
    count++;
    setcharacterCount(count);
    setChosenEmoji(emojiObject);
    setflagemoji(false);
    setmsg(msgs + emojiObject.emoji);
  };

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const toggleChecked = () => {
    setChecked((prev) => !prev);
  };
  const toggleKeep = () => {
    setkeep((prev) => !prev);
  };

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
    setcampaignNumber(e.target.value);
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
    return true;
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenS(false);
  };
  const handleCloseSnackbarApi = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setfinalApi(false);
  };
  const handleSend = () => {
    if (validationCheck()) {
      if (phone !== "") {
        const smsQuickSendData = {...quickSendPayload , fromNumber : campaignNumber , PhoneNumber : phone , Name : campaignName , Text : msg }
        dispatch(smsQuick(smsQuickSendData));
      } else {
        setOpenS(true);
      }
    }
  };
  const onLeave = (e) => {
    if (!modalOpen) {
      setalertToggle(true);
      setcounterBool(true);
    } else {
      setcounterBool(false);
    }
  }
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
                : clsx(classes.buttonField)
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
                setrestoreBool(!restoreBool);
              }}
            >
              {t("mainReport.restore")}
            </Typography>
          </Box>

          <TextField
            id="outlined-basic"
            type="text"
            className={clsx(classes.buttonField, classes.success)}
            onChange={onCampaignNumber}
            value={campaignNumber}
            onBlur={onLeave}
          />
          <Typography className={clsx(classes.buttonContent, classes.alertMsg)}>
            {t("mainReport.campRemovalDesc")}
          </Typography>
        </Grid>
        <Grid item xs={windowSize === "xs" ? 12 : 4} >
          {restoreBool ? (
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
              />
            </Box>
          ) : null}
        </Grid>
      </Grid>
    );
  };
  const onMsgChange = async (e) => {
    if (msg !== null && e.target.value.length < msg.length) {
      setremovalMessageButtonDisabled(false);
      setremovalLinkDisabled(false);
    }

    setmsg(e.target.value);
    setcharacterCount(e.target.value.length);

    setmessageCount(e.target.value.split("\n").length);

    let arr = e.target.value.split("\n");
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] != "") {
        count++;
      }
    }

    const linkRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
    let links = e.target.value.match(linkRegex);

    let link = 0;
    let arr2 = e.target.value.split("https://");

    link = arr2.length - 1;
    if (links) {
      setlinkCount(links.length);
      count = count - links.length;
    } else {
      setlinkCount(0);
    }
    let response = await dispatch(getCreditsforSMS(e.target.value.length));
    console.log("msg credit response",response)
    setmessageCount(count);
  };

  const onRemovalLink = () => {
    let newLink = "";
    newLink = msg + "##SmsUnsubscribeURL##";
    setmsg(newLink);
    setcharacterCount(newLink.length);
    setremovalLinkDisabled(true);
  };

  const onRemovalMsg = () => {
    let newMsg = "";
    newMsg = msg + "To unsubscribe reply 282";
    setmsg(newMsg);
    setcharacterCount(newMsg.length);
    setremovalMessageButtonDisabled(true);
  };

  const handleSelectChange = (e) => {
    setselectValue(e.target.value);
    let linkMsg = "";
    linkMsg = msg + e.target.value;
    setmsg(linkMsg);
    setcharacterCount(linkMsg.length);
  };

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
                  <ToggleButtonGroup
                    value={alignment}
                    exclusive
                    onChange={handleAlignment}
                    aria-label="text alignment"
                  >
                    <ToggleButton value="right" aria-label="right aligned">
                      <FormatAlignRightIcon />
                    </ToggleButton>
                    <ToggleButton
                      value="left"
                      aria-label="left aligned"
                      style={{
                        borderLeft: "1px solid #D5D5D5",
                        marginInlineEnd: "4px",
                      }}
                    >
                      <FormatAlignLeftIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : (
                  <ToggleButtonGroup
                    value={alignment}
                    exclusive
                    onChange={handleAlignment}
                    aria-label="text alignment"

                  >
                    <ToggleButton value="left" aria-label="left aligned" style={{ width: "40px", height: "40px" }}>
                      <FormatAlignLeftIcon />
                    </ToggleButton>

                    <ToggleButton
                      value="right"
                      aria-label="right aligned"
                      style={{
                        borderRight: "1px solid #D5D5D5",
                        marginInlineEnd: "4px",
                        width: "40px", height: "40px"
                      }}
                    >
                      <FormatAlignRightIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
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
                    title="Add Emoji"
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
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
                <Typography
                  className={classes.infoButtons}
                  onClick={removalMessageButtonDisabled ? null : onRemovalMsg}
                >
                  <Typography className={classes.editorLink}>+</Typography>
                  {t("mainReport.removalMsg")}
                </Typography>
                <Typography
                  className={classes.info2Buttons}
                  onClick={removalLinkDisabled ? null : onRemovalLink}
                >
                  <Typography className={classes.editorLink}>+</Typography>
                  {t("mainReport.removalLink")}
                </Typography>
              </Box>
              <Box className={classes.endButtons}>
                <Box className={classes.selectMsg}>
                  <select
                    className={classes.selectVal}
                    value={selectValue}
                    onChange={handleSelectChange}
                  >
                    <option disabled value="Personilization">Personilization</option>
                    {Object.keys(extraData).map((item, i) => {
                      return <option value={extraData[item]} key={`extrakey_${i}`}>{item}</option>;
                    })}
                  </select>
                </Box>
                <Box className={classes.addDiv} tabindex="0" onBlur={() => {seteditmenuClick(false)}}>
                  <Typography 
                    className={classes.addButtons}
                    onClick={() => {
                      seteditmenuClick(!editmenuClick);
                    }}
                    
                  >
                    <AiOutlinePlusCircle style={{ fontSize: "28px", color: "#1AA2B8", marginInlineEnd: "5px" }} />
                    {t("mainReport.add")}
                  </Typography>
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

  const onRadiochange = (e) => {
    setradioBtn(e.target.value);
    if (e.target.value === "bottom") {
      setcontactGroup(true);
    }
  };

  const handleNumberChange = (e) => {
    setphone(e.target.value);
  };

  const renderPhone = () => {
    return (
      <Box>
        <Box className={classes.phoneDiv}>
          <img src={Mobile} className={classes.phoneImg} />
          <span className={classes.phoneNumber}>050608001</span>
          <div className={isRTL ? classes.wrapChatHe : classes.wrapChat}>
            <div className={classes.fromMe}>
              {msg}
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
                      onChange={handleNumberChange}
                    />
                    <span className={classes.rightSend} onClick={handleSend}>
                      {t("mainReport.send")}
                    </span>
                    <Snackbar
                      open={OpenS}
                      autoHideDuration={2000}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      style={{ zIndex: "9999" }}
                    >
                      <Alert severity="error" onClose={handleCloseSnackbar} style={{ border: "3px solid #FF2400", backgroundColor: "#ffe6e6", color: "black", width: "400px", padding: "10px", fontWeight: "600" }}>
                        {t("mainReport.invalidNo")}
                      </Alert>
                    </Snackbar>
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

        <div
          className={
            checked ? clsx(classes.buttonDiv) : clsx(classes.buttonDivAct)
          }
        >
          <span className={classes.rightInput3} onClick={onHandleDelete}>
            <BsTrash style={{ fontSize: "25" }} />
          </span>
          <span className={classes.rightInput4} onClick={() => {setexitClick(true)}}>
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
      const payloadToPush = {...smsModel , fromNumber : campaignNumber , Name : campaignName , Text : msg  }
      let r = await dispatch(smsSave(payloadToPush));
      if (isSave) {
        history.push(`/sms/edit/${r.payload.Message}`);
      } else {
        history.push(`/sms/edit/${r.payload.Message}`);
        history.push(`/sms/send/${r.payload.Message}`);
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
  const handleLink = (id) => {
    let linkMsg = "";
    linkMsg = msg + previousLandingData[id].PageHref;
    setdialogClickLanding(false);
    seteditmenuClick(false);
    setmsg(linkMsg);
    setcharacterCount(linkMsg.length);
    let lc = linkCount;
    setlinkCount(++lc);
  };

  const handleCampClick = (id) => {
    let campaignData = "";
    campaignData = msg + getPreviousCampaignData[id].EncryptURL;
    setdialogClickCampaign(false);
    seteditmenuClick(false);
    setmsg(campaignData);
    setcharacterCount(campaignData.length);
    let cc = linkCount;
    setlinkCount(++cc);
  };

  const handleCloseContact = () => {
    setcontactGroup(false);
  };

  const handleSelect = (id) => {
    let tempArr = [];
    for (let i = 0; i < selectedGroup.length; i++) {
      if (id === i) {
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
    if (campaignName !== "" && msg !== "") {
      
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
      const payloadToPush = {...smsModel , fromNumber : campaignNumber , Name : campaignName , Text : msg , TestGroupsIds : temp }
      let r = await dispatch(smsSave(payloadToPush));
      
      let payload2 = {
        IsTestGroups: true,
        SMSCampaignID: r.payload.Message,
        TestGroupsIds: temp,
      };
  
      let r2 = await dispatch(smsSaveGroup(payload2));
      await dispatch(getCampaignSumm(r.payload.Message));
      setsummary(true);
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
                Select group for test sending
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
                      handleSelect(idx);
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
            onClose={() => {handleExit(false)}}
            onConfirm={() => {handleExit(true)}}
            onCancel={() => {setexitClick(false)}}
            confirmText="Yes"
            cancelText="No"
            showDefaultButtons={true}
            icon={
              <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
              />
            }
          >
            <div className={classes.baseDialogSetup}>
              <span className={classes.groupName}>Leave Campaign Creation</span>
            </div>
            <div className={classes.bodyTextDialog}>
              <span>Would you like to save your changes before exiting?</span>
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
            icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
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
   
    if(saveBeforeExit){
      const payloadToPush = {...smsModel , fromNumber : campaignNumber , Name : campaignName , Text : msg  }
      let r = await dispatch(smsSave(payloadToPush));
      if(r)
      {
        console.log("if here")
        setexitClick(false);
        history.push("/SMSCampaigns");
      }
    }
    else if(saveBeforeExit == false)
    {
      console.log("here")
      setexitClick(false);
      history.push("/SMSCampaigns");
    }
    
  };

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
          groups={temp}
          summaryPayload={getCampaignSum}
          api={onApiCall}
        />
      </>
    );
  };
  const onLocation = () => {
    let tempmsg = "";
    tempmsg = msg + "https://waze.to/?q=" + Searched.split(" ").join("%20");
    setmsg(tempmsg);
    let lc = linkCount;
    setlinkCount(++lc);
    setcharacterCount(tempmsg.length);
    setwaize(false);
  };

  const renderPreviousLandingDataModal = () =>
  {
    return(
      <>
      <Dialog
        classes={classes}
        open={dialogClickLanding}
        onClose={handleCloseLanding}
        showDefaultButtons={false}
        icon={<FaUndoAlt style={{ fontSize: 30, color: "#fff" }} />}
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
                    <AiOutlineFile style={{color:"#1771AD",fill:"#1771AD",stroke:"#1771AD"}} color="#1771AD"/>
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
  const  renderPreviousCampaignsData = () =>
  {
    return (
      <>
      {dialogClickCampaign ? (
         <Dialog
           classes={classes}
           open={dialogClickCampaign}
           onClose={handleCloseCampaign}
           showDefaultButtons={false}
           icon={<FaUndoAlt style={{ fontSize: 30, color: "#fff" }} />}
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
  const renderWaizeNavigationModal = () =>
  {
    return(<>
      {waize ? (
        <Dialog
          classes={classes}
          style={{ width: "400px" }}
          open={waize}
          onClose={handleCloseWaize}
          showDefaultButtons={false}
          icon={<FaMapSigns style={{ fontSize: 30, color: "#fff" }} />}
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
                <FaLocationArrow />
              </IconButton>
              <InputBase
                className={btnStyle.input}
                placeholder={t("mainReport.searchSms")}
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
  const renderDeleteModal = () =>
  {
   return( <>
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
            <span className={classes.groupName}>Delete Campaign</span>
          </div>
          <div className={classes.bodyTextDialog}>
            <span>{t("mainReport.confirmSure")}</span>
          </div>
        </Dialog>
      ) : null}
    </>)
  }
  const renderSaveModal = () =>
  {
   return( <>
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
  return (
    <DefaultScreen currentPage="sms" classes={classes}>
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
      </Grid>
      {renderPreviousLandingDataModal()}
      {renderPreviousCampaignsData()}
      {renderWaizeNavigationModal()}
      {renderDeleteModal()}
      {renderSaveModal()}
      {renderSendGroup()}
      {renderExit()}
      {renderAlert()}
      {renderSummary()}
      <Snackbar
        open={finalApi}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        style={{ zIndex: "9999" }}
      >
        <Alert severity="success" onClose={handleCloseSnackbarApi} style={{ border: "3px solid green", backgroundColor: "#c5f1c5", color: "black", width: "400px", padding: "10px", fontWeight: "700", fontSize: "15px" }}>
          {t("sms.quickSendSuccess")}
        </Alert>
      </Snackbar>
    </DefaultScreen>
  );
};

export default SmsCreator;
