import axios from 'axios'
import jwt_decode from "jwt-decode";
import Cookies from 'universal-cookie';
import moment from 'moment'

const refreshTokenURL='https://www.pulseemdev.co.il/Pulseem/RefreshToken.ashx'

const redirectToLogin=() => {
  //window.location.href='/Pulseem/Login.aspx?ReturnUrl=/Pulseem/homepage.aspx'
}

const instence=axios.create({
  baseURL: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

instence.interceptors.request.use(async config => {
  try {
    const cookies=new Cookies()
    const minimumTimeToUpdate=60
    const jtoken=cookies.get('jtoken')
    let token=jtoken
    if(jtoken) {
      const jwt=jwt_decode(jtoken)
      const currentUnix=moment().unix()
      const timeToExpires=jwt.exp-currentUnix
      if(timeToExpires<minimumTimeToUpdate) {
        const language=cookies.get('Culture')
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
        cookies.set('jtoken',token)
      }
    }
    config.headers.Authorization=`Bearer ${token}`
    return config
  } catch(err) {
    redirectToLogin()
  }

})

export default instence