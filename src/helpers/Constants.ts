export const rowsOptions = [6, 10, 20, 50];

export const DomainProtocol = [
    { key: 0, name: "http://" },
    { key: 1, name: "https://" }
];
export const EmailStatus = [
    { id: null, value: 'common.All' },
    { id: 0, value: 'emailStatus.draft' },
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
];
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
export const UploadSettings = {
    SMS: {
        ShowGroupName: true,
        Fields: [
            {
                isdisabled: false,
                idx: -1,
                value: "FirstName",
                label: "common.first_name"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "LastName",
                label: "common.last_name"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "CellPhone",
                label: "common.cellphone"
            }
        ]
    },
    GROUPS: {
        ShowGroupName: false,
        Fields: [
            {
                isdisabled: false,
                idx: -1,
                value: "FirstName",
                label: "common.first_name"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "LastName",
                label: "common.last_name"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "CellPhone",
                label: "common.cellphone"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Email",
                label: "common.email"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Telephone",
                label: "common.telephone"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Address",
                label: "common.address"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "City",
                label: "common.city"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "State",
                label: "common.state"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Country",
                label: "common.country"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Zip",
                label: "common.zip"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "Company",
                label: "common.company"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "BirthDate",
                label: "common.birth_date"
            },
            {
                isdisabled: false,
                idx: -1,
                value: "ReminderDate",
                label: "common.reminder_date"
            }
        ]
    }

};

export const DateFormats = {
    REGULAR: 'YYYY-MM-DD HH:mm:ss',
    DATE_ONLY: 'YYYY-MM-DD'
}

export const FBBusiness = 'https://business.facebook.com/wa/manage/';

export const SizeOptionsOfHandHeldDevices = ['xs', 'sm', 'md'];
export const SizeOptions_XS_SM = ['xs', 'sm'];

export const DynamicProductGrid: any = {
    Item_1: { image: 4, content: 8 },
    Item_2: { image: 2, content: 4 },
    Item_3: { image: 2, content: 2 },
    Item_4: { image: 1, content: 2 },
    Item_5: { image: 1, content: 1 },
    Item_6: { image: 1, content: 1 },
}
export const LandingPagesAnswerType = {
    SYSTEM_DEFAULT_MESSAGE: 1,
    POPUP_MESSAGE: 2,
    REDIRECT_URL: 3,
    DOWNLOAD_FILE: 4,
    WITHOUT_ANSWER: 5,
    TRANSFER_TO_PAYMENT_PAGE: 6
    // SEND_WEBHOOK: 7
}

export const PlaceHolders = {
    GOOGLE_ANALYTICS: "<!--Google Analytics--><script>(function (i, s, o, g, r, a, m) { i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments) }, i[r].l = 1 * new Date(); a = s.createElement(o), m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m) })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); ga('create', 'UA-XXXXX-Y', 'auto'); ga('send', 'pageview');</script><!-- End Google Analytics -->",
    GOOGLE_CONVERSION: "<!-- Google Code for Purchase Conversion Page --><script type=&quot;text/javascript&quot;>var google_conversion_id=1234567890;var google_conversion_language=&quot;en_US&quot;;var google_conversion_format=&quot;1&quot;;var google_conversion_color=&quot;666666&quot;;var google_conversion_label=&quot;xxx-XXx1xXXX123X1xX&quot;;var google_remarketing_only=&quot;false&quot;var google_conversion_value=10.0;var google_conversion_currency=&quot;USD&quot;</script><script type=&quot;text/javascript&quot;src=&quot;//www.googleadservices.com/pagead/conversion.js&quot;></script><noscript><img height=1 width=1 border=0src=&quot;//www.googleadservices.com/pagead/conversion/1234567890/?value=10.0&amp;currency_code=USD&amp;label=xxx-XXx1xXXX123X1xX&amp;guid=ON&amp;script=0&quot;></noscript>",
    GOOGLE_TAG_MANAGER: "<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=!0;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','GTM-XXXX');</script><!-- End Google Tag Manager --><!-- Google Tag Manager(noscript)--><noscript><iframe src=&quot;https://www.googletagmanager.com/ns.html?id=GTM-XXXX&quot;height=&quot;0&quot; width=&quot;0&quot; style=&quot;display:none;visibility:hidden&quot;></iframe></noscript><!-- End Google Tag Manager(noscript)-->",
    FACEBOOK_PIXEL: "<!--Facebook Pixel Code--><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','//connect.facebook.net/en_US/fbevents.js');// Insert Your Facebook Pixel ID below. fbq('init','FB_PIXEL_ID');fbq('track','PageView');</script><!-- Insert Your Facebook Pixel ID below. --><noscript><img height=&quot;1&quot; width=&quot;1&quot; style=&quot;display:none&quot; src=&quot;https://www.facebook.com/tr?id=FB_PIXEL_ID&amp;ev=PageView&amp;noscript=1&quot; /></noscript><!-- End Facebook Pixel Code -->",
    CSS_STYLE: "div { font-family: tahoma; color:#ddd !important; font-style: italic; }"
}

export const BEE_EDITOR_TYPES = {
    CAMPAIGN: 'Campaign',
    LANDING_PAGE: 'LandingPages'
}

export const NO_IMAGE_URL = 'https://www.pulseem.co.il/Pulseem/images/productimage.png';
export const NoAuthenticationAPIs = [
    'User/Signup',
    'User/ResendEmail',
    'User/CheckRef',
    'User/SetupNewEmail'
]

export const FieldOfActivities = [
    'Art',
    'Ecommerce',
    'EntertainmentAndEvents',
    'Insurance',
    'BlogsOnlineCommunities',
    'ConstructionAndArchitecture',
    'Health',
    'RecruitmentAndPersonnel',
    'Gaming',
    'Religion',
    'HigherEducation',
    'Travel',
    'Beauty',
    'PublicRelations',
    'Counseling',
    'MediaAndAdvertising',
    'HouseholdProducts',
    'Government',
    'Restaurants',
    'Legal',
    'RealEstate',
    'SportsAndFitness',
    'Politics',
    'Finance',
    'CoursesAndTrainings',
    'Retail',
    'Software',
    'Transportation',
    'Communication'
]

export const FieldOfInterest = [
    'BulkEmail',
    'BulkSMS',
    'WhatsApp',
    'LandingPages',
    'Ecommerce',
    'Notification',
    'MarketingAutomation'
]

export const lowerCaseLetters = /[a-z]/g;
export const upperCaseLetters = /[A-Z]/g;
export const numbers = /[0-9]/g;
export const specialLetters = /[!"#$%&'()*+.\/:;<=>?@\[\\\]^_`{|}~-]/g;

export const SHOPIFY_SITE_TRACKING = `
<script type="text/javascript">
    (function (d, t) {
        var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
        g.src = "https://webscript.prd.services.pulseem.com/main.js?v=" +
        Math.floor(Date.now() / 1000);
        s.parentNode.insertBefore(g, s);
    })(document, "script");
</script>

<script>
    window.addEventListener("load", () => {
        const orderId = "{{ order_number }}";
        const grandTotal = "{{ line_items_subtotal_price | money_without_currency }}".replaceAll(',', '');
        const shipping = 0;
        const tax = 0;
        const orderItems = [];
        window.trackPurchase(orderId, grandTotal, shipping, tax, orderItems);
    });
</script>`;
export const SEND_1 = '_Send_1';
export const PULSE_1 = '_Pulse_1';

export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_##]*)?\??(?:[\-\+=&;%@\.\w_]*)##?(?:[\.\!\/\\\w+]*)##)?[^\s]+)/g;
