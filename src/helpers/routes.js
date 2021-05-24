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
    className={style}
  />,
  href: '/Pulseem/AccountSettings.aspx',
  options: [
    {title: t('master.RadMenuItemResource2.Text'),href: '/Pulseem/AccountSettings.aspx',iconSrc: SettingsMenuIcon},
    {title: t('master.linkAccountBilling.Text'),href: '/Pulseem/AccountUsers.aspx',iconSrc: DolarMenuIcon},
    {title: t('master.RadMenuItemResource3.Text'),href: '/Pulseem/AccountUsers.aspx',iconSrc: GroupMenuIcon},
    {title: t('master.RadMenuItemResource4.Text'),href: '/Pulseem/AccountUsersReport.aspx',iconSrc: GrafMenuIcon},
    {title: t('master.RadMenuItemResource23.Text'),href: '/Pulseem/ExtraFieldsDefinition.aspx',iconSrc: StarMenuIcon},
    {title: t('master.linkApiSettingsResource1.Text'),href: '/Pulseem/ApiSettings.aspx',iconSrc: CodeMenuIcon},
  ]
})


export const getRoutes=(t=() => null) => [
  {
    key: 'dashboard',
    title: t('master.RadMenuItemResource1.Text'),
    iconUnicode: '\u0064',
    href: '/Pulseem/homepage.aspx',
    icon: <img
      alt='Dashboard'
      src={DashboardIcon} />
  },
  {
    key: 'gruops',
    title: t('master.RadMenuItemResource8.Text'),
    iconUnicode: '\ue0d5',
    href: '/Pulseem/Groups.aspx',
    icon: <img
      alt='Groups'
      src={GroupsIcon} />,
    options: [
      {title: t('master.RadMenuItemResource6.Text'),href: '/Pulseem/Groups.aspx'},
      {title: t('master.RadMenuItemResource7.Text'),href: '/Pulseem/ClientSearch.aspx'},
      {title: t('master.RadMenuItemResource37.Text'),href: '/Pulseem/ClientAdvancedSearch.aspx'},
      {title: t('master.RadMenuItemResourceDynamicGroups.Text'),href: '/Pulseem/DynamicGroups.aspx'},
      {title: t('master.RadMenuItemResourceFileUploads.Text'),href: '/Pulseem/FileUploads.aspx'},
    ]
  },
  {
    key: 'newsletter',
    title: t('master.newsletter'),
    iconUnicode: '\ue0a1',
    href: '/react/Campaigns',
    icon: <img
      alt='Newsletter'
      src={NewsletterIcon} />,
    options: [
      {title: t('master.RadMenuItemResource9b.Text'),href: '/Pulseem/Editor/CampaignInfo?new=1'},
      {title: t('master.RadMenuItemResource9.Text'),href: '/react/Campaigns'},
      {title: t('master.linkSendCampaignByResultResource1.Text'),href: '/Pulseem/CampaignsByResults.aspx'},
      {title: t('master.linkAbTestingsResource1.Text'),href: '/Pulseem/CampaignsAbTestings.aspx'},
      {title: t('master.RadMenuItemResource9a.Text'),href: '/Pulseem/AutoSendPlans.aspx'},
      {title: t('master.RadMenuItemResource10.Text'),href: '/Pulseem/CampaignTemplates.aspx'},
      {title: t('master.newslatterBasicEditor'),href: '/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic'},
    ]
  },
  {
    key: 'sms',
    title: 'SMS',
    iconUnicode: '\ue181',
    href: '/react/SMSCampaigns',
    icon: <img
      alt='Sms'
      src={SmsIcon} />,
    options: [
      {title: t('master.RadMenuItemResource101.Text'),href: '/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create'},
      {title: t('master.RadMenuItemResource102.Text'),href: '/react/SMSCampaigns'},
      {title: t('master.chatbotSMS'),href: '/Pulseem/SMSSmartResponses.aspx'},
      {title: t('master.linkSMSResponsesReport.Text'),href: '/Pulseem/ResponsesReport.aspx'},
    ]
  },
  {
    key: 'mms',
    title: 'MMS',
    iconUnicode: '\ue11b',
    href: '/react/MmsCampaigns',
    icon: <img
      alt='Mms'
      src={MmsIcon} />,
    options: [
      {title: t('master.NewMMSCampaign.Text'),href: '/Pulseem/MmsCampaignEdit.aspx'},
      {title: t('master.MmsCampaignMnage.Text'),href: '/react/MmsCampaigns'}
    ]
  },
  {
    key: 'landingPages',
    title: t('master.RadItemLandingPagesMenu.Text'),
    iconUnicode: '\ue09d',
    href: '/react/EditRegistrationPage',
    icon: <img
      alt='Landing Pages'
      src={LandingPageIcon} />,
    options: [
      {title: t('master.RadMenuItemLandingPage.Text'),href: '/Pulseem/LandingPageWizard.aspx'},
      {title: t('master.RadMenuItemLandingManagement.Text'),href: '/react/EditRegistrationPage'},
      {title: t('master.FormTemplatesResource1.Text'),href: '/Pulseem/FormTemplates.aspx'},
    ]
  },
  {
    key: 'reports',
    title: t('master.RadMenuItemResource19.Text'),
    iconUnicode: '\ue049',
    href: '/Pulseem/MainReport.aspx',
    icon: <img
      alt='Reports'
      src={ReportsIcon} />,
    options: [
      {title: t('master.clalCollage'),href: '/Pulseem/ClalReport.aspx'},
      {title: t('master.RadMenuItemResource13.Text'),href: '/Pulseem/MainReport.aspx'},
      {title: t('master.RadMenuItemResource24.Text'),href: '/Pulseem/SMSMainReport.aspx'},
      {title: t('master.MmsMainReport.Text'),href: '/Pulseem/MmsMainReport.aspx'},
      {title: t('master.AbTestsReport.Text'),href: '/Pulseem/AbTestsReport.aspx'},
      {title: t('master.RadMenuItemResource15.Text'),href: '/Pulseem/AccountReport.aspx'},
      {title: t('master.RadMenuItemResource16.Text'),href: '/Pulseem/CampaignComparison.aspx'},
      {title: t('master.RadMenuItemResource18.Text'),href: '/Pulseem/ClientReport.aspx'},
      {title: t('master.RadMenuItemResource30.Text'),href: '/Pulseem/EmailAutoReports.aspx'},
      {title: t('master.locRemovedReason.Text'),href: '/Pulseem/RemovedStats.aspx'},
      {title: t('master.DirectReportsResource1.Text'),href: '/Pulseem/DirectEmailReport.aspx'},
      {title: t('master.DirectSmsReport.Text'),href: '/Pulseem/DirectSmsReport.aspx'},
      {title: t('master.OpenedClickedReport'),href: '/Pulseem/EmailCampaignStatistics.aspx'},
    ]
  },
  {
    key: 'automations',
    title: t('master.Automations'),
    iconUnicode: '\ue087',
    href: '/react/Automations',
    icon: <img
      alt='Automations'
      src={AutomationsIcon} />,
    options: [
      {title: t('master.RadMenuItemCreateAutomationResource.Text'),href: '/Pulseem/CreateAutomations.aspx'},
      {title: t('master.RadMenuItemManageAutomationResource.Text'),href: '/react/Automations'}
    ]
  },
  {
    key: 'notifications',
    title: t('master.notifications'),
    iconUnicode: '\ue117',
    href: '/react/Notifications',
    icon: <img
      alt='Notifications'
      src={NotificationsIcon} />,
    options: [
      {title: t('master.createNotification'),href: '/react/Notification/create'},
      {title: t('master.manageNotifications'),href: '/react/Notifications'},
      {title: t('master.implementScript'),uri: '/react/Notifications'}
    ]
  }
]