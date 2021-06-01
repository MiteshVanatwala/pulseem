import React from 'react';
import clsx from 'clsx';
import {
  Typography, Divider, Grid, Button, Dialog as BaseDialog, Paper, Box
} from '@material-ui/core'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { AlertIcon } from '../icons/index'

export const Dialog=({
  childrenPadding=true,
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
  disableBackdropClick = false,
  customContainerStyle = ''
}) => {
  const direction = {
    true: 'rtl',
    false: 'ltr'
  }

  const { t } = useTranslation()
  const { isRTL } = useSelector(state => state.core)

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
      <Box
        onClick={onExit}
        className={clsx(
          classes.dialogExitButton,
          {
            [classes.dialogExitButtonRTL]: isRTL,
            [classes.dialogExitButtonLTR]: !isRTL
          }
        )}>
        x
      </Box>
    )
  }

  const renderTitle = () => {
    return (
      <>
        <Typography className={classes.dialogTitle}>
          {title}
        </Typography>
        {showDivider && <Divider />}
      </>
    )
  }

  const renderButtonsDefault = () => {
    return (
      <Grid
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
            {t('common.Ok')}
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
            {t('common.Cancel')}
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
        className={classes.dialogChildren}
        style={{ maxHeight: 'calc(65vh)' }}>
        {children}
      </Box>)
  }

  const renderContent = () => {
    return (
      <Box
        dir={direction[isRTL]}
        className={clsx(classes.dialogContent)}>
        {renderTitle()}
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
      <Paper >
        {renderExitButton()}
        {renderContent()}
        {renderIcon()}
      </Paper>
    </BaseDialog>
  )
}