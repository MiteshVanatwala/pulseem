import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, IconButton, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import Slider from '@mui/material/Slider';
import { AiOutlineCheck } from 'react-icons/ai';
import { Loader } from '../Loader/Loader';
import { EmailPricingSubscriptionPoland, getCreditCardIframe, GetEmailPackagePrices } from '../../redux/reducers/BillingSlice';
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

const steps = [
  '',
  '',
  '',
];

const PayPerRecipientNew = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
  const { packagesDetails } = useSelector((state: any) => state.dashboard);
  const { currencyList, currencyId, accountCurrencySymbol, accountIsCurrencySymbolPrefix, IsCurrencySymbolPrefix } = useSelector((state: StateType) => state.common);
  const [ isLoader, setIsLoader ] = useState(false);
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
  const [ activeStep, setActiveStep ] = useState(1);
  const [ paymentIframe, setPaymentIframe ] = useState<string>('');
  const [ isOpenUnsubscribeDialog, setIsOpenUnsubscribeDialog ] = useState(false);
  const [ packageCurrencyList, setPackageCurrencyList ] = useState([]);
  const [ selectedCurrency, setSelectedCurrency ] = useState({
    id: currencyId,
    sign: accountCurrencySymbol,
    symbolPrefix: accountIsCurrencySymbolPrefix
  });
  const dispatch = useDispatch();
  const { Newsletters = {} } = packagesDetails || {};
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
      setActiveStep(1);
      setPaymentIframe('');
      setIsLoader(false);
      setToastMessage(null);
      setLevel({
        low: 0,
        high: 0
      })
      setPackageCurrencyList([]);
      setAllPacakages([]);
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

  const generagetMarks = (data: any[]) => {
    const markList = data.filter((mark: any) => mark?.Currency_Id === selectedCurrency.id).map((item: any) => ({
      id: item.Id,
      value: item.Price,
      label: '',
      displayText: `${formatNumberWithCommas(item.LevelLow)} - ${formatNumberWithCommas(item.LevelHigh)}`,
      currencyId: item.Currency_Id,
      low: item.LevelLow,
      high: item.LevelHigh
    }));
    const lastItem: any = last(data);
    markList.push({
      id: lastItem?.Id + 1,
      value: lastItem.Price + 100,
      label: '',
      displayText: `${formatNumberWithCommas(lastItem?.LevelHigh)} +`,
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
          <Grid item md={3}></Grid>
          <Grid item md={6}>
            <Grid container spacing={1} className={clsx(classes.pt15, classes.pb10)}>
              <Grid item xs={6} className={clsx(classes.textCenter)}>
                <Typography className={clsx(classes.f18)}>
                  {t('dashboard.polishSubscribe.targetPlan')}
                </Typography>
              </Grid>

              <Grid item xs={6} className={clsx(classes.textCenter)}>
                <Typography className={clsx(classes.f22, classes.bold, classes.mb10, classes.mt15, classes.colrPrimary, classes.directionLTR)}>
                  {getSelectedLabel()}
                </Typography>
              </Grid>
            </Grid>

            <Slider
              disabled={Newsletters.IsEmailPolandSubscribed}
              aria-label="pricing"
              defaultValue={0}
              step={null}
              // valueLabelDisplay="auto"
              marks={marks}
              min={get(first(marks), 'value', 0)}
              max={get(last(marks), 'value', 100)}
              onChange={handleChange}
              color="primary"
              className={clsx(classes.colrPrimary, classes.customSlider, classes.mb10)}
              style={{ color: "#ff3343" }}
            />

            <Grid container>
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
            </Grid>
            <Grid container className={clsx(classes.payPerRecipientPlanDetail)}>
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

            <Grid container>
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
            </Grid>
          </Grid>
          <Grid item md={3}>
            <img
              src={Rocket}
              alt="rocket"
              className={clsx(classes.rocketImage)}
            />
          </Grid>
        </Grid>

        <Loader isOpen={isLoader} showBackdrop={true} />
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

  const step2 = () => {
    return (
      <>
        <Typography className={clsx(classes.f28, classes.bold, classes.textCenter, classes.mb10)}>
          {t('settings.billingSettings.btnAddCard')}
        </Typography>
        <Grid
          container
          spacing={1}
        >
          <Grid item md={3}></Grid>
          <Grid item md={6}>
            <TranzilaIframe
              data={{}}
              classes={classes}
              isRTL={isRTL}
              packageId={null}
              onComplete={() => setActiveStep(3)}
              // @ts-ignore
              paymentUrl={`${paymentIframe}`}
              hideSummary={true}
          />
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
              const { payload: { StatusCode } }: any = await dispatch(EmailPricingSubscriptionPoland({ PricePackageId:  found?.Id }));
              if (StatusCode === 201) {
                // onClose(found?.id);
                await fetchCCIFrame();
                setActiveStep(2);
              } else if (StatusCode === 403) {
                // @ts-ignore
                setToastMessage({ severity: 'error', color: 'error', message: t('dashboard.polishSubscribe.featureNotAllowed'), showAnimtionCheck: false });
              }
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
      </>
		</BaseDialog>
	);
};

export default PayPerRecipientNew;
