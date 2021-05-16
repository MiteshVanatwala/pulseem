import axios from 'axios'
import jwt_decode from "jwt-decode";
import {getCookie,setCookie} from './functions';
import moment from 'moment'

const refreshTokenURL='https://www.pulseemdev.co.il/Pulseem/RefreshToken.ashx'

const instence=axios.create({
  baseURL: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  headers: {
    //APIKey: 's6phvaT3dhKeSU3YYU0DjA==',
    //APIKey: 'FWA/dIsLUdj/nbSnZUFB2A==',
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

instence.interceptors.request.use(async config => {
  try {
    const minimumTimeToUpdate=60
    const jtoken=getCookie('jtoken')
    const sessionId=getCookie('ASP.NET_SessionId')
    const pulseemId=getCookie('.Pulseem')
    const jwt=jwt_decode(jtoken)
    const currentUnix=moment().unix()
    const timeToExpires=jwt.exp-currentUnix
    const language='he-IL'
    if(timeToExpires<minimumTimeToUpdate) {
      const {data}=await axios.get(refreshTokenURL,{
        headers: {
          language
        }
      })
    }

  } catch(err) {

  }

})

export default instence