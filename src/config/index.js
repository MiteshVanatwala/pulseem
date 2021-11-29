import dotenv from 'dotenv';
dotenv.config();

const apiURL = process.env.REACT_APP_API_URL; 
const isProdMode=process.env.REACT_APP_MODE==='PROD';
const actionURL = isProdMode? `https://${window.location.hostname}/Pulseem/` : process.env.REACT_APP_ACTION_URL;
const siteTrackingURL = process.env.SITE_TRACKING_API_URL

export {
  apiURL,
  actionURL,
  isProdMode,
  siteTrackingURL
}