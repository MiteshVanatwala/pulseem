import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Close as CloseIcon } from '@material-ui/icons';
import { createPortal } from 'react-dom';
import Turnstile from '../Turnstile/Turnstile';
import { CloudFlareSiteKey } from '../../helpers/Constants';
import { IsValidEmail, IsValidPhoneNumber } from '../../helpers/Utils/Validations';
import { submitContactForm, clearContactSupportState } from '../../redux/reducers/contactSupportSlice';
import Toast from '../Toast/Toast.component';

interface ToastMessage {
  severity?: 'error' | 'success' | 'info';
  color?: 'error' | 'success' | 'info';
  message: string;
  showAnimtionCheck?: boolean;
}

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.spacing(2),
      maxWidth: 650,
      width: '100%',
      overflow: 'hidden'
    },
  },
  dialogTitle: {
    background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
    color: '#fff',
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 'auto',
  },
  titleText: {
    fontWeight: 600,
    fontSize: '1.5rem',
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  closeButton: {
    color: '#fff',
    padding: theme.spacing(1),
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  dialogContent: {
    padding: theme.spacing(3),
    backgroundColor: '#f5f7fa',
    paddingBottom: theme.spacing(3.75),
  },
  formContainer: {
    width: '100%',
  },
  inputField: {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: 30,
      backgroundColor: '#fff',
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: '#FF0076',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FF0076',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '9px 14px 12px 14px',
    },
    '& .MuiInputLabel-outlined': {
      display: 'none',
    },
  },
  messageField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 20,
    },
    '& .MuiOutlinedInput-input': {
      padding: '0px 8px',
    },
  },
  turnstileContainer: {
    display: 'flex',
    justifyContent: (props: { isRTL: boolean }) => props.isRTL ? 'flex-start' : 'flex-end',
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: (props: { isRTL: boolean }) => props.isRTL ? 'flex-start' : 'flex-end',
    marginTop: theme.spacing(2),
  },
  submitButton: {
    padding: '12px 60px',
    borderRadius: 50,
    background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
      opacity: 0.9,
    },
    '&:disabled': {
      background: '#ccc',
      color: '#666',
    },
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  errorText: {
    color: '#f44336',
    fontSize: '0.75rem',
    marginTop: theme.spacing(-1.5),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    wordBreak: 'break-word'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

interface ContactSupportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ContactSupportDialog: React.FC<ContactSupportDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isRTL } = useSelector((state: any) => state.core);
  const contactSupportState = useSelector((state: any) => state.contactSupport);
  const classes = useStyles({ isRTL });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    website: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    message: '',
  });

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasInitializedTurnstile = useRef(false);

  const showErrorToast = (message: string) => {
    setToastMessage({
      severity: 'error',
      color: 'error',
      message,
      showAnimtionCheck: false,
    });
  };

  const showSuccessToast = (message: string) => {
    setToastMessage({
      severity: 'success',
      color: 'success',
      message,
      showAnimtionCheck: false,
    });
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);
  
  useEffect(() => {
    if (open && !hasInitializedTurnstile.current) {
      hasInitializedTurnstile.current = true;
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
      setIsSubmitting(false);
    } else if (!open) {
      hasInitializedTurnstile.current = false;
      resetForm();
      setIsSubmitting(false);
      dispatch(clearContactSupportState());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!contactSupportState.response) return;

    const { StatusCode } = contactSupportState.response;

    switch (StatusCode) {
      case 200: {
        setIsSubmitting(false);
        showSuccessToast(
          t('dashboard.helpDrawer.support.contactSupport.successMessage')
        );
        setTimeout(() => {
          onClose();
        }, 2000);
        break;
      }
      case 401: {
        setIsSubmitting(false);
        showErrorToast(
          t('dashboard.helpDrawer.support.contactSupport.captchaVerificationFailed')
        );
        refreshTurnstile();
        break;
      }
      case 1:
      case 500: {
        setIsSubmitting(false);
        showErrorToast(
          t('dashboard.helpDrawer.support.contactSupport.internalServerError')
        );
        break;
      }
      default: {
        setIsSubmitting(false);
        showErrorToast(
          t('dashboard.helpDrawer.support.contactSupport.errorMessage')
        );
        break;
      }
    }
  }, [contactSupportState.response, onClose, t]);

  useEffect(() => {
    if (contactSupportState.error) {
      setIsSubmitting(false);
      showErrorToast(
        t('dashboard.helpDrawer.support.contactSupport.networkError')
      );
    }
  }, [contactSupportState.error, t]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      website: '',
      message: '',
    });
    setErrors({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      message: '',
    });
    setTurnstileToken('');
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const refreshTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey(prev => prev + 1);
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      message: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('common.Required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('common.Required');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('common.Required');
    } else if (!IsValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = t('SignUp.InvalidCellPhone');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('common.Required');
    } else if (!IsValidEmail(formData.email)) {
      newErrors.email = t('common.invalidEmail');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('common.Required');
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!turnstileToken) {
      showErrorToast(t('SignUp.pleaseVerifyCaptcha'));
      refreshTurnstile();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const requestData = {
      FirstName: formData.firstName,
      LastName: formData.lastName,
      PhoneNumber: formData.phoneNumber,
      Email: formData.email,
      Website: formData.website,
      Message: formData.message,
      CloudflareCaptchaToken: turnstileToken,
    };

    dispatch(submitContactForm(requestData) as any);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        className={classes.dialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle} disableTypography dir={isRTL ? 'rtl' : 'ltr'}>
          <Typography className={classes.titleText}>
            {t('dashboard.helpDrawer.support.contactSupport.title')}
          </Typography>
          <IconButton
            className={classes.closeButton}
            onClick={onClose}
            size="small"
            disabled={isSubmitting}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box className={classes.formContainer} dir={isRTL ? 'rtl' : 'ltr'}>
            <Box className={classes.gridContainer}>
              <Box>
                <TextField
                  className={classes.inputField}
                  placeholder={t('common.first_name')}
                  variant="outlined"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={!!errors.firstName}
                  size="small"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <Typography className={classes.errorText}>
                    {errors.firstName}
                  </Typography>
                )}
              </Box>
              <Box>
                <TextField
                  className={classes.inputField}
                  placeholder={t('common.last_name')}
                  variant="outlined"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={!!errors.lastName}
                  size="small"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <Typography className={classes.errorText}>
                    {errors.lastName}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box className={classes.gridContainer}>
              <Box>
                <TextField
                  className={classes.inputField}
                  placeholder={t('dashboard.helpDrawer.support.contactSupport.phoneNumber')}
                  variant="outlined"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                  error={!!errors.phoneNumber}
                  size="small"
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <Typography className={classes.errorText}>
                    {errors.phoneNumber}
                  </Typography>
                )}
              </Box>
              <Box>
                <TextField
                  className={classes.inputField}
                  placeholder={t('common.email')}
                  variant="outlined"
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  size="small"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <Typography className={classes.errorText}>
                    {errors.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <TextField
              className={classes.inputField}
              placeholder={t('dashboard.helpDrawer.support.contactSupport.website')}
              variant="outlined"
              fullWidth
              value={formData.website}
              onChange={handleInputChange('website')}
              size="small"
              disabled={isSubmitting}
            />
            <Box>
              <TextField
                className={`${classes.inputField} ${classes.messageField}`}
                placeholder={t('sms.message')}
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                value={formData.message}
                onChange={handleInputChange('message')}
                error={!!errors.message}
                disabled={isSubmitting}
              />
              {errors.message && (
                <Typography className={classes.errorText}>
                  {errors.message}
                </Typography>
              )}
            </Box>
            <Box className={classes.turnstileContainer}>
              <Turnstile
                key={`turnstile_${turnstileKey}`}
                siteKey={CloudFlareSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
                theme={isRTL ? 'light' : 'dark'}
              />
            </Box>
            <Box className={classes.buttonContainer}>
              <Button
                className={classes.submitButton}
                onClick={handleSubmit}
                disabled={!turnstileToken || isSubmitting}
              >
                {isSubmitting ? (
                  <Box className={classes.loadingContainer}>
                    <CircularProgress size={20} color="inherit" />
                    <span>{t('common.Sending')}</span>
                  </Box>
                ) : (
                  t('common.Send1')
                )}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {toastMessage && createPortal(
        <Toast customData={null} data={toastMessage} />,
        document.body
      )}
    </>
  );
};

export default ContactSupportDialog;