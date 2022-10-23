import React from 'react'
import { TextInput } from '../../TextInput'
import { SolidDialog } from '../../../../../components/managment/SolidDialog';

const EditRow = ({ save, args, classes }) => {
  const [text, setText] = React.useState(args?.row?.name)

  const onHandleSave = React.useCallback(() => {
    save({
      success: true,
      name: text

    })
  }, [text, save])

  const handleTextChange = React.useCallback((event) => {
    setText(event?.target?.value)
  }, [])

  return (
    <>
      <SolidDialog
        classes={classes}
        key={123}
        disableBackdropClick={true}
        open={true}
        title={"edit row"}
        cancelText='common.cancel'
        confirmText='common.save'
        showDefaultButtons={true}
        onConfirm={onHandleSave}

        children={
          <>
            <div style={{ width: '100%', display: 'inline-block', position: 'relative', padding: '5px' }}>
              <TextInput value={text} onChange={handleTextChange} />
            </div>
          </>
        }
      >
      </SolidDialog>
    </>
  )
}

export default EditRow
