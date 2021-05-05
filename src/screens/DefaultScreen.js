import React from 'react'
import {TopAppBar,/*Drawer*/} from '../components/core'
import {Container} from '@material-ui/core'

const DefaultScreen=({classes,children,currentPage='',}) => {
  return (
    <div>
      <TopAppBar
        classes={classes}
        currentPage={currentPage}
      />
      {/*<Drawer classes={classes} />*/}
      <Container maxWidth='xl' style={{maxHeight: 'calc(100vh - 53px)', overflow: 'auto', paddingBottom: 50}}>
        {children}
      </Container>
    </div>
  )
}

export default DefaultScreen
