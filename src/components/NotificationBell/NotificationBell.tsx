import clsx from 'clsx';
import { Box, MenuItem, MenuList, Popper, Badge, Button } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux';
import NotificationIcon from '../../assets/images/notification.svg';
import { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { markNotificationsAsRead } from '../../redux/reducers/notificationUpdateSlice';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';

enum NotifyCenterType {
  File = 0,
  Unsubscribe = 1,
  UploadRecipient = 2
}

enum NotifyCenterStatus {
  Unread = 0,
  Read = 1,
  Removed = 2  
}

const NotificationBell = ({ classes }: any) => {
  const [displayNotifications, toggleDisplayNotifications] = useState(false);
  const notificationIconRef = useRef(null)
  const { t } = useTranslation();
  const { notifyCenterList, unreadMessages } = useSelector((state: any) => state.notificationUpdate)
  const dispatch = useDispatch();

  const handleClose = () => {
    toggleDisplayNotifications(false);
  }

  const notificationItem = () => {
    const notifyTemplate = (option: any) => {
      switch (option.NotifyCenterTypeID) {
        case NotifyCenterType.File: {
          return <>{t('notifications.fileReadyForDownload')}
            <>
              <Button onClick={() => { window.open(`/Pulseem/DownloadFile.aspx?fileFormat=CSV&fileId=${option.SourceID}`) }}>{t('notifications.fileReadyForDownload')}</Button>
            </>
          </>
        }
        case NotifyCenterType.Unsubscribe: {
          return <>
            {RenderHtml(t('notifications.recipientsRemoved').replace('##Name##', `${option.TargetName}`))}
          </>
        }
        case NotifyCenterType.UploadRecipient: {
          return <>{RenderHtml(t('notifications.recipientsUploaded').replace('##Name##', `${option.TargetName}`))}</>
        }
        default: {
          break;
        }
      }
    }
    return (
      <MenuList>
        {
          notifyCenterList && notifyCenterList?.map((option: any) => (
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
        color="error"
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
      <Popper open={displayNotifications} anchorEl={notificationIconRef.current} role={undefined} transition placement={'bottom'} disablePortal>
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