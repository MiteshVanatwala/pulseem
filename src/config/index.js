import dotenv from 'dotenv';
dotenv.config();
const {
  REACT_APP_API_URL: apiURL,
  REACT_APP_ACTION_URL: actionURL
}=process.env;

export {
  apiURL,
  actionURL
}