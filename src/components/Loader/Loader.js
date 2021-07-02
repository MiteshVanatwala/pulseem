import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));


export const Loader = ({
  isOpen = true,
  color = "inherit",
  size = 80,
  thickness = 3.6,
  variant = 'indeterminate'
}) => {
  const classes = useStyles();
  return (
    <div>
      <Backdrop className={classes.backdrop} open={isOpen}>
        <CircularProgress
          color={color}
          size={size}
          thickness={thickness}
          variant={variant}
        />
      </Backdrop>
    </div>
  );
}