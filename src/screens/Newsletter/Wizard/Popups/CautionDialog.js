import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

const CautionDialog = ({ classes, onCancel = () => null, onClose = () => null, onConfirm = () => null, renderHtml = () => null }) => {

    const { t } = useTranslation()
    return {
        title: t('common.Notice'),
        showDivider: true,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\u0056'}
            </div>
        ),
        content: (
            <Box className={classes.dialogBox}>
                <Typography>{renderHtml(t("sms.reset_manual_upload_notice"))}</Typography>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose || onCancel,
        onCancel: onCancel || onClose,
        onConfirm: onConfirm
    }
}

export default CautionDialog