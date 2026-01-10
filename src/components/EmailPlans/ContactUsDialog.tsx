import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    TextField,
    Typography,
    Grid,
    CircularProgress,
} from '@material-ui/core';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { getAccountSettings } from '../../redux/reducers/AccountSettingsSlice';
import { contactSalesForScale } from '../../redux/reducers/TiersSlice';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { Close } from '@material-ui/icons';

interface ContactUsDialogProps {
    classes: any;
    isOpen: boolean;
    onClose: () => void;
}

const ContactUsDialog = ({ classes, isOpen, onClose }: ContactUsDialogProps) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { account } = useSelector((state: any) => state?.accountSettings);
    const { loading, error } = useSelector((state: any) => state?.tiers);
    
    const [formData, setFormData] = useState({
        message: ''
    });
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const getData = async () => {
        await dispatch(getAccountSettings());
    };

    useEffect(() => {
        if (isOpen) {
            getData();
            setApiError(null);
            setSuccessMessage(null);
        }
    }, [isOpen]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
        setApiError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async () => {
         if (!formData.message.trim()) {
            setApiError(t('common.enterMessage'));
            return;
        }

        if (!account?.Data?.CompanyName || !account?.Data?.Email || !account?.Data?.CellPhone) {
            setApiError(t('SubAccount.subAccountNotFound'));
            return;
        }

        setApiError(null);
        setSuccessMessage(null);

        const request = {
            Name: account?.Data?.CompanyName || '',
            Email: account?.Data?.Email || '',
            Cellphone: account?.Data?.CellPhone || '',
            Message: formData.message
        };

        try {
            const result: any = await dispatch(contactSalesForScale(request));
            
            if (result.payload?.StatusCode === 200) {
                setSuccessMessage(t('common.contactUsSuccess'));
                setFormData({ message: '' });
                
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else if (result.payload?.StatusCode === 401) {
                setApiError(t('campaigns.newsLetterEditor.errors.invaliApiKey'));
            } else if (result.payload?.StatusCode === 500) {
                setApiError(t('common.Error'));
            } else {
                setApiError(result.payload?.Message);
            }
        } catch (err: any) {
            setApiError(t('WhatsappApiResponse.twilio.45350.description'));
        }
    };

    const handleClose = () => {
        setFormData({
            message: ''
        });
        setApiError(null);
        setSuccessMessage(null);
        onClose();
    };

    const displayError = apiError || error?.contactSales;

    return (
        <BaseDialog
            classes={classes}
            open={isOpen}
            showDefaultButtons={false}
            icon={false}
            className={classes.contactUsDialog}
            contentStyle={classes.contactUsContent}
            childrenPadding={false}
            hideHeader={true}
        >
            <Box sx={{padding: '8px 4px'}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography variant="h4" className={clsx(classes.textColorHeading, classes.bold, classes.w100, classes.textCenter)}>
                        {t('common.getStarted')}
                    </Typography>
                    <Box className={classes.contactUsCloseCont}> 
                        <Close onClick={handleClose} className={classes.cursorPointer} />
                    </Box>
                </Box>
                
                <Typography variant="body1" className={clsx(classes.textCenter, classes.tierPlansFeatureText, classes.semibold600)}>
                    {t('common.fillDetails')}
                </Typography>

                <Grid container spacing={2} className={classes.mt5}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder={t("common.companyName")}
                            value={account?.Data?.CompanyName || ''}
                            className={classes.contactUsInputField}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder={t('common.Cellphone')}
                            value={account?.Data?.CellPhone || ''}
                            className={classes.contactUsInputField}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            placeholder={t('common.email')}
                            value={account?.Data?.Email || ''}
                            className={classes.contactUsInputField}
                            disabled
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder={t('mainReport.message')}
                            value={formData.message}
                            onChange={handleInputChange('message')}
                            className={classes.contactUsTextField}
                        />
                    </Grid>

                    {(displayError || successMessage) && (
                        <Grid item xs={12} className={clsx(classes.mb5)}>
                            <Box>
                                <Typography style={{ color: displayError ? '#ff3343' : '#4caf50' }}>
                                    {displayError || successMessage}
                                </Typography>
                            </Box>
                        </Grid>)}

                    <Grid item xs={12}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            className={clsx(classes.tierPlansButton)}
                        >
                            {loading.contactSales ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                t(`common.Submit`)
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </BaseDialog>
    );
};

export default ContactUsDialog;