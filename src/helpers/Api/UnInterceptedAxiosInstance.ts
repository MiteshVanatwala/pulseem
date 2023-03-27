import axios from 'axios'
import { getCookie, setCookie } from '../Functions/cookies';
import { apiURL, actionURL } from '../../config/index'

const logoutURL = `${actionURL}LogoutSession.ashx`

const redirectToLogin = () => {
    window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true'
}

export const logout = async () => {
    try {
        await axios.get(logoutURL)
        setCookie('jtoken', '')
        redirectToLogin()
    } catch (err) {
        console.log("logout error", err)
    }
}

const UnInterceptedAxiosInstance = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    },
    timeout: 300000
})

UnInterceptedAxiosInstance.interceptors.request.use(async config => {
    try {
        const jtoken = getCookie('jtoken')
        config.headers.Authorization = `Bearer ${jtoken}`
        return config
    } catch (err) {
        redirectToLogin()
    }
})


export { UnInterceptedAxiosInstance }
