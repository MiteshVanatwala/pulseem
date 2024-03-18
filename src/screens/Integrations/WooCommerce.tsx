
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import clsx from "clsx";
import { URL_HELPER } from "../../helpers/Links/ExternalLink";

const WooCommerce = ({ classes }: any) => {
  const { t } = useTranslation();

  return (
    <>
      <div>{t('integrations.wooCommerce.description')}</div>
      <Button
        onClick={() => window.open(URL_HELPER.Integrations.WooComerce.guide, '_blank')}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.mt20
        )}
        color="primary"
      >
        {t(`integrations.wooCommerce.connectStore`)}
      </Button>
    </>
  );
};

export default WooCommerce;
