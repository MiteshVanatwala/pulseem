import { useTranslation } from "react-i18next";
import { Title } from "../../components/managment/Title";
import DefaultScreen from "../DefaultScreen";
import TermsOfUse from "./TermsOfUse";
import clsx from 'clsx'
import { Box } from "@material-ui/core";
import SharedAppBar from "../../components/core/SharedAppBar";

const TermsOfUsePage = ({ classes }: any) => {
  const { t } = useTranslation();

  return <DefaultScreen
    currentPage='termOfUse'
    classes={classes}
    containerClass={clsx(classes.management, classes.mb50, classes.mt50)}
    showAppBar={false}
  >
    <SharedAppBar classes={classes} />
    <Box className={'topSection'} style={{ marginTop: 100 }}>
      <Box style={{ display: 'flex' }}>
        <Title
          classes={classes}
          Text={t('TermsOfUse.title')}
        />
      </Box>
      <Box className={classes.accordion} style={{ padding: 15 }}>
        <TermsOfUse classes={classes} />
      </Box>
    </Box>
  </DefaultScreen>
}

export default TermsOfUsePage;