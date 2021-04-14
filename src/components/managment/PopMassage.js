import React from 'react'
import {Box} from '@material-ui/core'
import {Transition} from 'react-transition-group'

export const PopMassage=({
  classes,
  show=false,
  timout=500,
  label=''
}) => {
  const transitionStyles={
    entering: 1,
    entered: 1,
    exiting: 0,
    exited: 0
  };
  return (
    <Transition in={show} timeout={timout}>
      {state => (
        <Box
          className={classes.copyClip}
          style={{
            transition: `opacity ${timout}ms ease-in-out`,
            opacity: transitionStyles[state]
          }}>
          {label}
        </Box>
      )}
    </Transition>
  )
}