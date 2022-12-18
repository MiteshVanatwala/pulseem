import { useEffect, useState } from "react";
import { FaMobileAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link, MenuItem, Select } from "@material-ui/core";
import { Box, Grid, Button } from "@material-ui/core";
import { FaChevronDown } from 'react-icons/fa';
import { FaChevronUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import clsx from "clsx";
import { Stack } from "@mui/material";
import { getAuthorizedEmails } from "../../../../redux/reducers/commonSlice";
import { getSendSummary } from "../../../../redux/reducers/newsletterSlice";
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import moment from 'moment';
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";

const SendSummary = ({ classes,
    isOpen = false,
    groups = [],
    summaryPayload = {},
    onClose = () => null,
    onConfirm = () => null,
    setDialogType = () => null,
    filteredGroups = null,
    filteredCampaigns = null,
    SendDate = "",
    ...props }) => {
    const dispatch = useDispatch();
    const [detailsHide, setdetailsHide] = useState(true);
    const [subDetailsActive, setsubDetailsActive] = useState(false);
    const [subRecipientsDetails, setsubRecipients] = useState(false);
    const { isRTL } = useSelector(state => state.core);
    const { extraData } = useSelector((state) => state.sms);
    const { verifiedEmails } = useSelector(state => state.common);
    const { newsletterInfo, newsletterSettings } = useSelector(state => state.newsletter);

    const { t } = useTranslation();

    const handleSmsSettings = () => {
        onClose();
        // props.handleCallback()
    }
    useEffect(() => {
        dispatch(getAuthorizedEmails())
        let response = dispatch(getSendSummary(newsletterInfo?.CampaignId))
        console.log("SUMMARY:", response)
    }, [])

    const renderWhenToSend = () => {
        switch (newsletterSettings?.SendingMethod) {
            case 1: {
                return t("sms.SendNow");
            }
            case 2: {
                return `${newsletterSettings.SendDate.format('dddd , MMMM Do YYYY, h:mm a')}`;
            }
            case 3: {
                const exDates = { ...extraData };
                const newExDates = Object.keys(exDates).map((item, i) => {
                    if (exDates[item]) {
                        return item.toLowerCase().indexOf('extradate') > -1 && Object.values(extraData[item]);
                    }
                });
                let specialField = null;
                switch (newsletterSettings.AutoSendingByUserField) {
                    case "1":
                    case 1: {
                        specialField = t("mainReport.birthday");
                        break;
                    }
                    case "2":
                    case 2: {
                        specialField = t("mainReport.creationDay")
                        break;
                    }
                    default: {
                        specialField = exDates[`ExtraDate${newsletterSettings.AutoSendingByUserField - 2}`];
                    }
                }
                return RenderHtml(`${newsletterSettings.AutoSendDelay.toString().replace('-', '')} ${t("mainReport.days")} ${newsletterSettings.AutoSendDelay > 0 ? t("mainReport.after") : t("mainReport.before")} ` + `<span>&nbsp;${specialField}</span>` + `&nbsp;-&nbsp;${moment(newsletterSettings.SendDate).format('h:mm a')}`, { display: 'flex' })
            }
        }
    }


    const currentDialog = {
        style: { paddingBottom: 20 },
        title: `${t("sms.smsSummaryDialogTitle")} '${newsletterInfo?.Name}'`,
        showDefaultButtons: false,
        showDivider: true,
        content: (
            <>
                <Box style={{ fontSize: "22px", marginTop: "5px" }}>
                    <Box className={classes.baseSum}>
                        <Box className={classes.sumLeft}>
                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("sms.smsSummaryCampaignFrom")}:</span>
                                <Select
                                    value={newsletterInfo?.FromEmail}
                                    // onChange={handleChange}
                                    displayEmpty
                                    inputProps={{
                                        'aria-label': 'Without label',
                                        className: classes.p10,
                                        style: { maxWidth: '70%' }
                                    }}
                                    variant='outlined'
                                >
                                    {verifiedEmails.map((obj) => (
                                        <MenuItem
                                            key={obj.Number}
                                            value={obj.Number}
                                        >
                                            {obj.Number}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>

                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("report.Subject")}:</span>
                                <span className={classes.bodySum}>{newsletterInfo?.Subject}</span>

                            </Box>
                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("sms.smsDialogWhen")}:</span>
                                <span className={classes.bodySum}>{renderWhenToSend()}</span>
                            </Box>

                            {props.pulseTrue || props.toggleRandom ? <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("mainReport.pulseSend")}</span>
                                {props.pulseTrue ? <span className={classes.smsSummaryText}>  {t("smsReport.packetSend")} - {props.pulseInput1} {props.pulsePer === "" || props.pulsePer === "recipients" ? t("sms.recipients") : t("common.Percent")} {" "}
                                    {t("sms.every")} {props.pulseInput2} {props.hourName === "" ? t("common.minutes") : t("common.hours")}</span> : null}
                                {props.toggleRandom ? <span className={classes.smsSummaryText}>{t("smsReport.randomSend")} - {props.random} {t("smsReport.randomRecipients")}</span> : null}
                                {props.pulseTrue ? <span className={classes.smsSummaryText}>{t("sms.estimatedDelivery")}: <span style={{ color: "#1D82B3" }}>{props.estimationDate}</span></span> : null}
                            </Box>
                                : null}
                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("sms.smsDialogFor")}:</span>
                                <span className={classes.bodySum}>
                                    {t("sms.smsSummaryDialogTotalRecipients")}:
                                    <span className={classes.bodySum}>{summaryPayload.FinalCount}</span>
                                </span>
                                <Link onClick={() => { setdetailsHide(!detailsHide) }}
                                    style={{
                                        textDecoration: 'underline',
                                        marginTop: "6px",
                                        fontSize: "16px",
                                        color: "gray",
                                        width: "50px",
                                        cursor: "pointer",
                                    }}>  {detailsHide ? t("sms.smsSummaryDetails") : t("sms.smsSummaryClose")}</Link>
                            </Box>
                        </Box>
                        <Box className={classes.sumRight}>
                            <Stack direction='column' alignItems='center' spacing={2}>
                                <Stack className={classes.previewIframe}>
                                    {RenderHtml(`<iframe src=${newsletterSettings.PreviewURL} style="height: inherit; border: 0; background: none; width: 100%; height: 100vh;pointer-events: none" />`)}
                                </Stack>
                            </Stack>
                        </Box>
                    </Box>
                    <Box>
                        <Box>

                            {detailsHide ? null : <ul className={classes.sumList}>
                                <li>
                                    <Link onClick={() => { setsubDetailsActive(!subDetailsActive) }} className={classes.alignCenter} style={{ cursor: 'pointer' }}>
                                        {t("sms.smsSummaryGroups")} ({groups.length})
                                        {subDetailsActive ? <FaChevronUp style={{ margin: '0 10', paddingTop: 4 }} /> : <FaChevronDown style={{ margin: '0 10', paddingTop: 4 }} />}
                                    </Link>
                                </li>
                            </ul>}


                            {subDetailsActive ? <Box style={{ borderTop: '1px solid #ccc' }}> {

                                groups.map((item, idx) => {
                                    return (<Box className={classes.summaryListItem}
                                    >
                                        <span> {item.GroupName}</span>
                                        <span>{item.Recipients}</span>
                                    </Box>)
                                })
                            }   </Box> : null}
                        </Box>
                    </Box>
                </Box>
                <Box>
                    {detailsHide ? null : <ul className={classes.sumList}>
                        <li
                            onClick={() => { setsubRecipients(!subRecipientsDetails) }}
                        >
                            <Link onClick={() => { setsubRecipients(!subRecipientsDetails) }} className={classes.alignCenter} style={{ cursor: 'pointer' }}>
                                {t("sms.smsSummaryRecipientsFilter")} ({(groups.reduce(function (a, b) {
                                    return a + b['Recipients'];
                                }, 0).toLocaleString() - summaryPayload.FinalCount)})
                                {subRecipientsDetails ? <FaChevronUp style={{ margin: '0 10', paddingTop: 4 }} /> : <FaChevronDown style={{ margin: '0 10', paddingTop: 4 }} />}
                            </Link>
                        </li>
                    </ul>}
                    {subRecipientsDetails ? <Box style={{
                        borderTop: '1px solid #ccc',
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}>
                        {summaryPayload.DuplicateCellphoneSharedWithClienCount === 0 ? null : <span
                            className={classes.summaryDetailsSpan}
                        >
                            {t("sms.duplicateRecipients")}:
                            <span className={classes.summaryDetailsSpanBold}
                            >
                                {summaryPayload.DuplicateCellphoneSharedWithClienCount}
                            </span>
                        </span>}

                        {summaryPayload.Removed === 0 ? null : <span
                            className={classes.summaryDetailsSpan}
                        >
                            {t("sms.removedRecipients")} :
                            <span className={classes.summaryDetailsSpanBold}
                            >
                                {summaryPayload.Removed}
                            </span>
                        </span>}
                        {summaryPayload.EmptyCellphoneCount === 0 ? null : <span
                            className={classes.summaryDetailsSpan}
                        >
                            {t("sms.emptyNumbers")} :
                            <span className={classes.summaryDetailsSpanBold}
                            >
                                {summaryPayload.EmptyCellphoneCount}
                            </span>
                        </span>}
                        {summaryPayload.Invalid === 0 ? null : <span
                            className={classes.summaryDetailsSpan}
                        >
                            {t("sms.invalidRecipients")} :
                            <span className={classes.summaryDetailsSpanBold}
                            >
                                {summaryPayload.Invalid}
                            </span>
                        </span>}
                    </Box> : null}
                </Box>
                {subRecipientsDetails ? <Box style={{ display: "flex" }}>
                    {filteredGroups && filteredGroups.length > 0 ? <div style={{ width: "100%" }}>
                        <ul style={{ listStyleType: "none", paddingRight: 15, paddingLeft: 15 }}>
                            <li className={classes.listTitle}
                            >
                                {t("sms.recipientsFromFollowingGroups")}
                            </li>
                        </ul>

                        {filteredGroups.map((item, index, idx) => {
                            return (<Box id={index} className={classes.summaryFilterItem}>
                                <span>{item.GroupName}</span>
                            </Box>)
                        })}
                    </div>
                        : null}

                    {filteredCampaigns && filteredCampaigns.length > 0 ? <Box style={{ width: "100%" }}>
                        <ul style={{ listStyleType: "none", paddingRight: 15, paddingLeft: 15 }}>
                            <li className={classes.listTitle}
                            >
                                {t("sms.recipientsFromFollowingCampaign")}
                            </li>
                        </ul>
                        {filteredCampaigns.map((item, index) => {
                            return (<Box id={index} className={classes.summaryFilterItem}>
                                <span>{item.Name}</span>
                            </Box>)
                        })} </Box> : null}
                </Box> : null}
                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, classes.mt15, classes.mb15)}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={onConfirm}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                summaryPayload.FinalCount <= 0 ? classes.disabled : null
                            )}>
                            {t("sms.sendDialog")}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { handleSmsSettings() }}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogCancelButton
                            )}>
                            {t("sms.cancelDialog")}
                        </Button>
                    </Grid>
                </Grid>
            </>
        ),
        icon: <FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />,
        confirmText: t("common.send"),
        cancelText: '',
        onClose: handleSmsSettings,
    }

    return <BaseDialog
        classes={classes}
        open={isOpen}
        onClose={() => { setDialogType(null) }}
        {...currentDialog}>
        {currentDialog.content}
    </BaseDialog>

}

export default SendSummary;
