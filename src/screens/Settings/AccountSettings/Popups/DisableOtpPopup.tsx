import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { Box, Button, FormControl, Grid, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTwoFactorAuthValues } from "../../../../redux/reducers/AccountSettingsSlice";
import PulseemRadio from "../../../../components/Controlls/PulseemRadio";
import { IoIosArrowDown } from "react-icons/io";
import { StateType } from "../../../../Models/StateTypes";
import { checkOTP, sendOTP } from "../../../../redux/reducers/commonSlice";
import { logout } from "../../../../helpers/Api/PulseemReactAPI";

const DisableOtpPopup = ({ classes, onClose, onConfirm }: any) => {
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const [emailList, setEmailList] = useState([]);
  const [cellphoneList, setCellphoneList] = useState([]);
  const [selectedOption, setSelected] = useState<string>('7');
  const [authSelected, setAuthSelected] = useState<string>(t('common.select'));
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [otpCode, setOtpCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const SLIDE_HEIGHTS = [25, 20, 20];
  const slideTitles = [
    t('settings.accountSettings.bypassOtp.regulationPopup.title'),
    t('campaigns.newsLetterMgmt.emailVerification.secondSlide.title'),
    t('common.Success')
  ];

  const dispatch = useDispatch();

  const errorMessages = {
    401: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.email_error_abused'),
    404: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_not_match'),
    405: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_tooMuchAttempts'),
    409: t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error_expired'),
    500: t('common.ErrorOccured'),
    501: t('common.ErrorOccured')
  } as any;

  useEffect(() => {
    const getValues = async () => {
      const vals = await dispatch(getAllTwoFactorAuthValues()) as any;
      setEmailList(vals?.payload?.Data?.Emails)
      setCellphoneList(vals?.payload?.Data?.Cellphones)
    }

    getValues();

  }, [])

  const handleSendOtp = async () => {
    // @ts-ignore
    const response = await dispatch(sendOTP({
      Device: '',
      Agent: navigator.userAgent,
      Cellphone: authSelected.indexOf('@') > -1 ? '' : authSelected,
      Email: authSelected.indexOf('@') > -1 ? authSelected : ''
    })) as any;

    if (response?.payload?.StatusCode === 201) {
      setCurrentSlide(1);
    }
    else {
      // show error
    }
  }
  const handleConfirmOtp = async () => {
    // @ts-ignore
    const response = await dispatch(checkOTP({
      AuthType: selectedOption,
      Value: authSelected,
      Code: otpCode
    })) as any;

    const results = response?.payload;

    switch (results?.StatusCode) {
      case 201: {
        onConfirm();
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 404:
      case 406:
      case 501:
      default: {
        setErrorMessage(errorMessages[results?.StatusCode]);
        break;
      }
    }
  }
  const firstSlide = () => {
    return <Box className='cFlexSlide firstSlide'>
      <Box style={{ display: 'flex', flexDirection: 'column', textAlign: isRTL ? 'right' : 'left' }}>
        {RenderHtml(t("settings.accountSettings.bypassOtp.regulationPopup.text"))}
        <Typography className={clsx(classes.font18, classes.mt15)}>
          {t("settings.accountSettings.bypassOtp.regulationPopup.selectAuthType")}
        </Typography>

        <Grid container className={classes.mt15}>
          <Grid item md={6} xs={12}>
            <PulseemRadio
              classes={classes}
              isVerical={false}
              name={'otpType'}
              onChange={(e: any, x: any, y: any) => {
                setAuthSelected(t('common.select'))
                setSelected(e.target.value.toString())
              }}
              radioOptions={[
                {
                  value: "7",
                  className: selectedOption === '6' ? classes.radioButtonDisabled : classes.radioButtonActive,
                  label: t("common.verifyByEmail"),
                  child: null
                },
                {
                  value: "6",
                  className: selectedOption === '7' ? classes.radioButtonDisabled : classes.radioButtonActive,
                  label: t("common.verifyBySms"),
                  child: null
                }
              ]}
              value={selectedOption}
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <FormControl
              variant='standard'
              className={clsx(classes.selectInputFormControl, classes.w100, classes.mt15)}
              style={{ maxWidth: 300 }}>
              <Select
                variant="standard"
                // disabled
                autoWidth
                value={authSelected || ''}
                name='TwoFactorAuthOptionID'
                onChange={(e: any) =>
                  setAuthSelected(e.target.value)
                }
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
                <MenuItem
                  key={''}
                  value={t('common.select')}
                >
                  {t('common.select')}
                </MenuItem>
                {selectedOption === '7' && emailList?.map((item: any, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item?.AuthValue}
                    >
                      {t(item?.AuthValue)}
                    </MenuItem>
                  );
                })}
                {selectedOption === '6' && cellphoneList?.map((item: any, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={item?.AuthValue}
                    >
                      {t(item?.AuthValue)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box className={classes.mt25} style={{ textAlign: 'center' }}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              "saveFixedDetails"
            )}
            onClick={() => { handleSendOtp() }}>שלח קוד</Button>
        </Box>
      </Box>
    </Box>
  }

  const secondeSlide = () => {
    return <Box className='cFlexSlide secondSlide'>
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        Type OTP Code
      </Box>
      <Box>
        <TextField
          variant="outlined"
          name={'otpCode'}
          value={otpCode.trim()}
          className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
          onChange={(e: any) => {
            setOtpCode(e.target.value.trim());
          }} />
      </Box>
      <Box>
        <Button
          className={clsx(
            classes.btn,
            classes.btnRounded,
            "saveFixedDetails"
          )}
          onClick={() => handleConfirmOtp()}>{t("mainReport.send")}</Button>
      </Box>
      <Box>{errorMessage}</Box>
      <Box>
        <Typography className={clsx(classes.font16, classes.mt5)}>
          {t("settings.accountSettings.bypassOtp.regulationPopup.acceptAgreement")}
        </Typography>
      </Box>
    </Box>
  }

  return <BaseDialog
    title={slideTitles[currentSlide]}
    open={true}
    classes={classes}
    confirmText={t("common.Ok")}
    disableBackdropClick={true}
    showDefaultButtons={false}
    onCancel={() => onClose()}
    onClose={() => onClose()}
  >
    <>
      <Box className={clsx(classes.carouselContainer, classes.sidebar)} style={{ height: `${SLIDE_HEIGHTS[currentSlide]}rem`, transition: 'height .5s' }}>
        <Box
          className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)}
          style={{ position: "relative", transform: `translate(${isRTL ? (currentSlide * 100) : -(currentSlide * 100)}%)` }}
        >{(emailList?.length > 0 || cellphoneList.length > 0) && firstSlide()}</Box>
        <Box
          className={clsx(classes.carouselItem, classes.T05S, classes.emailVerItemContainer)}
          style={{ transform: `translate(${isRTL ? (currentSlide * 100) : -(currentSlide * 100)}%)` }}
        >{secondeSlide()}</Box>
      </Box>
    </>
  </BaseDialog>
}

export default DisableOtpPopup;