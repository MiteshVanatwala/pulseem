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
import { HiOutlineUserGroup } from "react-icons/hi";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SortIcon from "@material-ui/icons/Sort";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Notifications/Groups/Groups";
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
  smsCampSettings
} from "../../../redux/reducers/smsSlice";
import { AiOutlineDelete } from "react-icons/ai";
import Summary   from "./smsSummary";
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
  const [showDetails, setDetailsVisibility] = useState(false);
  const [notificationHover, setHovered] = useState(false);
  const [showGallery, setGalleryState] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [isIcon, setIsIcon] = useState(false);
  const [totalRecipients, setTotalRecipients] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isGalleryConfirmed, setIsFileSelected] = useState(false);
  const [campaignSent, setCampaignSent] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
  const [showGroupsList, setShowGroupsList] = useState(false);
  const [toggleChecked, settoggleChecked] = useState(false);
  const [groupValue, setgroupValue] = useState("");
  const [pulse, setpulse] = useState(false);
  const [reciFilter, setreciFilter] = useState(false);
  const [percentTrue, setpercentTrue] = useState(true);
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
    console.log("hiiiiiiii", event.target.value);
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
        <Tooltip
          disableFocusListener
          title="Create New SMS Campaign"
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

  const handleCombined = () => {
    let temp = [];
    for (let i = 0; i < selectedGroups.length; i++) {
      temp.push(selectedGroups[i].GroupID);
    }
    let payload = {
      SubAccountID: 1,
      GroupName: groupValue,
      GroupIds: temp,
    };
    dispatch(smsCombinedGroup(payload));
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
                  />

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      className={
                        togglePulse 
                          ? percentTrue ? clsx(classes.percentTrue) :  clsx(classes.percentActive) 
                          : clsx(classes.percent)
                      }
                      onClick={() => {
                        setpercentTrue(true);
                        setnoTrue(false);
                      }}
                    >
                      Percent
                    </span>
                    <span
                      className={
                        togglePulse
                          ? noTrue  ? clsx(classes.reciTrue) : clsx(classes.reciActive)
                          : clsx(classes.reci)
                      }
                      onClick={() => {
                        setpercentTrue(false);
                        setnoTrue(true);
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
                  />

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      className={
                        togglePulse
                          ? clsx(classes.percentActive)
                          : clsx(classes.percent)
                      }
                    >
                      Hours
                    </span>
                    <span
                      className={
                        togglePulse
                          ? clsx(classes.reciActive)
                          : clsx(classes.reci)
                      }
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
            >
              Confirm
            </Button>
          </div>
        </Dialog>
      </>
    );
  };
  const renderBody = () => {
    return (
      <div style={{ width: "700px" }}>
        <div className={classes.tabDiv}>
          <div className={clsx(classes.tab1, classes.activeTab)}>
            <span>{t("mainReport.groups")}</span>
          </div>
          <div className={clsx(classes.tab1)}>
            <span style={{ marginInlineEnd: "7px" }}>
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
          {/* <div className={classes.areaManual}>
            <textarea
              placeholder="Drag &amp; drop an XLS/CSV file or copy and paste the details directly into this box. You may also enter manually, by adding a comma between values: FirstName, LastName, Cellphone. You are able to enter hundreds of thousands of recipients to this box"
              spellcheck="false"
              autocomplete="off"
              className={classes.areaCon}
            />
          </div> */}
        </div>
        <div>
          <Groups
            classes={classes}
            groupList={groupList}
            selectedList={selectedGroups}
            callbackSelectedGroups={callbackSelectedGroups}
            callbackUpdateGroups={callbackUpdateGroups}
            callbackSelectAll={callbackSelectAll}
            callbackReciFilter={callbackFilter}
            bool = {true}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
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
            {/* <span>Total Records : 0</span> */}
          </div>
        </div>
      </div>
    );
  };
  const handleReciClose = () => {
    setreciFilter(false);
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
            >
              <FormControlLabel
                value="1"
                control={<Radio color="primary" />}
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
                control={<Radio color="primary" />}
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
                control={<Radio color="primary" />}
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
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",color: '#7f7f7f',
    fontWeight: '400',fontSize: '14px'}}>  <span style={{marginBottom:"5px",marginTop
    :"5px"}}>Packets sending - 1 Recipients every 3 Min</span>
        <span>Random sending - 5 random recipients</span>
</div>
      

        <div className={classes.buttonDiv}>
          <span className={classes.rightInput3}>
            <AiOutlineDelete style={{ fontSize: "25" }} />
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
  const onSummClick = () =>
  {
    if(selectedGroups.length > 0)
    {
      let payload = 
      {
        "SmsCampaignID": 1,
        "SendTypeID": 1,
        "RandomSettings": {
          "ID": 1,
          "RandomAmount": 2
        },
        "PulseSettings": {
          "PulseSettingsID": 1,
          "PulseType": 1,
          "TimeType": 1,
          "PulseAmount": 2,
          "TimeInterval": 3
        },
        "SpecialSettings": {
          "Day": 1,
          "DateFieldID": 1,
          "SendHour": "2021-08-18T10:57:10.7256675+03:00",
          "SendDate": "2021-08-18T10:57:10.7256675+03:00",
          "IntervalTypeID": 2
        },
        "SendExeptional": {
          "ExceptionalID": 1,
          "ExceptionalDays": 2,
          "IsExceptionalGroups": true,
          "IsExceptionSmsCampaigns": true,
          "Groups": [
            1,
            2
          ],
          "Campaigns": [
            1,
            2
          ]
        },
        "Groups": [
          1,
          2
        ],
        "FutureDateTime": "2021-08-18T10:57:10.7266686+03:00",
        "SourceTimeZone": "sample string 2"
      }
          dispatch(smsCampSettings(payload))
          setsummModal(true);
    }
  

  }
  const renderSummary = () =>
  {
    return(
      <>
      <Summary  stepBool={summModal ? true : false} classes={classes}/></>
    )
  }
  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      <div style={{ display: "grid", gridTemplateColumns: "65% auto" }}>
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
    </DefaultScreen>
  );
};

export default SmsCreatorStep;
