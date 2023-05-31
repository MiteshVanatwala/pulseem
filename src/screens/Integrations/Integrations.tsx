import { useState } from "react";
import { Tabs, Tab } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import useCore from "../../helpers/hooks/Core";
import { TabContext, TabPanel } from "@material-ui/lab";
import Shopify from "./SpotifySetting";

const Integrations = ({ classes }: any) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('0');

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="soptifySettings"
      key="spotifySettings"
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50, classes.pt15)}
    >
      <Tabs
        value={tabValue}
        onChange={(e, value) => setTabValue(value)}
        className={clsx(classes.mr15, classes.ml15)}
        classes={{ indicator: classes.hideIndicator }}
      >
        <Tab label={t('integrations.shopify.title')} classes={{ root: classes.tabText, selected: classes.activeTab }} value='0' />
      </Tabs>
      <TabContext value={`${tabValue}`}>
        <TabPanel value='0' className={clsx(classes.pt0)}>
          <Shopify classes={classes} />
        </TabPanel>
      </TabContext>
    </DefaultScreen>
  );
};

export default Integrations;
