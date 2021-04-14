import axios from 'axios'

const instence=axios.create({
  baseURL: 'http://pulseemsiteapi4react.pulseemdev.co.il/api/',
  headers: {
    APIKey: 's6phvaT3dhKeSU3YYU0DjA==',
    'Content-Type': 'application/json; charset=UTF-8'
  }
})

export default instence