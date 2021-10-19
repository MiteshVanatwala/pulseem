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
import Toast from '../../../components/Toast/Toast.component';
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { parse } from "papaparse";
import { HiOutlineUserGroup } from "react-icons/hi";
import IconButton from "@material-ui/core/IconButton";
import { Loader } from '../../../components/Loader/Loader';
import Papa from 'papaparse';
import { FaCheck } from 'react-icons/fa';
import CloseIcon from "@material-ui/icons/Close";
import SortIcon from "@material-ui/icons/Sort";
import FilterListIcon from "@material-ui/icons/FilterList";
import { AiOutlineExclamationCircle, AiOutlineClose } from "react-icons/ai";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Notifications/Groups/Groups";
import { useHistory } from "react-router";
import { BsTrash, BsChevronDown, BsChevronUp } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";
import * as XLSX from 'xlsx';
import { DateTimePicker, KeyboardDateTimePicker } from "@material-ui/pickers";
import {
  Typography,
  Button,
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
  TextField
} from "@material-ui/core";
import {
  getGroupsBySubAccountId,
  smsCombinedGroup,
  saveSmsCampSettings,
  deleteSms,
  getCampaignSumm,
  getSmsByID,
  saveManualClients,
  getFinishedCampaigns,
  getCampaignSettings,
  getAccountExtraData,
  sendSms
} from "../../../redux/reducers/smsSlice";
import { BsDot } from "react-icons/bs";
import Summary from "./smsSummary";
import Autocomplete from '@material-ui/lab/Autocomplete';




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
    textAlign: 'center'
  },
  noMaxWidth: {
    maxWidth: "none",
  },
}));

const useSnack = makeStyles((theme) => ({

  customcolor:
  {
    backgroundColor: "#EFF6B2",
    color: "black",
    border: "3px solid #CCCC00",
    width: "250px",
    height: "30px",
    display: "flex",
    justifyContent: "center",
    fontWeight: 900
  }
}));

const useSnackRecipients = makeStyles((theme) => ({

  customcolor:
  {
    backgroundColor: "#AFE1AF",
    color: "black",
    border: "1px solid #AFE1AF",
    width: "250px",
    height: "30px",
    display: "flex",
    justifyContent: "center",
    fontWeight: 900
  }
}));

const useSnackSevere = makeStyles((theme) => ({

  customcolor:
  {
    backgroundColor: "#F6B2B2",
    color: "black",
    border: "3px solid #DC143C",
    width: "200px",
    height: "30px",
    display: "flex",
    justifyContent: "center",
    fontWeight: 900
  }

}));

const useStyleKeyboardInput = makeStyles((theme) => ({

  custom:
  {
    width: "370px",
    padding: "5px",
    height: "40px"
  }

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

const SmsSend = ({ classes, ...props }) => {
  const { t } = useTranslation();
  // document.title = t("sms.pageTitle");
  const styles = useStyles();
  const btnStyle = useStyleNew();
  const tabi = useStyle();
  const snacki = useSnack();
  const history = useHistory();
  const severe = useSnackSevere();
  const keyboardclass = useStyleKeyboardInput();
  const recipientSuccess = useSnackRecipients();
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }
  const dispatch = useDispatch();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const { extraData, getCampaignSum, } =
    useSelector((state) => state.sms);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [selectedGroups, setSelected] = useState([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [sendType, setSendType] = useState("1");
  const [sendDate, handleFromDate] = useState(null);
  const [sendTime, setsendTime] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [boolRandom, setboolRandom] = useState(false);
  const [sendType2Dialog, setsendType2Dialog] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [filterGroups, setfilterGroups] = useState([]);
  const [duplicatedRecipients, setDuplicatedRecipients] = useState(0);
  const [showGroupsList, setShowGroupsList] = useState(false);
  const [inputRecipients, setinputRecipients] = useState("");
  const [toggleChecked, settoggleChecked] = useState(false);
  const [cancel, setcancel] = useState(true);
  const [areaClick, setareaClick] = useState(false);
  const [dropClick, setdropClick] = useState(false);
  const [campaignIdResp, setcampaignIdResp] = useState(-1);
  const [groupNameInput, setgroupNameInput] = useState("");
  const [groupValue, setgroupValue] = useState("");
  const [manualTrue, setmanualTrue] = useState(false);
  const [pulse, setpulse] = useState(false);
  const [afterClick, setafterClick] = useState(false);
  const [exitClick, setexitClick] = useState(false);
  const [exitDialog, setexitDialog] = useState(false);
  const [specialSettingValidation, setspecialSettingValidation] = useState(false);
  const [reciFilter, setreciFilter] = useState(false);
  const [responseQuick, setresponseQuick] = useState(null);
  const [pulseBool, setpulseBool] = useState(false);
  const [TimeBool, setTimeBool] = useState(false);
  const [totalGroupstoDisplay, settotalGroupstoDisplay] = useState(0);
  const [percentTrue, setpercentTrue] = useState(true);
  const [columnsMade, setcolumnsMade] = useState([])
  const [dropIndex, setdropIndex] = useState(-1);
  const [noTrue, setnoTrue] = useState(false);
  const [finalSuccessDialog, setfinalSuccessDialog] = useState(false);
  const [campaignSearch, setcampaignSearch] = useState("");
  const [snackbarRecipients, setsnackbarRecipients] = useState(false);
  const [bsDot, setbsDot] = useState(false);
  // const [smsSettingsModel, setSmsSettingsModel] = useState({
  //   SmsCampaignID: -1,
  //   SendType: 1,
  //   RandomSettings: {
  //     ID: -1,
  //     RandomAmount: 0
  //   },
  //   PulseSettings: {
  //     PulseSettingsID: -1,
  //     PulseType: 1,  //Percentage = 1, Recipients = 2
  //     TimeType: 1, //Minutes = 1, Hours = 2
  //     PulseAmount: 0,
  //     TimeInterval: 0
  //   },
  //   SpecialSettings: {
  //      Day: 0,
  //      DateFields: -1, // Null = -1, Birthday = 1, CreatedDate = 2, ExtraDate1 = 3, ExtraDate2 = 4, ExtraDate3 = 5, ExtraDate4 = 6
  //      SendHour: null,
  //      SendDate: null,
  //      IntervalTypeID: -1
  //   },
  //   SendExeptional: {
  //     ExceptionalID: -1,
  //     ExceptionalDays: 0,
  //     IsExceptionalGroups: false,
  //     IsExceptionSmsCampaigns: false,
  //     Groups: null, // List of groups ids
  //     Campaigns: null, // List of campaign ids
  //   },
  //   Groups: [], // List of groups to send
  //   FutureDateTime: null,
  //   SourceTimeZone: null
  // });

  const [model, setModel] = useState({
    ID: 0
  });
  const [ContactSearch, setContactSearch] = useState("");
  const [togglePulse, settogglePulse] = useState(false);
  const [toggleRandom, settoggleRandom] = useState(false);
  const [summModal, setsummModal] = useState(false);
  const [toggleB, settoggleB] = useState(true);
  const [toggleA, settoggleA] = useState(false);
  const [toggleReci, settoggleReci] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [groupClick, setgroupClick] = useState(true);
  const [SelectedSpecialValue, setSelectedSpecialValue] = useState("")
  const [manualClick, setmanualClick] = useState(false);
  const [highlighted, setHighlighted] = React.useState(false);
  const [contacts, setContacts] = React.useState([]);
  const [daysBeforeAfter, setdaysBeforeAfter] = useState("");
  const [pulseReci, setpulseReci] = useState("");
  const [snackBarPulseBoolean, setsnackBarPulseBoolean] = useState(false);
  const [snackbarTimeBoolean, setsnackbarTimeBoolean] = useState(false);
  const [snackbarMainPulse, setsnackbarMainPulse] = useState(false);
  const [caution, setcaution] = useState(false);
  const [pulsePer, setpulsePer] = useState("percent");
  const [inputF, setinputF] = useState("");
  const [random, setrandom] = useState("");
  const [inputS, setinputS] = useState("");
  const [minTrue, setminTrue] = useState(false);
  const [hoursTrue, sethoursTrue] = useState(true);
  const [estimationDate, setestimationDate] = useState(null);
  const [minName, setminName] = useState("");
  const [hourName, sethourName] = useState("Hours");
  const [SpecialValue, setSpecialValue] = useState("0");
  const [newVal, setnewVal] = useState(false);
  const [RecipientsSnackbar, setRecipientsSnackbar] = useState(false);
  const [areaData, setareaData] = useState("");
  const [RecipientsBool, setRecipientsBool] = useState(false);
  const [editT, seteditT] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [deleteClick, setdeleteClick] = useState(false);
  const [totalCampaigns, settotalCampaigns] = useState([])
  const [typedData, settypedData] = useState([]);
  const [displayFilter, setdisplayFilter] = useState(false);
  const [selectArray, setselectArray] = useState([
    {
      isdisabled: false,
      idx: -1,
      value: t("common.first_name")
    },
    {
      isdisabled: false,
      idx: -1,
      value: t("common.last_name")
    },
    {
      isdisabled: false,
      idx: -1,
      value: t("common.cellphone")
    }
  ]);
  const [dataSaved, setdataSaved] = useState({
    campaignName: "",
    fromNumber: "",
    msg: ""
  })
  const [initialheadstate, setinitialheadstate] = useState([])
  const [recipientsDisplayGroups, setrecipientsDisplayGroups] = useState([]);

  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: "SMS campaign has been saved", showAnimtionCheck: true },
    GROUPCREATEDSUCCESS: { severity: 'success', color: 'success', message: "Group successfully created. ", showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('sms.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('sms.error'), showAnimtionCheck: true },
    OTP: { severity: 'success', color: 'success', message: "OTP verified successfully", showAnimtionCheck: true },
    INVALID_RECIPIENTS: { severity: 'error', color: 'error', message: "No recipients to update", showAnimtionCheck: false },
    NO_GROUPS: { severity: 'error', color: 'error', message: t('smsReport.NoGroups'), showAnimtionCheck: false }
  }
  console.log(extraData);
  const defaultProps = {
    options: selectArray,
    getOptionLabel: (option) => option.value,
  };

  const [headers, setheaders] = useState(initialheadstate);

  const getData = async () => {
    setLoader(true);
    const list = await dispatch(getFinishedCampaigns());
    const tempGroupList = list.payload;
    settotalCampaigns(tempGroupList);
    if (props && props.match.params.id) {
      let r = await dispatch(getCampaignSettings(props.match.params.id))
      const list = await dispatch(getGroupsBySubAccountId());
      console.log("presaved resp", r)
      if (r.payload.Groups !== null) {
        var arr = [];
        for (var i = 0; i < list.payload.length; ++i) {
          for (var j = 0; j < r.payload.Groups.length; ++j) {
            if (list.payload[i].GroupID == r.payload.Groups[j]) {
              arr.push(list.payload[i]);
            }
          }
        }
        setSelected(arr);
      }
      if (r.payload.SendExeptional != null && r.payload.SendExeptional.Groups.length !== 0) {
        let arr1 = [];
        for (var i = 0; i < list.payload.length; ++i) {
          for (var j = 0; j < r.payload.SendExeptional.Groups.length; ++j) {
            if (list.payload[i].GroupID == r.payload.SendExeptional.Groups[j]) {
              arr1.push({ ...list.payload[i], selected: true });
            }
            else {
              arr1.push({ ...list.payload[i], selected: false });
            }
          }
        }
        setfilterGroups(arr1);
      }
      if (r.payload.SendExeptional != null && r.payload.SendExeptional.Campaigns.length !== 0) {
        const camps = await dispatch(getFinishedCampaigns());
        let arr2 = [];
        for (var i = 0; i < camps.payload.length; ++i) {
          for (var j = 0; j < r.payload.SendExeptional.Campaigns.length; ++j) {
            if (camps.payload[i].SMSCampaignID == r.payload.SendExeptional.Campaigns[j]) {
              arr2.push({ ...camps.payload[i], selected: true });
            }
            else {
              arr2.push({ ...camps.payload[i], selected: false });
            }
          }
        }
        settotalCampaigns(arr2);
      }
      if (r.payload.SendExeptional != null && r.payload.SendExeptional.ExceptionalDays !== -1) {
        setinputRecipients(`${r.payload.SendExeptional.ExceptionalDays}`)
        settoggleReci(true);

      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.PulseSettingsID !== -1) {
        settogglePulse(true);
      }

      if (r.payload.RandomSettings != null && r.payload.RandomSettings.RandomAmount !== 0) {
        setrandom(r.payload.RandomSettings.RandomAmount);
        settoggleRandom(true);
      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.PulseAmount !== 0) {
        setinputF(`${r.payload.PulseSettings.PulseAmount}`)
      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.TimeInterval !== 0) {
        setinputS(`${r.payload.PulseSettings.TimeInterval}`)
      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.PulseType === 2) {
        setpercentTrue(false);
        setnoTrue(true);
        setpulsePer("");
        setpulseReci("Recipients");

      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.PulseType === 1) {
        setpulsePer("percent");
        setpercentTrue(true);
        setnoTrue(false);
        setpulseReci("");

      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.TimeType === 1) {
        sethoursTrue(false);
        setminTrue(true);
        setminName("Mins");
        sethourName("");
      }
      if (r.payload.PulseSettings != null && r.payload.PulseSettings.TimeType === 2) {
        sethoursTrue(true);
        setminTrue(false);
        setminName("");
        sethourName("Hours");
      }
      if (r.payload.SendTypeID) {
        setSendType(`${r.payload.SendTypeID}`);
      }
      if (r.payload.FutureDateTime !== null && r.payload.SendTypeID === 2) {
        handleFromDate(moment(r.payload.FutureDateTime));
      }
      if (r.payload.SendTypeID === 3) {
        setdaysBeforeAfter(r.payload.SpecialSettings.Day);
        setsendTime(moment(r.payload.SpecialSettings.SendHour))
        setSpecialValue(`${r.payload.SpecialSettings.DateFieldID}`)
        if (r.payload.SpecialSettings.IntervalTypeID === -1) {
          settoggleB(true);
          settoggleA(false);
          setafterClick(false);
        }
        else {
          settoggleB(false);
          settoggleA(true);
          setafterClick(true);
        }
      }

      setLoader(false)
    }
  };

  useEffect(() => {
    getSubAccountGroups();
    setLoader(true);
    getData();
    setLoader(false);
    getDataExtra();

  }, [dispatch]);
  const getDataExtra = async () => {

    await dispatch(getAccountExtraData());
    setLoader(false);

  };

  useEffect(() => {
    if (props && props.match.params.id) {
      getSavedData();
    }

  }, [])

  // useEffect(() => {
  //   console.log("--> session")

  //   let groupsArr = [];

  //   if(typeof window !== undefined)

  //   {
  //     console.log("--> session if ")
  //     groupsArr =  sessionStorage.getItem("groupFilters");
  //    let final  = JSON.parse(groupsArr)
  //     if(groupsArr)
  //     {
  //       console.log("--> session another if",final)

  //       let tempArr = []
  //       for(let i=0 ; i < filterGroups.length ; i++)
  //       {
  //         for(let j=0 ; j< final.length ; j++)
  //         {
  //          if (filterGroups[i].GroupID === final[j].GroupID) {
  //            if (filterGroups[i].selected) {
  //              tempArr.push({ ...filterGroups[i], selected: false });
  //            } else {
  //              tempArr.push({ ...filterGroups[i], selected: true });
  //            }
  //          } else {
  //            tempArr.push(filterGroups[i]);
  //          }
  //         }
  //       }

  //       setfilterGroups(tempArr);

  //    }
  //   }





  //  }, [reciFilter])


  const getSavedData = async () => {
    if (props && props.match.params.id) {
      let response = await dispatch(getSmsByID(props.match.params.id))
      setLoader(false)
      if (response) {
        setdataSaved({ ...dataSaved, campaignName: response.payload.Name, fromNumber: response.payload.FromNumber, msg: response.payload.Text })


      }
    }
  }
  const getSubAccountGroups = async () => {
    const list = await dispatch(getGroupsBySubAccountId());
    setLoader(false);
    const tempGroupList = list.payload;

    if (tempGroupList) {
      tempGroupList.Id = tempGroupList.GroupID;
    }

    setGroupList(tempGroupList);
    setfilterGroups(tempGroupList);
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
    else if (event.target.value == "3") {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
      setinputS("");
      setinputF("");
      setrandom("");
      settogglePulse(false);
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
    setafterClick(false);
    settoggleA(false);
    settoggleB(true);
  };
  const handleaf = () => {
    setafterClick(true);
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
    // setdateTime(value);
    var date = moment(sendDate);
    var time = moment(value, "HH:mm");
    date.set({
      hour: time.get("hour"),
      minute: time.get("minute"),
    });
    handleFromDate(date);
    setTimePickerOpen(false);
  };

  const handleRadioTime = (value) => {
    setsendTime(value)
  }

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
    settoggleChecked(false);
    setToastMessage(toastMessages.GROUPCREATEDSUCCESS);
  };

  const handleSelect = (id) => {
    let tempArr = [];
    let arr = recipientsDisplayGroups;
    for (let i = 0; i < filterGroups.length; i++) {
      if (id === filterGroups[i].GroupID) {


        if (filterGroups[i].selected) {
          tempArr.push({ ...filterGroups[i], selected: false });
          // arr.push(filterGroups[i]);
        } else {
          tempArr.push({ ...filterGroups[i], selected: true });
        }
      } else {
        tempArr.push(filterGroups[i]);
      }
    }
    // setrecipientsDisplayGroups(arr);
    setfilterGroups(tempArr);
  };
  const handleSelectCamp = (id) => {
    let tempArr = [];
    for (let i = 0; i < totalCampaigns.length; i++) {
      if (id === totalCampaigns[i].SMSCampaignID) {
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

    if (inputF == "" || inputS == "") {
      settogglePulse(false)
    }
    if (random == "") {
      settoggleRandom(false)
    }
    setpulse(false);


  };

  const handlePulseConfirm = () => {

    if (onPulseValidations()) {
      setpulse(false);
    }
  }
  const handleTime = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setinputS(e.target.value);
      setTimeBool(false);
    }

  };
  const handleRandom = (e) => {
    const re = /^[0-9\b]+$/;

    if ((e.target.value === '' || re.test(e.target.value))) {

      if (percentTrue) {
        if (Number(e.target.value) > selectedGroups.reduce(function (a, b) {
          return a + b['Recipients'];
        }, 0)) {
          setrandom(selectedGroups.reduce(function (a, b) {
            return a + b['Recipients'];
          }, 0))
          setboolRandom(false);
        }
        else {
          setrandom(e.target.value);
          setboolRandom(false);
        }
      }
      else {
        if (Number(e.target.value) > inputF) {
          setrandom(inputF)
        }
        else {
          setrandom(e.target.value)
        }
      }
    }
  };
  const handlePulseInput = (e) => {
    const re = /^[0-9\b]+$/;
    if ((e.target.value === '' || re.test(e.target.value))) {
      if (percentTrue) {
        if (Number(e.target.value) > 100) {
          setinputF("100");
        }
        else {
          setinputF(e.target.value);
        }
      }
      else {
        if (Number(e.target.value) > selectedGroups.reduce(function (a, b) {
          return a + b['Recipients'];
        }, 0)) {
          setinputF(selectedGroups.reduce(function (a, b) {
            return a + b['Recipients'];
          }, 0))
        }
        else {
          setinputF(e.target.value);
        }
      }
      setpulseBool(false);
    }
  };

  const onPulseValidations = () => {
    if (togglePulse) {

      if (inputF === "") {
        setpulseBool(true);
        setsnackBarPulseBoolean(true);
        if (inputS === "") {
          setsnackbarTimeBoolean(true);
          setTimeBool(true);
          return false;
        }
      }
      else if (inputS === "") {
        setsnackbarTimeBoolean(true);
        setTimeBool(true);
        if (inputF === "") {
          setpulseBool(true);
          setsnackBarPulseBoolean(true);
          return false;
        }
      }
      else if (toggleRandom) {
        if (random === "") {
          setboolRandom(true);
          setsnackbarMainPulse(true);

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
        setsnackbarMainPulse(true);
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
          //cross
          onClose={handlePulseClose}
          onConfirm={handlePulseConfirm}
          showDefaultButtons={true}
          icon={<MdAutorenew style={{ fontSize: 30, color: "#fff" }}
          />}
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
                        setinputF("");
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
                        setinputF("");
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
                    maxLength="3"
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
                  setrandom("");
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
        </Dialog>
      </>
    );
  };
  const areaChange = (e) => {
    setareaData(e.target.value);

    setareaClick(true);
    setdropClick(false);
  };

  const handleFiles = (e) => {
    e.preventDefault();

    setareaClick(false);
    setdropClick(true);

    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    var p = new Promise((resolve, reject) => {
      try {
        if (file.name.toLowerCase().indexOf("xls") > -1) {
          setLoader(true);

          reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            setTimeout(() => {
              var workbook = XLSX.read(data, { type: "array" });
              var csv = XLSX.utils.sheet_to_csv(
                workbook.Sheets[workbook.SheetNames[0]]
                , { header: 1 });

              let temp = csv;
              let a = temp.split("\n");
              let b = [];
              for (let i = 0; i < a.length; i++) {
                b.push(a[i].split(","));
              }
              b.pop();
              settypedData(b);

              setareaData(b);
              let dummyArr = [];
              for (let i = 0; i < b[0].length; i++) {
                dummyArr.push(t("sms.adjustTitle"));
              }
              setinitialheadstate(dummyArr);
              setheaders(dummyArr)

              setLoader(false);
              if (dummyArr !== 0) {
                setmanualTrue(true);
              }

            }, 0);
          };
          reader.readAsArrayBuffer(file, "utf-8")
        }

        else if (file.name.toLowerCase().indexOf("csv") > -1) {

          const maxLinesPerFile = 1000000;
          setLoader(true);
          reader.onload = function () {
            var config = {
              delimiter: "", // auto-detect
              newline: "", // auto-detect
              quoteChar: "",
              escapeChar: "",
              header: false,
              trimHeader: false,
              dynamicTyping: true,
              preview: 0,
              encoding: "utf-8",
              worker: true,
              comments: false,
              step: undefined,
              complete: undefined,
              error: undefined,
              download: false,
              skipEmptyLines: true,
              chunk: function (c) {
                var final = c["data"]
                  .filter(function (el) {
                    return (
                      typeof el != "object" ||
                      Array.isArray(el) ||
                      Object.keys(el).length > 0
                    );
                  })
                  .map((finalResult) => {
                    const fr = [...finalResult];
                    let fixedItem = [];
                    fr.forEach((item) => {
                      if (
                        item &&
                        String(item).startsWith("5") &&
                        String(item).length == 9
                      ) {
                        item = "0" + item;
                      }
                      if (item && String(item).indexOf("9.72") > -1) {
                        item = parseFloat(item);
                      }
                      fixedItem.push(String(item).trim());
                    });
                    return fixedItem;
                  });
                var conf = {
                  quotes: false,
                  quoteChar: '"',
                  escapeChar: '"',
                  delimiter: ",",
                  newline: "\r\n",
                  skipEmptyLines: true,
                  columns: null,
                  worker: true,
                };
                const csvResults = Papa.unparse(final, conf);
                resolve(csvResults)
              },
              fastMode: true,
              beforeFirstChunk: undefined,
              withCredentials: undefined,
            };
            const lines = reader.result.split("\n");

            console.log("--parse if")
            Papa.parse(reader.result, {
              config,
              complete: results => {
                setContacts(results.data)
                console.log("---->csv", results.data)
                const resultCsv = results.data;
                setmanualTrue(true);
                let ddc = [];
                for (let i in resultCsv[0]) {
                  ddc.push(t("sms.adjustTitle"))
                }
                setheaders(ddc);
              },

            });

            setareaData(reader.result.substring(0, 1500));
            setLoader(false);
          };
          reader.readAsText(file, "ISO-8859-8");
        }
        else {
          return false;
        }

      }
      catch (error) {
        reject(error);
      }
    });



  }


  const renderBody = () => {
    return (
      <div>
        <div className={classes.infoDiv}>
          <span className={classes.conInfo}>{t("mainReport.whomTosend")}</span>
          <Tooltip
            disableFocusListener
            title={t("smsReport.whomtoSendTip")}
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
              title={t("smsReport.manualTip")}
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
              placeholder={t("sms.dragXlOrCsv")}
              spellcheck="false"
              autoComplete="off"

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
                handleFiles(e)

              }}
            />
          </div>
        ) : null}
        <Box>
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
              bsDot={bsDot}
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
                    placeholder={t("smsReport.groupName")}
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
                <span>{t("mainReport.totalReci")}:  {selectedGroups.reduce(function (a, b) {
                  return a + b['Recipients'];
                }, 0).toLocaleString()}</span>
                <Tooltip
                  disableFocusListener
                  title={t("smsReport.finalReciTip")}
                  classes={{ tooltip: styles.customWidth }}
                  style={{ marginInlineStart: "5px" }}
                >
                  <span className={classes.bodyInfo}>i</span>
                </Tooltip>
              </div>
            ) : null}
          </div>
          {manualClick == true ? (
            <div className={classes.manualChild} style={{ justifyContent: areaData === "" ? "flex-end" : "space-between" }}>
              {areaData !== "" ? (
                <div>
                  <span
                    className={classes.addManualDiv}
                    onClick={() => {
                      handlePasted();
                    }}
                  >
                    {t("sms.editFields")}
                  </span>
                  <span
                    className={classes.clearDiv}
                    onClick={() => {
                      setareaData("");
                      setContacts([]);
                      settypedData([])
                    }}
                  >
                    {t("sms.clearList")}
                  </span>
                </div>
              ) : null}
              <span>{t("sms.totalRecords")}:  {contacts.length !== 0 ? contacts.length : typedData.length}</span>
            </div>
          ) : null}
        </Box>
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

    let temparr = [];
    let tempCampaigns = [];
    for (let i = 0; i < filterGroups.length; i++) {
      if (filterGroups[i].selected) {
        temparr.push(filterGroups[i]);
      }
    }
    for (let i = 0; i < totalCampaigns.length; i++) {
      if (totalCampaigns[i].selected) {
        tempCampaigns.push(totalCampaigns[i]);
      }
    }

    if (toggleReci) {
      if (validationCheck()) {

        if (temparr.length !== 0 || inputRecipients !== "" || tempCampaigns.length !== 0) {
          setbsDot(true);
          setsnackbarRecipients(true);
          setdisplayFilter(true);
          setreciFilter(false);
        }
        else {
          setbsDot(false);
          setreciFilter(false);
          setdisplayFilter(false);
        }
      }
    }
    else {
      if (temparr.length !== 0 || inputRecipients !== "" || tempCampaigns.length !== 0) {
        setsnackbarRecipients(true);
        setreciFilter(false);
        setbsDot(true);
      }
      else {
        setreciFilter(false);
        setbsDot(false);
      }

    }
    // sessionStorage.setItem("groupFilters", JSON.stringify(temparr));
  };
  const handlePasted = () => {
    let temp = areaData;
    let a = temp.split("\n");
    let b = [];
    if (temp.indexOf("\t") > -1) {
      console.log("in if tab")
      for (let i = 0; i < a.length; i++) {
        b.push(a[i].split("\t"));
      }
    }
    else {
      console.log("in if ,")
      for (let i = 0; i < a.length; i++) {
        b.push(a[i].split(","));
      }
    }


    settypedData(b);

    let dummyArr = [];
    for (let i = 0; i < b[0].length; i++) {
      dummyArr.push(t("sms.adjustTitle"));
    }
    setinitialheadstate(dummyArr);
    setheaders(dummyArr)

    seteditT(true);
    setmanualTrue(true);
  };
  const handleReciInput = (e) => {

    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setinputRecipients(e.target.value);
      setRecipientsBool(false);
    }

  }
  const validationCheck = () => {
    if (inputRecipients === "") {
      setRecipientsBool(true);
      setRecipientsSnackbar(true);
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
            confirmText={t("common.Ok")}
            cancelText={t("smsReport.cancelBtn")}
            showDefaultButtons={true}
            icon={<MdAutorenew style={{ fontSize: 30, color: "#fff" }} />}
          >
            <div className={classes.reciFilterDiv}>
              <span className={classes.groupName}>{t("mainReport.recipientFilter")}</span>
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
                      setinputRecipients("");
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
                        ? RecipientsBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.success)
                        : clsx(classes.pulseInsert)
                    }
                    onChange={(e) => { handleReciInput(e) }}
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
                          <div className={classes.searchCon} onClick={() => {
                            handleSelect(item.GroupID);
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
                              <span className={classes.ellipsisText}>
                                {item.GroupName}
                              </span>
                              <span>{item.Recipients.toLocaleString()} {item.Recipients === 1 ? t("sms.recipient") : t("sms.recipients")}</span>
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
                          <div className={classes.searchCon} onClick={() => {
                            handleSelectCamp(item.SMSCampaignID);
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
  const handleSpecialDayChange = (e) => {
    const re = /^[0-9\b]+$/;
    if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
      setdaysBeforeAfter(e.target.value);
    }

  }
  const handleSelectChange = (e) => {
    if (e.target.value === "0") {
      setSpecialValue("0");
    }
    else {
      setSpecialValue(e.target.value)
      {
        Object.keys(extraData).map((item, i) => {
          if (e.target.value == i + 3) {
            setSelectedSpecialValue(item)
          }
          else if (e.target.value == 1) {
            setSelectedSpecialValue("Birthday")
          }
          else if (e.target.value == 2) {
            setSelectedSpecialValue("Creation day")
          }
        })
      }
    }




  }
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
                control={<Radio color="primary" className={sendType !== "1" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
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
                control={<Radio color="primary" className={sendType !== "2" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
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
                  value={sendType == "2" ? sendDate : null}
                  onChange={handleDatePicker}
                  placeholder={t("notifications.date")}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),

                  }}
                  dateActive={sendType == "2" ? false : true}
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
                  value={sendType == "2" ? sendDate : null}
                  onTimeChange={handleTimePicker}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  ampm={false}
                  timeActive={sendType == "2" ? false : true}
                  timePickerOpen={timePickerOpen}
                  autoOk
                />
              </Box>
              <FormControlLabel
                value="3"
                control={<Radio color="primary" className={sendType !== "3" ? classes.radioButtonDisabled : classes.radioButtonActive} />}
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
                    width: "377px",
                    outline: "none",
                    marginBottom: "10px",
                  }}
                  disabled={sendType === "3" ? false : true}
                  onChange={(e) => { handleSelectChange(e) }}
                  value={sendType === "3" ? SpecialValue : "0"}
                >
                  <option value="0" >Select</option>
                  <option value="1">{t("mainReport.birthday")}</option>
                  <option value="2">Creation Day</option>
                  {Object.keys(extraData).map((item, i) => {
                    return item.toLowerCase().indexOf('extradate') > -1 && <option value={i + 3} key={`extrakey_${i}`}>{Object.values(extraData[item])}</option>;
                  })}
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
                  disabled={sendType == "3" ? false : true}
                  value={sendType == "3" ? daysBeforeAfter : ""}
                  onChange={(e) => { handleSpecialDayChange(e) }}
                  maxLength="3"
                />

                <span style={{ marginInlineEnd: "8px", marginBottom: "8px" }}>
                  {t("mainReport.days")}
                </span>

                {isRTL ?
                  <div style={{ display: "flex" }}>
                    <span
                      className={
                        sendType == "3" ? toggleB ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                      }
                      onClick={() => {
                        handlebef();
                      }}
                    >
                      {t("mainReport.before")}
                    </span>
                    <span
                      className={
                        sendType == "3" ? toggleA ? classes.beforeActive : classes.before : classes.disabledBefore
                      }
                      onClick={() => {
                        handleaf();
                      }}
                    >
                      {t("mainReport.after")}
                    </span>

                  </div> : <div style={{ display: "flex" }}>
                    <span
                      className={
                        sendType == "3" ? toggleB ? classes.beforeActive : classes.before : classes.disabledBefore
                      }
                      onClick={() => {
                        handlebef();
                      }}
                    >
                      {t("mainReport.before")}
                    </span>
                    <span
                      className={
                        sendType == "3" ? toggleA ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                      }
                      onClick={() => {
                        handleaf();
                      }}
                    >
                      {t("mainReport.after")}
                    </span>
                  </div>}
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
                  value={sendType == "3" ? sendTime : null}

                  onTimeChange={handleRadioTime}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  ampm={false}
                  timePickerOpen={timePickerOpen}
                  timeActive={sendType == "3" ? false : true}
                  disabled={sendType == "3" ? false : true}
                  autoOk
                />
              </Box>
            </RadioGroup>
          </FormControl>
        </Grid>

        <div className={classes.pulseDiv}>
          <span
            className={(selectedGroups.length >= 1 && sendType !== "3") ? classes.pulse : classes.pulseDisable}
            onClick={() => {
              setpulse(true);
            }}
          >
            <FaRegCalendarAlt />
            {t("mainReport.pulseSend")}
          </span>
          <Tooltip
            disableFocusListener
            title={t("smsReport.pulseSendTip")}
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
              {t("smsReport.packetSend")} - {inputF} {pulsePer == "" ? t("sms.recipients") : t("common.Percent")} {" "}
              {t("sms.every")} {inputS} {hourName == "" ? t("common.minutes") : t("common.hours")}
            </span>
          ) : null}
          {toggleRandom ? (
            <span>{t("smsReport.randomSend")} - {random} {t("smsReport.randomRecipients")}</span>
          ) : null}
        </div>
      </div>
    );
  };
  const onSummClick = async (toggle, exit) => {

    if (sendType === "1") {
      if (selectedGroups.length > 0) {

        let FinalId = props.match.params.id


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
        let specialgroups = [{
          text: "Birthday",
          code: 1
        },
        {
          text: "Creation Day",
          code: 2
        }];
        {
          Object.keys(extraData).map((item, i) => {
            specialgroups.push({
              text: item,
              code: i + 3
            })
          })
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
            ExceptionalDays: inputRecipients
          },
          SendTypeID: 1,
          SmsCampaignID: FinalId,
          SourceTimeZone: "Asia/Calcutta",
          SpecialSettings: {
            Type: "",
            DateFieldID: -1,
            Day: 0,
            SendHour: "",
            IntervalTypeID: -1,
            SendDate: null
          },
          specialDateOptions: specialgroups
        }
        setLoader(true);
        await dispatch(saveSmsCampSettings(quickPayload));
        setLoader(false);
        if (toggle && exit !== "exit") {
          setToastMessage(toastMessages.SUCCESS);
        }
        else if (toggle && exit == "exit") {
          history.push("/SMSCampaigns");
        }
        else {
          setLoader(true);
          let response = await dispatch(getCampaignSumm(FinalId));
          setLoader(false);
          setresponseQuick(response);
          setsummModal(true);
          let date = moment();
          let addTime = 0;

          if (percentTrue == false) {

            addTime =
              ((response.payload.FinalCount -
                inputF) *
                inputS) /
              inputF;
            let final = moment(date).add(addTime, hoursTrue ? "h" : "m").format("DD/MM/YYYY - HH:mm");
            setestimationDate(final);
          }

          else {

            let recipientPercents =
              (response.payload.FinalCount *
                inputF) /
              100;
            addTime =
              ((response.payload.FinalCount - recipientPercents.toFixed(1)) *
                inputS) /
              recipientPercents.toFixed(1);
            let final = moment(date).add(addTime, hoursTrue ? "h" : "m").format("DD/MM/YYYY - HH:mm");
            setestimationDate(final);
          }
        }
      }
      else {
        setToastMessage(toastMessages.NO_GROUPS)
      }

    }
    else if (sendType === "2") {
      if (selectedGroups.length > 0) {

        if (sendDate == null) {
          setsendType2Dialog(true);
        }
        else {
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
          let specialgroups = [{
            text: "Birthday",
            code: 1
          },
          {
            text: "Creation Day",
            code: 2
          }];
          {
            Object.keys(extraData).map((item, i) => {
              specialgroups.push({
                text: item,
                code: i + 3
              })
            })
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
              ExceptionalDays: inputRecipients
            },
            SendTypeID: 2,
            SmsCampaignID: props.match.params.id,
            SourceTimeZone: "Asia/Calcutta",
            SpecialSettings: {
              Type: "",
              DateFieldID: -1,
              Day: 0,
              SendHour: "",
              IntervalTypeID: -1,
              SendDate: null
            },
            specialDateOptions: specialgroups

          }
          setLoader(true);
          await dispatch(saveSmsCampSettings(quickPayload));
          setLoader(false);
          if (toggle && exit !== "exit") {
            setToastMessage(toastMessages.SUCCESS);
          }
          else if (toggle && exit == "exit") {
            history.push("/SMSCampaigns");
          }
          else {
            setLoader(true);
            let response = await dispatch(getCampaignSumm(props.match.params.id));
            setLoader(false);
            setresponseQuick(response);
            let date = sendDate;
            let addTime = 0;

            if (percentTrue == false) {

              addTime =
                ((response.payload.FinalCount -
                  inputF) *
                  inputS) /
                inputF;
              let final = moment(date).add(addTime, hoursTrue ? "h" : "m").format("DD/MM/YYYY - HH:mm");
              setestimationDate(final);
            }

            else {

              let recipientPercents =
                (response.payload.FinalCount *
                  inputF) /
                100;
              addTime =
                ((response.payload.FinalCount - recipientPercents.toFixed(1)) *
                  inputS) /
                recipientPercents.toFixed(1);
              let final = moment(date).add(addTime, hoursTrue ? "h" : "m").format("DD/MM/YYYY - HH:mm");
              setestimationDate(final);
            }
            setsummModal(true);
          }
        }



      }
      else {
        setToastMessage(toastMessages.NO_GROUPS)
      }

    }
    else if (sendType === "3") {
      if (selectedGroups.length > 0) {

        if (sendTime == null || daysBeforeAfter == "" || SpecialValue == "0") {
          setspecialSettingValidation(true);
        }
        else {
          let FinalId = props.match.params.id


          let temp = [];
          let finalGroups = [];
          let specialgroups = [{
            text: "Birthday",
            code: 1
          },
          {
            text: "Creation Day",
            code: 2
          }];
          for (let i = 0; i < selectedGroups.length; i++) {
            temp.push(selectedGroups[i].GroupID);
            finalGroups.push(selectedGroups[i]);
          }


          {
            Object.keys(extraData).map((item, i) => {
              specialgroups.push({
                text: item,
                code: i + 3
              })
            })
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
          let beforeAfter = 0;
          if (afterClick) {
            beforeAfter = 1
          }
          else {
            beforeAfter = -1
          }

          let quickPayload = {
            FutureDateTime: null,
            GroupDetails: finalGroups,
            Groups: temp,
            PulseSettings: {
              PulseType: -1,
              TimeType: -1,
              PulseAmount: -1,
              TimeInterval: -1
            },
            RandomSettings: {
              RandomAmount: 0
            },
            SendExeptional:
            {
              Groups: exceptionGroups,
              Campaigns: exceptionCampaigns,
              ExceptionalDays: inputRecipients
            },
            SendTypeID: 3,
            SmsCampaignID: FinalId,
            SourceTimeZone: "Asia/Calcutta",
            SpecialSettings: {
              Type: SpecialValue,
              DateFieldID: SpecialValue,
              Day: daysBeforeAfter,
              SendHour: sendTime.format('H:mm'),
              IntervalTypeID: beforeAfter,
            },
            specialDateOptions: specialgroups
            ,


          }
          setLoader(true);
          await dispatch(saveSmsCampSettings(quickPayload));
          setLoader(false);
          if (toggle && exit !== "exit") {
            setToastMessage(toastMessages.SUCCESS);
          }
          else if (toggle && exit == "exit") {
            history.push("/SMSCampaigns");
          }
          else {
            setLoader(true);
            let response = await dispatch(getCampaignSumm(FinalId));
            setLoader(false);

            setresponseQuick(response);
            setsummModal(true);
          }
        }


      }
      else {
        setToastMessage(toastMessages.NO_GROUPS)
      }

    }
  };
  const handleSummary = () => {
    setsummModal(false);
  }
  const renderSummary = () => {
    return (
      <>
        <Summary
          stepBool={summModal}
          classes={classes}
          campaignName={dataSaved.campaignName}
          fromNumber={dataSaved.fromNumber}
          textMsg={dataSaved.msg}
          activeGroups={selectedGroups}
          summaryPayload={getCampaignSum}
          api={onApiCall} sendType={sendType}
          days={daysBeforeAfter}
          after={afterClick}
          time={sendTime}
          handleCallback={handleSummary}
          specialVal={SelectedSpecialValue}
          sendDateTime={sendDate}
          pulseTrue={togglePulse}
          pulseInput1={inputF}
          pulseInput2={inputS}
          pulsePer={pulsePer}
          pulseReci={pulseReci}
          hourName={hourName}
          minName={minName}
          toggleRandom={toggleRandom}
          random={random}
          estimationDate={estimationDate}
          displayGroups={filterGroups}
          displayCampaigns={totalCampaigns}
        // displayFilter={displayFilter}

        />
      </>
    );
  };
  const onApiCall = async () => {
    let payload = {
      "SmsCampaignID": props.match.params.id,
      "SubAccountID": "7322",
      "AccountID": "7322",
      "Credits": "1",
      "TotalRecipients": selectedGroups.length
    }
    setLoader(true);
    let r = await dispatch(sendSms(payload))
    setLoader(false);

    setsummModal(false);
    setfinalSuccessDialog(true)
  };
  const handleTrueCaution = () => {
    if (dropClick === true) {
      setcaution(true);
      setgroupNameInput("");
      setnewVal(false);
    }
    else if (areaClick === true) {
      setmanualTrue(false);
      setgroupNameInput("");
      setnewVal(false);
    }

  };
  const handleCautionCancel = () => {
    if (dropClick === true) {
      setcaution(true);
      setgroupNameInput("");
      setnewVal(false);
    }
    else if (areaClick === true) {
      setmanualTrue(false);
      setgroupNameInput("");
      setnewVal(false);
    }
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
    let h = headers;
    h[idx] = name.value;
    selectArray.forEach((value, index) => {
      if (value.idx === idx) {
        selectArray[index].isdisabled = false
        selectArray[index].idx = -1
      }
    })
    selectArray[id].isdisabled = true;
    selectArray[id].idx = idx;
    setheaders(h);
  };
  const handleCloseSpan = (id, name) => {
    let h = headers;

    headers[id] = t("sms.adjustTitle");
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
    if (manualUploadValidationscheck()) {
      let requestPayload = [];

      if (typedData.length !== 0) {
        for (let j = 0; j < typedData.length; j++) {
          requestPayload.push({});
          for (let k = 0; k < typedData[j].length; k++) {
            if (headers[k] !== t("sms.adjustTitle")) {
              let key = headers[k].toLocaleString().replaceAll(" ", "");
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
            if (headers[i] !== t("sms.adjustTitle")) {
              let key = headers[i].toLocaleString().replaceAll(" ", "");
              let obj = requestPayload[j];
              obj[key] = contacts[j][k];

            }

            i++;
          }
        }
      }

      let finalPayload = {
        GroupName: groupNameInput,
        Clients: requestPayload
      }
      setLoader(true);
      const r = await dispatch(saveManualClients(finalPayload))
      setmanualTrue(false);
      setLoader(false);


      if (r.payload.Reason == "no_recipients_to_update") {
        setToastMessage(toastMessages.INVALID_RECIPIENTS)
        setmanualTrue(false);
        setareaData("");
        settypedData([]);
        setContacts([]);
        setgroupNameInput("");
        setnewVal(false);
      }
      else {
        let tempres = [];
        let temp = [];
        for (let i = 0; i < groupList.length; i++) {
          tempres.push(groupList[i]);
        }
        for (let i = 0; i < selectedGroups.length; i++) {
          temp.push(selectedGroups[i]);
        }

        temp.push({
          Recipients: r.payload.Recipients,
          GroupName: groupNameInput,
          GroupID: r.payload.GroupID
        });

        tempres.push({
          Recipients: r.payload.Recipients,
          GroupName: groupNameInput,
          GroupID: r.payload.GroupID
        });
        setGroupList(tempres);
        setSelected(temp);
        setmanualTrue(false);
        setareaData("");
        settypedData([]);
        setContacts([]);
        setgroupClick(true);
        setgroupNameInput("");
        setnewVal(false);
        setmanualClick(false);
      }
      for (let i = 0; i < selectArray.length; i++) {
        selectArray[i].isdisabled = false;
        selectArray[i].idx = -1;
      }
    }

  }

  const handleManualDialog = (e) => {

    setgroupNameInput(e.target.value);
    setnewVal(false);
  }

  const manualUploadValidationscheck = () => {
    let temp = []
    for (let i = 0; i < groupList.length; i++) {
      temp.push(groupList[i].GroupName)
    }


    if (groupNameInput === "" || temp.includes(groupNameInput)) {
      setnewVal(true);
      return false;
    }
    let columnHasValue = false;
    headers.forEach((value) => {
      if (value !== t("sms.adjustTitle")) {
        columnHasValue = true
      }
    })
    return columnHasValue === false ? false : true;
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
          confirmText={t("smsReport.okBtn")}
          cancelText={t("smsReport.cancelBtn")}
          showDefaultButtons={true}
        >
          <div style={{ height: "60px", borderBottom: "1px solid black" }}>
            <span className={classes.groupName}>{t("sms.columnAdjustment")}</span>
          </div>
          <div className={classes.manualModal}>
            <span style={{ fontSize: "24px", marginInlineEnd: "10px" }}>
              {t("common.GroupName")}:
            </span>
            <div style={{ display: "flex", flexDirection: "column", width: "75%" }}>
              <input
                type="text"
                placeholder={t("common.GroupName")}
                className={newVal ? clsx(classes.inputManual, classes.error) : clsx(classes.inputManual, classes.success)}
                onChange={handleManualDialog}
                value={groupNameInput}
              />
              {newVal ? <span style={{ marginTop: "8px", color: "red", fontSize: "12px" }}>{t("sms.groupNameExists").replace("#groupName#", groupNameInput)}</span> : null}
            </div>


          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span style={{ fontSize: "20px", marginInlineEnd: "10px" }}>
              {t("sms.totalRecipients")}:
            </span>
            <span
              style={{
                fontSize: "20px",
                marginInlineEnd: "10px",
                fontWeight: "600",
              }}
            >
              {contacts.length !== 0 ? contacts.length : typedData.length}
            </span>
            <Tooltip
              disableFocusListener
              title={t("smsReport.manualTotalTooltip")}
              classes={{ tooltip: styles.customWidth }}
            >
              <span className={classes.bodyInfo}>i</span>
            </Tooltip>
          </div>
          <div style={{ minHeight: "200px", maxWidth: "700px", overflow: "auto" }}>
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
                          width: "160px",
                          maxWidth: "280px",
                        }}
                      >
                        <div
                          onClick={() => {
                            handleChangeId(idx);
                          }}
                          className={classes.adjustP}
                          style={{ textAlign: "center", cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }}>{headers[idx]}</Typography>

                            {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose style={{ marginInlineEnd: "8px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }} /> : null}
                            {dropIndex == idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}  </div>
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
                        width: "180px",
                      }}
                    >
                      <div
                        onClick={() => {
                          handleChangeId(idx);
                        }}
                        className={classes.adjustP}
                        style={{ width: "150px", textAlign: "center" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }}>{headers[idx]}</Typography>
                          {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose onClick={() => { handleCloseSpan(idx, headers[idx]) }} style={{ marginInlineEnd: "8px" }} /> : null}
                          {dropIndex == idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />} </div>
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

                  if (idx > contacts.length - 6) {
                    return (
                      <tr id={idx}>
                        {item.map((temp, idx) => {
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
                  if (id > typedData.length - 6) {
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
                                minWidth: "150px"
                              }}
                            >
                              {data}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }
                })}
            </table>
          </div>
        </Dialog>
      </>
    );
  };

  const handleClose = () => {
    setdeleteClick(false);
  };
  const handleDelete = () => {
    if (props && props.match.params.id) {

      dispatch(deleteSms(props.match.params.id));

      handleClose();
      history.push("/SMSCampaigns");
    }
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
            confirmText={t("smsReport.confirmBtn")}
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

  const renderSuccessDialog = () => {
    return (
      <>
        <Dialog
          classes={classes}
          open={finalSuccessDialog}
          // onClose={handleNewM}
          renderButtons={false}
          showDefaultButtons={false}
          exit={true}


          showDefaultButtons={false}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <img src={Gif} style={{ width: "150px", height: "150px" }} />

            <span style={{ marginTop: "10px", fontSize: "22px", fontWeight: "700" }}>Sent!</span>


            <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
              Your camapign is on its way
            </p>


            <span style={{ padding: "12px", backgroundColor: "green", marginTop: "10px", cursor: "pointer", color: "#ffffff", borderRadius: "10px" }} onClick={() => { history.push("/SMSCampaigns") }}>Confirm</span>
          </div>

        </Dialog>
      </>
    )
  }

  const handlePreviousPage = () => {
    window.location = `/sms/edit/${props.match.params.id}`;
  }
  const renderHtml = (html) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }
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
            <span className={classes.groupName}>{t("common.Notice")}</span>
          </div>
          <div>
            <p>
              {renderHtml(t("sms.reset_manual_upload_notice"))}
            </p>
          </div>
        </Dialog>
      </>
    );
  };
  const renderExit = () => {
    return (
      <>

        <Dialog
          classes={classes}
          open={exitDialog}
          onClose={() => { setexitDialog(false); history.push("/SMSCampaigns"); }}
          onConfirm={() => { onSummClick(true, "exit") }}
          onCancel={() => { setexitDialog(false) }}
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

      </>
    );
  };
  const renderSendType2validation = () => {
    return (<>
      <Dialog
        classes={classes}
        open={sendType2Dialog}
        onClose={() => { setsendType2Dialog(false) }}
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

            <li>Must select Sending Type - Required field</li>

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
              setsendType2Dialog(false);
            }}
            className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
          >
            {t("mainReport.confirmSms")}
          </Button>
        </div>
      </Dialog></>)
  }

  const renderSpecialModal = () => {
    return (<>
      <Dialog
        classes={classes}
        open={specialSettingValidation}
        onClose={() => { setspecialSettingValidation(false) }}
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
            {SpecialValue == "0" ? <li>Must select Special Date Type</li> : null}
            {daysBeforeAfter == "" ? <li>Must insert Number of Days</li> : null}
            {sendTime == null ? <li>Must select Sending Time</li> : null}

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
              setspecialSettingValidation(false);
            }}
            className={clsx(classes.dialogButton, classes.dialogConfirmButton)}
          >
            {t("mainReport.confirmSms")}
          </Button>
        </div>
      </Dialog></>)
  }
  const handleMainWarningPulse = () => {
    if (snackbarTimeBoolean == false || snackBarPulseBoolean == false) {
      return false;
    }
    else if (snackbarMainPulse == false) {
      return false;
    }
  }
  const WizardButtons = () => {
    return (
      <div className={classes.creatorButtons}>
        <div className={classes.back} onClick={() => { handlePreviousPage() }}>
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
            onClick={() => { handlePreviousPage() }}>
            <span style={{ marginInlineEnd: "5px" }}>{"<"}</span>
            {t("smsReport.back")}
          </Button>
        </div>
        <div className={classes.rightMostContainer}>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonRed
            )}
            style={{ margin: '8px', padding: '9px 0' }}
            onClick={onHandleDelete}
          >
            <BsTrash style={{ fontSize: "25" }} />
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
            onClick={() => { setexitDialog(true) }}>
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
              onSummClick(true);
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
            style={{
              margin: '8px',
              pointerEvents: selectedGroups.length > 0 ? "auto" : "none",
              backgroundColor:
                selectedGroups.length > 0 ? "#5cb85c" : "#91C78D"
            }}
            onClick={() => {
              onSummClick(false)
            }}>
            {t("mainReport.summary")}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <DefaultScreen currentPage="sms" classes={classes}>
      {renderToast()}
      <div className={classes.smsStepDiv}>

        <div>
          {renderSwitch()}
          {renderHead()}

          <Grid container style={{ marginBottom: "40px" }}>
            <Grid item md={7} xs={12}>
              {renderBody()}
            </Grid>
            <Grid item md={1} xs={12}></Grid>
            <Grid item md={4} xs={12}>
              {renderRight()}
            </Grid>
          </Grid>
        </div>
        <WizardButtons />
      </div>
      {renderPulse()}
      {renderReciFilter()}
      {renderSummary()}
      {renderDialogManual()}
      {renderCaution()}
      {renderDelete()}
      {renderExit()}
      {renderSuccessDialog()}
      {renderSpecialModal()}
      {renderSendType2validation()}
      <Snackbar
        open={snackbarTimeBoolean || snackBarPulseBoolean || snackbarMainPulse}
        autoHideDuration={5000}
        onClose={() => { handleMainWarningPulse() }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999" }}
      >
        <Alert severity="warning" className={snacki.customcolor}>
          {t("smsReport.NoPulse")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackBarPulseBoolean}
        autoHideDuration={3000}
        onClose={() => { setsnackBarPulseBoolean(false) }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "60px" }}
      >
        <Alert severity="error" className={severe.customcolor}>
          {t("smsReport.pulseAmount")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarTimeBoolean}
        autoHideDuration={3000}
        onClose={() => { setsnackbarTimeBoolean(false) }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "120px" }}
      >
        <Alert severity="error" className={severe.customcolor}>
          {t("smsReport.timeAmount")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarMainPulse}
        autoHideDuration={3000}
        onClose={() => { setsnackbarMainPulse(false) }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        style={{ zIndex: "9999", marginTop: "60px" }}
      >
        <Alert severity="error" className={severe.customcolor}>
          Enter Random Amount
        </Alert>
      </Snackbar>

      <Snackbar
        open={RecipientsSnackbar}
        autoHideDuration={2000}
        onClose={() => { setRecipientsSnackbar(false); }}
        style={{ zIndex: "9999", marginTop: "30px", fontWeight: 900, fontSize: 16 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert severity="warning" className={snacki.customcolor}>
          Please Add No of Days
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbarRecipients}
        autoHideDuration={2000}
        onClose={() => { setsnackbarRecipients(false); }}
        style={{ zIndex: "9999", marginTop: "30px", fontWeight: 900, fontSize: 16 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert severity="success" className={recipientSuccess.customcolor}>
          {t("sms.filtersSave")}
        </Alert>
      </Snackbar>
      <Loader isOpen={showLoader} />
    </DefaultScreen >
  );
};

export default SmsSend;
