import React, { useState, useEffect } from "react";
import { Tooltip, Typography, ClickAwayListener } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormGroup from "@material-ui/core/FormGroup";
import Picker from "emoji-picker-react";
import Toast from '../Toast/Toast.component';
import Emoj from "../../assets/images/smile.png";
import Waze from "../../assets/images/waze.png";
import { FaCheck } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";
import queryString from 'query-string';
import { FaExclamationCircle } from 'react-icons/fa'
import { useLocation, useNavigate, useParams } from "react-router";
import {
    getPreviousCampaignData,
    getPreviousLandingData,
    getAccountExtraData,
    getGroupsBySubAccountId,
    smsSave,
    deleteSms,
    smsSaveGroup,
    getSmsByID,
    smsQuick,
    getCampaignSumm,
    getCreditsforSMS,
    getTestGroups,
    getCommonFeatures,
    getSMSVirtualNumber
} from "../../redux/reducers/smsSlice";
import { Dialog } from "../managment/index";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { Button, Grid, Box, TextField } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlinePlusCircle, AiOutlineFile, AiOutlineAlignLeft } from "react-icons/ai";
import Switch from "react-switch";
import { HiOutlineUserGroup } from "react-icons/hi";
import clsx from "clsx";
import { logout } from '../../helpers/Api/PulseemReactAPI'
import { Loader } from "../Loader/Loader";

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


const Editorbox = ({
    classes,
    variant = 'row',
    values,
    linkToCampaign = null,
    linkToUpdate = null,
    onUpdate = () => null,
    onFromNumberInit = () => null,
    ...props }) => {
    const { t } = useTranslation();
    document.title = t("sms.pageTitle");
    const styles = useStyles();
    const btnStyle = useStyleNew();
    const inputProps = {
        maxLength: "13"
    }

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { windowSize, isRTL, accountFeatures } = useSelector(
        (state) => state.core
    );
    const {
        previousLandingData,
        previousCampaignData,
        commonSettings,
        testGroups,
        ToastMessages
    } = useSelector((state) => state.sms);
    const location = useLocation();
    const [dialogType, setDialogType] = useState(null)
    const [alignment, setAlignment] = useState('right');
    const [showEmoji, setShowEmoji] = useState(false);
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
    const [waize, setwaize] = useState(false);
    const [smsCampaignId, setCampaignId] = useState("");
    const [ContactSearch, setContactSearch] = useState("");
    const [phone, setphone] = useState("");
    const [alertToggle, setalertToggle] = useState(false);
    const [selectedGroup, setselectedGroup] = useState([]);
    const [StaticNumber, setStaticNumber] = useState("");
    const [hidden, sethidden] = useState(false);
    const [splittedMsg, setsplittedMsg] = useState([])
    const [SplittedLinks, setSplittedLinks] = useState(null);
    const [Searched, setSearched] = useState("");
    const [modalOpen, setmodalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [removalNumber, setremovalNumber] = useState(null);
    const [storedValue, setstoredValue] = useState("");
    const [summary, setsummary] = useState(false);
    const [campaignNumberValidated, setcampaignNumberValidated] = useState(false);
    const [total, settotal] = useState(0);
    const [showLoader, setLoader] = useState(true);
    const [selectValue, setselectValue] = useState("Personilization");
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const [isLinksStatistics, setIsLinksStatistics] = useState(true);
    const [isFromAutomation, setIsFromAutomation] = useState(false);
    const [otpOpen, setOTPOpen] = useState(null);
    const [isSiteTracking, setIsSiteTracking] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [showRemovalLink, setShowRemovalLink] = useState(false);
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
        ...values
    });
    useEffect(() => {
        setAlignment(isRTL ? "right" : "left");
    }, [isRTL])

    useEffect(() => {
        if (linkToCampaign !== null && smsModel.Text.indexOf(linkToCampaign) === -1) {
            onAddText(linkToCampaign)
        }
    }, [linkToCampaign])
    useEffect(() => {
        if (linkToUpdate !== null && smsModel.Text.indexOf(linkToUpdate) === -1) {
            onAddText(linkToUpdate)
        }
    }, [linkToUpdate])

    useEffect(() => {
        if (isPageLoaded && accountFeatures) {
            if (accountFeatures.includes('38')) {
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
            setShowRemovalLink(!accountFeatures.includes('39'))
        }
    }, [isPageLoaded || accountFeatures]);

    const params = useParams()

    const qs = (window.location.search && queryString.parse(window.location.search)) || location?.state;

    const renderHtml = (html) => {
        function createMarkup() {
            return { __html: html };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }

    useEffect(() => {
        if (commonSettings.SubAccountSettings) {
            siteTrackingLogic();
        }
        onUpdate(smsModel);
    }, [commonSettings, smsModel]);

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
    const initDispatch = async () => {
        setLoader(true);
        setCampaignId(props && params?.id ? params?.id : -1);
        await dispatch(getPreviousLandingData());
        await dispatch(getTestGroups());
        await dispatch(getPreviousCampaignData());
        let resp = await dispatch(getAccountExtraData());
        let arr = Object.keys(resp.payload)
        let additionalExtraData = arr.map(function (key) {
            return { [key]: resp.payload[key] };
        })

        for (let i = 0; i < additionalExtraData.length; i++) {
            defaultAccountExtraData.push({ ...additionalExtraData[i], selected: false })
        }
        setextraAccountDATA(defaultAccountExtraData)
        await dispatch(getGroupsBySubAccountId());
        if (qs && qs.FromAutomation && qs.FromAutomation > 0) {
            setIsFromAutomation(true);
        }
        await initFromNumber();
        setIsPageLoaded(true);
    }

    useEffect(() => {
        initDispatch();
    }, [dispatch]);

    const initFromNumber = async () => {
        // const smsCampaign = await getSavedData();
        const commonFeatures = await dispatch(getCommonFeatures());
        let fromNumber = commonFeatures.payload.DefaultCellNumber;

        const virtualNumber = await dispatch(getSMSVirtualNumber(fromNumber));

        if (fromNumber === -1) {
            fromNumber = virtualNumber.payload.Number;
        }

        setcampaignNumber(fromNumber);
        setStaticNumber(virtualNumber.payload.Number);
        setremovalNumber(virtualNumber.payload.RemovalKey);
        setstoredValue(commonFeatures.payload.DefaultCellNumber);
        if (fromNumber !== virtualNumber.payload.Number) {
            setrestoreBool(false);
            setremovalMessageButtonDisabled(true);
        }
        setLoader(false);
        onFromNumberInit(fromNumber);
    }

    const getAutomationReturnUrl = (campaignId) => {
        const nodeToEdit = qs.NodeToEdit ?? null;
        return `/pulseem/CreateAutomations.aspx?AutomationID=${qs.FromAutomation}&NodeToEdit=${nodeToEdit}&SMSCampaignID=${campaignId}`;
    }
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
            let credits = res.payload.split("#");
            setmessageCount(credits[0]);
            handleSmsModelChange("CreditsPerSms", credits[0]);
        });
    }
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
    const handleRestore = async () => {
        setrestoreBool(true);
        setcampaignNumber(StaticNumber);
        setLoader(true);
        let r = await dispatch(getCommonFeatures());
        setLoader(false);
        // setcampaignNumber(r.payload.DefaultCellNumber)
        setLoader(true);
        let response = await dispatch(getSMSVirtualNumber(r.payload.DefaultCellNumber));
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
            if (0 === cursorPos) {
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

    const onEmojiClick = (event, emojiObject) => {
        setShowEmoji(false);
        onAddText(emojiObject.emoji);
    };

    const onMsgChange = async (e) => {
        handleSmsModelChange("Text", e.target.value);

        if (smsModel.Text && smsModel.Text !== "" && e.target.value.length < smsModel.Text.length) {
            handleMsgSelect();
        }
    };

    const onRemovalLink = async () => {
        onAddText("##SmsUnsubscribeURL##");
        let total = splittedMsg;
        total.push("##SmsUnsubscribeURL##")
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
        if (smsModel.Text.includes("##SmsUnsubscribeURL##")) {
            setremovalLinkDisabled(true);
        }
        else {
            setremovalLinkDisabled(false);
        }
    }
    const handleClickOutsideEmoji = () => {
        setShowEmoji(false);
    }

    const renderSwitch = () => (
        <Grid item="true" xs={12} md={12} sm={12}>
            <Box className={classes.switchDiv}>
                <FormGroup>
                    <Switch
                        className={
                            isRTL
                                ? clsx(classes.reactSwitchHe, "react-switch")
                                : clsx(classes.reactSwitch, "react-switch")
                        }
                        checked={isLinksStatistics}
                        onChange={toggleKeep}
                        onColor="#28a745"
                        checkedIcon={false}
                        uncheckedIcon={false}
                        handleDiameter={30}
                        height={20}
                        width={48}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        id="material-switch"
                    />
                </FormGroup>
                <Box className={classes.radio}>
                    <Typography style={{ fontSize: "18px" }}>
                        {t("mainReport.keepTrack")}
                    </Typography>
                    <Typography

                        className={clsx(classes.descSwitch, classes.w100)}
                    >
                        {t("mainReport.keepDesc")}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    )

    const renderMsg = () => {
        return (
            <Grid container>
                {variant === "column" && renderSwitch()}
                <Grid item="true" xs={12} md={variant === "column" ? 12 : 8} className={classes.boxDiv} style={{ marginTop: 20 }}>
                    <textarea
                        placeholder={t("mainReport.typeText")}
                        maxLength="1000"
                        outlined=""
                        id="yourMessage"
                        className={clsx(classes.msgArea, classes.sidebar)}
                        style={{ textAlign: alignment, maxHeight: 120 }}
                        onChange={onMsgChange}
                        onSelect={handleMsgSelect}
                        value={smsModel.Text}
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
                    <Box className={classes.funcDiv}>
                        <Box
                            className={isRTL ? classes.emojiHe : classes.emoji}
                        >
                            {isRTL ? (
                                <>
                                    <Tooltip
                                        disableFocusListener
                                        title={t("mainReport.aligntoRight")}
                                        classes={{ tooltip: styles.customWidth }}
                                        placement="top-start"
                                        arrow
                                    >
                                        <FormatAlignRightIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('right') }} />
                                    </Tooltip>
                                    <Tooltip
                                        disableFocusListener
                                        title={t("mainReport.alignToLeft")}
                                        classes={{ tooltip: styles.customWidth }}
                                        placement="top-start"
                                        arrow
                                    >
                                        <FormatAlignLeftIcon onClick={() => { setAlignment('left') }} />
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Tooltip
                                        disableFocusListener
                                        title={t("mainReport.alignToLeft")}
                                        classes={{ tooltip: styles.customWidth }}
                                        placement="top-start"
                                        arrow
                                    >
                                        <FormatAlignLeftIcon style={{ marginInlineEnd: "4px" }} onClick={() => { setAlignment('left') }} />
                                    </Tooltip>
                                    <Tooltip
                                        disableFocusListener
                                        title={t("mainReport.aligntoRight")}
                                        classes={{ tooltip: styles.customWidth }}
                                        placement="top-start"
                                        arrow
                                    >
                                        <FormatAlignRightIcon onClick={() => { setAlignment('right') }} />
                                    </Tooltip>
                                </>
                            )}
                            <ClickAwayListener onClickAway={handleClickOutsideEmoji}>
                                <Box className={classes.pickerEmoji}>
                                    {showEmoji ? (
                                        <Picker
                                            onEmojiClick={onEmojiClick}
                                            groupNames={{
                                                smileys_people: t("emoji.smiles"),
                                                animals_nature: t("emoji.nature"),
                                                food_drink: t("emoji.foodAndDrinks"),
                                                travel_places: t("emoji.places"),
                                                activities: t("emoji.activities"),
                                                objects: t("emoji.objects"),
                                                symbols: t("emoji.symbols"),
                                                recently_used: t("emoji.recently"),
                                            }}
                                            groupVisibility={{
                                                flags: false,
                                                recently_used: false
                                            }}
                                        />
                                    ) : null}
                                    <Tooltip
                                        disableFocusListener
                                        title={t("mainReport.emoji")}
                                        classes={{ tooltip: styles.customWidth }}
                                        placement="top-start"
                                        arrow
                                    >
                                        <img
                                            alt="emoji picker"
                                            src={Emoj}
                                            style={{
                                                marginInlineEnd: "8px",
                                                widht: "25px",
                                                height: "25px",
                                            }}
                                            onClick={() => {
                                                setShowEmoji(!showEmoji);
                                            }}
                                        />
                                    </Tooltip>
                                </Box>
                            </ClickAwayListener>
                        </Box>
                        <Box className={classes.baseButtons}>
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
                        </Box>
                        <Box className={classes.endButtons}>
                            <Box className={classes.selectMsg}>
                                <Tooltip
                                    disableFocusListener
                                    title={t("mainReport.selectTooltip")}
                                    classes={{ tooltip: styles.customWidth }}
                                    placement="top"
                                    arrow
                                >
                                    <select
                                        className={clsx(classes.selectVal, classes.sidebar)}
                                        value={selectValue}
                                        onChange={handleSelectChange}
                                    >
                                        <option disabled value="Personilization">{t("mainReport.personalisationSelect")}</option>
                                        {extraAccountDATA.map((item, i) => {
                                            if (item.selected) {
                                                return (<option disabled value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{t(item[Object.keys(item)[0]])}</option>)
                                            }
                                            else {
                                                return <option value={[Object.keys(item)[0]]} key={`extrakey_${i}`}>{item[Object.keys(item)[0]] ? t(item[Object.keys(item)[0]]) : Object.keys(item)[0]}</option>;
                                            }

                                        })}
                                    </select>
                                </Tooltip>
                            </Box>
                            <Box className={classes.addDiv} tabIndex="0" onBlur={() => { seteditmenuClick(false) }}>
                                <Typography
                                    className={classes.addButtons}
                                    onClick={() => {
                                        seteditmenuClick(!editmenuClick);
                                    }}
                                >
                                    <AiOutlinePlusCircle className={classes.addOptionsIcon} />
                                    {t("mainReport.add")}
                                </Typography>
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
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                {variant === "row" && renderSwitch()}
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

    const siteTrackingLogic = () => {
        if (commonSettings.SubAccountSettings.DomainAddress && commonSettings.SubAccountSettings.DomainAddress !== '') {
            const domainName = commonSettings.SubAccountSettings.DomainAddress.replace('https://', '').replace('http://', '').replace('www.', '');
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
                if (!smsModel.Text.includes('ref') && isLinksStatistics) {
                    let text = smsModel.Text;
                    const startIndex = smsModel.Text.substring(smsModel.Text.indexOf(commonSettings.SubAccountSettings.DomainAddress));
                    const originalLink = startIndex.split(' ') || startIndex.split('\n');
                    let originUrl = originalLink[0];
                    let newUrl = originUrl.trim();
                    newUrl += newUrl.includes('?') ? '&ref=##ClientIDEnc##' : '?ref=##ClientIDEnc##';
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
        const payloadToPush = { ...smsModel, FromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text, CreditsPerSms: `${messageCount}`, IsLinksStatistics: isLinksStatistics, IsTest: false, AccountID: commonSettings.AccountID, SubAccountID: commonSettings.SubAccountId, SmsCampaignID: smsCampaignId }
        setLoader(true);
        let r = await dispatch(smsSave(payloadToPush));
        const campaignId = r.payload.Message;
        setCampaignId(campaignId);
        setLoader(false);
        if (r.payload.Status === 2) {
            if (isSave) {
                setToastMessage(ToastMessages.SUCCESS);
                setTimeout(() => {
                    navigate(`/sms/edit/${campaignId}${isFromAutomation ? "?FromAutomation=" + qs.FromAutomation + "&NodeToEdit=" + qs.NodeToEdit : ""}`);
                    setToastMessage(null);
                }, 1500);
            } else if (returnToAutomation) {
                window.location = getAutomationReturnUrl(campaignId);
            } else {
                navigate(`/sms/send/${campaignId}`);
            }
        }
        else if (r.payload.Status === 3) {
            setOTPOpen(true);
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
        if (props && params?.id) {
            let response = await dispatch(getSmsByID(params?.id))
            if (response) {
                dispatch(deleteSms(response.payload.SMSCampaignID));
                handleClose();
                navigate("/SMSCampaigns");
            }
        }
        else {
            dispatch(deleteSms(-1));
            handleClose();
            navigate("/SMSCampaigns");
        }
    };

    const handleGroupClose = async () => {
        if (selectedGroup.length > 0) {
            const groupIds = selectedGroup.map((g) => { return g.GroupID });
            settotal(selectedGroup.length);
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
                let r2 = await dispatch(smsSaveGroup(payload2));
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
        sethidden(true);
    };

    const handlecaution = () => {
        setalertToggle(false);
        setmodalOpen(false);
        setremovalNumber(null);
        setDialogType(null);
    };
    const handleAlertoff = () => {
        setcampaignNumber(storedValue);
        setalertToggle(false);
        setDialogType(null);
    };
    const handleExit = async (saveBeforeExit) => {
        if (saveBeforeExit) {
            const payloadToPush = { ...smsModel, SmsCampaignID: smsCampaignId, fromNumber: campaignNumber, Name: smsModel.Name, Text: smsModel.Text }
            let saveResponse = await dispatch(smsSave(payloadToPush));
            if (saveResponse) {
                if (saveResponse.payload.Status === 3) {
                    setOTPOpen(true);
                    return;
                }
                else if (saveResponse.payload.Status === 2) {
                    setDialogType(null);
                    navigate("/SMSCampaigns");

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
            navigate("/SMSCampaigns");
            setDialogType(null);
        }
    };
    const handleSummary = () => {
        setsummary(false);
    }

    const focusOnMessage = () => {
        const textArea = document.getElementById("yourMessage");
        setTimeout(() => {
            textArea.focus();
        }, 500)
    }

    const onLocation = async () => {
        onAddText("https://waze.to/?q=" + Searched.split(" ").join("%20"));
        setlinkCount(linkCount + 1);
        setwaize(false);
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

    //#region Dialogs
    const lpDialog = () => {
        return {
            title: t('mainReport.selectLanding'),
            showDivider: true,
            icon: (
                <BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />
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
                                if (CampaignSearch == "") {
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
            showDivider: true,
            icon: (
                <BsArrowClockwise style={{ fontSize: 30, color: "#fff" }} />
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
                                if (landingSearch == "") {
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
            showDivider: true,
            icon: (
                <div className={classes.dialogIconContent}>
                    {'\u0056'}
                </div>
            ),
            content: (
                <Box className={classes.dialogBox}>
                    <Paper component="form" className={btnStyle.root}>
                        <img src={Waze} style={{ pointerEvents: "none" }} />
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
    // const deleteDialog = () => {
    //     return {
    //         title: t('mainReport.deleteSms'),
    //         showDivider: true,
    //         disableBackdropClick: true,
    //         icon: (
    //             <AiOutlineExclamationCircle
    //                 style={{ fontSize: 30, color: "#fff" }}
    //             />
    //         ),
    //         content: (
    //             <Box>
    //                 <div className={classes.bodyTextDialog}>
    //                     <Typography>
    //                         {t("mainReport.confirmSure")}
    //                     </Typography>
    //                 </div>
    //             </Box>
    //         ),
    //         showDefaultButtons: true,
    //         onClose: () => { setDialogType(null) },
    //         onConfirm: () => { handleDelete() }
    //     }
    // }
    const validationDialog = () => {
        return {
            title: t('mainReport.fieldInvalid'),
            showDivider: true,
            icon: (
                <AiOutlineExclamationCircle
                    style={{ fontSize: 30, color: "#fff" }}
                />
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
            showDefaultButtons: false,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { setDialogType(null) }
        }
    }
    const groupDialog = () => {
        return {
            title: t('mainReport.selectGroups'),
            showDivider: true,
            icon: (
                <HiOutlineUserGroup
                    style={{ fontSize: 30, color: "#fff" }}
                />
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
            confirmText: t("common.Yes"),
            cancelText: t("common.No"),
            onClose: () => { validationCheckpoint(() => handleExit(false)) },
            onCancel: () => { setDialogType(null) },
            onConfirm: () => { validationCheckpoint(() => handleExit(true)); }
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
            onConfirm: () => { handlecaution() }
        }
    }
    const noCreditDialog = () => {
        return {
            showDivider: false,
            icon: (
                <AiOutlineExclamationCircle
                    style={{ fontSize: 30, color: "#fff" }}
                />
            ),
            content: (
                <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <FaExclamationCircle style={{ fontSize: 100 }} />
                    <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{t("common.ErrorTitle")}</Typography>
                    <Typography style={{ textAlign: 'center' }}>{renderHtml(t("sms.notEnoughCreditLeft"))}</Typography>
                    <Typography style={{ textAlign: 'center' }}>{renderHtml(t("sms.notEnoughCreditLeftDesc"))}</Typography>
                    <Box style={{ marginTop: 25 }}>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => setDialogType(null)}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton
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
                <AiOutlineExclamationCircle
                    style={{ fontSize: 30, color: "#fff" }}
                />
            ),
            content: (
                <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <FaExclamationCircle style={{ fontSize: 60 }} />
                    <Typography className={classes.mt2} style={{ fontWeight: 'bold' }}>{t("common.Notice")}</Typography>
                    <Typography style={{ textAlign: 'center' }}>{renderHtml(t("siteTracking.NoticeLinkStatistics"))}</Typography>
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
    const renderDialog = () => {
        const { type, data } = dialogType || {}

        const dialogContent = {
            latestLP: lpDialog(),
            latestCampaigns: campaignsDialog(),
            waze: wazeDialog(),
            // deleteSms: deleteDialog(),
            valiateError: validationDialog(),
            groups: groupDialog(),
            exit: exitDialog(),
            alert: alertDialog(),
            noCredit: noCreditDialog(),
            linkStatisticAlert: siteTrackingLinkDialog(data)
        }

        const currentDialog = dialogContent[type] || {}
        return (
            dialogType && <Dialog
                classes={classes}
                open={dialogType}
                onClose={handleClose}
                {...currentDialog}>
                {currentDialog.content}
            </Dialog>
        )
    }

    return (
        <>
            {renderToast()}
            <Grid container>
                {renderMsg()}
            </Grid>
            {renderDialog()}

            <Loader isOpen={showLoader} />
        </>
    );
};

export default Editorbox