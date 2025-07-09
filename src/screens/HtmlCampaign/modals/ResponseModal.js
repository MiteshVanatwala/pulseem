import clsx from "clsx";
import { Box, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import {
  CheckAnimation
} from '../../../assets/images/settings/index'
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { RiSendPlaneFill } from "react-icons/ri";
import { RenderHtml } from "../../../helpers/Utils/HtmlUtils";
import { DialogType } from "../helper/Config";

const ResponseModal = ({
  classes,
  isOpen = false,
  onClose,
  message,
  onConfirm = () => null
}) => {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (message) {
      case DialogType.PAYMENT_PROCESSING:
        return t('campaigns.newsLetterEditor.errors.paymentfailed554Title');
      default:
        return t('common.ErrorOccured');
    }
  };

  return !isOpen ? (<></>) :
    (
      <BaseDialog
        classes={classes}
        customContainerStyle={classes.dialogZindex}
        open={isOpen}
        title={getTitle()}
        icon={<div className={classes.dialogIconContent}>
          {message !== 'campaigns.successSent' ? (
            <AiOutlineExclamationCircle
              style={{ fontSize: 30, color: "#fff" }} />
          )
            :
            (<RiSendPlaneFill />)
          }
        </div>}
        showDivider={message !== 'campaigns.successSent'}
        onClose={onClose}
        onCancel={onClose}
        onConfirm={onClose}
        onCancel={onClose}
        contentStyle={classes.testSendDialog}
        reduceTitle
        confirmText="common.Ok"
        showDefaultButtons={false}
      >
        {message !== 'campaigns.successSent' ? (
          <Box className={clsx(classes.contentBox, classes.mt10, classes.mb25)}>
            {RenderHtml(t(message))}
          </Box>) :
          (
            <Box className={classes.dialogBox} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <img src={CheckAnimation} alt="Checkmark animation" />
              <Typography>{t(message)}</Typography>
            </Box>
          )
        }
        <Box className={classes.mb25} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.middle,
            )}
            onClick={() => { onConfirm() }}>
            {t("common.Ok")}
          </Button>
        </Box>
      </BaseDialog>
    );
}

export default ResponseModal;
