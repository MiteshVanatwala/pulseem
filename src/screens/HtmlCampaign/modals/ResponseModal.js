import clsx from "clsx";
import { Box, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import "moment/locale/he";
import {
  CheckAnimation
} from '../../../assets/images/settings/index'
import { useSelector } from "react-redux";
import { BaseDialog } from "../../../components/DialogTemplates/BaseDialog";

const ResponseModal = ({
  classes,
  isOpen = false,
  onClose,
  message,
  onConfirm = () => null
}) => {
  const { t } = useTranslation();
  const { windowSize, isRTL } = useSelector(state => state.core);

  return !isOpen ? (<></>) :
    (
      <BaseDialog
        classes={classes}
        customContainerStyle={classes.dialogZindex}
        open={isOpen}
        title={message !== 'campaigns.successSent' ? t('common.ErrorOccured') : null}
        showDivider={message !== 'campaigns.successSent'}
        onClose={onClose}
        onConfirm={onClose}
        onCancel={onClose}
        contentStyle={classes.testSendDialog}
        reduceTitle
        confirmText="common.Ok"
        showDefaultButtons={false}
      >
        {message !== 'campaigns.successSent' ? (
          <Box className={clsx(classes.contentBox, classes.mt10, classes.mb25)}>
            {t(message)}
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
            variant='contained'
            size='medium'
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton
            )}
            onClick={() => { onConfirm() }}>
            {t("common.Ok")}
          </Button>
        </Box>
      </BaseDialog>
    );
}

export default ResponseModal;
