import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { Dialog } from "../../../components/managment/index";
import { Loader } from '../../../components/Loader/Loader';
import Papa from 'papaparse';
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Notifications/Groups/Groups";
import { useNavigate, useParams } from "react-router";
import { BsTrash } from "react-icons/bs";
import * as XLSX from 'xlsx';
import WizardTitle from '../../../components/Wizard/WizardTitle'
import { Button, Grid } from "@material-ui/core";
import {
    getAccountExtraData, getFinishedCampaigns, getGroupsBySubAccountId, getTestGroups
} from "../../../redux/reducers/smsSlice";
import { combinedGroup } from "../../../redux/reducers/groupSlice";
import clsx from "clsx";
import { logout } from '../../../helpers/Api/PulseemReactAPI'
import { Stack } from "@mui/material";
import RenderToast from "../../../components/core/RenderToast";
import ManualUploadDialog from "./Popups/ManualUploadDialog";
import QuickManualUploadDialog from "./Popups/QuickManualUploadDialog";
import CautionDialog from "./Popups/CautionDialog";
import DeleteDialog from "./Popups/DeleteDialog";
import SendSuccessDialog from "./Popups/SendSuccessDialog";
import SummaryDialog from "./Popups/SummaryDialog";
import FilterRecipientsDialog from "./Popups/FilterRecipientsDialog";
import ExitDialog from "./Popups/ExitDialog";
import PulseDialog from "./Popups/PulseDialog";
import FormSendingTime from "../../../components/Wizard/FormSendingTime";
import SpecialModal from "./Popups/SpecialModal";
import { getEmailSendSettings, setEmailSendSettings } from "../../../redux/reducers/newsletterSlice";
import PreSendSummary from "./Popups/PreSendSummary";
import SegmentationDialog from "./Popups/SegmentationDialog";
import SmsMarketingDialog from "./Popups/SmsMarketingDialog";

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


const NewsletterSendSettings = ({ classes, ...props }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const styles = useStyles();
    const navigate = useNavigate();
    const params = useParams();
    const severe = useSnackSevere();
    const recipientSuccess = useSnackRecipients();
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );
    const { ToastMessages, testGroups } = useSelector((state) => state.sms);
    const [showLoader, setLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [campaignValues, setCampaignValues] = useState({});
    const [totalCampaigns, setTotalCampaigns] = useState();
    const [groupList, setGroupList] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [highlighted, setHighlighted] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [dialogType, setDialogType] = useState({ type: null });
    const [bsDot, setbsDot] = useState(false);
    const [manualValues, setManualValues] = useState({
        totalRecords: 0,
        areaData: '',
        typedData: [],
        initialheadstate: [],
        dropClick: false,
        areaClick: false,
        groupClick: false,
        manualClick: false,
        bsDot: false
    })
    const [newGroupDetails, setNewGroupDetails] = useState({
        toggleChecked: false,
        groupNameExist: false,
        groupValue: '',
    })
    const [contacts, setContacts] = React.useState([]);
    const [headers, setheaders] = useState(manualValues.initialheadstate);
    const [groupTextError, setGroupTextError] = useState(false);
    const [filterValues, setFilterValues] = useState({
        toggleReci: false,
        selectedFilterGroups: [],
        exceptionalDays: "",
        RecipientsBool: '',
        selectArray: [],
        selectedFilterCampaigns: [],
        displayFilter: false,
        reciFilter: false,
    })
    const [sourcePulses, setSourcePulses] = useState({});
    const [sendingTimeFormValues, setSendingTimeFormValues] = useState({
        PulseAmount: "",
        SendingMethod: 0,
        TimeInterval: '',
        sendType: "1",
        sendDate: null,
        sendTime: null,
        afterClick: false,
        selectedSpecialValue: "",
        daysBeforeAfter: '',
        DateFieldID: '0',
        timePickerOpen: false,
        toggleA: false,
        toggleB: false,
        togglePulse: false,
        daysBeforeAfter: "",
        spectialDateFieldID: "",
        IsBestTime: false,
        IsSummaryRequest: false
    })
    const [snackbarValues, setSnackbarValues] = useState({
        snackbarTimeBoolean: false,
        snackBarPulseBoolean: false,
        snackbarMainPulse: false,
        snackbarRecipients: false,
        recipientsSnackbar: false
    })
    const [specialSettingValidation, setspecialSettingValidation] = useState(false)

    const getData = async () => {
        setLoader(true);
        if (params?.id) {
            const finishedCampaigns = await dispatch(getFinishedCampaigns());
            const subAccountGroups = await dispatch(getGroupsBySubAccountId());
            // const subAccountGroups = await dispatch(getGroups());
            // const campaignSettings = await dispatch(getCampaignSettings(params.id));
            const tempSettings = await dispatch(getEmailSendSettings(params.id));
            const campaignSettings = tempSettings.payload;
            await dispatch(getTestGroups());


            if (campaignSettings.error) {
                logout();
            }
            // if (!campaignSettings?.Data) {
            //     return false
            // }
            let tempSendingTimeFormValues = { ...sendingTimeFormValues }
            let tempCampaignValues = { ...campaignSettings }
            let tempSelectedGroupsForSend = []
            let tempFilterValues = { ...filterValues }


            if (campaignSettings?.Data?.GroupList !== null) {
                const seGroups = campaignSettings?.Data?.GroupList || [];
                tempSelectedGroupsForSend = subAccountGroups.payload.filter((c) => seGroups.indexOf(c.GroupID) > -1);
            }

            if (campaignSettings?.Data?.PulseAmount && campaignSettings?.Data?.TimeInterval) {
                tempSendingTimeFormValues = { ...tempSendingTimeFormValues, togglePulse: true, PulseAmount: campaignSettings?.Data?.PulseAmount, TimeInterval: campaignSettings?.Data?.TimeInterval }
            }

            if (campaignSettings?.Data?.ExeptionalGroups?.length !== 0) {
                setbsDot(true);
                const selectedGroups = [];
                const seGroups = campaignSettings?.Data?.ExeptionalGroups || [];
                for (var i = 0; i < seGroups.length; i++) {
                    selectedGroups.push(subAccountGroups.payload.filter((c) => { return c.GroupID === seGroups[i] })[0]);
                }
                tempFilterValues = { ...tempFilterValues, selectedFilterGroups: selectedGroups }
            }
            if (campaignSettings?.Data?.ExeptionalCampaigns?.length !== 0) {
                const selectedCampaigns = [];
                const seCampaigns = campaignSettings?.Data?.ExeptionalCampaigns || [];
                for (var i = 0; i < seCampaigns.length; i++) {
                    selectedCampaigns.push(finishedCampaigns.payload.filter((c) => { return c.SMSCampaignID === seCampaigns[i] })[0]);
                }
                tempFilterValues = { ...tempFilterValues, selectedFilterCampaigns: selectedCampaigns }
            }
            if (campaignSettings?.Data?.SendDate !== null && campaignSettings?.Data?.SendingMethod === 2) {
                tempSendingTimeFormValues = { ...tempSendingTimeFormValues, sendDate: moment(campaignSettings?.Data?.SendDate) }
            }
            if (campaignSettings?.Data?.SendingMethod === 3) {
                // tempSendingTimeFormValues = {
                //     ...tempSendingTimeFormValues,
                //     SendingMethod: `${campaignSettings?.Data?.SendingMethod}`,
                //     SendingMethod: `${campaignSettings?.Data?.SendingMethod}`,
                //     // daysBeforeAfter: campaignSettings?.Data.SpecialSettings.Day,
                //     // sendTime: moment(campaignSettings?.Data.SpecialSettings.SendHour),
                //     // DateFieldID: `${campaignSettings?.Data.SpecialSettings.DateFieldID}`
                // }
                // if (campaignSettings?.Data.SpecialSettings.IntervalTypeID === -1) {
                //     setSendingTimeFormValues({
                //         ...sendingTimeFormValues,
                //         toggleA: false,
                //         toggleB: true,
                //         afterClick: false,
                //     })
                // }
                // else {
                //     setSendingTimeFormValues({
                //         ...sendingTimeFormValues,
                //         toggleA: true,
                //         toggleB: false,
                //         afterClick: true,
                //     })
                // }
            }

            setLoader(false);
            setCampaignValues(tempCampaignValues)
            setTotalCampaigns(finishedCampaigns.payload);
            setGroupList(subAccountGroups.payload);
            setSelectedGroups(tempSelectedGroupsForSend);
            setFilterValues(tempFilterValues)
            setSendingTimeFormValues({ ...sendingTimeFormValues, ...tempSendingTimeFormValues, SendingMethod: `${campaignSettings?.Data?.SendingMethod}`, IsBestTime: campaignSettings?.Data?.IsBestTime })
        }
        setLoader(false);
    };

    const getDataExtra = async () => {
        // COMMENT: After Refractor we nned to fetch extraData from  State 
        await dispatch(getAccountExtraData());
        setLoader(false);
    };

    useEffect(() => {
        getData();
        getDataExtra();
    }, [dispatch]);

    const handlePreviousPage = () => {
        navigate(`/react/campaigns/editor/${params.id}`)
    }

    const onHandleDelete = () => {
        setDialogType({ type: "delete" });
    };


    const onSaveSettings = async (isTrue = false) => {
        // return console.log("REMOVE RETURN TO FIRE API")
        setLoader(true)
        let payload = {
            // FromDate: null,
            // ToDate: null,
            // AutoSendingByUserField: null,
            // AutoSendDelay: 0,
            // IsOpened: true,
            // IsOpenedClicked: false,
            // IsNotClicked: false,
            // IsNotOpened: false,
            ...campaignValues,
            ExeptionalCampaigns: "",
            ExeptionalGroups: "",
            CampaignID: params.id,
            Status: campaignValues.Status,
            PulseAmount: sendingTimeFormValues.PulseAmount || campaignValues.PulseAmount,
            TimeInterval: sendingTimeFormValues.TimeInterval || campaignValues.TimeInterval,
            SendDate: sendingTimeFormValues.sendDate || campaignValues.sendDate,
            SendingMethod: sendingTimeFormValues.SendingMethod || campaignValues.SendingMethod,
            GroupIds: selectedGroups.map(grp => grp.GroupID).join(","),
            ExceptionalDays: 0,
            IsBestTime: sendingTimeFormValues.IsBestTime,
            IsSummaryRequest: isTrue
        }
        try {
            const response = await dispatch(setEmailSendSettings(payload))
        }
        catch (error) {
            console.log("ERROR-SAVE-SEND-SETTINGS:", error)
        } finally {
            setLoader(false)
        }
    }

    const handleSetPulseData = (data) => {
        const { TimeInterval, PulseAmount, SendingMethod, togglePulse } = data;
        setSendingTimeFormValues({
            ...sendingTimeFormValues,
            TimeInterval: TimeInterval ?? sendingTimeFormValues.TimeInterval,
            PulseAmount: PulseAmount ?? sendingTimeFormValues.PulseAmount,
            SendingMethod: SendingMethod ?? sendingTimeFormValues.SendingMethod,
            togglePulse: togglePulse ?? sendingTimeFormValues.togglePulse
        })
        // setPulseValues({ TimeInterval: TimeInterval ?? pulseValues.TimeInterval, PulseAmount: PulseAmount ?? pulseValues.PulseAmount, SendingMethod: SendingMethod ?? sendingTimeFormValues.SendingMethod })
    }

    const handleInputNewGroup = (e) => {
        setNewGroupDetails({ ...newGroupDetails, groupNameExist: false, groupValue: e.target.value });
    }

    const handleAreaChange = (e) => {
        setManualValues({ ...manualValues, totalRecords: e.target.value.split("\n").filter((r) => { return r !== "" }).length, areaData: e.target.value, dropClick: false })
    };

    const handleFiles = (e) => {
        e.preventDefault();
        setManualValues({ ...manualValues, areaData: e.target.value, areaClick: false, dropClick: true })
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
                            let dummyArr = [];
                            for (let i = 0; i < b[0].length; i++) {
                                dummyArr.push(t("sms.adjustTitle"));
                            }
                            setManualValues({ ...manualValues, totalRecords: b.length, typedData: b, areaData: e.target.value, areaData: b, initialheadstate: dummyArr })
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


                        Papa.parse(reader.result, {
                            config,
                            complete: results => {
                                setContacts(results.data)
                                setManualValues({ ...manualValues, totalRecords: results.data.length })
                                // settotalRecords(results.data.length)

                                const resultCsv = results.data;
                                setDialogType({ type: "manualUpload" });
                                let ddc = [];
                                for (let i in resultCsv[0]) {
                                    ddc.push(t("sms.adjustTitle"))
                                }
                                setheaders(ddc);
                            },

                        });
                        setManualValues({ ...manualValues, areaData: reader.result.substring(0, 1500) })
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
    const handlePasted = () => {
        let temp = manualValues.areaData;
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

        let dummyArr = [];
        for (let i = 0; i < cols; i++) {
            dummyArr.push(t("sms.adjustTitle"));
        }
        setManualValues({ ...manualValues, initialheadstate: dummyArr, typedData: b })
        setheaders(dummyArr)
        //COMMENT: UNUSED editT
        setDialogType({ type: "manualUpload" });
    };

    const handleConfirmC = () => {
        for (let i = 0; i < filterValues.selectArray.length; i++) {
            filterValues.selectArray[i].isdisabled = false;
            filterValues.selectArray[i].idx = -1;
        }
        setManualValues({ ...manualValues, totalRecords: 0, areaData: '', typedData: [] })
        setNewGroupDetails({ ...newGroupDetails, groupValue: '' })
        setContacts([]);
        //COMMENT: CHECK SETCOLUMNVALIDATE ONCE
        setDialogType({ type: 'sendSuccess' });
    };

    const handleFilterConfirm = () => {
        let formIsvalid = true;
        let tempData = { ...filterValues }
        if (filterValues.toggleReci) {
            formIsvalid = validationCheck();
            if (formIsvalid) {
                if (filterValues.selectedFilterGroups.length !== 0 || filterValues.filterValues !== "" || filterValues.selectedFilterCampaigns.length !== 0) {
                    setbsDot(true);
                    tempData = { ...tempData, displayFilter: true, reciFilter: false }
                    setSnackbarValues({ ...snackbarValues, snackbarRecipients: true })

                }
                else {
                    setbsDot(false);
                    tempData = { ...tempData, displayFilter: false, reciFilter: false }
                }
            }
        }
        else {
            if (filterValues.selectedFilterGroups.length !== 0 || filterValues.filterValues !== "" || filterValues.selectedFilterCampaigns.length !== 0) {
                tempData = { ...tempData, reciFilter: false }
                setSnackbarValues({ ...snackbarValues, snackbarRecipients: true })
                setbsDot(true);
            }
            else {
                tempData = { ...tempData, reciFilter: false }
                setbsDot(false);
            }
        }
        if (formIsvalid) {
            setDialogType(null);
        }
        setFilterValues({ ...tempData })

    };

    const handleReciInput = (e) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setFilterValues({ ...filterValues, exceptionalDays: e.target.value, RecipientsBool: false })
        }

    }

    const validationCheck = () => {
        if (filterValues.filterValues === "") {
            setFilterValues({ ...filterValues, RecipientsBool: true })
            setSnackbarValues({ ...snackbarValues, recipientsSnackbar: true })
            return false;
        }
        else {
            return true;
        }

    };

    const onPulseValidations = () => {
        let isValid = true;
        // if (pulseValues.togglePulse) {
        if (sendingTimeFormValues.PulseAmount === "" || sendingTimeFormValues.TimeInterval === "") {
            // setPulseValues({ ...pulseValues, pulseBool: true });
            setSnackbarValues({ ...snackbarValues, snackBarPulseBoolean: true })
        }
        // if (pulseValues.TimeInterval === "") {
        //     // setPulseValues({ ...pulseValues, timeBool: true });
        //     setSnackbarValues({ ...snackbarValues, snackbarTimeBoolean: true })
        //     isValid = false;
        // }
        // }
        // if (pulseValues.toggleRandom) {
        //     if (pulseValues.random === "") {
        //         // setPulseValues({ ...pulseValues, boolRandom: true });
        //         setSnackbarValues({ ...snackbarValues, snackBarMainBoolean: true })
        //         isValid = false;
        //     }
        // }
        return isValid;
    }

    const handlePulseConfirm = () => {
        if (onPulseValidations()) {
            setDialogType(null);
        }
    }

    const handlePulseClose = () => {
        let tempData = {
            ...sendingTimeFormValues,
            // random: sourcePulses.randomAmount, togglePulse: true, toggleRandom: true, SendingMethod: sourcePulses.SendingMethod, pulseType: sourcePulses.pulseType, 
            PulseAmount: sourcePulses.PulseAmount || "", TimeInterval: sourcePulses.TimeInterval || ""
        }
        if (sourcePulses.PulseAmount == "" || sourcePulses.TimeInterval == "") {
            tempData = { ...tempData, togglePulse: false }
        }
        if (sourcePulses.randomAmount == "") {
            tempData = { ...tempData, toggleRando: false }
        }
        setSendingTimeFormValues({ ...sendingTimeFormValues, ...tempData });
        setDialogType(null);
    };

    const handlePulseDialog = () => {
        setSourcePulses({ ...sourcePulses, SendingMethod: sendingTimeFormValues.SendingMethod, pulseType: sendingTimeFormValues.pulseType, PulseAmount: sendingTimeFormValues.PulseAmount, TimeInterval: sendingTimeFormValues.TimeInterval, randomAmount: sendingTimeFormValues.random });
        // setPulseValues({...pulseValues, SendingMethod:SendingMethod})
        setDialogType({ type: "pulses" });
    }

    const handleMainWarningPulse = () => {

    }

    const createNewGroup = async () => {
        const nameExist = groupList.filter((g) => { return g?.GroupName === newGroupDetails.groupValue });
        if (nameExist.length > 0) {
            setNewGroupDetails({ ...newGroupDetails, groupNameExist: true });
            return;
        }

        let temp = [];
        for (let i = 0; i < selectedGroups.length; i++) {
            temp.push(selectedGroups[i].GroupID);
        }

        let payload = {
            SubAccountID: 1,
            GroupName: newGroupDetails.groupValue,
            GroupIds: temp,
        };
        let r = await dispatch(combinedGroup(payload));
        let tempres = [];
        for (let i = 0; i < groupList.length; i++) {
            tempres.push(groupList[i]);
        }
        tempres.push(r.payload);
        setGroupList(tempres);
        setNewGroupDetails({ toggleChecked: false, groupNameExist: false, groupValue: '' });
        setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
    };

    const callbackSelectedGroups = (group) => {
        let filteredGroups = selectedGroups.filter((selGrp) => selGrp.GroupID !== group.GroupID)

        filteredGroups.length === selectedGroups.length ? setSelectedGroups([...selectedGroups, group]) : setSelectedGroups([...filteredGroups])
    }

    const callbackShowTestGroup = (showTestGroups) => {
        if (!showTestGroups && testGroups.length > 0) {
            setGroupList(testGroups.concat(groupList));
        }
        else {
            const g = groupList?.filter((group) => { return group?.IsTestGroup !== true });
            setGroupList(g);
        }
    }

    const callbackUpdateGroupFilterd = (groups) => {
        setFilterValues({ ...filterValues, selectedFilterGroups: groups })
    }
    const callbackFilteredGroups = (group) => {
        const found = filterValues.selectedFilterGroups
            .map((g) => {
                return g.GroupID;
            })
            .includes(group.GroupID);
        if (found) {
            setFilterValues({ ...filterValues, selectedFilterGroups: filterValues.selectedFilterGroups.filter((c) => c.GroupID !== group.GroupID) })
        } else {
            setFilterValues({ ...filterValues, selectedFilterGroups: [...filterValues.selectedFilterGroups, group] })
        }
    }
    const callbackUpdateCampaignFilter = (campaigns) => {
        setFilterValues({ ...filterValues, selectedFilterCampaigns: campaigns })
        // setFilterCampaigns(campaigns)
    }
    const callbackFiltertedCampaigns = (campaign) => {
        const found = filterValues.selectedFilterCampaigns
            .map((c) => {
                return c.SMSCampaignID;
            })
            .includes(campaign.SMSCampaignID);
        if (found) {
            setFilterValues({ ...filterValues, selectedFilterCampaigns: filterValues.selectedFilterCampaigns.filter((c) => c.SMSCampaignID !== campaign.SMSCampaignID) })
        } else {
            setFilterValues({ ...filterValues, selectedFilterCampaigns: [...filterValues.selectedFilterCampaigns, campaign] })
        }
    }

    const renderHtml = (html) => {
        function createMarkup() {
            return { __html: html };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }

    const TabComp = (tabs = []) => (
        <Stack
            direction="column"
            justifyContent="flex-start"
            className={classes.wizardFlex}
        >
            <Stack className={classes.infoDiv} direction="row">
                <span className={classes.conInfo}>{t("mainReport.whomTosend")}</span>
                <Tooltip
                    disableFocusListener
                    title={t("smsReport.whomtoSendTip")}
                    classes={{ tooltip: styles.customWidth }}
                >
                    <span className={classes.bodyInfo}>i</span>
                </Tooltip>
            </Stack>
            <Stack className={classes.tabDiv} direction="row" justifyContent="space-around">
                {tabs.map((tab, i) => (
                    <Stack key={`tabTitle${i}`}
                        justifyContent="space-around"
                        direction="row"
                        className={
                            activeTab === i
                                ? clsx(classes.tab1, classes.activeTab)
                                : clsx(classes.tab1)
                        }
                        onClick={() => setActiveTab(i)}
                    >
                        {tab && <><span
                            style={{ cursor: "pointer" }}
                        >
                            {tab.tabName || ''}
                        </span>
                            {tab.tooltip && <Tooltip
                                disableFocusListener
                                title={tab.tooltip}
                                classes={{ tooltip: styles.customWidth }}
                            >
                                <span className={clsx(classes.bodyInfo, classes.ml5)}>i</span>
                            </Tooltip>}
                        </>
                        }
                    </Stack>
                ))}
            </Stack>
            <Stack justifyContent="center" >
                {tabs[activeTab]?.body || <p>Empty Tab</p>}
            </Stack>

            <Stack className={classes.groupsFooter}>
                {tabs[activeTab]?.footer}
            </Stack>
        </Stack>
    )

    const NewGroupForm = () => newGroupDetails.toggleChecked ? (
        <Stack direction="row">
            <input
                type="text"
                className={classes.groupInput}
                placeholder={t("smsReport.groupName")}
                onChange={handleInputNewGroup}
                value={newGroupDetails.groupValue}
            />
            <span className={classes.saveBtn}
                onClick={createNewGroup}
            >
                {t("mainReport.save")}
            </span>
            {newGroupDetails.groupNameExist ?
                <span style={{ marginTop: "8px", color: "red", fontSize: "12px", display: 'block' }}>{t("sms.groupNameExists").replace("#groupName#",
                    newGroupDetails.groupValue
                )}</span>
                : null}
        </Stack>
    ) : <></>

    const Tab1 = {
        tabName: t("mainReport.groups"),
        body: <Groups
            classes={classes}
            list={groupList || []}
            selectedList={selectedGroups}
            callbackSelectedGroups={(g) => callbackSelectedGroups(g)}
            callbackUpdateGroups={(groups) => setSelectedGroups(groups)}
            callbackSelectAll={() => setSelectedGroups(groupList.length === selectedGroups.length ? [] : groupList)}
            callbackReciFilter={() => setDialogType({ type: "filterRecipients" })}
            callbackShowTestGroup={callbackShowTestGroup}
            isSms={true}
            bsDot={bsDot}
            uniqueKey={'groups_1'}
            innerHeight={325}
        />,
        footer: (
            <Stack direction="column">
                <Stack direction="row" justifyContent="space-between">
                    <Stack
                        className={classes.createGroupContainer}
                        direction="row"
                    >
                        <Checkbox
                            disabled={selectedGroups.length >= 2 ? false : true}
                            checked={newGroupDetails.toggleChecked}
                            color="primary"
                            inputProps={{ "aria-label": "secondary checkbox" }}
                            onClick={() => {
                                setNewGroupDetails({ ...newGroupDetails, toggleChecked: !newGroupDetails.toggleChecked });
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
                    </Stack>

                    <Stack
                        style={{
                            display: "flex",
                            marginTop: "10px",
                        }}
                        direction="row"
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
                    </Stack>
                </Stack>

                {NewGroupForm()}
            </Stack>
        ),
    }

    const Tab2 = {
        tabName: t("mainReport.manual"),
        body: (
            <Stack
                className={
                    highlighted
                        ? clsx(classes.greenManual)
                        : clsx(classes.areaManual)
                }
            >
                <textarea
                    placeholder={t("sms.dragXlOrCsv")}
                    spellCheck="false"
                    autoComplete="off"

                    className={
                        highlighted ? clsx(classes.greenCon) : clsx(classes.areaCon)
                    }
                    value={manualValues.areaData}
                    onDragEnter={() => {
                        setHighlighted(true);
                    }}
                    onChange={handleAreaChange}
                    onDragLeave={() => {
                        setHighlighted(false);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onPaste={handleAreaChange}
                    onDrop={(e) => {
                        e.preventDefault();
                        setHighlighted(false);
                        handleFiles(e)
                    }}
                />
            </Stack>
        ),
        footer: (
            <>
                {NewGroupForm()}
                <div className={classes.manualChild} style={{ justifyContent: manualValues.areaData === "" ? "flex-end" : "space-between" }}>
                    {manualValues.areaData !== "" ? (
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
                                    setManualValues({ ...manualValues, areaData: "", typedData: [], totalRecords: 0 })
                                    // setareaData("");
                                    setContacts([]);
                                    // settypedData([]);
                                    // settotalRecords(0)
                                }}
                            >
                                {t("sms.clearList")}
                            </span>
                            <span
                                className={classes.addManualDiv}
                                onClick={() => {
                                    setDialogType({ type: "quickMnualUpload" })
                                }}
                            >
                                {t("campaigns.newsLetterSendSettings.quickMSend")}
                            </span>
                        </div>
                    ) : null}
                    <span>{t("sms.totalRecords")}:  {manualValues.totalRecords}</span>
                </div>
            </>
        ),
        tooltip: t("smsReport.manualTip")
    }

    const renderBody = () => (<>{TabComp([Tab1, Tab2])}</>)

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
                            isRTL && windowSize !== 'xs' && windowSize !== 'sm' ? classes.marginLeftAuto : windowSize !== 'xs' && windowSize !== 'sm' ? classes.marginRightAuto : null
                        )}
                        color="primary"
                        style={{ margin: '8px' }}
                        onClick={() => { handlePreviousPage() }}
                    >
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
                        onClick={() => { setDialogType({ type: "exit" }) }}
                    >
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
                            onSaveSettings();
                        }}
                    >
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
                            setDialogType({ type: 'preSendSummary' })
                        }}
                    >
                        {t("mainReport.summary")}
                    </Button>
                </div>
            </div>
        );
    }

    const renderDialog = () => {
        const { type, data } = dialogType || {}

        const dialogContent = {
            manualUpload: ManualUploadDialog(
                {
                    classes: classes,
                    styles: styles,
                    groupList: groupList,
                    manualValues: manualValues,
                    setManualValues: setManualValues,
                    newGroupDetails: newGroupDetails,
                    setNewGroupDetails: setNewGroupDetails,
                    groupTextError: groupTextError,
                    setGroupTextError: setGroupTextError,
                    setDialogType: setDialogType,
                    groupNameInput: newGroupDetails.groupValue,
                    contacts: contacts,
                    headers: headers,
                    setheaders: setheaders,
                    setLoader: setLoader,
                    ToastMessages: ToastMessages,
                    setToastMessage: setToastMessage,
                    selectedGroups: selectedGroups,
                    setContacts: setContacts,
                    setGroupList: setGroupList,
                    setSelected: setSelectedGroups
                }
            ),
            quickMnualUpload: QuickManualUploadDialog({
                classes: classes,
                onClose: () => setDialogType(null),
                onConfirm: () => handleConfirmC()
            }),
            filterRecipients: FilterRecipientsDialog({
                classes: classes,
                onClose: () => setDialogType(null),
                onConfirm: () => handleFilterConfirm(),
                totalCampaigns: totalCampaigns,
                callbackFiltertedCampaigns: (campaign) => callbackFiltertedCampaigns(campaign),
                callbackUpdateCampaignFilter: (group) => callbackUpdateGroupFilterd(group),
                callbackShowTestGroup: (showTestGroup) => callbackShowTestGroup(showTestGroup),
                handleReciInput: handleReciInput,
                filterValues: filterValues,
                setFilterValues: setFilterValues,
                groupList: groupList,
                callbackUpdateGroupFilterd: callbackUpdateGroupFilterd,
                callbackFilteredGroups: callbackFilteredGroups,
                renderHtml: renderHtml,
            }),
            caution: CautionDialog({
                classes: classes,
                onClose: () => setDialogType({ type: "manualUpload" }),
                onConfirm: () => handleConfirmC()
            }),
            pulses: PulseDialog({
                classes: classes,
                sendingTimeFormValues: sendingTimeFormValues,
                handleSetPulseData: handleSetPulseData,
                // setPulseValues: setPulseValues,
                selectedGroups: selectedGroups,
                onClose: handlePulseClose,
                onCancel: handlePulseClose,
                onConfirm: handlePulseConfirm,
            }),
            delete: DeleteDialog({
                classes: classes,
                onClose: () => setDialogType(null),
            }),
            exit: ExitDialog({
                classes: classes,
                onClose: () => navigate("/SMSCampaigns"),
                onCancel: () => setDialogType(null),
            }),
            segmentation: SegmentationDialog({
                classes: classes,
                values: sendingTimeFormValues,
                handleSetValues: (values) => setSendingTimeFormValues({ ...values }),
                onClose: () => setDialogType(null),
                onCancel: () => setDialogType(null),
                onConfirm: () => null
            }),
            smsMarketing: SmsMarketingDialog({
                classes: classes,
                values: sendingTimeFormValues,
                handleSetValues: (values) => setSendingTimeFormValues({ ...values }),
                onClose: () => setDialogType(null),
                onCancel: () => setDialogType(null),
                onConfirm: () => null
            }),
            sendSuccess: SendSuccessDialog(),
            summary: SummaryDialog({ classes: classes, count: data }),
            preSendSummary: PreSendSummary({ classes: classes, campaignId: params?.id, onClose: () => setDialogType(null), onConfirm: () => onSaveSettings(true) })
            // noCredit: noCreditDialog(),
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
        <DefaultScreen subPage={"create"} currentPage="sms" classes={classes} customPadding={true}>
            <RenderToast toastMessage={toastMessage} time={4000} />
            <div>
                <div>
                    <WizardTitle title={t("campaigns.createNewsLetterHeader")}
                        classes={classes}
                        // stepNumber={2}
                        subTitle={t("campaigns.newsLetterSendSettings.title")}
                    />
                    <Grid container style={{ marginBottom: "40px" }} spacing={5}>
                        <Grid item md={7} xs={12}>
                            {renderBody()}
                        </Grid>
                        <Grid item md={5} xs={12}>
                            <FormSendingTime
                                classes={classes}
                                // sendingTimeFormValues={sendingTimeFormValues}
                                ToastMessages={ToastMessages}
                                setToastMessage={setToastMessage}
                                // handleSetPulseData={handleSetPulseData}
                                // setPulseValues={setPulseValues}
                                enablePulse={selectedGroups.length >= 1 && sendingTimeFormValues.SendingMethod !== "3"}
                                sendingTimeFormValues={sendingTimeFormValues}
                                setSendingTimeFormValues={setSendingTimeFormValues}
                                handlePulseDialog={handlePulseDialog}
                                extraButtons={
                                    <>
                                        <Stack direction="row" justifyContent="center" alignItems="center">
                                            <span
                                                className={classes.pulse}
                                                onClick={() => setDialogType({ type: 'segmentation' })}
                                            >
                                                {t("campaigns.newsLetterEditor.sendSettings.segmentation")}
                                            </span>
                                        </Stack>
                                        <Stack direction="row" justifyContent="center" alignItems="center">
                                            <span
                                                className={classes.pulse}
                                                onClick={() => setDialogType({ type: 'smsMarketing' })}
                                            >
                                                {t("campaigns.newsLetterEditor.sendSettings.smsMarketing")}
                                            </span>
                                        </Stack>
                                    </>
                                }
                            />
                        </Grid>
                    </Grid>
                </div>
                <WizardButtons />
            </div>
            {renderDialog()}
            {/* {renderSummary()} */}
            {<SpecialModal
                classes={classes}
                isOpen={specialSettingValidation}
                onClose={() => setspecialSettingValidation(false)}
                daysBeforeAfter={sendingTimeFormValues.daysBeforeAfter}
                spectialDateFieldID={sendingTimeFormValues.DateFieldID}
                sendTime={sendingTimeFormValues.sendTime}
            />}
            {/* {renderSendType2validation()} */}
            <Snackbar
                open={snackbarValues.snackbarTimeBoolean || snackbarValues.snackBarPulseBoolean || snackbarValues.snackbarMainPulse}
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
                open={snackbarValues.snackBarPulseBoolean}
                autoHideDuration={3000}
                onClose={() => setSnackbarValues({ ...snackbarValues, snackBarPulseBoolean: false })}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                style={{ zIndex: "9999", marginTop: "60px" }}
            >
                <Alert severity="error" className={severe.customcolor}>
                    {t("smsReport.PulseAmount")}
                </Alert>
            </Snackbar>
            <Snackbar
                open={snackbarValues.snackbarTimeBoolean}
                autoHideDuration={3000}
                onClose={() => setSnackbarValues({ ...snackbarValues, snackbarTimeBoolean: false })}
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
                open={snackbarValues.snackbarMainPulse}
                autoHideDuration={3000}
                onClose={() => setSnackbarValues({ ...snackbarValues, snackBarMainBoolean: false })}
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
                open={snackbarValues.recipientsSnackbar}
                autoHideDuration={2000}
                onClose={() => setSnackbarValues({ ...snackbarValues, recipientsSnackbar: false })}
                style={{ zIndex: "9999", marginTop: "30px", fontWeight: 900, fontSize: 16 }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Alert severity="warning" className={severe.customcolor}>
                    {t("sms.FillDay")}
                </Alert>
            </Snackbar>
            <Snackbar
                open={snackbarValues.snackbarRecipients}
                autoHideDuration={2000}
                onClose={() => setSnackbarValues({ ...snackbarValues, snackbarRecipients: false })}
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
            {/* {otpOpen && <OTP classes={classes} campaignNumber={dataSaved.fromNumber} isOpen={otpOpen} onClose={() => { setOTPOpen(false); setDialogType(null); }} />} */}
            <Loader isOpen={showLoader} />
        </DefaultScreen>
    )
}

export default NewsletterSendSettings