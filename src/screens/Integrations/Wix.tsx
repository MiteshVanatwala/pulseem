
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import clsx from "clsx";
import { URL_HELPER } from "../../helpers/Links/ExternalLink";

const Wix = ({ classes }: any) => {
  const { t } = useTranslation();

  return (
    <>
      <div>{t('integrations.wix.description')}</div>
      <Button
        onClick={() => window.open(URL_HELPER.Integrations.Wix.guide, '_blank')}
        variant='contained'
        size='medium'
        className={clsx(
          classes.btn,
          classes.btnRounded,
          classes.mt20
        )}
        color="primary"
      >
        {t(`integrations.wix.connectStore`)}
      </Button>
    </>
  );
};

export default Wix;
