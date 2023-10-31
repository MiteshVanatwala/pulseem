import clsx from "clsx";
import { Grid, makeStyles, Tab, Tabs, Box } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { InboundTypes } from "./Constants";
import { TabContext, TabPanel } from "@material-ui/lab";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../../DefaultScreen";
import SmsReplies from "./Sms/SmsReplies";
import { Title } from "../../../components/managment/Title";
import WhatsappInbound from "./Whatsapp/WhatsappInbound";

const useStyles = makeStyles({
  flexItems: {
    '& .MuiTab-wrapper': {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'space-between'
    }
  }
});

const InboundMessages = ({ classes }: any) => {
  const params = useParams();
  const { type } = params;
  const { t: translator } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('0');
  const localClasses = useStyles();



  useEffect(() => {
    if (type?.toLowerCase() === 'whatsapp') {
      setActiveTab('1');
    }
  }, []);

  const renderTabs = () => {
    return (
      <Grid container>
        <TabContext value={activeTab}>
          <Grid
            container
            justifyContent='space-between'
            alignItems='center'
            item xs={12}
            className={classes.borderBottom1}>
            <Tabs
              value={activeTab}
              onChange={(e, value) => {
                setActiveTab(value.toString())
              }}
              indicatorColor="primary"
            >
              {
                InboundTypes.map((it, idx) => {
                  return !it.disabled && <Tab
                    key={it.key}
                    value={it.value}
                    classes={{ root: clsx(classes.minWidth100, it.isNewFeature ? localClasses.flexItems : null) }}
                    //@ts-ignore
                    icon={it.isNewFeature ? <span className={classes.commingSoon}>{translator('common.commingSoon')}</span> : ''}
                    //@ts-ignore
                    label={it.isNewFeature ? <span style={{ marginInlineEnd: 5 }}>{translator(it.name)}</span> : translator(it.name)}
                  />
                })
              }
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            <TabPanel value="0" className={classes.p0}>
              <SmsReplies classes={classes} />
            </TabPanel>
            <TabPanel value="1" className={classes.p0}>
              <WhatsappInbound classes={classes} />
            </TabPanel>
          </Grid>
        </TabContext>

      </Grid>
    )
  }

  return (
    <DefaultScreen
      showAppBar={true}
      key={"inboundMessages"}
      subPage={"inboundMessages"}
      currentPage="reports"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={"topSection"}>
        <Title Text={translator("report.ResponsesReports.title")} classes={classes} />
        {renderTabs()}
      </Box>
    </DefaultScreen>
  );
};

export default InboundMessages;
