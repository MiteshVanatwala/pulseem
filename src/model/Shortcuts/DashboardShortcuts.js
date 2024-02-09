import { sitePrefix } from "../../config";
export const DASHBOARD_SHORTCUT = {
  'appBar.groups.title': {
    title: 'appBar.groups.title',
    pages: [
      {
        title: 'dashboard.createGroup',
        link: '/react/Groups?NewGroup=true'
      },
      {
        title: 'appBar.groups.manageRecipients',
        link: '/react/Groups'
      },
      {
        title: 'appBar.groups.dynamicGroups',
        // link: '/react/Groups/Dynamic'
        link: '/Pulseem/DynamicGroups.aspx?fromreact=true'
      },
      {
        title: 'appBar.groups.search',
        link: '/Pulseem/ClientSearch.aspx'
      },
      // {
      //   title: 'dashboard.advanceSearch',
      //   link: '/Pulseem/ClientAdvancedSearch.aspx'
      // },
      {
        title: 'appBar.groups.fileUploads',
        link: '/Pulseem/FileUploads.aspx'
      },
      {
        title: 'master.fileDownload',
        link: '/react/groups/Download'
      }
    ]
  },
  'appBar.newsletter.title': {
    title: 'appBar.newsletter.title',
    pages: [
      {
        title: 'campaigns.create',
        link: '/react/Campaigns/Create'
      },
      {
        title: 'master.RadMenuItemResource9.Text',
        link: '/react/Campaigns'
      },
      {
        title: 'dashboard.createABTest',
        link: '/Pulseem/CampaignsByResults.aspx'
      },
      // {
      //   title: 'master.linkAbTestingsResource1.Text',
      //   link: '/Pulseem/CampaignsAbTestings.aspx'
      // },
      {
        title: 'master.RadMenuItemResource9a.Text',
        link: '/Pulseem/AutoSendPlans.aspx'
      },
      {
        title: 'master.RadMenuItemResource10.Text',
        link: '/Pulseem/CampaignTemplates.aspx'
      },
      {
        title: 'master.newslatterBasicEditor',
        link: '/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic'
      },
      {
        title: 'master.campaignsArchive',
        link: '/react/Campaigns/Archive'
      }
    ]
  },
  'appBar.sms.title': {
    title: 'appBar.sms.title',
    pages: [
      {
        title: 'common.CreateSMS',
        link: '/react/sms/create'
      },
      {
        title: 'dashboard.smsManagement',
        link: '/react/SMSCampaigns'
      },
      {
        title: 'master.chatbotSMS',
        link: '/Pulseem/SMSSmartResponses.aspx'
      },
      {
        title: 'master.linkSMSResponsesReport.Text',
        link: '/react/reports/Inbound'
      }
    ]
  },
  'appBar.mms.title': {
    title: "appBar.mms.title",
    pages: [
      {
        title: 'common.CreateMMS',
        link: '/Pulseem/MmsCampaignEdit.aspx'
      },
      {
        title: 'dashboard.mmsManagement',
        link: '/react/MmsCampaigns'
      }
    ],
  },
  'appBar.landingPages.title': {
    title: "appBar.landingPages.title",
    pages: [
      {
        title: 'landingPages.CreateNewResource.Text',
        link: '/Pulseem/LandingPageWizard.aspx'
      },
      {
        title: 'landingPages.logPageHeaderResource1.Text',
        link: '/react/EditRegistrationPage'
      }
    ]
  },
  'appBar.reports.title': {
    title: 'appBar.reports.title',
    pages: [
      {
        title: 'master.RadMenuItemResource13.Text',
        link: '/react/reports/NewsletterReports'
      },
      {
        title: 'master.RadMenuItemResource24.Text',
        link: '/react/reports/SMSMainReport'
      },
      {
        title: 'master.MmsMainReport.Text',
        link: '/react/reports/MMSMainReport'
      },
      // {
      //   title: 'master.AbTestsReport.Text',
      //   link: '/Pulseem/AbTestsReport.aspx'
      // },
      {
        title: 'master.RadMenuItemResource15.Text',
        link: '/Pulseem/AccountReport.aspx'
      },
      {
        title: 'master.RadMenuItemResource18.Text',
        link: '/react/Reports/Recipient'
      },
      {
        title: 'master.RadMenuItemResource30.Text',
        link: '/Pulseem/EmailAutoReports.aspx'
      },
      {
        title: 'dashboard.unsubscribeReports',
        link: '/Pulseem/RemovedStats.aspx'
      },
      {
        title: 'master.DirectReportsResource1.Text',
        link: '/react/Reports/DirectSendReport?t=1'
      },
      {
        title: 'master.DirectSmsReport.Text',
        link: '/react/Reports/DirectSendReport?t=0'
      },
      {
        title: 'dashboard.openedClickedReport',
        link: '/Pulseem/EmailCampaignStatistics.aspx'
      }

    ]
  },
  'appBar.automation.title': {
    title: 'appBar.automation.title',
    pages: [
      {
        title: 'automations.createResource.Text',
        link: '/Pulseem/CreateAutomations.aspx'
      },
      {
        title: 'dashboard.automationManagement',
        link: `${sitePrefix}Automations`
      }
    ]
  }
}