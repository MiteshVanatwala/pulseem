import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import moment from "moment";
import { MdAutorenew } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import PropTypes from "prop-types";
import { DateField, Dialog } from "../../../components/managment/index";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { parse } from "papaparse";
import { HiOutlineUserGroup } from "react-icons/hi";
import IconButton from "@material-ui/core/IconButton";
import { FaCheck } from 'react-icons/fa';
import CloseIcon from "@material-ui/icons/Close";
import SortIcon from "@material-ui/icons/Sort";
import FilterListIcon from "@material-ui/icons/FilterList";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Notifications/Groups/Groups";
import { BsTrash } from "react-icons/bs";
import {
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  Box,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  ClickAwayListener,
  FormHelperText,
  Divider,
} from "@material-ui/core";
import {
  getAccountId,
  smsCombinedGroup,
  smsCampSettings,
  deleteSms,
  getCampaignSumm,
  getManual,
  getFinishedCampaigns
} from "../../../redux/reducers/smsSlice";
import { AiOutlineDelete } from "react-icons/ai";
import Summary from "./smsSummary";


import clsx from "clsx";
import { transform } from "babel-core";
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
    width: 400,
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const useStyle = makeStyles((theme) => ({
  root: {
    backgroundColor: "#ffffff",
  },
}));

const SmsCreatorStep = ({ classes }) => {
  const { t } = useTranslation();
  document.title = t("mainReport.smsTitle")
  const styles = useStyles();
  const btnStyle = useStyleNew();
  const tabi = useStyle();

  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const { previousLandingData, previousCampaignData, extraData, accountId, finishedCampaigns } =
    useSelector((state) => state.sms);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [selectedGroups, setSelected] = useState([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [sendType, setSendType] = useState("1"); // Immediate
  const [sendDate, handleFromDate] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [boolRandom, setboolRandom] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [filterGroups, setfilterGroups] = useState([]);
  const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
  const [showGroupsList, setShowGroupsList] = useState(false);
  const [inputRecipients, setinputRecipients] = useState("");
  const [toggleChecked, settoggleChecked] = useState(false);
  const [cancel, setcancel] = useState(true);
  const [campaignIdResp, setcampaignIdResp] = useState(-1);
  
  const [groupValue, setgroupValue] = useState("");
  const [manualTrue, setmanualTrue] = useState(false);
  const [pulse, setpulse] = useState(false);
  const [reciFilter, setreciFilter] = useState(false);
  const [responseQuick, setresponseQuick] = useState(null);
  const [pulseBool, setpulseBool] = useState(false);
  const [TimeBool, setTimeBool] = useState(false);
  const [totalGroupstoDisplay, settotalGroupstoDisplay] = useState(0);
  const [percentTrue, setpercentTrue] = useState(true);
  const [dropIndex, setdropIndex] = useState(-1);
  const [noTrue, setnoTrue] = useState(false);
  const [campaignSearch, setcampaignSearch] = useState("");
  const [model, setModel] = useState({
    ID: 0,
    Name: "",
    Title: "",
    Body: "",
    Icon: "",
    Image: "",
    RedirectURL: "",
    Tag: "",
    Direction: 2,
    IsRenotify: "",
    SendDate: "",
    IsDeleted: "",
    SentCount: "",
    StatusID: "",
    NotificationGroups: "",
    RedirectButtonText: "",
  });
  const [ContactSearch, setContactSearch] = useState("");
  const [selectedGroup, setselectedGroup] = useState([]);
  const [togglePulse, settogglePulse] = useState(false);
  const [toggleRandom, settoggleRandom] = useState(false);
  const [summModal, setsummModal] = useState(false);
  const [toggleB, settoggleB] = useState(true);
  const [toggleA, settoggleA] = useState(false);
  const [toggleReci, settoggleReci] = useState(false);
  const [groupClick, setgroupClick] = useState(true);
  const [manualClick, setmanualClick] = useState(false);
  const [highlighted, setHighlighted] = React.useState(false);
  const [contacts, setContacts] = React.useState([]);
  const [pulseReci, setpulseReci] = useState("");
  const [caution, setcaution] = useState(false);
  const [pulsePer, setpulsePer] = useState("percent");
  const [inputF, setinputF] = useState("");
  const [random, setrandom] = useState("");
  const [inputS, setinputS] = useState("");
  const [minTrue, setminTrue] = useState(false);
  const [hoursTrue, sethoursTrue] = useState(true);
  const [minName, setminName] = useState("");
  const [hourName, sethourName] = useState("");
  const [newVal, setnewVal] = useState("");
  const [reciToggle, setreciToggle] = useState(false);
  const [areaData, setareaData] = useState("");
  const [RecipientsBool, setRecipientsBool] = useState(false);
  const [editT, seteditT] = useState(false);
  const [deleteClick, setdeleteClick] = useState(false);
  const [areatyped, setareatyped] = useState("");
  const [totalCampaigns, settotalCampaigns] = useState([])
  const [blank, setblank] = useState(['first Name', 'Last Name', 'Cell Phone']);
  const [typedData, settypedData] = useState([]);
  const [selectArray, setselectArray] = useState([
    {
      isdisabled: false,
      idx: -1,
      value: "first name"
    },
    {
      isdisabled: false,
      idx: -1,
      value: "last name"
    },
    {
      isdisabled: false,
      idx: -1,
      value: "cell phone"
    }

  ]);
  const [Unique, setUnique] = useState(-1);
  const [initialheadstate, setinitialheadstate] = useState([])



  const [headers, setheaders] = useState(initialheadstate);
  const getData = async () => {
    const list = await dispatch(getFinishedCampaigns());
    const tempGroupList = list.payload;
    settotalCampaigns(tempGroupList);

  };
  useEffect(() => {
    getAccount();
    getData();

  }, [dispatch]);






  const getAccount = async () => {
    const list = await dispatch(getAccountId());
    const tempGroupList = list.payload;
    if (tempGroupList) {
      tempGroupList.Id = tempGroupList.GroupID;
    }
    setGroupList(tempGroupList);
    setfilterGroups(tempGroupList);
  };
  // console.log("new", contacts);

  const callbackSelectAll = () => {
    if (!allGroupsSelected) {
      setSelected(groupList);
    } else {
      setSelected([]);
    }
    setAllGroupsSelected(!allGroupsSelected);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  const handleSendType = (event) => {
    if (event.target.value == "1") {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
    }

    setSendType(event.target.value);
  };
  const callbackSelectedGroups = (group, key, reference) => {
    const found = selectedGroups
      .map((group) => {
        return group.GroupID;
      })
      .includes(group.GroupID);
    if (found) {
      setSelected(selectedGroups.filter((g) => g.GroupID !== group.GroupID));
    } else {
      setSelected([...selectedGroups, group]);
    }
    let temp = 0;
    for(let i=0 ; i < selectedGroups.length ; i++)
    {
      temp = temp  + selectedGroups[i].Recipients
           
    }
    settotalGroupstoDisplay(temp);
  };
  const callbackUpdateGroups = (groups) => {
    setSelected(groups);
   
  };

  const handlebef = () => {
    settoggleA(false);
    settoggleB(true);
  };
  const handleaf = () => {
    settoggleA(true);
    settoggleB(false);
  };
  const renderSwitch = () => {
    return (
      <div className={classes.infoDiv}>
        <span className={classes.headInfo}> {t("mainReport.smsCampaign")}</span>
      </div>
    );
  };
  const renderHead = () => {
    return (
      <div className={classes.headDiv}>
        <span className={classes.headNo}>2</span>
        <span className={classes.contentHead}>

          {t("mainReport.sendSetting")}
        </span>
      </div>
    );
  };
  const callbackFilter = () => {
    setreciFilter(true);
  };

  const handleDatePicker = (value) => {
    handleFromDate(value);
    // setTimePickerOpen(!timePickerOpen);
  };
  const handleTimePicker = (value) => {
    var date = moment(sendDate);
    var time = moment(value, "HH:mm");
    date.set({
      hour: time.get("hour"),
      minute: time.get("minute"),
    });

    handleFromDate(date);
    setTimePickerOpen(false);
  };

  const handleCombined = async () => {
    let temp = [];
    for (let i = 0; i < selectedGroups.length; i++) {
      temp.push(selectedGroups[i].GroupID);
    }
    let payload = {
      SubAccountID: 1,
      GroupName: groupValue,
      GroupIds: temp,
    };
    let r = await dispatch(smsCombinedGroup(payload));
    let tempres = [];
    for (let i = 0; i < groupList.length; i++) {
      tempres.push(groupList[i]);
    }
    tempres.push(r.payload);
    setGroupList(tempres);
  };
  const handleSelect = (id) => {
    let tempArr = [];
    for (let i = 0; i < filterGroups.length; i++) {
      if (id === i) {
        if (filterGroups[i].selected) {
          tempArr.push({ ...filterGroups[i], selected: false });
        } else {
          tempArr.push({ ...filterGroups[i], selected: true });
        }
      } else {
        tempArr.push(filterGroups[i]);
      }
    }
    setfilterGroups(tempArr);
  };
  const handleSelectCamp = (id) => {
    let tempArr = [];
    for (let i = 0; i < totalCampaigns.length; i++) {
      if (id === i) {
        if (totalCampaigns[i].selected) {
          tempArr.push({ ...totalCampaigns[i], selected: false });
        } else {
          tempArr.push({ ...totalCampaigns[i], selected: true });
        }
      } else {
        tempArr.push(totalCampaigns[i]);
      }
    }
    settotalCampaigns(tempArr);
  };
  const onHandleDelete = () => {
    setdeleteClick(true);
  };
  const inputGroup = (e) => {
    setgroupValue(e.target.value);
  };
  const handlePulseClose = () => {

    setpulse(false);


  };

  const handlePulseConfirm = () => {
    console.log("hereeee")
    if (onPulseValidations()) {
      setpulse(false);
    }
  }
  const handleTime = (e) => {
    setinputS(e.target.value);
    setTimeBool(false);
  };
  const handleRandom = (e) => {
    setrandom(e.target.value);
    setboolRandom(false);
  };
  const handlePulseInput = (e) => {
    setinputF(e.target.value);
    setpulseBool(false);
  };

  const onPulseValidations = () => {
    if (togglePulse) {

      if (inputF === "") {
        setpulseBool(true);
        if (inputS === "") {
          setTimeBool(true);
          return false;
        }

      }
      else if (inputS === "") {
        setTimeBool(true);
        if (inputF === "") {
          setpulseBool(true);
          return false;
        }

      }
      else if (toggleRandom) {
        if (random === "") {
          setboolRandom(true);
          return false;
        }
        else {
          return true;
        }
      }
      else {
        return true;
      }

    }
    else if (toggleRandom) {
      if (random === "") {
        setboolRandom(true);
        return false;
      }
      else {
        return true;
      }
    }

    else {
      return true;
    }

  }

  const renderPulse = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={pulse}
          onClose={handlePulseClose}
          showDefaultButtons={false}
          icon={<MdAutorenew style={{ fontSize: 30, color: "#fff" }} />}
        >
          <div className={classes.pulseParentDiv}>
            <span className={classes.groupName}> {t("smsReport.pulseSending")}</span>
          </div>
          <div>
            <div
              className={classes.pulseChildDiv}
            >

              <Checkbox
                checked={togglePulse}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onClick={() => {
                  settogglePulse(!togglePulse);
                  setinputF("");
                  setinputS("");
                }}
              />
              <span>{t("smsReport.packetSend")}</span>
            </div>
            <div
              className={classes.topPulseDiv}
            >
              <div>
                <span
                  className={classes.noOfReci}
                >
                  {t("smsReport.noOfReciPulse")}
                </span>
                <div
                  className={classes.inputFieldDiv}
                >
                  <input
                    type="text"
                    placeholder={t("smsReport.insert")}
                    disabled={togglePulse ? false : true}
                    className={
                      togglePulse
                        ? pulseBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                        : clsx(classes.pulseInsert)
                    }
                    value={inputF}
                    onChange={handlePulseInput}
                    maxLength="1"
                  />

                  <div className={classes.commonFieldPulse} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                    <span
                      className={
                        togglePulse
                          ? percentTrue
                            ? clsx(classes.percentTrue)
                            : clsx(classes.percentActive)
                          : clsx(classes.percent)
                      }
                      onClick={() => {
                        setpercentTrue(true);
                        setnoTrue(false);
                        setpulsePer("percent");
                        setpulseReci("");
                      }}
                    >
                      {t("smsReport.percent")}
                    </span>
                    <span
                      className={
                        togglePulse
                          ? noTrue
                            ? clsx(classes.reciTrue)
                            : clsx(classes.reciActive)
                          : clsx(classes.reci)
                      }
                      onClick={() => {
                        setpercentTrue(false);
                        setnoTrue(true);
                        setpulsePer("");
                        setpulseReci("Recipients");
                      }}
                    >
                      {t("smsReport.Reci")}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <span
                  className={classes.noOfReci}
                >
                  {t("smsReport.timeSend")}
                </span>
                <div
                  className={classes.inputFieldDiv}
                >
                  <input
                    type="text"
                    placeholder={t("smsReport.insert")}
                    disabled={togglePulse ? false : true}
                    className={
                      togglePulse
                        ? TimeBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                        : clsx(classes.pulseInsert)
                    }
                    onChange={handleTime}
                    value={inputS}
                    maxLength="1"
                  />

                  <div className={classes.commonFieldPulse} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                    <span
                      className={
                        togglePulse
                          ? hoursTrue
                            ? clsx(classes.percentTrue)
                            : clsx(classes.percentActive)
                          : clsx(classes.percent)
                      }
                      onClick={() => {
                        sethoursTrue(true);
                        setminTrue(false);
                        setminName("");
                        sethourName("hours");
                      }}
                    >
                      {t("smsReport.Hours")}
                    </span>
                    <span
                      className={
                        togglePulse
                          ? minTrue
                            ? clsx(classes.reciTrue)
                            : clsx(classes.reciActive)
                          : clsx(classes.reci)
                      }
                      onClick={() => {
                        sethoursTrue(false);
                        setminTrue(true);
                        setminName("mins");
                        sethourName("");
                      }}
                    >
                      {t("smsReport.min")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div

              className={classes.randomSendDiv}
            >

              <Checkbox
                checked={toggleRandom}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onClick={() => {
                  settoggleRandom(!toggleRandom);
                }}
              />
              <span>{t("smsReport.randomSend")}</span>
            </div>
            <div>
              <span
                className={classes.randomReciSpan}
              >
                {t("smsReport.noOfReci")}
              </span>

              <input
                type="text"
                placeholder={t("smsReport.insert")}
                disabled={toggleRandom ? false : true}
                className={
                  toggleRandom
                    ? boolRandom ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive)
                    : clsx(classes.pulseInsert)
                }
                onChange={handleRandom}
                value={random}
              />
            </div>
          </div>
          <div
            className={classes.confirmDiv}
          >
            <Button
              variant="contained"
              size="small"
              className={clsx(
                classes.dialogButton,
                classes.dialogConfirmButton
              )}
              onClick={handlePulseConfirm}
            >
              {t("smsReport.confirmBtn")}
            </Button>
          </div>
        </Dialog>
      </>
    );
  };
  const areaChange = (e) => {
    setareaData(e.target.value);
  };
  const renderBody = () => {
    return (
      <div>
          <div className={classes.infoDiv}>
        <span className={classes.conInfo}>{t("mainReport.whomTosend")}</span>
        <Tooltip
          disableFocusListener
          title="First choose who receives your campaign, then choose when."
          classes={{ tooltip: styles.customWidth }}
        >
          <span className={classes.bodyInfo}>i</span>
        </Tooltip>
      </div>
        <div className={classes.tabDiv}>
          <div
            className={
              groupClick
                ? clsx(classes.tab1, classes.activeTab)
                : clsx(classes.tab1)
            }
          >
            <span
              onClick={() => {
                setgroupClick(true);
                setmanualClick(false);
              }}
              style={{ cursor: "pointer" }}
            >
              {t("mainReport.groups")}
            </span>
          </div>
          <div
            className={
              manualClick
                ? clsx(classes.tab1, classes.activeTab)
                : clsx(classes.tab1)
            }
          >
            <span
              style={{ marginInlineEnd: "7px", cursor: "pointer" }}
              onClick={() => {
                setgroupClick(false);
                setmanualClick(true);
              }}
            >
              {t("mainReport.manual")}
            </span>
            <Tooltip
              disableFocusListener
              title="Add recipient information. New! You can now add up to 600,000 recipients"
              classes={{ tooltip: styles.customWidth }}
            >
              <span className={classes.bodyInfo}>i</span>
            </Tooltip>
          </div>
          
        </div>
        {manualClick ? (
            <div
              className={
                highlighted
                  ? clsx(classes.greenManual)
                  : clsx(classes.areaManual)
              }
            >
              <textarea
                placeholder="Drag &amp; drop an XLS/CSV file or copy and paste the details directly into this box. You may also enter manually, by adding a comma between values: FirstName, LastName, Cellphone. You are able to enter hundreds of thousands of recipients to this box"
                spellcheck="false"
                autocomplete="off"
                className={
                  highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
                }
                value={areaData}
                onDragEnter={() => {
                  setHighlighted(true);
                }}
                onChange={areaChange}
                onDragLeave={() => {
                  setHighlighted(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onPaste={areaChange}
                onDrop={(e) => {
                  e.preventDefault();
                  setHighlighted(false);
                  setmanualTrue(true);

                  Array.from(e.dataTransfer.files)
                    .filter((file) => file.type === "text/csv")
                    .forEach(async (file) => {
                      const text = await file.text();
                      const result = parse(text, { header: true });
                      console.log("res", result.data);
                      setContacts((existing) => [...existing, ...result.data]);
                      let res = "";
                      for (let i = 0; i < result.data.length; i++) {
                        for (
                          let j = 0;
                          j < Object.values(result.data[i]).length;
                          j++
                        ) {
                          res = res + Object.values(result.data[i])[j];
                        }
                        res = res + "\n";
                      }

                      setareaData(res);
                      let ddc = [];
                      for (let i in result.data[0]) {
                        ddc.push("Adjust Title")
                      }
                      setheaders(ddc);
                    });
                }}
              />
            </div>
          ) : null}
        <div  className={classes.groupsFilterDiv}>
          {groupClick ? (

            <Groups
              classes={classes}
              groupList={groupList}
              selectedList={selectedGroups}
              callbackSelectedGroups={callbackSelectedGroups}
              callbackUpdateGroups={callbackUpdateGroups}
              callbackSelectAll={callbackSelectAll}
              callbackReciFilter={callbackFilter}
              bool={true}
            />
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {manualClick === false ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <Checkbox
                    disabled={selectedGroups.length >= 2 ? false : true}
                    checked={toggleChecked}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onClick={() => {
                      settoggleChecked(!toggleChecked);
                    }}
                  />
                  <span className={selectedGroups.length >= 2 ? classes.createGroupSpan : classes.createGroupSpanDisabled}>{t("mainReport.createNewGroup")}</span>
                  <span className={classes.iconNew}>{t("mainReport.newFeature")}</span>
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.tooltipCreateGroup")}
                    classes={{ tooltip: styles.customWidth }}
                    style={{ marginInlineStart: "5px" }}
                  >
                    <span className={classes.bodyInfo}>i</span>
                  </Tooltip>
                </div>
              ) : null}

              {toggleChecked ? (
                <div>
                  <input
                    type="text"
                    className={classes.groupInput}
                    placeholder="Group Name"
                    onChange={inputGroup}
                    value={groupValue}
                  />
                  <span className={classes.saveBtn} onClick={handleCombined}>
                    {t("mainReport.save")}
                  </span>
                </div>
              ) : null}
            </div>
            {manualClick == false ? (
              <div
                style={{
                  display: "flex",
                  marginTop: "10px",
                }}
              >
                <span>{t("mainReport.totalReci")}: {totalGroupstoDisplay}</span>
                <Tooltip
                  disableFocusListener
                  title="Please note this value is not the final number of recipients who will receive this campaign. After selecting your sending preferences, you will see the correct value in the Summary page."
                  classes={{ tooltip: styles.customWidth }}
                  style={{ marginInlineStart: "5px" }}
                >
                  <span className={classes.bodyInfo}>i</span>
                </Tooltip>
              </div>
            ) : null}
          </div>
          {manualClick == true ? (
            <div className={classes.manualChild}>
              {areaData !== "" ? (
                <div>
                  <span
                    className={classes.addManualDiv}
                    onClick={() => {
                      handlePasted();
                    }}
                  >

                    Edit fields and save
                  </span>
                  <span
                    className={classes.clearDiv}
                    onClick={() => {
                      setareaData("");
                      setContacts([]);
                    }}
                  >
                    Clear list
                  </span>
                </div>
              ) : null}
              <span>Total Records : 0</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };
  const handleCross = (id) => {
    let temp = [];
    for (let i = 0; i < filterGroups.length; i++) {
      if (i == id) {
        temp.push({ ...filterGroups[i], selected: false });
      } else {
        temp.push(filterGroups[i]);
      }
    }
    setfilterGroups(temp);
  };
  const handleCrossCamp = (id) => {
    let temp = [];
    for (let i = 0; i < totalCampaigns.length; i++) {
      if (i == id) {
        temp.push({ ...totalCampaigns[i], selected: false });
      } else {
        temp.push(totalCampaigns[i]);
      }
    }
    settotalCampaigns(temp);
  };
  const handleReciClose = () => {

    setreciFilter(false);
  };
  const handleReciConfirm = () => {

    if (toggleReci) {
      if (validationCheck()) {
        console.log("Trueeee");
        setreciFilter(false);
      }
    }
    else {
      setreciFilter(false);
    }
  };
  const handlePasted = () => {
    let temp = areaData;
    let a = temp.split("\n");
    let b = [];
    for (let i = 0; i < a.length; i++) {
      b.push(a[i].split(","));
    }
    // ("higconsole.logh",b)
    settypedData(b);

    let dummyArr = [];
    for (let i = 0; i < b[0].length; i++) {
      dummyArr.push("Adjust Title");
    }
    setinitialheadstate(dummyArr);
    setheaders(dummyArr)

    seteditT(true);
    setmanualTrue(true);
  };
  const handleReciInput = (e) => {

    setinputRecipients(e.target.value);
    setRecipientsBool(false);

  }
  const validationCheck = () => {
    if (inputRecipients === "") {
      setRecipientsBool(true);
      return false;
    }
    else {
      return true;
    }

  };
  const renderReciFilter = () => {
    return (
      <>
        {reciFilter ? (
          <Dialog
            classes={classes}
            open={true}
            onClose={handleReciClose}
            onConfirm={handleReciConfirm}
            confirmText={t("smsReport.okBtn")}
            cancelText={t("smsReport.cancelBtn")}
            showDefaultButtons={true}
            icon={<MdAutorenew style={{ fontSize: 30, color: "#fff" }} />}
          >
            <div className={classes.reciFilterDiv}>
              <span className={classes.groupName}>{t("smsReport.recipientsFilter")}</span>
            </div>
            <div>
              <div
                className={classes.reciCheckoxContainer}
              >
                <div>

                  <Checkbox
                    checked={toggleReci}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onClick={() => {
                      settoggleReci(!toggleReci);
                    }}
                  />
                  <span>
                    {t("smsReport.filterInputText")}
                  </span>
                </div>
                <div>
                  <input
                    type="text"
                    disabled={toggleReci ? false : true}
                    className={
                      toggleReci
                        ? clsx(classes.pulseActive)
                        : clsx(classes.pulseInsert)
                    }
                    onChange={handleReciInput}
                    value={inputRecipients}
                  />
                </div>
              </div>
              <div>
                <span> {t("smsReport.inputTextFilter")}:</span>
                <div>

                  <Paper component="form" className={classes.reciMain}>
                    <IconButton
                      type="submit"
                      className={btnStyle.iconButton}
                      aria-label="search"
                    >
                      <SearchIcon />
                    </IconButton>
                    <InputBase
                      className={classes.inputreci}
                      placeholder={t("smsReport.searchSms")}
                      inputProps={{ "aria-label": "Search" }}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                      }}
                    />
                  </Paper>
                  <div className={classes.reciList}> {filterGroups.map((item, index) => {
                    if (item.selected) {
                      return (
                        <div
                          className={classes.bubbleReciDiv}
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
                  })}</div>
                  <div
                    className={classes.listDivFilter}
                  >
                    {filterGroups
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
                          <div className={classes.searchCon}  onClick={() => {
                            handleSelect(idx);
                          }}>
                            <span
                              style={{ marginInlineEnd: "25px" }}
                              className={item.selected ? classes.greenDoc : classes.blueDoc}
                            >
                              {item.selected ? <FaCheck className={clsx(classes.green)} /> : <HiOutlineUserGroup />}
                            </span>
                            <div
                              className={classes.groupsFilterList}
                             
                            >
                              <span>
                                {item.GroupName}
                              </span>
                              <span>{item.Recipients} Recipients</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className={classes.camapignsDiv}>
                <span>
                  {t("smsReport.campaignInfo")}:
                </span>
                <div>

                  <Paper component="form" className={classes.reciMain}>
                    <IconButton
                      type="submit"
                      className={btnStyle.iconButton}
                      aria-label="search"
                    >
                      <SearchIcon />
                    </IconButton>
                    <InputBase
                      className={classes.inputreci}
                      placeholder={t("smsReport.searchSms")}
                      inputProps={{ "aria-label": "Search" }}
                      onChange={(e) => {
                        setcampaignSearch(e.target.value);
                      }}
                    />
                  </Paper>
                  <div className={classes.reciList}> {totalCampaigns.map((item, index) => {
                    if (item.selected) {
                      return (
                        <div
                          className={classes.bubbleReciDiv}
                        >
                          {item.Name}
                          <span
                            onClick={() => {
                              handleCrossCamp(index);
                            }}
                          >
                            X
                          </span>
                        </div>
                      );
                    }
                  })}</div>
                  <div
                    className={classes.listDivFilter}
                  >
                    {totalCampaigns
                      .filter((val) => {
                        if (campaignSearch == "") {
                          return val;
                        } else if (
                          val.Name.toLowerCase().includes(
                            campaignSearch.toLowerCase()
                          )
                        ) {
                          return val;
                        }
                      })
                      .map((item, idx) => {
                        return (
                          <div className={classes.searchCon}  onClick={() => {
                            handleSelectCamp(idx);
                          }}>
                            <span
                              style={{ marginInlineEnd: "25px" }}
                              className={item.selected ? classes.greenDoc : classes.blueDoc}
                            >
                              {item.selected ? <FaCheck className={clsx(classes.green)} /> : <HiOutlineUserGroup />}
                            </span>
                            <div
                              className={classes.groupsFilterList}
                             
                            >
                              <span>
                                {item.Name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </Dialog>
        ) : null}
      </>
    );
  };
  const renderRight = () => {
    return (
      <div>
        <Grid item md={10} xs={12}>
          <h2
            className={classes.sectionTitle}
            style={{ marginTop: windowSize == "xs" ? "0" : null }}
          >
            {t("notifications.whenToSend")}
          </h2>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="gender"
              name="sendType"
              onChange={handleSendType}
              value={sendType}
            >
              <FormControlLabel
                value="1"
                control={<Radio color="primary" style={{color: sendType !== "1" ? "#d3d3d3" : "#007bff"}}/>}
                label={
                  <span className={classes.radioText}>
                    {t("notifications.immediateSend")}
                  </span>
                }
              />
              <FormHelperText className={classes.helpText}>
                {t("notifications.immediateDescription")}
              </FormHelperText>
              <FormControlLabel
                value="2"
                control={<Radio color="primary" style={{color: sendType !== "2" ? "#d3d3d3" : "#007bff"}}/>}
                label={
                  <span className={classes.radioText}>
                    {t("notifications.futureSend")}
                  </span>
                }
              />
              <Box
                style={{
                  paddingRight: isRTL ? 30 : "",
                  paddingLeft: isRTL ? "" : 30,
                  pointerEvents: sendType == "2" ? "auto" : "none",
                }}
              >
                <DateField
                  minDate={moment()}
                  classes={classes}
                  value={sendDate}
                  onChange={handleDatePicker}
                  placeholder={t("notifications.date")}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  autoOk
                />
              </Box>
              <Box
                style={{
                  marginTop: 10,
                  paddingRight: isRTL ? 30 : "",
                  paddingLeft: isRTL ? "" : 30,
                  pointerEvents: sendType == "2" ? "auto" : "none",
                }}
              >
                <DateField
                  classes={classes}
                  value={sendDate}
                  onTimeChange={handleTimePicker}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  ampm={false}
                  timePickerOpen={timePickerOpen}
                  autoOk
                />
              </Box>
              <FormControlLabel
                value="3"
                control={<Radio color="primary" style={{color: sendType !== "3" ? "#d3d3d3" : "#007bff"}}/>}
                label={
                  <span className={classes.radioText}>
                    {t("mainReport.specialDate")}
                  </span>
                }
              />
              <Box
                style={{
                  marginTop: 10,
                  paddingRight: isRTL ? 30 : "",
                  paddingLeft: isRTL ? "" : 30,
                  pointerEvents: sendType == "3" ? "auto" : "none",
                }}
              >
                <select
                  placeholder="Select"
                  style={{
                    border: "1px solid #818181",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    width: "370px",
                    outline: "none",
                    marginBottom: "10px",
                  }}
                  disabled={ sendType === "3" ? false : true}
                >
                  <option>{t("mainReport.birthday")}</option>
                  <option>Creation Day</option>
                </select>
              </Box>

              <Box
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  width: "370px",
                  paddingRight: isRTL ? 30 : "",
                  paddingLeft: isRTL ? "" : 30,
                  pointerEvents: sendType === "3" ? "auto" : "none",
                }}
              >
                <input
                  type="text"
                  className={classes.inputDays}
                  placeholder="0"
                  disabled={ sendType == "3" ? false : true}
                />

                <span style={{ marginInlineEnd: "8px", marginBottom: "8px" }}>
                  {t("mainReport.days")}
                </span>

                <div style={{ display: "flex", direction: isRTL ? 'ltr' : 'none' }}>
                  <span
                    className={
                      toggleB
                        ? clsx(classes.beforeActive)
                        : clsx(classes.before)
                    }
                    onClick={() => {
                      handlebef();
                    }}
                  >

                    {t("mainReport.before")}
                  </span>
                  <span
                    className={
                      toggleA ? clsx(classes.afterActive) : clsx(classes.after)
                    }
                    onClick={() => {
                      handleaf();
                    }}
                  >
                    {t("mainReport.after")}
                  </span>
                </div>
              </Box>
              <Box
                style={{
                  marginTop: 10,
                  paddingRight: isRTL ? 30 : "",
                  paddingLeft: isRTL ? "" : 30,
                  pointerEvents: sendType == "3" ? "auto" : "none",
                }}
              >
                <DateField
                  classes={classes}
                  value={null}
                  onTimeChange={handleTimePicker}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  ampm={false}
                  timePickerOpen={timePickerOpen}
                  autoOk
                />
              </Box>
            </RadioGroup>
          </FormControl>
        </Grid>

        <div className={classes.pulseDiv}>
          <span
            className={classes.pulse}
            onClick={() => {
              setpulse(true);
            }}
          >
            <FaRegCalendarAlt />
            {t("mainReport.pulseSend")}
          </span>
          <Tooltip
            disableFocusListener
            title="Choose a group and when to send to organize your Pulse Sending."
            classes={{ tooltip: styles.customWidth }}
          >
            <span className={classes.bodyInfo}>i</span>
          </Tooltip>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "#7f7f7f",
            fontWeight: "400",
            fontSize: "14px",
          }}
        >

          {togglePulse ? (
            <span style={{ marginBottom: "5px", marginTop: "5px" }}>
              Packets sending - {inputF} {pulsePer == "" ? pulseReci : pulsePer}
              every {inputS} {hourName == "" ? minName : hourName}
            </span>
          ) : null}
          {toggleRandom ? (
            <span>Random sending - {random} random recipients</span>
          ) : null}
        </div>
      </div>
    );
  };
  const onSummClick = async () => {
    if (sendType === "1") {
      if (selectedGroups.length > 0) {
        let campId = window.location
        let id = campId.search.split("=");
        let finalId = id[1];

        let temp = [];
        let finalGroups = [];
        for (let i = 0; i < selectedGroups.length; i++) {
          temp.push(selectedGroups[i].GroupID);
          finalGroups.push(selectedGroups[i]);
        }
        let time = -1;
        let pulse = -1;
        if (togglePulse) {
          if (minTrue == true) {
            time = 1;
          } else {
            time = 2;
          }

          if (percentTrue == true) {
            pulse = 1;
          } else {
            pulse = 2;
          }
        }

        let exceptionGroups = [];

        for (let i = 0; i < filterGroups.length; i++) {
          if (filterGroups[i].selected) {
            exceptionGroups.push(filterGroups[i].GroupID)
          }
        }


        let exceptionCampaigns = [];
        for (let i = 0; i < totalCampaigns.length; i++) {
          if (totalCampaigns[i].selected) {
            exceptionCampaigns.push(totalCampaigns[i].SMSCampaignID)
          }
        }
        let quickPayload = {
          FutureDateTime: null,
          GroupDetails: finalGroups,
          Groups: temp,
          PulseSettings: {
            PulseType: pulse,
            TimeType: time,
            PulseAmount: inputF,
            TimeInterval: inputS
          },
          RandomSettings: {
            RandomAmount: random
          },
          SendExeptional:
          {
            Groups: exceptionGroups,
            Campaigns: exceptionCampaigns,
            ExceptionalDays: setinputRecipients
          },
          SendTypeID: 1,
          SmsCampaignID: finalId,
          SourceTimeZone: "Asia/Calcutta",
          SpecialSettings: {
            Type: "",
            DateFieldID: -1,
            Day: 0,
            SendHour: "",
            IntervalTypeID: -1,
            SendDate: null
          },
          specialDateOptions: [
            {
              text: "Birthday",
              code: "1"
            },
            {
              text: "Creation Day",
              code: "2"
            },
            {
              text: "",
              code: "3"
            }]

        }
        await dispatch(smsCampSettings(quickPayload));
        let response = await dispatch(getCampaignSumm(finalId));
        setresponseQuick(response);
        setsummModal(true);
      }
    }
    else if (sendType === "2") {
      if (selectedGroups.length > 0) {
        let campId = window.location
        let id = campId.search.split("=");
        let finalId = id[1];

        let temp = [];
        let finalGroups = [];
        for (let i = 0; i < selectedGroups.length; i++) {
          temp.push(selectedGroups[i].GroupID);
          finalGroups.push(selectedGroups[i]);
        }
        let time = -1;
        let pulse = -1;
        if (togglePulse) {
          if (minTrue == true) {
            time = 1;
          } else {
            time = 2;
          }

          if (percentTrue == true) {
            pulse = 1;
          } else {
            pulse = 2;
          }
        }

        let exceptionGroups = [];

        for (let i = 0; i < filterGroups.length; i++) {
          if (filterGroups[i].selected) {
            exceptionGroups.push(filterGroups[i].GroupID)
          }
        }


        let exceptionCampaigns = [];
        for (let i = 0; i < totalCampaigns.length; i++) {
          if (totalCampaigns[i].selected) {
            exceptionCampaigns.push(totalCampaigns[i].SMSCampaignID)
          }
        }
        const finalDate = moment(sendDate, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: finalDate.format("HH"), m: finalDate.format("mm") });
        let displayDate = null;
        displayDate = finalDate.format();

        let quickPayload = {
          FutureDateTime: displayDate,
          GroupDetails: finalGroups,
          Groups: temp,
          PulseSettings: {
            PulseType: pulse,
            TimeType: time,
            PulseAmount: inputF,
            TimeInterval: inputS
          },
          RandomSettings: {
            RandomAmount: random
          },
          SendExeptional:
          {
            Groups: exceptionGroups,
            Campaigns: exceptionCampaigns,
            ExceptionalDays: setinputRecipients
          },
          SendTypeID: 1,
          SmsCampaignID: finalId,
          SourceTimeZone: "Asia/Calcutta",
          SpecialSettings: {
            Type: "",
            DateFieldID: -1,
            Day: 0,
            SendHour: "",
            IntervalTypeID: -1,
            SendDate: null
          },
          specialDateOptions: [
            {
              text: "Birthday",
              code: "1"
            },
            {
              text: "Creation Day",
              code: "2"
            },
            {
              text: "",
              code: "3"
            }]

        }
        await dispatch(smsCampSettings(quickPayload));
        let response = await dispatch(getCampaignSumm(finalId));
        setresponseQuick(response);
        setsummModal(true);
      }

    }
  };
  const renderSummary = () => {
    return (
      <>
        <Summary stepBool={summModal} classes={classes} />
      </>
    );
  };
  const handleTrueCaution = () => {
    setcaution(true);
  };
  const handleCautionCancel = () => {
    setcaution(true);
  };
  const handleChangeId = (id) => {
    if (dropIndex == -1) {
      setdropIndex(id);
    } else {
      setdropIndex(-1);
    }
  };
  const handleSelectFirst = (name, id, idx, e) => {
    // id -  index of select array 
    // idx - header index 
    // if  (headers[idx] !== "adjust title")
    // {
    //   selectArray[id].isdisabled = false;

    //   let h = headers;
    //   h[idx] = name.value;
    //   setheaders(h);

    // }
    // else
    // {

    let h = headers;
    h[idx] = name.value;
    setheaders(h);
    selectArray[id].isdisabled = true;
    selectArray[id].idx = idx;
    console.log("new------>", selectArray)
    // }

  };
  const handleCloseSpan = (id, name) => {
    let h = headers;

    headers[id] = "Adjust Title";
    // h[id] = initialheadstate[id];

    setheaders(h);

    for (let i = 0; i < selectArray.length; i++) {

      if (selectArray[i].value === name) {
        selectArray[i].isdisabled = false;
        selectArray[i].idx = -1;
        break;
      }
    }

  }
  const handleDataManual = async () => {
    console.log("----->", headers);
    console.log(typedData)
    let requestPayload = [];


    if (typedData.length !== 0) {
      for (let j = 0; j < typedData.length; j++) {
        requestPayload.push({});
        for (let k = 0; k < typedData[j].length; k++) {
          if (headers[k] !== "Adjust Title") {
            let key = headers[k];
            let obj = requestPayload[j];
            obj[key] = typedData[j][k];
          }
        }

      }
    }
    else {


      for (let j = 0; j < contacts.length; j++) {
        requestPayload.push({});
        let i = 0;


        for (let k in contacts[j]) {
          console.log("--->before if", headers[i])

          if (headers[i] !== "Adjust Title") {
            console.log("----->printing headers of i th index", headers[i]);
            let key = headers[i];
            let obj = requestPayload[j];
            obj[key] = contacts[j][k];

          }
          i++;
        }


      }

    }

    console.log("request Data", requestPayload)


    let finalPayload = {

      GroupName: newVal,
      Clients: requestPayload

    }

    const r = await dispatch(getManual(finalPayload))
    //  console.log("----->",r)
    let tempres = [];
    let temp = [];
    for (let i = 0; i < groupList.length; i++) {
      tempres.push(groupList[i]);
    }
    for (let i = 0; i < selectedGroups.length; i++) {
      temp.push(selectedGroups[i]);
    }
    temp.push({
      Recipient: r.payload.Recipients,
      GroupName: newVal,
      GroupID: r.payload.GroupID
    });
    tempres.push({
      Recipient: r.payload.Recipients,
      GroupName: newVal,
      GroupID: r.payload.GroupID
    });
    setGroupList(tempres);
    setSelected(temp);
    setmanualTrue(false);
    setareaData("");
    settypedData([]);
    setContacts([]);
    setgroupClick(true);
    setmanualClick(false);
    for (let i = 0; i < selectArray.length; i++) {
      selectArray[i].isdisabled = false;
      selectArray[i].idx = -1;
    }



  }

  const handleManualDialog = (e) => {
    setnewVal(e.target.value);
  }

  const renderDialogManual = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={manualTrue}
          onClose={handleTrueCaution}
          onCancel={handleCautionCancel}
          onConfirm={handleDataManual}
          showDefaultButtons={true}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Column Adjustment</span>
          </div>
          <div className={classes.manualModal}>
            <span style={{ fontSize: "24px", marginInlineEnd: "10px" }}>
              Group Name :
            </span>
            <input
              type="text"
              placeholder="Group Name"
              className={classes.inputManual}
              onChange={handleManualDialog}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span style={{ fontSize: "20px", marginInlineEnd: "10px" }}>
              Total Recipients :
            </span>
            <span
              style={{
                fontSize: "20px",
                marginInlineEnd: "10px",
                fontWeight: "600",
              }}
            >
              10
            </span>
            <Tooltip
              disableFocusListener
              title="Only the cellphone title is mandatory to include, and any column without a title will not be uploaded to our system. For your convenience, only the first 5 recipients in your file will appear here, but all will be uploaded."
              classes={{ tooltip: styles.customWidth }}
            >
              <span className={classes.bodyInfo}>i</span>
            </Tooltip>
          </div>
          <table
            style={{
              borderCollapse: "collapse",
              overflowX: "auto",
              minWidth: "100px",
            }}
          >
            <tr>
              {typedData.length !== 0
                ? typedData[0].map((item, idx) => {
                  return (
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "10px",
                        maxWidth: "280px",
                      }}
                    >
                      <div
                        onClick={() => {
                          handleChangeId(idx);
                        }}
                        className={classes.adjustP}
                        style={{  textAlign: "center",cursor:"pointer" }}
                      >
                        {headers[idx]}

                        <span style={{ marginInlineEnd: "5px", marginInlineStart: "5px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }}>x</span>

                        <span>icn</span>
                        {dropIndex == idx ? (
                          <div className={classes.adjustC}>
                            {selectArray.map((item, id) => {

                              return (
                                <span
                                  className={item.isdisabled ? clsx(classes.grayGroup) : clsx(classes.grouping)}
                                  onClick={() => {
                                    handleSelectFirst(item, id, idx);
                                  }}
                                >
                                  {item.value}
                                </span>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                    </th>
                  );
                })
                : null}
              {contacts.length !== 0 ? headers.map((item, idx) => {

                return (


                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      maxWidth: "280px",
                    }}
                  >
                    <div
                      onClick={() => {
                        handleChangeId(idx);
                      }}
                      className={classes.adjustP}
                      style={{ width: "130px", textAlign: "center" }}
                    >
                      {headers[idx]}
                      <span style={{ marginInlineEnd: "5px", marginInlineStart: "5px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }}>x</span>
                      <span>icn</span>
                      {dropIndex == idx ? (
                        <div className={classes.adjustC}>
                          {selectArray.map((item, id) => {

                            return (
                              <span
                                className={item.isdisabled ? clsx(classes.grayGroup) : clsx(classes.grouping)}
                                onClick={() => {
                                  handleSelectFirst(item, id, idx);
                                }}
                              >
                                {item.value}
                              </span>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  </th>
                )


              }) : null}
            </tr>
            {contacts.length !== 0
              ? contacts.map((item, idx) => {
                // console.log("hello", item);
                if (idx > contacts.length - 11) {
                  return (
                    <tr id={idx}>
                      {Object.values(item).map((temp, idx) => {
                        return (
                          <td
                            id={idx}
                            style={{
                              border: "1px solid #ddd",
                              padding: "10px",
                              maxWidth: "280px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              textAlign: "center",
                            }}
                          >
                            {temp}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              })
              : typedData.map((item, id) => {
                // {console.log("typed data",typedData)}
                return (

                  <tr>
                    {item.map((data, idx) => {
                      return (
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "10px",
                            maxWidth: "280px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "center",
                          }}
                        >
                          {data}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </table>
        </Dialog>
      </>
    );
  };

  const handleClose = () => {
    setdeleteClick(false);
  };
  const handleDelete = () => {
    let a = window.location;

    let b = a.search.split("=");
    let camp = b[1];
    dispatch(deleteSms(camp));
    handleClose();
  };
  const renderDelete = () => {
    return (
      <>
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
            <div className={classes.deleteModalDiv}>
              <span className={classes.groupName}>{t("mainReport.deleteCamp")}</span>
            </div>
            <div className={classes.subDeleteDiv}>
              <span>{t("mainReport.confirmSure")}</span>
            </div>
          </Dialog>
        ) : null}</>
    )

  }
  const handleNewM = () => {
    setcaution(false);
  };
  const handleNewC = () => {
    setcaution(false);
  };
  const handleConfirmC = () => {
    setContacts([]);
    setareaData("");
    for (let i = 0; i < selectArray.length; i++) {
      selectArray[i].isdisabled = false;
      selectArray[i].idx = -1;
    }
    settypedData([]);
    setContacts([]);
    setContacts([]);
    setcaution(false);
    setmanualTrue(false);
  };
  const renderCaution = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={caution}
          onClose={handleNewM}
          onCancel={handleNewC}
          onConfirm={handleConfirmC}
          showDefaultButtons={true}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Notice!</span>
          </div>
          <div>
            <p>
              Are you sure you want to cancel? Clicking "yes" will delete the
              recipients you have entered to the Manual Upload box.
            </p>
          </div>
        </Dialog>
      </>
    );
  };
  return (
    <DefaultScreen currentPage="sms" classes={classes}>
      <div className={classes.smsStepDiv}>
        <div>
          {renderSwitch()}
          {renderHead()}
         
          <Grid container>
            <Grid md={7} xs={12}>
              {renderBody()}
            </Grid>
            <Grid md={1} xs={12}></Grid>
            <Grid md={4} xs={12}>
              {renderRight()}
            </Grid>
          </Grid>
        </div>
       
      </div>
      <div className={classes.creatorButtons}>
         <div className={classes.back}>
           
          <span className={classes.rightInput4}>
          <span style={{marginInlineEnd:"5px"}}>{"<"}</span>
            Back
          </span>
          </div>
          <div  className={classes.rightMostContainer}>
          <span className={classes.rightInput3} onClick={onHandleDelete}>
            <BsTrash style={{ fontSize: "25" }} />         </span>
          <span className={classes.rightInput4}>
            
            {t("mainReport.exitSms")}
          </span>
          <span className={classes.rightInput5}>
            
            {t("mainReport.saveSms")}
          </span>
          <span
            className={classes.rightInput6}
            onClick={onSummClick}
            style={{
              pointerEvents: selectedGroups.length > 0 ? "auto" : "none",
              backgroundColor:
                selectedGroups.length > 0 ? "#dc3545" : "#91C78D",
            }}
          >
            {t("mainReport.summary")}
          </span>
          </div>
        </div>
      
      {renderPulse()}
      {renderReciFilter()}
      {renderSummary()}
      {renderDialogManual()}
      {renderCaution()}
      {renderDelete()}
      <Snackbar
        open={pulseBool || TimeBool || boolRandom}
        autoHideDuration={2000}
        // onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999" }}
      >
        <Alert severity="warning" >
          {t("smsReport.NoPulse")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={pulseBool}
        autoHideDuration={2000}
        // onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "60px" }}
      >
        <Alert severity="error" >
          {t("smsReport.pulseAmount")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={TimeBool}
        autoHideDuration={2000}
        // onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "120px" }}
      >
        <Alert severity="error" >
          {t("smsReport.timeAmount")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={boolRandom}
        autoHideDuration={2000}
        // onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "60px" }}
      >
        <Alert severity="error" >
          {t("smsReport.randomAmt")}
        </Alert>
      </Snackbar>
    </DefaultScreen >
  );
};

export default SmsCreatorStep;
