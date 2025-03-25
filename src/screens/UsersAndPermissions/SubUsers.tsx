import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { MdArrowBackIos, MdArrowForwardIos, MdOutlinePersonAddAlt, MdPassword } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import DefaultScreen from '../DefaultScreen';
import { Title } from '../../components/managment/Title';
import { Loader } from '../../components/Loader/Loader';
import { toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { errorToastData, resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
import { ManagmentIcon, TablePagination } from '../../components/managment';
import { DateFormats, rowsOptions } from '../../helpers/Constants';
import { setRowsPerPage } from '../../redux/reducers/coreSlice';
import { DeleteIcon, EditIcon, PreviewIcon } from '../../assets/images/managment';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import moment from 'moment';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import User from '../../components/User/User';
import Permissions from '../../components/Permissions/Permissions';
import PermissionsHistory from '../../components/PermissionsHistory/PermissionsHistory';
import { getAllUsers, resendConfirmationEmail, save } from '../../redux/reducers/SubUserSlice';
import { eSubUserAction, SubUserModel, SubUserRequest } from '../../Models/SubUser/SubUsers';
import PermissionList from './PermissionList';
import { logout } from '../../helpers/Api/PulseemReactAPI';
import SubUserChangePassword from './SubUserChangePassword';
import { BiMailSend } from 'react-icons/bi';

const SubUsers = ({ classes }: any) => {
  const { language, windowSize, isRTL, rowsPerPage, userRoles, subUserName } = useSelector((state: any) => state.core);
  const { ToastMessages } = useSelector((state: any) => state?.subUser);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<toastProps['SUCCESS']>(resetToastData);
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [openSaveUserDialog, setOpenSaveUserDialog] = useState<boolean>(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState<boolean>(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState<boolean>(false);
  const [openPermissionsHistoryDialog, setOpenPermissionsHistoryDialog] = useState<boolean>(false);
  const [selectedSubUser, setSelectedSubUser] = useState<SubUserModel | any | null>(null);
  const [searchData, setSearchData] = useState<SubUserRequest>({
    PageSize: rowsPerPage,
    PageNumber: 1,
    SearchTerm: ''
  });
  const [dialogType, setDialogType] = useState<{
    type: string;
    data: any
  } | null>(null);
  const [userList, setUserList] = useState<SubUserModel[]>()
  const rowStyle = { head: clsx(classes.tableRowHead, classes.pt10, classes.pb10), root: classes.tableRowRoot }
  const cellStyle = { head: clsx(classes.tableCellHead, classes.noPadding, classes.f16), body: classes.tableCellBody, root: clsx(classes.tableCellRoot, classes.p0) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody, classes.f16), root: clsx(classes.tableCellRoot, classes.noPadding) }
  moment.locale(language);
  const isInitialRender = useRef(true);


  useEffect(() => {
    const fetchData = async () => {
      if (isInitialRender.current) {
        await getData();
      }
      isInitialRender.current = false;
    };

    fetchData();
  }, [, isSearching, searchData]);

  const getData = async () => {
    setShowLoader(true);
    const response = await dispatch(getAllUsers({ ...searchData, PageSize: rowsPerPage, SearchTerm: !userRoles.AllowSubUsers ? subUserName : searchData?.SearchTerm })) as any;
    switch (response?.payload?.StatusCode) {
      case 201: {
        setUserList(response?.payload?.Data?.Users);
        setTotalRecord(response?.payload?.Data?.TotalRecords);
        break;
      }
      case 500:
      default: {
        console.log(response?.payload?.Message);
      }
    }
    setShowLoader(false);
  }

  const renderToast = () => {
    if (toastMessage.message?.length > 0) {
      setTimeout(() => {
        setToastMessage(resetToastData);
      }, 4000);
      return <Toast data={toastMessage} />;
    }
    return null;
  };

  const saveUser = async (subUserItem: SubUserModel) => {
    setOpenPermissionsDialog(false);
    setShowLoader(true);
    const response = await dispatch(save(subUserItem)) as any;
    switch (response?.payload?.StatusCode) {
      case 1: {
        setToastMessage(ToastMessages.NO_DATA_PROVIDED);
        break;
      }
      case 201: {
        setToastMessage(ToastMessages.USER_CREATED_SUCCESSFULLY);
        getData();
        setOpenSaveUserDialog(false)
        break;
      }
      case 400: {
        setToastMessage(ToastMessages.USER_NOT_MATCHED);
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 402: {
        setToastMessage(ToastMessages.INVALID_USERNAME);
        break;
      }
      case 403: {
        setToastMessage(ToastMessages.XSS_NOT_ALLOWD);
        break;
      }
      case 405: {
        setToastMessage(ToastMessages.USERNAME_ALREADY_EXISTS);
        break;
      }
      case 406: {
        setToastMessage(ToastMessages.USER_REJECTED);
        break;
      }
      case 410: {
        setToastMessage(ToastMessages.EMAIL_ALREADY_EXISTS);
        break;
      }
      default: {
        break;
      }
    }
    setShowLoader(false);
  }

  const resendConfirmation = async (userId: number) => {
    const response = await dispatch(resendConfirmationEmail(userId)) as any;
    switch (response?.payload?.StatusCode) {
      case 201: {
        setToastMessage(ToastMessages.CONFIRMATION_SENT);
        break;
      }
      case 401:
      case 405: {
        logout();
        break;
      }
      case 406: {
        setToastMessage(errorToastData);
        break;
      }
    }

  }


  //#region Data Table

  const renderCellIcons = (row: SubUserModel) => {
    const iconsMap = [[
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: false,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        // remove: windowSize === 'xs',
        onClick: () => { setSelectedSubUser(row); setOpenPermissionsDialog(true) },
        rootClass: classes.paddingIcon,
        remove: !userRoles.AllowSubUsers
      },
      {
        key: 'change-password',
        uIcon: MdPassword,
        disable: false,
        lable: t('SubUsers.changePassword'),
        // remove: windowSize === 'xs',
        onClick: () => { setSelectedSubUser(row); setOpenChangePasswordDialog(true) },
        rootClass: clsx(classes.paddingIcon, classes.f18),
        remove: row.UserName !== subUserName && !userRoles.AllowSubUsers
      },
      {
        key: 'permission-history',
        uIcon: PreviewIcon,
        disable: false,
        lable: t('SubUsers.permissionsHistory'),
        // remove: windowSize === 'xs',
        onClick: () => { setSelectedSubUser(row); setOpenPermissionsHistoryDialog(true) },
        rootClass: classes.paddingIcon,
        remove: !userRoles.AllowSubUsers
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        rootClass: classes.paddingIcon,
        disable: false,
        showPhone: true,
        remove: !userRoles?.AllowSubUsers,
        onClick: () => {
          setDialogType({ type: 'Delete', data: row });
        }
      },
      {
        key: 'resendConfirmation',
        uIcon: BiMailSend,
        lable: t('SubUsers.sendConfirmationEmail'),
        rootClass: classes.paddingIcon,
        disable: false,
        showPhone: true,
        remove: row.IsApproved || !userRoles.AllowSubUsers,
        onClick: () => {
          resendConfirmation(row.ID);
        },
      }
    ]]
    return (
      <Grid
        container
        direction={windowSize === 'sm' ? 'column' : 'row'}
        justifyContent={userRoles?.HideRecipients ? 'center' : 'flex-end'}
        style={{ paddingInline: iconsMap[0].filter((icon: any) => { return !icon?.remove }).length === 1 ? 15 : 0 }}
      >
        {iconsMap.map((map, index) => (
          <Grid
            key={index}
            item>
            <Grid
              container
              className={windowSize === 'xs' ? classes.mt1 : ''}
            >
              {map.map(icon => (
                !icon.remove && <Grid
                  style={{ flex: 1, alignItems: 'center', position: 'relative', textAlign: 'center' }}
                  className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer', classes.justifyCenter, classes.alignSelfTop)}
                  key={icon.key}
                  item>
                  {/* @ts-ignore */}
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                    textClass={classes.f14}
                    uIcon={<icon.uIcon style={{ fontSize: icon.key === 'resendConfirmation' ? 24 : 18 }} width={18} height={20} className={'rowIcon'} />}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderSearchSection = () => {
    const handleKeyDown = (event: any) => {
      if (event.keyCode === 13 || event.code === "Enter") {
        getData();
      }
    };

    return (
      <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
        <Grid item>
          <TextField
            variant="outlined"
            size="small"
            value={searchData.SearchTerm}
            onChange={(e: any) => setSearchData({
              ...searchData,
              SearchTerm: e.target.value
            })}
            className={clsx(classes.textField, classes.minWidth252)}
            placeholder={t("common.search")}
          />
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              isInitialRender.current = true;
              setIsSearching(true);
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("campaigns.btnSearchResource1.Text")}
          </Button>
        </Grid>
        {isSearching && (
          <Grid item>
            <Button
              onClick={async () => {
                isInitialRender.current = true;
                setSearchData({
                  PageNumber: 1,
                  PageSize: rowsPerPage,
                  SearchTerm: ''
                });
                setIsSearching(false);
              }}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t("common.clear")}
            </Button>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderTableHead = () => {
    return (
      <TableHead>
        <TableRow classes={rowStyle}>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("SubUsers.username")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("SubUsers.email")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubUsers.cellphone")}</TableCell>
          <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("SubUsers.permissions")}</TableCell>
          <TableCell classes={cellStyle} className={clsx(classes.flex2, classes.noBorderOnLastCell)} align='center'>
          </TableCell>
        </TableRow>
      </TableHead>
    )
  }

  const renderTable = () => {
    return (
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== 'xs' && renderTableHead()}
          {renderTableBody()}
        </Table>
      </TableContainer>
    )
  }

  const renderTableBody = () => {
    if (userList?.length === 0) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
          <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {userList?.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
  }

  const renderManagmentLine = () => {
    return (
      <Grid container className={clsx(classes.linePadding, classes.pb10)} spacing={2}>
        <Grid item md={8} xs={12} sm={12}>
          {
            userRoles.AllowSubUsers && <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.marginInlineStart5
              )}
              endIcon={<MdOutlinePersonAddAlt />}
              onClick={() => setOpenSaveUserDialog(true)}>
              {t('SubUsers.addUser')}
            </Button>
          }
        </Grid>
        <Grid item md={4} xs={12} sm={12} className={clsx(classes.groupsLableContainer)} >
          <Typography className={classes.groupsLable}>
            {`${totalRecord} ${t('SubUsers.users')}`}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderRow = (row: SubUserModel | any) => {
    return (row.UserName === subUserName || userRoles?.AllowSubUsers) && (
      <TableRow
        key={row.AspnetUserId}
        classes={rowStyle}
      >
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex2}>
          <b>{row.UserName}</b>
          <div>
            {t('common.CreationDate')}: <b>{moment(row.CreationDate).format(DateFormats.DATE_TIME_24)}</b>
          </div>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex2}>
          {row.Email}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={classes.flex1}>
          {row.Cellphone}
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex2, classes.p5, classes.dInlineBlock)}>
          <PermissionList list={row.UserPermissionsList} />
        </TableCell>
        <TableCell
          style={{ minHeight: 80 }}
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex2, classes.noBorderOnLastCell)}>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: SubUserModel) => {
    return (
      <TableRow
        key={row.AspnetUserId}
        component='div'
        classes={rowStyle}
      >
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }}>
          <Box className={classes.inlineGrid}>
            {/* @ts-ignore */}
            <CustomTooltip
              isSimpleTooltip={false}
              classes={classes}
              interactive={true}
              arrow={true}
              placement={'top'}
              title={<Typography noWrap={false}>{row.UserName}</Typography>}
              text={row.UserName}
            >
              <div className={clsx(classes.bold, classes.pt5, classes.f16, classes.w100)}>
                {row.UserName}
              </div>
            </CustomTooltip>
          </Box>
          <Box className={clsx(classes.pt5)}>
            {t("SubUsers.email")}: {row.Email}
          </Box>
          <Box className={clsx(classes.pt5)}>
            {t("SubUsers.cellphone")}: {row.Cellphone}
          </Box>
          <Box className={clsx(classes.pt5)}>
            <PermissionList list={row.UserPermissionsList} />
          </Box>
          <Box className={clsx(classes.pt5)}>
            {t('common.CreationDate')}: <b>{moment(row.CreationDate).format(DateFormats.DATE_TIME_24)}</b>
          </Box>
          {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={totalRecord}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val: any) => {
          dispatch(setRowsPerPage(val))
        }}
        // @ts-ignore
        rowsPerPageOptions={rowsOptions}
        page={searchData.PageNumber}
        onPageChange={(val: any) => {
          setSearchData({
            ...searchData,
            PageNumber: val,
            PageSize: rowsPerPage
          })
          isInitialRender.current = true;
        }}
      />
    )
  }

  //#endregion Data Table

  const getDeleteDialog = (subUser: SubUserModel) => ({
    title: t('common.Delete'),
    showDivider: false,
    content: (
      <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
        {t('SubUsers.deleteUserPrompt')}
      </Typography>
    ),
    cancelText: t('SubUsers.cancel'),
    confirmText: t('SubUsers.delete'),
    onConfirm: async () => {
      const response = await dispatch(save({ ...subUser, ActionType: eSubUserAction.Delete })) as any;
      switch (response?.payload?.StatusCode) {
        case 201: {
          setToastMessage(ToastMessages.USER_DELETED)
          setDialogType(null);
          getData();
          break;
        }
      }

    },
    onCancel: () => setDialogType(null)
  })

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    let currentDialog: any = {};
    if (type === 'Delete') {
      currentDialog = getDeleteDialog(data);
    }

    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={type === 'saveUser' ? clsx(classes.w50VW, classes.noMargin) : classes.maxWidth400}
          classes={classes}
          open={dialogType}
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
    <DefaultScreen
      currentPage='settings'
      subPage='SubUsers'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={'topSection'}>
        <Title Text={t('SubUsers.title')} classes={classes} />
        {renderSearchSection()}
      </Box>

      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {renderDialog()}
      {renderToast()}

      <User
        classes={classes}
        isOpen={openSaveUserDialog}
        onClose={() => setOpenSaveUserDialog(false)}
        onConfirm={(data: any) => saveUser(data)}
      />

      <SubUserChangePassword
        SubUser={selectedSubUser}
        Text={t('settings.changePassword.enterNewPassword')}
        classes={classes}
        SetToast={setToastMessage}
        IsOpen={openChangePasswordDialog}
        OnClose={() => setOpenChangePasswordDialog(false)}
        oldPasswordRequired={subUserName !== '' && !userRoles.AllowSubUsers}
      />

      {selectedSubUser && <Permissions
        showButtons={true}
        subUser={selectedSubUser}
        classes={classes}
        isOpen={openPermissionsDialog}
        onClose={() => setOpenPermissionsDialog(false)}
        onConfirm={saveUser}
      />}

      {openPermissionsHistoryDialog && <PermissionsHistory
        classes={classes}
        isOpen={openPermissionsHistoryDialog}
        subUser={selectedSubUser}
        onClose={() => setOpenPermissionsHistoryDialog(false)}
      />
      }
      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  )
}

export default SubUsers