import React from 'react'
import {TopAppBar,/*Drawer*/} from '../components/core'
import {Container} from '@material-ui/core'

const DefaultScreen=({classes,children,currentPage='',}) => {
  return (
    <div style={{width: '100vw',height: '100vh'}}>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      {/*<Drawer classes={classes} />*/}
      
      <Container maxWidth='xl' className={classes.mainContainer}>
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
