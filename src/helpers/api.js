import axios from 'axios'
import jwt_decode from "jwt-decode";
import {getCookie,setCookie} from './cookies';

import moment from 'moment'

// const refreshTokenURL = 'http://localhost:60326/RefreshToken.ashx'
const actionURL='https://www.pulseemdev.co.il/Pulseem/'
const refreshTokenURL=`${actionURL}RefreshToken.ashx`
const logoutURL=`${actionURL}LogoutSession.ashx`

const redirectToLogin=() => {
  window.location.href='/Pulseem/Login.aspx?ReturnUrl=/Pulseem/homepage.aspx'
}

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
  baseURL: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  //baseURL: 'http://siteapi.pulseem.com/api/',
  //baseURL: 'http://api.develop.com/api',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

instence.interceptors.request.use(async config => {
  try {
    const minimumTimeToUpdate=60
    const jtoken=getCookie('jtoken')
    let token=jtoken
    if(!jtoken) {
      redirectToLogin()
      return Promise.reject('Unautorized')
    }
    const jwt=jwt_decode(jtoken)
    const currentUnix=moment().unix()
    const timeToExpires=jwt.exp-currentUnix
    if(timeToExpires<minimumTimeToUpdate) {
      const language=getCookie('Culture')
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

export default instence