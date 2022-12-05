import React, { useState, useEffect } from "react";
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
    getAccountExtraData, getFinishedCampaigns, getTestGroups
} from "../../../redux/reducers/smsSlice";
import { combinedGroup, addRecipient, addRecipients, createGroup } from "../../../redux/reducers/groupSlice";
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
import { getGroups, getEmailSendSettings, setEmailSendSettings } from "../../../redux/reducers/newsletterSlice";
import PreSendSummary from "./Popups/PreSendSummary";
import SegmentationDialog from "./Popups/SegmentationDialog";
import SmsMarketingDialog from "./Popups/SmsMarketingDialog";
import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import UploadXL from '../../../components/Files/UploadXL'
import { UploadSettings } from "../../../helpers/Constants";

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
    const { ToastMessages, testGroups, finishedCampaigns } = useSelector((state) => state.sms);
    const { newsletterSettings, groupData } = useSelector(state => state.newsletter);
    const [showLoader, setLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [campaignValues, setCampaignValues] = useState({});
    const [totalCampaigns, setTotalCampaigns] = useState();
    const [groupList, setGroupList] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
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
        SendType: "1",
        SendDate: null,
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

    const [dataIsReady, setDataIsReady] = useState(false);

    const initOnReady = () => {
        if (newsletterSettings?.error) {
            logout();
        }

        try {
            const { GroupList = [], PulseAmount = null, TimeInterval = null, SendDate = null, ExeptionalGroups = [], SendingMethod = null, ExeptionalCampaigns = [], IsBestTime = false } = newsletterSettings;
            const { Groups } = groupData;

            ExeptionalGroups?.length > 0 && setbsDot(true);

            setSendingTimeFormValues({ ...sendingTimeFormValues, PulseAmount: PulseAmount, SendingMethod: SendingMethod, TimeInterval: TimeInterval, SendDate: SendDate ? moment(SendDate) : SendDate, IsBestTime: IsBestTime })
            setCampaignValues({ ...newsletterSettings })
            setTotalCampaigns(finishedCampaigns?.length ?? 0);
            GroupList.length > 0 && setSelectedGroups(Groups.filter((c) => GroupList.indexOf(c.GroupID) > -1));
            setFilterValues({
                ...filterValues,
                selectedFilterGroups: ExeptionalGroups ? groupData.Groups.filter((c) => ExeptionalGroups.indexOf(c.GroupID) > -1) : [],
                selectedFilterCampaigns: ExeptionalCampaigns ? finishedCampaigns?.filter((c) => ExeptionalCampaigns.indexOf(c.SMSCampaignID) > -1) : []
            })
            // TODO
            if (newsletterSettings?.SendingMethod === 3) {
                // tempSendingTimeFormValues = {
                //     ...tempSendingTimeFormValues,
                //     SendingMethod: `${newsletterSettings?.SendingMethod}`,
                //     SendingMethod: `${newsletterSettings?.SendingMethod}`,
                //     // daysBeforeAfter: newsletterSettings?.SpecialSettings.Day,
                //     // sendTime: moment(newsletterSettings?.SpecialSettings.SendHour),
                //     // DateFieldID: `${newsletterSettings?.SpecialSettings.DateFieldID}`
                // }
                // if (newsletterSettings.SpecialSettings.IntervalTypeID === -1) {
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

        } catch (e) {
            dispatch(sendToTeamChannel({
                MethodName: 'onReady',
                ComponentName: 'NewsletterSendSettings.js',
                Message: e
            }));
        }
        finally {
            setLoader(false);
        }

    }

    useEffect(() => {
        if (dataIsReady === true) {
            initOnReady();
        }
    }, [dataIsReady, newsletterSettings, groupData])

    const getData = async () => {
        setLoader(true);
        if (params?.id) {
            await dispatch(getFinishedCampaigns());
            await dispatch(getGroups());
            await dispatch(getEmailSendSettings(params.id));
            await dispatch(getTestGroups());
            setDataIsReady(true);
        }
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
            ExeptionalCampaigns: filterValues?.selectedFilterCampaigns?.join(','),
            ExeptionalGroups: filterValues?.selectedFilterGroups?.join(','),
            CampaignID: params.id,
            Status: campaignValues.Status,
            PulseAmount: sendingTimeFormValues.PulseAmount || campaignValues.PulseAmount,
            TimeInterval: sendingTimeFormValues.TimeInterval || campaignValues.TimeInterval,
            SendDate: sendingTimeFormValues.SendDate || campaignValues.SendDate,
            SendingMethod: sendingTimeFormValues.SendingMethod || campaignValues.SendingMethod,
            GroupIds: selectedGroups.map(grp => grp.GroupID).join(","),
            ExceptionalDays: 0,
            IsBestTime: sendingTimeFormValues.IsBestTime,
            IsSummaryRequest: isTrue
        }
        try {
            await dispatch(setEmailSendSettings(payload))
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
        if (sendingTimeFormValues.PulseAmount === "" || sendingTimeFormValues.TimeInterval === "") {
            setSnackbarValues({ ...snackbarValues, snackBarPulseBoolean: true })
        }
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
        setDialogType({ type: "pulses" });
    }

    const handleMainWarningPulse = () => {

    }

    const createNewGroup = async (groupName) => {
        const nameExist = groupData.Groups.filter((g) => { return g?.GroupName === groupName });
        if (nameExist.length > 0) {
            setNewGroupDetails({ ...newGroupDetails, groupNameExist: true });
            return;
        }

        let temp = [];
        for (let i = 0; i < selectedGroups.length; i++) {
            temp.push(selectedGroups[i].GroupID);
        }

        let payload = {
            SubAccountID: -1,
            GroupName: groupName,
            GroupIds: temp,
        };
        await dispatch(combinedGroup(payload));
        setNewGroupDetails({ toggleChecked: false, groupNameExist: false, groupValue: '' });
        setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
    };

    const callbackSelectedGroups = (group) => {
        let filteredGroups = selectedGroups.filter((selGrp) => selGrp.GroupID !== group.GroupID)

        filteredGroups.length === selectedGroups.length ? setSelectedGroups([...selectedGroups, group]) : setSelectedGroups([...filteredGroups])
    }

    //TODO
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
                        justifyContent="center"
                        direction="row"
                        className={
                            clsx(classes.tab1, activeTab === i ? classes.activeTab : '', classes.w50)
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
                onClick={() => createNewGroup(newGroupDetails.groupValue)}
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

    const handleUploadRecipients = async (groupName, res, uploadAsFile) => {
        let r = null;
        try {
            const response = await dispatch(createGroup({ GroupName: groupName, IsTestGroup: false }));
            if (response?.payload?.Message) {
                if (uploadAsFile === true) {
                    r = await dispatch(addRecipients({ ...res, GroupIds: [response.payload.Message] }));
                }
                else {
                    r = await dispatch(addRecipient({ ...res, GroupIds: [response.payload.Message] }));
                }
                handleAddClientsResponse(r);
            }
        }
        catch (error) {
            console.error('ADD Clients Error: ', error)
        }
    }

    const handleAddClientsResponse = (res) => {
        switch (res?.StatusCode) {
            case 200:
                break;
            case 201:
                break;
            default:
                break
        }
    }

    const renderBody = () => {
        const Tab1 = {
            tabName: t("mainReport.groups"),
            body: <Groups
                classes={classes}
                list={groupData?.Groups || []}
                selectedList={selectedGroups}
                callbackSelectedGroups={(g) => callbackSelectedGroups(g)}
                callbackUpdateGroups={(groups) => setSelectedGroups(groups)}
                callbackSelectAll={() => setSelectedGroups(groupData?.Groups?.length === selectedGroups.length ? [] : groupData?.Groups)}
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
                >
                    <UploadXL
                        classes={classes}
                        onDone={(groupName, res, uploadedAsFile) => {
                            handleUploadRecipients(groupName, res, uploadedAsFile);
                        }}
                        settings={{ ...UploadSettings.GROUPS, ShowGroupName: true }}
                        // uploadToGroups={selectedGroups}
                        setToastMessage={setToastMessage}
                        placeHolder={"recipient.addRecTextareaPlaceholder"}
                        tooltipText='recipient.bulkRecUpldTooltipText'
                        onlyMapping={true}
                        extraButtons={
                            <>
                                <Button
                                    className={classes.addManualDiv}
                                    onClick={() => {
                                        setDialogType({ type: "quickMnualUpload" })
                                    }}
                                >
                                    {t("campaigns.newsLetterSendSettings.quickMSend")}
                                </Button>
                            </>
                        }
                    />
                </Stack>
            ),
            // footer: (
            //     <>
            //         {NewGroupForm()}
            //         <div className={classes.manualChild} style={{ justifyContent: manualValues.areaData === "" ? "flex-end" : "space-between" }}>
            //             {manualValues.areaData !== "" ? (
            //                 <div>
            //                     <span
            //                         className={classes.addManualDiv}
            //                         onClick={() => {
            //                             handlePasted();
            //                         }}
            //                     >
            //                         {t("sms.editFields")}
            //                     </span>
            //                     <span
            //                         className={classes.clearDiv}
            //                         onClick={() => {
            //                             setManualValues({ ...manualValues, areaData: "", typedData: [], totalRecords: 0 })
            //                             // setareaData("");
            //                             setContacts([]);
            //                             // settypedData([]);
            //                             // settotalRecords(0)
            //                         }}
            //                     >
            //                         {t("sms.clearList")}
            //                     </span>
            //                     <span
            //                         className={classes.addManualDiv}
            //                         onClick={() => {
            //                             setDialogType({ type: "quickMnualUpload" })
            //                         }}
            //                     >
            //                         {t("campaigns.newsLetterSendSettings.quickMSend")}
            //                     </span>
            //                 </div>
            //             ) : null}
            //             <span>{t("sms.totalRecords")}:  {manualValues.totalRecords}</span>
            //         </div>
            //     </>
            // ),
            tooltip: t("smsReport.manualTip")
        }
        return <>{TabComp([Tab1, Tab2])}</>
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
                    groupList: groupData,
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
                onCancel: () => setDialogType(null),
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
                groupList: groupData,
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