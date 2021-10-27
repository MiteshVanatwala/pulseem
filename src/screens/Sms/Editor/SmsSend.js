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
import Toast from '../../../components/Toast/Toast.component';
import { Loader } from '../../../components/Loader/Loader';
import Papa from 'papaparse';
import { AiOutlineExclamationCircle, AiOutlineClose } from "react-icons/ai";
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Notifications/Groups/Groups";
import { useHistory } from "react-router";
import { BsTrash, BsChevronDown, BsChevronUp } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";
import * as XLSX from 'xlsx';
import Title from '../../../components/Wizard/Title'
import { Typography, Button, Grid, Box, FormControlLabel, FormControl, RadioGroup, Radio, FormHelperText, Divider, TextField } from "@material-ui/core";
import {
  sendSms, deleteSms, getSmsByID, IsOTPPassed, getCampaignSumm, getSMSRequestOTP, getSMSConfirmOTP, smsCombinedGroup, saveManualClients,
  getAccountExtraData, saveSmsCampSettings, getCampaignSettings, getFinishedCampaigns, getGroupsBySubAccountId
} from "../../../redux/reducers/smsSlice";
import Summary from "./smsSummary";
import clsx from "clsx";

function Alert(props) {
  return <MuiAlert elevation={0} variant="filled" {...props} />;
}
//#region styles
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

const useSnackRecipients = makeStyles((theme) => ({

  customcolor:
  {
    backgroundColor: "#AFE1AF",
    color: "black",
    minWidth: "200px",
    height: "30px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    fontWeight: 700
  }
}));

const useSnackSevere = makeStyles((theme) => ({

  customcolor:
  {
    backgroundColor: "#F6B2B2",
    color: "black",
    minWidth: "200px",
    height: "30px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: 'center',
    fontWeight: 700,
    boxShadow: '1px ​1px 10px 2px black'
  }

}));

//#endregion
//#region Tabs
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
//#endregion

const SmsSend = ({ classes, ...props }) => {
  //#region initialized states
  const { t } = useTranslation();
  const styles = useStyles();
  const history = useHistory();
  const severe = useSnackSevere();
  const recipientSuccess = useSnackRecipients();
  const { OTPPassed } = useSelector((state) => state.sms);

  const dispatch = useDispatch();
  const { windowSize, isRTL } = useSelector(
    (state) => state.core
  );
  const { extraData, getCampaignSum, } =
    useSelector((state) => state.sms);
  const theme = useTheme();
  const [selectedGroups, setSelected] = useState([]);
  const [allGroupsSelected, setAllGroupsSelected] = useState(false);
  const [sendType, setSendType] = useState("1");
  const [sendDate, handleFromDate] = useState(null);
  const [sendTime, setsendTime] = useState(null);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [boolRandom, setboolRandom] = useState(false);
  const [sendType2Dialog, setsendType2Dialog] = useState(false);
  const [groupList, setGroupList] = useState([]);
  const [filterGroups, setfilterGroups] = useState([]);
  const [exceptionalDays, setExceptionalDays] = useState("");
  const [toggleChecked, settoggleChecked] = useState(false);
  const [cancel, setcancel] = useState(true);
  const [areaClick, setareaClick] = useState(false);
  const [dropClick, setdropClick] = useState(false);
  const [groupNameInput, setgroupNameInput] = useState("");
  const [groupValue, setgroupValue] = useState("");
  const [columnValidate, setcolumnValidate] = useState(false);
  const [afterClick, setafterClick] = useState(false);
  const [specialSettingValidation, setspecialSettingValidation] = useState(false);
  const [reciFilter, setreciFilter] = useState(false);
  const [responseQuick, setresponseQuick] = useState(null);
  const [pulseBool, setpulseBool] = useState(false);
  const [TimeBool, setTimeBool] = useState(false);
  const [dropIndex, setdropIndex] = useState(-1);
  const [noTrue, setnoTrue] = useState(false);
  const [snackbarRecipients, setsnackbarRecipients] = useState(false);
  const [bsDot, setbsDot] = useState(false);
  const [model, setModel] = useState({
    ID: 0
  });
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
  const [pulsePer, setpulsePer] = useState("percent");
  const [pulseAmount, setPulseAmount] = useState("");
  const [timeInterval, setTimeInterval] = useState("");
  const [random, setrandom] = useState("");
  const [estimationDate, setestimationDate] = useState(null);
  const [minName, setminName] = useState("");
  const [hourName, sethourName] = useState("Hours");
  const [spectialDateFieldID, setDateFieldID] = useState("0");
  const [newVal, setnewVal] = useState(false);
  const [RecipientsSnackbar, setRecipientsSnackbar] = useState(false);
  const [areaData, setareaData] = useState("");
  const [RecipientsBool, setRecipientsBool] = useState(false);
  const [editT, seteditT] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [totalCampaigns, settotalCampaigns] = useState([]);
  const [typedData, settypedData] = useState([]);
  const [displayFilter, setdisplayFilter] = useState(false);
  const [selectArray, setselectArray] = useState([]);
  const [dataSaved, setdataSaved] = useState({
    campaignName: "",
    fromNumber: "",
    msg: "",
    CreditPerSms: 0
  })
  const [initialheadstate, setinitialheadstate] = useState([]);
  const [dialogType, setDialogType] = useState({ type: null });
  const [selectedFilterCampaigns, setFilterCampaigns] = useState([]);
  const [selectedFilterGroups, setFilterGroups] = useState([]);
  const [timeType, setTimeType] = useState(-1);
  const [pulseType, setPulseType] = useState(-1);
  const [otpPassed, setOtpPassed] = useState(false);
  const [OtpCounter, setOtpCounter] = useState(false);
  const [otpMsgs, setotpMsgs] = useState("Required Field");
  const [otpValue, setotpValue] = useState(null);
  const [groupNameExist, setGroupNameExist] = useState(false);
  //#endregion
  // const [smsCampaignSettings, setSmsCampaignSettings] = useState({
  //   FutureDateTime: null,
  //   Groups: null,
  //   PulseSettings: {
  //     PulseType: null,
  //     TimeType: null,
  //     PulseAmount: -1,
  //     TimeInterval: null
  //   },
  //   RandomSettings: {
  //     RandomAmount: null
  //   },
  //   SendExeptional:
  //   {
  //     Groups: null,
  //     Campaigns: null,
  //     ExceptionalDays: null
  //   },
  //   SendTypeID: 1,
  //   SmsCampaignID: -1,
  //   SourceTimeZone: "Asia/Calcutta",
  //   SpecialSettings: {
  //     Type: "",
  //     DateFieldID: -1,
  //     Day: 0,
  //     SendHour: "",
  //     IntervalTypeID: -1,
  //     SendDate: null
  //   }
  // })

  useEffect(() => {
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
        value: "Cellphone",
        label: t("common.cellphone")
      }
    ]);
  }, [!showLoader]);

  const toastMessages = {
    SUCCESS: { severity: 'success', color: 'success', message: t('sms.saved'), showAnimtionCheck: true },
    GROUP_CREATED_SUCCESS: { severity: 'success', color: 'success', message: t("sms.groupSaved"), showAnimtionCheck: true },
    SAVE_SETTINGS: { severity: 'success', color: 'success', message: t('sms.settings_saved'), showAnimtionCheck: true },
    ERROR: { severity: 'error', color: 'error', message: t('sms.error'), showAnimtionCheck: true },
    OTP: { severity: 'success', color: 'success', message: t('sms.otpVerifiedSuccess'), showAnimtionCheck: true },
    INVALID_RECIPIENTS: { severity: 'error', color: 'error', message: t("sms.noRecipientToUpdate"), showAnimtionCheck: false },
    NO_GROUPS: { severity: 'error', color: 'error', message: t('smsReport.NoGroups'), showAnimtionCheck: false },
    DATE_PASS: { severity: 'error', color: 'error', message: t('smsReport.pastDateSelected'), showAnimtionCheck: false }
  }

  const [headers, setheaders] = useState(initialheadstate);

  const isOtpPassed = async () => {
    if (dataSaved.fromNumber !== null && dataSaved.fromNumber !== '') {
      await dispatch(IsOTPPassed(dataSaved.fromNumber));
    }
  }
  const getData = async () => {
    setLoader(true);
    if (props && props.match.params.id) {
      const finishedCampaigns = await dispatch(getFinishedCampaigns());
      const subAccountGroups = await dispatch(getGroupsBySubAccountId());
      const campaignSettings = await dispatch(getCampaignSettings(props.match.params.id))
      settotalCampaigns(finishedCampaigns.payload);
      setGroupList(subAccountGroups.payload);
      if (campaignSettings.payload && campaignSettings.payload.PulseSettings) {
        setTimeType(campaignSettings.payload.PulseSettings.TimeType);
        setPulseType(campaignSettings.payload.PulseSettings.PulseType);
        setPulseAmount(`${campaignSettings.payload.PulseSettings.PulseAmount}`)
        setTimeInterval(`${campaignSettings.payload.PulseSettings.TimeInterval}`)
      }

      if (campaignSettings.payload.Groups !== null) {
        const selectedGroupsForSend = [];
        const seGroups = campaignSettings.payload.Groups;
        for (var i = 0; i < seGroups.length; i++) {
          const g = subAccountGroups.payload.filter((c) => { return c.GroupID === seGroups[i] });
          if (g.length > 0) {
            selectedGroupsForSend.push(g[0]);
          }
        }
        setSelected(selectedGroupsForSend);
      }
      if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.Groups.length !== 0) {
        setbsDot(true);
        const selectedGroups = [];
        const seGroups = campaignSettings.payload.SendExeptional.Groups;
        for (var i = 0; i < seGroups.length; i++) {
          selectedGroups.push(subAccountGroups.payload.filter((c) => { return c.GroupID === seGroups[i] })[0]);
        }
        setFilterGroups(selectedGroups);
      }
      if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.Campaigns.length !== 0) {
        const selectedCampaigns = [];
        const seCampaigns = campaignSettings.payload.SendExeptional.Campaigns;
        for (var i = 0; i < seCampaigns.length; i++) {
          selectedCampaigns.push(finishedCampaigns.payload.filter((c) => { return c.SMSCampaignID === seCampaigns[i] })[0]);
        }
        setFilterCampaigns(selectedCampaigns);
      }
      if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.ExceptionalDays !== -1) {
        setExceptionalDays(`${campaignSettings.payload.SendExeptional.ExceptionalDays}`)
        settoggleReci(true);

      }
      if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseSettingsID !== -1) {
        settogglePulse(true);
      }
      if (campaignSettings.payload.RandomSettings != null && campaignSettings.payload.RandomSettings.RandomAmount !== 0) {
        setrandom(campaignSettings.payload.RandomSettings.RandomAmount);
        settoggleRandom(true);
      }
      if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseType === 2) {
        setnoTrue(true);
        setpulsePer("");
        setpulseReci("Recipients");
      }
      if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseType === 1) {
        setpulsePer("percent");
        setnoTrue(false);
        setpulseReci("");
      }
      if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.TimeType === 1) {
        setminName("Mins");
        sethourName("");
      }
      if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.TimeType === 2) {
        // sethoursTrue(true);
        // setminTrue(false);
        setminName("");
        sethourName("Hours");
      }
      if (campaignSettings.payload.SendTypeID) {
        setSendType(`${campaignSettings.payload.SendTypeID}`);
      }
      if (campaignSettings.payload.FutureDateTime !== null && campaignSettings.payload.SendTypeID === 2) {
        handleFromDate(moment(campaignSettings.payload.FutureDateTime));
      }
      if (campaignSettings.payload.SendTypeID === 3) {
        setdaysBeforeAfter(campaignSettings.payload.SpecialSettings.Day);
        setsendTime(moment(campaignSettings.payload.SpecialSettings.SendHour))
        setDateFieldID(`${campaignSettings.payload.SpecialSettings.DateFieldID}`)
        if (campaignSettings.payload.SpecialSettings.IntervalTypeID === -1) {
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

      setLoader(false);
    }
  };

  useEffect(async () => {
    await isOtpPassed();
  }, [dataSaved]);

  useEffect(() => {
    setOtpPassed(OTPPassed);
    if (OTPPassed === false) {
      setDialogType({ type: "otpVerification" });
    }
  }, [OTPPassed])

  useEffect(() => {
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
  }, []);

  const getSavedData = async () => {
    if (props && props.match.params.id) {
      let response = await dispatch(getSmsByID(props.match.params.id))
      setLoader(false)
      if (response) {
        setdataSaved({ ...dataSaved, campaignName: response.payload.Name, fromNumber: response.payload.FromNumber, msg: response.payload.Text, CreditPerSms: response.payload.CreditsPerSms })
      }
    }
  }

  //#region OTP
  const otpProps = {
    maxLength: "5"
  }
  const handleVerifyOTP = async () => {
    setLoader(true);
    setDialogType(null);

    let payload = {
      "Cellphone": dataSaved.fromNumber,
    }
    let r = await dispatch(getSMSRequestOTP(payload))
    setLoader(false);
    setDialogType({ type: 'otpCode' });
  }
  const submitOtp = async () => {
    let payload =
    {
      "Cellphone": dataSaved.fromNumber,
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
            value={dataSaved.fromNumber}
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
              {t("sms.OtpSentSuccessLine1")} <strong>{dataSaved.fromNumber}</strong>
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
            onClick={() => { setOtpPassed(true); setDialogType(null) }}>
            {t('common.Ok')}
          </Button>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setOtpPassed(true); setDialogType(null) },
      onConfirm: () => { setOtpPassed(true); setDialogType(null) }
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
      onConfirm: () => { handleAlertoff() }
    }
  }

  const handleAlertoff = () => {
    setDialogType(null);
  }
  //#endregion

  const callbackSelectAll = () => {
    if (!allGroupsSelected) {
      setSelected(groupList);
    } else {
      setSelected([]);
    }
    setAllGroupsSelected(!allGroupsSelected);
  };

  const handleSendType = (event) => {
    if (event.target.value == "1") {
      setModel({ ...model, SendDate: null });
      handleFromDate(null);
    }
    else if (event.target.value == "3") {
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
      setToastMessage(toastMessages.DATE_PASS);
    }

    handleFromDate(date);
    setTimePickerOpen(false);
  };
  const handleRadioTime = (value) => {
    setsendTime(value)
  }
  const handleCombined = async () => {
    const nameExist = groupList.filter((g) => { return g.GroupName === groupValue });
    if (nameExist.length > 0) {
      setGroupNameExist(true);
      return;
    }

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
    setToastMessage(toastMessages.GROUP_CREATED_SUCCESS);
  };
  const onHandleDelete = () => {
    setDialogType({ type: "delete" });
  };
  const inputGroup = (e) => {
    setGroupNameExist(false);
    setgroupValue(e.target.value);
  };
  const handlePulseClose = () => {

    if (pulseAmount == "" || timeInterval == "") {
      settogglePulse(false)
    }
    if (random == "") {
      settoggleRandom(false)
    }
    //setpulse(false);
    setDialogType(null);
  };
  const handlePulseConfirm = () => {
    if (onPulseValidations()) {
      setDialogType(null);
    }
  }
  const handleTime = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setTimeInterval(e.target.value);
      setTimeBool(false);
    }
  };
  const handleRandom = (e) => {
    const re = /^[0-9\b]+$/;
    const totalRecipients = selectedGroups.reduce(function (a, b) {
      return a + b['Recipients'];
    }, 0);

    if ((e.target.value === '' || re.test(e.target.value))) {
      if (pulseType === 1) {
        if (Number(e.target.value) > totalRecipients) {
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
        if (Number(e.target.value) > totalRecipients) {
          setrandom(totalRecipients)
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
      if (pulseType === 1) {
        if (Number(e.target.value) > 100) {
          setPulseAmount("100");
        }
        else {
          setPulseAmount(e.target.value);
        }
      }
      else {
        if (Number(e.target.value) > selectedGroups.reduce(function (a, b) {
          return a + b['Recipients'];
        }, 0)) {
          setPulseAmount(selectedGroups.reduce(function (a, b) {
            return a + b['Recipients'];
          }, 0))
        }
        else {
          setPulseAmount(e.target.value);
        }
      }
      setpulseBool(false);
    }
  };
  const onPulseValidations = () => {
    let isValid = true;
    if (togglePulse) {
      if (pulseAmount === "") {
        setpulseBool(true);
        setsnackBarPulseBoolean(true);
      }
      if (timeInterval === "") {
        setsnackbarTimeBoolean(true);
        setTimeBool(true);
        isValid = false;
      }
    }
    if (toggleRandom) {
      if (random === "") {
        setboolRandom(true);
        setsnackbarMainPulse(true);
        isValid = false;
      }
    }
    return isValid;
  }
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
                setDialogType({ type: "manualUpload" });
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
            classes={{ tooltip: styles.customWidth }}
          >
            <span className={classes.bodyInfo}>i</span>
          </Tooltip>
        </Grid>
        <Grid item md={12} xs={12} className={classes.tabDiv}>
          <Grid item md={12} xs={12}
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
          </Grid>
          <Grid item md={12} xs={12}
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
                settoggleChecked(false)
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
          </Grid>

        </Grid>
        {manualClick ? (
          <Grid item md={12} xs={12} className={
            highlighted
              ? clsx(classes.greenManual)
              : clsx(classes.areaManual)
          }>
            <textarea
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
              list={groupList}
              selectedList={selectedGroups}
              callbackSelectedGroups={callbackSelectedGroups}
              callbackUpdateGroups={callbackUpdateGroups}
              callbackSelectAll={callbackSelectAll}
              callbackReciFilter={callbackFilter}
              isSms={true}
              bsDot={bsDot}
              uniqueKey={'groups_1'}
              innerHeight={325}
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
                  {groupNameExist ? <span style={{ marginTop: "8px", color: "red", fontSize: "12px", display: 'block' }}>{t("sms.groupNameExists").replace("#groupName#", groupValue)}</span> : null}
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
                  placement={'bottom'}
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
        </Grid>
      </Grid>
    );
  };
  const handleFilterConfirm = () => {
    let formIsvalid = true;
    if (toggleReci) {
      formIsvalid = validationCheck();
      if (formIsvalid) {
        if (selectedFilterGroups.length !== 0 || exceptionalDays !== "" || selectedFilterCampaigns.length !== 0) {
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
      if (selectedFilterGroups.length !== 0 || exceptionalDays !== "" || selectedFilterCampaigns.length !== 0) {
        setsnackbarRecipients(true);
        setreciFilter(false);
        setbsDot(true);
      }
      else {
        setreciFilter(false);
        setbsDot(false);
      }
    }
    if (formIsvalid) {
      setDialogType(null);
    }

  };
  const handlePasted = () => {
    let temp = areaData;
    let a = temp.split("\n");
    let b = [];
    let cols = 0;
    if (temp.indexOf("\t") > -1) {
      console.log("in if tab")
      for (let i = 0; i < a.length; i++) {
        let splitted = a[i].split("\t");
        b.push(splitted);
        if (splitted.length > cols) {
          cols = splitted.length;
        }
      }
    }
    else {
      for (let i = 0; i < a.length; i++) {
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

    seteditT(true);
    setDialogType({ type: "manualUpload" });
  };
  const handleReciInput = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setExceptionalDays(e.target.value);
      setRecipientsBool(false);
    }

  }
  const validationCheck = () => {
    if (exceptionalDays === "") {
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
                  pointerEvents: sendType == "2" ? "auto" : "none",
                }}
              >
                <DateField
                  minDate={moment()}
                  classes={classes}
                  value={sendType == "2" ? sendDate : null}
                  onChange={handleDatePicker}
                  placeholder={t("notifications.date")}
                  timePickerOpen={true}
                  dateActive={sendType == "2" ? false : true}
                />
              </Box>
              <Box
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  pointerEvents: sendType == "2" ? "auto" : "none",
                }}
              >
                <DateField
                  minDate={moment()}
                  classes={classes}
                  value={sendType == "2" ? sendDate : null}
                  onTimeChange={handleTimePicker}
                  placeholder={t("notifications.hour")}
                  isTimePicker={true}
                  ampm={false}
                  timeActive={sendType == "2" ? false : true}
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
                className={classes.dateBox}
                style={{
                  marginTop: 10,
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
                    width: 300,
                    outline: "none",
                    marginBottom: "10px",
                  }}
                  disabled={sendType === "3" ? false : true}
                  onChange={(e) => { handleSelectChange(e) }}
                  value={sendType === "3" ? spectialDateFieldID : "0"}
                >
                  <option value="0" >Select</option>
                  <option value="1">{t("mainReport.birthday")}</option>
                  <option value="2">{t("mainReport.creationDay")}</option>
                  {extraData && Object.keys(extraData).map((item, i) => {
                    if (extraData[item]) {
                      return item.toLowerCase().indexOf('extradate') > -1 && <option value={i + 3} key={`extrakey_${i}`}>{Object.values(extraData[item])}</option>;
                    }
                    return <></>
                  })}
                </select>
              </Box>

              <Box
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  width: "370px",
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

                <span style={{ marginInlineEnd: "8px", marginBottom: "8px", fontSize: 14 }}>
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
                className={classes.dateBox}
                style={{
                  marginTop: 10,
                  pointerEvents: sendType == "3" ? "auto" : "none",
                  marginBottom: '1rem'
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
        <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />
        <div className={classes.pulseDiv}>
          <span
            className={(selectedGroups.length >= 1 && sendType !== "3") ? classes.pulse : classes.pulseDisable}
            onClick={() => {
              setDialogType({ type: "pulses" });
              // setpulse(true);
            }}
          >
            <FaRegCalendarAlt style={{ fontSize: '125%' }} />
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
              {t("smsReport.packetSend")} - {pulseAmount} {pulsePer == "" ? t("sms.recipients") : t("common.Percent")} {" "}
              {t("sms.every")} {timeInterval} {hourName == "" ? t("common.minutes") : t("common.hours")}
            </span>
          ) : null}
          {toggleRandom ? (
            <span>{t("smsReport.randomSend")} - {random} {t("smsReport.randomRecipients")}</span>
          ) : null}
        </div>
      </div>
    );
  }

  const onSaveSettings = async (toggle, exit) => {
    if (otpPassed === false) {
      setDialogType({ type: "otpVerification" });
      return;
    }
    if (selectedGroups.length <= 0) {
      setToastMessage(toastMessages.NO_GROUPS);
      return;
    }
    setLoader(true);
    const requestPayload = {
      FutureDateTime: null,
      Groups: selectedGroups.map((sg) => { return sg.GroupID }),
      PulseSettings: {
        PulseType: pulseType,
        TimeType: timeType,
        PulseAmount: pulseAmount,
        TimeInterval: timeInterval
      },
      RandomSettings: {
        RandomAmount: random
      },
      SendExeptional:
      {
        Groups: selectedFilterGroups.map((c) => { return c.GroupID }),
        Campaigns: selectedFilterCampaigns.map((c) => { return c.SMSCampaignID }),
        ExceptionalDays: exceptionalDays
      },
      SendTypeID: sendType,
      SmsCampaignID: props.match.params.id,
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
    if (sendType === "2") {
      if (sendDate === null) {
        setsendType2Dialog(true);
        return;
      }
      else {
        const finalDate = moment(sendDate, "YYYY-MM-DD HH:mm:ss");
        finalDate.set({ h: finalDate.format("HH"), m: finalDate.format("mm") });
        requestPayload.FutureDateTime = finalDate.format();
      }
    }
    else if (sendType === "3") {
      if (sendTime === null || daysBeforeAfter === "" || spectialDateFieldID === "0") {
        setspecialSettingValidation(true);
        return;
      }
      else {
        requestPayload.SpecialSettings.IntervalTypeID = afterClick ? 1 : 0;
        requestPayload.SpecialSettings.DateFieldID = spectialDateFieldID;
        requestPayload.SpecialSettings.Day = daysBeforeAfter;
        requestPayload.SpecialSettings.SendHour = moment(sendTime).format("HH:mm");;
        requestPayload.SpecialSettings.SendDate = null;
      }
    }

    const settingsSaved = await dispatch(saveSmsCampSettings(requestPayload));
    setLoader(false);
    if (settingsSaved.payload === true) {
      if (toggle && exit !== "exit") {
        setToastMessage(toastMessages.SUCCESS);
      }
      else if (toggle && exit == "exit") {
        history.push("/SMSCampaigns");
      }
      else {
        let response = await dispatch(getCampaignSumm(requestPayload.SmsCampaignID));
        setresponseQuick(response);
        setsummModal(true);
        let date = moment();
        let addTime = 0;

        if (pulseType === 2) {

          addTime =
            ((response.payload.FinalCount -
              pulseAmount) *
              timeInterval) /
            pulseAmount;
          let final = moment(date).add(addTime, pulseType === 2 ? "h" : "m").format("DD/MM/YYYY - HH:mm");
          setestimationDate(final);
        }

        else {

          let recipientPercents =
            (response.payload.FinalCount *
              pulseAmount) /
            100;
          addTime =
            ((response.payload.FinalCount - recipientPercents.toFixed(1)) *
              timeInterval) /
            recipientPercents.toFixed(1);
          let final = moment(date).add(addTime, pulseType === 2 ? "h" : "m").format("DD/MM/YYYY - HH:mm");
          setestimationDate(final);
        }
      }
    }
  };
  const handleSummary = () => {
    setDialogType(null);
    setsummModal(false);
  }
  const renderSummary = () => {
    return (
      <>
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
          displayGroups={filterGroups}
          displayCampaigns={totalCampaigns}
          open={summModal}
        />
      </>
    );
  };
  const onApiCall = async () => {
    let payload = {
      "SmsCampaignID": props.match.params.id,
      "SubAccountID": -1,
      "AccountID": -1,
      "Credits": dataSaved.CreditPerSms,
      "TotalRecipients": getCampaignSum.FinalCount
    }
    setLoader(true);
    let r = await dispatch(sendSms(payload))
    setLoader(false);

    setsummModal(false);
    setDialogType({ type: "sendSuccess" });
  };
  const handleCautionCancel = () => {
    if (dropClick === true || areaClick === true) {
      setDialogType({ type: "caution" })
      setgroupNameInput("");
      setnewVal(false);
      setcolumnValidate(false);
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

      if (selectArray[i].value === name) {
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
              let key = translateHebrewColumns(headers[k].toLocaleString().replaceAll(" ", ""));
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
              let key = translateHebrewColumns(headers[i].toLocaleString().replaceAll(" ", ""));
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


      if (r.payload.Reason == "no_recipients_to_update") {
        setToastMessage(toastMessages.INVALID_RECIPIENTS)
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
    let columnHasValue = 0;
    headers.forEach((value) => {
      if (value !== t("sms.adjustTitle")) {
        columnHasValue = columnHasValue + 1
      }
    })
    if (columnHasValue < 3) {
      setcolumnValidate(true);
      return false;
    }
    else if (columnHasValue === 3) {
      setcolumnValidate(false);
      return true;
    }

  }

  const handleDelete = () => {
    if (props && props.match.params.id) {
      dispatch(deleteSms(props.match.params.id));
      setDialogType(null);
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
  const handleConfirmC = () => {
    setContacts([]);
    setareaData("");
    for (let i = 0; i < selectArray.length; i++) {
      selectArray[i].isdisabled = false;
      selectArray[i].idx = -1;
    }
    setDialogType(null);
    settypedData([]);
  };
  const handlePreviousPage = () => {
    window.location = `/react/sms/edit/${props.match.params.id}`;
  }
  const renderHtml = (html) => {
    function createMarkup() {
      return { __html: html };
    }
    return (
      <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
  }
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
            {spectialDateFieldID == "0" ? <li>Must select Special Date Type</li> : null}
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
        <div className={classes.rightMostContainer}>
          <Button
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue,
              classes.backButton,
              isRTL && windowSize !== 'xs' ? classes.marginLeftAuto : windowSize !== 'xs' ? classes.marginRightAuto : null
            )}
            color="primary"
            style={{ margin: '8px' }}
            onClick={() => { handlePreviousPage() }}>
            <span style={{ marginInlineEnd: "5px" }}>{"<"}</span>
            {t("smsReport.back")}
          </Button>
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
            onClick={() => { setDialogType({ type: "exit" }) }}>
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
              onSaveSettings(true);
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
              onSaveSettings(false)
            }}>
            {t("mainReport.summary")}
          </Button>
        </div>
      </div>
    );
  }
  //#region Filter modal
  const filterRecipientsDialog = () => {
    return {
      title: t('mainReport.recipientFilter'),
      showDivider: true,
      icon: (
        <MdAutorenew style={{ fontSize: 30, color: "#fff" }} />
      ),
      content: (
        <Box>
          <div
            className={classes.reciCheckoxContainer}
          >
            <Checkbox
              checked={toggleReci}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                settoggleReci(!toggleReci);
                setExceptionalDays("");
              }}
            />
            <span style={{ display: 'inline-block', marginTop: 2 }} className={classes.font13}>
              {t("smsReport.filterInputText")}
            </span>
            <div style={{ marginRight: isRTL ? 'auto' : null, marginLeft: !isRTL ? 'auto' : null }}>
              <input
                type="text"
                disabled={toggleReci ? false : true}
                className={
                  toggleReci
                    ? RecipientsBool ? clsx(classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.success)
                    : clsx(classes.pulseInsert)
                }
                onChange={(e) => { handleReciInput(e) }}
                value={exceptionalDays}
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
                  list={groupList}
                  selectedList={selectedFilterGroups}
                  callbackUpdateGroups={callbackUpdateGroupFilterd}
                  callbackSelectedGroups={callbackFilteredGroups}
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
                  isSms={false}
                  bsDot={false}
                  classes={classes}
                  showSortBy={false}
                  showSelectAll={false}
                  isNotifications={false}
                  isCampaign={true}
                  list={totalCampaigns}
                  selectedList={selectedFilterCampaigns}
                  callbackUpdateGroups={callbackUpdateCampaignFilter}
                  callbackSelectedGroups={callbackFiltertedCampaigns}
                  noSelectionText={t("sms.NoFilteredCampaigns")}
                  innerHeight={160}
                  uniqueKey={'campaigns'}
                />
              </div>
            </div>
          </div>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null) },
      onConfirm: () => { handleFilterConfirm() }
    }
  }
  const callbackUpdateGroupFilterd = (groups) => {
    setFilterGroups(groups);
  }
  const callbackFilteredGroups = (group) => {
    const found = selectedFilterGroups
      .map((g) => {
        return g.GroupID;
      })
      .includes(group.GroupID);
    if (found) {
      setFilterGroups(selectedFilterGroups.filter((c) => c.GroupID !== group.GroupID));
    } else {
      setFilterGroups([...selectedFilterGroups, group]);
    }
  }
  const callbackUpdateCampaignFilter = (campaigns) => {
    setFilterCampaigns(campaigns)
  }
  const callbackFiltertedCampaigns = (campaign) => {
    const found = selectedFilterCampaigns
      .map((c) => {
        return c.SMSCampaignID;
      })
      .includes(campaign.SMSCampaignID);
    if (found) {
      setFilterCampaigns(selectedFilterCampaigns.filter((c) => c.SMSCampaignID !== campaign.SMSCampaignID))
    } else {
      setFilterCampaigns([...selectedFilterCampaigns, campaign]);
    }
  }
  //#endregion
  //#region Dialogs
  const manualUploadDialog = () => {
    return {
      title: t('sms.columnAdjustment'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
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
                className={newVal ? clsx(classes.textInput, classes.error) : clsx(classes.textInput, classes.success)}
                onChange={handleManualDialog}
                value={groupNameInput}
              ></TextField>
              {newVal ? <span className={classes.errorLabel}>{t("sms.groupNameExists").replace("#groupName#", groupNameInput)}</span> : null}
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
              classes={{ tooltip: styles.customWidth }}
            >
              <Typography className={classes.bodyInfo}>i</Typography>
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
                          <Typography style={{ fontWeight: "700", cursor: "pointer", marginInlineEnd: "20px" }} className={columnValidate === true && headers[idx] === t("sms.adjustTitle") ? classes.columnError : null}>{headers[idx]}</Typography>

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
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Typography>{renderHtml(t("sms.reset_manual_upload_notice"))}</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType({ type: "manualUpload" }); },
      onCancel: () => { setDialogType({ type: "manualUpload" }); },
      onConfirm: () => { handleConfirmC() }
    }
  }
  const pulseDialog = () => {
    return {
      title: t('smsReport.pulseSending'),
      showDivider: true,
      icon: (
        <div className={classes.dialogIconContent}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={clsx(classes.pulseDialog, classes.mb25)}>
          <Box className={classes.mb15}
          >
            <Checkbox
              style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
              checked={togglePulse}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                settogglePulse(!togglePulse);
                setPulseAmount("");
                setTimeInterval("");
              }}
            />
            <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.packetSend")}</Typography>
          </Box>
          <Box
            className={classes.topPulseDiv}
          >
            <Box>
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
                  value={pulseAmount}
                  onChange={handlePulseInput}
                />
                <div className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                  <span
                    className={
                      togglePulse
                        ? pulseType === 1
                          ? clsx(classes.percentTrue)
                          : clsx(classes.toggleActive)
                        : clsx(classes.toggleEnd)
                    }
                    onClick={() => {
                      setPulseType(1);
                      setnoTrue(false);
                      setpulsePer("percent");
                      setpulseReci("");
                      setPulseAmount("");
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
                        : clsx(classes.toggleStart)
                    }
                    onClick={() => {
                      setPulseType(2);
                      setnoTrue(true);
                      setpulsePer("");
                      setpulseReci("Recipients");
                      setPulseAmount("");
                    }}
                  >
                    {t("smsReport.Reci")}
                  </span>
                </div>
              </div>
            </Box>
            <Box>
              <span
                className={classes.noOfReci}
              >
                {t("smsReport.timeSend")}
              </span>
              <Box
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
                  value={timeInterval}
                  maxLength="3"
                />

                <Box className={clsx(classes.commonFieldPulse, classes.mr5, classes.ml5)} style={{ direction: isRTL ? 'ltr' : 'none' }}>
                  <span
                    className={
                      togglePulse
                        ? timeType === 2
                          ? clsx(classes.percentTrue)
                          : clsx(classes.toggleActive)
                        : clsx(classes.toggleEnd)
                    }
                    onClick={() => {
                      setTimeType(2);
                      setminName("");
                      sethourName("hours");
                    }}
                  >
                    {t("smsReport.Hours")}
                  </span>
                  <span
                    className={
                      togglePulse
                        ? timeType === 1
                          ? clsx(classes.reciTrue)
                          : clsx(classes.reciActive)
                        : clsx(classes.toggleStart)
                    }
                    onClick={() => {
                      setTimeType(1);
                      setminName("mins");
                      sethourName("");
                    }}
                  >
                    {t("smsReport.min")}
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            className={classes.randomSendDiv}
          >
            <Checkbox
              style={{ marginRight: windowSize !== 'xs' ? -15 : -10, marginLeft: windowSize !== 'xs' ? -15 : -10 }}
              checked={toggleRandom}
              color="primary"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onClick={() => {
                settoggleRandom(!toggleRandom);
                setrandom("");
              }}
            />
            <Typography className={clsx(classes.ps15, classes.pe15, classes.bold, classes.dInlineBlock)}>{t("smsReport.randomSend")}</Typography>
          </Box>
          <Box className={classes.randomRows}>
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
                  ? boolRandom ? clsx(classes.ml5, classes.mr5, classes.pulseActive, classes.error) : clsx(classes.pulseActive, classes.ml5, classes.mr5)
                  : clsx(classes.pulseInsert, classes.ml5, classes.mr5)
              }
              value={random}
              onChange={handleRandom}
            />
          </Box>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { handlePulseClose() },
      onCancel: () => { handlePulseClose() },
      onConfirm: () => { handlePulseConfirm() }
    }
  }
  const deleteDialog = () => {
    return {
      title: t('mainReport.deleteCamp'),
      showDivider: true,
      confirmText: t("common.Yes"),
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />
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
      onClose: () => { history.push("/SMSCampaigns"); },
      onCancel: () => { setDialogType(null) },
      onConfirm: () => { onSaveSettings(true, "exit") }
    }
  }
  const sendSuccessDialog = () => {
    return {
      showDivider: false,
      disableBackdropClick: true,
      content: (
        <Box>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <img src={Gif} style={{ width: "150px", height: "150px" }} />
            <span style={{ marginTop: "10px", fontSize: "22px", fontWeight: "700" }}>{t("sms.sent")}</span>
            <p style={{ marginTop: "10px", fontSize: "18px", fontWeight: "600" }}>
              {t("sms.campaignIsOnItsWay")}
            </p>
            <span style={{ padding: "12px", backgroundColor: "green", marginTop: "10px", cursor: "pointer", color: "#ffffff", borderRadius: "10px" }} onClick={() => { history.push("/SMSCampaigns") }}>{t("common.confirm")}</span>
          </div>
        </Box>
      ),
      renderButtons: false,
      showDefaultButtons: false,
      exit: true
    }
  }
  //#endregion
  const renderDialog = () => {
    const { type } = dialogType || {}

    const dialogContent = {
      manualUpload: manualUploadDialog(),
      filterRecipients: filterRecipientsDialog(),
      alert: alertDialog(),
      otpVerification: OTPVerificationDialog(),
      otpCode: OTPCodeDialog(),
      otpSuccess: OTPSuccess(),
      caution: cautionDialog(),
      pulses: pulseDialog(),
      delete: deleteDialog(),
      exit: exitDialog(),
      sendSuccess: sendSuccessDialog()
    }

    const currentDialog = dialogContent[type] || {}

    if (type) {
      return (
        dialogType && <Dialog
          classes={classes}
          open={dialogType}
          onClose={() => { setDialogType(null) }}
          {...currentDialog}>
          {currentDialog.content}
        </Dialog>
      )
    }
    return <></>
  }
  return (
    <DefaultScreen currentPage="sms" classes={classes} customPadding={true}>
      {renderToast()}
      <div>

        <div>
          <Title title={t("mainReport.smsCampaign")}
            classes={classes}
            stepNumber={2}
            subTitle={t("mainReport.sendSetting")}
          />
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
      {renderDialog()}
      {renderSummary()}
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
        <Alert severity="warning" className={severe.customcolor}>
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
          {t("sms.fillRandomAmount")}
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
        <Alert severity="warning" className={severe.customcolor}>
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
    </DefaultScreen>
  );
};

export default SmsSend;
