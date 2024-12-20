import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../../../../components/Loader/Loader";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { LoginPassword } from "../../../../Models/Account/Password";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { changePassword } from "../../../../redux/reducers/AccountSettingsSlice";
import {
  Box,
  Typography,
  TextField,
  makeStyles,
  Grid,
  Button,
} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
import { ValidPassword } from "./Types";
import PasswordHint from "./PasswordHint";

const useStyles = makeStyles({
  dialogContainer: {
    width: "100%",
  },
  fw500: {
    fontWeight: 500,
  },
  textRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "66.667%",
  },
  recordBoxMaxHeight: {
    maxHeight: "420px",
  },
  mb45: {
    marginBottom: 45,
  },
  customWidth: {
    maxWidth: 200,
    backgroundColor: "black",
    fontSize: "14px",
    textAlign: "center",
  },
  noMaxWidth: {
    maxWidth: "none",
  },
  h100: {
    height: 100,
  },
  errortext: {
    fontSize: ".9em",
    color: "red",
    marginInline: "10px",
  },
  pwdEveButton: {
    width: 25,
    padding: 5,
    minWidth: 10,
    marginRight: 5,
  },
});

export interface PasswordParams {
  classes: any;
  IsOpen: boolean;
  OnClose: Function;
  SetToast: Function;
  Text: string | null | undefined;
  oldPasswordRequired?: boolean
}

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 14,
    width: 350,
    maxWidth: "none",
  },
}));

function BootstrapTooltip(props: any) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

const ChangePassword = ({
  classes,
  IsOpen = false,
  OnClose,
  SetToast,
  Text,
  oldPasswordRequired = true
}: PasswordParams) => {
  const { t } = useTranslation();
  const localClasses = useStyles();
  const { windowSize } = useSelector((state: any) => state.core);
  const [loginPass, setLoginPass] = useState<LoginPassword>({
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  } as LoginPassword);
  const [oldPassError, setOldPassError] = useState<string>("");
  const [newPassError, setNewPassError] = useState<string>("");
  const [confirmPassError, setConfirmPassError] = useState<string>("");
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordValidation, setPasswordValidation] = useState<ValidPassword>({
    LowerChar: false,
    SpecialChar: false,
    UpperChar: false,
    PasswordLength: 0,
    NumberChar: false,
  } as ValidPassword);
  const [showPasswordTip, setShowPasswordTip] = useState<boolean>(false);
  const [errors, setErrors] = useState([]);

  const { ToastMessages } = useSelector((state: any) => state?.accountSettings);
  const lowerCaseLetters = /[a-z]/g;
  const upperCaseLetters = /[A-Z]/g;
  const numbers = /[0-9]/g;
  const specialLetters = /[!"#$%&'()*+.\/:;<=>?@\[\\\]^_`{|}~-]/g;

  const dispatch = useDispatch();

  useEffect(() => {
    if (IsOpen) {
      setErrors([]);
      setLoginPass({
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: "",
      });
      setPasswordValidation({
        LowerChar: false,
        SpecialChar: false,
        UpperChar: false,
        PasswordLength: 0,
        NumberChar: false,
      })
      setOldPassError('')
      setNewPassError('');
      setConfirmPassError('');
    }
  }, [IsOpen])

  const handleConfirm = async () => {
    const missingErrorsObj: any = {
      LowerChar: t("settings.changePassword.passwordHint.lowerChar"),
      SpecialChar: t("settings.changePassword.passwordHint.specialChar"),
      UpperChar: t("settings.changePassword.passwordHint.upperChar"),
      PasswordLength: t("settings.changePassword.passwordHint.length"),
      NumberChar: t("settings.changePassword.passwordHint.number"),
    };
    let isValid = true;
    if (oldPasswordRequired && (!loginPass.OldPassword || loginPass.OldPassword === "")) {
      isValid = false;
      setOldPassError(t("settings.changePassword.error.required"));
    }
    if (!loginPass.NewPassword || loginPass.NewPassword === "") {
      isValid = false;
      setNewPassError(t("settings.changePassword.error.required"));
    }
    if (!loginPass.ConfirmPassword || loginPass.ConfirmPassword === "") {
      isValid = false;
      setConfirmPassError(t("settings.changePassword.error.required"));
    }
    if (loginPass.NewPassword !== loginPass.ConfirmPassword) {
      isValid = false;
      setConfirmPassError(t("settings.changePassword.error.notMatch"));
    }
    const missingRules: any = [];

    Object.keys(passwordValidation).forEach((key: any) => {
      console.log(Object.values(passwordValidation));
      //@ts-ignore
      if (passwordValidation[key] === false) {
        missingRules.push(missingErrorsObj[key]);
      } //@ts-ignore
      if (key === "PasswordLength" && passwordValidation[key] < 8) {
        missingRules.push(missingErrorsObj[key]);
      }
    });

    if (missingRules.length > 0) {
      setErrors(missingRules);
    } else {
      setErrors([]);
      if (isValid) {
        setShowLoader(true);
        const response = await dispatch(changePassword(loginPass));
        handleResponses(response);
        setShowLoader(false);
      }
    }
  };

  const handleChange = (e: any) => {
    let actualValue = e?.target?.value;
    let trimValue = e?.target?.value.trim();
    setOldPassError("");
    setNewPassError("");
    setConfirmPassError("");
    setLoginPass({
      ...loginPass,
      [e?.target?.name]:
        trimValue.length + 1 === actualValue?.length ? actualValue : trimValue,
    });

    if (e?.target.name === "NewPassword") {
      const validPass = {
        LowerChar: !!trimValue?.match(lowerCaseLetters),
        SpecialChar: !!trimValue?.match(specialLetters),
        UpperChar: !!trimValue?.match(upperCaseLetters),
        PasswordLength: trimValue.length,
        NumberChar: !!trimValue?.match(numbers),
      } as ValidPassword;

      setPasswordValidation(validPass);
    }
  };

  const handleResponses = (response: any) => {
    SetToast(ToastMessages.CHANGE_PASSWORD[response?.payload?.StatusCode]);

    if (response?.payload?.StatusCode === 201) {
      setLoginPass({
        OldPassword: "",
        NewPassword: "",
        ConfirmPassword: "",
      });
      OnClose();
    }
  };

  return (
    <>
      <BaseDialog
        classes={classes}
        open={IsOpen}
        onClose={OnClose}
        onCancel={OnClose}
        onConfirm={handleConfirm}
        title={t("settings.changePassword.title")}
        showDivider={false}
      >
        <Grid
          container
          className={clsx(classes.mb4)}
          style={{ maxWidth:  windowSize !== 'xs' ? "400px" : '' }}
        >
          <Grid item xs={12}>
            <Typography>
              {Text ? Text : t("settings.changePassword.subTitle")}
            </Typography>
          </Grid>
          {/* Old Password */}
          {
            oldPasswordRequired && (
              <Grid
                item
                xs={12}
                className={clsx(
                  classes.mt4
                )}
              >
                <Grid item xs={12}>
                  <Typography>
                    {t("settings.changePassword.oldPassword")}:
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    id="outlined-basic"
                    name="OldPassword"
                    label=""
                    variant="outlined"
                    value={loginPass.OldPassword}
                    className={clsx(
                      classes.textField,
                      classes.minWidth252,
                      oldPassError !== "" ? classes.textFieldError : ""
                    )}
                    inputProps={{ autocomplete: "old-password" }}
                    onChange={handleChange}
                    helperText={oldPassError}
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          className={localClasses.pwdEveButton}
                        >
                          {" "}
                          {showPassword ? (
                            <VisibilityOff style={{ fontSize: 15 }} />
                          ) : (
                            <Visibility style={{ fontSize: 15 }} />
                          )}
                        </Button>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )
          }
          {/* New Password */}
          <Grid
            item
            xs={12}
            className={clsx(
              classes.mt4
            )}
          >
            <Grid item xs={12}>
              <Box className={classes.flex1}>
                <Typography>
                  {t("settings.changePassword.newPassword")}:
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.flex2}>
                <BootstrapTooltip
                  TransitionComponent={Zoom}
                  interactive={true}
                  title={
                    <PasswordHint
                      Password={passwordValidation}
                      classes={classes}
                    />
                  }
                  arrow
                  open={showPasswordTip}
                >
                  <TextField
                    onFocus={() => setShowPasswordTip(true)}
                    onBlur={() => setShowPasswordTip(false)}
                    type={showPassword ? "text" : "password"}
                    id="outlined-basic"
                    name="NewPassword"
                    label=""
                    variant="outlined"
                    value={loginPass.NewPassword}
                    className={clsx(
                      classes.textField,
                      classes.minWidth252,
                      newPassError !== "" ? classes.textFieldError : ""
                    )}
                    inputProps={{ autocomplete: "new-password" }}
                    onChange={handleChange}
                    helperText={newPassError}
                    InputProps={{
                      endAdornment: (
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          className={localClasses.pwdEveButton}
                        >
                          {" "}
                          {showPassword ? (
                            <VisibilityOff style={{ fontSize: 15 }} />
                          ) : (
                            <Visibility style={{ fontSize: 15 }} />
                          )}
                        </Button>
                      ),
                    }}
                  />
                </BootstrapTooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Confirm Password */}
          <Grid
            item
            xs={12}
            className={clsx(
              classes.mt4
            )}
          >
            <Grid item xs={12}>
              <Box className={classes.flex1}>
                <Typography>
                  {t("settings.changePassword.confirmPassword")}:
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.flex2}>
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="outlined-basic"
                  name="ConfirmPassword"
                  label=""
                  variant="outlined"
                  value={loginPass.ConfirmPassword}
                  className={clsx(
                    classes.textField,
                    classes.minWidth252,
                    confirmPassError !== "" ? classes.textFieldError : ""
                  )}
                  inputProps={{ autocomplete: "new-password" }}
                  onChange={handleChange}
                  helperText={confirmPassError}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        className={localClasses.pwdEveButton}
                      >
                        {" "}
                        {showPassword ? (
                          <VisibilityOff style={{ fontSize: 15 }} />
                        ) : (
                          <Visibility style={{ fontSize: 15 }} />
                        )}
                      </Button>
                    ),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          {errors?.length > 0 && (
            <Grid container>
              <Grid item xs={12}>
                <Typography className={classes.red}>
                  {t("settings.changePassword.passwordHint.title")}:
                </Typography>
                <Typography className={classes.red}>
                  {errors.map((err, idx) => {
                    return `${err}${idx < errors.length - 1 ? ", " : ""}`;
                  })}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </BaseDialog>
      <Loader isOpen={showLoader} zIndex={1500} />
    </>
  );
};

export default ChangePassword;