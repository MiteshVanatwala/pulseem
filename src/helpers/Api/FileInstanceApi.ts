import axios from 'axios'
import { apiURL } from '../../config/index'

const FileInstanceApi = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    },
    timeout: 900000
})


FileInstanceApi.interceptors.response.use(
    res => res,
    error => {
        if (error.response.status === 401) {
            throw error.response.status;
        }
        return Promise.reject(error.response.data)
    })



export { FileInstanceApi }
