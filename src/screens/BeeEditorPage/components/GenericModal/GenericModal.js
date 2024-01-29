import Modal from 'react-modal'

const GenericModal = (props) => {
  const {
    isOpen,
    onClose,
    content,
    children,
  } = props

  const onHandleClose = () => {
    onClose()
  }

  const Widget = () => content

  return (
    <Modal
      style={{
        backgroundColor: 'transparent',
        overlay: {
          backgroundColor: 'transparent'
        },
        content: {
          border: 'none',
          backgroundColor: 'transparent'
        }
      }}
      isOpen={isOpen}
      appElement={document.querySelector('body')}
    >
      {children}
      <Widget
        {...props}
        onClose={() => {
          onHandleClose();
        }} />
    </Modal>
  )
}

export default GenericModal
