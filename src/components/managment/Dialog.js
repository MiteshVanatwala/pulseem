import React from 'react';
import clsx from 'clsx';
import {
  Typography,Divider,Grid,Button,Dialog as BaseDialog,Paper,Box
} from '@material-ui/core'
import {useSelector} from 'react-redux'
import {useTranslation} from 'react-i18next'

export const Dialog=({
  classes,
  open=false,
  title='',
  icon=null,
  children,
  showDivider=false,
  onClose=() => null,
  onConfirm=() => null,
  renderButtons=null
}) => {
  const direction={
    true: 'rtl',
    false: 'ltr'
  }
  const {t}=useTranslation()
  const {isRTL}=useSelector(state => state.core)
  const renderExitButton=() => {
    return (
      <Box
        onClick={onClose}
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

  const renderTitle=() => {
    return (
      <>
        <Typography className={classes.dialogTitle}>
          {title}
        </Typography>
        {showDivider&&<Divider />}
      </>
    )
  }

  const renderButtonsDefault=() => {
    return (
      <Grid
        container
        spacing={4}
        className={classes.dialogButtonsContainer}>
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

  const renderIcon=() => {
    return (
      <Box
        className={clsx(
          classes.dialogIconContainer,
          {
            [classes.dialogIconContainerRTL]: isRTL,
            [classes.dialogIconContainerLTR]: !isRTL
          }
        )}>
        {icon}
      </Box>
    )
  }

  const renderChildren=() => {
    return (
      <Box
        className={classes.dialogChildren} style={{ maxHeight: 'calc(65vh)'}}>
        {children}
      </Box>)
  }

  const renderContent=() => {
    return (
      <Box
        dir={direction[isRTL]}
        className={classes.dialogContent}>
        {renderTitle()}
        {renderChildren()}
        {renderButtons? renderButtons():renderButtonsDefault()}
      </Box>
    )
  }

  return (
    <BaseDialog
      open={!!open}
      className={classes.dialogContainer}
      onClose={onClose}>
      <Paper>
        {renderExitButton()}
        {renderContent()}
        {renderIcon()}
      </Paper>
    </BaseDialog>
  )
}