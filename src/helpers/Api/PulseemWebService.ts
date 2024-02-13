import axios from 'axios'
import { actionURL } from '../../config/index'

const pulseemBaseUrl = `${actionURL}`

const PulseemWSInstance = axios.create({
    baseURL: pulseemBaseUrl,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        dataType: "json"
    },
    timeout: 300000
})

PulseemWSInstance.defaults.withCredentials = true;
//PulseemWSInstance.defaults.credentials = 'include';

PulseemWSInstance.interceptors.response.use(
    res => res,
    error => {
        if (error.response.status === 401) {
            throw error.response.status;
        }
        return Promise.reject(error.response.data)
    })


export { PulseemWSInstance }
