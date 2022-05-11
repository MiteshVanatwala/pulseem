import { Box, Typography, TextField, InputAdornment, IconButton, makeStyles, TableRow, TableCell, Checkbox, FormControlLabel, Grid, Tooltip, Button } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Dialog } from "../../../../components/managment/Dialog";
import { addRecipient, getExternalClientsByGroups, getGroups, getGroupsForSimplyClub } from '../../../../redux/reducers/groupSlice';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '../../../../components/Table/DataTable';
import { simplyCLubClientData, UploadSettings } from '../../tempConstants';
import ColumnAdjustmentDialog from '../../../../components/Files/ColumnAdjustmentDialog';
import {
    createGroup
} from "../../../../redux/reducers/groupSlice";
import { Loader } from '../../../../components/Loader/Loader';
import AddRecipientResponse from './AddRecipientResponse';



const useStyles = makeStyles({
    dialogContainer: {
        width: '100%'
    },
    tableHead: {
        borderBottom: '2px solid #000000 !important'
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
    handleResponses = (response, actions) => null,
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

    const [ClientData, setClientData] = useState({});
    const [headers, setheaders] = useState([]);
    const [filteredDAta, setFilteredData] = useState([]);
    const [showLoader, setShowLoader] = useState(false)
    const [summary, setSummary] = useState(null)
    const [error, setError] = useState(null)


    useEffect(() => {
        const preload = () => {
            let totalFields = 5;
            const data = Object.entries(ClientData).reduce((prev, [key, value]) => {
                let restELementsLen = 5 - prev.length
                let restElements = value;
                // let tempFields = restElements.reduce((prev, next) => Object.values(next).filter(obj => !!obj || obj === false).length, 0)
                let tempFields = restElements.reduce(
                    (prev, next) => {
                        // let tempLength = Object.values(next).filter(obj => obj !== null && obj !== undefined).length
                        let tempLength = Object.values(next).length
                        if (totalFields < tempLength) {
                            totalFields = tempLength
                        }
                    }
                    , 0)

                if (restElements.length < restELementsLen) {
                    restELementsLen = restElements.length
                }
                let finalArr = restElements.slice(0, restELementsLen);
                return [...prev, ...finalArr]
            }, [])

            // console.log(totalFields)
            let tempHeaders = Array.from({ length: totalFields }, (v, i) => t("sms.adjustTitle"))
            setFilteredData(data)
            setheaders([...tempHeaders])
        }
        preload()
    }, [ClientData])


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
                message: '',
                Func: () => {
                    setClientData(response?.payload?.Clients || [])
                    // setClientData(simplyCLubClientData || [])
                    setShowClients(true)
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

    const handleAddClients = (ids) => {
        setShowLoader(true)
        let tempClients = Object.values(ClientData)[0]
        const Payload = {
            ClientsData: tempClients || [],
            GroupIds: ids
        }
        new Promise((resolve, reject) => resolve(dispatch(addRecipient(Payload)))).then((response) => {
            handleResponses(response, {
                'S_200': {
                    code: 200,
                    message: '',
                    Func: () => null
                },
                'S_201': {
                    code: 201,
                    message: '',
                    Func: () => {
                        setShowClients(false);
                        setShowLoader(false)
                        setClientData({})
                        setSelectedGroups([]);
                        setSelectedGroupIds([])
                        setSummary({ title: t("recipient.summary.summaryImportTitle"), message: '', data: response.payload.Summary })
                    }
                },
                'S_400': {
                    code: 400,
                    message: ToastMessages.IMPORT_EMPTYLIST_INVALID_CLIENT,
                    Func: () => null
                },
                'S_404': {
                    code: 404,
                    message: ToastMessages.IMPORT_NO_FOLDER_FOUND,
                    Func: () => null
                },
                'S_500': {
                    code: 500,
                    message: ToastMessages.ERROR_OCCURED,
                    Func: () => null
                },
                'default': {
                    message: ToastMessages.IMPORT_GENERIC_ERROR,
                    Func: () => null
                },
            })
        }).finally(() => setShowLoader(false))
    }

    const searchGroupAndModify = async (groupName) => {
        setShowLoader(true)
        const response = await dispatch(getGroups({ SearchTerm: groupName, PageSize: 6, PageIndex: 1 }))
        if (response?.payload?.Groups && response?.payload?.RecordCount === 1) {
            handleAddClients([response.payload.Groups[0].GroupID])
        }
        setShowLoader(false)
    }

    const handleImportRecipients = () => {
        if (manualUploadValidationscheck()) {
            setShowLoader(true)
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
                            setShowLoader(false)
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
            }).finally(() => setShowLoader(false))
        }

    }

    const GroupDialog = () => {

        return (
            <Dialog
                classes={classes}
                open={showGroups}
                onClose={() => setShowGroups(false)}
                // onConfirm={() => handleGetClients()} //BUG (PR-356): Confirm The Action on this Button
                icon={< div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                childrenStyle={{ margin: 0 }}
                // customContainerStyle={ }
                className={classes.sidebar}

                renderButtons={
                    () => (<Grid
                        container
                        spacing={4}
                        className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='small'
                                onClick={handleGetClients}
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogConfirmButton,
                                    selectedGroups.length === 0 ? classes.disabled : ''
                                )}>
                                {t('common.Ok')}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained'
                                size='small'
                                onClick={() => setShowGroups(false)}
                                className={clsx(
                                    classes.dialogButton,
                                    classes.dialogCancelButton
                                )}>
                                {t('common.Cancel')}
                            </Button>
                        </Grid>
                    </Grid>)
                }
                title={
                    <>
                        {/* <Typography className={clsx(classes.reducedTitle, classes.resetDialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400 }}> */}
                        {t("group.externalImportTitle")}
                        {/* </Typography> */}
                        <Typography className={clsx(windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400, color: "#000" }}>
                            {t("group.externalImportDesc")}
                        </Typography>
                    </>
                }
                showDivider={true}
            >
                <Box className={clsx(localClasses.dialogContainer, classes.sidebar)}>
                    <DataTable
                        tableContainer={{
                            className: clsx(classes.sidebar, classes.tableStyle,
                                windowSize === "xs" ? classes.mt3 : '')
                        }}
                        table={{ className: clsx(classes.tableContainer, classes.noborder) }}
                        tableHead={{
                            tableHeadCells: TABLE_HEAD,
                            classes: rowStyle,
                            className: clsx(classes.bgWhite, localClasses.tableHead)
                        }}
                    />

                    <Box className={clsx(localClasses.recordBoxMaxHeight, classes.sidebar)} style={{ overflow: 'auto' }}>
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
                                        <Typography variant="body1" className={classes.textEllipses}>
                                            {obj.GroupName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                        </TableRow>))}
                    </Box>
                </Box>
            </Dialog >
        )
    }

    const ColumnAdjustmentPopup = () => {
        return (
            <ColumnAdjustmentDialog
                classes={classes}
                isOpen={showClients}
                settings={UploadSettings.GROUPS}
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
            />
        )
    }

    return (
        <>
            <Dialog
                classes={classes}
                open={isOpen}
                onClose={onClose}
                onCancel={onClose}
                onConfirm={handleLogin}
                icon={<div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                title={t("group.simplyClubLoginTitle")}
                showDivider={true}
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
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252, error ? classes.textFieldError : '')}
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
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252, error ? classes.textFieldError : '')}
                                inputProps={{ autocomplete: "new-password" }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <Button onClick={() => setShowPassword(!showPassword)} className={localClasses.pwdEveButton} > {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}</Button>,
                                }}

                            />
                        </Box>
                    </Box>
                </Box>
                {error && <span className={localClasses.errortext}>{error}</span>}
                {showGroups && groups.length > 0 && GroupDialog()}
                {showClients && ColumnAdjustmentPopup()}
                {summary && <AddRecipientResponse
                    classes={classes}
                    isOpen={!!summary}
                    onClose={() => { setSummary(null); setSelectedGroups([]); }}
                    windowSize={windowSize}
                    title={summary.title}
                    message={summary.message}
                    summary={summary.data}
                />}

            </Dialog>
            <Loader isOpen={showLoader} zIndex={1500} />
        </>
    )
}

export default SimplyClubPupup