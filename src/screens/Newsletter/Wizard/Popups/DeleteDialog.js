import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineExclamationCircle } from 'react-icons/ai'

const DeleteDialog = ({ classes: classes, onCancel = () => null, onClose = () => null, onConfirm = () => null }) => {

    const { t } = useTranslation()
    return {
        title: t('mainReport.deleteCamp'),
        showDivider: true,
        confirmText: t("common.Yes"),
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Box className={classes.bodyTextDialog}>
                <Typography>
                    {t("mainReport.confirmSure")}
                </Typography>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose || onCancel,
        onCancel: onCancel || onClose,
        onConfirm: onConfirm
    }
}

export default DeleteDialog