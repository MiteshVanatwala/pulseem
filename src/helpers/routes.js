import {
  AutomationsIcon,DashboardIcon,GroupsIcon,LandingPageIcon,
  MmsIcon,NewsletterIcon,NotificationsIcon,ReportsIcon,SmsIcon
} from '../assets/images/drawer/index'
import {
  CodeMenuIcon,DolarMenuIcon,SettingsMenuIcon,StarMenuIcon,GrafMenuIcon,GroupMenuIcon
} from '../assets/images/settings/index'
import SettingsLogo from '../assets/images/settings-white.png'

export const getSettingsItem=(t,style='') => ({
  title: <img
    alt='settings'
    src={SettingsLogo}
    className={style} />,
  href: '/AccountSettings',
  options: [
    {title: t('master.RadMenuItemResource2.Text'),href: '/AccountSettings',iconSrc: SettingsMenuIcon},
    {title: t('master.linkAccountBilling.Text'),href: '/AccountBilling',iconSrc: DolarMenuIcon},
    {title: t('master.RadMenuItemResource3.Text'),href: '/AccountUsers',iconSrc: GroupMenuIcon},
    {title: t('master.RadMenuItemResource4.Text'),href: '/AccountUsersReport',iconSrc: GrafMenuIcon},
    {title: t('master.RadMenuItemResource23.Text'),href: '/ExtraFieldsDefinition',iconSrc: StarMenuIcon},
    {title: t('master.linkApiSettingsResource1.Text'),href: '/ApiSettings',iconSrc: CodeMenuIcon},
  ]
})


export const getRoutes=(t=() => null) => [
  {
    key: 'dashboard',
    title: t('master.RadMenuItemResource1.Text'),
    iconUnicode: '\u0064',
    href: '/homepage',
    icon: <img
      alt='Dashboard'
      src={DashboardIcon} />
  },
  {
    key: 'gruops',
    title: t('master.RadMenuItemResource8.Text'),
    iconUnicode: '\ue0d5',
    href: '/Groups',
    icon: <img
      alt='Groups'
      src={GroupsIcon} />,
    options: [
      {title: t('master.RadMenuItemResource6.Text'),href: '/Groups'},
      {title: t('master.RadMenuItemResource7.Text'),href: '/ClientSearch'},
      {title: t('master.RadMenuItemResource37.Text'),href: '/ClientAdvancedSearch'},
      {title: t('master.RadMenuItemResourceDynamicGroups.Text'),href: '/DynamicGroups'},
      {title: t('master.RadMenuItemResourceFileUploads.Text'),href: '/FileUploads'},
    ]
  },
  {
    key: 'newsletter',
    title: t('master.newsletter'),
    iconUnicode: '\ue0a1',
    href: '/Campaigns',
    icon: <img
      alt='Newsletter'
      src={NewsletterIcon} />,
    options: [
      {title: t('master.RadMenuItemResource9b.Text'),href: '/Editor/CampaignInfo'},
      {title: t('master.RadMenuItemResource9.Text'),href: '/Campaigns'},
      {title: t('master.linkSendCampaignByResultResource1.Text'),href: '/CampaignsByResults'},
      {title: t('master.linkAbTestingsResource1.Text'),href: '/CampaignsAbTestings'},
      {title: t('master.RadMenuItemResource9a.Text'),href: '/AutoSendPlans'},
      {title: t('master.RadMenuItemResource10.Text'),href: '/CampaignTemplates'},
      {title: t('master.newslatterBasicEditor'),href: '/CampaignEdit'},
    ]
  },
  {
    key: 'sms',
    title: 'SMS',
    iconUnicode: '\ue181',
    href: '/SMSCampaigns',
    icon: <img
      alt='Sms'
      src={SmsIcon} />,
    options: [
      {title: t('master.RadMenuItemResource101.Text'),href: '/SMSCampaignEditor'},
      {title: t('master.RadMenuItemResource102.Text'),href: '/SMSCampaigns'},
      {title: t('master.chatbotSMS'),href: '/SMSSmartResponses'},
      {title: t('master.linkSMSResponsesReport.Text'),href: '/ResponsesReport'},
    ]
  },
  {
    key: 'mms',
    title: 'MMS',
    iconUnicode: '\ue11b',
    href: '/MmsCampaigns',
    icon: <img
      alt='Mms'
      src={MmsIcon} />,
    options: [
      {title: t('master.NewMMSCampaign.Text'),href: '/MmsCampaignEdit'},
      {title: t('master.MmsCampaignMnage.Text'),href: '/MmsCampaigns'}
    ]
  },
  {
    key: 'landingPages',
    title: t('master.RadItemLandingPagesMenu.Text'),
    iconUnicode: '\ue09d',
    href: '/EditRegistrationPage',
    icon: <img
      alt='Landing Pages'
      src={LandingPageIcon} />,
    options: [
      {title: t('master.RadMenuItemLandingPage.Text'),href: '/LandingPageWizard'},
      {title: t('master.RadMenuItemLandingManagement.Text'),href: '/EditRegistrationPage'},
      {title: t('master.FormTemplatesResource1.Text'),href: '/FormTemplates'},
    ]
  },
  {
    key: 'reports',
    title: t('master.RadMenuItemResource19.Text'),
    iconUnicode: '\ue049',
    href: '/MainReport',
    icon: <img
      alt='Reports'
      src={ReportsIcon} />,
    options: [
      {title: t('master.clalCollage'),href: '/ClalReport'},
      {title: t('master.RadMenuItemResource13.Text'),href: '/MainReport'},
      {title: t('master.RadMenuItemResource24.Text'),href: '/SMSMainReport'},
      {title: t('master.MmsMainReport.Text'),href: '/MmsMainReport'},
      {title: t('master.AbTestsReport.Text'),href: '/AbTestsReport'},
      {title: t('master.RadMenuItemResource15.Text'),href: '/AccountReport'},
      {title: t('master.RadMenuItemResource16.Text'),href: '/CampaignComparison'},
      {title: t('master.RadMenuItemResource18.Text'),href: '/ClientReport'},
      {title: t('master.RadMenuItemResource30.Text'),href: '/EmailAutoReports'},
      {title: t('master.locRemovedReason.Text'),href: '/RemovedStats'},
      {title: t('master.DirectReportsResource1.Text'),href: '/DirectEmailReport'},
      {title: t('master.DirectSmsReport.Text'),href: '/DirectSmsReport'},
      {title: t('master.OpenedClickedReport'),href: '/EmailCampaignStatistics'},
    ]
  },
  {
    key: 'automations',
    title: t('master.Automations'),
    iconUnicode: '\ue087',
    href: '/Automations',
    icon: <img
      alt='Automations'
      src={AutomationsIcon} />,
    options: [
      {title: t('master.RadMenuItemCreateAutomationResource.Text'),href: '/CreateAutomations'},
      {title: t('master.RadMenuItemManageAutomationResource.Text'),href: '/Automations'}
    ]
  },
  {
    key: 'notifications',
    title: t('master.notifications'),
    iconUnicode: '\ue117',
    href: '/Notification',
    icon: <img
      alt='Notifications'
      src={NotificationsIcon} />,
    options: [
      {title: t('master.createNotification'),href: '/Notification/create'},
      {title: t('master.manageNotifications'),href: '/Notification'}
    ]
  }
]