import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { RiSendPlaneFill } from 'react-icons/ri'
import { BiSave } from 'react-icons/bi'
import { useSelector } from 'react-redux';

const TopEditor = ({
  classes,
  onSave = () => null,
  onDelete = () => null,
  onTestSend = () => null
}) => {
  const { t } = useTranslation();
  const { isRTL } = useSelector(state => state.core);
  return (
    <Grid container>
      <Grid item xs={12} style={{ textAlign: isRTL ? 'left' : 'right' }}>
        <Button
          variant='contained'
          size='medium'
          className={clsx(
            classes.actionButton,
            classes.actionButtonOutlinedRed
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
            classes.actionButtonLightBlue,
            classes.backButton
          )}
          style={{ margin: '8px' }}
          color="primary"
        >{t('notifications.saveAndContinue')}</Button>
      </Grid>
    </Grid>
  );
}

export default TopEditor;
