import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Drawer as BaseDrawer, Divider,
  List, ListItem, ListItemIcon, ListItemText, Collapse
} from '@material-ui/core';
import { useTranslation } from "react-i18next";
//import {useSelector,useDispatch} from 'react-redux';
import { ContactIcon, GuidsIcon, LogoutIcon } from '../../assets/images/drawer/index'
import { getRoutes } from '../../helpers/Routes/routes'
import { useSelector } from 'react-redux';

const DrawerItem = ({
  item,
  classes,
  isOpen = false,
  onClick = () => null,
  onOpenChange = () => null,
}) => {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [innerHover, setInnerHover] = useState('')

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleOpen = () => {
    setOpen(!open)
    onOpenChange(!open)
  }

  const handlwHoverOn = () => {
    setHover(true)
  }

  const handlwHoverOff = () => {
    setHover(false)
  }

  const handleInnerHoverOn = title => () => {
    setInnerHover(title)
  }

  const handleInnerHoverOff = () => {
    setInnerHover('')
  }

  const renderItem = () => (
    <ListItem
      button
      onClick={item.options ? handleOpen : onClick(item)}
      className={hover && classes.drawerItemHover}>
      <ListItemIcon>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        classes={{
          primary: clsx({
            [classes.drawerItemTextStyle]: !hover,
            [classes.drawerItemTextHoverStyle]: hover || isOpen
          })
        }}>
        {item.title}
      </ListItemText>
    </ListItem>
  )

  const renderCollapseList = () => {
    if (!item.options) return null

    return (
      <Collapse
        in={open}
        timeout='auto'
        unmountOnExit>
        <List
          className={classes.drawerItemList}>
          {item.options.map(inner => (
            renderInnerListItem(inner)
          ))}
        </List>
      </Collapse>
    )
  }

  const renderInnerListItem = (inner) => (
    <ListItem
      key={inner.title}
      button
      onClick={onClick(inner)}
      onMouseOver={handleInnerHoverOn(inner.title)}
      onMouseLeave={handleInnerHoverOff} >
      <ListItemText
        classes={{
          primary: clsx({
            [classes.drawerItemInnerTextStyle]: innerHover !== inner.title,
            [classes.drawerItemInnerTextHoverStyle]: innerHover === inner.title
          })
        }}>
        {inner.title}
      </ListItemText>
    </ListItem>
  )

  return (
    <div
      key={item.title}
      onMouseOver={handlwHoverOn}
      onMouseLeave={handlwHoverOff}>
      {renderItem()}
      {renderCollapseList(item.options)}
    </div>
  )
}

export const Drawer = ({ classes }) => {
  const [open, setOpen] = useState(true)
  const [currentRoute, setCurrentRoute] = useState('')
  const { t } = useTranslation()
  const { windowSize, isRTL, isClal } = useSelector(state => state.core)
  const { accountSettings, accountFeatures } = useSelector(state => state.common);

  const routes = getRoutes(t, isClal, accountFeatures, accountSettings, windowSize, isRTL)

  const handleOpen = () => {
    setOpen(!open)
    setCurrentRoute('')
  }

  const BorgerButton = ({ onClick = () => null }) => {
    return (
      <div
        onClick={onClick}
        className={classes.borgerContainer}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={classes.borgerLine} />
        ))}
      </div>
    )
  }

  const renderToolbar = () => {
    return (
      <>
        <BorgerButton onClick={handleOpen} />
        {routes.map(route => (
          <DrawerItem
            key={route.title}
            classes={classes}
            item={route}
            isOpen={currentRoute === route.title}
            onOpenChange={expand => {
              if (expand && !open) handleOpen()
              setCurrentRoute(currentRoute === route.title ? '' : route.title)
            }}
          />
        ))}
      </>
    )
  }

  const renderBottomToolbar = () => {
    return (
      <div className={classes.bottomToolbar}>
        <Divider className={classes.divider} />
        <DrawerItem
          classes={classes}
          item={{
            title: t('master.guides'),
            icon: <img
              src={GuidsIcon}
              alt='Icon'
            />
          }}
        />
        <DrawerItem
          classes={classes}
          item={{
            title: t('master.linkContactResource1.Text'),
            icon: <ContactIcon className={classes.contactIconStyle} />
          }}
        />
        <Divider className={classes.divider} />
        <DrawerItem
          classes={classes}
          item={{
            title: t('master.LogoutResource1.Text'),
            icon:
              <img
                src={LogoutIcon}
                alt='Logout icon'
                className={classes.logoutIconStyle} />
          }} />
      </div>
    )
  }

  return (
    <BaseDrawer
      variant='permanent'
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open,
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        }),
      }}>
      {renderToolbar()}
      {renderBottomToolbar()}
    </BaseDrawer>
  )
}
