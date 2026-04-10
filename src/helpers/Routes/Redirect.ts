import { useNavigate } from "react-router-dom";
import { RedirectPropTypes } from '../Types/Redirect';
import { sitePrefix } from '../../config';

const LEGACY_FRAME_ROUTE_BY_ASPX: Record<string, string> = {
    'autosendplans.aspx': 'AutoSendPlans',
    'smssmartresponses.aspx': 'SMSSmartResponses',
    'mmscampaignedit.aspx': 'CreateMmsCampaign',
    'landingpagewizard.aspx': 'Survey',
    'formtemplates.aspx': 'FormTemplates',
    'clalreport.aspx': 'ClalReport',
    'accountreport.aspx': 'AccountReport',
    'emailautoreports.aspx': 'EmailAutoReports',
    'removedstats.aspx': 'RemovedStats',
    'directemailreport.aspx': 'DirectEmailReport',
    'emailcampaignstatistics.aspx': 'EmailCampaignStatistics',
    'createautomations.aspx': 'CreateAutomations',
    'accountbilling.aspx': 'AccountBilling',
    'accountusersreport.aspx': 'AccountUsersReport',
    'extrafieldsdefinition.aspx': 'ExtraFieldsDefinition',
};

const normalizeLegacyFrameUrl = (url: string) => {
    if (!url) return url;
    const prefix = sitePrefix || '/';

    // Already a React route.
    if (url.startsWith(prefix)) return url;

    // Match "/Pulseem/<Page>.aspx?...", including absolute URLs.
    const match = url.match(/\/pulseem\/([^/?#]+\.aspx)(\?[^#]*)?/i);
    if (!match) return url;

    const aspxPage = (match[1] || '').toLowerCase();
    const reactRoute = LEGACY_FRAME_ROUTE_BY_ASPX[aspxPage];
    if (!reactRoute) return url;

    const query = match[2] || '';
    return `${prefix}${reactRoute}${query}`;
};

const useRedirect = () => {
    const navigate = useNavigate();

    const Redirect = (RedirectProps: RedirectPropTypes) => {
        let { url = "", openNewTab = false, preventRedirect = false } = RedirectProps;
        url = normalizeLegacyFrameUrl(url);
        //const arrUrl = window.location.pathname.split('/');
        //let parentPath = arrUrl.splice(0, arrUrl.length - 1).join('/');
        const shouldRefrefshed = (window.location.pathname?.toLowerCase() === url.toLowerCase() || window.location.pathname?.toLowerCase() === url.toLowerCase());
        if (openNewTab) {
            window.open(url);
            return false;
        }
        if (url.toLowerCase().indexOf("aspx") > -1 || url.toLowerCase().indexOf('/pulseem/') > -1 || (preventRedirect === false && shouldRefrefshed)) {
            window.location.href = url;
        } else {
            navigate(url);
        }
    };

    return Redirect;
};

export default useRedirect;