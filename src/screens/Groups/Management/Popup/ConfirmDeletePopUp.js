import PropTypes from 'prop-types';
import clsx from "clsx";
import {
    Typography,
    Box
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

const ConfirmDeletePopUp = ({ classes, isOpen = false, onClose, windowSize, handleDeleteGroup }) => {

    const { t } = useTranslation();

    return (
        <BaseDialog
            classes={classes}
            open={isOpen}
            title={t("group.delete")}
            icon={<Box className={classes.dialogAlertIcon}>
                !
            </Box>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => handleDeleteGroup()}
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box>
                <Typography variant="subtitle1">
                    {t("group.deleteConfirm")}
                </Typography>
            </Box>
        </BaseDialog>
    );
};

ConfirmDeletePopUp.propTypes = {
    classes: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    windowSize: PropTypes.string.isRequired,
    handleDeleteGroup: PropTypes.func.isRequired
}

export default ConfirmDeletePopUp;
