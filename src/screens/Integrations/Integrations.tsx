import { useState } from "react";
import { Tabs, Tab, Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { TabContext, TabPanel } from "@material-ui/lab";
import Shopify from "./ShopifySetting";
import WooCommerce from "./WooCommerce";
import CashCow from "./CashCow";
import ShopifyIcon from '../../assets/images/shopify.png';
import WooCommerceIcon from '../../assets/images/woocommerce.png';
import CashCowIcon from '../../assets/images/cashCow.png';
import { Title } from "../../components/managment/Title";
import IsraCardIcon from '../../assets/images/isracard.png';
import Istores from "./Istores";

const Integrations = ({ classes }: any) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('0');

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="soptifySettings"
      key="spotifySettings"
      classes={classes}
      containerClass={clsx(classes.editorCont)}

    >
      <Box className={"head"}>
        <Box className={'topSection'}>
          <Title
            Text={t('integrations.title')}
            classes={classes}
          />
        </Box>
      </Box>
      <Box className={'containerBody'}>
        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          className={clsx(classes.mr15, classes.ml15)}
          classes={{ indicator: classes.hideIndicator }}
        >
          <Tab
            label={t('integrations.shopify.title')}
            icon={<img src={ShopifyIcon} />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='0'
          />

          <Tab
            label={t('integrations.wooCommerce.title')}
            icon={<img src={WooCommerceIcon} />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='1'
          />

          <Tab
            label={t('integrations.cashCow.title')}
            icon={<img src={CashCowIcon} />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='2'
          />

          <Tab
            label={t('integrations.Istores.title')}
            icon={<img src={IsraCardIcon} />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='3'
          />
        </Tabs>
        <TabContext value={`${tabValue}`}>
          <TabPanel value='0' className={clsx(classes.pt0)}>
            <Shopify classes={classes} />
          </TabPanel>

          <TabPanel value='1'>
            <WooCommerce classes={classes} />
          </TabPanel>

          <TabPanel value='2'>
            <CashCow classes={classes} />
          </TabPanel>

          <TabPanel value='3'>
            <Istores classes={classes} />
          </TabPanel>
        </TabContext>
      </Box>
    </DefaultScreen>
  );
};

export default Integrations;
