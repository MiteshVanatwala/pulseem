import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
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
import { withStyles } from "@material-ui/core/styles";
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
  getCampaignSumm
} from "../../../redux/reducers/smsSlice";
import { Dialog } from "../../../components/managment/index";
import { FcDocument } from "react-icons/fc";
import { FaUndoAlt } from "react-icons/fa";
import Summary from "./smsSummary";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { FaMapSigns, FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import { Button, Grid } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlineDelete } from "react-icons/ai";

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
const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "#52d869",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const SmsCreator = ({ classes }, props) => {
  const styles = useStyles();
  const btnStyle = useStyleNew();
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const { previousLandingData, previousCampaignData, extraData, accountId ,getCampaignSum} =
    useSelector((state) => state.sms);
    console.log("aajaa",getCampaignSum)
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

  console.log("accountId Outer", accountId);

  const getData = async () => {
    await dispatch(getPreviousLandingData());

    setLoader(false);
  };

  const onApiCall = () => 
  {
    alert("hi");
  }
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
  useEffect(() => {}, [removalMessageButtonDisabled]);

  useEffect(() => {
    console.log("heyyyyyyy", selectedGroup);
  }, [selectedGroup]);
  useEffect(() => {
    console.log("props", classes);
  }, []);

  useEffect(() => {
    let temp = [];
    console.log("Acoount Id inner", accountId);
    for (let i = 0; i < accountId.length; i++) {
      temp.push(accountId[i]);
    }
    console.log("heyyyyy2", temp);
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
      <div className={classes.infoDiv}>
        <span className={classes.headInfo}>{t("mainReport.smsCampaign")}</span>
        <Tooltip
          disableFocusListener
          title={t("mainReport.toolTip1")}
          classes={{ tooltip: styles.customWidth }}
        >
          <span className={classes.bodyInfo}>i</span>
        </Tooltip>
      </div>
    );
  };
  const renderHead = () => {
    return (
      <div className={classes.headDiv}>
        <span className={classes.headNo}>1</span>
        <span className={classes.contentHead}>
          {t("mainReport.createContent")}
        </span>
      </div>
    );
  };

  const onCamppaignChange = (e) => {
    setcampaignName(e.target.value);
    setcampaignBool(false);
  };

  const onCampaignNumber = (e) => {
    setstoredValue(campaignNumber);
    console.log("camp", campaignNumber);

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
          SendDate: 1628770145467,
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
      <div className={classes.fieldDiv}>
        <div className={classes.buttonForm}>
          <span className={classes.buttonHead}>{t("mainReport.campName")}</span>
          <input
            type="text"
            placeholder="Campaign Name"
            className={
              campaignBool
                ? clsx(classes.buttonField, classes.error)
                : clsx(classes.buttonField)
            }
            onChange={onCamppaignChange}
            value={campaignName}
          />
          <span className={classes.buttonContent}>
            {t("mainReport.campDesc")}
          </span>
        </div>
        <div className={classes.buttonForm}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {" "}
            <span className={classes.buttonHead}>
              {t("mainReport.campFrom")}
            </span>
            <span
              style={{
                fontSize: "15px",
                color: "rgb(170, 170, 170)",
                cursor: "pointer",
              }}
              onClick={() => {
                setrestoreBool(!restoreBool);
              }}
            >
              {t("mainReport.restore")}
            </span>
          </div>

          <input
            type="text"
            placeholder="0508085670"
            className={clsx(classes.buttonField, classes.success)}
            onChange={onCampaignNumber}
            value={campaignNumber}
          />
          <span className={clsx(classes.buttonContent, classes.alertMsg)}>
            {t("mainReport.campRemovalDesc")}
          </span>
        </div>
        {restoreBool ? (
          <div className={classes.buttonForm}>
            <span className={clsx(classes.buttonHead)}>
              {" "}
              {t("mainReport.removalReply")}
            </span>
            <input
              type="text"
              placeholder="282"
              disabled
              className={classes.buttonField}
            />
          </div>
        ) : null}
      </div>
    );
  };
  const onMsgChange = (e) => {
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

  const renderMsg = () => {
    return (
      <div className={classes.msgDiv}>
        <div>
          <span className={classes.msgHead}>{t("mainReport.testSend")}</span>
          <div className={classes.boxDiv}>
            <textarea
              placeholder= {t("mainReport.typeText")}
              maxlength="1000"
              outlined=""
              id="yourMessage"
              className={
                alignment === "left"
                  ? clsx(classes.msgArea)
                  : clsx(classes.msgArea1)
              }
              onChange={onMsgChange}
              value={msg}
            ></textarea>
            <div className={classes.smallInfoDiv}>
              <span style={{ marginInlineEnd: "18px" }}>{linkCount} {t("mainReport.link")}</span>
              <span style={{ marginInlineEnd: "18px" }}>
                {messageCount} {t("mainReport.message")}
              </span>
              <span>{characterCount}/1000 {t("mainReport.char")}</span>
            </div>
            <div className={classes.funcDiv}>
              <div className={classes.emoji}>
                <ToggleButtonGroup
                  value={alignment}
                  exclusive
                  onChange={handleAlignment}
                  aria-label="text alignment"
                >
                  <ToggleButton value="left" aria-label="left aligned">
                    <FormatAlignLeftIcon />
                  </ToggleButton>

                  <ToggleButton value="right" aria-label="right aligned">
                    <FormatAlignRightIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <div className={classes.pickerEmoji}>
                  {flagemoji ? <Picker onEmojiClick={onEmojiClick} /> : null}

                  <InsertEmoticonIcon
                    style={{ marginInlineEnd: "8px" }}
                    onClick={() => {
                      setflagemoji(!flagemoji);
                    }}
                  />
                </div>
              </div>
              <div className={classes.baseButtons}>
                <span
                  className={classes.infoButtons}
                  onClick={removalMessageButtonDisabled ? null : onRemovalMsg}
                >
                  <span style={{ marginInlineEnd: "5px" }}>+</span>{t("mainReport.removalMsg")}
                </span>
                <span
                  className={classes.info2Buttons}
                  onClick={removalLinkDisabled ? null : onRemovalLink}
                >
                  <span style={{ marginInlineEnd: "5px" }}>+</span>{t("mainReport.removalLink")}
                </span>
              </div>
              <div className={classes.endButtons}>
                <div className={classes.selectMsg}>
                  <select className={classes.selectVal}>
                    <option>Personliazation</option>
                    <option>First Name</option>
                    <option>Last Name</option>
                    <option>Email</option>
                  </select>
                </div>
                <div className={classes.addDiv}>
                  <span
                    className={classes.addButtons}
                    onClick={() => {
                      seteditmenuClick(!editmenuClick);
                    }}
                  >
                    <span
                      style={{
                        marginInlineEnd: "3px",
                        border: "2px solid #1c82b2",
                        borderRadius: "50%",
                        padding: "5px",
                        width: "12px",
                        height: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1c82b2",
                        fontSize: "19px",
                        fontWeight: "700",
                      }}
                    >
                      +
                    </span>
                    {t("mainReport.add")}
                  </span>
                  {editmenuClick ? (
                    <div className={classes.dropDiv}>
                      <span
                        className={classes.dropCon}
                        onClick={() => {
                          setdialogClickLanding(true);
                        }}
                      >
                         {t("mainReport.landingLink")}
                      </span>
                      <span
                        className={classes.dropCon}
                        onClick={() => {
                          setdialogClickCampaign(true);
                        }}
                      >
                         {t("mainReport.campLink")}
                      </span>
                      <span
                        className={classes.dropCon}
                        onClick={() => {
                          setwaize(true);
                        }}
                      >
                       {t("mainReport.waize")}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={classes.switchDiv}>
          <FormGroup>
            <Switch
              className={classes.reactSwitch}
              checked={keep}
              onChange={toggleKeep}
            />
          </FormGroup>
          <div className={classes.radio}>
            <span style={{ fontSize: "18px" }}>
              {t("mainReport.keepTrack")}
            </span>
            <span
              style={{
                width: "200px",
                fontSize: "13px",
                marginTop: "5px",
                color: "#B5B5B5",
              }}
            >
              {t("mainReport.keepDesc")}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const onRadiochange = (e) => {
    setradioBtn(e.target.value);
  };

  const handleNumberChange = (e) => {
    setphone(e.target.value);
  };

  const renderPhone = () => {
    return (
      <div>
        <div style={{ position: "relative" }} className={classes.phoneDiv}>
          {" "}
          <img
            src={Mobile}
            style={{
          
              marginTop: "50px",
              borderBottom: "1px solid black",
            }}
          />
          <span className={classes.phoneNumber}>050608001</span>
          <div className={classes.wrapChat}>
            <div className={classes.fromMe}>
              {msg === "" ? t("mainReport.typeText") : msg}
            </div>
          </div>
        </div>
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
              onColor="#1771AD"
              className={classes.reactSwitch}
            />
          </FormGroup>
          <div
            style={{ display: "flex", flexDirection: "column", width: "250px" }}
          >
            <span style={{ fontSize: "18px" }}>
              {" "}
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
                  {" "}
                  <FormControlLabel
                    value="top"
                    control={<Radio color="primary" id="top" />}
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
                      <Alert severity="error" onClose={handleCloseSnackbar}>
                      {t("mainReport.invalidNo")}
                      </Alert>
                    </Snackbar>
                  </div>
                ) : null}

                <div>
                  {" "}
                  <FormControlLabel
                    value="bottom"
                    control={<Radio color="primary" id="bottom" />}
                  />
                  <span>{t("mainReport.sendToGroups")}</span>
                </div>
                {radioBtn === "bottom" ? (
                  <div className={classes.rightForm}>
                    <div
                      style={{
                        widht: "250px",
                        height: "200px",
                        height: "30px",
                        width: "230px",
                        padding: "8px",
                        border: "1px solid #bbb",
                        borderRadius: "5px",
                        color: "#bbb",
                        maxHeight: "30px",
                        overflowY: "auto",
                      }}
                      onClick={() => {
                        setcontactGroup(true);
                      }}
                    >
                      <div> {t("mainReport.ChooseLinks")}</div>
                      {hidden ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            marginTop: "5px",
                          }}
                        >
                          {" "}
                          {selectedGroup.map((item, index) => {
                            if (item.selected && hidden) {
                              return (
                                <div
                                  style={{
                                    width: "70px",
                                    padding: "6px",
                                    borderRadius: "20px",
                                    backgroundColor: "#1771ad",
                                    marginInlineEnd: "4px",
                                    marginBottom: "4px",
                                    color: "white",
                                  }}
                                >
                                  {item.GroupName}
                                  <span
                                    onClick={() => {
                                      handleCross(index);
                                    }}
                                  >
                                    X
                                  </span>
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
            <AiOutlineDelete style={{ fontSize: "25" }} />
          </span>
          <span className={classes.rightInput4} onClick={clickExit}>
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
      </div>
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
        SendDate: 1628755539174,
        SendingMethod: 0,
        Status: 1,
        SubAccountID: -1,
        Text: msg,
        Type: 0,
        UpdateDate: 1628755539174,
      };
      let r = await dispatch(smsSave(payload));
      console.log("response", r);
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
    camp = msg + getPreviousCampaignData[id].PageHref;
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

  const handleGroupClose = async () => 
  {
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
      SendDate: 1628755539174,
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
    for(let i =0 ; i < selectedGroup.length ; i++)
    {
      if(selectedGroup[i].selected)
      {
        temp.push(selectedGroup[i].GroupID);
        tempfull.push(selectedGroup[i]);
        ++num;
        
      }
      
    }
    settotal(num);
    settemp(tempfull);
    let payload2 = 
    {
      IsTestGroups: true,
      SMSCampaignID: r.payload.Message,
      TestGroupsIds: temp
    }

    let r2 = await dispatch(smsSaveGroup(payload2));
    await dispatch(getCampaignSumm(r.payload.Message));
  

  
       


  }
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
                  placeholder={t("mainReport.searchSms")}
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
                        className={classes.grDoc}
                      >
                        {item.selected ? "hi" : <HiOutlineUserGroup />}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "700px",
                        }}
                      >
                        <span
                          onClick={() => {
                            handleSelect(idx);
                          }}
                        >
                          {item.GroupName}
                        </span>
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
                 
                  handleGroupClose()
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
        ) : null}{" "}
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
        {" "}
        {alertToggle ? (
          <Dialog
            classes={classes}
            open={alertToggle}
            onClose={handleAlertoff}
            onConfirm={handlecaution}
            confirmText={t("mainReport.confirmSms")}
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
        ) : null}{" "}
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
          grand = {total}
          final = {temp}
          summ = {getCampaignSum}
          api = {onApiCall}
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
      <div className={classes.smsInit}>
        <div>
          {renderSwitch()}
          {renderHead()}
          {renderFields()}
          {renderMsg()}
        </div>
        <div>{renderPhone()}</div>
      </div>
      {dialogClick ? (
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
                      <FcDocument />
                    </span>
                    <span>{item.CampaignName}</span>
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
                      <FcDocument />
                    </span>
                    <span>{item.CampaignName}</span>
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
      ) : null}

      {deleteClick ? (
        <Dialog
          classes={classes}
          open={deleteClick}
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
          <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
            <span className={classes.groupName}>Delete Campaign</span>
          </div>
          <div style={{ fontSize: "22px", marginTop: "5px" }}>
            <span>Are you Sure?</span>
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
          {t("mainReport.fieldInvalid")}:
          </span>
        </div>
        <div>
          <ul style={{ fontSize: "20px", color: "red", fontWeight: "600" }}>
            <li style={{ marginBottom: "8px" }}>
            {t("mainReport.campaignRequire")}
            </li>
            <li> {t("mainReport.msgRequire")}</li>
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
      </Dialog>
      {renderSendGroup()}
      {renderExit()}
      {renderAlert()}
      {renderSummary()}
    </DefaultScreen>
  );
};

export default SmsCreator;
