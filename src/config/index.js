import dotenv from "dotenv";
dotenv.config();

const apiURL = process.env.REACT_APP_API_URL;
const isProdMode = process.env.REACT_APP_MODE === "PROD";
const actionURL = isProdMode
  ? `https://${window.location.hostname}/Pulseem/`
  : process.env.REACT_APP_ACTION_URL;
const siteTrackingURL = process.env.REACT_APP_TRACKING_URL;
const siteTrackingScriptUrl = process.env.REACT_APP_TRACKING_SCRIPT;
const SharedEmailDomain = 'pulseem.co'

export {
  apiURL,
  actionURL,
  isProdMode,
  siteTrackingURL, 
  //demoSiteTrackingURL,
  siteTrackingScriptUrl,
  SharedEmailDomain
};
