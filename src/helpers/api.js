import axios from 'axios'
import { getCookie, setCookie } from './cookies';
import { apiURL, actionURL, isProdMode, siteTrackingURL } from '../config/index'
import { ClearPageState } from './UI/SessionStorageManager'

const refreshTokenURL = `${actionURL}RefreshToken.ashx`
const logoutURL = `${actionURL}LogoutSession.ashx`
const pulseemBaseUrl = `${actionURL}`
const eventsBaseUrl = `${siteTrackingURL}`
const alertPages = ['campaigns/editor'];

const redirectToLogin = () => {
  let showAlertBeforeLogout = false;
  alertPages.forEach((page) => {
    if (window.location.pathname.toLowerCase().includes(page)) {
      showAlertBeforeLogout = true;
    }
  });

  if (!showAlertBeforeLogout) {
    window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true'
  }
  else {
    let alertEvent = new Event('setAlert');
    document.dispatchEvent(alertEvent);
  }
}

export const logout = async () => {
  try {
    await axios.get(logoutURL)
    setCookie('jtoken', '')
    setCookie('accountFeatures', '');
    setCookie('accountSettings', '');
    setCookie('isClal', '');
    ClearPageState();
    redirectToLogin()
  } catch (err) {
    console.log("logout error", err)
  }
}

const uploaderInstance = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  timeout: 900000
})

const instence = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  },
  timeout: 900000
})

const customInstance = axios.create({
  baseURL: pulseemBaseUrl,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    dataType: "json"
  },
  timeout: 900000
})

customInstance.defaults.withCredentials = true;
customInstance.defaults.credentials = 'include';

const eventsInstance = axios.create({
  baseURL: eventsBaseUrl,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    dataType: "json"
  },
  timeout: 600000
});

// eventsInstance.defaults.withCredentials = true;
// eventsInstance.defaults.credentials = 'include';

instence.interceptors.request.use(async config => {
  try {
    const jtoken = getCookie('jtoken')
    let token = jtoken
    if (isProdMode) {
      if (!jtoken) {
        redirectToLogin()
        return Promise.reject('Unautorized')
      }
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
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (err) {
    redirectToLogin()
  }
})

instence.interceptors.response.use(
  res => res,
  error => {
    if (error.response.status === 401) {
      redirectToLogin()
    }
    return Promise.reject(error.response.data)
  })

customInstance.interceptors.response.use(
  res => res,
  error => {
    if (error.response.status === 401) {
      throw error.response.status;
    }
    return Promise.reject(error.response.data)
  })

eventsInstance.interceptors.request.use(async config => {
  try {
    const jtoken = getCookie('jtoken')
    let token = jtoken
    if (isProdMode) {
      if (!jtoken) {
        redirectToLogin()
        return Promise.reject('Unautorized')
      }
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
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (err) {
    redirectToLogin()
  }
})
eventsInstance.interceptors.response.use(
  res => res,
  error => {
    if (error.response.status === 401) {
      throw error.response.status;
    }
    return Promise.reject(error.response.data)
  })

uploaderInstance.interceptors.request.use(async config => {
  try {
    const jtoken = getCookie('jtoken')
    let token = jtoken
    if (isProdMode) {
      if (!jtoken) {
        redirectToLogin()
        return Promise.reject('Unautorized')
      }
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
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (err) {
    redirectToLogin()
  }
})

uploaderInstance.interceptors.response.use(
  res => res,
  error => {
    if (error.response.status === 401) {
      redirectToLogin()
    }
    return Promise.reject(error.response.data)
  })


export { instence, customInstance, eventsInstance, uploaderInstance }
