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
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Picker from "emoji-picker-react";
import Mobile from "../../../assets/images/mobileiphone.png";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Emoj from "../../../assets/images/smile.png";
import { withStyles } from "@material-ui/core/styles";
import { FaCheck } from 'react-icons/fa';
import { useHistory } from "react-router";
import {
  getPreviousCampaignData,
  getPreviousLandingData,
  getAccountExtraData,
  getAccountId,
  smsSave,
  deleteSms,
  smsSaveGroup,
  smsQuick,
  getCampaignSumm,
  getCreditsforSMS,
} from "../../../redux/reducers/smsSlice";
import { Dialog } from "../../../components/managment/index";
import { FcDocument } from "react-icons/fc";
import { FaUndoAlt } from "react-icons/fa";
import Summary from "./smsSummary";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { RiCloseFill } from "react-icons/ri";
import IconButton from "@material-ui/core/IconButton";
import { FaMapSigns, FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import { Button, Grid , Box  , TextField } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlineDelete } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";

import Snackbar from "@material-ui/core/Snackbar";

import MuiAlert from "@material-ui/lab/Alert";
import Switch from "react-switch";
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";
import { useLocation, useParams } from "react-router-dom";

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

const SmsCreator = ({ classes }, props) => {
  const { t } = useTranslation();
  document.title=t("mainReport.smsTitle")
  const styles = useStyles();
  const btnStyle = useStyleNew();
  
  const history = useHistory();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const {
    previousLandingData,
    previousCampaignData,
    extraData,
    accountId,
    getCampaignSum,
  } = useSelector((state) => state.sms);
  const [alignment, setAlignment] = useState("left");
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [flagemoji, setflagemoji] = useState(false);
  const [checked, setChecked] = React.useState(false);
  const [dialogClick, setdialogClick] = useState(false);
  const [dialogClickLanding, setdialogClickLanding] = useState(false);
  const [dialogClickCampaign, setdialogClickCampaign] = useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const [campaignBool, setcampaignBool] = useState(false);
  const [restoreBool, setrestoreBool] = useState(false);
  const [exit, setexit] = useState(true);
  const [deleteClick, setdeleteClick] = useState(false);
  const [save, setsave] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [campaignName, setcampaignName] = useState("");
  const [campaignNumber, setcampaignNumber] = useState("0508085670");
  const [campaignNumBool, setcampaignNumBool] = useState(false);
  const [characterCount, setcharacterCount] = useState(0);
  const [linkCount, setlinkCount] = useState(0);
  const [messageCount, setmessageCount] = useState(0);
  const [msg, setmsg] = useState("");
  const [removalMessageButtonDisabled, setremovalMessageButtonDisabled] =
    useState(false);
  const [radioBtn, setradioBtn] = useState("top");
  const [previousData, setpreviousData] = useState([]);
  const [landingSearch, setlandingSearch] = useState("");
  const [CampaignSearch, setCampaignSearch] = useState("");
  const [removalLinkDisabled, setremovalLinkDisabled] = useState(false);
  const [waize, setwaize] = useState(false);
  const [contactGroup, setcontactGroup] = useState(false);
  const [ContactSearch, setContactSearch] = useState("");
  const [select, setselect] = useState(false);
  const [cancel, setcancel] = useState(true);
  const [exitClick, setexitClick] = useState(false);
  const [phone, setphone] = useState("");
  const [OpenS, setOpenS] = useState(false);
  const [alertToggle, setalertToggle] = useState(false);
  const [selectedGroup, setselectedGroup] = useState([]);
  const [hidden, sethidden] = useState(false);
  const [Searched, setSearched] = useState("");
  const [caution, setcaution] = useState(false);
  const [modalOpen, setmodalOpen] = useState(false);
  const [storedValue, setstoredValue] = useState("");
  const [keep, setkeep] = useState(true);
  const [summary, setsummary] = useState(false);
  const [total, settotal] = useState(0);
  const [temp, settemp] = useState([]);
  const [selectValue, setselectValue] = useState("");
  const [uniqueId, setuniqueId] = useState(null);
  const [finalApi, setfinalApi] = useState(false);


  const getData = async () => {
    await dispatch(getPreviousLandingData());

    setLoader(false);
  };

  const onApiCall = async () => {
    let temp = [];
    for (let i = 0; i < selectedGroup.length; i++) {
      if (selectedGroup[i].selected) {
        temp.push(selectedGroup[i].GroupID);
      }
    }
    let payload = {
      CreditsPerSms: "1",
      FromNumber: campaignNumber,
      IsLinksStatistics: true,
      IsResponse: false,
      IsTest: true,
      IsTestCampaign: false,
      LogData: {
        SmsCampaignID: uniqueId,
        SubAccountID: 7878,
        AccountID: 6722,
        Credits: "1",
        TotalRecipients: 1,
      },
      AccountID: 6722,
      Credits: "1",
      SmsCampaignID: uniqueId,
      SubAccountID: 7878,
      TotalRecipients: 1,
      Name: campaignName,
      ResponseToEmail: "",
      SMSCampaignID: uniqueId,
      SMSCampaignId: uniqueId,
      SendDate: Date.now(),
      SendingMethod: 0,
      Status: 1,
      SubAccountID: -1,
      TestGroupsIds: temp,
      Text: msg,
      Type: 0,
      UpdateDate: 1630325875398,
    };
    await dispatch(smsQuick(payload));
    setfinalApi(true);
    setsummary(false);
  };
  const getDataCamapaign = async () => {
    await dispatch(getPreviousCampaignData());

    setLoader(false);
  };
  const getDataExtra = async () => {
    await dispatch(getAccountExtraData());

    setLoader(false);
  };
  const getAccount = async () => {
    await dispatch(getAccountId());
    setLoader(false);
  };
  useEffect(() => {
    setLoader(true);
    getData();
    getDataCamapaign();
    getDataExtra();
    getAccount();
  }, [dispatch]);
  useEffect(() => { }, [removalMessageButtonDisabled]);

  useEffect(() => {
    
  }, [selectedGroup]);
  useEffect(() => {
    document.title=t("mainReport.smsTitle")
  }, []);

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < accountId.length; i++) {
      temp.push(accountId[i]);
    }
    
    setselectedGroup(temp);
  }, [accountId]);

  useEffect(() => {
    if (
      sessionStorage.getItem("data") !== null &&
      window.location.search !== ""
    ) {
      let data = JSON.parse(sessionStorage.getItem("data"));
      setmsg(data.text);
      setcampaignName(data.name);
    } else {
      setmsg("");
      setcampaignName("");
      sessionStorage.removeItem("data");
    }
  }, []);

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
        <Typography className={classes.headInfo}>{t("mainReport.smsCampaign")}</Typography>
        <Tooltip
          disableFocusListener
          title="Create the content you want to send to your recipients and then choose how, when and to whom to send"
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
    setstoredValue(campaignNumber);
   
    if (!modalOpen) {
      setalertToggle(true);
    } else {
      setcampaignNumber(e.target.value);
    }
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
        let payload = {
          SMSCampaignID: "",
          SubAccountID: -1,
          Status: -1,
          Type: 0,
          CreditsPerSms: "1",
          UpdateDate: 1628770145467,
          Name: campaignName,
          FromNumber: "0508085679",
          Text: msg,
          ResponseToEmail: "",
          IsTestCampaign: false,
          IsResponse: false,
          IsLinksStatistics: true,
          SendDate: Date.now(),
          SendingMethod: 0,
          IsTest: false,
          PhoneNumber: phone,
          MessageLength: "1",
          LogData: {
            SmsCampaignID: -1,
            SubAccountID: 11048,
            AccountID: 9494,
            Credits: "1",
            TotalRecipients: 1,
          },
        };
        dispatch(smsQuick(payload));
      } else {
        setOpenS(true);
      }
    }
  };

  const renderFields = () => {
    return (
      <Grid container spacing={2} className={classes.fieldDiv}>
        <Grid item xs={4} className={classes.buttonForm}>
          <Typography className={classes.buttonHead}>{t("mainReport.campName")}</Typography>
          <TextField id="outlined-basic"
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
        <Grid item xs={4} className={classes.buttonForm}>
          <Box  className={classes.inputCampDiv}>
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

          <TextField id="outlined-basic"
            type="text"
            placeholder="0508085670"
            className={clsx(classes.buttonField, classes.success)}
            onChange={onCampaignNumber}
            value={campaignNumber}
          />
          <Typography className={clsx(classes.buttonContent, classes.alertMsg)}>
            {t("mainReport.campRemovalDesc")}
          </Typography>
        </Grid>
        <Grid item xs={4}>
        {restoreBool ? (
          <Box className={classes.buttonForm}>
            <Typography className={clsx(classes.buttonHead)}>
              
              {t("mainReport.removalReply")}
            </Typography>
            <TextField id="outlined-basic"
              type="text"
              placeholder="2"
              disabled
              className={classes.buttonFieldRemoval}
            />
          </Box>
        ) : null}
        </Grid>
      </Grid>
    );
  };
  const onMsgChange = async (e) => {
    if (e.target.value.length < msg.length) {
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
    await dispatch(getCreditsforSMS(e.target.value.length));
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

  const handleSelectChange = (e) =>
  {
    setselectValue(e.target.value);
    let linkMsg = "";
    linkMsg = msg + e.target.value;
    setmsg(linkMsg);
    setcharacterCount(linkMsg.length);
  }

  const renderMsg = () => {
    return (
      <Grid container className={classes.msgDiv}>
        <Grid container>
         
          <Grid item xs={8} className={classes.boxDiv}>
          <Typography className={classes.msgHead}>{t("mainReport.yourMessage")}</Typography>
            <textarea
              placeholder="Type text"
              maxlength="1000"
              outlined=""
              id="yourMessage"
              className={
              clsx(classes.msgArea)
              }
              style={{textAlign: alignment == "left" ? "left" : "right"}}
              onChange={onMsgChange}
              value={msg}
            ></textarea>
            
       
            <Box className={classes.smallInfoDiv}>
              <Typography style={{ marginInlineEnd: "18px" }}>{linkCount} Link</Typography>
              <Typography style={{ marginInlineEnd: "18px" }}>
                {messageCount} Message
              </Typography>
              <Typography>{characterCount}/1000 Char</Typography>
            </Box>
            <Grid container  className={classes.funcDiv}>
              <Grid item xs={2.5}  className={isRTL ? classes.emojiHe : classes.emoji}>
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
                    <ToggleButton value="left" aria-label="left aligned">
                      <FormatAlignLeftIcon />
                    </ToggleButton>

                    <ToggleButton
                      value="right"
                      aria-label="right aligned"
                      style={{
                        borderRight: "1px solid #D5D5D5",
                        marginInlineEnd: "4px",
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
              </Grid>
              <Grid item xs={5.5}  className={classes.baseButtons}>
                <Typography
                  className={classes.infoButtons}
                  onClick={removalMessageButtonDisabled ? null : onRemovalMsg}
                >
                  <Typography  className={classes.editorLink}>+</Typography>Removal
                  Message
                </Typography>
                <Typography

                  className={classes.info2Buttons}
                  onClick={removalLinkDisabled ? null : onRemovalLink}
                >
                  <Typography  className={classes.editorLink}>+</Typography>Removal Link
                </Typography>
              </Grid>
              <Grid item xs={2.5}className={classes.endButtons}>
                <Box className={classes.selectMsg}>
                  <select className={classes.selectVal} value={selectValue} onChange={handleSelectChange}>
                  {
                   Object.keys(extraData).map((item, i) => {

                return(<option value={extraData[item]}>{item}</option>
  
            )

          })
      }
                   
                  </select>
                </Box>
                </Grid>
                <Grid item xs={1.5}  className={classes.addDiv}>
                  <Typography
                    className={classes.addButtons}
                    onClick={() => {
                      seteditmenuClick(!editmenuClick);
                    }}
                  >
                    <Typography className={classes.addBtn}
                    >
                     <Typography className={classes.plusIcn}>+</Typography> 
                    </Typography>
                    ADD
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
                        Landing Page Link
                      </Typography>
                   {previousCampaignData.length == 0 ? null : <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setdialogClickCampaign(true);
                          seteditmenuClick(false);
                        }}
                      >
                        Campaign Link
                      </Typography>}   
                      <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setwaize(true);
                          seteditmenuClick(false);
                        }}
                      >
                        Waze Navigation
                      </Typography>
                    </Box>
                  ) : null}
                </Grid>
              </Grid>
        </Grid>
        <Grid item xs={4}>
       
       <Box className={classes.switchDiv}>
       <FormGroup>
         <Switch
           className={isRTL ? classes.reactSwitchHe : classes.reactSwitch}
           checked={keep}
           onChange={toggleKeep}
           onColor="#28a745"
           checkedIcon={false}
           uncheckedIcon={false}
         />
       </FormGroup>
       <Box className={classes.radio}>
         <Typography style={{ fontSize: "18px" }}>
           {t("mainReport.keepTrack")}
         </Typography>
         <Typography
           style={{
             width: "200px",
             fontSize: "15px",
             marginTop: "5px",
             color: "#C2C2C2",
             fontWeight:"600"
           }}
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
          <img
            src={Mobile}
              className={classes.phoneImg}
          />
          <span className={classes.phoneNumber}>050608001</span>
          <div className={classes.wrapChat}>
            <div className={classes.fromMe}>
              {msg === "" ? "Type text" : msg}
            </div>
          </div>
        </Box>
        <div
          style={{
            marginInlineStart: "35px",
            display: "flex",
            marginTop: "20px",
          }}
        >
          <FormGroup>
            <Switch
              checked={checked}
              onChange={toggleChecked}
              name="checkedB"
              onColor="#28a745"
              checkedIcon={false}
              uncheckedIcon={false}
              className={isRTL ? classes.reactSwitchHe : classes.reactSwitch}
            />
          </FormGroup>
          <div
            style={{ display: "flex", flexDirection: "column", width: "250px" }}
          >
            <span style={{ fontSize: "18px" }}>
              
              {t("mainReport.testSend")}
            </span>
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
          <div style={{ marginTop: "10px", marginInlineStart: "35px" }}>
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
                      placeholder="Enter phone number"
                      className={classes.rightInput}
                      value={phone}
                      onChange={handleNumberChange}
                    />
                    <span className={classes.rightSend} onClick={handleSend}>
                      SEND
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
                      <Alert severity="error" onClose={handleCloseSnackbar}>
                        Invalid Number!
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
                    <span className={classes.newIcn}>New!</span>
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
                      <div> Choose test groups from the list</div>
                      {hidden ? (
                        <div className={classes.mappedGroup}>
                          {selectedGroup.map((item, index) => {
                            if (item.selected && hidden) {
                              return (
                                <div className={classes.selectedGroupsDiv}
                                >
                                 <span className={classes.nameGroup}>{item.GroupName}</span> 
                                  <RiCloseFill className={classes.groupCloseicn}
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
          <span className={classes.rightInput4} onClick={clickExit}>
            Exit
          </span>
          <span
            className={classes.rightInput5}
            onClick={() => {
              onContinueClick(true);
            }}
          >
            Save
          </span>
          <span
            className={classes.rightInput6}
            onClick={() => {
              onContinueClick(false);
            }}
          >
            Continue
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
    setdeleteClick(true);
  };

  const onContinueClick = async (isSave) => {
    if (validationCheck()) {
      let payload = {
        CreditsPerSms: "1",
        FromNumber: campaignNumber,
        IsLinksStatistics: true,
        IsResponse: false,
        IsTestCampaign: false,
        Name: campaignName,
        ResponseToEmail: "",
        SMSCampaignID: -1,
        SendDate: Date.now(),
        SendingMethod: 0,
        Status: 1,
        SubAccountID: -1,
        Text: msg,
        Type: 0,
        UpdateDate: 1628755539174,
      };
      let r = await dispatch(smsSave(payload));
    
      sessionStorage.setItem(
        "data",
        JSON.stringify({
          name: campaignName,
          text: msg,
        })
      );
      if (isSave) {
        history.push(`/sms?SMSCampaignID=${r.payload.Message}`);
      } else {
        history.push(`/sms?SMSCampaignID=${r.payload.Message}`);
        history.push(`/smsStep?SMSCampaignID=${r.payload.Message}`);
      }
    }
  };

  const handleClose = () => {
    setdeleteClick(false);
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
    let camp = "";
    camp = msg + getPreviousCampaignData[id].EncryptURL;
    setdialogClickCampaign(false);
    seteditmenuClick(false);
    setmsg(camp);
    setcharacterCount(camp.length);
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

  const handleDelete = () => {
    dispatch(deleteSms(-1));
    handleClose();
  };

  const makeArr = (id) => {
    let arr = [];
  };

  const handleGroupClose = async () => {
    setsummary(true);
    setsave(false);
    sethidden(true);
    setcontactGroup(false);
    let payload = {
      CreditsPerSms: "1",
      FromNumber: campaignNumber,
      IsLinksStatistics: true,
      IsResponse: false,
      IsTestCampaign: false,
      Name: campaignName,
      ResponseToEmail: "",
      SMSCampaignID: -1,
      SendDate: Date.now(),
      SendingMethod: 0,
      Status: 1,
      SubAccountID: -1,
      Text: msg,
      Type: 0,
      UpdateDate: 1628755539174,
    };
    let r = await dispatch(smsSave(payload));
    let temp = [];
    let tempfull = [];
    let num = 0
    for (let i = 0; i < selectedGroup.length; i++) {
      if (selectedGroup[i].selected) {
        temp.push(selectedGroup[i].GroupID);
        tempfull.push(selectedGroup[i]);
        ++num;
      }
    }
    settotal(num);
    settemp(tempfull);
    let payload2 = {
      IsTestGroups: true,
      SMSCampaignID: r.payload.Message,
      TestGroupsIds: temp,
    };

    let r2 = await dispatch(smsSaveGroup(payload2));
    await dispatch(getCampaignSumm(r.payload.Message));
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
            <div style={{ height: "60px", borderBottom: "1px solid black" }}>
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
                  placeholder="Search"
                  inputProps={{ "aria-label": "Search" }}
                  onChange={(e) => {
                    setContactSearch(e.target.value);
                  }}
                />
              </Paper>
            </div>
            <div className={classes.listDiv}>
              {
                selectedGroup
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
                      <div className={classes.searchCon} onClick={makeArr(idx)}>
                        <span
                          style={{ marginInlineEnd: "25px" }}
                          className={item.selected ? classes.greenDoc : classes.blueDoc}
                        >
                          {item.selected ? (<FaCheck className={clsx(classes.green)} />) : <HiOutlineUserGroup />}
                        </span>
                        <div className={classes.selectGroupDiv}
                          onClick={() => {
                            handleSelect(idx);
                          }}
                        >
                          <span>{item.GroupName}</span>
                          <span>{item.Recipients}</span>
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
                Confirm
              </Button>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };
  const handleExitYes = () => {
    setexitClick(false);
    onContinueClick();
  };
  const renderExit = () => {
    return (
      <>
        {exitClick ? (
          <Dialog
            classes={classes}
            open={exitClick}
            onClose={handleExit}
            onConfirm={handleExitYes}
            confirmText="Yes"
            cancelText="No"
            showDefaultButtons={true}
            icon={
              <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
              />
            }
          >
            <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
              <span className={classes.groupName}>Leave Campaign Creation</span>
            </div>
            <div style={{ fontSize: "22px", marginTop: "5px" }}>
              <span>Would you like to save your changes before exiting?</span>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };
  const handlecaution = () => {
    setalertToggle(false);
    setmodalOpen(true);
  };

  const handlecautioncancel = () => {
    setcampaignNumber(storedValue);
    setalertToggle(false);
  };

  const handleAlertoff = () => {
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
            confirmText="Confirm"
            onCancel={handlecautioncancel}
            cancelText="Cancel"
            showDefaultButtons={true}
            icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
          >
            <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
              <span className={classes.groupName}>Please Note!</span>
            </div>
            <div style={{ fontSize: "22px", marginTop: "5px" }}>
              <span>
                You have changed the number assigned to you by the Pulseem
                platform for this campaign. The recipients won’t be able to
                unsubscribe from your SMS distribution list through a removal
                message. You can add a removal link instead or revert to your
                original number.
              </span>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };
  const handleExit = () => {
    setexitClick(false);
  };

  const renderSummary = () => {
    return (
      <>
        <Summary
          classes={classes}
          campaign={campaignName}
          number={campaignNumber}
          totalmsg={msg}
          selected={selectedGroup}
          bool={summary}
          grand={total}
          final={temp}
          summ={getCampaignSum}
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
  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      <Grid container spacing={3} className={classes.smsInit}>
      <Grid item xs={8}>
          {renderSwitch()}
          {renderHead()}
          {renderFields()}
          {renderMsg()}

      </Grid>
     
        <Grid item xs={4}>{renderPhone()}</Grid>
      </Grid>
      {dialogClick ? (
        <Dialog
          classes={classes}
          open={dialogClickLanding}
          onClose={handleCloseLanding}
          showDefaultButtons={false}
          icon={<FaUndoAlt style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Select Landing Page</span>
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
                placeholder="Search"
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
                      <FcDocument />
                    </span>
                    <span>{item.Name}</span>
                  </div>
                );
              })}
          </div>
        </Dialog>
      ) : null}
      {dialogClickLanding ? (
        <Dialog
          classes={classes}
          open={dialogClickLanding}
          onClose={handleCloseLanding}
          showDefaultButtons={false}
          icon={<FaUndoAlt style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Select Landing Page</span>
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
                placeholder="Search"
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
                      <FcDocument />
                    </span>
                    <span>{item.CampaignName}</span>
                  </div>
                );
              })}
          </div>
        </Dialog>
      ) : null}
      {dialogClickCampaign ? (
        <Dialog
          classes={classes}
          open={dialogClickCampaign}
          onClose={handleCloseCampaign}
          showDefaultButtons={false}
          icon={<FaUndoAlt style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Select Campaign</span>
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
                placeholder="Search"
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
                      <FcDocument />
                    </span>
                    <span>{item.Name}</span>
                  </div>
                );
              })}
          </div>
        </Dialog>
      ) : null}
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
              Type a location for navigation
            </span>
          </div>
          <div className={classes.modalDiv}>
            <Paper component="form" className={btnStyle.root}>
              <IconButton
                type="submit"
                className={btnStyle.iconButton}
                aria-label="search"
              >
                <FaLocationArrow />
              </IconButton>
              <InputBase
                className={btnStyle.input}
                placeholder="Search"
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
              Confirm
            </span>
          </div>
        </Dialog>
      ) : null}

      {deleteClick ? (
        <Dialog
          classes={classes}
          open={deleteClick}
          onClose={handleClose}
          onCancel={cancel ? null : true}
          onConfirm={handleDelete}
          confirmText="Confirm"
          showDefaultButtons={true}
          icon={
            <AiOutlineExclamationCircle
              style={{ fontSize: 30, color: "#fff" }}
            />
          }
        >
          <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
            <span className={classes.groupName}>Delete Campaign</span>
          </div>
          <div style={{ fontSize: "22px", marginTop: "5px" }}>
            <span>Are you sure?</span>
          </div>
        </Dialog>
      ) : null}
      <Dialog
        classes={classes}
        open={save}
        onClose={handleCloseSave}
        showDefaultButtons={false}
        icon={
          <AiOutlineExclamationCircle style={{ fontSize: 30, color: "#fff" }} />
        }
      >
        <div style={{ height: "60px", borderBottom: "1px solid black" }}>
          <span className={classes.groupName}>
            The following fields are invalid:
          </span>
        </div>
        <div>
          <ul style={{ fontSize: "20px", color: "red", fontWeight: "600" }} className={classes.listValues}>
            <li  className={classes.campNameLi}>
              Campaign Name - Required field
            </li>
            <li>Text for sending - Required field</li>
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
            Confirm
          </Button>
        </div>
      </Dialog>
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
        <Alert severity="success" onClose={handleCloseSnackbarApi}>
          Quick sent Succefully
        </Alert>
      </Snackbar>
    </DefaultScreen>
  );
};

export default SmsCreator;
