import React from 'react';
import clsx from 'clsx';
import {
  Typography, Divider, Grid, Button, Dialog as BaseDialog, Paper, Box
} from '@material-ui/core'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { AlertIcon } from '../icons/index'

export const Dialog = ({
  childrenPadding = true,
  classes,
  open = false,
  title = '',
  icon = null,
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
        {props.exit ? null : <Box
          onClick={onExit}
          className={clsx(
            classes.dialogExitButton,
            {
              [classes.dialogExitButtonRTL]: isRTL,
              [classes.dialogExitButtonLTR]: !isRTL
            }
          )}>
          x
        </Box>}  </>

    )
  }

  const renderTitleDefault = () => {
    return (
      <>
        <Typography className={clsx(classes.dialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)}>
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
              classes.dialogCancelButton
            )}>
            {t(cancelText)}
          </Button>
        </Grid>
      </Grid>
    )
  }

  const renderIcon = () => {
    const alertIcon = <AlertIcon classes={classes} />
    return (
      <Box
        className={clsx(
          classes.dialogIconContainer,
          {
            [classes.dialogIconContainerRTL]: isRTL,
            [classes.dialogIconContainerLTR]: !isRTL
          }
        )}>
        {icon || alertIcon}
      </Box>
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
        className={clsx(classes.dialogContent, contentStyle)}>
        {renderTitle ? renderTitle() : renderTitleDefault()}
        {renderChildren()}
        {renderButtons ? renderButtons() : renderButtonsDefault()}
      </Box>
    )
  }

  return (
    <BaseDialog
      disableBackdropClick={disableBackdropClick}
      open={!!open}
      className={clsx(classes.dialogContainer, customContainerStyle)}
      onClose={onClose}>
      <Paper className={clsx(classes.posRelative, paperStyle)}>
        {renderExitButton()}
        {renderContent()}
        {renderIcon()}
      </Paper>
    </BaseDialog>
  )
}