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
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import moment from 'moment';
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { saveCampaignInfo, sendCampaign } from "../../../../redux/reducers/newsletterSlice";

const SummaryDialog = ({ classes,
    isOpen = false,
    groups = [],
    onClose = () => null,
    onConfirm = () => null,
    setDialogType = () => null,
    filteredGroups = null,
    filteredCampaigns = null,
    PreviewURL = null,
    SendDate = "",
    handleSendResponse = () => null,
    IsQuickSend = false,
    ...props }) => {
    const dispatch = useDispatch();
    const [detailsHide, setdetailsHide] = useState(true);
    const [subDetailsActive, setsubDetailsActive] = useState(false);
    const [subRecipientsDetails, setsubRecipients] = useState(false);
    const [fromEmail, setFromEmail] = useState(null);
    const { isRTL } = useSelector(state => state.core);
    const { extraData } = useSelector((state) => state.sms);
    const { verifiedEmails } = useSelector(state => state.common);
    const { newsletterSendSummary, newsletterInfo } = useSelector(state => state.newsletter);

    const {
        FinalClients,
        TotalClients,
        NoEmailClients,
        PendingClients,
        TotalNotToSend,
        TimeInterval,
        PulseAmount,
        RestrictedClients,
        DuplicateClients,
        InvalidClients,
        RemovedClients,
        ExceptionalGroups,
        ExceptionalCampaigns,
        ExceptionalOpensClicksClientsCount,
        ExceptionalDaysClientsCount,
        ExceptionalCampaignsClientsCount,
        ExceptionalGroupsClientsCount,
        IsOpened,
        IsOpenedClicked,
        IsNotClicked,
        IsNotOpened,
        ClickedCount,
        OpenedCount,
        NotOpenedCount,
        NotClickedCount,
        IsBestTime
    } = newsletterSendSummary;

    const { t } = useTranslation();

    const handleSmsSettings = async () => {
        const sendResponse = await dispatch(sendCampaign(newsletterSendSummary.CampaignID));
        handleSendResponse(sendResponse.payload);
    }
    useEffect(() => {
        dispatch(getAuthorizedEmails());
    }, [])

    useEffect(() => {
        setFromEmail(newsletterSendSummary?.FromEmail);
    }, [newsletterSendSummary])

    const renderWhenToSend = () => {
        switch (newsletterSendSummary?.SendingMethod) {
            case 1: {
                return `${t("sms.SendNow")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
            }
            case 2: {
                return `${moment(newsletterSendSummary?.SendDate).format('dddd , MMMM Do YYYY, h:mm a')} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
            }
            case 3: {
                const exDates = { ...extraData };
                let specialField = null;
                switch (newsletterSendSummary.AutoSendingByUserField) {
                    case "1":
                    case 1: {
                        specialField = `${t("mainReport.birthday")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    case "2":
                    case 2: {
                        specialField = `${t("mainReport.creationDay")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    default: {
                        specialField = exDates[`ExtraDate${newsletterSendSummary.AutoSendingByUserField - 2}`];
                    }
                }
                return RenderHtml(`${newsletterSendSummary.AutoSendDelay.toString().replace('-', '')} ${t("mainReport.days")} ${newsletterSendSummary.AutoSendDelay > 0 ? t("mainReport.after") : t("mainReport.before")}  <span>&nbsp;${specialField}</span> &nbsp;-&nbsp;${moment(newsletterSendSummary.SendDate).format('h:mm a')}`, { display: 'flex' })
            }
            default: {
                //alert("לא נבחר זמן שליחה")
                break;
            }
        }
    }
    const renderGroupForSend = () => {
        const tempGroups = newsletterSendSummary.Groups?.split(',');
        if (tempGroups?.length > 0) {
            const groupWithRecipients = tempGroups.map((group) => {
                return groups.find((g) => {
                    if (g.GroupName.trim().replace(' ', '') === group.trim().replace(' ', '')) {
                        return g;
                    }
                })

            });

            return groupWithRecipients.map((group, idx) => { return renderDetailsLine(group?.GroupName, group?.Recipients?.toLocaleString()) });
        }
        return <></>
    }
    const renderDetailsLine = (property, value) => {
        return <Box className={classes.summaryListItem}
        >
            <span>{property}</span>
            <span className={classes.summaryDetailsSpanBold}>{value}</span>
        </Box>;
    }
    const renderExceptionalGroups = (property, list) => {
        return <Box>
            <span style={{ display: 'flex', paddingTop: 10, paddingInline: 10 }}>{property} <span className={classes.summaryDetailsSpanBold}>({t("common.Total")}: {ExceptionalGroupsClientsCount})</span></span>
            <ul>
                {list.map((l) => {
                    return <li>
                        <span className={classes.summaryDetailsSpanBold}>{l}</span>
                    </li>
                })
                }
            </ul>
        </Box>;
    }
    const renderFilterDetails = () => {
        return detailsHide ? <></> : (<Box className={classes.summaryExpandRecipientFilter}>
            {RemovedClients > 0 && renderDetailsLine(t("sms.removedRecipients"), RemovedClients?.toLocaleString())}
            {InvalidClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.invalidRecipients"), InvalidClients?.toLocaleString())}
            {NoEmailClients > 0 && renderDetailsLine(t("common.noEmail"), NoEmailClients?.toLocaleString())}
            {PendingClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.pendingClients"), PendingClients?.toLocaleString())}
            {DuplicateClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.duplicatedClients"), DuplicateClients?.toLocaleString())}
            {RestrictedClients > 0 && renderDetailsLine(t("campaigns.restrictedClients"), RestrictedClients?.toLocaleString())}
            {ExceptionalDaysClientsCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.emailFilterInput'), ExceptionalDaysClientsCount)}
            {ExceptionalCampaigns !== '' && ExceptionalCampaignsClientsCount > 0 && renderDetailsLine(t('smsReport.campaignInfo'), `${ExceptionalCampaigns.replace(',', ', ')} (${t("common.Total")}: ${ExceptionalCampaignsClientsCount})`)}
            {IsOpened && OpenedCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.segmCritCb1'), OpenedCount?.toLocaleString())}
            {IsNotOpened && NotOpenedCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.segmCritCb2'), NotOpenedCount?.toLocaleString() ?? 0)}
            {ExceptionalOpensClicksClientsCount && ExceptionalOpensClicksClientsCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.DidNotClicked'), ExceptionalOpensClicksClientsCount?.toLocaleString())}
            {IsNotClicked && NotClickedCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.segmCritCb4'), NotClickedCount?.toLocaleString() ?? 0)}
            {ExceptionalGroups !== '' && ExceptionalGroups?.split(',').length > 0 && renderExceptionalGroups(t("smsReport.inputTextFilter"), ExceptionalGroups?.split(','))}
            {TotalNotToSend >= 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.totalNotToSend'), TotalNotToSend?.toLocaleString())}
        </Box>)
    }
    const handleFromEmailChanged = (event) => {
        if (newsletterInfo && newsletterInfo.CampaignID) {
            setFromEmail(event.target.value);
            const updateInfo = { ...newsletterInfo };
            updateInfo.FromEmail = event.target.value;
            dispatch(saveCampaignInfo(updateInfo));
        }
    }
    const currentDialog = {
        style: { paddingBottom: 20 },
        title: `${t("sms.smsSummaryDialogTitle")} '${newsletterSendSummary?.CampaignName}'`,
        showDefaultButtons: false,
        showDivider: true,
        content: (
            <>
                <Box style={{ fontSize: "22px", marginTop: "5px" }}>
                    <Box className={classes.baseSum}>
                        <Box className={classes.sumLeft}>
                            <Box className={classes.sumChild}>
                                {/* <span className={clsx(classes.spanSum, classes.bold)}>{t("sms.smsSummaryCampaignFrom")}:</span> */}
                                <span className={classes.spanSum}>{t("sms.smsSummaryCampaignFrom")}:</span>
                                <Select
                                    value={fromEmail}
                                    // onChange={handleChange}
                                    displayEmpty
                                    onChange={handleFromEmailChanged}
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
                                <span className={classes.bodySum}>{newsletterSendSummary?.Subject}</span>

                            </Box>
                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("sms.smsDialogWhen")}:</span>
                                <span className={classes.bodySum}>{renderWhenToSend()}</span>
                            </Box>

                            {PulseAmount > 0 ? <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("mainReport.pulseSend")}</span>
                                <span className={classes.smsSummaryText}>
                                    {`${t("smsReport.packetSend")} ${PulseAmount} ${PulseAmount === 1 ? t("common.Recipient") : t("common.Recipients")}`} {" "}
                                    {`${t("sms.every")} ${TimeInterval} ${TimeInterval === 1 ? t("sms.hour") : t("sms.hours")}`}
                                </span>
                            </Box>
                                : null}
                            <Box className={classes.sumChild}>
                                <span className={classes.spanSum}>{t("sms.smsDialogFor")}:</span>
                                <span className={classes.bodySum}>
                                    {`${t("sms.smsSummaryDialogTotalRecipients")}: ${FinalClients?.toLocaleString()}`}
                                </span>
                                {
                                    !IsQuickSend && <Link onClick={() => { setdetailsHide(!detailsHide) }} className={classes.expandTextLink}>
                                        {detailsHide ? t("sms.smsSummaryDetails") : t("sms.smsSummaryClose")}
                                    </Link>
                                }
                            </Box>
                        </Box>
                        {PreviewURL && <Box className={classes.sumRight}>
                            <Stack direction='column' alignItems='center' spacing={2}>
                                <Stack className={classes.previewIframe}>
                                    {RenderHtml(`<iframe src=${PreviewURL} style="height: inherit; border: 0; background: none; width: 100%; height: 100vh;pointer-events: none" />`)}
                                </Stack>
                            </Stack>
                        </Box>}
                    </Box>
                    {!IsQuickSend &&
                        <Box>
                            {detailsHide ? null : <ul className={classes.sumList}>
                                <li>
                                    <Link onClick={() => { setsubDetailsActive(!subDetailsActive) }} className={classes.alignCenter} style={{ cursor: 'pointer' }}>
                                        {t("sms.smsSummaryGroups")} ({newsletterSendSummary.Groups !== '' ? newsletterSendSummary.Groups?.split(',')?.length : 0})
                                        {subDetailsActive ? <FaChevronUp style={{ margin: '0 10', paddingTop: 4 }} /> : <FaChevronDown style={{ margin: '0 10', paddingTop: 4 }} />}
                                    </Link>
                                </li>
                            </ul>}


                            {!detailsHide && subDetailsActive ? <Box style={{ borderTop: '1px solid #ccc' }}>{renderGroupForSend()}</Box> : null}
                        </Box>
                    }
                </Box>
                {!IsQuickSend && <Box>
                    {detailsHide ? null : <ul className={classes.sumList}>
                        <li
                            onClick={() => { setsubRecipients(!subRecipientsDetails) }}
                        >
                            <Link onClick={() => { setsubRecipients(!subRecipientsDetails) }} className={classes.alignCenter} style={{ cursor: 'pointer' }}>
                                {t("sms.smsSummaryRecipientsFilter")} ({TotalClients?.toLocaleString()})
                                {subRecipientsDetails ? <FaChevronUp style={{ margin: '0 10', paddingTop: 4 }} /> : <FaChevronDown style={{ margin: '0 10', paddingTop: 4 }} />}
                            </Link>
                        </li>
                    </ul>}
                    {subRecipientsDetails ? renderFilterDetails() : null}
                </Box>
                }
                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, classes.mt15, classes.mb15)}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { handleSmsSettings() }}
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                FinalClients <= 0 ? classes.disabled : null
                            )}>
                            {t("sms.sendDialog")}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { setDialogType(null) }}
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
        onClose: () => { setDialogType(null) },
    }

    return <BaseDialog
        classes={classes}
        open={isOpen}
        onClose={() => { setDialogType(null) }}
        onCancel={() => { setDialogType(null) }}
        {...currentDialog}>
        {currentDialog.content}
    </BaseDialog>

}

export default SummaryDialog;
