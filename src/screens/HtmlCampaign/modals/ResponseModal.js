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
import { useSelector } from "react-redux";

const ResponseModal = ({
  classes,
  isOpen = false,
  onClose,
  message,
  summaryData = null,
  onConfirm = () => null
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector(state => state.core);

  const EMAIL_STATUS_MAP = {
    '1': { key: 'common.Send', color: '#4caf50' },
    '2': { key: 'common.Removed', color: '#f44336' },
    '3': { key: 'common.restricted', color: '#ff9800' },
    '4': { key: 'common.invalid', color: '#f44336' },
    '5': { key: 'common.Pending', color: '#2196f3' },
  };

  const getTitle = () => {
    switch (message) {
      case DialogType.SUCCESS_SENT:
        return t('mainReport.testSend');
      case DialogType.PAYMENT_PROCESSING:
        return t('campaigns.newsLetterEditor.errors.paymentfailed552Title');
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
              <Typography variant='h6'>{t('common.emailStatus')}</Typography>
              {summaryData && summaryData.length > 0 && (
                <Box className={classes.testSendSummaryContainer}>
                  {summaryData.map((item) => {
                    const status = EMAIL_STATUS_MAP[String(item?.EmailStatus)] || EMAIL_STATUS_MAP['-1'];
                    return (
                      <Box key={item?.Email} className={classes.testSendSummaryRow} style={{textAlign: isRTL ? 'end' : 'start'}}>
                        <Typography variant="body2" className={classes.testSendSummaryEmail}>
                          {item?.Email}
                        </Typography>
                        <Typography variant="caption" style={{ color: status?.color }} className={classes.testSendSummaryStatus}>
                          {String(item?.EmailStatus) !== '1' && (
                            <span className={classes.testSendSummaryNotSent}>
                              {t('common.notSent')}
                            </span>
                          )}
                          {t(status?.key)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
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
