import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import BillingDetails from '../../screens/Settings/BillingSettings/BillingDetails';

const BillingSettings = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
  
	return (
		<BaseDialog
			classes={classes}
			open={isOpen}
			title={t(`settings.billingSettings.title`)}
			icon={
        <div className={clsx(classes.dialogIconContent, 'unicode')}>
          {'\u0056'}
        </div>
			}
			showDivider={false}
			onClose={() => onClose()}
			onCancel={() => onClose()}
			reduceTitle
      childrenStyle={"payPerRecipientChild"}
      showDefaultButtons={false}
		>
      <BillingDetails classes={classes} />
		</BaseDialog>
	);
};

export default BillingSettings;
