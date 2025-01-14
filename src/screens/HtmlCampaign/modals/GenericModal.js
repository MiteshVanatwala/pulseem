import { Box, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";

const GenericModal = ({
  classes,
  modalData,
  isOpen = false
}) => {
  const { t } = useTranslation();
  return !isOpen ? (<></>) :
    (
      <BaseDialog
        classes={classes}
        customContainerStyle={classes.dialogZindex}
        open={isOpen}
        title={t(modalData.title)}
        icon={<div className={classes.dialogIconContent}>
          {modalData.icon}
        </div>}
        cancelText="common.No"
        confirmText="common.Yes"
        disableBackdropClick={true}
        showDivider={false}
        onClose={modalData.onClose}
        onCancel={modalData.onCancel}
        onConfirm={modalData.onConfirm}
        reduceTitle
        showDefaultButtons={modalData.showDefaultButtons}
        renderButtons={modalData.renderButtons}
      >
        {modalData?.content !== null ? <>{modalData?.content}</> : <Box className={classes.dialogBox}>
          <Typography>{RenderHtml(t(modalData.message))}</Typography>
        </Box>}

      </BaseDialog>
    );
}

export default GenericModal;
