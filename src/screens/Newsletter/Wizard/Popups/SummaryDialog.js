import { useEffect, useState } from "react";
import { FaMobileAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FormControl, Link, MenuItem } from "@material-ui/core";
import Select from '@mui/material/Select';
import { Box, Grid, Button } from "@material-ui/core";
import { FaChevronDown } from 'react-icons/fa';
import { FaChevronUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import clsx from "clsx";
import { Stack } from "@mui/material";
import { getAuthorizedEmails, isSweepingApprovalAccount } from "../../../../redux/reducers/commonSlice";
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import moment from 'moment';
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { saveCampaignInfo, sendCampaign } from "../../../../redux/reducers/newsletterSlice";
import VerificationDialog from "../../../../components/DialogTemplates/VerificationDialog";
import { Loader } from "../../../../components/Loader/Loader";
import { IoIosArrowDown } from "react-icons/io";

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
    const { isRTL, windowSize } = useSelector(state => state.core);
    const { extraData } = useSelector((state) => state.sms);
    const { verifiedEmails, isSweepingApproval } = useSelector(state => state.common);
    const { newsletterSendSummary, newsletterInfo } = useSelector(state => state.newsletter);
    const [disableSend, setDisableSend] = useState(false);
    const [verPopupOpen, setVerPopupOpen] = useState(false);
    const [fromEmailVerified, setFromEmailVerified] = useState(true);
    const [verifyStep, setVerifyStep] = useState(0);
    const [verifyValue, setVerifyValue] = useState('');
    const [showLoader, setShowLoader] = useState(false);

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
        IsBestTime,
        ExceptionalUserFieldClientCount
    } = newsletterSendSummary;

    const { t } = useTranslation();

    const handleSendCampaign = async () => {
        setShowLoader(true);
        setDisableSend(true);
        const sendResponse = await dispatch(sendCampaign(newsletterSendSummary.CampaignID));
        handleSendResponse({
            ...sendResponse.payload,
            fromEmail: fromEmail
        });
        setDisableSend(false);
        setShowLoader(false);
    }

    useEffect(() => {
        dispatch(isSweepingApprovalAccount());
        dispatch(getAuthorizedEmails());
    }, [])

    useEffect(() => {
        if (isSweepingApproval === true) {
            setDisableSend(false);
            setFromEmailVerified(true);
        }
    }, [isSweepingApproval])

    useEffect(() => {
        const verifiedEmail = verifiedEmails.filter((vm) => { return vm.Number === newsletterSendSummary?.FromEmail && vm.IsOptIn === true });
        setFromEmail(newsletterSendSummary?.FromEmail);
        if ((!verifiedEmail || verifiedEmail?.length <= 0) && !isSweepingApproval) {
            setDisableSend(true);
            setFromEmailVerified(false);
        }
    }, [newsletterSendSummary])

    const renderWhenToSend = () => {
        switch (newsletterSendSummary?.SendingMethod) {
            case 1: {
                return `${t("sms.SendNow")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
            }
            case 2: {
                return `${IsBestTime ? `${t('campaigns.newsLetterEditor.sendSettings.optimalSendingFrom')} - ` : ''} ${moment(newsletterSendSummary?.SendDate).format('DD/MM/YYYY HH:mm')}`;
            }
            case 3: {
                const exDates = { ...extraData };
                let specialField = null;
                switch (newsletterSendSummary.AutoSendingByUserField) {
                    case "5":
                    case 5: {
                        specialField = `${t("mainReport.birthday")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    case "6":
                    case 6: {
                        specialField = `${t("common.reminder_date")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    case "7":
                    case 7: {
                        specialField = `${t("mainReport.creationDay")} ${IsBestTime ? `- ${t('campaigns.newsLetterEditor.sendSettings.optimalSending')}` : ''}`;
                        break;
                    }
                    default: {
                        specialField = exDates[`ExtraDate${newsletterSendSummary.AutoSendingByUserField}`];
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
            <span>{RenderHtml(property)}</span>
            <span className={classes.summaryDetailsSpanBold}>{RenderHtml(value)}</span>
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
        let exceptionalClientsCountText = '';

        if ((IsOpened || IsNotOpened || IsNotClicked || IsOpenedClicked) && ExceptionalOpensClicksClientsCount > 0) {
            if (IsOpened) { // לקוחות שלא פתחו דיוור
                exceptionalClientsCountText = t('campaigns.newsLetterEditor.sendSettings.summarySegmCritCb2');
            }
            if (IsNotOpened && IsNotClicked) {
                exceptionalClientsCountText = t('campaigns.newsLetterEditor.sendSettings.summarySegmCritCb5');
            }
            else {
                if (IsNotOpened) { // לקוחות שפתחו דיוור
                    exceptionalClientsCountText = t('campaigns.newsLetterEditor.sendSettings.summarySegmCritCb1');
                }
                if (IsNotClicked) { // לקוחות שהקליקו על קישור
                    exceptionalClientsCountText = t('campaigns.newsLetterEditor.sendSettings.summarySegmCritCb3');
                }
            }
            if (IsOpenedClicked) { // לקוחות שלא הקליקו על קישור
                exceptionalClientsCountText = t('campaigns.newsLetterEditor.sendSettings.summarySegmCritCb4');
            }
        }
        return detailsHide ? <></> : (<Box className={classes.summaryExpandRecipientFilter}>
            {RemovedClients > 0 && renderDetailsLine(t("sms.removedRecipients"), RemovedClients?.toLocaleString())}
            {ExceptionalUserFieldClientCount > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.specialDateMissing"), ExceptionalUserFieldClientCount?.toLocaleString())}
            {InvalidClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.invalidRecipients"), InvalidClients?.toLocaleString())}
            {NoEmailClients > 0 && renderDetailsLine(t("common.noEmail"), NoEmailClients?.toLocaleString())}
            {PendingClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.pendingClients"), PendingClients?.toLocaleString())}
            {DuplicateClients > 0 && renderDetailsLine(t("campaigns.newsLetterEditor.sendSettings.duplicatedClients"), DuplicateClients?.toLocaleString())}
            {RestrictedClients > 0 && renderDetailsLine(t("campaigns.restrictedClients"), RestrictedClients?.toLocaleString())}
            {ExceptionalDaysClientsCount > 0 && renderDetailsLine(t('campaigns.newsLetterEditor.sendSettings.emailFilterInput'), ExceptionalDaysClientsCount)}
            {ExceptionalCampaigns !== '' && ExceptionalCampaignsClientsCount > 0 && renderDetailsLine(t('smsReport.campaignInfo'), `${ExceptionalCampaigns.replace(',', ', ')} (${t("common.Total")}: ${ExceptionalCampaignsClientsCount})`)}
            {ExceptionalOpensClicksClientsCount > 0 && renderDetailsLine(exceptionalClientsCountText, ExceptionalOpensClicksClientsCount?.toLocaleString())}
            {ExceptionalGroups !== '' && ExceptionalGroups?.split(',').length > 0 && renderExceptionalGroups(t("smsReport.inputTextFilter"), ExceptionalGroups?.split(','))}
            {TotalNotToSend >= 0 && renderDetailsLine(`<b>${t('campaigns.newsLetterEditor.sendSettings.totalNotToSend')}</b>`, TotalNotToSend?.toLocaleString())}
        </Box>)
    }
    const handleFromEmailChanged = (event) => {
        if (newsletterInfo && newsletterInfo.CampaignID) {
            setFromEmail(event.target.value);
            const updateInfo = { ...newsletterInfo };
            updateInfo.FromEmail = event.target.value;
            dispatch(saveCampaignInfo(updateInfo));
            const isVerified = verifiedEmails.filter((ve) => { return ve.Number === updateInfo.FromEmail && ve.IsOptIn === true });
            setDisableSend(isVerified?.length === 0);
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
                    <Box className={classes.baseSum} style={{ display: 'flex', width: '100%' }}>
                        <Box className={classes.sumLeft} style={{ width: windowSize === 'xs' || windowSize === 'sm' ? '100%' : '50%' }}>
                            <Box>
                                <span className={classes.spanSum} style={{ marginInlineEnd: 15 }}>{t("sms.smsSummaryCampaignFrom")}:</span>
                            </Box>
                            <Box style={{ width: '100%' }}>
                                <FormControl
                                    variant="standard"
                                    className={clsx(classes.selectInputFormControl, classes.w100, classes.mb10)}
                                >
                                    <Select
                                        variant="standard"
                                        style={{ width: '100%' }}
                                        className={classes.pbt5}
                                        autoWidth={false}
                                        value={fromEmail}
                                        displayEmpty
                                        onChange={handleFromEmailChanged}
                                        inputProps={{
                                            'aria-label': 'Without label',
                                            className: clsx(classes.p10, (fromEmail === '' || fromEmail === null || !fromEmailVerified) && classes.error),
                                            style: { width: '100%' }
                                        }}
                                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300,
                                                    direction: isRTL ? 'rtl' : 'ltr'
                                                },
                                            },
                                        }}
                                    >
                                        {[{
                                            Number: newsletterSendSummary?.FromEmail
                                        }, ...verifiedEmails.filter((ve) => { return ve.IsOptIn === true && ve.Number !== newsletterSendSummary?.FromEmail })
                                        ].map((obj, index) => (
                                            <MenuItem
                                                key={`ve_${index}`}
                                                value={obj.Number}
                                            >
                                                {obj.Number}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box className={classes.sumChild}>
                                <Link className={clsx(classes.link)}
                                    style={{ margin: 0 }}
                                    onClick={() => {
                                        if (!fromEmailVerified) {
                                            setVerifyStep(1);
                                            setVerifyValue(newsletterSendSummary?.FromEmail);
                                        }
                                        setVerPopupOpen(true)
                                    }
                                    }
                                >{t('campaigns.newsLetterEditor.helpTexts.clickToVerify')}</Link>
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
                                <Link onClick={() => { setdetailsHide(!detailsHide) }} className={classes.expandTextLink}>
                                    {detailsHide ? t("sms.smsSummaryDetails") : t("sms.smsSummaryClose")}
                                </Link>
                            </Box>
                        </Box>
                        {PreviewURL && <Box className={classes.sumRight} style={{ width: windowSize === 'xs' || windowSize === 'sm' ? '100%' : '50%' }}>
                            <Stack direction='column' alignItems='center' spacing={2} className={classes.paddingInline25}>
                                <Stack className={classes.previewIframe}>
                                    {RenderHtml(`<iframe src="${PreviewURL}&fromReact=1" style="height: inherit; border: 0; background: none; width: 100%; height: 400px;" />`)}
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
                <Box>
                    {detailsHide ? null : <ul className={classes.sumList}>
                        <li
                            onClick={() => { setsubRecipients(!subRecipientsDetails) }}
                        >
                            <Link onClick={() => { setsubRecipients(!subRecipientsDetails) }} className={classes.alignCenter} style={{ cursor: 'pointer' }}>
                                {t("sms.smsSummaryRecipientsFilter")} ({TotalNotToSend?.toLocaleString()})
                                {subRecipientsDetails ? <FaChevronUp style={{ margin: '0 10', paddingTop: 4 }} /> : <FaChevronDown style={{ margin: '0 10', paddingTop: 4 }} />}
                            </Link>
                        </li>
                    </ul>}
                    {subRecipientsDetails ? renderFilterDetails() : null}
                </Box>
                <Grid
                    container
                    spacing={4}
                    className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, classes.mt15, classes.mb15)}>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            disabled={disableSend}
                            onClick={() => {
                                handleSendCampaign()
                            }}
                            className={clsx(
                                classes.btn, classes.btnRounded,
                                FinalClients <= 0 || fromEmail === '' || fromEmail === null || disableSend ? classes.disabled : null
                            )}>
                            {t("sms.sendDialog")}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => { setDialogType(null) }}
                            className={clsx(classes.btn, classes.btnRounded)}
                        >
                            {t("sms.cancelDialog")}
                        </Button>
                    </Grid>
                </Grid>
                {verPopupOpen && <VerificationDialog
                    classes={classes}
                    isOpen={verPopupOpen}
                    step={verifyStep ?? 0}
                    value={verifyValue ?? ''}
                    onClose={async (verifiedEmail) => {
                        if (verifiedEmail) {
                            const updateInfo = { ...newsletterInfo };
                            updateInfo.FromEmail = verifiedEmail;
                            await dispatch(saveCampaignInfo(updateInfo));
                            setFromEmail(verifiedEmail);
                            setDisableSend(false);
                            setFromEmailVerified(true);
                        }
                        setVerPopupOpen(false);
                    }}
                />}
            </>
        ),
        icon: <FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />,
        confirmText: t("common.send"),
        cancelText: '',
        onClose: () => { setDialogType(null) },
    }

    return <BaseDialog
        customContainerStyle={classes.summaryContainer}
        classes={classes}
        open={isOpen}
        onClose={() => { setDialogType(null) }}
        onCancel={() => { setDialogType(null) }}
        {...currentDialog}>
        {currentDialog.content}
        <Loader isOpen={showLoader} />
    </BaseDialog>

}

export default SummaryDialog;
