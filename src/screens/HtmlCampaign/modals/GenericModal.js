import clsx from "clsx";
import { Box, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { RiSendPlaneFill } from 'react-icons/ri'
import "moment/locale/he";
import { Dialog } from "../../../components/managment/Dialog";

const GenericModal = ({
  classes,
  modalData,
  isOpen = false
}) => {
  const { t } = useTranslation();
  return !isOpen ? (<></>) :
  (
    <Dialog
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
      showDivider={true}
      onClose={modalData.onClose}
      onCancel={modalData.onCancel}
      onConfirm={modalData.onConfirm}
      reduceTitle
      showDefaultButtons={true}
    >
      <Box className={classes.dialogBox}>
        <Typography>{t(modalData.message)}</Typography>
      </Box>
    </Dialog>
  );
}

export default GenericModal;
