import clsx from "clsx";
import {
    Typography,
    Box
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";

const OverwriteTemplatePopUp = ({ classes, isOpen = false, onClose }: any) => {
    const { t } = useTranslation();

    return (
        <BaseDialog
            classes={classes}
            customContainerStyle={classes}
            open={isOpen}
            title={t("common.notice")}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => onClose(true)}
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box>
                <Typography variant="subtitle1">
                    {t("common.overwriteTemplate")}
                </Typography>
                <Typography variant="subtitle1">
                    {t("common.doYouWantToProceed")}
                </Typography>
            </Box>
        </BaseDialog>
    );
};

export default OverwriteTemplatePopUp;
