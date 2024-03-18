import clsx from "clsx";
import { AppBar, Box, Button, Container, FormControl, Grid, MenuItem, TextField, Typography } from "@material-ui/core";
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
import { FieldOfActivities } from "../../helpers/Constants";
import { MdArrowBackIos, MdArrowForwardIos, MdEditNotifications, MdMobileFriendly, MdNotifications, MdOutlineAddShoppingCart, MdOutlineMarkEmailRead, MdOutlinePages, MdOutlinePageview, MdOutlineWhatsapp, MdPageview } from "react-icons/md";

const SignUp = ({ classes }: any) => {
  const { windowSize, language, isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [ userDetails, setUserDetails ] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cellPhone: '',
    userName: '',
    password: '',
    companyName: '',
    contactName: '',
    birthDate: '',
    telephone: '',
    company_cellPhone: '',
    email: '',
    address: '',
    city: '',
    zipCode: null,
    website: '',
    fieldOfActivity: ''
  });
  const [ errors, setErrors ] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    cellPhone: '',
    userName: '',
    password: '',
    companyName: '',
    contactName: '',
    birthDate: '',
    telephone: '',
    company_cellPhone: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    website: '',
    fieldOfActivity: ''
  });

  const navigate = useNavigate()
  moment.locale(language);

  const handleChange = () => {

  }
  
  return (
    <Container
      maxWidth='xl'
      className={clsx()}
    >
      <AppBar component="nav" className={clsx(classes.p10, classes.f18, classes.bold, classes.flexColCenter)}>
        <PulseemNewLogo />
        <div className={clsx(classes.pt5)}>{t('SignUp.Header')}</div>
      </AppBar>
      
      <Box className={clsx(classes.pt90, classes.pageContainer)}>
        <h2 className={clsx(classes.flexColCenter, classes.colrPrimary)}>
          {t('SignUp.SubHeader')}
        </h2>

        <Box className={clsx(classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.PersonalInfo')}
          </h3>
          <div>{t('SignUp.PersonalInfoDesc')}</div>
          <Box className={"formContainer"} style={{ marginBottom: 25 }}>
            <Grid container spacing={3} className={clsx("form", classes.pt20)}>
              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.FirstName")}
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
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.firstName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.LastName")}
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
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.lastName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Phone")}
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
                  error={!!errors.phone}
                />
                {!!errors.phone && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.phone}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.CellPhone")}
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
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.cellPhone}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.UserName")}
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
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.userName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Password")}
                </Typography>
                <TextField
                  type="password"
                  variant="outlined"
                  size="small"
                  name="Password"
                  value={userDetails?.password}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    password: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.password}
                />
                {!!errors.password && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.password}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box className={clsx("settingsWrapper", classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.Company')}
          </h3>
          <div>{t('SignUp.CompanyDesc')}</div>
          <Box className={"formContainer"} style={{ marginBottom: 25 }}>
            <Grid container className={clsx("form", classes.pt20)} spacing={3}>
              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("settings.accountSettings.fixedComDetails.fields.compName")}
                </Typography>
                <TextField
                  type="password"
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
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.companyName}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.Website")}
                </Typography>
                <TextField
                  type="password"
                  variant="outlined"
                  size="small"
                  name="Website"
                  value={userDetails?.website}
                  onChange={(event: any) => setUserDetails({
                    ...userDetails,
                    website: event.target.value
                  })}
                  className={clsx(classes.textField, classes.minWidth252)}
                  error={!!errors.website}
                />
                {!!errors.website && (
                  <Typography className={clsx(classes.errorText, classes.f14)}>
                    {errors.website}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6} md={4} className={"textBoxWrapper"}>
                <Typography>
                  {t("SignUp.FieldOfActivity")}
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
                          direction: isRTL ? 'rtl' : 'ltr'
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
                          {tier}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box className={clsx(classes.pt10)}>
          <h3 className={clsx(classes.colrPrimary, classes.mb5)}>
            {t('SignUp.FieldOfInterest')}
          </h3>
          <div>{t('SignUp.FieldOfInterestDesc')}</div>
          <Box className={clsx(classes.pt20)} style={{ marginBottom: 25 }}>
            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdOutlineMarkEmailRead className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.BulkEmail")}
            </Button>

            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdMobileFriendly className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.BulkSMS")}
            </Button>

            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdOutlineWhatsapp className={clsx(classes.p5, classes.paddingSides10, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.WhatsApp")}
            </Button>

            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdPageview className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.LandingPages")}
            </Button>

            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdOutlineAddShoppingCart className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.Ecommerce")}
            </Button>

            <Button
              className={clsx(
                classes.btn,
                classes.btnRounded,
                classes.mr10,
                {
                  [classes.dFlex]: windowSize === 'xs',
                  [classes.mt10]: windowSize === 'xs',
                  [classes.f12]: windowSize === 'xs',
                }
              )}
              onClick={() => {}}
              startIcon={<MdNotifications className={clsx(classes.p5, windowSize === 'xs' ? classes.f16 : '')} />}
            >
              {t("SignUp.Notification")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
export default SignUp;