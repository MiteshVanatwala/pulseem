import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  loader: {
    top: 30,
    left: 0,
    right: 0,
    width: '100%',
    height: 'calc(100% - 50px)',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
}));


export const Loader = ({
  isOpen = true,
  color = "inherit",
  size = 80,
  thickness = 3.6,
  variant = 'indeterminate',
  showBackdrop = true,
  zIndex = 1300,
  ...props
}) => {
  const classes = useStyles();
  return (
    <>
      {
        props.contained ?
          <div style={{ width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center', zIndex: zIndex }}>
            <CircularProgress
              style={{ textAlign: 'center', margin: '0 auto', alignSelf: 'center' }}
              color="#fff"
              size={40}
              thickness={3.6}
              variant="indeterminate"
            />
          </div>
          :
          <div>
            {
              showBackdrop ? (<Backdrop className={classes.backdrop} open={isOpen} style={{ zIndex: zIndex }}>
                <CircularProgress
                  style={{ position: 'absolute', right: 0, left: 0, textAlign: 'center', margin: '0 auto' }}
                  color={color}
                  size={size}
                  thickness={thickness}
                  variant={variant}
                />
              </Backdrop>)
                :
                (<Box className={classes.loader} style={{ display: isOpen ? 'flex' : 'none' }}>
                  <CircularProgress
                    color={color}
                    size={size}
                    thickness={thickness}
                    variant={variant}
                  />
                </Box>)
            }
          </div>

      }
    </>
  );
}