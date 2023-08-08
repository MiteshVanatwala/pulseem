import React from 'react';
import clsx from 'clsx';
import {
  Typography, Divider, Grid, Button, Dialog as BaseDialog, Paper, Box
} from '@material-ui/core'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from '../../assets/images/managment/index'
import { ManagmentIcon } from '../../components/managment/index'

export const SolidDialog = ({
  childrenPadding = true,
  classes,
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
  cancelText = 'common.No',
  confirmText = 'common.Yes',
  showDefaultButtons = true,
  style = null,
  footerText = null,
  ...props
}) => {
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }

  const { t } = useTranslation()
  const { isRTL, windowSize } = useSelector(state => state.core)
  const { exit = null, maxHeight = null } = props;

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
        {props.exit ? null : <Box
          onClick={onExit}
          className={clsx(
            classes.solidDialogExitButton
          )}>
          <ManagmentIcon
            classes={classes}
            icon={CloseIcon}
          />

        </Box>}  </>

    )
  }

  const renderTitleDefault = () => {
    return (
      <>
        <Typography className={clsx(classes.title, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)}>
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
        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
        <Grid item>
          <Button
            variant='contained'
            size='small'
            onClick={onConfirm}
            className={clsx(
              classes.solidDialogButton,
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
              classes.solidDialogButton,
              classes.dialogCancelButton
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
        className={clsx(classes.dialogChildren, classes.sidebar, childrenStyle)}
        style={{ maxHeight: props.maxHeight ? props.maxHeight : windowSize !== 'sm' && windowSize !== 'xs' ? 'calc(65vh)' : 'calc(45vh)', minWidth: windowSize !== 'xs' && windowSize !== 'sm' ? 330 : null }}>
        {children}
      </Box>)
  }

  const renderContent = () => {
    return (
      <Box
        dir={direction[isRTL]}
        className={clsx(classes.solidDialog, contentStyle)}>
        <Box className={'title'}>
          {renderTitle ? renderTitle() : renderTitleDefault()}
        </Box>
        {renderChildren()}
        {renderButtons ? renderButtons() : renderButtonsDefault()}
        {footerText ? footerText() : null}
      </Box>
    )
  }

  return (
    <BaseDialog
      classes={classes}
      style={style ?? null}
      open={!!open}
      className={clsx(classes.solidDialogContainer, customContainerStyle)}
      onCancel={onClose}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' || !disableBackdropClick) {
          onClose();
        }
      }
      }>
      <Paper className={clsx(classes.posRelative, paperStyle)}>
        {renderExitButton()}
        {renderContent()}
      </Paper>
    </BaseDialog>
  )
}