
import clsx from 'clsx';
import {
  Typography, Divider, Grid, Button, Dialog as BaseDialog, Paper, Box
} from '@material-ui/core'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

export const Dialog = ({
  classes,
  childrenPadding = true,
  open = false,
  title = '',
  children,
  showDivider = false,
  onClose = () => null,
  onCancel = null,
  onConfirm = () => null,
  renderButtons = null,
  renderTitle = null,
  disableBackdropClick = false,
  customContainerStyle = '',
  paperStyle = null,
  childrenStyle = null,
  contentStyle = null,
  cancelText = 'common.Cancel',
  confirmText = 'common.Ok',
  showDefaultButtons = true,
  style = null,
  reduceTitle = false,
  ChildrenStyle = null,
  ContentStyle = null,
  ...props
}) => {
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }

  const { t } = useTranslation()
  const { isRTL, windowSize } = useSelector(state => state.core)

  const onExit = () => {
    if (onCancel !== null) {
      onCancel();
    }
    else {
      onClose();
    }
  }

  const renderExitButton = () => {
    return (
      <>
        {props.exit ? props.exit : <Box
          onClick={onExit}
          className={clsx(classes.dialogExitButton, {
            [classes.dialogExitButtonRTL]: isRTL,
            [classes.dialogExitButtonLTR]: !isRTL,
          }
          )}>
          x
        </Box>}  </>

    )
  }

  const renderTitleDefault = () => {
    return (
      <>
        <Typography className={clsx(
          reduceTitle ? classes.reducedTitle : "",
          classes.dialogTitle,
          windowSize !== "xs" && windowSize !== "sm"
            ? classes.ellipsisText
            : null
        )}
        >
          {title}
        </Typography>
        {showDivider && <Divider />}
      </>
    )
  }

  const renderButtonsDefault = () => {
    return (
      showDefaultButtons && <Grid
        container
        spacing={4}
        className={clsx(
          classes.dialogButtonsContainer,
          isRTL ? classes.rowReverse : null
        )}
      >
        <Grid item>
          <Button
            name="btnConfirm"
            variant='contained'
            size='small'
            onClick={onConfirm}
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton
            )}>
            {t(confirmText)}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant='contained'
            size='small'
            onClick={onClose}
            className={clsx(
              classes.dialogButton,
              classes.dialogConfirmButton
            )}>
            {t(cancelText)}
          </Button>
        </Grid>
      </Grid>
    )
  }

  const renderChildren = () => {
    return (
      <Box
        className={clsx(classes.dialogChildren, ChildrenStyle)}
        style={{ maxHeight: props.maxHeight ? props.maxHeight : windowSize !== 'sm' && windowSize !== 'xs' ? 'calc(65vh)' : 'calc(45vh)', minWidth: windowSize !== 'xs' && windowSize !== 'sm' ? 330 : null }}>
        {children}
      </Box>)
  }

  const renderContent = () => {
    return (
      <Box
        dir={direction[isRTL]}
        className={clsx(classes.dialogContent, ContentStyle)}>
        {renderTitle ? renderTitle() : renderTitleDefault()}
        {renderChildren()}
        {renderButtons ? renderButtons() : renderButtonsDefault()}
      </Box>
    )
  }

  return (
    <BaseDialog
      classes={classes}
      style={style ?? null}
      open={!!open}
      className={clsx(classes.dialogContainer, customContainerStyle)}
      onCancel={onClose}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' || !disableBackdropClick) {
          onClose();
        }
      }
      }>
      <Paper className={clsx(classes.posRelative, paperStyle, classes.sidebar)}>
        {renderExitButton()}
        {renderContent()}
      </Paper>
    </BaseDialog>
  )
}