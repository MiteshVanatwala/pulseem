import { useTranslation } from "react-i18next";
import { Grid, Button, Box } from '@material-ui/core'
import { BsTrash } from "react-icons/bs";
import { RiSendPlaneFill } from 'react-icons/ri'

const TopEditor = ({
  classes,
  onSave = () => null,
  onDelete = () => null
}) => {
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid item xs={12} justifyContent="flex-end">
        <Box>
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
          <Button onClick={() => onSave()}>{t("common.saveTemplate")}</Button>
          <Button onClick={() => onSave()}>
            <RiSendPlaneFill style={{ fontSize: "25" }} />
          </Button>
          <Button onClick={() => onSave(true)}>{t('notifications.saveAndContinue')}</Button>
        </Box>

      </Grid>
    </Grid>
  );
}

export default  TopEditor;
