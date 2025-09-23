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
  CircularProgress,
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
import { useSelector, useDispatch } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import clsx from 'clsx';
import Celebration from '../../assets/images/transparent_celebration.png';
import { TIER_PLANS } from '../../helpers/Constants';
import { getAddSubscriptionCardIframeURL, restoreAutomation } from '../../redux/reducers/TiersSlice';
import TranzilaIframe from '../Balance/PaymentWizard/Dialogs/TranzilaIframe';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { Loader } from '../Loader/Loader';

const steps = ['billing.tier.steps.selectPlan', 'billing.tier.steps.upgrade', 'billing.tier.steps.confirmation'];

const TierPlans = ({ classes, isOpen, onClose }: any) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [iframeURL, setIframeURL] = useState<string | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [ hasFrozenEmail, setHasFrozenEmail ] = useState(false);
  const [ showReleaseMessage, setShowReleaseMessage ] = useState(false);
  const [ showCancelMessage, setShowCancelMessage ] = useState(false);
  const [ isLoader, setIsLoader ] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentPlan, availablePlans } = useSelector((state: any) => state.tiers);
  const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
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

  const handleNext = (plan?: any) => {
    if (plan) {
      setSelectedPlan(plan);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handlePlanSelect = async (plan: any, uiConfig: any) => {
    const planWithConfig = {
      ...plan,
      uiConfig
    };
    
    // Set loading state
    setLoadingIframe(true);
    
    try {
      // Prepare request parameters
      const requestParams = {
        language: i18n.language || 'en',
        subscriptionType: 'upgrade', // Adjust based on your needs
        isNewSubscription: true,
        tierId: plan.Id || plan.id
      };
      
      // Call the API to get iframe URL
      const response: any = await dispatch(getAddSubscriptionCardIframeURL(requestParams));
      // Extract iframe URL from response
      if (response.payload?.Data?.IframeUrl) {
        setIframeURL(response.payload?.Data?.IframeUrl);
      } else {
        console.error('API call failed:', response.payload || response.error);
      }
      
    } catch (error) {
      console.error('Error fetching iframe URL:', error);
      // You might want to show an error message to the user
    } finally {
      setLoadingIframe(false);
    }
    
    handleNext(planWithConfig);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    // Reset state when closing
    setActiveStep(0);
    setSelectedPlan(null);
    setIframeURL(null);
    setLoadingIframe(false);
    onClose();
  };

  const renderPlanSelection = () => {
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
                    {plan.Name !== 'STARTER' && plan.Name !== 'SCALE' && plan.Price > 0 && <span className={classes.tierPlansCurrencySymbol}>₪</span>}
                    <Typography className={classes.tierPlansPrice}>
                      {plan.Name === 'STARTER' ? t('billing.tier.free') : ''}
                      {plan.Name === 'SCALE' ? t('billing.tier.contactSales') : ''}
                      {plan.Name !== 'STARTER' && plan.Name !== 'SCALE' && plan.Price > 0 ? plan.Price : ''}
                    </Typography>
                    {plan.Name !== 'STARTER' && plan.Name !== 'SCALE' && uiConfig.priceDescription && <Typography className={classes.tierPlansPriceDescription}>
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
                    onClick={() => handlePlanSelect(plan, uiConfig)}
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
                  onClick={() => handlePlanSelect(plan, plan)}
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
  };

  const renderUpgradeFlow = () => {
    const planTitle = selectedPlan?.uiConfig?.title ? t(selectedPlan.uiConfig.title) : 'Flow Plan';
    const planPrice = selectedPlan?.Price || selectedPlan?.price || '₪49';
    
    return (
      <Box className={classes.upgradeFlowContainer}>
        <Grid container spacing={4}>
          {/* Left Side Features */}
          <Grid item xs={12} md={7}>
            <Typography variant="h5" className={classes.upgradeFlowTitle} gutterBottom>
              {t('billing.tier.upgrade.title').replace('{planTitle}', planTitle)}
            </Typography>

            {/* <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card className={classes.upgradeFlowFeatureCard}>
                  <CardContent>
                    <FlashOnIcon color="error" />
                    <Typography variant="h6">{t('billing.tier.upgrade.features.unlimitedAutomations.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('billing.tier.upgrade.features.unlimitedAutomations.description')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className={classes.upgradeFlowFeatureCard}>
                  <CardContent>
                    <InsertDriveFileIcon color="error" />
                    <Typography variant="h6">{t('billing.tier.upgrade.features.landingPages.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('billing.tier.upgrade.features.landingPages.description')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className={classes.upgradeFlowFeatureCard}>
                  <CardContent>
                    <TargetIcon color="error" />
                    <Typography variant="h6">{t('billing.tier.upgrade.features.smartSegmentation.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('billing.tier.upgrade.features.smartSegmentation.description')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card className={classes.upgradeFlowFeatureCard}>
                  <CardContent>
                    <AssignmentIcon color="error" />
                    <Typography variant="h6">{t('billing.tier.upgrade.features.surveySystem.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {t('billing.tier.upgrade.features.surveySystem.description')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid> */}

            {/* Including Section */}
            <Box className={classes.upgradeFlowIncludingBox}>
              <Typography variant="h6" gutterBottom>
                {t('billing.tier.upgrade.including')}
              </Typography>
              <List dense>
                {
                  selectedPlan.uiConfig.features.map((feature: string) => (
                  <ListItem key={feature}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={t(feature)} />
                    </ListItem>
                  ))
                }
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
                {typeof planPrice === 'string' && planPrice.includes('₪') ? planPrice : `₪${planPrice}`}
              </Typography>
              <Typography align="center" color="textSecondary">
                {t('billing.tier.upgrade.paymentForm.perMonth')}
              </Typography>

              {/* Payment Iframe */}
              <Box mt={3} style={{ minHeight: '400px' }}>
                {loadingIframe ? (
                  <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '400px' }}>
                    <CircularProgress />
                    <Typography variant="body2" style={{ marginLeft: '16px' }}>
                      {t('billing.tier.upgrade.loadingPaymentForm')}
                    </Typography>
                  </Box>
                ) : iframeURL ? (
                  <TranzilaIframe
                    data={{}}
                    classes={classes}
                    isRTL={isRTL}
                    packageId={null}
                    onComplete={() => setActiveStep((prevActiveStep) => prevActiveStep + 1)}
                    // @ts-ignore
                    paymentUrl={`${iframeURL}`}
                    hideSummary={true}
                  />
                ) : (
                  <Typography variant="body2" style={{ marginLeft: '16px' }}>
                    {t('billing.tier.upgrade.paymentForm.error')}
                  </Typography>
                )}
              </Box>

              <Divider style={{ margin: '24px 0' }} />

              <Card className={classes.upgradeFlowSupportCard}>
                <ChatIcon color="error" style={{ marginRight: '8px' }} />
                <Typography>{t('billing.tier.upgrade.supportLevel')}</Typography>
              </Card>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const processFrozenCampaigns = async (action: string) => {
    setIsLoader(true);
    const { payload: { StatusCode } }: any = await dispatch(restoreAutomation({
      isNeedRestore: action === 'cancel' ? false : true
    }));
    if (StatusCode === 200) {
      if (action === 'process') {
        setShowReleaseMessage(true);
      } else {
        setShowCancelMessage(true);
      }
    } else {
    }
    setIsLoader(false);
  };

  const FrozenAutomationMessage = () => {
    // if (!hasFrozenEmail) return null;
    
    return (
      <Box className={clsx(classes.frozenCampaignsContainer, classes.pt25)}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Box>
              <Typography className={clsx(classes.f20)}>
                {!showReleaseMessage && !showCancelMessage && RenderHtml(t("billing.tier.frozenMessage"))}
                {showReleaseMessage && RenderHtml(t("billing.tier.releaseMessage"))}
                {showCancelMessage && RenderHtml(t("billing.tier.cancelMessage"))}
              </Typography>
              {
                !showReleaseMessage && !showCancelMessage && (
                  <Grid container spacing={2} className={clsx(classes.mt10, classes.textCenter)}>
                    <Grid item md={12} xs={12} className={clsx(classes.w100)}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => processFrozenCampaigns('process')}
                        disabled={isLoader}
                        className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
                      >
                        {t('common.Yes')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => processFrozenCampaigns('cancel')}
                        disabled={isLoader}
                        className={clsx(classes.btn, classes.btnRounded, classes.mlr10)}
                      >
                        {t('common.No')}
                      </Button>
                    </Grid>
                  </Grid>
                )
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderConfirmation = () => {
    const planTitle = selectedPlan?.uiConfig?.title ? t(selectedPlan.uiConfig.title) : 'Selected Plan';
    const planPrice = selectedPlan?.Price || selectedPlan?.price || '49';
    
    return (
      <Box className={clsx(classes.textCenter)}>
        <img 
          src={Celebration}
          alt="celebration"
          className={clsx(classes.celebrationImage)}
        />
        <Typography className={clsx(classes.f28, classes.bold)}>
          {t('dashboard.polishSubscribe.success')}
        </Typography>
        {selectedPlan && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Welcome to {planTitle}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Your subscription for {typeof planPrice === 'string' && planPrice.includes('₪') ? planPrice : `₪${planPrice}`}/month is now active.
            </Typography>
          </Box>
        )}
        {FrozenAutomationMessage()}
      </Box>
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPlanSelection();
      case 1:
        return renderUpgradeFlow();
      case 2:
        return renderConfirmation();
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
      onClose={handleClose}
      onCancel={handleClose}
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
                  onClick={activeStep === steps.length - 1 ? handleClose : () => handleNext()}
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
        <Loader isOpen={isLoader} showBackdrop={true} />
      </>
    </BaseDialog>
  );
};

export default TierPlans;
