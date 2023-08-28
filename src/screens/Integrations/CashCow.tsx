import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import clsx from "clsx";

const CashCow = ({ classes }: any) => {
  
  const { t } = useTranslation();
  return (
    <>
      <div>{t('integrations.wooCommerce.description')}</div>
      <Button
        onClick={() => window.open('https://site.pulseem.co.il/%D7%9E%D7%93%D7%A8%D7%9B%D7%99%D7%9D/%d7%94%d7%aa%d7%a7%d7%a0%d7%aa-%d7%a4%d7%9c%d7%90%d7%92%d7%99%d7%9f-%d7%9c-cashcow/', '_blank')}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.mt20
        )}
        color="primary"
      >
        {t(`integrations.cashCow.connectStore`)}
      </Button>
    </>
  );
};

export default CashCow;
