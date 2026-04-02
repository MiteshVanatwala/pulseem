import { MdDomain } from "react-icons/md";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Box, Button, Typography } from "@material-ui/core";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";

const DoubleOptInSettingsExplanationPopUp = ({ classes, isOpen, onClose, redirectButton }: any) => {
    const { t } = useTranslation();

    return <BaseDialog
        customContainerStyle={classes.summaryContainer}
        disableBackdropClick={false}
        classes={classes}
        icon={<MdDomain className={classes.notifyIconWhite} />}
        open={isOpen}
        showDefaultButtons={false}
        title={t("settings.accountSettings.optIn.explanationButton")}
        children={<Box className={clsx(classes.fullWidth)}>
            <Box className='selectWrapper'>
                <Typography
                    className={classes.alignDir}>
                    {RenderHtml(t("settings.accountSettings.optIn.explanationPopUp"))}
                </Typography>
            </Box>
            <Box className={classes.mt25} style={{ textAlign: 'center' }}>
                {!redirectButton && <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded,
                        "saveFixedDetails"
                    )}
                    onClick={() => { onClose() }}>{t('common.close')}
                </Button>}
            </Box>
            {redirectButton && redirectButton}
        </Box>}
        onClose={() => {
            onClose && onClose();
        }}
        onCancel={() => {
            onClose && onClose();
        }}
    />
}
export default DoubleOptInSettingsExplanationPopUp;