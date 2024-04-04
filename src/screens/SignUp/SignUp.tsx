import clsx from "clsx";
import { AppBar, Box, Button, Checkbox, Container, FormControl, FormControlLabel, Grid, MenuItem, TextField, Tooltip, Typography, Zoom } from "@material-ui/core";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { useNavigate } from 'react-router';
import PulseemNewLogo from "../../assets/images/PulseemNewLogo";
import { useState } from "react";
import { StateType } from "../../Models/StateTypes";
import { IoIosArrowDown } from "react-icons/io";
import { FieldOfActivities, FieldOfInterest, lowerCaseLetters, numbers, specialLetters, upperCaseLetters } from "../../helpers/Constants";
import { MdDvr, MdMobileFriendly, MdNotifications, MdOutlineAddShoppingCart, MdOutlineMarkEmailRead, MdOutlineWhatsapp } from "react-icons/md";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";
import { Loader } from "../../components/Loader/Loader";
import USImage from "../../assets/images/united-states-flag-icon.svg";
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Illustration_BG_BL from "../../assets/images/Illustration_BG_BL";
import Illustration_BG_BR from "../../assets/images/Illustration_BG_BR";
import PasswordHint from "../Settings/AccountSettings/Password/PasswordHint";
import { ValidPassword } from "../Settings/AccountSettings/Password/Types";
import { PulseemReactInstance } from "../../helpers/Api/PulseemReactAPI";
import Toast from "../../components/Toast/Toast.component";
import { loginURL } from "../../config";
import queryString from 'query-string';

const SignUp = ({ classes }: any) => {
  const { windowSize, language } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [ showLoader, setLoader ] = useState(false);
  const [ userDetails, setUserDetails ] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cellPhone: '',
    userName: '',
    password: '',
    companyName: '',
    website: '',
    fieldOfActivity: '',
    fieldOfInterest: [],
    chkUpdate: false,
    chkPolicy: false
  });
  const [ errors, setErrors ] = useState({
    firstName: '',
    lastName: '',
    cellPhone: '',
    userName: '',
    password: '',
    companyName: '',
    fieldOfActivity: '',
    fieldOfInterest: '',
    chkPolicy: ''
  });
  const [ langSelected, setSelectedLang ] = useState('he');
  const [ passwordValidation, setPasswordValidation ] = useState<ValidPassword>({
    LowerChar: false,
    SpecialChar: false,
    UpperChar: false,
    PasswordLength: 0,
    NumberChar: false,
  } as ValidPassword);
  const [ toastMessage, setToastMessage ] = useState<any | never>(null);
  const qs = queryString.parse(window.location.search);
  const navigate = useNavigate()
  moment.locale(language);

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const renderInterestIcon = (icon: string) => {
    switch (icon) {
      case 'BulkEmail':
        return <MdOutlineMarkEmailRead className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;

      case 'BulkSMS':
        return <MdMobileFriendly className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;
    
      case 'WhatsApp':
        return <MdOutlineWhatsapp className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;

      case 'LandingPages':
        return <MdDvr className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;
      
      case 'Ecommerce':
        return <MdOutlineAddShoppingCart className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;
      
      case 'Notification':
        return <MdNotifications className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />;
      
      default:
        return <></>;
    }
  }

  const showMessage = (message: string, type: string = 'error') => {
    setToastMessage({ severity: type, color: type, message: t(message), showAnimtionCheck: false });
  }

  const saveSignup = async () => {
    let errorsTemp = errors;
    errorsTemp.firstName = userDetails.firstName ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.lastName = userDetails.lastName ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.cellPhone = userDetails.cellPhone ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.userName = userDetails.userName ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.password = '';
    errorsTemp.companyName = userDetails.companyName ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.fieldOfActivity = userDetails.fieldOfActivity ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.fieldOfInterest = userDetails.fieldOfInterest.length ? '' : t('common.Required', { lng: langSelected });
    errorsTemp.chkPolicy = userDetails.chkPolicy ? '' : t('common.Required', { lng: langSelected });
    if (userDetails.password && (!passwordValidation.LowerChar || !passwordValidation.NumberChar || !passwordValidation.PasswordLength || !passwordValidation.SpecialChar || !passwordValidation.UpperChar)) {
      errorsTemp.password = t('SignUp.InvalidPassword', { lng: langSelected });
    } else if (!userDetails.password) {
      errorsTemp.password = t('common.Required', { lng: langSelected });
    }
    setErrors({
      ...errors,
      ...errorsTemp
    });

    if (!errorsTemp.firstName && !errorsTemp.lastName && !errorsTemp.cellPhone && !errorsTemp.userName && !errorsTemp.password && !errorsTemp.companyName && !errorsTemp.fieldOfActivity && !errorsTemp.fieldOfInterest && !errorsTemp.chkPolicy) {
      setLoader(true);

      const { data: { Message }, status } = await PulseemReactInstance.post(`User/Signup`, {
        FirstName: userDetails.firstName,
        LastName: userDetails.lastName,
        Mobile: userDetails.phone,
        Phone: userDetails.cellPhone,
        UserName: userDetails.userName,
        Password: userDetails.password,
        Company: userDetails.companyName,
        Website: userDetails.website,
        ActivityField: userDetails.fieldOfActivity,
        InterestField: userDetails.fieldOfInterest,
        UserID: qs?.uid,
        ProductType: "",
      });
      setLoader(false);
      if (status === 200) {
        if (Message === 'ok') {
          showMessage(`SignUp.Message.${Message}`, 'success');
          setTimeout(() => {
            navigate(loginURL);
          }, 5000);
        } else {
          showMessage(`SignUp.Message.${Message}`);
        }
      } else {
        showMessage(`SignUp.Message.internalerror`);
      }
    }
  }

  const handleChange = (e: any) => {
    setUserDetails({
      ...userDetails,
      password: e?.target?.value.trim()
    });
    let trimValue = e?.target?.value.trim();
    const validPass = {
      LowerChar: !!trimValue?.match(lowerCaseLetters),
      SpecialChar: !!trimValue?.match(specialLetters),
      UpperChar: !!trimValue?.match(upperCaseLetters),
      PasswordLength: trimValue.length,
      NumberChar: !!trimValue?.match(numbers),
    } as ValidPassword;

    setPasswordValidation(validPass);
  };
  
  return (
    <Container
      maxWidth='xl'
      className={clsx()}
      style={{ direction:  langSelected === 'he' ? 'rtl' : 'ltr' }}
    >
      <div className={classes.background}>
        <Illustration_BG_BL className={'leftSvg'} />
        <Illustration_BG_BR className={'rightSvg'} />
      </div>
      <AppBar component="nav" className={clsx(classes.p10, classes.f18, classes.bold, classes.flexColCenter, classes.gradientBackground)}>
        <Grid container>
          <Grid md={2}></Grid>
          
          <Grid md={8}>
            <PulseemNewLogo />
            <div className={clsx(classes.pt5)}>{t('SignUp.Header', { lng: langSelected })}</div>
          </Grid>

          <Grid md={2} className={clsx({
            [classes.textRight]: langSelected === 'en',
            [classes.textLeft]: langSelected === 'he',
          })}>
            <ToggleButtonGroup
              color="primary"
              value={langSelected}
              exclusive
              aria-label="Platform"
              className={classes.SignUpButtonGroup}
            >
              <ToggleButton value="en" onClick={() => setSelectedLang('en')}>
                <Tooltip
                  disableFocusListener
                  title={`${t('languages.langCodes.english', { lng: langSelected })}`}
                  placement='top-start'
                  arrow
                >
                  <img src={USImage} alt={t('languages.langCodes.english', { lng: langSelected })} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="he" onClick={() => setSelectedLang('he')}>
                <Tooltip
                  disableFocusListener
                  title={`${t('languages.langCodes.hebrew', { lng: langSelected })}`}
                  placement='top-start'
                  arrow
                >
                  <img src={IsraelImage} alt={t('languages.langCodes.hebrew', { lng: langSelected })} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </AppBar>
      
      <Box className={clsx(classes.pt90, classes.pageContainer)}>
        {/* <h2 className={clsx(classes.flexColCenter, classes.colrPrimary)}>
          {t('SignUp.SubHeader', { lng: langSelected })}
        </h2> */}

        <Box className={clsx(classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.PersonalInfo', { lng: langSelected })}
          </h3>
          <div>{t('SignUp.PersonalInfoDesc', { lng: langSelected })}</div>
          <Box className={"formContainer"} style={{ marginBottom: 25 }}>
            <Grid container spacing={3} className={clsx("form", classes.pt20)}>
              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.FirstName", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="FirstName"
                  value={userDetails?.firstName}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    firstName: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.firstName}
                />
                {!!errors.firstName && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.firstName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.LastName", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="LastName"
                  value={userDetails?.lastName}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    lastName: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.lastName}
                />
                {!!errors.lastName && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.lastName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Phone", { lng: langSelected })}
                  <span className={clsx(classes.f18)}></span>
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="Phone"
                  value={userDetails?.phone}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    phone: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.CellPhone", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="CellPhone"
                  value={userDetails?.cellPhone}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    cellPhone: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.cellPhone}
                />
                {!!errors.cellPhone && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.cellPhone}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.UserName", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  name="UserName"
                  value={userDetails?.userName}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    userName: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.userName}
                />
                {!!errors.userName && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.userName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Password", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <Tooltip
                  TransitionComponent={Zoom}
                  interactive={true}
                  title={<PasswordHint
                    Password={passwordValidation}
                    classes={classes}
                  />}
                  placement='bottom'
                  arrow
                >
                  <TextField
                    type="password"
                    variant="outlined"
                    size="small"
                    name="Password"
                    value={userDetails?.password}
                    onChange={handleChange}
                    className={clsx(classes.textField, classes.minWidth252)}
                    error={!!errors.password}
                  />
                </Tooltip>
                {!!errors.password && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.password}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box className={clsx("settingsWrapper", classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.Company', { lng: langSelected })}
          </h3>
          <div>{t('SignUp.CompanyDesc', { lng: langSelected })}</div>
          <Box className={"formContainer"} style={{ marginBottom: 25 }}>
            <Grid container className={clsx("form", classes.pt20)} spacing={3}>
              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("settings.accountSettings.fixedComDetails.fields.compName", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <TextField
                  type="text"
                  variant="outlined"
                  size="small"
                  name="CompanyName"
                  value={userDetails?.companyName}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    companyName: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.companyName}
                />
                {!!errors.companyName && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.companyName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Website", { lng: langSelected })}
                  <span className={clsx(classes.f18)}></span>
                </Typography>
                <TextField
                  type="text"
                  variant="outlined"
                  size="small"
                  name="Website"
                  value={userDetails?.website}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    website: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.FieldOfActivity", { lng: langSelected })}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                </Typography>
                <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.w100)}>
                  <Select
                    variant="standard"
                    autoWidth
                    value={userDetails.fieldOfActivity}
                    name='TwoFactorAuthOptionID'
                    onChange={(e: SelectChangeEvent) => {
                      setUserDetails({
                        ...userDetails,
                        fieldOfActivity: e.target.value
                      })                      
                    }}
                    IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          direction: langSelected === 'he' ? 'rtl' : 'ltr'
                        },
                      },
                    }}
                  >
                    {FieldOfActivities?.map((tier: any) => {
                      return (
                        <MenuItem
                          key={tier}
                          value={tier}
                        >
                          {t(`SignUp.${tier}`, { lng: langSelected })}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {!!errors.fieldOfActivity && (
                  <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                    {errors.fieldOfActivity}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box className={clsx(classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.FieldOfInterest', { lng: langSelected })}
            <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
          </h3>
          <div>{t('SignUp.FieldOfInterestDesc', { lng: langSelected })}</div>
          <Box className={clsx(classes.pt20)} style={{ marginBottom: 25 }}>
            {
              FieldOfInterest.map((interest) => {
              // FieldOfInterest.map(({ index, label }) => {
                return <Button
                  className={clsx(
                    classes.btn,
                    classes.btnRounded,
                    classes.mr10,
                    classes.fieldOfInterestButton,
                    {
                      [classes.dFlex]: windowSize === 'xs',
                      [classes.mt10]: windowSize === 'xs',
                      [classes.f12]: windowSize === 'xs',
                      [classes.gradientBackground]: userDetails.fieldOfInterest.find((item) => item === interest),
                      [classes.colorWhite]: userDetails.fieldOfInterest.find((item) => item === interest)
                    }
                  )}
                  onClick={() => {
                    setUserDetails({
                      ...userDetails,
                      // @ts-ignore
                      fieldOfInterest: userDetails.fieldOfInterest.find((item) => item === interest) ? userDetails.fieldOfInterest.filter(item => item !== interest) : [...userDetails.fieldOfInterest, interest]
                    })
                  }}
                  startIcon={renderInterestIcon(interest)}
                >
                  {t(`SignUp.${interest}`, { lng: langSelected })}
                </Button>
              })
            }
            {!!errors.fieldOfInterest && (
              <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                {errors.fieldOfInterest}
              </Typography>
            )}
          </Box>

          <FormControl className={classes.pt20}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={userDetails.chkUpdate}
                  onChange={() => setUserDetails({ ...userDetails, chkUpdate: !userDetails.chkUpdate })}
                  color="primary"
                />
              }
              label={RenderHtml(t('SignUp.UpdateTrainingContentCheckbox', { lng: langSelected }))}
            />
          </FormControl>

          <FormControl className={classes.dBlock}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={userDetails.chkPolicy}
                  onChange={() => setUserDetails({ ...userDetails, chkPolicy: !userDetails.chkPolicy })}
                  color="primary"
                />
              }
              label={<>
                  {RenderHtml(t('SignUp.PrivacyPolicyCheckbox', { lng: langSelected }))}
                  <span className={clsx(classes.pl5, classes.colrPrimary, classes.f18)}>*</span>
                  {!!errors.chkPolicy && (
                    <Typography className={clsx(classes.errorText, classes.f14, classes.textCapitalize)}>
                      {errors.chkPolicy}
                    </Typography>
                  )}
                </>
              }
            />
          </FormControl>
        </Box>

        <Box className={clsx(classes.pt50, classes.pb25, classes.textCenter)}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.mr10,
              classes.p10,
              classes.mb50,
              classes.colorWhite,
              classes.gradientBackground
            )}
            style={{ width: '200px', height: '50px' }}
            onClick={saveSignup}
          >
            {t(`common.save`, { lng: langSelected })}
          </Button>
        </Box>
      </Box>
      <Loader isOpen={showLoader} showBackdrop={true} />
      {renderToast()}
    </Container>
  );
};
export default SignUp;