import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import moment from "moment";
import { MdAutorenew } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";

import PropTypes from "prop-types";
import { DateField, Dialog } from "../../../components/managment/index";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";

import { parse } from "papaparse";
import { HiOutlineUserGroup } from "react-icons/hi";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SortIcon from "@material-ui/icons/Sort";
import FilterListIcon from "@material-ui/icons/FilterList";
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
  getPreviousCampaignData,
  getPreviousLandingData,
  getAccountExtraData,
  getAccountId,
  smsCombinedGroup,
  smsCampSettings,
  getCampaignSumm,
  getManual,
} from "../../../redux/reducers/smsSlice";
import { AiOutlineDelete } from "react-icons/ai";
import Summary from "./smsSummary";

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
    width: 400,
  },
  input: {
    //   marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  // divider: {
  //   height: 28,
  //   margin: 4,
  // },
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
  const styles = useStyles();
  const btnStyle = useStyleNew();
  const tabi = useStyle();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const { previousLandingData, previousCampaignData, extraData, accountId } =
    useSelector((state) => state.sms);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [selectedGroups, setSelected] = useState([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [sendType, setSendType] = useState("1"); // Immediate
  const [sendDate, handleFromDate] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
  const [showGroupsList, setShowGroupsList] = useState(false);
  const [toggleChecked, settoggleChecked] = useState(false);
  const [groupValue, setgroupValue] = useState("");
  const [manualTrue, setmanualTrue] = useState(false);
  const [pulse, setpulse] = useState(false);
  const [reciFilter, setreciFilter] = useState(false);
  const [percentTrue, setpercentTrue] = useState(true);
  const [dropIndex, setdropIndex] = useState(-1);
  const [noTrue, setnoTrue] = useState(false);
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
  const [newVal, setnewVal] = useState("")
  const [areaData, setareaData] = useState("");
  const [editT, seteditT] = useState(false);
  const [areatyped, setareatyped] = useState("");
  const [blank, setblank] = useState([  'first Name', 'Last Name' , 'Cell Phone']);
  const [typedData, settypedData] = useState([]);
  const [selectArray, setselectArray] = useState([
   {
    isdisabled: false, 
    idx : -1,
    value: "first name"
   },
   {
    isdisabled: false,
    idx : -1,
    value: "last name"
   },
   {
    isdisabled: false, 
    idx : -1,
    value: "cell phone"
   }
 
  ]);
  const [Unique, setUnique] = useState(-1);
const [initialheadstate, setinitialheadstate] = useState([])

  
  
  const [headers, setheaders] = useState(initialheadstate);

 
  useEffect(() => {
    getAccount();
  }, [dispatch]);

  const getAccount = async () => {
    const list = await dispatch(getAccountId());
    const tempGroupList = list.payload;
    if (tempGroupList) {
      tempGroupList.Id = tempGroupList.GroupID;
    }
    setGroupList(tempGroupList);
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
          {" "}
          {t("mainReport.sendSetting")}
        </span>
      </div>
    );
  };
  const callbackFilter = () => {
    setreciFilter(true);
  };
  const renderContent = () => {
    return (
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
    );
  };
  const handleDatePicker = (value) => {
    handleFromDate(value);
    setTimePickerOpen(!timePickerOpen);
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

  const inputGroup = (e) => {
    setgroupValue(e.target.value);
  };
  const handlePulseClose = () => {
    setpulse(false);
  };

  const handleTime = (e) => {
    setinputS(e.target.value);
  };
  const handleRandom = (e) => {
    setrandom(e.target.value);
  };
  const handlePulseInput = (e) => {
    setinputF(e.target.value);
  };

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
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>Pulse Sending</span>
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              {" "}
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
              <span>Packets Sending</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #efefef",
                paddingBottom: "15px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  Number of Recipients per Sending
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Insert"
                    disabled={togglePulse ? false : true}
                    className={
                      togglePulse
                        ? clsx(classes.pulseActive)
                        : clsx(classes.pulseInsert)
                    }
                    value={inputF}
                    onChange={handlePulseInput}
                  />

                  <div style={{ display: "flex", alignItems: "center" }}>
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
                      Percent
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
                      Recipients
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  Time between sending
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Insert"
                    disabled={togglePulse ? false : true}
                    className={
                      togglePulse
                        ? clsx(classes.pulseActive)
                        : clsx(classes.pulseInsert)
                    }
                    onChange={handleTime}
                    value={inputS}
                  />

                  <div style={{ display: "flex", alignItems: "center" }}>
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
                      Hours
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
                      Mins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              {" "}
              <Checkbox
                checked={toggleRandom}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onClick={() => {
                  settoggleRandom(!toggleRandom);
                }}
              />
              <span>Random Sending</span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                Number of random recipients{" "}
              </span>

              <input
                type="text"
                placeholder="Insert"
                disabled={toggleRandom ? false : true}
                className={
                  toggleRandom
                    ? clsx(classes.pulseActive)
                    : clsx(classes.pulseInsert)
                }
                onChange={handleRandom}
                value={random}
              />
            </div>
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
              className={clsx(
                classes.dialogButton,
                classes.dialogConfirmButton
              )}
              onClick={handlePulseClose}
            >
              Confirm
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
      <div style={{ width: "700px" }}>
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
                      let ddc =[];
                      for(let i in result.data[0])
                      {
                           console.log("----->",i)
                           ddc.push("Adjust Title")
                      }
                      setheaders(ddc);
                    });
                }}
              />
            </div>
          ) : null}
        </div>
        <div>
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
                  {" "}
                  <Checkbox
                    disabled={selectedGroups.length >= 2 ? false : true}
                    checked={toggleChecked}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onClick={() => {
                      settoggleChecked(!toggleChecked);
                    }}
                  />
                  <span>{t("mainReport.createNewGroup")}</span>
                  <span>New!</span>
                  <Tooltip
                    disableFocusListener
                    title="Choose 2 or more groups and combine into one new one"
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
                    Save
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
                <span>{t("mainReport.totalReci")}: 0</span>
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
                    style={{
                      padding: "8px",
                      backgroundColor: "#51AA51",
                      color: "#fff",
                      marginInlineEnd: "6px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      handlePasted();
                    }}
                  >
                    {" "}
                    Edit fields and save
                  </span>
                  <span
                    style={{
                      padding: "8px",
                      color: "#277BFF",
                      marginInlineEnd: "6px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid #277BFF",
                    }}
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
  const handleReciClose = () => {
    setreciFilter(false);
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
    for(let i = 0 ; i<b[0].length; i++)
  {
    dummyArr.push("Adjust Title");
  }
  setinitialheadstate(dummyArr);
  setheaders(dummyArr)

    seteditT(true);
    setmanualTrue(true);
  };
  const renderReciFilter = () => {
    return (
      <>
        {" "}
        {reciFilter ? (
          <Dialog
            classes={classes}
            open={true}
            onClose={handleReciClose}
            showDefaultButtons={true}
            icon={<MdAutorenew style={{ fontSize: 30, color: "#fff" }} />}
          >
            <div style={{ height: "60px", borderBottom: "1px solid black" }}>
              <span className={classes.groupName}>Recipients Filter</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginTop: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "cneter",
                }}
              >
                <div>
                  {" "}
                  <Checkbox
                    checked={toggleReci}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onClick={() => {
                      settoggleReci(!toggleReci);
                    }}
                  />
                  <span>
                    Don't send to recipients that got SMS in last previous days
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
                  />
                </div>
              </div>
              <div>
                <span>Don't send to recipients from the following groups:</span>
                <div>
                  {" "}
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
                      placeholder="Search"
                      inputProps={{ "aria-label": "Search" }}
                    />
                  </Paper>
                  <div className={classes.reciList}>No Groups Selected</div>
                  <div
                    className={classes.listDiv}
                    style={{
                      borderBottom: "1px solid #efefef",
                      borderLeft: "1px solid #efefef",
                      borderRight: "1px solid #efefef",
                      marginTop: "0",
                    }}
                  >
                    {selectedGroups
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
                          <div className={classes.searchCon}>
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
                              <span>19 Recipients</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <span>
                  Don't send to recipients from the following campaigns::
                </span>
                <div>
                  {" "}
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
                      placeholder="Search"
                      inputProps={{ "aria-label": "Search" }}
                    />
                  </Paper>
                  <div className={classes.reciList}>No Campaign's Selected</div>
                  <div
                    className={classes.listDiv}
                    style={{
                      borderBottom: "1px solid #efefef",
                      borderLeft: "1px solid #efefef",
                      borderRight: "1px solid #efefef",
                      marginTop: "0",
                    }}
                  >
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
                          <div className={classes.searchCon}>
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
                              <span>19 Recipients</span>
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
      <div style={{ marginTop: "35%" }}>
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
                control={<Radio color="primary" style={{color:"#007bff"}}/>}
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
                control={<Radio color="primary" style={{color:"#007bff"}}/>}
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
                control={<Radio color="primary" style={{color:"#007bff"}}/>}
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
                  pointerEvents: sendType == "3" ? "auto" : "none",
                }}
              >
                <input
                  type="text"
                  className={classes.inputDays}
                  placeholder="0"
                />

                <span style={{ marginInlineEnd: "8px", marginBottom: "8px" }}>
                  {t("mainReport.days")}
                </span>

                <div style={{ display: "flex" }}>
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
                    {" "}
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
          {" "}
          {togglePulse ? (
            <span style={{ marginBottom: "5px", marginTop: "5px" }}>
              Packets sending - {inputF} {pulsePer == "" ? pulseReci : pulsePer}{" "}
              every {inputS} {hourName == "" ? minName : hourName}
            </span>
          ) : null}
          {toggleRandom ? (
            <span>Random sending - {random} random recipients</span>
          ) : null}
        </div>

        <div className={classes.buttonDiv}>
          <span className={classes.rightInput3}>
          <BsTrash style={{ fontSize: "25" }} />
          </span>
          <span className={classes.rightInput4}>
            {" "}
            {t("mainReport.editSms")}{" "}
          </span>
          <span className={classes.rightInput5}>
            {" "}
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
    );
  };
  const onSummClick = async () => {
    if(sendType === "1")
    {
      if(selectedGroups.length > 0)
      {
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
        Groups: [], 
        Campaigns: [], 
        ExceptionalDays: ""
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
      await dispatch(getCampaignSumm(finalId));
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
  const handleSelectFirst = (name,id,idx,e) => {
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
  console.log("new------>",selectArray)
 // }

  };
 const handleCloseSpan = (id,name) =>
 {
  let h = headers;
  
  headers[id] ="Adjust Title";
  // h[id] = initialheadstate[id];

  setheaders(h);

  for(let i=0 ; i < selectArray.length ; i++)
  {

    if(selectArray[i].value === name)
    {
      selectArray[i].isdisabled = false;
      selectArray[i].idx = -1;
      break;
    }
  }
  
 }
const handleDataManual = async () =>
{
  console.log("----->",headers);
  console.log(typedData)
  let requestPayload = [];


  if(typedData.length !==0)
  {
    for(let j= 0 ; j < typedData.length ; j++)
    {
       requestPayload.push({});
      for(let k= 0 ; k<typedData[j].length ; k++)
      {
         if(headers[k]!=="Adjust Title")
         {
          let key = headers[k];
          let  obj = requestPayload[j];
         obj[key] = typedData[j][k];
         }
      }

    }
  }
  else
  {
   
    
    for(let j= 0 ; j < contacts.length ; j++)
    {
       requestPayload.push({});
       let i= 0 ;
    
      
        for(let k in contacts[j])
        {
          console.log("--->before if",headers[i])
        
           if(headers[i]!=="Adjust Title")
           {
            console.log("----->printing headers of i th index",headers[i]);
            let key = headers[i];
            let  obj = requestPayload[j];
            obj[key] = contacts[j][k];
            
      }
      i++;
       }
      

    }

  }

  console.log("request Data",requestPayload)


    let finalPayload = {

      GroupName: newVal,
      Clients : requestPayload

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
      Recipient : r.payload.Recipients,
      GroupName : newVal,
      GroupID : r.payload.GroupID
     });
     tempres.push({
      Recipient : r.payload.Recipients,
      GroupName : newVal,
      GroupID : r.payload.GroupID
     });
     setGroupList(tempres);
     setSelected(temp);
     setmanualTrue(false);
     setareaData("");
     settypedData([]);
     setContacts([]);
     setgroupClick(true);
     setmanualClick(false);
     for(let i = 0 ; i < selectArray.length;i++){
       selectArray[i].isdisabled = false;
       selectArray[i].idx = -1;
     }


  
}

const handleManualDialog = (e) =>
{
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
              Group Name :{" "}
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
                          style={{ width: "130px", textAlign: "center" }}
                        >
                      {headers[idx]} 

                       <span style={{marginInlineEnd:"5px",marginInlineStart:"5px"}} onClick={() => {handleCloseSpan(idx,headers[idx])}}>x</span>

                          <span>icn</span>
                          {dropIndex == idx ? (
                            <div className={classes.adjustC}>
                              {selectArray.map((item,id) => 
                              {
                              
                                return(
                                  <span
                                  className={item.isdisabled  ?  clsx(classes.grayGroup) :   clsx(classes.grouping)}
                                  onClick={() => {
                                    handleSelectFirst(item,id,idx);
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
              {contacts.length !==0 ? headers.map((item,idx) => 
               {
              
                 return(
                
                    
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
                       <span style={{marginInlineEnd:"5px",marginInlineStart:"5px"}} onClick={() => {handleCloseSpan(idx,headers[idx])}}>x</span>
                      <span>icn</span>
                      {dropIndex == idx ? (
                            <div className={classes.adjustC}>
                              {selectArray.map((item,id) => 
                              {
                              
                                return(
                                  <span
                                  className={item.isdisabled  ?  clsx(classes.grayGroup) :   clsx(classes.grouping)}
                                  onClick={() => {
                                    handleSelectFirst(item,id,idx);
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
  const handleNewM = () => {
    setcaution(false);
  };
  const handleNewC = () => {
    setcaution(false);
  };
  const handleConfirmC = () => {
    setContacts([]);
    setareaData("");
    for(let i = 0 ; i < selectArray.length;i++){
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
    <DefaultScreen currentPage="reports" classes={classes}>
      <div  className={classes.smsStepDiv}>
        <div>
          {renderSwitch()}
          {renderHead()}
          {renderContent()}
          {renderBody()}
          <div className={classes.backBtn}>
            <span style={{ marginInlineEnd: "4px" }}>{"<"}</span>
            <span>Back</span>
          </div>
        </div>
        <div>{renderRight()}</div>
      </div>
      {renderPulse()}
      {renderReciFilter()}
      {renderSummary()}
      {renderDialogManual()}
      {renderCaution()}
    </DefaultScreen>
  );
};

export default SmsCreatorStep;
