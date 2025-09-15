import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  planCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: theme.spacing(2),
  },
  popularCard: {
    border: '2px solid #e53935',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#e53935',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px 12px 0 0',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  cardContent: {
    flexGrow: 1,
    textAlign: 'center',
  },
  planTitle: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1),
  },
  planDescription: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(1),
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  priceDescription: {
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
  },
  subtext: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  recipientLimit: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: 'auto',
    borderRadius: '20px',
    padding: '10px 20px',
    fontWeight: 'bold',
  },
  engageButton: {
    backgroundColor: '#e53935',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c62828',
    },
  },
  featureList: {
    padding: 0,
    textAlign: 'left',
  },
  featureItem: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  seeAllFeatures: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  currencySymbol: {
    fontSize: '1.5rem',
    marginRight: theme.spacing(0.5),
  }
}));

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

const TierPlans = ({ isOpen, onClose }: any) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
  const classes = useStyles();

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
          <Grid container spacing={4} style={{ marginTop: '20px' }}>
            {plansData.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={clsx(classes.planCard, { [classes.popularCard]: plan.isPopular })}>
                  {plan.isPopular && (
                    <Box className={classes.popularBadge}>
                      MOST POPULAR
                    </Box>
                  )}
                  <CardContent className={classes.cardContent}>
                    <Typography className={classes.planTitle}>
                      {plan.title}
                    </Typography>
                    <Typography className={classes.planDescription}>
                      {plan.description}
                    </Typography>
                    <Box className={classes.priceContainer}>
                      {plan.price !== 'Contact Us' && <span className={classes.currencySymbol}>₪</span>}
                      <Typography className={classes.price}>
                        {plan.price}
                      </Typography>
                      {plan.priceDescription && <Typography className={classes.priceDescription}>
                        {plan.priceDescription}
                      </Typography>}
                    </Box>
                    <Typography className={classes.subtext}>
                      {plan.subtext}
                    </Typography>
                    <Typography className={classes.recipientLimit}>
                      {plan.recipientLimit}
                    </Typography>
                    <Button
                      variant={plan.isPopular ? 'contained' : 'outlined'}
                      color="primary"
                      className={clsx(classes.button, { [classes.engageButton]: plan.isPopular })}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                  <List className={classes.featureList}>
                    {plan.features.map((feature, fIndex) => (
                      <ListItem key={fIndex} className={classes.featureItem}>
                        <ListItemIcon style={{ minWidth: '30px' }}>
                          <Check style={{ color: 'green' }} />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography className={classes.seeAllFeatures}>
                    See all features
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return <Typography>Step 2: Payment - Placeholder</Typography>;
      case 2:
        return <Typography>Step 3: Confirmation - Placeholder</Typography>;
      default:
        return 'Unknown step';
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      title={t('Upgrade Your Plan')}
      onClose={onClose}
      onCancel={onClose}
      showDefaultButtons={false}
      renderButtons={() => (
        <Box style={{ padding: '8px 24px', textAlign: 'right' }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} style={{ marginRight: '10px' }}>
              {t('common.back')}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? t('common.finish') : t('common.next')}
          </Button>
        </Box>
      )}
      dialogContentStyle={{ padding: '0 24px' }}
      // @ts-ignore
      maxWidth="lg"
      fullWidth={true}
    >
      <Stepper activeStep={activeStep} alternativeLabel style={{ padding: '24px 0' }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {getStepContent(activeStep)}
      </div>
    </BaseDialog>
  );
};

export default TierPlans;
