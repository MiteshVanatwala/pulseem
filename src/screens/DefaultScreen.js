import React from 'react'
import { TopAppBar,/*Drawer*/ } from '../components/core'
import { Container } from '@material-ui/core'
import clsx from 'clsx';

const DefaultScreen = ({ classes, children, currentPage = '', containerClass, customPadding = false }) => {
  return (
    <div>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      <Container
        maxWidth='xl'
        className={clsx(customPadding ? classes.sidePadding : null, containerClass ?? null)}
      >
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
