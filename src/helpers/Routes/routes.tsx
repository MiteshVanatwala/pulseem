import {
  AutomationsIcon,
  DashboardIcon,
  GroupsIcon,
  LandingPageIcon,
  NewsletterIcon,
  NotificationsIcon,
  ReportsIcon,
  SmsIcon,
} from '../../assets/images/drawer/index';
import {
  CodeMenuIcon,
  DolarMenuIcon,
  SettingsMenuIcon,
  StarMenuIcon,
  GrafMenuIcon,
  GroupMenuIcon,
} from '../../assets/images/settings/index';
import { FaBinoculars } from 'react-icons/fa';
import { whatsappRoutes } from '../../screens/Whatsapp/Constant';
import { logout } from "../Api/PulseemReactAPI";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { sitePrefix, isProdMode } from "../../config";
import { WhatsappIcon } from '../../assets/images/drawer/index';
// export const rootDomain = !isProdMode ? 'http://localhost:58123' : '/Pulseem/';
export const rootDomain = '/Pulseem';

export const getSettingsItem = (
  t: (text: string) => null | VoidFunction = () => null,
  style: string = '',
  isAllowSwitchAccount: Boolean = false,
  title: string = "Settings",
  isRTL: Boolean = false
) => ({
  key: "settings",
  title: title,
  href: `${sitePrefix}AccountSettings`,
  options: [
    { key: 'accountSettings', title: t('master.RadMenuItemResource2.Text'), href: `${sitePrefix}AccountSettings`, iconSrc: SettingsMenuIcon, isShow: true },
    { title: t('master.linkAccountBilling.Text'), href: `${rootDomain}/AccountBilling.aspx?fromreact=true`, iconSrc: DolarMenuIcon, isShow: true },
    { title: t('master.RadMenuItemResource3.Text'), href: `${rootDomain}/AccountUsers.aspx?fromreact=true`, iconSrc: GroupMenuIcon, isShow: isAllowSwitchAccount },
    { title: t('master.RadMenuItemResource4.Text'), href: `${rootDomain}/AccountUsersReport.aspx?fromreact=true`, iconSrc: GrafMenuIcon, isShow: isAllowSwitchAccount },
    { title: t('master.RadMenuItemResource23.Text'), href: `${rootDomain}/ExtraFieldsDefinition.aspx?fromreact=true`, iconSrc: StarMenuIcon, isShow: true },
    { title: t('master.linkApiSettingsResource1.Text'), href: `${sitePrefix}ApiSettings`, iconSrc: CodeMenuIcon, isShow: true },
    { key: 'SiteTracking', title: t('master.siteTracking'), href: `${sitePrefix}SiteTracking`, iconSrc: FaBinoculars, isFaIcon: true, isShow: true },
    { key: 'Integrations', title: t('integrations.title'), href: `${sitePrefix}Integrations`, iconSrc: SettingsMenuIcon, isShow: true },
    { title: t("appBar.logout"), onClick: logout, iconSrc: isRTL ? HiArrowLeft : HiArrowRight, isFaIcon: true, isShow: true },
  ],
});


export const getRoutes = (
  t: (text: string) => null | VoidFunction = (par: string) => null,
  isClalAccount: Boolean | string = false,
  features: any = null,
  subAccountSettings: any = null,
  windowSize: string | number | null = null,
  isRTL: Boolean = false
) => [
    // smsOldVersion
    {
      key: "dashboard",
      title: t("dashboard.pageTitle"),
      iconUnicode: "\uF064",
      href: sitePrefix,
      isShow: windowSize && windowSize === "xs" ? true : false,
      icon: <img alt="Dashboard" src={DashboardIcon} />,
    },
    {
      key: "groups",
      title: t("appBar.groups.title"),
      iconUnicode: "\ue0d5",
      href: `${sitePrefix}groups`,
      isShow: true,
      icon: <img alt="Groups" src={GroupsIcon} />,
      options: [
        {
          key: "groupManagement",
          title: t("master.RadMenuItemResource6.Text"),
          href: `${sitePrefix}groups`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource7.Text"),
          href: `${rootDomain}/ClientSearch.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource37.Text"),
          href: `${rootDomain}/ClientAdvancedSearch.aspx?fromreact=true`,
          isShow: false,
        },
        {
          key: "dynamicGroups",
          title: t("master.RadMenuItemResourceDynamicGroups.Text"),
          href: `${rootDomain}/DynamicGroups.aspx?fromreact=true`,
          // href: `${sitePrefix}Groups/Dynamic`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResourceFileUploads.Text"),
          href: `${rootDomain}/FileUploads.aspx?fromreact=true`,
          isShow: true,
        },
        {
          key: 'downloadReports',
          title: t('master.fileDownload'),
          href: `${sitePrefix}groups/Download`,
          isShow: true
        }
      ],
    },
    {
      key: "newsletter",
      title: t("master.newsletter"),
      pageTitle: t("campaigns.logPageHeaderResource1.Text"),
      iconUnicode: "\ue0a1",
      href: `${sitePrefix}Campaigns`,
      isShow: true,
      icon: <img alt="Newsletter" src={NewsletterIcon} />,
      options: [
        {
          key: "newsletterInfo",
          title: t("master.RadMenuItemResource9b.Text"),
          href: `${sitePrefix}Campaigns/Create`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource9.Text"),
          href: `${sitePrefix}Campaigns`,
          isShow: true,
        },
        {
          title: t("master.linkSendCampaignByResultResource1.Text"),
          href: `${rootDomain}/CampaignsByResults.aspx?fromreact=true`,
          isShow: false,
        },
        // {
        //   title: t("master.linkAbTestingsResource1.Text"),
        //   href: `${rootDomain}/CampaignsAbTestings.aspx?fromreact=true`,
        //   isShow: false,
        // },
        {
          title: t("master.RadMenuItemResource9a.Text"),
          href: `${rootDomain}/AutoSendPlans.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource10.Text"),
          href: `${rootDomain}/CampaignTemplates.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: t("master.newslatterBasicEditor"),
          href: `${rootDomain}/CampaignEdit.aspx?NewsLetterType=Basic&fromreact=true`,
          isShow: true,
        },
        {
          key: "archiveManagement",
          title: t("master.campaignsArchive"),
          href: `${sitePrefix}Campaigns/Archive`,
          isShow: true,
        },
        {
          key: "newsletterSendSettings",
          title: t("campaigns.newsLetterSendSettings.title"),
          href: `${sitePrefix}Campaigns/SendSettings`,
          isShow: false
        }
      ],
    },
    {
      key: "sms",
      title: "SMS",
      pageTitle: t("sms.PageResource1.Title"),
      iconUnicode: "\ue181",
      href: `${sitePrefix}SMSCampaigns`,
      isShow:
        features &&
        !features.error &&
        features !== null &&
        features.indexOf("7") > -1,
      icon: <img alt="Sms" src={SmsIcon} />,
      options: [
        {
          key: "create",
          title: t("master.RadMenuItemResource101.Text"),
          href: `${sitePrefix}sms/create`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource102.Text"),
          href: `${sitePrefix}SMSCampaigns`,
          isShow: true,
        },
        {
          title: t("master.chatbotSMS"),
          href: `${rootDomain}/SMSSmartResponses.aspx?fromreact=true`,
          isShow: true,
        },
        // {
        //   title: t("master.linkSMSResponsesReport.Text"),
        //   href: `${sitePrefix}reports/Inbound`,
        //   isShow: true,
        // },
        {
          title: t("master.NewMMSCampaign.Text"),
          href: `${rootDomain}/MmsCampaignEdit.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: t("master.MmsCampaignMnage.Text"),
          href: `${sitePrefix}MmsCampaigns`,
          isShow: true,
        }
      ],
    },
    {
      key: 'whatsapp',
      title: 'Whatsapp',
      pageTitle: t('whatsapp.Title'),
      // iconUnicode: '\ue181',
      href: whatsappRoutes.CAMPAIGN_MANAGEMENT,
      isShow: true,
      icon: <WhatsappIcon className='header-whatsapp-icon' />,
      options: [
        {
          key: 'create',
          title: t('whatsapp.NewWhatsappCampaign'),
          href: whatsappRoutes.CREATE_TEMPLATE,
          isShow: true,
        },
        {
          key: 'send',
          title: t('whatsapp.SendWhatsappCampaign'),
          href: whatsappRoutes.CREATE_CAMPAIGN_PAGE1,
          isShow: true,
        },
        {
          key: 'templatemanagement',
          title: t('whatsapp.ManageWhatsappTemplate'),
          href: whatsappRoutes.TEMPLATE_MANAGEMENT,
          isShow: true,
        },
        {
          key: 'campaignmanagement',
          title: t('whatsapp.ManageWhatsappCampaign'),
          href: whatsappRoutes.CAMPAIGN_MANAGEMENT,
          isShow: true,
        },
        {
          key: 'chat',
          title: t('whatsapp.ChatWhatsapp'),
          href: whatsappRoutes.CHAT,
          isShow: true,
        },
      ],
    },
    {
      key: "landingPages",
      title: t("master.RadItemLandingPagesMenu.Text"),
      pageTitle: t("landingPages.logPageHeaderResource1.Text"),
      iconUnicode: "\ue09d",
      href: `${sitePrefix}EditRegistrationPage`,
      isShow: true,
      icon: <img alt="Landing Pages" src={LandingPageIcon} />,
      options: [
        {
          title: t("master.RadMenuItemLandingPage.Text"),
          href: `${rootDomain}/LandingPageWizard.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemLandingManagement.Text"),
          href: `${sitePrefix}EditRegistrationPage`,
          isShow: true,
        },
        {
          title: t("master.FormTemplatesResource1.Text"),
          href: `${rootDomain}/FormTemplates.aspx?fromreact=true`,
          isShow: true,
        },
      ],
    },
    {
      key: "automations",
      title: t("master.Automations"),
      pageTitle: t("automations.logPageHeaderResource1.Text"),
      iconUnicode: "\ue087",
      href: `${sitePrefix}Automations`,
      isShow: true,
      icon: <img alt="Automations" src={AutomationsIcon} />,
      options: [
        {
          title: t("master.RadMenuItemCreateAutomationResource.Text"),
          href: `${rootDomain}/CreateAutomations.aspx?fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemManageAutomationResource.Text"),
          href: `${sitePrefix}Automations`,
          isShow: true,
        },
      ],
    },
    {
      key: "notifications",
      title: t("master.notifications"),
      pageTitle: t("notifications.notificationManagement"),
      iconUnicode: "\ue117",
      href: `${sitePrefix}Notifications`,
      isShow:
        features &&
        !features.error &&
        features !== null &&
        features.indexOf("35") > -1,
      icon: <img alt="Notifications" src={NotificationsIcon} />,
      options: [
        {
          key: "create",
          title: t("master.createNotification"),
          href: `${sitePrefix}Notification/create`,
          isShow: true,
        },
        {
          title: t("master.manageNotifications"),
          href: `${sitePrefix}Notifications`,
          isShow: true,
        },
      ],
    },
    {
      key: "reports",
      title: t("master.RadMenuItemResource19.Text"),
      pageTitle: t("mainReport.logPageHeaderResource1.Text"),
      iconUnicode: "\ue049",
      href: `${sitePrefix}Reports/NewsletterReports`,
      isShow: true,
      icon: <img alt="Reports" src={ReportsIcon} />,
      options: [
        { title: t('master.clalCollage'), href: `${rootDomain}/ClalReport.aspx?fromreact=true`, isShow: (isClalAccount === 'true' || isClalAccount === true) },
        { title: t('master.RadMenuItemResource13.Text'), href: `${sitePrefix}reports/NewsletterReports`, isShow: true },
        { key: 'SmsReport', title: t('master.RadMenuItemResource24.Text'), href: `${sitePrefix}reports/SMSMainReport`, isShow: true },
        { key: 'MmsReport', title: t('mmsreport.mmsReport'), href: `${sitePrefix}Reports/MMSMainReport`, isShow: true },
        { key: 'whatsappReports', title: t('whatsapp.ReportsWhatsapp'), href: whatsappRoutes.REPORTS, isShow: true },
        // { title: t('master.AbTestsReport.Text'), href: `${rootDomain}/AbTestsReport.aspx?fromreact=true`, isShow: true },
        { title: t('master.RadMenuItemResource15.Text'), href: `${rootDomain}/AccountReport.aspx?fromreact=true`, isShow: true },
        { title: t('master.RadMenuItemResource16.Text'), href: `${rootDomain}/CampaignComparison.aspx?fromreact=true`, isShow: false },
        { key: 'recipientReport', title: t('master.RadMenuItemResource18.Text'), href: `${sitePrefix}Reports/Recipient`, isShow: true },
        { title: t('master.RadMenuItemResource30.Text'), href: `${rootDomain}/EmailAutoReports.aspx?fromreact=true`, isShow: true },
        { title: t('master.locRemovedReason.Text'), href: `${rootDomain}/RemovedStats.aspx?fromreact=true`, isShow: true },
        { key: 'productsReport', title: t('report.ProductsReport.products'), href: `${sitePrefix}Reports/ProductsReport`, isShow: true },
        { key: 'directSendReport', title: t('report.DirectSendReport'), href: `${sitePrefix}Reports/DirectSendReport`, isShow: true },
        { key: 'directSendReportArchive', title: t('report.ArchiveDirectSendReport'), href: `${sitePrefix}Reports/DirectSendReport/Archive`, isShow: true },
        { title: t('master.OpenedClickedReport'), href: `${rootDomain}/EmailCampaignStatistics.aspx?fromreact=true`, isShow: true },
        { key: 'inboundMessages', title: t('master.responses'), href: `${sitePrefix}Reports/Inbound`, isShow: true },
      ],
    },
  ];
