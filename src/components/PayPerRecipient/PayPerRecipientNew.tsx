import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, IconButton, Step, StepLabel, Stepper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { AiOutlineCheck } from 'react-icons/ai';
import { Loader } from '../Loader/Loader';
import { EmailPricingSubscriptionPoland, getCreditCardIframe, GetEmailPackagePrices, cancelFrozenSends, releaseFrozenSends } from '../../redux/reducers/BillingSlice';
import { first, get, last } from 'lodash';
import Toast from '../Toast/Toast.component';
import { formatNumberWithCommas } from '../../helpers/Utils/TextHelper';
import Rocket from '../../assets/images/rocket_transparent.png';
import Celebration from '../../assets/images/transparent_celebration.png';
import { IoCloseCircleOutline } from 'react-icons/io5';
import UnsubscribePayPerRecipient from './UnsubscribePayPerRecipient';
import { getPackagesDetails } from '../../redux/reducers/dashboardSlice';
import { URLS } from '../../config/enum';
import TranzilaIframe from '../Balance/PaymentWizard/Dialogs/TranzilaIframe';
import { StateType } from '../../Models/StateTypes';
import { CurrenciesToDisplayForPoland } from '../../helpers/Constants';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import EmailMarketingSlider from '../EmailPlans/EmailMarketingSlider';
import { getAddSubscriptionCardIframeURLPoland, getUserCreditCards, polandEmailSubscriptionByCreditCard } from '../../redux/reducers/TiersSlice';
import { MdAdd } from 'react-icons/md';

const steps = [
  '',
  '',
  '',
];

const PayPerRecipientNew = ({ classes, isOpen, onClose, jumpToStep = 1 }: any) => {
	const { t, i18n } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
  const { packagesDetails } = useSelector((state: any) => state.dashboard);
  const { currencyList, currencyId, accountCurrencySymbol, accountIsCurrencySymbolPrefix, IsCurrencySymbolPrefix } = useSelector((state: StateType) => state.common);
  const { userCreditCards } = useSelector((state: any) => state.tiers);
  const [ isLoader, setIsLoader ] = useState(true);
  const [ toastMessage, setToastMessage ] = useState(null);
  type MarkType = {
    id: any;
    value: any;
    label: string;
    displayText: string;
    currencyId: any;
    low: any;
    high: any;
  };
  const [ marks, setMarks ] = useState<MarkType[]>([]);
  const [ allPacakages, setAllPacakages ] = useState([]);
  const [ selectedPricing, setSelectedPricing ] = useState(0);
  const [ level, setLevel ] = useState({
    low: 0,
    high: 0
  });
  const [ activeStep, setActiveStep ] = useState(jumpToStep);
  const [ hasFrozenEmail, setHasFrozenEmail ] = useState(false);
  const [ showReleaseMessage, setShowReleaseMessage ] = useState(false);
  const [ showCancelMessage, setShowCancelMessage ] = useState(false);
  const [ paymentIframe, setPaymentIframe ] = useState<string>('');
  const [ isOpenUnsubscribeDialog, setIsOpenUnsubscribeDialog ] = useState(false);
  const [ packageCurrencyList, setPackageCurrencyList ] = useState([]);
  const [ selectedCurrency, setSelectedCurrency ] = useState({
    id: currencyId,
    sign: accountCurrencySymbol,
    symbolPrefix: accountIsCurrencySymbolPrefix
  });
  const [ paymentViaExistingCC, setPaymentViaExistingCC ] = useState<boolean | null>(null);
  const [ loadingIframe, setLoadingIframe ] = useState(false);
  const [ selectedCreditCard, setSelectedCreditCard ] = useState<any>(null);
  const [ showCardConfirmationDialog, setShowCardConfirmationDialog ] = useState(false);
  const dispatch = useDispatch();
  const { Newsletters = {} } = packagesDetails || {};
  const creditCards = userCreditCards?.Data || [];
  useEffect(() => {
    if (allPacakages.length) {
      generagetMarks(allPacakages);
      allPacakages.filter((mark: any) => mark?.Currency_Id === selectedCurrency.id).length > 0 && setSelectedPricing(get(first(allPacakages.filter((mark: any) => mark?.Currency_Id === selectedCurrency.id && mark.LevelLow === level.low && mark.LevelHigh === level.high)), 'Price', 0));
    }
  }, [selectedCurrency.id]);

  useEffect(() => {
    setSelectedCurrency({
      id: currencyId,
      sign: accountCurrencySymbol,
      symbolPrefix: IsCurrencySymbolPrefix
    });
  }, [currencyId]);

	useEffect(() => {
		if (isOpen) {
      setMarks([]);
      setSelectedPricing(0);
			fetchPricing();
      fetchCreditCards();
      setActiveStep(jumpToStep);
      setHasFrozenEmail(false);
      setShowReleaseMessage(false);
      setShowCancelMessage(false);
      setPaymentIframe('');
      setIsLoader(false);
      setToastMessage(null);
      setLevel({
        low: 0,
        high: 0
      })
      setPackageCurrencyList([]);
      setAllPacakages([]);
      setPaymentViaExistingCC(null);
      setLoadingIframe(false);
      setSelectedCreditCard(null);
      setShowCardConfirmationDialog(false);

      if (jumpToStep === 2) {
        fetchCCIFrame();
      }
		}
	}, [isOpen]);

  const fetchPricing = async () => {
    setIsLoader(true);
    const { payload: { Data, StatusCode } }: any = await dispatch(GetEmailPackagePrices());
    if (StatusCode === 201) {
      const uniqueIds = Array.from(new Set(Data.map((item: any) => item.Currency_Id)));
      
      const uniqueObjects = currencyList.filter((item: any) => 
        uniqueIds.includes(item?.ID)
      );
      setPackageCurrencyList(uniqueObjects);
      setAllPacakages(Data);
      generagetMarks(Data);
    }
    setIsLoader(false);
  }

  const fetchCreditCards = async () => {
    await dispatch(getUserCreditCards() as any);
  }

  const generagetMarks = (data: any[]) => {
    const markList = data.filter((mark: any) => mark?.Currency_Id === selectedCurrency.id).map((item: any) => {
      const levelHigh = item.LevelHigh;
      let displayLabel = '';
      
      if (levelHigh >= 1000) {
        displayLabel = `${levelHigh / 1000}K`;
      } else {
        displayLabel = `${levelHigh}`;
      }
      
      return {
        id: item.Id,
        value: item.Price,
        label: '',
        displayText: displayLabel,
        currencyId: item.Currency_Id,
        low: item.LevelLow,
        high: item.LevelHigh
      };
    });
    const lastItem: any = last(data);
    const lastLevelHigh = lastItem?.LevelHigh;
    let lastDisplayLabel = '';
    
    if (lastLevelHigh >= 1000) {
      lastDisplayLabel = `${lastLevelHigh / 1000}K+`;
    } else {
      lastDisplayLabel = `${lastLevelHigh}+`;
    }
    
    markList.push({
      id: lastItem?.Id + 1,
      value: lastItem.Price + 100,
      label: '',
      displayText: lastDisplayLabel,
      currencyId: lastItem.Currency_Id,
      low: lastItem.LevelLow,
      high: '+'
    });
    setMarks(markList);
  }

  const handleChange = (event: any, newValue: any) => {
    const found: any = marks.find((mark: any) => mark?.value === newValue);
    setLevel({
      low: found?.low,
      high: found?.high
    });
    setSelectedPricing(newValue);
  };

  const getSelectedLabel = () => {
    const found: any = marks.find((mark: any) => mark?.value === selectedPricing);
    return found ? found.displayText : 'Select a range';
  };

  const renderToast = () => {
    if (toastMessage) {
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return (
        <Toast data={toastMessage} />
      );
    }
    return null;
  }

  const step1 = () => {
    return (
      <Box className={clsx(classes.textCenter, classes.mlr10)}>
        {
          !Newsletters.IsEmailPolandSubscribed && (
            <Typography className={clsx(classes.f28, classes.bold)}>
              {t('dashboard.polishSubscribe.joinPlan1')}
            </Typography>
          )
        }

        {
          !Newsletters.IsEmailPolandSubscribed && (
            <Typography className={clsx(classes.f28, classes.bold, classes.mb10)}>
              {t('dashboard.polishSubscribe.joinPlan2')}
            </Typography>
          )
        }

        {
          Newsletters.IsEmailPolandSubscribed && (
            <Typography className={clsx(classes.f28, classes.bold, classes.textCenter, classes.mb10)}>
              {t('dashboard.polishSubscribe.yourCurrentTier')}
            </Typography>
          )
        }

        <Grid
          container
          spacing={1}
        >
          {/* <Grid item md={3}></Grid> */}
          <Grid item md={9}>
            <Grid container spacing={1} className={clsx(classes.pt15, classes.pb10)}>
              <Grid item xs={6} className={clsx(classes.textCenter)}>
                <Typography className={clsx(classes.f18, classes.mb10, classes.mt15)}>
                  {t('dashboard.polishSubscribe.targetPlan')}
                </Typography>
              </Grid>

              <Grid item xs={6} className={clsx(classes.textCenter)}>
                <Typography className={clsx(classes.f22, classes.bold, classes.mb10, classes.mt15, classes.colrPrimary, classes.directionLTR)}>
                  {getSelectedLabel()}
                </Typography>
              </Grid>
            </Grid>

            <EmailMarketingSlider
              classes={classes}
              value={selectedPricing}
              onChange={handleChange}
              marks={marks}
              disabled={Newsletters.IsEmailPolandSubscribed}
              min={get(first(marks), 'value', 0)}
              max={get(last(marks), 'value', 100)}
              hideHeader={true}
            />

            {/* Currency Selection - Commented Out */}
            {/* <Grid container>
              <Grid item xs={12} className={clsx(classes.textRight)}>
                <Box className={clsx(classes.p10)}>
                  {
                    packageCurrencyList.map((currency: any) => {
                      return <Button
                        key={currency.ID}
                        className={clsx(
                          classes.btn,
                          classes.btnRounded,
                          classes.mr10,
                          classes.fieldOfInterestButton,
                          classes.mb10,
                          classes.f14,
                          {
                            [classes.dFlex]: windowSize === 'xs',
                            [classes.mt10]: windowSize === 'xs',
                            [classes.f12]: windowSize === 'xs',
                            [classes.gradientBackground]: selectedCurrency.id === currency.ID,
                            [classes.colorWhite]: selectedCurrency.id === currency.ID
                          }
                        )}
                        onClick={() => {
                          setSelectedCurrency({
                            id: currency.ID,
                            sign: currency.CurrencySymbol,
                            symbolPrefix: currency.IsCurrencySymbolPrefix
                          });
                        }}
                      >
                        {currency.Name}
                      </Button>
                    })
                  }
                </Box>
              </Grid>
            </Grid> */}
            <Grid container className={clsx(classes.payPerRecipientPlanDetail, classes.mt15)}>
              <Grid item xs={5} className={clsx(classes.textLeft)}>
                <Box className={clsx(classes.p10, classes.textCenter)}>
                  {
                    selectedPricing !== get(last(marks), 'value', 100) ? (
                      <>
                        <Typography className={clsx(classes.f16)}>
                          {t('dashboard.polishSubscribe.totalToPay')}
                        </Typography>

                        <Typography className={clsx(classes.f30, classes.bold, classes.line1)}>
                          {selectedCurrency.symbolPrefix ? selectedCurrency.sign : ''} {selectedPricing} {!selectedCurrency.symbolPrefix ? selectedCurrency.sign : ''}
                        </Typography>

                        <Typography className={clsx(classes.f14)}>
                          {t('dashboard.polishSubscribe.perMonth')}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography className={clsx(classes.f16, classes.mb5)}>
                          {t('dashboard.polishSubscribe.customizePlan')}
                        </Typography>

                        <a href={isRTL ? URLS.ContactUs : URLS.ContactUsEn} target='_blank' className={clsx(classes.pt10, classes.pb10, classes.mb5, classes.dBlock)}>
                          {t('common.contactUs')}
                        </a>
                      </>
                    )
                  }
                </Box>
              </Grid>
              <Grid item xs={7} className={clsx(classes.textRight)}>
                <Box className={clsx(classes.p10, isRTL ? classes.textRight : classes.textLeft)}>
                  <Typography className={clsx(classes.f16, classes.mb5)}>
                    <AiOutlineCheck style={{ verticalAlign: 'middle', marginRight: 5 }} /> {t('dashboard.polishSubscribe.recipients')}
                    <div className={clsx(classes.f16, classes.mb5, classes.dInlineBlock, classes.paddingInline5)} style={{ direction: 'ltr' }}>
                      {getSelectedLabel()}
                    </div>
                  </Typography>

                  <Typography className={clsx(classes.f16)}>
                    <AiOutlineCheck style={{ verticalAlign: 'middle', marginRight: 5 }} /> {t('dashboard.polishSubscribe.unlimitedEmailSending')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* <Grid container>
              <Grid item xs={12} className={clsx(classes.textCenter)}>
                <Box className={clsx(classes.p10)}>
                  {
                    packageCurrencyList.filter((item: any) => CurrenciesToDisplayForPoland.indexOf(item?.ID) > -1).map((currency: any) => {
                      return <Button
                        key={currency.ID}
                        className={clsx(
                          classes.btn,
                          classes.btnRounded,
                          classes.mr10,
                          classes.fieldOfInterestButton,
                          classes.mb10,
                          classes.f14,
                          {
                            [classes.dFlex]: windowSize === 'xs',
                            [classes.mt10]: windowSize === 'xs',
                            [classes.f12]: windowSize === 'xs',
                            [classes.gradientBackground]: selectedCurrency.id === currency.ID,
                            [classes.colorWhite]: selectedCurrency.id === currency.ID
                          }
                        )}
                        onClick={() => {
                          setSelectedCurrency({
                            id: currency.ID,
                            sign: currency.CurrencySymbol,
                            symbolPrefix: currency.IsCurrencySymbolPrefix
                          });
                        }}
                      >
                        {currency.Name} ({currency.CurrencySymbol})
                      </Button>
                    })
                  }
                </Box>
              </Grid>
            </Grid> */}
          </Grid>
          <Grid item md={3}>
            <img
              src={Rocket}
              alt="rocket"
              className={clsx(classes.rocketImage)}
            />
          </Grid>
        </Grid>

        {renderToast()}
        {
          !Newsletters.IsEmailPolandSubscribed && (
            <Typography className={clsx(classes.f18, classes.pt25)}>
              {t('dashboard.polishSubscribe.confirmation')}
            </Typography>
          )
        }
      </Box>
    )
  }

  const fetchCCLinkForiFrame = async () => {
    const found: any = allPacakages.find((mark: any) => mark?.Currency_Id === currencyId && mark?.LevelLow === level.low && mark?.LevelHigh === level.high);
    
    setLoadingIframe(true);
    const requestParams = {
      language: i18n.language || 'en',
      subscriptionType: 'EmailPolandSubscription',
      isNewSubscription: true,
      tierId: 0,
      emailTierScaleId: found?.Id
    };
    
    const response: any = await dispatch(getAddSubscriptionCardIframeURLPoland(requestParams));
    if (response.payload?.Data?.IframeUrl) {
      setPaymentIframe(response.payload?.Data?.IframeUrl);
    }
    setLoadingIframe(false);
  };

  const renderCreditCards = () => {
    if (paymentViaExistingCC === true) {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.creditCardManagement.cardNumber')}</TableCell>
                <TableCell>{t('billing.creditCardManagement.cardType')}</TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creditCards.map((card: any, index: number) => (
                <TableRow key={card.CardId || index} hover>
                  <TableCell>
                    <Typography 
                      variant="body1" 
                      style={{ 
                        direction: 'ltr', 
                        fontWeight: 'bold'
                      }}
                    >
                      {card.MaskedNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {card.IsDefault ? (
                      <Chip 
                        label={t('billing.creditCardManagement.defaultCard')} 
                        color="primary" 
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t('billing.creditCardManagement.secondaryCard')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      className={clsx(classes.btn, classes.btnRounded)}
                      onClick={async () => {
                        setShowCardConfirmationDialog(true);
                        setSelectedCreditCard(card);
                      }}
                      variant="outlined"
                      color="primary"
                      size='small'
                    >
                      {t('common.select')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {/* Add New Card Button Row */}
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center', padding: 20 }}>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded)}
                    onClick={() => {
                      setPaymentViaExistingCC(false);
                      fetchCCLinkForiFrame();
                    }}
                    startIcon={<MdAdd />}
                    variant="outlined"
                    color="primary"
                  >
                    {t('billing.creditCardManagement.addNewCard')}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )
    } else if (paymentViaExistingCC === false) {
      return (
        <>
          {loadingIframe ? (
            <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '400px' }}>
              <CircularProgress />
              <Typography variant="body2" style={{ marginLeft: '16px' }}>
                {t('billing.tier.upgrade.loadingPaymentForm')}
              </Typography>
            </Box>
          ) : (
            paymentIframe ? (
              <TranzilaIframe
                data={{}}
                classes={classes}
                isRTL={isRTL}
                packageId={null}
                onComplete={(message: any) => {
                  setActiveStep(3);
                  setHasFrozenEmail(!!message?.hasFrozenEmail)
                }}
                // @ts-ignore
                paymentUrl={`${paymentIframe}`}
                hideSummary={true}
              />
            ) : (
              <Typography variant="body2" style={{ marginLeft: '16px' }}>
              </Typography>
            )
          )
        }
        </>
      )
    }
                
    return null;
  };

  const step2 = () => {
    return (
      <>
        <Typography className={clsx(classes.f28, classes.bold, classes.textCenter, classes.mb10)}>
          {paymentViaExistingCC ? t('billing.creditCardManagement.selectCreditCard') : t('settings.billingSettings.btnAddCard')}
        </Typography>
        <Grid
          container
          spacing={1}
        >
          <Grid item md={3}></Grid>
          <Grid item md={6}>
            {renderCreditCards()}
          </Grid>
          <Grid item md={3}>
            <img
              src={Rocket}
              alt="rocket"
              className={clsx(classes.rocketImage)}
            />
          </Grid>
        </Grid>
      </>
    )
  }

  const step3 = () => {
    return (
      <>
        <Box className={clsx(classes.textCenter)}>
          <img 
            src={Celebration}
            alt="celebration"
            className={clsx(classes.celebrationImage)}
          />
          <Typography className={clsx(classes.f28, classes.bold)}>
            {t('dashboard.polishSubscribe.success')}
          </Typography>
          {FrozenCampaignsMessage()}
        </Box>
      </>
    )
  }

  const fetchCCIFrame = async () => {
    const culture: string = isRTL ? 'he' : 'en';
    const response = await dispatch(getCreditCardIframe(culture)) as any;
    setPaymentIframe(response?.payload?.Data);
  }

  const step1UnsubscribeActionButtons = () => {
    return (
      <Box className={clsx(isRTL ? classes.textLeft : classes.textRight, classes.pt15)}>
        <Button
          onClick={async () => {
            setIsOpenUnsubscribeDialog(true);
          }}
          className={clsx(
            classes.btn,
            classes.btnRounded
          )}>
          {t('dashboard.polishUnsubscribe.title')}
        </Button>
      </Box>
    )
  };

  const Steppers = (activeStep: number) => {
    return (
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel style={{ padding: 0 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    )
  }

  const step1ActionButtons = () => {
    return (
      <Grid
        container
        spacing={2}
        className={clsx(classes.dialogButtonsContainer, classes.pt15)}
        style={{ direction: 'ltr' }}
      >
        <Grid item md={3} xs={12}>
          {isRTL && Steppers(0)}
        </Grid>
        <Grid item md={6} xs={12} className={clsx(classes.textCenter)}>
          <Button
            onClick={async () => {
              const found: any = allPacakages.find((mark: any) => mark?.Currency_Id === currencyId && mark?.LevelLow === level.low && mark?.LevelHigh === level.high);
              setIsLoader(true);
              
              // Check if user has credit cards
              setPaymentViaExistingCC(creditCards.length > 0);
              
              // If no credit cards, fetch iframe immediately
              if (creditCards.length === 0) {
                await fetchCCLinkForiFrame();
              }
              
              setActiveStep(2);
              setIsLoader(false);
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded,
              classes.lightGreenButton
            )}
            style={{
              opacity: selectedPricing === get(last(marks), 'value', 100) ? 0 : 100
            }}
          >
            {t('dashboard.polishSubscribe.securePurchase')}
          </Button>
        </Grid>
        <Grid item md={3} xs={12} className={clsx(classes.textCenter)}>
          {!isRTL && Steppers(0)}
        </Grid>
      </Grid>
    )
  }

  const step2ActionButtons = () => {
    return (
      <Grid
        container
        spacing={2}
        className={clsx(classes.dialogButtonsContainer, classes.pt15, isRTL ? classes.rowReverse : null)}
      >
        <Grid item md={3} xs={12} className={clsx(classes.textCenter)}>
          {isRTL && Steppers(1)}
        </Grid>
        <Grid item md={6} xs={12} className={clsx(classes.textCenter)}>
        </Grid>
        <Grid item md={3} xs={12} className={clsx(classes.textCenter)}>
          {!isRTL && Steppers(1)}
        </Grid>
      </Grid>
    )
  };

  const step3ActionButtons = () => {
    return (
      <Grid
        container
        spacing={2}
        className={clsx(classes.dialogButtonsContainer, classes.pt15, isRTL ? classes.rowReverse : null)}
      >
        <Grid item md={3} xs={12} className={clsx(classes.textCenter)}>
          {isRTL && Steppers(2)}
        </Grid>
        <Grid item md={6} xs={12} className={clsx(classes.textCenter)}>
        </Grid>
        <Grid item md={3} xs={12} className={clsx(classes.textCenter)}>
          {isRTL && Steppers(2)}
        </Grid>
      </Grid>
    )
  };

  const processFrozenCampaigns = async (action: string) => {
    setIsLoader(true);
    const { payload: { StatusCode } }: any = await dispatch(action === 'cancel' ? cancelFrozenSends() : releaseFrozenSends());
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

  const FrozenCampaignsMessage = () => {
    if (!hasFrozenEmail) return null;
    
    return (
      <Box className={clsx(classes.frozenCampaignsContainer, classes.pt25)}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Box>
              <Typography className={clsx(classes.f20)}>
                {!showReleaseMessage && !showCancelMessage && RenderHtml(t("dashboard.polishSubscribe.frozenMessage"))}
                {showReleaseMessage && RenderHtml(t("dashboard.polishSubscribe.releaseMessage"))}
                {showCancelMessage && RenderHtml(t("dashboard.polishSubscribe.cancelMessage"))}
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
                        className={clsx(classes.btn, classes.btnRounded, classes.mInline5)}
                      >
                        {t('common.Yes')}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => processFrozenCampaigns('cancel')}
                        disabled={isLoader}
                        className={clsx(classes.btn, classes.btnRounded, classes.mInline5)}
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


	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t(`common.SubscribeButton`)}
			icon={
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
			}
			showDivider={false}
			onClose={() => onClose()}
			onCancel={() => onClose()}
			reduceTitle
			style={{ minWidth: '70vw' }}
      customContainerStyle={clsx(classes.payPerRecipientDialog)}
      maxHeight={"70vh"}
      childrenStyle={"payPerRecipientChild"}
      hideHeader={true}
			renderButtons={() => (
				<>
          {activeStep === 1 && !Newsletters.IsEmailPolandSubscribed && step1ActionButtons()}
          {activeStep === 1 && Newsletters.IsEmailPolandSubscribed && step1UnsubscribeActionButtons()}
          {activeStep === 2 && step2ActionButtons()}
          {activeStep === 3 && step3ActionButtons()}
        </>
			)}
		>
      <>
        <IconButton className={clsx(classes.closeModalButton)} onClick={() => onClose()}>
          <IoCloseCircleOutline size={40} />
        </IconButton>
        {activeStep === 1 && step1()}
        {activeStep === 2 && step2()}
        {activeStep === 3 && step3()}
        <UnsubscribePayPerRecipient
          classes={classes}
          isOpen={isOpenUnsubscribeDialog}
          onClose={async (response: any) => {
            setIsOpenUnsubscribeDialog(false);
            if (response) {
              // @ts-ignore
              setToastMessage({ severity: 'success', color: 'success', message: t('dashboard.polishUnsubscribe.success'), showAnimtionCheck: false });
              await dispatch(getPackagesDetails());
            }
          }}
        />
        <BaseDialog
          classes={classes}
          open={showCardConfirmationDialog}
          onClose={() => setShowCardConfirmationDialog(false)}
          onCancel={() => setShowCardConfirmationDialog(false)}
          onConfirm={async () => {
            const found: any = allPacakages.find((mark: any) => mark?.Currency_Id === currencyId && mark?.LevelLow === level.low && mark?.LevelHigh === level.high);
            setIsLoader(true);
            const response: any = await dispatch(polandEmailSubscriptionByCreditCard({
              Id: selectedCreditCard.ID,
              Type: selectedCreditCard.Type,
              PackageID: found?.Id
            }))
            if (response?.payload?.StatusCode === 200) {
              setActiveStep(3);
              setShowCardConfirmationDialog(false);
              setSelectedCreditCard(null);
              await dispatch(getPackagesDetails());

              if (response?.payload?.Data?.HasFrozenEmail) {
                setHasFrozenEmail(true);
              }
            } else {
              // @ts-ignore
              setToastMessage({ severity: 'error', color: 'error', message: t('common.errorOccurred'), showAnimtionCheck: false });
            }
            setIsLoader(false);
          }}
        >
          {t('billing.tier.upgrade.payUsingCC')}
        </BaseDialog>
        <Loader isOpen={isLoader} showBackdrop={true} />
      </>
		</BaseDialog>
	);
};

export default PayPerRecipientNew;
