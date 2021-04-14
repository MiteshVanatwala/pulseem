import React from 'react'
import {TopAppBar,/*Drawer*/} from '../components/core'
import {Container} from '@material-ui/core'

const DefaultScreen=({classes,children,currentPage='',history}) => {
  return (
    <div style={{width: '100vw',height: '100vh'}}>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
        history={history}
      />
      {/*<Drawer classes={classes} />*/}
      <Container maxWidth='xl'>
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
