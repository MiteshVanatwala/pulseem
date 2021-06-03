import React, { useRef } from 'react';
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
  const buttonRef = useRef();

  if(remove)
    return null

  const renderButtonDefault=() => {
    return (
      <Button
        ref={buttonRef}
        disabled={!!disable||!!hide}
        size='small'
        onClick={()=>onClick(buttonRef)}
        className={clsx({
          [classes.managmentIconHide]: hide
        })}>
        <Box
          component={href? 'a':'div'}
          href={href}
          className={clsx(disable&&classes.disabledCursor,
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
            textClass, disable&&classes.colorGray
          )}>
            {lable}
          </Typography>
        </Box>
      </Button>
    );
  }

  const renderCopyField=() => {
    return (
      <CopyToClipboard text={text}>
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