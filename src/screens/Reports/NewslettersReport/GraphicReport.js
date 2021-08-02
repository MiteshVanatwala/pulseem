import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import RecipientsTab from "./RecipientsTab";

const GraphicReport = ({ classes }) => {
  const { language, windowSize, isRTL, rowsPerPage } = useSelector(
    (state) => state.core
  );
  const [tabValue, setTabValue] = useState(0);
  const { t } = useTranslation();

  const renderHeader = (props) => {
    return (
      <>
        <Grid container alignItems={"flex-end"} justify={"space-between"}>
          <Grid item>
            <Typography className={classes.managementTitle}>
              {tabValue === 1
                ? "Gluten Free Mailing"
                : t("mainReport.logPageHeaderResource1.Text")}
            </Typography>
          </Grid>
          <Grid item className={classes.mb4}>
            <Typography
              component={"a"}
              href={"/react/Reports/NewsletterReports"}
              className={classes.middleTxt}
            >
              {t("mainReport.backToNewsletterReports")}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
      </>
    );
  };
  const renderManagementLine = () => {
    const handleChange = (event, newValue) => {
      setTabValue(newValue);
    };

    const TabPanel = (props) => {
      const { children, value, index, ...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`scrollable-auto-tabpanel-${index}`}
          aria-labelledby={`scrollable-auto-tab-${index}`}
          {...other}
        >
          {value === index && <Box>{children}</Box>}
        </div>
      );
    };

    return (
      <>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          indicatorColor="primary"
          classes={{ root: classes.graphicReportTabs }}
        >
          <Tab label={t("notifications.summaryModalTitle")} />
          <Tab label={t("common.Recipients")} />
          <Tab label={t("mainReport.opensAndClicks")} />
          <Tab label={t("mainReport.geographicalReport")} />
          <Tab label={t("mainReport.systemsReport")} />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          {renderCampaignSummary()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <RecipientsTab classes={classes} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          Opens and Click Tab
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          Geographical Report Tab
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          Systems Report
        </TabPanel>
      </>
    );
  };

  const renderCampaignSummary = () => {
    const data = [
      {
        title: "mainReport.subjectLine",
        value:
          "## FirstName ##, to be without feeling with 😉 ... (advertisement) >>>",
      },
      {
        title: "common.Dates",
        value: "16.10.2020 20:00",
      },
      {
        title: "mainReport.fromEmail",
        value: "beyondrep9@gmail.com",
      },
      {
        title: "mainReport.fromName",
        value: "beyondrep9@gmail.com",
      },
      {
        title: "mainReport.attachedFiles",
        value: "None",
      },
      {
        title: "common.Sent",
        value: "27311",
      },
      {
        title: "mainReport.removals",
        value: "197",
      },
    ];
    return (
      <Paper elevation={0} className={classes.campaignSummary}>
        <Grid container>
          <Grid item md={"3"}>
            <Box
              style={{
                height: "calc(100vh - 300px)",
                width: "100%",
                overflow: "auto",
              }}
            >
              <img
                src={
                  "https://dmytroborodin.github.io/Pulseem_o1/imgs/pages/page_3/page_3.svg"
                }
                width={"100%"}
              />
              <img
                src={
                  "https://dmytroborodin.github.io/Pulseem_o1/imgs/pages/page_3/page_3.svg"
                }
                width={"100%"}
              />
            </Box>
          </Grid>
          <Grid item>
            <List
              className={classes.p0}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              {data.map((item) => (
                <ListItem classes={{ root: clsx(classes.pt0, classes.pb0) }}>
                  <ListItemText
                    primary={t(item.title)}
                    secondary={item.value}
                    classes={{
                      primary: clsx(classes.bold, classes.f18),
                      secondary: clsx(classes.fBlack, classes.f18),
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item>
            <Paper></Paper>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <DefaultScreen currentPage="reports" classes={classes}>
      {renderHeader()}
      {renderManagementLine()}
    </DefaultScreen>
  );
};

export default GraphicReport;
