export const DomainProtocol = [
    { key: 0, name: "http://" },
    { key: 1, name: "https://" }
];
export const EmailStatus = [
    { id: null, value: 'common.All' },
    // { id: 0, value: 'emailStatus.noStatus' },
    { id: 1, value: 'emailStatus.pending' },
    { id: 2, value: 'emailStatus.sending' },
    { id: 3, value: 'emailStatus.succeeded' },
    { id: 4, value: 'emailStatus.error' },
    { id: 5, value: 'emailStatus.retry' },
    { id: 6, value: 'emailStatus.paused' },
    { id: 7, value: 'emailStatus.cancelled' },
    { id: 8, value: 'emailStatus.badError' },
    { id: 9, value: 'emailStatus.mediumError' },
    { id: 10, value: 'emailStatus.spam' },
    { id: 11, value: 'emailStatus.removed' },
    { id: 12, value: 'emailStatus.removedBySystem' }
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
    { id: null, value: 'common.All' },
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
        { id: 4, value: 'client.clientStatus.sms.Invalid' },
        { id: 5, value: 'common.Pending' }
    ],
    Email: [
        { id: -1, value: 'common.noEmail' },
        { id: 1, value: 'common.statusActive' },
        { id: 2, value: 'common.Unsubscribed' },
        { id: 3, value: 'common.restricted' },
        { id: 4, value: 'client.clientStatus.email.Invalid' },
        { id: 5, value: 'common.Pending' }
    ]
};
export const EventsOptions = [
    { key: 'PAGE_VIEW', value: 'siteTracking.events.pageView' },
    { key: 'PURCHASE', value: 'siteTracking.events.purchase' }
    // { key: 'PAGE_LOAD', value: 'siteTracking.events.pageLoad' }
];


export const EventConditions = [
    { key: 'CONTAINS', value: "siteTracking.conditions.contains", tooltip: null },
    { key: 'EXACT', value: "siteTracking.conditions.exact", tooltip: 'siteTracking.conditions.tooltip.exact' }
];

export const MMSReportStatus = [
    { id: 0, value: 'report.smsReport.statuses.other', color: '' },
    { id: 1, value: 'report.smsReport.statuses.draft', color: "textColorOrange" },
    { id: 2, value: 'report.smsReport.statuses.inProcess', color: "textColorBlue" },
    { id: 3, value: 'report.smsReport.statuses.error', color: "textColorRed" },
    { id: 4, value: 'report.smsReport.statuses.sent', color: "sendIconText" },
    { id: 5, value: 'report.smsReport.statuses.cancelled', color: "textColorRed" }
];

export const WhatsappStatus = [
    { id: -1, value: 'report.takenBySender' },
    { id: null, value: 'common.All' },
    { id: 1, value: 'common.Pending' },
    { id: 2, value: 'common.Sent' },
    { id: 3, value: 'common.delivered' },
    { id: 4, value: 'common.failedStatus' },
    { id: 5, value: 'common.Unsubscribed' },
    { id: 6, value: 'common.read' },
    { id: 7, value: 'report.canceled' },
    { id: 8, value: 'common.stopped' },
    { id: 9, value: 'common.Removed' },
    { id: 10, value: 'report.invalidFromNumber' },
    { id: 11, value: 'common.NoInboundIn24Session' }
];