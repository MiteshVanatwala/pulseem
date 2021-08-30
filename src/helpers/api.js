import axios from 'axios'
import {getCookie,setCookie} from './cookies';
import {apiURL,actionURL,isProdMode} from '../config/index'

const refreshTokenURL=`${actionURL}RefreshToken.ashx`
const logoutURL=`${actionURL}LogoutSession.ashx`
const pulseemBaseUrl = `${actionURL}`

const redirectToLogin=() => {
  window.location.href='/Pulseem/Login.aspx?ReturnUrl=/Pulseem/homepage.aspx?fromreact=true'
}

let lastRequest = Date.now();

export const logout=async () => {
  try {
    await axios.get(logoutURL)
    setCookie('jtoken','')
    redirectToLogin()
  } catch(err) {
    console.log("logout error",err)
  }
}

const instence=axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  },
  timeout: 300000
})

const customInstance = axios.create({
  baseURL: pulseemBaseUrl,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    dataType: "json"
  },
  timeout: 300000
})

customInstance.defaults.withCredentials = true;
customInstance.defaults.credentials = 'include';

instence.interceptors.request.use(async config => {
  try {
    const sourceDateMin = new Date(lastRequest).getMinutes();
    const currentDateMin = new Date().getMinutes();

    console.log(currentDateMin - sourceDateMin);

    const jtoken=getCookie('jtoken')
    let token=jtoken
    if(isProdMode) {
      if(!jtoken) {
        redirectToLogin()
        return Promise.reject('Unautorized')
      }
      const language=getCookie('Culture');

      if(currentDateMin - sourceDateMin > 5){
        lastRequest = Date.now();
      }
      else {
        const {data,request}=await axios.get(refreshTokenURL,{
          headers: {
            language
          }
        })
        if(refreshTokenURL!==request.responseURL) {
          redirectToLogin()
          return Promise.reject('Unautorized')
        }
        token=data
        setCookie('jtoken',token)
      }
      
    }
    config.headers.Authorization=`Bearer ${token}`
    return config
  } catch(err) {
    redirectToLogin()
  }
})

instence.interceptors.response.use(
  res => res,
  error => {
    if(error.response.status===401) {
      redirectToLogin()
    }
    return Promise.reject(error.response.data)
  })

  customInstance.interceptors.response.use(
    res => res,
    error => {
      if(error.response.status===401) {
        throw error.response.status;
      }
      return Promise.reject(error.response.data)
    })

export { instence, customInstance }