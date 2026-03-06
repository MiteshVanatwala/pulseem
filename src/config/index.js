// import dotenv from "dotenv";
// dotenv.config();

const apiURL = process.env.REACT_APP_API_URL;
const isProdMode = process.env.REACT_APP_MODE === "PROD";
const actionURL = isProdMode
  ? `https://${window.location.hostname}/Pulseem/`
  : process.env.REACT_APP_ACTION_URL;
const siteTrackingURL = process.env.REACT_APP_TRACKING_URL;
const siteTrackingScriptUrl = process.env.REACT_APP_TRACKING_SCRIPT;
const sitePrefix = process.env.REACT_APP_SITE_PREFIX;
const UIApiSwaggerURL = process.env.REACT_APP_UI_API_SWAGGER_URL;
const DirectApiSwaggerURL = process.env.REACT_APP_DIRECT_API_SWAGGER_URL;
const SharedEmailDomain = 'pulseem.co'
const loginURL = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true';
const tawkToPropertyId = process.env.REACT_APP_TAWK_TO_PROPERTY_ID;

export {
  apiURL,
  actionURL,
  isProdMode,
  sitePrefix,
  siteTrackingURL,
  //demoSiteTrackingURL,
  siteTrackingScriptUrl,
  UIApiSwaggerURL,
  DirectApiSwaggerURL,
  SharedEmailDomain,
  loginURL,
  tawkToPropertyId
};
