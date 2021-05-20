import React from 'react';
import clsx from 'clsx';
import {Typography,Button,Box} from '@material-ui/core'
import {CopyToClipboard} from 'react-copy-to-clipboard';

export const ManagmentIcon=({
  classes,
  icon,
  lable='',
  rootClass='',
  textClass='',
  disable=false,
  hide=false,
  remove=false,
  href='',
  type='',
  text='',
  onClick=() => null}) => {
  if(remove)
    return null

  const renderButtonDefault=() => {
    return (
      <>
        <Button
          disabled={!!disable||!!hide}
          onClick={onClick}
          size='small'
          className={clsx({
            [classes.managmentIconHide]: hide
          })}>
          <Box
            component={href? 'a':'div'}
            href={href}
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
      </>
    );
  }

  const renderCopyField=() => {
    return (
      <CopyToClipboard text={text} onCopy={onClick}>
        {renderButtonDefault()}
      </CopyToClipboard>
    );
  }
  return (
    <>
      {type==='copy'? renderCopyField():renderButtonDefault()}
    </>
  )
}