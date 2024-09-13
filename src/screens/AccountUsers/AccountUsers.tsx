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
import { CommonRedux, toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
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
import { DeleteSubAccounts, GetDirectAccountDetails, GetSubAccountList } from '../../redux/reducers/SubAccountSlice';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import { sitePrefix } from '../../config';
import { get } from 'lodash';

const AccountUsers = ({ classes }: any) => {
  const navigate = useNavigate();
  const { language, windowSize, isRTL, rowsPerPage } = useSelector((state: any) => state.core);
  const { isGlobal, currencySymbol, isCurrencySymbolPrefix, subAccount } = useSelector((state: { common: CommonRedux }) => state.common);
  const { subAccountList } = useSelector((state: any) => state.subAccount);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ isSearching, setIsSearching ] = useState<boolean>(false);
  const [ showLoader, setShowLoader ] = useState<boolean>(true);
  const [ toastMessage, setToastMessage ] = useState<toastProps['SUCCESS']>(resetToastData);
  const [ selectedAccountId, setSelectedAccountId ] = useState('');
  const [ totalRecord, setTotalRecord ] = useState<number>(0);
  const [ searchData, setSearchData ] = useState<any>({
    PageNo: 1,
    Search: "",
    CompanyAdmin: 0,
    IsPagination: true
  });
  const [ dialogType, setDialogType ] = useState<{
    type: string;
    data: any
  } | null>(null);
  const rowStyle = { head: clsx(classes.tableRowHead, classes.pt10, classes.pb10), root: classes.tableRowRoot }
  const cellStyle = { head: clsx(classes.tableCellHead, classes.noPadding, classes.f16), body: classes.tableCellBody, root: clsx(classes.tableCellRoot, classes.p0) }
  const cellBodyStyle = { body: clsx(classes.tableCellBody, classes.f16), root: clsx(classes.tableCellRoot, classes.noPadding) }
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
    if (get(subAccount, 'CompanyAdmin', false) === false) navigate(`${sitePrefix}`);
    else getInitialData();
  }, []);
  
  useEffect(() => {
    getData();
  }, [rowsPerPage, searchData.PageNo]);

  const getInitialData = async () => {
    setShowLoader(true);
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
    const response = await dispatch(GetSubAccountList({
      ...searchData,
      PageSize: rowsPerPage
    }));
    setTotalRecord(Number(get(response, 'payload.Data.TotalRecord', 0)));
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
        onClick: () => window.location.href = `/Pulseem/MiddleWareReactLogin.aspx?encSubAccountID=${row.CustomGuidEnc}`
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: false,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize !== 'xs' && !isGlobal,
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
          setDialogType({ type: 'DirectAccount', data: row });
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
        justifyContent={!isGlobal && windowSize !== 'xs' ? 'center' : (windowSize === 'xs' ? 'flex-start' : 'flex-end')}
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
                    textClass={classes.f14}
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
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.SMSCredit")}</TableCell>
                {/* <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.MMSCredit")}</TableCell> */}
                {/* <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.monthlyEmailLimit")}</TableCell> */}
                {/* <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.monthlySMSLimit")}</TableCell> */}
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountBulkEmails")}</TableCell>
                <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountSMSCredits")}</TableCell>
                {/* <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("SubAccount.directAccountMMSCredits")}</TableCell> */}
              </>
            )
          }
          {/* @ts-ignore */}
          <TableCell classes={cellStyle} className={clsx(isGlobal ? classes.flex3 : classes.flex1, classes.noBorderOnLastCell)} align='center'>
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
        <Grid item md={8} xs={12} sm={12}>
          {windowSize !== 'xs' && !isGlobal && selectedAccountId && <>
            <Button
              component="a"
              onClick={() => {
                window.location.href = `/Pulseem/MiddleWareReactLogin.aspx?encSubAccountID=${selectedAccountId}`
              }}
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.marginInlineStart5
              )}
              endIcon={<MdInput />}
            >
              {t('common.Login')}
            </Button>
          </>}
          {
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.marginInlineStart5
              )}
              endIcon={<MdOutlinePersonAddAlt />}
              onClick={() => setDialogType({
                type: 'SaveSubAccount',
                data: {}
              })}>
              {t('dashboard.add')}
            </Button>
          }
          {
            !isGlobal && selectedAccountId && (
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.marginInlineStart5
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
            )
          }
          {
            !isGlobal && selectedAccountId && (
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.marginInlineStart5
                )}
                endIcon={<FaTelegramPlane />}
                onClick={() => {
                  const userDetails = subAccountList.filter((row: SubAccountUsers) => row.CustomGuidEnc === selectedAccountId);
                  setDialogType({
                    type: 'DirectAccount',
                    data: userDetails.length > 0 ? userDetails[0] : {}
                  })
                }}
              >
                {t('SubAccount.directAccount')}
              </Button>
            )
          }
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.marginInlineStart5
            )}
            endIcon={<FaHistory />}
            onClick={() => setDialogType({ type: 'HistoryDialog', data: '' })}
          >
            {t('SubAccount.showHistory')}
          </Button>
          {
            !isGlobal && selectedAccountId && (
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.marginInlineStart5
                )}
                endIcon={<AiOutlineUserDelete />}
                onClick={() => setDialogType({ type: 'Delete', data: selectedAccountId })}
              >
                {t('common.Delete')}
              </Button>
            )
          }
        </Grid>
        <Grid item md={4} xs={12} sm={12} className={clsx(classes.groupsLableContainer)} >
          <Typography className={classes.groupsLable}>
            {`${subAccountList.length} ${t('SubAccount.title')}`}
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
              {t('common.CreationDate')}: <b>{moment(row.CreationDate).format(DateFormats.DATE_TIME_24)}</b>
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
                <Typography className={clsx(classes.middleText, classes.bold)}>
                  { isCurrencySymbolPrefix ? currencySymbol : '' } {row.FinalGlobalBalance} { !isCurrencySymbolPrefix ? currencySymbol : '' }
                </Typography>
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
              {/* <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.BulkMMS}
              </TableCell> */}
              {/* <TableCell
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
              </TableCell> */}
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
              {/* <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.DirectMmsCredits}
              </TableCell> */}
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

  const renderPhoneRow = (row: SubAccountUsers) => {
    return (
      <TableRow
        key={row.CustomGuidEnc}
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
              title={<Typography noWrap={false}>{row.SubAccountName}</Typography>}
              text={row.SubAccountName}
            >
              <div className={clsx(classes.bold, classes.pt5, classes.f16, classes.w100)}>
                {row.SubAccountName}
              </div>
            </CustomTooltip>
          </Box>
          <Box className={clsx(classes.pt5)}>
            {t("SubAccount.userManager")}: {row.SubAccountManager}
          </Box>
          <Box className={clsx(classes.pt5)}>
            <Typography className={classes.grayTextCell}>
              {t('common.CreationDate')}: <b>{moment(row.CreationDate).format(DateFormats.DATE_TIME_24)}</b>
            </Typography>
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
			onCancel: () => setDialogType(null),
      showDefaultButtons: false
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
          contentStyle={type === 'HistoryDialog' ? clsx(classes.noMargin) : classes.maxWidth400}
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

  const getDirectBox = (label: string, value: null | number) => {
    return (
      <div className={clsx(classes.whiteBox, classes.p10, classes.mlr10, classes.txtCenter, classes.w15VW, classes.f18)}>
        <div className={classes.p5}>{t(label)}</div>
        <div className={clsx(classes.pb5, classes.f20)}>{value || 0}</div>
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
      { isGlobal !== null && renderTable()}
      {renderTablePagination()}
      {
        !isGlobal && (
          <Box className={clsx(classes.justifyCenterOfCenter, classes.w100, classes.semibold)}>
            {direct.emailDirect !== null && getDirectBox('SubAccount.emailDirect', direct.emailDirect)}
            {direct.SMSDirect !== null && getDirectBox('SubAccount.SMSDirect', direct.SMSDirect)}
            {direct.MMSDirect !== null && getDirectBox('SubAccount.MMSDirect', direct.MMSDirect)}
          </Box>
        )
      }
      {renderDialog()}
      {renderToast()}
      <SaveSubAccount
        classes={classes}
        isOpen={dialogType?.type === 'SaveSubAccount'}
        onClose={(isReload: boolean = false) => {
          setDialogType(null);
          if (isReload) getData();
        }}
        subAccountRecord={dialogType?.data}
      />
      <DirectAccount
        classes={classes}
        isOpen={dialogType?.type === 'DirectAccount'}
        onClose={(isReload: boolean = false) => {
          setDialogType(null);
          if (isReload) getData();
        }}
        subAccountRecord={dialogType?.data}
      />
      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  )
}

export default AccountUsers