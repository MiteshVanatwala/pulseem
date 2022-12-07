import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { AiOutlineExclamationCircle } from 'react-icons/ai'


const SmsMarketingDialog = ({ classes, onClose = () => null, onCancel = () => null, onConfirm = () => null }) => {
    const { t } = useTranslation();
    return {
        title: t("campaigns.newsLetterEditor.sendSettings.smsMarketing"),
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
                    SmsMarketingDialog
                </Typography>
            </Box>
        ),
        showDefaultButtons: true,
        confirmText: t("common.Yes"),
        cancelText: '',
        onClose: onClose,
        onCancel: onCancel,
        onConfirm: onConfirm
    }
}

export default SmsMarketingDialog