import React from 'react';
import {Switch as SwitchBase} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles';
import {useSelector} from 'react-redux'

export const Switch=(props) => {
  const {isRTL}=useSelector(state => state.core)
  const CustomSwitch=withStyles((theme) => ({
    root: {
      width: 50,
      height: 30,
      padding: 4,
    },
    switchBase: {
      top: 4,
      left: isRTL? 20:4,
      right: isRTL? 4:20,

      color: 'transparent',
      border: '2px solid #F02039',
      '&$checked': {
        transform: isRTL? 'translateX(-20px)':'translateX(20px)',
        color: theme.palette.common.white,
        border: '2px solid #27AE60',
        backgroundColor: '#fff',
        '& + $track': {
          backgroundColor: '#27AE60',
          border: '2px solid #27AE60',
          opacity: 1
        },
        '&:hover': {
          backgroundColor: '#fff',
        }
      },
    },
    thumb: {
      width: 4,
      height: 4,
      boxShadow: 'none',
    },
    track: {
      borderRadius: 15,
      border: `2px solid #F02039`,
      backgroundColor: 'transparent',
      opacity: 1,
      transition: theme.transitions.create(['background-color','border']),
    },
    checked: {},
    focusVisible: {},
  }))(({classes,...props}) => {
    return (
      <SwitchBase
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    );
  });
  return (
    <CustomSwitch {...props} />
  )
}