import { Box, Typography, TextField, InputAdornment, IconButton, makeStyles, TableRow, TableCell, Checkbox, FormControlLabel, Grid } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { Dialog } from "../../../components/managment/Dialog";
import { getGroupsForSimplyClub, resetGroups } from '../../../redux/reducers/groupSlice';
import { useDispatch } from 'react-redux';
import DataTable from '../../../components/Table/DataTable';



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
        alignItems: 'center'
    },
    recordBoxMaxHeight: {
        maxHeight: '420px'
    },
    mb45: {
        marginBottom: 45
    }
});


const SimplyClubPupup = ({
    onClose,
    classes,
    isOpen,
    windowSize,
    getData,
    // selectedGroup = { GroupID: null },
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
    const [groups, setGroups] = useState([
        {
            GroupID: 1,
            GroupName: 'Group 1'
        },
        {
            GroupID: 2,
            GroupName: 'Group 2'
        },
        {
            GroupID: 3,
            GroupName: 'Group 3'
        },
        {
            GroupID: 4,
            GroupName: 'Group 4'
        },
        {
            GroupID: 5,
            GroupName: 'Group 5'
        },
        {
            GroupID: 6,
            GroupName: 'Group 6'
        },
        {
            GroupID: 7,
            GroupName: 'Group 7'
        },
        {
            GroupID: 8,
            GroupName: 'Group 8'
        },
        {
            GroupID: 9,
            GroupName: 'Group 9'
        },
        {
            GroupID: 10,
            GroupName: 'Group 10'
        },
        {
            GroupID: 11,
            GroupName: 'Group 11'
        },
        {
            GroupID: 12,
            GroupName: 'Group 12'
        },
        {
            GroupID: 13,
            GroupName: 'Group 13'
        },
    ])
    const [selectedGroups, setSelectedGroups] = useState([])

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

    const handleSubmit = async () => {
        setShowGroups(true)
        console.log("USER:", user)
        const response = await dispatch(getGroupsForSimplyClub(user))
        console.log("Groups:", response)
    }

    // const handleSubmit = async () => {
    //     const response = await new Promise((resolve, reject) => resolve(dispatch(resetGroups(selectedGroup))))

    //     handleResponses(response, {
    //         'S_201': {
    //             code: 201,
    //             message: '',
    //             Func: new Promise(async (resolutionFunc, rejectionFunc) => {
    //                 await resolutionFunc(getData());
    //                 onClose();
    //             })
    //         },
    //         'S_400': {
    //             code: 400,
    //             message: '',
    //             Func: () => null
    //         },
    //         'S_401': {
    //             code: 401,
    //             message: '',
    //             Func: () => null
    //         },
    //         'S_405': {
    //             code: 405,
    //             message: '',
    //             Func: () => null
    //         },
    //         'S_422': {
    //             code: 422,
    //             message: '',
    //             Func: () => null
    //         },
    //         'default': {
    //             message: '',
    //             Func: () => null
    //         },
    //     })
    // }





    const GroupDialog = () => {

        return (
            <Dialog
                classes={classes}
                open={showGroups}
                onClose={() => setShowGroups(false)}
                onCancel={() => setShowGroups(false)}
                onConfirm={() => setShowGroups(false)}
                icon={< div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                // onConfirm={onClose}

                // customContainerStyle={clsx(localClasses.dialogContainer)}
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
                                        {obj.GroupName}
                                    </Grid>
                                </Grid>
                            </TableCell>
                        </TableRow>))}
                    </Box>
                </Box>
            </Dialog >
        )
    }

    return (
        <>
            <Dialog
                classes={classes}
                open={isOpen}
                onClose={onClose}
                onCancel={onClose}
                onConfirm={handleSubmit}
                // onConfirm={onClose}
                customContainerStyle={{}}
                icon={< div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                childrenStyle={localClasses.mb45}
            >
                <Typography className={clsx(classes.reducedTitle, classes.resetDialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400 }}>
                    {t("group.simplyClubLoginTitle")}
                </Typography>
                <Box className={clsx(classes.flex, classes.mt4)}>
                    <Box
                        className={clsx(
                            classes.customDialogContentBox,
                            classes.flex,
                            classes.mt4,
                        )}
                        style={{ marginInline: 10 }}
                    >
                        <Box className={classes.flex1} >
                            <Typography>Username:</Typography>
                        </Box>
                        <Box className={classes.flex2} >
                            <TextField
                                type="text"
                                id="outlined-basic"
                                name="Username"
                                label=""
                                variant="outlined"
                                value={user.Username}
                                className={clsx(classes.textField, classes.minWidth252)}
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
                            <Typography>Password:</Typography>
                        </Box>
                        <Box className={classes.flex2} >
                            <TextField
                                type={showPassword ? "text" : "password"}
                                id="outlined-basic"
                                name="Password"
                                label=""
                                variant="outlined"
                                value={user.Password}
                                className={clsx(classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" style={{ width: 25 }}>
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
            </Dialog>
            {showGroups && GroupDialog()}
        </>
    )
}

export default SimplyClubPupup