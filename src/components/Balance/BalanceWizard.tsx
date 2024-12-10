import { Box, Button, Grid, InputAdornment, Step, StepLabel, Stepper, TextField } from "@material-ui/core"
import { useState } from "react";
import clsx from 'clsx'
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getManualPaymentURL } from "../../redux/reducers/paymentSlice";
import TranzilaIframe from "./PaymentWizard/Dialogs/TranzilaIframe";
import { Loader } from "../Loader/Loader";
import PaymentResult from "./PaymentWizard/Dialogs/PaymentResult";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";

const BalanceWizard = ({ classes, steps }: any) => {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<number | any>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const { isRTL } = useSelector((state: any) => state.core);
  const { manualPaymentUrl } = useSelector((state: any) => state.payment);
  const [paymentResult, setPaymentResult] = useState(null);
  const dispatch = useDispatch();

  // const steps = ['common.enterTopUpAmount', 'common.payment', 'common.summary'];

  const topUpClick = async () => {
    if (balance !== null && balance > 0) {
      setShowLoader(true)
      setActiveStep(activeStep + 1);
      // @ts-ignore
      await dispatch(getManualPaymentURL({ actualPrice: balance, Culture: isRTL ? 'he-IL' : 'en-US', OperationSource: 'Whatsapp' }));
      setShowLoader(false)
    }
  }


  const step1 = () => {
    return <>
      <Grid item xs={12}>
        {RenderHtml(t(steps[activeStep]?.description))}
      </Grid>
      <Grid item xs={4} className={classes.pt15}>
        <TextField
          autoFocus
          type='number'
          label=""
          variant="outlined"
          name={'topUpBalance'}
          value={balance}
          className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField)}
          autoComplete="off"
          onChange={(e: any) => e.target.value < 0 ? (e.target.value = 0) : setBalance(Number(Math.max(0, parseInt(e.target.value)).toString().slice(0, 10)))}
          InputProps={{
            startAdornment: isRTL ? <></> : <InputAdornment position="end">{t('common.NIS')}</InputAdornment>,
            endAdornment: isRTL ? <InputAdornment position="start" > {t('common.NIS')}</InputAdornment> : <></>
          }
          }
        />
      </Grid>
      <Grid item xs={12} className={clsx(classes.pr25, classes.dFlex, classes.flexEnd, classes.pt25)}>
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
      </Grid>
    </>
  }

  const step2 = () => {
    return manualPaymentUrl ? (<>
      <TranzilaIframe
        data={[{
          ID: 0,
          CampaignType: 4,
          PackageType: 0,
          Price: Number(balance || 0),
          Quantity: '',
        }]}
        classes={classes}
        isRTL={isRTL}
        packageId={0}
        onComplete={onPaymentResult}
        paymentUrl={manualPaymentUrl}
        onStepBack={null}
      />
    </>) : (<></>)
  }

  const step3 = () => {
    return <PaymentResult
      t={t}
      classes={classes}
      paymentObject={paymentResult}
      onStepBack={() => setActiveStep(activeStep - 1)}
    />
  }

  const onPaymentResult = (results?: any) => {
    setPaymentResult(results);
    setActiveStep(activeStep + 1);
  }



  return <>
    <Stepper activeStep={activeStep} alternativeLabel className={clsx(classes.nopadding, classes.w100)}>
      {steps.map((step: any, index: any) => (
        <Step key={step.title} onClick={() => { if (index < activeStep) setActiveStep(index) }} style={{ cursor: index < activeStep ? 'pointer' : 'auto' }}>
          <StepLabel>{t(step?.title)}</StepLabel>
        </Step>
      ))}
    </Stepper>
    <Grid container>
      {activeStep === 0 && step1()}
      {activeStep === 1 && step2()}
      {activeStep === 2 && step3()}
      <Loader isOpen={showLoader} showBackdrop={true} />
    </Grid>
  </>
}
export default BalanceWizard