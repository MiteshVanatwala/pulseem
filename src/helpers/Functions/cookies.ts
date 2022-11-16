import Cookies from 'universal-cookie';
const cookies = new Cookies()

export const setCookie = (name: string = '', value: string, options = {}) => {
    cookies.set(name, value, { path: '/', ...options })
}

export const getCookie = (name = '', options = {}) => {
    return cookies.get(name, options)
}

export const cookieListener = (callback = () => null) => {
    cookies.addChangeListener(callback)
}