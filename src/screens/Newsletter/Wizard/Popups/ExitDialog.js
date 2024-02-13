import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineExclamationCircle } from 'react-icons/ai'

const ExitDialog = ({ classes: classes, onCancel = () => null, onClose = () => null, onConfirm = () => null }) => {

    const { t } = useTranslation()
    return {
        title: t('mainReport.handleExitTitle'),
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Box>
                <Typography className={classes.f18}>{t("mainReport.leaveCampaign")}</Typography>
            </Box>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Yes"),
        cancelText: t("common.No"),
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default ExitDialog