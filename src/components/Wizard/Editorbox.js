import { useState, useEffect } from "react";
import { Tooltip, Typography, MenuItem, FormControl } from "@material-ui/core";
import Select from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import Toast from '../Toast/Toast.component';
import Waze from "../../assets/images/waze.png";
import { BsArrowClockwise } from "react-icons/bs";
import { FaExclamationCircle } from 'react-icons/fa'
import { useParams } from "react-router";
import {
    getPreviousCampaignData,
    getPreviousLandingData,
    getAccountExtraData,
    getCreditsforSMS,
    getTestGroups,
    getSMSVirtualNumber
} from "../../redux/reducers/smsSlice";
import { BaseDialog } from "../DialogTemplates/BaseDialog";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { Button, Grid, Box } from "@material-ui/core";
import { AiOutlineExclamationCircle, AiOutlinePlusCircle, AiOutlineFile } from "react-icons/ai";
import clsx from "clsx";
import { Loader } from "../Loader/Loader";
import EmojiPicker from "../Emojis/EmojiPicker";
import debounce from 'lodash.debounce';
import { PulseemFeatures } from "../../model/PulseemFields/Fields";
import { IoIosArrowDown } from "react-icons/io";

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
    textRef,
    ...props }) => {
    const { t } = useTranslation();
    //document.title = t("sms.pageTitle");
    const styles = useStyles();
    const btnStyle = useStyleNew();
    const dispatch = useDispatch();
    const { windowSize, isRTL } = useSelector(
        (state) => state.core
    );
    const {
        extraData,
        testGroups,
        previousLandingData,
        previousCampaignData,
    } = useSelector((state) => state.sms);
    const { accountSettings, accountFeatures } = useSelector(state => state.common);
    const [dialogType, setDialogType] = useState(null)
    const [alignment, setAlignment] = useState('right');
    const [editmenuClick, seteditmenuClick] = useState(false);
    const [campaignBool, setcampaignBool] = useState(false);
    const [restoreBool, setrestoreBool] = useState(true);
    const [campaignNumber, setcampaignNumber] = useState("");
    const [characterCount, setcharacterCount] = useState(0);
    const [linkCount, setlinkCount] = useState(0);
    const [messageCount, setmessageCount] = useState(0);
    const [removalMessageButtonDisabled, setremovalMessageButtonDisabled] = useState(false);
    const [landingSearch, setlandingSearch] = useState("");
    const [CampaignSearch, setCampaignSearch] = useState("");
    const [removalLinkDisabled, setremovalLinkDisabled] = useState(false);
    const [splittedMsg, setsplittedMsg] = useState([])
    const [SplittedLinks, setSplittedLinks] = useState(null);
    const [Searched, setSearched] = useState("");
    const [toastMessage, setToastMessage] = useState(null);
    const [removalNumber, setremovalNumber] = useState(null);
    const [storedValue, setstoredValue] = useState("");
    const [campaignNumberValidated, setcampaignNumberValidated] = useState(false);
    const [showLoader, setLoader] = useState(true);
    const [selectValue, setselectValue] = useState("Personilization");
    const [extraAccountDATA, setextraAccountDATA] = useState([]);
    const [isLinksStatistics, setIsLinksStatistics] = useState(true);
    const [isSiteTracking, setIsSiteTracking] = useState(false);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [showRemovalLink, setShowRemovalLink] = useState(false);
    const [smsModel, setSmsModel] = useState({
        CreditsPerSms: "1",
        FromNumber: campaignNumber,
        IsLinksStatistics: true,
        IsResponse: false,
        IsTest: true,
        IsTestCampaign: false,
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
            if (accountFeatures?.indexOf(PulseemFeatures.ADD_SMS_REMOVE_TEXT) > -1) {
                setSmsModel((currentState) => {
                    if (currentState.Text === '') {
                        onAddText(`${t("sms.toUnsubscribe")}${removalNumber}`);
                        setremovalMessageButtonDisabled(true);
                        setTimeout(() => {
                            const cName = document.getElementById('campaignName');
                            cName?.focus();
                        }, 500);
                    }
                    return currentState;
                });
            }
            setShowRemovalLink(accountFeatures?.indexOf(PulseemFeatures.REMOVE_SMS_UNSUBSCRIBE_LINK) === -1)
        }
    }, [isPageLoaded || accountFeatures]);

    const params = useParams()

    const renderHtml = (html) => {
        function createMarkup() {
            return { __html: html };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }

    useEffect(() => {
        if (accountSettings.SubAccountSettings) {
            siteTrackingLogic();
        }
        onUpdate(smsModel);
    }, [accountSettings]);

    // useEffect(() => {
    //     onUpdate(smsModel);
    // }, [smsModel]);

    useEffect(() => {
        linkCalculation();
        onUpdate(smsModel);
    }, [smsModel, isSiteTracking, isLinksStatistics])

    useEffect(() => {
        debouncedCallback(characterCount)
        //getcredits(characterCount);
    }, [characterCount])

    const handleSmsModelChange = (name, value) => {
        setSmsModel(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const initDispatch = async () => {
        setLoader(true);
        if (previousLandingData?.length === 0) {
            await dispatch(getPreviousLandingData());
        }
        if (testGroups?.length === 0) {
            await dispatch(getTestGroups());
        }
        if (previousCampaignData?.length === 0) {
            await dispatch(getPreviousCampaignData());
        }

        let arrTemp = [];
        let additionalExtraData = [];

        if (!Object.keys(extraData)) {
            let resp = await dispatch(getAccountExtraData());
            arrTemp = Object.keys(resp.payload)
            additionalExtraData = arrTemp.map(function (key) {
                return { [key]: resp.payload[key] };
            })
        }
        else {
            arrTemp = Object.keys(extraData);
            additionalExtraData = arrTemp.map(function (key) {
                return { [key]: extraData[key] };
            })
        }

        for (let i = 0; i < additionalExtraData.length; i++) {
            defaultAccountExtraData.push({ ...additionalExtraData[i], selected: false })
        }
        setextraAccountDATA(defaultAccountExtraData)
        await initFromNumber();
        setIsPageLoaded(true);
    }
    useEffect(() => {
        initDispatch();
    }, [dispatch]);

    const initFromNumber = async () => {
        let fromNumber = null;
        if (accountSettings?.DefaultCellNumber) {
            fromNumber = accountSettings.DefaultCellNumber;
        }


        const virtualNumber = await dispatch(getSMSVirtualNumber(fromNumber));

        if (fromNumber === -1 || fromNumber === '' || fromNumber === null) {
            fromNumber = virtualNumber.payload.Number;
        }

        setstoredValue(fromNumber);
        setcampaignNumber(fromNumber);

        setremovalNumber(virtualNumber.payload.RemovalKey);
        if (fromNumber !== virtualNumber.payload.Number) {
            setrestoreBool(false);
            setremovalMessageButtonDisabled(true);
        }
        setLoader(false);
        onFromNumberInit(smsModel.FromNumber && smsModel.FromNumber !== '' ? smsModel.FromNumber : fromNumber);
    }
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
    const debouncedCallback = debounce(getcredits, 100);
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
    const onMsgChange = async (e) => {
        handleSmsModelChange("Text", e.target.value);

        if (smsModel.Text && smsModel.Text !== "" && e.target.value.length < smsModel.Text.length) {
            handleMsgSelect();
        }
    }
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
    }
    const onRemovalMsg = async () => {
        let removelReplyText = t("sms.toUnsubscribe") + removalNumber;
        onAddText(removelReplyText);
        let total = splittedMsg;
        total.push(removelReplyText)
        setremovalMessageButtonDisabled(true);
    }
    const handleSelectChange = async (e) => {
        setselectValue(e.target.value);
        onAddText("##" + e.target.value + "##");
    }
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
    const renderMsg = () => {
        return (
            <Grid container>
                <Grid item="true" xs={12} md={variant === "column" ? 12 : 8} className={classes.boxDiv} style={{ marginTop: 20 }}>
                    <textarea
                        ref={textRef}
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
                    <Box className={clsx(classes.funcDiv, classes.dFlex)}>
                        <Box
                            className={clsx(classes.paddingSides10, isRTL ? classes.emojiHe : classes.emoji)}
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
                            <EmojiPicker
                                classes={classes}
                                OnSelectEmoji={(emoji) => {
                                    onAddText(emoji);
                                }}
                                boxStyles={{ alignItems: 'center' }}
                            />
                        </Box>
                        <Box className={clsx(classes.baseButtons, classes.paddingSides10)}>
                            <Tooltip
                                disableFocusListener
                                title={t("mainReport.removalMsgTooltip")}
                                classes={{ tooltip: styles.customWidth }}
                                placement="top"
                                arrow
                            >
                                <Button
                                    className={clsx(classes.btn, classes.btnRounded, classes.marginSides5, removalMessageButtonDisabled ? classes.disabled : null)}
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
                                    className={clsx(classes.btn, classes.btnRounded, classes.marginSides5)}
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
                                    <FormControl
                                        variant="standard"
                                        className={clsx(classes.selectInputFormControl)}
                                    >
                                        <Select
                                            variant='standard'
                                            value={selectValue}
                                            onChange={handleSelectChange}
                                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                            style={{
                                                width: 200
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 200,
                                                        direction: isRTL ? 'rtl' : 'ltr'
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem disabled value="Personilization">{t("mainReport.personalisationSelect")}</MenuItem>
                                            {extraAccountDATA.map((item, i) => {
                                                return (
                                                    <MenuItem
                                                        value={[Object.keys(item)[0]]}
                                                        key={`extrakey_${i}`}
                                                        disabled={item.selected}
                                                    >
                                                        {item[Object.keys(item)[0]] ? t(item[Object.keys(item)[0]]) : Object.keys(item)[0]}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            </Box>
                            <Box className={clsx(classes.addDiv, classes.paddingSides10)} tabIndex="0">
                                <Button
                                    className={clsx(classes.btn, classes.btnRounded)}
                                    onClick={() => {
                                        seteditmenuClick(!editmenuClick);
                                    }}
                                >
                                    <AiOutlinePlusCircle className={classes.addOptionsIcon} />
                                    {t("mainReport.add")}
                                </Button>
                                {editmenuClick ? (
                                    <Box
                                        className={classes.dropDiv}
                                        style={{
                                            top: windowSize !== 'xs' ? (previousCampaignData.length === 0 ? "-120px" : "-170px") : null,
                                            right: isRTL ? 'auto' : 0,
                                            left: isRTL ? 0 : 'auto',
                                        }}
                                    >

                                        <Typography
                                            className={classes.dropCon}
                                            onClick={() => {
                                                setDialogType({ type: 'latestLP' });
                                                seteditmenuClick(false);
                                            }}
                                            onBlur={() => seteditmenuClick(false)}
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
                                                onBlur={() => seteditmenuClick(false)}
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
                                            onBlur={() => seteditmenuClick(false)}
                                        >
                                            {t("mainReport.waize")}
                                        </Typography>
                                    </Box>
                                ) : null}
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        );
    }
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
    const handleClose = () => {
        setDialogType(null);
    }
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
    }
    const handlecaution = () => {
        setremovalNumber(null);
        setDialogType(null);
    }
    const handleAlertoff = () => {
        setcampaignNumber(storedValue);
        setDialogType(null);
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
        setDialogType(null);
    }
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
                        classes.btn,
                        classes.btnRounded,
                    )}>
                    {t('common.Ok')}
                </Button>
            ),
            showDefaultButtons: false,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { setDialogType(null) }
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
            valiateError: validationDialog(),
            alert: alertDialog(),
            linkStatisticAlert: siteTrackingLinkDialog(data)
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
    //#endregion Dialogs

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

export default Editorbox;