import dotenv from 'dotenv';
dotenv.config();
const {
  REACT_APP_API_URL: apiURL,
  REACT_APP_ACTION_URL: actionURL,
  REACT_APP_MODE
}=process.env;

const isProdMode=REACT_APP_MODE!=='DEV'

export {
  apiURL,
  actionURL,
  isProdMode
}