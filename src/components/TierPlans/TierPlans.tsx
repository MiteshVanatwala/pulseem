import React, { useState, useEffect, useRef } from 'react';
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
import Celebration from '../../assets/images/transparent_celebration.png';
import { TIER_PLANS } from '../../helpers/Constants';

const steps = ['billing.tier.steps.selectPlan', 'billing.tier.steps.upgrade', 'billing.tier.steps.confirmation'];

const TierPlans = ({ classes, isOpen, onClose }: any) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
  console.log(availablePlans)
    // Scroll to top when step changes
  useEffect(() => {
    // Add a small delay to ensure DOM is updated
    const scrollToTop = () => {
      setTimeout(() => {
        // 1. Try the content ref first
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }

        // 2. Try to find Material-UI dialog paper
        const dialogPaper = document.querySelector('.MuiDialog-paper');
        if (dialogPaper) {
          dialogPaper.scrollTop = 0;
        }

        // 3. Try to find any scrollable parent
        const scrollableSelectors = [
          '[class*="tierPlansContent"]',
          '[class*="dialogContent"]',
          '[class*="dialogChildren"]',
          '.MuiDialog-container',
          '[role="dialog"]'
        ];

        scrollableSelectors.forEach(selector => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            element.scrollTop = 0;
          }
        });

        // 4. Force scroll on common scroll containers
        const containers = document.querySelectorAll('div[style*="overflow"], div[style*="scroll"]');
        containers.forEach(container => {
          (container as HTMLElement).scrollTop = 0;
        });
      }, 100);
    };

    scrollToTop();
  }, [activeStep]);

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
            {availablePlans && availablePlans.length > 0 ? availablePlans.map((plan: any, index: any) => {
              // Find corresponding TIER_PLANS entry for UI config
              const uiConfig = TIER_PLANS.find(tierPlan => 
                tierPlan.id === plan.Id
              ) || TIER_PLANS[index] || TIER_PLANS[0];
              
              return (
                <Grid item xs={12} sm={6} md={3} key={plan.id}>
                  <Box className={clsx(classes.tierPlansCard, { [classes.tierPlansPopularCard]: plan.isRecommended || uiConfig.isPopular })}>
                    {(plan.isRecommended || uiConfig.isPopular) && (
                      <Box className={classes.tierPlansPopularBadge}>
                        {t('billing.tier.ui.mostPopularChoice')}
                      </Box>
                    )}
                    <Box className={classes.tierPlansCardContent}>
                      <Typography className={classes.tierPlansTitle}>
                        {t(uiConfig.title)}
                      </Typography>
                      <Typography className={classes.tierPlansDescription}>
                        {t(uiConfig.description)}
                      </Typography>
                      <Box className={classes.tierPlansPriceContainer}>
                        {plan.Price > 0 && <span className={classes.tierPlansCurrencySymbol}>₪</span>}
                        <Typography className={classes.tierPlansPrice}>
                          {plan.Price > 0 ? plan.Price : t('billing.tier.plans.scale.price')}
                        </Typography>
                        {uiConfig.priceDescription && <Typography className={classes.tierPlansPriceDescription}>
                          {t(uiConfig.priceDescription)}
                        </Typography>}
                      </Box>
                      <Typography className={classes.tierPlansSubtext}>
                        {t(uiConfig.subtext)}
                      </Typography>
                      <Typography className={classes.tierPlansRecipientLimit}>
                        {t(uiConfig.recipientLimit)}
                      </Typography>
                      <Button
                        variant={uiConfig.buttonVariant as "outlined" | "contained"}
                        color="primary"
                        className={clsx(classes.tierPlansButton, { [classes.tierPlansEngageButton]: plan.isRecommended || uiConfig.isPopular, [classes.tierPlansDefaultButton]: !plan.isRecommended && !uiConfig.isPopular })}
                        onClick={handleNext}
                        disabled={plan.isCurrentPlan}
                      >
                        {plan.isCurrentPlan ? t('billing.tier.ui.currentPlan') : t(uiConfig.buttonText)}
                      </Button>
                    </Box>
                    <List className={clsx(classes.tierPlansFeatureList, classes.mb10)}>
                      {plan.features && plan.features.length > 0 ? plan.features.map((feature: any, fIndex: any) => (
                        <ListItem key={fIndex} className={classes.tierPlansFeatureItem}>
                          <ListItemIcon style={{ minWidth: '30px' }}>
                            <CheckIcon style={{ color: '#5cb85c' }} />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      )) : uiConfig.features.map((feature, fIndex) => (
                        <ListItem key={fIndex} className={classes.tierPlansFeatureItem}>
                          <ListItemIcon style={{ minWidth: '30px' }}>
                            <CheckIcon style={{ color: '#5cb85c' }} />
                          </ListItemIcon>
                          <ListItemText primary={t(feature)} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography className={classes.tierPlansSeeAllFeatures}>
                      {t('billing.tier.ui.seeAllFeatures')}
                    </Typography>
                  </Box>
                </Grid>
              );
            }) : TIER_PLANS.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box className={clsx(classes.tierPlansCard, { [classes.tierPlansPopularCard]: plan.isPopular })}>
                  {plan.isPopular && (
                    <Box className={classes.tierPlansPopularBadge}>
                      {t('billing.tier.ui.mostPopularChoice')}
                    </Box>
                  )}
                  <Box className={classes.tierPlansCardContent}>
                    <Typography className={classes.tierPlansTitle}>
                      {t(plan.title)}
                    </Typography>
                    <Typography className={classes.tierPlansDescription}>
                      {t(plan.description)}
                    </Typography>
                    <Box className={classes.tierPlansPriceContainer}>
                      {t(plan.price) !== t('billing.tier.plans.scale.price') && <span className={classes.tierPlansCurrencySymbol}>₪</span>}
                      <Typography className={classes.tierPlansPrice}>
                        {t(plan.price)}
                      </Typography>
                      {plan.priceDescription && <Typography className={classes.tierPlansPriceDescription}>
                        {t(plan.priceDescription)}
                      </Typography>}
                    </Box>
                    <Typography className={classes.tierPlansSubtext}>
                      {t(plan.subtext)}
                    </Typography>
                    <Typography className={classes.tierPlansRecipientLimit}>
                      {t(plan.recipientLimit)}
                    </Typography>
                    <Button
                      variant={plan.buttonVariant as "outlined" | "contained"}
                      color="primary"
                      className={clsx(classes.tierPlansButton, { [classes.tierPlansEngageButton]: plan.isPopular, [classes.tierPlansDefaultButton]: !plan.isPopular })}
                      onClick={handleNext}
                    >
                      {t(plan.buttonText)}
                    </Button>
                  </Box>
                  <List className={clsx(classes.tierPlansFeatureList, classes.mb10)}>
                    {plan.features.map((feature, fIndex) => (
                      <ListItem key={fIndex} className={classes.tierPlansFeatureItem}>
                        <ListItemIcon style={{ minWidth: '30px' }}>
                          <CheckIcon style={{ color: '#5cb85c' }} />
                        </ListItemIcon>
                        <ListItemText primary={t(feature)} />
                      </ListItem>
                    ))}
                  </List>
                  <Typography className={classes.tierPlansSeeAllFeatures}>
                    {t('billing.tier.ui.seeAllFeatures')}
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
      title={t('billing.tier.ui.upgradeYourPlan')}
      onClose={onClose}
      onCancel={onClose}
      showDefaultButtons={false}
      renderButtons={() => (
        <Box style={{ padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {activeStep !== 0 && activeStep !== 2 && (
              <Button onClick={handleBack} className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}>
                {t('common.back')}
              </Button>
            )}
          </Box>
          <Box>
            {activeStep === 0 &&
              <Button
                  variant="contained"
                  color="primary"
                  onClick={activeStep === steps.length - 1 ? onClose : handleNext}
                  className={clsx(classes.btn, classes.redButton, classes.btnRounded)}
                >
                  {activeStep === steps.length - 1 ? t('common.finish') : t('common.next')}
              </Button>
            }
          </Box>
        </Box>
      )}
      // @ts-ignore
      dialogContentStyle={{ padding: '0', margin: '0px !important' }}
      contentStyle={clsx(classes.noMargin)}
    >
      <>
        {/* <Stepper activeStep={activeStep} alternativeLabel className={classes.tierPlansStepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper> */}
        <div ref={contentRef} className={classes.tierPlansContent}>
          {getStepContent(activeStep)}
        </div>
      </>
    </BaseDialog>
  );
};

export default TierPlans;
