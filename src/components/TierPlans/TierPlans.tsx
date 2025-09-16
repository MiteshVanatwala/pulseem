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
  Card,
  CardContent,
  TextField,
  Divider,
} from '@material-ui/core';
import {
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  FlashOn as FlashOnIcon,
  InsertDriveFile as InsertDriveFileIcon,
  TrackChanges as TargetIcon,
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
} from '@material-ui/icons';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import clsx from 'clsx';

const steps = ['Select Plan', 'Upgrade', 'Confirmation'];

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
                      className={clsx(classes.tierPlansButton, { [classes.tierPlansEngageButton]: plan.isPopular, [classes.tierPlansDefaultButton]: !plan.isPopular })}
                      onClick={handleNext}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                  <List className={clsx(classes.tierPlansFeatureList, classes.mb10)}>
                    {plan.features.map((feature, fIndex) => (
                      <ListItem key={fIndex} className={classes.tierPlansFeatureItem}>
                        <ListItemIcon style={{ minWidth: '30px' }}>
                          <CheckIcon style={{ color: '#5cb85c' }} />
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
        return (
            <Box className={classes.upgradeFlowContainer}>
            <Grid container spacing={4}>
              {/* Left Side Features */}
              <Grid item xs={12} md={7}>
                <Typography variant="h5" className={classes.upgradeFlowTitle} gutterBottom>
                  Upgrade to Flow Plan
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card className={classes.upgradeFlowFeatureCard}>
                      <CardContent>
                        <FlashOnIcon color="error" />
                        <Typography variant="h6">Unlimited Automations</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Create unlimited automated marketing workflows
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card className={classes.upgradeFlowFeatureCard}>
                      <CardContent>
                        <InsertDriveFileIcon color="error" />
                        <Typography variant="h6">Landing Pages</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Build unlimited high-converting landing pages
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card className={classes.upgradeFlowFeatureCard}>
                      <CardContent>
                        <TargetIcon color="error" />
                        <Typography variant="h6">Smart Segmentation</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Target your audience with precision
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card className={classes.upgradeFlowFeatureCard}>
                      <CardContent>
                        <AssignmentIcon color="error" />
                        <Typography variant="h6">Survey System</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Collect feedback and insights from customers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Including Section */}
                <Box className={classes.upgradeFlowIncludingBox}>
                  <Typography variant="h6" gutterBottom>
                    Including:
                  </Typography>
                  <List dense>
                    {[
                      'Everything from "Starter" plan',
                      "Landing pages (unlimited)",
                      "Page view tracking",
                      "Survey system",
                      "Automations (unlimited)",
                      "Smart segmentations",
                      "A/B testing",
                      "API access",
                    ].map((text) => (
                      <ListItem key={text}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>

              {/* Right Side Payment Form */}
              <Grid item xs={12} md={5}>
                <Card className={classes.upgradeFlowPaymentForm}>
                  <Typography
                    variant="h4"
                    align="center"
                    className={classes.upgradeFlowPrice}
                  >
                    ₪49
                  </Typography>
                  <Typography align="center" color="textSecondary">
                    /month
                  </Typography>

                  <Box mt={3}>
                    <Typography variant="subtitle2">Credit Card Number</Typography>
                    <TextField
                      fullWidth
                      placeholder="1234 5678 9012 3456"
                      margin="dense"
                      variant="outlined"
                    />

                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <TextField fullWidth placeholder="MM" margin="dense" variant="outlined" />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField fullWidth placeholder="YYYY" margin="dense" variant="outlined" />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField fullWidth placeholder="123" margin="dense" variant="outlined" />
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    className={classes.upgradeFlowUpgradeButton}
                    onClick={handleNext}
                  >
                    Upgrade to Flow
                  </Button>

                  <Divider style={{ margin: '24px 0' }} />

                  <Card className={classes.upgradeFlowSupportCard}>
                    <ChatIcon color="error" style={{ marginRight: '8px' }} />
                    <Typography>Support Level: Chat + Email Support</Typography>
                  </Card>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return <Typography>Step 3: Confirmation - Placeholder</Typography>;
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
          {activeStep < 1 &&
            <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? onClose : handleNext}
                className={clsx(classes.btn, classes.redButton)}
              >
                {activeStep === steps.length - 1 ? t('common.finish') : t('common.next')}
            </Button>
          }
        </Box>
      )}
      dialogContentStyle={{ padding: '0' }}
    >
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
    </BaseDialog>
  );
};

export default TierPlans;
