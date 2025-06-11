import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import { EmailPricingUnsubscriptionPoland } from '../../redux/reducers/BillingSlice';

const UnsubscribePayPerRecipient = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

  const cancelSubscription = async () => {
    const { payload: { StatusCode } }: any = await dispatch(EmailPricingUnsubscriptionPoland());
    if (StatusCode === 201) {
      onClose(true);
    } else {
      onClose(false);
    }
  }

  return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t(`dashboard.polishUnsubscribe.title`)}
			icon={
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
			}
			showDivider={false}
			onClose={() => onClose()}
			onCancel={() => onClose()}
      onConfirm={() => cancelSubscription()}
			reduceTitle
			style={{ minWidth: 240 }}
      contentStyle={classes.maxWidth500}
		>
			<Box className={clsx(classes.mlr10)}>
        <Typography className={clsx(classes.f18)}>{t('dashboard.polishUnsubscribe.desc1')}</Typography>
        <Typography className={clsx(classes.f18)}>{t('dashboard.polishUnsubscribe.desc2')}</Typography>
        <Typography className={clsx(classes.f18)}>{t('dashboard.polishUnsubscribe.desc3')}</Typography>
        <Typography className={clsx(classes.f18)}>{t('dashboard.polishUnsubscribe.desc4')}</Typography>
      </Box>
		</BaseDialog>
	);
};

export default UnsubscribePayPerRecipient;
