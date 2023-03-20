import clsx from "clsx";
import { Box, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import { FaExclamationCircle } from 'react-icons/fa'
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const renderHtml = (html) => {
  function createMarkup() {
    return { __html: html };
  }
  return (
    <label dangerouslySetInnerHTML={createMarkup()}></label>
  );
}

const NoCreditsModal = ({
  classes,
  onClose = () => null,
  isOpen = false
}) => {
  const { t } = useTranslation();
  return !isOpen ? (<></>) :
    (
      <BaseDialog
        classes={classes}
        customContainerStyle={classes.dialogZindex}
        open={isOpen}
        icon={<AiOutlineExclamationCircle
          style={{ fontSize: 30, color: "#fff" }}
        />}
        disableBackdropClick={true}
        showDivider={false}
        onClose={onClose}
        onCancel={onClose}
        onConfirm={onClose}
        reduceTitle
        showDefaultButtons={false}
      >
        <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <FaExclamationCircle style={{ fontSize: 100 }} />
          <Typography className={classes.mt4} style={{ fontWeight: 'bold' }}>{t("common.ErrorTitle")}</Typography>
          <Typography style={{ textAlign: 'center' }}>{renderHtml(t("sms.notEnoughCreditLeft"))}</Typography>
          <Typography style={{ textAlign: 'center' }}>{renderHtml(t("sms.notEnoughCreditLeftDesc"))}</Typography>
          <Box style={{ marginTop: 25 }}>
            <Button
              onClick={() => onClose()}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.middle,
              )}>
              {t("common.Ok")}
            </Button>
          </Box>
        </Box>
      </BaseDialog>
    );
}

export default NoCreditsModal;
