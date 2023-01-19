import clsx from 'clsx';
import 'moment/locale/he';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@material-ui/icons/Clear';
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../../../../components/Loader/Loader';
import { exportFile } from '../../../../helpers/exportFromJson';
import { ClientStatus } from '../../../../helpers/PulseemArrays';
import { EditIcon, ExportIcon, SearchIcon } from '../../../../assets/images/managment/index';
import { ExportFileTypes } from '../../../../model/Export/ExportFileTypes';
import { getGroupsBySubAccountId } from "../../../../redux/reducers/groupSlice";
import AddRecipientPopup from "../../../Groups/Management/Popup/AddRecipientPopup";
import { Dialog, TablePagination, ManagmentIcon, DateField } from '../../../../components/managment/index';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { getSmsReplies, getSmsRepliesById, getAccountExtraData } from '../../../../redux/reducers/smsSlice';
import { deleteFromGroups, removeEmailClient, removeSmsClient, getClientsById } from "../../../../redux/reducers/clientSlice";
import { preferredOrder, formatDateTime, emailStatusNumberToString, smsStatusNumberToString } from '../../../../helpers/exportHelper';
import { Link, Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box } from '@material-ui/core'


const SmsReplies = ({ classes, ...other }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const rowsOptions = [6, 10, 20, 50];
    const dateFormat = 'YYYY-MM-DD HH:mm:ss:FFF';
    const [dialog, setDialog] = useState(null);
    const [showLoader, setShowLoader] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [selectedClients, setSelectedClients] = useState([]);
    const { smsReplies } = useSelector(state => state.sms);
    const { ToastMessages } = useSelector(state => state.client);
    const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0]);
    const { accountFeatures, windowSize } = useSelector(state => state.core);
    const { groupData, subAccountAllGroups } = useSelector((state) => state.group);
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const { id } = useParams();
    const defaultRequest = {
        FromDate: null,
        ToDate: null,
        FromNumber: null,
        ToNumber: null,
        Text: null,
        CampaignID: null,
        PageIndex: 1,
        PageSize: rowsPerPage,
        IsExport: false
    };
    const [request, setRequest] = useState(defaultRequest);
    const [searchRequest, setSearchRequest] = useState(defaultRequest)

    const DialogType = {
        EDIT_RECIPIENT: "EDIT_RECIPIENT",
        CONFIRM_DELETE_FROM_GROUPS: "CONFIRM_DELETE_FROM_GROUPS",
        CONFIRM_REMOVE_EMAIL: "CONFIRM_REMOVE_EMAIL",
        CONFIRM_REMOVE_PHONE: "CONFIRM_REMOVE_PHONE",
        UNSUB_RECIPIENT: "UNSUB_RECIPIENT",
        CONFIRM_INVALID: "CONFIRM_INVALID",
        EXPORT_FORMAT: "EXPORT_FORMAT"
    };


    const getReplies = async () => {
        await dispatch(getSmsReplies({ ...request, PageSize: rowsPerPage, PageIndex: page }));
    }
    const getRepliesById = async () => {
        await dispatch(getSmsRepliesById(id));
    }

    useEffect(() => {
        const initExtraFields = async () => {
            dispatch(getAccountExtraData());
            if (subAccountAllGroups.length === 0) {
                dispatch(getGroupsBySubAccountId());
            }
        }
        initExtraFields();
    }, [dispatch]);

    useEffect(() => {
        if (id && id > 0) {
            getRepliesById(id);
        }
        else {
            getReplies();
        }
        setShowLoader(false);
    }, [request, page, rowsPerPage])

    const handlePageChange = (val) => {
        setRowsPerPage(val);
        setRequest({ ...request, PageSize: val });
    }

    const renderHeader = () => {
        return (
            <>
                {/* <Divider /> */}
                <Grid container spacing={2} className={classes.linePadding} >
                    {accountFeatures?.indexOf('13') === -1 && windowSize !== 'xs' && <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonGreen,
                                smsReplies && smsReplies?.Data?.length > 0 ? null : classes.disabled
                            )}
                            onClick={() => setDialog('exportFormat')}
                            startIcon={<ExportIcon />}>
                            {t('campaigns.exportFile')}
                        </Button>
                    </Grid>}
                    <Grid item className={classes.groupsLableContainer} >
                        <Typography className={classes.groupsLable}>
                            {`${smsReplies?.Message} ${t('common.Clients')}`}
                        </Typography>
                    </Grid>
                </Grid>
            </>
        )
    }

    const exportColumnHeader = {
        "ClientID": t('client.ClientId'),
        "FirstName": t('smsReport.firstName'),
        "LastName": t('smsReport.lastName'),
        "Email": t('common.Email'),
        "Cellphone": t('common.cellphone'),
        "CreationDate": t('common.CreationDate'),
        "SmsStatus": t('common.smsStatus'),
        "Status": t('common.Status'),
        "ExtraField1": t('common.ExtraField1'),
        "ExtraField2": t('common.ExtraField2'),
        "ExtraField3": t('common.ExtraField3'),
        "ExtraField4": t('common.ExtraField4'),
        "ExtraField5": t('common.ExtraField5'),
        "ExtraField6": t('common.ExtraField6'),
        "ExtraField7": t('common.ExtraField7'),
        "ExtraField8": t('common.ExtraField8'),
        "ExtraField9": t('common.ExtraField9'),
        "ExtraField10": t('common.ExtraField10'),
        "ExtraField11": t('common.ExtraField11'),
        "ExtraField12": t('common.ExtraField12'),
        "ExtraField13": t('common.ExtraField13'),
        "ReplyDate": t('common.ReplyDate'),
        "ReplyText": t('common.ReplyText'),

    }

    const handleDownloadCsv = async (formatType) => {
        setDialog(null);
        setShowLoader(true);
        let orderList = preferredOrder(smsReplies?.Data, Object.keys(exportColumnHeader));
        orderList = await emailStatusNumberToString(t, orderList, ClientStatus.Email);
        orderList = await smsStatusNumberToString(t, orderList, ClientStatus.Sms);
        orderList = await formatDateTime(orderList);
        exportFile({
            data: orderList,
            fileName: `ResponsesReport${id ? '_' + id : ''}`,
            exportType: formatType,
            fields: exportColumnHeader
        });
        setShowLoader(false)
    }

    const renderDateFields = () => {
        const handleFromDate = (val) => {
            if (val) {
                let dateVal = moment(val).startOf('day').format('YYYY-MM-DD HH:mm') || null;
                setSearchRequest({ ...searchRequest, FromDate: dateVal });
            }
        }

        const handleToDate = (val) => {
            if (val) {
                let dateVal = moment(val).endOf('day').format('YYYY-MM-DD HH:mm') || null;
                setSearchRequest({ ...searchRequest, ToDate: dateVal });
            }
        }

        return (
            <>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.FromDate}
                        onChange={(v) => handleFromDate(v)}
                        placeholder={t('mms.locFromDateResource1.Text')}
                        rootStyle={classes.maxWidth190}
                        toolbarDisabled={false}
                        minDate={'2000-01-01'}
                        isRoundedOnMobile={windowSize === 'xs'}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.ToDate}
                        onChange={(v) => handleToDate(v)}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={searchRequest.FromDate ? searchRequest.FromDate : moment.now()}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                        isRoundedOnMobile={windowSize === 'xs'}
                    />
                </Grid>
                {windowSize !== 'xs' && <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
                    />
                </Grid>
                }
            </>
        )
    }
    const renderAdvanceSearch = () => {
        return (
            <>
                <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        value={searchRequest.FromNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.FrmNumber')}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        type='tel'
                        variant='outlined'
                        size='small'
                        value={searchRequest.ToNumber}
                        onChange={(e) => setSearchRequest({ ...searchRequest, ToNumber: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.ToNumber')}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.FromDate}
                        onChange={(e) => setSearchRequest({ ...searchRequest, FromDate: e.target.value })}
                        placeholder={t('mms.locFromDateResource1.Text')}
                        rootStyle={classes.maxWidth190}
                        toolbarDisabled={false}
                        minDate={'2000-01-01'}
                    />
                </Grid>
                <Grid item>
                    <DateField
                        classes={classes}
                        value={searchRequest.ToDate}
                        onChange={(e) => setSearchRequest({ ...searchRequest, ToDate: e.target.value })}
                        placeholder={t('mms.locToDateResource1.Text')}
                        minDate={searchRequest.FromDate ? searchRequest.FromDate : '2000-01-01'}
                        toolbarDisabled={false}
                        rootStyle={classes.maxWidth190}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={searchRequest.Text}
                        onChange={(e) => setSearchRequest({ ...searchRequest, Text: e.target.value })}
                        className={clsx(classes.textField, classes.minWidth252)}
                        placeholder={t('common.messageContent')}
                    />
                </Grid>
            </>
        )
    }
    const handleSearch = () => {
        setIsSearching(true);
        setPage(1);
        setRequest({ ...request, ...searchRequest });
    }
    const renderSearchLine = () => {
        const { sms = false } = isSearching || {};
        return (
            <Grid container spacing={2} className={clsx(classes.lineTopMarging, classes.mb50)}>
                {advanceSearch ? renderAdvanceSearch() : renderDateFields()}
                <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={handleSearch}
                        className={classes.searchButton}
                        endIcon={<SearchIcon />}>
                        {t('campaigns.btnSearchResource1.Text')}
                    </Button>
                    {windowSize !== 'xs' && <Link
                        color='initial'
                        component='button'
                        underline='none'
                        onClick={() => setAdvanceSearch(!advanceSearch)}
                        className={clsx(classes.dBlock, classes.mt1, advanceSearch && windowSize === 'lg' ? classes.mb15 : null)}>
                        {t(!advanceSearch ? 'report.AdvanceSearch' : 'report.closeAdvanceSearch')}
                    </Link>
                    }
                </Grid>
                {isSearching && <Grid item>
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            setRequest(defaultRequest)
                            setIsSearching(false);
                        }}
                        className={classes.searchButton}
                        endIcon={<ClearIcon />}>
                        {t('common.clear')}
                    </Button>
                </Grid>
                }
            </Grid>
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

    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('common.SentFromNumber')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('report.clientName')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.smsStatus")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.emailStatus")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.ReplyDate")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex5} align='center' >{t("common.messageContent")}</TableCell>
                    {/* <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex1} ></TableCell> */}
                </TableRow>
            </TableHead>
        )
    }
    const renderTableBody = () => {
        let rowData = smsReplies?.Data;

        if (!rowData) {
            return <></>
        }

        return (
            <TableBody>
                {rowData
                    .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
            </TableBody>
        )
    }
    const statusToText = (status, type) => {
        let translatedStatus = status;
        if (type === 'email') {
            translatedStatus = ClientStatus.Email.find((x) => { return x.id === status });
            translatedStatus = translatedStatus ?? { value: 'common.noEmail' };
        }
        else {
            translatedStatus = ClientStatus.Sms.find((x) => { return x.id === status });
            translatedStatus = translatedStatus ?? { value: 'common.noSms' };
        }
        return t(translatedStatus?.value);
    }

    const renderRow = (row, index) => {
        const {
            ClientID,
            FirstName,
            LastName,
            Email,
            CellPhone,
            CreationDate,
            SmsStatus,
            Status,
            ReplyDate,
            ReplyText,
            VirtualNumber
        } = row;

        let creation = moment(CreationDate, dateFormat);
        let reply = moment(ReplyDate, dateFormat);
        return (
            <TableRow
                key={index}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    <Typography className={classes.font18}>{VirtualNumber}</Typography>
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex2, classes.ellipsisText)}>
                    <Grid
                        key={'edit'}
                        style={{ maxWidth: 100 }}
                        item>
                        <Box className={classes.dFlex}>
                            <Box>
                                <Typography className={classes.font18}>{CellPhone}</Typography>
                                <Typography className={clsx(classes.font13, classes.ellipsisText)}
                                    style={{ maxWidth: 80 }}
                                    title={`${FirstName} ${LastName}`}
                                >{FirstName} {LastName}</Typography>
                            </Box>
                            <Box>
                                <ManagmentIcon
                                    key='edit'
                                    classes={classes}
                                    icon={EditIcon}
                                    iconClass={clsx(
                                        classes.smallIcon,
                                        ClientID > 0 ? null : classes.disabled)
                                    }
                                    rootClass={classes.paddingIcon}
                                    onClick={async () => {
                                        setShowLoader(true);
                                        setSelectedClients([row.ClientID]);
                                        const recipientRequest = await dispatch(getClientsById([row.ClientID]));
                                        const clientToEdit = recipientRequest?.payload?.Data[0];
                                        setClientToEdit(clientToEdit);
                                        setDialog(DialogType.EDIT_RECIPIENT);
                                        setShowLoader(false);
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {statusToText(SmsStatus, 'sms')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {statusToText(Status, 'email')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {reply.format('DD/MM/YYYY')} {reply.format('HH:mm:ss')}
                </TableCell>
                <TableCell
                    classes={{ root: classes.tableCellRoot }}
                    align='center'
                    className={classes.flex5}>
                    {ReplyText}
                </TableCell>
            </TableRow >
        )
    }

    const renderPhoneRow = (row) => {
        return <></>
    }

    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={smsReplies?.Message}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handlePageChange}
                rowsPerPageOptions={rowsOptions}
                page={page}
                onPageChange={setPage}
            />
        )
    }
    const showDialog = () => {
        if (dialog !== null) {
            switch (dialog) {
                case DialogType.EDIT_RECIPIENT: {
                    let mappedGroups = [];

                    return <AddRecipientPopup
                        classes={classes}
                        isOpen={selectedClients.length === 1 && dialog === DialogType.EDIT_RECIPIENT}
                        onClose={() => { setDialog(null); setSelectedClients([]); }}
                        setLoader={showLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        Groups={groupData?.Groups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], []) || []}
                        DialogType={DialogType}
                        selectedGroups={mappedGroups}
                        setDialog={setDialog}
                        handleResponses={(response, actions) => { handleResponses(response, actions); }}
                        onAddRecipient={(closeDialog = true) => {
                            closeDialog && setDialog(null);
                        }}
                        recipientData={clientToEdit}
                    />
                }
                // case DialogType.CONFIRM_INVALID:
                case DialogType.CONFIRM_DELETE_FROM_GROUPS:
                case DialogType.CONFIRM_REMOVE_EMAIL:
                case DialogType.CONFIRM_REMOVE_PHONE:
                    {
                        return ConfirmDialog()
                    }
                default: {
                    return <></>
                }
            }
        }
        return <></>;
    }
    const ConfirmDialog = () => {
        const DialogObject = {
            // "CONFIRM_INVALID": {
            //     title: t("client.confirmMakeInvalidTitle"),
            //     bodyText: t("client.confirmMakeInvalidText"),
            //     onClose: () => setDialog(null),
            //     onConfirm: makeInvalid,
            // },
            "CONFIRM_DELETE_FROM_GROUPS": {
                title: t('recipient.deleteRecipientFromGroup'),
                bodyText: t('client.confirmDeleteFromAllGroups'),
                onClose: () => setDialog(null),
                onConfirm: removeRecipientFromAllGroups,
            },
            "CONFIRM_REMOVE_EMAIL": {
                title: t('recipient.removeRecipientEmail'),
                bodyText: t('client.confirmRemoveEmail'),
                onClose: () => setDialog(null),
                onConfirm: removeEmailRecipient,
            },
            "CONFIRM_REMOVE_PHONE": {
                title: t('recipient.removeRecipientPhone'),
                bodyText: t('client.confirmRemovePhone'),
                onClose: () => setDialog(null),
                onConfirm: removeSMSRecipient,
            },
        };
        return (
            <Dialog
                classes={classes}
                open={
                    dialog === DialogType.CONFIRM_INVALID ||
                    dialog === DialogType.CONFIRM_DELETE_FROM_GROUPS ||
                    dialog === DialogType.CONFIRM_REMOVE_EMAIL ||
                    dialog === DialogType.CONFIRM_REMOVE_PHONE
                }
                // title={t("group.delete")}
                title={DialogObject[dialog]?.title || ''}
                icon={<Box className={classes.dialogAlertIcon}>
                    !
                </Box>}
                showDivider={true}
                onClose={DialogObject[dialog]?.onClose || ''}
                onCancel={DialogObject[dialog]?.onClose || ''}
                onConfirm={DialogObject[dialog]?.onConfirm || null}
                cancelText="common.Cancel"
                confirmText="common.Ok"
            >
                <Box>
                    <Typography variant="subtitle1">
                        {DialogObject[dialog]?.bodyText || ''}
                    </Typography>
                </Box>
            </Dialog>
        )
    }
    const removeRecipientFromAllGroups = async () => {
        setDialog(null);
        setShowLoader(true);
        const response = await dispatch(deleteFromGroups(selectedClients[0]))
        if (response && response.payload === 'true') {
            setToastMessage(ToastMessages.RECIPIENT_DELETED_FROM_GROUP);
        }
        setShowLoader(false);
    }
    const removeEmailRecipient = async () => {
        setDialog(null);
        setShowLoader(true);
        const response = await dispatch(removeEmailClient(selectedClients[0]))
        if (response) {
            handleResponses(response,
                {
                    S_201: {
                        code: 201,
                        message: ToastMessages.SUCCESS,
                        Func: () => null
                    },
                    S_400: {
                        code: 400,
                        message: ToastMessages.SOMETHING_WENT_WRONG,
                        Func: () => null
                    },
                    'S_401': {
                        code: 401,
                        message: ToastMessages.GROUP_INVALID_API,
                        Func: () => null
                    },
                    'S_404': {
                        code: 404,
                        message: ToastMessages.NO_CLIENTS_FOUND,
                        Func: () => null
                    },
                    'S_500': {
                        code: 500,
                        message: ToastMessages.GROUP_ERROR,
                        Func: () => null
                    },
                }
            );
            setDialog(null);
        }
        setShowLoader(false);
    }
    const removeSMSRecipient = async () => {
        setDialog(null);
        setShowLoader(true);
        const response = await dispatch(removeSmsClient(selectedClients[0]))
        if (response) {
            //TODO: show delete success message
            handleResponses(response,
                {
                    S_201: {
                        code: 201,
                        message: ToastMessages.SUCCESS,
                        Func: () => null
                    },
                    S_400: {
                        code: 400,
                        message: ToastMessages.SOMETHING_WENT_WRONG,
                        Func: () => null
                    },
                    'S_401': {
                        code: 401,
                        message: ToastMessages.GROUP_INVALID_API,
                        Func: () => null
                    },
                    'S_404': {
                        code: 404,
                        message: ToastMessages.NO_CLIENTS_FOUND,
                        Func: () => null
                    },
                    'S_500': {
                        code: 500,
                        message: ToastMessages.GROUP_ERROR,
                        Func: () => null
                    },
                }
            );
            setDialog(null);
        }
        setShowLoader(false);
    }
    const handleResponses = (response, actions = {
        'S_200': {
            code: 200,
            message: '',
            Func: () => null
        },
        'S_201': {
            code: 201,
            message: '',
            Func: () => id ? getRepliesById() : getReplies()
        },
        'S_400': {
            code: 400,
            message: '',
            Func: () => null
        },
        'S_401': {
            code: 401,
            message: '',
            Func: () => null
        },
        'S_404': {
            code: 404,
            message: '',
            Func: () => null
        },
        'S_405': {
            code: 405,
            message: '',
            Func: () => null
        },
        'S_406': {
            code: 406,
            message: '',
            Func: () => null
        },
        'S_422': {
            code: 422,
            message: '',
            Func: () => null
        },
        'S_500': {
            code: 500,
            message: '',
            Func: () => null
        },
        'default': {
            message: '',
            Func: () => null
        },
    }) => {
        switch (response.payload?.StatusCode || response.payload?.Message.StatusCode) {
            case 200: {
                actions?.S_200?.Func?.();
                actions?.S_200?.message && setToastMessage(actions?.S_200?.message);
                break;
            }
            case 201: {
                actions?.S_201?.Func?.();
                actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
                break;
            }
            case 400: {
                actions?.S_400?.Func?.();
                actions?.S_400?.message && setToastMessage(actions?.S_400?.message);
                break;
            }
            case 401: {
                actions?.S_401?.Func?.();
                actions?.S_401?.message && setToastMessage(actions?.S_401?.message);
                break;
            }
            case 404: {
                actions?.S_404?.Func?.();
                actions?.S_404?.message && setToastMessage(actions?.S_404?.message);
                break;
            }
            case 405: {
                actions?.S_405?.Func?.();
                actions?.S_405?.message && setToastMessage(actions?.S_405?.message);
                break;
            }
            case 406: {
                actions?.S_406?.Func?.();
                actions?.S_406?.message && setToastMessage(actions?.S_406?.message);
                break;
            }
            case 422: {
                actions?.S_422?.Func?.();
                actions?.S_422?.message && setToastMessage(actions?.S_422?.message);
                break;
            }
            case 500: {
                actions?.S_500?.Func?.();
                actions?.S_500?.message && setToastMessage(actions?.S_500?.message);
                break;
            }
            default: {
                actions?.default?.Func?.();
                actions?.default?.message && setToastMessage(actions?.default?.message);
                setDialog(null);
                break;
            }
                setShowLoader(false);
        }
    }
    //#endregion


    return (
        <Box>
            {renderHeader()}
            {renderSearchLine()}
            {renderTable()}
            {renderTablePagination()}
            {showDialog()}
            <ConfirmRadioDialog
                classes={classes}
                isOpen={dialog === 'exportFormat'}
                title={t('campaigns.exportFile')}
                radioTitle={t('common.SelectFormat')}
                onConfirm={(e) => handleDownloadCsv(e)}
                onCancel={() => setDialog(null)}
                cookieName={'exportFormat'}
                defaultValue="xls"
                options={ExportFileTypes}
            />
            <Loader isOpen={showLoader} showBackdrop={true} />
        </Box>
    )
}

export default SmsReplies;