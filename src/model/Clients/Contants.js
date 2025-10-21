const CLIENT_CONSTANTS = {
	BASEURL: '/react/ClientSearchResult',
	PAGE_TYPES: {
		Undefined: 0,
		OpenedCampaignID: 1,
		LandingPageID: 2,
		FormID: 3,
		SentToCampaignID: 4,
		RemovedClientsCampaignID: 5,
		NotOpenedCampaignID: 6,
		ClientStatus: 7, // (Conditions * )
		TotalCountSMSCampaignID: 8,
		SuccessCountSMSCampaignID: 9,
		FailureCountSMSCampaignID: 10,
		RemovedCountSMSCampaignID: 11,
		MmsCountCampaignID: 12,
		StatCountryRegion: 13,
		StatCity: 14,
		Revenue: 15,
		ShowGroup: 16,
		Product: 17,
		WhatsappSentCount: 18,
		WhatsappRead: 19,
		WhatsappFailed: 20,
		WhatsappRemoved: 21,
		WhatsappUniqueClick: 22,
		WhatsappRevenue: 23,
		SMSUniqueClick: 24,
		SMSVerifiedClick: 25,
		EmailUniqueClick: 26,
		PopUpIdentifiedViewers: 27,
		PopUPConversions: 28
	},
	SMS_STATUS: {
		NoSms: -1,
		Active: 0,
		Removed: 1,
		Invalid: 4,
	},
	MMS_STATUS: {
		NoMms: -1,
		Active: 0,
		Removed: 1,
		Invalid: 4,
	},
	NEWSlETTER_STATUS: {
		NoEmail: -1,
		Active: 1,
		Removed: 2,
		Restricted: 3,
		Invalid: 4,
		Pending: 5,
	},
	WHATSAPP_STATUS: {
		Pending: 1,
		Sent: 2,
	},
	REPORT_TYPE: {
		ShowGroup: 0,
		ShowMails: 10,
		ShowMailsActive: 11,
		ShowMailsRemoved: 12,
		ShowMailsErrored: 13,
		ShowSms: 20,
		ShowSmsActive: 21,
		ShowSmsRemoved: 22,
		ShowSmsErrored: 23,
		ShowWhatsapp: 30,
	},
	QUERY_PARAMS: {
		PageIndex: 1,
		SearchTerm: '',
		Status: null,
		PageType: 0,
		ReportType: 0,
		TestStatusOfEmailElseSms: null, // 0 or null = sms, 1 = email
		Switch: null, // Not in use for now.
		CountryOrRegion: null,
		GroupIds: null, // List of 1 groupId
		NodeID: '', // Not in use for now
		CampaignID: null,
		FromDate: null,
		ToDate: null,
	},
	PRODUCT_REPORT_TYPE: {
		PURCHASED: 1,
		ABANDONED: 2,
	},
	SMS_STATUSES: {
		noStatus: {
			disabled: true,
			text: 'client.clientStatus.sms.NoSms',
			status: -1,
		},
		active: {
			text: 'client.clientStatus.sms.Active',
			status: 0,
		},
		removed: {
			text: 'client.clientStatus.sms.Removed',
			status: 1,
		},
		invalid: {
			text: 'client.clientStatus.sms.Invalid',
			status: 4,
		},
		pending: {
			text: 'client.clientStatus.sms.Pending',
			status: 5,
		},
	},
	STATUSES: {
		noStatus: {
			disabled: true,
			text: 'client.clientStatus.email.NoEmail',
			status: -1,
		},
		active: {
			text: 'client.clientStatus.email.Active',
			status: 1,
		},
		removed: {
			text: 'client.clientStatus.email.Removed',
			status: 2,
		},
		invalid: {
			text: 'client.clientStatus.email.Invalid',
			status: 4,
		},
		pending: {
			text: 'client.clientStatus.sms.Pending',
			status: 5,
		},
	},
};

export { CLIENT_CONSTANTS };
