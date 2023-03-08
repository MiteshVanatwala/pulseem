import { Box, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { Dialog } from "../../../components/managment/Dialog";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import useCore from "../../../helpers/hooks/Core";

const GenericModal = ({
  modalData,
  isOpen = false
}) => {
  const { t } = useTranslation();
  const { classes } = useCore();
  return !isOpen ? (<></>) :
    (
      <BaseDialog
        customContainerStyle={classes.dialogZindex}
        open={isOpen}
        title={t(modalData.title)}
        icon={<div className={classes.dialogIconContent}>
          {modalData.icon}
        </div>}
        cancelText="common.No"
        confirmText="common.Yes"
        disableBackdropClick={true}
        showDivider={true}
        onClose={modalData.onClose}
        onCancel={modalData.onCancel}
        onConfirm={modalData.onConfirm}
        reduceTitle
        showDefaultButtons={modalData.showDefaultButtons}
        renderButtons={modalData.renderButtons}
      >
        <Box className={classes.dialogBox}>
          <Typography>{RenderHtml(t(modalData.message))}</Typography>
        </Box>
      </BaseDialog>
    );
}

export default GenericModal;
