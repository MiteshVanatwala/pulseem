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
import { FaBinoculars, FaCommentDots } from 'react-icons/fa';
import { whatsappRoutes } from '../../screens/Whatsapp/Constant';
import { logout } from "../Api/PulseemReactAPI";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { sitePrefix, isProdMode } from "../../config";
import { WhatsappIcon } from '../../assets/images/drawer/index';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { WhiteLabelObject } from '../../components/WhiteLabel/WhiteLabelMigrate';
import { UserRoles } from '../../Models/SubUser/SubUsers';
import store from '../../redux/store';

// ── Chat Widget dark launch ────────────────────────────────────────────────
// Phase 2 ships with no menu entry at all — see isShow: false on the section
// below. The feature is reachable by direct URL, and only for this login:
//
//   • sidebar section  → isShow: false           (nobody, preview user included)
//   • routes in App.js → preview user only       (others get PageNotFound)
//   • channel dropdown → preview user only       (WhatsApp Chat sidebar)
//
// To release it, set isShow on the section (see the comment there) and make
// isChatWidgetPreviewUser() return true.
//
// This is visibility, not security. The API is unguarded, so a determined user
// could still call the endpoints directly — the goal is to keep unfinished UI
// out of customers' way.
// Both internal logins are accepted: the account actually used on stage reports
// nameid 'Pulseem', while 'pulseemmeta' was the name originally asked for.
// Compared lowercased, so the casing typed at login does not matter.
const CHAT_WIDGET_PREVIEW_USERS = ['pulseem', 'pulseemmeta'];

export const isChatWidgetPreviewUser = (): boolean => {
  try {
    const state: any = store.getState();
    // nameid → companyName is the username typed at login; user.username is the
    // same value re-dispatched. Both are checked so this keeps working if either
    // path changes.
    const candidates = [state?.core?.companyName, state?.user?.username];
    return candidates.some(
      (n) => typeof n === 'string' && CHAT_WIDGET_PREVIEW_USERS.includes(n.trim().toLowerCase()),
    );
  } catch {
    return false;
  }
};
// export const rootDomain = !isProdMode ? 'http://localhost:58123' : '/Pulseem/';
export const rootDomain = '/Pulseem';

export const getSettingsItem = (
  t: (text: string) => null | VoidFunction = () => null,
  style: string = '',
  isAllowSwitchAccount: Boolean = false,
  title: string = "Settings",
  isRTL: Boolean = false,
  accountSettings: any,
  features: any = null,
  companyAdmin: boolean = false,
  userRoles: any = null
) => ({
  key: "settings",
  title: title,
  href: `${sitePrefix}AccountSettings`,
  options: [
    { key: 'accountSettings', title: t('master.RadMenuItemResource2.Text'), href: `${sitePrefix}AccountSettings`, iconSrc: SettingsMenuIcon, isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles === UserRoles.Admin },
    { key: 'billingSettings', title: t('master.linkAccountBilling.Text'), href: `${sitePrefix}BillingSettings`, iconSrc: DolarMenuIcon, isShow: companyAdmin && !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles === UserRoles.Admin },
    { key: 'affiliateManagement', title: t('master.affiliateManagement'), href: `${sitePrefix}AffiliateManagement`, iconSrc: DolarMenuIcon, isShow: features && features?.indexOf(PulseemFeatures.AFFILIATE) > -1 && !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles === UserRoles.Admin },
    { key: 'accountUsers', title: t('master.RadMenuItemResource3.Text'), href: `${sitePrefix}AccountUsers`, iconSrc: GroupMenuIcon, isShow: companyAdmin && !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles === UserRoles.Admin },
    { title: t('master.RadMenuItemResource4.Text'), href: `${rootDomain}/AccountUsersReport.aspx?fromreact=true`, iconSrc: GrafMenuIcon, isShow: companyAdmin && !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles === UserRoles.Admin },
    { title: t('master.RadMenuItemResource23.Text'), href: `${sitePrefix}AccountSettings/ExtraFields`, iconSrc: StarMenuIcon, isShow: true },
    //@ts-ignore
    { title: t('master.linkApiSettingsResource1.Text'), href: `${sitePrefix}ApiSettings`, iconSrc: CodeMenuIcon, isShow: userRoles.AllowSend && (!accountSettings?.SubAccountSettings?.IsTokenAccount && (WhiteLabelObject[accountSettings?.Account?.ReferrerID] === undefined || !accountSettings?.Account?.ReferrerID || accountSettings?.Account?.ReferrerID === 0)) ? true : false },
    { key: 'SiteTracking', title: t('master.siteTracking'), href: `${sitePrefix}SiteTracking`, iconSrc: FaBinoculars, isFaIcon: true, isShow: userRoles.AllowSend && !accountSettings?.SubAccountSettings?.IsTokenAccount },
    { key: 'Integrations', title: t('integrations.title'), href: `${sitePrefix}Integrations`, iconSrc: SettingsMenuIcon, isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount && userRoles.AllowSend },
    { key: 'SubUsers', title: t('SubUsers.title'), href: `${sitePrefix}SubUsers`, iconSrc: SettingsMenuIcon, isShow: true },
    { key: 'Teams', title: t('SubUsers.teams.sectionTitle'), href: `${sitePrefix}Teams`, iconSrc: SettingsMenuIcon, isShow: true },
    //@ts-ignore
    { key: 'Guides', title: t('common.UserGuides'), href: `https://site.pulseem.co.il/guides-2/`, iconSrc: SettingsMenuIcon, isShow: (!accountSettings?.SubAccountSettings?.IsTokenAccount && (WhiteLabelObject[accountSettings?.Account?.ReferrerID] === undefined || !accountSettings?.Account?.ReferrerID || accountSettings?.Account?.ReferrerID === 0)) ? true : false, openInNewWindow: true },
    { title: t("appBar.logout"), onClick: logout, iconSrc: isRTL ? HiArrowLeft : HiArrowRight, isFaIcon: true, isShow: true },
  ],
});


export const getRoutes = (
  t: (text: string) => null | VoidFunction = (par: string) => null,
  isClalAccount: Boolean | string = false,
  features: any = null,
  accountSettings: any = null,
  windowSize: string | number | null = null,
  isRTL: Boolean = false,
  userRoles: any = null,
  isPolandAccount: Boolean = false
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
      iconName: 'MdPeople',
      options: [
        {
          key: "groupManagement",
          title: t("master.RadMenuItemResource6.Text"),
          href: `${sitePrefix}groups`,
          isShow: true,
        },
        {
          key: 'clientSearch',
          title: t("client.logPageHeaderResource1.search"),
          href: `${sitePrefix}ClientSearch`,
          isShow: !userRoles?.HideRecipients
        },
        {
          title: t("master.RadMenuItemResource37.Text"),
          href: `${rootDomain}/ClientAdvancedSearch.aspx?fromreact=true`,
          isShow: false,
        },
        {
          key: "dynamicGroups",
          title: t("master.RadMenuItemResourceDynamicGroups.Text"),
          href: `${sitePrefix}Groups/Dynamic`,
          isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
        },
        {
          key: 'EditDynamicGroup',
          title: t("recipient.logPageHeaderResource1.Edit"),
          href: ``,
          isShow: false,
        },
        {
          key: 'fileUploads',
          title: t("master.RadMenuItemResourceFileUploads.Text"),
          href: `${sitePrefix}Groups/FileUploads`,
          isShow: true,
        },
        {
          key: 'downloadfiles',
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
      isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      iconName: 'MdMarkEmailRead',
      options: [
        {
          key: "newsletterInfo",
          title: t("master.RadMenuItemResource9b.Text"),
          href: `${sitePrefix}Campaigns/Create`,
          isShow: true,
        },
        {
          key: "newsletterManagment",
          title: t("master.RadMenuItemResource9.Text"),
          href: `${sitePrefix}Campaigns`,
          isShow: true,
        },
        {
          title: t("master.linkSendCampaignByResultResource1.Text"),
          href: `${rootDomain}/CampaignsByResults.aspx?fromreact=true`,
          isShow: false,
        },
        {
          title: t("master.RadMenuItemResource9a.Text"),
          href: `${rootDomain}/AutoSendPlans.aspx?fromreact=true`,
          isShow: true,
        },
        {
          title: 'A/B Test',
          href: `${rootDomain}/CampaignsAbTestings.aspx?fromreact=true`,
          isShow: !isPolandAccount,
        },
        // {
        //   title: t("master.RadMenuItemResource10.Text"),
        //   href: `${rootDomain}/CampaignTemplates.aspx?fromreact=true`,
        //   isShow: true,
        // },
        {
          title: t("master.newslatterBasicEditor"),
          href: `${rootDomain}/CampaignEdit.aspx?NewsLetterType=Basic&fromreact=true`,
          isShow: !isPolandAccount,
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
        },
        {
          key: 'ampRegistration',
          title: t('master.ampRegistration'),
          href: `${sitePrefix}Campaigns/AmpRegistration`,
          isShow: features?.indexOf(PulseemFeatures.BEE_AMP) > -1
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
        features.indexOf("7") > -1 &&
        !accountSettings?.SubAccountSettings?.IsTokenAccount,
      iconName: 'MdSms',
      options: [
        {
          key: "create",
          title: t("master.RadMenuItemResource101.Text"),
          href: `${sitePrefix}sms/create`,
          isShow: true,
        },
        {
          key: "smsManagment",
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
          isShow: features && features?.indexOf(PulseemFeatures.MMS) > -1,
        },
        {
          title: t("master.MmsCampaignMnage.Text"),
          href: `${sitePrefix}MmsCampaigns`,
          isShow: features && features?.indexOf(PulseemFeatures.MMS) > -1,
        }
      ],
    },
    {
      key: 'whatsapp',
      title: 'Whatsapp',
      pageTitle: t('whatsapp.Title'),
      iconName: 'IoLogoWhatsapp',
      href: whatsappRoutes.CAMPAIGN_MANAGEMENT,
      isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      // icon: <WhatsappIcon className='header-whatsapp-icon' />,
      options: [
        {
          key: 'create',
          title: t('whatsapp.NewWhatsappCampaign'),
          href: whatsappRoutes.CREATE_TEMPLATE,
          isShow: true,
        },
        {
          key: 'createWhatsappCampaign',
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
          isShow: userRoles?.AllowWhatsAppToAgent,
        },
        {
          key: 'onboarding',
          title: t('WhatsappOnBoarding.title'),
          href: whatsappRoutes.ONBOARDING,
          isShow: true,
        }
      ],
    },
    {
      key: "landingPages",
      title: t("master.RadItemLandingPagesMenu.Text"),
      pageTitle: t("landingPages.logPageHeaderResource1.Text"),
      iconUnicode: "\ue09d",
      href: `${sitePrefix}EditRegistrationPage`,
      isShow: true,
      iconName: 'FiFileText',
      options: [
        {
          key: "createLandingPage",
          title: t("master.RadMenuItemLandingPage.Text"),
          href: `${sitePrefix}LandingPages/Create`,
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
          isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
        },
        {
          key: 'CreateLandingPage',
          title: t("landingPages.createLandingPage"),
          href: ``,
          isShow: false,
        },
        {
          key: 'EditLandingPage',
          title: t("landingPages.editLandingPage"),
          href: ``,
          isShow: false,
        },
        {
          key: 'campaignEditor',
          title: t("landingPages.editLandingPage"),
          href: ``,
          isShow: false
        },
        {
          key: 'previewer',
          title: t("landingPages.editLandingPage"),
          href: ``,
          isShow: false,
        }
      ],
    },
    {
      key: "popups",
      title: t("landingPages.popups") || "Pop Ups",
      pageTitle: t("landingPages.popups") || "Pop Ups",
      iconUnicode: "\ue09d",
      href: `${sitePrefix}PopUpManagement`,
      isShow: features && features?.indexOf(PulseemFeatures.Popup) > -1,
      iconName: 'FaRegWindowRestore',
      options: [
        {
          key: "createPopup",
          title: t("landingPages.createPopup"),
          href: `${sitePrefix}Popups/Create`,
          isShow: true,
        },
        {
          key: "popupManagement",
          title: t("master.RadMenuItemPopupManagement.Text"),
          href: `${sitePrefix}PopUpManagement`,
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
      isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      iconName: 'BiSitemap',
      options: [
        {
          title: t("master.createTemplate"),
          href: `${rootDomain}/CreateAutomations.aspx?fromreact=true&template=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
          isShow: features && features?.indexOf(PulseemFeatures.AUTOMATION_TEMPLATE) > -1,
        },
        {
          title: t("master.manageTemplate"),
          href: `${rootDomain}/AutomationTemplates.aspx?fromreact=true&Culture=${isRTL ? 'he-IL' : 'en-US'}`,
          isShow: features && features?.indexOf(PulseemFeatures.AUTOMATION_TEMPLATE) > -1,
        },
        {
          key: 'create-automations',
          title: t("master.RadMenuItemCreateAutomationResource.Text"),
          href: `${sitePrefix}Automations/Create`,
          isShow: true,
        },
        {
          key: "automations",
          title: t("master.RadMenuItemManageAutomationResource.Text"),
          href: `${sitePrefix}Automations`,
          isShow: true,
        },
      ],
    },
    {
      key: "widgets",
      title: t("common.widget_chat_widget"),
      pageTitle: t("common.widget_chat_widget"),
      iconUnicode: "\ue087",
      href: `${sitePrefix}Widgets`,
      isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      icon: <FaCommentDots size={24} color="#909aa2" />,
      options: [
        {
          key: "chatWidget",
          title: t("common.widget_chat_widget"),
          href: `${sitePrefix}Widgets`,
          isShow: true,
        }
      ],
    },
    {
      // Service section (Phase 2). Conversations has no entry of its own — widget
      // chats appear inside the WhatsApp Chat inbox via its channel filter.
      key: "service",
      title: t("common.widget_chat_widget"),
      pageTitle: t("common.widget_chat_widget"),
      // iconName (not a hardcoded <icon>) so the sidebar renders it in the same
      // white as every other section — an inline colour opts out of that.
      iconName: 'FiSliders',
      href: `${sitePrefix}Dashboard`,
      // Dark launch: the section is listed for nobody — not even the preview user.
      // Access is by direct URL only; App.js registers those routes for the preview
      // user alone. isShow is a conditional render, so this keeps the entry out of
      // the DOM entirely rather than hiding it with CSS.
      //
      // To release it, restore:
      //   isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      isShow: true,
      options: [
        {
          key: "serviceDashboard",
          title: t("common.service_dashboard"),
          href: `${sitePrefix}Dashboard`,
          isShow: true,
        },
        {
          key: "serviceConversations",
          title: t("common.service_conversations"),
          // Opens the WhatsApp Chat inbox pre-filtered to widget conversations;
          // WhatsappChat reads ?channel= on mount.
          href: `${whatsappRoutes.CHAT}?channel=widget`,
          isShow: true,
        },
        {
          key: "chatWidget",
          title: t("common.widget_add_chat_widget"),
          href: `${sitePrefix}Widgets`,
          isShow: true,
        },
        {
          key: "serviceChatbots",
          title: t("chatbot_list_title"),
          href: `${sitePrefix}Chatbots`,
          isShow: true,
        }
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
        features.indexOf("35") > -1 &&
        !accountSettings?.SubAccountSettings?.IsTokenAccount,
      iconName: 'MdNotificationsActive',
      options: [
        {
          key: "createNotification",
          title: t("master.createNotification"),
          href: `${sitePrefix}Notification/create`,
          isShow: true,
        },
        {
          key: "notifications",
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
      isShow: !accountSettings?.SubAccountSettings?.IsTokenAccount,
      iconName: 'FiPieChart',
      options: [
        { title: t('master.clalCollage'), href: `${rootDomain}/ClalReport.aspx?fromreact=true`, isShow: (isClalAccount === 'true' || isClalAccount === true) },
        { key: "newsletterReport", title: t('master.RadMenuItemResource13.Text'), href: `${sitePrefix}reports/NewsletterReports`, isShow: true },
        { key: 'SmsReport', title: t('master.RadMenuItemResource24.Text'), href: `${sitePrefix}reports/SMSMainReport`, isShow: true },
        // { key: 'MmsReport', title: t('mmsreport.mmsReport'), href: `${sitePrefix}Reports/MMSMainReport`, isShow: true },
        { key: 'whatsappReports', title: t('whatsapp.ReportsWhatsapp'), href: whatsappRoutes.REPORTS, isShow: true },
        // { title: t('master.AbTestsReport.Text'), href: `${rootDomain}/AbTestsReport.aspx?fromreact=true`, isShow: true },
        { title: t('master.RadMenuItemResource15.Text'), href: `${rootDomain}/AccountReport.aspx?fromreact=true`, isShow: true },
        { title: t('master.RadMenuItemResource16.Text'), href: `${rootDomain}/CampaignComparison.aspx?fromreact=true`, isShow: false },
        { key: 'recipientReport', title: t('master.RadMenuItemResource18.Text'), href: `${sitePrefix}Reports/Recipient`, isShow: !userRoles?.HideRecipients },
        { title: t('master.RadMenuItemResource30.Text'), href: `${rootDomain}/EmailAutoReports.aspx?fromreact=true`, isShow: true },
        { title: t('master.locRemovedReason.Text'), href: `${rootDomain}/RemovedStats.aspx?fromreact=true`, isShow: true },
        { key: 'productsReport', title: t('report.ProductsReport.products'), href: `${sitePrefix}Reports/ProductsReport`, isShow: true },
        { key: 'directSendReport', title: t('report.DirectSendReport'), href: `${sitePrefix}Reports/DirectSendReport`, isShow: accountSettings && accountSettings?.IsDirectAccount === true && !userRoles?.HideRecipients },
        { key: 'directSendReportArchive', title: t('report.ArchiveDirectSendReport'), href: `${sitePrefix}Reports/DirectSendReport/Archive`, isShow: accountSettings && accountSettings?.IsDirectAccount === true && !userRoles?.HideRecipients },
        { title: t('master.OpenedClickedReport'), href: `${rootDomain}/EmailCampaignStatistics.aspx?fromreact=true`, isShow: true },
        { key: 'inboundMessages', title: t('master.responses'), href: `${sitePrefix}Reports/Inbound`, isShow: !userRoles?.HideRecipients },
      ],
    },
    { key: 'termOfUse', title: t('TermsOfUse.title'), href: `${sitePrefix}TermsOfUse`, iconSrc: '', isShow: false }
  ];
