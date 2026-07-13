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
    } catch (err) {
    } finally {
        setCookie('jtoken', '')
        setCookie('accountFeatures', '');
        setCookie('accountSettings', '');
        setCookie('ignoreTerm', '');
        redirectToLogin()
    }
}

const PulseemReactInstance = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    },
    timeout: 300000
})

let refreshPromise: Promise<string> | null = null;

PulseemReactInstance.interceptors.request.use(async (config: any) => {
    try {
        const jtoken = getCookie('jtoken')
        let token = jtoken
        if (isProdMode && !NoAuthenticationAPIs.some(word => (config?.url || '').includes(word))) {
            if (!jtoken) {
                redirectToLogin()
                return Promise.reject('Unautorized')
            }
            if (!refreshPromise) {
                const language = getCookie('Culture')
                refreshPromise = axios.get(refreshTokenURL, {
                    headers: { language },
                    withCredentials: true
                }).then(({ data, request }) => {
                    const sessionExpired =
                        request.responseURL.includes('Login.aspx') ||
                        !request.responseURL.startsWith(new URL(refreshTokenURL).origin)
                    if (sessionExpired) {
                        redirectToLogin()
                        return Promise.reject('Session expired')
                    }
                    setCookie('jtoken', data)
                    return data
                }).finally(() => {
                    refreshPromise = null
                })
            }
            token = await refreshPromise
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
