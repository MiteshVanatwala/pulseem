import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import Slider from '@mui/material/Slider';
import { AiOutlineCheck } from 'react-icons/ai';
import { Loader } from '../Loader/Loader';
import { EmailPricingSubscriptionPoland, GetEmailPackagePrices } from '../../redux/reducers/BillingSlice';
import { first, get, last } from 'lodash';
import Toast from '../Toast/Toast.component';
import { formatNumberWithCommas } from '../../helpers/Utils/TextHelper';

const PayPerRecipient = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
  const [ isLoader, setIsLoader ] = useState(false);
  const [ toastMessage, setToastMessage ] = useState(null);
  const [ marks, setMarks ] = useState([]);
  const [ selectedPricing, setSelectedPricing ] = useState(0);
  const dispatch = useDispatch();

	useEffect(() => {
		if (isOpen) {
      setMarks([]);
      setSelectedPricing(0);
			fetchPricing();
		}
	}, [isOpen]);

  const fetchPricing = async () => {
    setIsLoader(true);
    const { payload: { Data, StatusCode } }: any = await dispatch(GetEmailPackagePrices());
    if (StatusCode === 201) {
      const marks = Data.map((item: any) => ({
        id: item.Id,
        value: item.Price,
        label: '',
        displayText: `${formatNumberWithCommas(item.LevelLow)} - ${formatNumberWithCommas(item.LevelHigh)}`,
      }));
      setMarks(marks);
    }
    setIsLoader(false);
  }

  const handleChange = (event: any, newValue: any) => {
    const found: any = marks.find((mark: any) => mark?.value === newValue);
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
			style={{ minWidth: 240 }}
      contentStyle={classes.maxWidth70VW}
      paperStyle={clsx(windowSize !== 'xs' ? classes.w70VW : null)}
      hideHeader={true}
			renderButtons={() => (
				<Grid
          container
          spacing={2}
          className={clsx(classes.dialogButtonsContainer, isRTL ? classes.rowReverse : null)}
      >
        <Grid item>
          <Button
            onClick={async () => {
              const found: any = marks.find((mark: any) => mark?.value === selectedPricing);
              setIsLoader(true);
              const { payload: { StatusCode } }: any = await dispatch(EmailPricingSubscriptionPoland({ PricePackageId:  found?.id }));
              if (StatusCode === 201) {
                onClose(found?.id);
              } else if (StatusCode === 403) {
                // @ts-ignore
                setToastMessage({ severity: 'error', color: 'error', message: t('dashboard.polishSubscribe.featureNotAllowed'), showAnimtionCheck: false });
              }
              setIsLoader(false);
            }}
            className={clsx(
              classes.btn,
              classes.btnRounded
            )}>
            {t('common.SubscribeButton')}
          </Button>
        </Grid>
      </Grid>
			)}
		>
			<Box className={clsx(classes.textCenter, classes.mlr10)}>
        <Typography className={clsx(classes.f18, classes.bold, classes.mb10)}>
          {t('dashboard.polishSubscribe.question')}
        </Typography>

        <Typography className={clsx(classes.f22, classes.bold, classes.mb10, classes.mt15, classes.textRed)}>
          {getSelectedLabel()}
        </Typography>

        <Slider
          aria-label="pricing"
          defaultValue={0}
          step={null}
          valueLabelDisplay="auto"
          marks={marks}
          min={get(first(marks), 'value', 0)}
          max={get(last(marks), 'value', 100)}
          onChange={handleChange}
          color="primary"
          className={clsx(classes.colrPrimary)}
          style={{ color: "#ff3343" }}
        />

        <Grid container className={clsx(classes.mt15)} spacing={2}>
          <Grid item xs={5} className={clsx(classes.textLeft)}>
            <Box className={clsx(classes.polishSubscribeGreyBox, classes.p10, classes.textCenter)}>
              <Typography className={clsx(classes.f16)}>
                {t('dashboard.polishSubscribe.monthlyPayment')}
              </Typography>

              <Typography className={clsx(classes.f20, classes.bold)}>
                {selectedPricing} zł
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={7} className={clsx(classes.textRight)}>
            <Box className={clsx(classes.polishSubscribeGreyBox, classes.p10, classes.textLeft)}>
              <Typography className={clsx(classes.f16, classes.mb5)}>
                <AiOutlineCheck style={{ verticalAlign: 'middle', marginRight: 5 }} /> {t('dashboard.polishSubscribe.recipients')} : {getSelectedLabel()}
              </Typography>

              <Typography className={clsx(classes.f16)}>
                <AiOutlineCheck style={{ verticalAlign: 'middle', marginRight: 5 }} /> {t('dashboard.polishSubscribe.unlimitedEmailSending')}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography className={clsx(classes.f16, classes.mb10, classes.mt25)}>
          {t('dashboard.polishSubscribe.confirmation')}
        </Typography>
        <Loader isOpen={isLoader} showBackdrop={true} />
        {renderToast()}
      </Box>
		</BaseDialog>
	);
};

export default PayPerRecipient;
