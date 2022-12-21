import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineExclamationCircle } from 'react-icons/ai'

const ConfirmationDialog = ({ classes, count = 0 }) => {
    const { t } = useTranslation()
    return {
        title: t('mainReport.summary'),
        showDivider: true,
        disableBackdropClick: true,
        icon: (
            <AiOutlineExclamationCircle
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Box>
                <Typography className={classes.f18}>
                    {count} sent
                </Typography>
            </Box>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Yes"),
        cancelText: '',
        // onClose: () => { history.push("/SMSCampaigns"); },
        // onCancel: () => { setDialogType(null) },
        // onConfirm: () => { onSaveSettings(true, "exit") }
    }
}

export default ConfirmationDialog