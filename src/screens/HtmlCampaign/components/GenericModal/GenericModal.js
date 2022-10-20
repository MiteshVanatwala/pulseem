import React from 'react'
import Modal from 'react-modal'

const modalStyles = {
  wrapper: {
    position: 'relative'
  },
  modalWindow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    padding: 0,
    zIndex: 40,
    width: '620px !important'
  },
  rounded: {
    borderRadius: '8px !important'
  },
  square: {
    borderRadius: '0!important'
  },
  titleBar: {
    borderBottom: '1px solid #eee',
    minHeight: 30,
    lineHeight: 35,
    '& div': {
      padding: ' 5px 11px',
      margin: '10px!important',
      fontSize: 21,
      display: 'inline-block',
      fontWeight: 'normal'
    }
  },
  close: {
    float: 'right',
    width: 50,
    cursor: 'pointer',
    backgroundColor: '#909496'
  },
  content: {
    padding: 20,
    height: '100% !important'
  },
  overlay: {
    backgroundColor: 'rgba(255, 111, 97, .25)',
    fontWeight: '600',
    textTransform: 'none',
    color: 'white',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    height: 'auto',
    background: '#FFF',
    border: '0px',
    color: '#000',
    fontSize: '16px',
    padding: '10px',
    display: 'relative',
    width: '600px',
  }
}

const GenericModal = (props) => {
  const {
    isOpen,
    hasTitleBar,
    onClose,
    content,
    isRounded,
    children,
  } = props

  const onHandleClose = () => {
    onClose()
  }

  const Widget = () => content

  return (
    <Modal
      isOpen={isOpen}
      appElement={document.querySelector('body')}
      className={`${modalStyles.modalWindow
        } ${isRounded ? modalStyles.rounded : modalStyles.square
        }`}
      style={{
        ...modalStyles,
        content: {
          ...modalStyles.content
        }
      }}
    >
      <div
        className={modalStyles.wrapper}
        style={modalStyles.wrapper}
      >
        {hasTitleBar && (
          <div className={modalStyles.titleBar}>
            <button className={modalStyles.close} onClick={onHandleClose}>
              X
            </button>
          </div>
        )}
        <div
          className={modalStyles.content}
          style={modalStyles.content}
        >
          {children}
          <Widget {...props} />
        </div>
      </div>
    </Modal>
  )
}

export default GenericModal
