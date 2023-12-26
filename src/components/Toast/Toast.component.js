import { useSelector } from 'react-redux'
import moment from 'moment'
import 'moment/locale/he'
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import './Toast.styles.css'
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';



const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
        position: 'fixed',
        top: 60,
        right: 0,
        left: 0,
        zIndex: 99999999
    },
    center: {
        alignContent: 'center',
        justifyContent: 'center'
    }
}));

const Toast = ({ data, customData = null }) => {
    const { t } = useTranslation();
    const { language } = useSelector(state => state.core)
    const classes = useStyles();

    moment.locale(language);

    return (
        <div className={clsx(classes.root, "alert")}>
            {customData ? (
                <Alert severity={customData.severity} color={customData.color} className={classes.center} style={{ fontWeight: 900, fontSize: 16 }}>
                    {RenderHtml(customData.message)}
                </Alert>
            ) : (<>
                <Alert severity={data.severity} color={data.color} className={classes.center} style={{ fontWeight: 900, fontSize: 16 }}>
                    {RenderHtml(t(data.message))}
                </Alert>
                {
                    data.showAnimtionCheck && <div className={"notification-pop"}>
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 130.2 130.2"
                        >
                            <circle
                                className={"path circle"}
                                fill="none"
                                stroke="#73AF55"
                                strokeWidth="10"
                                strokeMiterlimit="10"
                                cx="65.1"
                                cy="65.1"
                                r="58.1"
                            />
                            <polyline
                                className={"path check"}
                                fill="none"
                                stroke="#73AF55"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                points="100.2,40.2 51.5,88.8 29.8,67.5 "
                            />
                        </svg>
                    </div>
                }
            </>)}
        </div>
    )
}

export default Toast;