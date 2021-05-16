import React, { useState } from 'react';
import { } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/he'
import { Alert, AlertTitle } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import './Toast.styles.css'
import clsx from 'clsx';



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
        alignContent: 'center'
    }
}));

const Toast = ({ data, onClose }) => {
    const { language } = useSelector(state => state.core)
    const { isRTL } = useSelector(state => state.core);
    const classes = useStyles();

    moment.locale(language);

    // data.severity: error, warning, info, success
    // data.color: 
    const renderHtml = () => {
        function createMarkup() {
            return { __html: data.message };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }
    return (
        <div className={clsx(classes.root, "alert")}>
            <Alert severity={data.severity} color={data.color} className={classes.center}>
                {/* {data.title && <AlertTitle>{data.title}</AlertTitle>} */}
                {data.message}
            </Alert>
            {data.showAnimtionCheck && <div class="notification-pop">
                <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 130.2 130.2"
                >
                    <circle
                        class="path circle"
                        fill="none"
                        stroke="#73AF55"
                        stroke-width="10"
                        stroke-miterlimit="10"
                        cx="65.1"
                        cy="65.1"
                        r="58.1"
                    />
                    <polyline
                        class="path check"
                        fill="none"
                        stroke="#73AF55"
                        stroke-width="10"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                        points="100.2,40.2 51.5,88.8 29.8,67.5 "
                    />
                </svg>
            </div>}
        </div>
    );
}

export default Toast;