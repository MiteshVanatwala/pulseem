import React from 'react';
import { Box } from '@material-ui/core';
import useCore from '../../helpers/Hooks/Core';

export const AlertIcon = () => {
  const { classes } = useCore()
  return (
    <Box className={classes.dialogAlertIcon}>
      !
    </Box>
  )
}
