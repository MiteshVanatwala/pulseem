import {Button} from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import Cookies from 'universal-cookie';

const TestScreen=({classes}) => {

  const getRefreshKey=async () => {
    //const sessionId='j4kzdovf4k142a0oqyeh5yxx'
    //const pulseemId='C9081576BB1BCB5CC33220EE6EB016799C48B4E323619FCDF826D79405FC86976A52DB23C6DA0D4FD1A27910A83F05198F3BE826CA5B3BED660CC6F1454D64B6EC216BEC25905D592CC4B365FDA6D2CA35A56FED194FDC5EBFD350FEFA32F943F1216A6AE064896CA2222792F852E95B440A4620C2750A7F62E8B67CFB3AD92AD9D9515964289CB0B71BDC107024EABD'
    const cookies=new Cookies();
    //const token = cookies.get('jtoken')
    const sessionId=cookies.get('ASP.NET_SessionId')
    const pulseemId=cookies.get('.Pulseem')
    const jtoken=cookies.get('jtoken')
    const allCookies=cookies.getAll()
    console.log('sessionId',sessionId)
    console.log('pulseemId',pulseemId)
    console.log("jtoken",jtoken)
    console.log("All Cookies",allCookies)
    const language='he-IL'

    const cookie=`ASP.NET_SessionId=${sessionId};.Pulseem=${pulseemId}`

    const res=await axios.get('https://www.pulseemdev.co.il/Pulseem/RefreshToken.ashx',{
      withCredentials: true,
      headers: {
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