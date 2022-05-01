import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { RiSendPlaneFill } from 'react-icons/ri'
import { BiSave } from 'react-icons/bi'
import { useSelector } from 'react-redux';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md'

const EditorActions = ({
  classes,
  innerStyle,
  onSave = () => null,
  onExit = () => null,
  onBack = () => null,
  onDelete = () => null,
  onTestSend = () => null
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector(state => state.core);
  return (
    <Grid container style={innerStyle}>
      <Grid item xs={12}>
        <Box className={clsx(classes.wizardButtonContainer)} style={{ paddingBottom: 40 }}>
          <Button onClick={onBack}
            variant='contained'
            size='medium'
            className={clsx(
              classes.actionButton,
              classes.actionButtonLightBlue,
              classes.backButton
            )}
            startIcon={!isRTL ? <MdOutlineKeyboardArrowLeft /> : <MdOutlineKeyboardArrowRight />}
            style={{ margin: '8px' }}
            color="primary"
          >{t('notifications.back')}</Button>
          <Box style={isRTL ? { marginRight: "auto" } : { marginLeft: "auto" }}>
            <Button
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonRed
              )}
              style={{ margin: '8px', padding: '9px 0' }}
              onClick={() => { onDelete() }}
            >
              <BsTrash style={{ fontSize: "25" }} />
            </Button>
            <Button
              variant='contained'
              size='medium'
              onClick={() => onTestSend()}
              style={{ margin: '8px', padding: '9px 0' }}
              className={clsx(classes.actionButton,
                classes.actionButtonOutlinedBlue)}>
              <RiSendPlaneFill style={{ fontSize: "25" }} />
            </Button>
            <Button
              onClick={() =>
                onExit()}
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightBlue,
                classes.backButton
              )}
              style={{ margin: '8px' }}
              color="primary"
            >{t("common.exit")}
            </Button>
            <Button
              onClick={() =>
                onSave()}
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightBlue,
                classes.backButton
              )}
              style={{ margin: '8px' }}
              startIcon={<BiSave />}
              color="primary"
            >{t("common.save")}
            </Button>
            <Button onClick={() => onSave(true)}
              variant='contained'
              size='medium'
              className={clsx(
                classes.actionButton,
                classes.actionButtonLightGreen,
                classes.backButton
              )}
              style={{ margin: '8px' }}
              color="primary"
            >{t('common.continue')}</Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default EditorActions;
