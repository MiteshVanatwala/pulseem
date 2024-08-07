import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Box, Button, Stepper, Step, StepLabel, TextField, InputAdornment, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { FaCcDinersClub, FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import { SiAmericanexpress } from "react-icons/si";
import TranzilaIframe from './PaymentWizard/Dialogs/TranzilaIframe';
import { getGlobalPaymentURL } from '../../redux/reducers/paymentSlice';
import PaymentResult from './PaymentWizard/Dialogs/PaymentResult';
import { IsraelCurrencyId, USDCurrencyId } from '../../helpers/Constants';

const steps = ['common.enterTopUpAmount', 'common.selectPaymentMethod', 'common.payment', 'common.summary'];

const GlobalBalancePaymentWizard = ({ classes, isOpen, onClose = () => {} }: any) => {
  const { windowSize, isRTL } = useSelector((state: any) => state.core)
  const { currencySymbol, isCurrencySymbolPrefix, VAT, currencyId } = useSelector((state: any) => state.common)
  const { globalPaymentUrl } = useSelector((state: any) => state.payment);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [ activeStep, setActiveStep ] = useState<number>(0);
  const [ topUpAmount, setTopUpAmount ] = useState<number | null>(null);
  const [ paymentResult, setPaymentResult ] = useState(null);
  const [ paymentType, setPaymentType ] = useState<string>('masterCard');
  const cardList = [
    {
      key: 'masterCard',
      name: t('common.masterCard'),
      icon: <FaCcMastercard className={clsx(classes.verticalAlignMiddle, classes.ml5)} />
    },
    {
      key: 'visa',
      name: t('common.visa'),
      icon: <FaCcVisa className={clsx(classes.verticalAlignMiddle, classes.ml5)} />
    },
    {
      key: 'diners',
      name: t('common.diners'),
      icon: <FaCcDinersClub className={clsx(classes.verticalAlignMiddle, classes.ml5)} />
    }
  ];

  if (currencyId === USDCurrencyId) {
    cardList.push({
      key: 'americanExpress',
      name: t('common.americanExpress'),
      icon: <SiAmericanexpress className={clsx(classes.verticalAlignMiddle, classes.ml5)} />
    });
  }
  
  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setTopUpAmount(null);
      setPaymentType('masterCard');
    }
  }, [isOpen])

  const topUpClick = () => {
    if (topUpAmount !== null && topUpAmount > 0) {
      setActiveStep(activeStep + 1);
      // @ts-ignore
      dispatch(getGlobalPaymentURL({ actualPrice: topUpAmount, Culture: isRTL ? 'he-IL' : 'en-US' }));
    }
  }

  const onPaymentResult = (results?: any) => {
    setPaymentResult(results);
    setActiveStep(activeStep + 1);
  }

  return (
    <BaseDialog
      title={t('common.topUpBalance')}
      contentStyle={windowSize === 'xs' ? clsx(classes.noMargin) : classes.w70VW}
      classes={classes}
      open={isOpen}
      disableBackdropClick={true}
      onClose={() => onClose(null)}
      onCancel={() => onClose(null)}
      renderButtons={() => (
        <div className={clsx(classes.textCenter, classes.mt25)}>
          {
            activeStep === 0 && (
              <Button
                onClick={topUpClick}
                variant='contained'
                size='medium'
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.ml5
                )}
                color="primary"
              >
                {t('common.topUp')}
              </Button>
            )
          }
          {
            activeStep === 1 && (
              <Button
                onClick={() => setActiveStep(activeStep + 1)}
                variant='contained'
                size='medium'
                className={clsx(
                  classes.btn,
                  classes.btnRounded,
                  classes.ml5
                )}
                color="primary"
              >
                {t( activeStep === 1 ? 'common.continue' : 'common.checkout')}
              </Button>
            )
          }
          <Button
            onClick={onClose}
            variant='contained'
            size='medium'
            className={clsx(classes.btn, classes.btnRounded, classes.ml5)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      )}
    >
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel className={clsx(classes.nopadding)}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        { activeStep === 0 && (
          <Box className={clsx(classes.m10, classes.mt25, classes.margin)} style={{ width: 200, margin: 'auto', marginTop: 20, marginBottom: 20 }}>
            <Typography title={t("common.topUpBalance")} className={classes.bold}>
              {t("common.topUpBalance")}
            </Typography>
            <TextField
              autoFocus
              type='number'
              label=""
              variant="outlined"
              name={'topUpBalance'}
              value={topUpAmount}
              className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField)}
              autoComplete="off"
              onChange={(e: any) => e.target.value < 0 ? (e.target.value = 0) : setTopUpAmount(e.target.value)}
              InputProps={{
                startAdornment: isCurrencySymbolPrefix === true ? <InputAdornment position="start">{currencySymbol}</InputAdornment> : null,
                endAdornment: isCurrencySymbolPrefix === false ? <InputAdornment position="end">{currencySymbol}</InputAdornment> : null
              }}
            />
          </Box>
        )}

        {
          activeStep === 1 && (
            <Box className={clsx(classes.m10, classes.mt25, classes.margin)} style={{ width: 400, margin: 'auto', marginTop: 20, marginBottom: 20 }}>
              <Typography title={t("common.selectPaymentMethod")} className={clsx(classes.pb10, classes.bold)}>
                {t("common.selectPaymentMethod")}
              </Typography>

              <RadioGroup row defaultValue={paymentType} value={paymentType}>
                {
                  cardList.map((card: any) => {
                    return (
                      <FormControlLabel
                        key={card.key}
                        className={clsx(classes.fullSize)}
                        control={<>
                          <Radio
                            color="primary"
                            onChange={(event: any) => setPaymentType(event.target.value)}
                            value={card.key}
                          />
                        </>}
                        label={<>{card.icon} {card.name}</>}
                      />
                    )
                  })
                }
              </RadioGroup>
              {
                paymentType === 'americanExpress' && <Typography className={clsx(classes.errorText, classes.f16, classes.pt10)} variant="body1">{t('common.americanExpressWarning')}</Typography>
              }
              <Box className={clsx(classes.bold, classes.pt25, classes.f18)}>
                {t('common.Total')}&nbsp;:&nbsp;
                <span>
                  { isCurrencySymbolPrefix ? currencySymbol : '' } {topUpAmount} { !isCurrencySymbolPrefix ? currencySymbol : '' }
                </span>
                { currencyId === IsraelCurrencyId && (
                  <>
                    <span className={classes.ml5}>
                      + {VAT}%
                      ({ isCurrencySymbolPrefix ? currencySymbol : '' } {(Number(topUpAmount) * VAT / 100)} { !isCurrencySymbolPrefix ? currencySymbol : '' })
                    </span>
                    <span className={classes.ml5}>=</span>
                    <span>
                      { isCurrencySymbolPrefix ? currencySymbol : '' } {Number(topUpAmount) + (Number(topUpAmount) * VAT / 100)} { !isCurrencySymbolPrefix ? currencySymbol : '' }
                    </span>
                  </>
                )}
              </Box>
            </Box>
          )
        }

        {
          activeStep === 2 && globalPaymentUrl && (
            <>
              <TranzilaIframe
                data={[{
                  ID: 4,
                  CampaignType: 4,
                  PackageType: 0,
                  Price: Number(topUpAmount || 0),
                  Quantity: '',
                }]}
                classes={classes}
                isRTL={isRTL}
                packageId={4}
                onComplete={onPaymentResult}
                paymentUrl={globalPaymentUrl}
                onStepBack={() => setActiveStep(activeStep - 1)}
              />
            </>
          )
        }

        {
          activeStep === 3 && (
            <PaymentResult
              t={t}
              classes={classes}
              paymentObject={paymentResult}
              onStepBack={() => setActiveStep(activeStep - 1)}
            />
          )
        }
      </Box>
    </BaseDialog>
  )
}

export default React.memo(GlobalBalancePaymentWizard);
