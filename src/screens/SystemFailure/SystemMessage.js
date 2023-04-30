import DefaultScreen from "../DefaultScreen";
import clsx from "clsx";
import { Divider, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";



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
            {RenderHtml(t("common.systemFailureNotice"))}
        </Typography>

    </DefaultScreen>
}

export default SystemMessage;