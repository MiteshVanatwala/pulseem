import React from 'react'
import { TopAppBar,/*Drawer*/ } from '../components/core'
import { Container } from '@material-ui/core'
import clsx from 'clsx';

const DefaultScreen = ({ classes, children, currentPage = '', customStyle = null }) => {
  return (
    <div>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      {/*<Drawer classes={classes} />*/}
      <Container
        maxWidth='xl'
        className={clsx(customStyle?customStyle: classes.defaultScreen)}>
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
