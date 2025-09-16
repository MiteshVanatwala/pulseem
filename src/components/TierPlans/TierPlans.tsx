import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import clsx from 'clsx';
import Celebration from '../../assets/images/transparent_celebration.png';
const steps = ['Select Plan', 'Payment', 'Confirmation'];

const plansData = [
  {
    title: 'STARTER',
    description: 'Just the essentials',
    price: '0',
    priceDescription: '/month',
    subtext: 'Forever free',
    recipientLimit: 'Up to 100 recipients',
    buttonText: 'GET STARTED FREE',
    buttonVariant: 'outlined',
    features: [
      'Email campaigns',
      'SMS marketing',
      'WhatsApp marketing',
      'Push notifications',
      'Basic Reports',
      'Multiple integrations',
      'Chat & email support',
    ],
    isPopular: false,
  },
  {
    title: 'FLOW',
    description: 'Automate your marketing',
    price: '49',
    priceDescription: '/month',
    subtext: 'Billed monthly',
    recipientLimit: 'Up to 100 recipients',
    buttonText: 'START FLOW PLAN',
    buttonVariant: 'outlined',
    features: [
      'Everything in Starter, plus:',
      'Automations (unlimited)',
      'Landing pages (unlimited)',
      'Smart segmentations',
      'Page view tracking',
      'A/B testing',
      'Survey system',
      'API access',
    ],
    isPopular: false,
  },
  {
    title: 'ENGAGE',
    description: 'Perfect for eCommerce',
    price: '99',
    priceDescription: '/month',
    subtext: 'Most popular choice',
    recipientLimit: 'Up to 100 recipients',
    buttonText: 'CHOOSE ENGAGE',
    buttonVariant: 'contained',
    features: [
      'Everything in Flow, plus:',
      'eCommerce automation triggers',
      'eCommerce segmentations',
      'Product catalog integration',
      'Measure ROI - Email, SMS, WhatsApp',
      'SMS/WhatsApp chatbot',
      'Subaccounts creation',
      'Manage users & permissions',
      'Phone support',
    ],
    isPopular: true,
  },
  {
    title: 'SCALE',
    description: 'Tailor-made solutions',
    price: 'Contact Us',
    subtext: 'Custom pricing',
    recipientLimit: 'Custom recipient limits',
    buttonText: 'CONTACT SALES',
    buttonVariant: 'outlined',
    features: [
      'Everything in Engage, plus:',
      'High-volume sending performance',
      'Custom developments and integrations',
      'Custom reports',
      'Dedicated account manager',
      'Priority support',
      'Scheduled training sessions',
    ],
    isPopular: false,
  },
];

const TierPlans = ({ classes, isOpen, onClose }: any) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {plansData.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box className={clsx(classes.tierPlansCard, { [classes.tierPlansPopularCard]: plan.isPopular })}>
                  {plan.isPopular && (
                    <Box className={classes.tierPlansPopularBadge}>
                      MOST POPULAR
                    </Box>
                  )}
                  <Box className={classes.tierPlansCardContent}>
                    <Typography className={classes.tierPlansTitle}>
                      {plan.title}
                    </Typography>
                    <Typography className={classes.tierPlansDescription}>
                      {plan.description}
                    </Typography>
                    <Box className={classes.tierPlansPriceContainer}>
                      {plan.price !== 'Contact Us' && <span className={classes.tierPlansCurrencySymbol}>₪</span>}
                      <Typography className={classes.tierPlansPrice}>
                        {plan.price}
                      </Typography>
                      {plan.priceDescription && <Typography className={classes.tierPlansPriceDescription}>
                        {plan.priceDescription}
                      </Typography>}
                    </Box>
                    <Typography className={classes.tierPlansSubtext}>
                      {plan.subtext}
                    </Typography>
                    <Typography className={classes.tierPlansRecipientLimit}>
                      {plan.recipientLimit}
                    </Typography>
                    <Button
                      variant={plan.buttonVariant as "outlined" | "contained"}
                      color="primary"
                      className={clsx(classes.tierPlansButton, { [classes.tierPlansEngageButton]: plan.isPopular })}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                  <List className={clsx(classes.tierPlansFeatureList, classes.mb10)}>
                    {plan.features.map((feature, fIndex) => (
                      <ListItem key={fIndex} className={classes.tierPlansFeatureItem}>
                        <ListItemIcon style={{ minWidth: '30px' }}>
                          <Check style={{ color: '#5cb85c' }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography className={classes.tierPlansSeeAllFeatures}>
                    See all features
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return <Typography>Step 2: Payment - Placeholder</Typography>;
      case 2:
        return <>
                <Box className={clsx(classes.textCenter)}>
                  <img 
                    src={Celebration}
                    alt="celebration"
                    className={clsx(classes.celebrationImage)}
                  />
                  <Typography className={clsx(classes.f28, classes.bold)}>
                    {t('dashboard.polishSubscribe.success')}
                  </Typography>
                </Box>
              </>;
      default:
        return 'Unknown step';
    }
  };

  return (
    <BaseDialog
      classes={{
        ...classes,
        dialogContainer: clsx(classes.dialogContainer, classes.tierPlansDialog),
      }}
      open={isOpen}
      title={t('Upgrade Your Plan')}
      onClose={onClose}
      onCancel={onClose}
      showDefaultButtons={false}
      renderButtons={() => (
        <Box style={{ padding: '8px 24px', textAlign: 'right' }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} className={classes.btn}>
              {t('common.back')}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? onClose : handleNext}
            className={clsx(classes.btn, classes.redButton)}
          >
            {activeStep === steps.length - 1 ? t('common.finish') : t('common.next')}
          </Button>
        </Box>
      )}
      // @ts-ignore
      dialogContentStyle={{ padding: '0' }}
    >
      <>
        <Stepper activeStep={activeStep} alternativeLabel className={classes.tierPlansStepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box className={classes.tierPlansContent}>
          {getStepContent(activeStep)}
        </Box>
      </>
    </BaseDialog>
  );
};

export default TierPlans;
