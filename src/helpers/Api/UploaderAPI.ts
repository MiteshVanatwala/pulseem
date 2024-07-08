import axios from 'axios'
import { getCookie, setCookie } from '../Functions/cookies';
import { apiURL, actionURL, isProdMode } from '../../config/index'

const refreshTokenURL = `${actionURL}RefreshToken.ashx`

const redirectToLogin = () => {
    window.location.href = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true'
}

const uploaderInstance = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    timeout: 900000
})

uploaderInstance.interceptors.request.use(async (config: any) => {
    try {
        const jtoken = getCookie('jtoken')
        let token = jtoken
        if (isProdMode) {
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

uploaderInstance.interceptors.response.use(
    res => res,
    error => {
        if (error.response.status === 401) {
            redirectToLogin()
        }
        return Promise.reject(error.response.data)
    })

export { uploaderInstance }