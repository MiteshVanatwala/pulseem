import React, { useState, useEffect, useRef } from "react";
import { Tooltip, Typography, FormControl, MenuItem } from "@material-ui/core";
import Select from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Toast from '../../../components/Toast/Toast.component';
import RadioGroup from "@material-ui/core/RadioGroup";
import Waze from "../../../assets/images/waze.png";
import { FaCheck } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";
import OTP from './OTP';
import { FaExclamationCircle } from 'react-icons/fa'
import { useLocation, useParams } from "react-router";
import {
	getPreviousCampaignData,
	getPreviousLandingData,
	getAccountExtraData,
	// getGroupsBySubAccountId,
	smsSave,
	deleteSms,
	smsSaveGroup,
	getSmsByID,
	smsQuick,
	getCampaignSumm,
	getCreditsforSMS,
	getTestGroups,
	getSMSVirtualNumber
} from "../../../redux/reducers/smsSlice";
import { getCommonFeatures } from '../../../redux/reducers/commonSlice';
import Summary from "./smsSummary";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import { RiCloseFill } from "react-icons/ri";
import IconButton from "@material-ui/core/IconButton";
import { Button, Grid, Box, TextField } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlinePlusCircle, AiOutlineFile } from "react-icons/ai";
import { BsTrash } from "react-icons/bs";
import { Loader } from '../../../components/Loader/Loader';
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";
import MobilePreview from '../../../components/MobilePreivew/MobilePreivew'
import EmojiPicker from "../../../components/Emojis/EmojiPicker";
import { logout } from '../../../helpers/Api/PulseemReactAPI'
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import useRedirect from "../../../helpers/Routes/Redirect";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { sitePrefix } from '../../../config';
import { Title } from "../../../components/managment/Title";
import { Stack } from "@mui/material";
import PulseemSwitch from "../../../components/Controlls/PulseemSwitch";
import { IoIosArrowDown } from "react-icons/io";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { PulseemFeatures } from "../../../model/PulseemFields/Fields";

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

const defaultAccountExtraData = [
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


const SmsCreator = ({ classes }) => {
	const { t } = useTranslation();
	const { id } = useParams();
  const queryParams = new URLSearchParams(window.location.search)
	const FromAutomation = queryParams.get("FromAutomation") || false
	const NodeToEdit = queryParams.get("NodeToEdit") || false
	document.title = t("sms.pageTitle");
	const styles = useStyles();
	const btnStyle = useStyleNew();
	const inputProps = {
		maxLength: "13"
	}

  const Redirect = useRedirect();
  const dispatch = useDispatch();
  const { windowSize, isRTL, CoreToastMessages } = useSelector(
    (state) => state.core
  );
  const {
    previousLandingData,
    previousCampaignData,
    getCampaignSum,
    testGroups,
    ToastMessages,
    extraData
  } = useSelector((state) => state.sms);
  const { accountSettings, accountFeatures } = useSelector((state) => state.common)
//   const location = useLocation();
  const [dialogType, setDialogType] = useState(null)
  const [alignment, setAlignment] = useState('right');
  const [checked, setChecked] = React.useState(false);
  const [editmenuClick, seteditmenuClick] = useState(false);
  const [campaignBool, setcampaignBool] = useState(false);
  const [restoreBool, setrestoreBool] = useState(true);
  const [campaignNumber, setcampaignNumber] = useState("");
  const [characterCount, setcharacterCount] = useState(0);
  const [linkCount, setlinkCount] = useState(0);
  const [messageCount, setmessageCount] = useState(0);
  const [removalMessageButtonDisabled, setremovalMessageButtonDisabled] = useState(false);
  const [radioBtn, setradioBtn] = useState("top");
  const [landingSearch, setlandingSearch] = useState("");
  const [CampaignSearch, setCampaignSearch] = useState("");
  const [removalLinkDisabled, setremovalLinkDisabled] = useState(false);
  const [smsCampaignId, setCampaignId] = useState("");
  const [ContactSearch, setContactSearch] = useState("");
  const [phone, setphone] = useState("");
  const [selectedGroup, setselectedGroup] = useState([]);
  const [StaticNumber, setStaticNumber] = useState("");
  const [splittedMsg, setsplittedMsg] = useState([])
  const [SplittedLinks, setSplittedLinks] = useState(null);
  const [Searched, setSearched] = useState("");
  const [modalOpen, setmodalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [removalNumber, setremovalNumber] = useState(null);
  const [storedValue, setstoredValue] = useState("");
  const [summary, setsummary] = useState(false);
  const [campaignNumberValidated, setcampaignNumberValidated] = useState(false);
  const [showLoader, setLoader] = useState(true);
  const [selectValue, setselectValue] = useState("Personilization");
  const [isTestCampaign, setIsTestCampaign] = useState(false);
  const [extraAccountDATA, setextraAccountDATA] = useState([]);
  const [isLinksStatistics, setIsLinksStatistics] = useState(true);
  const [isFromAutomation, setIsFromAutomation] = useState(false);
  const [otpOpen, setOTPOpen] = useState(null);
  const [isSiteTracking, setIsSiteTracking] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showRemovalLink, setShowRemovalLink] = useState(false);
  const [reInitFromNumber, setInitFromNumber] = useState(false);
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

	const quickSendPayload = {
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
	};
	const smsMessageRef = useRef(null);
	const FROM_NUMBER_MAX_LETTERS = 11;
	const FROM_NUMBER_MAX_NUMBERS = 13;

	useEffect(() => {
		setAlignment(isRTL ? "right" : "left");
	}, [isRTL])

  useEffect(() => {
    if (isPageLoaded && accountFeatures) {
      if (accountFeatures?.indexOf(PulseemFeatures.ADD_SMS_REMOVE_TEXT) > -1) {
        setSmsModel((currentState) => {
          if (currentState.Text === '') {
            onAddText(`${t("sms.toUnsubscribe")}${removalNumber}`);
            setremovalMessageButtonDisabled(true);
            setTimeout(() => {
              const cName = document.getElementById('campaignName');
              cName.focus();
            }, 500);
          }
          return currentState;
        });
      }
      setShowRemovalLink(!accountFeatures?.indexOf(PulseemFeatures.REMOVE_SMS_UNSUBSCRIBE_LINK) > -1)
    }
  }, [isPageLoaded, accountFeatures]);

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
			case 0: {// SUCCESS
				setToastMessage(ToastMessages.QUICK_SEND_SUCCESSS)
				break;
			}
			case 1: {// PROVISION
				setToastMessage(ToastMessages.PROVISION)
				break;
			}
			case 2: {// NO_CREDITS
				setDialogType({ type: "noCredit" });
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
			case 8: {// English letters not allowed
				setDialogType({ type: "englishLetterDialog" });
				break;
			}
			default:
			case 5: {// ACCEPTED
				break;
			}
		}
	}

	useEffect(() => {
		if (accountSettings?.SubAccountSettings) {
			siteTrackingLogic();
		}
	}, [accountSettings, smsModel]);

	useEffect(() => {
		linkCalculation();
	}, [smsModel, isSiteTracking, isLinksStatistics])

	useEffect(() => {
		getcredits(characterCount);
	}, [characterCount])

	const handleSmsModelChange = (name, value) => {
		setSmsModel(prevState => ({
			...prevState,
			[name]: value
		}));
	};

	const onApiCall = async () => {
		setLoader(true);
		setsummary(false);
		const groupIds = selectedGroup.map((g) => { return g.GroupID });
		const logData = { Credits: messageCount, TotalRecipients: getCampaignSum.FinalCount };
		const FinalPayloadData = {
			...smsModel,
			fromNumber: campaignNumber,
			Name: smsModel.Name,
			Text: smsModel.Text,
			TestGroupsIds: groupIds,
			IsTestCampaign: isTestCampaign,
			IsTest: true,
			IsLinksStatistics: isLinksStatistics,
			LogData: logData,
			SmsCampaignID: smsCampaignId
		}
		await dispatch(smsQuick(FinalPayloadData));
		setToastMessage(ToastMessages.QUICK_SEND_SUCCESSS);
		setLoader(false);
	};


	const initDispatch = async () => {
		setLoader(true);
		setCampaignId(id ?? -1);
		await dispatch(getPreviousLandingData());
		await dispatch(getPreviousCampaignData());
		await dispatch(getTestGroups());

		let resp = null;
		if (!extraData || extraData?.length === 0) {
			const ed = await dispatch(getAccountExtraData());
			resp = ed.payload;
		}
		else {
			resp = extraData;
		}

		let arr = Object.keys(resp)
		let additionalExtraData = arr.map(function (key) {
			return { [key]: resp[key] };
		});

		for (let i = 0; i < additionalExtraData.length; i++) {
			defaultAccountExtraData.push({ ...additionalExtraData[i], selected: false })
		}
		setextraAccountDATA(defaultAccountExtraData)
		if (id && FromAutomation && FromAutomation > 0) {
			setIsFromAutomation(true);
		}
		await getSavedData();
		if (!accountSettings || Object.keys(accountSettings).length === 0)
			await dispatch(getCommonFeatures());
		setInitFromNumber(true);
	}

	useEffect(() => {
		initDispatch();
	}, [dispatch]);

	useEffect(() => {
		const initFromNumber = async () => {
			let fromNumber = -1;

			if (smsModel && smsModel.FromNumber) {
				fromNumber = smsModel.FromNumber;
			}
			else if (accountSettings.DefaultCellNumber !== "") {
				fromNumber = accountSettings.DefaultCellNumber;
			}

			const virtualNumber = await dispatch(getSMSVirtualNumber(fromNumber));

			if (fromNumber === -1) {
				fromNumber = virtualNumber.payload.Number;
			}

			setcampaignNumber(fromNumber);
			setStaticNumber(virtualNumber.payload.Number);
			setremovalNumber(virtualNumber.payload.RemovalKey);
			setstoredValue(accountSettings.DefaultCellNumber);
			if (fromNumber !== virtualNumber.payload.Number) {
				setrestoreBool(false);
				setremovalMessageButtonDisabled(true);
			}
			setIsPageLoaded(true);
			setLoader(false);
		}

		if (reInitFromNumber === true) {
			initFromNumber();

		}
	}, [reInitFromNumber])

	const getAutomationReturnUrl = (campaignId) => {
		return `/pulseem/CreateAutomations.aspx?AutomationID=${FromAutomation}&NodeToEdit=${NodeToEdit}&SMSCampaignID=${campaignId}`;
	}
	const getSavedData = async () => {
		if (id) {
			let response = await dispatch(getSmsByID(id))
			if (response && !response.error) {
				setcampaignNumber(response.payload.FromNumber);
				setmessageCount(response.payload.CreditsPerSms);
				setSmsModel(response.payload);
				setIsLinksStatistics(response.payload.IsLinksStatistics);
				setcharacterCount(response.payload.Text ? response.payload.Text.length : 0);
				return response.payload;
			}
			else {
				logout();
			}
		}
	}

	const toggleChecked = () => {
		setChecked((prev) => !prev);
		setIsTestCampaign(!isTestCampaign)
	};
	const toggleKeep = () => {
		setIsLinksStatistics(!isLinksStatistics);
	};

	const linkCalculation = () => {
		const text = document.getElementById("yourMessage").value;
		let t = text.toLowerCase();
		let totalCount = t.length;

		let arr = t.split("\n");
		setsplittedMsg(arr);

		if (t && t.length > 0) {
			const res = t.replace('\r\n', ' ');
			// eslint-disable-next-line
			const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_##]*)?\??(?:[\-\+=&;%@\.\w_]*)##?(?:[\.\!\/\\\w+]*)##)?[^\s]+)/g;
			const links = res.match(regex);

			if (links && links.length > 0) {
				setlinkCount(links.length);
				if (isLinksStatistics) {
					setSplittedLinks(links);
					for (var i = 0; i < links.length; i++) {
						var linkLength = links[i].length;
						totalCount += 35 - linkLength;
					}
				}
				else {
					if (isSiteTracking === true && text.includes('ref=##ClientIDEnc##')) {
						totalCount += 9;
					}
				}

				setcharacterCount(totalCount);
			}
			else {
				setlinkCount(0);
				setcharacterCount(text.length);
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
			let credits = res.payload?.split("#");
			if (credits && credits !== '') {
				setmessageCount(credits[0]);
				handleSmsModelChange("CreditsPerSms", credits[0]);
			}
			else {
				setmessageCount(0);
				handleSmsModelChange("CreditsPerSms", 0);
			}
		});
	}
	const onCamppaignChange = (e) => {
		handleSmsModelChange("Name", e.target.value);
		setcampaignBool(false);
	};

	const onCampaignNumber = (e) => {
		const text = e.target.value;
		var lastChar = text.substring(text.length, text.length - 1);
		var isNumber = /^[0-9]*$/;
		var english = /^[A-Za-z0-9 ]*$/;

		if (!text.match(isNumber) && text.match(english) && text.length >= FROM_NUMBER_MAX_LETTERS) {
			e.target.value = text.substring(0, FROM_NUMBER_MAX_LETTERS);
		}
		if (text.match(isNumber) && text.length >= FROM_NUMBER_MAX_NUMBERS) {
			e.target.value = text.substring(0, FROM_NUMBER_MAX_NUMBERS);
		}
		if (!text.match(english)) {
			e.target.value = e.target.value.replace(lastChar, '');
		}

		setrestoreBool(false);
		setremovalMessageButtonDisabled(true);
		setcampaignNumber(e.target.value);
		setcampaignNumberValidated(false);
		e.preventDefault();
		e.stopPropagation();
	};

	const validationCheck = () => {
		let isValid = true;
		if (smsModel.Name === "") {
			setcampaignBool(true);
			isValid = false;
		}

		if (smsModel.Text === "") {
			isValid = false
		}
		let english = /^[ A-Za-z0-9]*$/;
		if (campaignNumber === "" || !english.test(campaignNumber)) {
			setcampaignNumberValidated(true);
			isValid = false;
		}
		if (!isValid) {
			setDialogType({ type: "valiateError" })
		}
		return isValid;
	};
	const handleSend = async () => {
		if (phone !== "") {
			if (id) {
				const smsQuickSendData = {
					...quickSendPayload, SmsCampaignID: id, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
						SubAccountID: accountSettings.SubAccountId, AccountID: accountSettings.AccountID, SmsCampaignID: id, Credits: messageCount,
						TotalRecipients: 1
					}
				}
				setLoader(true);
				let r = await dispatch(smsQuick(smsQuickSendData));
				setLoader(false);
				handleSendResult(r.payload.Result)
			}
			else {
				if (smsCampaignId !== "") {
					const smsQuickSendData = {
						...quickSendPayload, SmsCampaignID: smsCampaignId, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
							SubAccountID: accountSettings.SubAccountId, AccountID: accountSettings.AccountID, SmsCampaignID: smsCampaignId, Credits: messageCount,
							TotalRecipients: 1
						}
					}
					setLoader(true);
					let r = await dispatch(smsQuick(smsQuickSendData));
					setCampaignId(r.payload.SmsCampaignId)
					setLoader(false);
					handleSendResult(r.payload.Result)
				}
				else {
					const smsQuickSendData = {
						...quickSendPayload, FromNumber: campaignNumber, PhoneNumber: phone, Name: smsModel.Name, Text: smsModel.Text, IsTest: false, IsLinksStatistics: isLinksStatistics, CreditsPerSms: messageCount, LogData: {
							SubAccountID: accountSettings.SubAccountId, AccountID: accountSettings.AccountID, SmsCampaignID: -1, Credits: messageCount,
							TotalRecipients: 1
						}
					}
					setLoader(true);
					let r = await dispatch(smsQuick(smsQuickSendData));
					setCampaignId(r.payload.SmsCampaignId)
					setLoader(false);
					handleSendResult(r.payload.Result)
				}
			}
		} else {
			setToastMessage(ToastMessages.INVALID_NUMBER);
		}
	};
	const onLeave = (e) => {
		if (!modalOpen && campaignNumber !== storedValue) {
			setDialogType({ type: 'alert' });
		}
	}
	const handleRestore = async () => {
		setrestoreBool(true);
		setcampaignNumber(StaticNumber);
		setLoader(true);
		//let r = await dispatch(getCommonFeatures());
		setLoader(false);
		// setcampaignNumber(r.payload.DefaultCellNumber)
		setLoader(true);
		let response = await dispatch(getSMSVirtualNumber(accountSettings.DefaultCellNumber));
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
			if (0 === text) {
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

			focusOnMessage();
		}
	}

  const renderFields = () => {
    return (
      <Grid container spacing={4} className={classes.fieldDiv}>
        <Grid item xs={12} md={4} sm={12} className={clsx(classes.buttonForm, 'textBoxWrapper')}>
          <Typography className={classes.buttonHead}>
            {t("mainReport.campName")}
          </Typography>
          <TextField
            id="campaignName"
            type="text"
            placeholder={t("mainReport.campaignNamePlaceholder")}
            // className={classes.textField}
            className={
              clsx(classes.textField, campaignBool ? classes.error : classes.success)
            }
            onChange={onCamppaignChange}
            value={smsModel.Name}
          />
          <Typography className={classes.buttonContent}>
            {t("mainReport.campDesc")}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sm={12} className={clsx(classes.buttonForm, 'textBoxWrapper')}>
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
              clsx(classes.textField, campaignNumberValidated ? classes.error : classes.success)
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
        <Grid item xs={12} md={4} sm={12} >
          {restoreBool && removalNumber !== null ? (
            <Box className={clsx(classes.buttonForm, 'textBoxWrapper')}>
              <Typography className={clsx(classes.buttonHead)}>
                {t("mainReport.removalReply")}
              </Typography>
              <TextField
                id="outlined-basic"
                type="text"
                placeholder="2"
                disabled
                className={
                  clsx(classes.textField, windowSize === "xs" ? classes.buttonFieldRemovalMobile : classes.buttonFieldRemoval)
                }
                value={removalNumber}
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

		// let arr = smsModel.Text.split("\n");
		// setcharacterCount(characterCount + (arr.length - 1));
	};

	const onRemovalLink = async () => {
		onAddText(t('sms.smsUnsubscribeMessage'));
		let total = splittedMsg;
		total.push(t('sms.smsUnsubscribeMessage'))
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
		if (smsModel.Text.includes(t('sms.smsUnsubscribeMessage'))) {
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
					<Grid item="true" xs={12} md={8} className={classes.boxDiv}>
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
							ref={smsMessageRef}
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
            <Box className={clsx(classes.funcDiv, classes.dFlex, classes.flexWrap)}>
              <Grid container className={clsx(classes.p5, classes.borderBottom1)}>
                <Grid item xs={6} md={6} sm={6}>
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.alignToLeft")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                    <FormatAlignLeftIcon onClick={() => { setAlignment('left') }} style={{ marginInlineEnd: "4px" }} />
                  </Tooltip>
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.aligntoRight")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top-start"
                    arrow
                  >
                    <FormatAlignRightIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('right') }} />
                  </Tooltip>
                  <EmojiPicker
                    classes={classes}
                    OnSelectEmoji={(emoji) => {
                      onAddText(emoji);
                    }}
                    boxStyles={{ alignItems: 'center' }}
                  />
                </Grid>
                <Grid item xs={6} md={6} sm={6} className={classes.justifyContentEnd}>
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.selectTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top"
                    arrow
                  >
                    <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100, classes.noBorder)} >
                      <Select
                        variant="standard"
                        inputProps={{ 'aria-label': 'Without label' }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200,
                              direction: isRTL ? 'rtl' : 'ltr'
                            },
                          },
                        }}
                        value={selectValue}
                        onChange={handleSelectChange}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                      >
                        <MenuItem disabled value="Personilization">{t("mainReport.personalisationSelect")}</MenuItem>
                        {extraAccountDATA.map((item, i) => {
                          if (item.selected) {
                            return (<MenuItem disabled value={Object.keys(item)[0]} key={`extrakey_${i}`}>{t(item[Object.keys(item)[0]])}</MenuItem>)
                          }
                          else {
                            return <MenuItem value={Object.keys(item)[0]} key={`extrakey_${i}`}>{item[Object.keys(item)[0]] ? t(item[Object.keys(item)[0]]) : Object.keys(item)[0]}</MenuItem>;
                          }
                        })}
                      </Select>
                    </FormControl>
                  </Tooltip>
                </Grid>
              </Grid>

              <Grid container className={clsx(classes.p5)} onBlur={() => { seteditmenuClick(false) }}>
                <Grid
                  item xs={12} md={12} sm={12} className={clsx(windowSize === "xs" ? classes.messageButtons : classes.justifyContentEnd)} style={{paddingTop: '5px'}}
                >
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.add")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top"
                    arrow
                  >
                    <Button
                      className={clsx(classes.infoButtons, removalMessageButtonDisabled ? classes.disabled : null, classes.bgGreen)}
                      onClick={() => seteditmenuClick(!editmenuClick)}
                    >
                      <AiOutlinePlusCircle className={classes.addOptionsIcon} />
                      {t("mainReport.add")}
                    </Button>
                  </Tooltip>
                  {editmenuClick ? (
                    <Box className={classes.dropDiv} style={{ top: windowSize !== 'xs' ? (previousCampaignData.length === 0 ? "-150px" : "-200px") : null }}>
                      <Typography
                        className={classes.dropCon}
                        onClick={() => {
                          setDialogType({ type: 'latestLP' });
                          seteditmenuClick(false);
                        }}
                      >
                        {t("mainReport.landingLink")}
                      </Typography>
                      {previousCampaignData.length === 0 ? null : (
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
                  <Tooltip
                    disableFocusListener
                    title={t("mainReport.removalMsgTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top"
                    arrow
                  >
                    <Button
                      className={clsx(classes.infoButtons, removalMessageButtonDisabled ? classes.disabled : null)}
                      onClick={removalMessageButtonDisabled ? null : onRemovalMsg}
                    >
                      <Typography className={classes.editorLink}>+</Typography>
                      {t("mainReport.removalMsg")}
                    </Button>
                  </Tooltip>
                  {showRemovalLink && <Tooltip
                    disableFocusListener
                    title={t("mainReport.removalLinkTooltip")}
                    classes={{ tooltip: styles.customWidth }}
                    placement="top"
                    arrow
                  >
                    <Button
                      className={classes.infoButtons}
                      onClick={removalLinkDisabled ? null : onRemovalLink}
                    >
                      <Typography className={classes.editorLink}>+</Typography>
                      {t("mainReport.removalLink")}
                    </Button>
                  </Tooltip>
                  }
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sm={12} className={classes.pr15}>
            <Box className={classes.switchDiv}>
              <FormControlLabel
                control={
                  <PulseemSwitch
                    switchType='ios'
                    classes={classes}
                    checked={isLinksStatistics}
                    height={20}
                    width={48}
                    className={{ [classes.rtlSwitch]: isRTL }}
                    onChange={toggleKeep}
                  />
                }
                label={<Box className={classes.radio}>
                  <Typography style={{ fontSize: "18px" }}>
                    {t("mainReport.keepTrack")}
                  </Typography>
                  <Typography
                    className={classes.descSwitch}
                  >
                    {t("mainReport.keepDesc")}
                  </Typography>
                </Box>}
              />
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
        <MobilePreview classes={classes} fromNumber={campaignNumber} text={smsModel.Text} keyItem="edtiorPreview" />
        <div
          className={classes.testDiv}
        >
          <FormControlLabel
            control={
              <PulseemSwitch
                switchType='ios'
                classes={classes}
                checked={checked}
                height={20}
                width={48}
                className={clsx({ [classes.rtlSwitch]: isRTL })}
                onChange={toggleChecked}
              />
            }
            label={<div
              className={classes.testSendContaier}
            >
              <span style={{ fontSize: "18px" }}>{t("mainReport.testSend")}</span>
              <span
                className={classes.testSendDescriptionLabel}
              >
                {t("mainReport.testDesc")}
              </span>
            </div>}
          />
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
              <div className={classes.quickSendContainer}>
                <div>
                  <FormControlLabel
                    value="top"
                    control={
                      <Radio
                        color="primary"
                        id="top"
                      // style={{ color: "#007bff" }}
                      />
                    }
                  />
                  <span>{t("mainReport.sendToOne")}</span>
                </div>
                {radioBtn === "top" ? (
                  <div className={clsx(classes.rightForm, "textBoxWrapper")}>
                    <TextField
                      type="text"
                      placeholder={t("mainReport.enterPhone")}
                      className={clsx(classes.textField)}
                      value={phone}
                      inputProps={{
                        maxLength: 12
                      }}
                      onChange={handleNumberChange}
                    />
                    <Button className={clsx(classes.btn, classes.btnRounded, classes.ml5)} onClick={() => { validationCheckpoint(() => handleSend()) }}>
                      {t("mainReport.send")}
                    </Button>

                  </div>
                ) : null}
                <div>
                  <FormControlLabel
                    value="bottom"
                    control={
                      <Radio
                        color="primary"
                        id="bottom"
                      // style={{ color: "#007bff" }}
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
	};

	const siteTrackingLogic = () => {
		if (accountSettings.SubAccountSettings.DomainAddress && accountSettings.SubAccountSettings.DomainAddress !== '') {
			const domainName = accountSettings.SubAccountSettings.DomainAddress.replace('https://', '').replace('http://', '').replace('www.', '');
			if (smsModel.Text.includes(domainName)) {
				setIsSiteTracking(true);
			}
			else {
				setIsSiteTracking(false);
			}
		}
	}

	const validationCheckpoint = async (callbackFunc) => {
		if (validationCheck()) {
			if (isSiteTracking === true) {
				const smsMessagValue = smsMessageRef.current.value;
				if (!smsModel.Text.indexOf('ref') > -1 && isLinksStatistics && smsMessagValue.indexOf('ref=##ClientIDEnc##') === -1) {
					let text = smsModel.Text;
					const startIndex = smsModel.Text.substring(smsModel.Text.indexOf(accountSettings.SubAccountSettings.DomainAddress));
					const originalLink = startIndex.split(/[\s\n]+/); //.split(' ') || startIndex.split('\n');
					let originUrl = originalLink[0];
					let newUrl = originUrl.trim();
					newUrl += newUrl.indexOf('?') > -1 ? '&ref=##ClientIDEnc##' : '?ref=##ClientIDEnc##';
					text = smsModel.Text.replace(originUrl, newUrl);
					setSmsModel((currentState) => {
						currentState.Text = text;
						return currentState;
					});
				}
				if (!isLinksStatistics) {
					setDialogType({ type: 'linkStatisticAlert', data: { onConfirmFunc: () => callbackFunc(), test: 'data' } });
				}
				else {
					callbackFunc();
				}
			}
			else {
				callbackFunc();
			}
		}
	}

  const onSave = async (isSave, returnToAutomation = false) => {
    linkCalculation();
    const payloadToPush = { ...smsModel, FromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, CreditsPerSms: `${messageCount}`, IsLinksStatistics: isLinksStatistics, IsTest: isTestCampaign, AccountID: accountSettings.AccountID, SubAccountID: accountSettings.SubAccountId, SmsCampaignID: smsCampaignId }
    setLoader(true);
    let r = await dispatch(smsSave(payloadToPush));
    const campaignId = r.payload.Message;
    setCampaignId(campaignId);
    setLoader(false);
    if (r.payload.Status === 2) {
      if (isSave) {
        setToastMessage(ToastMessages.SUCCESS);
        setTimeout(() => {
          Redirect({ url: `${sitePrefix}sms/edit/${campaignId}${isFromAutomation ? "?FromAutomation=" + FromAutomation + "&NodeToEdit=" + NodeToEdit : ""}` });
          setToastMessage(null);
        }, 1500);
      } else if (returnToAutomation) {
        Redirect({ url: getAutomationReturnUrl(campaignId) });
      } else {
        Redirect({ url: `${sitePrefix}sms/send/${campaignId}` });
      }
    }
    else {
      switch (r.payload.Status) {
        case 3: {
          setOTPOpen(true);
          break;
        }
        case 8: {
          setDialogType({ type: "englishLetterDialog" });
          break;
        }
        case 9: {
          setToastMessage(CoreToastMessages.XSS_ERROR);
          break;
        }
        default: {
          break;
        }
      }
    }
  };

	const handleClose = () => {
		setDialogType(null);
	};
	const handleAddLink = async (id, linkType) => {
		let text = "";
		let campaign = {};
		if (linkType === 'campaign') {
			campaign = previousCampaignData.filter((campaign) => { return campaign.CampaignID === id });
			if (campaign && campaign.length > 0) {
				text = campaign[0].EncryptURL;
			}
		}
		else if (linkType === 'lp') {
			campaign = previousLandingData.filter((campaign) => { return campaign.CampaignID === id });
			if (campaign && campaign.length > 0) {
				text = campaign[0].PageHref;
			}
		}
		seteditmenuClick(false);
		onAddText(text)
		let lc = linkCount;
		setlinkCount(++lc);
		setDialogType(null);
		setCampaignSearch('');
		setlandingSearch('');
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
    if (id) {
      let response = await dispatch(getSmsByID(id))
      if (response) {
        dispatch(deleteSms(response.payload.SMSCampaignID));
        handleClose();
        Redirect({ url: `${sitePrefix}SMSCampaigns` });
      }
    }
    else {
      dispatch(deleteSms(-1));
      handleClose();
      Redirect({ url: `${sitePrefix}SMSCampaigns` });
    }
  };

	const handleGroupClose = async () => {
		if (selectedGroup.length > 0) {
			const groupIds = selectedGroup.map((g) => { return g.GroupID });
			const payloadToPush = { ...smsModel, fromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, TestGroupsIds: groupIds, SmsCampaignID: smsCampaignId }
			let r = await dispatch(smsSave(payloadToPush));
			setCampaignId(r.payload.Message);
			if (r.payload.Status === 2) {
				let payload2 = {
					IsTestGroups: true,
					SMSCampaignID: r.payload.Message,
					TestGroupsIds: groupIds,
				};
				handleSmsModelChange("SMSCampaignID", r.payload.Message);
				await dispatch(smsSaveGroup(payload2));
				await dispatch(getCampaignSumm(r.payload.Message));
				setsummary(true);
				setDialogType(null);
			}
			else if (r.payload.Status === 3) {
				setOTPOpen(true);
			}
			else {
				setDialogType(null);
			}
		}
	};

  const handlecaution = () => {
    setmodalOpen(false);
    setremovalNumber(null);
    setDialogType(null);
  };
  const handleAlertoff = () => {
    setcampaignNumber(storedValue);
    setDialogType(null);
  };
  const handleExit = async (saveBeforeExit) => {
    if (saveBeforeExit) {
      const payloadToPush = {
        ...smsModel,
        SmsCampaignID: smsCampaignId,
        fromNumber: campaignNumber,
        Name: smsModel.Name,
        Text: smsModel.Text,
        IsLinksStatistics: isLinksStatistics
      }
      let saveResponse = await dispatch(smsSave(payloadToPush));
      if (saveResponse) {
        if (saveResponse.payload.Status === 3) {
          setOTPOpen(true);
          return;
        }
        else if (saveResponse.payload.Status === 2) {
          setDialogType(null);
          Redirect({ url: !!FromAutomation ? getAutomationReturnUrl(id) : `${sitePrefix}SMSCampaigns` });
        }
        else {
          setDialogType(null);
          setToastMessage(ToastMessages.ERROR);
        }
      }
      else {
        setDialogType(null);
        setToastMessage(ToastMessages.ERROR);
      }
    }
    else if (saveBeforeExit === false) {
      Redirect({ url: !!FromAutomation ? getAutomationReturnUrl(id) : `${sitePrefix}SMSCampaigns` });
      setDialogType(null);
    }
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

	const focusOnMessage = () => {
		const textArea = document.getElementById("yourMessage");
		setTimeout(() => {
			textArea.focus();
		}, 500)
	}

	const onLocation = async () => {
		onAddText("https://waze.to/?q=" + Searched.split(" ").join("%20"));
		setlinkCount(linkCount + 1);
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
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
          )}
          style={{ margin: '8px' }}
          onClick={() => { setDialogType({ type: 'deleteSms' }) }}
        >
          <BsTrash style={{ fontSize: "18", marginInlineStart: 0, color: '#000', padding: '3px' }} />
        </Button>
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          style={{ margin: '8px' }}
          onClick={() => { setDialogType({ type: 'exit' }) }}>
          {t('mainReport.exitSms')}
        </Button>
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          color="primary"
          style={{ margin: '8px' }}
          onClick={() => {
            validationCheckpoint(() => onSave(true, isFromAutomation));
          }}>
          {t('mainReport.saveSms')}
        </Button>
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.backButton
          )}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          color="primary"
          style={{ margin: '8px' }}
          onClick={() => {
            validationCheckpoint(() => onSave(false, isFromAutomation));
          }}>
          {!isFromAutomation ? t("mainReport.continue") : t("sms.saveAndExit")}
        </Button>
      </div>
    );
  }
  //#region Dialogs
  const lpDialog = () => {
    return {
      title: t('mainReport.selectLanding'),
      icon: (
        <BsArrowClockwise />
      ),
      content: (
        <Box className={clsx(classes.dialogBox, classes.dialogCustomSize)}>
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
              value={CampaignSearch}
            />
          </Paper>
          <Box style={{ marginTop: 20 }}>
            {previousLandingData
              .filter((val) => {
                if (CampaignSearch === "") {
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
                    key={idx}
                    className={classes.searchCon}
                    onClick={() => {
                      handleAddLink(item.CampaignID, 'lp');
                    }}
                  >
                    <span
                      style={{ marginInlineEnd: "8px" }}
                      className={classes.grDoc}
                    >
                      <AiOutlineFile />
                    </span>
                    <span className={classes.ellipsisText}>{item.CampaignName}</span>
                  </div>
                );
              })}
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null); setCampaignSearch("") }
    }
  }
  const campaignsDialog = () => {
    return {
      title: t('mainReport.selectCamp'),
      icon: (
        <BsArrowClockwise />
      ),
      content: (
        <Box className={clsx(classes.dialogBox, classes.dialogCustomSize)}>
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
              value={landingSearch}
            />
          </Paper>
          <Box style={{ marginTop: 20 }}>
            {previousCampaignData
              .filter((val) => {
                if (landingSearch === "") {
                  return val;
                } else if (
                  val.Name.toLowerCase().includes(
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
                      handleAddLink(item.CampaignID, 'campaign');
                    }}
                  >
                    <span
                      style={{ marginInlineEnd: "8px" }}
                      className={classes.grDoc}
                    >
                      <AiOutlineFile color="#1771AD" />
                    </span>
                    <span className={classes.ellipsisText}>{item.Name}</span>
                  </div>
                );
              })}
          </Box>
        </Box>
      ),
      showDefaultButtons: false,
      onClose: () => { setDialogType(null); setlandingSearch(""); }
    }
  }
  const wazeDialog = () => {
    return {
      title: t('mainReport.waizeTitle'),
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
      ),
      content: (
        <Box className={classes.dialogBox}>
          <Paper component="form" className={btnStyle.root}>
            <img src={Waze} style={{ pointerEvents: "none" }} alt="waze" />
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
      disableBackdropClick: true,
      icon: (
        <AiOutlineExclamationCircle />
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
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box>
          <div>
            <ul className={classes.fieldsRequire}>
              {campaignBool ? <li>
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
          size='small'
          style={{ maxWidth: 100 }}
          onClick={() => { setDialogType(null) }}
          className={clsx(
            classes.btn,
            classes.btnRounded,
            classes.middle
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
      icon: (
        <HiOutlineUserGroup />
      ),
      content: (
        <Box className={clsx(classes.dialogBox, classes.dialogCustomSize)}>
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
              value={ContactSearch}
            />
          </Paper>
          <Box style={{ marginTop: 20 }}>
            {testGroups
              .filter((g) => {
                return g.Recipients > 0
              })
              .filter((val) => {
                if (ContactSearch === "") {
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
      onCancel: () => { setselectedGroup([]); setDialogType(null); setContactSearch("") },
      onClose: () => { setselectedGroup([]); setDialogType(null); setContactSearch("") },
      onConfirm: () => { validationCheckpoint(() => handleGroupClose()) }
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
      onClose: () => { handleExit(false) },
      onCancel: () => { handleExit(false) },
      onConfirm: () => { validationCheckpoint(() => handleExit(true)); }
    }
  }
  const alertDialog = () => {
    return {
      title: t('mainReport.pleaseNote'),
      showDivider: true,
      icon: (
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
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
  const noCreditDialog = () => {
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
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.notEnoughCreditLeftDesc"))}</Typography>
          <Box style={{ marginTop: 25 }}>
            <Button
              size='small'
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
  const siteTrackingLinkDialog = (data) => {
    return {
      showDivider: false,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <FaExclamationCircle style={{ fontSize: 60 }} />
          <Typography className={classes.mt2} style={{ fontWeight: 'bold' }}>{t("common.Notice")}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("siteTracking.NoticeLinkStatistics"))}</Typography>
        </Box>
      ),
      showDefaultButtons: true,
      onClose: () => { setDialogType(null) },
      onConfirm: () => {
        setDialogType(null);
        data.onConfirmFunc()
      }
    }
  }
  const englishLetterNotAllowed = () => {
    return {
      showDivider: false,
      icon: (
        <AiOutlineExclamationCircle />
      ),
      content: (
        <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <FaExclamationCircle style={{ fontSize: 100 }} />
          <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{RenderHtml(t("sms.englishLetterNotApprovedTitle"))}</Typography>
          <Typography style={{ textAlign: 'center' }}>{RenderHtml(t("sms.englishLetterNotApprovedDescription"))}</Typography>
          <Box style={{ marginTop: 25 }}>
            <Button
              size='small'
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
  const renderDialog = () => {
    const { type, data } = dialogType || {}

		const dialogContent = {
			latestLP: lpDialog(),
			latestCampaigns: campaignsDialog(),
			waze: wazeDialog(),
			deleteSms: deleteDialog(),
			valiateError: validationDialog(),
			groups: groupDialog(),
			exit: exitDialog(),
			alert: alertDialog(),
			noCredit: noCreditDialog(),
			linkStatisticAlert: siteTrackingLinkDialog(data),
			englishLetterDialog: englishLetterNotAllowed()
		}

    const currentDialog = dialogContent[type] || {}
    return (
      dialogType && <BaseDialog
        classes={classes}
        open={dialogType}
        onClose={handleClose}
        onCancel={handleClose}
        {...currentDialog}>
        {currentDialog.content}
      </BaseDialog>
    )
  }

  const renderSubHeader = () => {
    return (
      <>
        <Title
          Text={(
            <Box className='stepHead'>
              <Stack className={'stepNum'} alignItems={'center'}>
                <span >1</span>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} ml={1} >
                <span className={'stepTitle'}>
                  {t('notifications.createContent')}
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
      </>
    )
  }

	//#endregion

  return (
    <DefaultScreen subPage={"create"} currentPage="sms" classes={classes} customPadding={true} containerClass={classes.editorCont}>
      <Box className={"head"}>
        <Title
          Text={t('mainReport.smsCampaign')}
          classes={classes}
        />
      </Box>
      <Box className={'containerBody'}>
        {renderSubHeader()}
        {renderToast()}
        <Box className='bodyBlock'>
          <Grid container
            spacing={windowSize === "xs" ? 0 : 3}
            className={windowSize === "xs" || windowSize === "sm" ? classes.mobileGrid : null}
          >
            <Grid item xs={12} sm={12} md={12} lg={8}>
              {renderFields()}
              {renderMsg()}
            </Grid >
            <Grid item xs={12} sm={12} md={12} lg={4}>
              <Box style={{ maxWidth: 420, marginTop: 20 }}>
                {renderPhone()}
              </Box>
            </Grid>
            {renderButtons()}
          </Grid >
          {renderDialog()}
          {renderSummary()}
          {otpOpen && <OTP classes={classes} campaignNumber={campaignNumber} isOpen={otpOpen} onClose={() => { setOTPOpen(false); setDialogType(null); }} />}
          <Loader isOpen={showLoader} />
        </Box>
      </Box>


    </DefaultScreen >
  );
};
export default SmsCreator;
