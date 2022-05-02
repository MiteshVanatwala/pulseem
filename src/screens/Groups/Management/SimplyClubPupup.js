import { Box, Typography, TextField, InputAdornment, IconButton, makeStyles, TableRow, TableCell, Checkbox, FormControlLabel, Grid, Tooltip } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Dialog } from "../../../components/managment/Dialog";
import { getExternalClientsByGroups, getGroupsForSimplyClub } from '../../../redux/reducers/groupSlice';
import { useDispatch } from 'react-redux';
import DataTable from '../../../components/Table/DataTable';
import { UploadSettings } from '../tempConstants';
import ColumnAdjustmentDialog from '../../../components/Files/ColumnAdjustmentDialog';
import {
    createGroup, addRecipients
} from "../../../redux/reducers/groupSlice";
import { Loader } from '../../../components/Loader/Loader';



const useStyles = makeStyles({
    dialogContainer: {
        width: 560
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
    }
});


const SimplyClubPupup = ({
    onClose,
    classes,
    isOpen,
    windowSize,
    getData,
    setToastMessage,
    handleResponses = (response, actions) => null
}) => {

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

    const [ClientData, setClientData] = useState([]);
    const [headers, setheaders] = useState([]);
    const [filteredDAta, setFilteredData] = useState([]);
    const [showLoader, setShowLoader] = useState(false)


    useEffect(() => {
        const preload = () => {
            let totalFields = 5;
            const data = ClientData.reduce((prev, next) => {
                let restELementsLen = 5 - prev.length
                let restElements = Object.values(next)[0];
                let tempFields = restElements.reduce((prev, next) => Object.keys(next).length, 0)
                if (totalFields < tempFields) {
                    totalFields = tempFields
                }
                if (restElements.length < restELementsLen) {
                    restELementsLen = restElements.length
                }
                let finalArr = restElements.slice(0, restELementsLen);
                return [...prev, ...finalArr]
            }, [])

            setFilteredData(data)

            let tempHeaders = Array.from({ length: totalFields }, (v, i) => t("sms.adjustTitle"))

            setheaders(tempHeaders)
        }
        preload()
    }, [])



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
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    const handleSelected = (id) => {
        const tempIndex = selectedGroups.indexOf(id)
        if (tempIndex === -1) {
            setSelectedGroups([...selectedGroups, id])
        }
        else {
            let tempArray = [...selectedGroups]
            tempArray.splice(tempIndex, 1)
            setSelectedGroups(tempArray)
        }
    }

    const handleLogin = async () => {
        setShowLoader(true)
        const response = await dispatch(getGroupsForSimplyClub(user))
        setShowLoader(false)
        handleResponses(response, {
            'S_200': {
                code: 200,
                // message: 'group.responses.serverFoundWithNoResponse',
                message: t('group.responses.success'),
                Func: () => {
                    setGroups(response?.payload?.Groups || [])
                    setShowGroups(true)
                }
            },
            'S_201': {
                code: 201,
                message: t('group.responses.success'),
                Func: () => null
            },
            'S_401': {
                code: 401,
                message: t('group.responses.featureNotAllowed'),
                Func: () => null
            },
            'S_404': {
                code: 404,
                message: t('recipient.responses.notFound'),
                Func: () => null
            },
            'S_500': {
                code: 500,
                message: t('common.ErrorOccured'),
                Func: () => null
            },
            'default': {
                message: t(''),
                Func: () => null
            },
        })
    }

    const handleGetClients = async () => {
        setShowLoader(true)
        const response = await dispatch(getExternalClientsByGroups({ ...user, Groups: [...selectedGroups] }))
        setShowLoader(false)
        handleResponses(response, {
            'S_200': {
                code: 200,
                message: t('group.responses.success'),
                Func: () => {
                    setClientData(response?.payload?.Clients)
                    setShowClients(true)
                }
            },
            'S_201': {
                code: 201,
                message: t('group.responses.success'),
                Func: () => null
            },
            'S_401': {
                code: 401,
                message: t('group.responses.featureNotAllowed'),
                Func: () => null
            },
            'S_404': {
                code: 404,
                message: t('recipient.responses.notFound'),
                Func: () => null
            },
            'S_500': {
                code: 500,
                message: t('common.ErrorOccured'),
                Func: () => null
            },
            'default': {
                message: t(''),
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

    const handleImportRecipients = () => {

        if (manualUploadValidationscheck()) {
            selectedGroups.forEach(element => {
                new Promise((resolve, reject) => resolve(dispatch(createGroup({ GroupName: element.GroupName })))).then((res) => {
                    if (res.Message) {
                        let tempClients = ClientData.find(obj => {
                            let tempGrpKey = Object.keys(obj)[0]
                            let tempGrpVal = Object.values(obj)[0]

                            if (tempGrpKey === element.GroupName) {
                                return tempGrpVal || []
                            }
                            return [];
                        })
                        const Payload = {
                            ClientsData: tempClients || [],
                            GroupIds: [res.Message]
                        }

                        new Promise((resolve, reject) => resolve(dispatch(addRecipients(Payload))))
                    }
                })
            })
        }
    }

    const GroupDialog = () => {

        return (
            <Dialog
                classes={classes}
                open={showGroups}
                onClose={() => setShowGroups(false)}
                onCancel={() => setShowGroups(false)}
                onConfirm={() => handleGetClients()}
                icon={< div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                childrenStyle={{ margin: 0 }}
                title={
                    <>
                        <Typography className={clsx(classes.reducedTitle, classes.resetDialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400 }}>
                            {t("group.externalImportTitle")}
                        </Typography>
                        <Typography className={clsx(windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400, color: "#000" }}>
                            {t("group.externalImportDesc")}
                        </Typography>
                    </>
                }
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
                onClose={() => setShowClients(false)}
                onCancel={() => setShowClients(false)}
                onConfirm={() => ClientData.length > 0 && handleImportRecipients()}
                data={filteredDAta}
                headers={headers}
                setheaders={setheaders}

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
            >

                <Typography className={clsx(classes.reducedTitle, classes.resetDialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)}
                    style={{ fontWeight: 400 }}>
                    {t("group.simplyClubLoginTitle")}
                </Typography>
                <Box className={clsx(classes.flex, classes.mt4, localClasses.h100)} style={{ paddingBottom: 15 }}>
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
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
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
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" style={{ width: 25, paddingInlineEnd: 15 }}>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                        // onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                }}

                            />
                        </Box>
                    </Box>
                </Box>
                {showGroups && GroupDialog()}
                {showClients && ColumnAdjustmentPopup()}

            </Dialog>
            <Loader isOpen={showLoader} zIndex={1500} />
        </>
    )
}

export default SimplyClubPupup