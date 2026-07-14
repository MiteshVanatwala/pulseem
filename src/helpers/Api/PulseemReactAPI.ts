import axios from 'axios'
import i18n from '../../i18n'
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

let isForcedLogoutInProgress = false;

function showForcedLogoutOverlay(message: string): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;padding:32px 40px;border-radius:8px;max-width:480px;text-align:center;font-size:16px;line-height:1.5;color:#333;box-shadow:0 4px 24px rgba(0,0,0,0.18);';
    box.textContent = message;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

const isDeletedUserResponse = (data: any): boolean =>
    data?.success === false && data?.errorCode === 'USER_DELETED';

const handleDeletedUserResponse = (rejectedWith: any): Promise<never> => {
    if (!isForcedLogoutInProgress) {
        isForcedLogoutInProgress = true;
        showForcedLogoutOverlay(i18n.t('SubUsers.userDeletedSessionEnded'));
        logout();
    }
    return Promise.reject(rejectedWith);
};

PulseemReactInstance.interceptors.response.use(
    (res) => {
        if (isDeletedUserResponse(res?.data)) {
            return handleDeletedUserResponse(res.data);
        }
        return res;
    },
    (error) => {
        if (isDeletedUserResponse(error)) {
            return handleDeletedUserResponse(error);
        }
        return Promise.reject(error);
    }
);

export { PulseemReactInstance }
