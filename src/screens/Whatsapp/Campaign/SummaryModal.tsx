import React, { useState } from "react";
import { FaMobileAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link, TextField } from "@material-ui/core";
import { Box, Grid, Button, Dialog, useMediaQuery } from "@material-ui/core";
import MobilePreview from "../Editor/WhatsappMobilePreview";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { SummaryModalProps } from "./WhatsappCampaign.types";
import { useTheme } from "@mui/material/styles";
import { Close, SupervisedUserCircleOutlined } from "@material-ui/icons";

const SummaryModal = ({
  classes,
  open,
  campaignName,
  fromNumber,
  summaryPayload,
  onConfirm,
  textMsg,
  groups,
  filteredGroups,
  filteredCampaigns,
}: // ...props
SummaryModalProps) => {
  const theme: any = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const [detailsHide, setdetailsHide] = useState<boolean>(true);
  const [subDetailsActive, setsubDetailsActive] = useState<boolean>(false);
  const [subRecipientsDetails, setsubRecipients] = useState<boolean>(false);
  const { isRTL } = useSelector((state: { core: any }) => state.core);

  const { t } = useTranslation();

  const handleSmsSettings = () => {
    // props.handleCallback();
  };

  const onSummaryModalClose = () => {};

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onSummaryModalClose}
      aria-labelledby="responsive-dialog-title"
    >
      <div className={classes.summaryModal}>
        <div id="responsive-dialog-title" className={classes.alertModalTitle}>
          {t("whatsappCampaign.dfieldTitle")}
        </div>
        <Box className={classes.alertModalClose}>
          <Close fontSize={"small"} onClick={onSummaryModalClose} />
        </Box>
        <Box className={classes.alertModalInfoWrapper}>
          <Box className={classes.alertModalInfo}>
            <SupervisedUserCircleOutlined
              fontSize={"small"}
              onClick={onSummaryModalClose}
            />
          </Box>
        </Box>
        <div className={classes.alertModalContent}>
          <div className={classes.testGroupModalContentWrapper}>
            <Grid container style={{ justifyContent: "space-between" }}>
              <Grid item lg={6}>
                <Box className={classes.campaignSummaryTextWrapper}>
                  <span className={classes.campaignSummaryTextTitle}>
                    Campaign From
                  </span>
                  <span className={classes.campaignSummaryTextDesc}>
                    215646512
                  </span>
                </Box>
                <Box className={classes.campaignSummaryTextWrapper}>
                  <span className={classes.campaignSummaryTextTitle}>
                    Campaign Name
                  </span>
                  <span className={classes.campaignSummaryTextDesc}>
                    215646512
                  </span>
                </Box>
                <Box className={classes.campaignSummaryTextWrapper}>
                  <span className={classes.campaignSummaryTextTitle}>When</span>
                  <span className={classes.campaignSummaryTextDesc}>
                    215646512
                  </span>
                </Box>
                <Box className={classes.campaignSummaryTextWrapper}>
                  <span className={classes.campaignSummaryTextTitle}>For</span>
                  <span className={classes.campaignSummaryTextDesc}>
                    215646512
                  </span>
                  <span className={classes.campaignSummaryTextDetail}>
                    <Link
                      onClick={() => {
                        setdetailsHide(!detailsHide);
                      }}
                      style={{
                        textDecoration: "underline",
                        marginTop: "6px",
                        fontSize: "16px",
                        color: "gray",
                        width: "50px",
                        cursor: "pointer",
                      }}
                    >
                      Details
                    </Link>
                  </span>
                </Box>
                <div>&emsp;</div>
                <Box className={classes.campaignSummaryTextWrapper}>
                  <span className={classes.campaignSummaryTextTitle}>
                    Send Randomly to -
                  </span>
                  <span className={classes.campaignSummaryTextDesc}>
                    <input
                      placeholder="Insert"
                      style={{
                        width: "25%",
                        padding: "4px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    />
                    &nbsp;
                    <span style={{ fontSize: "12px" }}>
                      Recipients out of total
                    </span>
                  </span>
                </Box>
              </Grid>

              <Grid item lg={6}>
                <Box className={classes.sumRight}>
                  <MobilePreview
                    classes={classes}
                    campaignNumber={fromNumber}
                    templateData={{
                      templateText: "",
                      templateButtons: [],
                    }}
                    buttonType={""}
                    fileData={""}
                    //   text={textMsg}
                    //   keyItem="summaryPreview"
                  />
                </Box>

                <Box className={classes.campaignSummaryImportantText}>
                  <div>
                    <b>
                      {t("whatsappCampaign.summaryNote")}
                      <br />
                      {t("whatsappCampaign.summaryNote2")}
                      <br />
                      {t("whatsappCampaign.summaryNote3")}
                      <br />
                      <span>
                        <a href="https://business.facebook.com/settings/whatsapp-business-accounts/">
                          Check your limit
                        </a>
                      </span>
                    </b>
                  </div>
                </Box>
              </Grid>
            </Grid>
          </div>
        </div>
        <Grid container className={classes.alertModalAction}>
          <Button
            className="ok-button"
            variant="contained"
            color="primary"
            autoFocus
            // onClick={onConfirmOrYes}
          >
            {t("whatsapp.alertModal.okButtonText")}
          </Button>
          <Button
            className="cancel-button"
            color="primary"
            variant="contained"
            onClick={onSummaryModalClose}
          >
            {t("whatsapp.alertModal.calcelButtonText")}
          </Button>
        </Grid>
      </div>
    </Dialog>
  );
};

export default SummaryModal;
