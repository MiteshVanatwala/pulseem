import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { coreProps } from '../../model/Core/corePros.types';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { getCreditCardIframe } from '../../redux/reducers/BillingSlice';

const AddCardDialog = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
	const { windowSize, isRTL } = useSelector(
		(state: { core: coreProps }) => state.core
	);
  const [paymentIframe, setPaymentIframe] = useState<string>('');
  const dispatch = useDispatch();

	useEffect(() => {
		if (isOpen) {
      fetchCCIFrame();
		}
	}, [isOpen]);

  const fetchCCIFrame = async () => {
    const culture: string = isRTL ? 'he' : 'en';
    const response = await dispatch(getCreditCardIframe(culture)) as any;
    setPaymentIframe(response?.payload?.Data);
  }

	return (
		<BaseDialog
      classes={classes}
      title={t("settings.billingSettings.btnAddCard")}
      open={isOpen}
      contentStyle={classes.maxWidth500}
      onClose={onClose}
      onCancel={onClose}
      showDefaultButtons={false}
    >
      <Grid container className={classes.addCardForm} >
        <Grid item xs={12} className={"textBoxWrapper"}>
          {/* @ts-ignore */}
          <iframe title="Tranzila Url" src={`${paymentIframe}`} width={windowSize !== 'xs' ? 400 : 250} height="420" border="no" frameBorder="0" style={{ border: "none !important" }} />
        </Grid>
      </Grid>
    </BaseDialog>
	);
};

export default AddCardDialog;
