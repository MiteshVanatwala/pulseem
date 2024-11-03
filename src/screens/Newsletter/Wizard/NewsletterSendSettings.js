import React, { useState, useEffect } from "react";
import { IconButton, Tooltip, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { Loader } from '../../../components/Loader/Loader';
import Checkbox from "@material-ui/core/Checkbox";
import Groups from "../../../components/Groups/GroupsHandler/Groups";
import { useNavigate, useParams } from "react-router";
import { BiSave } from 'react-icons/bi'
import { Title } from "../../../components/managment/Title";
import { Button, Grid, Box } from "@material-ui/core";
import {
    getAccountExtraData, getPreviousCampaignData, getPreviousLandingData, getTestGroups, getSmsMarketing, deleteSmsTotalMarketing
} from "../../../redux/reducers/smsSlice";
import { combinedGroup, addRecipient, addRecipients, createGroup, createAndGetGroupIdForManualSend, getGroupsBySubAccountId } from "../../../redux/reducers/groupSlice";
import { getAuthorizeNumbers, getAuthorizedEmails, getCommonFeatures } from '../../../redux/reducers/commonSlice'
import clsx from "clsx";
import { logout } from '../../../helpers/Api/PulseemReactAPI'
import { Stack } from "@mui/material";
import RenderToast from "../../../components/core/RenderToast";
import QuickManualUploadDialog from "./Popups/QuickManualUploadDialog";
import DeleteDialog from "./Popups/DeleteDialog";
import SendSuccessDialog from "./Popups/SendSuccessDialog";
import ConfirmationDialog from "./Popups/ConfirmationDialog";
import FilterRecipientsDialog from "./Popups/FilterRecipientsDialog";
import ExitDialog from "./Popups/ExitDialog";
import PulseDialog from "./Popups/PulseDialog";
import SendingMethod from "../../../components/Wizard/SendingMethod";
import { getEmailSendSettings, setEmailSendSettings, getSendSummary, deleteCampaign } from "../../../redux/reducers/newsletterSlice";
import SummaryDialog from "./Popups/SummaryDialog";
import SegmentationDialog from "./Popups/SegmentationDialog";
import SmsMarketingDialog from "./Popups/SmsMarketingDialog";
// import { sendToTeamChannel } from "../../../redux/reducers/ConnectorsSlice";
import UploadXL from '../../../components/Files/UploadXL'
import { UploadSettings } from "../../../helpers/Constants";
import { FaRegCalendarAlt } from "react-icons/fa";
import Badge from '@material-ui/core/Badge';
import moment from 'moment';
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import WizardActions from "../../../components/Wizard/WizardActions";
import VerificationDialog from "../../../components/DialogTemplates/VerificationDialog.js";
import SendResponseDialog from './Popups/SendResponseDialog';
import UploadInProgressDialog from "./Popups/UploadInProgressDialog";
import NoCreditDialog from './Popups/NoCreditDialog'
import { CreditType } from "../../../Models/Payments/NoCreditPopUp";
import DynamicConfirmDialog from "../../../components/DialogTemplates/DynamicConfirmDialog";
import { BsInfoCircle } from "react-icons/bs";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { IsSharedDomain } from "../../../helpers/Functions/DomainVerificationHelper";
import { sitePrefix } from "../../../config";

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
    flexEndTotalSms: {
        display: 'flex',
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
        paddingInline: 15,
        fontSize: 13
    },
    deleteButton: {
        background: 'none !important',
        fontSize: '14px !important',
        margin: 0,
        padding: 0,
        textTransform: 'capitalize',
        color: '#CA332F'
    }
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
    const { isRTL } = useSelector((state) => state.core);
    const { verifiedEmails } = useSelector(state => state.common);
    const { subAccountAllGroups } = useSelector((state) => state.group);
    const { previousCampaignData, testGroups } = useSelector((state) => state.sms);
    const { ToastMessages, newsletterSettings, newsletterSendSummary, newsletterInfo } = useSelector(state => state.newsletter);
    const [showLoader, setLoader] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [newEMailVerification, setNewEmailVerification] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [campaignValues, setCampaignValues] = useState({
        SendingMethod: 1,
        CampaignID: params?.id
    });
    const [filterParameters, setFilterParameters] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [dialogType, setDialogType] = useState({ type: null });
    const [newGroupDetails, setNewGroupDetails] = useState({
        toggleChecked: false,
        groupNameExist: false,
        groupValue: '',
    })
    const [filterValues, setFilterValues] = useState({
        toggleReci: false,
        selectedFilterGroups: [],
        exceptionalDays: "",
        RecipientsBool: '',
        selectArray: [],
        selectedFilterCampaigns: [],
        displayFilter: false,
        reciFilter: false,
    });
    const [doNotSendFilterValues, setDoNotSendFilterValues] = useState({});
    const [sourcePulses, setSourcePulses] = useState({});
    const [snackbarValues, setSnackbarValues] = useState({
        snackbarTimeBoolean: false,
        snackBarPulseBoolean: false,
        snackbarMainPulse: false,
        snackbarRecipients: false,
        recipientsSnackbar: false
    })
    const [segmantIndication, setSegmantIndication] = useState(false);
    const [pulseIndication, setPulseIndication] = useState(false);
    const [smsMarketingIndication, setSmsMarketingIndication] = useState(false);
    const [mergedSegmentationDialog, setMergedSegmentationDialog] = useState(0);
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [smsMarketingModel, setSmsMarketingModel] = useState({
        Type: 0,
        SendSmsTo: -1,
        FromNumber: "",
        SendDate: null,
        SendTime: null,
        IsLinksStatistics: true
    });
    const [newGroupId, setNewGroupId] = useState(0);
    const [quickSendClients, setQuickSendClients] = useState(null);
    const [totalClientsToSend, setTotalClientsToSend] = useState(0);
    const [reCheckAuth, setRecheckAuth] = useState(false);
    const [noCreditLeft, setNoCreditLeft] = useState(false);
    const [showDeleteSmsMarketingDialog, setShowDeleteSmsMarketingDialog] = useState(false);
    const [domainIsAllowed, setDomainIsAllowed] = useState(true);
    const MAX_UPLOAD_LIMITATION = 5000;

    useEffect(() => {
        const total = selectedGroups?.reduce(function (a, b) {
            return a + b['Recipients'];
        }, 0);

        setTotalClientsToSend(total);
    }, [selectedGroups]);

    useEffect(() => {
        if ((verifiedEmails && verifiedEmails?.length > 0) && (newsletterInfo && newsletterInfo?.CampaignID > 0)) {
            const email = verifiedEmails.filter((email) => {
                return email?.Number === newsletterInfo.FromEmail;
            });

            if (!email[0]?.IsVerified && !IsSharedDomain(newsletterInfo?.FromEmail)) {
                setDomainIsAllowed(false);
                // navigate('/react/campaigns')
            }
        }

    }, [verifiedEmails, newsletterInfo])

    //#region Email Authentication

    const checkEmailAuth = () => {
        const isVerified = verifiedEmails.filter((email) => {
            return email?.Number === newsletterInfo.FromEmail || IsSharedDomain(newsletterInfo.FromEmail);
        });
        setIsEmailVerified(isVerified?.length > 0);
        setNewEmailVerification(isVerified?.length <= 0);
    }
    const handleOnVerificationClose = async () => {
        await dispatch(getAuthorizedEmails());
        setRecheckAuth(true);
    }


    useEffect(() => {
        if (reCheckAuth === true) {
            checkEmailAuth();
        }

    }, [reCheckAuth]);

    //#endregion Email Authentication

    const initOnReady = () => {
        if (newsletterSettings?.error) {
            logout();
        }

        try {
            //checkEmailAuth();

            if (newsletterSettings.length === 0)
                return;

            const { GroupList = [], ExeptionalGroups = [], ExeptionalCampaigns = [], ExceptionalDays = null } = newsletterSettings;
            const Groups = subAccountAllGroups || [];
            let selecteddGroup = [];

            setSegmantIndication(ExeptionalGroups?.length > 0 || newsletterSettings.IsOpened || newsletterSettings.IsOpenedClicked || newsletterSettings.IsNotClicked || newsletterSettings.IsNotOpened)
            setPulseIndication(newsletterSettings.PulseAmount > 0 || newsletterSettings.TimeInterval > 0);
            setCampaignValues({ ...newsletterSettings })

            selecteddGroup = [...Groups, ...testGroups]?.filter((c) => GroupList?.indexOf(c.GroupID) > -1)
            selecteddGroup.length > 0 && setSelectedGroups(selecteddGroup);

            setFilterValues({
                ...filterValues,
                toggleReci: ExceptionalDays !== '' && ExceptionalDays > 0,
                selectedFilterGroups: ExeptionalGroups ? subAccountAllGroups?.filter((c) => ExeptionalGroups.indexOf(c.GroupID) > -1) : [],
                selectedFilterCampaigns: ExeptionalCampaigns ? previousCampaignData?.filter((c) => ExeptionalCampaigns.indexOf(c.CampaignID) > -1) : [],
                exceptionalDays: ExceptionalDays > 0 ? ExceptionalDays : ''
            });
            setSmsMarketingIndication(newsletterSettings?.HasSmsMarekting || false);

        } catch (e) {
            // dispatch(sendToTeamChannel({
            //     MethodName: 'onReady',
            //     ComponentName: 'NewsletterSendSettings.js',
            //     Message: e
            // }));
        }
    }

    useEffect(() => {
        if (dataReady) {
            initOnReady();
        }
    }, [dataReady, newsletterSettings])

    const getData = () => {
        setLoader(true);
        return new Promise(async (resolve, reject) => {
            try {
                dispatch(getPreviousCampaignData());
                dispatch(getAccountExtraData());
                dispatch(getPreviousLandingData());
                await dispatch(getAuthorizedEmails())
                await dispatch(getEmailSendSettings(params?.id));
                await dispatch(getGroupsBySubAccountId());
                await dispatch(getTestGroups());
                await dispatch(getCommonFeatures());
                resolve();
            } catch (error) {
                reject(error)
            }
        })

    };

    useEffect(() => {
        getData().then(() => {
            setLoader(false);
            setDataReady(true);
        })
    }, [dispatch]);

    const handlePreviousPage = () => {
        if (newsletterInfo?.IsNewEditor) {
            navigate(`/react/campaigns/editor/${params.id}`)
        }
        else {
            window.location = `/Pulseem/Editor/CampaignEdit/${params.id}`;
        }
    }

    const onHandleDelete = () => {
        setDialogType({ type: "delete" });
    };

    const handleDeleteCampaign = async () => {
        let response = null;
        try {
            response = await dispatch(deleteCampaign(params.id))
            setLoader(false)
        }
        catch (error) {
            console.log("ERROR-SAVE-SEND-SETTINGS:", error)
        }
        finally {
            handleDeleteResponse(response.payload);
        }
    }

    const handleDeleteResponse = (response) => {
        switch (response) {
            case -1: {
                setToastMessage(ToastMessages.CAMPAIGN_DELETED_SUCCESS);
                break;
            }
            case -2:
            default: {
                setToastMessage(ToastMessages.GENERAL_ERROR);
            }
        }
    }

    const onSaveSettings = async (showSummary = false, overrideGroupIds = null) => {
        setLoader(true)
        let response = null;
        let payload = {
            ...campaignValues,
            AutoSendDelay: campaignValues.SendingMethod !== 3 ? null : campaignValues.AutoSendDelay,
            AutoSendingByUserField: campaignValues.SendingMethod !== 3 ? null : campaignValues.AutoSendingByUserField,
            ExeptionalCampaigns: filterValues?.selectedFilterCampaigns?.map(x => x.CampaignID)?.join(','),
            ExeptionalCampaignsList: filterValues?.selectedFilterCampaigns.map(x => x.CampaignID),
            ExeptionalGroups: filterValues?.selectedFilterGroups?.map(x => x.GroupID)?.join(','),
            CampaignID: params.id,
            Status: campaignValues.Status,
            PulseAmount: campaignValues.SendingMethod === 3 ? null : campaignValues.PulseAmount,
            TimeInterval: campaignValues.SendingMethod === 3 ? null : campaignValues.TimeInterval,
            SendDate: campaignValues.SendDate,
            SendingMethod: campaignValues.SendingMethod === 0 ? 1 : campaignValues.SendingMethod ?? 1,
            GroupIds: overrideGroupIds ?? selectedGroups.map(grp => grp.GroupID).join(","),
            GroupList: selectedGroups.map((g) => g.GroupID),
            ExceptionalDays: filterValues?.exceptionalDays,
            IsBestTime: campaignValues.IsBestTime,
            IsSummaryRequest: false
        }
        try {
            response = await dispatch(setEmailSendSettings(payload))
        }
        catch (error) {
            console.log("ERROR-SAVE-SEND-SETTINGS:", error)
        }
        finally {
            handleSaveResponse(response.payload, showSummary);
            setLoader(false);
            return response.payload;
        }
    }
    const handleSaveResponse = (response, silenceSave = false) => {
        switch (response?.StatusCode) {
            case 201: {
                if (!silenceSave)
                    setToastMessage(ToastMessages.CAMPAIGN_SETTINGS_SAVED);
                break;
            }
            case 401: {
                setToastMessage(ToastMessages.INVALID_API_MISSING_KEY);
                break;
            }
            case 405: {
                setToastMessage(ToastMessages.SEND_DATE_MISSING);
                break;
            }
            case 409: {
                setToastMessage(ToastMessages.CAMPAIGN_ALREADY_SENT);
                break;
            }
            case 410: {
                setToastMessage(ToastMessages.FUTURE_DATE_PASSED);
                break;
            }
            case 500:
            default: {
                //setToastMessage(ToastMessages.GENERAL_ERROR);
            }
        }
        setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    }
    const SEND_PROC = {
        400: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.LOCK_SENDING'), ShowContactSupport: true } },
        401: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.invaliApiKey'), ShowContactSupport: false } },
        402: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.BULK_ENDED'), ShowContactSupport: true } },
        403: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.UNAUTHORIZED_FROM_EMAIL'), ShowContactSupport: true } },
        404: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.NO_RECIPIENTS'), ShowContactSupport: false } },
        405: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.generalError'), ShowContactSupport: true } },
        406: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.MONTHLY_RESTRICTIONS'), ShowContactSupport: true } },
        407: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.INVALID_CAMPAIGN_ID'), ShowContactSupport: false } },
        408: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.generalError'), ShowContactSupport: true } },
        409: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.MONTHLY_BULK_ENDED'), ShowContactSupport: true } },
        410: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.FIRST_CAMPAIGN_RESTRICTIONS'), ShowContactSupport: false, redirect: `${sitePrefix}Campaigns/` } },
        411: { type: 'SendResponse', data: { Title: t('campaigns.newsLetterEditor.errors.campaignWasNotSent'), Text: t('campaigns.newsLetterEditor.errors.ACCOUNT_RESTRICTED'), ShowContactSupport: true } },
    };

    const handleSendResponse = (response) => {
        if (response?.StatusCode === 201) {
            setDialogType({ type: 'sendSuccess' });
        }
        else if (response?.StatusCode === 403) {
            setNewEmailVerification(newsletterInfo.FromEmail);
        }
        else if (response.StatusCode === 405 || response?.StatusCode === 402) {
            setNoCreditLeft(true);
        }
        else {
            setDialogType(SEND_PROC[response?.StatusCode]);
        }
        dispatch(getEmailSendSettings(params?.id));
    }
    const handleInputNewGroup = (e) => {
        setNewGroupDetails({ ...newGroupDetails, groupNameExist: false, groupValue: e.target.value });
    }
    const handleConfirmC = async () => {
        setDialogType(null);
        setLoader(true);

        const responseDefaultGroup = await dispatch(createAndGetGroupIdForManualSend('PulseemEmail'));
        let groupId = responseDefaultGroup?.payload

        var req = [];
        quickSendClients.split('\n').map((q) => req.push({ Email: q.replace(',', '') }));
        const finalPayload = {
            ClientsData: req,
            GroupIds: [groupId]
        }
        const r = await dispatch(addRecipient(finalPayload));

        if (r.payload.StatusCode === 201) {
            const isVerified = verifiedEmails.filter((email) => {
                return email?.Number === newsletterInfo.FromEmail || IsSharedDomain(newsletterInfo.FromEmail);
            });
            onSaveSettings(true, groupId.toString()).then(async () => {
                if (isEmailVerified || isVerified?.length > 0 || IsSharedDomain(newsletterInfo?.FromEmail)) {
                    setLoader(true);
                    await dispatch(getSendSummary(params?.id));
                    setDialogType({ type: 'SummaryDialog', IsQuickSend: true });
                    setLoader(false);
                }
                else {
                    setNewEmailVerification(true);
                }
            });
        }
        else {
            // Set error - clients were not uploaded
            setToastMessage(ToastMessages.GENERAL_ERROR);
            setLoader(false);
        }

    };

    const handleFilterConfirm = () => {
        let formIsvalid = true;
        let tempData = { ...filterValues }
        if (filterValues.toggleReci) {
            formIsvalid = validationCheck();
            if (formIsvalid) {
                if (filterValues.selectedFilterGroups.length !== 0 || filterValues.filterValues !== "" || filterValues.selectedFilterCampaigns.length !== 0) {
                    tempData = { ...tempData, displayFilter: true, reciFilter: false }
                    setSnackbarValues({ ...snackbarValues, snackbarRecipients: true })
                }
                else {
                    tempData = { ...tempData, displayFilter: false, reciFilter: false }
                }
            }
        }
        else {
            if (filterValues.selectedFilterGroups.length || filterValues.selectedFilterCampaigns.length) {
                tempData = { ...tempData, reciFilter: false }
                setSnackbarValues({ ...snackbarValues, snackbarRecipients: true })
            }
            else {
                tempData = { ...tempData, reciFilter: false }
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
        if (filterValues.toggleReci && (!filterValues?.exceptionalDays || filterValues?.exceptionalDays <= 0)) {
            setFilterValues({ ...filterValues, RecipientsBool: true })
            setSnackbarValues({ ...snackbarValues, recipientsSnackbar: true })
            return false;
        }
        else {
            return true;
        }

    };

    const handlePulseConfirm = (pulseSettings, pulseEnabled) => {
        if (pulseEnabled && (pulseSettings.PulseAmount === "" || pulseSettings.TimeInterval === "")) {
            setSnackbarValues({ ...snackbarValues, snackBarPulseBoolean: pulseSettings.PulseAmount === "", snackbarTimeBoolean: pulseSettings.TimeInterval === "" })
            setPulseIndication(false)
        }
        else {
            setDialogType(null);
            setPulseIndication(pulseEnabled);
            if (pulseEnabled) {
                setCampaignValues({ ...campaignValues, ...pulseSettings });
            }
            else {
                setCampaignValues({ ...campaignValues, ...pulseSettings, PulseAmount: null, TimeInterval: null });
            }
        }
    }

    const handlePulseClose = (isPulseEnabled) => {
        let tempData = {
            ...campaignValues,
            PulseAmount: sourcePulses.PulseAmount || "", TimeInterval: sourcePulses.TimeInterval || ""
        }
        if (sourcePulses.PulseAmount === "" || sourcePulses.TimeInterval === "") {
            tempData = { ...tempData, togglePulse: false }
        }
        setPulseIndication(isPulseEnabled);
        setCampaignValues({ ...campaignValues, ...tempData });
        setDialogType(null);
    };

    const handlePulseDialog = () => {
        setSourcePulses({ ...sourcePulses, SendingMethod: campaignValues.SendingMethod ?? 1, PulseAmount: campaignValues.PulseAmount, TimeInterval: campaignValues.TimeInterval });
        setDialogType({ type: "pulses" });
    }

    const createNewGroup = async (groupName) => {
        setLoader(true);
        const nameExist = subAccountAllGroups?.filter((g) => { return g?.GroupName === groupName });
        if (nameExist.length > 0) {
            setNewGroupDetails({ ...newGroupDetails, groupNameExist: true });
            setLoader(false);
            return;
        }

        let temp = [];
        for (let i = 0; i < selectedGroups.length; i++) {
            temp.push(selectedGroups[i].GroupID);
        }

        let payload = {
            // SubAccountID: -1,
            GroupName: groupName,
            GroupIds: temp,
        };
        const combineResponse = await dispatch(combinedGroup(payload));
        const newGroupCreated = combineResponse?.payload;
        setNewGroupDetails({ toggleChecked: false, groupNameExist: false, groupValue: '' });
        setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
        setLoader(false);
        setSelectedGroups([newGroupCreated]);
    };

    const callbackSelectedGroups = (group) => {
        let filteredGroups = selectedGroups.filter((selGrp) => selGrp.GroupID !== group.GroupID)

        filteredGroups.length === selectedGroups.length ? setSelectedGroups([...selectedGroups, group]) : setSelectedGroups([...filteredGroups])
    }

    const callbackUpdateGroupFilterd = (groups) => {
        setFilterValues({ ...filterValues, selectedFilterGroups: groups })
    }
    const callbackUpdateCampaignFilterd = (campaigns) => {
        setFilterValues({ ...filterValues, selectedFilterCampaigns: campaigns })
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
    const callbackFiltertedCampaigns = (campaign) => {
        const found = filterValues.selectedFilterCampaigns
            .map((c) => {
                return c.CampaignID;
            })
            .includes(campaign.CampaignID);
        if (found) {
            setFilterValues({ ...filterValues, selectedFilterCampaigns: filterValues.selectedFilterCampaigns.filter((c) => c.CampaignID !== campaign.CampaignID) })
        } else {
            setFilterValues({ ...filterValues, selectedFilterCampaigns: [...filterValues.selectedFilterCampaigns, campaign] })
        }
    }

    const NewGroupForm = () => newGroupDetails.toggleChecked ? (
        <Stack direction="row" className={'create-new-group'}>
            <input
                type="text"
                className={classes.groupInput}
                placeholder={t("smsReport.groupName")}
                onChange={handleInputNewGroup}
                value={newGroupDetails.groupValue}
            />
            <Button
                size='medium'
                color="primary"
                variant='contained'
                key={"extraButton"}
                className={
                    clsx(
                        classes.btn, classes.btnRounded, classes.mlr10,
                        !newGroupDetails.groupValue.trim() ? classes.disabled : ''
                    )
                }
                onClick={() => createNewGroup(newGroupDetails.groupValue)}
            >
                {t("mainReport.save")}
            </Button>
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
            if (res?.ClientsData?.length > MAX_UPLOAD_LIMITATION || uploadAsFile === true) {
                setDialogType({ type: 'maximumUploadLimitation' });
            }
            else {
                setLoader(true);
                const response = await dispatch(createGroup({ GroupName: groupName, IsTestGroup: false }));
                handleCreateGroupResponses(response, async () => {
                    if (response?.payload?.Message) {
                        if (uploadAsFile === true) {
                            r = await dispatch(addRecipients(res));
                        }
                        else {
                            r = await dispatch(addRecipient({ ...res, GroupIds: [response.payload.Message] }));
                        }
                        dispatch(getGroupsBySubAccountId());
                        handleAddClientsResponse(r?.payload);
                        setNewGroupId(parseInt(response?.payload?.Message));
                    }
                })
            }
        }
        catch (error) {
            console.error('ADD Clients Error: ', error)
        }
        finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        if (newGroupId > 0) {
            const newGroup = subAccountAllGroups?.filter((g) => { return g?.GroupID === parseInt(newGroupId) });
            if (newGroup && newGroup?.length > 0) {
                setSelectedGroups([...selectedGroups, newGroup[0]]);
            }
        }
    }, [newGroupId, subAccountAllGroups])

    const handleCreateGroupResponses = (res, successCallback) => {
        setToastMessage(null);
        switch (res?.payload?.StatusCode) {
            case 200:
                break;
            case 201:
                successCallback?.()
                break;
            case 422: {
                setToastMessage(ToastMessages.GROUP_ALREADY_EXIST);
                break;
            }
            default:
                setToastMessage(ToastMessages.GENERAL_ERROR);
                break;
        }
    }
    const handleAddClientsResponse = (res) => {
        setToastMessage(null);
        switch (res?.StatusCode) {
            case 201: {
                setActiveTab(0);
                setToastMessage(ToastMessages.GROUP_CREATED_SUCCESS);
                break;
            }
            case 202: {
                setActiveTab(0);
                setDialogType({ type: 'uploadInProgress' });
                break;
            }
            case 401: {
                setToastMessage(ToastMessages.INVALID_API_MISSING_KEY);
                break;
            }
            case 200:
            case 500:
            default: {
                setToastMessage(ToastMessages.GENERAL_ERROR);
                break;
            }
        }
    }

    const renderButtons = () => {
        return (
            <>
                <Button
                    onClick={() => onSaveSettings(false)}
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        classes.backButton
                    )}
                    style={{ margin: '8px' }}
                    startIcon={<BiSave />}
                    color="primary"
                >{t("common.save")}
                </Button>
                <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        campaignValues.SendingMethod === 2 && !campaignValues.SendDate ? classes.disabled : null,
                        campaignValues.SendingMethod === 3 && campaignValues?.AutoSendingByUserField === '0' ? classes.disabled : null,
                        campaignValues.SendingMethod === 3 && !campaignValues?.AutoSendDelay ? classes.disabled : null,
                        campaignValues.SendingMethod === 3 && !campaignValues.SendDate ? classes.disabled : null,
                        classes.btn,
                        classes.btnRounded,
                        classes.redButton
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    color="primary"
                    style={{
                        margin: '8px',
                        pointerEvents: selectedGroups.length > 0 && totalClientsToSend > 0 ? "auto" : "none",
                    }}
                    disabled={!selectedGroups.length || !totalClientsToSend}
                    onClick={() => {
                        onSaveSettings(true).then(async (results) => {
                            setLoader(true);
                            if (results?.StatusCode === 201) {
                                await dispatch(getSendSummary(params?.id));
                                setDialogType({ type: 'SummaryDialog' });
                            }
                            setLoader(false);
                            // if (isEmailVerified) {
                            //     setLoader(true);
                            //     await dispatch(getSendSummary(params?.id));
                            //     setDialogType({ type: 'SummaryDialog' });
                            //     setLoader(false);
                            // }
                            // else {
                            //     setNewEmailVerification(true);
                            // }
                        })
                    }}
                >
                    {t("mainReport.summary")}
                </Button>
            </>
        );
    }

    const MergedSegmentationDialog = () => {
        let segDialog = SegmentationDialog({
            classes: classes,
            campaign: filterParameters,
            handleSetValues: (values) => {
                setFilterParameters({ ...values })
            },
            onClose: () => setDialogType(null),
            onCancel: () => setDialogType(null),
            onConfirm: () => setDialogType(null)
        })
        let filterDialog = FilterRecipientsDialog({
            classes: classes,
            onClose: () => setDialogType(null),
            onConfirm: () => handleFilterConfirm(),
            totalCampaigns: previousCampaignData,
            callbackFiltertedCampaigns: (campaign) => callbackFiltertedCampaigns(campaign),
            callbackUpdateCampaignFilter: (campagin) => callbackUpdateCampaignFilterd(campagin),
            handleReciInput: handleReciInput,
            filterValues: filterValues,
            setFilterValues: setFilterValues,
            groupList: subAccountAllGroups,
            callbackUpdateGroupFilterd: (group) => callbackUpdateGroupFilterd(group),
            callbackFilteredGroups: (group) => callbackFilteredGroups(group)
        })

        let TabBody = (tabs = []) => (
            <Stack
                direction="column"
                justifyContent="flex-start"
                className={clsx(classes.filterHeight, classes.wizardFlex)}
            >
                <Stack className={classes.tabDiv} direction="row"
                >
                    {tabs.map((tab, i) => (
                        <Stack key={`tabTitle${i}`}
                            justifyContent="center"
                            direction="row"
                            className={
                                clsx(classes.tab1, classes.btnTab, mergedSegmentationDialog === i ? classes.currentActiveTab : '')
                            }
                            onClick={() => setMergedSegmentationDialog(i)}
                        >
                            {tab && <><span
                                className={clsx(classes.bold, classes.f16)}
                            >
                                {tab.title || ''}
                            </span>
                            </>
                            }
                        </Stack>
                    ))}
                </Stack>
                <Stack justifyContent="center" className={classes.mt20}>
                    {tabs[mergedSegmentationDialog]?.content || <p>Empty Tab</p>}
                </Stack>
            </Stack>
        )


        let dialogObj = {
            title: "",
            showDivider: false,
            disableBackdropClick: true,
            content: TabBody([segDialog, filterDialog]),
            showDefaultButtons: true,
            confirmText: t("common.Ok"),
            cancelText: t("common.Cancel"),
            onClose: () => {
                setFilterParameters({});
                setFilterValues(doNotSendFilterValues);
                setDialogType(null)
            },
            onCancel: () => {
                setFilterParameters({});
                setFilterValues(doNotSendFilterValues);
                setDialogType(null);
            },
            onConfirm: () => {
                setCampaignValues({
                    ...campaignValues,
                    ...filterParameters
                })
                mergedSegmentationDialog === 0 && setDialogType(null);
                mergedSegmentationDialog === 1 && handleFilterConfirm();

                let segmantIndication = false;
                const isFilterDatesSelected = filterParameters.FromDate && filterParameters.ToDate;

                if ((filterParameters.IsOpened || filterParameters.IsNotOpened || filterParameters.IsOpenedClicked || filterParameters.IsNotClicked)
                    && isFilterDatesSelected) {
                    segmantIndication = true;
                }
                else {
                    setFilterParameters({
                        ...campaignValues,
                        FromDate: null,
                        ToDate: null,
                        IsOpened: false,
                        IsNotOpened: false,
                        IsNotClicked: false,
                        IsOpenedClicked: false
                    });
                    setCampaignValues({
                        ...campaignValues,
                        FromDate: null,
                        ToDate: null,
                        IsOpened: false,
                        IsNotOpened: false,
                        IsNotClicked: false,
                        IsOpenedClicked: false
                    });
                }

                if (!segmantIndication) {
                    if (filterValues.toggleReci) {
                        if (validationCheck() && (filterValues.selectedFilterGroups.length !== 0 || filterValues.filterValues !== "" || filterValues.selectedFilterCampaigns.length !== 0)) {
                            segmantIndication = true;
                        }
                    }
                    else {
                        if (filterValues.selectedFilterGroups.length || filterValues.selectedFilterCampaigns.length) {
                            segmantIndication = true;
                        }
                    }
                }
                setSegmantIndication(segmantIndication);
            }
        }

        return dialogObj
    }

    const renderDialog = () => {
        const { type, data } = dialogType || {}

        const dialogContent = {
            filterRecipients: MergedSegmentationDialog(),
            pulses: PulseDialog({
                classes: classes,
                campaign: campaignValues,
                selectedGroups: selectedGroups,
                onClose: handlePulseClose,
                onConfirm: handlePulseConfirm,
            }),
            delete: DeleteDialog({
                classes: classes,
                onConfirm: () => handleDeleteCampaign().then(() => {
                    setDialogType(null);
                    setTimeout(() => {
                        navigate("/react/Campaigns/")
                    }, 200);
                }),
                onCancel: () => setDialogType(null),
                onClose: () => setDialogType(null),
            }),
            exit: ExitDialog({
                classes: classes,
                onConfirm: () => {
                    setDialogType(null);
                    onSaveSettings(false).then(() => {
                        navigate("/react/Campaigns/")
                    })
                },
                onClose: () => {
                    setDialogType(null);
                    navigate("/react/Campaigns/")
                },
                onCancel: () => { setDialogType(null) },
            }),
            sendSuccess: SendSuccessDialog({
                classes,
                onBackToCampaigns: () => {
                    setDialogType(null);
                    navigate(`${sitePrefix}campaigns`);
                },
                onBackToHome: () => {
                    setDialogType(null);
                    navigate(`${sitePrefix}`);
                }
            }),
            summary: ConfirmationDialog({ classes: classes, count: data }),
            uploadInProgress: UploadInProgressDialog({ classes: classes, onClose: () => { setDialogType(null); } }),
            maximumUploadLimitation: {
                title: t('common.ErrorTitle'),
                content: <Typography>{t('recipient.maxUploadLimitation')}</Typography>,
                showDefaultButtons: false,
                showDivider: true,
                renderButtons: () => (
                    <Button
                        variant='contained'
                        size='small'
                        style={{ maxWidth: 100 }}
                        onClick={() => { setDialogType(null) }}
                        className={clsx(
                            classes.gruopsDialogButton,
                            classes.dialogConfirmButton,
                        )}>
                        {t('common.Ok')}
                    </Button>
                ),
            }
        }

        const currentDialog = dialogContent[type] || {}

        if (Object.keys(currentDialog).length) {
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
    const callbackUpdateGroups = (groups) => {
        setSelectedGroups(groups);
    }
    const callbackSelectAll = () => {
        if (!allGroupsSelected) {
            if (showTestGroups) {
                setSelectedGroups([...testGroups, ...subAccountAllGroups]);
            }
            else {
                setSelectedGroups([...subAccountAllGroups]);
            }
        } else {
            setSelectedGroups([]);
        }
        setAllGroupsSelected(!allGroupsSelected);
    }
    const handleSmsMarketing = () => {
        const initSmsMarketing = async () => {
            return new Promise(async (resolve, reject) => {
                try {
                    await dispatch(getAuthorizeNumbers());
                    const response = await dispatch(getSmsMarketing(newsletterSettings?.CampaignID));
                    if (response?.payload?.StatusCode === 201 && response?.payload?.Data) {
                        const sendDate = response?.payload?.Data?.SendDate;
                        const sendTime = moment(sendDate);
                        const restData = response?.payload.Data;
                        setSmsMarketingModel({
                            SendDate: sendDate,
                            MinSendDate: campaignValues.SendingMethod === 2 ? campaignValues.SendDate : sendDate,
                            SendTime: moment(sendTime),
                            IsLinksStatistics: restData.IsLinksStatistics ?? true,
                            ...restData
                        });
                        setSmsMarketingIndication(true)
                    }
                    else {
                        setSmsMarketingIndication(false)
                    }
                    resolve();
                } catch (error) {
                    reject();
                }
            })

        }

        if (newsletterSettings && newsletterSettings?.CampaignID) {
            initSmsMarketing().then(() => {
                setDialogType({ type: 'smsMarketing' })
            });
        }
    }
    const onConfirmDeleteSmsMarketing = async () => {
        await dispatch(deleteSmsTotalMarketing(newsletterSettings?.CampaignID));
        await dispatch(getEmailSendSettings(newsletterSettings?.CampaignID));
    }
    const callbackShowTextGroups = async (showTestGroups) => {
        if (!showTestGroups && testGroups.length > 0) {
            setShowTestGroups(true);
        }
        else {
            setShowTestGroups(false);
        }
    }

    const renderSubHeader = () => {
        return (
            <Title
                Element={(
                    <Box className='stepHead'>
                        <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} ml={1} >
                            <span className={'stepTitle'}>
                                {t("mainReport.sendSetting")}
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
        <DefaultScreen
            currentPage="newsletter"
            subPage={"newsletterSendSettings"}
            classes={classes}
            customPadding={true}
            containerClass={classes.editorCont}>
            <RenderToast toastMessage={toastMessage} time={toastMessage?.showAnimtionCheck ? 2000 : 4000} />
            <Box className={"head"}>
                <Title
                    Text={t("campaigns.newsLetterSendSettings.title")}
                    classes={classes}
                />
                <div>
                    <Box className={'containerBody'}>
                        {renderSubHeader()}
                        <Box className='bodyBlock'>

                            <Grid container style={{ marginBottom: "40px" }}>
                                <Grid item md={7} xs={12}>
                                    <Stack className={classes.infoDiv} direction="row">
                                        <span className={classes.conInfo}>{t("mainReport.whomTosend")}</span>
                                        <Tooltip
                                            disableFocusListener
                                            title={t("smsReport.whomtoSendTip")}
                                            classes={{ tooltip: styles.customWidth }}
                                        >
                                            <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info)} aria-label={t("mainReport.toolTip1")}>
                                                <BsInfoCircle />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                    <Stack
                                        direction="column"
                                        justifyContent="flex-start"
                                        className={classes.wizardFlex}
                                    >
                                        <Stack className={classes.tabDiv} direction="row" justifyContent="space-around">
                                            <Stack key={`tabTitle0`}
                                                justifyContent="center"
                                                direction="row"
                                                className={
                                                    clsx(classes.tab1, classes.btnTab, activeTab === 0 ? classes.currentActiveTab : '', classes.w50)
                                                }
                                                onClick={() => setActiveTab(0)}
                                            >
                                                <span
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {t("mainReport.groups")}
                                                </span>
                                            </Stack>
                                            <Stack key={`tabTitle1`}
                                                justifyContent="center"
                                                direction="row"
                                                className={
                                                    clsx(classes.tab1, classes.btnTab, activeTab === 1 ? classes.currentActiveTab : '', classes.w50)
                                                }
                                                onClick={() => setActiveTab(1)}
                                            >
                                                <span style={{ marginInlineEnd: 15 }} className={classes.elipsis}>
                                                    {t("mainReport.manual")}
                                                </span>
                                                <Tooltip
                                                    disableFocusListener
                                                    title={t("smsReport.manualTip")}
                                                    classes={{ tooltip: styles.customWidth }}
                                                >
                                                    <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                                                        <BsInfoCircle />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                    <Stack justifyContent="center" >
                                        {activeTab === 0 && subAccountAllGroups &&
                                            <Groups
                                                classes={classes}
                                                list={showTestGroups ? [...testGroups.concat(subAccountAllGroups)] : [...subAccountAllGroups]}
                                                // list={groupData?.Groups}
                                                selectedList={selectedGroups}
                                                callbackSelectedGroups={callbackSelectedGroups}
                                                callbackUpdateGroups={callbackUpdateGroups}
                                                callbackSelectAll={callbackSelectAll}
                                                callbackShowTestGroup={callbackShowTextGroups}
                                                showFilter={false}
                                                isSms={true}
                                                uniqueKey={'groups_2'}
                                                innerHeight={325}
                                            />
                                        }
                                        {activeTab === 1 && <Stack
                                        >
                                            <UploadXL
                                                classes={classes}
                                                areaStyle={{
                                                    height: 395
                                                }}
                                                onDone={(groupName, res, uploadedAsFile) => {
                                                    //setToastMessage(null);
                                                    handleUploadRecipients(groupName, res, uploadedAsFile);
                                                }}
                                                settings={{ ...UploadSettings.GROUPS, ShowGroupName: true }}
                                                setToastMessage={setToastMessage}
                                                placeHolder={"recipient.addRecTextareaPlaceholder"}
                                                tooltipText='recipient.bulkRecUpldTooltipText'
                                                onlyMapping={true}
                                                onType={setQuickSendClients}
                                                extraButtons={
                                                    <>
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
                                                    </>
                                                }
                                            />
                                        </Stack>}
                                        {activeTab === 0 && <Stack className={classes.groupsFooter}>
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
                                                    </Stack>

                                                    <Stack
                                                        style={{
                                                            display: "flex",
                                                            marginTop: "10px",
                                                            marginBottom: "10px",
                                                        }}
                                                        direction="row"
                                                    >
                                                        <span className={classes.createGroupSpan}>{t("mainReport.totalReci")}: {totalClientsToSend.toLocaleString()}</span>
                                                        <Tooltip
                                                            placement={'bottom'}
                                                            // disableFocusListener
                                                            title={t("smsReport.finalReciTip")}
                                                            classes={{ tooltip: classes.customWidth }}
                                                            style={{ marginInlineStart: "5px" }}
                                                        >
                                                            <IconButton style={{ paddingInline: 5, paddingBlock: 0, marginTop: -10 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                                                                <BsInfoCircle />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Stack>
                                                {NewGroupForm()}
                                            </Stack>
                                        </Stack>
                                        }
                                    </Stack>
                                </Grid>
                                <Grid item md={1} xs={12}></Grid>
                                <Grid item md={4} xs={12}>
                                    <SendingMethod
                                        disabled={newsletterSettings?.Status !== 1}
                                        classes={classes}
                                        ToastMessages={ToastMessages}
                                        setToastMessage={setToastMessage}
                                        campaign={{ ...campaignValues, SendingMethod: (!campaignValues.SendingMethod || campaignValues.SendingMethod === 0) ? 1 : campaignValues.SendingMethod }}
                                        onUpdateCampaign={(data) => {
                                            setCampaignValues({ ...campaignValues, ...data })
                                            setPulseIndication(data.PulseAmount != '' && data.PulseAmount > 0)
                                        }}
                                        extraButtons={
                                            <>
                                                <Stack
                                                    direction="row"
                                                    className={clsx(classes.dFlex, classes.flexWrap)}
                                                >
                                                    {

                                                        <>
                                                            <Badge variant="dot" color="primary" invisible={!pulseIndication} className={clsx(classes.ml5, classes.mt1)}>
                                                                <Button
                                                                    className={clsx(
                                                                        classes.btn, classes.btnRounded,
                                                                        newsletterInfo?.IsFirstCampaign === true || selectedGroups?.length < 1 || campaignValues.SendingMethod === 3 || newsletterSettings?.Status !== 1 || totalClientsToSend === 0 || campaignValues.IsBestTime
                                                                            || totalClientsToSend < 100
                                                                            ? classes.disabled : null)}
                                                                    onClick={() => {
                                                                        handlePulseDialog();
                                                                    }}
                                                                >
                                                                    <FaRegCalendarAlt className={classes.pl5} />
                                                                    {t("mainReport.pulseSend")}
                                                                </Button>
                                                            </Badge>
                                                            <Tooltip
                                                                disableFocusListener
                                                                style={{ marginInlineEnd: isRTL ? 5 : 0, marginInlineStart: 5 }}
                                                                title={t("smsReport.pulseSendTip")}
                                                                classes={{ tooltip: styles.customWidth }}
                                                                className={clsx(classes.ml5, classes.mt1)}
                                                            >
                                                                <IconButton style={{ padding: 0 }} className={clsx(classes.icon_Info, classes.f20)} aria-label={t("mainReport.toolTip1")}>
                                                                    <BsInfoCircle />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>

                                                    }

                                                    <Badge variant="dot" color="primary" invisible={!segmantIndication} className={clsx(classes.ml5, classes.mt1)}>
                                                        <Button
                                                            className={clsx(classes.btn, classes.btnRounded)}
                                                            disabled={!selectedGroups || selectedGroups?.length === 0 || newsletterSettings?.Status !== 1 || totalClientsToSend === 0}
                                                            onClick={() => {
                                                                setFilterParameters(campaignValues);
                                                                setDoNotSendFilterValues(filterValues);
                                                                setDialogType({ type: 'filterRecipients' });
                                                            }}
                                                        >
                                                            {t('mainReport.recipientFilter')}
                                                        </Button>
                                                    </Badge>

                                                    <Badge variant="dot" color="primary" invisible={!smsMarketingIndication} className={clsx(classes.ml5, classes.mt1)}>
                                                        {/* <Button
                                                            className={clsx(classes.btn, classes.btnRounded)}
                                                            disabled={!selectedGroups || selectedGroups?.length === 0 || newsletterSettings?.Status !== 1 || totalClientsToSend === 0}
                                                            onClick={() => {
                                                                handleSmsMarketing();
                                                            }}
                                                        >
                                                            {t("campaigns.newsLetterEditor.sendSettings.smsMarketing.title")}
                                                        </Button> */}
                                                    </Badge>
                                                </Stack>
                                            </>
                                        } />
                                    <Box className={styles.flexEndTotalSms}>
                                        {smsMarketingIndication && <Box>
                                            <Button className={clsx(classes.link, styles.deleteButton)} onClick={() => setShowDeleteSmsMarketingDialog(true)}>
                                                {t('campaigns.deleteTotalMarketing')}</Button>
                                        </Box>}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                        {
                            <Box className={{ [classes.disabled]: newsletterInfo.IsDeleted }}>
                                <WizardActions
                                    classes={classes}
                                    onBack={newsletterSettings?.Status === 1 && {
                                        callback: () => { handlePreviousPage() }
                                    }}
                                    onDelete={newsletterSettings?.Status === 1 && onHandleDelete}
                                    onExit={() => { setDialogType({ type: "exit" }) }}
                                    additionalButtons={newsletterSettings?.Status === 1 && renderButtons()}
                                />
                            </Box>
                        }
                    </Box>
                </div>
            </Box>
            {renderDialog()}
            {dialogType?.type === 'smsMarketing' && <SmsMarketingDialog
                classes={classes}
                selectedGroups={selectedGroups}
                settings={campaignValues}
                setDialogType={() => setDialogType(null)}
                isOpen={dialogType?.type === 'smsMarketing'}
                smsMarketingModel={{ ...smsMarketingModel }}
                onClose={() => setDialogType(null)}
                onCancel={() => setDialogType(null)}
                onConfirm={(e) => {
                    setDialogType(null);
                    setSmsMarketingIndication(true);
                }}
            />}
            {dialogType?.type === 'SummaryDialog' && newsletterSendSummary !== null && <SummaryDialog
                classes={classes}
                onClose={() => setDialogType(null)}
                onConfirm={() => onSaveSettings(true)}
                isOpen={dialogType?.type === 'SummaryDialog'}
                setDialogType={() => setDialogType(null)}
                groups={selectedGroups}
                PreviewURL={newsletterSettings?.PreviewURL}
                handleSendResponse={handleSendResponse}
                IsQuickSend={dialogType?.IsQuickSend}
            />}
            {dialogType?.type === 'SendResponse' && <SendResponseDialog
                classes={classes}
                data={dialogType.data}
                isOpen={dialogType?.type === 'SendResponse'}
                key={'SendResponse'}
                setDialogType={setDialogType}
            />}
            {noCreditLeft && <NoCreditDialog
                classes={classes}
                isOpen={noCreditLeft}
                popUpType={CreditType.EMAIL}
                onClose={() => setNoCreditLeft(false)}
                onCancel={() => setNoCreditLeft(false)}
                key={'123'}
            />}
            {showDeleteSmsMarketingDialog && <DynamicConfirmDialog
                classes={classes}
                isOpen={showDeleteSmsMarketingDialog}
                title={t('campaigns.deleteTotalMarketing')}
                text={t('campaigns.deleteTotalMarketingDesc')}
                onConfirm={() => {
                    setShowDeleteSmsMarketingDialog(false);
                    onConfirmDeleteSmsMarketing();
                }}
                onCancel={() => setShowDeleteSmsMarketingDialog(false)}
            />}
            {/* //#region snacks */}
            <Snackbar
                open={snackbarValues.snackBarPulseBoolean}
                autoHideDuration={3000}
                onClose={() => setSnackbarValues({ ...snackbarValues, snackBarPulseBoolean: false })}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                style={{ zIndex: "9999" }}
            >
                <Alert severity="error" className={severe.customcolor}>
                    {t("smsReport.pulseAmount")}
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
                style={{ zIndex: "9999", marginTop: snackbarValues.snackBarPulseBoolean && "60px" }}
            >
                <Alert severity="error" className={severe.customcolor}>
                    {t("smsReport.timeAmount")}
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
            {/* //#endregion  */}
            {newEMailVerification && <VerificationDialog
                textButtonOnSuccess={t('common.close')}
                classes={classes}
                isOpen={newEMailVerification}
                variant='email'
                onClose={() => {
                    setNewEmailVerification(false);
                    handleOnVerificationClose();
                }}
                step={1}
                value={newsletterInfo.FromEmail}
            />}

            {dialogType?.type === 'quickMnualUpload' && <QuickManualUploadDialog
                classes={classes}
                onClose={() => setDialogType(null)}
                onCancel={() => setDialogType(null)}
                onConfirm={() => handleConfirmC()}
            />}
            <DynamicConfirmDialog
                classes={classes}
                isOpen={!domainIsAllowed}
                title={t('campaigns.newsLetterMgmt.payAttention')}
                text={t('common.domainVerification.sendSettings.domainNotVerified')}
                onConfirm={() => { setDomainIsAllowed(true); navigate('/react/campaigns') }}
                onClose={() => { setDomainIsAllowed(true); navigate('/react/campaigns') }}
                confirmButtonText={t('common.domainVerification.sendSettings.backToCampaigns')}
            />
            <Loader isOpen={showLoader} />
        </DefaultScreen>
    )
}

export default NewsletterSendSettings