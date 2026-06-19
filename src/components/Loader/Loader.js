import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import Stack from '@mui/material/Stack';
import LinearProgress from '@material-ui/core/LinearProgress';

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
    justifyContent: 'center',
    zIndex: 9000
  },
  progressBar: {
    left: 0,
    right: 0,
    width: '30%',
    height: '5vh',
    margin: '0 auto',
    textAlign: 'center',
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 15
  },
  message: {
    color: '#000',
    textAlign: 'center',
    width: '100%'
  }
}));


export const Loader = ({
  isOpen = true,
  color = "inherit",
  size = 80,
  thickness = 3.6,
  variant = 'indeterminate',
  showBackdrop = true,
  zIndex = 2300,
  progress = null,
  message = null,
  ...props
}) => {
  const classes = useStyles();

  if (props.isDownloadProgress && props.isDownloadProgress === true) {
    return (<Backdrop className={classes.backdrop} open={isOpen} style={{ zIndex: zIndex }}>
      <Box className={classes.progressBar}>
        {message && <Box
          display="flex"
          alignItems="center">
          <Typography className={classes.message}>{message}</Typography>
        </Box>}
        <Box display="flex"
          alignItems="center">
          <Box width="100%" mr={1} style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
              <LinearProgress />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Backdrop>)
  }
  if (progress) {
    return (
      <Backdrop className={classes.backdrop} open={isOpen} style={{ zIndex: zIndex }}>
        <Box className={classes.progressBar}>
          {message && <Box
            display="flex"
            alignItems="center">
            <Typography className={classes.message}>{message}</Typography>
          </Box>}
          <Box display="flex"
            alignItems="center">
            <Box width="100%" mr={1} style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <LinearProgress variant="determinate" {...props} style={{ width: `${progress}%` }} />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textPrimary">{`${Math.round(
                progress,
              )}%`}</Typography>
            </Box>
          </Box>
        </Box>
      </Backdrop>
    )
  }
  return (
    <>
      {
        props.contained ?
          <div style={{ width: '100%', minHeight: props?.containerSize ?? size, display: 'flex', justifyContent: 'center', zIndex: zIndex, alignItems: 'center' }}>
            <CircularProgress
              style={{ textAlign: 'center', margin: '0 auto', alignSelf: 'center' }}
              color="inherit"
              size={size ?? 40}
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
