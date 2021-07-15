import dotenv from 'dotenv';
dotenv.config();

const apiURL = process.env.REACT_APP_API_URL; 
const isProdMode=process.env.REACT_APP_MODE==='PROD';
const actionURL = isProdMode? `https://${window.location.hostname}/Pulseem/` : process.env.REACT_APP_ACTION_URL;

console.debug("apiURL", apiURL);

export {
  apiURL,
  actionURL,
  isProdMode
}