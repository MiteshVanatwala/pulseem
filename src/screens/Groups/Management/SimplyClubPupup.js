import { Box, Typography, TextField, InputAdornment, IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { Dialog } from "../../../components/managment/Dialog";
import { resetGroups } from '../../../redux/reducers/groupSlice';
import { useDispatch } from 'react-redux';

const SimplyClubPupup = ({
    onClose,
    classes,
    isOpen,
    windowSize,
    getData,
    selectedGroup = { GroupID: null },
    handleResponses = (response, actions) => null
}) => {

    const { t } = useTranslation();
    const dispatch = useDispatch()

    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState({
        username: '',
        password: ''
    })


    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        console.log("USER:", user)
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

    return (
        <Dialog
            classes={classes}
            open={isOpen}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            // onConfirm={onClose}
            customContainerStyle={{}}
        >
            <Typography className={clsx(classes.reducedTitle, classes.resetDialogTitle, windowSize !== 'xs' && windowSize !== 'sm' ? classes.ellipsisText : null)} style={{ fontWeight: 400 }}>
                Third Party Login
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
                            type="username"
                            id="outlined-basic"
                            name="username"
                            label=""
                            variant="outlined"
                            value={user.username}
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
                            name="password"
                            label=""
                            variant="outlined"
                            value={user.password}
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
    )
}

export default SimplyClubPupup