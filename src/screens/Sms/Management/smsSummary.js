import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "../../../components/managment/index";
import { FaMobileAlt } from "react-icons/fa";
import Mobile from "../../../assets/images/mobileiphone.png";
import { useTranslation } from "react-i18next";

const SmsSummary = ({ classes, selectedGroups, open, campaignName, fromNumber, totalmsg, stepBool, totalRecipients, groups, summaryPayload, api , textMsg , activeGroups , ...props}) => {
   console.log("props",props,stepBool)
  const [modal, setmodal] = useState(false);
  const [smsCreator, setsmsCreator] = useState(false);
  const [hideGroups, sethideGroups] = useState(false);
  const [recipientsDetails, setrecipientsDetails] = useState(false);
  const [details, setdetails] = useState(false);
  const [detailsHide, setdetailsHide] = useState(true);
  const [subDetailsActive, setsubDetailsActive] = useState(false);
  const [subRecipientsDetails, setsubRecipients] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setmodal(open);
  }, [open])
  useEffect(() => {
    setsmsCreator(stepBool);
  }, [stepBool])

   const handleSmsSettings = () =>
   {
     setsmsCreator(false)
     props.handleCallback()
   }
   const handleSmsCreate = () =>
   {
     setmodal(false)
     props.handleCallback()
   }
  return (
    <div>
      {modal ? <Dialog
        classes={classes}
        open={modal}
        onClose={() => {handleSmsCreate() }}
        onConfirm={api}
        confirmText="Send"
        cancelText="Cancel"
        showDefaultButtons={true}
        icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
      >
        <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
          <span className={classes.groupName}>Campaign Summary '{campaignName}'</span>
        </div>
        <div style={{ fontSize: "22px", marginTop: "5px" }}>
          <div className={classes.baseSum}>
            <div className={classes.sumLeft}>
              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsSummaryCampaignFrom")}:</span>
                <span className={classes.bodySum}>{fromNumber}</span>
              </div>

              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogWhen")} :</span>
                <span className={classes.bodySum}>Send Now</span>
              </div>

              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogFor")} :</span>
                <span style={{ fontSize: "18px" }}>
                  {t("sms.smsSummaryDialogTotalRecipients")}:
                  <span className={classes.bodySum}>{summaryPayload.FinalCount}</span>
                </span>
                <span
                  style={{
                    marginTop: "6px",
                    fontSize: "16px",
                    color: "gray",
                    borderBottom: "1px solid gray",
                    width: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => { setdetails(!details) }}
                >
                  {details ? "Close" : "Details"}
                </span>
              </div>
            </div>
            <div className={classes.sumRight}>
              <div style={{ position: "relative" }}>

                <img
                  src={Mobile}
                  style={{
                    width: "350px",
                    height: "370px",
                    marginTop: "10px",
                    borderBottom: "1px solid #efefef",
                  }}
                />
                <span className={classes.phoneNumberSum}>{fromNumber}</span>
                <div className={classes.wrapChatSumm}>
                <div className={classes.chatBox}>
                  <div className={classes.fromMe}>
                    {totalmsg}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>

              {details ? <ul>
                <li
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "2px",
                    cursor: "pointer"

                  }}
                  onClick={() => { sethideGroups(!hideGroups) }}
                >
                  Groups ({totalRecipients})
                </li>
              </ul> : null}
              {hideGroups ? <>    {

                groups.map((item, idx) => {
                  return (<div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 8px 8px 55px",
                      borderTop: "1px solid grey",
                      fontSize: "16px",
                    }}
                  >
                    <span> {item.GroupName}</span>
                    <span>{item.Recipients}</span>
                  </div>)
                })
              }   </> : null}


            </div>
          </div>
        </div>
        <div>
          {details ? <ul>
            <li
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "2px",
                cursor: "pointer"
              }}
              onClick={() => { setrecipientsDetails(!recipientsDetails) }}
            >
              Recipients Filter ({(groups.reduce(function (a, b) {
                  return a + b['Recipients'];
                }, 0).toLocaleString() - summaryPayload.FinalCount)})
            </li>
          </ul> : null}
          {recipientsDetails ? <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Duplicate Recipients :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                {summaryPayload.DuplicateCellphoneSharedWithClienCount}
              </span>
            </span>
            <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Removed :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                {summaryPayload.Removed}
              </span>
            </span>
            <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Empty numbers :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                {summaryPayload.EmptyCellphoneCount}
              </span>
            </span>
            <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Invalid :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                {summaryPayload.Invalid}
              </span>
            </span>
          </div> : null}
        </div>
      </Dialog> : null}
      {smsCreator ? <Dialog
        classes={classes}
        open={smsCreator}
        onClose={() => {handleSmsSettings() }}
        onConfirm={api}
        confirmText="Send"
        cancelText="Cancel"
        showDefaultButtons={true}
        icon={<FaMobileAlt style={{ fontSize: 30, color: "#fff" }} />}
      >
        <div style={{ height: "60px", borderBottom: "1px solid #DEE2E7" }}>
          <span className={classes.groupName}>{t("sms.smsSummaryDialogTitle")} '{campaignName}'</span>
        </div>
        <div style={{ fontSize: "22px", marginTop: "5px" }}>
          <div className={classes.baseSum}>
            <div className={classes.sumLeft}>
              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsSummaryCampaignFrom")}:</span>
                <span className={classes.bodySum}>{fromNumber}</span>
              </div>

              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogWhen")}:</span>
                <span className={classes.bodySum}>{props.sendType == "3" ? `${props.days} Days ${props.after ? "After" : "Before"} ${props.specialVal} at ${props.time.format('h:mm a')}  `  : props.sendType == "2" ? `${props.sendDateTime.format('dddd , MMMM Do YYYY, h:mm a')}` : "Send Now"}</span>
              </div>

              {props.pulseTrue || props.toggleRandom ?     <div className={classes.sumChild}>
               <span className={classes.spanSum}>Pulse Sending</span>
              {props.pulseTrue ?  <span style={{ fontSize: "18px" }}> Packets sending - {props.pulseInput1} {props.pulsePer == "" ? props.pulseReci : props.pulsePer} {" "}
              every {props.pulseInput2} {props.hourName == "" ? props.minName : props.hourName}</span> : null}  
              {props.toggleRandom ?  <span style={{ fontSize: "18px" }}>Random sending - {props.random} random recipients</span> : null} 
               {props.pulseTrue ? <span style={{ fontSize: "18px" }}>Estimated End Date : <span style={{color:"#1D82B3"}}>{props.estimationDate}</span></span> : null} 
              </div>
              : null}     
              <div className={classes.sumChild}>
                <span className={classes.spanSum}>{t("sms.smsDialogFor")}:</span>
                <span style={{ fontSize: "18px" }}>
                  {t("sms.smsSummaryDialogTotalRecipients")} :
                  <span className={classes.bodySum}>{summaryPayload.FinalCount}</span>
                </span>
                <span
                  style={{
                    marginTop: "6px",
                    fontSize: "16px",
                    color: "gray",
                    borderBottom: "1px solid gray",
                    width: "50px",
                    cursor: "pointer",
                  }}
                  onClick={()=>{setdetailsHide(!detailsHide)}}
                >
                 {detailsHide ? t("sms.smsSummaryDetails") : t("sms.smsSummaryClose")}
                </span>
              </div>
            </div>
            <div className={classes.sumRight}>
              <div style={{ position: "relative" }}>

                <img
                  src={Mobile}
                  style={{
                    width: "350px",
                    height: "370px",
                    marginTop: "10px",
                    borderBottom: "1px solid #efefef",
                  }}
                />
                <span className={classes.phoneNumberSum}>{fromNumber}</span>
                <div className={classes.wrapChatSumm}>
                <div className={classes.chatBox}>
                  <div className={classes.fromMe}>
                    {textMsg}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>

           {detailsHide ? null :  <ul>
                <li
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "2px",
                    cursor:"pointer"
                  }}
                  onClick={()=>{setsubDetailsActive(!subDetailsActive)}}
                >
                  {t("sms.smsSummaryGroups")} ({activeGroups.length})
                </li>
              </ul> }  
             

              {subDetailsActive ? <>    {

                  activeGroups.map((item, idx) => {
                    return (<div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 8px 8px 55px",
                        borderTop: "1px solid grey",
                        fontSize: "16px",
                      }}
                    >
                      <span> {item.GroupName}</span>
                      <span>{item.Recipients}</span>
                    </div>)
                  })
                  }   </> : null}
            </div>
          </div>
        </div>
        <div>
     {detailsHide  ? null :  <ul>
            <li
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "2px",
                cursor:"pointer"
              }}
              onClick={()=>{setsubRecipients(!subRecipientsDetails)}}
            >
              {t("sms.smsSummaryRecipientsFilter")} ({(activeGroups.reduce(function (a, b) {
                  return a + b['Recipients'];
                }, 0).toLocaleString() - summaryPayload.FinalCount)})
            </li>
          </ul> }    
          {subRecipientsDetails ?   <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
      {summaryPayload.DuplicateCellphoneSharedWithClienCount == 0 ? null :    <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Duplicate Recipients :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                {summaryPayload.DuplicateCellphoneSharedWithClienCount}
              </span>  </span>}   
           
          {summaryPayload.Removed == 0 ? null : <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Removed :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                  {summaryPayload.Removed}
              </span>
            </span> }  
            {summaryPayload.EmptyCellphoneCount == 0 ? null : <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Empty numbers :
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                 {summaryPayload.EmptyCellphoneCount}
              </span>
            </span>} 
            {summaryPayload.Invalid == 0 ? null : <span
              style={{
                fontSize: "17px",
                color: "#1771ad",
                paddingInlineStart: "40px",
              }}
            >
              Invalid:
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "black",
                }}
              >
                 {summaryPayload.Invalid}
              </span>
            </span>}              
          </div> : null}
        </div>
      {  subRecipientsDetails  ?   <div style={{display:"flex"}}>
     <div style={{width:"100%",borderBottom:"1px solid #E5E5E5",}}> 
          <ul style={{listStyleType:"none"}}>
                <li
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "2px",
                    cursor:"pointer",
                    color:"#3DA6F7",
                    paddingBottom:"5px",
                   
                  }}
                >
                 Recipients From Following Groups
                </li>
              </ul> 
            
              {props.displayGroups.map((item, index , idx) => {
                    if (item.selected) {
                      return (<div id={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          // justifyContent: "space-between",
                          padding: "8px 8px 8px 55px",
                          borderTop: "1px solid #E5E5E5",
                          fontSize: "16px",
                        }}
                      >
                        {/* <span style={{marginInlineEnd:"5px"}}>{idx}</span> */}
                        <span> {item.GroupName}</span>
                      
                      </div>)
                    }
                  })}
            
            
       </div> 
              <div style={{width:"100%",borderBottom:"1px solid #E5E5E5",}}> 
          <ul style={{listStyleType:"none"}}>
                <li
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "2px",
                    cursor:"pointer",
                    color:"#3DA6F7",
                    paddingBottom:"5px",
                    
                  }}
                >
                 Recipients From Following Campaigns
                </li>
              </ul> 
              {props.displayCampaigns.map((item, index) => {
                    if (item.selected) {
                      return (<div id={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          // justifyContent: "space-between",
                          padding: "8px 8px 8px 55px",
                          borderTop: "1px solid #E5E5E5",
                          fontSize: "16px",
                        }}
                      >
                        {/* <span style={{marginInlineEnd:"5px"}}>{index}</span> */}
                        <span> {item.Name}</span>
                      
                      </div>)
                    }
                  })} </div>
         
        </div> : null }
      </Dialog> : null}

    </div>
  )
}

export default SmsSummary;
