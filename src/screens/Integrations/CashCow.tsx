import { useTranslation } from "react-i18next";
import Step1 from '../../assets/images/CashCow/CashCow-Step1.png';
import Step2 from '../../assets/images/CashCow/CashCow-Step2.png';
import Step3 from '../../assets/images/CashCow/CashCow-Step3.png';
import Step5 from '../../assets/images/CashCow/CashCow-Step5.png';
import clsx from "clsx";

const CashCow = ({ classes }: any) => {
  
  const { t } = useTranslation();
  return (
    <ol type="1">
      <li className={clsx(classes.pt10)}>{t('integrations.cashCow.step1')}</li>
      <div className={clsx(classes.pt10)}>
        <img src={Step1} alt={t('integrations.cashCow.step1')} className={clsx(classes.pb25)} />
      </div>
      <li className={clsx(classes.pt10)}>{t('integrations.cashCow.step2')}</li>
      <div className={clsx(classes.pt10)}>
        <img src={Step2} alt={t('integrations.cashCow.step2')} className={clsx(classes.pb25)} />
      </div>
      <li className={clsx(classes.pt10)}>{t('integrations.cashCow.step3')}</li>
      <div className={clsx(classes.pt10)}>
        <img src={Step3} alt={t('integrations.cashCow.step3')} className={clsx(classes.pb25)} />
      </div>
      <li className={clsx(classes.pt10)}>{t('integrations.cashCow.step4')}</li>
      <li className={clsx(classes.pt10)}>{t('integrations.cashCow.step5')}</li>
      <div className={clsx(classes.pt10)}>
        <img src={Step5} alt={t('integrations.cashCow.step5')} className={clsx(classes.pb25)} />
      </div>
    </ol>
  );
};

export default CashCow;
