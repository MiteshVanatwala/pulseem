// import dotenv from "dotenv";
// dotenv.config();

const apiURL = process.env.REACT_APP_API_URL;
const isProdMode = process.env.REACT_APP_MODE === "PROD";
const actionURL = isProdMode
  ? `https://${window.location.hostname}/Pulseem/`
  : process.env.REACT_APP_ACTION_URL;
const iframeURL = `${window.location.origin}/Pulseem/`;
const siteTrackingURL = process.env.REACT_APP_TRACKING_URL;
const siteTrackingScriptUrl = process.env.REACT_APP_TRACKING_SCRIPT;
const sitePrefix = process.env.REACT_APP_SITE_PREFIX;
const UIApiSwaggerURL = process.env.REACT_APP_UI_API_SWAGGER_URL;
const DirectApiSwaggerURL = process.env.REACT_APP_DIRECT_API_SWAGGER_URL;
const SharedEmailDomain = 'pulseem.co'
const loginURL = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true';
const tawkToPropertyId = process.env.REACT_APP_TAWK_TO_PROPERTY_ID;

// Where the chat widget runtime is hosted. This goes into the embed snippet
// customers paste into their own sites, so a stage build must not hand out the
// production bundle — otherwise stage widgets run production JS against the
// stage API. Falls back to the production CDN when unset.
const widgetCdnURL = (process.env.REACT_APP_WIDGET_CDN_URL || 'https://cdn.pulseem.com/widget/v1').replace(/\/$/, '');

export {
  apiURL,
  actionURL,
  iframeURL,
  isProdMode,
  sitePrefix,
  siteTrackingURL,
  //demoSiteTrackingURL,
  siteTrackingScriptUrl,
  UIApiSwaggerURL,
  DirectApiSwaggerURL,
  SharedEmailDomain,
  loginURL,
  tawkToPropertyId,
  widgetCdnURL
};
