import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { MdArrowBackIos, MdArrowForwardIos, MdInput, MdModeEditOutline, MdOutlinePersonAddAlt } from 'react-icons/md';
import { FaHistory, FaTelegramPlane } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import DefaultScreen from '../DefaultScreen';
import { Title } from '../../components/managment/Title';
import { Loader } from '../../components/Loader/Loader';
import { toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
import { sitePrefix } from '../../config';
import { AiOutlineLogin, AiOutlineUserDelete } from 'react-icons/ai';
import { ManagmentIcon, TablePagination } from '../../components/managment';
import { DateFormats, rowsOptions } from '../../helpers/Constants';
import { setRowsPerPage } from '../../redux/reducers/coreSlice';
import { SubAccountUsers } from '../../Models/SubAccount/SubAccounts';
import { DeleteIcon, EditIcon, PreviewIcon, SendIcon } from '../../assets/images/managment';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import SaveSubAccount from './SaveSubAccount';
import DirectAccount from './DirectAccount';
import CreditHistory from './CreditHistory';
import { DeleteSubAccounts, GetAccountDetails, GetDirectAccountDetails, GetSubAccountList } from '../../redux/reducers/SubAccountSlice';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const AccountUsers = ({ classes }: any) => {
  const navigate = useNavigate();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector((state: any) => state.core);
  const { accountId, subAccountList, isGlobal } = useSelector((state: any) => state.subAccount);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ isSearching, setIsSearching ] = useState<boolean>(false);
  const [ showLoader, setShowLoader ] = useState<boolean>(true);
  const [ toastMessage, setToastMessage ] = useState<toastProps['SUCCESS']>(resetToastData);
  const [ selectedAccountId, setSelectedAccountId ] = useState('');
  const [ searchData, setSearchData ] = useState<any>({
    PageNo: 1,
    PageSize: rowsPerPage,
    Search: "",
    CompanyAdmin: 0,
    IsPagination: true
  });
  const [ dialogType, setDialogType ] = useState<{
    type: string;
    data: any
  } | null>(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const [ direct, setDirect ] = useState<{
    emailDirect: null | number,
    SMSDirect: null | number,
    MMSDirect: null | number
  }>({
    emailDirect: null,
    SMSDirect: null,
    MMSDirect: null
  })
  moment.locale(language);

  useEffect(() => {
    getInitialData();
  }, []);
  
  useEffect(() => {
    setSearchData({
      ...searchData,
      PageSize: rowsPerPage
    });
    getData();
  }, [rowsPerPage]);

  const getInitialData = async () => {
    setShowLoader(true);
    if (accountId === null) dispatch(GetAccountDetails());
    const directData: any = await dispatch(GetDirectAccountDetails({
      ...searchData,
      CompanyAdmin: 1
    }));
    if ((directData?.payload?.Data?.Items || []).length > 0) {
      setDirect({
        emailDirect: directData?.payload?.Data?.Items[0]['DirectBulkEmails'],
        SMSDirect: directData?.payload?.Data?.Items[0]['DirectSMSCredits'],
        MMSDirect: directData?.payload?.Data?.Items[0]['DirectMmsCredits']
      })
    }
    getData();
  }
  
  const getData = async () => {
    setShowLoader(true);
    await dispatch(GetSubAccountList(searchData));
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

  const renderCellIcons = (row: SubAccountUsers) => {
    const iconsMap = [[
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        disable: false,
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({ type: 'HistoryDialog', data: row.CustomGuidEnc });
        }
      },
      {
        key: 'login',
        uIcon: AiOutlineLogin,
        lable: t('common.Login'),
        remove: windowSize === 'xs' || !isGlobal,
        disable: false,
        rootClass: clsx(classes.paddingIcon, classes.f18),
        onClick: () => navigate(`/Pulseem/MiddleWareReactLogin.aspx?encSubAccountID=${row.CustomGuidEnc}`)
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: false,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize === 'xs' || !isGlobal,
        onClick: () => {
          setDialogType({
            type: 'SaveSubAccount',
            data: row
          })
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'directAccount',
        uIcon: SendIcon,
        lable: t('SubAccount.directAccount'),
        rootClass: classes.paddingIcon,
        disable: false,
        remove: windowSize === 'xs' || !isGlobal,
        onClick: () => {
          setDialogType({ type: 'DirectAccount', data: row.CustomGuidEnc });
        }
      },
      {
        key: 'delete',
        uIcon: DeleteIcon,
        lable: t('campaigns.DeleteResource1.HeaderText'),
        rootClass: classes.paddingIcon,
        disable: false,
        showPhone: true,
        remove: windowSize === 'xs' || !isGlobal,
        onClick: () => {
          setDialogType({ type: 'Delete', data: row.CustomGuidEnc });
        }
      }
    ]]
    return (
      <Grid
        container
        direction={windowSize === 'sm' ? 'column' : 'row'}
        justifyContent={!isGlobal ? 'center' : (windowSize === 'xs' ? 'flex-start' : 'flex-end')}
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
                <Grid
                  style={{ flex: 1, alignItems: 'center', position: 'relative' }}
                  className={clsx(icon.disable && classes.disabledCursor, 'rowIconContainer', classes.justifyCenter, classes.alignSelfCenter)}
                  key={icon.key}
                  item>
                  {/* {icon?.errorElement} */}
                  {/* @ts-ignore */}
                  <ManagmentIcon
                    classes={classes}
                    {...icon}
                    uIcon={<icon.uIcon width={18} height={20} className={'rowIcon'} />}
                  />
                  {/* {icon.key === 'copy' && renderCopyToClipoard} */}
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
              value={searchData.Search}
              onKeyPress={handleKeyDown}
              onChange={(e: any) => setSearchData({
                ...searchData,
                Search: e.target.value
              })}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={t("common.search")}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                getData();
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
                  const searchObject = {
                    PageNo: 1,
                    PageSize: rowsPerPage,
                    Search: "",
                    CompanyAdmin: 0,
                    IsPagination: true
                  };
                  setSearchData(searchObject);

                  setShowLoader(true);
                  setIsSearching(false);
                  await dispatch(GetSubAccountList(searchObject));
                  setShowLoader(false);
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
          {/* @ts-ignore */}
          <TableCell classes={cellStyle} className={isGlobal ? classes.flex1 : classes.flex2} align='center'>{t("SubAccount.userName")}</TableCell>
          {/* @ts-ignore */}
          <TableCell classes={cellStyle} className={isGlobal ? classes.flex1 : classes.flex2} align='center'>{t("SubAccount.userManager")}</TableCell>
          {
            isGlobal && <TableCell classes={cellStyle} className={isGlobal ? classes.flex1 : classes.flex2} align='center'>{t("SubAccount.balance")}</TableCell>
          }
          {
            !isGlobal && (
              <>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.emailBulk")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.SMSBulk")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.MMSBulk")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.monthlyEmailLimit")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.monthlySMSLimit")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountBulkEmails")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountSMSCredits")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountMMSCredits")}</TableCell>
              </>
            )
          }
          {/* @ts-ignore */}
          <TableCell classes={cellStyle} className={clsx(isGlobal ? classes.flex3 : classes.flex1, classes.noBorderOnLastCell)} align='center'>
            {/* {t("SubAccount.transferHistory")} */}
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
    if (subAccountList.length === 0) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
          <Typography>{t("common.NoDataTryFilter")}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {subAccountList.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
      </TableBody>
    )
  }

  const renderManagmentLine = () => {
    return (
      <Grid container spacing={2} className={clsx(classes.linePadding, classes.pb10)} >
        {windowSize !== 'xs' && !isGlobal && selectedAccountId && <Grid item>
          <Button
            component="a"
            onClick={() => {
              navigate(`/Pulseem/MiddleWareReactLogin.aspx?encSubAccountID=${selectedAccountId}`);
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={<MdInput />}
          >
            {t('common.Login')}
          </Button>
        </Grid>}
        {windowSize !== 'xs' && <Grid item>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={<MdOutlinePersonAddAlt />}
            onClick={() => setDialogType({
              type: 'SaveSubAccount',
              data: {}
            })}>
            {t('dashboard.add')}
          </Button>
        </Grid>}
        {
          !isGlobal && selectedAccountId && (
            <Grid item xs={windowSize === 'xs' && 12}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                )}
                onClick={(e) => {
                  const userDetails = subAccountList.filter((row: SubAccountUsers) => row.CustomGuidEnc === selectedAccountId);
                  setDialogType({
                    type: 'SaveSubAccount',
                    data: userDetails.length > 0 ? userDetails[0] : {}
                  })
                }}
                endIcon={<MdModeEditOutline />}
              >
                {t('common.Edit')}
              </Button>
            </Grid>
          )
        }
        {
          !isGlobal && selectedAccountId && (
            <Grid item xs={windowSize === 'xs' && 12}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                )}
                endIcon={<FaTelegramPlane />}
                onClick={() => setDialogType({ type: 'DirectAccount', data: selectedAccountId })}
              >
                {t('SubAccount.directAccount')}
              </Button>
            </Grid>
          )
        }
        <Grid item xs={windowSize === 'xs' && 12}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
            )}
            endIcon={<FaHistory />}
            onClick={() => setDialogType({ type: 'HistoryDialog', data: {} })}
          >
            {t('SubAccount.showHistory')}
          </Button>
        </Grid>
        {
          !isGlobal && selectedAccountId && (
          <Grid item xs={windowSize === 'xs' && 12}>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
              )}
              endIcon={<AiOutlineUserDelete />}
              onClick={() => setDialogType({ type: 'Delete', data: selectedAccountId })}
            >
              {t('common.Delete')}
            </Button>
          </Grid>
          )
        }
        <Grid item xs={windowSize === 'xs' && 12} className={classes.groupsLableContainer} >
          <Typography className={classes.groupsLable}>
            {/* {`${isSearching ? searchResults.length : newslettersParentCampaigns.length} ${t('campaigns.newsletters')}`} */}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  const renderRow = (row: SubAccountUsers) => {
    return (
      <TableRow
        key={row.CustomGuidEnc}
        classes={rowStyle}
        onClick={() => setSelectedAccountId(row.CustomGuidEnc)}
        hover={!isGlobal}
        selected={!isGlobal && row.CustomGuidEnc === selectedAccountId}
      >
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={isGlobal ? classes.flex1 : classes.flex2}>
            <b>{row.SubAccountName}</b>
            <div>
              {t('common.CreationDate')}: <b>{moment(row.CreationDate).format(DateFormats.FULL_DATE)}</b>
            </div>
        </TableCell>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={isGlobal ? classes.flex1 : classes.flex2}>
            {row.SubAccountManager}
        </TableCell>
        {
          isGlobal && (
            <TableCell
              classes={cellBodyStyle}
              align='center'
              className={isGlobal ? classes.flex1 : classes.flex2}>
                {row.FinalGlobalBalance}
            </TableCell>
          )
        }
        {
          !isGlobal && (
            <>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.BulkEmail}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.BulkSMS}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.BulkMMS}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.MaxMailSendingForMonth}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.MaxSMSSendingForMonth}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.DirectBulkEmails}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.DirectSMSCredits}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.DirectSMSCredits}
              </TableCell>
            </>
          )
        }
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={clsx(isGlobal ? classes.flex3 : classes.flex1, classes.noBorderOnLastCell)}>
            {renderCellIcons(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPhoneRow = (row: any) => {
    return (
      <TableRow
        key={row.ID}
        component='div'
        classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: classes.tableCellRoot }}>
          <Box className={classes.justifyBetween}>
            <Box className={classes.inlineGrid}>
              {/* {renderNameCell(row)} */}
            </Box>
            <Box>
              {/* {renderStatusCell(row.Status)} */}
            </Box>
          </Box>
          {/* {renderActionCell(row.Status)} */}
        </TableCell>
      </TableRow>
    )
  }

  const renderTablePagination = () => {
    return (
      <TablePagination
        classes={classes}
        rows={subAccountList.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val: any) => dispatch(setRowsPerPage(val))}
        rowsPerPageOptions={rowsOptions}
        page={searchData.PageNo}
        onPageChange={(val: any) => setSearchData({
          ...searchData,
          PageNo: val
        })}
      />
    )
  }

  const renderHistoryDialog = (id: string = '') => {
		return {
			showDivider: false,
			title: t("SubAccount.showHistory"),
			content: <CreditHistory classes={classes} id={id} />,
			onConfirm: () => setDialogType(null),
			onCancel: () => setDialogType(null)
		};
	}

  const getDeleteDialog = (id: string = '') => ({
		title: t('common.Delete'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{t('SubAccount.deleteSubAccount')}
			</Typography>
		),
		cancelText: t('common.No'),
		confirmText: t('common.Yes'),
    onConfirm: async () => {
      setDialogType(null);
      setShowLoader(true);
      const response: any = await dispatch(DeleteSubAccounts(id));
      if (response?.payload?.StatusCode === 1) {
        setToastMessage({ severity: 'success', color: 'success', message: t('SubAccount.subAccountDeleted'), showAnimtionCheck: false });  
        getData();
      } else {
        setToastMessage({ severity: 'error', color: 'error', message: t('SubAccount.subAccountDeletionFailed'), showAnimtionCheck: false });  
      }
      setShowLoader(false);
    },
    onCancel: () => setDialogType(null)
	})

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    let currentDialog: any = {};
		if (type === 'HistoryDialog') {
			currentDialog = renderHistoryDialog(data);
    } else if (type === 'Delete') {
			currentDialog = getDeleteDialog(data);
		}

    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={type === 'HistoryDialog' ? clsx(classes.noMargin, classes.w70VW) : classes.maxWidth400}
          classes={classes}
          open={dialogType}
          // childrenStyle={classes.mb25}
          onClose={() => setDialogType(null)}
          onCancel={() => setDialogType(null)}
          {...currentDialog}>
          {currentDialog.content}
        </BaseDialog>
      )
    }
    return <></>
  }

  const getDirectBox = (label: string, value: null | number) => {
    return (
      <div className={clsx(classes.whiteBox, classes.p20, classes.mlr10, classes.txtCenter, classes.w20VW)}>
        <div className={classes.p10}>{t(label)}</div>
        <div className={classes.pb10}>{value || 0}</div>
      </div>
    )
  }

  return (
    <DefaultScreen
      currentPage='newsletter'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={'topSection'}>
        <Title Text={t('SubAccount.title')} classes={classes} />
        {renderSearchSection()}
      </Box>

      {renderManagmentLine()}
      {renderTable()}
      {renderTablePagination()}
      {
        !isGlobal && (
          <Box className={clsx(classes.justifyCenterOfCenter, classes.w100, classes.semibold)}>
            {direct.emailDirect !== null && getDirectBox('SubAccount.emailDirect', direct.emailDirect)}
            {direct.SMSDirect !== null && getDirectBox('SubAccount.SMSDirect', direct.SMSDirect)}
            {direct.SMSDirect !== null && getDirectBox('SubAccount.MMSDirect', direct.SMSDirect)}
          </Box>
        )
      }
      {renderDialog()}
      {renderToast()}
      <SaveSubAccount classes={classes} isOpen={dialogType?.type === 'SaveSubAccount'} onClose={() => setDialogType(null)} subAccountRecord={dialogType?.data} />
      <DirectAccount classes={classes} isOpen={dialogType?.type === 'DirectAccount'} onClose={() => setDialogType(null)} />
      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  )
}

export default AccountUsers