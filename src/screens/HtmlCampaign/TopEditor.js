import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { RiSendPlaneFill } from 'react-icons/ri'
import { BiSave } from 'react-icons/bi'

const TopEditor = ({
  classes,
  onSave = () => null,
  onDelete = () => null,
  onTestSend = () => null
}) => {
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid item xs={12} justifyContent="flex-end">
        <Box>
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
          >{t("common.saveTemplate")}
          </Button>
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
          <Button onClick={() => onSave(true)}>{t('notifications.saveAndContinue')}</Button>
        </Box>

      </Grid>
    </Grid>
  );
}

export default TopEditor;
