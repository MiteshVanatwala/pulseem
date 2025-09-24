import clsx from 'clsx';
import 'moment/locale/he';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '../../../../components/Loader/Loader';
import { ExportFile } from '../../../../helpers/Export/ExportFile';
import { ClientStatus, DateFormats } from '../../../../helpers/Constants';
import { EditIcon } from '../../../../assets/images/managment/index';
import { ExportFileTypes } from '../../../../model/Export/ExportFileTypes';
import AddRecipientPopup from "../../../Groups/Management/Popup/AddRecipientPopup";
import { TablePagination, ManagmentIcon } from '../../../../components/managment/index';
import ConfirmRadioDialog from '../../../../components/DialogTemplates/ConfirmRadioDialog';
import { getSmsReplies, getAccountExtraData, getFinishedCampaigns } from '../../../../redux/reducers/smsSlice';
import { getClientsById } from "../../../../redux/reducers/clientSlice";
import { getGroupsBySubAccountId } from '../../../../redux/reducers/groupSlice';
import { HandleExportData, ReplaceNull, DeletePropertyFromArrayObject } from '../../../../helpers/Export/ExportHelper';
import { Typography, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, Box } from '@material-ui/core'
import SearchLine from '../SearchLine';
import { setRowsPerPage } from '../../../../redux/reducers/coreSlice';
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { PulseemFeatures } from '../../../../model/PulseemFields/Fields';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';
import { findPlanByFeatureCode } from '../../../../redux/reducers/TiersSlice';


const SmsReplies = ({ classes }) => {
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
    const [selectedClients, setSelectedClients] = useState([]);
    // const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0]);
    const { ToastMessages } = useSelector(state => state.client);
    const { smsReplies, extraData, finishedCampaigns } = useSelector(state => state.sms);
    const { subAccountAllGroups } = useSelector((state) => state.group);
    const { windowSize, isRTL, rowsPerPage, userRoles } = useSelector(state => state.core);
    const { accountFeatures } = useSelector(state => state.common);
    const { currentPlan, availablePlans } = useSelector(state => state.tiers);
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const { id } = useParams();
    const priorDate = moment().subtract(30, 'days').utcOffset(0);

    const defaultsDates = {
        from: priorDate,
        to: moment({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm')
    }
    const defaultRequest = {
        FromDate: defaultsDates.from,
        ToDate: defaultsDates.to,
        FromNumber: '',
        ToNumber: '',
        Text: '',
        CampaignID: null,
        PageIndex: 1,
        PageSize: rowsPerPage,
        IsExport: false
    };
    const [request, setRequest] = useState(defaultRequest);
    const [searchRequest, setSearchRequest] = useState(defaultRequest);
    const [TierMessageCode, setTierMessageCode] = useState('');

    const DialogType = { EDIT_RECIPIENT: "EDIT_RECIPIENT" };

    const handleGetPlanForFeature = (tierMessageCode) => {
        const planName = findPlanByFeatureCode(
            tierMessageCode,
            availablePlans,
            currentPlan.Id
        );
        
        if (planName) {
            return t('billing.tier.featureNotAvailable', { 
                feature: tierMessageCode, 
                planName: planName 
            });
        } else {
            return t('billing.tier.noFeatureAvailable');
        }
    };


    const getReplies = async () => {
        setShowLoader(true);
        const response = await dispatch(getSmsReplies({ ...request, PageSize: rowsPerPage, PageIndex: page }));
        
        // Check for tier validation
        if (response?.payload?.StatusCode === 927) {
            // SMS_RESPONSE_REPORT
            setTierMessageCode(response?.payload?.Message || 'SMS_RESPONSE_REPORT');
            setDialog('tier');
            setShowLoader(false);
            return;
        }
        
        setShowLoader(false);
    }

    useEffect(() => {
        const initExtraFields = async () => {
            if (!extraData || extraData.length === 0)
                dispatch(getAccountExtraData());
        }
        initExtraFields();
    }, [dispatch]);

    useEffect(() => {
        if (!finishedCampaigns || finishedCampaigns?.length === 0) {
            dispatch(getFinishedCampaigns());
        }
        getReplies();
    }, [request, page, rowsPerPage])

    useEffect(() => {
        if (!isSearching) {
            setSearchRequest(defaultRequest);
        }
    }, [isSearching]);

    const handlePageChange = (val) => {
        dispatch(setRowsPerPage(val))
    }

    const renderHeader = () => {
        return (
            <>
                {/* <Divider /> */}
                <Grid container spacing={2} className={clsx(classes.p20)}>
                    {userRoles?.AllowExport && accountFeatures?.indexOf(PulseemFeatures.LOCK_EXPORT_DATA) === -1 && windowSize !== 'xs' && <Grid item>
                        <Button
                            className={clsx(
                                classes.btn, classes.btnRounded,
                                smsReplies?.Data?.length > 0 ? null : classes.disabled
                            )}
                            onClick={() => setDialog('exportFormat')}
                            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}>
                            {t('campaigns.exportFile')}
                        </Button>
                    </Grid>}
                </Grid>
            </>
        )
    }

    const exportColumnHeader = {
        // "ClientID": t('client.ClientId'),
        "VirtualNumber": t('report.virtualNumber'),
        "CellPhone": t('common.cellphone'),
        "FirstName": t('smsReport.firstName'),
        "LastName": t('smsReport.lastName'),
        "ReplyDate": t('common.ReplyDate'),
        "ReplyText": t('common.ReplyText'),
        "CampaignName": t('common.CampaignName')
    }

    const handleDownloadCsv = async (formatType) => {
        setDialog(null);
        setShowLoader(true);
        let response = await dispatch(getSmsReplies({ ...request, IsExport: true }));
        
        // Check for tier validation
        if (response?.payload?.StatusCode === 927) {
            setTierMessageCode(response?.payload?.Message || 'SMS_RESPONSE_REPORT');
            setDialog('tier');
            setShowLoader(false);
            return;
        }
        
        let finalData = response?.payload?.Data;
        finalData = await DeletePropertyFromArrayObject(finalData, ['Status']);

        const exportOptions = {
            OrderItems: true,
            FormatDate: true,
            ConvertStatusDescription: true,
            Statuses: ClientStatus.Sms,
            ReplaceClientStatus: true,
            ReplaceNull: true,
            Order: Object.keys(exportColumnHeader)
        };

        try {
            let result = await HandleExportData(finalData, exportOptions);

            result = await ReplaceNull(result, 'FirstName', '');
            result = await ReplaceNull(result, 'LastName', '');
            result = await ReplaceNull(result, 'CellPhone', '');
            result = await ReplaceNull(result, 'CampaignName', '');

            ExportFile({
                data: result,
                fileName: `ResponsesReport${id ? '_' + id : ''}`,
                exportType: formatType,
                fields: exportColumnHeader
            });
        } catch (e) {
            console.log(e);
        }
        finally {
            setShowLoader(false);
        }
    }

    const renderTable = () => {
        return (
            <>
                <Grid item className={clsx(classes.groupsLableContainer, classes.mb15)} >
                    <Typography className={classes.groupsLable}>
                        {`${smsReplies?.Message ?? 0} ${t('common.Clients')}`}
                    </Typography>
                </Grid>
                <TableContainer className={classes.tableStyle}>
                    <Table className={classes.tableContainer}>
                        {windowSize !== 'xs' && renderTableHead()}
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </>
        )
    }

    const renderTableHead = () => {
        return (
            <TableHead>
                <TableRow classes={rowStyle}>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('report.clientName')} ({t('common.SentFromNumber')})</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('common.ToNumber')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.smsStatus")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.ReplyDate")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex5} align='center' >{t("common.messageContent")}</TableCell>
                </TableRow>
            </TableHead>
        )
    }
    const renderTableBody = () => {
        let rowData = smsReplies?.Data;

        if (!rowData || rowData?.length === 0) {
            return <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
                <Typography>{t("common.NoDataTryFilter")}</Typography>
            </Box>
        }

        return (
            <TableBody>
                {rowData
                    .map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
            </TableBody>
        )
    }
    const statusToText = (status) => {
        let translatedStatus = ClientStatus.Sms.find((x) => { return x.id === status });
        translatedStatus = translatedStatus ?? { value: 'emailStatus.noStatus' };
        return t(translatedStatus?.value);
    }

    const renderRow = (row, index) => {
        const {
            ClientID,
            FirstName,
            LastName,
            CellPhone,
            SmsStatus,
            ReplyDate,
            ReplyText,
            VirtualNumber
        } = row;

        let reply = moment(ReplyDate, dateFormat);
        return (
            <TableRow
                key={index}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex2, classes.ellipsisText)}>
                    <Grid
                        item
                        key={'edit'}
                        style={{ width: '100%' }}
                    >
                        <Box className={classes.dFlex}>
                            <Box style={{ width: '70%' }}>
                                <Typography className={classes.font18}>{CellPhone}</Typography>
                                <Typography className={clsx(classes.font14, classes.ellipsisText)}
                                    title={`${FirstName} ${LastName}`}
                                >{FirstName} {LastName}</Typography>
                            </Box>
                            <Box className={ClientID > 0 ? null : classes.disabled} style={{ width: '30%' }}>
                                <ManagmentIcon
                                    disableHover={true}
                                    key='edit'
                                    classes={classes}
                                    uIcon={<EditIcon width={18} height={20} className={'editIcon'} />}
                                    iconClass={clsx(classes.smallIcon)}
                                    rootClass={classes.paddingIcon}
                                    onClick={async () => {
                                        setShowLoader(true);
                                        setSelectedClients([row.ClientID]);
                                        const recipientRequest = await dispatch(getClientsById([row.ClientID]));
                                        const cToEdit = recipientRequest?.payload?.Data[0];
                                        setClientToEdit(cToEdit);
                                        if (!subAccountAllGroups || subAccountAllGroups?.length === 0) {
                                            await dispatch(getGroupsBySubAccountId());
                                        }
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
                    <Typography className={classes.font18}>{VirtualNumber}</Typography>
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {ClientID > 0 ? statusToText(SmsStatus) : t("emailStatus.noStatus")}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {reply.format(DateFormats.DATE_TIME_24)}
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
                    if (clientToEdit && clientToEdit?.GroupIds?.length > 0) {
                        mappedGroups = clientToEdit?.GroupIds?.split(',')?.map(function (x) {
                            return parseInt(x, 10);
                        });
                    }

                    return <AddRecipientPopup
                        classes={classes}
                        isOpen={selectedClients.length === 1 && dialog === DialogType.EDIT_RECIPIENT}
                        onClose={() => { setDialog(null); setSelectedClients([]); }}
                        setLoader={showLoader}
                        windowSize={windowSize}
                        ToastMessages={ToastMessages}
                        setToastMessage={setToastMessage}
                        Groups={subAccountAllGroups?.reduce((prevVal, newVal) => [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }], []) || []}
                        DialogType={DialogType}
                        selectedGroups={mappedGroups}
                        setDialog={setDialog}
                        handleResponses={(response, actions) => { handleResponses(response, actions); }}
                        onAddRecipient={(closeDialog = true) => {
                            getReplies();
                            closeDialog && setDialog(null);
                        }}
                        recipientData={clientToEdit}
                    />
                }
                case 'tier': {
                    return <BaseDialog
                        classes={classes}
                        open={dialog === 'tier'}
                        onClose={() => setDialog(null)}
                        onCancel={() => setDialog(null)}
                        onConfirm={() => setDialog(null)}
                        showDefaultButtons={false}
                        title={t('billing.tier.permission')}
                    >
                        <Typography style={{ fontSize: 18 }} className={clsx(classes.textCenter)}>
                            {handleGetPlanForFeature(TierMessageCode)}
                        </Typography>
                    </BaseDialog>
                }
                default: {
                    return <></>
                }
            }
        }
        return <></>;
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
            Func: () => getReplies()
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
                setDialog(null);
                break;
            }
            case 201: {
                actions?.S_201?.Func?.();
                actions?.S_201?.message && setToastMessage(actions?.S_201?.message);
                setDialog(null);
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
        }
        setShowLoader(false);
    }
    //#endregion


    return (
        <Box className={classes.p20}>
            {/* <Box className={'topSection'}> */}
            {/* {renderHeader()} */}
            <Grid container>
                <Grid item>
                    <SearchLine
                        classes={classes}
                        onSetPage={(val) => setPage(val)}
                        onFilterRequest={(val) => setRequest({ ...request, ...val })}
                        onSetIsSearching={(val) => setIsSearching(val)}
                        showAutoCompleteForm={true}
                    />
                </Grid>
                <Grid item>{renderHeader()}</Grid>
            </Grid>

            {/* </Box> */}
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
                defaultValue="xlsx"
                options={ExportFileTypes}
            />
            <Loader isOpen={showLoader} showBackdrop={true} />
        </Box >
    )
}

export default SmsReplies;