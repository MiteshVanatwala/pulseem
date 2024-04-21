import { useTranslation } from "react-i18next";
import { BaseDialog } from "../../../../components/DialogTemplates/BaseDialog";
import { RenderHtml } from "../../../../helpers/Utils/HtmlUtils";
import { Box, Button, CircularProgress, FormControl, FormHelperText, Grid, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import clsx from 'clsx';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllTwoFactorAuthValues, setDisablePendingFeature } from "../../../../redux/reducers/AccountSettingsSlice";
import PulseemRadio from "../../../../components/Controlls/PulseemRadio";
import { IoIosArrowDown } from "react-icons/io";
import { StateType } from "../../../../Models/StateTypes";
import { sendOTP } from "../../../../redux/reducers/commonSlice";
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
  const [codeResend, setCodeResend] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendDisabled, setResendDisalbed] = useState(false);
  const [resendInterval, setResendInterval] = useState(10);
  const [userCodeConfirmed, setUserCodeConfirmed] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
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

  useEffect(() => {
    if (codeResend === true) {
      handleResendInterval();
    }
  }, [codeResend])

  const handleResendInterval = () => {
    let intervalTime = 10;

    const startInterval = () => {
      if (intervalTime === 0) {
        stopInterval();
      }
      setResendInterval(intervalTime--);
    }
    const stopInterval = () => {
      setCodeResend(false);
      setResendInterval(10);
      clearInterval(interval);
      setResendDisalbed(false);
    }

    const interval = setInterval(startInterval, 1000);
  }

  const handleSendOtp = async (isResend: never | any | boolean) => {
    if (!authSelected || authSelected === '' || authSelected === t('common.select')) {
      setShowError(true);
      return false;
    }
    setResendDisalbed(isResend);
    setCodeResend(isResend);
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
    setErrorMessage('');
    setUserCodeConfirmed(true);
    // @ts-ignore
    const response = await dispatch(setDisablePendingFeature({
      AuthType: parseInt(selectedOption),
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
        setUserCodeConfirmed(false);
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
                setShowError(false);
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
                native
                variant="standard"
                // disabled
                autoWidth
                value={authSelected || ''}
                name='TwoFactorAuthOptionID'
                required
                onChange={(e: any) => {
                  setShowError(false);
                  setAuthSelected(e.target.value)
                }
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
                <option
                  key={''}
                  value={t('common.select')}
                >
                  {t('common.select')}
                </option>
                {selectedOption === '7' && emailList?.map((item: any, index) => {
                  return (
                    <option
                      key={index}
                      value={item?.AuthValue}
                    >
                      {t(item?.AuthValue)}
                    </option>
                  );
                })}
                {selectedOption === '6' && cellphoneList?.map((item: any, index) => {
                  return (
                    <option
                      key={index}
                      value={item?.AuthValue}
                    >
                      {t(item?.AuthValue)}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
            {showError && <FormHelperText>{t('common.requiredField')}</FormHelperText>}
          </Grid>
        </Grid>
        <Box className={classes.mt25} style={{ textAlign: 'center' }}>
          <Button
            className={clsx(
              classes.btn,
              classes.btnRounded,
              "saveFixedDetails"
            )}
            onClick={() => { handleSendOtp(false) }}>{t('common.continue')}
          </Button>
        </Box>
      </Box>
    </Box>
  }

  const secondeSlide = () => {
    return <Box className='cFlexSlide secondSlide'>
      <Box>
        <Typography variant='h4' className={classes.bold}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.title')}</Typography>
        <Typography variant='body1' className={classes.mt4}>{selectedOption === '6' ? t("sms.OtpSentSuccessLine1") : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc1')} <strong> {authSelected}</strong></Typography>
        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.desc2')}</Typography>
      </Box>
      <Box className={clsx(classes.flexColumn, classes.mt20)}>
        <Box>
          <TextField
            variant='outlined'
            size='small'
            className={clsx(classes.textField, classes.maxWidth400, classes.p10)}
            onChange={(e) => {
              if (!e.target.value || /^[0-9]+$/.test(e.target.value.trim())) {
                setErrorMessage('');
                setOtpCode(e.target.value);
              }
            }}
            placeholder={t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.placeholder')}
            error={!!errorMessage}
            value={otpCode}
          />
        </Box>
        <Box mt={2}>
          <Button
            className={clsx(classes.btn, classes.btnRounded, userCodeConfirmed ? classes.disabled : null)}
            onClick={() => {
              if (otpCode) {
                handleConfirmOtp();
              }
              else {
                setErrorMessage(t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.error2'))
              }
            }}
          >
            {userCodeConfirmed ? <CircularProgress size={31} style={{ color: '#FFF' }} /> : t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.btnText')}
          </Button>
          {errorMessage !== '' && <Typography className='error' variant="body1">{errorMessage}</Typography>}
        </Box>
      </Box>
      <Box>
        <Typography variant='body1'>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.did_not_recieved')} <span className={clsx(classes.link, resendDisabled ? classes.disabled : null)} onClick={() => handleSendOtp(true)}>{t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resend')}</span>{resendDisabled && resendInterval !== 0 && resendInterval !== 10 && <span>{resendInterval}</span>}</Typography>
        <Typography className='success' variant="body1">{codeResend ? t('campaigns.newsLetterMgmt.emailVerification.thirdSlide.resendSuccess') : ''}</Typography>
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
          className={clsx(classes.carouselItem, classes.T05S)}
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