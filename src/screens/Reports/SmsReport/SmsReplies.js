import React, { useState, useEffect } from 'react';
import DefaultScreen from '../../DefaultScreen';
import clsx from 'clsx';
import {
    Typography, Divider, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Grid, Button, TextField, Box
} from '@material-ui/core'
import { ExportIcon } from '../../../assets/images/managment/index'
import { TablePagination, ManagmentIcon } from '../../../components/managment/index'
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/he';
import { getSmsReplies } from '../../../redux/reducers/smsSlice';
import { Loader } from '../../../components/Loader/Loader';
import { exportFile } from '../../../helpers/exportFromJson';
import { ClientStatus } from '../../../helpers/PulseemArrays';
import { preferredOrder, formatDateTime, emailStatusNumberToString, smsStatusNumberToString } from '../../../helpers/exportHelper';
import { EditIcon } from '../../../assets/images/managment/index'
import { AiOutlineUserDelete, AiOutlineUsergroupDelete, AiOutlineExclamationCircle } from 'react-icons/ai';
import { FiPhoneOff } from 'react-icons/fi';
import { actionURL } from '../../../config';
import { Dialog } from "../../../components/managment/index";
import { deleteFromGroups, removeEmailClient, removeSmsClient } from '../../../redux/reducers/clientSlice';

const SmsReplies = ({ classes, ...other }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [page, setPage] = useState(1)
    const rowsOptions = [6, 10, 20, 50]
    const dateFormat = 'YYYY-MM-DD HH:mm:ss:FFF';
    const [dialogType, setDialogType] = useState(null)
    const [showLoader, setShowLoader] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const { smsReplies } = useSelector(state => state.sms)
    const { windowSize } = useSelector(state => state.core)
    const [rowsPerPage, setRowsPerPage] = useState(rowsOptions[0])
    const rowStyle = { head: classes.tableRowReportHead, root: clsx(classes.tableRowRoot) }
    const cellBodyStyle = { body: clsx(classes.tableCellBody), root: clsx(classes.tableCellRoot) }
    const cellStyle = { head: classes.tableCellHead, root: clsx(classes.tableCellRoot, classes.paddingHead) }
    const cell50wStyle = { head: clsx(classes.tableCellHead), root: clsx(classes.tableCellRoot, classes.paddingHead, classes.minWidth50) }

    const getData = async () => {
        if (other.props.match.params.id) {
            await dispatch(getSmsReplies(other.props.match.params.id));
            setShowLoader(false);
        }
    }

    useEffect(() => {
        getData();
    }, [dispatch]);

    const renderHeader = () => {
        return (
            <>
                <Typography className={classes.managementTitle}>
                    {t('report.SMSReplies')}
                </Typography>
                <Divider />
                <Typography>
                    {t('report.SMSRepliesSubTitle')}
                </Typography>
                <Grid container spacing={2} className={classes.linePadding} >
                    {windowSize !== 'xs' && <Grid item>
                        <Button
                            variant='contained'
                            size='medium'
                            className={clsx(
                                classes.actionButton,
                                classes.actionButtonGreen,
                                smsReplies && smsReplies.length > 0 ? null : classes.disabled
                            )}
                            onClick={handleDownloadCsv}
                            startIcon={<ExportIcon />}>
                            {t('campaigns.exportFile')}
                        </Button>
                    </Grid>}
                    <Grid item className={classes.groupsLableContainer} >
                        <Typography className={classes.groupsLable}>
                            {`${smsReplies.length} ${t('common.Clients')}`}
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

    const handleDownloadCsv = async () => {
        let orderList = preferredOrder(smsReplies, Object.keys(exportColumnHeader));
        orderList = await emailStatusNumberToString(t, orderList, ClientStatus.Email);
        orderList = await smsStatusNumberToString(t, orderList, ClientStatus.Sms);
        orderList = await formatDateTime(orderList);
        exportFile({
            data: orderList,
            fileName: `smsReplies_${other.props.match.params.id}`,
            exportType: 'xls',
            fields: exportColumnHeader
        });
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
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('report.clientName')}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.Mail")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.cellphone")}</TableCell>
                    <TableCell classes={cell50wStyle} className={classes.flex2} align='center'>{t("common.AddedDate")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.smsStatus")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center'>{t("common.emailStatus")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t("common.ReplyDate")}</TableCell>
                    <TableCell classes={cellStyle} className={classes.flex1} align='center' >{t("common.MessageContent")}</TableCell>
                    <TableCell classes={{ root: classes.tableCellRoot }} className={classes.flex6} ></TableCell>
                </TableRow>
            </TableHead>
        )
    }
    const renderTableBody = () => {
        let rowData = smsReplies;
        rowData = rowData.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage);
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
        }
        else {
            translatedStatus = ClientStatus.Sms.find((x) => { return x.id === status });
        }
        return t(translatedStatus.value);
    }

    const renderRow = (row) => {
        const {
            ClientID,
            FirstName,
            LastName,
            Email,
            Cellphone,
            CreationDate,
            SmsStatus,
            Status,
            ReplyDate,
            ReplyText
        } = row;

        let creation = moment(CreationDate, dateFormat);
        let reply = moment(ReplyDate, dateFormat);
        return (
            <TableRow
                key={ClientID}
                classes={rowStyle}>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={clsx(classes.flex2, classes.ellipsisText)}>
                    {FirstName} {LastName}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {Email}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {Cellphone}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {creation.format('DD/MM/YYYY')} {creation.format('HH:mm:ss')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex1}>
                    {statusToText(SmsStatus, 'sms')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex1}>
                    {statusToText(Status, 'email')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex2}>
                    {reply.format('DD/MM/YYYY')} {reply.format('HH:mm:ss')}
                </TableCell>
                <TableCell
                    classes={cellBodyStyle}
                    align='center'
                    className={classes.flex1}>
                    {ReplyText}
                </TableCell>
                <TableCell
                    component="th"
                    scope="row"
                    classes={{ root: classes.tableCellRoot }}
                    className={classes.flex6}>
                    {renderCellIcons(row)}

                </TableCell>
            </TableRow>
        )
    }

    const renderPhoneRow = (row) => {
        return <></>
    }

    const renderCellIcons = (row) => {
        const iconsMap = [
            {
                key: 'edit',
                icon: EditIcon,
                lable: t('campaigns.Image2Resource1.ToolTip'),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedClient(row.ClientID);
                    setDialogType({ type: "editClient" })
                }
            },
            {
                key: 'removeFromGroups',
                uIcon: <AiOutlineUsergroupDelete style={{ fontSize: 25, alignSelf: 'center' }} />,
                lable: t('common.deleteFromAllGroups'),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedClient(row.ClientID);
                    setDialogType({ type: "removeFromGroups" })
                }
            },
            {
                key: 'removeFromAccount',
                uIcon: <AiOutlineUserDelete style={{ fontSize: 25, alignSelf: 'center' }} />,
                lable: t('common.removeFromAccount'),
                rootClass: classes.paddingIcon,
                onClick: () => {
                    setSelectedClient(row.ClientID);
                    setDialogType({ type: "removeFromAccount" })
                }
            },
            {
                key: 'removeSmsClient',
                uIcon: <FiPhoneOff style={{ fontSize: 25, alignSelf: 'center' }} />,
                lable: t('common.removeSmsClient'),
                onClick: () => {
                    setSelectedClient(row.ClientID);
                    setDialogType({ type: "removeSmsClient" })
                },
                rootClass: classes.paddingIcon,
            }
        ]
        return (
            <Grid
                container
                direction='row'
                justifyContent={windowSize === 'xs' ? 'flex-start' : 'flex-end'}>
                {iconsMap.map(icon => (
                    <Grid
                        className={icon.disable && classes.disabledCursor}
                        key={icon.key}
                        style={{ maxWidth: 100 }}
                        item >
                        <ManagmentIcon
                            classes={classes}
                            {...icon}
                        />
                    </Grid>
                ))}
            </Grid>
        )
    }

    const renderTablePagination = () => {
        return (
            <TablePagination
                classes={classes}
                rows={smsReplies.length}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                rowsPerPageOptions={rowsOptions}
                page={page}
                onPageChange={setPage}
            />
        )
    }

    useEffect(() => {
        function isJson(obj) {
            try {
                JSON.parse(obj);
                return true;
            } catch (e) {
                return false;
            }
        }

        const handler = event => {
            if (isJson(event.data)) {
                const data = JSON.parse(event.data)
                setDialogType(null);
                if (data === "confirm") {
                    getData();
                }
            }
        }

        window.addEventListener("message", handler)

        // clean up
        return () => window.removeEventListener("message", handler)
    }, []) // empty array => run only once

    //#region Dialogs
    const editClientDialog = () => {
        return {
            // title: t('common.UpdateClientInfo'),
            showDivider: false,
            disableBackdropClick: false,
            icon: (
                <AiOutlineExclamationCircle
                    style={{ fontSize: 30, color: "#fff" }}
                />
            ),
            style: { minWidth: 300 },
            content: (
                <Box>
                    <iframe
                        title="EditClient"
                        border="0"
                        className={classes.editClientIframe}
                        src={`${actionURL}AddSingleClient.aspx?ClientID=${selectedClient}&Culture=he-IL`} />
                </Box>
            ),
            showDefaultButtons: false,
            // onClose: () => { setDialogType(null); getData(); }
        }
    }
    const removeFromGroupsDialog = () => {
        const handleRemoveFromGroup = async () => {
            setDialogType(null);
            setShowLoader(true);
            await dispatch(deleteFromGroups(selectedClient));
            await getData();
            setShowLoader(false);
        }
        return {
            title: t('client.removeClientFromGroupTitle'),
            showDivider: true,
            icon: (
                <AiOutlineUsergroupDelete style={{ fontSize: 30, alignSelf: 'center' }} />
            ),
            content: (
                <Box style={{ maxWidth: 400 }}>
                    <Typography className={classes.f18}>{t("client.removeClientFromGroupDescription")}</Typography>
                </Box>
            ),
            showDefaultButtons: true,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { handleRemoveFromGroup() }
        }
    }
    const removeFromAccountDialog = () => {
        const handleRemoveFromAccount = async () => {
            setDialogType(null);
            setShowLoader(true);
            await dispatch(removeEmailClient(selectedClient));
            await getData();
            setShowLoader(false);
        }
        return {
            title: t('client.removeClientFromAccountTitle'),
            showDivider: true,
            icon: (
                <AiOutlineUserDelete style={{ fontSize: 30, alignSelf: 'center' }} />
            ),
            content: (
                <Box style={{ maxWidth: 400 }}>
                    <Typography className={classes.f18}>{t("client.removeClientFromAccountDescription")}</Typography>
                </Box>
            ),
            showDefaultButtons: true,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { handleRemoveFromAccount() }
        }
    }
    const removeSmsClientDialog = () => {
        const handleRemoveFromSms = async () => {
            setDialogType(null);
            setShowLoader(true);
            await dispatch(removeSmsClient(selectedClient));
            await getData();
            setShowLoader(false);
        }
        return {
            title: t('client.removeClientFromSmsTitle'),
            showDivider: true,
            icon: (
                <FiPhoneOff style={{ fontSize: 30, alignSelf: 'center' }} />
            ),
            content: (
                <Box style={{ maxWidth: 400 }}>
                    <Typography className={classes.f18}>{t("client.removeClientFromSmsDescription")}</Typography>
                </Box>
            ),
            showDefaultButtons: true,
            onClose: () => { setDialogType(null) },
            onConfirm: () => { handleRemoveFromSms() }
        }
    }
    const renderDialog = () => {
        const { type } = dialogType || {}

        const dialogContent = {
            editClient: editClientDialog(),
            removeFromGroups: removeFromGroupsDialog(),
            removeFromAccount: removeFromAccountDialog(),
            removeSmsClient: removeSmsClientDialog()
        }

        const currentDialog = dialogContent[type] || {}
        return (
            dialogType && <Dialog
                classes={classes}
                open={dialogType}
                onClose={handleClose}
                {...currentDialog}>
                {currentDialog.content}
            </Dialog>
        )
    }
    const handleClose = () => {
        setDialogType(null);
    };
    //#endregion


    return (
        <DefaultScreen
            classes={classes}
            containerClass={classes.management}
            currentPage="reports"
            subPage="smsResponse">
            {renderHeader()}
            {renderTable()}
            {renderTablePagination()}
            {renderDialog()}
            <Loader isOpen={showLoader} showBackdrop={true} />
        </DefaultScreen>
    )
}

export default SmsReplies;