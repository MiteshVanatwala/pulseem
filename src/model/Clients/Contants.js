const CLIENT_CONSTANTS = {
    BASEURL: '/ClientSearchResult',
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
        Restricted: 3,
        Removed2: 2,
        Removed5: 5,
        Invalid: 4
    },
    REPORT_TYPE: {
        ShowGroup: 0,
        ShowMails: 10,
        ShowSms: 20,
    },
    QUERY_PARAMS: {
        PageSize: "6",
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
        CampaignID: 309787,
        FromDate: null,
        ToDate: null,
    }
}

export default CLIENT_CONSTANTS

