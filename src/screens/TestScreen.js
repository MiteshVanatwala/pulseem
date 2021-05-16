import {Button} from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import {getCookie} from '../helpers/functions';


const TestScreen=({classes}) => {

  const getRefreshKey=async () => {
    const sessionId=getCookie('ASP.NET_SessionId')
    const pulseemId=getCookie('.Pulseem')
    const jtoken=getCookie('jtoken')
    console.log('sessionId',sessionId)
    console.log('pulseemId',pulseemId)
    console.log('jtoken',jtoken)
    const language='he-IL'

    const cookie=`ASP.NET_SessionId=${sessionId};.Pulseem=${pulseemId}`

    const res=await axios.get('https://www.pulseemdev.co.il/Pulseem/RefreshToken.ashx',{
      withCredentials: true,
      headers: {
        '$cookie': cookie,
        language
      }
    })

    console.log('Response',res)
  }

  return (
    <Button
      onClick={getRefreshKey}
    >
      TRY
    </Button>
  )
}

export default TestScreen