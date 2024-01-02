import {
  AutomationsIcon,
  DashboardIcon,
  GroupsIcon,
  LandingPageIcon,
  MmsIcon,
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
import SettingsLogo from '../../assets/images/settings-white.png';
import { FaHome } from 'react-icons/fa';
import { whatsappRoutes } from '../../screens/Whatsapp/Constant';
import { WhatsappIcon } from '../../assets/images/drawer/index';

export const getSettingsItem = (
  t: (text: string) => null | VoidFunction = () => null,
  style: string = '',
  isAllowSwitchAccount: Boolean = false
) => ({
  key: "settings",
  title: <img alt="settings" src={SettingsLogo} className={style} />,
  href: "/react/AccountSettings",
  isShow: true,
  options: [
    { key: 'accountSettings', title: t('master.RadMenuItemResource2.Text'), href: '/react/AccountSettings', iconSrc: SettingsMenuIcon, isShow: true },
    { title: t('master.linkAccountBilling.Text'), href: '/Pulseem/AccountBilling.aspx?fromreact=true', iconSrc: DolarMenuIcon, isShow: true },
    { title: t('master.RadMenuItemResource3.Text'), href: '/Pulseem/AccountUsers.aspx?fromreact=true', iconSrc: GroupMenuIcon, isShow: isAllowSwitchAccount },
    { title: t('master.RadMenuItemResource4.Text'), href: '/Pulseem/AccountUsersReport.aspx?fromreact=true', iconSrc: GrafMenuIcon, isShow: isAllowSwitchAccount },
    { title: t('master.RadMenuItemResource23.Text'), href: '/Pulseem/ExtraFieldsDefinition.aspx?fromreact=true', iconSrc: StarMenuIcon, isShow: true },
    { title: t('master.linkApiSettingsResource1.Text'), href: '/Pulseem/ApiSettings.aspx?fromreact=true', iconSrc: CodeMenuIcon, isShow: true },
    { key: 'SiteTracking', title: t('master.siteTracking'), href: '/react/SiteTracking', iconSrc: FaBinoculars, isFaIcon: true, isShow: true },
    { key: 'Integrations', title: t('integrations.title'), href: '/react/Integrations', iconSrc: SettingsMenuIcon, isShow: true },
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
      href: "/react",
      isShow: windowSize && windowSize === "xs" ? true : false,
      icon: <img alt="Dashboard" src={DashboardIcon} />,
    },
    {
      key: "homepage",
      title: t("dashboard.pageTitle"),
      href: "/react",
      isShow: true,
      icon: <FaHome style={{ color: "#fff" }} />,
    },
    {
      key: "groups",
      title: t("appBar.groups.title"),
      iconUnicode: "\ue0d5",
      href: "/react/groups",
      isShow: true,
      icon: <img alt="Groups" src={GroupsIcon} />,
      options: [
        {
          key: "groupManagement",
          title: t("master.RadMenuItemResource6.Text"),
          href: "/react/groups",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource7.Text"),
          href: "/Pulseem/ClientSearch.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource37.Text"),
          href: "/Pulseem/ClientAdvancedSearch.aspx?fromreact=true",
          isShow: false,
        },
        {
          title: t("master.RadMenuItemResourceDynamicGroups.Text"),
          href: "/Pulseem/DynamicGroups.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResourceFileUploads.Text"),
          href: "/Pulseem/FileUploads.aspx?fromreact=true",
          isShow: true,
        },
        { key: 'downloadReports', title: t('master.fileDownload'), href: '/react/groups/Download', isShow: true },
      ],
    },
    {
      key: "newsletter",
      title: t("master.newsletter"),
      pageTitle: t("campaigns.logPageHeaderResource1.Text"),
      iconUnicode: "\ue0a1",
      href: "/react/Campaigns",
      isShow: true,
      icon: <img alt="Newsletter" src={NewsletterIcon} />,
      options: [
        {
          key: "newsletterInfo",
          title: t("master.RadMenuItemResource9b.Text"),
          href: "/react/Campaigns/Create",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource9.Text"),
          href: "/react/Campaigns",
          isShow: true,
        },
        {
          title: t("master.linkSendCampaignByResultResource1.Text"),
          href: "/Pulseem/CampaignsByResults.aspx?fromreact=true",
          isShow: false,
        },
        {
          title: t("master.linkAbTestingsResource1.Text"),
          href: "/Pulseem/CampaignsAbTestings.aspx?fromreact=true",
          isShow: false,
        },
        {
          title: t("master.RadMenuItemResource9a.Text"),
          href: "/Pulseem/AutoSendPlans.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource10.Text"),
          href: "/Pulseem/CampaignTemplates.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.newslatterBasicEditor"),
          href: "/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic&fromreact=true",
          isShow: true,
        },
        {
          key: "archiveManagement",
          title: t("master.campaignsArchive"),
          href: "/react/Campaigns/Archive",
          isShow: true,
        },
        {
          key: "newsletterSendSettings",
          title: t("campaigns.newsLetterSendSettings.title"),
          href: "/react/Campaigns/SendSettings",
          isShow: false
        }
      ],
    },
    {
      key: "sms",
      title: "SMS",
      pageTitle: t("sms.PageResource1.Title"),
      iconUnicode: "\ue181",
      href: "/react/SMSCampaigns",
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
          href: "/react/sms/create",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemResource102.Text"),
          href: "/react/SMSCampaigns",
          isShow: true,
        },
        {
          title: t("master.chatbotSMS"),
          href: "/Pulseem/SMSSmartResponses.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.linkSMSResponsesReport.Text"),
          href: "/react/reports/Inbound",
          isShow: true,
        },
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
      key: "mms",
      title: "MMS",
      pageTitle: t("mms.logPageHeaderResource1.Text"),
      iconUnicode: "\ue11b",
      href: "/react/MmsCampaigns",
      isShow: true,
      icon: <img alt="Mms" src={MmsIcon} />,
      options: [
        {
          title: t("master.NewMMSCampaign.Text"),
          href: "/Pulseem/MmsCampaignEdit.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.MmsCampaignMnage.Text"),
          href: "/react/MmsCampaigns",
          isShow: true,
        },
      ],
    },
    {
      key: "landingPages",
      title: t("master.RadItemLandingPagesMenu.Text"),
      pageTitle: t("landingPages.logPageHeaderResource1.Text"),
      iconUnicode: "\ue09d",
      href: "/react/EditRegistrationPage",
      isShow: true,
      icon: <img alt="Landing Pages" src={LandingPageIcon} />,
      options: [
        {
          title: t("master.RadMenuItemLandingPage.Text"),
          href: "/Pulseem/LandingPageWizard.aspx?fromreact=true",
          isShow: true,
        },
        {
          title: t("master.RadMenuItemLandingManagement.Text"),
          href: "/react/EditRegistrationPage",
          isShow: true,
        },
        {
          title: t("master.FormTemplatesResource1.Text"),
          href: "/Pulseem/FormTemplates.aspx?fromreact=true",
          isShow: true,
        },
      ],
    },
    {
      key: "automations",
      title: t("master.Automations"),
      pageTitle: t("automations.logPageHeaderResource1.Text"),
      iconUnicode: "\ue087",
      href: "/react/Automations",
      isShow: true,
      icon: <img alt="Automations" src={AutomationsIcon} />,
      options: [
        {
          title: t("master.RadMenuItemCreateAutomationResource.Text"),
          href: `/Pulseem/CreateAutomations.aspx?fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
          isShow: true,
        },
        {
          title: t("master.RadMenuItemManageAutomationResource.Text"),
          href: "/react/Automations",
          isShow: true,
        },
      ],
    },
    {
      key: "notifications",
      title: t("master.notifications"),
      pageTitle: t("notifications.notificationManagement"),
      iconUnicode: "\ue117",
      href: "/react/Notifications",
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
          href: "/react/Notification/create",
          isShow: true,
        },
        {
          title: t("master.manageNotifications"),
          href: "/react/Notifications",
          isShow: true,
        }
      ],
    },
    {
      key: "reports",
      title: t("master.RadMenuItemResource19.Text"),
      pageTitle: t("mainReport.logPageHeaderResource1.Text"),
      iconUnicode: "\ue049",
      href: "/react/Reports/NewsletterReports",
      isShow: true,
      icon: <img alt="Reports" src={ReportsIcon} />,
      options: [
        { title: t('master.clalCollage'), href: '/Pulseem/ClalReport.aspx?fromreact=true', isShow: (isClalAccount === 'true' || isClalAccount === true) },
        { title: t('master.RadMenuItemResource13.Text'), href: '/react/reports/NewsletterReports', isShow: true },
        { key: 'SmsReport', title: t('master.RadMenuItemResource24.Text'), href: '/react/reports/SMSMainReport', isShow: true },
        { key: 'MmsReport', title: t('mmsreport.mmsReport'), href: '/react/reports/MMSMainReport', isShow: true },
        { key: 'whatsappReports', title: t('whatsapp.ReportsWhatsapp'), href: whatsappRoutes.REPORTS, isShow: true },
        { title: t('master.AbTestsReport.Text'), href: '/Pulseem/AbTestsReport.aspx?fromreact=true', isShow: false },
        { title: t('master.RadMenuItemResource15.Text'), href: '/Pulseem/AccountReport.aspx?fromreact=true', isShow: true },
        { title: t('master.RadMenuItemResource16.Text'), href: '/Pulseem/CampaignComparison.aspx?fromreact=true', isShow: false },
        { title: t('master.RadMenuItemResource18.Text'), href: '/Pulseem/ClientReport.aspx?fromreact=true', isShow: true },
        { title: t('master.RadMenuItemResource30.Text'), href: '/Pulseem/EmailAutoReports.aspx?fromreact=true', isShow: true },
        { title: t('master.locRemovedReason.Text'), href: '/Pulseem/RemovedStats.aspx?fromreact=true', isShow: true },
        { key: 'productsReport', title: t('report.ProductsReport.products'), href: '/react/Reports/ProductsReport', isShow: true },
        { key: 'directSendReport', title: t('report.DirectSendReport'), href: '/react/Reports/DirectSendReport', isShow: true },
        { key: 'directSendReportArchive', title: t('report.ArchiveDirectSendReport'), href: '/react/Reports/DirectSendReport/Archive', isShow: true },
        { title: t('master.OpenedClickedReport'), href: '/Pulseem/EmailCampaignStatistics.aspx?fromreact=true', isShow: true },
        { key: 'inboundMessages', title: t('master.responses'), href: '/react/reports/Inbound', isShow: true },
      ],
    },
  ];
