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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Close as CloseIcon } from '@material-ui/icons';
import Turnstile from '../Turnstile/Turnstile';
import { CloudFlareSiteKey } from '../../helpers/Constants';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.spacing(2),
      maxWidth: 650,
      width: '100%',
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
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    border: '2px solid #FF0076',
    borderRadius: 50,
    padding: theme.spacing(0.5),
    width: 'fit-content',
    margin: '0 auto',
  },
  toggleButton: {
    padding: '10px 40px',
    borderRadius: 50,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s',
    border: 'none',
    background: 'transparent',
    color: '#666',
    '&:hover': {
      color: '#000',
    },
  },
  activeToggle: {
    background: 'linear-gradient(90deg, #FF0076 0%, #FF0054 23.8%, #FF4D2A 100%)',
    color: '#fff !important',
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
  const { isRTL } = useSelector((state: any) => state.core);
  const classes = useStyles({ isRTL })
  
  const [activeTab, setActiveTab] = useState<'service' | 'sales'>('service');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    website: '',
    message: '',
  });
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const hasInitializedTurnstile = useRef(false);
  
  useEffect(() => {
    if (open && !hasInitializedTurnstile.current) {
      hasInitializedTurnstile.current = true;
      setTurnstileKey(prev => prev + 1);
      setTurnstileToken('');
    } else if (!open) {
      hasInitializedTurnstile.current = false;
    }
  }, [open]);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const refreshTurnstile = () => {
    setTurnstileToken('');
    setTurnstileKey(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!turnstileToken) {
      alert(t('SignUp.pleaseVerifyCaptcha'));
      refreshTurnstile();
      return;
    }

    console.log('Form submitted:', {
      ...formData,
      activeTab,
      turnstileToken
    });
    
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      website: '',
      message: '',
    });
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.phoneNumber &&
      formData.email &&
      formData.message &&
      turnstileToken
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle} disableTypography>
        <Typography className={classes.titleText}>
          {t('dashboard.helpDrawer.support.contactSupport.title')}
        </Typography>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.formContainer} dir={isRTL ? 'rtl' : 'ltr'}>
          <Box className={classes.toggleContainer}>
            <button
              className={`${classes.toggleButton} ${
                activeTab === 'service' ? classes.activeToggle : ''
              }`}
              onClick={() => setActiveTab('service')}
            >
              {t('dashboard.helpDrawer.support.contactSupport.serviceAndSupport')}
            </button>
            <button
              className={`${classes.toggleButton} ${
                activeTab === 'sales' ? classes.activeToggle : ''
              }`}
              onClick={() => setActiveTab('sales')}
            >
              {t('dashboard.helpDrawer.support.contactSupport.sales')}
            </button>
          </Box>
          <Box className={classes.gridContainer}>
            <TextField
              className={classes.inputField}
              placeholder={t('common.first_name')}
              variant="outlined"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              size="small"
            />
             <TextField
              className={classes.inputField}
              placeholder={t('common.last_name')}
              variant="outlined"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              size="small"
            />
          </Box>
          <Box className={classes.gridContainer}>
            <TextField
              className={classes.inputField}
              placeholder={t('dashboard.helpDrawer.support.contactSupport.phoneNumber')}
              variant="outlined"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              size="small"
            />
            <TextField
              className={classes.inputField}
              placeholder={t('common.email')}
              variant="outlined"
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              size="small"
            />
          </Box>
          <TextField
            className={classes.inputField}
            placeholder={t('dashboard.helpDrawer.support.contactSupport.website')}
            variant="outlined"
            fullWidth
            value={formData.website}
            onChange={handleInputChange('website')}
            size="small"
          />
          <TextField
            className={`${classes.inputField} ${classes.messageField}`}
            placeholder={t('sms.message')}
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            value={formData.message}
            onChange={handleInputChange('message')}
          />
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
              disabled={!isFormValid()}
            >
              {t('common.Send1')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportDialog;