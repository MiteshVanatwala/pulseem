import axios from 'axios'
import { getCookie, setCookie } from '../Functions/cookies';
import { apiURL, actionURL, isProdMode } from '../../config/index'
import { NoAuthenticationAPIs } from '../Constants';

const refreshTokenURL = `${actionURL}RefreshToken.ashx`
const logoutURL = `${actionURL}LogoutSession.ashx`

const redirectToLogin = () => {
    window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true'
}

export const logout = async () => {
    try {
        await axios.get(logoutURL)
        setCookie('jtoken', '')
        setCookie('accountFeatures', '');
        setCookie('accountSettings', '');
        setCookie('ignoreTerm', '');
        redirectToLogin()
    } catch (err) {
        console.log("logout error", err)
    }
}

const PulseemReactInstance = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    },
    timeout: 300000
})

PulseemReactInstance.interceptors.request.use(async (config: any) => {
    try {
        const jtoken = getCookie('jtoken')
        let token = jtoken
        if (isProdMode && NoAuthenticationAPIs.indexOf(config?.url || '') === -1) {
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

PulseemReactInstance.interceptors.response.use(
    res => res,
    error => {
        if (error.response.status === 401) {
            redirectToLogin()
        }
        return Promise.reject(error.response.data)
    })


export { PulseemReactInstance }
