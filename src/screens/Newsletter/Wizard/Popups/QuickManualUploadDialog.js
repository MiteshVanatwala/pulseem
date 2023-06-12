import { Box, Typography } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog"

const QuickManualUploadDialog = ({ classes: classes, onCancel = () => null, onClose = () => null, onConfirm = () => null }) => {

    const { t } = useTranslation()
    const currentDialog = {
        title: t('common.Notice'),
        showDivider: true,
        icon: (
            <div className={classes.dialogIconContent}>
                {'\u0056'}
            </div>
        ),
        content: (
            <Box className={classes.dialogBox}>
                <Typography>{t("campaigns.newsLetterSendSettings.quickMsgCautionMsg")}</Typography>
                <Typography>{t("campaigns.newsLetterSendSettings.doYouWantToContinue")}</Typography>
            </Box>
        ),
        showDefaultButtons: true,
        onClose: onClose || onCancel,
        onCancel: onCancel || onClose,
        onConfirm: onConfirm
    }

    return <>
        <BaseDialog
            classes={classes}
            open={true}
            {...currentDialog}>
            {currentDialog.content}
        </BaseDialog>
    </>
}
export default QuickManualUploadDialog