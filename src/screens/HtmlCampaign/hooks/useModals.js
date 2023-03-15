import React, { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const useModals = () => {
  const [modals, setModals] = useState([])

  const setOpen = modalSettings => {
    setModals(prevModals => {
      return [...prevModals, modalSettings]
    })
  }
  const setClose = () => {
    setModals([])
  }

  const openModal = useCallback((Component, args, classes) => {
    return new Promise((resolve, reject) => {
      const close = () => {
        setClose()
        resolve({})
      }
      const save = (results) => {
        setClose()
        resolve({ ...results })
      }
      const modalSettings = {
        isOpen: true,
        hasTitleBar: true,
        content: <Component onClose={close} save={save} args={args} classes={classes} />,
        close,
        save,
        key: uuidv4()
      }
      setOpen(modalSettings)
    }).catch(error => console.log(error))
  }, [])

  return { openModal, modals }
}

export default useModals
