import React from 'react';
import clsx from 'clsx';
import {Typography,Button,Box} from '@material-ui/core'

export const ManagmentIcon=({
  classes,
  icon,
  lable='',
  rootClass='',
  textClass='',
  disable=false,
  hide=false,
  remove=false,
  onClick=() => null}) => {
  if(remove)
    return null

  return (
    <Button
      disabled={disable||hide}
      onClick={onClick}
      size='small'
      className={clsx({
        [classes.managmentIconHide]: hide
      })}>
      <Box
        className={clsx(
          classes.managmentIconContainer,
          rootClass
        )}>
        <img
          src={icon}
          alt='Icon'
          className={clsx(
            classes.managmentIcon,{
            [classes.managmentIconDisable]: disable
          })} />
        <Typography className={clsx(
          classes.managmentIconText,
          textClass
        )}>
          {lable}
        </Typography>
      </Box>
    </Button>
  )
}