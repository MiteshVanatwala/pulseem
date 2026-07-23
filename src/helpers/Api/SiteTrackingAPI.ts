import axios from 'axios'
import { getCookie, setCookie } from '../Functions/cookies';
import { actionURL, isProdMode, siteTrackingURL } from '../../config/index'

const refreshTokenURL = `${actionURL}RefreshToken.ashx`
const logoutURL = `${actionURL}LogoutSession.ashx`
const eventsBaseUrl = `${siteTrackingURL}`

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

const SiteTrackingInstance = axios.create({
    baseURL: eventsBaseUrl,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        dataType: "json"
    },
    timeout: 300000
});

SiteTrackingInstance.interceptors.request.use(async (config: any) => {
    try {
        const jtoken = getCookie('jtoken')
        let token = jtoken
        if (isProdMode) {
            if (!jtoken) {
                logout()
                return Promise.reject('Unautorized')
            }
            const language = getCookie('Culture')
            const { data, request } = await axios.get(refreshTokenURL, {
                headers: {
                    language
                }
            })
            let isRedirected = false
            if (request.responseURL) {
                try {
                    const reqUrl = new URL(refreshTokenURL)
                    const respUrl = new URL(request.responseURL)
                    if (reqUrl.pathname.toLowerCase() !== respUrl.pathname.toLowerCase()) {
                        isRedirected = true
                    }
                } catch (e) {
                    if (refreshTokenURL !== request.responseURL) {
                        isRedirected = true
                    }
                }
            }
            if (isRedirected) {
                logout()
                return Promise.reject('Unautorized')
            }
            token = data
            setCookie('jtoken', token)
        }
        config.headers.Authorization = `Bearer ${token}`
        return config
    } catch (err) {
        logout()
    }
})
SiteTrackingInstance.interceptors.response.use(
    res => res,
    error => {
        if (error.response.status === 401) {
            throw error.response.status;
        }
        return Promise.reject(error.response.data)
    })

export { SiteTrackingInstance }