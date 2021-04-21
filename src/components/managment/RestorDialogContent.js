import React from 'react';
import {Box,FormControlLabel,Checkbox} from '@material-ui/core'


export const RestorDialogContent=({
  classes,
  data=[],
  currentChecked=[],
  dataIdVar='ID',
  dataLabeleVar='Name',
  onChange=() => null
}) => {
  if(!Array.isArray(data))
    return null

  return (
    <Box
      className={classes.restorDialogContent}>
      {data.map(row => {
        const checked=currentChecked.includes(row.ID)
        return (
          <FormControlLabel
            key={row[dataIdVar]}
            className={classes.restoreDialogCheckBoxLable}
            control={
              <Checkbox
                checked={checked}
                onChange={onChange(row[dataIdVar])}
                className={classes.restoreDialogCheckBox}
                color='primary'
                size='small'
              />
            }
            label={row[dataLabeleVar]}
          />
        )
      })}
    </Box>
  )
}