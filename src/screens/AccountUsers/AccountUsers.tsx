import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography, FormControlLabel } from '@material-ui/core';
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
import { PageProperty, SetPageState } from '../../helpers/UI/SessionStorageManager';
import { sitePrefix } from '../../config';
import { AiOutlineHistory, AiOutlineLogin, AiOutlineUserDelete } from 'react-icons/ai';
import { ManagmentIcon, TablePagination } from '../../components/managment';
import { rowsOptions } from '../../helpers/Constants';
import { setRowsPerPage } from '../../redux/reducers/coreSlice';
import { SubAccountUsers } from '../../Models/SubAccount/SubAccounts';
import { DeleteIcon, EditIcon, PreviewIcon, SendIcon, ShareIcon } from '../../assets/images/managment';
import { BaseDialog } from '../../components/DialogTemplates/BaseDialog';
import SaveSubAccount from './SaveSubAccount';

const AccountUsers = ({ classes }: any) => {
  const { windowSize, isRTL, rowsPerPage } = useSelector((state: any) => state.core);
  const { subAccountList, isGlobal } = useSelector((state: any) => state.subAccount);
  const ToastMessages = useSelector((state: { whatsapp: { ToastMessages: toastProps } }) => state.whatsapp.ToastMessages);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ isSearching, setIsSearching ] = useState<boolean>(false);
  const [ showLoader, setShowLoader ] = useState<boolean>(false);
  const [ toastMessage, setToastMessage ] = useState<toastProps['SUCCESS']>(resetToastData);
  const [ accountSearch, setAccountSearch ] = useState('');
  const [ serachData, setSearchData ] = useState<any>({
    PageIndex: 1,
    PageSize: rowsPerPage,
    SearchTerm: "",
    IsDynamic: true
  });
  const [ dialogType, setDialogType ] = useState<{
    type: string;
    data: any
  } | null>(null);
  const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot }
  const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot }
  const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
  const [ page, setPage ] = useState(1);

  const getData = async (customSearch: any | never = null) => {
    
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

  const initPageState = (pageSize: Number, pageIndex: Number, props: any = null) => {
    const searchObject = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        SearchTerm: accountSearch,
        IsDynamic: true
    };
    setSearchData(searchObject);

    SetPageState({
        "PageName": `${sitePrefix}Groups/Dynamic`,
        "PageNumber": pageIndex,
        "SearchData": (serachData.SearchTerm !== '') ? {
            SearchTerm: serachData.SearchTerm,
            PageIndex: pageIndex,
            PageSize: pageSize
        } : null,
        "IsDynamic": true
    } as PageProperty);
  }

  const renderCellIcons = (row: SubAccountUsers) => {
    const { SubAccountId, SubAccountName, SubAccountManager, Balance } = row

    const iconsMap = [[
      {
        key: 'preview',
        uIcon: PreviewIcon,
        lable: t('campaigns.Image1Resource1.ToolTip'),
        remove: windowSize === 'xs',
        disable: false,
        rootClass: classes.paddingIcon,
        onClick: () => {
          setDialogType({ type: 'preview', data: {} });
          // pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`)
        }
      },
      {
        key: 'login',
        uIcon: AiOutlineLogin,
        lable: t('common.Login'),
        remove: windowSize === 'xs' || !isGlobal,
        disable: false,
        rootClass: clsx(classes.paddingIcon, classes.f18),
        onClick: () => {
          setDialogType({ type: 'login', data: {} });
          // pulseemNewTab(`PreviewCampaign.aspx?CampaignID=${CampaignID}&fromreact=true`)
        }
      },
      {
        key: 'edit',
        uIcon: EditIcon,
        disable: false,
        lable: t('campaigns.Image2Resource1.ToolTip'),
        remove: windowSize === 'xs' || !isGlobal,
        onClick: () => {
          setDialogType({ type: 'Preview', data: {} });
        },
        rootClass: classes.paddingIcon,
      },
      {
        key: 'duplicate',
        uIcon: SendIcon,
        lable: t('SubAccount.directAccount'),
        rootClass: classes.paddingIcon,
        disable: false,
        remove: windowSize === 'xs' || !isGlobal,
        onClick: () => {
          setDialogType({ type: 'DirectAccount', data: {} });
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
          setDialogType({ type: 'Delete', data: {} });
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
            initPageState(rowsPerPage, 1);
        }
    };

    return (
        <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
          <Grid item>
            <TextField
              variant="outlined"
              size="small"
              value={accountSearch}
              onKeyPress={handleKeyDown}
              onChange={(e: any) => setAccountSearch(e.target.value)}
              className={clsx(classes.textField, classes.minWidth252)}
              placeholder={t("common.search")}
            />
          </Grid>
          <Grid item>
            <Button
              onClick={() => initPageState(rowsPerPage, 1)}
              className={clsx(classes.btn, classes.btnRounded)}
              endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
            >
              {t("campaigns.btnSearchResource1.Text")}
            </Button>
          </Grid>
          {serachData.SearchTerm && (
            <Grid item>
              <Button
                onClick={() => {
                  const searchObject = {
                    ...serachData,
                    PageIndex: 1,
                    PageSize: rowsPerPage,
                    SearchTerm: "",
                    IsDynamic: true
                  };
                  setSearchData(searchObject);

                  SetPageState({
                    "PageName": `${sitePrefix}Groups/Dynamic`,
                    "PageNumber": 1,
                    "SearchData": searchObject,
                    "SearchTerm": "",
                    "IsDynamic": true
                  } as PageProperty);

                  setAccountSearch("");
                  getData(searchObject);
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
        {windowSize !== 'xs' && !isGlobal && <Grid item>
          <Button
            component="a"
            onClick={() => {
              // navigate(`${sitePrefix}Campaigns/Create`);
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
          !isGlobal && (
            <Grid item xs={windowSize === 'xs' && 12}>
              <Button
                component="a"
                href={`${sitePrefix}Campaigns/Archive`}
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                )}
                onClick={(e) => {
                  e.preventDefault();
                  // navigate(`${sitePrefix}Campaigns/Archive`)
                }}
                endIcon={<MdModeEditOutline />}
              >
                {t('common.Edit')}
              </Button>
            </Grid>
          )
        }
        {
          !isGlobal && (
            <Grid item xs={windowSize === 'xs' && 12}>
              <Button
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                )}
                endIcon={<FaTelegramPlane />}
                // onClick={() => setDialogType({ type: 'verifyEmail' })}
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
          !isGlobal && (
          <Grid item xs={windowSize === 'xs' && 12}>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
              )}
              endIcon={<AiOutlineUserDelete />}
              // onClick={() => setDialogType({ type: 'verifyEmail' })}
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

  const renderRow = (row: any) => {
    return (
      <TableRow
        key={row.ID}
        classes={rowStyle}>
        <TableCell
          classes={cellBodyStyle}
          align='center'
          className={isGlobal ? classes.flex1 : classes.flex2}>
            {row.SubAccountName}
            <div>
              {t('common.CreationDate')}
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
                {row.Balance}
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
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
              </TableCell>
              <TableCell
                classes={cellBodyStyle}
                align='center'
                className={classes.flex1}>
                  {row.Balance}
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
        page={page}
        onPageChange={(val: any) => setPage(val)}
      />
    )
  }

  const renderSubAccountFormDialog = () => {
		return {
			showDivider: false,
			title: t("SubAccount.addSubAccount"),
      showDefaultButtons: true,
			content: (
				<SaveSubAccount classes={classes} />
			),
			onConfirm: () => {
				// setIsFileSelected(true);
			},
			onCancel: () => setDialogType(null)
		};
	}

  const renderHistoryDialog = () => {
		return {
			showDivider: false,
			title: t("SubAccount.showHistory"),
			content: (
				<>
          This is renderHistoryDialog
        </>
			),
			onConfirm: () => setDialogType(null),
			onCancel: () => setDialogType(null)
		};
	}

  const renderDirectAccountDialog = () => {
		return {
			showDivider: false,
			title: t("common.documentGallery"),
			content: (
				<>
          This is renderDirectAccountDialog
        </>
			),
			onConfirm: () => {
				// setIsFileSelected(true);
			},
			onCancel: () => setDialogType(null)
		};
	}

  const getDeleteDialog = () => ({
		title: t('common.Delete'),
		showDivider: false,
		content: (
			<Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
				{t('SubAccount.deleteSubAccount')}
			</Typography>
		),
		cancelText: t('common.No'),
		confirmText: t('common.Yes')
	})

  const renderDialog = () => {
    const { type, data } = dialogType || {}

    let currentDialog: any = {};
		if (type === 'HistoryDialog') {
			currentDialog = renderHistoryDialog();
		} else if (type === 'DirectAccount') {
			currentDialog = renderDirectAccountDialog();
		}else if (type === 'Preview') {
			currentDialog = renderHistoryDialog();
		} else if (type === 'Delete') {
			currentDialog = getDeleteDialog();
		}

    if (type) {
      return (
        dialogType && <BaseDialog
          contentStyle={type === 'SaveSubAccount' ? clsx(classes.noMargin) : classes.maxWidth400}
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
      {renderDialog()}
      {renderToast()}
      <SaveSubAccount classes={classes} isOpen={dialogType?.type === 'SaveSubAccount'} onClose={() => setDialogType(null)} />
      <Loader isOpen={showLoader} />
    </DefaultScreen>
  )
}

export default AccountUsers