import React, { useState } from "react";
import { FaMobileAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "@material-ui/core";
import { Box, Grid, Button } from "@material-ui/core";
import MobilePreview from '../../../components/MobilePreivew/MobilePreivew'
import { FaChevronDown } from 'react-icons/fa';
import { FaChevronUp } from 'react-icons/fa';
import { useSelector } from 'react-redux'
import clsx from "clsx";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import moment from "moment";


const SmsSummary = ({ classes,
  open,
  campaignName,
  fromNumber,
  summaryPayload,
  onConfirm = () => null,
  textMsg,
  groups,
  filteredGroups = null,
  filteredCampaigns = null,
  ...props }) => {
  const [detailsHide, setdetailsHide] = useState(true);
  const [subDetailsActive, setsubDetailsActive] = useState(false);
  const [subRecipientsDetails, setsubRecipients] = useState(false);
  const { isRTL, language } = useSelector(state => state.core)
  const { isGlobal, IsPoland } = useSelector(state => state.common);
  const { t } = useTranslation();
  const isPolishAccount = IsPoland && isGlobal;

  let totalFiletered = groups?.length > 0 && groups.reduce(function (a, b) {
    return parseInt(a) + parseInt(b['Recipients']);
  }, 0) - (summaryPayload.FinalCount + summaryPayload.FinalVoiceCount);

  if (!totalFiletered || isNaN(totalFiletered)) {
    totalFiletered = 0;
  }

  const handleSmsSettings = () => {
    props.handleCallback()
  }

  return (
    <Box>
      {open && <BaseDialog
        style={{ paddingBottom: 20 }}
        title={`${t("sms.smsSummaryDialogTitle")} '${campaignName}'`}
        showDivider={false}
        classes={classes}
        open={open}
        onClose={() => { handleSmsSettings() }}
        onCancel={() => { handleSmsSettings() }}
        showDefaultButtons={false}
        icon={<FaMobileAlt />}
      >
        <Box style={{ fontSize: "22px", marginTop: "5px" }}>
          <Box className={classes.baseSum}>
            <Box className={classes.sumLeft}>
              <Box className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsSummaryCampaignFrom")}:</span>
                <span className={classes.bodySum}>{fromNumber}</span>
              </Box>

              <Box className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogWhen")}:</span>
                <span className={classes.bodySum}>{props.sendType === "3" ? `${props.days} ${t("mainReport.days")} ${props.after ? t("mainReport.after") : t("mainReport.before")} ${props.specialVal} at ${moment(props.time).locale(language).format('h:mm a')}  ` : props.sendType === "2" ? `${moment(props.sendDateTime).locale(language).format('dddd, MMMM Do YYYY, h:mm a')}` : t("sms.SendNow")}</span>
              </Box>

              {props.pulseTrue || props.toggleRandom ? <Box className={classes.sumChild}>
                <span className={classes.spanSum}>{t("mainReport.pulseSend")}</span>
                {props.pulseTrue ? <span className={classes.smsSummaryText}>  {t("smsReport.packetSend")} - {props.pulseInput1} {props.pulsePer === "" || props.pulsePer === "recipients" ? t("sms.recipients") : t("common.Percent")} {" "}
                  {t("sms.every")} {props.pulseInput2} {props?.pulseType === 1 ? t("common.minutes") : t("common.hours")}</span> : null}
                {props.toggleRandom ? <span className={classes.smsSummaryText}>{t("smsReport.randomSend")} - {props.random} {t("smsReport.randomRecipients")}</span> : null}
                {props.pulseTrue ? <span className={classes.smsSummaryText}>{t("sms.estimatedDelivery")}: <span style={{ color: "#1D82B3" }}>{props.estimationDate}</span></span> : null}
              </Box>
                : null}
              <Box className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogFor")}:</span>
                <span className={classes.bodySum}>
                  {t("sms.smsSummaryDialogTotalRecipients")}:
                  <span className={classes.bodySum}> {summaryPayload.FinalCount?.toLocaleString()}</span>
                </span>
                {summaryPayload.FinalVoiceCount > 0 && <span className={classes.bodySum}>
                  {t("sms.smsSummaryDialogTotalVoiceRecipients")}:
                  <span className={classes.bodySum}> {summaryPayload.FinalVoiceCount?.toLocaleString()}</span>
                </span>}
                {summaryPayload?.SmsBillingType === 0 && <>
                  <span className={classes.bodySum}>
                    {t("common.creditsPerMessage")}:
                    <span className={classes.bodySum}> {summaryPayload?.CreditPerSms?.toLocaleString()}</span>
                  </span>
                  <span className={classes.bodySum}>
                    {t("report.TotalCredits")}:
                    <span className={classes.bodySum}> {summaryPayload?.TotalCredits?.toLocaleString()}</span>
                  </span>
                </>}
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
              <MobilePreview classes={classes} campaignNumber={fromNumber} text={textMsg} keyItem="summaryPreview" />
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
                {t("sms.smsSummaryRecipientsFilter")} ({totalFiletered?.toLocaleString()})
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
            {(!summaryPayload.Pending || summaryPayload.Pending === 0) ? null : <span className={classes.summaryDetailsSpan}
            >
              {t("campaigns.newsLetterEditor.sendSettings.pendingClients")}:
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.Pending || 0}
              </span></span>
            }
            {summaryPayload.DuplicateCellphoneSharedWithClienCount === 0 ? null : <span
              className={classes.summaryDetailsSpan}
            >
              {t("sms.duplicateRecipients")}:
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.DuplicateCellphoneSharedWithClienCount}
              </span>
            </span>}
            {
              isPolishAccount && summaryPayload.NonPolishCount?.toLocaleString() && (
                <span className={classes.summaryDetailsSpan}>
                  {t("sms.nonPolishNumber")}:
                  <span className={classes.summaryDetailsSpanBold}>
                    {summaryPayload.NonPolishCount?.toLocaleString()}
                  </span>
                </span>
              )
            }

            {summaryPayload.Removed === 0 ? null : <span
              className={classes.summaryDetailsSpan}
            >
              {t("sms.removedRecipients")} :
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.Removed?.toLocaleString()}
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
          // spacing={4}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null, classes.mt15, classes.mb15)}>
          <Grid item>
            <Button
              onClick={onConfirm}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.middle,
                (summaryPayload.FinalCount + summaryPayload.FinalVoiceCount) <= 0 ? classes.disabled : null
              )}
              style={{ marginInline: 15 }}>

              {props.sendType === "1" || !props.sendType ? t("sms.sendDialog") : t("common.scheduleSend")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => { handleSmsSettings() }}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.middle,
              )}>
              {t("sms.cancelDialog")}
            </Button>
          </Grid>
        </Grid>
      </BaseDialog>}
    </Box>
  )
}

export default SmsSummary;
