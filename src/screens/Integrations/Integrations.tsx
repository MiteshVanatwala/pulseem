import { useEffect, useState, useMemo } from "react";
import { Box, Typography, Grid, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { Title } from "../../components/managment/Title";
import Shopify from "./ShopifySetting";
import VerifoneSetting from "./VerifoneSetting";
import WooCommerce from "./WooCommerce";
import CashCow from "./CashCow";
import ShopifyIcon from '../../assets/images/shopify.png';
import WooCommerceIcon from '../../assets/images/woocommerce.png';
import CashCowIcon from '../../assets/images/cashCow.png';
import EShopIcon from '../../assets/images/e-shop.jpg';
import KlaviyoIcon from '../../assets/images/KlaviyoIcon.png'
import IsraCardIcon from '../../assets/images/isracard.png';
import WixIcon from '../../assets/images/wix.png';
import Istores from "./Istores";
import EcwidIcon from '../../assets/images/ecwid.png';
import VerifoneIcon from '../../assets/images/verifone.png';
import Ecwid from "./Ecwid";
import EShop from "./EShop";
import Wix from "./Wix";
import Klaviyo from "./Klaviyo";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { useLocation, useNavigate } from "react-router-dom";
import { getIntegration } from "../../redux/reducers/integrationSlice";
import { LU_Plugin } from "../../Models/Integrations/Integration";
import { URL_HELPER } from "../../helpers/Links/ExternalLink";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/Info';
import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";

const useStyles = makeStyles((theme) => ({
  hubHeader: {
    padding: "0 0 8px 0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  hubTitle: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    fontSize: "32px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  hubSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: 1.6,
    maxWidth: "800px",
  },
  cardsGrid: {
    padding: "8px 0 24px 0",
    minHeight: "450px",
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "16px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      borderColor: "#cbd5e1",
    },
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    padding: "10px",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    },
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  statusInactive: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },
  cardTitle: {
    fontSize: "19px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "10px",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: "24px",
    height: "63px",
    overflow: "hidden",
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
  },
  cardCta: {
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "none",
    width: "100%",
    boxShadow: "none",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
  },
  cardCtaConnect: {
    backgroundColor: "#FF0054",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#e0004a",
      boxShadow: "0 4px 12px rgba(255, 0, 84, 0.25)",
    },
  },
  cardCtaGuideBtn: {
    backgroundColor: "transparent !important",
    color: "#FF0054",
    border: "1px solid #FF0054 !important",
    boxShadow: "none !important",
    "&:hover": {
      backgroundColor: "#fff5f7 !important",
      color: "#e0004a",
      borderColor: "#e0004a !important",
    },
  },
  cardCtaConnected: {
    backgroundColor: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      boxShadow: "none",
      borderColor: "#94a3b8",
    },
  },
  detailHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "12px 32px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    borderRadius: "16px 16px 0 0",
    [theme.breakpoints.down("xs")]: {
      padding: "12px 16px",
    },
  },
  backButton: {
    color: "#64748b",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    "&:hover": {
      backgroundColor: "#f1f5f9",
      color: "#0f172a",
      transform: "translateX(-3px)",
    },
    "&.rtl": {
      "&:hover": {
        transform: "translateX(3px)",
      },
    },
  },
  detailTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  detailIcon: {
    width: "32px",
    height: "32px",
    objectFit: "contain",
  },
  detailBody: {
    padding: "16px 32px 32px 32px",
    background: "#ffffff",
    borderRadius: "0 0 16px 16px",
    [theme.breakpoints.down("xs")]: {
      padding: "16px",
    },
  },
  noResultsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 32px",
    textAlign: "center",
    gap: "16px",
  },
  noResultsIcon: {
    fontSize: "64px",
    color: "#cbd5e1",
  },
  noResultsTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#334155",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  noResultsText: {
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "400px",
    lineHeight: 1.5,
  },
}));

const tabToKeyMap: Record<string, string> = {
  '0': 'shopify',
  '6': 'wix',
  '1': 'woocommerce',
  '2': 'cashcow',
  '3': 'istores',
  '4': 'ecwid',
  '5': 'eshop',
  '10': 'klaviyo',
  '14': 'verifone'
};

const keyToTabMap: Record<string, string> = {
  'shopify': '0',
  'wix': '6',
  'woocommerce': '1',
  'cashcow': '2',
  'istores': '3',
  'ecwid': '4',
  'eshop': '5',
  'klaviyo': '10',
  'verifone': '14'
};

const Integrations = ({ classes }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const localClasses = useStyles();
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { companyName } = useSelector((state: StateType) => state.core);

  // States
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState("0");

  const [statuses, setStatuses] = useState<Record<string, boolean>>({
    shopify: false,
    istores: false,
    eshop: false,
    klaviyo: false,
    verifone: false
  });

  const integrationsData = useMemo(() => [
    {
      key: 'shopify',
      tabValue: '0',
      pluginCode: LU_Plugin.Shopify,
      title: t('integrations.shopify.title'),
      icon: ShopifyIcon,
      desc: t('integrations.shopifyDesc'),
      category: 'ecommerce',
      hasStatus: true,
      guideUrl: URL_HELPER.Integrations.Shopify.guide
    },
    {
      key: 'wix',
      tabValue: '6',
      title: t('integrations.wix.title'),
      icon: WixIcon,
      desc: t('integrations.wixDesc'),
      category: 'ecommerce',
      hasStatus: false,
      guideUrl: URL_HELPER.Integrations.Wix.guide
    },
    {
      key: 'woocommerce',
      tabValue: '1',
      title: t('integrations.wooCommerce.title'),
      icon: WooCommerceIcon,
      desc: t('integrations.woocommerceDesc'),
      category: 'ecommerce',
      hasStatus: false,
      guideUrl: URL_HELPER.Integrations.WooComerce.guide
    },
    {
      key: 'cashcow',
      tabValue: '2',
      title: t('integrations.cashCow.title'),
      icon: CashCowIcon,
      desc: t('integrations.cashcowDesc'),
      category: 'ecommerce',
      hasStatus: false,
      guideUrl: URL_HELPER.Integrations.CashCow.guide
    },
    {
      key: 'istores',
      tabValue: '3',
      pluginCode: LU_Plugin.Isracard,
      title: t('integrations.Istores.title'),
      icon: IsraCardIcon,
      desc: t('integrations.istoresDesc'),
      category: 'ecommerce',
      hasStatus: true,
      guideUrl: URL_HELPER.Integrations.IStore.guide
    },
    {
      key: 'ecwid',
      tabValue: '4',
      title: t('integrations.ecwid.title'),
      icon: EcwidIcon,
      desc: t('integrations.ecwidDesc'),
      category: 'ecommerce',
      hasStatus: false,
      guideUrl: URL_HELPER.Integrations.Ecwid.guide
    },
    {
      key: 'eshop',
      tabValue: '5',
      pluginCode: LU_Plugin.EShop,
      title: t('integrations.eShop.title'),
      icon: EShopIcon,
      desc: t('integrations.eshopDesc'),
      category: 'ecommerce',
      hasStatus: true,
      guideUrl: URL_HELPER.Integrations.eShop.guide
    },
    {
      key: 'klaviyo',
      tabValue: '10',
      pluginCode: LU_Plugin.Klaviyo,
      title: t('integrations.Klaviyo.title'),
      icon: KlaviyoIcon,
      desc: t('integrations.klaviyoDesc'),
      category: 'marketing',
      hasStatus: true,
      guideUrl: URL_HELPER.Integrations.Klaviyo.guide
    },
    {
      key: 'verifone',
      tabValue: '14',
      pluginCode: LU_Plugin.Verifone,
      title: t('integrations.verifone.title'),
      icon: VerifoneIcon,
      desc: t('integrations.verifoneDesc'),
      category: 'retail',
      hasStatus: true,
      showOnlyFor: 'LizaD'
    }
  ], [t]);

  // Synchronize component state with URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const integrationParam = queryParams.get("integration");
    const tabParam = queryParams.get("tab");

    if (integrationParam) {
      const normalizedKey = integrationParam.toLowerCase();
      if (keyToTabMap[normalizedKey]) {
        setSelectedKey(normalizedKey);
        setTabValue(keyToTabMap[normalizedKey]);
        return;
      }
    }

    if (tabParam) {
      const mappedKey = tabToKeyMap[tabParam];
      if (mappedKey) {
        setSelectedKey(mappedKey);
        setTabValue(tabParam);
        return;
      }
    }

    setSelectedKey(null);
  }, [location.search]);

  // Fetch connection statuses for backend integrations
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const plugins = [
          { key: 'shopify', code: LU_Plugin.Shopify, check: (data: any) => !!(data?.ApiKey || data?.api_key || data?.shopify_url || data?.access_token) },
          { key: 'istores', code: LU_Plugin.Isracard, check: (data: any) => !!(data?.api_key || data?.StoreID) },
          { key: 'eshop', code: LU_Plugin.EShop, check: (data: any) => !!(data?.ApiKey) },
          { key: 'klaviyo', code: LU_Plugin.Klaviyo, check: (data: any) => !!(data?.ApiKey) },
          { key: 'verifone', code: LU_Plugin.Verifone, check: (data: any) => !!(data?.username || data?.chainID) },
        ];

        const newStatuses = { ...statuses };

        await Promise.all(plugins.map(async (plugin) => {
          if (plugin.key === 'verifone' && companyName !== 'LizaD') return;
          try {
            const res = await dispatch(getIntegration(plugin.code)) as any;
            if (res?.payload?.StatusCode === 201 && res?.payload?.Data) {
              newStatuses[plugin.key] = plugin.check(res.payload.Data);
            }
          } catch (e) {
            console.error("Error fetching status for " + plugin.key, e);
          }
        }));

        setStatuses(newStatuses);
      } catch (err) {
        console.error("Error loading integration statuses", err);
      }
    };

    fetchStatuses();
  }, [dispatch, companyName]);

  // Handle document title update
  useEffect(() => {
    if (selectedKey) {
      const activeItem = integrationsData.find(item => item.key === selectedKey);
      if (activeItem) {
        document.title = `${activeItem.title} | ${t('master.pulseemSystem')}`;
      }
    } else {
      document.title = `${t('integrations.hubTitle')} | ${t('master.pulseemSystem')}`;
    }
  }, [selectedKey, integrationsData, t]);

  // Filtered list of integrations based on category and search query
  const filteredIntegrations = useMemo(() => {
    return integrationsData.filter(item => {
      // 1. Check company name restriction (e.g. Verifone)
      if (item.showOnlyFor && companyName !== item.showOnlyFor) {
        return false;
      }

      return true;
    });
  }, [integrationsData, companyName]);

  const activeIntegration = useMemo(() => {
    if (!selectedKey) return null;
    return integrationsData.find(item => item.key === selectedKey);
  }, [selectedKey, integrationsData]);

  const handleNavigateToIntegration = (key: string) => {
    navigate(`?integration=${key}`);
  };

  const handleBackToHub = () => {
    navigate(location.pathname);
  };

  const renderActiveIntegrationComponent = () => {
    switch (selectedKey) {
      case 'shopify':
        return <Shopify classes={classes} />;
      case 'woocommerce':
        return <WooCommerce classes={classes} />;
      case 'cashcow':
        return <CashCow classes={classes} />;
      case 'istores':
        return <Istores classes={classes} />;
      case 'ecwid':
        return <Ecwid classes={classes} />;
      case 'eshop':
        return <EShop classes={classes} />;
      case 'wix':
        return <Wix classes={classes} />;
      case 'klaviyo':
        return <Klaviyo classes={classes} />;
      case 'verifone':
        return <VerifoneSetting classes={classes} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (item: any) => {
    if (item.hasStatus) {
      const isConnected = statuses[item.key];
      if (isConnected) {
        return (
          <span className={clsx(localClasses.statusBadge, localClasses.statusActive)}>
            {t("integrations.statusConnected")}
          </span>
        );
      }
    } else {
      return (
        <span className={clsx(localClasses.statusBadge, localClasses.statusInactive)}>
          {t("integrations.statusGuide")}
        </span>
      );
    }
    return null;
  };

  return (
    <DefaultScreen
      currentPage="Integrations"
      subPage=""
      key="Integrations"
      classes={classes}
      containerClass={clsx(classes.editorCont)}
    >
      {selectedKey && activeIntegration ? (
        // Detail Configuration View
        <Box>
          <Box className="head">
            <Title Text={activeIntegration.title} classes={classes} />
          </Box>
          <Box className={"containerBody"}>
            {renderActiveIntegrationComponent()}
          </Box>
        </Box>
      ) : (
        // Hub Page Card Grid View
        <Box>
          {/* Header */}
          <Box className={localClasses.hubHeader}>
            <Typography variant="h1" className={localClasses.hubTitle}>
              {t("integrations.hubTitle")}
            </Typography>
            <Typography variant="body1" className={localClasses.hubSubtitle}>
              {t("integrations.hubSubtitle")}
            </Typography>
          </Box>

          {/* Cards Grid */}
          <Box className={localClasses.cardsGrid}>
            {filteredIntegrations.length > 0 ? (
              <Grid container spacing={3}>
                {filteredIntegrations.map((item) => {
                  const isConnected = item.hasStatus && statuses[item.key];
                  return (
                    <Grid item xs={12} sm={6} md={6} lg={3} key={item.key} className={localClasses.gridItem}>
                      <Box className={localClasses.card}>
                        <Box>
                          <Box className={localClasses.cardTop}>
                            <Box className={localClasses.iconWrapper}>
                              <img src={item.icon} alt={item.title} />
                            </Box>
                            {getStatusBadge(item)}
                          </Box>
                          <Typography variant="h3" className={localClasses.cardTitle}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" className={localClasses.cardDesc}>
                            {item.desc}
                          </Typography>
                        </Box>
                        <Button
                          variant={item.hasStatus ? "contained" : "outlined"}
                          className={clsx(
                            localClasses.cardCta,
                            item.hasStatus ? localClasses.cardCtaConnect : localClasses.cardCtaGuideBtn
                          )}
                          endIcon={!item.hasStatus ? (isRTL ? <MdArrowBackIos size={10} /> : <MdArrowForwardIos size={10} />) : null}
                          onClick={() => {
                            if (item.hasStatus) {
                              handleNavigateToIntegration(item.key);
                            } else if (item.guideUrl) {
                              window.open(item.guideUrl, '_blank');
                            }
                          }}
                        >
                          {item.hasStatus ? t("integrations.cardCta") : t("integrations.cardCtaGuide")}
                        </Button>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              // Empty State
              <Box className={localClasses.noResultsContainer}>
                <InfoIcon className={localClasses.noResultsIcon} />
                <Typography variant="h3" className={localClasses.noResultsTitle}>
                  {t("common.noData")}
                </Typography>
                <Typography variant="body2" className={localClasses.noResultsText}>
                  {t("common.noData")}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </DefaultScreen>
  );
};

export default Integrations;
