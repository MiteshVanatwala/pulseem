import axios from 'axios'
import jwt_decode from "jwt-decode";
import { getCookie, setCookie } from './cookies';

import moment from 'moment'

const BaseURL = {
  DEV: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  LOCAL: 'http://api.develop.com/api',
  HOME: 'http://siteapi.pulseem.com/api/'
};

const SelectedBaseURL = BaseURL.LOCAL;

// const refreshTokenURL = 'http://localhost:60326/RefreshToken.ashx'
const refreshTokenURL = 'https://www.pulseemdev.co.il/Pulseem/RefreshToken.ashx'

const redirectToLogin = () => {
  window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/homepage.aspx'
}

const instence = axios.create({
  baseURL: SelectedBaseURL,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

instence.interceptors.request.use(async config => {
  try {
    const minimumTimeToUpdate = 60
    const jtoken = getCookie('jtoken')
    let token = jtoken
    if (jtoken) {
      const jwt = jwt_decode(jtoken)
      const currentUnix = moment().unix()
      const timeToExpires = jwt.exp - currentUnix
      if (timeToExpires < minimumTimeToUpdate) {
        const language = getCookie('Culture')
        const { data, request } = await axios.get(refreshTokenURL, {
          headers: {
            language
          }
        })
        if (refreshTokenURL !== request.responseURL) {
          redirectToLogin()
          return Promise.reject('Unautorized')
        }
        token = data
        setCookie('jtoken', token)
      }
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (err) {
    redirectToLogin()
  }
})

export default instence
export { SelectedBaseURL }