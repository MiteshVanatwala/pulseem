import React, { useState, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  Typography,
  Button,
  Grid,
  Box,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  FormHelperText,
  Divider,
  TextField,
  MenuItem
} from "@material-ui/core";
import Select from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { findPlanByFeatureCode } from "../../../redux/reducers/TiersSlice";
import moment from "moment";
import { FaRegCalendarAlt, FaFilter } from "react-icons/fa";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { DateField } from "../../../components/managment/index";
import Toast from '../../../components/Toast/Toast.component';
import { Loader } from '../../../components/Loader/Loader';
import Papa from 'papaparse';
import { AiOutlineExclamationCircle, AiOutlineClose } from "react-icons/ai";
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Groups/GroupsHandler/Groups";
import { useParams } from 'react-router-dom';
import { BsTrash, BsChevronDown, BsChevronUp, BsInfoCircle } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";
import * as XLSX from 'xlsx';
import {
  sendSms, deleteSms, getSmsByID, IsOTPPassed, getCampaignSumm, saveManualClients,
  getAccountExtraData, saveSmsCampSettings, getCampaignSettings, getFinishedCampaigns, getTestGroups
} from "../../../redux/reducers/smsSlice";
import { getGroupsBySubAccountId, combinedGroup, createAndGetGroupIdForManualSend, addRecipient } from "../../../redux/reducers/groupSlice";
import Summary from "./smsSummary";
import clsx from "clsx";
import OTP from './OTP';
import { FaExclamationCircle } from 'react-icons/fa'
import { logout } from '../../../helpers/Api/PulseemReactAPI'
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import useRedirect from "../../../helpers/Routes/Redirect";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import { sitePrefix } from '../../../config';
import { Title } from "../../../components/managment/Title";
import { Stack } from "@mui/material";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import QuickManualUploadDialog from "../../Newsletter/Wizard/Popups/QuickManualUploadDialog";
import { IsValidPhone } from "../../../helpers/Utils/Validations";
import { WhiteLabelObject } from "../../../components/WhiteLabel/WhiteLabelMigrate";
import Pulse from "../../../components/Pulse/Pulse";
import TierPlans from "../../../components/TierPlans/TierPlans";
import { DateFormats, TierFeatures } from "../../../helpers/Constants";
import { get } from "lodash";
import { Close } from "@material-ui/icons";

function Alert(props) {
  return <MuiAlert elevation={0} variant='filled' {...props} />;
}

const SmsSend = ({ classes, ...props }) => {
  //#region initialized states
  const { id } = useParams();
  const { t } = useTranslation();
  const Redirect = useRedirect();
  const { OTPPassed, ToastMessages, extraData, getCampaignSum, testGroups, finishedCampaigns } = useSelector((state) => state.sms);
  const { subAccountAllGroups } = useSelector((state) => state.group);
  const { accountSettings, subAccount } = useSelector((state) => state.common);
  const { currentPlan, availablePlans } = useSelector((state) => state.tiers);

  const dispatch = useDispatch();
  const { windowSize, isRTL, userRoles } = useSelector(
    (state) => state.core
  );
  const [selectedGroups, setSelected] = useState([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [sendType, setSendType] = useState("1");
  const [sendDate, handleFromDate] = useState(null);
  const [sendTime, setsendTime] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [sendType2Dialog, setsendType2Dialog] = useState(false);
  const [showTestGroups, setShowTestGroups] = useState(false);
  const [totalRecords, settotalRecords] = useState(0);
  const [exceptionalDays, setExceptionalDays] = useState("");
  const [toggleChecked, settoggleChecked] = useState(false);
  const [dropClick, setdropClick] = useState(false);
  const [groupNameInput, setgroupNameInput] = useState("");
  const [groupValue, setgroupValue] = useState("");
  const [columnValidate, setcolumnValidate] = useState(false);
  const [afterClick, setafterClick] = useState(false);
  const [specialSettingValidation, setspecialSettingValidation] = useState(false);
  const [dropIndex, setdropIndex] = useState(-1);
  const [bsDot, setbsDot] = useState(false);
  const [model, setModel] = useState({ ID: 0 });
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
  const [pulsePer, setpulsePer] = useState("recipients");
  const [pulseAmount, setPulseAmount] = useState("");
  const [timeInterval, setTimeInterval] = useState("");
  const [random, setrandom] = useState("");
  const [estimationDate, setestimationDate] = useState(null);
  const [minName, setminName] = useState("mins");
  const [hourName, sethourName] = useState("Hours");
  const [spectialDateFieldID, setDateFieldID] = useState("0");
  const [groupTextError, setGroupTextError] = useState(false);
  const [RecipientsSnackbar, setRecipientsSnackbar] = useState(false);
  const [areaData, setareaData] = useState("");
  const [RecipientsBool, setRecipientsBool] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [typedData, settypedData] = useState([]);
  const [selectArray, setselectArray] = useState([]);
  const [dataSaved, setdataSaved] = useState({
    campaignName: "",
    fromNumber: "",
    msg: "",
    CreditPerSms: 0
  })
  const [initialheadstate, setinitialheadstate] = useState([]);
  const [dialogType, setDialogType] = useState({ type: null });
  const [timeType, setTimeType] = useState(1);
  const [pulseType, setPulseType] = useState(2);
  const [otpPassed, setOtpPassed] = useState(false);
  const [groupNameExist, setGroupNameExist] = useState(false);
  const [otpOpen, setOTPOpen] = useState(null);
  const [GroupNameValidationMessage, setGroupNameValidationMessage] = useState("");
  const [sourcePulses, setSourcePulses] = useState({});
  const [campaignSettings, setCampaignSettings] = useState(null);
  const [TierMessageCode, setTierMessageCode] = useState('');
  const [showTierPlans, setShowTierPlans] = useState(false);
  const [filterValues, setFilterValues] = useState({
    dontSend: false,
    days: ''
  });
  const [filterDialogValues, setFilterDialogValues] = useState({
    dontSend: false,
    days: '',
    exceptionalDays: '',
    selectedFilterCampaigns: [],
    selectedFilterGroups: []
  });
  const [headers, setheaders] = useState(initialheadstate);
  const [pulsesOpen, setPulsesOpen] = useState(false);

  //#endregion
  useEffect(() => {
    if (!showLoader) {
      setselectArray([
        {
          isdisabled: false,
          idx: -1,
          value: "FirstName",
          label: t("common.first_name")
        },
        {
          isdisabled: false,
          idx: -1,
          value: "LastName",
          label: t("common.last_name")
        },
        {
          isdisabled: false,
          idx: -1,
          value: "CellPhone",
          label: t("common.cellphone")
        }
      ]);
    }
  }, [showLoader, t]);


  const handleSendResult = async (smsSendResult) => {
    switch (smsSendResult) {
      case -2: {// ALREADY_SENT
        setToastMessage(ToastMessages.SENT_ALREADY)
        break;
      }
      case -1: {// ERROR
        setToastMessage(ToastMessages.QUICK_SEND_ERROR)
        break;
      }
      case 0:   // SUCCESS
      case 5: { // ACCEPTED
        setDialogType({ type: "sendSuccess" });
        break;
      }
      case 1: {// PROVISION
        setToastMessage(ToastMessages.PROVISION)
        break;
      }
      case 2: {// NO_CREDITS
        setDialogType({ type: "noCredit" });
        //setToastMessage(ToastMessages.NO_CREDITS)
        break;
      }
      case 3: {// INVALID_NUMBER
        setToastMessage(ToastMessages.INVALID_NUMBER)
        break;
      }
      case 4: {// OTP_NEEDED
        setOTPOpen(true);
        break;
      }
      case 8: {
        setDialogType({ type: "englishLetterDialog" });
        break;
      }
      case 550:
      case 551:
        setDialogType({ type: "pendingApprovalDialog", data: smsSendResult });
        break;
      case 927: {
        // SMS_BASIC, SMS_CLICK_TRACKING
        setDialogType({ type: "tier" });
        break;
      }
      default: {
        break;
      }
    }
  }

  const isOtpPassed = async () => {
    if (dataSaved.fromNumber !== null && dataSaved.fromNumber !== '') {
      await dispatch(IsOTPPassed(dataSaved.fromNumber));
    }
  }

  const getSelectedCampaigns = () => {
    const selectedCampaigns = [];
    const seCampaigns = campaignSettings.SendExeptional.Campaigns;
    for (var h = 0; h < seCampaigns.length; h++) {
      const idx = h;
      const c = finishedCampaigns.filter((c) => { return c.SMSCampaignID === seCampaigns[idx] });
      selectedCampaigns.push(c[0]);
    }

    return selectedCampaigns;
  }

  const getSelectedGroups = () => {
    const relationGroups = [];
    const seGroups = campaignSettings.SendExeptional.Groups;
    for (var j = 0; j < seGroups.length; j++) {
      const idx = j;
      const g = subAccountAllGroups.filter((c) => { return c.GroupID === seGroups[idx] });
      relationGroups.push(g[0]);
    }

    return relationGroups;
  }

  useEffect(() => {
    const initCampaignSettings = () => {
      const filteredValues = {
        dontSend: false,
        days: '',
        exceptionalDays: '',
        selectedFilterCampaigns: [],
        selectedFilterGroups: []
      };

      if (campaignSettings.PulseSettings) {
        setTimeType(campaignSettings.PulseSettings.TimeType);
        setPulseType(campaignSettings.PulseSettings.PulseType);
        setPulseAmount(`${campaignSettings.PulseSettings.PulseAmount}`)
        setTimeInterval(`${campaignSettings.PulseSettings.TimeInterval}`)
      }

      if (campaignSettings.Groups !== null) {
        const selectedGroupsForSend = [];
        const seGroups = campaignSettings.Groups;
        for (var i = 0; i < seGroups.length; i++) {
          const idx = i;
          const g = subAccountAllGroups.filter((c) => { return c.GroupID === seGroups[idx] });
          const tg = testGroups.filter((c) => { return c.GroupID === seGroups[idx] });
          if (g.length > 0) {
            selectedGroupsForSend.push(g[0]);
          }
          if (tg.length > 0) {
            selectedGroupsForSend.push(tg[0]);
          }
        }
        setSelected(selectedGroupsForSend);
      }
      if (campaignSettings.SendExeptional != null && campaignSettings.SendExeptional.Groups.length !== 0) {
        setbsDot(true);
        const relationGroups = getSelectedGroups();
        filteredValues.selectedFilterGroups = relationGroups;
      }
      if (campaignSettings.SendExeptional != null && campaignSettings.SendExeptional.Campaigns.length !== 0) {
        setbsDot(true);
        const selectedCampaigns = getSelectedCampaigns();
        filteredValues.selectedFilterCampaigns = selectedCampaigns;
      }
      if (campaignSettings.SendExeptional != null && campaignSettings.SendExeptional.ExceptionalDays !== -1 && campaignSettings.SendExeptional.ExceptionalDays !== '') {
        setExceptionalDays(`${campaignSettings.SendExeptional.ExceptionalDays}`)
        settoggleReci(true);
        setbsDot(true);
        setFilterValues({ ...filterValues, dontSend: true, exceptionalDays: `${campaignSettings.SendExeptional.ExceptionalDays}` });
        filteredValues.dontSend = true;
        filteredValues.exceptionalDays = `${campaignSettings.SendExeptional.ExceptionalDays}`;
      }
      if (campaignSettings.PulseSettings != null && campaignSettings.PulseSettings.PulseSettingsID !== -1) {
        settogglePulse(true);
      }
      if (campaignSettings.RandomSettings != null && campaignSettings.RandomSettings.RandomAmount !== 0) {
        setrandom(campaignSettings.RandomSettings.RandomAmount);
        settoggleRandom(true);
      }
      if (campaignSettings.PulseSettings != null && campaignSettings.PulseSettings.PulseType === 2) {
        setpulsePer("recipients");
        setpulseReci("Recipients");
      }
      if (campaignSettings.PulseSettings != null && campaignSettings.PulseSettings.PulseType === 1) {
        setpulsePer("percent");
        setpulseReci("");
      }
      if (campaignSettings.PulseSettings != null && campaignSettings.PulseSettings.TimeType === 1) {
        setminName("Mins");
        sethourName("");

      }
      if (campaignSettings.PulseSettings != null && campaignSettings.PulseSettings.TimeType === 2) {
        setminName("");
        sethourName("Hours");
      }
      if (campaignSettings.SendTypeID) {
        setSendType(`${campaignSettings.SendTypeID}`);
      }
      if (campaignSettings.FutureDateTime !== null && campaignSettings.SendTypeID === 2) {
        handleFromDate(moment(campaignSettings.FutureDateTime));
      }
      if (campaignSettings.SendTypeID === 3) {
        setdaysBeforeAfter(campaignSettings.SpecialSettings.Day);
        setsendTime(moment(campaignSettings.SpecialSettings.SendHour))
        setDateFieldID(`${campaignSettings.SpecialSettings.DateFieldID}`)
        if (campaignSettings.SpecialSettings.IntervalTypeID === -1) {
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

      setFilterDialogValues({ ...filterDialogValues, ...filteredValues });

      setLoader(false);
    }
    if (campaignSettings !== null) {
      initCampaignSettings();
    }
  }, [campaignSettings]);

  const getData = async () => {
    setLoader(true);
    if (id) {
      if (!finishedCampaigns || finishedCampaigns?.length === 0) {
        await dispatch(getFinishedCampaigns());
      }
      await dispatch(getGroupsBySubAccountId());
      await dispatch(getTestGroups());

      const campaignSettingsRes = await dispatch(getCampaignSettings(id));

      if (campaignSettingsRes.payload.error) {
        logout();
      }
      setCampaignSettings(campaignSettingsRes.payload);
    }
  }

  useEffect(() => {
    const fetchOTPPassed = () => {
      isOtpPassed();
    }
    fetchOTPPassed();
  }, [dataSaved]);

  useEffect(() => {
    setOtpPassed(OTPPassed);
    if (OTPPassed === false) {
      setOTPOpen(true);
    }
  }, [OTPPassed])

  useEffect(() => {
    setLoader(true);
    getData();
    if (!extraData || extraData?.length === 0)
      getDataExtra();
  }, [dispatch]);
  const getDataExtra = async () => {
    await dispatch(getAccountExtraData());
  };

  useEffect(() => {
    if (id) {
      getSavedData();
    }
  }, []);

  useEffect(() => {
    if (dialogType?.type === 'filterRecipients') {
      setFilterDialogValues({
        dontSend: filterValues.dontSend,
        exceptionalDays: filterValues.exceptionalDays,
        selectedFilterCampaigns: filterDialogValues.selectedFilterCampaigns,
        selectedFilterGroups: filterDialogValues.selectedFilterGroups
      });
    }
  }, [dialogType])

  const getSavedData = async () => {
    if (id) {
      let response = await dispatch(getSmsByID(id))
      if (response) {
        setdataSaved({ ...dataSaved, campaignName: response.payload.Name, fromNumber: response.payload.FromNumber, msg: response.payload.Text, CreditPerSms: response.payload.CreditsPerSms })
      }
    }
  }
  const callbackSelectAll = () => {
    if (!allGroupsSelected) {
      if (showTestGroups) {
        setSelected([...testGroups, ...subAccountAllGroups]);
      }
      else {
        setSelected([...subAccountAllGroups]);
      }
    } else {
      setSelected([]);
    }
    setAllGroupsSelected(!allGroupsSelected);
  };

  const handleCancelPulse = () => {
    setPulseAmount("");
    setTimeInterval("");
    setPulseType(2);
    setrandom("");
    setpulsePer("recipients");
    setpulseReci("Recipients");
    setminName("mins");
    sethourName("Hours");
    settogglePulse(false);
    settoggleRandom(false);
    setTimeType(1);
    setDialogType(null);
  };

  const handleSendType = (event) => {
    if (event.target.value === "1") {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
    }
    else if (event.target.value === "3") {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
      setTimeInterval(-1);
      setPulseAmount(-1);
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
  const callbackFilter = () => {
    setDialogType({ type: null });
    setDialogType({ type: "filterRecipients" });
  };
  const handleDatePicker = (value) => {
    handleFromDate(value);
  };
  const handleTimePicker = (value) => {
    var date = moment(sendDate);
    var time = moment(value, "HH:mm");

    date.set({
      hour: time.get("hour"),
      minute: time.get("minute"),
    });

    if (date < moment()) {
      date = moment();
      setToastMessage(ToastMessages.DATE_PASS);
    }

    handleFromDate(date);
    setTimePickerOpen(false);
  };
  const handleRadioTime = (value) => {
    setsendTime(value)
  }
  const handleCombined = async () => {
    const nameExist = subAccountAllGroups.filter((g) => { return g.GroupName === groupValue });
    if (nameExist.length > 0) {
      setGroupNameExist(true);
      return;
    }

    let temp = [];
    for (let i = 0; i < selectedGroups.length; i++) {
      temp.push(selectedGroups[i].GroupID);
    }

    let payload = {
      GroupName: groupValue,
      GroupIds: temp,
    };
    const combineResponse = await dispatch(combinedGroup(payload));
    const newGroupCreated = combineResponse?.payload;
    await dispatch(getGroupsBySubAccountId());
    settoggleChecked(false);
    setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
    setSelected([newGroupCreated]);
  };
  const onHandleDelete = () => {
    setDialogType({ type: "delete" });
  };
  const inputGroup = (e) => {
    setGroupNameExist(false);
    setgroupValue(e.target.value);
  };
  
  const areaChange = (e) => {
    let enteredValue = e.target.value.split("\n")
    const records = enteredValue.filter((r) => { return r !== "" });
    settotalRecords(records.length)
    setareaData(e.target.value);
    setdropClick(false);
  };
  const handleFiles = (e) => {
    e.preventDefault();
    setdropClick(true);
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
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
              settotalRecords(b.length)

              setareaData(b);
              let dummyArr = [];
              for (let i = 0; i < b[0].length; i++) {
                dummyArr.push(t("sms.adjustTitle"));
              }
              setinitialheadstate(dummyArr);
              setheaders(dummyArr)

              setLoader(false);
              if (dummyArr !== 0) {
                setDialogType({ type: "manualUpload" });
              }

            }, 0);
          };
          reader.readAsArrayBuffer(file, "utf-8")
        }

        else if (file.name.toLowerCase().indexOf("csv") > -1) {
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
                        String(item).length === 9
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

            Papa.parse(reader.result, {
              config,
              complete: results => {
                setContacts(results.data)
                settotalRecords(results.data.length)

                const resultCsv = results.data;

                setDialogType({ type: "manualUpload" });
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
          dispatch(sendToTeamChannel({
            MethodName: 'handleFiles',
            ComponentName: 'SmsSend.js',
            Text: `Client trying to upload non-acceptable file - ${file.name}`
          }))
          return false;
        }
      }
      catch (error) {
        dispatch(sendToTeamChannel({
          MethodName: 'handleFiles',
          ComponentName: 'SmsSend.js',
          Text: error
        }))
        reject(error);
      }
    });
  }
  const renderBody = () => {
    return (
      <Grid container
        direction="row"
        justifyContent="flex-start"
        className={classes.wizardFlex}
      >
        <Grid item md={12} xs={12} className={classes.infoDiv}>
          <span className={classes.conInfo}>{t("mainReport.whomTosend")}</span>
          <Tooltip
            disableFocusListener
            title={t("smsReport.whomtoSendTip")}
            classes={{ tooltip: classes.customWidth }}
          >
            <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
              <BsInfoCircle />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item md={12} xs={12} className={classes.tabDiv} style={{ height: windowSize === 'xs' ? 40 : 50, gridTemplateColumns: !userRoles?.HideRecipients ? '50% 50%' : '100%' }}>
          <Grid item md={12} xs={12}
            className={
              clsx(classes.tab1, classes.btnTab, !!groupClick ? classes.currentActiveTab : '', classes.w50)
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              setgroupClick(true);
              setmanualClick(false);
            }}
          >
            <span>
              {t("mainReport.groups")}
            </span>
          </Grid>
          {!userRoles?.HideRecipients && <Grid item md={12} xs={12}
            className={
              clsx(classes.tab1, classes.btnTab, !!manualClick ? classes.currentActiveTab : '', classes.w50)
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              setgroupClick(false);
              settoggleChecked(false)
              setmanualClick(true);
            }}
          >
            <span style={{ marginInlineEnd: 15 }} className={classes.elipsis}>
              {t("mainReport.manual")}
            </span>
            <Tooltip
              disableFocusListener
              title={t("smsReport.manualTip")}
              classes={{ tooltip: classes.customWidth }}
            >
              <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                <BsInfoCircle />
              </IconButton>
            </Tooltip>
          </Grid>}

        </Grid>
        {!userRoles?.HideRecipients && manualClick ? (
          <Grid item md={12} xs={12} className={
            highlighted
              ? clsx(classes.greenManual)
              : clsx(classes.areaManual)
          }>
            <textarea
              style={{ height: 395 }}
              placeholder={t("sms.dragXlOrCsv")}
              spellCheck="false"
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
          </Grid>
        ) : null}
        <Grid item md={12} xs={12}>
          {groupClick ? (
            <Groups
              classes={classes}
              list={showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups?.filter((g) => { return g.Recipients > 0 })]}
              selectedList={selectedGroups}
              callbackSelectedGroups={callbackSelectedGroups}
              callbackUpdateGroups={callbackUpdateGroups}
              callbackSelectAll={callbackSelectAll}
              callbackReciFilter={callbackFilter}
              callbackShowTestGroup={callbackShowTestGroup}
              isSms={true}
              bsDot={bsDot}
              uniqueKey={'groups_1'}
              innerHeight={325}
            />
          ) : null}
          {!userRoles?.HideRecipients && groupClick && <div className={classes.groupsFooter}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {manualClick === false ? (
                <div
                  className={classes.createGroupContainer}
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
                  <Button className={clsx(classes.btn, classes.btnRounded, classes.mlr10, !groupValue || groupValue === '' ? classes.disabled : null)} onClick={handleCombined}>
                    {t("mainReport.save")}
                  </Button>
                  {groupNameExist ? <span style={{ marginTop: "8px", color: "red", fontSize: "12px", display: 'block' }}>{t("sms.groupNameExists").replace("#groupName#", groupValue)}</span> : null}
                </div>
              ) : null}
            </div>
            {manualClick === false ? (
              <div
                style={{
                  display: "flex",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                <span>{t("mainReport.totalReci")}:  {selectedGroups.reduce(function (a, b) {
                  return a + b['Recipients'];
                }, 0).toLocaleString()}</span>
                <Tooltip
                  placement={'bottom'}
                  disableFocusListener
                  title={t("smsReport.finalReciTip")}
                  classes={{ tooltip: classes.customWidth }}
                  style={{ marginInlineStart: "5px" }}
                >
                  <IconButton style={{ paddingInline: 5, paddingBlock: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                    <BsInfoCircle />
                  </IconButton>
                </Tooltip>
              </div>
            ) : null}
          </div>}
          {manualClick === true ? (
            <div className={classes.manualChild} style={{ justifyContent: areaData === "" ? "flex-end" : "space-between" }}>
              {areaData !== "" ? (
                <div>
                  <Button
                    className={clsx(
                      classes.ml5,
                      classes.btn, classes.btnRounded)}
                    onClick={() => {
                      handlePasted();
                    }}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  >
                    {t("sms.editFields")}
                  </Button>
                  <Button
                    className={clsx(
                      classes.ml5,
                      windowSize === "xs" ? classes.mt1 : '',
                      classes.btn, classes.btnRounded)}
                    onClick={() => {
                      setareaData("");
                      setContacts([]);
                      settypedData([]);
                      settotalRecords(0)
                    }}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                  >
                    {t("sms.clearList")}
                  </Button>
                </div>
              ) : null}
              {/* Note: Quick Manual Send Button - This will be covered in phase 2 */}
              {
                areaData !== "" && (
                  <Button
                    style={{ marginInlineStart: 'auto', marginInlineEnd: 10 }}
                    size='medium'
                    color="primary"
                    variant='contained'
                    key={"extraButton"}
                    className={clsx(
                      // classes.btn,
                      classes.btnRounded
                    )}
                    onClick={() => {
                      setDialogType({ type: "quickMnualUpload" })
                    }}
                  >
                    {t("campaigns.newsLetterSendSettings.quickMSend")}
                  </Button>
                )
              }
              <span className={windowSize === "xs" ? classes.dBlock : ''}>{t("sms.totalRecords")}:  {totalRecords}</span>
            </div>
          ) : null}
        </Grid>
      </Grid>
    );
  };
  useEffect(() => {
    const resetDays = () => {
      setFilterDialogValues({
        ...filterDialogValues,
        exceptionalDays: ''
      })
      settoggleReci(false);
    }
    if (!filterDialogValues.dontSend) {
      resetDays();
    }
    else {
      settoggleReci(true);
    }
  }, [filterDialogValues.dontSend])
  const handleFilterConfirm = () => {
    setFilterValues({
      dontSend: filterDialogValues.dontSend,
      exceptionalDays: filterDialogValues.exceptionalDays
    });
    setExceptionalDays(filterDialogValues.exceptionalDays);
    let formIsvalid = true;
    settoggleReci(filterDialogValues.dontSend);
    if (filterDialogValues.dontSend) {
      formIsvalid = validationCheck();
      if (formIsvalid) {
        if (filterDialogValues.selectedFilterGroups.length !== 0 || (filterDialogValues.exceptionalDays !== undefined && filterDialogValues.exceptionalDays !== "") || filterDialogValues.selectedFilterCampaigns.length !== 0) {
          setbsDot(true);
        }
        else {
          setbsDot(false);
        }
      }
    }
    else {
      if (filterDialogValues.selectedFilterGroups.length !== 0 || (filterDialogValues.exceptionalDays !== undefined && filterDialogValues.exceptionalDays !== "") || filterDialogValues.selectedFilterCampaigns.length !== 0) {
        setbsDot(true);
      }
      else {
        settoggleReci(false)
        setbsDot(false);
        setCampaignSettings({
          ...campaignSettings, SendExeptional: {
            Groups: filterDialogValues.selectedFilterGroups ?? [],
            Campaigns: filterDialogValues.selectedFilterCampaigns ?? [],
            ExceptionalDays: ''
          }
        })
      }
    }
    if (formIsvalid) {
      setDialogType(null);
    }

  };
  const handlePasted = () => {
    let temp = areaData;
    let a = temp.split("\n").filter(empty => empty);
    let b = [];
    let cols = 0;
    if (temp.indexOf("\t") > -1) {
      for (let i = 0; i < a.length; i++) {
        let splitted = a[i].split("\t");
        b.push(splitted);
        if (splitted.length > cols) {
          cols = splitted.length;
        }
      }
    }
    else {
      const records = a.filter((r) => { return r !== "" });
      for (let i = 0; i < records.length; i++) {
        let splitted = a[i].split(",");
        b.push(splitted);
        if (splitted.length > cols) {
          cols = splitted.length;
        }
      }
    }
    settypedData(b);

    let dummyArr = [];
    for (let i = 0; i < cols; i++) {
      dummyArr.push(t("sms.adjustTitle"));
    }
    setinitialheadstate(dummyArr);
    setheaders(dummyArr)
    setDialogType({ type: "manualUpload" });
  };
  const handleReciInput = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setFilterDialogValues({
        ...filterDialogValues,
        exceptionalDays: e.target.value,
      })
      setRecipientsBool(false);
    }

  }
  const validationCheck = () => {
    if (filterDialogValues.exceptionalDays === "") {
      setRecipientsBool(true);
      setRecipientsSnackbar(true);
      return false;
    }
    else {
      return true;
    }

  };
  const handleSpecialDayChange = (e) => {
    const re = /^[0-9\b]+$/;
    if ((e.target.value === '' || re.test(e.target.value)) && Number(e.target.value <= 999)) {
      setdaysBeforeAfter(e.target.value);
    }

  }
  const handleSelectChange = (e) => {
    if (e.target.value === "0") {
      setDateFieldID("0");
    }
    else {
      setDateFieldID(e.target.value)
      Object.keys(extraData).map((item, i) => {
        if (parseInt(e.target.value) === i + 3) {
          setSelectedSpecialValue(item)
        }
        else if (parseInt(e.target.value) === 1) {
          setSelectedSpecialValue("Birthday")
        }
        else if (parseInt(e.target.value) === 2) {
          setSelectedSpecialValue("Creation day")
        }
      })

    }
  }
  const handlePulseDialog = () => {
    setPulsesOpen(true);
  }
  const renderRight = () => {
    return (
      <div>
        <Grid item md={10} xs={12}>
          <h2
            className={classes.sectionTitle}
            style={{ marginTop: windowSize === "xs" ? 15 : null }}
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
                className={classes.dateBox}
                style={{
                  pointerEvents: sendType === "2" ? "auto" : "none",
                }}
              >
                <DateField
                  minDate={moment()}
                  classes={classes}
                  value={sendType === "2" ? sendDate : null}
                  onChange={handleDatePicker}
                  placeholder={t("notifications.date")}
                  timePickerOpen={true}
                  dateActive={sendType === "2" ? false : true}
                />
              </Box>
              <Box
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  pointerEvents: sendType === "2" ? "auto" : "none",
                }}
              >
                <DateField
                  minDate={moment()}
                  classes={classes}
                  value={sendType === "2" ? sendDate : null}
                  onTimeChange={handleTimePicker}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  ampm={false}
                  timeActive={sendType === "2" ? false : true}
                  timePickerOpen={timePickerOpen}
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
                className={clsx(classes.dateBox, 'selectWrapper')}
                style={{
                  marginTop: 10,
                  pointerEvents: sendType === "3" ? "auto" : "none",
                }}
              >
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, windowSize !== 'xs' ? classes.w100 : '', classes.mb10)}>
                  <Select
                    placeholder={t('common.select')}
                    variant="standard"
                    displayEmpty
                    disabled={sendType === "3" ? false : true}
                    value={sendType === "3" ? spectialDateFieldID : "0"}
                    onChange={(event) => handleSelectChange(event)}
                    IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                    className={classes.pbt5}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          direction: isRTL ? 'rtl' : 'ltr'
                        },
                      },
                    }}
                  >
                    <MenuItem value='0'>{t('common.select')}</MenuItem>
                    <MenuItem value='1'>{t('mainReport.birthday')}</MenuItem>
                    <MenuItem value='2'>{t('mainReport.creationDay')}</MenuItem>
                    {extraData && Object.keys(extraData).map((item, i) => {
                      if (extraData[item]) {
                        return item.toLowerCase().indexOf('extradate') > -1 && (
                          <MenuItem value={i + 3} key={`extrakey_${i}`}>
                            {Object.values(extraData[item])}
                          </MenuItem>
                        );
                      }
                    })}
                  </Select>
                </FormControl>
              </Box>

              <Box
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  display: windowSize === 'xs' ? "inline-block" : "flex",
                  alignItems: "center",
                  width: "370px",
                  pointerEvents: sendType === "3" ? "auto" : "none",
                }}
              >
                <input
                  type="text"
                  className={classes.inputDays}
                  placeholder="0"
                  disabled={sendType === "3" ? false : true}
                  value={sendType === "3" ? daysBeforeAfter : ""}
                  onChange={(e) => { handleSpecialDayChange(e) }}
                  maxLength="3"
                />

                <span className={clsx(classes.ml5, classes.f14, classes.mb2)}>
                  {t("mainReport.days")}
                </span>

                {isRTL ?
                  <div style={{ display: "flex" }}>
                    <span
                      className={
                        sendType === "3" ? toggleB ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
                      }
                      onClick={() => {
                        handlebef();
                      }}
                    >
                      {t("mainReport.before")}
                    </span>
                    <span
                      className={
                        sendType === "3" ? toggleA ? classes.beforeActive : classes.before : classes.disabledBefore
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
                        sendType === "3" ? toggleB ? classes.beforeActive : classes.before : classes.disabledBefore
                      }
                      onClick={() => {
                        handlebef();
                      }}
                    >
                      {t("mainReport.before")}
                    </span>
                    <span
                      className={
                        sendType === "3" ? toggleA ? clsx(classes.afterActive) : clsx(classes.after) : classes.disabledAfter
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
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  pointerEvents: sendType === "3" ? "auto" : "none",
                  marginBottom: '1rem'
                }}
              >
                <DateField
                  classes={classes}
                  value={sendType === "3" ? sendTime : null}

                  onTimeChange={handleRadioTime}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  buttons={{
                    ok: t("common.confirm"),
                    cancel: t("common.cancel"),
                  }}
                  ampm={false}
                  timePickerOpen={timePickerOpen}
                  timeActive={sendType === "3" ? false : true}
                  disabled={sendType === "3" ? false : true}
                  autoOk
                />
              </Box>
            </RadioGroup>
          </FormControl>
        </Grid>
        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
        <div className={classes.pulseDiv}>
          <Button
            className={clsx(
              classes.btn, classes.btnRounded,
              (selectedGroups.length >= 1 && sendType !== "3") ? null : classes.disabled
            )}
            onClick={() => {
              handlePulseDialog();
            }}
          >
            <FaRegCalendarAlt className={clsx(classes.paddingSides5)} />
            {t("mainReport.pulseSend")}
          </Button>
          <Tooltip
            disableFocusListener
            style={{ marginInlineEnd: isRTL ? 5 : 0, marginInlineStart: 5 }}
            title={t("smsReport.pulseSendTip")}
            classes={{ tooltip: classes.customWidth }}
            className={clsx(classes.ml5, classes.mt1)}
          >
            <IconButton style={{ padding: 0, marginInlineStart: 10 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
              <BsInfoCircle />
            </IconButton>
          </Tooltip>
          <Tooltip
            disableFocusListener
            style={{ marginInlineEnd: isRTL ? 5 : 0, marginInlineStart: 5 }}
            title={t("smsReport.pulseCancel")}
            classes={{ tooltip: classes.customWidth }}
            className={clsx(classes.ml5, classes.mt1)}
          >
            <IconButton
              style={{ padding: 0, marginInlineStart: 10 }}
              className={clsx(classes.icon_Info, classes.f20)}
              aria-label={t("smsReport.pulseCancel")}
              onClick={() => setDialogType({ type: "cancelPulse" })}
            >
              <Close />
            </IconButton>
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
              {t("smsReport.packetSend")} - {pulseAmount} {pulsePer === "" || pulsePer === "recipients" ? t("sms.recipients") : t("common.Percent")} {" "}
              {t("sms.every")} {timeInterval} {hourName === "" || minName === "mins" ? t("common.minutes") : t("common.hours")}
            </span>
          ) : null}
          {toggleRandom ? (
            <span>{t("smsReport.randomSend")} - {random} {t("smsReport.randomRecipients")}</span>
          ) : null}
        </div>
      </div>
    );
  }

  const onSaveSettings = async (toggle, exit, groupID = null) => {
    if (!groupID && otpPassed === false) {
      setOTPOpen(true);
      return;
    }
    if (!groupID && selectedGroups.length <= 0) {
      setToastMessage(ToastMessages.NO_GROUPS);
      return;
    }
    setLoader(true);
    const requestPayload = {
      FutureDateTime: null,
      Groups: groupID ? [groupID] : selectedGroups.map((sg) => { return sg.GroupID }),
      PulseSettings: {
        PulseType: groupID ? 1 : pulseType,
        TimeType: timeType,
        PulseAmount: pulseAmount,
        TimeInterval: timeInterval
      },
      RandomSettings: {
        RandomAmount: random
      },
      SendExeptional:
      {
        Groups: filterDialogValues?.selectedFilterGroups?.map((c) => { return c.GroupID }),
        Campaigns: filterDialogValues?.selectedFilterCampaigns?.map((c) => { return c.SMSCampaignID }),
        ExceptionalDays: exceptionalDays
      },
      SendTypeID: sendType,
      SmsCampaignID: id,
      SourceTimeZone: "Asia/Calcutta",
      SpecialSettings: {
        Type: "",
        DateFieldID: -1,
        Day: 0,
        SendHour: "",
        IntervalTypeID: -1,
        SendDate: null
      }
    }
    if (!groupID && sendType === "2") {
      if (sendDate === null) {
        setsendType2Dialog(true);
        setLoader(false);
        return;
      }
      else {
        const finalDate = moment(sendDate, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: finalDate.format("HH"), m: finalDate.format("mm") });
        requestPayload.FutureDateTime = finalDate.format();
      }
    }
    else if (!groupID && sendType === "3") {
      if (sendTime === null || daysBeforeAfter === "" || spectialDateFieldID === "0") {
        setspecialSettingValidation(true);
        setLoader(false);
        return;
      }
      else {
        requestPayload.SpecialSettings.IntervalTypeID = afterClick ? 1 : -1;
        requestPayload.SpecialSettings.DateFieldID = spectialDateFieldID;
        requestPayload.SpecialSettings.Day = daysBeforeAfter;
        requestPayload.SpecialSettings.SendHour = moment(sendTime).format("HH:mm");;
        requestPayload.SpecialSettings.SendDate = null;
      }
    }

    const settingsSaved = await dispatch(saveSmsCampSettings(requestPayload));
    if (settingsSaved.payload === true) {
      if (toggle && exit !== "exit") {
        setToastMessage(ToastMessages.SUCCESS);
      }
      else if (toggle && exit === "exit") {
        Redirect({ url: `${sitePrefix}SMSCampaigns` });
      }
      else {
        let response = await dispatch(getCampaignSumm(requestPayload.SmsCampaignID));
        const estimated = estimatedEndDate(response.payload);
        setestimationDate(estimated);
        setsummModal(true);
      }
    }
    setLoader(false);
  };
  const estimatedEndDate = (summary) => {
    let date = moment();
    let addTime = 0;

    // Future
    if (sendType === "2") {
      date = sendDate;
    }
    if (
      pulseType === 2
    ) {
      addTime = (Math.ceil((((summary.FinalCount + summary.FinalVoiceCount) - pulseAmount) / pulseAmount))) * timeInterval
    } else {
      let recipientPercents =
        ((summary.FinalCount + summary.FinalVoiceCount) *
          pulseAmount) /
        100;
      addTime =
        (((summary.FinalCount + summary.FinalVoiceCount) - recipientPercents.toFixed(1)) *
          timeInterval) /
        recipientPercents.toFixed(1);
    }

    return moment(date)
      .add(
        addTime,
        timeType === 1 || timeType === '1'
          ? "m"
          : "h"
      )
      .format("DD/MM/YYYY - HH:mm");
  }
  const handleSummary = () => {
    setDialogType(null);
    setsummModal(false);
  }
  const renderSummary = () => {
    return (
      <Summary
        classes={classes}
        campaignName={dataSaved.campaignName}
        fromNumber={dataSaved.fromNumber}
        textMsg={dataSaved.msg}
        groups={selectedGroups}
        summaryPayload={getCampaignSum}
        onConfirm={onApiCall} sendType={sendType}
        days={daysBeforeAfter}
        after={afterClick}
        time={sendTime}
        handleCallback={handleSummary}
        specialVal={SelectedSpecialValue}
        sendDateTime={sendDate}
        pulseTrue={togglePulse}
        pulseInput1={pulseAmount}
        pulseInput2={timeInterval}
        pulsePer={pulsePer}
        pulseReci={pulseReci}
        hourName={hourName}
        minName={minName}
        toggleRandom={toggleRandom}
        random={random}
        estimationDate={estimationDate}
        filteredGroups={filterDialogValues.selectedFilterGroups}
        filteredCampaigns={filterDialogValues.selectedFilterCampaigns}
        // displayCampaigns={totalCampaigns}
        open={summModal}
        pulseType={timeType}
      />
    );
  };

  const onApiCall = async () => {
    setsummModal(false);
    setLoader(true);
    let payload = {
      "SmsCampaignID": id,
      "Credits": dataSaved.CreditPerSms,
      "TotalRecipients": getCampaignSum.FinalCount,
      "VoiceCredits": getCampaignSum.FinalVoiceCount
    }

    let r = await dispatch(sendSms(payload))
    
    // Check for tier validation
    if (r.payload.Result === 9271) {
      setTierMessageCode('SMS_BASIC');
    } else if (r.payload.Result === 9272) {
      setTierMessageCode('SMS_CLICK_TRACKING');
    } else if (r.payload.Result === 9273) {
      setTierMessageCode('SITE_TRACKING');
    }
    
    handleSendResult(r.payload);
    setLoader(false);
  };
  const handleCautionCancel = () => {
    if (dropClick === true) {
      setDialogType({ type: "caution" })
      setgroupNameInput("");
      setGroupTextError(false);

    }
    else {
      setDialogType(null);
      setgroupNameInput("");
      setcolumnValidate(false);
    }
  };
  const handleChangeId = (id) => {
    if (dropIndex === -1) {
      setdropIndex(id);
    } else {
      setdropIndex(-1);
    }
  };
  const handleSelectFirst = (name, id, idx, e) => {
    // id -  index of select array 
    // idx - header index 
    let h = headers;
    h[idx] = name.label;
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

      if (selectArray[i].label === name) {
        selectArray[i].isdisabled = false;
        selectArray[i].idx = -1;
        break;
      }
    }

  }
  const translateHebrewColumns = (key) => {
    if (key === 'שםפרטי') {
      return "FirstName";
    }
    if (key === 'שםמשפחה') {
      return "LastName";
    }
    if (key === 'סלולרי') {
      return "Cellphone";
    }
    return key;
  }
  const handleDataManual = async () => {
    if (manualUploadValidationscheck()) {
      let requestPayload = [];

      if (typedData.length !== 0) {
        for (let j = 0; j < typedData.length; j++) {
          requestPayload.push({});
          for (let k = 0; k < typedData[j].length; k++) {
            if (headers[k] && headers[k] !== t("sms.adjustTitle")) {
              let key = translateHebrewColumns(headers[k].toLocaleString().trim().replace(" ", ""));
              let obj = requestPayload[j];
              obj[key] = typedData[j][k].trim();
            }
          }
        }
      }
      else {
        for (let j = 0; j < contacts.length; j++) {
          requestPayload.push({});
          let i = 0;

          for (let k in contacts[j]) {
            if (headers[i] && headers[i] !== t("sms.adjustTitle")) {
              let key = translateHebrewColumns(headers[i].toLocaleString().trim().replace(" ", ""));
              let obj = requestPayload[j];
              obj[key] = contacts[j][k].trim();
            }
            i++;
          }
        }
      }

      let finalPayload = {
        GroupName: groupNameInput,
        Clients: requestPayload
      }
      setDialogType(null);
      setLoader(true);
      const r = await dispatch(saveManualClients(finalPayload))
      setLoader(false);


      if (r.payload.Reason === "no_recipients_to_update") {
        setToastMessage(ToastMessages.INVALID_RECIPIENTS)
        settypedData([]);
        setContacts([]);
        setgroupNameInput("");
        setGroupTextError(false);
      }
      else {
        let tempres = [];
        let temp = [];
        for (let i = 0; i < subAccountAllGroups.length; i++) {
          tempres.push(subAccountAllGroups[i]);
        }
        for (let i = 0; i < selectedGroups.length; i++) {
          temp.push(selectedGroups[i]);
        }

        temp.push({
          Recipients: r.payload.Recipients,
          GroupName: groupNameInput,
          GroupID: r.payload.GroupID
        });
        setSelected(temp);
        setareaData("");
        settypedData([]);
        setContacts([]);
        setgroupClick(true);
        setgroupNameInput("");
        setGroupTextError(false);
        setmanualClick(false);
        setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
      }
      for (let i = 0; i < selectArray.length; i++) {
        selectArray[i].isdisabled = false;
        selectArray[i].idx = -1;
      }
    }

  }
  const handleManualDialog = (e) => {
    setgroupNameInput(e.target.value);
    setGroupTextError(false);
  }
  const manualUploadValidationscheck = () => {
    let isValid = true;
    setGroupNameValidationMessage("");
    setGroupTextError(false);
    setcolumnValidate(false);

    const groupNameExist = subAccountAllGroups.filter((gl) => { return gl.GroupName === groupNameInput });
    let columnHasValue = false;
    headers.forEach((value) => {
      if (value === t("common.cellphone")) {
        columnHasValue = true
      }
    })

    if (groupNameInput === "") {
      isValid = false;
      setGroupNameValidationMessage(t("common.requiredField"));
      setGroupTextError(true);
    }
    else if (groupNameExist.length > 0) {
      isValid = false;
      setGroupNameValidationMessage(t("sms.groupNameExists").replace("#groupName#", groupNameInput))
      setGroupTextError(true);
    }
    if (columnHasValue === false) {
      isValid = false;
      setcolumnValidate(true);
    }

    return isValid;

  }

  const handleDelete = () => {
    if (id) {
      dispatch(deleteSms(id));
      setDialogType(null);
      Redirect({ url: `${sitePrefix}SMSCampaigns` });
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
  const handleConfirmC = async () => {
    setLoader(true);
    var req = [];
    areaData.split('\n').forEach((q) => {
      if (IsValidPhone(q.replace(',', ''))) {
        req.push({ Cellphone: q.replace(',', ''), Telephone: q.replace(',', '') })
      }
    });
    setDialogType({ type: "" });
    if (req.length) {
      const responseDefaultGroup = await dispatch(createAndGetGroupIdForManualSend('PulseemSMS'));
      let groupId = responseDefaultGroup?.payload || '1'
      const finalPayload = {
        ClientsData: req,
        GroupIds: [groupId]
      }
      const r = await dispatch(addRecipient(finalPayload));

      if (r.payload.StatusCode === 201) {
        onSaveSettings(false, "", groupId);
      }
      else {
        setToastMessage(ToastMessages.ERROR);
        setLoader(false);
      }
    } else {
      setToastMessage(ToastMessages.INVALID_NUMBER);
      setLoader(false);
    }
  };
  const handlePreviousPage = () => {
    Redirect({ url: `${sitePrefix}sms/edit/${id}` });
  }
  const renderSendType2validation = () => {
    return (
      <BaseDialog
        classes={classes}
        open={sendType2Dialog}
        onClose={() => { setsendType2Dialog(false) }}
        onCancel={() => { setsendType2Dialog(false) }}
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
          <ul className={classes.fieldsRequire}>
            <li>{t("sms.selectSendingType")} - {t("common.requiredField")}</li>
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
            className={clsx(classes.btn, classes.btnRounded)}
          >
            {t("mainReport.confirmSms")}
          </Button>
        </div>
      </BaseDialog>
    )
  }
  const renderSpecialModal = () => {
    return (<>
      <BaseDialog
        classes={classes}
        open={specialSettingValidation}
        onClose={() => { setspecialSettingValidation(false) }}
        onCancel={() => { setspecialSettingValidation(false) }}
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
          <ul className={classes.fieldsRequire}>
            {spectialDateFieldID === "0" ? <li>{t("sms.selectSpecialField")}</li> : null}
            {daysBeforeAfter === "" ? <li>{t("sms.typeDays")}</li> : null}
            {sendTime == null ? <li>{t("sms.selectSendingTime")}</li> : null}

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
            className={clsx(classes.btn, classes.btnRounded)}
          >
            {t("mainReport.confirmSms")}
          </Button>
        </div>
      </BaseDialog></>)
  }

  const WizardButtons = () => {
    return (
      <div className={classes.creatorButtons}>
        <div className={classes.rightMostContainer}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.backButton,
              classes.mb5,
              isRTL && windowSize !== 'xs' && windowSize !== 'sm' ? classes.marginLeftAuto : windowSize !== 'xs' && windowSize !== 'sm' ? classes.marginRightAuto : null
            )}
            startIcon={!isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            color="primary"
            style={{ marginInlineStart: '8px' }}
            onClick={() => { handlePreviousPage() }}>
            {t("smsReport.back")}
          </Button>
          {userRoles?.AllowDelete && <Button

            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.mb5,
            )}
            style={{ marginInlineStart: '8px' }}
            onClick={onHandleDelete}
          >
            <BsTrash style={{ fontSize: "20", marginInlineStart: 0 }} />
          </Button>}
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.backButton,
              classes.mb5,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            color="primary"
            style={{ marginInlineStart: '8px' }}
            onClick={() => { setDialogType({ type: "exit" }) }}>
            {t('mainReport.exitSms')}
          </Button>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.backButton,
              classes.mb5,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            color="primary"
            style={{ marginInlineStart: '8px' }}
            onClick={() => {
              onSaveSettings(true);
            }}>
            {t('mainReport.saveSms')}
          </Button>
          {userRoles?.AllowSend && <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.backButton,
              classes.mb5,
              classes.redButton,
            )}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            color="primary"
            style={{
              marginInlineStart: '8px',
              pointerEvents: selectedGroups.length > 0 ? "auto" : "none",
              // backgroundColor:
              //   selectedGroups.length > 0 ? "#5cb85c" : "#91C78D"
            }}
            onClick={() => {
              onSaveSettings(false)
            }}>
            {t("mainReport.summary")}
          </Button>}
        </div>
      </div>
    );
  }
  const filterRecipientsDialog = () => {
    return {
      title: t('mainReport.recipientFilter'),
      showDivider: true,
      icon: (
        <FaFilter style={{ fontSize: 30, color: "#fff" }} />
      ),
      content: (
        <Box style={{ width: windowSize === 'lg' || windowSize === 'xl' ? '500px' : null }}>
          <div
            className={classes.reciCheckoxContainer}
          >
            <Checkbox
              checked={filterDialogValues.dontSend}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={(e) =>
                setFilterDialogValues({
                  ...filterDialogValues,
                  dontSend: e.target.checked,
                  exceptionalDays: '',
                })
              }
            />
            <span style={{ display: 'inline-block', marginTop: 2 }} className={classes.font13}>
              {t("smsReport.filterInputText")}
            </span>
            <div style={{ marginRight: isRTL ? 'auto' : null, marginLeft: !isRTL ? 'auto' : null }}>
              <input
                type="text"
                disabled={!filterDialogValues.dontSend}
                className={
                  filterDialogValues.dontSend
                    ? RecipientsBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.success)
                    : clsx(classes.pulseInsert)
                }
                onChange={(e) => { handleReciInput(e) }}
                value={filterDialogValues.exceptionalDays}
                maxLength="3"
              />
            </div>
          </div>
          <div>
            <span className={classes.font13}> {t("smsReport.inputTextFilter")}:</span>
            <div>
              <div
                className={clsx(classes.sidebar)}
              >
                <Groups
                  isSms={true}
                  bsDot={false}
                  classes={classes}
                  showSortBy={false}
                  isCampaign={false}
                  showSelectAll={false}
                  isNotifications={false}
                  list={showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups]}
                  selectedList={filterDialogValues.selectedFilterGroups}
                  callbackUpdateGroups={callbackUpdateGroupFilterd}
                  callbackSelectedGroups={callbackFilteredGroups}
                  callbackShowTestGroup={callbackShowTestGroup}
                  noSelectionText={t("sms.NoFilteredGroups")}
                  innerHeight={160}
                  uniqueKey={'groups_2'}
                />
              </div>
            </div>
          </div>
          <div className={classes.camapignsDiv}>
            <span className={classes.font13}>{t("smsReport.campaignInfo")}:</span>
            <div>
              <div className={clsx(classes.sidebar)}>
                <Groups
                  isSms={true}
                  bsDot={false}
                  classes={classes}
                  showSortBy={false}
                  showSelectAll={false}
                  isNotifications={false}
                  isCampaign={true}
                  list={finishedCampaigns}
                  selectedList={filterDialogValues.selectedFilterCampaigns}
                  callbackUpdateGroups={callbackUpdateCampaignFilter}
                  callbackSelectedGroups={callbackFiltertedCampaigns}
                  noSelectionText={t("sms.NoFilteredCampaigns")}
                  innerHeight={160}
                  uniqueKey={'campaigns_2'}
                />
              </div>
            </div>
          </div>
        </Box>
      ),
      showDefaultButtons: true,
      onCancel: () => setDialogType(null),
      onClose: () => setDialogType(null),
      onConfirm: () => { handleFilterConfirm() }
    }
  }
  const callbackUpdateGroupFilterd = (groups) => {
    setFilterDialogValues({
      ...filterDialogValues,
      selectedFilterGroups: groups,
    });
  }
  const callbackShowTestGroup = async (showTestGroups) => {
    if (!showTestGroups && testGroups.length > 0) {
      setShowTestGroups(true);
    }
    else {
      setShowTestGroups(false);
      // const g = subAccountAllGroups.filter((group) => { return group.IsTestGroup !== true });
      // setGroupList(g);
    }
  }
  const callbackFilteredGroups = (group) => {
    const found = filterDialogValues.selectedFilterGroups
      .map((g) => {
        return g.GroupID;
      })
      .includes(group.GroupID);
    if (found) {
      setFilterDialogValues({
        ...filterDialogValues,
        selectedFilterGroups: filterDialogValues.selectedFilterGroups.filter((c) => c.GroupID !== group.GroupID)
      });
    } else {
      const newGroupArr = [...filterDialogValues.selectedFilterGroups] || [];
      newGroupArr.push(group);


      setFilterDialogValues({
        ...filterDialogValues,
        selectedFilterGroups: newGroupArr
      });
    }
  }
  const callbackUpdateCampaignFilter = (campaigns) => {
    setFilterDialogValues({
      ...filterDialogValues,
      selectedFilterCampaigns: campaigns
    })
  }
  const callbackFiltertedCampaigns = (campaign) => {
    const found = filterDialogValues.selectedFilterCampaigns
      .map((c) => {
        return c.SMSCampaignID;
      })
      .includes(campaign.SMSCampaignID);
    if (found) {
      setFilterDialogValues({
        ...filterDialogValues,
        selectedFilterCampaigns: filterDialogValues.selectedFilterCampaigns.filter((c) => c.SMSCampaignID !== campaign.SMSCampaignID)
      })
    } else {
      const newCampArr = [...filterDialogValues.selectedFilterCampaigns] || [];
      newCampArr.push(campaign);


      setFilterDialogValues({
        ...filterDialogValues,
        selectedFilterCampaigns: newCampArr
      })
    }
  }

  //#endregion
  //#region Dialogs
  const noCreditDialog = () => {
    const isWhiteLabel = accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined;
    return {
      showDivider: false,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <FaExclamationCircle style={{ fontSize: 100 }} />
          <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{t("common.ErrorTitle")}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeft"))}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['NotEnoughCredits']))}</Typography>
          <Box style={{ marginTop: 25 }}>
            <Button
              onClick={() => setDialogType(null)}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.middle
              )}>
              {t("common.Ok")}
            </Button>
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { setDialogType(null) }
    }
  }
  const manualUploadDialog = () => {
    return {
      title: t('sms.columnAdjustment'),
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <div className={classes.manualModal}>
            <Typography className={classes.inputLabel}>
              {t("common.GroupName")}:
            </Typography>
            <div className={clsx(classes.buttonForm, classes.fullWidth)}>
              <TextField
                type="text"
                placeholder={t("common.GroupName")}
                className={groupTextError ? clsx(classes.textInput, classes.error) : clsx(classes.textInput, classes.success)}
                onChange={handleManualDialog}
                value={groupNameInput}
              ></TextField>
              {groupTextError ? <span className={classes.errorLabel}>{GroupNameValidationMessage}</span> : null}
            </div>
          </div>
          <Box
            className={clsx(classes.commonFieldPulse, classes.mb3)}>
            <Typography style={{ fontSize: "20px", marginInlineEnd: "10px" }}>
              {t("sms.totalRecipients")}:
            </Typography>
            <Typography
              style={{
                fontSize: "20px",
                marginInlineEnd: "10px",
                fontWeight: "600",
              }}
            >
              {contacts.length !== 0 ? contacts.length : typedData.length}
            </Typography>
            <Tooltip
              disableFocusListener
              title={t("smsReport.manualTotalTooltip")}
              classes={{ tooltip: classes.customWidth }}
              sx={{ justifyContent: 'center', zIndex: 9999999999999 }}
            >
              <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                <BsInfoCircle />
              </IconButton>
            </Tooltip>
          </Box>
          <Box className={classes.sidebar} style={{ minHeight: "200px", maxWidth: "700px" }} key="columnAdjustment">
            <table
              style={{
                borderCollapse: "collapse",
                overflowX: "auto",
                minWidth: "100px",
              }}
            >
              {typedData.length !== 0 || contacts.length !== 0
                ? headers.map((item, idx) => {
                  return (
                    <th
                      key={idx}
                      className={classes.manualHeader}
                    >
                      <div
                        onClick={() => {
                          handleChangeId(idx);
                        }}
                        className={classes.adjustP}
                        style={{ textAlign: "center", cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }} className={columnValidate === true && headers[idx] === t("sms.adjustTitle") ? classes.columnError : null}>{headers[idx]}</Typography>

                          {headers[idx] !== t("sms.adjustTitle") ? <AiOutlineClose style={{ marginInlineEnd: "8px" }} onClick={() => { handleCloseSpan(idx, headers[idx]) }} /> : null}
                          {dropIndex === idx ? <BsChevronUp /> : <BsChevronDown style={{ marginInlineStart: "4px" }} />}  </div>
                        {dropIndex === idx ? (
                          <div className={classes.adjustC}>
                            {selectArray.map((item, id) => {

                              return (
                                <span
                                  className={item.isdisabled ? clsx(classes.grayGroup) : clsx(classes.grouping)}
                                  onClick={() => {
                                    handleSelectFirst(item, id, idx);
                                  }}
                                >
                                  {item.label}
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
              {contacts.length !== 0
                ? contacts.map((item, idx) => {
                  if (idx > contacts.length - 6) {
                    return (
                      <tbody>
                        <tr id={idx} key={idx}>
                          {item.map((temp, idx) => {
                            return (
                              <td
                                id={idx}
                                className={classes.tableColumn}
                              >
                                {temp}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    );
                  }
                  return null;
                })
                : typedData.map((item, id) => {
                  if (id > typedData.length - 6) {
                    return (
                      <tbody>
                        <tr key={id}>
                          {headers.map((data, idx) => {
                            return (
                              <td key={idx} className={classes.tableColumn}
                              >
                                {item[idx]}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    );
                  }
                  return null;
                })}
            </table>
          </Box>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { handleCautionCancel() },
      onCancel: () => { handleCautionCancel() },
      onConfirm: () => { handleDataManual() }
    }
  }
  const cautionDialog = () => {
    return {
      title: t('common.Notice'),
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography>{RenderHtml(t("sms.reset_manual_upload_notice"))}</Typography>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType({ type: "manualUpload" }); },
      renderButtons: () =>
      (
        <Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
        >
          <Grid item>
            <Button
              onClick={() => {
                setDialogType(null);
                setareaData("");
                setContacts([]);
                settypedData([]);
                settotalRecords(0);
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {t('common.Yes')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => setDialogType({ type: "manualUpload" })}
              className={clsx(
                classes.btn,
                classes.btnRounded
              )}
            >
              {t('common.No')}
            </Button>
          </Grid>
        </Grid>
      ),
    }
  }

  const deleteDialog = () => {
    return {
      title: t('mainReport.deleteCamp'),
      confirmText: t("common.Yes"),
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.bodyTextDialog}>
          <Typography>
            {t("mainReport.confirmSure")}
          </Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null); },
      onCancel: () => { setDialogType(null); },
      onConfirm: () => { handleDelete() }
    }
  }
  const exitDialog = () => {
    return {
      title: t('mainReport.handleExitTitle'),
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box>
          <Typography className={classes.f18}>{t("mainReport.leaveCampaign")}</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      confirmText: t("common.Yes"),
      cancelText: t("common.No"),
      onClose: () => { Redirect({ url: `${sitePrefix}SMSCampaigns` }); },
      onCancel: () => { setDialogType(null) },
      onConfirm: () => { onSaveSettings(true, "exit") }
    }
  }

  const cancelPulseDialog = () => {
    return {
      title: t('smsReport.pulseCancel'),
      confirmText: t("common.Yes"),
      cancelText: t("common.cancel"),
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.bodyTextDialog}>
          <Typography>
            {t("smsReport.confirmCancelPulse")}
          </Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null); },
      onCancel: () => { setDialogType(null); },
      onConfirm: () => { handleCancelPulse() }
    }
  }

  const pendingApprovalDialog = (code = 550) => {
    return {
      title: t('campaigns.newsLetterEditor.errors.pendingApproval'),
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box>
          <Typography className={classes.f18}>{
            t(code === 550 ? "sms.PendingApprovalDesc" : "sms.PendingApproval551Desc")
          }</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null) },
      onCancel: () => { setDialogType(null) },
      onConfirm: () => { setDialogType(null) }
    }
  }

  const sendSuccessDialog = () => {
    const sentDate = sendType == 3
      ? `${daysBeforeAfter} ${t("mainReport.days")} ${afterClick ? t("mainReport.after") : t("mainReport.before")} ${SelectedSpecialValue}` 
      : moment(sendDate).format(DateFormats.DATE_ONLY);

    const time = sendType == 3 ? (sendTime && sendTime.format(DateFormats.TIME_ONLY_AMPM)) : (sendDate || moment()).format(DateFormats.TIME_ONLY_AMPM) || moment().format(DateFormats.TIME_ONLY);
    return {
      showDivider: false,
      disableBackdropClick: true,
      content: (
        <Box>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <img src={Gif} style={{ width: "150px", height: "150px" }} alt="Success" />
            <span style={{ marginTop: "10px", fontSize: "22px", fontWeight: "700" }}>
              {t( sendType == 1 ? 'campaigns.weSent' : 'campaigns.smsScheduled' )}
            </span>
            <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
              { sendType == 1 
                ? t("sms.campaignIsOnItsWay") 
                : t('campaigns.smsScheduledDesc', { DATE_OF_SCHEDULE: sentDate, TIME_OF_SCHEDULE: time })}
            </p>
            <Button
              variant='contained'
              size='medium'
              className={clsx(
                classes.btn, classes.btnRounded
              )}
              style={{ margin: '8px' }}
              color="primary"
              onClick={() => { Redirect({ url: `${sitePrefix}SMSCampaigns` }) }}
            >{t('common.confirm')}</Button>
          </div>
        </Box>
      ),
      renderButtons: false,
      showDefaultButtons: false,
      onCancel: () => { Redirect({ url: "/react/SMSCampaigns" }) },
      onClose: () => { Redirect({ url: "/react/SMSCampaigns" }) },
      exit: true
    }
  }

  const handleGetPlanForFeature = (tierMessageCode) => {
    const planName = findPlanByFeatureCode(
        tierMessageCode,
        availablePlans,
        currentPlan.Id
    );
    
    if (planName) {
      return t('billing.tier.featureNotAvailable').replace('{feature}', t(TierFeatures[tierMessageCode] || tierMessageCode)).replace('{planName}', planName);
    } else {
      return t('billing.tier.noFeatureAvailable');
    }
  };

  const getTierValidationDialog = () => ({
    title: t('billing.tier.permission'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {handleGetPlanForFeature(TierMessageCode)}
      </Typography>
    ),
    renderButtons: () => (
      <Grid container spacing={2} className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, !get(subAccount, 'CompanyAdmin', false) ? classes.dNone : '')}>
          <Grid item>
              <Button
                  onClick={() => {
                      setDialogType(null);
                      setShowTierPlans(true);
                  }}
                  className={clsx(classes.btn, classes.btnRounded)}
              >
                  {t('billing.upgradePlan')}
              </Button>
          </Grid>
          <Grid item>
              <Button
                  onClick={() => { setDialogType(null); }}
                  className={clsx(classes.btn, classes.btnRounded)}
              >
                  {t('common.cancel')}
              </Button>
          </Grid>
      </Grid>
    )
  });

  //#endregion
  const renderDialog = () => {
    const { type, data } = dialogType || {}

    const dialogContent = {
      manualUpload: manualUploadDialog(),
      filterRecipients: filterRecipientsDialog(),
      caution: cautionDialog(),
      delete: deleteDialog(),
      exit: exitDialog(),
      sendSuccess: sendSuccessDialog(),
      noCredit: noCreditDialog(),
      englishLetterDialog: englishLetterNotAllowed(),
      pendingApprovalDialog: pendingApprovalDialog(data),
      tier: getTierValidationDialog(),
      cancelPulse: cancelPulseDialog()
    }

    const currentDialog = dialogContent[type] || {}

    if (type) {
      if (dialogType === 'filterRecipients') {
        setFilterValues({
          dontSend: toggleReci,
          days: exceptionalDays
        });
      }
      return (
        dialogType && <BaseDialog
          classes={classes}
          open={dialogType}
          onClose={() => { setDialogType(null) }}
          onCancel={() => { setDialogType(null) }}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }
  const englishLetterNotAllowed = () => {
    const isWhiteLabel = accountSettings?.Account?.ReferrerID > 0 && WhiteLabelObject[accountSettings?.Account?.ReferrerID] !== undefined;
    return {
      showDivider: false,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <FaExclamationCircle style={{ fontSize: 100 }} />
          <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{RenderHtml(t("sms.englishLetterNotApprovedTitle"))}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t(RenderHtml(t(WhiteLabelObject[isWhiteLabel ? accountSettings?.Account?.ReferrerID : 0]['NotApprovedDesc']))))}</Typography>
          <Box style={{ marginTop: 25 }}>
            <Button
              onClick={() => setDialogType(null)}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.middle
              )}>
              {t("common.Ok")}
            </Button>
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { setDialogType(null) }
    }
  }

  const renderSubHeader = () => {
    return (
      <Title
        Text={(
          <Box className='stepHead'>
            <Stack className={'stepNum'} alignItems={'center'}>
              <span>2</span>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} ml={1} >
              <span className={'stepTitle'}>
                {t('mainReport.sendSetting')}
              </span>

            </Stack>
          </Box>
        )}
        classes={classes}
        isIcon={false}
        ContainerStyle={{
          padding: 0,
          minHeight: 42,
          height: 'auto',
          overflowY: 'hidden'
        }}
      />
    )
  }

  return (
    <DefaultScreen subPage={"create"} currentPage="sms" classes={classes} customPadding={true} containerClass={classes.editorCont}>
      <Box className={"head"}>
        <Title Text={t("mainReport.smsCampaign")} classes={classes} />
      </Box>
      <div>
        <Box className={'containerBody'}>
          {renderSubHeader()}
          {renderToast()}
          <Box className='bodyBlock'>
            <Grid container style={{ marginBottom: "40px" }}>
              <Grid item md={7} xs={12}>
                {renderBody()}
              </Grid>
              <Grid item md={1} xs={12}></Grid>
              <Grid item md={4} xs={12}>
                {renderRight()}
              </Grid>
            </Grid>
          </Box>
          <WizardButtons />
        </Box>
      </div>
      {renderDialog()}
      {renderSummary()}
      {renderSpecialModal()}
      {renderSendType2validation()}
      
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
        <Alert severity="warning" className={classes.snackBarSevere}>
          {t("sms.FillDay")}
        </Alert>
      </Snackbar>
      {otpOpen && <OTP classes={classes} campaignNumber={dataSaved.fromNumber} isOpen={otpOpen} onClose={() => { setOTPOpen(false); setDialogType(null); }} />}
      {dialogType?.type === 'quickMnualUpload' && <QuickManualUploadDialog
        classes={classes}
        onClose={() => setDialogType(null)}
        onCancel={() => setDialogType(null)}
        onConfirm={() => handleConfirmC()}
      />}
      {
        <Pulse
          classes={classes}
          selectedGroups={selectedGroups}
          onClose={(pulseResponse) => {
            if (pulseResponse !== null) {
              setPulseAmount(pulseResponse?.pulseAmount);
              setTimeInterval(pulseResponse?.timeInterval);
              setPulseType(pulseResponse?.pulseType);
              setrandom(pulseResponse?.random);
              setTimeType(pulseResponse?.timeType);
              setpulsePer(pulseResponse?.pulsePer);
              setpulseReci(pulseResponse?.pulseReci);
              setminName(pulseResponse?.minName);
              sethourName(pulseResponse?.hourName);
              settogglePulse(pulseResponse?.togglePulse);
              settoggleRandom(pulseResponse?.toggleRandom);
            }
            setPulsesOpen(false)
          }}
          isOpen={pulsesOpen}
          initialValues={{
            pulseAmount,
            timeInterval,
            pulseType,
            random,
            timeType,
            pulsePer,
            pulseReci,
            minName,
            hourName,
            togglePulse,
            toggleRandom
          }}
        />
      }
      <Loader isOpen={showLoader} />
      {showTierPlans && <TierPlans
        classes={classes}
        isOpen={showTierPlans}
        onClose={() => setShowTierPlans(false)}
      />}
    </DefaultScreen>
  );
};

export default SmsSend;
