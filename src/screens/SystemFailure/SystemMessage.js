import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { Divider, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { renderHtml } from "../../helpers/functions";



const SystemMessage = ({ classes }) => {
    const { t } = useTranslation();
    return <DefaultScreen
        currentPage="Campaingn Settings"
        classes={classes}
        containerClass={clsx(classes.management, classes.mb50)}
    >
        <Typography className={classes.managementTitle}>
            {t("common.dearCustomer")}
        </Typography>
        <Divider />
        <Typography>
            {renderHtml(t("common.systemFailureNotice"))}
        </Typography>

    </DefaultScreen>
}

export default SystemMessage;