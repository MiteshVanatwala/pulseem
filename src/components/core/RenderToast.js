import React, { useEffect, useState } from 'react'
import Toast from '../Toast/Toast.component';

const RenderToast = ({ toastMessage = null, time = 3000 }) => {

    const [message, setMessage] = useState(null);

    const cancelToast = () => setTimeout(() => {
        setMessage(null)
    }, time)

    useEffect(() => {
        setMessage(toastMessage)
        cancelToast()
    }, [toastMessage])

    return message && <Toast data={message} />

}

export default React.memo(RenderToast)