import {Box, Popper} from '@material-ui/core'

export const PopMassage=({
  classes,
  show=false,
  timeout=500,
  label='',
  innerRef=null
}) => {
  // const transitionStyles={
  //   entering: 1,
  //   entered: 1,
  //   exiting: 0,
  //   exited: 0
  // };
  return (
    <Popper open={show} anchorEl={innerRef}>
      <Box
          className={classes.copyClip}
          style={{
            transition: `opacity ${timeout}ms ease-in-out`,
          }}>
          {label}
        </Box>
    </Popper>
  )
}