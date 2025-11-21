import { ActivityGroup, Conditions } from "../Models/Clients/ClientSearch";
import { getCookie } from "./Functions/cookies";

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
    DATE_TIME_24: 'DD/MM/YYYY HH:mm',
    DATE_ONLY: 'DD/MM/YYYY',
    TIME_ONLY: 'HH:mm',
    FULL_DATE_AM_PM: 'DD/MM/YYYY HH:mm:ss A',
    DATEPICKER_DATE_FORMAT: 'MM/DD/YYYY',
    FULL_DATE_START: 'DD/MM/YYYY 00:00:00',
    FULL_DATE_END: 'DD/MM/YYYY 23:59:59',
    DATE_WITHOUT_YEAR: 'MM/DD'
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
    LANDING_PAGE: 'LandingPages',
    POPUP: 'popupeditor'
}

export const NO_IMAGE_URL = 'https://www.pulseem.co.il/Pulseem/images/productimage.png';
export const NoAuthenticationAPIs = [
    'User/Signup',
    'User/ResendEmail',
    'User/CheckRef',
    'User/SetupNewEmail',
    'User/CheckSubUserRef',
    'User/ConfirmSubUser',
    'User/SaveInfoAccounts',
    'User/GetStepWiseAccountInfo',
    'GDPR/ForgetMe',
    'GDPR/ValidateOTP',
    'GDPR/EraseClient'
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
    'Bulk Email',
    'Bulk SMS',
    'WhatsApp',
    'Landing Pages',
    'eCommerce Solutions',
    'Web Push Notifications',
    'Marketing Automation'
]

export const lowerCaseLetters = /[a-z]/g;
export const upperCaseLetters = /[A-Z]/g;
export const numbers = /[0-9]/g;
export const specialLetters = /[!"#$%&'()*+.\/:;<=>?@\[\\\]^_`{|}~-]/g;
export const PhoneNumberRegEx = /^\+?[0-9]*$/;
export const DecimalWithMinusRegEx = /^-?[0-9]*(\.)?([0-9]+)?$/;
export const NumberWithMinusRegEx = /^-?[0-9]*$/;

export const DEFAULT_NEW_GROUP = {
    ActiveCell: 0,
    ActiveEmails: 0,
    DynamicData: null,
    DynamicLastUpdate: null,
    DynamicUpdatePolicy: null,
    GroupID: null,
    InvalidCell: 0,
    InvalidEmails: 0,
    IsDynamic: false,
    IsTestGroup: false,
    PendingClients: 0,
    Recipients: 0,
    RemovedCell: 0,
    RemovedEmails: 0,
    RestrictedEmails: 0,
    SubAccountID: 0,
    TotalRecipients: 0,
    GroupName: "",
    UpdatedDate: new Date(),
    CreatedDate: new Date(),
};
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

export const CreditHistoryType = {
    0: "common.Mail",
    1: "common.SMS",
    2: "common.MMS",
};

export const CreditHistoryAccountType = {
    0: "SubAccount.standard",
    1: "SubAccount.direct",
}

export const IsraelCurrencyId = 1;
export const USDCurrencyId = 2;
export const GlobalPackageId = 4;
// eslint-disable-next-line
export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_#]*)?\??(?:[\-\+=&;,%@\.\w_#]*)#?(?:[\.\!\/\\\w+]*))?)/g;

export const Separator = '<sep>';

export const DEFAULT_CLIENT_SEARCH = {
    IsSearchByFilter: true,
    IsAdvanced: true,
    PageSize: getCookie('rpp') || 6,
    PageIndex: 1,
    SearchTerm: '',
    Status: null,
    PageType: null,
    ReportType: 10,
    TestStatusOfEmailElseSms: null,
    Switch: '',
    CountryOrRegion: '',
    GroupIds: [],
    NodeID: '',
    OrderBy: 0,
    IsExport: false,
    MyActivities: {
        IsOpened: null,
        IsOpenedInterval: 0,
        IsOpenedFromDate: null,
        IsOpenedToDate: null,
        IsNotOpened: null,
        IsNotOpenedInterval: 0,
        IsNotOpenedFromDate: null,
        IsNotOpenedToDate: null
    } as ActivityGroup,
    MyConditions: [
        {
            FirstName: null,
            FirstNameCond: 0,
            LastName: null,
            LastNameCond: 0,
            Email: null,
            EmailCond: 2,
            Address: null,
            AddressCond: 0,
            City: null,
            CityCond: 0,
            Country: null,
            CountryCond: 0,
            State: null,
            StateCond: 0,
            Zip: null,
            ZipCond: 0,
            Telephone: null,
            TelephoneCond: 0,
            Cellphone: null,
            CellphoneCond: 0,
            Company: null,
            ComapnyCond: 0,
            BirthDateFrom: null,
            BirthDateTo: null,
            BirthDateFromWithoutYear: null,
            BirthDateToWithoutYear: null,
            ReminderFrom: null,
            ReminderTo: null,
            CreatedFrom: null,
            CreatedTo: null,
            Status: 0,
            StatusCond: 0,
            SmsStatus: 0,
            SmsStatusCond: 0,
            ExtraField1: null,
            ExtraField1Cond: 0,
            ExtraField2: null,
            ExtraField2Cond: 0,
            ExtraField3: null,
            ExtraField3Cond: 0,
            ExtraField4: null,
            ExtraField4Cond: 0,
            ExtraField5: null,
            ExtraField5Cond: 0,
            ExtraField6: null,
            ExtraField6Cond: 0,
            ExtraField7: null,
            ExtraField7Cond: 0,
            ExtraField8: null,
            ExtraField8Cond: 0,
            ExtraField9: null,
            ExtraField9Cond: 0,
            ExtraField10: null,
            ExtraField10Cond: 0,
            ExtraField11: null,
            ExtraField11Cond: 0,
            ExtraField12: null,
            ExtraField12Cond: 0,
            ExtraField13: null,
            ExtraField13Cond: 0,
            ExtraDate1From: null,
            ExtraDate1To: null,
            ExtraDate2From: null,
            ExtraDate2To: null,
            ExtraDate3From: null,
            ExtraDate3To: null,
            ExtraDate4From: null,
            ExtraDate4To: null
        }
    ] as Conditions[],
    MyGroups: [],
    ShowOpened: false,
    ShowNotOpened: false,
    ShowClicked: false,
    ShowNotClicked: false
}

export const CurrenciesToDisplayForPoland = [2, 3];
export const DefaultCountryCodeIsrael = { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' };
export const DefaultCountryCodePoland = { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱' };
export const CountryCodes = [
    { code: '+93', country: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', country: 'AL', name: 'Albania', flag: '🇦🇱' },
    { code: '+213', country: 'DZ', name: 'Algeria', flag: '🇩🇿' },
    { code: '+376', country: 'AD', name: 'Andorra', flag: '🇦🇩' },
    { code: '+244', country: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: '+1', country: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
    { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: '+374', country: 'AM', name: 'Armenia', flag: '🇦🇲' },
    { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: '+994', country: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+1', country: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { code: '+973', country: 'BH', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+1', country: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { code: '+375', country: 'BY', name: 'Belarus', flag: '🇧🇾' },
    { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: '+501', country: 'BZ', name: 'Belize', flag: '🇧🇿' },
    { code: '+229', country: 'BJ', name: 'Benin', flag: '🇧🇯' },
    { code: '+975', country: 'BT', name: 'Bhutan', flag: '🇧🇹' },
    { code: '+591', country: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+387', country: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+267', country: 'BW', name: 'Botswana', flag: '🇧🇼' },
    { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: '+673', country: 'BN', name: 'Brunei', flag: '🇧🇳' },
    { code: '+359', country: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
    { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+257', country: 'BI', name: 'Burundi', flag: '🇧🇮' },
    { code: '+855', country: 'KH', name: 'Cambodia', flag: '🇰🇭' },
    { code: '+237', country: 'CM', name: 'Cameroon', flag: '🇨🇲' },
    { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: '+238', country: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
    { code: '+236', country: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
    { code: '+235', country: 'TD', name: 'Chad', flag: '🇹🇩' },
    { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
    { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: '+269', country: 'KM', name: 'Comoros', flag: '🇰🇲' },
    { code: '+242', country: 'CG', name: 'Congo', flag: '🇨🇬' },
    { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+385', country: 'HR', name: 'Croatia', flag: '🇭🇷' },
    { code: '+53', country: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: '+357', country: 'CY', name: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', country: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: '+253', country: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
    { code: '+1', country: 'DM', name: 'Dominica', flag: '🇩🇲' },
    { code: '+1', country: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
    { code: '+670', country: 'TL', name: 'East Timor', flag: '🇹🇱' },
    { code: '+593', country: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+20', country: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+240', country: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+291', country: 'ER', name: 'Eritrea', flag: '🇪🇷' },
    { code: '+372', country: 'EE', name: 'Estonia', flag: '🇪🇪' },
    { code: '+251', country: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+679', country: 'FJ', name: 'Fiji', flag: '🇫🇯' },
    { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
    { code: '+241', country: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: '+220', country: 'GM', name: 'Gambia', flag: '🇬🇲' },
    { code: '+995', country: 'GE', name: 'Georgia', flag: '🇬🇪' },
    { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: '+233', country: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: '+30', country: 'GR', name: 'Greece', flag: '🇬🇷' },
    { code: '+1', country: 'GD', name: 'Grenada', flag: '🇬🇩' },
    { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+224', country: 'GN', name: 'Guinea', flag: '🇬🇳' },
    { code: '+245', country: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+592', country: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { code: '+509', country: 'HT', name: 'Haiti', flag: '🇭🇹' },
    { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
    { code: '+852', country: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', country: 'HU', name: 'Hungary', flag: '🇭🇺' },
    { code: '+354', country: 'IS', name: 'Iceland', flag: '🇮🇸' },
    { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
    { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+98', country: 'IR', name: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'IQ', name: 'Iraq', flag: '🇮🇶' },
    { code: '+353', country: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' },
    { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: '+1', country: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: '+962', country: 'JO', name: 'Jordan', flag: '🇯🇴' },
    { code: '+7', country: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: '+686', country: 'KI', name: 'Kiribati', flag: '🇰🇮' },
    { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+996', country: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+856', country: 'LA', name: 'Laos', flag: '🇱🇦' },
    { code: '+371', country: 'LV', name: 'Latvia', flag: '🇱🇻' },
    { code: '+961', country: 'LB', name: 'Lebanon', flag: '🇱🇧' },
    { code: '+231', country: 'LR', name: 'Liberia', flag: '🇱🇷' },
    { code: '+218', country: 'LY', name: 'Libya', flag: '🇱🇾' },
    { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+370', country: 'LT', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+352', country: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: '+853', country: 'MO', name: 'Macau', flag: '🇲🇴' },
    { code: '+389', country: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
    { code: '+261', country: 'MG', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', country: 'MW', name: 'Malawi', flag: '🇲🇼' },
    { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+960', country: 'MV', name: 'Maldives', flag: '🇲🇻' },
    { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: '+356', country: 'MT', name: 'Malta', flag: '🇲🇹' },
    { code: '+692', country: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+222', country: 'MR', name: 'Mauritania', flag: '🇲🇷' },
    { code: '+230', country: 'MU', name: 'Mauritius', flag: '🇲🇺' },
    { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: '+691', country: 'FM', name: 'Micronesia', flag: '🇫🇲' },
    { code: '+373', country: 'MD', name: 'Moldova', flag: '🇲🇩' },
    { code: '+377', country: 'MC', name: 'Monaco', flag: '🇲🇨' },
    { code: '+976', country: 'MN', name: 'Mongolia', flag: '🇲🇳' },
    { code: '+382', country: 'ME', name: 'Montenegro', flag: '🇲🇪' },
    { code: '+212', country: 'MA', name: 'Morocco', flag: '🇲🇦' },
    { code: '+258', country: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+95', country: 'MM', name: 'Myanmar', flag: '🇲🇲' },
    { code: '+264', country: 'NA', name: 'Namibia', flag: '🇳🇦' },
    { code: '+674', country: 'NR', name: 'Nauru', flag: '🇳🇷' },
    { code: '+977', country: 'NP', name: 'Nepal', flag: '🇳🇵' },
    { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
    { code: '+505', country: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+683', country: 'NU', name: 'Niue', flag: '🇳🇺' },
    { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
    { code: '+92', country: 'PK', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+680', country: 'PW', name: 'Palau', flag: '🇵🇼' },
    { code: '+970', country: 'PS', name: 'Palestine', flag: '🇵🇸' },
    { code: '+507', country: 'PA', name: 'Panama', flag: '🇵🇦' },
    { code: '+675', country: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', country: 'PE', name: 'Peru', flag: '🇵🇪' },
    { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: '+1', country: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
    { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: '+40', country: 'RO', name: 'Romania', flag: '🇷🇴' },
    { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: '+250', country: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+290', country: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
    { code: '+1', country: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
    { code: '+1', country: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
    { code: '+1', country: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
    { code: '+685', country: 'WS', name: 'Samoa', flag: '🇼🇸' },
    { code: '+378', country: 'SM', name: 'San Marino', flag: '🇸🇲' },
    { code: '+239', country: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+221', country: 'SN', name: 'Senegal', flag: '🇸🇳' },
    { code: '+381', country: 'RS', name: 'Serbia', flag: '🇷🇸' },
    { code: '+248', country: 'SC', name: 'Seychelles', flag: '🇸🇨' },
    { code: '+232', country: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: '+421', country: 'SK', name: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', country: 'SI', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+677', country: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+252', country: 'SO', name: 'Somalia', flag: '🇸🇴' },
    { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: '+211', country: 'SS', name: 'South Sudan', flag: '🇸🇸' },
    { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+249', country: 'SD', name: 'Sudan', flag: '🇸🇩' },
    { code: '+597', country: 'SR', name: 'Suriname', flag: '🇸🇷' },
    { code: '+268', country: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
    { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+963', country: 'SY', name: 'Syria', flag: '🇸🇾' },
    { code: '+886', country: 'TW', name: 'Taiwan', flag: '🇹🇼' },
    { code: '+992', country: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
    { code: '+255', country: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+66', country: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: '+676', country: 'TO', name: 'Tonga', flag: '🇹🇴' },
    { code: '+1', country: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
    { code: '+216', country: 'TN', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: '+993', country: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+1', country: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
    { code: '+688', country: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
    { code: '+256', country: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+971', country: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
    { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+998', country: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+678', country: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
    { code: '+379', country: 'VA', name: 'Vatican City', flag: '🇻🇦' },
    { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+84', country: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+681', country: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+967', country: 'YE', name: 'Yemen', flag: '🇾🇪' },
    { code: '+260', country: 'ZM', name: 'Zambia', flag: '🇿🇲' },
    { code: '+263', country: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' }
];

export const BASED_ON_LANG = {
    0: 'he',
    1: 'en',
    2: 'fr',
    3: 'es',
    4: 'de',
    5: 'ru',
    6: 'ja',
    7: 'ro',
    8: 'ar',
    9: 'hu',
    10: 'sk',
    11: 'pt',
    12: 'nl',
    13: 'it',
    14: 'pl'
}

export const reCAPTCHAKey = "6LeJkBorAAAAAC1q2G6fGQqIr-GuqSEF3L91AsT9";

export const defaultAccountExtraData = [
    { "FirstName": "common.first_name" },
    { "LastName": "common.last_name" },
    { "Email": "common.email" },
    { "Telephone": "common.telephone" },
    { "Cellphone": "common.cellphone" },
    { "Address": "common.address" },
    { "City": "common.city" },
    { "Company": "common.company" },
    { "BirthDate": "common.birth_date" },
    { "ReminderDate": "common.reminder_date" },
    { "Country": "common.country" },
    { "State": "common.state" },
    { "Zip": "common.zip" }
];

export const defaultAccountExtraDataLandingPage = [
    ...defaultAccountExtraData,
    { "ExtraDate1": 'common.ExtraDate1' },
    { "ExtraDate2": 'common.ExtraDate2' },
    { "ExtraDate3": 'common.ExtraDate3' },
    { "ExtraDate4": 'common.ExtraDate4' },
    { "ExtraField1": 'common.ExtraField1' },
    { "ExtraField2": 'common.ExtraField2' },
    { "ExtraField3": 'common.ExtraField3' },
    { "ExtraField4": 'common.ExtraField4' },
    { "ExtraField5": 'common.ExtraField5' },
    { "ExtraField6": 'common.ExtraField6' },
    { "ExtraField7": 'common.ExtraField7' },
    { "ExtraField8": 'common.ExtraField8' },
    { "ExtraField9": 'common.ExtraField9' },
    { "ExtraField10": 'common.ExtraField10' },
    { "ExtraField11": 'common.ExtraField11' },
    { "ExtraField12": 'common.ExtraField12' },
    { "ExtraField13": 'common.ExtraField13' },
];
export const CloudFlareSiteKey = "0x4AAAAAABhTv-JeJLm06IFU";

export const TIER_PLANS = [
    {
        id: 1,
        title: 'billing.tier.plans.starter.title',
        description: 'billing.tier.plans.starter.description',
        price: 'billing.tier.plans.starter.price',
        priceDescription: 'billing.tier.plans.starter.priceDescription',
        subtext: 'billing.tier.plans.starter.subtext',
        recipientLimit: 'billing.tier.plans.starter.recipientLimit',
        buttonText: 'billing.tier.plans.starter.buttonText',
        buttonVariant: 'outlined',
        features: [
            '',
            'billing.tier.features.emailCampaigns',
            'billing.tier.features.smsMarketing',
            'billing.tier.features.whatsappMarketing',
            'billing.tier.features.pushNotifications',
            'billing.tier.features.basicReports',
            'billing.tier.features.multipleIntegrations',
            'billing.tier.features.chatEmailSupport',
        ],
        isPopular: false,
    },
    {
        id: 2,
        title: 'billing.tier.plans.flow.title',
        description: 'billing.tier.plans.flow.description',
        price: 'billing.tier.plans.flow.price',
        priceDescription: 'billing.tier.plans.flow.priceDescription',
        subtext: 'billing.tier.plans.flow.subtext',
        recipientLimit: 'billing.tier.plans.flow.recipientLimit',
        buttonText: 'billing.tier.plans.flow.buttonText',
        buttonVariant: 'outlined',
        features: [
            'billing.tier.features.everythingInStarter',
            'billing.tier.features.automationsUnlimited',
            'billing.tier.features.landingPagesUnlimited',
            'billing.tier.features.smartSegmentations',
            'billing.tier.features.pageViewTracking',
            'billing.tier.features.abTesting',
            'billing.tier.features.surveySystem',
            'billing.tier.features.apiAccess',
        ],
        isPopular: false,
    },
    {
        id: 3,
        title: 'billing.tier.plans.engage.title',
        description: 'billing.tier.plans.engage.description',
        price: 'billing.tier.plans.engage.price',
        priceDescription: 'billing.tier.plans.engage.priceDescription',
        subtext: 'billing.tier.plans.engage.subtext',
        recipientLimit: 'billing.tier.plans.engage.recipientLimit',
        buttonText: 'billing.tier.plans.engage.buttonText',
        buttonVariant: 'contained',
        features: [
            'billing.tier.features.everythingInFlow',
            'billing.tier.features.ecommerceAutomationTriggers',
            'billing.tier.features.ecommerceSegmentations',
            'billing.tier.features.productCatalogIntegration',
            'billing.tier.features.measureRoi',
            'billing.tier.features.smsWhatsappChatbot',
            'billing.tier.features.subaccountsCreation',
            'billing.tier.features.manageUsersPermissions',
            'billing.tier.features.phoneSupport',
            'billing.tier.features.dynamicProducts'
        ],
        isPopular: true,
    },
    {
        id: 4,
        title: 'billing.tier.plans.scale.title',
        description: 'billing.tier.plans.scale.description',
        price: 'billing.tier.plans.scale.price',
        priceDescription: '/month',
        subtext: 'billing.tier.plans.scale.subtext',
        recipientLimit: 'billing.tier.plans.scale.recipientLimit',
        buttonText: 'billing.tier.plans.scale.buttonText',
        buttonVariant: 'outlined',
        features: [
            'billing.tier.features.everythingInEngage',
            'billing.tier.features.highVolumeSending',
            'billing.tier.features.customDevelopments',
            'billing.tier.features.customReports',
            'billing.tier.features.dedicatedAccountManager',
            'billing.tier.features.prioritySupport',
            'billing.tier.features.scheduledTrainingSessions',
        ],
        isPopular: false,
    },
];

export const TierFeatures = {
  "EMAIL_BASIC": "billing.featureNames.EMAIL_BASIC",
  "SMS_BASIC": "billing.featureNames.SMS_BASIC",
  "WHATSAPP_BASIC": "billing.featureNames.WHATSAPP_BASIC",
  "WEB_PUSH": "billing.featureNames.WEB_PUSH",
  "BASIC_REPORTS": "billing.featureNames.BASIC_REPORTS",
  "CHAT_EMAIL_SUPPORT": "billing.featureNames.CHAT_EMAIL_SUPPORT",
  "NEWSLETTER_TEMPLATES": "billing.featureNames.NEWSLETTER_TEMPLATES",
  "BASIC_PERSONALIZATION": "billing.featureNames.BASIC_PERSONALIZATION",
  "SMS_CLICK_TRACKING": "billing.featureNames.SMS_CLICK_TRACKING",
  "WHATSAPP_TEMPLATES": "billing.featureNames.WHATSAPP_TEMPLATES",
  "LANDING_PAGE_EDITOR": "billing.featureNames.LANDING_PAGE_EDITOR",
  "LANDING_PAGE_MANAGEMENT": "billing.featureNames.LANDING_PAGE_MANAGEMENT",
  "AUTOMATION_TEMPLATES": "billing.featureNames.AUTOMATION_TEMPLATES",
  "BASIC_TRIGGERS": "billing.featureNames.BASIC_TRIGGERS",
  "GROUP_MANAGEMENT": "billing.featureNames.GROUP_MANAGEMENT",
  "DATE_TRIGGER": "billing.featureNames.DATE_TRIGGER",
  "BASIC_AB_TESTING": "billing.featureNames.BASIC_AB_TESTING",
  "WHATSAPP_MEDIA_ATTACHMENT": "billing.featureNames.WHATSAPP_MEDIA_ATTACHMENT",
  "WHATSAPP_BUTTON_ATTACHMENT": "billing.featureNames.WHATSAPP_BUTTON_ATTACHMENT",
  "WHATSAPP_CARD_MESSAGE": "billing.featureNames.WHATSAPP_CARD_MESSAGE",
  "WHATSAPP_TEMPLATE_MANAGEMENT": "billing.featureNames.WHATSAPP_TEMPLATE_MANAGEMENT",
  "WHATSAPP_CAMPAIGN_SEND": "billing.featureNames.WHATSAPP_CAMPAIGN_SEND",
  "WHATSAPP_RESPONSE_REPORT": "billing.featureNames.WHATSAPP_RESPONSE_REPORT",
  "WHATSAPP_REPORT": "billing.featureNames.WHATSAPP_REPORT",
  "WHATSAPP_CHAT_INTERFACE": "billing.featureNames.WHATSAPP_CHAT_INTERFACE",
  "SMS_RESPONSE_REPORT": "billing.featureNames.SMS_RESPONSE_REPORT",
  "SMS_REPORT": "billing.featureNames.SMS_REPORT",
  "SMS_BASIC_PERSONALIZATION": "billing.featureNames.SMS_BASIC_PERSONALIZATION",
  "AUTOMATION_UNLIMITED": "billing.featureNames.AUTOMATION_UNLIMITED",
  "LANDING_PAGES_UNLIMITED": "billing.featureNames.LANDING_PAGES_UNLIMITED",
  "DYNAMIC_GROUPS": "billing.featureNames.DYNAMIC_GROUPS",
  "SITE_TRACKING": "billing.featureNames.SITE_TRACKING",
  "API_ACCESS": "billing.featureNames.API_ACCESS",
  "EMAIL_AUTORESPONDER": "billing.featureNames.EMAIL_AUTORESPONDER",
  "ADVANCED_AB_TESTING": "billing.featureNames.ADVANCED_AB_TESTING",
  "FILE_ATTACHMENT": "billing.featureNames.FILE_ATTACHMENT",
  "PURCHASE_TRIGGER": "billing.featureNames.PURCHASE_TRIGGER",
  "CART_ABANDONMENT": "billing.featureNames.CART_ABANDONMENT",
  "LANDING_PAGE_TRIGGER": "billing.featureNames.LANDING_PAGE_TRIGGER",
  "REVENUE_TRACKING": "billing.featureNames.REVENUE_TRACKING",
  "SUBACCOUNTS": "billing.featureNames.SUBACCOUNTS",
  "USER_PERMISSIONS": "billing.featureNames.USER_PERMISSIONS",
  "SMART_SEGMENTATION": "billing.featureNames.SMART_SEGMENTATION",
  "MESSAGE_TRIGGERS": "billing.featureNames.MESSAGE_TRIGGERS",
  "COUPON_MANAGEMENT": "billing.featureNames.COUPON_MANAGEMENT",
  "WEBHOOKS": "billing.featureNames.WEBHOOKS",
  "DYNAMIC_PRODUCTS": "billing.featureNames.DYNAMIC_PRODUCTS",
  "WHATSAPP_DYNAMIC_PRODUCTS": "billing.featureNames.WHATSAPP_DYNAMIC_PRODUCTS",
  "CATALOG_INTEGRATION": "billing.featureNames.CATALOG_INTEGRATION",
  "AMP_EMAIL": "billing.featureNames.AMP_EMAIL",
  "CHATBOT": "billing.featureNames.CHATBOT",
  "SURVEY_SYSTEM": "billing.featureNames.SURVEY_SYSTEM",
  "PHONE_SUPPORT": "billing.featureNames.PHONE_SUPPORT",
  "ACCOUNT_MANAGER": "billing.featureNames.ACCOUNT_MANAGER",
  "SMS_DYNAMIC_PRODUCTS": "billing.featureNames.SMS_DYNAMIC_PRODUCTS",
  "SEND_WEBHOOK_AUTOMATION": "billing.featureNames.SEND_WEBHOOK_AUTOMATION",
  "AI_PRODUCT_RECOMMENDATIONS": "billing.featureNames.AI_PRODUCT_RECOMMENDATIONS",
  "HIGH_VOLUME_SENDING": "billing.featureNames.HIGH_VOLUME_SENDING",
  "CUSTOM_DEVELOPMENT": "billing.featureNames.CUSTOM_DEVELOPMENT",
  "DEDICATED_ACCOUNT_MANAGER": "billing.featureNames.DEDICATED_ACCOUNT_MANAGER",
  "PRIORITY_SUPPORT": "billing.featureNames.PRIORITY_SUPPORT",
  "TRAINING_SESSIONS": "billing.featureNames.TRAINING_SESSIONS",
  "AI_AUTOMATION_BUILDER": "billing.featureNames.AI_AUTOMATION_BUILDER",
  "AI_EMAIL_DESIGNER": "billing.featureNames.AI_EMAIL_DESIGNER",
  "OPEN_IMAGE_SENDING": "billing.featureNames.OPEN_IMAGE_SENDING",
  "OTP_SMS": "billing.featureNames.OTP_SMS",
  "AI_COPYWRITER": "billing.featureNames.AI_COPYWRITER",
  "MMS_MESSAGING": "billing.featureNames.MMS_MESSAGING",
  "VOICE_CONVERSION": "billing.featureNames.VOICE_CONVERSION",
  "FLASH_SMS": "billing.featureNames.FLASH_SMS",
  "MAIL2SMS": "billing.featureNames.MAIL2SMS",
  "AI_LANDING_PAGE_DESIGNER": "billing.featureNames.AI_LANDING_PAGE_DESIGNER",
  "RCS_MESSAGING": "billing.featureNames.RCS_MESSAGING",
  "KOSHER_SEND": "billing.featureNames.KOSHER_SEND"
}


export const CLOSE_BUTTON_HTML = "<div ID='PulseemCloseButton' data-color='#000000' data-bgcolor='#fee6e6' data-Size='20' data-Position='Right'>X</div>"