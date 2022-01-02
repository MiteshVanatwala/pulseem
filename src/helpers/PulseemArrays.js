export const domainProtocol = [
    { key: 0, name: "http://" },
    { key: 1, name: "https://" }
];
export const EmailStatus = [

    { id: 0, value: 'emailStatus.other' },
    { id: 1, value: 'emailStatus.draft' },
    { id: 2, value: 'emailStatus.sending' },
    { id: 3, value: 'emailStatus.sent' },
    { id: 4, value: 'emailStatus.sent' },
    { id: 5, value: 'emailStatus.cancelled' },
    { id: 6, value: 'emailStatus.optIn' },
    { id: 7, value: 'emailStatus.approve' }
];

export const smsReportStatus = [
    { id: 0, value: 'report.smsReport.statuses.other' },
    { id: 1, value: 'report.smsReport.statuses.draft' },
    { id: 2, value: 'report.smsReport.statuses.inProcess' },
    { id: 3, value: 'report.smsReport.statuses.error' },
    { id: 4, value: 'report.smsReport.statuses.sent' },
    { id: 5, value: 'report.smsReport.statuses.cancelled' }
];

export const SmsStatus = [
    { id: 0, value: 'emailStatus.noStatus' },
    { id: 1, value: 'report.directReport.statuses.pending' },
    { id: 2, value: 'report.directReport.statuses.sending' },
    { id: 3, value: 'report.directReport.statuses.sentSuccessfuly' },
    { id: 4, value: 'report.directReport.statuses.error' },
    { id: 5, value: 'report.directReport.statuses.removed' }
];

export const ReponseType = [
    { id: 0, value: 'report.directReport.responseType.all' },
    { id: 1, value: 'report.directReport.responseType.notActive' },
    { id: 2, value: 'report.directReport.responseType.activeAll' },
    { id: 3, value: 'report.directReport.responseType.activeHasResponse' },
    { id: 4, value: 'report.directReport.responseType.activeNoResponse' }
]

export const ClientStatus = {
    Sms: [
        { id: -1, value: 'common.noSms' },
        { id: 0, value: 'common.statusActive' },
        { id: 1, value: 'common.Unsubscribed' },
        { id: 4, value: 'common.invalid' }
    ],
    Email: [
        { id: -1, value: 'common.noEmail' },
        { id: 1, value: 'common.statusActive' },
        { id: 2, value: 'common.Unsubscribed' },
        { id: 3, value: 'common.restricted' },
        { id: 4, value: 'common.invalid' },
        { id: 5, value: 'common.Pending' }
    ]
};
export const eventsOptions = [
    { key: 'PageLoad', value: 'siteTracking.events.pageLoad' },
    { key: 'PageView', value: 'siteTracking.events.pageView' }
];

export const eventConditions = [
    { key: 'Contains', value: "siteTracking.conditions.contains" },
    { key: 'Exact', value: "siteTracking.conditions.exact" },
    { key: 'NotContain', value: "siteTracking.conditions.notcontain" }
];
