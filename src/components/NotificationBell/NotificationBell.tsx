import clsx from 'clsx';
import { Box, MenuItem, MenuList, Popper, Badge, Typography, Divider } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux';
import NotificationIcon from '../../assets/images/notification.svg';
import { useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { markNotificationsAsRead } from '../../redux/reducers/notificationUpdateSlice';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineCloudDownload, AiOutlineCloudUpload } from 'react-icons/ai';
import { IoMdRemoveCircleOutline } from 'react-icons/io';
import { ClickAwayListener } from "@material-ui/core";
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { TemplateErrorDialog } from '../TemplateErrorDialog/TemplateErrorDialog';
import { getSavedTemplates } from '../../redux/reducers/whatsappSlice';
import { Loader } from '../Loader/Loader';
// import { MdDomain } from 'react-icons/md';
// import { setVerificationDomain } from '../../redux/reducers/newsletterSlice';

enum NotifyCenterType {
  File = 0,
  Unsubscribe = 1,
  UploadRecipient = 2,
  DomainVerification = 3,
  TemplateStatusApproved = 4,
  TemplateStatusDeclined = 5,
}

// enum NotifyCenterStatus {
//   Unread = 0,
//   Read = 1,
//   Removed = 2
// }

const NotificationBell = ({ classes }: any) => {
  const [displayNotifications, toggleDisplayNotifications] = useState(false);
  const notificationIconRef = useRef(null)
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const { t } = useTranslation();
  const { isRTL } = useSelector((state: any) => state.core);
  const { notifyCenterList, unreadMessages } = useSelector((state: any) => state.notificationUpdate)
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const dispatch = useDispatch();

  const handleClose = () => {
    toggleDisplayNotifications(false);
  }

  const getTemplateError = async (templateId: string) => {
    setIsLoader(true);
    // @ts-ignore
    let savedTemplate: savedTemplateAPIProps = await dispatch<any>(
      getSavedTemplates({ TemplateId: templateId })
    );
    setIsLoader(false);
    if (savedTemplate?.payload?.Data?.Count) {
      setDialogType({ type: 'templateError', data: savedTemplate?.payload?.Data?.Items[0]['RejectionReason'] })
    }
  }

  const notificationItem = () => {
    const notifyTemplate = (option: any) => {
      switch (option.NotifyCenterTypeID) {
        case NotifyCenterType.File: {
          return (
            <Box className={clsx(classes.justifyCenterOfCenter, classes.spaceBetween)}>
              <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                <AiOutlineCloudDownload className={classes.notifyIcon} />
                <Typography className={classes.font14}>
                  {RenderHtml(t('notifications.fileReadyForDownload').replace('##FileName##', `${option.TargetName}`))}
                </Typography>
              </Box>
              <Box style={{ paddingInlineStart: 15 }}>
                <a
                  rel="noreferrer"
                  className={clsx(classes.blueLink, classes.f12, isRTL ? classes.floatLeft : classes.floatRight)}
                  href={`/Pulseem/DownloadFile.aspx?fileFormat=XLS&fileId=${option.SourceID}`}
                  target="_blank"
                >
                  {t("master.download")} XLS
                </a>
                <a
                  rel="noreferrer"
                  className={clsx(classes.blueLink, classes.f12, isRTL ? classes.floatLeft : classes.floatRight)}
                  href={`/Pulseem/DownloadFile.aspx?fileFormat=CSV&fileId=${option.SourceID}`}
                  target="_blank"
                >
                  {t("master.download")} CSV
                </a>
              </Box>
            </Box>
          )
        }
        case NotifyCenterType.Unsubscribe: {
          return <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
            <IoMdRemoveCircleOutline className={classes.notifyIcon} />
            <Typography className={classes.font14}>
              {RenderHtml(t('notifications.recipientsRemoved').replace('##Name##', `${option.TargetName}`))}
            </Typography>
          </Box>
        }
        case NotifyCenterType.UploadRecipient: {
          return <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
            <AiOutlineCloudUpload className={classes.notifyIcon} />
            <Typography className={classes.font14}>{RenderHtml(t('notifications.recipientsUploaded').replace('##Name##', `${option.TargetName}`))}</Typography>
          </Box>
        }
        case NotifyCenterType.TemplateStatusApproved:
        case NotifyCenterType.TemplateStatusDeclined: {
          const templateDetils = option.TargetName.split('<sep>');
          return (
            <Box className={clsx(classes.justifyCenterOfCenter, classes.spaceBetween)}>
              <Box className={classes.dFlex} style={{ alignItems: 'center' }}>
                {
                  option.NotifyCenterTypeID === NotifyCenterType.TemplateStatusApproved
                    ? <AiOutlineCheckCircle className={classes.notifyIcon} />
                    : <AiOutlineCloseCircle className={classes.notifyIcon} />
                }
                <Typography className={classes.font14}>{RenderHtml(t(option.NotifyCenterTypeID === NotifyCenterType.TemplateStatusApproved ? 'whatsapp.templateApproved' : 'whatsapp.templateDeclined').replace('##Name##', `${templateDetils[0] || ''}`))}</Typography>
              </Box>
              {
                option.NotifyCenterTypeID === NotifyCenterType.TemplateStatusDeclined && (
                  <Box style={{ paddingInlineStart: 15 }}>
                    <a
                      className={clsx(classes.blueLink, classes.f12)}
                      href='#'
                      onClick={() => getTemplateError(templateDetils[1] || '')}
                    >
                      {t("whatsapp.displayError")}
                    </a>
                  </Box>
                )
              }
            </Box>
          )
        }
        // case NotifyCenterType.DomainVerification: {
        //   return <Box className={classes.dFlex} style={{ alignItems: 'center' }} onClick={() => dispatch(setVerificationDomain({ display: true, address: `${option.TargetName}`, showSkip: false }))}>
        //     <MdDomain className={classes.notifyIcon} />
        //     {option.SourceID === 1 && <Typography className={classes.font14}>{RenderHtml(t('notifications.domainValidation.syntaxError').replace('##DoaminAddress##', `${option.TargetName}`))}</Typography>}
        //     {option.SourceID === 2 && <Typography className={classes.font14}>{RenderHtml(t('notifications.domainValidation.mailHeaderError').replace('##DoaminAddress##', `${option.TargetName}`))}</Typography>}
        //   </Box >
        // }
        default: {
          break;
        }
      }
    }
    return (
      <MenuList>
        {
          notifyCenterList && notifyCenterList?.length > 0 ? notifyCenterList?.filter((n: any) => { return n.NotifyCenterTypeID !== NotifyCenterType.DomainVerification }).map((option: any) => (
            <MenuItem
              key={option?.ID}
              className={clsx(classes.f12, classes.notificationItem, classes.paddingSides15)}
            >
              {notifyTemplate(option)}
            </MenuItem>
          )) :
            <MenuItem
              key={0}
              className={clsx(classes.f12, classes.notificationItem, classes.paddingSides15)}>
              <Typography className={classes.font14}>{t('notifications.noNewNotify')}</Typography>
            </MenuItem>
        }
      </MenuList>
    )
  }

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    const dialogContent: { [key: string]: {} } = {
      templateError: TemplateErrorDialog({ classes, failedTemplateResponse: data, setDialogType, translator: t, isRTL }),
    }

    const currentDialog: any = (type && dialogContent[type]) || {};
    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={classes.maxWidth400}
          classes={classes}
          open={dialogType}
          childrenStyle={classes.mb25}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box
        zIndex='tooltip'
        //onMouseLeave={handleClose}
        className={clsx(classes.appBarItemContainer, classes.paddingSides15)}
        style={{
          paddingRight: isRTL ? 15 : 0,
          paddingLeft: isRTL ? 0 : 15
        }}
      >
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
              if (unreadMessages > 0) dispatch(markNotificationsAsRead())
            }}
          />
        </Badge>
        <Popper open={displayNotifications} anchorEl={notificationIconRef.current} role={undefined} placement={'bottom'} disablePortal className={classes.notificationUpdateContainerPopper}>
          <div className={clsx(classes.notificationUpdateContainer, classes.paddingSides15, classes.pt10)} style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
            <div className={clsx(classes.bold)} style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('notifications.notifyCenterTitle')}
            </div>
            <Divider style={{ marginTop: 10 }} />
            {notificationItem()}
          </div>
        </Popper>
        {renderDialog()}
        <Loader isOpen={isLoader} showBackdrop={true} />
      </Box>
    </ClickAwayListener>
  )
}

export default NotificationBell;