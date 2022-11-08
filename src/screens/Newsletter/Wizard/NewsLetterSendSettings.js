import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import moment from "moment";
import { FaRegCalendarAlt, FaFilter } from "react-icons/fa";
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
import { useHistory, useNavigate, useParams } from "react-router";
import { BsTrash, BsChevronDown, BsChevronUp } from "react-icons/bs";
import Gif from "../../../assets/images/managment/check-circle.gif";
import * as XLSX from 'xlsx';
import Title from '../../../components/Wizard/Title'
import { Typography, Button, Grid, Box, FormControlLabel, FormControl, RadioGroup, Radio, FormHelperText, Divider, TextField } from "@material-ui/core";
import {
    sendSms, deleteSms, getSmsByID, IsOTPPassed, getCampaignSumm, smsCombinedGroup, saveManualClients,
    getAccountExtraData, saveSmsCampSettings, getCampaignSettings, getFinishedCampaigns, getGroupsBySubAccountId, getTestGroups
} from "../../../redux/reducers/smsSlice";
// import Summary from "./smsSummary";
import clsx from "clsx";
// import OTP from './OTP';
import { FaExclamationCircle } from 'react-icons/fa'
import { logout } from '../../../helpers/api'
import { Stack } from "@mui/material";
import RenderToast from "../../../components/core/RenderToast";

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


const NewsLetterSendSettings = ({ classes, ...props }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const styles = useStyles();
    const navigate = useNavigate();
    const params = useParams();
    const severe = useSnackSevere();
    const recipientSuccess = useSnackRecipients();
    const { OTPPassed, ToastMessages, extraData, getCampaignSum, testGroups } = useSelector((state) => state.sms);
    const [showLoader, setLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [totalCampaigns, setTotalCampaigns] = useState();
    const [groupList, setGroupList] = useState();
    const [snackbarMainPulse, setSnackbarMainPulse] = useState();
    const [activeTab, setActiveTab] = useState(0);
    const [highlighted, setHighlighted] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [dialogType, setDialogType] = useState({ type: null });
    const [bsDot, setbsDot] = useState(false);
    // const [newGroupDetails.toggleChecked, settoggleChecked] = useState(false)
    const [newGroupDetails, setNewGroupDetails] = useState({
        toggleChecked: false,
        groupNameExist: false,
        groupValue: ''
    })

    const getData = async () => {
        setLoader(true);
        if (params?.id) {
            const finishedCampaigns = await dispatch(getFinishedCampaigns());
            const subAccountGroups = await dispatch(getGroupsBySubAccountId());
            const campaignSettings = await dispatch(getCampaignSettings(params.id));
            await dispatch(getTestGroups());

            if (campaignSettings.payload.error) {
                logout();
            }
            setTotalCampaigns(finishedCampaigns.payload);
            setGroupList(subAccountGroups.payload);
            //     if (campaignSettings.payload && campaignSettings.payload.PulseSettings) {
            //         setTimeType(campaignSettings.payload.PulseSettings.TimeType);
            //         setPulseType(campaignSettings.payload.PulseSettings.PulseType);
            //         setPulseAmount(`${campaignSettings.payload.PulseSettings.PulseAmount}`)
            //         setTimeInterval(`${campaignSettings.payload.PulseSettings.TimeInterval}`)
            //     }

            //     if (campaignSettings.payload.Groups !== null) {
            //         const selectedGroupsForSend = [];
            //         const seGroups = campaignSettings.payload.Groups || [];
            //         for (var i = 0; i < seGroups.length; i++) {
            //             const g = subAccountGroups.payload.filter((c) => { return c.GroupID === seGroups[i] });
            //             if (g.length > 0) {
            //                 selectedGroupsForSend.push(g[0]);
            //             }
            //         }
            //         setSelected(selectedGroupsForSend);
            //     }
            //     if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.Groups.length !== 0) {
            //         setbsDot(true);
            //         const selectedGroups = [];
            //         const seGroups = campaignSettings.payload.SendExeptional.Groups;
            //         for (var i = 0; i < seGroups.length; i++) {
            //             selectedGroups.push(subAccountGroups.payload.filter((c) => { return c.GroupID === seGroups[i] })[0]);
            //         }
            //         setFilterGroups(selectedGroups);
            //     }
            //     if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.Campaigns.length !== 0) {
            //         const selectedCampaigns = [];
            //         const seCampaigns = campaignSettings.payload.SendExeptional.Campaigns;
            //         for (var i = 0; i < seCampaigns.length; i++) {
            //             selectedCampaigns.push(finishedCampaigns.payload.filter((c) => { return c.SMSCampaignID === seCampaigns[i] })[0]);
            //         }
            //         setFilterCampaigns(selectedCampaigns);
            //     }
            //     if (campaignSettings.payload.SendExeptional != null && campaignSettings.payload.SendExeptional.ExceptionalDays !== -1) {
            //         setExceptionalDays(`${campaignSettings.payload.SendExeptional.ExceptionalDays}`)
            //         settoggleReci(true);

            //     }
            //     if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseSettingsID !== -1) {
            //         settogglePulse(true);
            //     }
            //     if (campaignSettings.payload.RandomSettings != null && campaignSettings.payload.RandomSettings.RandomAmount !== 0) {
            //         setrandom(campaignSettings.payload.RandomSettings.RandomAmount);
            //         settoggleRandom(true);
            //     }
            //     if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseType === 2) {
            //         setnoTrue(true);
            //         setpulsePer("recipients");
            //         setpulseReci("Recipients");
            //     }
            //     if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.PulseType === 1) {
            //         setpulsePer("percent");
            //         setnoTrue(false);
            //         setpulseReci("");
            //     }
            //     if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.TimeType === 1) {
            //         setminName("Mins");
            //         sethourName("");

            //     }
            //     if (campaignSettings.payload.PulseSettings != null && campaignSettings.payload.PulseSettings.TimeType === 2) {
            //         setminName("");
            //         sethourName("Hours");
            //     }
            //     if (campaignSettings.payload.SendTypeID) {
            //         setSendType(`${campaignSettings.payload.SendTypeID}`);
            //     }
            //     if (campaignSettings.payload.FutureDateTime !== null && campaignSettings.payload.SendTypeID === 2) {
            //         handleFromDate(moment(campaignSettings.payload.FutureDateTime));
            //     }
            //     if (campaignSettings.payload.SendTypeID === 3) {
            //         setdaysBeforeAfter(campaignSettings.payload.SpecialSettings.Day);
            //         setsendTime(moment(campaignSettings.payload.SpecialSettings.SendHour))
            //         setDateFieldID(`${campaignSettings.payload.SpecialSettings.DateFieldID}`)
            //         if (campaignSettings.payload.SpecialSettings.IntervalTypeID === -1) {
            //             settoggleB(true);
            //             settoggleA(false);
            //             setafterClick(false);
            //         }
            //         else {
            //             settoggleB(false);
            //             settoggleA(true);
            //             setafterClick(true);
            //         }
            //     }

            setLoader(false);
        }
        setLoader(false);
    };

    const getDataExtra = async () => {
        await dispatch(getAccountExtraData());
        setLoader(false);
    };

    useEffect(() => {
        // setLoader(true);
        getData();
        // setLoader(false);
        getDataExtra();
    }, [dispatch]);

    const handleInputNewGroup = (e) => {
        setNewGroupDetails({ ...newGroupDetails, groupNameExist: false, groupValue: e.target.value });
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
        let r = await dispatch(smsCombinedGroup(payload));
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
                                <span className={classes.bodyInfo}>i</span>
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
            callbackSelectedGroups={callbackSelectedGroups}
            callbackUpdateGroups={(groups) => setSelectedGroups(groups)}
            callbackSelectAll={() => setSelectedGroups(groupList.length === selectedGroups.length ? [] : groupList)}
            callbackReciFilter={() => setDialogType({ type: "filterRecipients" })}
            callbackShowTestGroup={callbackShowTestGroup}
            isSms={true}
            //BUG: UNCOMMENT THIS 
            // bsDot={bsDot}
            bsDot={false}
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
                    // value={areaData}
                    onDragEnter={() => {
                        setHighlighted(true);
                    }}
                    // onChange={areaChange}
                    onDragLeave={() => {
                        setHighlighted(false);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    // onPaste={areaChange}
                    onDrop={(e) => {
                        // e.preventDefault();
                        // setHighlighted(false);
                        // handleFiles(e)
                    }}
                />
            </Stack>
        ),
        footer: (
            <>
                {NewGroupForm()}
            </>
        ),
        tooltip: t("smsReport.manualTip")
    }

    const renderBody = () => (<>{TabComp([Tab1, Tab2])}</>)


    return (
        <DefaultScreen subPage={"create"} currentPage="sms" classes={classes} customPadding={true}>
            <RenderToast toastMessage={toastMessage} time={4000} />
            <div>
                <div>
                    <Title title={t("campaigns.createNewsLetterHeader")}
                        classes={classes}
                        // stepNumber={2}
                        subTitle={t("campaigns.newsLetterSendSettings.title")}
                    />
                    <Grid container style={{ marginBottom: "40px" }}>
                        <Grid item md={7} xs={12}>
                            {renderBody()}
                        </Grid>
                        <Grid item md={1} xs={12}></Grid>
                        <Grid item md={4} xs={12}>
                            {/* {renderRight()} */}
                        </Grid>
                    </Grid>
                </div>
                {/* <WizardButtons /> */}
            </div>
            {/* {renderDialog()} */}
            {/* {renderSummary()} */}
            {/* {renderSpecialModal()} */}
            {/* {renderSendType2validation()} */}
            {/* <Snackba
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
                    {t("sms.FillDay")}
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
            </Snackbar> */}
            {/* {otpOpen && <OTP classes={classes} campaignNumber={dataSaved.fromNumber} isOpen={otpOpen} onClose={() => { setOTPOpen(false); setDialogType(null); }} />} */}
            <Loader isOpen={showLoader} />
        </DefaultScreen>
    )
}

export default NewsLetterSendSettings