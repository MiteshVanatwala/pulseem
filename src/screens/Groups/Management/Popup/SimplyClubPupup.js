import { Box, Typography, TextField, makeStyles, TableRow, TableCell, Checkbox, FormControlLabel, Grid, Button } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { addRecipient, getExternalClientsByGroups, getGroups, getGroupsForSimplyClub, createGroup } from '../../../../redux/reducers/groupSlice';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../../../../components/Table/DataTable';
import { UploadSettings } from '../../tempConstants';
import ColumnAdjustmentDialog from '../../../../components/Files/ColumnAdjustmentDialog';
import { Loader } from '../../../../components/Loader/Loader';
import AddRecipientResponse from './AddRecipientResponse';
import { BaseDialog } from '../../../../components/DialogTemplates/BaseDialog';

import { sendToTeamChannel } from "../../../../redux/reducers/ConnectorsSlice";
import { RenderHtml } from '../../../../helpers/Utils/HtmlUtils';

const useStyles = makeStyles({
    dialogContainer: {
        width: '100%'
    },
    fw500: {
        fontWeight: '500 !important'
    },
    textRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '66.667%'
    },
    recordBoxMaxHeight: {
        maxHeight: '420px'
    },
    mb45: {
        marginBottom: 45
    },
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center'
    },
    noMaxWidth: {
        maxWidth: "none",
    },
    h100: {
        height: 100
    },
    errortext: {
        fontSize: '.9em',
        color: 'red',
        marginInline: '10px'
    },
    pwdEveButton: {
        width: 25,
        padding: 5,
        minWidth: 10,
        marginRight: 5
    }
});


const SimplyClubPupup = ({
    onClose,
    classes,
    isOpen,
    windowSize,
    getData,
    setToastMessage,
    handleResponses,
    ToastMessages,
    SelectedGroupIds = [],
    setSelectedGroupIds
}) => {
    const { isRTL } = useSelector((state) => state.core);
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const localClasses = useStyles()

    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
    const cellStyle = {
        head: classes.tableCellHead,
        body: classes.tableCellBody,
        root: classes.tableCellRoot,
    };

    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState({
        Username: '',
        Password: ''
    })
    const [showGroups, setShowGroups] = useState(false)
    const [showClients, setShowClients] = useState(false)
    const [groups, setGroups] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])

    const [ClientData, setClientData] = useState(null);
    const [headers, setheaders] = useState([]);
    const [filteredDAta, setFilteredData] = useState([]);
    const [showLoader, setShowLoader] = useState(false)
    const [summary, setSummary] = useState(null)
    const [error, setError] = useState(null)
    const [updatedClients, setUpdatedClients] = useState(null);
    const [selectArray, setselectArray] = useState([]);
    const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);


    useEffect(() => {
        const preload = () => {
            try {
                let totalFields = Object.values(ClientData).length > 0 ? Object.keys(Object.values(ClientData)[0][0]).length : 0;
                let tempHeaders = Array.from({ length: totalFields }, (v, i) => t("sms.adjustTitle"))
                setFilteredData(Object.values(ClientData)[0]);
                setheaders([...tempHeaders])
            } catch (e) {
                console.error(e);
                dispatch(sendToTeamChannel({
                    MethodName: 'preload',
                    ComponentName: 'SimplyClubPupup.js',
                    Text: e
                }));
            }
        }
        if (ClientData) {
            preload()
        }

    }, [ClientData])

    useEffect(() => {
        if (summary !== null) {
            setShowClients(false);
            setClientData({})
            setSelectedGroups([]);
            setSelectedGroupIds([])
        }
    }, summary);


    useEffect(() => {
        selectedGroups.length > 0 && handleGetClients()

    }, [selectedGroups])



    const handleGetClients = async (id) => {

        setShowLoader(true)
        const response = await dispatch(getExternalClientsByGroups({ ...user, GroupIds: selectedGroups }))
        setShowLoader(false)
        handleResponses(response, {
            'S_200': {
                code: 200,
                message: Object.values(response?.payload?.Clients)[0] && Object.values(response?.payload?.Clients)[0][0] ? '' : ToastMessages.NO_RECIPIENTS_IN_GROUP,
                Func: () => {
                    if (Object.values(response?.payload?.Clients)[0] && Object.values(response?.payload?.Clients)[0][0]) {
                        setClientData(response?.payload?.Clients || [])
                        setShowClients(true)
                    }
                    else {
                        setClientData(null);
                        setSelectedGroups([]);
                    }
                }
            },
            'S_201': {
                code: 201,
                message: '',
                Func: () => null
            },
            'S_401': {
                code: 401,
                message: ToastMessages.FEATURE_NOT_ALLOWED,
                Func: () => null
            },
            'S_404': {
                code: 404,
                message: ToastMessages.ERROR_OCCURED,
                Func: () => null
            },
            'S_500': {
                code: 500,
                message: ToastMessages.ERROR_OCCURED,
                Func: () => null
            },
            'default': {
                message: ToastMessages.ERROR_OCCURED,
                Func: () => null
            },
        })
    }


    const TABLE_HEAD = [
        {
            label: t("siteTracking.selectGroups"),
            classes: cellStyle,
            className: clsx(localClasses.fw500, classes.flex1),
            align: "center",
        },
        {
            label: t("common.GroupName"),
            classes: cellStyle,
            className: clsx(localClasses.fw500, classes.flex2),
            align: "center",
        }
    ]


    const handleChange = (e) => {
        if (error) {
            setError(null);
        }
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    const handleSelected = (id) => {
        const tempIndex = selectedGroups.indexOf(id)
        if (tempIndex === -1) {
            setSelectedGroups([id])
        }
        else {
            let tempArray = [...selectedGroups]
            tempArray.splice(tempIndex, 1)
            setSelectedGroups(tempArray)
        }
    }

    const handleLogin = async () => {

        if (!user.Username || !user.Password) {
            setError(t("group.enterValidUserPwd"));
            return
        }

        setShowLoader(true)
        const response = await dispatch(getGroupsForSimplyClub(user))
        setShowLoader(false)
        handleResponses(response, {
            'S_200': {
                code: 200,
                // message: !response?.payload?.Groups ? ToastMessages.ERROR_OCCURED : '',
                Func: () => {
                    if (!response?.payload?.Groups) {
                        setError(t("group.incorrectUsrPwd"));
                    }
                    setGroups(response?.payload?.Groups || [])
                    setShowGroups(true)
                }
            },
            'S_201': {
                code: 201,
                message: '',
                Func: () => null
            },
            'S_401': {
                code: 401,
                message: ToastMessages.FEATURE_NOT_ALLOWED,
                Func: () => null
            },
            'S_404': {
                code: 404,
                message: ToastMessages.SIMPLY_NOT_FOUND,
                Func: () => null
            },
            'S_500': {
                code: 500,
                message: ToastMessages.ERROR_OCCURED,
                Func: () => null
            },
            'default': {
                message: ToastMessages.ERROR_OCCURED,
                Func: () => null
            },
        })
    }

    const manualUploadValidationscheck = () => {
        let isValid = true;
        let columnHasValue = false;
        headers.forEach((value) => {
            if (value === t("common.cellphone") || value === 'Cellphone' || value === t("common.email") || value === 'Email') {
                columnHasValue = true
            }
        });

        if (columnHasValue === false) {
            isValid = false;
            setToastMessage({ severity: 'error', color: 'error', message: t('recipient.email_cell_notProvided'), showAnimtionCheck: false })
        }
        return isValid
    }

    const handleAddClients = async (ids) => {
        setShowLoader(true)
        let tempClients = Object.values(updatedClients ?? ClientData)[0]

        const Payload = {
            ClientsData: tempClients || [],
            GroupIds: ids
        }

        const response = await dispatch(addRecipient(Payload));

        switch (response?.payload?.StatusCode) {
            default: {
                setToastMessage(ToastMessages.IMPORT_GENERIC_ERROR);
                break;
            }
            case 200: { break; }
            case 201: {
                setSummary({ title: t("recipient.summary.summaryImportTitle"), message: '', data: response.payload.Summary })
                setShowLoader(false);
                break;
            }
            case 202: {
                setShowBackgroundUpload(true);
                setShowLoader(false);
                break;
            }
            case 400: {
                setToastMessage(ToastMessages.IMPORT_NO_FOLDER_FOUND);
                break;
            }
            case 404: {
                setToastMessage(ToastMessages.IMPORT_EMPTYLIST_INVALID_CLIENT);
                break;
            }
            case 500: {
                setToastMessage(ToastMessages.ERROR_OCCURED);
                break;
            }
        }
    }

    const searchGroupAndModify = async (groupName) => {
        const response = await dispatch(getGroups({ SearchTerm: groupName, PageSize: 6, PageIndex: 1 }))
        if (response?.payload?.Groups && response?.payload?.RecordCount === 1) {
            handleAddClients([response.payload.Groups[0].GroupID])
        }
        else if (response?.payload?.RecordCount > 1) {
            const exactGroup = response?.payload.Groups.find((g) => { return g.GroupName.trim() === groupName.trim() });
            handleAddClients([exactGroup.GroupID]);
        }
    }

    const handleImportRecipients = () => {
        if (manualUploadValidationscheck()) {
            let GroupObj = groups.find((obj) => obj.GroupID === selectedGroups[0])
            new Promise((resolve, reject) => resolve(dispatch(createGroup({ GroupName: GroupObj.GroupName })))).then((res) => {
                handleResponses(res, {
                    'S_200': {
                        code: 200,
                        message: '',
                        Func: () => null
                    },
                    'S_201': {
                        code: 201,
                        message: '',
                        Func: () => {
                            handleAddClients([res.payload.Message])
                        }
                    },
                    'S_401': {
                        code: 401,
                        message: ToastMessages.GROUP_INVALID_API,
                        Func: () => null
                    },
                    'S_404': {
                        code: 404,
                        message: ToastMessages.RECIPIENTS_NOT_FOUND,
                        Func: () => null
                    },
                    'S_405': {
                        code: 405,
                        message: ToastMessages.GROUP_ERROR,
                        Func: () => null
                    },
                    'S_422': {
                        code: 422,
                        // message: ToastMessages.GROUP_ALREADY_EXIST,
                        message: '',
                        Func: () => searchGroupAndModify(GroupObj.GroupName)
                    },
                    'S_500': {
                        code: 500,
                        message: ToastMessages.ERROR_OCCURED,
                        Func: () => null
                    },
                    'default': {
                        message: ToastMessages.GROUP_ERROR,
                        Func: () => null
                    },
                })
            });
        }

    }

    const GroupDialog = () => {

        return (
            <BaseDialog
                classes={classes}
                open={showGroups}
                onClose={() => setShowGroups(false)}
                onCancel={() => setShowGroups(false)}
                icon={< div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                className={classes.sidebar}
                renderButtons={
                    () => (<Grid
                        container
                        spacing={4}
                        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                        <Grid item>
                            <Button
                                onClick={() => setShowGroups(false)}
                                className={clsx(
                                    classes.btn,
                                    classes.btnRounded
                                )}>
                                {t('common.Cancel')}
                            </Button>
                        </Grid>
                    </Grid>)
                }
                title={
                    <>
                        {t("group.externalImportTitle")}
                    </>
                }
                showDivider={false}
                childrenStyle={classes.mt0}
            >
                <Box className={clsx(localClasses.dialogContainer, classes.sidebar)}>
                    <Typography className={clsx(windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400, color: "#000" }}>
                        {t("group.externalImportDesc")}
                    </Typography>
                    <DataTable
                        tableContainer={{
                            className: clsx(classes.sidebar, classes.tableStyle, classes.mt2,
                                windowSize === "xs" ? classes.mt3 : '')
                        }}
                        table={{ className: clsx(classes.tableContainer, classes.noborder) }}
                        tableHead={{
                            tableHeadCells: TABLE_HEAD,
                            classes: rowStyle,
                            className: clsx(classes.bgWhite)
                        }}
                    />

                    <Box className={clsx(localClasses.recordBoxMaxHeight, classes.sidebar, classes.mt1)} style={{ overflow: 'auto' }}>
                        {groups.map((obj, i) => (<TableRow key={Math.round(Math.random() * 999999999)} classes={rowStyle} className={classes.noborder}>
                            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2, classes.noborder, classes.f16)}>
                                <Grid container className={classes.flex}>
                                    <Grid className={classes.flex1}>
                                        <FormControlLabel
                                            label=""
                                            control={
                                                <Checkbox
                                                    color="primary"
                                                    checked={selectedGroups?.indexOf(obj.GroupID) !== -1}
                                                    // indeterminate={}
                                                    onClick={() => {
                                                        handleSelected(obj.GroupID);
                                                    }}
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid className={clsx(classes.flex, classes.flex2, localClasses.textRow)}>
                                        <Typography variant="body1" className={classes.ellipsisText}>
                                            {obj.GroupName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                        </TableRow>))}
                    </Box>
                </Box>
            </BaseDialog >
        )
    }

    const handleUpdateClientFields = (c) => {
        const cData = { ...ClientData };
        cData[Object.keys(cData)[0]] = c;
        setUpdatedClients(cData);
    }

    const ColumnAdjustmentPopup = () => {
        return (
            <ColumnAdjustmentDialog
                t={t}
                classes={classes}
                isOpen={showClients}
                settings={UploadSettings.GROUPS}
                isSimplyAccount={true}
                onClose={() => {
                    setSelectedGroups([])
                    setShowClients(false)
                }}
                onCancel={() => {
                    setSelectedGroups([])
                    setShowClients(false)
                }}
                onConfirm={() => filteredDAta.length > 0 && (SelectedGroupIds.length > 0 ? handleAddClients(SelectedGroupIds) : handleImportRecipients())}
                data={filteredDAta}
                headers={headers}
                setheaders={setheaders}
                tooltipText="recipient.bulkRecUpldTooltipText"
                onUpdateClientFields={handleUpdateClientFields}
                setselectArray={setselectArray}
                selectArray={selectArray}
            />
        )
    }
    const backgrounUploadInProgress = () => {
        return <BaseDialog
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            title={t('recipient.bulkImportTitle')}
            showDefaultButtons={false}
            classes={classes}
            contentStyle={classes.maxWidth900}
            open={showBackgroundUpload}
            renderButtons={() => (<>
                <Grid
                    container
                    spacing={2}
                    className={classes.dialogButtonsContainer}
                >
                    <Grid item xs={12}>
                        <>{RenderHtml(t(ToastMessages.UPLOADING_RECIPIENT_AS_FILE.message))}</>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            size='small'
                            onClick={() => {
                                setShowBackgroundUpload(false);
                                getData();
                                onClose();
                            }}
                            className={clsx(
                                classes.btn,
                                classes.btnRounded
                            )}>
                            {t('common.confirm')}
                        </Button>
                    </Grid>
                </Grid>
            </>)}
        >

        </BaseDialog>
    }

    return (
        <>
            <BaseDialog
                classes={classes}
                open={isOpen}
                onClose={onClose}
                onCancel={onClose}
                onConfirm={handleLogin}
                icon={<div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                title={t("group.simplyClubLoginTitle")}
                showDivider={false}
            >
                <Box className={clsx(classes.flex, classes.mt4, localClasses.h100)} style={{ paddingBottom: error ? 0 : 15 }}>
                    <Box
                        className={clsx(
                            classes.customDialogContentBox,
                            classes.flex,
                            classes.mt4,
                        )}
                        style={{ marginInline: 10 }}
                    >
                        <Box className={classes.flex1} >
                            <Typography>{t("common.username")}:</Typography>
                        </Box>
                        <Box className={classes.flex2} >
                            <TextField
                                type="text"
                                id="outlined-basic"
                                name="Username"
                                label=""
                                variant="outlined"
                                value={user.Username}
                                className={clsx(classes.textField, classes.minWidth252, { [classes.textFieldError]: !!error })}
                                inputProps={{ autocomplete: "new-password" }}
                                onChange={handleChange}
                            />
                        </Box>
                    </Box>
                    <Box
                        className={clsx(
                            classes.customDialogContentBox,
                            classes.flex,
                            classes.mt4,
                        )}
                        style={{ marginInline: 10 }}
                    >
                        <Box className={classes.flex1} >
                            <Typography>{t("common.password")}:</Typography>
                        </Box>
                        <Box className={classes.flex2} >
                            <TextField
                                type={showPassword ? "text" : "password"}
                                id="outlined-basic"
                                name="Password"
                                label=""
                                variant="outlined"
                                value={user.Password}
                                className={clsx(classes.textField, classes.minWidth252, { [classes.textFieldError]: !!error })}
                                inputProps={{ autocomplete: "new-password" }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <Button onClick={() => setShowPassword(!showPassword)} className={localClasses.pwdEveButton} > {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}</Button>,
                                }}
                                onKeyDown={(ev) => {
                                    if (ev.key === "Enter") {
                                        ev.preventDefault();
                                        handleLogin();
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                {error && <span className={localClasses.errortext}>{error}</span>}
                {showGroups && groups.length > 0 && GroupDialog()}
                {showClients && ColumnAdjustmentPopup()}
                {showBackgroundUpload && backgrounUploadInProgress()}
                {summary && <AddRecipientResponse
                    classes={classes}
                    isOpen={!!summary}
                    onClose={() => { setSummary(null); setSelectedGroups([]); getData(); }}
                    windowSize={windowSize}
                    title={summary.title}
                    message={summary.message}
                    summary={summary.data}
                />}

            </BaseDialog>
            <Loader isOpen={showLoader} zIndex={1500} />
        </>
    )
}

export default SimplyClubPupup