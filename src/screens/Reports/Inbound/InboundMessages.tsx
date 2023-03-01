import clsx from "clsx";
import {
  Box,
  Button,
  Grid,
  makeStyles,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import { ClassesType } from "../../Classes.types";
import { InboundTypes } from "./Constants";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import SmsReplies from "./Sms/SmsReplies";
import { Title } from "../../../components/managment/Title";
import WhatsappInbound from "./Whatsapp/WhatsappInbound";
import { useSelector } from "react-redux";
import { StateType } from "../../../Models/StateTypes";
import useCore from "../../../helpers/hooks/Core";

const useStyles = makeStyles({
  flexItems: {
    "& .MuiTab-wrapper": {
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "space-between",
      padding: "2px 2px 2px 10px",
    },
  },
});

const InboundMessages = () => {
  const params = useParams();
  const { type } = params;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("0");
  const localClasses = useStyles();
  const { classes } = useCore();

  useEffect(() => {
    if (type?.toLowerCase() === "whatsapp") {
      setActiveTab("1");
    }
  }, []);

  const renderTabs = () => {
    return (
      <Grid container className={clsx(classes.lineTopMarging, "searchLine")}>
        <TabContext value={activeTab.toString()}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            item
            xs={12}
            className={classes.borderBottom1}
          >
            <Tabs
              value={activeTab.toString()}
              onChange={(value) => {
                setActiveTab(value.toString());
              }}
              className={clsx(classes.tab, classes.tablistRoot)}
              classes={{ indicator: classes.hideIndicator }}
            >
              {InboundTypes.map((it) => {
                return (
                  !it.disabled && (
                    <Tab
                      key={it.key}
                      value={it.value}
                      classes={{
                        root: clsx(
                          classes.minWidth100,
                          classes.btnTab,
                          it.isNewFeature ? localClasses.flexItems : null
                        ),
                        selected: classes.currentActiveTab,
                      }}
                      //@ts-ignore
                      icon={
                        it.isNewFeature ? (
                          <span className={classes.comingSoonTab}>
                            {`${t("common.comingSoon")}`}
                          </span>
                        ) : (
                          ""
                        )
                      }
                      //@ts-ignore
                      label={
                        it.isNewFeature ? (
                          <span style={{ marginInlineEnd: 5 }}>
                            {`${t(it.name)}`}
                          </span>
                        ) : (
                          t(it.name)
                        )
                      }
                    />
                  )
                );
              })}
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            <TabPanel value="0" className={classes.p0}>
              <SmsReplies />
            </TabPanel>
            <TabPanel value="1" className={classes.p0}>
              <WhatsappInbound classes={classes} />
            </TabPanel>
          </Grid>
        </TabContext>
      </Grid>
    );
  };

  return (
    <DefaultScreen
      subPage={"inboundMessages"}
      currentPage="reports"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={"topSection"}>
        <Title Text={t("report.ResponsesReports.title")} classes={classes} />
        {renderTabs()}
      </Box>
    </DefaultScreen>
  );
};

export default InboundMessages;
