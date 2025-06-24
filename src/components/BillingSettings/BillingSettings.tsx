import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseDialog } from '../DialogTemplates/BaseDialog';
import BillingDetails from '../../screens/Settings/BillingSettings/BillingDetails';
import { useEffect, useState } from 'react';

const BillingSettings = ({ classes, isOpen, onClose }: any) => {
	const { t } = useTranslation();
	const [ isSuccess, setIsSuccess ] = useState(false);	

	useEffect(() => {
		if (isOpen) {
			setIsSuccess(false);
		}
	}, [isOpen]);
  
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
			onClose={() => onClose(isSuccess)}
			onCancel={() => onClose(isSuccess)}
			reduceTitle
      childrenStyle={"payPerRecipientChild"}
      showDefaultButtons={false}
		>
      <BillingDetails
				classes={classes} 
				onSuccess={() => {
					setIsSuccess(true)
					onClose(true);
				}} 
			/>
		</BaseDialog>
	);
};

export default BillingSettings;
