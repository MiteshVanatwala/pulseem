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
    {title: t('master.RadMenuItemResource2.Text'),href: '/Pulseem/AccountSettings.aspx?fromreact=true',iconSrc: SettingsMenuIcon},
    {title: t('master.linkAccountBilling.Text'),href: '/Pulseem/AccountUsers.aspx?fromreact=true',iconSrc: DolarMenuIcon},
    {title: t('master.RadMenuItemResource3.Text'),href: '/Pulseem/AccountUsers.aspx?fromreact=true',iconSrc: GroupMenuIcon},
    {title: t('master.RadMenuItemResource4.Text'),href: '/Pulseem/AccountUsersReport.aspx?fromreact=true',iconSrc: GrafMenuIcon},
    {title: t('master.RadMenuItemResource23.Text'),href: '/Pulseem/ExtraFieldsDefinition.aspx?fromreact=true',iconSrc: StarMenuIcon},
    {title: t('master.linkApiSettingsResource1.Text'),href: '/Pulseem/ApiSettings.aspx?fromreact=true',iconSrc: CodeMenuIcon},
  ]
})


export const getRoutes=(t=() => null) => [
  {
    key: 'dashboard',
    title: t('master.RadMenuItemResource1.Text'),
    iconUnicode: '\u0064',
    href: '/Pulseem/homepage.aspx?fromreact=true',
    icon: <img
      alt='Dashboard'
      src={DashboardIcon} />
  },
  {
    key: 'gruops',
    title: t('master.RadMenuItemResource8.Text'),
    iconUnicode: '\ue0d5',
    href: '/Pulseem/Groups.aspx?fromreact=true',
    icon: <img
      alt='Groups'
      src={GroupsIcon} />,
    options: [
      {title: t('master.RadMenuItemResource6.Text'),href: '/Pulseem/Groups.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource7.Text'),href: '/Pulseem/ClientSearch.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource37.Text'),href: '/Pulseem/ClientAdvancedSearch.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResourceDynamicGroups.Text'),href: '/Pulseem/DynamicGroups.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResourceFileUploads.Text'),href: '/Pulseem/FileUploads.aspx?fromreact=true'},
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
      {title: t('master.RadMenuItemResource9b.Text'),href: '/Pulseem/Editor/CampaignInfo?new=1&fromreact=true'},
      {title: t('master.RadMenuItemResource9.Text'),href: '/react/Campaigns'},
      {title: t('master.linkSendCampaignByResultResource1.Text'),href: '/Pulseem/CampaignsByResults.aspx?fromreact=true'},
      {title: t('master.linkAbTestingsResource1.Text'),href: '/Pulseem/CampaignsAbTestings.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource9a.Text'),href: '/Pulseem/AutoSendPlans.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource10.Text'),href: '/Pulseem/CampaignTemplates.aspx?fromreact=true'},
      {title: t('master.newslatterBasicEditor'),href: '/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic&fromreact=true'},
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
      {title: t('master.RadMenuItemResource101.Text'),href: '/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create&fromreact=true'},
      {title: t('master.RadMenuItemResource102.Text'),href: '/react/SMSCampaigns'},
      {title: t('master.chatbotSMS'),href: '/Pulseem/SMSSmartResponses.aspx?fromreact=true'},
      {title: t('master.linkSMSResponsesReport.Text'),href: '/Pulseem/ResponsesReport.aspx?fromreact=true'},
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
      {title: t('master.NewMMSCampaign.Text'),href: '/Pulseem/MmsCampaignEdit.aspx?fromreact=true'},
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
      {title: t('master.RadMenuItemLandingPage.Text'),href: '/Pulseem/LandingPageWizard.aspx?fromreact=true'},
      {title: t('master.RadMenuItemLandingManagement.Text'),href: '/react/EditRegistrationPage'},
      {title: t('master.FormTemplatesResource1.Text'),href: '/Pulseem/FormTemplates.aspx?fromreact=true'},
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
      {title: t('master.RadMenuItemCreateAutomationResource.Text'),href: '/Pulseem/CreateAutomations.aspx?fromreact=true'},
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
      {title: t('master.createNotification'),href: '/Pulseem/Notification.aspx?t=add&fromreact=true'},
      {title: t('master.manageNotifications'),href: '/react/Notifications'},
      {title: t('master.implementScript'),uri: '/react/Notifications'}
    ]
  },
  {
    key: 'reports',
    title: t('master.RadMenuItemResource19.Text'),
    iconUnicode: '\ue049',
    href: '/Pulseem/MainReport.aspx?fromreact=true',
    icon: <img
      alt='Reports'
      src={ReportsIcon} />,
    options: [
      {title: t('master.clalCollage'),href: '/Pulseem/ClalReport.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource13.Text'),href: '/Pulseem/MainReport.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource24.Text'),href: '/Pulseem/SMSMainReport.aspx?fromreact=true'},
      {title: t('master.MmsMainReport.Text'),href: '/Pulseem/MmsMainReport.aspx?fromreact=true'},
      {title: t('master.AbTestsReport.Text'),href: '/Pulseem/AbTestsReport.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource15.Text'),href: '/Pulseem/AccountReport.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource16.Text'),href: '/Pulseem/CampaignComparison.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource18.Text'),href: '/Pulseem/ClientReport.aspx?fromreact=true'},
      {title: t('master.RadMenuItemResource30.Text'),href: '/Pulseem/EmailAutoReports.aspx?fromreact=true'},
      {title: t('master.locRemovedReason.Text'),href: '/Pulseem/RemovedStats.aspx?fromreact=true'},
      {title: t('master.DirectReportsResource1.Text'),href: '/Pulseem/DirectEmailReport.aspx?fromreact=true'},
      {title: t('master.DirectSmsReport.Text'),href: '/Pulseem/DirectSmsReport.aspx?fromreact=true'},
      {title: t('master.OpenedClickedReport'),href: '/Pulseem/EmailCampaignStatistics.aspx?fromreact=true'},
    ]
  }
]