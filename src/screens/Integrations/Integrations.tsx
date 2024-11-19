import { useEffect, useState } from "react";
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
import EShopIcon from '../../assets/images/e-shop.jpg';
import { Title } from "../../components/managment/Title";
import IsraCardIcon from '../../assets/images/isracard.png';
import WixIcon from '../../assets/images/wix.png';
import Istores from "./Istores";
import EcwidIcon from '../../assets/images/ecwid.png';
import Ecwid from "./Ecwid";
import EShop from "./EShop";
import Wix from "./Wix";


const Integrations = ({ classes }: any) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('0');

  useEffect(() => {
    const integrationTitles = {
      '0': { title: `${t('integrations.shopify.title')}` },
      '1': { title: `${t('integrations.wooCommerce.title')}` },
      '2': { title: `${t('integrations.cashCow.title')}` },
      '3': { title: `${t('integrations.Istores.title')}` },
      '4': { title: `${t('integrations.ecwid.title')}` },
      '5': { title: `${t('integrations.eShop.title')}` },
      '6': { title: `${t('integrations.wix.title')}` },
    } as any;

    document.title = `${integrationTitles[tabValue].title} | ${t('master.pulseemSystem')}`;
  }, [, tabValue]);

  return (
    <DefaultScreen
      currentPage="settings"
      subPage="Integrations"
      key="Integrations"
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
            // @ts-ignore
            label={t('integrations.shopify.title')}
            icon={<img src={ShopifyIcon} alt="אייקון של Shopify" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='0'
          />

          <Tab
            // @ts-ignore
            label={t('integrations.wix.title')}
            icon={<img src={WixIcon} alt="אייקון של Wix" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='6'
          />

          <Tab
            // @ts-ignore
            label={t('integrations.wooCommerce.title')}
            icon={<img src={WooCommerceIcon} alt="אייקון של WooCommerce" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='1'
          />

          <Tab
            // @ts-ignore
            label={t('integrations.cashCow.title')}
            icon={<img src={CashCowIcon} alt="אייקון של CashCow" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='2'
          />

          <Tab
            // @ts-ignore
            label={t('integrations.Istores.title')}
            icon={<img src={IsraCardIcon} alt="אייקון של Isracard" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='3'
          />
          <Tab
            label={t('integrations.ecwid.title')}
            icon={<img src={EcwidIcon} alt="אייקון של Ecwid" />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='4'
          />
          <Tab
            label={t('integrations.eShop.title')}
            icon={<img src={EShopIcon} alt={t('integrations.eShop.title')} />}
            classes={{ root: classes.tabText, selected: classes.activeTab }}
            className={classes.iconTab}
            value='5'
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

          <TabPanel value='4'>
            <Ecwid classes={classes} />
          </TabPanel>

          <TabPanel value='5' className={clsx(classes.pt0)}>
            <EShop classes={classes} />
          </TabPanel>

          <TabPanel value='6'>
            <Wix classes={classes} />
          </TabPanel>
        </TabContext>
      </Box>
    </DefaultScreen>
  );
};

export default Integrations;
