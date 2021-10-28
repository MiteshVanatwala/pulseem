import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "../../../components/managment/index";
import { FaMobileAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "@material-ui/core";
import { Box } from "@material-ui/core";
import MobilePreview from '../../../components/MobilePreive/Mobile'
import { FaChevronDown } from 'react-icons/fa';
import { FaChevronUp } from 'react-icons/fa';
import clsx from "clsx";

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
  
  const { t } = useTranslation();

  const handleSmsSettings = () => {
    props.handleCallback()
  }

  return (
    <Box>
      {open && <Dialog
        style={{ paddingBottom: 20 }}
        title={`${t("sms.smsSummaryDialogTitle")} '${campaignName}'`}
        showDivider={true}
        classes={classes}
        open={open}
        onClose={() => { handleSmsSettings() }}
        onConfirm={onConfirm}
        confirmText={t("sms.sendDialog")}
        cancelText={t("sms.cancelDialog")}
        showDefaultButtons={true}
        icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
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
                <span className={classes.bodySum}>{props.sendType == "3" ? `${props.days} ${t("mainReport.days")} ${props.after ? t("mainReport.after") : t("mainReport.before")} ${props.specialVal} at ${props.time.format('h:mm a')}  ` : props.sendType == "2" ? `${props.sendDateTime.format('dddd , MMMM Do YYYY, h:mm a')}` : t("sms.SendNow")}</span>
              </Box>

              {props.pulseTrue || props.toggleRandom ? <Box className={classes.sumChild}>
                <span className={classes.spanSum}>{t("mainReport.pulseSend")}</span>
                {props.pulseTrue ? <span className={classes.smsSummaryText}>  {t("smsReport.packetSend")} - {props.pulseInput1} {props.pulsePer == "" ? t("sms.recipients") : t("common.Percent")} {" "}
                  {t("sms.every")} {props.pulseInput2} {props.hourName == "" ? t("common.minutes") : t("common.hours")}</span> : null}
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
            {summaryPayload.DuplicateCellphoneSharedWithClienCount == 0 ? null : <span
              className={classes.summaryDetailsSpan}
            >
              {t("sms.duplicateRecipients")} :
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.DuplicateCellphoneSharedWithClienCount}
              </span>
            </span>}

            {summaryPayload.Removed == 0 ? null : <span
              className={classes.summaryDetailsSpan}
            >
              {t("sms.removedRecipients")} :
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.Removed}
              </span>
            </span>}
            {summaryPayload.EmptyCellphoneCount == 0 ? null : <span
              className={classes.summaryDetailsSpan}
            >
              {t("sms.emptyNumbers")} :
              <span className={classes.summaryDetailsSpanBold}
              >
                {summaryPayload.EmptyCellphoneCount}
              </span>
            </span>}
            {summaryPayload.Invalid == 0 ? null : <span
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
          {filteredGroups ? <div style={{ width: "100%", borderBottom: "1px solid #E5E5E5", }}>
            <ul style={{ listStyleType: "none", paddingRight: 15, paddingLeft: 15 }}>
              <li
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "2px",
                  cursor: "pointer",
                  color: "#0371ad",
                  paddingBottom: "5px",

                }}
              >
                {t("sms.recipientsFromFollowingGroups")}
              </li>
            </ul>

            {filteredGroups.map((item, index, idx) => {
              return (<Box id={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 8px 8px 55px",
                  borderTop: "1px solid #E5E5E5",
                  fontSize: "16px",
                }}
              >
                <span> {item.GroupName}</span>
              </Box>)
            })}
          </div>
            : null}

          {filteredCampaigns ? <Box style={{ width: "100%", borderBottom: "1px solid #E5E5E5", }}>
            <ul style={{ listStyleType: "none", paddingRight: 15, paddingLeft: 15 }}>
              <li
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "2px",
                  cursor: "pointer",
                  color: "#0371ad",
                  paddingBottom: "5px",

                }}
              >
                {t("sms.recipientsFromFollowingCampaign")}
              </li>
            </ul>
            {filteredCampaigns.map((item, index) => {
              return (<Box id={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 8px 8px 55px",
                  borderTop: "1px solid #E5E5E5",
                  fontSize: "16px",
                }}
              >
                <span> {item.Name}</span>
              </Box>)
            })} </Box> : null}
        </Box> : null}
      </Dialog>}
    </Box>
  )
}

export default SmsSummary;
