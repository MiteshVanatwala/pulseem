import clsx from "clsx";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import useCore from "../../../../helpers/hooks/Core";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../../components/Loader/Loader";
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { Title } from "../../../../components/managment/Title";
import Toast from "../../../../components/Toast/Toast.component";
import { LoginPassword } from "../../../../Models/Account/Password";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { changePassword } from "../../../../redux/reducers/AccountSettingsSlice";
import { Box, Typography, TextField, makeStyles, TableRow, TableCell, Checkbox, FormControlLabel, Grid, Button } from '@material-ui/core'

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

export interface PasswordParams { IsOpen: boolean, OnClose: Function | null }

const ChangePassword = ({ IsOpen = false, OnClose = null }: PasswordParams) => {
    const { classes } = useCore();
    const { t } = useTranslation();
    const localClasses = useStyles();
    const [loginPass, setLoginPass] = useState<LoginPassword>({
        OldPassword: '',
        NewPassword: '',
        ConfirmPassword: ''
    } as LoginPassword);
    const [oldPassError, setOldPassError] = useState<string>('');
    const [newPassError, setNewPassError] = useState<string>('');
    const [confirmPassError, setConfirmPassError] = useState<string>('');
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const dispatch = useDispatch();

    const handleConfirm = async () => {
        let isValid = true;
        if (!loginPass.OldPassword || loginPass.OldPassword === '') {
            isValid = false;
            setOldPassError(t("settings.changePassword.error.required"));
        }
        if (!loginPass.NewPassword || loginPass.NewPassword === '') {
            isValid = false;
            setNewPassError(t("settings.changePassword.error.required"));
        }
        if (!loginPass.ConfirmPassword || loginPass.ConfirmPassword === '') {
            isValid = false;
            setConfirmPassError(t("settings.changePassword.error.required"));
        }
        if (loginPass.NewPassword !== loginPass.ConfirmPassword) {
            isValid = false;
            setConfirmPassError(t("settings.changePassword.error.notMatch"));
        }

        if (isValid) {
            setShowLoader(true);
            const response = await dispatch(changePassword(loginPass));
            handleResponses(response);
            setShowLoader(false);
        }
    }

    const handleChange = (e: any) => {
        let actualValue = e?.target?.value;
        let trimValue = e?.target?.value.trim();
        setOldPassError('');
        setNewPassError('');
        setConfirmPassError('');
        setLoginPass({
            ...loginPass,
            [e?.target?.name]:
                trimValue.length + 1 === actualValue?.length ? actualValue : trimValue,
        });
    }

    const handleResponses = (response: any) => {

    }
    return (
        <>
            <BaseDialog
                open={IsOpen}
                onClose={OnClose}
                onCancel={OnClose}
                onConfirm={handleConfirm}
                icon={<div className={classes.dialogIconContent} >
                    {'\uE0D5'}
                </div >}
                title={t("settings.changePassword.title")}
                showDivider={true}
            >
                <Grid container className={clsx(classes.mb4)} style={{ maxWidth: 'calc(25vw)' }}>
                    <Grid item xs={12}>
                        <Typography>{t("settings.changePassword.subTitle")}</Typography>
                    </Grid>
                    {/* Old Password */}
                    <Grid item xs={10} className={clsx(
                        classes.customDialogContentBox,
                        classes.flex,
                        classes.mt4,
                    )}>
                        <Grid item xs={6}>
                            <Typography>{t("settings.changePassword.oldPassword")}:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                type={showPassword ? "text" : "password"}
                                id="outlined-basic"
                                name="OldPassword"
                                label=""
                                variant="outlined"
                                value={loginPass.OldPassword}
                                className={clsx(classes.textField, classes.minWidth252, oldPassError !== '' ? classes.textFieldError : '')}
                                inputProps={{ autocomplete: "new-password" }}
                                onChange={handleChange}
                                helperText={oldPassError}
                                InputProps={{
                                    endAdornment: <Button onClick={() => setShowPassword(!showPassword)} className={localClasses.pwdEveButton} > {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}</Button>,
                                }}
                            />
                        </Grid>
                    </Grid>
                    {/* New Password */}
                    <Grid item xs={10} className={clsx(
                        classes.customDialogContentBox,
                        classes.flex,
                        classes.mt4,
                    )}>
                        <Grid item xs={6}>
                            <Box className={classes.flex1} >
                                <Typography>{t("settings.changePassword.newPassword")}:</Typography>
                            </Box>

                        </Grid>
                        <Grid item xs={6} >
                            <Box className={classes.flex2} >
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    id="outlined-basic"
                                    name="NewPassword"
                                    label=""
                                    variant="outlined"
                                    value={loginPass.NewPassword}
                                    className={clsx(classes.textField, classes.minWidth252, newPassError !== '' ? classes.textFieldError : '')}
                                    inputProps={{ autocomplete: "new-password" }}
                                    onChange={handleChange}
                                    helperText={newPassError}
                                    InputProps={{
                                        endAdornment: <Button onClick={() => setShowPassword(!showPassword)} className={localClasses.pwdEveButton} > {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}</Button>,
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Confirm Password */}
                    <Grid item xs={10} className={clsx(
                        classes.customDialogContentBox,
                        classes.flex,
                        classes.mt4,
                    )}>
                        <Grid item xs={6}>
                            <Box className={classes.flex1} >
                                <Typography>{t("settings.changePassword.confirmPassword")}:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box className={classes.flex2} >
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    id="outlined-basic"
                                    name="ConfirmPassword"
                                    label=""
                                    variant="outlined"
                                    value={loginPass.ConfirmPassword}
                                    className={clsx(classes.textField, classes.minWidth252, confirmPassError !== '' ? classes.textFieldError : '')}
                                    inputProps={{ autocomplete: "new-password" }}
                                    onChange={handleChange}
                                    helperText={confirmPassError}
                                    InputProps={{
                                        endAdornment: <Button onClick={() => setShowPassword(!showPassword)} className={localClasses.pwdEveButton} > {showPassword ? <VisibilityOff style={{ fontSize: 15 }} /> : <Visibility style={{ fontSize: 15 }} />}</Button>,
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </BaseDialog>
            <Loader isOpen={showLoader} zIndex={1500} />
        </>
    )
}

export default ChangePassword;