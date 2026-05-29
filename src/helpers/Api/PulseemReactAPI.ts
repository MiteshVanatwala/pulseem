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
        if (isProdMode && !NoAuthenticationAPIs.some(word => (config?.url || '').includes(word))) {
            if (!jtoken) {
                redirectToLogin()
                return Promise.reject('Unautorized')
            }
            const language = getCookie('Culture')
            const { data, request } = await axios.get(refreshTokenURL, {
                headers: {
                    language
                },
                withCredentials: true
            })
            // Firefox normalises responseURL differently than Chrome (trailing slashes,
            // ASP.NET internal rewrites), so avoid strict equality. Instead detect a
            // genuine session-expired redirect by checking for the login page path or
            // a response that left the expected origin entirely.
            console.log('[PulseemReactAPI] RefreshToken URL check:', {
                expected: refreshTokenURL,
                received: request.responseURL,
                matched: refreshTokenURL === request.responseURL
            })
            const sessionExpired =
                request.responseURL.includes('Login.aspx') ||
                !request.responseURL.startsWith(new URL(refreshTokenURL).origin)
            if (sessionExpired) {
                console.warn('[PulseemReactAPI] Session expired — redirecting to login. responseURL:', request.responseURL)
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
