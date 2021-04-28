import axios from 'axios'

const instence=axios.create({
  baseURL: 'https://pulseemsiteapi4react.pulseemdev.co.il/api/',
  headers: {
    APIKey: 's6phvaT3dhKeSU3YYU0DjA==',
    //APIKey: 'FWA/dIsLUdj/nbSnZUFB2A==',
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

export default instence