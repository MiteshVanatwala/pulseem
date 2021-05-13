import axios from 'axios'
import Cookies from 'universal-cookie';

const instence=axios.create({
  baseURL: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  headers: {
    //APIKey: 's6phvaT3dhKeSU3YYU0DjA==',
    APIKey: 'FWA/dIsLUdj/nbSnZUFB2A==',
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

//instence.interceptors.request.use(async config => {
//  try {
//    const cookies = new Cookies();
//    const token = cookies.get('jtoken')
//    const sessionId = cookies.get('ASP.NET_SessionId')
//    const pulseemId = cookies.get('.Pulseem')

//  } catch (err) {

//  }

//})

export default instence