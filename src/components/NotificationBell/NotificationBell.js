import clsx from 'clsx';
import { Box, MenuItem, MenuList, Popper, Badge } from '@material-ui/core'
import { useSelector } from 'react-redux';
import NotificationIcon from '../../assets/images/notification.svg';
import { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";

const NotificationBell = ({classes}) => {
  const [ displayNotifications, toggleDisplayNotifications ] = useState(false);
  const notificationIconRef = useRef(null)
  const { t } = useTranslation();
  const { notificationUpdateList  } = useSelector(state => state.notificationUpdate)

  const handleClose = () => {
    toggleDisplayNotifications(false);
  }

  const notificationItem = () => {
    return (
      <MenuList>
        {
          notificationUpdateList && notificationUpdateList.map((option, index) => (
            <MenuItem
              key={option.ID}
              className={clsx(classes.f12, classes.notificationItem, classes.paddingSides15)}
            >
              {option.ActionName}
            </MenuItem>
          ))
        }
      </MenuList>
    )
  }

  return (
    <Box
      zIndex='tooltip'
      onMouseLeave={handleClose}
      className={clsx(classes.appBarItemContainer, classes.paddingSides15)}>
      <Badge
        badgeContent={notificationUpdateList.length}
        color="red"
        className={clsx(classes.bell)}
        invisible={!notificationUpdateList.length}
        max={99}
      >
        <img
          ref={notificationIconRef}
          alt='settings'
          src={NotificationIcon}
          className={clsx(classes.appBarSettingIcon, classes.notificationBell)}
          onClick={() => toggleDisplayNotifications(!displayNotifications)}
        />
      </Badge>
      <Popper open={displayNotifications} anchorEl={notificationIconRef.current} role={undefined} transition placement={'bottom-end'} disablePortal>
        <div className={clsx(classes.notificationUpdateContainer, classes.p15, classes. pt10)}>
          <div className={clsx(classes.bold)}>
            {t('notifications.notifications')}
          </div>
          {notificationItem()}
        </div>
      </Popper>
    </Box>
  )
}

export default NotificationBell;