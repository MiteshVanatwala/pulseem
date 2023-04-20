import clsx from 'clsx';
import { Box, MenuItem, MenuList, Popper, Badge, Button } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux';
import NotificationIcon from '../../assets/images/notification.svg';
import { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { markNotificationsAsRead } from '../../redux/reducers/notificationUpdateSlice';

const NotificationBell = ({ classes }) => {
  const [displayNotifications, toggleDisplayNotifications] = useState(false);
  const notificationIconRef = useRef(null)
  const { t } = useTranslation();
  const { notifyCenterList, unreadMessages } = useSelector(state => state.notificationUpdate)
  const dispatch = useDispatch();

  const handleClose = () => {
    toggleDisplayNotifications(false);
  }

  const notificationItem = () => {
    const notifyTemplate = (option) => {
      switch (option.NotifyCenterTypeID) {
        case 0: { // File
          return <>your file is ready to donwload
            <>
              <Button onClick={() => { window.open(`/Pulseem/DownloadFile.aspx?fileFormat=CSV&fileId=${option.SourceID}`) }}>Download here</Button>
            </>
          </>
        }
        case 1: { // Unsubscribe
          return <>Recipients were successfully removed from <b>"{option.TargetName}"</b></>
        }
        case 2: { // UploadRecipients
          return <>Recipients were uploaded successfully to <b>"{option.TargetName}"</b></>
        }
        default: {
          break;
        }
      }
    }
    return (
      <MenuList>
        {
          notifyCenterList && notifyCenterList?.map((option, index) => (
            <MenuItem
              key={option?.ID}
              className={clsx(classes.f12, classes.notificationItem, classes.paddingSides15)}
            >
              {notifyTemplate(option)}
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
        badgeContent={unreadMessages}
        color="red"
        className={clsx(classes.bell)}
        invisible={unreadMessages === 0}
        max={99}
      >
        <img
          ref={notificationIconRef}
          alt='settings'
          src={NotificationIcon}
          className={clsx(classes.appBarSettingIcon, classes.notificationBell)}
          onClick={() => {
            toggleDisplayNotifications(!displayNotifications);
            dispatch(markNotificationsAsRead())
          }}
        />
      </Badge>
      <Popper open={displayNotifications} anchorEl={notificationIconRef.current} role={undefined} transition placement={'bottom-end'} disablePortal>
        <div className={clsx(classes.notificationUpdateContainer, classes.p15, classes.pt10)}>
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