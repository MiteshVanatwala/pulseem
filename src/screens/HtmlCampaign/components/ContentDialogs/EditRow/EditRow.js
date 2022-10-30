import React from 'react'
import { TextInput } from '../../TextInput'
import { SolidDialog } from '../../../../../components/managment/SolidDialog';
import { useTranslation } from "react-i18next";

const EditRow = ({ onClose, save, args, classes }) => {
  const { t } = useTranslation();
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
        title={t("common.createOrEdit")}
        cancelText='common.cancel'
        confirmText='common.save'
        showDefaultButtons={true}
        onConfirm={onHandleSave}
        onClose={onClose}
        children={
          <>
            <div style={{ width: '100%', display: 'inline-block', position: 'relative', padding: '5px' }}>
              <TextInput 
                value={text} 
                onChange={handleTextChange}
                placeholder={t("common.templateName")} />
            </div>
          </>
        }
      >
      </SolidDialog>
    </>
  )
}

export default EditRow
