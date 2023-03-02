import React, { useRef } from 'react';
import clsx from 'clsx';
import { Typography, Button, Box } from '@material-ui/core'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useRedirect from '../../helpers/Routes/Redirect';
import useCore from '../../helpers/hooks/Core';


export const ManagmentIcon = ({
  icon,
  uIcon = "",
  lable = '',
  rootClass = '',
  iconClass = '',
  textClass = '',
  disable = false,
  hide = false,
  remove = false,
  href = '',
  type = '',
  text = '',
  onClick = () => { }
}) => {
  const buttonRef = useRef();
  const Redirect = useRedirect();
  const { classes } = useCore();

  if (remove)
    return null

  const renderButtonDefault = () => {
    return (
      <Button
        ref={buttonRef}
        disabled={!!disable || !!hide}
        size='small'
        onClick={() => {
          if (href) {
            Redirect({ url: href });
          }
          else {
            onClick(buttonRef)
          }
        }}
        className={clsx({
          [classes.managmentIconHide]: hide
        })}>
        <Box
          // component={href? 'a':'div'}
          // href={href}
          className={clsx(disable && classes.disabledCursor,
            classes.managmentIconContainer,
            rootClass,
          )}>
          {!!uIcon ?
            <div>
              {uIcon}
            </div>
            : <img
              src={icon}
              alt='Icon'
              className={clsx(
                iconClass,
                classes.managmentIcon, {
                [classes.managmentIconDisable]: disable
              })} />}
          <Typography className={clsx(
            classes.managmentIconText,
            textClass, disable && classes.colorGray
          )}>
            {lable}
          </Typography>
        </Box>
      </Button>
    );
  }

  const renderCopyField = () => {
    return (
      <CopyToClipboard text={text}>
        {renderButtonDefault()}
      </CopyToClipboard>
    );
  }
  return (
    <>
      {type === 'copy' ? renderCopyField() : renderButtonDefault()}
    </>
  )
}